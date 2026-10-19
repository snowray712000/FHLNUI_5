// 產生 index/apo_books.json：次經 15 本 (信望愛 qsub.php, bid 101–115) 的書卷表與各章節數
// 執行：npm run gen:apo (需要網路，約 450 個請求；規畫見 docs/z261019b)
//
// - 注意是 /api/qsub.php；沒有上游的書卷清單端點，所以逐書逐章打 qsub.php 量：章數、每章最大節號
// - 次經有兩個文本：c1933 (1933年聖公會出版，預設) 與 chdc (1933年次經全書)。兩個的節集合不完全相同
//   (chdc 多了 101:1:64 等，少了 107 第 1 章與 114 整卷)，所以章數 / 節數取兩個文本的聯集最大值，
//   各文本缺哪些章記在 missing
// - c1933 有 26 節文字只有 `a` (併入上節，同 qsb.php)：記在 merged ("章:節")
// - 沒有 sec=0 的節 (使徒教父才有)；萬一出現就丟錯，免得畫面默默壞掉
// - bid 超出範圍時上游不報錯、靜默回第 101 卷，所以只打 101–115
// - 書名兩套：信望愛站名 (官方次經閱讀頁 new/readsub.php 的下拉選單，預設) 與天主教通行名
//   (FHL-MCP-Go 整理的表，作者標「未經官方確認」，用字之後要再核對)。簡稱 abbrZh 用上游的 chineses
// - 通行名的簡稱不能與新舊約衝突 (例如「多」是提多書)，tests/bookRegistry.test.js 會檢查
import fs from 'node:fs'

const OUT = new URL('../index/apo_books.json', import.meta.url)
const BASE = 'https://bible.fhl.net/api/qsub.php'
const BIDS = Array.from({ length: 15 }, (_, i) => 101 + i)
const VERSIONS = ['c1933', 'chdc']

/** 信望愛站名 (官方次經閱讀頁)、通行名、通行名簡稱；上游 chineses 當 abbrZh，這裡也列出來核對 */
const NAMES = {
    101: { fhl: '瑪喀比傳上卷', alt: '瑪加伯上', abbr: '馬一', abbrAlt: '加上' },
    102: { fhl: '瑪喀比傳下卷', alt: '瑪加伯下', abbr: '馬二', abbrAlt: '加下' },
    103: { fhl: '多比傳', alt: '多俾亞傳', abbr: '比', abbrAlt: '多俾' },
    104: { fhl: '猶滴傳', alt: '友弟德傳', abbr: '滴', abbrAlt: '友弟' },
    105: { fhl: '便西拉智訓', alt: '德訓篇', abbr: '便', abbrAlt: '德訓' },
    106: { fhl: '所羅門智訓', alt: '智慧篇', abbr: '所', abbrAlt: '智慧' },
    107: { fhl: '以斯拉續編上卷', alt: '以斯拉上', abbr: '拉上', abbrAlt: '拉上' },
    108: { fhl: '以斯拉續編下卷', alt: '以斯拉下', abbr: '拉下', abbrAlt: '拉下' },
    109: { fhl: '巴錄書', alt: '巴錄書', abbr: '巴', abbrAlt: '巴' },
    110: { fhl: '耶利米書信', alt: '耶利米書信', abbr: '耶信', abbrAlt: '耶信' },
    111: { fhl: '瑪拿西禱言', alt: '瑪拿西禱詞', abbr: '禱', abbrAlt: '禱' },
    112: { fhl: '三童歌', alt: '三童歌', abbr: '童', abbrAlt: '童' },
    113: { fhl: '蘇撒拿傳', alt: '蘇撒拿傳', abbr: '蘇', abbrAlt: '蘇' },
    114: { fhl: '比勒與大龍', alt: '彼勒與大龍', abbr: '勒', abbrAlt: '勒' },
    115: { fhl: '以斯帖補編', alt: '以斯帖補篇', abbr: '斯補', abbrAlt: '斯補' },
}
/** 名稱用到的字的簡體 (全站沒有通用的繁簡轉換，只有 gbText 字典) */
const SIMP = {
    '瑪': '玛', '傳': '传', '猶': '犹', '訓': '训', '羅': '罗', '門': '门', '續': '续', '編': '编', '錄': '录', '書': '书',
    '禱': '祷', '蘇': '苏', '與': '与', '龍': '龙', '補': '补', '馬': '马', '詞': '词', '亞': '亚', '帖': '帖', '歌': '歌',
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
    const maxSec = []                                   // 聯集：maxSec[chap - 1] = 兩個文本該章最大節號
    const missing = Object.fromEntries(VERSIONS.map(v => [v, []])) // 各文本沒有的章
    const merged = []                                   // c1933 文字只有 `a` 的節 "章:節"
    let names = null
    let emptyRun = 0
    for (let chap = 1; ; chap++) {
        const recs = await Promise.all(VERSIONS.map(async version => {
            const j = await getJson({ bid, chap, version })
            if (j.record.some(r => +r.bid !== bid || +r.chap !== chap)) throw new Error(`bid ${bid} chap ${chap} ${version} 回了別章的資料`)
            if (j.record.some(r => +r.sec === 0)) throw new Error(`bid ${bid} chap ${chap} ${version} 有 sec=0，規畫沒預期，請人工確認`)
            return j.record
        }))
        if (recs.every(r => r.length === 0)) {
            // 兩個文本都空：連續兩章空才算結束 (chdc 的 107 第 1 章是空的，c1933 有；所以只看聯集)
            if (++emptyRun >= 2) break
            continue
        }
        // 空章後面還有章：實測沒有中間兩個文本都空的章
        if (emptyRun > 0) throw new Error(`bid ${bid} chap ${chap - 1} 兩個文本都是空的但後面還有章，請人工確認`)
        names ??= { zh: recs[0][0]?.chineses ?? recs[1][0].chineses, engs: recs[0][0]?.engs ?? recs[1][0].engs }
        recs.forEach((r, i) => { if (r.length === 0) missing[VERSIONS[i]].push(chap) })
        maxSec.push(Math.max(...recs.flat().map(r => +r.sec)))
        for (const r of recs[0]) if (r.bible_text.trim() === 'a') merged.push(`${chap}:${+r.sec}`)
    }
    if (maxSec.length === 0) throw new Error(`bid ${bid} 沒有任何章`)
    const n = NAMES[bid]
    if (names.zh !== n.abbr) throw new Error(`bid ${bid}: 上游簡稱 ${names.zh} 與表上的 ${n.abbr} 不同`)
    return {
        id: bid,
        nameZh: n.fhl, nameZhGb: toGb(n.fhl), abbrZh: n.abbr, abbrZhGb: toGb(n.abbr),
        nameAlt: n.alt, nameAltGb: toGb(n.alt), abbrAlt: n.abbrAlt, abbrAltGb: toGb(n.abbrAlt),
        engs: names.engs, chapCount: maxSec.length, verses: maxSec, merged, missing,
    }
}

