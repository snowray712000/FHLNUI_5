import { BibleConstant } from "./BibleConstant.es2023.js"

/**
 * ### 取得 指定章節，包含後面幾節。
 * - 可能會跨章
 * - 可能會至結束書卷
 * @param {number[]} addr_start [0]: book, [1]: chap, [2]: sec  
 * @param {number} count_sec 要包含後面幾節, 1 就是自己
 * @returns {number[][]} e.g. [[1,1,30],[1,1,31],[1,2,1]]
 */
export function ai_get_limited_address_range(addr_start,count_sec){
    if (count_sec < 1) { return [addr_start]}

    const count_of_chap_of_book = BibleConstant.COUNT_OF_CHAP
    const count_of_sec_of_chap_of_book = BibleConstant.COUNT_OF_VERSE

    let result = [addr_start]
    let book = addr_start[0]
    let chap = addr_start[1]
    let sec = addr_start[2]
    for (let index = 1; index < count_sec; index++) {
        sec = sec + 1

        const limit_sec = count_of_sec_of_chap_of_book[book-1][chap-1] 
        if ( sec > limit_sec ){
            const limit_chap = count_of_chap_of_book[book-1]
            if ( chap + 1 > limit_chap ){
                // 到書卷未了，直接結束
                return result
            }

            chap = chap + 1
            sec = 1
        }
        
        result.push([book, chap, sec])
    }
    return result
}