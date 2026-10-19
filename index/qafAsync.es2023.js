import { BookRegistry } from './BookRegistry.es2023.js'

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
 */

export const QAF_URL = 'https://bible.fhl.net/api/qaf.php'
export const AF_VERSION = 'afhuang'
export const AF_VERSION_NAME = '黃錫木主編《使徒教父著作》'

/** 節的寫法：1、1-5、1,3,5、1-2,5,8-10。不合的送出去，上游會把 SQL 片段放進 status，所以先擋 */
const RE_SEC = /^[0-9]+(-[0-9]+)?(,[0-9]+(-[0-9]+)?)*$/

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
    if (!Number.isInteger(chap) || chap < 1) throw new Error(`qaf: 章要是 1 以上的整數: ${chap}`)
    const params = { bid: String(bid), chap: String(chap), strong: '0' }
    if (sec != null && String(sec).trim() !== '') {
        const s = String(sec).trim()
        if (!RE_SEC.test(s)) throw new Error(`qaf: 節的格式不對: ${sec}`)
        params.sec = s
    }
    return `${QAF_URL}?${new URLSearchParams(params)}`
}

/**
 * 上游回應 → 站內格式 (record 加 book、數字欄位轉數字、補預設譯本名稱)。不改傳入的物件
 * @param {any} json 上游回應
 * @returns {QafResult}
 */
export function normalizeQaf(json) {
    if (json?.status !== 'success') throw new Error(`qaf: ${json?.status ?? '沒有 status'}`)
    const pos = a => (a == null ? null : { book: +a.bid, chap: +a.chap, sec: +a.sec })
    const record = (json.record ?? []).map(r => ({
        book: +r.bid,
        chap: +r.chap,
        sec: +r.sec,
        bible_text: r.bible_text ?? '',
    }))
    return {
        status: 'success',
        version: json.version || AF_VERSION,
        v_name: json.v_name || AF_VERSION_NAME,
        record_count: record.length,
        record,
        prev: pos(json.prev),
        next: pos(json.next),
    }
}

/** @type {Map<string, Promise<QafResult>>} 同一章只打一次；失敗的不留 */
const cache = new Map()

/**
 * 取使徒教父的一章 (或某幾節)
 * @param {{bid:number, chap:number, sec?:string|number|null}} args
 * @returns {Promise<QafResult>}
 */
export function qafAsync(args) {
    const url = qafUrl(args)
    let p = cache.get(url)
    if (p == null) {
        p = (async () => {
            const { fetchJsonAsync } = await import('./fetchAsync.es2023.js')
            return normalizeQaf(await fetchJsonAsync(url, { timeout: 30000 }))
        })()
        cache.set(url, p)
        p.catch(() => cache.delete(url))
    }
    return p
}
