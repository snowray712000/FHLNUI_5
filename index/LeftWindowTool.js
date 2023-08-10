(function (root) {
    root.LeftWindowTool = LeftWindowTool
    return 

    function LeftWindowTool() {
        var that = this
        this.getCssForOpenedSetting = function () {
            return { top: '2.5rem', height: 'auto', bottom: '2.5rem', position: 'absolute' }
        }
        this.getCssForClosedSetting = function () {
            return { top: '2.5rem', height: '2rem', bottom: 'auto', position: 'absolute' }
        }
        this.getCssForOpenedHistory = function () {
            return { top: '5.0rem', height: 'auto', bottom: '0rem' }
        }
        this.getCssForClosedHistory = function () {
            return { top: 'auto', height: '2rem', bottom: '0rem' }
        }
        this.getTitleClosedSetting = function () {
            return "▶ " + gbText("設定", pageState.gb)
        }
        this.getTitleOpenedSetting = function () {
            return "▼ " + gbText("設定", pageState.gb)
        }
        this.getTitleClosedHistory = function () {
            return "▶ " + gbText("歷史記錄", pageState.gb)
        }
        this.getTitleOpenedHistory = function () {
            return "▼ " + gbText("歷史記錄", pageState.gb)
        }
        this.isOpenedHistory = function (pthis) {
            return $(pthis).text() == that.getTitleOpenedHistory()
        }
        this.isOpenedSettings = function (pthis) {
            return $(pthis).text() == that.getTitleOpenedSetting()
        }

        /** close setting 就是 open history */
        this.closeSettings = function () {
            var css1 = that.getCssForClosedSetting()
            var css2 = that.getCssForOpenedHistory()
            var title1 = that.getTitleClosedSetting()
            var title2 = that.getTitleOpenedHistory()
            $('#settings').css(css1)
            $('#viewHistory').css(css2)
            $('#settings p').text(title1)
            $('#viewHistory p').text(title2)
        }
        this.openSettings = function () {
            var css1 = that.getCssForOpenedSetting()
            var css2 = that.getCssForClosedHistory()
            var title1 = that.getTitleOpenedSetting()
            var title2 = that.getTitleClosedHistory()
            $('#settings').css(css1)
            $('#viewHistory').css(css2)
            $('#settings p').text(title1)
            $('#viewHistory p').text(title2)
        }
    }
})(this)
