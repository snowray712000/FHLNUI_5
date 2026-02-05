/**
 * 動機:
 * 因為和合本2010的內文，就好像很多註腳一樣，只是它不是透過  api 取得。好的，它應該長得像註腳。
 * 
 * 目的:
 * 讓和合本2010 譯本的內文，看到註腳格式就轉成註腳的格式
 * 
 * 方法:
 * 在 cvt_others 流程中呼叫，不能太晚，不然 ( [2.8] 類似的結構會被破壞掉)
 */

/**
 * @typedef {import("./DText.js").DText} DText
 */

/**
 * @typedef {[number, number, number, DText[]]} DTextsWithAddr // [book, chap, sec, dtexts] 之所以要設計成 DText[] 而非 DText，是因為可能之後會被拆成多個 DText，在一節資料中。
 */


import { splitStringByRegex } from "./splitStringByRegex.es2023.js";

/**
 * @param {DTextsWithAddr} record_with_addr 
 * @param {string} version
 */
export function text_like_foot(dtexts_with_addr, version) {
    if (!['rcuv'].includes(version)) return;

    const book = dtexts_with_addr[0];
    const chap = dtexts_with_addr[1];
    const sec = dtexts_with_addr[2];
    const dtexts = dtexts_with_addr[3];

    const it = structuredClone(dtexts);
    let isChanged = false;
    const re = [];
    for (const it2a of it) {
        const re2 = doText(it2a);
        if (re2.length == 1) {
            re.push(re2[0]);
        }
        else {
            isChanged = true;

            for (const it3 of re2) {
                re.push(it3);
            }
        }
    }
    if (isChanged) {
        dtexts_with_addr[3] = re;
    }
    return;

    /**
     * doText implementation (mirrors original)
     * @param {DText} it2 
     * @returns {DText[]}
    */
    function doText(it2) {
        if (it2.w == null) {
            return [it2];
        }

        // 和合本 2010，rcuv...它的內文就有像 foot 的內容了，像是 ( [ 2.8] 「世上粗淺的學說」或譯「宇宙的星宿」；20-21節同。)
        if (version == "rcuv") {
            const reLocal = []
            // split by ( [ n.n] ... )
            // const r3 = splitStringByRegex(it2.w, /\(\s*\[\s*\d+\.\d+\s*\]/g); // 這個還不對，還缺右括號，中間要右括號以外的東西
            // const r3 = splitStringByRegex(it2.w, /\(\s*\[\s*\d+\.\d+\s*\][^\)]*\)/g); // 因為標準化，會讓它變 【註：】... 所以要 catpure 關鍵內容, 丟掉 ( [ 2.8] ) 這些沒必要的東西
            const r3 = splitStringByRegex(it2.w, /\(\s*\[\s*\d+\.\d+\s*\]([^\)]*)\)/g);
            if (r3 == null || r3.length == 1) {
                reLocal.push(it2);
            } else {
                // there will be multiple pieces
                for (const it3 of r3) {
                    // deep copy original it2 for properties carryover
                    const r4 = structuredClone(it2);
                    if ( it3.exec == null ){
                        r4.w = it3.w;
                    } else {
                        r4.w = '【註】' // 不能保留原本的，會被接下來的流程解析，也不能空的，會不見。
                        r4.foot = {
                            id: -1, // not used in rcuv version
                            version: version,
                            book: book,
                            chap: chap,
                            verse: sec,
                        };
                        r4.foot.footContent = [{ w: it3.exec[1] }];
                    }
                    
                    if (it3.exec != null) {
                    }
                    reLocal.push(r4);
                }
            }
            return reLocal
        }

        // impossible
        console.error("impossible here");
    }
}