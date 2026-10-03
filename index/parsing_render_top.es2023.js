/// <reference path="./fhlParsing.d.js" />

import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js"
import { splitStringByRegex } from "./splitStringByRegex.es2023.js"
/**
 * 於 fhlInfoContent.js 重構出來
 * @param {IDParsingResult} jsonObj 
 * @param {IDAddress} ps
 * @returns {string} html description string 
 */
export function parsing_render_top(jsonObj, ps){
    // - 產生 2 個 button ， 與一個 title
    let chap_ctrl_str = generate_parsing_top_button_title(ps, jsonObj)
    // - 產生 原文 與 直譯
    let div_parsingTop2 = generate_parsing_top_div(jsonObj, ps)

    let html = chap_ctrl_str + div_parsingTop2[0].outerHTML
    return html
}

function is_record_count_mismatch_with_word_split(word,cnt_of_record){
    // ### 判斷「method2演算法」前提，是個數不同
    // - cnt_of_record 就是 jsonObj.record.length
    // - wid 從 1 開始，每個字，會有一個 wid，中間會有各種可能出現的符號隔開，而 record 也是從 1 開始，對應各個 wid。🍇 實例: 例如，5 個原文字，應該會有 wid 從 1-5，對應的 record.length 會是 6。
    // - 若是新約，會有 + 符號，也是佔用一個符號，所以，split 參數才不會有 + 符號。

    // 用空白隔開，判斷不準，因為 太 1:9 有 +,\n 符號，舊約有 ־ 這不是 dash - 符號，其實應該是2個 wid，另外，舊約有\r\n                         
    let split1 = word.split(/[ \n\r־,.]/g)

    // 去除 trim 也是空白的                                
    split1 = split1.filter(a1 => a1.trim() != "");

    if ( cnt_of_record - 1 != split1.length ){
        console.warn(`record count mismatch, record.length=${cnt_of_record}, split1.length=${split1.length}, word=${word}`);
        return true
    }              
    return false     
}


/**
 * 
 * @param {IDParsingResult} jsonObj 
 * @param {IDAddress} ps 
 * @returns {JQuery<HTMLElement>}
 */
