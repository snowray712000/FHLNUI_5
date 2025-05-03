// TODO: 還沒完整重構
import { splitBtw } from './splitBtw.es2023.js'
import { splitReference } from './splitReference.es2023.js'
import { splitBrOne } from './splitBrOne.es2023.js'

/**
 * 轉換成 DTexts of 原文字典 of 浸宣 (twcb)
 * @param {string} str aaa.record[0].dic_text
 * @returns {DText[]}
 */
export function twcbflow(str) {
    let regs = {
        reg1: () => /<div class=\"idt\">/g,
        reg2: () => /<\/div>/g
    }
    let regs2 = {
        reg1: () => /<span class=\"bibtext\">|<span class=\"exp\">/g,
        reg2: () => /<\/span>/g
    }
    let r1 = splitBtw(str, regs)
    if (r1 == null) { r1 = [{ w: str }] }

    let re = splitSpansOne(r1)

    let r3 = splitBrOne(re)

    let r4 = splitReference(r3) // splitRefs(r3)
    return r4

    /**
     * @param {DText[]} data 
     */
    function splitSpansOne(data) {
        let re = []
        for (const it of data) {
            if (it.tpContainer == null) {
                let r2 = splitBtw(it.w, regs2)
                if (r2 == null) {
                    re.push(it)
                } else {
                    for (const it2 of r2) {
                        re.push(it2)
                    }
                }
            } else {
                let r3 = splitSpansOne(it.children)
                it.children = r3
                re.push(it)
            }
        }
        return re
    }
}

// function twcbflowEs6Js() {
//     // let splitBtw = splitBtwEs6Js()
//     // let splitReference = splitReferenceEs6Js()
//     // let splitBrOne = splitBrOneEs6Js()

//     return twcbflow
//     /**
//      * 轉換成 DTexts of 原文字典 of 浸宣 (twcb)
//      * @param {string} str aaa.record[0].dic_text
//      * @returns {DText[]}
//      */
//     function twcbflow(str) {
//         let regs = {
//             reg1: () => /<div class=\"idt\">/g,
//             reg2: () => /<\/div>/g
//         }
//         let regs2 = {
//             reg1: () => /<span class=\"bibtext\">|<span class=\"exp\">/g,
//             reg2: () => /<\/span>/g
//         }
//         let r1 = splitBtw(str, regs)
//         if (r1 == null) { r1 = [{ w: str }] }

//         let re = splitSpansOne(r1)

//         let r3 = splitBrOne(re)

//         let r4 = splitReference(r3) // splitRefs(r3)
//         return r4

//         /**
//          * @param {DText[]} data
//          */
//         function splitSpansOne(data) {
//             let re = []
//             for (const it of data) {
//                 if (it.tpContainer == null) {
//                     let r2 = splitBtw(it.w, regs2)
//                     if (r2 == null) {
//                         re.push(it)
//                     } else {
//                         for (const it2 of r2) {
//                             re.push(it2)
//                         }
//                     }
//                 } else {
//                     let r3 = splitSpansOne(it.children)
//                     it.children = r3
//                     re.push(it)
//                 }
//             }
//             return re
//         }
//     }
// }