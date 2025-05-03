// interface 
import { ISnDictionary } from './ISnDictionary.es2023.js';
// 轉換。從 api 取得的資料後，要轉成 DText 格式
import { twcbflow } from './twcbflow.es2023.js';

import { isRDLocation } from './isRDLocation.es2023.js';

export class SnDictOfTwcb extends ISnDictionary {
    constructor() {
        super()
    }
    /**
     * @param {{sn:string,isOld:boolean}} param 
     * @returns {Promise<DataOfDictOfFhl>}
     */
    queryAsync(param) {
        const isRD = isRDLocation()
        let url = param.isOld ? "/json/stwcbhdic.php" : "/json/sbdag.php"
        let val = "?k=" + param.sn
        val += "&gb=0"
        url += val
        if (isRD == false) { // 真實上線 (才不會有 cross-domain 問題)
            return new Promise((res, rej) => {
                $.ajax({
                    url: url,
                    error: er => {
                        console.error(er);
                        rej(er)
                    },
                    success: reStr => {
                        res(JSON.parse(reStr))
                    },
                })
            })

        } else { // 先嘗試 127.0.0.1:5600 proxy，失敗再用 虛擬資料(開發用)
            return new Promise((res, rej) => {
                $.ajax({
                    url: `http://127.0.0.1:5600${url}`,
                    timeout: 1000,
                    error: er => {
                        console.warn("可以開啟 python flask 作的 proxy.");
                        try {
                            // 嘗試使用 virtual data
                            // let re = param.isOld ? virtualOld() : virtualNew();
                            virtualNewOld(param.sn, param.isOld).then( re2 => res( JSON.parse(re2) ))
                        } catch (error) {
                            rej(er);
                        }
                    },
                    success: reStr => {
                        // api 回傳 text，
                        res(JSON.parse(reStr));
                    },
                });
            })
            
            function virtualNewOld(sn, isOld){
                let json_file = isOld ? './index/sd_virtual_old_twcb.json' : './index/sd_virtual_new_twcb.json'
                return new Promise((res, rej) => {
                    $.ajax({
                        url: json_file,
                        error: er => {
                            rej(er)
                        },
                        success: joFile => {
                            let textFile = JSON.stringify(joFile)
                            res(textFile)
                        },
                    })
                })
            }
        }        
    }
    /**
     * @param {DataOfDictOfFhl} dataOfFhl 
     * @returns {DText[]}
     */
    cvtToDTexts(dataOfFhl) {
        return twcbflow(dataOfFhl.record[0].dic_text)
    }
}

// function SnDictOfTwcbEs6Js() {
//     let ISnDictionary = ISnDictionaryEs6Js()
//     let twcbflow = twcbflowEs6Js()
//     let isRDLocation = isRDLocationEs6Js()

//     SnDictOfTwcb.prototype = new ISnDictionary()
//     SnDictOfTwcb.prototype.constructor = SnDictOfTwcb

//     return SnDictOfTwcb

//     function SnDictOfTwcb() {
//         /**
//          * @param {{sn:string,isOld:boolean}} param 
//          * @returns {Promise<DataOfDictOfFhl>}
//          */
//         this.queryAsync = function (param) {
//             const isRD = isRDLocation()
//             let url = param.isOld ? "/json/stwcbhdic.php" : "/json/sbdag.php"
//             let val = "?k=" + param.sn
//             val += "&gb=0"
//             url += val
//             if (isRD == false) { // 真實上線 (才不會有 cross-domain 問題)
//                 return new Promise((res, rej) => {
//                     $.ajax({
//                         url: url,
//                         error: er => {
//                             console.error(er);
//                             rej(er)
//                         },
//                         success: reStr => {
//                             res(JSON.parse(reStr))
//                         },
//                     })
//                 })

//             } else { // 先嘗試 127.0.0.1:5600 proxy，失敗再用 虛擬資料(開發用)
//                 return new Promise((res, rej) => {
//                     $.ajax({
//                         url: `http://127.0.0.1:5600${url}`,
//                         timeout: 1000,
//                         error: er => {
//                             console.warn("可以開啟 python flask 作的 proxy.");
//                             try {
//                                 // 嘗試使用 virtual data
//                                 // let re = param.isOld ? virtualOld() : virtualNew();
//                                 virtualNewOld(param.sn, param.isOld).then( re2 => res( JSON.parse(re2) ))
//                             } catch (error) {
//                                 rej(er);
//                             }
//                         },
//                         success: reStr => {
//                             // api 回傳 text，
//                             res(JSON.parse(reStr));
//                         },
//                     });
//                 })
                
//                 function virtualNewOld(sn, isOld){
//                     let json_file = isOld ? './index/sd_virtual_old_twcb.json' : './index/sd_virtual_new_twcb.json'
//                     return new Promise((res, rej) => {
//                         $.ajax({
//                             url: json_file,
//                             error: er => {
//                                 rej(er)
//                             },
//                             success: joFile => {
//                                 let textFile = JSON.stringify(joFile)
//                                 res(textFile)
//                             },
//                         })
//                     })
//                 }
//             }
//         }
//         /**
//          * @param {DataOfDictOfFhl} dataOfFhl 
//          * @returns {DText[]}
//          */
//         this.cvtToDTexts = function (dataOfFhl) {
//             let re = twcbflow(dataOfFhl.record[0].dic_text)
//             return re
//         }
//     }
// }