function generate_parsing_top_div(jsonObj,ps){
    // - 結果是 <div id='parsingTop'></div>, 而 top 與 title 、 2個按鈕、還有下面的 table 是平行的
    // - 承上，其中是 一行 原文 一行 譯文。<div#greek-char> <div#exp>，當然，也可能是 #hebrew-char
    // - 譯文，很簡單，就是把資料直接放進去，連 span 都沒有
    // - 原文，一個原文是一個 <span#sn-btn[wid]> </span>
    // - 原文，是 <span#sn-btn>空格/逗號...<span#sn-btn>，交錯著
    // - 若新約，有韋式，聯式，要注意，詞索引其實會不連續，因為 + 符號，也會佔一個詞索引，即 wid。
    // - wid 是 1based
    // - 首先，record 要用 \n 分隔。這個新約與舊約會有點不同，因為希伯來文的特性，所以舊約 第1行原文 會對應 最後一行譯文。
    // - 太3:2 1:25 都是特別的，尤其 3:2 是只有一半的。目前還算 Bug
    const record_0 = jsonObj.record[0]

    let word = record_0.word
    let exp = record_0.exp
    let remark = record_0.remark ?? "" // 舊約可能用到，平行經文

    const book = record_0.book
    const chap = record_0.chap
    const sec = record_0.sec

    let tp = jsonObj.N == 1 ? 'H' : 'G'
    // class 是 hebrew-char or greek-char (下面 for loop 要用)
    let char_class = tp == 'H' ? 'hebrew-char' : 'greek-char'

    let div_parsingTop = method_2()
    if (div_parsingTop != undefined){
        return div_parsingTop
    }
    return method_1(word, exp, remark)

    
    function method_2(){
        // - 前提，wid 個數與 record 數量搭得起來
        if ( is_record_count_mismatch_with_word_split(word, jsonObj.record.length) ){
            console.error(`${book} ${chap}:${sec} error, record 與 word 以空白隔開數量不同`);
            return undefined // 改用 method_1
        }

        // - 舊約的順序要先處理好，再綁定對應的 wid，不然會亂掉。
        // - 取完資料，已經馬上作了
        // if ( tp == 'H'){
        //     word = word.replaceAll(/\r/g, "");
        //     word = word.split(/\r?\n/g).reverse().join("\n")
        // }

        // 把每一個與對應的資料綁在一起
        let word2 = add_wid_to_span(word)

        // 換行要先處理，因為換行符號，會變成 #text，會變得不好處理
        word2 = word2.replace(/\r?\n/g, '<br/>')

        // 找出成對的 + 符號處理
        let childrenArray = $(word2).toArray();
        if ( tp == 'G' ){
            do_about_plus_symbolic(childrenArray)
        }

        // 每個 tag 是 span 的，加入 class sn-btn
        for (let i = 0; i < childrenArray.length; i++) {
            let tmp = childrenArray[i]
            // tmp 的 tag 是 SPAN 時
            if (tmp.tagName == 'SPAN'){
                $(tmp).addClass('sn-btn')
            }
        }
        
        // 將 childrenArray 變為多個 array，每個 array 是以 br 為分隔                                
        let childrenArray2 = split_by_bytag(childrenArray)


        // exp 用 \r?\n 分隔
        let exps = exp.split(/\r?\n/)
        
        let div_parsingTop = $("<div id='parsingTop'></div>")
        // 此時 exps 的 length 應該要等於 childrenArray2 的 length，但不一定，所以先取大的 length
        let max = Math.max(exps.length, childrenArray2.length)
        for (let i = 0; i < max; i++) {
            let children = childrenArray2[i] ?? []
            let exp = exps[i] ?? ""

            let div1 = $("<div></div>").addClass(char_class).append(children)
            let div2 = $("<div></div>").text(exp).addClass('exp')
            div_parsingTop.append(div1).append(div2)

        }

        // 舊約，平行經文 (目前不知道哪章節有)
        if ( tp == 'H' && remark.length > 0) {
            let div = $("<div></div>").text("平行經文：" + remark)
            div_parsingTop.append(div)
        }
        
        return div_parsingTop
        
        /**
         * @param {string} word 
         * @returns {string}
         */
        function add_wid_to_span(word){
            // 把每一個與對應的資料綁在一起
            let wid = 1
            /**
             * @param  {string[]} s 
             */
            function fn_replace1(...s){
                let s0 = s[0]                                    
                return $("<span></span>").text(s0).attr('wid', wid++)[0].outerHTML
            }
            
            // replace ， 不包含 [' ', '\n', '\r', '־', ',']，就要處理
            let word2 = word.replace(/[^ \n\r־,.]+/g, fn_replace1)
            // console.log(word);
            // console.log(word2);

            return word2
        }
        function do_about_plus_symbolic(childrenArray){
            // 找出成對的 + 符號處理
            // 例  <span wid="11">Ἀχάς</span> <span wid="12">+</span> <span wid="13">Ἀχάζ</span> <span wid="14">+</span>, \n<span wid="15">+</span> <span wid="16">Ἀχὰς</span> <span wid="17">+</span> <span wid="18">Ἀχὰζ</span> <span wid="19">+</span> <span wid="20">δὲ</span> 
            
            // 找出 + 符號的位置
            let plus_index = childrenArray.map((a1, i) => a1.innerText == '+' ? i : -1).filter(a1 => a1 != -1)
            // console.log(plus_index);
            
            // 例 [ 18, 22, 26, 28, 32, 36 ]
            // 這個例子， 18 22 26 是一組 28 32 36 是一組
            // 第一組 19-21 中的 span ， 要變為 韋：；23-25 中的 span，要變為 聯： 
            // 第二組 29-31 中的 span ， 要變為 韋：；33-35 中的 span，要變為 聯：
            
            // step1 使 3 個一組
            let plus_index_3 = []
            for (let i = 0; i < plus_index.length; i+=3) {
                plus_index_3.push(plus_index.slice(i, i+3))
            }
            // console.log(plus_index_3);

            // step2 處理每一組
            // 整段一個標籤 (韋：τὰ παραπτώματα αὐτῶν)，標籤加在第一個、最後一個字的 span 上 (同經文區 cvt_others_wu_plus.js)
            // 每個字仍是自己的 span (可點)，各自上色
            for (let i = 0; i < plus_index_3.length; i++) {
                let plus_index = plus_index_3[i]
                label_range(plus_index[0], plus_index[1], '韋', '#ffff99')
                label_range(plus_index[1], plus_index[2], '聯', '#ffcccc')
            }

            /**
             * @param {number} i1 + 的位置 (不含)
             * @param {number} i2 + 的位置 (不含)
             * @param {string} label 
             * @param {string} color // 韋: 黃色 #ffff99 聯 #ffcccc: 這是按最古老系統顏色
             */
            function label_range(i1, i2, label, color){
                let spans = childrenArray.filter((a1, i) => i > i1 && i < i2 && a1.tagName == 'SPAN')
                if (spans.length == 0) return
                spans.forEach(span => span.style.backgroundColor = color)
                spans[0].innerText = `(${label}：` + spans[0].innerText
                spans[spans.length - 1].innerText += ')'
            }

            // 移除 childrenArray 中，plus_index array 的
            for (let i = plus_index.length - 1; i >= 0; i--) {
                childrenArray.splice(plus_index[i], 1)
            }
        }   
        /**
         * @param {JQuery<HTMLElement>[]} childrenArray 
         * @returns {JQuery<HTMLElement>[]}
         */
        function split_by_bytag(childrenArray){
            // 將 childrenArray 變為多個 array，每個 array 是以 br 為分隔
            let childrenArray2 = []
            let temp = []
            for (let i = 0; i < childrenArray.length; i++) {
                if (childrenArray[i].tagName == 'BR'){
                    childrenArray2.push(temp)
                    temp = []
                } else {
                    temp.push(childrenArray[i])
                }
            }
            childrenArray2.push(temp)

            return childrenArray2
        }                                                                                             
    }


    
    /**
     * 簡單的，顯示 okay，但 click 每個原文，沒有生效
     * 若 split by space 後，個數不合就用這個
     * @returns {JQuery<HTMLElement>}
     */
    function method_1(word, exp, remark){
        let div_parsingTop = $("<div id='parsingTop'></div>")
    
        
        // 舊約的分段，順序要 reverse。
        let words = tp == 'G' ? word.split('\n') : word.split('\n').reverse()
        let exps = exp.split('\n')
        
        

        // for loop 選個數大的
        let max = Math.max(words.length, exps.length)
        // 每一個 word 要找對應的一個 wid 的資訊
        for (let i = 0; i < max; i++) {
            let word = words[i] ?? ""
            let exp = exps[i] ?? ""

            // 新約，太 1:9， + 符號，若出現 3 的倍數，就要加上 韋： 聯： 的字樣
            var div1 = $("<div></div>").text(word).addClass(char_class)
            // 若是特別 case, 則取代 div1
            if ( is_greek_special_case_plus()){
                div1 = greek_plus_case(word)
            }
            
            let div2 = $("<div></div>").text(exp).addClass('exp')
            div_parsingTop.append(div1).append(div2)
        }

        // 舊約，平行經文 (目前不知道哪章節有)
        if ( tp == 'H' && remark.length > 0) {
            let div = $("<div></div>").text("平行經文：" + remark)
            div_parsingTop.append(div)
        }

        return div_parsingTop

        function is_greek_special_case_plus(){
            if ( tp != 'G' ) return false
            // `+` 符號 個數，是 3 的倍數時
            let count_plus = word.split('+').length - 1
            return count_plus > 0 && count_plus % 3 == 0
        }
        /**
         * + (韋:) + (聯:) + 的特殊 case
         * @param {string} word 已經 split 換行了 
         */
        function greek_plus_case(word){
            let div1 = $("<div></div>").addClass(char_class)
            let wd = word.split("+")

            // // 韋: 黃色 #ffff99 聯 #ffcccc: 這是按最古老系統顏色
            // 一定是 3 的倍數
            for (var ii = 0; ii < wd.length; ii++) {
                if (ii % 3 == 0){
                    $('<span></span>').text(wd[ii]).appendTo(div1)
                } else if (ii % 3 == 1){
                    $('<span></span>').text(`(韋： ${wd[ii]})`).attr('style', 'background-color: #ffff99').appendTo(div1)
                } else if (ii % 3 == 2){
                    $('<span></span>').text(`(聯： ${wd[ii]})`).attr('style', 'background-color: #ffcccc').appendTo(div1)
                }
            }
            return div1
        }
    }
}
/**
 * ### 產生 <div.parsingSecBack></div><div.parsingSecNext></div><div#parsing-where-title></div>
 * @param {IDAddress} ps 
 * @param {{prev:IDAddress, next: IDAddress}} jsonObj
 * @returns {string} 
 */
