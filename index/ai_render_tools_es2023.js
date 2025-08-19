import { copy_text_to_clipboard } from "./copy_text_to_clipboard_es2023.js";
import { help_ai_parsing_tp1 } from "./ai_parsing_help_tp1_es2023.js";
import { help_ai_parsing_tp1a } from "./ai_parsing_help_tp1a_es2023.js";
import { help_ai_parsing_tp1b } from "./ai_parsing_help_tp1b_es2023.js";

import { cvtAddrsToRef } from "./cvtAddrsToRef.es2023.js"
import { isRDLocation } from "./isRDLocation.es2023.js"
import { TPPageState } from "./TPPageState.es2023.js";

import { ai_parsing_get_data_async } from "./ai_parsing_get_data_async_es2023.js";
import { ai_parsing_gen_tp1 } from "./ai_parsing_gen_tp1_es2023.js";
import { ai_parsing_gen_tp1a } from "./ai_parsing_gen_tp1a_es2023.js";

import { ai_translations_get_data_async } from "./ai_translations_get_data_async_es2023.js";
import { ai_translations_gen_tp1 } from "./ai_translations_gen_tp1_es2023.js";
import { ai_translation_help_tp1 } from "./ai_translations_help_tp1_es2023.js";
import { ai_translations_gen_tp1a } from "./ai_translations_gen_tp1a_es2023.js";
import { ai_translation_help_tp1a } from "./ai_translations_help_tp1a_es2023.js";
import { ai_parsing_gen_tp1b } from "./ai_parsing_gen_tp1b_es2023.js";
import { ai_translations_gen_tp1b } from "./ai_translations_gen_tp1b_es2023.js";
import { ai_translation_help_tp1b } from "./ai_translations_help_tp1b_es2023.js";
function gen_prompt_exp(exp) {
    return exp.replace(/\n/g, "↩")
}
let isAlreadyRegistered = false

