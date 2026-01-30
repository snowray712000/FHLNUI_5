import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js"

/**
 * ### 看哪一段包含 addr，就回傳那一段
 * @param {number[]} addr 
 * @returns {number[][]}
 */
export function ai_get_address_chapter(addr, cnt_of_chap=1){
    const book = addr[0]
    const chap = addr[1]
    const sec = addr[2]

    if ( cnt_of_chap == 1 ){
        return BibleConstantHelper.generateAddressesTpF(book, chap).map( a1=> [a1.book, a1.chap, a1.verse])
    }

    // 多章時，要取得本書卷限制
    const book_limit = BibleConstantHelper.getCountChapOfBook(book)
    const end_chap = Math.min( chap + cnt_of_chap - 1, book_limit )
    let result = []
    for( let c = chap; c <= end_chap; c++ ){
        result = result.concat( BibleConstantHelper.generateAddressesTpF(book, c).map( a1=> [a1.book, a1.chap, a1.verse]) )
    }

    return result
}