
import {ISnDictionaryEs6Js} from './ISnDictionary.es6.js'
import {isRDLocationEs6Js} from './../ijnjs/isRDLocation.es6.js'
import {cbolflowEs6Js} from './../ijnjs/cbolflow.es6.js'

export {SnDictOfCbolEs6Js}

function SnDictOfCbolEs6Js() {
    let ISnDictionary = ISnDictionaryEs6Js()
    let isRDLocation= isRDLocationEs6Js()
    let cbolflow = cbolflowEs6Js()

    SnDictOfCbol.prototype = new ISnDictionary()
    SnDictOfCbol.prototype.constructor = SnDictOfCbol

    return SnDictOfCbol
    function SnDictOfCbol() {
        /**
         * TODO:
         * @param {{sn:string,isOld:boolean}} param 
         * @returns {Promise<DataOfDictOfFhl>}
         */
        this.queryAsync = function (param) {
            const isRD = isRDLocation()
            if (isRD == false) {
                // /json/sd.php?N=1&k=0128&gb=1
                let val = "?N=" + (param.isOld ? "1" : "0")
                val += "&k=" + param.sn
                val += "&gb=0"
                let url = "/json/sd.php" + val

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
            } else {
                return gVirtualData()
            }

            /**
             * 
             * @returns {Promise<DataOfDictOfFhl>}
             */
            function gVirtualData() {
                // 下面是 virtual 資料
                /** @type {DataOfDictOfFhl} */
                let re = {}
                if (param.isOld) {
                    re = virtualOld()
                } else {
                    re = virtualNew()
                }
                return new Promise((res, rej) => res(re))
            }

            function virtualNew(sn) {
                return JSON.parse(`{
                        "status":"success",
                        "record_count":1,
                        "record":[{"sn":"00128","dic_text":"128 Aithiops {ahee-thee'-ops}\\r\\n\\r\\n\\u6e90\\u65bc aitho (\\u67af\\u840e) \\u548c ops (\\u9762\\u90e8, \\u6e90\\u65bc SNG03700); \\u967d\\u6027\\u540d\\u8a5e\\r\\n\\r\\nAV - Ethiopian 2; 2\\r\\n\\r\\n\\u57c3\\u63d0\\u963f\\u4f2f = \\"\\u9ed1\\"\\r\\n1)(\\u4eca\\u7a31)\\u8863\\u7d22\\u5339\\u4e9e\\u4eba(#\\u5f92 8:27|)","edic_text":"128 Aithiops {ahee-thee'-ops}\\n\\nfrom aitho (to scorch) and ops (the face, from 3700);; n m\\n\\nAV - Ethiopian 2; 2\\n\\nEthiopian = \\"black\\"\\n1) an Ethiopian","dic_type":0,"orig":"\\u0391\\u1f30\\u03b8\\u1f77\\u03bf\\u03c8"}]}
                        `)
            }
            function virtualOld(sn) {

                return JSON.parse(`{
                        "status":"success",
                        "record_count":1,
                        "record":[{"sn":"00128","dic_text":"0128 'Adamah {a-da:-ma:'}\\r\\n\\r\\n\\u8207 0127 \\u540c; \\u5c08\\u6709\\u540d\\u8a5e \\u5730\\u540d\\r\\n\\r\\n\\u6b3d\\u5b9a\\u672c - Adamah 1; 1\\r\\n\\r\\n\\u4e9e\\u5927\\u746a = \\"\\u5730\\u571f\\"\\r\\n1) \\u62ff\\u5f17\\u4ed6\\u5229\\u7684\\u57ce\\u93ae (#\\u66f8 19:36|)","edic_text":"0128 'Adamah {ad-aw-maw'}\\n\\nthe same as 0127;; n pr loc\\n\\nAV - Adamah 1; 1\\n\\nAdamah = \\"the earth\\"\\n1) city in Naphtali","dic_type":1,"orig":"\\u05d0\\u05b2\\u05d3\\u05b8\\u05de\\u05b8\\u05d4"}]}
                        `)
            }
        }
        /**
         * TODO:
         * @param {DataOfDictOfFhl} dataOfFhl 
         * @returns {DText[]}
         */
        this.cvtToDTexts = function (dataOfFhl) {
            let strCht = dataOfFhl.record[0].dic_text
            let strEn = dataOfFhl.record[0].edic_text
            
            let ch = cbolflow(strCht)
            let en = cbolflow(strEn)
            return Enumerable.from(ch).concat([{ isBr: 1 }]).concat(en).toArray()
            return [{ w: dataOfFhl.record[0].dic_text }]
            throw new Error("not implement yet. cvtToDTexts")
        }
    }
}


