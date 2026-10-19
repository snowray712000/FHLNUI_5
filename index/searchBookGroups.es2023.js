import { BookRegistry } from './BookRegistry.es2023.js'

/** 搜尋用的書卷分類：分類名 → 書卷類別 (BookRegistry 的 corpus)；順序同畫面 */
export const EXTRA_GROUPS = /** @type {const} */ ([['次經', 'apo'], ['使徒教父', 'af']])

/**
 * 搜尋用的書卷分類：`fhl.g_book_group` (新舊約，static/search_api/fhl_api.js) 加上「次經」「使徒教父」
 * (書卷表載入後才有；0 起算的 ibook = 書卷 id - 1，次經 100–114、使徒教父 200–216)。不改 fhl.g_book_group 本身 (舊式全域)
 * @returns {Object.<string, number[]>}
 */
export function searchBookGroups() {
    const extra = Object.fromEntries(EXTRA_GROUPS
        .map(([name, corpus]) => [name, BookRegistry.ids(corpus).map(id => id - 1)])
        .filter(([, ibooks]) => ibooks.length))
    return Object.keys(extra).length ? { ...fhl.g_book_group, ...extra } : fhl.g_book_group
}