const books = []
// 4 本一組平行，避免一次打太多
for (let i = 0; i < BIDS.length; i += 4) {
    const group = await Promise.all(BIDS.slice(i, i + 4).map(measureBook))
    for (const b of group) {
        const miss = VERSIONS.filter(v => b.missing[v].length).map(v => `${v} 缺第 ${b.missing[v].join(',')} 章`).join('；')
        console.log(`${b.id} ${b.nameZh} ${b.chapCount} 章，併入上節 ${b.merged.length} 節${miss ? `；${miss}` : ''}`)
    }
    books.push(...group)
}

const out = {
    note: '由 tools/gen_apo_books.mjs 產生 (npm run gen:apo)，不要手改。verses[chap-1] = 該章最大節號 (c1933 與 chdc 的聯集)；merged = c1933 文字只有 a (併入上節) 的 "章:節"；missing = 各文本沒有的章。nameZh / abbrZh 是信望愛站名 (預設)，nameAlt / abbrAlt 是天主教通行名',
    generated: new Date().toISOString().slice(0, 10),
    source: 'qsub.php (c1933 1933年聖公會出版、chdc 1933年次經全書)',
    corpus: 'apo',
    idRange: [101, 199],
    versions: VERSIONS,
    books,
}
// 一本一行，diff 看得懂
const text = '{\n' + [
    `  "note": ${JSON.stringify(out.note)},`,
    `  "generated": ${JSON.stringify(out.generated)},`,
    `  "source": ${JSON.stringify(out.source)},`,
    `  "corpus": "apo",`,
    `  "idRange": [101, 199],`,
    `  "versions": ${JSON.stringify(VERSIONS)},`,
    `  "books": [\n${books.map(b => '    ' + JSON.stringify(b)).join(',\n')}\n  ]`,
].join('\n') + '\n}\n'
fs.writeFileSync(OUT, text)
console.log(`${books.length} 本 → ${OUT.pathname} (${fs.statSync(OUT).size} bytes)`)
