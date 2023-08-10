/// <reference path="../libs/jsdoc/linq.d.ts" />
/// <reference path="../libs/ijnjs/ijnjs.d.js" />
/// <reference path="../libs/jsdoc/jquery.js" />
/// <reference path="../libs/jsdoc/jquery-ui.js" />
/// <reference path="../libs/jsdoc/jquery.ui.touch-punch.js" />

function coreInfoWindowShowHide(fnCompleted, isShow1, isShow3) {
    /// <summary> 這是為了開發 "記錄上一次設定 左右視窗 寬度 和 顯示與否 功能而整理" </summary>
    /// 在 click 與 resize 事件中會被呼叫
    /// 2021.07 by snow
    if (isShow1 === undefined) {
        isShow1 = $("#fhlLeftWindowControl").hasClass("selected")
    }
    if (isShow3 === undefined) {
        isShow3 = $('#fhlInfoWindowControl').hasClass('selected')
    }

    pageState.isVisibleInfoWindow = isShow3 ? 1 : 0
    pageState.isVisibleLeftWindow = isShow1 ? 1 : 0
    updateLocalStorage()

    if (isShow1) {
        $("#fhlLeftWindowControl").addClass("selected")
    } else {
        $("#fhlLeftWindowControl").removeClass("selected")
    }

    if (isShow3) {
        $('#fhlInfoWindowControl').addClass('selected')
    } else {
        $('#fhlInfoWindowControl').removeClass('selected')
    }

    var sizes = getSizes(isShow1, isShow3)
    sizes.rc3.opacity = isShow3 ? 1 : 0
    sizes.rc1.opacity = isShow1 ? 1 : 0

    var o1 = $("#fhlLeftWindow")
    var o2 = $("#fhlMidWindow")
    var o3 = $("#fhlInfo")
    var o4 = $("#fhlToolBar")
    function isLeftOrWidthNoChange(o, rc) {
        return o.position().left == rc.left && o.width() == rc.width
        // 注意，不能用 o.css("left")，這會是 '12px' 而不是 12
    }
    var isCh1 = isLeftOrWidthNoChange(o1, sizes.rc1);
    var isCh2 = isLeftOrWidthNoChange(o2, sizes.rc2);
    var isCh3 = isLeftOrWidthNoChange(o3, sizes.rc3);
    var isCh4 = isLeftOrWidthNoChange(o4, sizes.rc4);

    if (!isCh1) {
        if (sizes.rc1.width != 0) {
            o1.show()
        }
        o1.animate(sizes.rc1, 400, () => {
            if (sizes.rc1.width == 0) {
                o1.hide()
            }
        })
    }
    if (!isCh3) {
        if (sizes.rc3.width != 0) {
            o3.show()
        }
        o3.animate(sizes.rc3, 400, () => {
            // 若只是 optical 設為 0 ，邊邊的元件還是會被按到，影響結果
            // 像換「下一切」的箭頭就會被擋到 (被 parsing 工具的擋到)
            if (sizes.rc3.width == 0) {
                o3.hide()
            }
        })
    }
    if (!isCh4) {
        if (sizes.rc4.height != undefined) {
            // 窄的時候，高度會變2行
            o4.animate(sizes.rc4, 400)
            $('#help').css('top', '2.25rem')
            $('#windowControl').css('top', '2rem')
            $('#searchTool').css('top', '2rem')
            $('#searchTool').css('max-width', '40%')
            $('#title').contents().first()[0].textContent = "FHL " //太寬會讓 se 擋到 手動更新功能
        } else {
            o4.animate(sizes.rc4, 400)
            o4.css('height', '')
            $('#help').css('top', '')
            $('#windowControl').css('top', '')
            $('#searchTool').css('top', '')
            $('#searchTool').css('max-width', '')
            $('#title').contents().first()[0].textContent = "信望愛聖經工具"
        }
    }

    chnageControlsMaxWidthInToolbar(sizes.rc4)
    // changeSearchInputMaxWidthIfNeed(sizes.rc4)

    o2.animate(sizes.rc2, 400, fnCompleted)

    return // end function
    function chnageControlsMaxWidthInToolbar(rc4) {
        var rc4Width = rc4.width
        // 不只要設定 max-width, 當小到一個程度  還要設它的 padding 與 maring 不然會看不到
        var r1 = $("#windowControl")
        if (r1 === undefined) { return }

        if (testIsChangedMaxWidth(rc4Width)) {
            changeMaxWidth(rc4Width)
        }

        return

        function testIsChangedMaxWidth(rc4Width) {
            var r2 = parseInt(r1.css("max-width")) // 481px 會直接是 481, 若沒有值, 會是 NaN
            if (isNaN(r2)) { return true } // 需要設定一個 max-width

            if (rc4.height != null) {
                return r2 != '40%'
            } else {
                var r3 = Math.round(rc4Width / 4.0)
                return r2 != r3
            }
        }
        function changeMaxWidth(rc4Width) {
            var w = Math.round(rc4Width / 4.0) // max-width 與 buttons 都會用到
            if (rc4.height != null) {
                r1.css('max-width', '40%')
            } else {
                r1.css("max-width", w)
            }

            setBottons()
            if (w < 250) {
                $('#windowControlIcon').hide()
                $('#windowControlButtons').css('left', '0')
            } else {
                $('#windowControlIcon').show()
                $('#windowControlButtons').css('left', '')
            }

            return
            function setBottons() {
                var btns = r1.find("span")
                btns.css(getCss(w))
                function getCss(w) {
                    if (w < 190) {
                        return { padding: "0px 0px 3px", margin: "0px 0px", }
                    }
                    if (w < 250) {
                        return { padding: "0px 3px 3px", margin: "0px 6px", }
                    }
                    return { padding: "0px 7px 3px", margin: "0px 12px", } // 原本
                }
            }
        }
    }
    function changeSearchInputMaxWidthIfNeed(rc4) {
        var rc4Width = rc4.width
        var r1 = $("#searchTool .icon-search-container")
        if (r1 === undefined) { return }

        if (testIsChSearchInputMaxWidth(rc4Width)) {
            chSearchInputMaxWidth(rc4Width)
        }

        return

        function testIsChSearchInputMaxWidth(rc4Width) {
            var r2 = parseInt(r1.css("max-width")) // 481px 會直接是 481, 若沒有值, 會是 NaN
            if (isNaN(r2)) { return true } // 需要設定一個 max-width

            var r3 = Math.round(rc4Width / 4.0)
            return r2 != r3
        }
        function chSearchInputMaxWidth(rc4Width) {
            r1.css("max-width", Math.round(rc4Width / 4.0))
        }
    }

    function getSizes(is1, is3, cx1, cx3) {
        // 為了 "當 info 視窗 縮起來/展開來後" 之類的 animate 參數要用
        makeSureParams() // 確保有 is1, is3, cx1, cx3

        // ui-resizable 的 width = 12
        var wBar = 12
        var wWin = $(window).width()

        // 0: main, 1: left+main, 2:right+main, 3:left+right+main
        var tp = getTp()
        var rc1 = getWin1() // left window
        var rc3 = getWin3() // info window
        var rc2 = getWin2() // mid window
        var rc4 = getWin4() // 上面那條細長的 toolbar (含 search 與 工具按扭的)

        return { rc1, rc2, rc3, rc4 }
        function getTp() {
            // return: 0: main, 1: left+main, 2:right+main, 3:left+right+main
            if (is1 && is3) { return 3; }
            if (is1 == false && is3 == false) { return 0; }
            if (is3 == false) { return 1; }
            return 2;
        }
        function addR(o) {
            // 每個都算 left width, 然後用這2個去算 right
            // 注意, right 的值是 animate 用的，是從右邊 pixel 開始計算
            // 在 getWin1 getWin2 3 4 都會到
            o.right = wWin - o.left - o.width
            return o
        }
        function getWin1() {
            // win1: left windows, 從左到右，依序為 win1 win2 win3 編號
            var isVisibleWin1 = tp != 0 && tp != 2
            if (false == isVisibleWin1) {
                return addR({ width: 0, left: 0 })
            }

            return addR({ width: cx1, left: wBar })
        }
        function getWin3() {
            // win3: info windows, 從左到右，依序為 win1 win2 win3 編號
            var isVisibleWin3 = tp != 0 && tp != 1
            if (false == isVisibleWin3) {
                return addR({ width: 0, left: wWin })
            }

            var w = cx3 > wWin ? wWin - wBar : cx3
            var l = wWin - wBar - w
            return addR({ width: w, left: l })
        }
        function getWin2() {
            // win2: mid windows, 從左到右，依序為 win1 win2 win3 編號
            var l = is1 ? (rc1.left + rc1.width + wBar) : wBar
            var w = is3 ? rc3.left - wBar - l : wWin - wBar - l
            return addR({ width: w, left: l })
        }
        function getWin4() {
            // win4: 上面那條細長的 toolbar 
            // var l = rc2.left
            // var w = wWin - wBar - l
            var l = 12
            var w = wWin - wBar - wBar

            if (wWin < Ijnjs.rem2Px(36)) {
                // 12 rem 帖撒羅尼迦前書：第四章，12 字
                var h = Ijnjs.rem2Px(4)
                return addR({ width: w, left: l, height: h })
            } else {
                return addR({ width: w, left: l })
            }
        }
        function makeSureParams() {
            is1 = is1 == undefined ? $("#fhlLeftWindowControl").hasClass("selected") : is1
            is3 = is3 == undefined ? $("#fhlInfoWindowControl").hasClass("selected") : is3
            cx1 = cx1 == undefined ? pageState.cxLeftWindow : cx1
            cx3 = cx3 == undefined ? pageState.cxInfoWindow : cx3
        }
    }
}

(function (root) {
    root.coreInfoWindowShowHide = coreInfoWindowShowHide
})(this)