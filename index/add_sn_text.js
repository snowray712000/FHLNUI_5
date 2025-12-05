
// 將 sn 前面對應的文字，加上 sn-text class
/**
 * @param {JQuery<HTMLElement>} text_jq
 * @returns {void}
 * @description 開發 詩篇148
 */
export function add_sn_text(text_jq, bibleVersion) {

    // 不是使用 .children() 因為這樣取不到 文字，不只要取到 span 也要取到 文字，所以要用 .contents()
    let textContents = text_jq.contents()

    // 從最後一個到第一個，如果這個 i 是 .sn ，那麼 若 i-1 是文字 #text，那麼就把這段文字處理一下 ... 到 >= 1 就好，因為處理 i=0 的時候，前面就沒文字了呀
    for (let i = textContents.length - 1; i >= 1; i--) {
        /** @type {HTMLElement} */
        let one_dom = textContents[i]
        if (is_3588_sn(textContents, i)) {
            // 分割文字，成2部分
            let text_split = split_two_part(textContents[i - 2].data)
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
                const space_add = -1 == ['fhlwh', 'lxx', 'bhs', 'kjv'].indexOf(bibleVersion) ? '' : ' ';
                let sn_text2 = space_add + `<span class="sn-text" sn=${sn} n=${n}>${text_prev2.trim()}</span>`

                // console.log(text_prev2)

                // 大部分 text_prev2 字，前面都有一個空白字元，但少數會沒有，例如換行符號之後的

                // console.log(text_prev1, text_prev2)
                // i-2:；恩典 i-1:<3588> i:<5458>
                if (text_prev1.trim().length != 0) {
                    $(textContents[i - 2]).before(text_prev1)
                    i = i + 1
                    textContents = text_jq.contents() // 重新取得 contents，因為前面有刪除
                }
                $(textContents[i - 2]).before(sn_text2)
                textContents = text_jq.contents() // 重新取得 contents，因為前面有刪除
                i = i + 1
                $(textContents[i - 2]).remove()
                textContents = text_jq.contents() // 重新取得 contents，因為前面有刪除
            }
        } else if (one_dom.nodeType != 3 && $(one_dom).hasClass("sn") && textContents[i - 1].nodeType == 3) {

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
                const space_add = -1 == ['fhlwh', 'lxx', 'bhs', 'kjv'].indexOf(bibleVersion) ? '' : ' ';
                let sn_text2 = space_add + `<span class="sn-text" sn=${sn} n=${n}>${text_prev2.trim()}</span>`

                // console.log(text_prev2)

                // 大部分 text_prev2 字，前面都有一個空白字元，但少數會沒有，例如換行符號之後的

                // console.log(text_prev1, text_prev2)
                $(textContents[i - 1]).remove()
                if (text_prev1.trim().length != 0) {
                    $(textContents[i]).before(text_prev1)
                }
                $(textContents[i]).before(sn_text2)
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

/**
     * 弗1:6 的 恩典{<3588>}<5485>，這類的，當 i-2 是 text, i-1 是 3588 時。
     * - 並非所有 3588 都有花括號
     * - 並非所有 3588 後面的 sn 都一定是沒有 花括號，例如 弗1:10 使{<3588>}{<1909>} 
     * @param {HTMLElement[]} doms
     * @param {number} i
     */
function is_3588_sn(doms, i) {
    if (i < 2) return false;

    let dom_i_2 = doms[i - 2];
    let dom_i_1 = doms[i - 1];
    let dom_i = doms[i];

    const is_text = dom_i_2.nodeType == 3; // text node
    const is_i_1_sn = dom_i_1.nodeType != 3 && $(dom_i_1).hasClass("sn");
    const is_i_sn = dom_i.nodeType != 3 && $(dom_i).hasClass("sn");
    const sn_i_1 = parseInt($(dom_i_1).attr("sn"));

    // 使{<3588>}{<1909>} 這種，不能列入。
    if (!is_i_sn) {
        return false;
    }
    const is_i_brace = dom_i.innerText[0] == '{';

    return is_text && is_i_1_sn && is_i_sn && sn_i_1 == 3588 && !is_i_brace;
}
