/**
 * - 開發 render mode 3 時，從 mode 1 的程式碼修改，然後將 mode 1 mode 2 mode 3 都重構。而 3 個共通的部分，就放在這個 common (共通) 檔案中。
 */

import { charHG } from "./charHG.es2023.js"


/**
 * @typedef DAddress
 * @property {number} chap 章
 * @property {number} sec 節
 * @property {number?} book 書卷索引，1-based，在 getBibleTextAsync 多執行緒過程，各譯本就順便轉換了。
 * @property {string} engs 英文書名縮寫，例如 "Gen"，即 BibleConstant.ENGLISH_BOOK_ABBREVIATIONS
 * @property {string} chinese 書名縮寫，例如 "Gen"，即 BibleConstant.CHINESE_BOOK_ABBREVIATIONS 或 CHINESE_BOOK_ABBREVIATIONS_GB
 */

/**
 * @typedef { DAddress & {
 *   bible_text: string // 經文內容 
 * } } TpOneRecordBibleText
 */

/**
 * @typedef TpResultBibleText
 * @property {"success"|"failed"} status 譯本名稱
 * @property {string} version 譯本名稱，例如 unv
 * @property {string} v_name 譯本名稱的中文名稱，例如 新譯本
 * @property {number} record_count 總共有多少節
 * @property {TpOneRecordBibleText[]} record 每一節的經文內容
 * @property {DAddress} next
 * @property {DAddress} prev
 */

/** 
 * 用在主畫面時的經文, 若非符合版本, 會直接回傳原來的 bibleText
 * fhlwh 新約原文 lxx 七十士譯本 bhs 馬索拉原文
 * @param {string} version - rspArr[j].version  fhlwh, lxx, bhs 都會特定處理
 * @param {string} bibleText - 通常是純文字，也有可能被加上一些 html 語法了
 * @returns {string}
*/
export function addHebrewOrGreekCharClass(version, bibleText) {
    // add by snow. 2021.07, 將希臘文，希伯來文加入 class
    if (isHebrewOrGeekVersion(version)) {
        return charHG(bibleText)
    }
    return bibleText
}

/** 
* fhlwh 新約原文 lxx 七十士譯本(舊約用希臘文) bhs 馬索拉原文 (希伯來文)
* @param {string} ver - fhlwh lxx bhs
*/
export function isHebrewOrGeekVersion(ver) {
    return ['fhlwh', 'lxx', 'bhs'].indexOf(ver) != -1
}
/**
 * ### 換行處理 \n 變成 <br/> 或 ↩
 * @param {string} bibleText 
 * @param {string} version_of_record 
 * @returns 
 */
export function replace_newline_char(bibleText, version_of_record) {
    const newline_symbol = version_of_record == "bhs" ? "↪" : "↩"; 
    
    // 只有 bhs 並且 mode 1 2 才是用 <br/> ， 因為 新方法真的很省空間，也漂亮。
    const newlineMethod = ps.show_mode in [1, 2] && version_of_record == "bhs" ? "<br/>" : `<span class='nL'>${newline_symbol}</span>`;
    return bibleText.split(/\r?\n\r?/g).join(newlineMethod); 
}
export function generate_verse_number_jdom(sec, version_of_record){
    // 阿拉伯數字，若是希伯來文，要有希伯來文字元「夾住它」，這阿拉伯數字，才會以希伯來字元一起排序 (從右至左)，而這字元就是使用 \u200F，稱為 Right-to-Left Mark (RTL)，這樣就可以讓阿拉伯數字在希伯來文中正確顯示。

    // 注意看程式碼，sec 後，還有一個空白。還要有一個空白，copy 時，才不會黏在一起    
    const text_of_verse = version_of_record == 'bhs' ? `\u200F${sec} ` : `${sec} `; 
    return $("<span>").addClass('verseNumber').text(text_of_verse)
}

