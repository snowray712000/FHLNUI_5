
import { splitStringByRegex } from "./splitStringByRegex.es2023.js"

/** 
 * 將純文字 str, 若裡面存在 hebrew 或 greek 則會用 span 包起來
 * @param {string} str 傳入的資料，包含中文、原文的資料。例如傳入 wform。
 * @returns {string} 回傳 html 資料
*/
export function charHG(str) {
    if (str === undefined) { return str }

    var r1 = splitStringByRegex(str, /([\u0590-\u05fe]+)|([\u0370-\u03ff\u1f00-\u1fff]+)/ig)
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


// (function(root){ 
//     root.charHG = charHG
// })(this)