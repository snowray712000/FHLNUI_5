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
import { dtexts_render } from "./dtext/dtexts_render.js"
function render_dtexts_only(dtexts, version, addr){
    return dtexts_render(dtexts)
}