function set_div_text_and_restor(event) {
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

    $("#fhlInfoContent").on("click", ".ai_parsing", async function (event) {
        const ps = TPPageState.s;
        const chap = ps.chap;
        const sec = ps.sec;
        const book = ps.bookIndex
        const tp = $(event.currentTarget).attr("method") || 'tp0';

        const cache = await ai_parsing_get_data_async({ book, chap, sec });

        // - render 純文字供複製
        if (tp == "tp1"){
            const copy_text = ai_parsing_gen_tp1(cache)
            copy_text_to_clipboard(copy_text)
            // - 按鈕文字變更「已複製」
            set_div_text_and_restor(event)            
        } else if (tp=="tp1a"){
            const copy_text = ai_parsing_gen_tp1(cache)
            const copy_text2 = ai_parsing_gen_tp1a(copy_text)
            copy_text_to_clipboard(copy_text2)
            set_div_text_and_restor(event)
        } else if (tp=="tp1b"){
            const copy_text = ai_parsing_gen_tp1(cache)
            const copy_text2 = ai_parsing_gen_tp1b(copy_text)
            copy_text_to_clipboard(copy_text2)
            set_div_text_and_restor(event)
        }
    })

    $("#fhlInfoContent").on("click", ".ai_parsing_help", function (event) {
        const tp = $(event.currentTarget).attr("method") || 'tp1';
        if (tp == 'tp1') {
            help_ai_parsing_tp1(event)
        } else if (tp == 'tp1a') {
            help_ai_parsing_tp1a(event)
        } else if (tp == 'tp1b') {
            help_ai_parsing_tp1b(event)
        }
    })
    $("#fhlInfoContent").on("click", ".ai_translation", async function (event) {
        const tp = $(event.currentTarget).attr("method") || 'tp1';

        // - 準備參數，給 api 用
        const ps = TPPageState.s;
        const translations = ps.version
        const addrs = [[ps.bookIndex, ps.chap, ps.sec]]
        if (tp == "tp1") {
            // - 抓譯本資料，並且轉換
            const a1 = await ai_translations_get_data_async(addrs, translations)
            // - 產生 #譯本資料 標準內容
            const text_copy = ai_translations_gen_tp1(a1)
            // - 按鈕文字變更「已複製」
            copy_text_to_clipboard(text_copy)
            set_div_text_and_restor(event)
        } else if (tp == "tp1a") {
            // - 抓譯本資料，並且轉換
            const addrs = [[ps.bookIndex, ps.chap, ps.sec]]            
            const a1 = await ai_translations_get_data_async(addrs, translations)
            const text_copy = ai_translations_gen_tp1(a1)
            const text_copy2 = ai_translations_gen_tp1a(text_copy)
            copy_text_to_clipboard(text_copy2)
            set_div_text_and_restor(event)
        } else if (tp == "tp1b"){
            const parsing_and_translations = await Promise.all([
                ai_parsing_get_data_async({ book: ps.bookIndex, chap: ps.chap, sec: ps.sec }),
                ai_translations_get_data_async(addrs, translations)
            ])
            const parsing_standard_content = ai_parsing_gen_tp1(parsing_and_translations[0])
            const translation_standard_content = ai_translations_gen_tp1(parsing_and_translations[1])
            const text_copy = ai_translations_gen_tp1b(parsing_standard_content, translation_standard_content)
            copy_text_to_clipboard(text_copy)
            set_div_text_and_restor(event)
        }
    })

    $("#fhlInfoContent").on("click", ".ai_translation_help", function (event) {
        const tp = $(event.currentTarget).attr("method") || 'tp1';
        if (tp == 'tp1') {
            ai_translation_help_tp1(event)
        } else if (tp == 'tp1a') {
            ai_translation_help_tp1a(event)
        } else if (tp == 'tp1b') {
            ai_translation_help_tp1b(event)
        }
    })
}
function render_ai_parsing_tp1_core(method) {
    const tp_text_dict = { "tp1": "1:複製原文資料", "tp1a": "1a:結構分析", "tp1b": "1b:結構與對話" };
    const tp_text = tp_text_dict[method] ?? "unknown";
    const result = $("<div class='btn btn-outline-primary'></div>")
    $("<span class='ai_parsing' method='" + method + "'>" + tp_text + "</span>").appendTo(result);
    $("<span class='ai_parsing_help' method='" + method + "'>❓</span>").appendTo(result);
    return result;
}
function render_ai_translation_tp1_core(method) {
    const tp_text_dict = { "tp1": "1:譯本資料", "tp1a": "1a:對齊後比較", "tp1b": "1b:加入原文分析" };
    const tp_text = tp_text_dict[method] ?? "unknown";
    const result = $("<div class='btn btn-outline-primary'></div>")
    $("<span class='ai_translation' method='" + method + "'>" + tp_text + "</span>").appendTo(result);
    $("<span class='ai_translation_help' method='" + method + "'>❓</span>").appendTo(result);
    return result;
}

export function ai_render_tools() {
    // - 初期，以需求導向一個個開發，當變多時，再分類
    let fhlInfoContent = $("#fhlInfoContent");
    fhlInfoContent.html('')

    // $("<div> 開發測試中... </div>").appendTo(fhlInfoContent);

    fhlInfoContent.append("<h5>原文相關</h5>")

    render_ai_parsing_tp1_core('tp1').appendTo(fhlInfoContent);
    render_ai_parsing_tp1_core('tp1a').appendTo(fhlInfoContent);
    render_ai_parsing_tp1_core('tp1b').appendTo(fhlInfoContent);

    fhlInfoContent.append("<h5>譯本比較相關</h5>")

    render_ai_translation_tp1_core('tp1').appendTo(fhlInfoContent);
    render_ai_translation_tp1_core('tp1a').appendTo(fhlInfoContent);
    render_ai_translation_tp1_core('tp1b').appendTo(fhlInfoContent);

    if (isAlreadyRegistered == false) {
        registerEvents();
    }
}