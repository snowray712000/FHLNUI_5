// TODO: 還重完整重構
import { ISnDictionary } from "./ISnDictionary.es2023.js"
import { isRDLocation } from "./isRDLocation.es2023.js"
import { cbolflow } from "./cbolflow.es2023.js"

export class SnDictOfCbol extends ISnDictionary {
    constructor() {
        super()
    }
    /**
     * TODO:
     * @param {{sn:string,isOld:boolean}} param 
     * @returns {Promise<DataOfDictOfFhl>}
     */    
    queryAsync(param) {
        const isRD = isRDLocation()
        // /json/sd.php?N=1&k=0128&gb=1
        let val = "?N=" + (param.isOld ? "1" : "0")
        val += "&k=" + param.sn
        val += "&gb=0"
        let url = "/json/sd.php" + val
        if (isRD == false) {
            return new Promise((res, rej) => {
                $.ajax({
                    url: url,
                    error: er => {
                        console.error(er);
                        rej(er)
                    },
                    success: reStr => {
                        
                        res(reStr) // sd.php 回傳本來就是一個 json 物件，所以不要再用 JSON.parse
                    },
                })
            })
        } else {
            // 如果 127.0.0.1:5600 有開著，就使用這個作為 proxy
            return new Promise((res, rej) =>{
                $.ajax({
                    url: `http://127.0.0.1:5600/json/sd.php${val}`,
                    timeout: 1000,
                    error: er => {
                        console.warn("可以開啟 python flask 作的 proxy.");
                        try {
                            // 嘗試使用 virtual data
                            gVirtualData().then(re => res(re))                               
                        } catch (error) {
                            rej(er);
                            
                        }
                    },
                    success: reStr => {
                        res(reStr);
                    },
                });
            })

        }

        /**
         * 
         * @returns {Promise<DataOfDictOfFhl>}
         */
        function gVirtualData() {
            let virtual_json_path = param.isOld ? "./index/sd_virtual_old.json" : "./index/sd_virtual_new.json"
            return new Promise((res, rej) => {
                $.ajax({
                    url: virtual_json_path,
                    success: re => res(re),
                    error: er => rej(er)
                })
            })
        }         
    }
    /**
     * TODO:
     * @param {DataOfDictOfFhl} dataOfFhl 
     * @returns {DText[]}
     */    
    cvtToDTexts(dataOfFhl) {
        let strCht = dataOfFhl.record[0].dic_text
        let strEn = dataOfFhl.record[0].edic_text

        let ch = cbolflow(strCht)
        let en = cbolflow(strEn)
        return Enumerable.from(ch).concat([{ isBr: 1 },{ isHr: 1 }]).concat(en).toArray()
        return [{ w: dataOfFhl.record[0].dic_text }]
        throw new Error("not implement yet. cvtToDTexts")
    }
}


// function SnDictOfCbolEs6Js() {
//     // let ISnDictionary = ISnDictionaryEs6Js()
//     // let isRDLocation = isRDLocationEs6Js()
//     // let cbolflow = cbolflowEs6Js()

//     SnDictOfCbol.prototype = new ISnDictionary()
//     SnDictOfCbol.prototype.constructor = SnDictOfCbol

//     return SnDictOfCbol
//     function SnDictOfCbol() {
//         /**
//          * TODO:
//          * @param {{sn:string,isOld:boolean}} param 
//          * @returns {Promise<DataOfDictOfFhl>}
//          */
//         this.queryAsync = function (param) {
//             const isRD = isRDLocation()
//             // /json/sd.php?N=1&k=0128&gb=1
//             let val = "?N=" + (param.isOld ? "1" : "0")
//             val += "&k=" + param.sn
//             val += "&gb=0"
//             let url = "/json/sd.php" + val
//             if (isRD == false) {
//                 return new Promise((res, rej) => {
//                     $.ajax({
//                         url: url,
//                         error: er => {
//                             console.error(er);
//                             rej(er)
//                         },
//                         success: reStr => {
                            
//                             res(reStr) // sd.php 回傳本來就是一個 json 物件，所以不要再用 JSON.parse
//                         },
//                     })
//                 })
//             } else {
//                 // 如果 127.0.0.1:5600 有開著，就使用這個作為 proxy
//                 return new Promise((res, rej) =>{
//                     $.ajax({
//                         url: `http://127.0.0.1:5600/json/sd.php${val}`,
//                         timeout: 1000,
//                         error: er => {
//                             console.warn("可以開啟 python flask 作的 proxy.");
//                             try {
//                                 // 嘗試使用 virtual data
//                                 gVirtualData().then(re => res(re))                               
//                             } catch (error) {
//                                 rej(er);
                                
//                             }
//                         },
//                         success: reStr => {
//                             res(reStr);
//                         },
//                     });
//                 })

//             }

//             /**
//              * 
//              * @returns {Promise<DataOfDictOfFhl>}
//              */
//             function gVirtualData() {
//                 let virtual_json_path = param.isOld ? "./index/sd_virtual_old.json" : "./index/sd_virtual_new.json"
//                 return new Promise((res, rej) => {
//                     $.ajax({
//                         url: virtual_json_path,
//                         success: re => res(re),
//                         error: er => rej(er)
//                     })
//                 })
//             }            
//         }
//         /**
//          * TODO:
//          * @param {DataOfDictOfFhl} dataOfFhl 
//          * @returns {DText[]}
//          */
//         this.cvtToDTexts = function (dataOfFhl) {
//             let strCht = dataOfFhl.record[0].dic_text
//             let strEn = dataOfFhl.record[0].edic_text

//             let ch = cbolflow(strCht)
//             let en = cbolflow(strEn)
//             return Enumerable.from(ch).concat([{ isBr: 1 },{ isHr: 1 }]).concat(en).toArray()
//             return [{ w: dataOfFhl.record[0].dic_text }]
//             throw new Error("not implement yet. cvtToDTexts")
//         }
//     }
// }