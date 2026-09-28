// 產生七十士譯本 (lxx)、每個字後面嵌入 SN 的資料：index/bible_lxx.json.gz，格式同 bible_fhlwh.json.gz
// 執行：npm run gen:lxx (需要網路；經文與 parsing zip 都會快取在 tools/.cache/)
//
// - 經文：qsb.php version=lxx 逐章取 (信望愛的 lxx 已對應和合本章節，例 詩9 有 20 節)，快取 tools/.cache/lxx_qsb.json
// - SN：七十士譯本沒有逐字資料，用新約 parsing (bible_parsing.db 的 fhlwhparsing) 建「字形 → SN」表，同字形就給同 SN
//   - 表存在 tools/.cache/nt_greek_sn_table.json (字形、各 SN 出現次數、原型)
//   - 先比「精確字形」(忽略大小寫、重音的 grave/acute、省略號)，再比「去掉所有重音氣號」，再試補上可移動的 ν (ἐποίησε → ἐποίησεν)
//   - 某字形在新約只有一個 SN，或最多的 SN 佔 90% 以上，才標；其餘不標
// - 限制：Strong's 希臘文 SN 只收新約的字，新約沒有的字 (動物名、許多人名地名) 不會有 SN；
//   新約沒出現過的變化形也對不到。統計與對不到的字見 tools/.cache/gen_bible_lxx_report.txt
import fs from 'node:fs'
import zlib from 'node:zlib'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { BibleConstant } from '../index/BibleConstant.es2023.js'

const DIR_CACHE = new URL('./.cache/', import.meta.url)
const PATH_DB = new URL('bible_parsing.db', DIR_CACHE)
const PATH_ZIP_META = new URL('bible_parsing.zip.json', DIR_CACHE)
const PATH_LXX = new URL('lxx_qsb.json', DIR_CACHE)
const PATH_TABLE = new URL('nt_greek_sn_table.json', DIR_CACHE)
const PATH_REPORT = new URL('gen_bible_lxx_report.txt', DIR_CACHE)
const PATH_OUT = new URL('../index/bible_lxx.json.gz', import.meta.url)
const URL_QSB = 'https://bible.fhl.net/json/qsb.php'
const RATIO_MAJOR = 0.9
/** lxx 大寫字母的氣號重音寫在字母前面 (spacing 字元，例 ᾿Εμμανουήλ)，換成字母後面的 combining */
const SPACING = { '\u1FBF': '\u0313', '\u1FFE': '\u0314', '\u1FCD': '\u0313\u0300', '\u1FCE': '\u0313\u0301', '\u1FCF': '\u0313\u0342',
    '\u1FDD': '\u0314\u0300', '\u1FDE': '\u0314\u0301', '\u1FDF': '\u0314\u0342', '\u1FFD': '\u0301', '\u1FEF': '\u0300', '\u0384': '\u0301' }

if (!fs.existsSync(PATH_DB)) throw new Error('沒有 tools/.cache/bible_parsing.db，先執行 npm run gen:orig')

const lxx = await ensureLxxAsync()
const db = new DatabaseSync(fileURLToPath(PATH_DB), { readOnly: true })
const ver = db.prepare('SELECT dt FROM version').get()?.dt ?? ''
const table = build_table()
db.close()

const cnt = { verse: 0, word: 0, exact: 0, exactMajor: 0, loose: 0, looseMajor: 0, nu: 0, nuMajor: 0, ambiguous: 0, unknown: 0 }
/** 對不到的字形 → 次數 */
const unknowns = new Map(), ambiguous = new Map()
const data = lxx.data.map(([book, chap, sec, text]) => {
    cnt.verse++
    return [book, chap, sec, text.split(/(\s+)/).map(tag_chunk).join('')]
})

const srcParsing = fs.existsSync(PATH_ZIP_META) ? JSON.parse(fs.readFileSync(PATH_ZIP_META, 'utf8')).lastModified : ''
const src = { url: `${URL_QSB}?version=lxx`, fetched: lxx.fetched, sn: { url: 'https://ftp.fhl.net/FHL/COBS/data/bible_parsing.zip', lastModified: srcParsing } }
fs.writeFileSync(PATH_OUT, zlib.gzipSync(JSON.stringify({ col: ['book', 'chap', 'sec', 'text'], ver, src, data }), { level: 9 }))

