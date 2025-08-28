import { ai_get_bcvw } from "./ai_get_bcvw.js";

function get_sn_shorter(sn) {
    // sn 有可能是 09003 就變 9003
    // sn 也有可能有 09003a 就變 9003a
    return sn.replace(/^0+/, '')
}

const LRM = "\u200E"; // Left-to-Right Mark 
const RLM = "\u200F"; // Right-to-Left Mark 


function gen_for_greek(jsonObj, jaWord, tpAddress, address, exclude){
    // - sec，< 1，就是只使用 w1 w2，反之，使用 v2w1 v2w2
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
        
        if (pro == '') pro = ' ' // 因為 `` 連續 2 個會變成特殊字元，所以還是要有個空白，或是「無」
        if (remark == '') remark = ' ' // 因為 `` 連續 2 個會變成特殊字元，所以還是要有個空白，或是「無」
        if (wform == '') wform = ' ' // 因為 `` 連續 2 個會變成特殊字元，所以還是要有個空白，或是「無」

        const bcvwid = ai_get_bcvw(address, r.wid, tpAddress)
        const msgs = [
            `詞索引: \`${bcvwid}\``,
            `SN: \`G${get_sn_shorter(r.sn)}\``,
            `原文字: \`${r.word}\``,
            `詞性: \`${pro}\``,
            `字彙分析: \`${wform}\``,
            `原型: \`${r.orig}\``,
            `原型簡義: \`${r.exp}\``,
            `備註: \`${remark}\``
        ]
        const keys = ['詞索引', 'SN', '原文字', '詞性', '字彙分析', '原型', '原型簡義', '備註']
        // - 取得 indice ，哪些是要留的
        const indices = keys.map( (k, idx) => exclude.includes(k) ? -1 : idx ).filter( idx => idx >= 0 )
        // - 只保留要的
        msg += `\n- ` + indices.map( idx => msgs[idx] ).join(' | ')
    }
    return msg.substring(1) // 去掉第1個 \n
}
function fix_str_for_hebrew_parsing(s){
    // ### 王上3:5
    // - 我的邏輯是，希伯來文被遇到，會觸發弱字元判別，這沒問題，但 + 與 2 原本會被自動判別進去，但不要。因此，只要是希伯來文詞的尾端，都加上 LRM，以我的 case 就能解決了。
    // - 使用 regex 找出希伯來文字眼，然後再希伯來文字後加一個 LRM
    const RTL_RX = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]+/g; // 希伯來/阿拉伯等
    s = s.replaceAll(RTL_RX, (match) => match + LRM)
    return s
}

function gen_for_hebrew(jsonObj, jaWord, tpAddress, address, exclude){
    // - sec，< 1，就是只使用 w1 w2，反之，使用 v2w1 v2w2
    // - 舊約沒 .pro 詞性
    
    // - 找出哪些 wid, 具有 w, 等等要被 continue 的
    const wu_w_wids = jaWord.filter( a1 => a1.wid != null).map( a1 => a1.wid)

    let msg = ''
    for (let i = 1; i < jsonObj.record.length; i++) {
        let r = jsonObj.record[i]
        
        let remark = r.remark.trim()
        let wform = r.wform.trim()

        // - 防止 王上3:5 內容
        remark = fix_str_for_hebrew_parsing(remark)
        wform = fix_str_for_hebrew_parsing(wform)
        
        if (remark == '') remark = ' ' // 因為 `` 連續 2 個會變成特殊字元，所以還是要有個空白，或是「無」
        if (wform == '') wform = ' ' // 因為 `` 連續 2 個會變成特殊字元，所以還是要有個空白，或是「無」

        const bcvwid = ai_get_bcvw(address, r.wid, tpAddress)
        const msgs = [
            `詞索引: \`${bcvwid}\``,
            `SN: \`H${get_sn_shorter(r.sn)}\``,
            `原文字: \`${r.word}\``,
            `字彙分析: \`${wform}\``,
            `原型: \`${r.orig}\``,
            `原型簡義: \`${r.exp}\``,
            `備註: \`${remark}\``
        ]
        const keys = ['詞索引', 'SN', '原文字', '字彙分析', '原型', '原型簡義', '備註']
        // - 取得 indice ，哪些是要留的
        const indices = keys.map( (k, idx) => exclude.includes(k) ? -1 : idx ).filter( idx => idx >= 0 )
        // - 只保留要的
        msg += `\n- ` + indices.map( idx => msgs[idx] ).join(' | ')
    }
    return msg.substring(1) // 去掉第1個 \n
}

/**
 * 
 * @param {*} jsonObj 
 * @param {{w:string, wid?: number, wu?: 'w'|'u'}[]} jaWord 傳入此，協助判斷，韋式、聯式。目前版本，只顯示聯式，以後再開放設定
 * @param {number} tpAddress 0: 只需要 w。1: 需要 v。2: 需要 c。3: 需要b。
 * @param {number[]} address [book,chap,sec]
 * @param {{"SN"|"原文字"|"詞性"|"字彙分析"|"原型"|"原型簡義"|"備註"}[]} exclude 要排除的索引
 * @returns 
 */
export function gen_prompt_parsing_table(jsonObj, jaWord, tpAddress, address, exclude = ["SN", "原型"]) {
    if ( address[0] < 40 ){
        return gen_for_hebrew(jsonObj, jaWord, tpAddress, address, exclude)
    }
    return gen_for_greek(jsonObj, jaWord, tpAddress, address, exclude)
}