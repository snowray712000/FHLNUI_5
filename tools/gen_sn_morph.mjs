// 產生每節動詞的形態：index/sn_morph_nt.json.gz、index/sn_morph_ot.json.gz，給 SN 篩選 (docs/z260928e) 的 L3「逐字形態」用
// 執行：npm run gen:snmorph (需要 tools/.cache/bible_parsing.db，先執行 npm run gen:orig)
//
// 格式：{ ver, src, data: { "43.1.12": "2983:aai 4100:ppp", ... } }，只有動詞，依 wid 順序
// - 新約代碼 = 時態 + 語態 + 語氣 (由 fhlwhparsing.wform 前三碼正規化)
//   時態 p 現在 i 未完成 f 未來 a 簡單過去 x 完成 y 過去完成 (原資料 g→f、b→a、c d→x；e 是亞蘭文等無時態，略過)
//   語態 a 主動 m 中間 p 被動 (原資料 n 中間異態→m、o 被動異態→p)
//   語氣 i 直說 s 假設 o 祈願 d 命令 n 不定詞 p 分詞
// - 舊約代碼 = 詞幹:形式 (由 lparsing.wform 中文描述解析，例「動詞，Qal 敘述式 3 單陽」→ q:wy)
//   詞幹 q Qal、N Nif‘al、p Pi‘el、P Pu‘al、h Hif‘il、H Hof‘al、t Hitpa‘el、o 其它 (含亞蘭文 Peal 等)
//   形式 wy 敘述式 wq 連續式 pf 完成式 impf 未完成式 imv 祈使式 jus 祈願式 coh 鼓勵式 infa 不定詞獨立形 infc 不定詞附屬形 ptc 分詞 ptcp 被動分詞
// 和合本與原文都用「同一節、同一個 SN」對應 (見 SnFilter)。報告 tools/.cache/gen_sn_morph_report.txt
import fs from 'node:fs'
import zlib from 'node:zlib'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const DIR_CACHE = new URL('./.cache/', import.meta.url)
const PATH_DB = new URL('bible_parsing.db', DIR_CACHE)
const PATH_ZIP_META = new URL('bible_parsing.zip.json', DIR_CACHE)
const PATH_REPORT = new URL('gen_sn_morph_report.txt', DIR_CACHE)
const PATH_OUT = { G: new URL('../index/sn_morph_nt.json.gz', import.meta.url), H: new URL('../index/sn_morph_ot.json.gz', import.meta.url) }

