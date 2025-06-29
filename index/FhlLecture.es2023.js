import { isRDLocation } from './isRDLocation.es2023.js'
import { qsbAsync } from './qsbAsync.es2023.js'
import { queryDictionaryAndShowAtDialogAsync } from './queryDictionaryAndShowAtDialogAsync.es2023.js'
import { queryReferenceAndShowAtDialogAsync } from './queryReferenceAndShowAtDialogAsync.es2023.js'
import { splitReference } from './splitReference.es2023.js'
import { BibleConstant } from './BibleConstant.es2023.js'

import { Sn_cnt_chap_unv_json } from "./Sn_cnt_chap_unv_json.es2023.js"
import { Sn_cnt_book_unv_json } from "./Sn_cnt_book_unv_json.es2023.js"
import { Sd_cnt_json } from "./Sd_cnt_json.es2023.js"
import { Bible_fhlwh_json } from './Bible_fhlwh_json.es2023.js'

import { getBookFunc } from './getBookFunc.es2023.js'

import { ViewHistory } from './ViewHistory.es2023.js'

import { triggerGoEventWhenPageStateAddressChange } from './triggerGoEventWhenPageStateAddressChange.es2023.js'

import { ParsingPopUp } from './ParsingPopUp.es2023.js'
import { SN_Act_Color } from './SN_Act_Color.es2023.js'
import { TPPageState } from "./TPPageState.es2023.js";
import { BookSelect } from './BookSelect.es2023.js'
import { FhlInfo } from './FhlInfo.es2023.js'
import { charHG } from './charHG.es2023.js'
import { getAjaxUrl } from './getAjaxUrl.es2023.js'
import { BibleConstantHelper } from './BibleConstantHelper.es2023.js'

import { FhlLecture_render_mode1 } from './FhlLecture_render_mode1_es2023.js'
import { FhlLecture_render_mode2 } from './FhlLecture_render_mode2_es2023.js'
import { FhlLecture_render_mode3 } from './FhlLecture_render_mode3_es2023.js'
import { testThenDoAsync } from './testThenDo.es2023.js'
import { change_sec_of_ps_if_address_exist_in_view_history, ViewHistoryData } from './ViewHistoryData_es2023.js'
import { assert } from './assert_es2023.js'
/* 
若有 2 個譯本，並且是併排方式
<div#fhlLecture>
<div.chapBack></div>
<div.chapNext></div>
<div#viewHistoryButton></div>
<div#lecMainTitle></div>
<div#lecMain>
    <div.vercol>
    <div.lec>...第1節內容...</div>
    <div.lec>...第2節內容...</div>
    <div.lec>...</div>
    </div>
    <div.vercol>
    <div.lec>...</div>
    <div.lec>...</div>
    <div.lec>...</div>
    </div>
    <div#div_copyright.vercol>...</div>
</div>
</div>
*/
// export class RootBase {
//     dom = null
//     init(ps, dom){}
//     render(ps, dom){}
//     registerEvents(ps){}
// }