const pct = n => `${(n / cnt.word * 100).toFixed(1)}%`
const tagged = cnt.exact + cnt.exactMajor + cnt.loose + cnt.looseMajor + cnt.nu + cnt.nuMajor
const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n)
fs.writeFileSync(PATH_REPORT, [
    `bible_parsing.db version: ${ver}，lxx 取得於 ${lxx.fetched}`,
    `${JSON.stringify(cnt)}`,
    `有 SN ${tagged} (${pct(tagged)})：精確唯一 ${pct(cnt.exact)}、精確多數 ${pct(cnt.exactMajor)}、去重音唯一 ${pct(cnt.loose)}、去重音多數 ${pct(cnt.looseMajor)}、補 ν ${pct(cnt.nu + cnt.nuMajor)}`,
    `沒 SN：新約有此字形但 SN 不一 ${pct(cnt.ambiguous)}、新約沒此字形 ${pct(cnt.unknown)}`,
    '', `## 新約有此字形但 SN 不一 (字形 次數 新約各SN次數)，前 200`,
    ...top(ambiguous, 200).map(([k, n]) => `${k}\t${n}\t${JSON.stringify(Object.fromEntries(table.loose.get(k)))}`),
    '', `## 新約沒此字形 (去重音字形 次數)，前 1000`,
    ...top(unknowns, 1000).map(([k, n]) => `${k}\t${n}`),
].join('\n') + '\n')

console.log(`七十士譯本 ${data.length} 節 → ${fileURLToPath(PATH_OUT)} (${fs.statSync(PATH_OUT).size} bytes)`)
console.log(`  ${cnt.word} 字，有 SN ${pct(tagged)}，SN 不一 ${pct(cnt.ambiguous)}，新約沒此字形 ${pct(cnt.unknown)}`)
console.log(`  報告 ${fileURLToPath(PATH_REPORT)}，字形表 ${fileURLToPath(PATH_TABLE)}`)

/** 新約逐字：字形 → Map(sn → 次數)，精確與去重音各一份；也存成 json 方便查 */
function build_table() {
    const exact = new Map(), loose = new Map(), lemma = new Map()
    const add = (m, k, sn) => {
        if (!m.has(k)) m.set(k, new Map())
        m.get(k).set(sn, (m.get(k).get(sn) ?? 0) + 1)
    }
    for (const r of db.prepare('SELECT uword, uorig, sn FROM fhlwhparsing WHERE wid > 0').all()) {
        const sn = (r.sn ?? '').trim().match(/^0*([1-9]\d*[a-z]?)$/)?.[1]
        const k = keyExact(r.uword ?? '')
        if (sn == null || k == '') continue
        add(exact, k, sn)
        add(loose, keyLoose(k), sn)
        if (!lemma.has(sn) && r.uorig) lemma.set(sn, r.uorig.trim())
    }
    const toJson = m => Object.fromEntries([...m].map(([k, v]) => [k, Object.fromEntries(v)]))
    fs.writeFileSync(PATH_TABLE, JSON.stringify({ ver, exact: toJson(exact), loose: toJson(loose), lemma: Object.fromEntries(lemma) }))
    console.log(`新約字形表：精確 ${exact.size} 個字形、去重音 ${loose.size} 個、SN ${lemma.size} 個`)
    return { exact, loose }
}

