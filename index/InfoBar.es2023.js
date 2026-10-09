/**
 * 右側分頁 (原文解析、註釋) 上下各一列的「前 / 後 [額外按鈕] 標題」工具列，與串珠 (index/tsks/renderTsk.js) 一致：
 * 字與高跟介面大小 (`#fhlInfoContent .toolbar.tsk .btn`)，下面那一列貼底，內容很長捲到底也不必捲回上面才能按下一個。
 * 前 / 後按鈕帶 book / chap / sec 屬性，各分頁用自己的 class (cls) 綁 click。
 */

const BTN = 'btn btn-sm btn-outline-secondary'

/** @param {string} s */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

/**
 * @param {{ prev: {cls: string, addr?: {book:number, chap:number, sec:number} | null}, next: {cls: string, addr?: {book:number, chap:number, sec:number} | null},
 *   extrasHtml?: string, title: string, pos: 'top' | 'bottom' }} o
 * addr 沒給 (第一節 / 最後一節) 就是停用的按鈕，版面不跳動
 * @returns {string} html
 */
export function infoBarHtml(o) {
    const btn = (/** @type {{cls: string, addr?: any}} */ b, /** @type {string} */ text) => b.addr
        ? `<button class="${b.cls} ${BTN}" book="${b.addr.book}" chap="${b.addr.chap}" sec="${b.addr.sec}">${text}</button>`
        : `<button class="${b.cls} ${BTN}" disabled>${text}</button>`
    return `<div class="toolbar tsk info-bar info-bar-${o.pos}">${btn(o.prev, '前')}${btn(o.next, '後')}${o.extrasHtml ?? ''}<button class="btnTitle ${BTN}" tabindex="-1" title="${esc(o.title)}">${esc(o.title)}</button></div>`
}
