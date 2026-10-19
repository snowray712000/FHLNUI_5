// 產生 index/s2t.json：簡體 → 繁體的單字對照表 (給使徒教父搜尋用：seaf.php 不處理簡體，gb=1 也無效)
// 執行：npm run gen:s2t (需要網路，約 4800 個請求，4~6 分鐘；下載的經文快取在 tools/.cache/s2t_chapters.json，可中斷續跑)
//
// 做法：信望愛的和合本 (unv)、新譯本 (ncv) 都有繁體 (gb=0) 與簡體 (gb=1) 兩份，簡繁轉換是逐字的，
// 所以同一節兩份拿掉 HTML 標記後長度相同的，就逐字對齊，統計「簡體字 → 繁體字」的票數，取最多票的。
// - 一個簡體字對到多個繁體字 (发 → 發 / 髮、后 → 後 / 后…)：取最多票的
// - 簡體字本身也是常用的繁體字 (后、里、干、面…)：不收，否則使用者打繁體的「皇后」會被轉成「皇後」
//   判斷：這個字在繁體經文中出現 >= MIN_TRAD_USE 次就不收 (所以打簡體的「后」不會轉，這是取捨)
// - 只收簡體 != 繁體 的字
import fs from 'node:fs'
import { BibleConstant } from '../index/BibleConstant.es2023.js'

const URL_QSB = 'https://bible.fhl.net/json/qsb.php'
const VERSIONS = ['unv', 'ncv']
const MIN_TRAD_USE = 3
const DIR_CACHE = new URL('./.cache/', import.meta.url)
const PATH_CACHE = new URL('s2t_chapters.json', DIR_CACHE)
const PATH_OUT = new URL('../index/s2t.json', import.meta.url)

/** @type {Record<string, string[]>} "ver|gb|book|chap" → 該章每節的文字 (依節序) */
const cache = fs.existsSync(PATH_CACHE) ? JSON.parse(fs.readFileSync(PATH_CACHE, 'utf8')) : {}

const jobs = []
for (const ver of VERSIONS) {
    for (let book = 1; book <= 66; book++) {
        for (let chap = 1; chap <= BibleConstant.COUNT_OF_CHAP[book - 1]; chap++) {
            for (const gb of [0, 1]) {
                const key = `${ver}|${gb}|${book}|${chap}`
                if (cache[key] == null) jobs.push({ key, ver, gb, book, chap })
            }
        }
    }
}
console.log(`需要下載 ${jobs.length} 章 (已快取 ${Object.keys(cache).length})`)

let done = 0
await Promise.all(Array.from({ length: 6 }, async () => {
    for (let job; (job = jobs.shift()) != null;) {
        // gb=1 時書名要用簡體 (林后2)，用繁體 (林後2) 會查不到
        const abbr = (job.gb == 1 ? BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB : BibleConstant.CHINESE_BOOK_ABBREVIATIONS)[job.book - 1]
        const qstr = `${abbr}${job.chap}`
        const jo = await fetchJsonRetryAsync(`${URL_QSB}?gb=${job.gb}&strong=0&version=${job.ver}&qstr=${encodeURIComponent(qstr)}`)
        cache[job.key] = (jo.record ?? []).map(r => `${r.sec}\t${r.bible_text ?? ''}`)
        if (++done % 200 == 0) {
            console.log(`  ${done}`)
            fs.mkdirSync(DIR_CACHE, { recursive: true })
            fs.writeFileSync(PATH_CACHE, JSON.stringify(cache)) // 隨時存，中斷可續
        }
    }
}))
fs.mkdirSync(DIR_CACHE, { recursive: true })
fs.writeFileSync(PATH_CACHE, JSON.stringify(cache))

const strip = s => s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, '')

/** @type {Map<string, Map<string, number>>} 簡 → 繁 → 票數 */
const votes = new Map()
/** @type {Map<string, number>} 繁體經文中每個字出現幾次 */
const tradUse = new Map()
let pairedVerses = 0, skippedVerses = 0
for (const ver of VERSIONS) {
    for (let book = 1; book <= 66; book++) {
        for (let chap = 1; chap <= BibleConstant.COUNT_OF_CHAP[book - 1]; chap++) {
            const trad = new Map(cache[`${ver}|0|${book}|${chap}`].map(s => s.split('\t')).map(([sec, t]) => [sec, strip(t)]))
            const simp = new Map(cache[`${ver}|1|${book}|${chap}`].map(s => s.split('\t')).map(([sec, t]) => [sec, strip(t)]))
            for (const [sec, t] of trad) {
                for (const c of t) tradUse.set(c, (tradUse.get(c) ?? 0) + 1)
                const s = simp.get(sec)
                const ta = Array.from(t), sa = Array.from(s ?? '')
                if (s == null || ta.length != sa.length) { skippedVerses++; continue }
                pairedVerses++
                for (let i = 0; i < ta.length; i++) {
                    if (ta[i] == sa[i]) continue
                    if (!votes.has(sa[i])) votes.set(sa[i], new Map())
                    const m = votes.get(sa[i])
                    m.set(ta[i], (m.get(ta[i]) ?? 0) + 1)
                }
            }
        }
    }
}

/** @type {[string, string][]} */
const pairs = []
const dropped = []
for (const [s, m] of [...votes].sort((a, b) => a[0].codePointAt(0) - b[0].codePointAt(0))) {
    const best = [...m].sort((a, b) => b[1] - a[1])[0][0]
    if ((tradUse.get(s) ?? 0) >= MIN_TRAD_USE) { dropped.push(`${s}→${best}`); continue }
    pairs.push([s, best])
}
const out = {
    note: '由 tools/gen_s2t.mjs 產生 (npm run gen:s2t)，不要手改。simp[i] → trad[i]，簡體字轉繁體字 (逐字，不處理詞彙)；簡體字本身也是常用繁體字的 (后、里、干…) 不收',
    generated: new Date().toISOString().slice(0, 10),
    source: `信望愛 qsb.php ${VERSIONS.join('、')} 繁簡逐字對齊 (${pairedVerses} 節，略過長度不同的 ${skippedVerses} 節)`,
    simp: pairs.map(p => p[0]).join(''),
    trad: pairs.map(p => p[1]).join(''),
}
fs.writeFileSync(PATH_OUT, JSON.stringify(out, null, 1).replace(/\n\s+/g, '\n') + '\n')
console.log(`${pairs.length} 個字 → ${PATH_OUT.pathname} (${fs.statSync(PATH_OUT).size} bytes)；對齊 ${pairedVerses} 節，略過 ${skippedVerses} 節`)
console.log(`因繁體也常用而不收的 (${dropped.length})：${dropped.join(' ')}`)

async function fetchJsonRetryAsync(url) {
    for (let i = 0; ; i++) {
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
            if (!res.ok) throw new Error(`${res.status}`)
            const jo = await res.json()
            if (jo.status != 'success') throw new Error(jo.status)
            return jo
        } catch (e) {
            if (i >= 4) throw new Error(`${url}: ${e.message}`)
            await new Promise(r => setTimeout(r, 800 * (i + 1)))
        }
    }
}
