/// <reference path="./DText.d.ts" />
/// <reference path="./../libs/jsdoc/jquery.js" />

let cvtDTextsToHtml = cvtDTextsToHtmlEs6Js()
export {cvtDTextsToHtmlEs6Js, cvtDTextsToHtml }

function cvtDTextsToHtmlEs6Js() {
    return cvtDTextsToHtml
    /**
 * 開發，是在 dict 的資料轉為 dtexts 後，第2步，要轉為 html 時
 * @param {DText[]} dtexts 
 * @returns {string}
 */
    function cvtDTextsToHtml(dtexts) {
        return cvtDTextsToHtmlRecursive(dtexts)
        return
        /**
         * 
         * @param {DText[]} dtexts 
         * @returns {string}
         */
        function cvtDTextsToHtmlRecursive(dtexts) {
            if (dtexts.length == 0) { return "" }

            let re = ""
            for (let a1 of dtexts) {
                if (a1.tpContainer != null) {
                    let re2 = cvtDTextsToHtmlRecursive(a1.children)

                    if (a1.tpContainer == '<div class="idt">') {
                        re += '<div class="idt">' + re2 + '</div>'
                    } else if (a1.tpContainer == '<span class="bibtext">') {
                        re += '<span class="bibtext">' + re2 + '</span>'
                    } else if (a1.tpContainer == '<span class="exp">') {
                        re += '<span class="exp">' + re2 + '</span>'
                    } else {
                        re += '<div>' + re2 + '</div>'
                    }
                } else {
                    if (a1.isBr == 1) {
                        re += "<br/>"
                    } else if (a1.refAddresses != null) {
                        let tmp = $('<span>', {
                            text: a1.w,
                            class: 'ref',
                        })
                        tmp.attr('data-addrs', JSON.stringify(a1.refAddresses))
                        re += tmp[0].outerHTML
                    } else {
                        re += "<span>" + a1.w + "</span>"
                    }
                }
            }
            return re
        }
    }
}

