import { splitStringByRegex } from "./splitStringByRegex.es2023.js";

/**
 * ### 有這個函式， parsing 中 top 的繪圖就不會難
 * - 使用前提，已將舊約的順序交換了。已將舊約中沒必要的 \r 拿掉了。
 * - 使用前提，record 的數量 - 1，會等於 wid 原文數量
 * @param {string} word 
 * @returns {{w:string, wid?: number, wu?: 'w'|'u'}[]}
 */
export function parsing_bind_word_and_wid_and_wu_es2023(word){
    // ### 把每一個與對應的資料綁在一起
    // - 前提，word 還包含換行符號。
    // - 產生，{wid: 1, w: '原文1'}, {w:' '}, {wid: 2, w: '原文2'}, ... 的格式
    // - 將原文，與符號分開。使用 splitStringByRegex 中 { .exec } 不是 null 表示是原文
    const wordArray = splitStringByRegex(word, /[^ \n\r־,.]+/g)
    let wid = 1
    for (let i = 0; i < wordArray.length; i++) {
        let w = wordArray[i]
        if (Object.hasOwn(w, 'exec')) {
           w['wid'] = wid++;
           delete w['exec']; // 刪除 exec 屬性
        }
    }
    // - 韋式，聯式 wu: w or u ... 
    // - {+}{wu:w}{wu:w}{+}{wu:u}{wu:u}{+}
    // - 假設 + + + 是合理的 3 個一組，有錯直接畫錯
    // - 有 2 類， 太3:2, 1:25
    for (let i = 0; i < wordArray.length; i++) {
        if (wordArray[i].w == '+') {
            // 這是 + 符號
            i++
            for(;i<wordArray.length;i++){
                if (wordArray[i].w == '+') {
                    break
                }
                wordArray[i].wu = 'w' // 韋式;
            }
            i++
            for(;i<wordArray.length;i++){
                if (wordArray[i].w == '+') {
                    break
                }
                wordArray[i].wu = 'u' // 聯式;
            }
        }
    }
    // console.log(wordArray);
    return wordArray
}
