// 產生 static/search_api/abvphp_snapshot.js：uiabv.php (譯本代碼 ↔ 名稱) 的快照，開頁就有譯本名稱，不必等 API
// 執行：npm run gen:uiabv (需要網路，2 個請求)
//
// - abvphp_api.js 先用這份填字典，背景照樣打 uiabv.php 更新；經文表頭遇到字典裡沒有的譯本才等 API
// - 譯本選擇對話框 (libs/ijnjs-ui/BibleVersionDialog/BibleVersionDialog.js) 的 langs 只管分類 (語言、年代、cds、od)，
//   名稱也從這裡拿。這裡順便列出：API 有但對話框沒分類的 (會落到「其它」)、對話框有但 API 沒列的
import fs from 'node:fs'

const OUT = new URL('../static/search_api/abvphp_snapshot.js', import.meta.url)
const DIALOG = new URL('../libs/ijnjs-ui/BibleVersionDialog/BibleVersionDialog.js', import.meta.url)

async function fetchRecords(gb) {
    const res = await fetch(`https://bible.fhl.net/json/uiabv.php?gb=${gb}`)
    if (!res.ok) throw new Error(`${res.status} uiabv.php?gb=${gb}`)
    return (await res.json()).record
}

const [r0, r1] = await Promise.all([fetchRecords(0), fetchRecords(1)])
const gbNames = Object.fromEntries(r1.map(r => [r.book, r.cname]))

// [book, 繁體名, 簡體名, ntonly, otonly, strong]
const rows = r0.map(r => [r.book, r.cname, gbNames[r.book] ?? r.cname, +r.ntonly, +r.otonly, +r.strong])

const today = new Date().toISOString().slice(0, 10)
const js = `// 由 tools/gen_uiabv.mjs 產生 (npm run gen:uiabv)，不要手改
// uiabv.php 的快照：[book, 繁體名, 簡體名, ntonly, otonly, strong]
var abvphpSnapshot = {
  generated: '${today}',
  rows: [
${rows.map(a => '    ' + JSON.stringify(a)).join(',\n')}
  ]
};
`
fs.writeFileSync(OUT, js)
console.log(`${rows.length} 個譯本 → ${OUT.pathname} (${fs.statSync(OUT).size} bytes)`)

// 與對話框的分類比對 (只看沒被註解掉的 { na: 'xxx' ... vers 項目)
const src = fs.readFileSync(DIALOG, 'utf8')
const langsSrc = src.slice(src.indexOf('langs: ['), src.indexOf('chSubs:'))
const groups = new Set([...langsSrc.matchAll(/^\s*\{?\s*na: '(\w+)', cna: '[^']*', od: \d+, vers:/gm)].map(m => m[1]))
const dialogNas = new Set(langsSrc.split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .flatMap(line => [...line.matchAll(/\bna: '(\w+)'/g)].map(m => m[1]))
    .filter(na => !groups.has(na)))
const apiNas = new Set(rows.map(a => a[0]))
const unclassified = rows.filter(a => !dialogNas.has(a[0])).map(a => `${a[0]} ${a[1]}`)
const notInApi = [...dialogNas].filter(na => !apiNas.has(na))
if (unclassified.length) console.log(`對話框沒分類 (會落到「其它」)，請補到 BibleVersionDialog.js 的 langs：${unclassified.join('、')}`)
if (notInApi.length) console.log(`對話框有、uiabv.php 沒列 (名稱用對話框的 cna)：${notInApi.join('、')}`)
