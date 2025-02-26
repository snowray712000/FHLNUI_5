/// <reference path="./fhlParsing.d.ts" />

/**
 * render parsing 工具，下半部的 table
 * 從 fhlInfoContent 中被提取的程式碼
 * @param {IDParsingResult} jsonObj 
 * @param {'H'|'G'} tp
 * @returns {string} 
 */
function parsing_render_bottom_table(jsonObj, tp) 
{
    N = tp == 'H' ? 1 : 0

    // 先預備 wid 是特別的
    let [greek_Westcott_Hort, greek_USB4, plus_symbol] = get_special_wid(jsonObj, tp)

    // 太1:9 是特例
    // 瑪拉基書 4:5 是特例
    let div_parsingTable = $("<div id='parsingTable'></div>")
    for (let i = 1; i < jsonObj.record.length; i++) {
        // 是 + 則略過
        if ( plus_symbol.includes(i) ){
            continue
        }

        let r = jsonObj.record[i]
        // console.log(r);

        let divOne = $("<div></div>")
        
        divOne.attr('wid', r.wid)

        // 交錯顏色
        let clrstr = i % 2 == 0 ? 'background-color: lightgrey;' : 'white'
        divOne.attr('style', clrstr)
        // 韋: 黃色 #ffff99 聯 #ffcccc: 這是按最古老系統顏色
        if ( greek_Westcott_Hort.includes(i) ){
            divOne.attr('style', 'background-color: #ffff99')
        } else if ( greek_USB4.includes(i) ){
            divOne.attr('style', 'background-color: #ffcccc')
        }

        // 空白字元
        white_char = "&nbsp;&nbsp;"

        // sn span
        let sn = get_sn_shorter(r.sn)                                
        let snSpan = $("<span></span>")
        snSpan.addClass('parsingTableSn sn')
        snSpan.attr('N', N)
        // snSpan.attr('k', sn)
        snSpan.attr('sn', sn)
        snSpan.attr('tp', tp)
        snSpan.text(sn)
        divOne.append(snSpan)

        // orig_class '.hebrew-char' or '.greek-char'
        orig_class = tp == 'H' ? 'hebrew-char' : 'greek-char'

        // word
        divOne.append($("<span></span><br/>").addClass(orig_class).text(r.word))
        
        // pro 詞性 (新約)
        if (tp == 'G') {
            divOne.append("<span class='item-title'>詞性: </span>")
            divOne.append($("<span></span>").text(r.pro))
            divOne.append(white_char)
        }

        // wform 分析
        divOne.append("<span class='item-title'>字彙分析: </span>")
        let wform2 = charHebrew_Inline_Block( charHG(r.wform) )
        divOne.append($(`<span>${wform2}</span><br/>`))

        // orig
        divOne.append("<span class='item-title'>原型: </span>")
        divOne.append($("<span></span>").addClass(orig_class).text(r.orig))

        // exp 原型簡義
        divOne.append("<span class='item-title'>原型簡義: </span>")
        divOne.append($("<span></span>").text(r.exp))

        // remark 備註
        if (r.remark != '') {
            divOne.append("<br/><span class='item-title'>備註: </span>")

            // 瑪拉基書4:1，有 SN136
            function fn_sn_remark(...s){
                let sn = s[1]
                let sn2 = get_sn_shorter(sn)
                let N = tp == 'H' ? 1 : 0
                return `<span class='parsingTableSn sn' N=${N} k=${sn2} tp=${tp}>${tp}${sn2}</span>`
            }

            // 瑪拉基書4:5，有 SN136
            // 瑪拉基書4:5，有空白 SN 136
            let remark_sn = r.remark.replace(/SN ?([0-9]+a?)/gi,fn_sn_remark)

            let remark_linker = do_remark(remark_sn)
            let remark_orig = charHG(remark_linker)
            let remark_orig_inline_block = charHebrew_Inline_Block(remark_orig) // 3 單陽詞尾 הוּ + ֵי 合起來 ... 像這個 + 就可能因為沒有 inline-block 而錯誤

            divOne.append($(`<span>${remark_orig_inline_block}</span>`))
        }
        div_parsingTable.append(divOne)
    }

    return div_parsingTable[0].outerHTML
}
(root => {
    root.parsing_render_bottom_table = parsing_render_bottom_table
})(this)

function get_sn_shorter(sn){
    // sn 有可能是 09003 就變 9003
    // sn 也有可能有 09003a 就變 9003a
    return sn.replace(/^0+/, '')
}
function charHebrew_Inline_Block(remark){
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
function do_remark(remark){
    // 當 input 是 `沿用至今。[#2.19, 2.9, 2.11-13, 4.2, 11.9#]` 後面那一段，要轉換為連結
    // <a href="/new/pimg/2.19.png" target="grammer">2.19</a>
    // <a href="/new/pimg/2.9.png" target="grammer">2.9</a>
    // 略..
    function fn_replace_big_number(pstr){
        // 雖然不知道哪章哪節有這種 case, 但是原流程有，就加上去。

        // 測過了，可行。雖然不知道裡面為何可以
        pstr = pstr.replace(/[０-９]/g, function (s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0); // 全型 0 與 半型 0 差 0xFEE0
        });
        pstr = pstr.replace(/．/g, ".");
        
        return pstr                                 
    }
    function fn_replace1(...s){

        let pstr = s[1]
        let pstr2 = fn_replace_big_number(pstr)

        // 2.11-13 ... 連結會是 2.11.png
        // 2.11
        let pstr3 = pstr2.replace(/([0-9.]+)(-[0-9]+)?/g, function(...s2){
            link_url = "/new/pimg/" + s2[1] + ".png";
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

/**
 * 處理新約 + xxx韋 + xxx聯 + (太1:9)
 * 準備給下面產生 wid table 用的，若要特例可使用 太 1:9
 * @param {IDParsingResult} jsonObj
 * @param {'H'|'G'} tp
 * @returns {[number[], number[], number[]]}
 */
function get_special_wid(jsonObj, tp){
    /** @type {number[]} */
    let greek_Westcott_Hort = [] // 哪些 wid 是 韋式
    let greek_USB4 = []
    let plus_symbol = [] // 哪些 wid 是 +
    if ( tp == 'G' ){ // 新約才有
        // for -4 是因為一定是 5 個一組
        for (let i = 1; i < jsonObj.record.length - 4; i++) {
            let r = jsonObj.record[i]
            let w = r.word
            if ( w == '+' ){
                let r1 = jsonObj.record[i+1]
                let r2 = jsonObj.record[i+2]
                let r3 = jsonObj.record[i+3]
                let r4 = jsonObj.record[i+4]
                if ( r2.word == '+' && r4.word == '+' ){
                    // 確定是
                    greek_Westcott_Hort.push(i+1)
                    greek_USB4.push(i+3)
                    plus_symbol.push(i)
                    plus_symbol.push(i+2)
                    plus_symbol.push(i+4)
                }
            }
        }
        // console.log('greek_Westcott_Hort', greek_Westcott_Hort);
        // console.log('greek_USB4', greek_USB4);
        // console.log('plus_symbol',plus_symbol);                                
    }
    return [greek_Westcott_Hort, greek_USB4, plus_symbol]
}