import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { gen_prompt_parsing_table } from "./parsing_gen_prompt_parsing_table_es2023.js";
import { gen_prompt_word_include_wid } from "./parsing_gen_prompt_word_include_wid_es2023.js";
import { ParsingCache } from "./ParsingCache_es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";

function gen_prompt_exp(exp) {
    return exp.replace(/\r?\n\r?/g, " ↩ ")
}

/**
 * @param {ParsingCache} cache 
 */
export function ai_parsing_gen_tp1(cache) {
    const msg_word = gen_prompt_word_include_wid(cache._jaWord, -1)
    const msg_exp = gen_prompt_exp(cache._joResult.record[0].exp)
    const msg_prompt = gen_prompt_parsing_table(cache._joResult, cache.get_HG, cache._jaWord, -1, [])
    
    const ps = TPPageState.s
    const book = ps.bookIndex
    const chap = ps.chap
    const sec = ps.sec
    const address_str = BibleConstantHelper.getBookNameArrayChineseFull()[book - 1] + ` ${chap}:${sec}`

return `# 參考資料

## 節: ${address_str}

### 類型: 原文

${msg_word}

### 類型: 直譯

${msg_exp}

### 類型: 原文分析

${msg_prompt}`    
}