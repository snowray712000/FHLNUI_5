import { TPPageState } from './TPPageState.es2023.js'
import { BibleConstant } from './BibleConstant.es2023.js'

/**
 * active address：使用者「正在讀」的那一節。
 * 查原文字典時，用來把字典內容中「同一節」「同一章」的經文引用高亮起來，
 * 讓使用者一眼看到這個字在此處的用法，被字典歸在哪個義項。
 * @typedef {{book:number, chap:number, verse:number}} DActiveAddr
 */

/**
 * 呼叫端沒給 activeAddr 時的預設值：目前閱讀位置 (ps.bookIndex, ps.chap, ps.sec)
 * @returns {DActiveAddr|null}
 */
export function getDefaultActiveAddr() {
    const ps = TPPageState.s
    return normalizeActiveAddr({ book: ps.bookIndex, chap: ps.chap, verse: ps.sec })
}

/**
 * hover 的 attr 取出來是字串，統一轉 number；不合法回 null
 * @param {{book:any, chap:any, verse?:any, sec?:any}} addr
 * @returns {DActiveAddr|null}
 */
export function normalizeActiveAddr(addr) {
    if (addr == null) return null
    const book = parseInt(addr.book)
    const chap = parseInt(addr.chap)
    const verse = parseInt(addr.verse ?? addr.sec)
    if (!(book >= 1 && book <= 66) || !(chap >= 1)) return null
    return { book, chap, verse: verse >= 1 ? verse : 0 }
}

/**
 * 比對一個 .ref 的地址們與 active address
 * 整章引用 (如 #雅4|，或 雅3:1-5:3 這種跨過整章的範圍) 展開後也會含該節，但那不是在講這一節，視作同一章。
 * @param {{book:number, chap:number, verse:number}[]} addrs span.ref 的 addr-data (範圍已展開成逐節)
 * @param {DActiveAddr} act
 * @returns {0|1|2} 2: 同一節; 1: 同一章 (節不同，或整章引用); 0: 無關
 */
export function matchLevel(addrs, act) {
    if (!Array.isArray(addrs) || act == null) return 0
    let cntSameChap = 0
    let isVerseHit = false
    for (const a of addrs) {
        if (a == null || a.book != act.book || a.chap != act.chap) continue
        cntSameChap++
        if (act.verse != 0 && a.verse == act.verse) isVerseHit = true
    }
    if (cntSameChap == 0) return 0
    if (!isVerseHit) return 1
    const cntVerseOfChap = BibleConstant.COUNT_OF_VERSE[act.book - 1]?.[act.chap - 1] ?? 0
    const isWholeChap = cntVerseOfChap > 1 && cntSameChap >= cntVerseOfChap
    return isWholeChap ? 1 : 2
}

/**
 * 把 $root 中的 span.ref 依 active address 加上 .ref-act-verse (同節) 或 .ref-act-chap (同章)。
 * @param {JQuery<HTMLElement>} $root
 * @param {DActiveAddr|null} act
 * @returns {HTMLElement|null} 最該被看到的那個 (第一個同節，否則第一個同章)，給捲動用
 */
export function highlightActiveRefs($root, act) {
    if (act == null) return null
    let firstVerse = null
    let firstChap = null
    $root.find('.ref[addr-data]').each((i, el) => {
        let addrs
        try { addrs = JSON.parse(el.getAttribute('addr-data')) } catch { return }
        const level = matchLevel(addrs, act)
        if (level == 2) {
            el.classList.add('ref-act-verse')
            firstVerse ??= el
        } else if (level == 1) {
            el.classList.add('ref-act-chap')
            firstChap ??= el
        }
    })
    return firstVerse ?? firstChap
}

/**
 * 若 el 不在 scroller 可視範圍內，就捲到約上方 1/3 處 (只捲 dialog 本身，不動整頁)
 * @param {HTMLElement} scroller
 * @param {HTMLElement|null} el
 */
export function scrollRefIntoView(scroller, el) {
    if (scroller == null || el == null) return
    const rs = scroller.getBoundingClientRect()
    const re = el.getBoundingClientRect()
    if (re.top >= rs.top && re.bottom <= rs.bottom) return
    scroller.scrollTop += re.top - rs.top - scroller.clientHeight / 3
}
