/// <reference path="./fhlParsing.d.js" />

import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js"

/**
 * 於 fhlInfoContent.js 重構出來
 * @param {IDParsingResult} jsonObj 
 * @param {IDAddress} ps
 * @returns {string} html description string 
 */
export function parsing_render_top(jsonObj, ps){
    let chap_ctrl_str = generate_parsing_top_button_title(ps, jsonObj)
    let div_parsingTop2 = generate_parsing_top_div(jsonObj, ps)

    let html = chap_ctrl_str + div_parsingTop2[0].outerHTML
    return html
}

// (root => {
//     root.parsing_render_top = parsing_render_top
// })(this)


/**
 * 
 * @param {IDParsingResult} jsonObj 
 * @param {IDAddress} ps 
 * @returns {JQuery<HTMLElement>}
 */
function generate_parsing_top_div(jsonObj,ps){
    let word = jsonObj.record[0].word
    let exp = jsonObj.record[0].exp
    let remark = jsonObj.record[0].remark ?? "" // 舊約可能用到，平行經文

    let tp = jsonObj.N == 1 ? 'H' : 'G'
    // class 是 hebrew-char or greek-char (下面 for loop 要用)
    let char_class = tp == 'H' ? 'hebrew-char' : 'greek-char'

    let div_parsingTop = method_2()
    if (div_parsingTop != undefined){
        return div_parsingTop
    }
    return method_1(word, exp, remark)

    
    function method_2(){
        // 用空白隔開，判斷不準，因為 太 1:9 有 +,\n 符號，舊約有 ־ 這不是 dash - 符號，其實應該是2個 wid，另外，舊約有\r\n
        if (is_wid_length_not_equal_word_split()){
            return undefined // 改用 method_1
        }

        // 舊約的順序要先處理好，再綁定對應的 wid，不然會亂掉。
        if ( tp == 'H'){
            word = word.split(/\r?\n/g).reverse().join("\n")
        }

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

        function generate_title(){            
            let bookId = BibleConstantHelper.getBookId(ps.engs.toLowerCase())
            let bookname = BibleConstantHelper.getBookNameArrayChineseFull(ps.gb)[bookId - 1]

            console.warn(`book: ${bookname} ${ps.chap}:${ps.sec} error, wid 與 word 以空白隔開數量不同`);
            return `book: ${bookname} ${ps.chap}:${ps.sec}`
        }
        
        function is_wid_length_not_equal_word_split(){
            // 用空白隔開，判斷不準，因為 太 1:9 有 +,\n 符號，舊約有 ־ 這不是 dash - 符號，其實應該是2個 wid，另外，舊約有\r\n                         
            var split1 = word.split(/[ \n\r־,.]/g)

            // 去除 trim 也是空白的                                
            split1 = split1.filter(a1 => a1.trim() != "")
            
            let count_word = split1.length
            // console.log(split1);
            // console.log(`count_word = ${count_word}`);
            // console.log(`jsonObj.record.length = ${jsonObj.record.length}`);
                                                
            if ( jsonObj.record.length-1 != count_word ){
                console.warn(`${generate_title()} error, wid 與 word 以空白隔開數量不同`);
                return true
            }              
            return false                      
        }
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
            for (let i = 0; i < plus_index_3.length; i++) {
                let plus_index = plus_index_3[i]
                
                // 在 plus[0] + 1 至 plus[1] - 1 (包含) 找有 span 的
                let span_index = childrenArray.map((a1, i) => i > plus_index[0] && i < plus_index[1] && a1.tagName == 'SPAN' ? i : -1).filter(a1 => a1 != -1)
                // console.log(span_index);

                // 將 childrenArray 的 [span_index[j]] 的內容修改
                for (let j = 0;j < span_index.length; j++) {
                    let span = childrenArray[span_index[j]]
                    span.innerText = '(韋：' + span.innerText + ')'
                    // background color
                    span.style.backgroundColor = '#ffff99'
                }

                // 在 plus[1] + 1 至 plus[2] - 1 (包含) 找有 span 的
                span_index = childrenArray.map((a1, i) => i > plus_index[1] && i < plus_index[2] && a1.tagName == 'SPAN' ? i : -1).filter(a1 => a1 != -1)

                // 將 childrenArray 的 [span_index[j]] 的內容修改
                for (let j = 0;j < span_index.length; j++) {
                    let span = childrenArray[span_index[j]]
                    span.innerText = '(聯：' + span.innerText + ')'
                    // background color
                    span.style.backgroundColor = '#ffcccc'
                }
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
 * 
 * @param {IDAddress} ps 
 * @param {{prev:IDAddress, next: IDAddress}} jsonObj
 * @returns {string} 
 */
function generate_parsing_top_button_title(ps, jsonObj){
    let bookId = BibleConstantHelper.getBookId(ps.engs.toLowerCase())
    
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
            let prev_sec = jsonObj.prev.sec
            let prev_chap = jsonObj.prev.chap
            let prev_engs = jsonObj.prev.engs
            return `<div class='parsingSecBack' engs='${prev_engs}' chap='${prev_chap}' sec='${prev_sec}'><span>&#x276e;</span></div>`
        }
    }
    function generate_parsing_sec_next_button(){
        if (bookId == 66 && ps.chap == 22 && ps.sec == 21) {
            // add by snow. 2021.07 存在空白會錯誤
            return ""
        } else {
            let next_sec = jsonObj.next.sec
            let next_chap = jsonObj.next.chap
            let next_engs = jsonObj.next.engs
            return `<div class='parsingSecNext' engs='${next_engs}' chap='${next_chap}' sec='${next_sec}'><span>&#x276f;</span></div>`
        }
    }
    function generate_parsing_where_title(){
        let bookName = BibleConstantHelper.getBookNameArrayChineseFull(ps.gb)[bookId - 1]
        
        return `<div id='parsing-where-title'>${bookName}&nbsp${ps.chap}:${ps.sec}</div>`
    }
}