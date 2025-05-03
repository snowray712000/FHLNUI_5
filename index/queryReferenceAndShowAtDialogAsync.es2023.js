// TODO: 還沒完全重構

import { splitReference } from "./splitReference.es2023.js" // 經文章節，成為ref
import { qsbAsync } from "./qsbAsync.es2023.js"
import { DialogHtml } from "./DialogHtml.es2023.js"
import { cvtDTextsToHtml } from "./cvtDTextsToHtml.es2023.js"
import { cvtAddrsToRef } from "./cvtAddrsToRef.es2023.js"
import { BibleConstant } from "./BibleConstant.es2023.js"


/**
 * 開發給 原字Parsing時，點擊原文字，要跳出字典內容
 * 像串珠功能，就是直接有 addrsDescription, 而非 addrs[]
 * @param {{addrs?:DAddress[];addrsDescription?:string;version?:string;bookDefault?:number}} jo 
 * @returns {Promise<void>}
 */
export function queryReferenceAndShowAtDialogAsync(jo) {
    if (jo.addrs == null && jo.addrsDescription == null ){
        throw new Error("assert .addrs != null || .addrDescription != null")
    }

    let addrsDescription = jo.addrsDescription != null ? jo.addrsDescription : cvtAddrsToRef(jo.addrs, '羅') 
    let version = jo.version == null ? "unv" : jo.version
    const bookDefaultId = jo.bookDefault ? jo.bookDefault : 45 // 羅, 1-based
    let bookDefault = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[bookDefaultId-1]
    
    /** @type {DQsbParam} */
    let argsQsb = {
        qstr: addrsDescription,
        version: version,
        bookDefault,
    }
    qsbAsync(argsQsb).then(a1 => {
        let dtexts = cvtQsbResultToDtexts(a1)
        let html = cvtDTextsToHtmlForReference(dtexts)
        let dlg = new DialogHtml()
        dlg.showDialog({
            html: html,
            getTitle: () => addrsDescription,
            registerEventWhenShowed: dlg => {
                dlg.on('click', '.ref', a1 => {
                    let addrs = JSON.parse($(a1.target).attr('data-addrs'))
                    queryReferenceAndShowAtDialogAsync({addrs:addrs})
                })
            }
        })

    })
    return
    /**
     * 
     * @param {DQsbResult} reQsb 
     * @returns {DText[]}
     */
    function cvtQsbResultToDtexts(reQsb) {
        /** @type {DText[]} */
        let re = []
        let r1 = Enumerable.from(reQsb.record).select(cvtOne).toArray()

        for (const a1 of r1) {
            re.push(...a1)
            re.push({ isBr: 1 })
        }
        return re

        /**
         * 
         * @param {{chineses:string,chap:number,sec:number,bible_text:string}} record 
         * @returns {DText[]}
         */
        function cvtOne(record) {
            /** @type {DText[]} */
            let re = []
            let addrsDescription = record.chineses + record.chap
            let description2 = addrsDescription + ":" + record.sec
            let r1addrs = splitReference(addrsDescription)[0].refAddresses
            re.push({ w: description2, refAddresses: r1addrs }, { w: record.bible_text })
            return re
        }
    }
    /**
     * 
     * @param {DText[]} dtexts 
     * @returns {string}
     */
    function cvtDTextsToHtmlForReference(dtexts) {
        return cvtDTextsToHtml(dtexts)
    }
}

// function queryReferenceAndShowAtDialogAsyncEs6Js() {
//     // const splitReference = splitReferenceEs6Js() // 經文章節，成為ref
//     // const qsbAsync = qsbAsyncEs6Js()
//     // const DialogHtml = DialogHtmlEs6Js()
//     // const cvtDTextsToHtml = cvtDTextsToHtmlEs6Js()
//     // const cvtAddrsToRef = cvtAddrsToRefEs6Js()
//     // const BibleConstant = BibleConstantEs6Js()

//     return queryReferenceAndShowAtDialogAsync
//     /**
//      * 開發給 原字Parsing時，點擊原文字，要跳出字典內容
//      * 像串珠功能，就是直接有 addrsDescription, 而非 addrs[]
//      * @param {{addrs?:DAddress[];addrsDescription?:string;version?:string;bookDefault?:number}} jo 
//      * @returns {Promise<void>}
//      */
//     function queryReferenceAndShowAtDialogAsync(jo) {
//         if (jo.addrs == null && jo.addrsDescription == null ){
//             throw new Error("assert .addrs != null || .addrDescription != null")
//         }

//         let addrsDescription = jo.addrsDescription != null ? jo.addrsDescription : cvtAddrsToRef(jo.addrs, '羅') 
//         let version = jo.version == null ? "unv" : jo.version
//         const bookDefaultId = jo.bookDefault ? jo.bookDefault : 45 // 羅, 1-based
//         let bookDefault = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[bookDefaultId-1]
        
//         /** @type {DQsbParam} */
//         let argsQsb = {
//             qstr: addrsDescription,
//             version: version,
//             bookDefault,
//         }
//         qsbAsync(argsQsb).then(a1 => {
//             let dtexts = cvtQsbResultToDtexts(a1)
//             let html = cvtDTextsToHtmlForReference(dtexts)
//             let dlg = new DialogHtml()
//             dlg.showDialog({
//                 html: html,
//                 getTitle: () => addrsDescription,
//                 registerEventWhenShowed: dlg => {
//                     dlg.on('click', '.ref', a1 => {
//                         let addrs = JSON.parse($(a1.target).attr('data-addrs'))
//                         queryReferenceAndShowAtDialogAsync({addrs:addrs})
//                     })
//                 }
//             })

//         })
//         return
//         /**
//          * 
//          * @param {DQsbResult} reQsb 
//          * @returns {DText[]}
//          */
//         function cvtQsbResultToDtexts(reQsb) {
//             /** @type {DText[]} */
//             let re = []
//             let r1 = Enumerable.from(reQsb.record).select(cvtOne).toArray()

//             for (const a1 of r1) {
//                 re.push(...a1)
//                 re.push({ isBr: 1 })
//             }
//             return re

//             /**
//              * 
//              * @param {{chineses:string,chap:number,sec:number,bible_text:string}} record 
//              * @returns {DText[]}
//              */
//             function cvtOne(record) {
//                 /** @type {DText[]} */
//                 let re = []
//                 let addrsDescription = record.chineses + record.chap
//                 let description2 = addrsDescription + ":" + record.sec
//                 let r1addrs = splitReference(addrsDescription)[0].refAddresses
//                 re.push({ w: description2, refAddresses: r1addrs }, { w: record.bible_text })
//                 return re
//             }
//         }
//         /**
//          * 
//          * @param {DText[]} dtexts 
//          * @returns {string}
//          */
//         function cvtDTextsToHtmlForReference(dtexts) {
//             return cvtDTextsToHtml(dtexts)
//         }
//     }
// }
