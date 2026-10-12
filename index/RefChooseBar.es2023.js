import { el } from "./auDom.es2023.js"

/** 同時只會有一條 */
let current = null

/** 收掉目前的選擇列 */
export function closeRefChooseBar() {
    current?.close()
}

/**
 * 點交互參照時，在點擊處旁邊浮出 [預覽] [前往] [?]，取代原本的選擇對話框。
 * 樣式與經文反白後的複製按鈕列 (LecCopyTable) 共用 (.lct-btn)，? 用共用的說明鈕 (.intro-help)。
 * 點空白處、Esc、捲動都會收掉；按鈕按下後先收掉再執行。
 * @param {Element} anchor 點擊的元素，浮在它下方 (放不下改放上方)
 * @param {{ onPreview: () => void, onGoto: () => void, onHelp: () => void }} cb
 */
export function showRefChooseBar(anchor, cb) {
    closeRefChooseBar()

    const pick = fn => () => { close(); setTimeout(fn, 0) }
    const bar = el('div', {
        class: 'ref-choose', role: 'toolbar', 'aria-label': '交互參照',
        onpointerdown: e => e.stopPropagation(), // 不被「點空白收掉」吃掉
    },
        el('button', { type: 'button', class: 'lct-btn', title: '跳出小視窗顯示這段經文，讀經位置不動', onclick: pick(cb.onPreview) }, '預覽'),
        el('button', { type: 'button', class: 'lct-btn', title: '主畫面直接跳到這段經文', onclick: pick(cb.onGoto) }, '前往'),
        // 與搜尋框旁、同源字旁的 ? 同一個 (.intro-help)；開的是這裡自己的說明 (內有「固定用哪一種」的設定)
        el('button', { type: 'button', class: 'intro-help', title: '說明，可設定固定用哪一種', onclick: pick(cb.onHelp) }, '?'),
    )
    document.body.append(bar)
    place()

    const onDown = e => { if (!bar.contains(e.target)) close() }
    const onKey = e => { if (e.key == 'Escape') close() }
    const onScroll = () => close()
    // 開啟這一下的 click / pointerdown 還在傳，晚一點再掛，免得自己被收掉
    const t = setTimeout(() => {
        document.addEventListener('pointerdown', onDown, true)
        document.addEventListener('keydown', onKey, true)
        document.addEventListener('scroll', onScroll, true)
        window.addEventListener('resize', onScroll)
    }, 0)

    function close() {
        clearTimeout(t)
        document.removeEventListener('pointerdown', onDown, true)
        document.removeEventListener('keydown', onKey, true)
        document.removeEventListener('scroll', onScroll, true)
        window.removeEventListener('resize', onScroll)
        bar.remove()
        if (current?.bar == bar) current = null
    }
    current = { bar, close }

    function place() {
        const GAP = 4, M = 8
        const r = anchor.getBoundingClientRect()
        const w = bar.offsetWidth, h = bar.offsetHeight
        let top = r.bottom + GAP
        if (top + h > window.innerHeight - M) top = Math.max(M, r.top - GAP - h)
        let left = r.left + r.width / 2 - w / 2
        left = Math.min(Math.max(M, left), window.innerWidth - w - M)
        bar.style.left = left + 'px'
        bar.style.top = top + 'px'
    }
}
