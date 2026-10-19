/**
 * # 使徒教父 (qaf.php)、次經 (qsub.php) 取經文共用的部分
 *
 * 兩支都是信望愛 /api/ 底下同一種寫法 (docs/z261019a、z261019b)：
 * - 節的格式不合，上游會把 SQL 片段放進 status，所以送出前先擋
 * - `chap=0` 上游當成 `chap=1`，所以章要 ≥ 1
 * - 章不存在時仍回 success、0 筆，不是錯誤
 * - 數字欄位上游有時是數字、有時是字串，統一轉成數字
 */

/** 節的寫法：1、1-5、1,3,5、1-2,5,8-10 */
export const RE_SEC = /^[0-9]+(-[0-9]+)?(,[0-9]+(-[0-9]+)?)*$/

/**
 * 檢查並整理 sec 參數：省略 / 空白 = 整章 (回 null)，不合法丟錯
 * @param {string|number|null|undefined} sec
 * @param {string} label 錯誤訊息的前綴，例如 'qaf'
 * @returns {string|null}
 */
export function checkSec(sec, label) {
    if (sec == null || String(sec).trim() === '') return null
    const s = String(sec).trim()
    if (!RE_SEC.test(s)) throw new Error(`${label}: 節的格式不對: ${sec}`)
    return s
}

/** @param {any} chap @param {string} label */
export function checkChap(chap, label) {
    if (!Number.isInteger(chap) || chap < 1) throw new Error(`${label}: 章要是 1 以上的整數: ${chap}`)
}

/**
 * 上游回應 → 站內格式 (record 加 book、數字欄位轉數字、補預設譯本名稱)。不改傳入的物件
 * @param {any} json 上游回應
 * @param {{label: string, version: string, v_name: string}} opt label 錯誤訊息的前綴；version / v_name 上游沒給時的預設
 */
export function normalizeCorpus(json, { label, version, v_name }) {
    if (json?.status !== 'success') throw new Error(`${label}: ${json?.status ?? '沒有 status'}`)
    const pos = a => (a == null ? null : { book: +a.bid, chap: +a.chap, sec: +a.sec })
    const record = (json.record ?? []).map(r => ({
        book: +r.bid,
        chap: +r.chap,
        sec: +r.sec,
        bible_text: r.bible_text ?? '',
    }))
    return {
        status: /** @type {'success'} */ ('success'),
        version: json.version || version,
        v_name: json.v_name || v_name,
        record_count: record.length,
        record,
        prev: pos(json.prev),
        next: pos(json.next),
    }
}

/**
 * 做一個「同一個網址只打一次、失敗的不留」的取得函式
 * @template T
 * @param {(json: any) => T} normalize
 * @returns {(url: string) => Promise<T>}
 */
export function makeCachedFetcher(normalize) {
    /** @type {Map<string, Promise<T>>} */
    const cache = new Map()
    return url => {
        let p = cache.get(url)
        if (p == null) {
            p = (async () => {
                const { fetchJsonAsync } = await import('./fetchAsync.es2023.js')
                return normalize(await fetchJsonAsync(url, { timeout: 30000 }))
            })()
            cache.set(url, p)
            p.catch(() => cache.delete(url))
        }
        return p
    }
}
