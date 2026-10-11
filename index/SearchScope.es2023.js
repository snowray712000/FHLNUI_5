/**
 * ### 搜尋範圍的全域設定 (不碰 DOM)
 * 沒有勾任何分類：只搜尋「目前閱讀的書卷」；勾了哪些分類，就也搜尋那些。
 * 勾了大的分類 (例 新約)，包在裡面的小分類 (保羅書信、福音書、路加著作…) 視同勾選，不管它自己有沒有勾。
 * 「包在裡面」不是寫死的，是比對書卷：A 的書卷包含 B 的所有書卷，A 就包含 B (路加著作 ⊂ 福音書 ⊂ 新約)。
 *
 * 分類來自 `fhl.g_book_group` (key 是繁體分類名，value 是 0based ibook[])，其中「整卷聖經」不列出 (全勾就是整卷聖經)。
 *
 * @typedef {Object.<string, number[]>} BookGroup
 * @typedef {{name: string, books: number[], depth: number}} ScopeNode 依樹狀排好 (大分類在前，小分類縮排)
 */

const ALL = '整卷聖經'
const KEY = 'fhlSearchScope'

/**
 * 可勾選的分類，排成樹狀 (深度優先)：舊約 → 摩西五經…；新約 → 福音書 → 路加著作；保羅書信…
 * @param {BookGroup} bookGroup
 * @returns {ScopeNode[]}
 */
export function scopeTree(bookGroup) {
    const nodes = Object.entries(bookGroup).filter(([name]) => name != ALL).map(([name, books]) => ({ name, books }))
    const contains = (a, b) => a != b && a.books.length > b.books.length && b.books.every(x => a.books.includes(x))
    // 上一層：包含它的分類中最小的
    const parentOf = n => nodes.filter(a => contains(a, n)).sort((x, y) => x.books.length - y.books.length)[0] ?? null
    const kids = new Map(nodes.map(n => [n, []]))
    const roots = []
    for (const n of nodes) {
        const p = parentOf(n)
        if (p == null) roots.push(n); else kids.get(p).push(n)
    }
    const byOrder = (a, b) => nodes.indexOf(a) - nodes.indexOf(b) // 同層依 g_book_group 的定義順序 (同作者的分類定義在後面)
    /** @type {ScopeNode[]} */
    const out = []
    const walk = (n, depth) => {
        out.push({ name: n.name, books: n.books, depth })
        kids.get(n).sort(byOrder).forEach(k => walk(k, depth + 1))
    }
    roots.sort(byOrder).forEach(r => walk(r, 0))
    return out
}

/**
 * 實際算勾選的分類：自己勾的，加上被勾選的大分類包含的
 * @param {BookGroup} bookGroup
 * @param {Iterable<string>} checked 使用者自己勾的分類名
 * @returns {Map<string, string | null>} 分類名 → null 是自己勾的；有值是被哪個分類包含 (顯示「含於 新約」)；沒勾的不在裡面
 */
export function effectiveChecked(bookGroup, checked) {
    const tree = scopeTree(bookGroup)
    const own = new Set(checked)
    /** @type {Map<string, string | null>} */
    const out = new Map()
    for (const n of tree) {
        const by = tree.filter(a => own.has(a.name) && a.name != n.name && a.books.length > n.books.length && n.books.every(x => a.books.includes(x)))
            .sort((x, y) => y.books.length - x.books.length)[0]
        if (by != null) out.set(n.name, by.name)
        else if (own.has(n.name)) out.set(n.name, null)
    }
    return out
}

/**
 * 要搜尋的書卷
 * @param {BookGroup} bookGroup
 * @param {Iterable<string>} checked
 * @param {number} ibookCur 目前閱讀的書卷，0based，一定包含
 * @returns {Set<number> | null} null 表示整本聖經 (不必篩)
 */
export function scopeBooks(bookGroup, checked, ibookCur) {
    const books = new Set([ibookCur])
    for (const name of effectiveChecked(bookGroup, checked).keys()) bookGroup[name].forEach(b => books.add(b))
    return books.size >= (bookGroup[ALL]?.length ?? 66) ? null : books
}

/** 沒存過時：全勾 (與有這個設定之前一樣，整本聖經) @param {BookGroup} bookGroup @returns {string[]} 自己勾的分類名 */
export function readScope(bookGroup) {
    const all = scopeTree(bookGroup).map(n => n.name)
    try {
        const v = JSON.parse(localStorage.getItem(KEY))
        if (Array.isArray(v)) return v.filter(name => all.includes(name))
    } catch { /* 無痕等 */ }
    return all
}

/** @param {string[]} checked */
export function writeScope(checked) {
    try { localStorage.setItem(KEY, JSON.stringify(checked)) } catch { /* 不記也能用 */ }
}

/**
 * 目前搜尋範圍的簡短文字，例 `雅＋保羅書信`、`新約`、`整本聖經`
 * @param {BookGroup} bookGroup
 * @param {Iterable<string>} checked
 * @param {number} ibookCur 目前閱讀的書卷
 * @param {string} curName 目前書卷的名稱 (已轉好簡繁)
 * @param {(name: string) => string} [tr] 分類名轉簡繁
 */
export function scopeLabel(bookGroup, checked, ibookCur, curName, tr = s => s) {
    if (scopeBooks(bookGroup, checked, ibookCur) == null) return tr(ALL)
    const eff = effectiveChecked(bookGroup, checked)
    const tops = [...eff].filter(([, by]) => by == null).map(([name]) => tr(name))
    const covered = [...eff.keys()].some(name => bookGroup[name].includes(ibookCur)) // 目前這卷已在勾的分類裡，不必再列
    return [...(covered ? [] : [curName]), ...tops].join('＋')
}

/**
 * 搜尋範圍內的分類 (搜尋結果的篩選按鈕只列這些；自己勾的、被大分類包含的都算)，不含整卷聖經
 * @param {BookGroup} bookGroup
 * @param {Iterable<string>} checked
 * @returns {BookGroup}
 */
export function scopeGroups(bookGroup, checked) {
    return Object.fromEntries([...effectiveChecked(bookGroup, checked).keys()].map(name => [name, bookGroup[name]]))
}
