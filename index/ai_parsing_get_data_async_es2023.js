import { BibleConstant } from "./BibleConstant.es2023.js";
import { isRDLocation } from "./isRDLocation.es2023.js";
import { ParsingCache } from "./ParsingCache_es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";

/**
 * 取得資料，正規化 address，並存入 cache
 * @param {{ book: number, chap: number, sec: number }} address 
 * @returns {Promise<ParsingCache>}
 */
export async function ai_parsing_get_data_async(address) {    
    // - qp.php 是核心
    let engs = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[address.book - 1]
    let chap = address.chap
    let sec = address.sec

    const ps = TPPageState.s;
    const gb = ps.gb

    let endpoint = `/json/qp.php?engs=${engs}&chap=${chap}&sec=${sec}&gb=${gb}`
    // let host = isRDLocation() ? 'https://bible.fhl.net' : ''
    let host = isRDLocation() ? 'http://127.0.0.1:5600' : ''
    let url = host + endpoint

    try{
        const response = await fetch(url)
        const data = await response.json();

        let cache = ParsingCache.s
        cache.update_cache_and_normalize(data);
        return cache        
    }catch(error){
         return "找不到資料 get_parsing_async b";
    }    
}
