import { windowAdjust } from "./windowAdjust.es2023.js"

/**
 * 全螢幕：整份文件 (<html>) 進全螢幕，不是只有 #mainWindow。
 * 瀏覽器全螢幕時只畫「全螢幕元素的子孫」；對話框 (jQuery UI dialog)、浮出的選擇列、注腳 popup 都是接在 <body> 下，
 * 若只讓 #mainWindow 全螢幕，它們都會看不到。工具列照舊藏起來 (fhl.css 的 :root:fullscreen)。
 */
const root = () => /** @type {any} */ (document.documentElement)

export function isFullscreen() {
    const d = /** @type {any} */ (document)
    return !!(d.fullscreenElement ?? d.webkitFullscreenElement)
}

export function toggleFullscreen() {
    const d = /** @type {any} */ (document)
    const p = isFullscreen()
        ? (d.exitFullscreen ?? d.webkitExitFullscreen)?.call(d)
        : (root().requestFullscreen ?? root().webkitRequestFullscreen)?.call(root())
    p?.catch?.(() => { }) // 被拒絕 (例如不是使用者動作觸發) 就算了，按鈕狀態由 fullscreenchange 決定
}

/** 進出全螢幕 (含按 Esc 離開)：按鈕狀態跟著、重排版。只需呼叫一次 */
export function watchFullscreen() {
    const onChange = () => {
        $('#fullscreenControl').toggleClass('selected', isFullscreen())
        windowAdjust()
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
}
