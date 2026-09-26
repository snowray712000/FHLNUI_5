/**
 * ### 依「目前閱讀的書卷」建議搜尋結果要先顯示的範圍
 * 參照 RWD 版 search-result-dialog.component.ts 的 setGroupTabSearchToSuggest
 *
 * 搜尋時，通常最想先知道「同卷書」，再來「同分類」(如保羅書信)，再來「同約」，最後才是「整卷聖經」。
 * - 同卷書筆數夠多 (>= min_count)，就只顯示這卷書
 * - 否則，由小到大找包含此卷的分類，第一個筆數夠多的
 *   (卷數相同時，後定義的優先。例 約翰福音：約翰著作、福音書都是 5 卷，選約翰著作)
 * - 都不夠多，就整卷聖經
 *
 * @param {Object.<number, number>} cnt_of_book 0based ibook → 筆數，例 {58: 12}
 * @param {Object.<string, number[]>} book_group 通常是 fhl.g_book_group，分類名 (繁體) → 0based ibook[]
 * @param {number} ibook 目前閱讀的書卷 0based
 * @param {number} [min_count=10] 筆數至少這麼多，才縮小到這個範圍
 * @returns {{group_name: string, ibook: number | null}} ibook 不為 null 時，表示要選單卷書
 */
export function Search_suggestFilter(cnt_of_book, book_group, ibook, min_count = 10) {
    const ALL = '整卷聖經'
    const count = books => books.reduce((sum, b) => sum + (cnt_of_book[b] ?? 0), 0)

    // 包含此卷的分類，由小到大：同作者/小分類 → 舊約/新約 → 整卷聖經
    const groups = Object.entries(book_group)
        .map(([name, books], order) => ({ name, books, order }))
        .filter(g => g.books.includes(ibook))
        .sort((a, b) => a.books.length - b.books.length || b.order - a.order)
        .map(g => [g.name, g.books])
    if (groups.length === 0) {
        return { group_name: ALL, ibook: null }
    }

    if ((cnt_of_book[ibook] ?? 0) >= min_count) {
        return { group_name: groups[0][0], ibook }
    }

    const group = groups.find(([, books]) => count(books) >= min_count)
    return { group_name: group ? group[0] : ALL, ibook: null }
}