export class FhlLecture {
    static #s = null
    /** @returns {FhlLecture} */
    static get s() { if (this.#s == null) this.#s = new FhlLecture(); return this.#s; }
    
    /** @type {HTMLElement} */
    dom = null
    /** @type {JQuery<HTMLElement>} Lecture 的根，裡面許多按鈕，還有顯示經文的地方，還有Title等。*/
    $lecture = null
    /** @type {JQuery<HTMLElement>} 這下一層是多個譯本，多個譯本下層就是每節經文 */
    $lecMain = null

    constructor(){
    }
    /** @return {TPPageState} */
    get ps() { return TPPageState.s }
    init(ps, dom){
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = document.getElementById('fhlLecture')
            
        this.dom = dom
        this.render(ps, dom)
        
        // render 後，才取得
        this.$lecture = $(this.dom)
        this.$lecMain = this.$lecture.find('#lecMain')
        const $lecMain = this.$lecMain

        // chapnext prev 變成1次事件就夠了
        $('.chapBack').off('click').on('click', when_click_chapback)
        $('.chapNext').off('click').on('click', when_click_chapnext)
        // 讓滾動較漂亮 (firefox 看不出，edge 看得出)
        $('#lecMain').off('scroll').on('scroll',when_scroll)
        // 選擇譯本 (因為 .versionName 是動態產生的，所以不能使用上面的方式簡化)
        $('#lecMainTitle').on({
            click: show_dialog_pick_bible_version,
        }, '.versionName');


        // 1. 深黃色 (表示目前所選取的章節)
        // 2. 配合 .sn 功能開發需求，持續更新 ps.book_hover, ps.chap_hover, ps.sec_hover
        $lecMain.on({
            click: e => { when_click_on_lec(e, $lecMain) },
            mouseenter: when_mouseenter_on_lec
        }, '.lec');



        // 關於 滑鼠移過 sn      
        $lecMain.on({
            /**
             * @param {Event} e .sn, .sn-text
             */
            click: e => {
                Dialog_Sn_Info_Summary.s.when_click_on_sn(e)
                e.stopPropagation()
            },
            mouseenter: e => Dialog_Sn_Info_Summary.s.when_mouseenter_on_sn(e),
            mouseleave: e => Dialog_Sn_Info_Summary.s.when_mouseleave_on_sn(e),
        }, '.sn, .sn-text');


        // // 向後巡覽 / 向前巡覽 initial goBack goNext
        goBackgoNext_setupEvents()

        // .ft 注腳 click
        $lecMain.on({
            click: e => when_click_on_ft(e)
        }, '.ft');

        // 地圖(綠色那個)click時, 發出sobj_pos訊息給地圖那邊接受
        $lecMain.on({
            'click': function (e) {
                try {
                    var sobj = $(this).parent(".sobj");
                    var sid = sobj.attr('sid');
                    $(document).trigger('sobj_pos', { sid: sid });
                } catch (ex) { }
            }
        }, 'img.pos');        
    }
    /**
     * 
     * @param {TPPageState} ps 
     * @param {HTMLElement} dom 
     * @returns 
     */    
    render(ps = null, dom = null){
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = this.dom

        this.dom = dom

        /** @type {JQuery<HTMLElement>} */
        // 2025.02 add sn 本章次數統計
        ps.sn_stastic = {}

        if (isRDLocation() && 'ncv' in ps.version) {
            // location 不可以用新譯本
            console.warn('離線開發,不可用新譯本,上線才能用,略過');
            ps.version = ps.version.filter(function (a1) { return a1 !== 'ncv'; });
        }

        renderLectureHtml(this)
        return
    };
    registerEvents(ps){
        // 雖然 registerEvents 裡面目前空空的，但保持原本的架構，所以留著

        // snow add
        var $lecMain = $('#lecMain');
        var mode = $lecMain.attr('mode'); //0: 原本, 1:好選擇

        // 移到 init 完成
        //that.find('.lec').click(function(){

        // 移到 init 完成
        //$('.versionName').click(function(e){

        // 移到 init 完成
        //if(ps.realTimePopUp==1){

        //下面3個已經拉到 init , 只需1次
        //$('.chapBack').click(function(e){});
        //$('.chapNext').click(function(e){});
        //$('#lecMain').scroll(function () { });

        // .ft click 也移到 init 完成
        
    }
    /**
     * 真正被使用，是在 indexLast 時呼叫一次。應該是有順序關系
     * @param {*} fnb 
     * @param {*} fnn 
     */
    when_bclick_or_nclick(fnb, fnn) {
        /// <summary> fhlLecture 提供的 event </summary>
        /// <param type="fn(e)" name="fnb" parameterArray="false">older history view</param>
        /// <param type="fn(e)" name="fnn" parameterArray="false">newer history view</param>
        testThenDoAsync({
            cbTest: () => this != null && this.$lecture != null,
            ms: 300,
        }).then( re => {
            this.$lecture.on({
                bclick: fnb,
                nclick: fnn
            });
        })
    }
    /**
     * 要提供給 render 使用，也可能會在 doSearch 中、InfoContent 中使用。
     * @param {number} book 
     * @param {number} chap 
     * @param {number} sec 
     */
    selectLecture(book, chap, sec) {
        var that = this.dom;
        that.find('.lec').removeClass('selected');
        var obj = that.find('.lec' + '[sec="' + sec + '"]');
        if (obj) {
            obj.addClass('selected');
            if (obj.position()) {
                var lecMain = $('#lecMain');
                if (obj.position().top > lecMain.height() || obj.position().top < 0)
                    lecMain.scrollTop(lecMain.scrollTop() + obj.position().top - lecMain.height() / 2);
                else
                    lecMain.scrollTop(lecMain.scrollTop());
            }
            else {
                console.log("no position");
            }
        }
    }
    // 沒有這一段，每 cols 內容雖然都有，但不會每一節對齊。
    reshape(ps) {
        /// <summary> 目前主要是 mode=1 時, align 要重新排過, 會用到的有 fontSize, resize,(在windowAdjust裡呼叫) 裡面會有 show_mode 判斷式, 只要直接呼叫即可 </summary>
        if (ps.show_mode == 1 || ps.show_mode == 3) {
            reshape_for_align_each_sec()
        }
    }
}

/**
 * @param {FhlLecture} that
 */
async function renderLectureHtml(that){
    let rspArr = await getBibleTextAsync()
    when_query_bibletext_complete(that,rspArr)
    return 
    
    /**
     * @returns {Promise<TpResultBibleText[]>}
     */
    async function getBibleTextAsync(){
        /** @type {TPPageState} */
        const ps = TPPageState.s

        const col = ps.version.length
        
        return new Promise((resolve, reject) => {
            let rspArr = new Array()
            // 第3個參數，是多個譯本，多執行緒，其中一個執行緒完成時呼叫
            // 第4個參數，是所有譯本都完成時呼叫，它會用 while loop 等待次執行緒，所以回到主執緒。
            getBibleText(col, ps, o => rspArr.push(o), () => resolve(rspArr))
        })
    }
        /**
         * @param {FhlLecture} that 
         * @param {TpOneRecordBibleText[]} rspArr 
         */
        function when_query_bibletext_complete(that, rspArr) {
            /** @type {TPPageState} */
            let ps = TPPageState.s
            
            var isOld = checkOldNew(ps);
            
            // 恢復本 2018.03 snow add
            rspArr_fixed_for_recover_version(rspArr)

            rspArr = sortBibleVersion(rspArr, ps);

            // 判斷是否要顯示「下一章、上一章的箭頭」 nextchap prevchap
            showhide_chapNext_Back_Arrow_Button()

            // Title: 就是每個譯本
            render_titles(rspArr)

            //var mode = 1;// 原本的. 就切回0
            var mode = ps.show_mode;
            let $htmlContent = "";
            if (mode == 3){
                $htmlContent = render_mode3(rspArr, isOld);
            } else if (mode == 2 ){
                $htmlContent = render_mode2(rspArr, isOld);
            } else {
                $htmlContent = render_mode1(rspArr, isOld);
            }

            ps.sn_stastic = get_sn_stastic(rspArr, $htmlContent)

            // add 2016.10 地圖與照片
            let htmlContent = (ps.ispos || ps.ispho)? render_pos_and_pho($htmlContent) : $htmlContent.html() //.html()不包含自己 ... 所以這裡不是設 lecMain 有用的地方

            that.$lecture.find('#lecMain').first()
                .html(htmlContent)
                .attr('mode', mode);
            $('#lecMain').css({ 'padding': '' })

            // 對齊 不同譯本 同一節 高度
            that.reshape(ps);

            // 2016.01.21(四) 版權宣告 snow
            render_copyright(ps.version)

            setCSS(ps.version.length, ps);
            setFont();
            
            // 清除 「暗黃色」目前選擇，並且將目前 選擇的節，設為「暗黃色」，並且將 scroll 到目前那一節
            that.selectLecture(null, null, ps.sec);

            // 加入 注腳 2016.08
            render_footer(that);

            that.registerEvents(ps);
        }
        function rspArr_fixed_for_recover_version(rspArr){
            // 恢復本 2018.03 snow add
            for (var j = 0; j < rspArr.length; j++) {
                if (rspArr[j].version == 'recover') {
                    if (rspArr[j].record[0].sec == 0) { // 不是一定發生
                        var sec1 = rspArr[j].record[1];
                        var sec0 = rspArr[j].record[0];
                        sec1.bible_text = "(" + sec0.bible_text + ")" + sec1.bible_text;

                        rspArr[j].record.shift();
                        --rspArr[j].record_count;
                    }
                    break;
                }
            }
        }
        /**
         * @param {string[]} versions ["unv", "cbol"] ... 存在於 ps.version
         */
        function render_copyright(versions){
            let div_copyrigh = $('<div id="div_copyright" class="lec copyright"></div>');
            $('#lecMain').append(div_copyrigh); // 放在 lecMain 才會在最下面. 因為 parent 有設 position 屬性
            let rr = React.createElement(copyright_api.R.frame, { ver: versions });
            const ss = React.render(rr, document.getElementById("div_copyright"));  // snow add 2016.01.21(四),
            // bug 小心: 版權宣告 render 必須在 dom.html 之後唷, 這樣才找到的 divCopyright 實體
        }
        function render_footer(that){
            const ps = TPPageState.s
            // 2016.08 snow, 注腳
            that.$lecMain.find('.lec').each(function (a1, a2) {
                var ver = $(a2).attr('ver');
                $(this).find('.verseContent').each(function (aa1, aa2) {
                    aa2.innerHTML = aa2.innerHTML.replace(/【(\d+)】/g, "<span class=ft ft=$1 ver='" + ver + "' chap=" + ps.chap + " engs='" + ps.engs + "'>【$1】</span>");
                });

                //if ( ver == 'fhlwh')
                //{// 2016.10 snow, 新約原文,要套用字型 (剛剛好也是每個 .lec, 所以就搭注腳的forEach順風車)
                //  $(a2).css('font-family', 'COBSGreekWeb');
                //  		}
            });
        }            
        function showhide_chapNext_Back_Arrow_Button(){
            /** @type {TPPageState} */
            const ps = TPPageState.s
            if (!'bookIndex' in ps) {
                console.error('bookIndex not in pageState');
            }
            
            const isVisibleBack = ps.bookIndex == 1 && ps.chap == 1
            const isVisibleNext = ps.bookIndex == 66 && ps.chap == 22
            const fhlLecture = $('#fhlLecture')

            fhlLecture.find('.chapBack').first().css('display', isVisibleBack ? 'none' : 'block')
            fhlLecture.find('.chapNext').first().css('display', isVisibleNext ? 'none' : 'block')

            // var bookName = getBookFunc("bookFullName", ps.chineses);
            // if (bookName != "failed") {
            //     if (ps.chineses == book[0] && ps.chap == 1) {
            //         $lec.find('.chapBack').first().css('display', 'none');
            //     } else {
            //         $lec.find('.chapBack').first().css('display', 'block');
            //     }
            //     if (ps.chineses == book[65] && ps.chap == 22) {
            //         $lec.find('.chapNext').first().css('display', 'none');
            //     } else {
            //         $lec.find('.chapNext').first().css('display', 'block');
            //     }
            // }                
        }
        function render_titles(rspArr){
            // console.log(JSON.stringify(rspArr))
            let dtitle = $('#lecMainTitle');
            dtitle.empty();

            for (let i = 0; i < rspArr.length; i++) {
                const o = rspArr[i];
                // o.version == 'cbol' 原文直譯
                const cname = o.version == 'cbol' ? '原文直譯' : o.v_name
                
                // 目前 closeButton 已經沒用，但在重構階段，保持原本
                dtitle.append($(`<div class=lecContent><div class=versionName>${o.v_name}<span class='closeButton' cname='${cname}'>x</span></div></div>`));
            }
        }            
        function render_mode2(rspArr,isOld){
            return FhlLecture_render_mode2(rspArr);
        }
        /**
         * @param {TpResultBibleText[]} rspArr 
         * @param {boolean} isOld 
         * @returns 
         */
        function render_mode1(rspArr,isOld){
            return FhlLecture_render_mode1(rspArr);
        }
        /**
         * @param {TpResultBibleText[]} rspArr 
         * @param {boolean} isOld 
         * @returns 
         */        
        function render_mode3(rspArr, isOld){
            return FhlLecture_render_mode3(rspArr)
        }
        function render_pos_and_pho($htmlContent) {
            let htmlContent = ""
            const ps = TPPageState.s
            var url2 = "sobj.php?engs=" + ps.engs + "&chap=" + ps.chap;
            if (ps.gb == 1)
                url2 += "&gb=1";
            fhl.json_api_text(url2, function (aa1, aa2) {
                var jrr1 = JSON.parse(aa1);
                //console.log(jrr1);

                var id2reg = {};
                var id2obj = {};
                $.each(jrr1.record, function (aaa1, aaa2) {
                    var id = aaa2.id.toString();
                    var nas = {};//Egyte,埃及,埃及. 就可以排除同樣名稱的
                    nas[aaa2.cname] = 1;
                    nas[aaa2.c1name] = 1;
                    nas[aaa2.c2name] = 1;
                    if (aaa2.ename != null && aaa2.ename.trim().length != 0)
                        nas["[ ,\\n:;\\.]" + aaa2.ename + "[ ,\\n:;\\.]"] = 1;//斷開英文可能結尾「空白,逗號,句號,冒號, 2016.11
                    //nas[aaa2.ename] = 1;

                    var nas2 = [];
                    $.each(nas, function (b1, b2) {
                        // 2016.10 nas2 若出現 ()會造成一定成立.
                        if (b1 != null && b1.trim().length != 0)
                            nas2.push(b1);
                    });

                    var regstr = "((" + nas2.join(")|(") + "))"; // ((羅馬)|([空白字元]Rome[空白字元]))
                    var regex = new RegExp(regstr, "i");
                    id2obj[id] = aaa2;
                    id2reg[id] = regex;
                }, null);
                $htmlContent.find(".verseContent").each(function (c1, c2) {
                    var str = c2.innerHTML;
                    var ischanged = false;

                    // 每1節都要測所有的 regex, 並取代
                    $.each(id2reg, function (b1, b2) {
                        // b1 是 sobj id ... id2obj 是 sobj 物件
                        var b3 = id2obj[b1];
                        var issite = b3.objpath == null || b3.objpath.trim().length == 0 ? false : true;
                        var isphoto = true; //目前無法判定是不是相片,全都當是 TODO

                        // 再優化部分(能不regex,就略過)
                        if (ps.ispos && ps.ispho == false && issite == false)
                            return;//next reg
                        else if (ps.ispho && ps.ispos == false && isphoto == false)
                            return;//next reg

                        if (b2.test(str)) 
                        {
                            ischanged = true;
                            // const isExistPhoto = ps.ispho && isphoto // 目前一定是 true
                            const strpho = `<a target='_blank' href='http://bible.fhl.net/object/sd.php?gb=${ps.gb}&LIMIT=${b1}'><img class='pho'></img></a>`
                            
                            const isExistPos = ps.ispos && issite
                            if ( isExistPos ){
                                // $1 就是「本都」這字眼
                                // 要產生 聖光地理 搜尋的網址 
                                // https://www.google.com/search?q=本都+site://biblegeography.holylight.org.tw
                                str = str.replace(b2, `<span class='sobj' sid=${b1}><span>$1</span><a target='_blank' href='https://www.google.com/search?q=$1+site://biblegeography.holylight.org.tw'><img class='pos'></img></a>${strpho}</span>`);
                            } else {
                                str = str.replace(b2, "<span class='sobj' sid=" + b1 + "><span>$1</span>" + strpho + "</span>");
                            }
                        }
                    });

                    if (ischanged) {
                        c2.innerHTML = str;
                    }
                });//each
                htmlContent = $htmlContent.html();//.html()不包含自己 ... 所以這裡不是設 lecMain 有用的地方
            }, function (aa1, aa2) {
                console.error(aa1);
            }, null, false); //第4個參數要false,要同步,否則$htmlContent還沒好就被拿來用會出問題   
            
            return htmlContent
        }         
        // 在 mode1 mode2 都要用到
        function get_sn_stastic(rspArr,$htmlContent){
            /**
             * 如果是具有 sn 的譯本 "unv", "kjv", "rcuv"，統計數量 (挑一個譯本來統計)
             * @param {{version: str}[]} rspArr 
             * @returns 
             */
            function get_preferredVersion_for_sn_stastic(rspArr){
                let j = -1;
                const preferredVersions = ["unv", "kjv", "rcuv"];
                
                for (const version of preferredVersions) {
                    const foundIndex = rspArr.findIndex(element => element.version === version);
                    if (foundIndex !== -1) {
                        j = foundIndex;
                        return version
                        break;
                    }
                }
                return undefined
            }
            let version_sn = get_preferredVersion_for_sn_stastic(rspArr)
            if ( version_sn == undefined ){
                return {}
            }
            // 開始統計
            // 並排模式下 .lecMain div 下，會有 .vercol 三個 (若3譯本)，再次那個 .vercol 下找 .sn
            // 交錯模式下 .lecMain 下，只會有一個 .vercol，每個 .lec 就是每一節經文，它會有 attr ver 取得是不是 kjv
            // 就算 sn 沒顯示，在 dom 中也有它們，只是使用了 sn-hidden class

            // 使用 jQuery 得到 .lecMain
            const div_lecMain = $htmlContent[0]
            // 取得所有 div.lec ， 並且它的 attr 的 ver 是 version_sn
            // const div_lec = $(div_lecMain).find(`div.lec[ver=${version_sn}]`)
            const div_lec = $(div_lecMain).find(`.lec[ver=${version_sn}]`) // mode 1 2 是 div.lec 而 mode 3 是 span.lec
            // 取得所有 div.lec 下的 .sn
            const div_sn = div_lec.find('.sn')
            
            // 分析 div_sn 的 attr sn 與 attr n ，型成 sn = [] n = [] 陣列
            let sn = []
            let n = []
            div_sn.each((i, e) => {
                sn.push($(e).attr('sn'))
                n.push($(e).attr('n'))
            })
            // 檢查: 理論上，所有 n 都是同個值
            const isTheSame_n = true
            for (let i = 1; i < n.length; i++) {
                if (n[i] !== n[0]){
                    isTheSame_n = false
                    break
                }
            }
            if (isTheSame_n == false){
                console.error('n 不一致，請回報此書卷')
                return {}
            } 
            // 統計每個sn，出現次數，最後要能夠查表
            let sn_count = {}
            for (let i = 0; i < sn.length; i++) {
                if (sn_count[sn[i]] == undefined){
                    sn_count[sn[i]] = 1
                } else {
                    sn_count[sn[i]] += 1
                }
            }
            // 以 value 來排序，從大到小 (目前還沒用到，不久會用到)
            // let sn_count_sorted = Object.entries(sn_count).sort((a, b) => b[1] - a[1])
            // 顯示前 10 個
            // console.log(sn_count_sorted.slice(0, 10));
            return sn_count
        }            
        function setFont() {
            $('.bhs').addClass('hebrew');
            $('.nwh').addClass('greek');
            $('.lxx').addClass('greek');
        }
        function checkOldNew(ps) {
            //0 - Old
            //1 - New
            return (BibleConstant.CHINESE_BOOK_ABBREVIATIONS.indexOf(ps.chineses) >= 39) ? 0 : 1;
        }
        function sortBibleVersion(r, ps) {
            var tmpArr = new Array();
            for (var i = 0; i < ps.version.length; i++) {
                var version = ps.version[i];
                for (var j = 0; j < r.length; j++) {
                    if (version == r[j].version) {
                        tmpArr.push(r[j]);
                    }
                }
            }
            return tmpArr;
        }

        function setCSS(col, ps) {
            var totalWidth = 100;
            $('.lecContent').css('width', (totalWidth / col) + "%");
            $('.lecVersion').css('width', (totalWidth / col) + "%");
        }
        /** 
        * bhs 馬索拉原文 (希伯來文)
        * @param {string} ver - fhlwh lxx bhs
        */            
        function isHebrewVersion(ver){
            return ['bhs'].indexOf(ver) != -1
        }
        /** 
        * fhlwh 新約原文 lxx 七十士譯本(舊約用希臘文)
        * @param {string} ver - fhlwh lxx bhs
        */            
        function isGreekVersion(ver){
            return ['fhlwh','lxx'].indexOf(ver) != -1
        }
        function getBibleText(col, ps, cbk, defCbk) {
            var sem = col; // 版本數量

            var r1 = Enumerable.range(0, col).select(i => ({
                ver: ps.version[i],
                vna: abvphp.get_cname_from_book(ps.version[i], ps.gb == 1),
                url: getAjaxUrl("qb", ps, i)
            })).toArray()

            Enumerable.from(r1).forEach(a1 => {
                // console.error(a1);
                // console.error(ps);
                
                if ( a1.ver == "fhlwh"){
                    // 新約原文，若要有 SN，要用這個資料，而不是從 api 取得。
                    testThenDoAsync(() => Bible_fhlwh_json.s.filecontent != null).then(() => {
                        // bookIndex 45 chap 1
                        /** @type {{number,number,number,string}[]} */
                        const bk = ps.bookIndex
                        const ch = ps.chap
                        // where [0]=bk and [1]=ch
                        const jaBible = Bible_fhlwh_json.s.filecontent["data"].filter(ja => ja[0] == bk && ja[1] == ch)
                        // console.log(jaBible);

                        // chap, sec, bible_text
                        const jaBible2 = jaBible.map(ja => ({
                            chap: ja[1],
                            sec: ja[2],
                            bible_text: ja[3],
                            book: ja[0]
                        }))
                        const joResult = {
                            "status": "success",
                            "version": a1.ver,
                            "record": jaBible2,
                            "record_count": jaBible2.length,
                            "v_name": "新約原文"
                        }

                        add_book_property_to_bibletext_record(joResult)

                        cbk(  joResult )

                        sem--       
                    })
                } else {
                    $.ajax({
                        url: a1.url
                    }).done(function (d, s, j) {
                        if (j) {
                            var jsonObj = JSON.parse(j.responseText);
                            // jsonObj.version = a1.ver  // qb.php 有但 qsb.php 沒有

                            add_book_property_to_bibletext_record(jsonObj)

                            cbk(jsonObj);
                            sem--;
                        }
                    });
                }                 

            })

            testThenDoAsync(() => sem == 0)
                .then(() => defCbk())
        }
}
/**
 * 在 fhlLecture init 時初始化
 */
function goBackgoNext_setupEvents(){
    // 向後巡覽 / 向前巡覽
    const $lecture = $('#fhlLecture');
    const $vhb = $('#viewHistoryButton');
    $vhb.on({
        click: function (e) {
            $lecture.trigger('bclick');// fhlLecture
        }
    }, '.b').on({
        click: function (e) {
            $lecture.trigger('nclick');// fhlLecture
        }
    }, '.n');

    (function () {
        function recolor(e, p1) {
            /// <summary> 當 viewHistory 資料或 idx 變的時候, 要判斷是不是灰色 (document的vh_idxchanged事件與vh_itemschanged事件) </summary>
            if (p1.datas.length - 1 == p1.idx)
                $vhb.find('.b').css('color', 'darkgray');
            else
                $vhb.find('.b').css('color', 'black');
            if (p1.idx == 0)
                $vhb.find('.n').css('color', 'darkgray');
            else
                $vhb.find('.n').css('color', 'black');
        }
        $(document).on(
            {
                vh_idxchanged: recolor,
                vh_itemschanged: recolor
            });
    })();    
}
/**
 * 這不是事件，是 fhlLecture 會被呼叫 reshape 時主動呼叫的
 */
function reshape_for_align_each_sec(){
    /// @verbatim 對齊必須在 dom.html(html) 之後才作, 因為那時候才會有實體, 否則取出來的 height() 會是 0@endverbatim
    const $lecMain = $("#lecMain")
    if ($lecMain == null) {
        return 
    }
    
    const cols = $lecMain.children('.vercol') // 原程式用 children 會包含到 div#div_copyright，所以改用 .vercol
    
    var qcols = Enumerable.from(cols);
    var qvers = qcols.select(function (a1) { return $(a1).children(); });

    if (qvers.count() != 0) {
        var maxRecordCnt = qvers.max(a1 => a1.length)

        for (var i = 0; i < maxRecordCnt; i++) {
            var qvers2 =
                qvers.select(function (a1) { if (a1[i] == null) return null; return a1[i] });
            qvers2.forEach(function (a1) { if (a1 != null) $(a1).height('100%'); }); //要先變為auto, 才能正確算 最大的 cy
            var maxcy = qvers2.max(function (a1) { return a1 == null ? 0 : $(a1).height() });
            qvers2.forEach(function (a1) { if (a1 != null) $(a1).height(maxcy); });
        }
    }
}
function render4(){
    ViewHistory.s.render();
    FhlLecture.s.render();
    FhlInfo.s.render(ps);
    BookSelect.s.render();    
}
function when_click_chapback(e){
    /** @type {TPPageState} */
    let ps = TPPageState.s
    assert(ps.bookIndex != null, 'bookIndex not in pageState')
    if ( ps.bookIndex == 1 && (ps.chap == 1 || ps.chap == 0) ){
        // 都不該生效 (應該不會被按到才對)
        return 
    }

    if ( ps.chap == 0 ) {
        // 此時，是註解，按了「書卷背景」。
        // 若 book 又是第1章，此時按上一頁會出錯「第零章」錯誤
        // 同樣，若在最後1章，進入書卷背景，再按下一章，也會出現錯誤
        if ( ps.commentBackgroundChap == 1 ) {
            // 要上一卷書
            ps.bookIndex--;
            ps.chap = BibleConstant.COUNT_OF_CHAP[ps.bookIndex - 1];
        } else {
            ps.chap = ps.commentBackgroundChap - 1
        }        
    } else {
        if ( ps.chap == 1 ) {
            // 按上一章，就是切換書卷了
            ps.bookIndex--;
            ps.chap = BibleConstant.COUNT_OF_CHAP[ps.bookIndex - 1];
        } else {
            ps.chap--;
        }
    }
    ps.sec = 1; // 每次切換章節，預設是第一節

    // 當使用者切換章節時，若是看過的章，則跳到「那節」，而不要「第一節」
    change_sec_of_ps_if_address_exist_in_view_history()

    triggerGoEventWhenPageStateAddressChange(ps);
    
    render4()
    
    e.stopPropagation();

    $('#fhlLecture').trigger('chapchanged'); // 變更 history.
}
function when_click_chapnext(e){
    /** @type {TPPageState} */
    let ps = TPPageState.s
    assert(ps.bookIndex != null, 'bookIndex not in pageState')
    if ( ps.bookIndex == 66 && (ps.chap == 22 || ps.chap == 0) ){
        // 都不該生效 (應該不會被按到才對)
        return 
    }

    const lastChap = BibleConstant.COUNT_OF_CHAP[ps.bookIndex - 1]
    if ( ps.chap == 0 ) {
        // 此時，是按了「註解」中的「書卷背景」。此時應當要用
        if ( ps.commentBackgroundChap == lastChap ) {
            // 要下一卷書
            ps.bookIndex++;
            ps.chap = 1;
        } else {
            ps.chap = ps.commentBackgroundChap + 1
        }
    } else {
        if ( ps.chap == lastChap ) {
            // 按下一章，就是切換書卷了
            ps.bookIndex++;
            ps.chap = 1;
        } else {
            ps.chap++;
        }
    }
    ps.sec = 1; // 每次切換章節，預設是第一節

    // 當使用者切換章節時，若是看過的章，則跳到「那節」，而不要「第一節」
    change_sec_of_ps_if_address_exist_in_view_history()

    triggerGoEventWhenPageStateAddressChange(ps); // 這個事件，有人在用唷，就是 viewHistory 會用
    
    render4()

    e.stopPropagation();

    $('#fhlLecture').trigger('chapchanged');
}
/**
 * @param {Event} e 
 */
function when_scroll(e){
    // 滾動時，較漂亮， scrolling .css 中有定義 。
    // TODO: 這裡可以使用 debounce，這樣會更好
    const currentTarget = e.currentTarget
    $(currentTarget).addClass('scrolling');
    clearTimeout($.data(currentTarget, "scrollCheck"));
    $.data(currentTarget, "scrollCheck", setTimeout( () => {
        $(currentTarget).removeClass('scrolling');
    }, 350));
}
function show_dialog_pick_bible_version(){
    // 與 ios 版，統一操作模式
    $('#versionSelect3').trigger('click')
}
/**
 * 深黃色，目前選取章節，供 info 使用
 * @param {Event} e 
 * @param {JQuery<HTMLElement>} $lecMain
 */
function when_click_on_lec(e, $lecMain){
    /** @type {TPPageState} */
    let ps = TPPageState.s

    // const $lecMain = $('#lecMain')
    const currentTarget = e.currentTarget // 原程式的 this
    const $this = $(currentTarget) // 原程式的 this

    if ($this.hasClass('copyright')) //版本宣告,應該不能click snow add 2016.01.22(五)
        return;
    var mode = $lecMain.attr('mode'); //0: 原本, 1:好選擇

    var oldsec = ps.sec
    var oldchap = ps.chap

    ps.sec = parseInt($this.attr('sec'));
    ps.chap = parseInt($this.attr('chap'));

    // selected class 處理
    const alllec = $lecMain.find('.lec');        
    alllec.removeClass('selected').filter(`[sec=${ps.sec}]`).addClass("selected"); // 先移除所有的選擇，再加入


    triggerGoEventWhenPageStateAddressChange(ps);
    FhlInfo.s.render(ps);

    // 因為搜尋還沒有加事件, 這個是暫時用的 2017.09
    var idx = getBookFunc("index", ps.chineses);
    ps.bookIndex = idx + 1; // 此idx回傳是 0-based

    // 2017.08
    if (oldsec != ps.sec || oldchap != ps.chap)
        $lecMain.trigger('secchanged')
}
/**
 * 更新 ps.book_hover, ps.chap_hover, ps.sec_hover
 * 這是為了使 .sn 功能而需要的
 * @param {Event} e
 */
function when_mouseenter_on_lec(e){
    /** @type {TPPageState} */
    let ps = TPPageState.s
    let currentTarget = e.currentTarget // 原程式的 this
    let $this = $(currentTarget) // 原程式的 this
    // 取得這個 dom ， 它會有 attr sec ( 在 .sn mouseenter 要用到 )

    let sec = $this.attr('sec');
    ps.sec_hover = sec
    let chap = $this.attr('chap');
    ps.chap_hover = chap
    let book = $this.attr('book');
    ps.book_hover = book    
}

/**
 * 
 * @param {string} sn 
 * @param {0|1} N 
 * @returns {number} -1 表示沒有，這不正常。你可以顯示 ?。-2 表示還沒有 sd_cnt 
 */
function get_sn_count_in_bible(sn, N){
    if (Sd_cnt_json.s.filecontent == null) return -2
    
    let hg = N == 0 ? "greek" : "hebrew"
    let cnt = Sd_cnt_json.s.filecontent[hg][sn]
    if ( cnt != undefined ){
        return cnt
    }
    return -1
}
function get_sn_count_in_book(sn, book){
    if (Sn_cnt_book_unv_json.s.filecontent == null) return -2
    
    let hg = book >= 40 ? "G" : "H"
    let cnt = Sn_cnt_book_unv_json.s.filecontent[hg][sn][book]
    if ( cnt != undefined ){
        return cnt
    }
    return -1
}
/**
 * 
 * @param {string} sn 168a
 * @param {number} book 1based book id 1-66
 * @returns {Object<number,number>} -1 表示沒有，這不正常。你可以顯示 ?。-2 表示還沒有 sd_cnt
 */
function get_sn_count_in_chap(sn, book){
    if ( Sn_cnt_chap_unv_json.s.filecontent == null) return -2

    let hg = book >= 40 ? "G" : "H"
    
    let dict_chap_cnt = Sn_cnt_chap_unv_json.s.filecontent[hg][sn][book]    
        
    if ( dict_chap_cnt != undefined ){
        // return clone result, not the original, to prevent change the original
        return JSON.parse(JSON.stringify(dict_chap_cnt))
    }
    return -1
}

/**
 * @param {Event} e 
 */
function mouseenter_sn_set_snAct_and_Color_act(e){
    /** @type {TPPageState} */
    let ps = TPPageState.s
    const dom = e.currentTarget

    let N = $(dom).attr('N') // 1: 舊約 0: 新約
    let sn = $(dom).attr('sn')                    
    ps.snAct = sn
    ps.snActN = N
    
    // Activate sn，標記為紅色
    SN_Act_Color.s.act_add(sn, N)
}
class ParsingCache {
    /**
     * @param {DAddress_Realtime} address 
     * @returns {IDParsingResult|undefined}
     */
    static try_get(address) {
        let { book, chap, sec } = address
        
        let book1 = ParsingCache._data[book]
        if ( book1 == undefined ) return undefined
        
        let chap1 = book1[chap]
        if ( chap1 == undefined ) return undefined

        return chap1[sec]
    }
    /**
     * 若取得後，會作修改，就要用這個
     * 例如會加上 .one = xxxx 
     * @param {DAddress_Realtime} address 
     * @returns {IDParsingResult|undefined}
     */        
    static try_get_clone(address){
        let r1 = this.try_get(address)
        if (r1 == undefined) return undefined
        return this._json_clone(r1)
    }
    /**
     * @param {DAddress_Realtime} address 
     * @param {IDParsingResult} value 
     */
    static add(address, value) {
        let { book, chap, sec } = address
        if (this._data[book] === undefined) {
            this._data[book] = {};
        }
        if (this._data[book][chap] === undefined) {
            this._data[book][chap] = {};
        }

        // 這裡要 clone, 不然我們 add 後，以為順序對了，就是存了原始的
        // 但 add 後，若被更改，例如 jo.one = xxx ， 因為是指向同個記憶體，仍然會被改變
        // 所以保險的方法，是這裡要 clone 
        this._data[book][chap][sec] = this._json_clone( value );
        
    }
    /**
     * 因為 es6 沒有支援 tuple 作為 key
     * @type {Object<number,Object<number,Object<number,IDParsingResult>>}
     */
    static _data = {}
    static _json_clone(jo){return JSON.parse(JSON.stringify(jo))}
}
/**
 * sn mouseenter realtime 要用的
 */
class SnDictCache {
    /**
     * @param {{N: 0|1, sn: string}} sn_N 
     * @returns {DataOfDictOfFhl|undefined}
     */
    static try_get(sn_N) {
        let { sn , N } = sn_N

        let r1 = this._data[N]
        if (r1 == undefined) return undefined

        return r1[sn]
    }
    /**
     * @param {{N: 0|1, sn: string}} sn_N 
     * @returns {DataOfDictOfFhl|undefined}
     */        
    static try_get_clone(sn_N){
        let r1 = this.try_get(sn_N)
        if (r1 == undefined) return undefined
        return this._json_clone(r1)
    }
    /**
     * @param {{N: 0|1, sn: string}} sn_N 
     * @param {DataOfDictOfFhl} value 
     */
    static add(sn_N, value) {
        let { sn , N } = sn_N
        if (this._data[N] === undefined) {
            this._data[N] = {};
        }
        this._data[N][sn] = this._json_clone(value);
    }
    /**
     * @type {Object<number,Object<string,DataOfDictOfFhl>>}
     */
    static _data = {}
    static _json_clone(jo){return JSON.parse(JSON.stringify(jo))}
}
/**
 * @param {Event} e 
 */
function mouseenter_sn_dialog(e){
    /** @type {TPPageState} */
    let ps = TPPageState.s
    const dom = e.currentTarget
    let N = $(dom).attr('N') // 1: 舊約 0: 新約
    let sn = $(dom).attr('sn')                    
    ps.snAct = sn
    ps.snActN = N
    
    // Activate sn，標記為紅色
    // SN_Act_Color.s.act_add(sn, N)

    // 取得資料 async 
    // 若取得資料完成時，滑鼠還在同一個 sn 上，就繼續顯示，若非，就不顯示
    // 可以有 cache 資料
    // 若還沒取得，就變成下一個 sn 時，這個應該就不要再取了 (能中斷嗎？若不能，就是取完，但是存成 cache，但不顯示)
    
    // 準備資料 - sn,N,book,chap,sec
    let book = ps.book_hover
    let chap = ps.chap_hover
    let sec = ps.sec_hover                    
    let one = { sn, N, book, chap, sec }

    ps.xy_hover = {x: e.clientX, y: e.clientY }

    class DOne {
        constructor(sn, N, book, chap, sec) {
            this.sn = sn
            this.N = N
            this.book = book
            this.chap = chap
            this.sec = sec
        }
    }


    /**
     * 
     * @param {DOne} one 
     * @returns 
     */
    function get_parsing_async(one){
        let result_from_cache = ParsingCache.try_get_clone(one)
        if (result_from_cache != undefined ) {
            let re = result_from_cache
            re.one = one
            return Promise.resolve(result_from_cache)
        }
        
        return new Promise((res, rej) => {

                let engs = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[one.book-1]
                let chap = one.chap
                let sec = one.sec

                let endpoint = `/json/qp.php?engs=${engs}&chap=${chap}&sec=${sec}&gb=0`
                let host = isRDLocation() ? 'https://bible.fhl.net' : ''
                let url = host + endpoint
            
                $.ajax({
                    url,
                    /**
                     * @param {IDParsingResult} a1 
                     */
                    success: a1 => {
                        if (a1.status == "success" && a1.record.length > 0) {
                            ParsingCache.add(one, a1)

                            /** @type {IDParsingResult_Realtime} */
                            let json = a1
                            json.one = one
                            res(json)
                        } else {
                            res("找不到資料 get_parsing_async a")
                        }
                    },
                    error: er => {
                        res("找不到資料 get_parsing_async b")
                    }
                });
                
                                
        })
    }
    function get_dict_async(one){
        let result_from_cache = SnDictCache.try_get_clone(one)
        if (result_from_cache != undefined ) {
            let re = result_from_cache
            re.one = one
            return Promise.resolve(result_from_cache)
        }
        // GET	http://127.0.0.1:5600/json/sd.php?N=0&k=2424&gb=0
        let sn = one.sn
        let N = one.N
        let endpoint = `/json/sd.php?k=${sn}&N=${N}&gb=0`
        let host = isRDLocation() ? 'http://127.0.0.1:5600' : ''
        let url = host + endpoint

        return new Promise((res, rej) => {                            
            $.ajax({
                url,
                success: a1 => {
                    if (a1.status == "success" && a1.record.length > 0) {
                        /** @type {DataOfDictOfFhl_Realtime} */
                        SnDictCache.add(one, a1)
                        
                        let json = a1
                        json["one"] = one // 在 .then 才知道，當時是哪一組資料
                        json.src = "cbol"
                        json.isOld = N == 1 ? 1 : 0
                        res(json)
                    } else {
                        res("找不到資料 get_dict_async a")
                    }
                },
                error: er => {
                    res("找不到資料 get_dict_async b")
                }
            });
        })
    }

    function get_parsing_and_dict_async(one){
        return Promise.all([get_parsing_async(one), get_dict_async(one)])
    }
    /**
     * 
     * @param {IDParsingResult_Realtime} re_parsing 
     * @param {DataOfDictOfFhl_Realtime} re_dict 
     */
    function show_dialog(re_parsing, re_dict){
        // 開啟新的前，自動關閉已經開啟中的 ... 所有 .ui-dialog-title 中 text 是 Parsing 的 ... 取得 close 按鈕結束
        let rr1 = $('.ui-dialog-title').filter((i, e) => $(e).hasClass('realtime-sn'))
        let rr2 = rr1.siblings('.ui-dialog-titlebar-close')
        rr2.trigger('click')

        // console.log(re_parsing);
        // console.log(re_dict);
        const DialogHtml = DialogHtmlEs6Js()
        let dlg = new DialogHtml()

        // G3762
        let N = re_dict.one.N
        let sn = re_dict.one.sn
        let sn_hg = (N==0?'G':'H') + sn // 2 處用到
        let span_sn = $('<span>').text(`${sn_hg} `).addClass('sn').attr('sn',sn).attr('N',N)

        // <span.fn-search-sn sn,isOld> 出現經文 </span>
        const span_fn_sn_search = $('<span>').text(`出現經文`).addClass('fn-search-sn').attr('sn',sn).attr('tp',(N==0?'G':'H'))

        // 原文 簡義
        // 從 same 中找到自己那個
        let span_orig = $('<span>').addClass('orig')
        let span_mean = $('<span>').addClass('mean')
        function get_this_from_same(sn){
            let same = re_dict.record[0].same
            for (let i = 0; i < same.length; i++) {
                const element = same[i];
                if (element.csn == sn){
                    return element
                }
            }
            return undefined
        }
        let data_from_same = get_this_from_same(sn)
        if (data_from_same != undefined){
            // console.log(data_from_same);
            span_orig.append($('<span>').text(data_from_same.word))
            span_mean.append($('<span>').text(data_from_same.cexp))
        }

        // 本章 n 次，本書 n 次，聖經 n 次。
        // 聖經出現次數
        let cnt_in_bible = get_sn_count_in_bible(sn, N)
        let description_in_bible = `聖經 ${cnt_in_bible > -1 ?cnt_in_bible:'?'} 次`
        // 此書卷出現次數
        let cnt_in_book = get_sn_count_in_book(sn, re_dict.one.book)
        let description_in_this_book = `本書 ${cnt_in_book > -1 ?cnt_in_book:'?'} 次`
        // 本章出現次數
        // 嘗試取得 sn 出數 (同一章，N一定是相同)
        let cnt_in_this_chap = ps.sn_stastic?.[sn] ?? -1;
        let description_in_this_chap = `本章 ${cnt_in_this_chap > -1 ?cnt_in_this_chap:'?'} 次`

        // 主要分佈於 7,5,1,2 章。為別次數為 5,4,3,2。 (排序後，前5個，如果第6、第7也與第5一樣，也列出來)
        let cnt_chap_in_book = get_sn_count_in_chap(sn, re_dict.one.book)
        let description_in_this_book_chap = undefined
        if (cnt_chap_in_book != -1 && cnt_chap_in_book != -2){
            let ar = []
            for (const key in cnt_chap_in_book) {
                if (cnt_chap_in_book.hasOwnProperty(key)) {
                    const element = cnt_chap_in_book[key];
                    ar.push({chap:key, cnt:element})
                }
            }
            ar.sort((a,b)=>b.cnt-a.cnt)
            // 判斷有沒有超過5個
            const cnt_limit = 3
            if (ar.length > cnt_limit){
                // 看第6個，第7個，有沒有與第5個一樣的大小
                let cnt5 = ar[cnt_limit-1].cnt
                let idxslice = cnt_limit
                for (let i = cnt_limit; i < ar.length; i++) {
                    const element = ar[i];
                    if (element.cnt == cnt5){
                        idxslice++
                    } else {
                        break
                    }
                }
                ar = ar.slice(0,idxslice)

                const des_where = ar.map(a1=>`${a1.chap}`).join(',')
                const count_each = ar.map(a1=>`${a1.cnt}`).join(',')

                description_in_this_book_chap = `本書主要於 ${des_where} 章。次數為 ${count_each}。`
            } else {
                description_in_this_book_chap = `本書主要於 ${ar.map(a1=>`${a1.chap}`).join(',')} 章。次數為 ${ar.map(a1=>`${a1.cnt}`).join(',')}。`
            }

            
        } else {
            // console.log("沒有資料");
        }

        

        

        // let span_count = $('<span>').append($('<span>').text(`本章 ${cnt_in_this_chap > -1 ?cnt_in_this_chap:'?'} 次，聖經 ${cnt_in_bible > -1 ?cnt_in_bible:'?'} 次。`))
        
        let span_count = $('<span>').append($('<span>').text(`${description_in_this_chap}，${description_in_this_book}，${description_in_bible}。`))
        if (description_in_this_book_chap != undefined){
            span_count.append($('<br>'),$('<span>').text(description_in_this_book_chap))
        }
        
        // 詞性分析 
        // 詞性: 形容詞 分析: 主格 單數 中性 (新約)
        // 分析: 介系詞 בְּ + 名詞，陰性單數 (舊約)
        // 詞性分析，從 parsing 找 SN，可能會有多個 SN 都符合，就2 個都要顯示，但若 2 個完全一樣，就只顯示一個。
        let span_parsing = $('<span>').addClass('parsing')
        function find_sn_parsing(sn){
            // 從 i=1 開始判斷，因為 parsing.record 的 [0] 不是每個 sn 分析
            let the_same_sn_parsing = []
            for (let i = 1; i < re_parsing.record.length; i++) {
                const element = re_parsing.record[i];
                if (element.sn == sn){
                    the_same_sn_parsing.push(element)
                }
            }

            // 判斷有相同的，則拿掉。從最後一個往前判斷到 1 判斷完，0不用
            for (let i = the_same_sn_parsing.length - 1; i > 0; i--) {
                const element = the_same_sn_parsing[i];
                if (element.wform == the_same_sn_parsing[0].wform){
                    the_same_sn_parsing.splice(i, 1)
                    console.log("拿掉了 相同的");
                }
            }

            if ( the_same_sn_parsing.length == 0){
                // 正常，像 <9002> 或是 (8804) 這一類，本來就沒有
                // console.error("分析錯誤。", re_parsing.record );
            }

            return the_same_sn_parsing
        }                        
        let the_same_sn_parsing = find_sn_parsing(sn)
        if ( the_same_sn_parsing.length == 0){
            // 不太可能，顯示出錯誤
            // span_parsing.append('<span class="error">分析錯誤。</span>')
        } else {
            for (let i = 0; i < the_same_sn_parsing.length; i++) {
                const element = the_same_sn_parsing[i];
                // 若 詞性，分析，都是空字串，就跳過
                if (element.pro == "" && element.wform == "") continue
                
                let span_one_parsing = $('<span>').addClass('one-parsing')

                // 詞性
                if ( element.pro != "" ){
                    span_one_parsing.append($('<span>').addClass('item-title').text('詞性:')).append($('<span>').text(element.pro))
                }

                // 分析
                if ( element.wform != "" ){
                    span_one_parsing.append($('<span>').addClass('item-title').text('分析:')).append($('<span>').text(element.wform))
                }

                span_parsing.append(span_one_parsing)
            }
        }
        // cbol字典字義
        // cbol字典，中文部分。並且前半部要略過，\n\n第3次出現才開始取得
        /**
         * @param {string} data 
         * @returns 
         */
        function get_cbol_dict_part_data(data){
            function get_ignore_data(){
                let re = data.split(/\r?\n\r?\n/)
                if ( re.length < 4){
                    return re.join('<br/>').replace(/\r?\n/g,'<br/>')
                } else {
                    // 將[4]之後，以 <br/> 合併起來
                    let re2 = re.slice(3).join('<br/>')
                    return re2.replace(/\r?\n/g,'<br/>')
                }
            }
            let re1 = get_ignore_data()

            // 嘗試發現 #提後 2:1| 之類的字
            function get_reference_data(text){
                const dtexts_ar = splitReference(re1)
                
                if (dtexts_ar==null || dtexts_ar.length == 1){
                    return re1
                } else {
                    let re2 = ""
                    for (const a2 of dtexts_ar) {
                        if ( a2.refAddresses == undefined ){
                            re2 += a2.w
                        } else {
                            re2 += `<span class='ref' data-addrs='${JSON.stringify(a2.refAddresses)}'>${a2.w}</span>`
                        }
                    }
                    return re2
                }
            }
            return get_reference_data(re1)
        }
        let span_cbol_part = $('<span>').addClass('cbol')
        let cbol_part = get_cbol_dict_part_data(re_dict.record[0].dic_text)
        
        
        span_cbol_part.append($('<span>').html(cbol_part))



        // 同源字
        let span_same = $('<span>')
        if (N==1) {
            span_same.append('<span class="item-title">同源字：</span><span>舊約無資料。</span>')
        } else {
            span_same.append('<span class="item-title">同源字：</span>')

            let same = re_dict.record[0].same

            // 是否只有一個值
            if ( same.length < 2){
                span_same.append('<span>無</span>')
            } else {
                // 首先，same 裡面應該會有一個自己，其次，我們按出現次數排序
                // 呈現格式為 同源：G1234(142)意義；G1235(123)

                // 排序，按次數
                same.sort((a,b) => b.ccnt - a.ccnt)

                // filter .csn != sn 
                let same2 = same.filter(a1 => a1.csn != sn)
                
                // 產生許多 <span class='one-same'>...</span>
                for (let i1 = 0; i1 < same2.length; i1++) {
                    const onesame3 = same2[i1]
                    let sn3 = (N==0?'G':'H') + onesame3.csn  // 2 處用到

                    // 處理之前， cexp 可能會有 交互參照
                    function get_cexp_with_ref(cexp){
                        let re1 = splitReference(cexp)
                        if (re1 == null || re1.length == 1){
                            return cexp
                        } else {
                            let re2 = ""
                            for (const a2 of re1) {
                                if ( a2.refAddresses == undefined ){
                                    re2 += a2.w
                                } else {
                                    re2 += `<span class='ref' data-addrs='${JSON.stringify(a2.refAddresses)}'>${a2.w}</span>`
                                }
                            }
                            return re2
                        }
                    }
                    const cexp_ref = get_cexp_with_ref(onesame3.cexp)

                    let span_one_same = $('<span>').addClass('one-same')
                    .append($('<span>').text(sn3).addClass('sn').attr('sn',onesame3.csn).attr('N',N))
                    .append($('<span>').text(`(${onesame3.ccnt})`))
                    .append($('<span>').html(cexp_ref))
                    .appendTo(span_same)
                }
            }                         
        }
        
        // 分兩欄
        let div_content = $("<div>").addClass('column-parent')
        let div_right_column = $("<div>").addClass('right-column').addClass('column')
        let div_left_column = $("<div>").addClass('left-column').addClass('column')
        div_content.append(div_left_column).append(div_right_column)
        // 左欄(次數、同源)
        div_left_column.append(span_count).append("<hr/>").append(span_cbol_part)
        // 右欄_意義
        div_right_column.append(span_same)
        let html = div_content[0].outerHTML
        
        // 設定 dlg 位置，是在上面，還是下面
        // 如果目前 cursor 在上半部 50 % 就下顯示
        const isCursorTop = TPPageState.s.xy_hover.y < window.innerHeight / 2
        // const pos_ref = $("#mainWindow") # 不知道為何 mainWindow 會失效，曾經成功
        const pos_ref2 = $("#fhlTopMenu")
        const pos_ref3 = TPPageState.s.isVisibleLeftWindow ? $("#fhlLeftWindow") : $("#fhlMidWindow")
        const width_dlg = isCursorTop ? $("#fhlToolBar").width() : pos_ref2.width()
        const position_dlg = isCursorTop ? ({
            my: "left bottom", at: "left bottom", of: pos_ref3
        }) : ({
            my: "left top", at: "left top", of: pos_ref2
        })
        dlg.showDialog({
            html: html,
            getTitle: () => `即時SN`,
            position: position_dlg,
            maxHeight: window.innerHeight / 2 - 20,
            width: width_dlg,

            /**
             * 
             * @param {JQuery<HTMLElement>} dlg 
             */
            registerEventWhenShowed: dlg => {                            
                // 改 title，因為 getTitle 的方式只能純文字，不能有 html tag ... dlg parent 才會包到 title 
                dlg.parent().find('.ui-dialog-title').addClass('realtime-sn').html(
                    $('<span>')
                    .append(span_sn)
                    .append(span_fn_sn_search) // <span.fn-search-sn sn,isOld> 出現經文 </span>
                    .append(span_orig)
                    .append(span_mean)
                    .append(span_parsing)
                    [0].outerHTML
                )
                

                
                // 出現經文 搜尋 SN 出現經文
                dlg.parent().on('click', '.fn-search-sn', a1 => {
                    let sn = $(a1.target).attr('sn')
                    let tp = $(a1.target).attr('tp')
                    const hgSn = `${tp}${sn}` // H3303 G4314
                    
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
                    let addrs = JSON.parse($(a1.target).attr('data-addrs'))
                    queryReferenceAndShowAtDialogAsync({addrs:addrs, event: a1})
                })

                dlg.parent().off('click', '.sn').on({
                    "click": function () {
                        var r2 = $(this)
                        var jo = {
                            sn: r2.attr('sn'),
                            isOld: parseInt(r2.attr('n')),
                        }

                        // BUG:
                        queryDictionaryAndShowAtDialogAsync(jo)
                    }
                }, ".sn")
            }
        })
    }

    function when_data_ready([re_parsing, re_dict]){
        // console.log(one);
        /** @type {TPPageState} */
        let ps = TPPageState.s
        let sn = ps.snAct
        let N = ps.N
        let sec = ps.sec_hover
        // 檢查 re_parsing.one == re_dict.one
        let re_parsing_one = re_parsing.one
        let re_dict_one = re_dict.one
        if (sn != re_dict_one.sn || sec != re_parsing_one.sec){
            // console.log(" 不一樣 ", sn, re_dict_one.sn);
        } else {
            // 將 result 中的 sn 消一下 0，不然判斷會錯
            for (let i = 1; i < re_parsing.record.length; i++) {
                let element = re_parsing.record[i];
                re_parsing.record[i].sn = element.sn.replace(/^0*/, '') || "0" // "00000" 遇到，就會變成 "0"
            }
            // same 裡的 csn 也要消 0 ，因為接下來也會用到
            let same = re_dict.record[0].same
            for (let i1 = 0; i1 < same.length; i1++) {
                let element = same[i1];
                same[i1].csn = element.csn.replace(/^0*/, '') || "0" // "00000" 遇到，就會變成 "0"
            }

            show_dialog(re_parsing, re_dict)
            
        }
    }

    get_parsing_and_dict_async(one).then(when_data_ready)                
}

/**
 * 
 */
class Dialog_Sn_Info_Summary {
    static _s = null
    /** @type {Dialog_Sn_Info_Summary} */
    static get s() { 
        if (this._s == null) {
            this._s = new Dialog_Sn_Info_Summary()
        }
        return this._s
    }

    /** @type {boolean} `暫時` 的英文是 ... `temporary` ... click 會使其它為 true, 2 秒後變回 false, 在 mouseenter 會被 read 使用*/
    is_pause_realtime_temporary_sn = false
    constructor(){
        this.is_pause_realtime_temporary_sn = false
    }
    /**
     * @returns {TPPageState} 方便使用
     */
    get ps() { return TPPageState.s}
    /**
     * 於 FhlLecture 中的 init 中，定義事件中，會被呼叫 .sn click
     * @param {Event} e
     */
    when_click_on_sn(e){
        const ps = this.ps
        const currentTarget = e.currentTarget
        const $this = $(currentTarget)
        // currentTarget 是 span .sn-text 它的 parent 某一層，會有一個 .lec ， 要先判定它是不具有 .selected，如果沒有，則不處理
        if ( $this.parents('.lec').hasClass('selected') == false ){
            // 模擬，這個 .lec 被 click 一次
            $this.parents('.lec').trigger('click')
            return;
        }
        
        if ( ps.realTimePopUp ){
            const N = $this.attr('N');
            const k = $this.attr('sn');
            if (this.is_pause_realtime_temporary_sn && (ps.snAct != k || ps.snActN != N)) {
                // 在 pause 時 ， 又點擊某個，此時不該等 2 秒
                mouseenter_sn_set_snAct_and_Color_act(e)
                mouseenter_sn_dialog(e)
            }

            this.is_pause_realtime_temporary_sn = true 

            setTimeout(() => {
                this.is_pause_realtime_temporary_sn = false
            }, 2000);

        } else {
            // 非即時模式，直接顯示即可
            ps.snAct = ""
            ps.snActN = -1
            SN_Act_Color.s.act_remove()
            mouseenter_sn_set_snAct_and_Color_act(e)  
            mouseenter_sn_dialog(e)
            this.is_pause_realtime_temporary_sn = true 
            setTimeout(() => {
                this.is_pause_realtime_temporary_sn = false
            }, 2000);
        }
    }
    /**
     * @param {Event} e
     * 注意: 使用時, 下面2種方式, 看似一樣, 但 this 的值會不同. 第1種才符合直覺, this 才會是這個 class
     * mouseleave: e => Dialog_Sn_Info_Summary.s.when_mouseenter_on_sn(e),
     * mouseleave: Dialog_Sn_Info_Summary.s.when_mouseenter_on_sn,
    */
   when_mouseenter_on_sn(e){
        /** @type {TPPageState} */
        const ps = this.ps
        
        if ( this.is_pause_realtime_temporary_sn == false ){
            mouseenter_sn_set_snAct_and_Color_act(e)
        }

        if ( ps.realTimePopUp ){
            if (this.is_pause_realtime_temporary_sn) return
            
            mouseenter_sn_dialog(e)
        }
    }
    /**
     * @param {Event} e 
     * 注意: 使用時, 下面2種方式, 看似一樣, 但 this 的值會不同. 第1種才符合直覺, this 才會是這個 class
     * mouseleave: e => Dialog_Sn_Info_Summary.s.when_mouseleave_on_sn(e),
     * mouseleave: Dialog_Sn_Info_Summary.s.when_mouseleave_on_sn,
     */
    when_mouseleave_on_sn(e){
        const ps = this.ps
        if ( this.is_pause_realtime_temporary_sn == false ){
            ps.snAct = ""
            ps.snActN = -1

            SN_Act_Color.s.act_remove()
            
            // 開啟新的前，自動關閉已經開啟中的 ... 所有 .ui-dialog-title 中 text 是 Parsing 的 ... 取得 close 按鈕結束
            let rr1 = $('.ui-dialog-title').filter((i, e) => $(e).hasClass('realtime-sn'))
            let rr2 = rr1.siblings('.ui-dialog-titlebar-close')
            rr2.trigger('click')
        }    
    }
}

/**
 * 注腳資料顯示
 * @param {Event} e
 * 可使用 呂振中譯本 開發測試
 */
function when_click_on_ft(e){
    const ps = TPPageState.s
    const currentTarget = e.currentTarget
    const $this = $(currentTarget)
    //console.log(this); //範例: <span class=ft ft=42 ver=tcv chap=2>【42】</span>
    // http://bkbible.fhl.net/json/rt.php?engs=Gen&chap=2&version=tcv&gb=0&id=42

    var offset = $this.offset();
    offset.top += $this.height() + 10;
    ParsingPopUp.s.render(ps, ParsingPopUp.s.dom, offset, "ft");

    var ftid = $this.attr('ft');
    var engs = $this.attr('engs');
    var chap = $this.attr('chap');
    var ver = $this.attr('ver');

    var url = "rt.php?engs=" + engs + "&chap=" + chap + "&version=" + ver + "&id=" + ftid;
    if (ps.gb == 1)
        url += "&gb=1";
    fhl.json_api_text(url, function (a1, a2) {
        var json = JSON.parse(a1);
        if (json.status == "success" && json.record.length > 0) {
            var txt = json.record[0].text;
            $('#parsingPopUpInside').text(txt);
            $('#parsingPopUpInside').css("width", "100%");
            $('#parsingPopUpInside').css("max-width", "323px"); //cy:200px乘黃金比例1.618
            $('#parsingPopUpInside').css("white-space", "normal");
        }
        else {
            $('#parsingPopUpInside').text("錯誤:可回報下訊息- " + a1);
        }
    }, function (a1, a2) {
        $('#parsingPopUpInside').text("錯誤:於" + url + "時發生");
    }, null);
}

/**
 * 
 * @param {TpOneRecordBibleText} result 
 * @param {boolean} is_remove_engs_and_chineses 
 */
function add_book_property_to_bibletext_record(result, is_remove_engs_and_chineses = false) {
    // 找出所有用到的 engs. 類似 np.unique
    let fnEngs2 = a1 => a1.engs != null ? a1.engs : a1.chineses
    let fnEngs3 = a1 => a1 != null ? fnEngs2(a1) : null

    let allengs = result.record.map(fnEngs2)
    
    // 將 next 與 prev 的也加入
    allengs.push(fnEngs3(result.next), fnEngs3(result.prev))

    // 型成 engs: book 的對應表，順便就有 Set 效果
    let dict_chap_cnt = {}
    for (let i = 0; i < allengs.length; i++) {
        const engs = allengs[i];
        
        if ( engs != null && dict_chap_cnt[engs] == undefined) {            
            dict_chap_cnt[engs] = BibleConstantHelper.getBookId(engs.toLowerCase())
        }
    }

    // 開始處理每個 record
    for (const a1 of result.record) {
        // 有資料，原本就有 book 就略過
        if (a1.book == undefined) 
        {
            // a1 是一個 record
            // 取得 engs，然後從 dict_chap_cnt 中取得 book
            const keyEngs = fnEngs2(a1)
            let book = dict_chap_cnt[keyEngs]
            if (book == undefined) {
                // 若沒有找到，則預設為 0
                console.error(`找不到 book 對應的 engs: ${a1.engs || a1.chineses}`)
                book = 0
            }
    
            // 設定 book 屬性
            a1.book = book
        }

        if (is_remove_engs_and_chineses) {
            // 若要移除 engs 與 chineses
            delete a1.engs
            delete a1.chineses
        }
    }

    // 處理 next 與 prev
    if ( result.next != undefined ) {
        if (result.next.book == undefined) 
        {
            // next 也要加上 book 屬性
            const keyEngs = fnEngs3(result.next)
            result.next.book = dict_chap_cnt[keyEngs]
            if (result.next.book == undefined) {
                console.error(`找不到 next book 對應的 engs: ${result.next}`)
                result.next.book = 0
            }        
        }
        if (is_remove_engs_and_chineses) {
            delete result.next.engs
            delete result.next.chineses
        }
    }
    if ( result.prev != undefined ) {
        if (result.prev.book == undefined)
        {
            // prev 也要加上 book 屬性
            const keyEngs = fnEngs3(result.prev)
            result.prev.book = dict_chap_cnt[keyEngs]
            if (result.prev.book == undefined) {
                console.error(`找不到 prev book 對應的 engs: ${result.prev}`)
                result.prev.book = 0
            }
        }
        if (is_remove_engs_and_chineses) {
            delete result.prev.engs
            delete result.prev.chineses
        }
    }
}