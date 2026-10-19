// 產生 index/af_books.json：使徒教父 17 本 (信望愛 qaf.php, bid 201–217) 的書卷表與各章節數
// 執行：npm run gen:af (需要網路，約 300 個請求；規畫見 docs/z261019a)
//
// - 注意是 /api/qaf.php；/json/qaf.php 不認 bid，永遠回革利免一書
// - 沒有上游的書卷清單端點，所以逐書逐章打 qaf.php 量：章數、每章最大節號
// - 有些章只有一個沒編號的段落 (sec=0，例如 210:14、211:4、211:21)：節數記 0，並列在 sec0
// - chap=0 上游當成 chap=1，所以從 chap=1 開始量；連續兩章空才算結束
// - 中文名、英文縮寫用上游回的 chineses / engs；簡體名、中文簡稱是這裡自訂 (上游沒有)
import fs from 'node:fs'

const OUT = new URL('../index/af_books.json', import.meta.url)
const BASE = 'https://bible.fhl.net/api/qaf.php'
const BIDS = Array.from({ length: 17 }, (_, i) => 201 + i)

/** 中文簡稱 (上游沒有)。「伊」單獨會歧義 (7 封信)，所以不收 */
const ABBR = {
    201: '革一', 202: '革二',
    203: '伊弗', 204: '伊馬', 205: '伊他', 206: '伊羅', 207: '伊非', 208: '伊士', 209: '伊坡',
    210: '坡腓', 211: '坡殉', 212: '遺訓', 213: '巴拿巴', 214: '黑馬', 215: '丟格', 216: '帕皮', 217: '長老',
}
/** 名稱用到的字的簡體 (全站沒有通用的繁簡轉換，只有 gbText 字典) */
const SIMP = {
    '書': '书', '記': '记', '馬': '马', '內': '内', '羅': '罗', '鐵': '铁', '丟': '丢', '遺': '遗', '殘': '残',
    '傳': '传', '統': '统', '衆': '众', '長': '长', '腓': '腓', '亞': '亚', '訓': '训', '個': '个', '徒': '徒',
}
const toGb = s => [...s].map(c => SIMP[c] ?? c).join('')

async function getJson(params, tries = 4) {
    const url = `${BASE}?${new URLSearchParams({ ...params, strong: '0' })}`
    for (let i = 1; ; i++) {
        try {
            const res = await fetch(url)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const j = await res.json()
            if (j.status !== 'success') throw new Error(`status ${j.status}`)
            return j
        } catch (e) {
            if (i >= tries) throw new Error(`${url}: ${e.message}`)
            await new Promise(r => setTimeout(r, 500 * i))
        }
    }
}

async function measureBook(bid) {
    const verses = []   // verses[chap - 1] = 該章最大節號 (只有 sec=0 的章是 0)
    const sec0 = []     // 含有 sec=0 段落的章
    let names = null
    for (let chap = 1; ; chap++) {
        const j = await getJson({ bid, chap })
        let rec = j.record
        if (rec.length === 0) {
            // 連續兩章空才算結束 (保險，實測沒有中間空的章)
            if ((await getJson({ bid, chap: chap + 1 })).record.length === 0) break
            throw new Error(`bid ${bid} chap ${chap} 是空的但後面還有章，請人工確認`)
        }
        if (rec.some(r => +r.bid !== bid || +r.chap !== chap)) throw new Error(`bid ${bid} chap ${chap} 回了別章的資料`)
        names ??= { zh: rec[0].chineses, engs: rec[0].engs }
        const secs = rec.map(r => +r.sec)
        if (secs.includes(0)) sec0.push(chap)
        verses.push(Math.max(...secs))
    }
    if (verses.length === 0) throw new Error(`bid ${bid} 沒有任何章`)
    return { id: bid, nameZh: names.zh, nameZhGb: toGb(names.zh), abbrZh: ABBR[bid], abbrZhGb: toGb(ABBR[bid]), engs: names.engs, chapCount: verses.length, verses, sec0 }
}

const books = []
// 4 本一組平行，避免一次打太多
for (let i = 0; i < BIDS.length; i += 4) {
    const group = await Promise.all(BIDS.slice(i, i + 4).map(measureBook))
    for (const b of group) console.log(`${b.id} ${b.nameZh} ${b.chapCount} 章${b.sec0.length ? ` (無編號段落: ${b.sec0.join(',')})` : ''}`)
    books.push(...group)
}

const out = {
    note: '由 tools/gen_af_books.mjs 產生 (npm run gen:af)，不要手改。verses[chap-1] = 該章最大節號，0 = 只有一個沒編號的段落 (sec=0)',
    generated: new Date().toISOString().slice(0, 10),
    source: 'qaf.php (黃錫木主編《使徒教父著作》, version afhuang)',
    corpus: 'af',
    idRange: [201, 299],
    books,
}
// 一本一行，diff 看得懂
const text = '{\n' + [
    `  "note": ${JSON.stringify(out.note)},`,
    `  "generated": ${JSON.stringify(out.generated)},`,
    `  "source": ${JSON.stringify(out.source)},`,
    `  "corpus": "af",`,
    `  "idRange": [201, 299],`,
    `  "books": [\n${books.map(b => '    ' + JSON.stringify(b)).join(',\n')}\n  ]`,
].join('\n') + '\n}\n'
fs.writeFileSync(OUT, text)
console.log(`${books.length} 本 → ${OUT.pathname} (${fs.statSync(OUT).size} bytes)`)
