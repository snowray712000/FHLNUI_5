import { FhlInfoContent } from "./FhlInfoContent.es2023.js";
import { getAjaxUrl } from "./getAjaxUrl.es2023.js";
import { parsing_api_async } from "./parsing_api_async_es2023.js";
import { parsing_render_bottom_table } from "./parsing_render_bottom_table.es2023.js";
import { parsing_render_top } from "./parsing_render_top.es2023.js";
import { ParsingCache } from "./ParsingCache_es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";


export async function parsing_render_async() {
    // - 取得 api 
    const ps = TPPageState.s;
    const book = ps.bookIndex;
    const chap = ps.chap;
    const sec = ps.sec;
    /** @type {IDParsingResult} */
    const jsonObj = await parsing_api_async({ book, chap, sec })
    
    // - 處理 api 結果，使其 address 能一致 用 book，不用 engs chineses
    // - 同時，也將 wid 與 原文綁成一對，這樣在 render top 就很簡單用
    ParsingCache.s.update_cache_and_normalize(jsonObj)

    let html = parsing_render_top(jsonObj, ps)
    html += parsing_render_bottom_table(jsonObj, jsonObj.N == 1 ? 'H' : 'G')

    // 中間那個灰框，這也是為何 top 會是 212 px 的原因
    html = "<div style='position: absolute; top: 200px; left: 0px; right: 0px; height: 12px; background: #A0A0A0;'></div>" + html + "";

    FhlInfoContent.s.dom.html(html);

    FhlInfoContent.s.registerEvents(TPPageState.s)

}