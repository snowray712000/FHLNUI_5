/**
 * @typedef {import("./DText.js").DText} DText
 */
//TODO: 未完整重構
/**
* 開發，是在 dict 的資料轉為 dtexts 後，第2步，要轉為 html 時
* @param {DText[]} dtexts 
* @returns {string}
*/
export function cvtDTextsToHtml(dtexts) {
    return cvtDTextsToHtmlRecursive(dtexts)
    /**
     * @param {DText[]} dtexts 
     * @returns {string}
     */
    function cvtDTextsToHtmlRecursive(dtexts) {
        if (dtexts.length == 0) { return "" }

        let re = ""
        for (let a1 of dtexts) {
            if (a1.tpContainer != null || a1.children != null) {
                let re2 = cvtDTextsToHtmlRecursive(a1.children)

                // .idt 是 浸宣字典格式;
                // .bibtext 也是 浸宣字典格式
                if (a1.tpContainer == '<div class="idt">') {
                    re += '<div class="idt">' + re2 + '</div>'
                } else if (a1.tpContainer == '<span class="bibtext">') {
                    re += '<span class="bibtext">' + re2 + '</span>'
                } else if (a1.tpContainer == '<span class="exp">') {
                    re += '<span class="exp">' + re2 + '</span>'                
                } else if (a1.isParenthesesFW == 1){
                    re += '<span class="isParenthesesFW">' + re2 + '</span>'
                } else if (a1.isTitle1 == 1){
                    re += '<div class="isTitle1">' + re2 + '</div>'
                }
                else {
                    re += '<div>' + re2 + '</div>'
                }
            } else {
                if (a1.isBr == 1) {
                    re += "<br/>"
                } else if (a1.isHr == 1) {
                    re += "<hr/>"
                } else if (a1.refAddresses != null) {
                    let tmp = $('<span>', {
                        text: a1.w,
                        class: 'ref',
                    })
                    tmp.attr('addr-data', JSON.stringify(a1.refAddresses))
                    re += tmp[0].outerHTML
                } else if (a1.sn != null){
                    let tmp = $('<span>', {
                        text: a1.w,
                    })

                    // 若有 sn 且有 tp2 才是真正的 .sn, 不然就是 .sn-text
                    if ( a1. tp2 != null ){
                        tmp.addClass('sn')
                    } else {
                        tmp.addClass('sn-text')
                    }
                    tmp.attr('n', a1.tp == 'G' ? "0" : "1")
                    tmp.attr('sn', a1.sn)
                    if (a1.tp != null) tmp.attr('tp', a1.tp)
                    if (a1.tp2 != null) tmp.attr('tp2', a1.tp2) // WTG 時態碼、WAH 標記，SnFilter 要分辨
                    if (a1.isCurly == 1) tmp.addClass('isCurly')

                    re += tmp[0].outerHTML
                } 
                else {                    
                    re += "<span>" + a1.w + "</span>"
                }
            }
        }
        return re
    }
}
