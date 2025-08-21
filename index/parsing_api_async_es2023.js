import { BibleConstant } from "./BibleConstant.es2023.js"
import { isRDLocation } from "./isRDLocation.es2023.js"

       // msg += `\n詞索引: ${r.wid} SN: G${get_sn_shorter(r.sn)} 原文字: ${r.word} 詞性: ${pro} 字彙分析: 『${wform}』 原型: ${r.orig} 原型簡義: 『${r.exp}』 備註:『 ${remark}』`
/**
 * 
 * @param {{book: number, chap: number, sec: number}} address 
 * @returns {Promise<{status: string, record: Array<{engs: string, chineses: string, chap: number, sec: number, wid:number, sn: string, wform: string, orig: string, remark: string, exp: string, word: string, pro: string}>}>}
 */
export async function parsing_api_async(address){
    // - qp.php 是核心
    let engs = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[address.book - 1]
    let chap = address.chap
    let sec = address.sec

    const ps = TPPageState.s;
    const gb = ps.gb

    let endpoint = `/json/qp.php?engs=${engs}&chap=${chap}&sec=${sec}&gb=${gb}`
    let host = isRDLocation() ? 'https://bible.fhl.net' : ''
    let url = host + endpoint
    try{
        const response = await $.ajax({ url });
        if (response.status === "success" && response.record.length > 0) {
            return response;
        }
        return "找不到資料 get_parsing_async a";
    }catch(error){
         return "找不到資料 get_parsing_async b";
    }
}