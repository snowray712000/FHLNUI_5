/**
 * 講道分頁：解析 sc.php (book=8、9、10) 的回傳。純函式，不碰 DOM (tests/preachSermon.test.js)。
 *
 * com_text 是大綱文字夾著錄音標記，例：
 *   "宇宙之開放性及依存性\r\n...\r\n[media$N01_001_001_001_001_t.m3u]（台語）\r\n[media$N01_001_001_001_001_m.m3u]（華語）"
 *   "[media$40/N40_5_1_5_3.m3u] "
 * 錄音在 https://media.fhl.net/cbolcom/{講員book}/{標記中的路徑}.mp3
 */

/** sc.php 的講道 book 編號 (sc.php?validbook=1)：蔡茂堂、盧俊義、康來昌 */
export const PREACH_BOOKS = [8, 9, 10]

const RE_MEDIA = /\[media\$([0-9A-Za-z_/]+)\.m(?:3u|p3)\]/g
/** 標記後面緊接的「（台語）」「(華語）」 */
const RE_LABEL = /^[ \t]*[（(]([^（()）\r\n]{1,10})[）)]/

/**
 * @typedef {{label:string, url:string}} DPreachTrack
 * @typedef {{book:string|number, engs:string, chap:number, sec:number}} DPreachLink sc.php 的 prev / next
 * @typedef {{bookid:number, speaker:string, title:string, outline:string[], tracks:DPreachTrack[], prev:DPreachLink|null, next:DPreachLink|null}} DPreachSermon
 */

/**
 * @param {any} jo sc.php 回傳
 * @param {number} bookid 8 9 10
 * @returns {DPreachSermon|null} 沒有資料時 null
 */
export function parseSermon(jo, bookid) {
    const rec = jo?.record?.[0]
    if (!(jo?.record_count > 0) || rec == null) return null

    const tracks = []
    const outline = []
    const text = String(rec.com_text ?? '').replace(/\r\n?/g, '\n')
    let last = 0
    for (const m of text.matchAll(RE_MEDIA)) {
        outline.push(text.slice(last, m.index))
        last = m.index + m[0].length
        const lab = text.slice(last).match(RE_LABEL)
        if (lab) last += lab[0].length
        tracks.push({ label: lab?.[1].trim() ?? '', url: `https://media.fhl.net/cbolcom/${bookid}/${m[1]}.mp3` })
    }
    outline.push(text.slice(last))

    return {
        bookid,
        speaker: String(rec.book_name ?? '').replace(/講道$/, ''),
        title: formatPreachTitle(rec.title),
        outline: outline.join('\n').split('\n').map(a1 => a1.trim()).filter(a1 => a1 != ''),
        tracks,
        prev: jo.prev ?? null,
        next: jo.next ?? null,
    }
}

/**
 * 「馬太福音 5章1節 到 5章3節」→「馬太福音 5:1-3」；「創世記 0章0節 到 0章0節」→「創世記 書卷導論」
 * 格式不符就原樣
 * @param {string} title
 */
export function formatPreachTitle(title) {
    const m = String(title ?? '').match(/^(.*?)\s*(\d+)章(\d+)節\s*到\s*(\d+)章(\d+)節$/)
    if (m == null) return title ?? ''
    const [, book, c1, v1, c2, v2] = m
    if (c1 == '0') return `${book} 書卷導論`
    if (c1 == c2) return v1 == v2 ? `${book} ${c1}:${v1}` : `${book} ${c1}:${v1}-${v2}`
    return `${book} ${c1}:${v1}-${c2}:${v2}`
}
