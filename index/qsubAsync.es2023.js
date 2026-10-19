import { BookRegistry } from './BookRegistry.es2023.js'
import { checkSec, checkChap, normalizeCorpus, makeCachedFetcher } from './corpusApi.es2023.js'

/**
 * # 次經經文：信望愛 qsub.php (書卷 id 101–115)
 * 規畫與上游行為見 docs/z261019b
 *
 * - 網址是 /api/qsub.php；bid 就是站內書卷 id
 * - 兩個文本：`c1933` (1933年聖公會出版，預設，純文字) 與 `chdc` (1933年次經全書，HTML，之後才做)
 * - **bid 超出範圍時上游不報錯，靜默回第 101 卷第 1 章**，所以 bid 一定要先用 BookRegistry 驗證
 * - 章不存在時上游仍回 success、0 筆；`chap=0` 被當成 `chap=1`
 * - 有些節的文字只有 `a`，是「併入上節」(同 qsb.php，VerseGrid 的 isMergedWithPrev 處理)
 * - `gb=1` 上游直接回簡體，所以不用另外轉換；快取鍵 (網址) 已含 gb
 * - 沒有註腳、沒有 sec=0、沒有 Strong's number
 */

export const QSUB_URL = 'https://bible.fhl.net/api/qsub.php'
/** 預設文本 */
export const APO_VERSION = 'c1933'
export const APO_VERSION_NAME = '1933年聖公會出版'
export const APO_VERSION_NAME_GB = '1933年圣公会出版'
/** 次經的文本代碼 (chdc 的 HTML 解析之後才做，P3) */
export const APO_VERSIONS = /** @type {const} */ (['c1933', 'chdc'])

/**
 * @typedef {import('./qafAsync.es2023.js').QafRecord} QsubRecord
 * @typedef {import('./qafAsync.es2023.js').QafResult} QsubResult
 */

/**
 * 組 qsub.php 的網址。參數不合法就丟錯 (不打上游)
 * @param {{bid:number, chap:number, sec?:string|number|null, version?:string, gb?:boolean|0|1}} args sec 省略 = 整章
 * @returns {string}
 */
export function qsubUrl({ bid, chap, sec = null, version = APO_VERSION, gb = false }) {
    if (BookRegistry.corpusOf(bid) !== 'apo' || !BookRegistry.has(bid)) throw new Error(`qsub: 不是次經的書卷 id: ${bid}`)
    checkChap(chap, 'qsub')
    if (!APO_VERSIONS.includes(/** @type {any} */ (version))) throw new Error(`qsub: 不認得的文本: ${version}`)
    const params = { bid: String(bid), chap: String(chap), strong: '0' }
    const s = checkSec(sec, 'qsub')
    if (s != null) params.sec = s
    if (version !== APO_VERSION) params.version = version // 預設文本不送，網址與官方寫法一樣
    if (gb) params.gb = '1'
    return `${QSUB_URL}?${new URLSearchParams(params)}`
}

/**
 * 上游回應 → 站內格式 (record 加 book、數字欄位轉數字、補預設譯本名稱)。不改傳入的物件
 * @param {any} json 上游回應
 * @returns {QsubResult}
 */
export function normalizeQsub(json) {
    return normalizeCorpus(json, { label: 'qsub', version: APO_VERSION, v_name: APO_VERSION_NAME })
}

const fetchQsub = makeCachedFetcher(normalizeQsub)

/**
 * 取次經的一章 (或某幾節)。同一章同一文本同一簡繁只打一次，失敗的不留
 * @param {{bid:number, chap:number, sec?:string|number|null, version?:string, gb?:boolean|0|1}} args
 * @returns {Promise<QsubResult>}
 */
export function qsubAsync(args) {
    return fetchQsub(qsubUrl(args))
}