function generate_parsing_top_button_title(ps, jsonObj){
    if ( Object.hasOwn(ps, 'bookIndex') == false ){
        throw new Error("ps.bookIndex is required");
    }
    let bookId = ps.bookIndex
    

    if (bookId == undefined || bookId == -1) {
        return ""
    }

    let prev_button = generate_parsing_sec_back_button()
    let next_button = generate_parsing_sec_next_button()
    let parsing_where_title = generate_parsing_where_title(ps)
    
    return prev_button + next_button + parsing_where_title

    function generate_parsing_sec_back_button(){                                    
        if (bookId == 1 && ps.chap == 1 && ps.sec == 1) {
            // add by snow. 2021.07 存在空白會錯誤
            return ""
        } else {
            const prev = jsonObj.prev
            return `<div class='parsingSecBack' book='${prev.book}' chap='${prev.chap}' sec='${prev.sec}'><span>&#x276e;</span></div>`
        }
    }
    function generate_parsing_sec_next_button(){
        if (bookId == 66 && ps.chap == 22 && ps.sec == 21) {
            // add by snow. 2021.07 存在空白會錯誤
            return ""
        } else {
            const next = jsonObj.next
            return `<div class='parsingSecNext' book='${next.book}' chap='${next.chap}' sec='${next.sec}'><span>&#x276f;</span></div>`
        }
    }
    function generate_parsing_where_title(){
        let bookName = BibleConstantHelper.getBookNameArrayChineseFull(ps.gb)[bookId - 1]
        
        return `<div id='parsing-where-title'>${bookName}&nbsp;${ps.chap}:${ps.sec}</div>`
    }
}