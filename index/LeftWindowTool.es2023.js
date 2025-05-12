import { TPPageState } from "./TPPageState.es2023.js";

export class LeftWindowTool {
    static #s = null
    /**
     * @returns {LeftWindowTool}
     */
    static get s() { if (this.#s == null) this.#s = new LeftWindowTool(); return this.#s }

    getCssForOpenedSetting() {
        return { top: '2.5rem', height: 'auto', bottom: '2.5rem', position: 'absolute' }
    }
    getCssForClosedSetting() {
        return { top: '2.5rem', height: '2rem', bottom: 'auto', position: 'absolute' }
    }
    getCssForOpenedHistory() {
        return { top: '5.0rem', height: 'auto', bottom: '0rem' }
    }
    getCssForClosedHistory() {
        return { top: 'auto', height: '2rem', bottom: '0rem' }
    }
    getTitleClosedSetting() {
        return "▶ " + gbText("設定", TPPageState.s.gb)
    }
    getTitleOpenedSetting() {
        return "▼ " + gbText("設定", TPPageState.s.gb)
    }
    getTitleClosedHistory() {
        return "▶ " + gbText("歷史記錄", TPPageState.s.gb)
    }
    getTitleOpenedHistory() {
        return "▼ " + gbText("歷史記錄", TPPageState.s.gb)
    }
    // ViewHistory 會用到
    isOpenedHistory(pthis) {
        return $(pthis).text() == this.getTitleOpenedHistory()
    }
    // Settings 會用到
    isOpenedSettings(pthis) {
        return $(pthis).text() == this.getTitleOpenedSetting()
    }

    /** close setting 就是 open history */
    closeSettings() {
        var css1 = this.getCssForClosedSetting()
        var css2 = this.getCssForOpenedHistory()
        var title1 = this.getTitleClosedSetting()
        var title2 = this.getTitleOpenedHistory()
        $('#settings').css(css1)
        $('#viewHistory').css(css2)
        $('#settings p').text(title1)
        $('#viewHistory p').text(title2)
    }
    openSettings() {
        var css1 = this.getCssForOpenedSetting()
        var css2 = this.getCssForClosedHistory()
        var title1 = this.getTitleOpenedSetting()
        var title2 = this.getTitleClosedHistory()
        $('#settings').css(css1)
        $('#viewHistory').css(css2)
        $('#settings p').text(title1)
        $('#viewHistory p').text(title2)
    }
}

// (function (root) {
//     root.LeftWindowTool = LeftWindowTool
//     return

//     function LeftWindowTool() {
//         var that = this
//         this.getCssForOpenedSetting = function () {
//             return { top: '2.5rem', height: 'auto', bottom: '2.5rem', position: 'absolute' }
//         }
//         this.getCssForClosedSetting = function () {
//             return { top: '2.5rem', height: '2rem', bottom: 'auto', position: 'absolute' }
//         }
//         this.getCssForOpenedHistory = function () {
//             return { top: '5.0rem', height: 'auto', bottom: '0rem' }
//         }
//         this.getCssForClosedHistory = function () {
//             return { top: 'auto', height: '2rem', bottom: '0rem' }
//         }
//         this.getTitleClosedSetting = function () {
//             return "▶ " + gbText("設定", pageState.gb)
//         }
//         this.getTitleOpenedSetting = function () {
//             return "▼ " + gbText("設定", pageState.gb)
//         }
//         this.getTitleClosedHistory = function () {
//             return "▶ " + gbText("歷史記錄", pageState.gb)
//         }
//         this.getTitleOpenedHistory = function () {
//             return "▼ " + gbText("歷史記錄", pageState.gb)
//         }
//         this.isOpenedHistory = function (pthis) {
//             return $(pthis).text() == that.getTitleOpenedHistory()
//         }
//         this.isOpenedSettings = function (pthis) {
//             return $(pthis).text() == that.getTitleOpenedSetting()
//         }

//         /** close setting 就是 open history */
//         this.closeSettings = function () {
//             var css1 = that.getCssForClosedSetting()
//             var css2 = that.getCssForOpenedHistory()
//             var title1 = that.getTitleClosedSetting()
//             var title2 = that.getTitleOpenedHistory()
//             $('#settings').css(css1)
//             $('#viewHistory').css(css2)
//             $('#settings p').text(title1)
//             $('#viewHistory p').text(title2)
//         }
//         this.openSettings = function () {
//             var css1 = that.getCssForOpenedSetting()
//             var css2 = that.getCssForClosedHistory()
//             var title1 = that.getTitleOpenedSetting()
//             var title2 = that.getTitleClosedHistory()
//             $('#settings').css(css1)
//             $('#viewHistory').css(css2)
//             $('#settings p').text(title1)
//             $('#viewHistory p').text(title2)
//         }
//     }
// })(this)