export function parseBibleText(text, ps, isOld, bibleVersion) {
    var ret;

    // <RF><Rf> 這個到 jQuery 就會錯了，所以要先轉換...小寫的 <Rf> 要變為 </Rf> <Fi> 要變 </Fi>
    if (bibleVersion == "kjv") {
        text = text.replace(/<Rf>/g, "</Rf>"); // 大小寫很重要，所以不能寫 /gi 要用 /g
        text = text.replace(/<Fi>/g, "</Fi>");
    }




    if (-1 != ["unv", "kjv", "rcuv", "fhlwh"].indexOf(bibleVersion)) {
        text = replace_newline_char(text, bibleVersion);
        
        // 和合本 KJV 和合本2010 ... 原本的 <WTH412> 變 span.sn sn="412" N="1" 
        text = do_sn(text)

        // 下面使用 jquery 操作，最後取 .html()
        let text_jq = $(`<span>${text}</span>`)

        // 將 sn 前面對應的文字，加上 sn-text class ... 取代純文字, 變 span.sn-text sn, N 
        add_sn_text(text_jq)

        // 因為現在所有資料都包含 sn，所以若 strong=0，則要隱藏
        add_sn_hidden_if_need(text_jq, ps)

        text = text_jq.html()
    } // if 具有 sn 的譯本


    ret = text;

    
    // if (bibleVersion == "bhs" || bibleVersion == "fhlwh") {
    //     // 舊約馬索拉原文, 新約WH原文
    //     // 新約原文，加上 SN 了，再加這兩行會錯誤 (但我不確定這會不會用到，所以還保留著)
    //     // ret = ret.replace(/</g, "&lt");
    //     // ret = ret.replace(/>/g, "&gt");
    //     ret = ret.replace(/\r\n/g, "<br>");
    // }
    // // console.log(ret);
    return ret;

    // 將 sn 前面對應的文字，加上 sn-text class
    /**
     * @param {JQuery<HTMLElement>} text_jq
     * @returns {void}
     * @description 開發 詩篇148
     */
    function add_sn_text(text_jq) {

        // 不是使用 .children() 因為這樣取不到 文字，不只要取到 span 也要取到 文字，所以要用 .contents()
        let textContents = text_jq.contents()

        // 從最後一個到第一個，如果這個 i 是 .sn ，那麼 若 i-1 是文字 #text，那麼就把這段文字處理一下 ... 到 >= 1 就好，因為處理 i=0 的時候，前面就沒文字了呀
        for (let i = textContents.length - 1; i >= 1; i--) {
            /** @type {HTMLElement} */
            let one_dom = textContents[i]
            if (one_dom.nodeType != 3 && $(one_dom).hasClass("sn") && textContents[i - 1].nodeType == 3) {

                // 花括號，就 continue。因為花括號表示中文字沒有，原文有
                if (one_dom.innerText[0] == '{') {
                    // console.log($(one_dom))
                    continue
                }

                // 分割文字，成2部分
                let text_split = split_two_part(textContents[i - 1].data)
                let text_prev1 = text_split[0] // , 等等的符號，不能被包在中文中，斷開了
                let text_prev2 = text_split[1] // 真正的文字

                // 若第二個字是 empty string 就不處理
                if (text_prev2.trim() == '') {
                    continue
                } else {
                    // 判斷，它的 sn 是什麼。 如果 [i] 的 sn 是超過 9000 ， 那麼就要用 i+1 的 sn，不會有連續2個超過 9000。
                    let sn = $(one_dom).attr('sn')
                    let n = $(one_dom).attr('n')
                    if (parseInt(sn) > 9000) {
                        sn = $(textContents[i + 1]).attr('sn')
                        n = $(textContents[i + 1]).attr('n')
                    }
                    // console.log(sn);


                    // 要把原本位置的 #text 刪掉，然後加上 2 個 span, text_prev1 是純文字， text_prev2 是 <span class="sn-text" sn=sn n=n>text_prev2</span>
                    // let sn_text2 = `<span class="sn-text" sn=${sn} n=${n}>${text_prev2}&nbsp;</span>`
                    let sn_text2 = ` <span class="sn-text" sn=${sn} n=${n}>${text_prev2.trim()}</span>`
                    
                    // console.log(text_prev2)

                    // 大部分 text_prev2 字，前面都有一個空白字元，但少數會沒有，例如換行符號之後的
                    
                    // console.log(text_prev1, text_prev2)
                    $(textContents[i - 1]).remove()
                    if (text_prev1.trim().length != 0) {
                        $(one_dom).before(text_prev1) 
                    }
                    $(one_dom).before(sn_text2)
                }

            } else if (textContents[i - 1].nodeName == 'U') {
                // 和合本2010 詩篇148
                // console.log(textContents[i-1]);
                // [i-1] 從 <u>以色列</u> 變 <u class="sn-text">以色列</u>
                let sn_n = get_sn_text_sn_n(i, textContents)
                let sn = sn_n[0]
                let n = sn_n[1]
                $(textContents[i - 1]).addClass('sn-text').attr('sn', sn).attr('n', n)
            }
        }

        return // text_jq 是 input, output
        function split_two_part(one_text) {
            // 將文字分為 2 部分，切割位置，是從 尾端 找，第一個出現 `：「！，。；（）？、』『` 中任何一個符號的位置。`因此他（或譯：他使）一切` 此例應該斷在 ）而非 （

            // let pos = text_prev.search(/[：「！，。；（）？、』『]/)
            // let pos = text_prev.reverse().search(/[：「！，。；（）？、』『]/)
            let istr = one_text.split('')
            let pos = -1
            for (let i = istr.length - 1; i >= 0; i--) {
                if (istr[i].match(/[：「！，。；（）？、』『.:;,]/)) {
                    pos = i
                    break
                }
            }


            // 將文字分為 2 部分，前面的文字，後面的文字
            let text_prev1 = one_text.slice(0, pos + 1)
            let text_prev2 = one_text.slice(pos + 1)
            // console.log(text_prev1);
            // console.log(text_prev2);

            return [text_prev1, text_prev2]
        }
        /**
         * 
         * @param {number} i 
         * @param {HTMLElement[]} textContents 
         * @returns {[string, string]} sn, n
         */
        function get_sn_text_sn_n(i, textContents) {
            // 判斷，它的 sn 是什麼。 如果 [i] 的 sn 是超過 9000 ， 那麼就要用 i+1 的 sn，不會有連續2個超過 9000。
            let sn = $(textContents[i]).attr('sn')
            let n = $(textContents[i]).attr('n')
            if (parseInt(sn) > 9000) {
                sn = $(textContents[i + 1]).attr('sn')
                n = $(textContents[i + 1]).attr('n')
            }
            return [sn, n]
        }
    }
    function add_sn_hidden_if_need(text_jq, ps) {
        // 因為現在所有資料都包含 sn，所以若 strong=0，則要隱藏
        if (ps.strong == 0) {
            // 將 text 轉為 jQuery，然後將 .sn 的 span 加入 .hidden
            text_jq.find('.sn').addClass('sn-hidden')
        }
    }
    /**
     * 用 string replace 處理，將 WTH WH WAH 等 sn 轉換成 span tag
     * @param {string} text api 得到的值，包含許多 WTH 的文字 
     * @returns {string} 處理過的文字，是一個 html 格式
     */
    function do_sn(text) {
        function snReplace(s, s1, s2, s3, s4, s5, s6, s7, s8) {
            //console.log(s, s1, s2, s3, s4, s5, s6, s7, s8);

            // 當有 { } 時, 是用 s1 s2 s3 s4
            // s1, s5: A or T or ""
            // s2, s6: H or G
            // s3, s7: 09002 之類的, 若有 a 不會包含， a 會在 s4
            // s4, s8: a or ""

            // 判斷 A or T s1 或 s5
            let sAT = s1 || s5;
            let sHG = s2 || s6;
            let sSN = s3 || s7;
            let sA = s4 || s8;

            // 判斷有無 { }
            const isExistBrace = s1 != undefined
            // 判斷是要用 < > chevrons 還是 ( ) parentheses  
            const isUseParentheses = sAT == 'T'
            // sn 去掉多餘的0 (轉成數字，再轉回文字) + a (若有)
            let sn = parseInt(sSN).toString() + (sA == 'a' ? sA : '')
            // N=1 舊約, N=0 新約
            let N = sHG == 'H' ? 1 : 0

            // 新增一個 span tag, 使用 jquery
            let span = $("<span></span>")
            // 加上 class, sn, N
            span.addClass('sn').attr('sn', sn).attr('N', N)
            // 顯示內容
            var text = isUseParentheses ? `(${sn})` : `<${sn}>`
            // 如果有 { } 就加上
            if (isExistBrace) {
                text = `{${text}}`
            }
            // 加上文字
            span.html(text)

            return span[0].outerHTML
        }

        let reg1 = /<W([AT]?)([HG])([0-9]+)(a?)>/gi // T是顯示是用小括號，但原始是<>，那是後處理
        // 有可能有 { } ， 也可能沒有
        let reg2 = new RegExp("{" + reg1.source + "}" + "|" + reg1.source, "gi")
        text = text.replace(reg2, snReplace);

        return text
    }
}
