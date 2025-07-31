export function gen_prompt_word_include_wid(jaWord) {
    let text = ''
    for (let i1 = 0; i1 < jaWord.length; i1++) {
        const item = jaWord[i1];
        // - + 符號不顯示
        // - 先以聯式為主，以後再開啟切換
        if (item.w == '+') {
            continue
        }
        if (item.wu == 'w') {
            continue
        }

        // - 原文物件與非原文物件不用再加空白，因為符號的字串中，原本的空白都還存在
        if (item.wid) {
            text += `\`${item.wid}\` ${item.w}`
        } else {
            text += item.w.replaceAll(/\n/g, '↩')
        }
    }
    return text
}