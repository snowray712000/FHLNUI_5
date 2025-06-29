// TODO: 還沒完全重構

import { splitReference } from "./splitReference.es2023.js" // 經文章節，成為ref
import { qsbAsync } from "./qsbAsync.es2023.js"
import { DialogHtml } from "./DialogHtml.es2023.js"
import { cvtDTextsToHtml } from "./cvtDTextsToHtml.es2023.js"
import { cvtAddrsToRef } from "./cvtAddrsToRef.es2023.js"
import { BibleConstant } from "./BibleConstant.es2023.js"
import { assert } from "./assert_es2023.js"
import { FhlLecture } from "./FhlLecture.es2023.js"
import { FhlInfo } from "./FhlInfo.es2023.js"
import { ViewHistory } from "./ViewHistory.es2023.js"
import { TPPageState } from "./TPPageState.es2023.js"
import { BookSelect } from "./BookSelect.es2023.js"
import { triggerGoEventWhenPageStateAddressChange } from "./triggerGoEventWhenPageStateAddressChange.es2023.js"

import markdownit from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm'

/**
 * 開發給 原字Parsing時，點擊原文字，要跳出字典內容
 * 像串珠功能，就是直接有 addrsDescription, 而非 addrs[]
 * @param {{addrs?:DAddress[];addrsDescription?:string;version?:string;bookDefault?:number;event?:MouseEvent}} jo 
 * @returns {Promise<void>}
 */
export function queryReferenceAndShowAtDialogAsync(jo) {
    if (jo.addrs == null && jo.addrsDescription == null ){
        throw new Error("assert .addrs != null || .addrDescription != null")
    }
    if (jo.event == null ){
        show_in_dialog() // 原本程式碼
        return 
    } else {
        const reference_method = TPPageState.s.reference_method
        if (reference_method == 0) {
            show_dialog_choose_method()
        } else if (reference_method == 1) {
            show_in_dialog()
        } else if (reference_method == 2) {
            show_in_embed()
        }
    }

    return
    function show_dialog_choose_method(){
        // 取得滑鼠目前位置，或是「點擊位置(若是平板)」
        if (jo.event != null ){
            let position = { my: "right top", at: "right top", of: $(jo.event.target) }

            let dlg2 = new DialogHtml()
            dlg2.showDialog({
                html: '<div class="method-buttons"><button class="method1">1️⃣方法</button><button class="method2">2️⃣方法</button><button class="help">❓說明</button></div>',
                getTitle: () => "交互參照",
                width: window.innerWidth * 0.3,
                position: position,
                registerEventWhenShowed: dlg => {
                    dlg.on('click', '.method1', () => {
                        dlg2.closeDialogViaTriggerCloseButton()
                        setTimeout(() => {
                            show_in_dialog()
                        }, 0);
                    })
                    dlg.on('click', '.method2', () => {
                        dlg2.closeDialogViaTriggerCloseButton()
                        setTimeout(() => {
                            show_in_embed()
                        }, 0);
                    })
                    dlg.on('click', '.help', ev => {
                        show_help_dialog(ev)
                    })
                }
            })
        }
    }
    function show_help_dialog(ev){
        let ps = TPPageState.s

        let htmlContent = `<ul>
        <li>1️⃣方法：會開啟一個對話框，顯示經文內容。</li>
        <li>2️⃣方法：將目前頁面，跳至此範圍的第一個章節。</li>
        </ui><hr/>
        目前設定值：<select id="reference_method">
            <option value="0">每次詢問</option>
            <option value="1">直接方法1️⃣</option>
            <option value="2">直接方法2️⃣</option>
        </select>`
        let position = { my: "right top", at: "right top", of: $(ev.target) }
        
        let dlg = new DialogHtml()
        dlg.showDialog({
            html: `<div>${htmlContent}</div>`,
            getTitle: () => "幫助",
            position: position,
            width: window.innerWidth * 0.3,
            registerEventWhenShowed: dlg => {
                $('#reference_method').val(TPPageState.s.reference_method); // 初始化為當前狀態

                // 更新設定值時
                dlg.on('change', '#reference_method', function () {
                    let ps = TPPageState.s
                    ps.reference_method = parseInt($(this).val());
                    pageState.reference_method = ps.reference_method;                    
                });
                
            }
        })
    }
    function show_in_embed(){
        assert(jo.addrs != null, "assert jo.addrs != null")
        const addr = jo.addrs[0] // 用第1個位置
        
        let ps = TPPageState.s
        ps.bookIndex = addr.book
        ps.chap = addr.chap
        ps.sec = addr.verse // 早期「節」沒有統一用 .sec 或 .verse

        triggerGoEventWhenPageStateAddressChange(ps);
        
        BookSelect.s.render();
        FhlLecture.s.render();
        FhlInfo.s.render(ps);
        FhlLecture.s.selectLecture(null, null, ps.sec);
        ViewHistory.s.render();   
    }
    function show_in_dialog(){
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
                        queryReferenceAndShowAtDialogAsync({addrs:addrs, event: a1 })
                    })
                }
            })
        })
    }
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