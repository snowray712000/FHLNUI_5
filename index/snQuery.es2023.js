/**
 * ### SN 搜尋的多項查詢 (不碰 DOM、不碰 API)
 * - or：`or` `OR` `,` `;` `|` (含全形 `，` `；` `｜` `、`)
 * - and：空白、`and` `AND` `&` (`＆`)
 * - not：`not` `NOT` `!` (`！`)，放在要排除的 SN 前面，例 `G3114 not G3115`
 * - 範圍：`G3114-G3120` (`-` `–` `—` `~` 皆可)，等於這段每一個 SN 都 or
 * - 優先順序：not、範圍 > and > or。`G1 G2 or G3` = (G1 且 G2) 或 G3；`G1 not G2` = 有 G1 且沒有 G2
 *
 * @typedef {{sn: string, isOld: boolean | null}} SnTerm sn 例 `80` `652a`；isOld 寫了 H 是 true，寫了 G 是 false，沒寫是 null (依目前閱讀的書卷)
 * @typedef {{terms: SnTerm[], not: boolean}} SnItem 一個條件：terms 內是 or (單一 SN 只有一個，範圍有多個)；not 是排除
 * @typedef {SnItem[]} SnGroup 一組 and，群組之間是 or
 */

/** 範圍最多展開幾個 (超過的截掉，由呼叫端檢查總數、顯示「太多」) */
export const MAX_RANGE = 200

const OR_SEP = /\s*(?:[,;|，；｜、]|(?<![A-Za-z])or(?![A-Za-z]))\s*/i
const AND_SEP = /\s*(?:[&＆]|(?<![A-Za-z])and(?![A-Za-z]))\s*|\s+/i
const NOT_MARK = '\u0001'
const NOT_WORD = /(?<![A-Za-z])not(?![A-Za-z])|[!！]/gi
const RANGE_DASH = /\s*([-–—~～－])\s*/g
const TERM = /^([GH])?(\d+[a-z]?)$/i
const RANGE = /^([GH])?(\d+)[-–—~～－]([GH])?(\d+)$/i

const norm = digits => `${parseInt(digits)}${digits.replace(/^\d+/, '')}`

/**
 * @param {string} text
 * @returns {SnGroup[] | null} 外層 or、內層 and；不是 SN 查詢 (有任何一項不是 SN) 時為 null
 */
export function parseSnQuery(text) {
    const groups = []
    for (const part of text.trim().split(OR_SEP)) {
        const tokens = part.replace(RANGE_DASH, '$1').replace(NOT_WORD, ` ${NOT_MARK} `).split(AND_SEP).filter(s => s.length > 0)
        if (tokens.length == 0) continue // 例如結尾多一個逗號
        const items = []
        let not = false
        for (const token of tokens) {
            if (token == NOT_MARK) { not = true; continue }
            const terms = parseTerms(token)
            if (terms == null) return null
            items.push({ terms, not })
            not = false
        }
        if (not) return null // not 後面沒有東西
        groups.push(items)
    }
    return groups.length == 0 ? null : groups
}

/** @returns {SnTerm[] | null} */
function parseTerms(token) {
    let m = TERM.exec(token)
    if (m != null) {
        if (/^0+$/.test(m[2])) return null // 00000 會造成卡死 2015.08.01
        return [{ sn: norm(m[2]), isOld: m[1] == null ? null : m[1].toUpperCase() == 'H' }]
    }
    m = RANGE.exec(token)
    if (m == null) return null
    const from = parseInt(m[2]), to = parseInt(m[4])
    if (from == 0 || to < from) return null
    if (m[3] != null && m[1] != null && m[3].toUpperCase() != m[1].toUpperCase()) return null // G3114-H3120
    const g = m[1] ?? m[3] // 後面寫了 G / H 前面沒寫也算
    const isOld = g == null ? null : g.toUpperCase() == 'H'
    const terms = []
    for (let n = from; n <= to && terms.length <= MAX_RANGE; n++) terms.push({ sn: String(n), isOld })
    return terms
}

/** @param {SnGroup[]} groups @returns {SnTerm[]} 所有用到的 SN (含重複) */
export function termsOf(groups) {
    return groups.flatMap(items => items.flatMap(item => item.terms))
}

/** @param {SnGroup[]} groups @throws 一組裡只有 not (「不要 G3115」本身沒有意義) */
export function assertSnQuery(groups) {
    if (groups.some(items => items.every(item => item.not))) throw new Error('not 前面要有一個 SN，例如 G3114 not G3115')
}

/** @param {SnGroup[]} groups @returns {SnTerm[]} 搜尋結果要標示的 SN (不含 not 的) */
export function positiveTermsOf(groups) {
    return groups.flatMap(items => items.filter(item => !item.not).flatMap(item => item.terms))
}

/**
 * 依 and / or / not 組合各 SN 的結果
 * @template {{ibook: number, chap: number, sec: number}} T
 * @param {SnGroup[]} groups
 * @param {(term: SnTerm) => T[]} getAddrs 一個 SN 的結果
 * @returns {T[]} 未排序，節不重複
 * @throws 一組裡只有 not
 */
export function combineSnResults(groups, getAddrs) {
    assertSnQuery(groups)
    const keyOf = a => `${a.ibook}:${a.chap}:${a.sec}`
    const unionOf = terms => new Map(terms.flatMap(term => getAddrs(term).map(a => [keyOf(a), a])))
    /** @type {Map<string, T>} */
    const union = new Map()
    for (const items of groups) {
        const positives = items.filter(item => !item.not)
        let inter = null
        for (const item of positives) {
            const cur = unionOf(item.terms)
            inter = inter == null ? cur : new Map([...inter].filter(([k]) => cur.has(k)))
            if (inter.size == 0) break
        }
        for (const item of items.filter(item => item.not)) {
            if (inter.size == 0) break
            const ex = unionOf(item.terms)
            inter = new Map([...inter].filter(([k]) => !ex.has(k)))
        }
        for (const [k, a] of inter) union.set(k, a)
    }
    return [...union.values()]
}
