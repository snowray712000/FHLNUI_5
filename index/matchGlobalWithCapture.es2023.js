/**
 * 用於執行全域正則表達式的捕獲，並返回所有匹配結果。
 * @param {RegExp} reg - 必須是 global 的正則表達式。(內部不能幫你變, 因為這是唯讀)
 * @param {string} str - 要匹配的字串。
 * @returns {RegExpExecArray[]} - 包含所有匹配結果的陣列。
 * @throws {Error} - 如果正則表達式不是 global，則拋出錯誤。
 * @deprecated - 此函數被新語法 const matches = [...str.matchAll(reg)]; 取代。了
 */
export function matchGlobalWithCapture(reg, str) {
    if (reg.global == false) {
        throw "reg must global."
    }

    reg.lastIndex = 0 // reset

    const re = []
    /** @type {?RegExpExecArray} **/
    let r1
    while ((r1 = reg.exec(str)) !== null) {
        {
            re.push(r1)
        }
    }

    reg.lastIndex = 0 // reset

    return re
}

/**
const reg = /a(b+)/g;
const str = "ab abb abbb";
const matches = [...str.matchAll(reg)];
console.log(matches);
[
  ["ab", "b", index: 0, input: "ab abb abbb", groups: undefined],
  ["abb", "bb", index: 3, input: "ab abb abbb", groups: undefined],
  ["abbb", "bbb", index: 7, input: "ab abb abbb", groups: undefined]
]
 */

// function matchGlobalWithCaptureEs6Js() {
//     return matchGlobalWithCapture
//     /** 
//      * js global 的 exec 我覺得不直覺，所以寫一個 exec global 版的
//      * @param {RegExp} reg reg 若非 global 會自動變為 global, 但我不能幫你變, 因為這是唯讀
//      * @param {string} str
//      * @returns {RegExpExecArray[]}
//     */
//     function matchGlobalWithCapture(reg, str) {
//         if (reg.global == false) {
//             throw "reg must global."
//         }

//         reg.lastIndex = 0 // reset

//         var re = []
//         /** @type {?RegExpExecArray} **/
//         var r1
//         while ((r1 = reg.exec(str)) !== null) {
//             {
//                 re.push(r1)
//             }
//         }

//         reg.lastIndex = 0 // reset

//         return re
//     }
// }