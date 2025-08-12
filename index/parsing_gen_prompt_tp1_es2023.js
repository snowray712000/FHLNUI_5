export function parsing_gen_prompt_tp1(address_str, msg_word, msg_exp, msg_prompt) {
    return `# 參考資料

## 節: ${address_str}

### 類型: 原文

${msg_word}

### 類型: 直譯

${msg_exp}

### 類型: 原文分析

${msg_prompt}`
}