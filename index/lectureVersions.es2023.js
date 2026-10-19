import { BookRegistry } from './BookRegistry.es2023.js'
import { AF_VERSION } from './qafAsync.es2023.js'
import { APO_VERSION } from './qsubAsync.es2023.js'

/**
 * 閱讀畫面實際顯示的「譯本」代碼。新舊約是使用者選的 ps.version；
 * 使徒教父不是譯本，只有一種文本 (afhuang)，不管選了什麼譯本；
 * 次經目前也只顯示預設文本 c1933 (之後會讓使用者選 c1933 / chdc，docs/z261019b)
 * @param {{bookIndex:number, version:string[]}} ps
 * @returns {string[]}
 */
export function lectureVersions(ps) {
    switch (BookRegistry.corpusOf(ps.bookIndex)) {
        case 'af': return [AF_VERSION]
        case 'apo': return [APO_VERSION]
        default: return ps.version
    }
}
