import { BookRegistry } from './BookRegistry.es2023.js'
import { AF_VERSION } from './qafAsync.es2023.js'

/**
 * 閱讀畫面實際顯示的「譯本」代碼。新舊約是使用者選的 ps.version；
 * 使徒教父不是譯本，只有一種文本 (afhuang)，不管選了什麼譯本
 * @param {{bookIndex:number, version:string[]}} ps
 * @returns {string[]}
 */
export function lectureVersions(ps) {
    return BookRegistry.corpusOf(ps.bookIndex) === 'af' ? [AF_VERSION] : ps.version
}
