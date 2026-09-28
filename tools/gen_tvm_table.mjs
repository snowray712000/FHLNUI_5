// 產生和合本時態碼 (<WTG5656> <WTH8804>) → 動詞形態代碼 的對照表：index/tvm_table.json
// 執行：npm run gen:tvm (需要網路；和合本快取在 tools/.cache/unv_qsb.json；需要先 npm run gen:snmorph)
//
// 和合本每個動詞後面有 Strong's 的時態碼 (5656 簡單過去主動直說、8804 Qal 完成式…)，是逐字的，
// 不必像「同節同 SN」那樣猜是哪一個。這裡不用外部的時態碼表，而是由資料自己推：
// 同一節中，某 SN 在和合本 (帶時態碼) 與 parsing (sn_morph) 都只出現一次，就把「時態碼 → 形態代碼」記一票，最後取佔 ≥ 1% 的 (舊約的祈願式、鼓勵式也用未完成式的碼，要留著)
// - 新約：幾乎每個時態碼只對到一個代碼
// - 舊約：Strong's 時態碼不分敘述式 / 未完成式、連續式 / 完成式，所以一個碼會對到幾個代碼，執行時再與同節對應的交集 (見 SnFilter)
// KJV 的時態碼有時與和合本不同 (例 5627 與 5656)，表中沒有的碼就退回同節對應。報告 tools/.cache/gen_tvm_table_report.txt
import fs from 'node:fs'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { BibleConstant } from '../index/BibleConstant.es2023.js'

const DIR_CACHE = new URL('./.cache/', import.meta.url)
const PATH_UNV = new URL('unv_qsb.json', DIR_CACHE)
const PATH_REPORT = new URL('gen_tvm_table_report.txt', DIR_CACHE)
const PATH_MORPH = { G: new URL('../index/sn_morph_nt.json.gz', import.meta.url), H: new URL('../index/sn_morph_ot.json.gz', import.meta.url) }
const PATH_OUT = new URL('../index/tvm_table.json', import.meta.url)
const URL_QSB = 'https://bible.fhl.net/json/qsb.php'
const RATIO_MINOR = 0.01

for (const p of Object.values(PATH_MORPH)) if (!fs.existsSync(p)) throw new Error(`沒有 ${fileURLToPath(p)}，先執行 npm run gen:snmorph`)
const morph = {
    G: JSON.parse(zlib.gunzipSync(fs.readFileSync(PATH_MORPH.G))).data,
    H: JSON.parse(zlib.gunzipSync(fs.readFileSync(PATH_MORPH.H))).data,
}
const unv = await ensureUnvAsync()

/** @type {Record<'G'|'H', Map<string, Map<string, number>>>} 時態碼 → 形態代碼 → 票數 */
const votes = { G: new Map(), H: new Map() }
const cnt = { pair: 0, vote: 0 }
for (const [book, chap, sec, text] of unv.data) {
    const tp = book >= 40 ? 'G' : 'H'
    /** @type {Map<string, string[]>} sn → 此節中每次出現的時態碼 (沒有時態碼為 '') */
    const unvSn = new Map()
    let last = null
    for (const m of text.matchAll(/<W(T?)([HG])(\d+)(a?)>/gi)) {
        if (m[2].toUpperCase() != tp) continue
        const num = `${parseInt(m[3])}${m[4].toLowerCase()}`
        if (m[1] != '') {
            if (last != null) { last.arr[last.arr.length - 1] = num; cnt.pair++ }
            last = null
            continue
        }
        if (parseInt(num) >= 9000) continue
        if (!unvSn.has(num)) unvSn.set(num, [])
        unvSn.get(num).push('')
        last = { arr: unvSn.get(num) }
    }
    const codes = new Map()
    for (const a of (morph[tp][`${book}.${chap}.${sec}`] ?? '').split(' ').filter(a => a != '')) {
        const i = a.indexOf(':')
        const sn = a.slice(0, i)
        if (!codes.has(sn)) codes.set(sn, [])
        codes.get(sn).push(a.slice(i + 1))
    }
    for (const [sn, tvms] of unvSn) {
        const cs = codes.get(sn)
        if (tvms.length != 1 || tvms[0] == '' || cs?.length != 1) continue
        const m = votes[tp]
        if (!m.has(tvms[0])) m.set(tvms[0], new Map())
        m.get(tvms[0]).set(cs[0], (m.get(tvms[0]).get(cs[0]) ?? 0) + 1)
        cnt.vote++
    }
}

const table = { G: {}, H: {} }
const lines = []
for (const tp of /** @type {const} */ (['G', 'H'])) {
    for (const [tvm, m] of [...votes[tp]].sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
        const total = [...m.values()].reduce((a, b) => a + b, 0)
        const list = [...m].sort((a, b) => b[1] - a[1]).filter(([, n]) => n / total >= RATIO_MINOR).map(([c]) => c)
        table[tp][tvm] = list.join(' ')
        lines.push(`${tp}${tvm}\t${total}\t${list.join(' ')}\t${JSON.stringify(Object.fromEntries([...m].sort((a, b) => b[1] - a[1])))}`)
    }
}
fs.writeFileSync(PATH_OUT, JSON.stringify({ src: { url: `${URL_QSB}?version=unv&strong=1`, fetched: unv.fetched }, table }))
fs.writeFileSync(PATH_REPORT, [
    `和合本取得於 ${unv.fetched}，字與時態碼 ${cnt.pair} 對，唯一對應的票 ${cnt.vote}`,
    `新約 ${Object.keys(table.G).length} 個碼，舊約 ${Object.keys(table.H).length} 個碼`,
    '', '## 時態碼 票數 採用 各代碼票數', ...lines,
].join('\n') + '\n')
console.log(`時態碼對照表 → ${fileURLToPath(PATH_OUT)} (${fs.statSync(PATH_OUT).size} bytes)`)
console.log(`  新約 ${Object.keys(table.G).length}、舊約 ${Object.keys(table.H).length} 個碼，票 ${cnt.vote}；報告 ${fileURLToPath(PATH_REPORT)}`)

async function ensureUnvAsync() {
    if (fs.existsSync(PATH_UNV)) {
        const re = JSON.parse(fs.readFileSync(PATH_UNV, 'utf8'))
        console.log(`用快取 ${fileURLToPath(PATH_UNV)} (${re.fetched})`)
        return re
    }
    const jobs = []
    for (let ib = 0; ib < 66; ib++)
        for (let chap = 1; chap <= BibleConstant.COUNT_OF_CHAP[ib]; chap++) jobs.push([ib + 1, chap])
    const rows = []
    let done = 0
    const worker = async () => {
        while (jobs.length) {
            const [book, chap] = jobs.shift()
            const qstr = `${BibleConstant.CHINESE_BOOK_ABBREVIATIONS[book - 1]}${chap}`
            const jo = await fetchJsonRetryAsync(`${URL_QSB}?gb=0&strong=1&version=unv&qstr=${encodeURIComponent(qstr)}`)
            for (const r of jo.record ?? []) rows.push([book, +r.chap, +r.sec, (r.bible_text ?? '').trim()])
            if (++done % 100 == 0) console.log(`  和合本 ${done} 章`)
        }
    }
    console.log(`下載和合本 (含 SN) ${jobs.length} 章`)
    await Promise.all(Array.from({ length: 4 }, worker))
    rows.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
    const re = { fetched: new Date().toISOString().slice(0, 10), data: rows.filter(a1 => a1[3] != '') }
    fs.writeFileSync(PATH_UNV, JSON.stringify(re))
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
