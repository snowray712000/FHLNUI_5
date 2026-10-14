/**
 * 視窗大小改變 (縮放視窗、進出全螢幕、旋轉) 時，開著的 jQuery UI 對話框重算位置與大小。
 * - 一般改變大小：太大就縮到放得進視窗，跑出視窗外的拉回來；其餘不動
 * - 進出全螢幕：視窗大小一下變很多，位置與大小照視窗的比例縮放 (進去變大、退出縮回來)，再拉回視窗內
 * 對話框是接在 <body> 下的 .ui-dialog (DialogHtml、譯本選擇、書卷章、版本資訊...)，統一在這裡處理，不必每種各寫一份。
 */
const M = 8 // 離視窗邊緣至少多少 px

let lastW = window.innerWidth
let lastH = window.innerHeight
/** 剛進出全螢幕：下一次 resize 時按視窗比例縮放對話框 */
let scaleNext = false
let timer = 0

function fitDialogs() {
    const w = window.innerWidth, h = window.innerHeight
    const kx = scaleNext ? w / lastW : 1
    const ky = scaleNext ? h / lastH : 1
    scaleNext = false
    lastW = w; lastH = h

    $('.ui-dialog:visible').each((_, ui) => {
        const $ui = $(ui)
        const r = ui.getBoundingClientRect()

        // 拖曳放大的上限跟著視窗 (不動 dialog 的 maxWidth / maxHeight 選項：改了 jQuery UI 會重算高度，變回自動)
        try { $ui.resizable('option', 'maxWidth', w - 2 * M); $ui.resizable('option', 'maxHeight', h - 2 * M) } catch { /* 不可調整的對話框 */ }

        const nw = Math.min(w - 2 * M, Math.round(r.width * kx))
        // 高度：使用者拖過 / 設過 (有 inline height) 才縮放；自動高度的只在放不進視窗時限制
        const fixedH = !!ui.style.height && ui.style.height != 'auto'
        const nh = Math.min(h - 2 * M, fixedH ? Math.round(r.height * ky) : r.height)
        if (Math.abs(nw - r.width) >= 1) $ui.outerWidth(nw)
        if (Math.abs(nh - r.height) >= 1) $ui.outerHeight(nh)

        // 位置：縮放時中心點照比例，否則維持左上角；再拉回視窗內
        const r2 = ui.getBoundingClientRect()
        let left = scaleSafe(kx != 1, (r.left + r.width / 2) * kx - r2.width / 2, r.left)
        let top = scaleSafe(ky != 1, (r.top + r.height / 2) * ky - r2.height / 2, r.top)
        left = Math.max(M, Math.min(left, w - r2.width - M))
        top = Math.max(M, Math.min(top, h - r2.height - M))
        const dx = left - r2.left, dy = top - r2.top
        if (Math.abs(dx) >= 1) $ui.css('left', (parseFloat($ui.css('left')) || 0) + dx)
        if (Math.abs(dy) >= 1) $ui.css('top', (parseFloat($ui.css('top')) || 0) + dy)
    })
}
/** @template T @param {boolean} cond @param {T} a @param {T} b */
const scaleSafe = (cond, a, b) => cond ? a : b

function schedule() {
    clearTimeout(timer)
    timer = setTimeout(fitDialogs, 120)
}

// fullscreenchange 比 resize 早 (mac 的全螢幕動畫要幾百 ms，resize 在動畫結束才來，innerWidth 也才變)，
// 所以只記旗標，真正的計算等 resize (debounce) 之後；視窗大小剛好沒變、一直沒有 resize 就不縮放，旗標 2 秒後作廢
let flagTimer = 0
function onFullscreenChange() {
    scaleNext = true
    clearTimeout(flagTimer)
    flagTimer = setTimeout(() => { scaleNext = false }, 2000)
}
window.addEventListener('resize', schedule)
document.addEventListener('fullscreenchange', onFullscreenChange)
document.addEventListener('webkitfullscreenchange', onFullscreenChange)
