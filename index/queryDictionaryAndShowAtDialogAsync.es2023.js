// TODO: 還沒完全重構

import { SnDictOfCbol } from "./SnDictOfCbol.es2023.js"
import { SnDictOfTwcb } from "./SnDictOfTwcb.es2023.js"
import { DialogHtml } from "./DialogHtml.es2023.js"
import { cvtDTextsToHtml } from "./cvtDTextsToHtml.es2023.js"
import { queryReferenceAndShowAtDialogAsync } from "./queryReferenceAndShowAtDialogAsync.es2023.js"

/**
 * 開發給 原字Parsing時，點擊原文字，要跳出字典內容
 * @param {{sn:string;isOld:boolean}} jo 
 * @returns {Promise<void>}
 */
export function queryDictionaryAndShowAtDialogAsync(jo) {
    qDataAsync(jo).then(html => {
        let dlg = new DialogHtml()
        dlg.showDialog({
            html: html,
            getTitle: () => "原文字典" + jo.sn,
            registerEventWhenShowed: dlg => {
                const sn = jo.sn // str
                const isOld = jo.isOld // 0, 1
                console.log(jo);
                

                // 改 title，因為 getTitle 的方式只能純文字，不能有 html tag ... dlg parent 才會包到 title
                // <span> 原文字典 3303 <span fn-search-sn> 出現經文 </span></span>
                const domAutoSearch = $('<span>').text("出現經文").addClass('fn-search-sn').attr('sn',sn).attr('isOld',isOld)

                const domtitle = dlg.parent().find('.ui-dialog-title').addClass('realtime-sn').html(
                    $('<span>')
                    .append('<span>原文字典</span>')
                    .append(`<span> ${sn} </span>`)
                    .append(domAutoSearch)
                    [0].outerHTML
                )

                // 加入 .fnAutoSearch click callback // 
                domtitle.find('.fn-search-sn')
                .on('click', a1 => {
                    const pthis = $(a1.target)
                    // console.log(pthis.attr('sn'));
                    // console.log(pthis.attr('isOld'));
                    const sn = pthis.attr('sn')
                    let isOld = pthis.attr('isOld')
                    isOld = isOld == "true" || isOld == "1" ? 1 : 0 // 0, 1

                    const hgSn = `${ isOld ? 'H':'G'}${sn}` // H3303 G4314

                    // 將 #searchTool 下的 <input> 它的 class 是 .search-input 的內容改設定為 G4314
                    $('#searchTool').find('.search-input').val(hgSn)
                    // 觸發 .searchBtn 的 click 事件, 開始搜尋
                    $('.searchBtn').trigger('click');

                    // 開啟新的前，自動關閉已經開啟中的 ... 所有 .ui-dialog-title 中 text 是 Parsing 的 ... 取得 close 按鈕結束
                    // let rr1 = $('.ui-dialog-title').filter((i, e) => $(e).hasClass('realtime-sn'))
                    const rr1 = $('.ui-dialog-title')
                    let rr2 = rr1.siblings('.ui-dialog-titlebar-close')
                    rr2.trigger('click')
                })

                dlg.on('click', '.ref', a1 => {
                    
                    // queryDictionaryAndShowAtDialogAsync({ sn: $(a1.target).attr('data-addrs'), isOld: false })
                    let addrs = JSON.parse($(a1.target).attr('data-addrs'))
                    queryReferenceAndShowAtDialogAsync({ addrs: addrs, event: a1})

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

                let declare1 = '<span class="bibtext">以上資料由<a href="http://twcb.fhl.net/" target="_blank">浸宣出版社</a>授權</span> <br/><hr/>'

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