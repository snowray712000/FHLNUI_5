/** 
 * 將純文字 str, 若裡面存在 hebrew 或 greek 則會用 span 包起來
 * @param {string} str 傳入的資料，包含中文、原文的資料。例如傳入 wform。
 * @returns {string} 回傳 html 資料
*/
function charHG(str) {
    if (str === undefined) { return str }

    // var r1 = new Ijnjs.SplitStringByRegex().main(str, /([\u0590-\u05fe\- ]+)|([\u0370-\u03ff\u1f00-\u1fff]+)/ig)
    var r1 = new Ijnjs.SplitStringByRegex().main(str, /([\u0590-\u05fe]+)|([\u0370-\u03ff\u1f00-\u1fff]+)/ig)
    if (r1.length == 0) { return str }

    /** @type {string[]} 表示是 html結果*/
    var re = []
    re = r1.map(function (a1, i1) {
        if (a1.exec == null) {
            return a1.w
        } else if (a1.exec[1] != null) {
            return "<span class='hebrew-char'>" + a1.w + "</span>"
        } else {
            return "<span class='greek-char'>" + a1.w + "</span>"
        }
    })

    return re.join('')
}
/** 
* $(".hebrew-char") $(".greek-char") $(".sn") 的 font-size
* 讀取 pageState 資料以設定
* 它在 經文顯示時，最後一步驟會作
* 它在 Parsing工具，也會作
* add by snow. 2021.07
*/
function setFontSizeHebrewGreekStrongNumber() {
    $(".hebrew-char").css("font-size", pageState.fontSizeHebrew + "pt")
    $(".greek-char").css("font-size", pageState.fontSizeGreek + "pt")
    $(".sn").css("font-size", pageState.fontSizeStrongNumber + "pt")
}


(function(root){
    root.setFontSizeHebrewGreekStrongNumber = setFontSizeHebrewGreekStrongNumber
    root.charHG = charHG
})(this)