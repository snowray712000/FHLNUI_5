import { BookRegistry } from './BookRegistry.es2023.js'

/**
 * 搜尋用的書卷分類：`fhl.g_book_group` (新舊約，static/search_api/fhl_api.js) 加上「使徒教父」
 * (書卷表載入後才有；0 起算的 ibook = 書卷 id - 1，200–216)。不改 fhl.g_book_group 本身 (舊式全域)
 * @returns {Object.<string, number[]>}
 */
export function searchBookGroups() {
    const af = BookRegistry.ids('af').map(id => id - 1)
    return af.length ? { ...fhl.g_book_group, 使徒教父: af } : fhl.g_book_group
}
