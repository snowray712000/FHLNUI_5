import { BibleConstant } from "./BibleConstant.es2023.js";
import { isRDLocation } from "./isRDLocation.es2023.js";
import { ParsingCache } from "./ParsingCache_es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";


/**
 * 取得資料，正規化 address，並存入 cache
 * @param {number[][]} addresses 
 * @returns {Promise<ParsingCache[]>}
 */
export async function ai_parsing_get_data_async(addresses) {
    // - qp.php 是核心
    return await Promise.all(addresses.map(addr => fetch_one_async(addr)));
}

async function fetch_one_async(addr) {
    const [book, chap, sec] = addr;
    const ps = TPPageState.s;
    const gb = ps.gb;
    const engs = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[book - 1];

    let endpoint = `/json/qp.php?engs=${engs}&chap=${chap}&sec=${sec}&gb=${gb}`;
    let host = isRDLocation() ? 'http://127.0.0.1:5600' : '';
    let url = host + endpoint;

    try {
        const response = await fetch(url);
        const data = await response.json();

        let cache = new ParsingCache();
        cache.update_cache_and_normalize(data);
        return cache;
    } catch (error) {
        return "找不到資料 get_parsing_async b";
    }
}