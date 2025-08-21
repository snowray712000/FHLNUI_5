/// <reference path="./fhlParsing.d.ts" />

import { charHG } from "./charHG.es2023.js"
import { ParsingCache } from "./ParsingCache_es2023.js"

// type ParsingItem = {
//     /** 在這一節，是第幾個，0，就是文字，0之外就是用在表格 */
//     wid: number;
//     /** Strong Number */
//     sn: string;
//     /** 文字，就是經文出現的樣子 */
//     word: string;
//     /** 詞性，只有新約會有 */
//     pro: string;
//     /** 字彙分析，就是 陰性 複數 那些分析 */
//     wform: string;
//     /** 原型，就是經文的原型 */
//     orig: string;
//     /** 原型簡義，就是經文的原型簡義 */
//     exp: string;
//     /** 備註 */
//     remark: string;
// }

function render_sn_span(one_item, tpHG) {
    // ### <span><span.item-title>SN:</span.sn[sn][tp]> 9003</span>
    const result = $("<span></span>")
    const title = $("<span></span>").addClass('item-title').text('SN: ')
    result.append(title)

    let sn = get_sn_shorter(one_item.sn)
    let snSpan = $("<span></span>")
    snSpan.addClass('parsingTableSn sn')
    snSpan.attr('N', tpHG=='H' ? 1 : 0) // N = 1 for Hebrew, 0 for Greek
    // snSpan.attr('k', sn)
    snSpan.attr('sn', sn)
    snSpan.attr('tp', tpHG)
    snSpan.text(sn)
    result.append(snSpan)
    return result
}
function render_word_span(one_item, tpHG) {
    const result = $("<span></span>")

    // - <span.item-title>原文字: </span>
    $("<span></span>").addClass('item-title').text('原文字: ').appendTo(result)
    // - <span class='hebrew-char' or 'greek-char'>原文字</span>
    const orig_class = tpHG == 'H' ? 'hebrew-char' : 'greek-char'
    $("<span></span>").addClass(orig_class).text(one_item.word).appendTo(result)

    return result
}

/**
 * render parsing 工具，下半部的 table
 * 從 fhlInfoContent 中被提取的程式碼
 * @param {IDParsingResult} jsonObj 
 * @param {'H'|'G'} tp
 * @returns {string} 
 */
export function parsing_render_bottom_table(jsonObj, tp) {
    const N = tp == 'H' ? 1 : 0
    // - 韋式 聯式，是新約才有
    // - .greek_w .greek_u
    const wid_of_w = tp == 'H' ? [] : ParsingCache.s.get_wu_wids('w')
    const wid_of_u = tp == 'H' ? [] : ParsingCache.s.get_wu_wids('u')
    const wid_of_plus = tp == 'H' ? [] : ParsingCache.s.get_plus_wids()

    // 太1:9, 3:2 是特例
    // 瑪拉基書 4:5 是特例
    let div_parsingTable = $("<div id='parsingTable'></div>")
    for (let i = 1; i < jsonObj.record.length; i++) {
        const r = jsonObj.record[i]
        const wid = r.wid
        // - 是 + 則略過
        if (wid_of_plus.includes(wid)) {
            continue
        }

        let divOne = $("<div></div>")
        divOne.attr('wid', wid)

        // 交錯顏色
        // 韋: 黃色 #ffff99 聯 #ffcccc: 這是按最古老系統顏色
        if (wid_of_w.includes(wid)) {
            divOne.addClass('greek_w')
        } else if (wid_of_u.includes(wid)) {
            divOne.addClass('greek_u')
        } else {
            let clrstr = i % 2 == 0 ? 'background-color: lightgrey;' : 'white'
            divOne.attr('style', clrstr)
        }

        // 空白字元
        const white_char = "&nbsp;"
        // - 詞索引: 1
        $(`<span><span class='item-title'>詞索引:</span> ${wid}</span>`).appendTo(divOne)

        divOne.append(white_char)

        // - SN: 9003
        const snSpan = render_sn_span(r, tp)
        divOne.append(snSpan)

        divOne.append(white_char)
        
        // - 原文字: <span class='hebrew-char'>אֶל</span>
        render_word_span(r, tp).appendTo(divOne)

        divOne.append("<br/>")

        // pro 詞性 (新約)
        if (tp == 'G') {
            divOne.append("<span class='item-title'>詞性: </span>")
            divOne.append($("<span></span>").text(r.pro))
            divOne.append(white_char)
        }

        // wform 分析
        divOne.append("<span class='item-title'>字彙分析: </span>")
        let wform2 = charHebrew_Inline_Block(charHG(r.wform))
        divOne.append($(`<span>${wform2}</span><br/>`))

        // orig
        const orig_class = tp == 'H' ? 'hebrew-char' : 'greek-char'

        divOne.append("<span class='item-title'>原型: </span>")
        divOne.append($("<span></span>").addClass(orig_class).text(r.orig))

        divOne.append(white_char)

        // exp 原型簡義
        divOne.append("<span class='item-title'>原型簡義: </span>")
        divOne.append($("<span></span>").text(r.exp))

        // remark 備註
        if (r.remark != '') {
            divOne.append("<br/><span class='item-title'>備註: </span>")

            // 瑪拉基書4:1，有 SN136
            function fn_sn_remark(...s) {
                let sn = s[1]
                let sn2 = get_sn_shorter(sn)
                let N = tp == 'H' ? 1 : 0
                return `<span class='parsingTableSn sn' N=${N} k=${sn2} tp=${tp}>${tp}${sn2}</span>`
            }

            // 瑪拉基書4:5，有 SN136
            // 瑪拉基書4:5，有空白 SN 136
            let remark_sn = r.remark.replace(/SN ?([0-9]+a?)/gi, fn_sn_remark)

            let remark_linker = do_remark(remark_sn)
            let remark_orig = charHG(remark_linker)
            let remark_orig_inline_block = charHebrew_Inline_Block(remark_orig) // 3 單陽詞尾 הוּ + ֵי 合起來 ... 像這個 + 就可能因為沒有 inline-block 而錯誤

            divOne.append($(`<span>${remark_orig_inline_block}</span>`))
        }
        div_parsingTable.append(divOne)
    }

    return div_parsingTable[0].outerHTML
}

