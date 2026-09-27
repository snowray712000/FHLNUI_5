// 產生 index/audio_bible_index.json：有聲聖經各版本「實際有哪些章」，有聲分頁用
// 執行：npm run gen:audio (需要網路，約 44 個請求)
//
// - au.php 不檢查檔案是否存在，一律回傳網址，所以覆蓋度要從舊版列表頁 new/audio_hb.php?version=N 取得
//   (bible.fhl.net 首頁「聖經朗讀」點進去的那頁)，它只列存在的章
// - 列表頁每章一個連結：listenhb.php (只有聲音) 或 listenhbm4.php (有 mp4 投影片)
// - bid 後面的 A、B、C 是同一章的其它朗讀版本，檔案在 media.fhl.net/{dir}/{bid}{A}/{bid}_{章3位}.mp3
// - dir (media.fhl.net 下的資料夾) 從 au.php 回傳的 mp3 網址取出
// - 章以範圍字串存，例如 "1-50" "1-3,5,7-9"，由 AudioBibleVersions.es2023.js 的 parseChapRanges 解開
import fs from 'node:fs'

const VERSION_MAX = 40 // au.php 目前到 21，多試幾個，名稱空白就是沒有
const OUT = new URL('../index/audio_bible_index.json', import.meta.url)

/** @param {number[]} nums 已排序 */
function toRanges(nums) {
    const re = []
    for (let i = 0; i < nums.length;) {
        let j = i
        while (j + 1 < nums.length && nums[j + 1] == nums[j] + 1) j++
        re.push(i == j ? `${nums[i]}` : `${nums[i]}-${nums[j]}`)
        i = j + 1
    }
    return re.join(',')
}

async function fetchText(url) {
    for (let retry = 0; ; retry++) {
        try {
            const res = await fetch(url)
            if (!res.ok) throw new Error(`${res.status} ${url}`)
            return await res.text()
        } catch (err) {
            if (retry >= 3) throw err
            await new Promise(r => setTimeout(r, 2000 * (retry + 1)))
        }
    }
}

const versions = []
for (let v = 0; v <= VERSION_MAX; v++) {
    const jo = JSON.parse(await fetchText(`https://bible.fhl.net/json/au.php?version=${v}&bid=1&chap=1`))
    if (!jo.name) continue
    const dir = jo.mp3.match(/media\.fhl\.net\/([^/]+)\//)?.[1]
    if (!dir) throw new Error(`v${v} 取不到 dir: ${jo.mp3}`)

    const html = await fetchText(`https://bible.fhl.net/new/audio_hb.php?version=${v}`)
    /** @type {Record<string, Record<string, Set<number>>>} bid → variant → chaps */
    const ch = {}
    const m4 = {}
    for (const m of html.matchAll(/listenhb(m4)?\.php\?version=(\d+)&(?:amp;)?bid=(\d+)([A-Z]?)&(?:amp;)?chap=(\d+)/g)) {
        const [, isM4, ver, bid, variant, chap] = m
        if (+ver != v) continue
        for (const obj of isM4 ? [ch, m4] : [ch]) {
            obj[bid] ??= {}
            obj[bid][variant] ??= new Set()
            obj[bid][variant].add(+chap)
        }
    }
    const pack = obj => Object.fromEntries(Object.entries(obj)
        .sort((a, b) => a[0] - b[0])
        .map(([bid, vs]) => [bid, Object.fromEntries(Object.entries(vs)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([variant, set]) => [variant, toRanges([...set].sort((a, b) => a - b))]))]))

    const cnt = Object.values(ch).reduce((s, vs) => s + (vs[''] ?? vs[Object.keys(vs)[0]]).size, 0)
    console.log(`v${v} ${dir} ${jo.name}: ${Object.keys(ch).length} 卷 ${cnt} 章${Object.keys(m4).length ? '，有 mp4' : ''}`)
    versions.push({ v, name: jo.name, dir, ch: pack(ch), m4: pack(m4) })
}

const today = new Date().toISOString().slice(0, 10)
fs.writeFileSync(OUT, JSON.stringify({ generated: today, versions }))
console.log(`${versions.length} 個版本 → ${OUT.pathname} (${fs.statSync(OUT).size} bytes)`)
