// <div#lecMain>
//     <div.vercol>
//     <div.lec>...第1節內容...</div>
//     <div.lec>...第2節內容...</div>
//     <div.lec>...</div>
//     </div>
//     <div.vercol>
//     <div.lec>...</div>
//     <div.lec>...</div>
//     <div.lec>...</div>
//     </div>
//     <div#div_copyright.vercol>...</div>
// </div>

/**
 * @typedef {import("./DText.js").DText} DText
 * @typedef {import("jquery")} $
 * @typedef {import("./cvt_others.js").DTextsWithAddr} DTextsWithAddr
 * @typedef {import("./DFoot.js").DFoot} DFoot
 */

/**
 * 參數所包含的是多節，不論是 model1 還是 model2，函數都會依內容自行判斷要用什麼方式呈現「節」。若內容包含多個「章、節」，就會顯示「2:1 ... 2 ... 3 ... 」？不行，因為可能不同段落，可能是跨章，但傳進來的這段，看不出來是有跨章的。
 * 0: auto 1: 有跨書 2: 有跨章 3: 有跨節(其實就跟 auto 會一樣結果)
 * @param {DTextsWithAddr[]} dtexts_with_addr 
 * @param {string} version 
 * @param {number} mode_section 0: auto 1: 有跨書 2: 有跨章 3: 有跨節(其實就跟 auto 會一樣結果)
 * @returns {JQuery<HTMLElement>} htmlContent
 */
export function render_dtexts(dtexts_with_addr, version, mode_section = 0){
    /** @type {JQuery<HTMLElement>[]} */
    const results = []
    for(const dtext_with_addr of dtexts_with_addr){
        const dtexts = dtext_with_addr[3]; // DText
        const addr = [dtext_with_addr[0], dtext_with_addr[1], dtext_with_addr[2]]; // DAddress
        
        // 產生 references
        // const ref_html = render_ref(dtext_with_addr, version);
        // results.push(ref_html);

        // 產生內容
        const content_html = render_dtexts_only(dtexts, version, addr);
        
        results.push(...content_html);
    }

    // 每個 result 變成 <span>... 字串，最後合併回傳
    const container = $('<span></span>');
    for (const r of results){
        container.append(r);
    }
    return container;
}

/**
 * 
 * @param {DText[]} dtexts 
 * @param {string} version 
 * @param {number[]} addr
 * @returns {JQuery<HTMLElement>[]}
 */
function render_dtexts_only(dtexts, version, addr){
    /** @type {JQuery<HTMLElement>[]} */
    const results = []

    for (const dtext of dtexts){
        if ( dtext.children != null && dtext.children.length > 0 ){
            const results_children = render_dtexts_only(dtext.children, version, addr);
            const span_parent = $('<span></span>');
            for (const child_html of results_children){
                span_parent.append(child_html);
            }
            results.push(span_parent);
            continue
        }


        // 根據 dtext 的屬性，產生對應的 HTML 元素
        // 這裡僅為示範，實際實現會根據 dtext 的結構來決定
        const span = $('<span></span>').text(dtext.w ?? "");

        if (dtext.isTitle1) {
            span.addClass('isTitle1');
        }
        if (dtext.isName) {
            span.addClass('isName');
        }
        if (dtext.isBold){
            span.addClass('isBold')
        }
        // 其他屬性處理...
        if (dtext.foot != null){
            span.text('') // 清掉
            span.append('【註')
            // 和合本2010，沒有 id 的概念，會傳 -1
            if ( dtext.foot.id != -1 ){
                span.append(`<span>${dtext.foot.id}</span>`) // 原本的 w
            }
            
            if ( dtext.foot.footContent != null ){
                span.append('：')                
                const results_foot =render_dtexts_only(dtext.foot.footContent, version)
                // 【1】這是原本的 w，但要變成 
                span.append(results_foot)
            } else {
                if ( dtext.foot.id != -1 ){
                    span.addClass('ft') // 只有 id 的時候，會觸發原本的 click
                    span.attr('ft', dtext.foot.id)
                    span.attr('book', dtext.foot.book)
                    span.attr('chap', dtext.foot.chap)
                    span.attr('sec', dtext.foot.sec)
                    span.attr('ver', dtext.foot.version)
                }
            }
            span.append('】')
            span.addClass('foot')
        }
        if (dtext.isRef == 1){
            span.addClass('ref');
            if ( dtext.refDescription != null ){
                span.attr('addr-desc', dtext.refDescription)
            } else if (dtext.refAddresses != null ){
                span.attr('data-addrs', dtext.refAddresses)
            }
        }

        // 只有這幾個譯本才有 sn
        if (-1 != ["unv", "kjv", "rcuv", "fhlwh"].indexOf(version))
        {
            if (dtext.sn != null ){
                if ( dtext.tp2 == null ){
                    // sn-text
                    span.addClass('sn-text');
                    span.attr('sn', dtext.sn);     
                    span.attr('tp', dtext.tp)
                } else {
                    span.addClass('sn');
                    span.attr('sn', dtext.sn);     
                    span.attr('tp', dtext.tp)
                }

            }
        }

        results.push(span);
    }    
    return results;
}

/**
 * 
 * @param {DTextsWithAddr[]} dtexts_with_addr 
 * @param {string} version 
 * @returns {JQuery<HTMLElement>}
 */
function render_ref(dtexts_with_addr, version){
    // <span class="reference">1 </span>
    return $('<span></span>').addClass("reference").text(`${dtexts_with_addr[2]} `);
}