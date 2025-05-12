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

export class FhlInfoContent {
    static #s = null
    /** @returns {FhlInfoContent} */
    static get s() { if (!this.#s) this.#s = new FhlInfoContent(); return this.#s; }

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

                $('.parsingSecBack, .parsingSecNext').click(function () {
                    var oldEngs = ps.engs;
                    var oldChap = ps.chap;
                    ps.engs = $(this).attr('engs');
                    var idx = getBookFunc('indexByEngs', ps.engs);
                    ps.chineses = BibleConstant.CHINESE_BOOK_ABBREVIATIONS[idx];
                    ps.chap = $(this).attr('chap');
                    ps.sec = $(this).attr('sec');
                    triggerGoEventWhenPageStateAddressChange(ps);
                    bookSelect.render(ps, bookSelect.dom);
                    if (oldEngs != ps.engs || oldChap != ps.chap)
                        FhlLecture.s.render(ps);
                    FhlInfo.s.render(ps);
                    FhlLecture.s.selectLecture(null, null, ps.sec);
                    ViewHistory.s.render();
                });
                break;
            case "fhlInfoComment":
                $('#fhlInfoContent').off('click', '.sn').on('click', '.sn', ev => {
                    let that = $(ev.target)
                    let sn = that.attr('sn');
                    let N = that.attr('tp') == 'H' ? 1 : 0 // 0 是新約 1 是舊約
                    queryDictionaryAndShowAtDialogAsync({ sn, isOld: N == 1 })
                })

                // sn mouseenter mouseleave 事件
                $('#fhlInfoContent').off('mouseenter', '.sn').on('mouseenter', '.sn', function () {
                    var r2 = $(this)
                    var sn = r2.attr('sn')
                    var N = r2.attr('tp') == 'H' ? 1 : 0
                    ps.snAct = sn
                    ps.snActN = N
                    SN_Act_Color.s.act_add(sn, N)
                })
                $('#fhlInfoContent').off('mouseleave', '.sn').on('mouseleave', '.sn', function () {
                    ps.snAct = ""
                    ps.snActN = -1
                    SN_Act_Color.s.act_remove()
                })
                
                $('#fhlInfoContent').off('click', '.commentJump').on('click', '.commentJump', ev => {
                    /** @type {JQuery<HTMLElement>} */
                    let that = $(ev.target)
                    let engs = that.attr('engs')
                    let book = getBookFunc('indexByEngs', engs) + 1
                    let chap = that.attr("chap")
                    let sec = that.attr("sec")
                    let addrDefault = { book: book, chap: parseInt(chap), verse: parseInt(sec) }

                    let refs = that[0].innerHTML

                    /** @type {DText[]} */
                    let dtexts = splitReference(refs, addrDefault)
                    queryReferenceAndShowAtDialogAsync({
                        addrs: dtexts[0].refAddresses
                    })
                })

                $('.commentSecBack, .commentSecNext').click(function () {
                    // $('.commentSecBack, .commentSecNext, .commentJump').click(function () {
                    var oldEngs = ps.engs;
                    var oldChap = ps.chap;
                    ps.engs = $(this).attr('engs');
                    var idx = getBookFunc('indexByEngs', ps.engs);
                    ps.chineses = BibleConstant.CHINESE_BOOK_ABBREVIATIONS[idx];
                    ps.chap = $(this).attr('chap');
                    ps.sec = $(this).attr('sec');
                    triggerGoEventWhenPageStateAddressChange(ps);
                    bookSelect.render(ps, bookSelect.dom);
                    /*if(oldEngs!=ps.engs||oldChap!=ps.chap)
                      fhlLecture.render(ps,fhlLecture.dom);*/
                    fhlLecture.render(ps, fhlLecture.dom);
                    fhlInfo.render(ps);
                    $('#fhlInfoContent').scrollTop(0);
                    viewHistory.render(ps, viewHistory.dom);
                });

                $('.commentBackground').click(function () {
                    if (ps.chap != 0 && ps.chap != 0) {
                        ps.commentBackgroundChap = ps.chap;
                        ps.commentBackgroundSec = ps.sec;
                        ps.engs = $(this).attr('engs');
                        var idx = getBookFunc('indexByEngs', ps.engs);
                        ps.chineses = BibleConstant.CHINESE_BOOK_ABBREVIATIONS[idx];
                        ps.chap = $(this).attr('chap');
                        ps.sec = $(this).attr('sec');
                        fhlInfo.render(ps);
                        $('#fhlInfoContent').scrollTop(0);
                    } else {
                        ps.chap = ps.commentBackgroundChap;
                        ps.sec = ps.commentBackgroundSec;
                        fhlInfo.render(ps);
                    }
                });

                $('#commentScrollDiv').scroll(function () {
                    $(this).addClass('scrolling');
                    clearTimeout($.data(this, "scrollCheck"));
                    $.data(this, "scrollCheck", setTimeout(function () {
                        $('#commentScrollDiv').removeClass('scrolling');
                    }, 350));
                });
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
                var ajaxUrl = getAjaxUrl("qp", ps);
                $.ajax({
                    url: ajaxUrl
                }).done(function (d, s, j) {
                    //console.log(d);// d 是回傳 純文字版, 但直接 JSON.parse 就要要用到的資料 (羅16:24有問題)
                    //console.log(s);// s 是回傳 success 字串
                    //console.log(j);// j 是回傳 ??物件, 總之 j.responseText 即是 d
                    if ( !j ){
                        return
                    }

                    /** @type {IDParsingResult} */
                    var jsonObj = JSON.parse(j.responseText);
                    
                    let html = parsing_render_top(jsonObj, ps)
                    html += parsing_render_bottom_table(jsonObj, jsonObj.N == 1 ? 'H' : 'G')

                    // 中間那個灰框，這也是為何 top 會是 212 px 的原因
                    html = "<div style='position: absolute; top: 200px; left: 0px; right: 0px; height: 12px; background: #A0A0A0;'></div>" + html + "";


                    dom.html(html);

                    that.registerEvents(ps);

                    }); // api async callback
                //tjm
                break;
            case "fhlInfoComment":
                var html = "";
                var ajaxUrl = getAjaxUrl("sc", ps);
                //console.log(ajaxUrl);
                $.ajax({
                    url: ajaxUrl
                }).done(function (d, s, j) {
                    if (j) {
                        function parseComment(t) {
                            t = t.replace(/\n/g, "</br>");
                            t = t.replace(/ /g, "&nbsp");
                            var pt, pt1;
                            var tok, tok_str;
                            var span_str;
                            var i = 0;

                            // 2017.12 詩篇 30 篇 #30| 按下去會變 undefined Bug
                            FHL.STR.eachFitDo(/#([0-9]+)\|/, t, function (m1) {
                                //var replaceTag = '<span class="commentJump" engs="Ps" chap="30" sec="1">30</span>';
                                var chap = m1[1];
                                var replaceTag = '<span class="commentJump" engs="' + ps.engs + '" chap="' + chap + '" sec="1">' + chap + '</span>';
                                t = t.replace(m1[0], replaceTag);
                            });

                            while (true) {
                                pt = t.indexOf("#");
                                pt1 = t.indexOf("|");
                                if (pt < 0 || pt1 < 0 || pt1 <= pt)
                                    break;
                                tok_str = t.substring(pt + 1, pt1);
                                span_str = "";

                                while (tok_str.length !== 0) {
                                    var firstTokEnd = tok_str.indexOf(";");
                                    if (firstTokEnd === -1)
                                        firstTokEnd = tok_str.length;
                                    tok = tok_str.substring(0, firstTokEnd);
                                    tok_str = tok_str.substring(firstTokEnd + 1, tok_str.length);

                                    span_str += "&nbsp;<span class='commentJump' engs=";
                                    var secNumberEnd = tok.indexOf("-");
                                    if (secNumberEnd === -1)
                                        secNumberEnd = tok.length;
                                    var chapNumberEnd = tok.indexOf(":");
                                    var secNumber = tok.substring(chapNumberEnd + 1, secNumberEnd);
                                    if (!isNaN(tok[0])) { // parse 在同一卷書裡面跳的
                                        var chapNumber = tok.substring(0, chapNumberEnd);
                                        span_str += ps.engs;
                                    } else { // parse 有中文字在前面的
                                        var bookNameEnd = tok.indexOf("&nbsp");
                                        var bookName = tok.substring(0, bookNameEnd);
                                        var chapNumber = tok.substring(bookNameEnd + 5, chapNumberEnd); //+5是因為&nbsp
                                        span_str += BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[BibleConstant.CHINESE_BOOK_ABBREVIATIONS.indexOf(bookName)];
                                    }
                                    span_str += " chap=" + chapNumber + " sec='" + secNumber + "'>" + tok + "</span>&nbsp;";
                                }
                                t = t.substring(0, pt) + span_str + t.substring(pt1 + 1);
                            }

                            function sn_replace(...s){
                                let tp = s[1]
                                //  parseInt 把前面的 0 去掉，||"" 若沒有 a, 才不會出現 
                                let sn = `${parseInt(s[2])}${s[3]||""}`;

                                let span = $('<span></span>')
                                span.addClass('sn').attr('sn', sn).attr('tp', tp).attr('N', tp == 'H' ? 1 : 0)
                                span.text(`${tp.toUpperCase()}${sn}`)
                                return span[0].outerHTML
                            }
                            t = t.replace(/SN([HG])([0-9]+)(a?)/gi, sn_replace)

                            return t;
                        }

                        var jsonObj = JSON.parse(j.responseText);
                        var prev_engs;
                        var prev_chap;
                        var prev_sec;
                        var next_engs;
                        var next_chap;
                        var next_sec;
                        var head_str = "";
                        var control_str = "";
                        if (jsonObj.status === "success" && jsonObj.record_count !== 0) {

                            //console.log("display");

                            if (jsonObj.hasOwnProperty('prev') && !(jsonObj.prev.chap == 0 && jsonObj.prev.sec == 0)) {
                                prev_engs = jsonObj.prev.engs;
                                prev_chap = jsonObj.prev.chap;
                                prev_sec = jsonObj.prev.sec;
                                control_str += "<div class='commentSecBack' ";
                                control_str += "engs='" + prev_engs + "' chap=" + prev_chap + " sec=" + prev_sec;
                                control_str += "><span>&#x276e;</span></div>";
                            }

                            if (jsonObj.hasOwnProperty('next') && ps.chap != 0 && ps.sec != 0) {
                                next_engs = jsonObj.next.engs;
                                next_chap = jsonObj.next.chap;
                                next_sec = jsonObj.next.sec;
                                control_str += "<div class='commentSecNext' ";
                                control_str += "engs='" + next_engs + "' chap=" + next_chap + " sec=" + next_sec;
                                control_str += "><span>&#x276f;</span></div>";
                            }

                            head_str += "<div id='commentTitle'>";
                            if (ps.chap != 0 && ps.sec != 0) {
                                head_str += jsonObj.record[0].title;
                                head_str += "</div>"
                                head_str += "<div class='commentBackground' ";
                                head_str += "engs='" + ps.engs + "' chap=" + 0 + " sec=" + 0;
                                head_str += ">" + gText書卷背景() + "</div>"; //  书卷背景 返回注释
                                function gText書卷背景() {
                                    if (ps.gb !== 1) {
                                        return "書卷背景";
                                    } else {
                                        return "书卷背景";
                                    }
                                }
                            } else {
                                var idx = getBookFunc('indexByEngs', ps.engs);
                                head_str += gText背景資料(); // 創世記 背景资料
                                head_str += "</div>"
                                head_str += "<div class='commentBackground' ";
                                head_str += "engs='" + ps.engs + "' chap=" + 0 + " sec=" + 0;
                                head_str += ">" + gText返回註釋() + "</div>";

                                function gText背景資料() {
                                    if (ps.gb !== 1) {
                                        return bookFullName[idx] + "&nbsp;背景資料";
                                    } else {
                                        return bookFullName2[idx] + "&nbsp;背景资料";
                                    }
                                }

                                function gText返回註釋() {
                                    if (ps.gb !== 1) {
                                        return "返回註釋";
                                    } else {
                                        return "返回注释";
                                    }
                                }
                            }


                            var html = jsonObj.record[0].com_text; //注釋內文

                            function do_com_text(text){
                                let reg_tp1 = /[零壹貳參肆伍陸柒捌玖拾]+、/g // 壹、
                                let reg_tp2 = /[零一二三四五六七八九十百]+、/g // 一、
                                let reg_tp3 = /（[零一二三四五六七八九十百]+）/g // （一）
                                let reg_tp4 = /\d+\./g // 1.
                                let reg_tp5 = /\(\d+\)/g // (1)
                                let reg_tp6 = /[a-zA-Z]+\./g // a.
                                let reg_tp7 = /[●◎⓪☆○※]/g
                                let reg_tp8 = /\r?\n/g
                                let reg_tp9 = /SNG|SNH/g // 創1:1
                                

                                // 組成字串, 以 | 分隔，為了製作組合的正規表達式
                                let reg_tps = [reg_tp1, reg_tp2, reg_tp3, reg_tp4, reg_tp5, reg_tp6, reg_tp7, reg_tp8, reg_tp9]
                                
                                
                                // 簡單實例 /\r?\n\s*(●|◎|a.|b.|c.|[零壹]、|\S)
                                // 就是將上面的 用 `|` 組起來，最後加上 \S，前面加上 \r\n\s*
                                let reg_pre = /\r?\n\s*/g
                                let reg_tp_str = reg_tps.map(reg => reg.source).join("|")
                                let reg_combile_str = "(" + reg_pre.source + ")" + "(" + reg_tp_str + "|\\S)"
                                let reg_combile = new RegExp(reg_combile_str, "g")

                                // 結果字串
                                let text_result = text.replace(reg_combile, (match, p1, p2) => {
                                    reg_tps.forEach(reg => reg.lastIndex = 0 ) // reset 正規化表達式，不然第2次會失效。
                                    if (reg_tps.some(reg => reg.test(p2))) {
                                        return p1 + p2
                                    } else {
                                        return p2
                                    }
                                })

                                return text_result + "\r\n\r\n\r\n" // 為了不要被遮到最下面
                            }
                            // 2024.12 移除注釋原本的換行與空白，但卻不要移除●◎(1)等。
                            html = do_com_text(html)

                            html = parseComment(html);
                            
                            html = "<div style='position: static; padding: 0px; top: 0px; bottom: 0px; overflow: auto;'>" + head_str + '<div id="commentContent">' + control_str + "<div id='commentScrollDiv'>" + html + "</div></div></div>";
                            dom.html(html);
                        } else {
                            dom.html("<div style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); '>施工中...</div>");
                        }
                        that.registerEvents(ps);
                    }

                });
                break;
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
        }
        fhlmap_titleId_prev = ps.titleId; //地圖 map 會用到, 因為切換走分頁, 再切換回來要 re-create render object. see also: fhlmap_render
    }
}