// (root => {
//     root.parsing_render_bottom_table = parsing_render_bottom_table
// })(this)

function get_sn_shorter(sn) {
    // sn 有可能是 09003 就變 9003
    // sn 也有可能有 09003a 就變 9003a
    return sn.replace(/^0+/, '')
}
function charHebrew_Inline_Block(remark) {
    // <span class='hebrew-char'>אֶל</span> 用長基本型 <span class='hebrew-char'>אֱלֵי</span>
    // 這個要在呼叫  charHG 之後，因為 hebrew-char 是在那時候被加上的

    // 將字串 'hebrew-char' 以 'hebrew-char hebrew-char-inline-block' 取代
    return remark.replace(/'hebrew-char'/g, '\'hebrew-char hebrew-char-inline-block\'')
}
/**
 * 處理 remark 中 [#2.19, 2.9, 4.2, 11.9#] 這種
 * 開發使用 瑪4:1
 * @param {string} remark 
 * @returns {string}
 */
function do_remark(remark) {
    // 當 input 是 `沿用至今。[#2.19, 2.9, 2.11-13, 4.2, 11.9#]` 後面那一段，要轉換為連結
    // <a href="/new/pimg/2.19.png" target="grammer">2.19</a>
    // <a href="/new/pimg/2.9.png" target="grammer">2.9</a>
    // 略..
    function fn_replace_big_number(pstr) {
        // 雖然不知道哪章哪節有這種 case, 但是原流程有，就加上去。

        // 測過了，可行。雖然不知道裡面為何可以
        pstr = pstr.replace(/[０-９]/g, function (s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0); // 全型 0 與 半型 0 差 0xFEE0
        });
        pstr = pstr.replace(/．/g, ".");

        return pstr
    }
    function fn_replace1(...s) {

        let pstr = s[1]
        let pstr2 = fn_replace_big_number(pstr)

        // 2.11-13 ... 連結會是 2.11.png
        // 2.11
        let pstr3 = pstr2.replace(/([0-9.]+)(-[0-9]+)?/g, function (...s2) {
            let link_url = "/new/pimg/" + s2[1] + ".png";
            // 希望在開發的時候，就是 port 是 5500 時，網址會從 /new/pimg/2.19.png 變成 http://bible.fhl.net:5500/new/pimg/2.19.png
            if (location.port == "5500") {
                link_url = "http://bible.fhl.net:80" + link_url;
            }

            let linker = $("<a></a>")
            linker.attr('href', link_url)
            linker.attr('target', '_blank')
            linker.text(s2[0])

            return linker[0].outerHTML
        })

        return '§' + pstr3
    }
    let remark2 = remark.replace(/\[#([0-9 .,\-]+)#\]/g, fn_replace1)
    return remark2
}
