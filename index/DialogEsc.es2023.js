/**
 * 點對話框的標題列 (通常是為了拖曳移動) 之後，按 Esc 也要能關閉。
 * jQuery UI 1.12.1 的 draggable 在 mousedown 時會把焦點元素 blur (document.activeElement 變 body)，
 * 而 Esc 是 jQuery UI 掛在 .ui-dialog 本身的 keydown (closeOnEscape)：焦點不在對話框裡，Esc 就到不了它，看起來像 bug。
 * 對話框是接在 <body> 下的 .ui-dialog (DialogHtml、交互參照、搜尋、SN 字典、譯本選擇、書卷章...)，統一在這裡處理。
 * 在 document 層 (比 draggable 的 mousedown 晚) 把焦點放回 .ui-dialog (tabindex = -1，可以被 focus，也不畫外框)。
 * 縮放把手 (.ui-resizable-handle) 同理。
 */
$(document).on('mousedown', '.ui-dialog-titlebar, .ui-dialog > .ui-resizable-handle', function (e) {
    if ($(e.target).closest('.ui-dialog-titlebar-close').length > 0) return // 關閉鈕本身會處理
    const ui = $(this).closest('.ui-dialog')[0]
    if (ui != null && !ui.contains(document.activeElement)) ui.focus({ preventScroll: true })
})

/**
 * 全螢幕時，焦點在對話框裡按 Esc：只關對話框，不要連全螢幕一起結束。
 * 瀏覽器預設 Esc 一定會退出全螢幕，keydown 的 preventDefault 擋不住；Chromium 系 (Chrome / Edge) 有 Keyboard Lock API：
 * 全螢幕中 `navigator.keyboard.lock(['Escape'])` 之後，Esc 變成一般按鍵送到頁面 (jQuery UI 才收得到、關掉對話框)，
 * 要退出全螢幕改成「按住 Esc 約 2 秒」或按全螢幕鈕。
 * 只在「全螢幕且焦點在 .ui-dialog 裡」鎖定；對話框關了、焦點離開就解鎖，再按一次 Esc 就照常退出全螢幕 (先關對話框，再退全螢幕)。
 * Safari、Firefox 沒有這個 API，行為不變 (Esc 仍會退出全螢幕)。
 */
const kb = /** @type {any} */ (navigator).keyboard
let isLocked = false
function syncEscLock() {
    if (kb?.lock == null) return
    const d = /** @type {any} */ (document)
    const isFs = !!(d.fullscreenElement ?? d.webkitFullscreenElement)
    const need = isFs && document.activeElement?.closest?.('.ui-dialog') != null
    if (need == isLocked) return
    isLocked = need
    try {
        if (need) kb.lock(['Escape'])?.catch?.(() => { isLocked = false })
        else kb.unlock()
    } catch { isLocked = false }
}
if (kb?.lock != null) {
    document.addEventListener('focusin', syncEscLock)
    document.addEventListener('focusout', () => setTimeout(syncEscLock)) // 焦點正在移動，等落定再判斷
    document.addEventListener('fullscreenchange', syncEscLock)
    document.addEventListener('webkitfullscreenchange', syncEscLock)
    $(document).on('dialogopen dialogclose', () => setTimeout(syncEscLock))
}
