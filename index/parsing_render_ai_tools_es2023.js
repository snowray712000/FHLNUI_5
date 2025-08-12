import { ParsingCache } from "./ParsingCache_es2023.js";
import { gen_prompt_parsing_table } from './parsing_gen_prompt_parsing_table_es2023.js'
import { gen_prompt_word_include_wid } from "./parsing_gen_prompt_word_include_wid_es2023.js";
import { copy_text_to_clipboard } from "./copy_text_to_clipboard_es2023.js";
import { parsing_api_async } from "./parsing_api_async_es2023.js";
import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { DialogHtml } from './DialogHtml.es2023.js'
import { help_ai_parsing_tp1 } from "./parsing_help_ai_parsing_tp1_es2023.js";
import { help_ai_parsing_tp1a } from "./parsing_help_ai_parsing_tp1a_es2023.js";
import { help_ai_parsing_tp1b } from "./parsing_help_ai_parsing_tp1b_es2023.js";

import { parsing_gen_prompt_tp1 } from "./parsing_gen_prompt_tp1_es2023.js"
import { parsing_gen_prompt_tp1a } from "./parsing_gen_prompt_tp1a_es2023.js"
import { parsing_gen_prompt_tp1b } from "./parsing_gen_prompt_tp1b_es2023.js"

function gen_prompt_exp(exp) {
    return exp.replace(/\n/g, "↩")
}
let isAlreadyRegistered = false

function set_div_text_and_restor(event){
    // - 顯示訊息，並在 1 秒後恢復原狀
    // - 1 秒內，不可再按 (移除 ai_parsing class)
    const text_ori = $(event.currentTarget).text()
    $(event.currentTarget).removeClass("ai_parsing").text("已複製到剪貼簿")
    setTimeout(() => {
        $(event.currentTarget).addClass("ai_parsing").text(text_ori)
    }, 1000);
}
function registerEvents() {
    if (isAlreadyRegistered) {
        return
    }
    isAlreadyRegistered = true

    $("#fhlInfoContent").on("click", ".ai_parsing", function (event) {
        const ps = TPPageState.s;
        const chap = ps.chap;
        const sec = ps.sec;
        const book = ps.bookIndex
        const tp = $(event.currentTarget).attr("method") || 'tp0';

        parsing_api_async({ book, chap, sec }).then(joResult => {
            // parsing_api_async({ book, chap, sec }).then(joResult => {
            let cache = ParsingCache.s
            cache.update_cache_and_normalize(joResult);

            // - render 純文字供複製
            const msg_word = gen_prompt_word_include_wid(cache._jaWord)
            const msg_exp = gen_prompt_exp(cache._joResult.record[0].exp)
            const msg_prompt = gen_prompt_parsing_table(cache._joResult, cache.get_HG, cache._jaWord, [])
            const address_str = BibleConstantHelper.getBookNameArrayChineseFull()[book - 1] + ` ${chap}:${sec}`

            // - 產生預設問題
            // const msg = `請閱讀以下 **原文譯本** 與 **原文分析** 資料，還不用說明任何東西，在下一段對話，我再詢問一些相關問題，你才回答我。`

            const tp0_msg = parsing_gen_prompt_tp1(address_str, msg_word, msg_exp, msg_prompt)
            if (tp == 'tp1') {
                // - 直接複製到剪貼簿
                copy_text_to_clipboard(tp0_msg)
                
                // - 按鈕文字變更「已複製」
                set_div_text_and_restor(event)
            } else if (tp == 'tp1a') {
                const copy_text = parsing_gen_prompt_tp1a(tp0_msg)
                copy_text_to_clipboard(copy_text)

                // - 按鈕文字變更「已複製」
                set_div_text_and_restor(event)
            } else if (tp == 'tp1b'){
                const copy_text = parsing_gen_prompt_tp1b(tp0_msg)
                copy_text_to_clipboard(copy_text)
                
                // - 按鈕文字變更「已複製」
                set_div_text_and_restor(event)
            } else {
                console.error("未知的 method: " + tp)
            }
        })
    })

    $("#fhlInfoContent").on("click", ".ai_parsing_help", function (event) {
        const tp = $(event.currentTarget).attr("method") || 'tp1';
        if (tp == 'tp1'){
            help_ai_parsing_tp1(event)
        } else if (tp == 'tp1a') {
            help_ai_parsing_tp1a(event)
        } else if (tp == 'tp1b') {
            help_ai_parsing_tp1b(event)
        }
    })
}
function render_ai_parsing_tp1_core(method){
    const tp_text_dict = {"tp1": "1:複製原文資料", "tp1a": "1a:結構分析", "tp1b": "1b:結構與對話"};
    const tp_text = tp_text_dict[method] ?? "unknown";
    const result = $("<div class='btn btn-outline-primary'></div>")
    $("<span class='ai_parsing' method='"+method+"'>"+tp_text+"</span>").appendTo(result);
    $("<span class='ai_parsing_help' method='"+method+"'>❓</span>").appendTo(result);
    return result;    
}

export function render_ai_tools() {
    // - 初期，以需求導向一個個開發，當變多時，再分類
    let fhlInfoContent = $("#fhlInfoContent");
    fhlInfoContent.html('')

    // $("<div> 開發測試中... </div>").appendTo(fhlInfoContent);

    fhlInfoContent.append("<h5>原文相關</h5>")

    render_ai_parsing_tp1_core('tp1').appendTo(fhlInfoContent);
    render_ai_parsing_tp1_core('tp1a').appendTo(fhlInfoContent);
    render_ai_parsing_tp1_core('tp1b').appendTo(fhlInfoContent);

    // fhlInfoContent.append("<h5>譯本比較相關</h5>")

    if (isAlreadyRegistered == false) {
        registerEvents();
    }
}