// 產生 SN → 詞性表：index/sn_pos.json.gz，給 SN 篩選 (docs/z260928e) 的 L2「字典詞性」用
// 執行：npm run gen:snpos (需要 tools/.cache/bible_parsing.db，先執行 npm run gen:orig)
//
// - 新約：fhlwhparsing.pro (n v a d c p ra rp rr t …)；n 且原型大寫開頭 → 專有名詞
// - 舊約：lparsing.wform 是中文描述「冠詞 12;h21 + 名詞，陽性單數」；去掉詞尾，取最後一段 (SN 標的是主要的字)，再看開頭的詞類
// - 一個 SN 可能有多個詞性 (3588 冠詞兼代名詞)：佔 ≥ 10% 的都列，依次數排序，以 | 分隔
// - 否定詞另外標 neg (新約 οὐ μή 在 parsing 中是副詞或連接詞)
// 統計與對不到的描述見 tools/.cache/gen_sn_pos_report.txt
import fs from 'node:fs'
import zlib from 'node:zlib'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const DIR_CACHE = new URL('./.cache/', import.meta.url)
const PATH_DB = new URL('bible_parsing.db', DIR_CACHE)
const PATH_ZIP_META = new URL('bible_parsing.zip.json', DIR_CACHE)
const PATH_REPORT = new URL('gen_sn_pos_report.txt', DIR_CACHE)
const PATH_OUT = new URL('../index/sn_pos.json.gz', import.meta.url)
const RATIO_MINOR = 0.1

/**
 * 詞性代碼 (新舊約共用)
 * n 名詞 pn 專有名詞 v 動詞 a 形容詞 num 數詞 d 副詞 neg 否定詞 c 連接詞 p 介系詞
 * art 冠詞 pron 代名詞 rel 關係代名詞 t 質詞 i 感嘆詞 obj 受詞記號 (舊約 853)
 */
const NT_PRO = {
    n: 'n', v: 'v', a: 'a', d: 'd', dr: 'd', c: 'c', p: 'p', t: 't', i: 'i',
    ra: 'art', rr: 'rel', rp: 'pron', rd: 'pron', rf: 'pron', ri: 'pron', ru: 'pron', rre: 'pron', crp: 'pron', ai: 'pron',
}
/** 新約否定詞：οὐ μή οὐχί οὐ μή οὐδέ μηδέ οὔτε μήτε μήποτε */
const NT_NEG = ['3756', '3361', '3780', '3364', '3761', '3366', '3777', '3383', '3379']
/** 舊約描述開頭 → 詞性，依序比對 (「代名詞」含「名詞」，要先比) */
const OT_HEAD = [
    [/專有名詞|上帝的名字/, 'pn'],
    [/否定/, 'neg'],
    [/受詞記號/, 'obj'],
    [/關係/, 'rel'],
    [/代名詞|指示詞|疑問詞/, 'pron'],
    [/冠詞/, 'art'],
    [/介系詞/, 'p'],
    [/連接詞/, 'c'],
    [/動詞/, 'v'],
    [/形容詞/, 'a'],
    [/數/, 'num'],
    [/名詞/, 'n'],
    [/副詞/, 'd'],
    [/感[歎嘆]詞|驚[歎嘆]/, 'i'],
    [/質詞|助詞/, 't'],
]

if (!fs.existsSync(PATH_DB)) throw new Error('沒有 tools/.cache/bible_parsing.db，先執行 npm run gen:orig')
const db = new DatabaseSync(fileURLToPath(PATH_DB), { readOnly: true })
const ver = db.prepare('SELECT dt FROM version').get()?.dt ?? ''

/** @type {Record<'G'|'H', Map<string, Map<string, number>>>} sn → 詞性 → 次數 */
const cnt = { G: new Map(), H: new Map() }
const add = (tp, sn, pos) => {
    const m = cnt[tp]
    if (!m.has(sn)) m.set(sn, new Map())
    m.get(sn).set(pos, (m.get(sn).get(pos) ?? 0) + 1)
}
const unknownNt = new Map(), unknownOt = new Map()
const inc = (m, k) => m.set(k, (m.get(k) ?? 0) + 1)

