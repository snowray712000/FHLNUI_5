// TODO: 還沒完整重構
import { splitReference } from "./splitReference.es2023.js"
import { splitBrOne } from "./splitBrOne.es2023.js"

/**
 * 轉換成 DTexts of 原文字典 of cbol
 * @param {string} str aaa.record[0].dic_text
 * @param {?1} isEng aaa.record[0].edic_text 時，會是英文
 * @returns {DText[]}
 */
export function cbolflow(str, isEng) {
    let r1 = splitBrOne(str)

    // 通常會有 3 組 換行換行 (cbol 字典，前面幾個，不會有 reference，因為 「欽定本 - Adamah 1; 1」這些字眼，會導致誤判)
    let r2a = findIdxOr3NewLineNewLine(r1)

    /** @type {DText[]} */
    let r2 = r2a == -1 ? splitReference(r1) : splitWhen3NewLineExist(r2a, r1)

    return r2

    /**
     * -1 若找不到。 3，表示 包含 [3] 之後要處理 splitReference
     * @param {DText[]} dtexts 
     * @returns {number}
     */
    function findIdxOr3NewLineNewLine(dtexts) {
        let idx = -1
        let cnt = 0
        for (let i = 0; i < dtexts.length - 1; i++) {
            if (cnt >= 3) {
                idx = i
                break
            }
            const it = dtexts[i];
            const it2 = dtexts[i + 1];
            if (it.isBr == 1 && it2.isBr == 1) {
                ++cnt
                ++i // 這裡 +1 , 等下還有 i++, 共加2
            }
        }
        return idx
    }
    /**
     * 
     * @param {number} idx 
     * @param {DText[]} dtexts 
     * @returns {DText[]}
     */
    function splitWhen3NewLineExist(idx, dtexts) {
        let r1a = Enumerable.from(dtexts).take(idx)
        let r2a = Enumerable.from(dtexts).skip(idx).toArray()
        let r2b = splitReference(r2a)
        return r1a.concat(Enumerable.from(r2b)).toArray()
    }
}


// function cbolflowEs6Js() {
//     // let splitReference = splitReferenceEs6Js()
//     // let splitBrOne = splitBrOneEs6Js()

//     return cbolflow
//     /**
//      * 轉換成 DTexts of 原文字典 of cbol
//      * @param {string} str aaa.record[0].dic_text
//      * @param {?1} isEng aaa.record[0].edic_text 時，會是英文
//      * @returns {DText[]}
//      */
//     function cbolflow(str, isEng) {
//         let r1 = splitBrOne(str)

//         // 通常會有 3 組 換行換行 (cbol 字典，前面幾個，不會有 reference，因為 「欽定本 - Adamah 1; 1」這些字眼，會導致誤判)
//         let r2a = findIdxOr3NewLineNewLine(r1)

//         /** @type {DText[]} */
//         let r2 = r2a == -1 ? splitReference(r1) : splitWhen3NewLineExist(r2a, r1)

//         return r2

//         /**
//          * -1 若找不到。 3，表示 包含 [3] 之後要處理 splitReference
//          * @param {DText[]} dtexts
//          * @returns {number}
//          */
//         function findIdxOr3NewLineNewLine(dtexts) {
//             let idx = -1
//             let cnt = 0
//             for (let i = 0; i < dtexts.length - 1; i++) {
//                 if (cnt >= 3) {
//                     idx = i
//                     break
//                 }
//                 const it = dtexts[i];
//                 const it2 = dtexts[i + 1];
//                 if (it.isBr == 1 && it2.isBr == 1) {
//                     ++cnt
//                     ++i // 這裡 +1 , 等下還有 i++, 共加2
//                 }
//             }
//             return idx
//         }
//         /**
//          *
//          * @param {number} idx
//          * @param {DText[]} dtexts
//          * @returns {DText[]}
//          */
//         function splitWhen3NewLineExist(idx, dtexts) {
//             let r1a = Enumerable.from(dtexts).take(idx)
//             let r2a = Enumerable.from(dtexts).skip(idx).toArray()
//             let r2b = splitReference(r2a)
//             return r1a.concat(Enumerable.from(r2b)).toArray()
//         }
//     }
// }