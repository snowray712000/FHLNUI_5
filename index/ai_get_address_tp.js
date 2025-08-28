import { linq_distinct } from "./linq_es2023.js"
import { ParsingCache } from "./ParsingCache_es2023.js"

/**
 * ### 0: 只需要 w。1: 需要 v。2: 需要 c。3: 需要b。
 * - 產生多節資料時，要先判斷 type，才知道要寫 w1 還是 v1w1 還是其它。
 * @param {number[][]} addrs 
 * @returns {number} 0|1|2|3
 */
export function ai_get_address_tp(addrs) {
    const books = addrs.map(a1 => a1[0])
    if (linq_distinct(books).length > 1) {
        return 3
    }
    const chaps = addrs.map(a1 => a1[1])
    if (linq_distinct(chaps).length > 1) {
        return 2
    }
    const secs = addrs.map(a1 => a1[2])
    if (linq_distinct(secs).length > 1) {
        return 1
    }
    return 0
}