import { BookRegistry } from './BookRegistry.es2023.js'
import { AF_VERSION } from './qafAsync.es2023.js'
import { APO_VERSION, isApoVersion } from './qsubAsync.es2023.js'

/** 新舊約沒有選到任何譯本時 (例如只選了次經的文本) 用的 */
const DEFAULT_CANON_VERSION = 'unv'

/**
 * `ps.version` 裡屬於新舊約的譯本。次經的文本 (c1933、chdc) 也放在 ps.version (譯本選擇對話框「次經」分類)，
 * 但它們只在讀次經時有資料；讀新舊約、做新舊約的查詢 (搜尋、交互參照、AI…) 時要拿掉，否則會去 qsb.php 問不存在的譯本。
 * 拿掉後沒有剩下就用和合本
 * @param {string[]} versions 通常是 ps.version
 * @returns {string[]}
 */
export function canonVersions(versions) {
    const r = (versions ?? []).filter(v => !isApoVersion(v))
    return r.length ? r : [DEFAULT_CANON_VERSION]
}

/**
 * ps.version 裡屬於次經的文本 (依 ps.version 的順序)；沒有選就是預設文本 c1933
 * @param {string[]} versions
 * @returns {string[]}
 */
export function apoVersionsOf(versions) {
    const r = (versions ?? []).filter(isApoVersion)
    return r.length ? [...new Set(r)] : [APO_VERSION]
}

/**
 * 閱讀畫面實際顯示的「譯本」代碼。
 * - 新舊約：使用者選的 ps.version (拿掉次經的文本，見 canonVersions)
 * - 使徒教父：不是譯本，只有一種文本 (afhuang)，不管選了什麼譯本
 * - 次經：使用者選的次經文本 (c1933、chdc，可以並排)，沒選就 c1933；新舊約的譯本不並排 (沒有次經的資料)
 * @param {{bookIndex:number, version:string[]}} ps
 * @returns {string[]}
 */
export function lectureVersions(ps) {
    switch (BookRegistry.corpusOf(ps.bookIndex)) {
        case 'af': return [AF_VERSION]
        case 'apo': return apoVersionsOf(ps.version)
        default: return canonVersions(ps.version)
    }
}
