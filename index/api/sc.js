
import { BibleConstantHelper } from '../BibleConstantHelper.es2023.js'

/**
 * 標準化 sc.php 的結果
 * @param {DScResult} joResult
 * @return {DScResultNormalized}
 */
export function normalize_sc_result(joResult) {
    if (joResult.status != 'success') {
        return joResult
    }

    // sc_book, 從 prev 或 next 的 book 先取出來
    const sc_book = parseInt( joResult.prev?.book || joResult.next?.book || 0 )
    // sc_book_name, 從 record[0] 的 book_name 取出來
    const sc_book_name = joResult.record?.[0]?.book_name || ''

    // 讓 prev 和 next 轉成 book
    if ( joResult.prev ) {
        const book = BibleConstantHelper.getBookId(joResult.prev.engs.toLowerCase())
        joResult.prev.book = book
        delete joResult.prev.engs
    }
    if ( joResult.next ){
        const book = BibleConstantHelper.getBookId(joResult.next.engs.toLowerCase())
        joResult.next.book = book
        delete joResult.next.engs
    }

    // 將 record 中的 book_name 移除，因為已經有 sc_book_name 了
    if (joResult?.record?.[0]) {
        delete joResult.record[0].book_name
    }

    joResult.sc_book = sc_book
    joResult.sc_book_name = sc_book_name

    return joResult
}


/**
 * 原始的 sc api 回傳
 * @typedef {Object} DScResult
 * @property {"success"} [status] - 狀態，成功時為 "success"
 * @property {number} record_count - 返回的記錄數量 通常是 1
 * @property {DScRecord[]} [record] - 返回的記錄陣列，通常只有一筆
 * @property {{book: string, chap: number, sec: number, engs: string}} [next]
 * @property {{book: string, chap: number, sec: number, engs: string}} [prev]
 */

/**
 * 標準化後 (在 NUI 中)
 * @typedef {Object} DScResultNormalized
 * @property {"success"} [status] - 狀態，成功時為 "success"
 * @property {number} record_count - 返回的記錄數量 通常是 1
 * @property {DScRecordNormalized[]} [record] - 返回的記錄陣列，通常只有一筆
 * @property {string} sc_book_name - 串珠 註釋 這些
 * @property {number} sc_book - sc.php api 的 book 編號，4 是串珠，3 是註釋 ... 原本存在於 record 與 prev next 中, 但我要用 book 取代 engs 所以拉出來
 * @property {{book: number, chap: number, sec: number}} [next]
 * @property {{book: number, chap: number, sec: number}} [prev]
 */

/**
 * @typedef {Object} DScRecord
 * @property {string} com_text - TSK 的內容
 * @property {string} title - 創世紀 15章2節 到 15章2節 ... 這類的
 * @property {string} book_name - 書名, 例如「串珠」
*/

/**
 * @typedef {Object} DScRecordNormalized
 * @property {string} com_text - TSK 的內容
 * @property {string} title - 創世紀 15章2節 到 15章2節 ... 這類的
*/
