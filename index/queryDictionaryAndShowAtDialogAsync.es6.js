/// <reference path='./DDialogHtml.d.ts' />

import { SnDictOfTwcbEs6Js } from './SnDictOfTwcb.es6.js'
import { SnDictOfCbolEs6Js } from './SnDictOfCbol.es6.js'
import { cvtDTextsToHtmlEs6Js } from './../ijnjs/cvtDTextsToHtml.es6.js'
import { DialogHtmlEs6Js } from './DialogHtml.es6.js'
import { queryReferenceAndShowAtDialogAsyncEs6Js } from './queryReferenceAndShowAtDialogAsync.es6.js'

export { queryDictionaryAndShowAtDialogAsyncEs6Js }


function queryDictionaryAndShowAtDialogAsyncEs6Js() {
    const SnDictOfCbol = SnDictOfCbolEs6Js()
    const SnDictOfTwcb = SnDictOfTwcbEs6Js()
    const DialogHtml = DialogHtmlEs6Js()
    const cvtDTextsToHtml = cvtDTextsToHtmlEs6Js()
    const queryReferenceAndShowAtDialogAsync = queryReferenceAndShowAtDialogAsyncEs6Js()

    return queryDictionaryAndShowAtDialogAsync
    /**
     * 開發給 原字Parsing時，點擊原文字，要跳出字典內容
     * @param {{sn:string;isOld:boolean}} jo 
     * @returns {Promise<void>}
     */
    function queryDictionaryAndShowAtDialogAsync(jo) {
        qDataAsync(jo).then(html => {
            let dlg = new DialogHtml()
            dlg.showDialog({
                html: html,
                getTitle: () => "原文字典" + jo.sn,
                registerEventWhenShowed: dlg => {
                    dlg.on('click', '.ref', a1 => {
                        // queryDictionaryAndShowAtDialogAsync({ sn: $(a1.target).attr('data-addrs'), isOld: false })
                        let addrs = JSON.parse($(a1.target).attr('data-addrs'))
                        queryReferenceAndShowAtDialogAsync({addrs:addrs})

                    })
                }
            })
        });
        return
        /**
         * 
         * @param {{sn:string,isOld:1|0}} param
         * @returns {Promise<string>} 
         */
        function qDataAsync(param) {
            return new Promise((res, rej) => {
                // res("<div>data getter</div>")

                /** 第1個是 twcb 第2個是 cbol */
                let datas = qDataOfDictOfFhlAsync(param)

                /** @type {Promise<DText[]>[]} */
                let dtexts = datas.map(a1 => a1.then(aa1 => new Promise((res2, rej2) => {
                    try {
                        res2(cvtToDTextArrayFromDictOfFhl(aa1))
                    } catch (error) {
                        rej2(error)
                    }
                })))

                Promise.all(dtexts).then(dtextss => {
                    let htmlTwcb = cvtToHtmlFromDTextArray(dtextss[0])
                    let htmlCbol = cvtToHtmlFromDTextArray(dtextss[1])

                    let declare1 = '<span class="bibtext">以上資料由<a href="http://twcb.fhl.net/" target="_blank">浸宣出版社</a>授權</span>'

                    let declare2 = '<span class="bibtext">以上資料由<a href="https://bible.fhl.net/part1/cobs1.html" target="_blank"> CBOL計畫</a>整理</span>'


                    res(htmlTwcb + "<br/>" + declare1 + '<br/>' + htmlCbol + "<br/>" + declare2)
                }).catch(ex => {
                    // console.error(ex);
                    res("<div>error " + ex.message + "</div>")
                })
            });

            /**
             * @param {{sn:string,isOld:1|0}} param 
             * @returns {Promise<DataOfDictOfFhl>[]}
             */
            function qDataOfDictOfFhlAsync(param) {
                /** @type {ISnDictionary[]} */
                let iQueryor = [new SnDictOfTwcb(), new SnDictOfCbol()]
                let r1 = iQueryor.map(a1 => a1.queryAsync(param))

                return r1.map((a1, i1) => addSrcAndIsOldToDataResult(a1, i1, param.isOld))

                /**
                 * @param {Promise<DataOfDictOfFhl>} promise 
                 * @param {number} index 
                 * @returns {Promise<DataOfDictOfFhl>}
                 */
                function addSrcAndIsOldToDataResult(promise, index, isOld) {

                    return new Promise((res, rej) => {
                        promise.then(data => {
                            data.src = index == 0 ? "twcb" : "cbol"
                            data.isOld = isOld

                            res(data)
                        })
                    })
                }
            }
            /**
             * @param {DataOfDictOfFhl} dataOfDictOfFhl 
             * @returns {DText[]}
             */
            function cvtToDTextArrayFromDictOfFhl(dataOfDictOfFhl) {
                if (dataOfDictOfFhl.src == "twcb") {
                    return new SnDictOfTwcb().cvtToDTexts(dataOfDictOfFhl)
                } else if (dataOfDictOfFhl.src == "cbol") {
                    return new SnDictOfCbol().cvtToDTexts(dataOfDictOfFhl)
                }
                throw Error("data of dictionary of fhl assert data.src is twcb or cbol.")
            }
            /**
             * @param {DText[]} dtexts 
             * @returns {string}
             */
            function cvtToHtmlFromDTextArray(dtexts) {
                let icvt = new ConvertDTextsToHtml()
                return icvt.main(dtexts)
            }

        }
        /**
         * @class
        */
        function ConvertDTextsToHtml() {
            /**
             * 開發時，是為了寫 SN Dictionary Bug 用
             * @param {DText[]} dtexts 
             * @returns {string}
             */
            this.main = function (dtexts) {
                
                return "<div>" + cvtDTextsToHtml(dtexts) + "</div>"
            }
        }
    }
}