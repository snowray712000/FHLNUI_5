
let matchGlobalWithCapture = matchGlobalWithCaptureEs6Js()
export { matchGlobalWithCapture,matchGlobalWithCaptureEs6Js }

function matchGlobalWithCaptureEs6Js() {
    return matchGlobalWithCapture
    /** 
     * js global 的 exec 我覺得不直覺，所以寫一個 exec global 版的
     * @param {RegExp} reg reg 若非 global 會自動變為 global, 但我不能幫你變, 因為這是唯讀
     * @param {string} str
     * @returns {RegExpExecArray[]}
    */
    function matchGlobalWithCapture(reg, str) {
        if (reg.global == false) {
            throw "reg must global."
        }

        reg.lastIndex = 0 // reset

        var re = []
        /** @type {?RegExpExecArray} **/
        var r1
        while ((r1 = reg.exec(str)) !== null) {
            {
                re.push(r1)
            }
        }

        reg.lastIndex = 0 // reset

        return re
    }
}