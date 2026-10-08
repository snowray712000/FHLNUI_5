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
import { BibleConstant } from "./BibleConstant.es2023.js";
import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { ParagraphData } from "./ParagraphData_es2023.js";
import { ai_translations_set_count_sec } from "./ai_translations_set_count_sec.js";
import { ai_get_address_paragraph } from "./ai_get_address_paragraph.js";
import { ai_get_address_chapter } from "./ai_get_address_chapter.js";
import { ai_get_limited_address_range } from "./ai_get_limited_address_range.js";
import { gen_prompt_parsing_table } from "./parsing_gen_prompt_parsing_table_es2023.js";


function gen_prompt_exp(exp) {
    return exp.replace(/\n/g, "↩")
}
let isAlreadyRegistered = false

function set_div_text_and_restore(event) {
    // - 顯示訊息，並在 1 秒後恢復原狀
    const text_ori = $(event.currentTarget).text()
    $(event.currentTarget).text("已複製到剪貼簿")
    setTimeout(() => {
        $(event.currentTarget).text(text_ori)
    }, 300);
}
async function reg_on_click_ai_parsing_async(event) {

    const tp = $(event.currentTarget).attr("method") || 'tp0';

    const fn_get_basic = async () => {
        const ps = TPPageState.s;
        const addrs = [[ps.bookIndex, ps.chap, ps.sec]]
        const caches = await ai_parsing_get_data_async(addrs);
        return ai_parsing_gen_tp1(caches)
    }
    const fn_get_multi = async () => {
        const ps = TPPageState.s;
        const addrs = get_addrs_multi_verse([ps.bookIndex, ps.chap, ps.sec])
        const caches = await ai_parsing_get_data_async(addrs);
        return ai_parsing_gen_tp1(caches)
    }

    // - render 純文字供複製
    if (tp == "tp1") {
        await copy_text_to_clipboard(async () => await fn_get_basic())
        // - 按鈕文字變更「已複製」
        set_div_text_and_restore(event)
    } else if (tp == "tp1a") {
        await copy_text_to_clipboard(async () => ai_parsing_gen_tp1a(await fn_get_basic()))
        set_div_text_and_restore(event)
    } else if (tp == "tp1b") {
        await copy_text_to_clipboard(async () => ai_parsing_gen_tp1b(await fn_get_basic()))
        set_div_text_and_restore(event)
    } else if (tp == "tp2") {
        await copy_text_to_clipboard(async () => await fn_get_multi())
        set_div_text_and_restore(event)
    } else if (tp == "tp2a") {
        await copy_text_to_clipboard(async () => ai_parsing_gen_tp1a(await fn_get_multi()))
        set_div_text_and_restore(event)
    } else if (tp == "tp2b") {
        await copy_text_to_clipboard(async () => ai_parsing_gen_tp1b(await fn_get_multi()))
        set_div_text_and_restore(event)
    }
}
async function reg_on_click_ai_translation_async(event) {
    const tp = $(event.currentTarget).attr("method") || 'tp1';

    const fn_get_addresses = () => {
        // tp1 開頭
        if (/tp1/.test(tp)) {
            const ps = TPPageState.s;
            const addrs = [[ps.bookIndex, ps.chap, ps.sec]]
            return addrs
        } else {
            const ps = TPPageState.s;
            const addrs = get_addrs_multi_verse([ps.bookIndex, ps.chap, ps.sec])
            return addrs
        }
    }

    const addrs = fn_get_addresses()
    const translations = ps.version

    if (tp == "tp1" || tp == "tp2") {
        await copy_text_to_clipboard(async () => {
            // - 抓譯本資料，並且轉換
            const a1 = await ai_translations_get_data_async(addrs, translations)
            // - 產生 #譯本資料 標準內容
            const text_copy = ai_translations_gen_tp1(a1)
            return text_copy
        })
        // - 按鈕文字變更「已複製」
        set_div_text_and_restore(event)
    } else if (tp == "tp1a" || tp == "tp2a") {
        await copy_text_to_clipboard(async () => {
            // - 抓譯本資料，並且轉換
            const a1 = await ai_translations_get_data_async(addrs, translations)
            const text_copy = ai_translations_gen_tp1(a1)
            const text_copy2 = ai_translations_gen_tp1a(text_copy)
            return text_copy2
        })
        set_div_text_and_restore(event)
    } else if (tp == "tp1b" || tp == "tp2b") {
        await copy_text_to_clipboard(async () => {
            const parsing_and_translations = await Promise.all([
                ai_parsing_get_data_async(addrs),
                ai_translations_get_data_async(addrs, translations)
            ])
            const parsing_caches = parsing_and_translations[0]
            const translations_data = parsing_and_translations[1]

            const parsing_standard_content = ai_parsing_gen_tp1(parsing_caches)
            const translation_standard_content = ai_translations_gen_tp1(translations_data)
            const text_copy = ai_translations_gen_tp1b(parsing_standard_content, translation_standard_content)
            return text_copy
        })
        set_div_text_and_restore(event)
    }
}
function registerEvents() {
    if (isAlreadyRegistered) {
        return
    }
    isAlreadyRegistered = true

    $("#fhlInfoContent").on("click", ".ai_parsing", async function (event) {
        await reg_on_click_ai_parsing_async(event)
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
        await reg_on_click_ai_translation_async(event)
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
    $("#fhlInfoContent").on("click", ".setting", function (event) {
        const tp = $(event.currentTarget).attr("tp") || 'tp1';
        if (tp == 'count_of_verse') {
            ai_translations_set_count_sec(event)
        }
    })

    $('#fhlInfoContent').on('click', '.ai_dev', async function (event) {
        const tp = $(event.currentTarget).attr("method") || 'tp1';
        if (tp == 'tp1') {
            // const addrs = get_addrs_multi_verse([ps.bookIndex, ps.chap, ps.sec])
            const addrs = ai_get_limited_address_range([ps.bookIndex, 1, 1], 9999)
            const caches = await ai_parsing_get_data_async(addrs);

            let result = ""
            const tpAddress = 2
            for (let idx = 0; idx < caches.length; idx++) {
                const one_cache = caches[idx];
                const addr = one_cache.address
                const table_str = gen_prompt_parsing_table(one_cache._joResult, one_cache._jaWord, tpAddress, addr, [])

                // result += `### c${addr[1]}v${addr[2]}\r\n` + table_str + "\r\n\r\n" 
                result += table_str + "\r\n"
            }

            console.log(result);
            
            
        } else if (tp == 'tp1a') {
            alert("開發中，敬請期待")
        } else if (tp == 'tp1b') {
            alert("開發中，敬請期待")
        }
    })

}
function gen_dev(){
    ai_parsing_gen_tp1
}

/**
 * tp2 要用
 * @param {number[]} addr [book,chap,sec] 起始節
 * @returns {number[][]}
 */
function get_addrs_multi_verse(addr) {
    const ps = TPPageState.s
    const flag_query_data = ps.ai_is_auto_count_of_verse; // 1: 自動，0: 節，2: 本章，3: 章數
    if ( flag_query_data == 0 ){
        return ai_get_limited_address_range(addr, ps.ai_count_of_verse)
    }
    if ( flag_query_data == 1 ){
        return ai_get_address_paragraph(addr)
    }
    if ( flag_query_data == 2 ){
        return ai_get_address_chapter(addr)
    }
    if ( flag_query_data == 3 ){
        return ai_get_address_chapter(addr, ps.ai_count_of_verse)
    }
    return [addr]
}
function render_setting_about_multi_verse() {
    return $("<span class='setting' tp='count_of_verse'> 🔧 </span>")
}
function render_ai_parsing_tp1_core(method) {
    const tp_text_dict = { "tp1": "1:複製原文資料", "tp1a": "1a:結構分析", "tp1b": "1b:結構與對話", "tp2": "2: 多節", "tp2a": "2a:", "tp2b": "2b:" };
    const tp_text = tp_text_dict[method] ?? "unknown";
    const result = $("<div class='btn btn-outline-primary ai-tool'></div>")

    // 描述
    $("<span class='ai_parsing' method='" + method + "'>" + tp_text + "</span>").appendTo(result);

    // ❓
    if (["tp1", "tp1a", "tp1b"].indexOf(method) >= 0) {
        $("<span class='ai_parsing_help' method='" + method + "'>❓</span>").appendTo(result);
    }

    // 🔧
    if (method == "tp2") {
        render_setting_about_multi_verse().appendTo(result);
    }
    return result;
}
function render_ai_translation_tp1_core(method) {
    const tp_text_dict = { "tp1": "1:譯本資料", "tp1a": "1a:對齊後比較", "tp1b": "1b:加入原文分析", "tp2": "2:多節", "tp2a": "2a:", "tp2b": "2b:" };
    const tp_text = tp_text_dict[method] ?? "unknown";
    const result = $("<div class='btn btn-outline-primary ai-tool'></div>")
    $("<span class='ai_translation' method='" + method + "'>" + tp_text + "</span>").appendTo(result);

    // ❓
    if (["tp1", "tp1a", "tp1b"].indexOf(method) >= 0) {
        $("<span class='ai_translation_help' method='" + method + "'>❓</span>").appendTo(result);
    }

    // 🔧
    if (method == "tp2") {
        render_setting_about_multi_verse().appendTo(result);
    }
    return result;
}
function render_ai_dev(method) {
    const tp_text_dict = { "tp1": "1:dev", "tp1a": "1a:結構分析", "tp1b": "1b:結構與對話", "tp2": "2: 多節", "tp2a": "2a:", "tp2b": "2b:" };
    const tp_text = tp_text_dict[method] ?? "unknown";
    const result = $("<div class='btn btn-outline-primary ai-tool'></div>")

    // 描述
    $("<span class='ai_dev' method='" + method + "'>" + tp_text + "</span>").appendTo(result);

    // ❓
    if (["tp1", "tp1a", "tp1b"].indexOf(method) >= 0) {
        $("<span class='ai_dev_help' method='" + method + "'>❓</span>").appendTo(result);
    }

    // 🔧
    if (method == "tp2") {
        render_setting_about_multi_verse().appendTo(result);
    }
    return result;
}


export function ai_render_tools() {
    // - 初期，以需求導向一個個開發，當變多時，再分類
    let fhlInfoContent = $("#fhlInfoContent");
    fhlInfoContent.html('')

    // // $("<div> 開發測試中... </div>").appendTo(fhlInfoContent);

    fhlInfoContent.append("<h5 class='ai-h'>原文相關</h5>")

    render_ai_parsing_tp1_core('tp1').appendTo(fhlInfoContent);
    render_ai_parsing_tp1_core('tp1a').appendTo(fhlInfoContent);
    render_ai_parsing_tp1_core('tp1b').appendTo(fhlInfoContent);
    render_ai_parsing_tp1_core('tp2').appendTo(fhlInfoContent);
    render_ai_parsing_tp1_core('tp2a').appendTo(fhlInfoContent);
    render_ai_parsing_tp1_core('tp2b').appendTo(fhlInfoContent);

    fhlInfoContent.append("<h5 class='ai-h'>譯本比較相關</h5>")

    render_ai_translation_tp1_core('tp1').appendTo(fhlInfoContent);
    render_ai_translation_tp1_core('tp1a').appendTo(fhlInfoContent);
    render_ai_translation_tp1_core('tp1b').appendTo(fhlInfoContent);
    render_ai_translation_tp1_core('tp2').appendTo(fhlInfoContent);
    render_ai_translation_tp1_core('tp2a').appendTo(fhlInfoContent);
    render_ai_translation_tp1_core('tp2b').appendTo(fhlInfoContent);

    //fhlInfoContent.append("<h5 class='ai-h'>開發中</h5>")
    //render_ai_dev('tp1').appendTo(fhlInfoContent);

    if (isAlreadyRegistered == false) {
        registerEvents();
    }
}