import { ParsingCache } from "./ParsingCache_es2023.js";
import { gen_prompt_parsing_table } from './parsing_gen_prompt_parsing_table_es2023.js'
import { gen_prompt_word_include_wid } from "./parsing_gen_prompt_word_include_wid_es2023.js";
import { copy_text_to_clipboard } from "./copy_text_to_clipboard_es2023.js";
import { parsing_api_async } from "./parsing_api_async_es2023.js";
import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { DialogHtml } from './DialogHtml.es2023.js'
import { help_ai_parsing_tp0 } from "./parsing_help_ai_parsing_tp0_es2023.js";

function gen_prompt_exp(exp) {
    return exp.replace(/\n/g, "↩")
}
let isAlreadyRegistered = false

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

            //             // - 產生預設問題
            //             const msg = `請根據以下**原文譯本**與**原文分析**資料，回答：
            // 1. 這段經文的主幹結構是什麼？主詞、動詞、受詞分別是哪幾個詞？
            // 2. 哪些詞是修飾語？它們修飾哪個主詞或動詞？請用樹狀或縮排方式，分層整理主幹與修飾語，並標註語法角色。
            // 3. 原文和譯文的語意有什麼差異？哪些詞在原文中有特別的語法或語意功能？`

            // - 產生預設問題
            // const msg = `請閱讀以下 **原文譯本** 與 **原文分析** 資料，還不用說明任何東西，在下一段對話，我再詢問一些相關問題，你才回答我。`

            if (tp == 'tp0') {
                const copy_text = `# 參考資料

## 節: ${address_str}

### 類型: 原文

${msg_word}

### 類型: 直譯

${msg_exp}

### 類型: 原文分析

${msg_prompt}
`
                // - 直接複製到剪貼簿
                copy_text_to_clipboard(copy_text)
                // - 顯示訊息，並在 1 秒後恢復原狀
                // - 1 秒內，不可再按 (移除 ai_parsing class)
                const text_ori = $(event.currentTarget).text()
                $(event.currentTarget).removeClass("ai_parsing").text("已複製到剪貼簿")
                setTimeout(() => {
                    console.log(text_ori)
                    $(event.currentTarget).addClass("ai_parsing").text(text_ori)
                }, 1000);
            } else if (tp == 'tp1') {
                const msg = `請根據以下 **原文譯本** 與 **原文分析** 資料回答問題。另外，若需要回答結構相關問題，可參照下面規格回答：
1. 這段經文的主幹結構是什麼？主詞、動詞、受詞分別是哪幾個詞？        
視覺化結構(例子):
2. 哪些詞是修飾語？它們修飾哪個主詞或動詞？請用樹狀或縮排方式，分層整理主幹與修飾語，並標註語法角色。
3. 原文和譯文的語意有什麼差異？哪些詞在原文中有特別的語法或語意功能？

視覺化結構(規格範例):
- 主句1: v12 「這些人」...「將被敗壞」
  - └─ v13–v15前段：一連串分詞（補充說明「這些人」的行為與狀態）
- 主句2: v15 「他們走錯路」
  - └─ 分詞子句:「他們跟隨」（補充：他們是怎麼走錯路，是跟隨了巴蘭的路）
    - └─ 關係子句: 「他貪愛」(補充: 巴蘭是貪愛不義之財的先知)\n\n`
                const copy_text = msg + "原文譯本(包含字序):\n" + msg_word + "\n" + msg_exp +
                    "\n\n原文分析:\n" + msg_prompt
                copy_text_to_clipboard(copy_text)
            } else {
                console.error("未知的 method: " + tp)
            }
        })
    })

    $("#fhlInfoContent").on("click", ".ai_parsing_help", function (event) {
        const tp = $(event.currentTarget).attr("method") || 'tp0';
        if (tp == 'tp0'){
            help_ai_parsing_tp0(event)
        }
    })
}
function render_ai_parsing_tp0() {
    const result = $("<div class='btn btn-outline-primary'></div>")
    $("<span class='ai_parsing' method='tp0'>複製原文資料</span>").appendTo(result);
    $("<span class='ai_parsing_help' method='tp0'>❓</span>").appendTo(result);
    return result;
}
export function render_ai_tools() {
    // - 初期，以需求導向一個個開發，當變多時，再分類
    let fhlInfoContent = $("#fhlInfoContent");
    fhlInfoContent.html('')

    $("<div> 開發測試中... </div>").appendTo(fhlInfoContent);

    fhlInfoContent.append("<h5>原文相關</h5>")

    render_ai_parsing_tp0().appendTo(fhlInfoContent);

    // fhlInfoContent.append("<hr/>")
    // fhlInfoContent.append("<h5>譯本比較相關</h5>")


    // $("<div class='ai_parsing btn btn-outline-primary' method='tp1'>延伸1: 結構分析</div>").appendTo(fhlInfoContent);

    if (isAlreadyRegistered == false) {
        registerEvents();
    }
}