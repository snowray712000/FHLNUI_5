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
import { comment_register_events } from './comment_register_events_es2023.js'
import { Parsing_normalize_address } from './Parsing_normalize_Address_es2023.js'
import { BookSelect } from './BookSelect.es2023.js'
import { ParsingCache } from './ParsingCache_es2023.js'
import { parsing_render_async } from './parsing_render_async_es2023.js'
import { assert } from './assert_es2023.js'

/**
 * 延後載入：切到該分頁才下載，build 後各自成為獨立 chunk（首次載入少約 250KB 原始碼）。
 * 載入過一次後就同步呼叫，行為與原本 static import 相同；只有第一次是非同步。
 * @template T
 * @param {() => Promise<T>} importer
 */
function lazyModule(importer) {
    /** @type {T|undefined} */
    let mod
    /** @type {Promise<T>|undefined} */
    let loading
    return {
        /**
         * @param {TPFhlTitleId} titleId 下載完成時若使用者已切到別的分頁，就不 render
         * @param {(m: T) => void} fn
         */
        run(titleId, fn) {
            if (mod) return fn(mod)
            loading ??= importer().then(m => (mod = m))
            loading.then(m => {
                if (TPPageState.s.titleId === titleId) fn(m)
            }, err => {
                loading = undefined // 下次切換再試
                console.error(`載入 ${titleId} 失敗`, err)
            })
        },
    }
}
const lazyComment = lazyModule(() => import('./comment_render_es2023.js')) // 註釋
const lazyTsk = lazyModule(() => import('./tsks/renderTsk.js')) // 串珠
const lazyOb = lazyModule(() => import('./FhlInfoOb.es2023.js')) // 典藏
const lazyAi = lazyModule(() => import('./ai_render_tools_es2023.js')) // AI
const lazyAudio = lazyModule(() => import('./FhlInfoAudio.es2023.js')) // 有聲聖經
const lazyPreach = lazyModule(() => import('./FhlInfoPreach.es2023.js')) // 講道

// leaflet（地圖用）原本在 index.html 一開始就載入。只有地圖分頁用得到，改為第一次切到地圖時才載入
let leafletLoading
function ensureLeafletAsync() {
    if (leafletLoading) return leafletLoading
    const load = (tag, attrs) => new Promise((res, rej) => {
        const el = Object.assign(document.createElement(tag), attrs)
        el.crossOrigin = ''
        el.onload = res
        el.onerror = rej
        document.head.appendChild(el)
    })
    leafletLoading = Promise.all([
        load('link', {
            rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.3.4/dist/leaflet.css',
            integrity: 'sha512-puBpdR0798OZvTTbP4A8Ix/l+A4dHDD0DGqYW6RQ+9jxkRFclaxxQb/SJAWZfWAkuyeQUytO7+7N4QKrDh+drA==',
        }),
        load('script', {
            src: 'https://unpkg.com/leaflet@1.3.4/dist/leaflet.js',
            integrity: 'sha512-nMMmRyTVoLYqjP9hrbed9S+FzjZHW5gY1TWCHA5ckwXZBadntCNs8kEqAWdrb9O7rxbCaA4lKTIWjDXZxflOcA==',
        }),
    ]).catch(err => {
        leafletLoading = undefined // 下次切換再試
        throw err
    })
    return leafletLoading
}

export class FhlInfoContent {
    static #s = null
    /** @returns {FhlInfoContent} */
    static get s() { if (!this.#s) this.#s = new FhlInfoContent(); return this.#s; }

    /** @type {HTMLElement} #fhlInfoContent */
    dom = null
    init(ps, dom) {
        if (ps == null) ps = TPPageState.s

        this.dom = dom
        this.render(ps, this.dom)
    }
    /**
     * @param {TPPageState} ps 
     */
    registerEvents(ps) {
        if (ps == null) ps = TPPageState.s

        var that = this;
        switch (ps.titleId) {
            case "fhlInfoParsing":
                {
                    function close_snbtn_result_dialog() {
                        let rr1 = $('.ui-dialog-title').filter((i, e) => e.innerText == "Parsing")
                        let rr2 = rr1.siblings('.ui-dialog-titlebar-close')
                        rr2.trigger('click')
                    }
                    // parsing event 事件
                    /**
                     * @param {HTMLElement} dom 
                     */
                    function show_snbtn_result_dialog(dom) {
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
                                dlg.off('click', '.sn').on({
                                    "click": function () {
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
                    function pause_temporary() {
                        if (ps.realTimePopUp == 1) {
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
                    if (bookLast != ps.bookIndex || chapLast != ps.chap) {
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
    render(ps = null, dom = null) {
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = this.dom

        var that = this;
        if (fhlmap_titleId_prev === "fhlInfoMap" && ps.titleId !== "fhlInfoMap")
            fhlmap_dispose() // 地圖留下的 leaflet 事件會讓其它分頁無法捲動
        switch (ps.titleId) {
            case "fhlInfoParsing":
                parsing_render_async()
                break;
            case "fhlInfoComment":
                lazyComment.run(ps.titleId, m => m.comment_render_async())
                break
            case "fhlInfoPreach":
                // 講道（播放器常駐，切到別的分頁也繼續播）
                lazyPreach.run(ps.titleId, m => m.FhlInfoPreach.s.render(ps, dom))
                break;
            case "fhlInfoTsk":
                // 串珠 snow
                lazyTsk.run(ps.titleId, m => m.renderTsk(ps));
                break;
            case "fhlInfoOb":
                // 典藏 snow
                lazyOb.run(ps.titleId, m => m.FhlInfoOb.s.render(ps, dom));
                break;
            case "fhlInfoAudio":
                // 有聲聖經（播放器常駐，切到別的分頁也繼續播）
                lazyAudio.run(ps.titleId, m => m.FhlInfoAudio.s.render(ps, dom))
                break;
            case "fhlInfoMap":
                // 地圖 map（第一次切到地圖時才載入 leaflet）
                if (window.L != null)
                    fhlmap_render(ps, dom);
                else
                    ensureLeafletAsync().then(() => {
                        if (TPPageState.s.titleId === "fhlInfoMap") fhlmap_render(ps, dom)
                    }, err => console.error('載入 leaflet 失敗', err))
                // dom.html("<div style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); '>施工中...</div>");
                break;
            case "fhlSnBranch":
                SnBranchRender.s.render(ps)
                break
            case "fhlAi":
                lazyAi.run(ps.titleId, m => m.ai_render_tools())
                break
        }
        fhlmap_titleId_prev = ps.titleId; //地圖 map 會用到, 因為切換走分頁, 再切換回來要 re-create render object. see also: fhlmap_render
    }
}

// tsk comment 都可以用到
$(function () {
    testThenDoAsync({
        cbTest: () => $('#fhlInfoContent').length > 0,
        ms: 300,
        cntMax: 1000,
    }).then(() => {
        $('#fhlInfoContent').off('click', '.ref').on('click', '.ref', function (ev) {
            const target = ev.currentTarget
            const addr_data = $(target).attr('addr-data')
            const addr_desc = $(target).attr("addr-desc")

            const jaAddrs = addr_data ? JSON.parse(addr_data) : null

            const ps = TPPageState.s
            const ver = ps.version[0]
            queryReferenceAndShowAtDialogAsync({
                addrs: jaAddrs,
                addrsDescription: addr_desc,
                version: ver,
                bookDefault: ps.bookIndex,
                event: ev
            })
        })
    });
})