for (const r of db.prepare('SELECT sn, pro, uorig FROM fhlwhparsing WHERE wid > 0').all()) {
    const sn = normalizeSn(r.sn)
    if (sn == null) continue
    let pos = NT_PRO[(r.pro ?? '').trim()]
    if (pos == null) { inc(unknownNt, (r.pro ?? '').trim()); continue }
    if (pos == 'n' && /^\p{Lu}/u.test((r.uorig ?? '').trim())) pos = 'pn'
    add('G', sn, pos)
}
for (const r of db.prepare('SELECT sn, wform FROM lparsing WHERE wid > 0').all()) {
    const sn = normalizeSn(r.sn)
    if (sn == null) continue
    const pos = otPos(r.wform ?? '')
    if (pos == null) { inc(unknownOt, mainSegment(r.wform ?? '')); continue }
    add('H', sn, pos)
}
db.close()

const pos = { G: {}, H: {} }
const ambiguous = []
for (const tp of /** @type {const} */ (['G', 'H'])) {
    const sns = [...cnt[tp].keys()].sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b))
    for (const sn of sns) {
        const m = cnt[tp].get(sn)
        const total = [...m.values()].reduce((a, b) => a + b, 0)
        const list = [...m].sort((a, b) => b[1] - a[1]).filter(([, n]) => n / total >= RATIO_MINOR).map(([p]) => p)
        if (tp == 'G' && NT_NEG.includes(sn) && !list.includes('neg')) list.push('neg')
        pos[tp][sn] = list.join('|')
        if (list.length > 1) ambiguous.push([`${tp}${sn}`, total, JSON.stringify(Object.fromEntries(m))])
    }
}

const srcParsing = fs.existsSync(PATH_ZIP_META) ? JSON.parse(fs.readFileSync(PATH_ZIP_META, 'utf8')).lastModified : ''
const src = { url: 'https://ftp.fhl.net/FHL/COBS/data/bible_parsing.zip', lastModified: srcParsing }
fs.writeFileSync(PATH_OUT, zlib.gzipSync(JSON.stringify({ ver, src, pos }), { level: 9 }))

const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n)
fs.writeFileSync(PATH_REPORT, [
    `bible_parsing.db version: ${ver}`,
    `G ${Object.keys(pos.G).length} 個 SN，H ${Object.keys(pos.H).length} 個 SN，多詞性 ${ambiguous.length}`,
    '', '## 新約對不到的 pro (pro 次數)', ...top(unknownNt, 50).map(([k, n]) => `${k}\t${n}`),
    '', '## 舊約對不到的描述 (描述 次數)，前 200', ...top(unknownOt, 200).map(([k, n]) => `${k}\t${n}`),
    '', '## 多詞性 (SN 總次數 各詞性次數)，依次數', ...ambiguous.sort((a, b) => b[1] - a[1]).map(a => a.join('\t')),
].join('\n') + '\n')

console.log(`SN 詞性表 → ${fileURLToPath(PATH_OUT)} (${fs.statSync(PATH_OUT).size} bytes)`)
console.log(`  G ${Object.keys(pos.G).length}、H ${Object.keys(pos.H).length} 個 SN，多詞性 ${ambiguous.length}；新約對不到 ${sum(unknownNt)} 字、舊約對不到 ${sum(unknownOt)} 字`)
console.log(`  報告 ${fileURLToPath(PATH_REPORT)}`)

/** `07225` → `7225`、`08521a` → `8521a`；`00000` 與空的 → null */
function normalizeSn(s) {
    return (s ?? '').trim().match(/^0*([1-9]\d*[a-z]?)$/i)?.[1]?.toLowerCase() ?? null
}
/** 去掉詞尾，取最後一段 (前面是冠詞、介系詞、連接詞等字首)；去掉 12…21 的希伯來文內碼 */
function mainSegment(wform) {
    const segs = wform.split('+').map(s => s.replace(/12\S*?21/g, '').trim()).filter(s => s != '' && !s.includes('詞尾'))
    // 冠詞沒有自己的 SN：希伯來文是字首，亞蘭文是字尾 (「名詞，陽性單數 + 定冠詞」)，都不是主要的字
    const main = segs.filter(s => !/^定?冠詞/.test(s))
    return (main.length > 0 ? main : segs).at(-1) ?? ''
}
function otPos(wform) {
    if (wform.includes('上帝的名字')) return 'pn' // YHWH 的長說明
    const head = mainSegment(wform)
        .replace(/^.*停頓型，\s*/, '') // 「的停頓型，名詞，陽性單數」
        .replace(/^.*它是\s*/, '') // 「這是寫型和讀型兩個字的混合字型。按讀型，它是代名詞 3 單陰」
        .split('，')[0]
    return OT_HEAD.find(([re]) => re.test(head))?.[1] ?? null
}
function sum(m) { return [...m.values()].reduce((a, b) => a + b, 0) }
