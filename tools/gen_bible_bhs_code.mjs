// 產生 index/bible_bhs_code.json.gz：全舊約希伯來文原文 (bhs) 的信望愛內碼，舊約原文搜尋用
// 執行：npm run gen:bhs (需要網路，約 47 個請求)
//
// - 來源 se.php?VERSION=bhs&q=%：q 會直接放進 SQL LIKE，% 就是全部；回傳的 bible_text 是內碼 (不是 Unicode)
// - 內碼轉 Unicode 用 index/hebCode.es2023.js 的 umscode
// - 格式與 bible_fhlwh.json.gz 相同：{col, data: [[book(1based), chap, sec, 內碼], ...]}
import fs from 'node:fs'
import zlib from 'node:zlib'

const OT_ENGS = ['Gen', 'Ex', 'Lev', 'Num', 'Deut', 'Josh', 'Judg', 'Ruth', '1 Sam', '2 Sam', '1 Kin', '2 Kin',
    '1 Chr', '2 Chr', 'Ezra', 'Neh', 'Esth', 'Job', 'Ps', 'Prov', 'Eccl', 'Song', 'Is', 'Jer', 'Lam', 'Ezek',
    'Dan', 'Hos', 'Joel', 'Amos', 'Obad', 'Jon', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal']
const LIMIT = 500
const OUT = new URL('../index/bible_bhs_code.json.gz', import.meta.url)

const data = []
for (let offset = 0; ; offset += LIMIT) {
    const qs = new URLSearchParams({ VERSION: 'bhs', orig: 0, q: '%', limit: LIMIT, offset })
    const res = await fetch('https://bible.fhl.net/json/se.php?' + qs)
    if (!res.ok) throw new Error(`se.php ${res.status}`)
    const jo = await res.json()
    for (const a1 of jo.record ?? []) {
        const book = OT_ENGS.indexOf(a1.engs) + 1
        if (book == 0) throw new Error(`不認得的書卷 ${a1.engs}`)
        data.push([book, a1.chap, a1.sec, a1.bible_text.replace(/\r\n/g, '\n')])
    }
    process.stdout.write(`\r${data.length}`)
    if ((jo.record ?? []).length != LIMIT) break
}
data.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])

const json = JSON.stringify({ col: ['book', 'chap', 'sec', 'code'], data })
fs.writeFileSync(OUT, zlib.gzipSync(json, { level: 9 }))
console.log(`\n${data.length} 節 → ${OUT.pathname} (${fs.statSync(OUT).size} bytes)`)
