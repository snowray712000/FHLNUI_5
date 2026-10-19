import { BookRegistry } from './BookRegistry.es2023.js'

/**
 * # 使徒教父注腳：信望愛舊站的 AF/rt.php (規畫與上游行為見 docs/z261019a)
 *
 * - 取得方式是穩定版 (bible.fhl.net/AF/readaf.php) 用的：`/AF/rt.php?k=3&VERSION=afhuang&book=1 Clem.`
 *   `k` 就是經文裡 `【3】` 的編號，在一本書內唯一 (不分章，帶 chap 也會被忽略)；`book` 是英文縮寫 (有空白要編碼)
 * - 回的是一小段 HTML：`<tr><td>③ 不尋常：直譯“異類”。</td></tr>`，開頭的圓圈數字是編號，要拿掉
 * - 查不到回 200 + 一句「查不到任何資料」的 html，沒有 json；也沒有「整章 / 整本」的查詢 (不帶 k 就是查不到)
 * - 沒有 CORS 標頭 (`/api/`、`/json/` 才有)，所以只能同源用 (正式站同在 bible.fhl.net)；
 *   開發時由 vite 的 proxy 轉過去 (vite.config.js)。`/json/rt.php` 認不得 afhuang (回 Fail)
 */

export const AF_FOOT_PATH = '/AF/rt.php'
export const AF_FOOT_VERSION = 'afhuang'

/**
 * @param {{book: number, id: number | string}} args book 是書卷 id (201–217)
 * @returns {string}
 */
export function afFootUrl({ book, id }) {
    if (BookRegistry.corpusOf(book) !== 'af' || !BookRegistry.has(book)) throw new Error(`af 注腳: 不是使徒教父的書卷 id: ${book}`)
    const k = Number(id)
    if (!Number.isInteger(k) || k < 1) throw new Error(`af 注腳: 編號要是 1 以上的整數: ${id}`)
    const engs = BookRegistry.engs(book)
    return `${AF_FOOT_PATH}?${new URLSearchParams({ k: String(k), VERSION: AF_FOOT_VERSION, book: engs })}`
}

/** 開頭的編號：圓圈數字 (① ⑳ ㉑ ㊿ ⓫ ⓿ ❶…) 或 `(12)`、`12.`、`【12】`，後面可有空白 */
const LEAD_NO = /^\s*(?:[①-⑳㉑-㉟㊱-㊿⓫-⓴❶-❿⓿]|[(（【]?\d+[)）】.．]?)\s*/u

/**
 * 回應 html → 注腳內文。查不到 (沒有 `<td>`) 回 null。
 * 取 td 的文字、拿掉開頭的編號、&nbsp; 變空白、連續空白合成一個；注腳內只有純文字 (含 `參：太 22:37`)
 * @param {string} html
 * @returns {string | null}
 */
export function parseAfFoot(html) {
    const m = /<td[^>]*>([\s\S]*?)<\/td>/i.exec(String(html ?? ''))
    if (m == null) return null
    const text = m[1]
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
        .replace(LEAD_NO, '')
        .replace(/\s+/g, ' ')
        .trim()
    return text === '' ? null : text
}

/** @type {Map<string, Promise<string | null>>} key = `book|id`；失敗不快取 */
const cache = new Map()

/**
 * 取得一則注腳。查不到回 null；網路失敗 (含 CORS) 丟錯
 * @param {{book: number, id: number | string}} args
 * @returns {Promise<string | null>}
 */
export function afFootAsync({ book, id }) {
    const key = `${book}|${Number(id)}`
    let p = cache.get(key)
    if (p == null) {
        p = (async () => {
            const { fetchTextAsync } = await import('./fetchAsync.es2023.js')
            return parseAfFoot(await fetchTextAsync(afFootUrl({ book, id }), { timeout: 15000 }))
        })()
        cache.set(key, p)
        p.catch(() => cache.delete(key))
    }
    return p
}
