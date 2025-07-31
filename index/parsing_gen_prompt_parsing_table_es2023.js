
function get_sn_shorter(sn) {
    // sn 有可能是 09003 就變 9003
    // sn 也有可能有 09003a 就變 9003a
    return sn.replace(/^0+/, '')
}
/**
 * 
 * @param {*} jsonObj 
 * @param {*} tp 
 * @param {{w:string, wid?: number, wu?: 'w'|'u'}[]} jaWord 傳入此，協助判斷，韋式、聯式。目前版本，只顯示聯式，以後再開放設定
 * @param {{"SN"|"原文字"|"詞性"|"字彙分析"|"原型"|"原型簡義"|"備註"}[]} exclude 要排除的字序
 * @returns 
 */
export function gen_prompt_parsing_table(jsonObj, tp, jaWord, exclude = ["SN", "原型"]) {
    if (tp=='H'){
        return '' // not implemented
    }
    // - 找出哪些 wid, 具有 w, 等等要被 continue 的
    const wu_w_wids = jaWord.filter( a1 => a1.wid != null && a1.wu == 'w').map( a1 => a1.wid)

    let msg = ''
    for (let i = 1; i < jsonObj.record.length; i++) {
        let r = jsonObj.record[i]
        // 是 + 則略過
        if ( r.word == '+' ){
            continue
        }
        // - 韋式略過
        if ( wu_w_wids.includes(r.wid) ){
            continue
        }

        // const pro = trim 空白
        let pro = r.pro.trim()
        let remark = r.remark.trim()
        let wform = r.wform.trim()
        
        // msg += `\n字序: ${r.wid} SN: G${get_sn_shorter(r.sn)} 原文字: ${r.word} 詞性: ${pro} 字彙分析: 『${wform}』 原型: ${r.orig} 原型簡義: 『${r.exp}』 備註:『 ${remark}』`
        
        if (pro == '') pro = ' ' // 因為 `` 連續 2 個會變成特殊字元，所以還是要有個空白，或是「無」
        if (remark == '') remark = ' ' // 因為 `` 連續 2 個會變成特殊字元，所以還是要有個空白，或是「無」
        if (wform == '') wform = ' ' // 因為 `` 連續 2 個會變成特殊字元，所以還是要有個空白，或是「無」
        // msg += `\n字序: ${r.wid} SN: G${get_sn_shorter(r.sn)} 原文字: ${r.word} 詞性: ${pro} 字彙分析: \`${wform}\` 原型: ${r.orig} 原型簡義: \`${r.exp}\` 備註: \`${remark}\``

        // msg += `\n字序: \`${r.wid}\` SN: \`G${get_sn_shorter(r.sn)}\` 原文字: \`${r.word}\` 詞性: \`${pro}\` 字彙分析: \`${wform}\` 原型: \`${r.orig}\` 原型簡義: \`${r.exp}\` 備註: \`${remark}\``

         // msg += `\n- 字序: \`${r.wid}\` | SN: \`G${get_sn_shorter(r.sn)}\` | 原文字: \`${r.word}\` | 詞性: \`${pro}\` | 字彙分析: \`${wform}\` | 原型: \`${r.orig}\` | 原型簡義: \`${r.exp}\` | 備註: \`${remark}\``

         const msgs = [
            `字序: \`${r.wid}\``,
            `SN: \`G${get_sn_shorter(r.sn)}\``,
            `原文字: \`${r.word}\``,
            `詞性: \`${pro}\``,
            `字彙分析: \`${wform}\``,
            `原型: \`${r.orig}\``,
            `原型簡義: \`${r.exp}\``,
            `備註: \`${remark}\``
        ]
        const keys = ['字序', 'SN', '原文字', '詞性', '字彙分析', '原型', '原型簡義', '備註']
        // - 取得 indice ，哪些是要留的
        const indices = keys.map( (k, idx) => exclude.includes(k) ? -1 : idx ).filter( idx => idx >= 0 )
        // - 只保留要的
        msg += `\n- ` + indices.map( idx => msgs[idx] ).join(' | ')
    }
    return msg.substring(1) // 去掉第1個 \n
}