/** 片段 (空白分開) 若是希臘字，在最後一個字母 (含其重音、省略號) 之後插 <WGsn> */
function tag_chunk(chunk) {
    const ke = keyExact(chunk)
    if (ke == '') return chunk
    cnt.word++
    const kl = keyLoose(ke)
    let sn = pick(table.exact.get(ke), 'exact') ?? pick(table.loose.get(kl), 'loose')
    // 可移動的 ν：lxx 常寫 ἐποίησε、εἰσί，新約多是 ἐποίησεν、εἰσίν
    if (sn == null && !table.exact.has(ke) && !table.loose.has(kl) && /[ει]$/.test(kl))
        sn = pick(table.exact.get(ke + 'ν'), 'nu') ?? pick(table.loose.get(kl + 'ν'), 'nu')
    if (sn == null) {
        const m = table.exact.get(ke) ?? table.loose.get(kl)
        if (m == null && /[ει]$/.test(kl) && table.loose.has(kl + 'ν')) { cnt.ambiguous++; ambiguous.set(kl + 'ν', (ambiguous.get(kl + 'ν') ?? 0) + 1) }
        else if (m == null) { cnt.unknown++; unknowns.set(kl, (unknowns.get(kl) ?? 0) + 1) }
        else { cnt.ambiguous++; ambiguous.set(kl, (ambiguous.get(kl) ?? 0) + 1) }
        return chunk
    }
    const chars = [...chunk]
    let last = -1
    chars.forEach((c, i) => { if (/[\p{L}\p{M}᾽᾿’ʼ]/u.test(c)) last = i })
    return chars.slice(0, last + 1).join('') + `<WG${sn}>` + chars.slice(last + 1).join('')
}

/** @param {Map<string, number>} m @param {'exact'|'loose'} tp */
function pick(m, tp) {
    if (m == null) return null
    const all = [...m].sort((a, b) => b[1] - a[1])
    if (all.length == 1) { cnt[tp]++; return all[0][0] }
    const total = all.reduce((s, a) => s + a[1], 0)
    if (all[0][1] / total >= RATIO_MAJOR) { cnt[tp + 'Major']++; return all[0][0] }
    return null
}

/** 精確字形：小寫、grave 當 acute、ς→σ，去掉省略號與標點 (保留重音氣號) */
function keyExact(s) {
    s = s.replace(/^([^\p{L}]*?)([\u1FBF\u1FFE\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FFD\u1FEF\u0384]+)(\p{L})/u,
        (m, pre, sp, c) => pre + c + [...sp].map(a1 => SPACING[a1]).join(''))
    return s.normalize('NFD').toLowerCase().replace(/̀/g, '́').replace(/ς/g, 'σ')
        .replace(/[^\p{L}\p{M}]/gu, '').replace(/^\p{M}+/u, '').normalize('NFC')
}

/** 去掉所有重音、氣號、分音 */
function keyLoose(s) {
    return s.normalize('NFD').replace(/\p{M}/gu, '')
}

/** 逐章打 qsb.php 取七十士譯本 (有快取就用快取，要重新取就刪 tools/.cache/lxx_qsb.json) */
async function ensureLxxAsync() {
    if (fs.existsSync(PATH_LXX)) {
        const re = JSON.parse(fs.readFileSync(PATH_LXX, 'utf8'))
        console.log(`用快取 ${fileURLToPath(PATH_LXX)} (${re.fetched})`)
        return re
    }
    const jobs = []
    for (let ib = 0; ib < 39; ib++)
        for (let chap = 1; chap <= BibleConstant.COUNT_OF_CHAP[ib]; chap++) jobs.push([ib + 1, chap])
    const rows = []
    let done = 0
    const worker = async () => {
        while (jobs.length) {
            const [book, chap] = jobs.shift()
            const qstr = `${BibleConstant.CHINESE_BOOK_ABBREVIATIONS[book - 1]}${chap}`
            const jo = await fetchJsonRetryAsync(`${URL_QSB}?gb=0&version=lxx&qstr=${encodeURIComponent(qstr)}`)
            for (const r of jo.record ?? []) rows.push([book, +r.chap, +r.sec, (r.bible_text ?? '').replace(/\r\n?/g, '\n').trim()])
            if (++done % 100 == 0) console.log(`  lxx ${done} 章`)
        }
    }
    console.log(`下載七十士譯本 ${jobs.length} 章`)
    await Promise.all(Array.from({ length: 4 }, worker))
    rows.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
    const re = { fetched: new Date().toISOString().slice(0, 10), data: rows.filter(a1 => a1[3] != '') }
    fs.writeFileSync(PATH_LXX, JSON.stringify(re))
    return re
}

async function fetchJsonRetryAsync(url) {
    for (let i = 0; ; i++) {
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
            if (!res.ok) throw new Error(`${res.status}`)
            return await res.json()
        } catch (e) {
            if (i >= 3) throw new Error(`GET ${url} ${e.message}`)
            await new Promise(r => setTimeout(r, 2000 * (i + 1)))
        }
    }
}