const OT_ENGS = ['Gen', 'Ex', 'Lev', 'Num', 'Deut', 'Josh', 'Judg', 'Ruth', '1 Sam', '2 Sam', '1 Kin', '2 Kin',
    '1 Chr', '2 Chr', 'Ezra', 'Neh', 'Esth', 'Job', 'Ps', 'Prov', 'Eccl', 'Song', 'Is', 'Jer', 'Lam', 'Ezek',
    'Dan', 'Hos', 'Joel', 'Amos', 'Obad', 'Jon', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal']
const NT_ENGS = ['Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom', '1 Cor', '2 Cor', 'Gal', 'Eph', 'Phil', 'Col',
    '1 Thess', '2 Thess', '1 Tim', '2 Tim', 'Titus', 'Philem', 'Heb', 'James', '1 Pet', '2 Pet', '1 John',
    '2 John', '3 John', 'Jude', 'Rev']

const NT_TENSE = { p: 'p', i: 'i', f: 'f', g: 'f', a: 'a', b: 'a', x: 'x', c: 'x', d: 'x', y: 'y' }
const NT_VOICE = { a: 'a', m: 'm', n: 'm', p: 'p', o: 'p' }
const NT_MOOD = { i: 'i', s: 's', o: 'o', d: 'd', n: 'n', p: 'p' }
/** 詞幹：去掉 ‘ ' 後小寫，比字首 (資料有 Qall、Hif'l、Hophal、「Hif‘il敘述式」沒空白等寫法) */
const OT_STEM = [[/^qa/, 'q'], [/^nif/, 'N'], [/^piel/, 'p'], [/^pual/, 'P'], [/^hitp?h?ael/, 't'], [/^hif|^hiph/, 'h'], [/^hof|^hoph/, 'H']]
/** 形式：依序比對 (「未完成式」含「完成式」、「被動分詞」含「分詞」，要先比) */
const OT_FORM = [
    [/敘述式/, 'wy'], [/連續式/, 'wq'], [/未完成/, 'impf'], [/完成/, 'pf'],
    [/祈使式/, 'imv'], [/祈願式/, 'jus'], [/鼓勵式/, 'coh'],
    [/不定詞獨立形/, 'infa'], [/不定詞/, 'infc'], [/被動分詞/, 'ptcp'], [/分詞/, 'ptc'],
]

if (!fs.existsSync(PATH_DB)) throw new Error('沒有 tools/.cache/bible_parsing.db，先執行 npm run gen:orig')
const db = new DatabaseSync(fileURLToPath(PATH_DB), { readOnly: true })
const ver = db.prepare('SELECT dt FROM version').get()?.dt ?? ''

const stat = { G: { verb: 0, skip: new Map() }, H: { verb: 0, skip: new Map(), otherStem: new Map() } }
const inc = (m, k) => m.set(k, (m.get(k) ?? 0) + 1)

/** @type {Record<'G'|'H', Map<string, string[]>>} "book.chap.sec" → ["sn:code"] */
const data = { G: new Map(), H: new Map() }
const push = (tp, book, chap, sec, sn, code) => {
    const k = `${book}.${chap}.${sec}`
    if (!data[tp].has(k)) data[tp].set(k, [])
    data[tp].get(k).push(`${sn}:${code}`)
}

for (const r of db.prepare(`SELECT engs, chap, sec, sn, wform FROM fhlwhparsing WHERE wid > 0 AND pro = 'v' ORDER BY engs, chap, sec, wid`).all()) {
    const book = NT_ENGS.indexOf(r.engs.trim()) + 40
    const sn = normalizeSn(r.sn)
    if (book < 40 || sn == null) continue
    const w = (r.wform ?? '').trim()
    const code = (NT_TENSE[w[0]] ?? '') + (NT_VOICE[w[1]] ?? '') + (NT_MOOD[w[2]] ?? '')
    if (code.length != 3) { inc(stat.G.skip, w); continue }
    stat.G.verb++
    push('G', book, r.chap, r.sec, sn, code)
}
for (const r of db.prepare(`SELECT engs, chap, sec, sn, wform FROM lparsing WHERE wid > 0 AND wform LIKE '%動詞%' ORDER BY engs, chap, sec, wid`).all()) {
    const book = OT_ENGS.indexOf(r.engs.trim()) + 1
    const sn = normalizeSn(r.sn)
    if (book < 1 || sn == null) continue
    const seg = mainSegment(r.wform ?? '')
    const m = /動詞\s*，\s*(.*)$/.exec(seg)
    if (m == null) { inc(stat.H.skip, seg); continue }
    const rest = m[1].replace(/[‘'’`]/g, '').toLowerCase()
    const stem = OT_STEM.find(([re]) => re.test(rest))?.[1] ?? 'o'
    if (stem == 'o') inc(stat.H.otherStem, m[1].split(/[\s，]/)[0])
    const form = OT_FORM.find(([re]) => re.test(m[1]))?.[1]
    if (form == null) { inc(stat.H.skip, seg); continue }
    stat.H.verb++
    push('H', book, r.chap, r.sec, sn, `${stem}:${form}`)
}
db.close()

const srcParsing = fs.existsSync(PATH_ZIP_META) ? JSON.parse(fs.readFileSync(PATH_ZIP_META, 'utf8')).lastModified : ''
const src = { url: 'https://ftp.fhl.net/FHL/COBS/data/bible_parsing.zip', lastModified: srcParsing }
for (const tp of /** @type {const} */ (['G', 'H'])) {
    const obj = Object.fromEntries([...data[tp]].map(([k, v]) => [k, v.join(' ')]))
    fs.writeFileSync(PATH_OUT[tp], zlib.gzipSync(JSON.stringify({ ver, src, data: obj }), { level: 9 }))
    console.log(`${tp == 'G' ? '新約' : '舊約'} 動詞形態 → ${fileURLToPath(PATH_OUT[tp])} (${fs.statSync(PATH_OUT[tp]).size} bytes)，${stat[tp].verb} 字，略過 ${sum(stat[tp].skip)}`)
}

const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n)
fs.writeFileSync(PATH_REPORT, [
    `bible_parsing.db version: ${ver}`,
    `新約動詞 ${stat.G.verb}，略過 ${sum(stat.G.skip)}；舊約動詞 ${stat.H.verb}，略過 ${sum(stat.H.skip)}`,
    '', '## 新約略過的 wform', ...top(stat.G.skip, 50).map(([k, n]) => `${k}\t${n}`),
    '', '## 舊約「其它」詞幹', ...top(stat.H.otherStem, 80).map(([k, n]) => `${k}\t${n}`),
    '', '## 舊約略過的描述，前 100', ...top(stat.H.skip, 100).map(([k, n]) => `${k}\t${n}`),
].join('\n') + '\n')
console.log(`  報告 ${fileURLToPath(PATH_REPORT)}`)

/** `07225` → `7225`、`08521a` → `8521a`；`00000` 與空的 → null */
function normalizeSn(s) {
    return (s ?? '').trim().match(/^0*([1-9]\d*[a-z]?)$/i)?.[1]?.toLowerCase() ?? null
}
/** 同 gen_sn_pos：去掉詞尾與冠詞，取最後一段，再去掉「…的停頓型，」「按讀型，它是」 */
function mainSegment(wform) {
    const segs = wform.split('+').map(s => s.replace(/12\S*?21/g, '').trim()).filter(s => s != '' && !s.includes('詞尾'))
    const main = segs.filter(s => !/^定?冠詞/.test(s))
    return ((main.length > 0 ? main : segs).at(-1) ?? '')
        .replace(/^.*停頓型，\s*/, '')
        .replace(/^.*它是\s*/, '')
}
function sum(m) { return [...m.values()].reduce((a, b) => a + b, 0) }
