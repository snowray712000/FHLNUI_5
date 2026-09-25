// TODO: 還沒完全重構

import { splitReference } from "./splitReference.es2023.js" // 經文章節，成為ref
import { qsb } from "./api/qsb.js" // 為了引入 DQsbParam, DQsbResult
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

import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js"
import { cvt_others } from "./cvt_others.js"
import { prepare_dtexts_for_html } from "./prepare_dtexts_for_html.js"
import { queryFootsAsync } from "./queryFootsAsync.js"

/**
 * @typedef {Object} DQueryReferenceParam
 * @prop {DAddress[]} [addrs] - 經文位置陣列，優先使用
 * @prop {string} [addrsDescription] - 經文位置描述，若沒有 addrs，則使用這個字串去 qsb 查詢
 * @prop {string} [version] - 經文版本，預設 "unv"
 * @prop {number} [bookDefault] - 預設書卷，1-based，預設 45 (羅馬書)，用於 addrsDescription 的查詢
 * @prop {MouseEvent} [event] - 點擊事件，若有，則會根據 TPPageState.s.reference_method 的設定來決定顯示方式
 * @prop {number} [method] - 顯示方式，0: 每次詢問, 1: 直接方法1, 2: 直接方法2
 */

/**
 * 開發給 原字Parsing時，點擊原文字，要跳出字典內容
 * 像串珠功能，就是直接有 addrsDescription, 而非 addrs[]
 * @param {DQueryReferenceParam} jo 
 * @returns {Promise<void>}
 */
export function queryReferenceAndShowAtDialogAsync(jo) {
    if (jo.addrs == null && jo.addrsDescription == null) {
        throw new Error("assert .addrs != null || .addrDescription != null")
    }
    get_first_addr(jo)

    if (jo.event == null) {
        show_in_dialog() // 原本程式碼
        return
    } else {
        const reference_method = jo.method ?? TPPageState.s.reference_method
        if (reference_method == 0) {
            show_dialog_choose_method()
        } else if (reference_method == 1) {
            show_in_dialog()
        } else if (reference_method == 2) {
            show_in_embed()
        }
    }

    return
    function show_dialog_choose_method() {
        // 取得滑鼠目前位置，或是「點擊位置(若是平板)」
        if (jo.event != null) {
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
    function show_help_dialog(ev) {
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
    function show_in_embed() {
        const addr = get_first_addr(jo)

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
    function show_in_dialog() {
        let addrsDescription = jo.addrsDescription != null ? jo.addrsDescription : cvtAddrsToRef(jo.addrs, '羅')

        let version = jo.version == null ? "unv" : jo.version
        const bookDefaultId = jo.bookDefault ? jo.bookDefault : 45 // 羅, 1-based
        let bookDefault = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[bookDefaultId - 1]

        /** @type {DQsbParam} */
        let argsQsb = {
            qstr: addrsDescription,
            ver: version,
            bookDefault,
        }
        qsb(argsQsb).then(a1 => when_qsbAsync(a1))

        /**
         * @param {DQsbResult} a1 
         */
        async function when_qsbAsync(a1) {
            const ver = version
            /**
             * @typedef {[number, number, number, string]} RecordWithAddr // [book, chap, sec, text]
             */
            /** @type {RecordWithAddr[]} */
            const records_with_addr = a1.record.map(a1 => {
                const book = BibleConstantHelper.getBookId(a1.chineses)
                const chap = a1.chap
                const sec = a1.sec
                return [book, chap, sec, a1.bible_text]
            })

            const dtexts_with_addr = cvt_others(ver, records_with_addr)
            // foot 注腳 csb 中文標準譯本 cnet NET聖經中譯本 lcc 呂振中譯本
            if (ps.foot_note_show_method == 2) {
                await queryFootsAsync(dtexts_with_addr, ver)
            }

            const dtexts_prepared = prepare_dtexts_for_html(dtexts_with_addr, 2);

            let html = cvtDTextsToHtmlForReference(dtexts_prepared)

            // html dialog, .sn 都加上 .sn-hidden，使用 jquery
            // 將字串轉成暫時容器，修改後再取回 html 字串
            const $container = $('<div>').append($(html));

            $container.find('.sn').addClass('sn-hidden');
            html = $container.html();

            let dlg = new DialogHtml()
            dlg.showDialog({
                html: html,
                getTitle: () => addrsDescription,
                registerEventWhenShowed: dlg => {
                    dlg.on('click', '.ref', a1 => {
                        let addrs = JSON.parse($(a1.target).attr('addr-data'))
                        queryReferenceAndShowAtDialogAsync({ addrs: addrs, event: a1 })
                    })
                }
            })
        }

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

function add_sn_hidden_if_need(text_jq) {
    // 因為現在所有資料都包含 sn，所以若 strong=0，則要隱藏
    const ps = TPPageState.s;
    if (ps.strong == 0) {
        // 將 text 轉為 jQuery，然後將 .sn 的 span 加入 .hidden
        text_jq.find('.sn').addClass('sn-hidden')
    }
}

/**
 * @param {DQueryReferenceParam} jo 
 */
function get_first_addr(jo) {
    if (jo.addrs == null && jo.addrsDescription == null) {
        throw new Error("assert .addrs != null || .addrDescription != null")
    }

    // 先 jo.addrs
    if (jo.addrs != null && jo.addrs.length > 0) {
        return jo.addrs[0]
    }

    // 若沒有 jo.addrs, 用 jo.addrsDescription 
    const desc = jo.addrsDescription
    const splitResult = splitReference(desc)
    
    // console.log(JSON.stringify(splitResult));    
    return splitResult?.[0]?.refAddresses?.[0]
}