import { BookRegistry } from './BookRegistry.es2023.js'
import { checkSec, checkChap, normalizeCorpus, makeCachedFetcher } from './corpusApi.es2023.js'

/**
 * # 使徒教父經文：信望愛 qaf.php (黃錫木主編《使徒教父著作》，版本代碼 afhuang)
 * 規畫與上游行為見 docs/z261019a
 *
 * - 網址是 /api/qaf.php (注意 api)；`/json/qaf.php` 不認 bid，永遠回革利免一書
 * - bid 就是站內書卷 id (201–217)
 * - 章不存在時上游仍回 success、0 筆 (不是錯誤)
 * - `chap=0` 上游當成 `chap=1`，所以不能拿來取導論
 * - 有些章只有一個沒編號的段落 (sec=0)
 * - 數字欄位上游有時是數字、有時是字串，這裡統一轉成數字
 * - 與次經 (qsubAsync) 共用的檢查與正規化在 corpusApi.es2023.js
 */

export const QAF_URL = 'https://bible.fhl.net/api/qaf.php'
export const AF_VERSION = 'afhuang'
export const AF_VERSION_NAME = '黃錫木主編《使徒教父著作》'

/**
 * @typedef {Object} QafRecord
 * @property {number} book 站內書卷 id (= bid)
 * @property {number} chap
 * @property {number} sec 0 = 沒編號的段落
 * @property {string} bible_text
 * @typedef {Object} QafResult
 * @property {'success'} status
 * @property {string} version afhuang
 * @property {string} v_name
 * @property {number} record_count
 * @property {QafRecord[]} record
 * @property {{book:number, chap:number, sec:number}|null} prev
 * @property {{book:number, chap:number, sec:number}|null} next
 */

/**
 * 組 qaf.php 的網址。參數不合法就丟錯 (不打上游)
 * @param {{bid:number, chap:number, sec?:string|number|null}} args sec 省略 = 整章
 * @returns {string}
 */
export function qafUrl({ bid, chap, sec = null }) {
    if (BookRegistry.corpusOf(bid) !== 'af' || !BookRegistry.has(bid)) throw new Error(`qaf: 不是使徒教父的書卷 id: ${bid}`)
    checkChap(chap, 'qaf')
    const params = { bid: String(bid), chap: String(chap), strong: '0' }
    const s = checkSec(sec, 'qaf')
    if (s != null) params.sec = s
    return `${QAF_URL}?${new URLSearchParams(params)}`
}

/**
 * 上游回應 → 站內格式 (record 加 book、數字欄位轉數字、補預設譯本名稱)。不改傳入的物件
 * @param {any} json 上游回應
 * @returns {QafResult}
 */
export function normalizeQaf(json) {
    return normalizeCorpus(json, { label: 'qaf', version: AF_VERSION, v_name: AF_VERSION_NAME })
}

const fetchQaf = makeCachedFetcher(normalizeQaf)

/**
 * 取使徒教父的一章 (或某幾節)。同一章只打一次，失敗的不留
 * @param {{bid:number, chap:number, sec?:string|number|null}} args
 * @returns {Promise<QafResult>}
 */
export function qafAsync(args) {
    return fetchQaf(qafUrl(args))
}
