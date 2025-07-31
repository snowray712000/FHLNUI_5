import { splitReference } from './splitReference.es2023.js'
import { queryReferenceAndShowAtDialogAsync } from './queryReferenceAndShowAtDialogAsync.es2023.js'
import { queryDictionaryAndShowAtDialogAsync } from './queryDictionaryAndShowAtDialogAsync.es2023.js'
import { BibleConstantHelper } from './BibleConstantHelper.es2023.js'
import { getBookFunc } from './getBookFunc.es2023.js'
import { triggerGoEventWhenPageStateAddressChange } from './triggerGoEventWhenPageStateAddressChange.es2023.js'
import { SN_Act_Color } from './SN_Act_Color.es2023.js'
import { parsing_render_bottom_table } from './parsing_render_bottom_table.es2023.js'
import { parsing_render_top } from './parsing_render_top.es2023.js'
import { TPPageState } from './TPPageState.es2023.js'
import { getAjaxUrl } from './getAjaxUrl.es2023.js'
import { BibleConstant } from './BibleConstant.es2023.js'
import { FhlLecture } from './FhlLecture.es2023.js'
import { FhlInfo } from './FhlInfo.es2023.js'
import { ViewHistory } from './ViewHistory.es2023.js'
import { eachFitDo } from './eachFitDo.es2023.js'
import { comment_render_async } from './comment_render_es2023.js'
import { comment_register_events } from './comment_register_events_es2023.js'
import { Parsing_normalize_address } from './Parsing_normalize_Address_es2023.js'
import { BookSelect } from './BookSelect.es2023.js'
import { render_ai_tools } from './parsing_render_ai_tools_es2023.js'
import { ParsingCache } from './ParsingCache_es2023.js'
import { parsing_render_async } from './parsing_render_async_es2023.js'
export class FhlInfoContent {
    static #s = null
    /** @returns {FhlInfoContent} */
    static get s() { if (!this.#s) this.#s = new FhlInfoContent(); return this.#s; }

    /** @type {HTMLElement} #fhlInfoContent */
    dom = null
    init(ps, dom){
        if (ps == null) ps = TPPageState.s

        this.dom = dom
        this.render(ps, this.dom)
    }
    /**
     * @param {TPPageState} ps 
     */
    registerEvents(ps){
        if (ps == null) ps = TPPageState.s

        var that = this;
        switch (ps.titleId) {
            case "fhlInfoParsing":
                {
                    function close_snbtn_result_dialog(){
                        let rr1 = $('.ui-dialog-title').filter((i, e) => e.innerText == "Parsing")
                        let rr2 = rr1.siblings('.ui-dialog-titlebar-close')
                        rr2.trigger('click')
                    }
                    // parsing event 事件
                    /**
                     * @param {HTMLElement} dom 
                     */
                    function show_snbtn_result_dialog(dom){                            
                        let wid = $(dom).attr('wid')

                        // 找出 #parsingTable 中，wid 為 wid 的 div
                        let div = $('#parsingTable').find(`[wid=${wid}]`)

                        // 開啟新的前，自動關閉已經開啟中的 ... 所有 .ui-dialog-title 中 text 是 Parsing 的 ... 取得 close 按鈕結束
                        close_snbtn_result_dialog()
                        
                        // dialog
                        const DialogHtml = DialogHtmlEs6Js()
                        let dlg = new DialogHtml()
                        let button = $("#fhlMidWindow")
                        const width = button.width()
                        const pos = { my: "middle bottom", at: "middle bottom", of: button }
                        dlg.showDialog({
                            html: div.clone(),
                            width: width,
                            position: pos,
                            getTitle: () => "Parsing",
                            /**
                             * @param {JQuery<HTMLElement>} dlg 
                             */
                            registerEventWhenShowed: dlg => {
                                dlg.off('click','.sn').on({
                                    "click": function(){
                                        let r2 = $(this)
                                        let jo = {
                                            sn: r2.attr('sn'),
                                            isOld: r2.attr('tp') == 'H'
                                        }

                                        queryDictionaryAndShowAtDialogAsync(jo)
                                    }
                                }, ".sn")
                            }
                        })   
                    }

                    // `暫時` 的英文是 ... `temporary`
                    let is_pause_realtime_temporary = false
                    function pause_temporary(){
                        if (ps.realTimePopUp == 1){
                            is_pause_realtime_temporary = true
                            setTimeout(() => {
                                is_pause_realtime_temporary = false
                            }, 2000)
                        }
                    }

                    $('.sn-btn').on('mouseenter', function (ev) {
                        // 同 sn 變色
                        const dom = this
                        let wid = $(dom).attr('wid')
                        // 找出那一個
                        const div = $('#parsingTable').find(`[wid=${wid}]`)
                        // 取出 sn
                        const sn = div.find('.sn').attr('sn')
                        const N = div.find('.sn').attr('tp') == 'H' ? 1 : 0
                        SN_Act_Color.s.act_add(sn, N)

                        // 跳出對應的那格 wid
                        if (ps.realTimePopUp == 1 && !is_pause_realtime_temporary) {
                            show_snbtn_result_dialog(this)                                   
                            ev.stopPropagation()                          
                        }                        
                    }).on('mouseleave', function (ev) {
                        // 把 sn 去掉
                        SN_Act_Color.s.act_remove()

                        if (ps.realTimePopUp == 1 && !is_pause_realtime_temporary) {
                            close_snbtn_result_dialog()
                            ev.stopPropagation()
                        }
                    })
                    
                    
                    $('.sn-btn').on('click', function (ev) {
                        
                        // 如果有開啟 即時顯示，就暫停 2 秒
                        pause_temporary()

                        show_snbtn_result_dialog(this)
                        ev.stopPropagation()
                    })

                    $('#parsingTable').on('click', '.sn', function () {
                        var r2 = $(this)
                        var jo = {
                            sn: r2.attr('sn'),
                            isOld: r2.attr('tp') == 'H'
                        }

                        queryDictionaryAndShowAtDialogAsync(jo)
                    }).on('mouseenter', '.sn', function (ev) {
                        // 把 sn 加上，顏色
                        const dom = this
                        var r2 = $(dom)
                        var sn = r2.attr('sn')
                        var N = r2.attr('tp') == 'H' ? 1 : 0
                        SN_Act_Color.s.act_add(sn, N)
                    }).on('mouseleave', '.sn', function (ev) {
                        // 把 sn 去掉
                        SN_Act_Color.s.act_remove()
                    })
                }
                $('.parsingSecBack, .parsingSecNext').off('click').on('click', function (event) {
                    let ps = TPPageState.s
                    const bookLast = ps.bookIndex
                    const chapLast = ps.chap

                    const target = $(event.currentTarget)                    
                    const book = target.attr('book')
                    const chap = target.attr('chap')
                    const sec = target.attr('sec')

                    ps.bookIndex = parseInt(book)
                    ps.chap = parseInt(chap)
                    ps.sec = parseInt(sec)

                    triggerGoEventWhenPageStateAddressChange(ps)
                    BookSelect.s.render()
                    if ( bookLast != ps.bookIndex || chapLast != ps.chap ) {
                        FhlLecture.s.render(ps)
                    }
                    FhlInfo.s.render(ps)
                    FhlLecture.s.selectLecture(null, null, sec)
                    ViewHistory.s.render()
                })
                break;
            case "fhlInfoComment":
                comment_register_events()
                break;
            default:
                break;
        }
    }
    render(ps = null, dom = null){
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = this.dom

        var that = this;
        switch (ps.titleId) {
            case "fhlInfoParsing":
                parsing_render_async()
                break;
            case "fhlInfoComment":
                comment_render_async()
                break
            case "fhlInfoPreach":
                do_preach(ps, dom);
                break;
            case "fhlInfoTsk":
                // 串珠 snow
                renderTsk(ps);
                break;
            case "fhlInfoOb":
                // 典藏 snow
                var dom2 = document.getElementById("fhlInfoContent");
                if (dom2 != null) {
                    var rProp = {
                        ibook: getBookFunc("indexByEngs", ps.engs),
                        ichap: ps.chap,
                        isec: ps.sec,
                        isgb: ps.gb ? true : false,
                        cy: $(dom2).height()
                    };
                    var r = React.createElement(obphp.R.frame, rProp); // r:react Ob:(Old Bible) Frame
                    var renderobj = React.render(r, dom2);
                }
                break;
            case "fhlInfoAudio":

                // 有聲聖經 snow
                {
                    var pfn_callback = function fn_after_set(ibook, ichap) {
                        ps.chineses = BibleConstant.CHINESE_BOOK_ABBREVIATIONS[idx];
                        ps.chap = ichap + 1; //因為是0-based 與 1-based
                        ps.sec = 1;
                        bookSelect.render(pageState, bookSelect.dom);
                        fhlLecture.render(pageState, fhlLecture.dom);
                        fhlInfo.render(pageState);
                    };
                    var idx = getBookFunc("index", ps.chineses); // 0-based

                    // add 2015.12.10(四) snow, 若是沒加這個條件, (前兩個, 點到節的時候會重播...但根本是同一章,不該重播), (第3個...若只加前2個條件, 不加第3個, 在從其它功能(例如典藏...切回來有聲...就不會render了)
                    if (audiobible.g_audiobible.m_ibook != idx || audiobible.g_audiobible.m_ichap != ps.chap - 1 || ps.titleId != ps.titleIdold) {
                        //ps.chap; // 1-based
                        audiobible.g_audiobible.set_book_chap(idx, ps.chap - 1, dom[0]);
                        audiobible.g_audiobible.m_pfn_after_set = pfn_callback;
                    }
                }
                break;
            case "fhlInfoMap":
                // 地圖 map
                fhlmap_render(ps, dom);
                // dom.html("<div style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); '>施工中...</div>");
                break;
            case "fhlSnBranch":
                SnBranchRender.s.render(ps)
                break
            case "fhlAi":
                render_ai_tools()
                break
        }
        fhlmap_titleId_prev = ps.titleId; //地圖 map 會用到, 因為切換走分頁, 再切換回來要 re-create render object. see also: fhlmap_render
    }
}
