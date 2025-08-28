import { ai_get_address_tp } from "./ai_get_address_tp.js";
import { ai_get_bcvw } from "./ai_get_bcvw.js";
import { ai_parsing_gen_exp } from "./ai_parsing_gen_exp.js";
import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { gen_prompt_parsing_table } from "./parsing_gen_prompt_parsing_table_es2023.js";
import { gen_prompt_word_include_wid } from "./parsing_gen_prompt_word_include_wid_es2023.js";
import { ParsingCache } from "./ParsingCache_es2023.js";

/**
`# 參考資料: 原文

## 節: ${address_str} ${address_bcvw}

### 類型: 原文

${msg_word}

### 類型: 直譯

${msg_exp}

### 類型: 原文分析

${msg_prompt}`
 * 
 * @param {ParsingCache[]} caches 
 */
export function ai_parsing_gen_tp1(caches) {
    const tpAddress = ai_get_address_tp(caches.map(a1=>a1.address))

    /** @type {string[]} 最後再用 join*/
    const result = []

    const str_title_orig = "### 類型: 原文"
    const str_title_exp = "### 類型: 直譯"
    const str_title_table = "### 類型: 原文分析"

    const title = "# 參考資料: 原文"
    result.push(title)

    result.push(get_scripture_reference_format())

    for (let i = 0; i < caches.length; i++) {
        const cache = caches[i];
        const addr = cache.address

        // ## 節: 創世記 3:1 v1
        const str_addr = gen_one_addr(cache, tpAddress);
        result.push(str_addr);

        // ### 類型: 原文
        const msg_word = gen_prompt_word_include_wid(cache._jaWord, addr, tpAddress)
        result.push(str_title_orig)
        result.push(msg_word)

        // ### 類型: 直譯
        const msg_exp = ai_parsing_gen_exp(cache._joResult.record[0].exp)
        result.push(str_title_exp)
        result.push(msg_exp)

        // ### 類型: 原文分析
        const msg_prompt = gen_prompt_parsing_table(cache._joResult, cache._jaWord, tpAddress, addr, [])
        result.push(str_title_table)
        result.push(msg_prompt)
    }

    return result.join("\r\n\r\n")
}

function gen_one_addr(cache, tpAddress) {
    const addr = cache.address
    const [book, chap, sec] = addr
    const address_str = BibleConstantHelper.getBookNameArrayChineseFull()[book - 1] + ` ${chap}:${sec}`
    const address_bcvw = ai_get_bcvw(addr, -1, tpAddress)

    return `## 節: ${address_str} ${address_bcvw}`
}
function get_scripture_reference_format(){
return `- 標記說明: \`b\` \`c\` \`v\` \`w\` (用於標示聖經原文的章節位置與詞索引)
\t- b = book (書卷)
\t- c = chapter (章)
\t- v = verse (節)
\t- w = word (詞索引，用於標示該節中的原文字，編號為唯一ID，通常遞增，但不一定連續)
\t- 範例: b1c1v1w1 = 創世記 1:1 的第一個原文詞
\t- 若內容都在同一節中，則可省略 v，例如: w1 w2 w3
\t- 若內容都在同一章中，則可省略 c，例如: v1w1 v2w1
\t- 若內容都在同一書中，則可省略 b，例如: c1v31w1 c2v1w1`
}

