/// <reference path='../libs/jsdoc/jquery.js' />
/// <reference path='../libs/jsdoc/linq.d.ts' />
/// <reference path='../libs/ijnjs/ijnjs.d.js' />
/// <reference path='./SN_Act_Color.js' />
/// <reference path='./DataOfDictOfFhl.d.ts' />
/// <reference path='./fhlParsing.d.ts' />
/// <reference path='./DPageState.d.js' />

import { matchGlobalWithCapture } from './matchGlobalWithCapture.es2023.js'
import { splitStringByRegex } from './splitStringByRegex.es2023.js'
import { BibleConstant } from './BibleConstant.es2023.js'
import { BibleConstantHelper } from './BibleConstantHelper.es2023.js'
import { DialogHtml } from './DialogHtml.es2023.js'
import { isRDLocation } from './isRDLocation.es2023.js'
import { qsbAsync } from './qsbAsync.es2023.js'
import { cvtDTextsToHtml } from './cvtDTextsToHtml.es2023.js'
import { cvtAddrsToRef } from './cvtAddrsToRef.es2023.js'
import { splitReference } from './splitReference.es2023.js'
import { splitBtw } from './splitBtw.es2023.js'
import { splitBrOne } from './splitBrOne.es2023.js'
import { twcbflow } from './twcbflow.es2023.js'
import { cbolflow } from './cbolflow.es2023.js'
import { ISnDictionary } from './ISnDictionary.es2023.js'
import { SnDictOfTwcb } from './SnDictOfTwcb.es2023.js'
import { SnDictOfCbol } from './SnDictOfCbol.es2023.js'
import { queryReferenceAndShowAtDialogAsync } from './queryReferenceAndShowAtDialogAsync.es2023.js'
import { queryDictionaryAndShowAtDialogAsync } from './queryDictionaryAndShowAtDialogAsync.es2023.js'
// import { FhlLecture } from './FhlLecture.es2023.js'

import { load_json_gz_Async } from './load_json_gz_Async.es2023.js'

(function (root) {
    // // 相容其它 .js 還沒有重構成 import export 格式
    window.BibleConstantEs6Js = () => BibleConstant
    window.BibleConstantHelperEs6Js = () => BibleConstantHelper
    window.splitStringByRegexEs6Js = () => splitStringByRegex
    window.matchGlobalWithCaptureEs6Js = () => matchGlobalWithCapture
    window.DialogHtmlEs6Js = () => DialogHtml
    window.isRDLocationEs6Js = () => isRDLocation
    window.qsbAsyncEs6Js = () => qsbAsync
    window.cvtDTextsToHtmlEs6Js = () => cvtDTextsToHtml
    window.cvtAddrsToRefEs6Js = () => cvtAddrsToRef
    window.splitReferenceEs6Js = () => splitReference
    window.splitBtwEs6Js = () => splitBtw
    window.splitBrOneEs6Js = () => splitBrOne
    window.cbolflowEs6Js = () => cbolflow
    window.twcbflowEs6Js = () => twcbflow
    window.ISnDictionaryEs6Js = () => ISnDictionary
    window.SnDictOfTwcbEs6Js = () => SnDictOfTwcb
    window.SnDictOfCbolEs6Js = () => SnDictOfCbol
    window.queryReferenceAndShowAtDialogAsyncEs6Js = () => queryReferenceAndShowAtDialogAsync
    window.queryDictionaryAndShowAtDialogAsyncEs6Js = () => queryDictionaryAndShowAtDialogAsync
    window.queryDictionaryAndShowAtDialogAsync = queryDictionaryAndShowAtDialogAsync
    // window.FhlLectureEs6Js = () => FhlLecture

    // 串珠也會用到，但串珠沒有這幾個函式定義
    // window.BibleConstantEs6Js = BibleConstantEs6Js 
    // window.BibleConstantHelperEs6Js = BibleConstantHelperEs6Js
    // window.splitReferenceEs6Js = splitReferenceEs6Js 
    // window.cvtAddrsToRefEs6Js = cvtAddrsToRefEs6Js 
    // window.queryReferenceAndShowAtDialogAsyncEs6Js = queryReferenceAndShowAtDialogAsyncEs6Js

    load_json_gz_Async()

    const FhlLecture = FhlLectureEs6Js()
    
    root.fhlLecture = new FhlLecture()

    if (AppVersion.s.testIsLastVersion() == true || false) {
        testThenDoAsync(() => window.Ijnjs != undefined)
            .then(() => {
                var files = [
                    'initPageStateFlow', 'LeftWindowTool',
                    { dir: 'DialogTemplate', children: ['DialogTemplate', 'OrigDict', 'ParsingReference', 'ParsingOrigDict', 'SnDictDialog.html'] },
                    'checkHtmlVersion',
                    {
                        dir: '../static/js',
                        children: [
                            'manifest.3ad1d5771e9b13dbdad2.js',
                            'vendor.3504402f0d075d75a38c.js',
                            'app.e1b2e980bfe0ec8352ae.js',
                        ]
                    },
                    'indexLast',

                    'getAjaxUrl',
                    'getBookFunc',
                    'requestFullscreen',
                    'registerEvents',

                    'fhlToolBar',
                    'help',
                    'helpingPopUp',
                    'windowControl',
                    'bookSelect',
                    'bookSelectPopUp',
                    'bookSelectName',
                    'bookSelectChapter',

                    'fhlLeftWindow',
                    'settings',
                    'snSelect',
                    'gbSelect',
                    'show_mode',
                    'realTimePopUpSelect',
                    'mapTool',
                    'imageTool',
                    'renderTsk',
                    'SnBranchRender',
                    'fontSizeTool',
                    
                    'versionSelect',
                    'docEvent',
                    'viewHistory',
                    'fhlMidWindow',
                    //'fhlLecture', //es6 模式成功，讓這個被拿掉
                    'fhlMidBottomWindow',
                    'SN_Act_Color',
                    'parsing_render_top',
                    'parsing_render_bottom_table',
                    'fhlInfoContent',
                    'parsingPopUp',
                    'searchTool',
                    'coreInfoWindowShowHide',
                    'FontSizeToolBase',
                    'charHG',
                    'doSearch',
                    'do_preach',
                    'gbText',
                    'updateLocalStorage',
                    'triggerGoEventWhenPageStateAddressChange',
                    'windowAdjust',

                    'fhl.css'
                ]


                Ijnjs.getCacheAsync(files, false, 'index').then(caches => {
                    Ijnjs.cachesIndex = caches
                    testThenDoAsync({
                        cbTest: caches.getList().length == 0,
                        msg: 'auto clear ijnjs.cachesInex',
                        ms: 1000,
                    }).then(a1 => {
                        delete Ijnjs.cachesIndex
                    })
                    
                    doNoReadyStep1()
                    doNoReadyStep2() //廢棄                    
                    doNoReadyStep3()

                    // doNoReadyStep1 會載入這個全域變數
                    init_fontsize_css_variable_from_pagestate(window.pageState)

                    doReadyStep1()
                    doReadyStep2()

                    // Ijnjs.loadJsOrCssSync('./static/js/manifest.3ad1d5771e9b13dbdad2.js')
                    // Ijnjs.loadJsOrCssSync('./static/js/vendor.3504402f0d075d75a38c.js')
                    // Ijnjs.loadJsOrCssSync('./static/js/app.e1b2e980bfe0ec8352ae.js')
                    Enumerable.from([
                        'manifest.3ad1d5771e9b13dbdad2.js',
                        'vendor.3504402f0d075d75a38c.js',
                        'app.e1b2e980bfe0ec8352ae.js'
                    ]).select(a1 => '../static/js/' + a1)
                        .forEach(a1 => eval(caches.getStr(a1)))

                    eval(caches.getStr('indexLast'))

                    $("<style>", {
                        text: caches.getStr("fhl.css")
                    }).appendTo($("head"))

                    setTimeout(() => {
                        $('#app').show()
                        $('#waiting').hide()
                    }, 300);
                })


                // doNoReadyStep1()
                // doNoReadyStep2()
                // doNoReadyStep3()

                //Ijnjs.loadJsSync('index/index.js')
                //// $('<div id=app><app></app></div>').appendTo('body')
                // Ijnjs.loadJsOrCssSync('./static/js/manifest.3ad1d5771e9b13dbdad2.js')
                // Ijnjs.loadJsOrCssSync('./static/js/vendor.3504402f0d075d75a38c.js')
                // Ijnjs.loadJsOrCssSync('./static/js/app.e1b2e980bfe0ec8352ae.js')
                // Ijnjs.loadJsSync('index/indexLast.js')
                // Ijnjs.loadJsOrCssSync('index/fhl.css')

            })
    } else {
        $('#app').load('frmUpdated.html #app .container')
        AppVersion.s.setUpdateDialogVersion();
        AppVersion.s.addClickListVerionsInfosEvent();
        $('#waiting').hide()
    }


    $(()=>{
        setTimeout(() => {
            $(window).off("hashchange").on("hashchange", ev =>{
                console.log(ev);
                console.log(window.location.hash); // #/bible/Ge/3/5 (舊版) #/bible/創1:1-41 (新版)
                
            })
            
        }, 100);
    })
    // Ijnjs.loadJsSync('ijnjs-fhl/ijnjs-fhl.js')

    // doNoReadyStep1()

    // doNoReadyStep2()

    // doNoReadyStep3()

    // doReadyStep1()

    // doReadyStep2()
    return

})(this ?? window)

function init_fontsize_css_variable_from_pagestate(ps){
    document.body.style.setProperty("--fontsize", ps.fontSize + "pt")
    document.body.style.setProperty("--fontsize-greek", ps.fontSizeGreek + "pt")
    document.body.style.setProperty("--fontsize-hebrew", ps.fontSizeHebrew + "pt")
    document.body.style.setProperty("--fontsize-sn", ps.fontSizeStrongNumber + "pt")
}
function doNoReadyStep1() {
    /** @type {Ijnjs.FileCache} */
    var caches = Ijnjs.cachesIndex
    // export window.initPageStateFlow
    eval(caches.getStr('initPageStateFlow'))

    // export window.LeftWindowTool
    function fn1() { eval(caches.getStr('LeftWindowTool')) }
    fn1.call(window)

    // export DialogTemplate and findPrsingTableSnClassAndLetItCanClick
    function fn2() { eval(caches.getStr('DialogTemplate/DialogTemplate')) }
    fn2.call(window)

    // export checkHtmlVersion function
    function fn3() { eval(caches.getStr('checkHtmlVersion')) }
    fn3.call(window)

    initPageStateFlow(currentSWVer)

    return
    // <script src="./index/initPageStateFlow.js"></script>
    // <script src="./index/LeftWindowTool.js"></script>
    // <script src="./index/DialogTemplate/DialogTemplate.js"></script> 
    // <script src="./index/checkHtmlVersion.js"></script>

    // var srd = './index/'
    // Enumerable.from(['initPageStateFlow.js', 'LeftWindowTool.js', 'DialogTemplate/DialogTemplate.js', 'checkHtmlVersion.js'])
    //     .select(a1 => srd + a1).forEach(Ijnjs.loadJsSync)

    // initPageStateFlow(currentSWVer)
}

function doNoReadyStep2() {
    // 廢棄，用 jqueryui 重新實作
    // // <script src="index/exportVersionDialogAsync.js"></script>
    // var srd = './index/'
    // Enumerable.from(['exportVersionDialogAsync.js'])
    //     .select(a1 => srd + a1).forEach(Ijnjs.loadJsSync)

    // exportVersionDialogAsync().then(re => {
    //     window.dialogVersion = re.dialogVersion
    // })
}

function doNoReadyStep3() {
    var _ = Ijnjs.Libs.s.libs._

    // console.log(location); // file://
    var isRDLocation = location.origin === 'file://';
    var urlJSON = '/json/';
    if (isRDLocation) {
        urlJSON = 'https://bible.fhl.net/json/';
    }
    // 本機， url 用絕對路徑，上線，用相對路徑
    // 本機， 新譯本不可下載，不然會出錯。

    // 2017.07 下面整理與NUI2一致.

    var chineseNumber = FHL.CONSTANT.Bible.CHINESE_NUMBERS;
    var book = FHL.CONSTANT.Bible.CHINESE_BOOK_ABBREVIATIONS;
    var bookGB = FHL.CONSTANT.Bible.CHINESE_BOOK_ABBREVIATIONS_GB;
    var bookFullName = FHL.CONSTANT.Bible.CHINESE_BOOK_NAMES;
    var bookFullName2 = FHL.CONSTANT.Bible.CHINESE_BOOK_NAMES_GB;
    var bookChapters = FHL.CONSTANT.Bible.BOOK_CHAPTERS;
    var bookEng = FHL.CONSTANT.Bible.ENGLISH_BOOK_ABBREVIATIONS;
    var bookEngShort = FHL.CONSTANT.Bible.ENGLISH_BOOK_SHORT_ABBREVIATIONS
    // var tp1 = FHL.BibleConstant.s
    // var chineseNumber = tp1.CHINESE_NUMBERS;
    // var book = tp1.CHINESE_BOOK_ABBREVIATIONS;
    // var bookGB = tp1.CHINESE_BOOK_ABBREVIATIONS_GB;
    // var bookFullName = tp1.CHINESE_BOOK_NAMES;
    // var bookFullName2 = tp1.CHINESE_BOOK_NAMES_GB;
    // var bookChapters = tp1.BOOK_CHAPTERS;
    // var bookEng = tp1.ENGLISH_BOOK_ABBREVIATIONS;
    // var bookEngShort = tp1.ENGLISH_BOOK_SHORT_ABBREVIATIONS

    var leftWindowTool = new LeftWindowTool()

    // modify by snow. 2021.07
    // 需要加防抖程式，可看 1.5.11 版的說明
    // 防抖 debounce https://zhuanlan.zhihu.com/p/268012169
    // 用 lodash lib 作到 https://mropengate.blogspot.com/2017/12/dom-debounce-throttle.html
    $(window).resize(_.debounce(function (e) {
        if (e.target == window) {
            testThenDoAsync(() => window.windowAdjust != undefined)
                .then(a1 => {
                    windowAdjust();
                })

            // add by snow. 2021.07, device 旋轉也算
            coreInfoWindowShowHide(function () {
                fhlLecture.reshape(pageState); //ps的全域即是 pageState, 只是這裡沒有傳過來, 只好偷存取全域的 snow-add
            }, pageState.isVisibleLeftWindow, pageState.isVisibleInfoWindow)

        }
    }, 200))

    window.isRDLocation = isRDLocation
    window.urlJSON = urlJSON
    window.chineseNumber = chineseNumber
    window.book = book
    window.bookGB = bookGB
    window.bookFullName = bookFullName
    window.bookFullName2 = bookFullName2
    window.bookChapters = bookChapters
    window.bookEng = bookEng
    window.bookEngShort = bookEngShort

    window.leftWindowTool = leftWindowTool
}

function doReadyStep1() {
    calcScrollWidthAndSetToCssBodyVariable()

    return
    /**
     * 用在 #lecMain fhl.css 樣式中的 padding-right
     */
    function calcScrollWidthAndSetToCssBodyVariable() {
        $(()=>{
            $(document.body).css('overflow', 'scroll')
            // console.log(window.innerWidth)
            // console.log(document.body.clientWidth)
            document.body.style.setProperty(
                "--scrollbar-width",
                `${window.innerWidth - document.body.clientWidth}px`)
            $(document.body).css('overflow', '')
            // console.log(document.body.style.getPropertyValue("--scrollbar-width"));
        })
    }
}

function doReadyStep2() {

    $(function () {
        // $('#problemsReport').attr("href", "mailto:sean@fhl.net,tjm@fhl.net,snowray712000@gmail.com?subject=[問題回報] 信望愛聖經工具NUI");
        $('#problemsReport').attr("href", "mailto:tjm@fhl.net,snowray712000@gmail.com?subject=[問題回報] 信望愛聖經工具NUI");

        fhlToolBar.init(pageState);
        fhlLeftWindow.init(pageState);
        fhlMidWindow.init(pageState);
        fhlInfo.init(pageState);
        registerEvents(pageState);

        $('#title')[0].firstChild.nodeValue = pageState.gb === 1 ? "信望爱圣经工具 " : "信望愛聖經工具 ";
        // console.log($('#title')[0].childNodes[1]);
        $('#title')[0].childNodes[1].textContent = "v" + pageState.swVer;
        checkHtmlVersion() // checkHtmlVersion.js

        // add by snow. 2021.07
        // 開啟時，保持上次設定 (左、右功能視窗，隱藏 or 顯示)
        coreInfoWindowShowHide(function () {
            setTimeout(function () {
                fhlLecture.reshape(pageState); // 加這行會有 Bug, 因此要在 setTimeout 中 (其它地方呼叫不需要如此)         
            }, 0)
        }, pageState.isVisibleLeftWindow == 1, pageState.isVisibleInfoWindow == 1)

    });
}

// var deps = [
//   'aaaa',
//   'static/fhlmap_api/fhlmap.js',
//   'static/fhlmap_api/fhlmap_main.js',
//   'static/Scripts/FHL/FHL.js',
//   'static/Scripts/FHL/CONSTANT/bible-constants.js',
//   'static/Scripts/FHL/STR/eachFitDo.js',
//   'static/Scripts/FHL/NET/UrlParameter.js',
//   'static/Scripts/FHL/FhlUrlParameter.js',
//   'static/images/FHLLOGO.ico',
//   'index/fhl.css',
//   'static/libs/icons/css/font-awesome.css',
//   'static/libs/jquery.hotkeys.js',
//   'static/commonR/processbar.js',
//   'static/commonR/audio.js',
//   'static/ob_api/ob_api.css',
//   'static/ob_api/ob_table.css',
//   'static/ob_api/obphp.js',
//   'static/search_api/sephp.react.txt.txtSn.js',
//   'static/search_api/abvphp_api.js',
//   'static/search_api/fhl_api.js',
//   'static/search_api/search.css',
//   'static/search_api/qsbphp.create_color_span_from_bible_text.js',
//   'static/search_api/sephp.se_record_2_qsb_str.js',
//   'static/search_api/qsbphp.search_reference.js',
//   'static/search_api/sephp.pre_search_sn.js',
//   'static/search_api/sephp.pre_search_keyword.js',
//   'static/search_api/sephp.create_dialog_presearch.js',
//   'static/search_api/sephp.create_dialog_search_result.js',
//   'static/search_api/sephp.search.js',
//   'static/qsb_api/qsb.qsbapi.js',
//   'static/tsk_api/tsk.tskapi.js',
//   'static/tsk_api/tsk.R.frame.oneref.js',
//   'static/preach_api/preach_api.js',
//   'static/bible_audio_api/audiobible_api.js',
//   'static/copyright_api/copyright_api.js',
//   './FHL.linq.js',
//   './FHL.tools.js',
//   './FHL.BibleConstant.js',
// ].forEach(Ijnjs.loadJsOrCssSync)


function FhlLectureEs6Js(){
    // const isRDLocation = isRDLocationEs6Js()
    // const qsbAsync = qsbAsyncEs6Js()

    // const queryDictionaryAndShowAtDialogAsync = queryDictionaryAndShowAtDialogAsyncEs6Js()
    // const queryReferenceAndShowAtDialogAsync = queryReferenceAndShowAtDialogAsyncEs6Js()
    // const splitReference = splitReferenceEs6Js()
    // const BibleConstant = BibleConstantEs6Js()
    

    // 讓別處也能用 dict
    // if (window.queryDictionaryAndShowAtDialogAsync == undefined ){
        // window.queryDictionaryAndShowAtDialogAsync = queryDictionaryAndShowAtDialogAsync
    // }
    /**
     * sn mouseenter realtime 要用的
     */
    
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
     * 
     * @param {string} sn 
     * @param {0|1} N 
     * @returns {number} -1 表示沒有，這不正常。你可以顯示 ?。-2 表示還沒有 sd_cnt 
     */
    function get_sn_count_in_bible(sn, N){
        if (window.sd_cnt == undefined) return -2
        
        let hg = N == 0 ? "greek" : "hebrew"
        let cnt = window.sd_cnt[hg][sn]
        if ( cnt != undefined ){
            return cnt
        }
        return -1
    }
    function get_sn_count_in_book(sn, book){
        if (window.sn_cnt_book_unv == undefined) return -2
        
        let hg = book >= 40 ? "G" : "H"
        let cnt = window.sn_cnt_book_unv[hg][sn][book]
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
        if (window.sn_cnt_chap_unv == undefined) return -2
        
        let hg = book >= 40 ? "G" : "H"
        
        let dict_chap_cnt = window.sn_cnt_chap_unv[hg][sn][book]        
        if ( dict_chap_cnt != undefined ){
            // return clone result, not the original, to prevent change the original
            return JSON.parse(JSON.stringify(dict_chap_cnt))
        }
        return -1
    }
    

    /** @type {JQuery<HTMLElement>} */
    let $lecture

    return FhlLecture

    function FhlLecture(){
        /**
         * @param {TPPageState} ps 
         * @param {HTMLElement} dom 
         */
        this.init = function (ps, dom) {
            this.dom = dom;
            this.render(ps, dom);
            $lecture = $(this.dom);
            var $lecMain = $('#lecMain');
            var that = this
            // chapnext prev 變成1次事件就夠了
            $('.chapBack').click(function (e) {
                var idx = getBookFunc("index", ps.chineses); // 0-based
                if (ps.chap == 1) {
                    idx--;
                    ps.chineses = book[idx];
                    ps.engs = bookEng[idx];
                    ps.chap = bookChapters[idx];
                } else {
                    if (ps.chap == 0) {
                        ps.chap = ps.commentBackgroundChap;
                        ps.sec = ps.commentBackgroundSec;
                    }
                    ps.chap--;
                }
                ps.bookIndex = idx + 1; // 此idx回傳是 0-based
                ps.sec = 1;
                triggerGoEventWhenPageStateAddressChange(ps);
                viewHistory.render(ps, viewHistory.dom);
                fhlLecture.render(ps, fhlLecture.dom);
                fhlInfo.render(ps);
                bookSelect.render(ps, bookSelect.dom);
                e.stopPropagation();
    
                $(that).trigger('chapchanged');
            });
            $('.chapNext').click(function (e) {     
                var idx = getBookFunc("index", ps.chineses);
                // 設定 ps 資訊(供後面用)
                if (ps.chap == bookChapters[idx]) {//if last chapter
                    idx++;
                    ps.chineses = book[idx];//book+1
                    ps.engs = bookEng[idx];
                    ps.chap = 1;
                } else {
                    if (ps.chap == 0) {
                        ps.chap = ps.commentBackgroundChap;
                        ps.sec = ps.commentBackgroundSec;
                    }
                    ps.chap++;
                }
                ps.bookIndex = idx + 1; // 此idx回傳是 0-based

                ps.sec = 1;
                triggerGoEventWhenPageStateAddressChange(ps); // 這個事件，有人在用唷，就是 viewHistory 會用
                viewHistory.render(ps, viewHistory.dom); // 這應該是舊的 viewHistory, 被 mark 起來也不會有變化
                fhlLecture.render(ps, fhlLecture.dom); // 內部經文變化
                fhlInfo.render(ps); // 右手邊的 info 也要跟著更新
                bookSelect.render(ps, bookSelect.dom); // 影響「約翰福音：第一章」那裡的顯示
                e.stopPropagation();
    
                $(that).trigger('chapchanged');
            });
            $('#lecMain').scroll(function () {
                $(this).addClass('scrolling');
                clearTimeout($.data(this, "scrollCheck"));
                $.data(this, "scrollCheck", setTimeout(function () {
                    $('#lecMain').removeClass('scrolling');
                }, 350));
            });
            // title 中的 version name lecMainTitle 是固定的, 加在 這個事件一次即可
            $('#lecMainTitle').on({
                click: function (e) {
                    // 與 ios 版，統一操作模式
                    $('#versionSelect3').trigger('click')
                    
                    // mark by snow. 2021.12 全部用 dialog 設定
                    //// replace by snow. 2021.07 dialog 方式
                    //// 若只剩1個，不能再砍掉                
                    // if (ps.version.length > 1) {
                    //     var this$ = $(this) // version tag
                    //     var p1 = this$.parent()
                    //     var idx = p1.index() // 第幾個元素 of parent 
    
                    //     var verRemove = ps.version[idx]
                    //     if (ps.versionOffens != undefined) {
                    //         ps.versionOffens.unshift(verRemove)
                    //     } else {
                    //         ps.versionOffens = [verRemove]
                    //     }
                    //     ps.version.splice(idx, 1)
                    //     pageState.version = ps.version
                    //     pageState.versionOffens = ps.versionOffens
    
                    //     updateLocalStorage()
    
                    //     triggerGoEventWhenPageStateAddressChange(ps);
                    //     fhlLecture.render(ps, fhlLecture.dom);
                    //     e.stopPropagation();
                    // }
                }
            }, '.versionName');
            // 內容中的 lecMain 是固定的, 加在這個事件一次即可
            $lecMain.on({
                click: function (e) {
                    if ($(this).hasClass('copyright')) //版本宣告,應該不能click snow add 2016.01.22(五)
                        return;
                    var mode = $lecMain.attr('mode'); //0: 原本, 1:好選擇
    
                    var oldsec = ps.sec
                    var oldchap = ps.chap
    
                    ps.sec = parseInt($(this).attr('sec'));
                    ps.chap = parseInt($(this).attr('chap'));
    
                    if (mode == 0) {
                        $(that).find('.lec').removeClass('selected');
                        $(this).addClass('selected');
                    }
                    else if (mode == 1 || mode == 2) {
                        var vers = $lecMain.find(".vercol");
                        vers.children().removeClass('selected');//這個要將前一次的selected去掉.不然會累積一堆
                        var verses = vers.find('[sec=' + ps.sec + ']');
                        verses.addClass('selected');
                    }
    
                    triggerGoEventWhenPageStateAddressChange(ps);
                    fhlInfo.render(ps);
    
                    // 因為搜尋還沒有加事件, 這個是暫時用的 2017.09
                    var idx = getBookFunc("index", ps.chineses);
                    ps.bookIndex = idx + 1; // 此idx回傳是 0-based
    
                    // 2017.08
                    if (oldsec != ps.sec || oldchap != ps.chap)
                        $(that).trigger('secchanged')
                },
                mouseenter: function (e) {
                    // 取得這個 dom ， 它會有 attr sec ( 在 .sn mouseenter 要用到 )
                    let sec = $(this).attr('sec');
                    ps.sec_hover = sec
                    let chap = $(this).attr('chap');
                    ps.chap_hover = chap
                    let book = $(this).attr('book');
                    ps.book_hover = book
                    
                }
            }, '.lec');

            /**
             * 
             * @param {HTMLElement} dom mouseenter 中的 this
             * @param {*} e 
             */
            function mouseenter_sn_set_snAct_and_Color_act(dom, e){
                let N = $(dom).attr('N') // 1: 舊約 0: 新約
                let sn = $(dom).attr('sn')                    
                ps.snAct = sn
                ps.snActN = N
                
                // Activate sn，標記為紅色
                SN_Act_Color.act_add(sn, N)
            }
            /**
             * 
             * @param {HTMLElement} dom 這個是在事件中的 this
             * @param {*} e 
             */
            function mouseenter_sn_dialog(dom,e){
                let N = $(dom).attr('N') // 1: 舊約 0: 新約
                let sn = $(dom).attr('sn')                    
                ps.snAct = sn
                ps.snActN = N
                
                // Activate sn，標記為紅色
                // SN_Act_Color.act_add(sn, N)

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
                    const isCursorTop = window.pageState.xy_hover.y < window.innerHeight / 2
                    // const pos_ref = $("#mainWindow") # 不知道為何 mainWindow 會失效，曾經成功
                    const pos_ref2 = $("#fhlTopMenu")
                    const pos_ref3 = pageState.isVisibleLeftWindow ? $("#fhlLeftWindow") : $("#fhlMidWindow")
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
                                queryReferenceAndShowAtDialogAsync({addrs:addrs})
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
                    let ps = window.pageState
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

            // `暫時` 的英文是 ... `temporary` ... click 會使其它為 true, 2 秒後變回 false, 在 mouseenter 會被 read 使用
            let is_pause_realtime_temporary_sn = false
            // sn 的部分        
            $lecMain.on({
                click: function (e) {
                    const N = $(this).attr('N');
                    const k = $(this).attr('sn');

                    /** @type {TPPageState} */
                    let ps = window.pageState
                    if ( ps.realTimePopUp ){
                        if (is_pause_realtime_temporary_sn && (ps.snAct != k || ps.snActN != N)) {
                            // 在 pause 時 ， 又點擊某個，此時不該等 2 秒
                            mouseenter_sn_set_snAct_and_Color_act(this, e)
                            mouseenter_sn_dialog(this,e)
                        }

                        is_pause_realtime_temporary_sn = true 
    
                        setTimeout(() => {
                            is_pause_realtime_temporary_sn = false
                        }, 2000);

                    } else {
                        // 非即時模式，直接顯示即可
                        ps.snAct = ""
                        ps.snActN = -1
                        SN_Act_Color.act_remove()
                        mouseenter_sn_set_snAct_and_Color_act(this, e)  
                        mouseenter_sn_dialog(this,e)
                        is_pause_realtime_temporary_sn = true 
                        setTimeout(() => {
                            is_pause_realtime_temporary_sn = false
                        }, 2000);
                    }

                    e.stopPropagation()
                },
                mouseenter: function (e) {

                    /** @type {TPPageState} */
                    let ps = window.pageState

                    if ( is_pause_realtime_temporary_sn == false ){
                        mouseenter_sn_set_snAct_and_Color_act(this, e)
                    }

                    if ( ps.realTimePopUp ){
                        if (is_pause_realtime_temporary_sn) return
    
                        mouseenter_sn_dialog(this,e)
                    }
                },
                mouseleave: function () {
                    if ( is_pause_realtime_temporary_sn == false ){
                        ps.snAct = ""
                        ps.snActN = -1

                        SN_Act_Color.act_remove()
                        
                        // 開啟新的前，自動關閉已經開啟中的 ... 所有 .ui-dialog-title 中 text 是 Parsing 的 ... 取得 close 按鈕結束
                        let rr1 = $('.ui-dialog-title').filter((i, e) => $(e).hasClass('realtime-sn'))
                        let rr2 = rr1.siblings('.ui-dialog-titlebar-close')
                        rr2.trigger('click')
                    }
                }
            }, '.sn, .sn-text');


            // 向後巡覽 / 向前巡覽
            var $vhb = $('#viewHistoryButton');
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
    
            // .ft 注腳 click
            $lecMain.on({
                click: function (e) {
                    //console.log(this); //範例: <span class=ft ft=42 ver=tcv chap=2>【42】</span>
                    // http://bkbible.fhl.net/json/rt.php?engs=Gen&chap=2&version=tcv&gb=0&id=42
    
                    var offset = $(this).offset();
                    offset.top += $(this).height() + 10;
                    parsingPopUp.render(ps, parsingPopUp.dom, offset, "ft");
    
                    var ftid = $(this).attr('ft');
                    var engs = $(this).attr('engs');
                    var chap = $(this).attr('chap');
                    var ver = $(this).attr('ver');
    
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
        };// fn.init
    
        this.when_bclick_or_nclick = function (fnb, fnn) {
            /// <summary> fhlLecture 提供的 event </summary>
            /// <param type="fn(e)" name="fnb" parameterArray="false">older history view</param>
            /// <param type="fn(e)" name="fnn" parameterArray="false">newer history view</param>
            $lecture.on({
                bclick: fnb,
                nclick: fnn
            });
        };
    
        this.selectLecture = function (book, chap, sec) {
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
        };
        this.reshape = function (ps) {
            /// <summary> 目前主要是 mode=1 時, align 要重新排過, 會用到的有 fontSize, resize,(在windowAdjust裡呼叫) 裡面會有 show_mode 判斷式, 只要直接呼叫即可 </summary>
            if (ps.show_mode == 1) {
                /// @verbatim 對齊必須在 dom.html(html) 之後才作, 因為那時候才會有實體, 否則取出來的 height() 會是 0@endverbatim
                var $lecMain = $('#lecMain');
                var cols = $lecMain.children();
                var qcols = Enumerable.from(cols);
                var qvers = qcols.select(function (a1) { return $(a1).children(); });
                if (qvers.count() != 0) {
                    // console.log(qvers.ToArray());
                    var maxRecordCnt = qvers.max(a1 => a1.length)
                    //console.log(maxRecordCnt);
    
                    for (var i = 0; i < maxRecordCnt; i++) {
                        var qvers2 =
                            qvers.select(function (a1) { if (a1[i] == null) return null; return a1[i] });
                        qvers2.forEach(function (a1) { if (a1 != null) $(a1).height('100%'); }); //要先變為auto, 才能正確算 最大的 cy
                        var maxcy = qvers2.max(function (a1) { return a1 == null ? 0 : $(a1).height() });
                        qvers2.forEach(function (a1) { if (a1 != null) $(a1).height(maxcy); });
                    }
                }
            }
        };
    
        this.registerEvents = function (ps) {
            var that = this.dom;
    
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
        };
        /**
         * 
         * @param {TPPageState} ps 
         * @param {HTMLElement} dom 
         * @returns 
         */
        this.render = function (ps, dom) {            
            //console.log('start of fhlLecture render');
            function reverse(s) {
                var o = '';
                for (var i = s.length - 1; i >= 0; i--)
                    o += s[i];
                return o;
            }
            /** @type {JQuery<HTMLElement>} */
            var $lec = $(this.dom);
            var that = this;
            var htmlTitle = "";
            var htmlContent = "";

            // 2025.02 add sn 本章次數統計
            ps.sn_stastic = {}
    
            if (isRDLocation()) {
                // location 不可以用新譯本
                console.warn('離線開發,不可用新譯本,上線才能用,略過');
                ps.version = ps.version.filter(function (a1) { return a1 !== 'ncv'; });
            }
    
            // console.log(ps.version)
            var col = ps.version.length;
            var rspArr = new Array();
            var idx = 0;

            // 第3個參數，是多個譯本，多執行緒，其中一個執行緒完成時呼叫
            // 第4個參數，是所有譯本都完成時呼叫，它會用 while loop 等待次執行緒，所以回到主執緒。
            getBibleText(col, ps, function (o) {
                // o 就是 qb.php 的回傳 json                
                rspArr.push(o);
                // console.log("cbk " , o)
            }, function () {
                // console.log (" defCbk () callback ")
                var isOld = checkOldNew(ps);
                // 恢復本 2018.03 snow add
                for (j = 0; j < rspArr.length; j++) {
                    if (rspArr[j].version == 'recover') {
                        if (rspArr[j].record[0].sec == 0) {
                            var sec1 = rspArr[j].record[1];
                            var sec0 = rspArr[j].record[0];
                            sec1.bible_text = "(" + sec0.bible_text + ")" + sec1.bible_text;
    
                            rspArr[j].record.shift();
                            --rspArr[j].record_count;
                        }
                        break;
                    }
                }
    
                rspArr = sortBibleVersion(rspArr, ps);
    
                // nextchap prevchap
                var bookName = getBookFunc("bookFullName", ps.chineses);
                if (bookName != "failed") {
                    if (ps.chineses == book[0] && ps.chap == 1) {
                        $lec.find('.chapBack').first().css('display', 'none');
                    } else {
                        $lec.find('.chapBack').first().css('display', 'block');
                    }
                    if (ps.chineses == book[65] && ps.chap == 22) {
                        $lec.find('.chapNext').first().css('display', 'none');
                    } else {
                        $lec.find('.chapNext').first().css('display', 'block');
                    }
                }
    
                // get maxRecordCnt maxRecordIdx 
                var maxRecordCnt = 0;
                var maxRecordIdx = 0;
                for (var i = 0; i < rspArr.length; i++) {
                    if (rspArr[i].record_count > maxRecordCnt) {
                        maxRecordCnt = rspArr[i].record_count;
                        maxRecordIdx = i;
                        //console.log("maxRecordCnt:"+maxRecordCnt+",maxRecordIdx:"+maxRecordIdx);
                    }
                }
    
                // title
                // console.log(JSON.stringify(rspArr))
                var dtitle = $('#lecMainTitle');
                dtitle.empty();
                for (var i = 0; i < rspArr.length; i++) {
                    var o = rspArr[i];
                    if (o.v_name === "原文直譯(參考用)")
                        dtitle.append($("<div class=lecContent><div class=versionName>" + o.v_name + "<span class='closeButton' cname='" + "原文直譯" + "'>&#215</span></div></div>"));
                    else{
                        dtitle.append($("<div class=lecContent><div class=versionName>" + o.v_name + "<span class='closeButton' cname='" + o.v_name + "'>&#215</span></div></div>"));
                    }
                }
    
                //var mode = 1;// 原本的. 就切回0
                var mode = ps.show_mode;
                switch (mode) {
                    case 0:
                        {
                            // 每一節 i, 以最大的那個版本為主 maxR
                            for (var i = 0; i < maxRecordCnt; i++) {
                                var maxR = rspArr[maxRecordIdx].record[i];
                                htmlContent += "<div class=lec style='font-size: " + ps.fontSize + "pt; line-height: " + ps.fontSize * 1.25 + "pt; margin-top: " + (ps.fontSize * 1.25 - 15) + "px'>";
                                //htmlContent+="<div class=lecTitle>"+maxR.chap+":"+maxR.sec+"</div>";
                                for (j = 0; j < rspArr.length; j++) {
                                    var chap = maxR.chap, sec = maxR.sec;
                                    var rec = getRecord(rspArr[j].record, null, chap, sec);
                                    //var r=rspArr[j].record[i];
                                    if (rec != null) {
                                        var bibleText = parseBibleText(rec.bible_text, ps, isOld, rspArr[j].version);
                                        if (bibleText == "a")
                                            bibleText = "【併入上節】";
                                    } else {
                                        bibleText = "";
                                    }
                                    if (rspArr[j].version == "bhs") {
                                        var bibleText = bibleText.split(/\n/g).reverse().join("<br>");
                                    }
                                    else if (rspArr[j].version == "cbol") {
                                        var bibleText = bibleText.split(/\n/g).join("<br>");
                                    }
                                    else if (rspArr[j].version == "nwh") {
                                        var bibleText = bibleText.split(/\n/g).join("<br>");
                                    }
    
                                    var className = '';
                                    if (rspArr[j].version == "thv12h") // 2018.01 客語特殊字型(太1)
                                        className += 'bstw '
    
                                    var bibleText2 = addHebrewOrGreekCharClass(rspArr[j].version, bibleText) // add by snow. 2021.07
                                    htmlContent += "<div class='lecContent " + rspArr[j].version + "'><div class='bstw' style='margin: 0px 20px 0px 1px; padding: 7px 0px; height: 100%;'><span class='verseNumber'>" + maxR.sec + "</span><span class='verseContent'>" + bibleText2 + "</span></div></div>";
                                }
                                htmlContent += "</div>";
                            }
                        }
                        break;
                    case 1:
                        {
                            // case1: 不同版本，併排顯示；case2，不同版本，交錯顯示
                            // 注意, 這個變數, 只是暫存的, 它輽出的結果是 html 文字, 不包含自己, 所以lecMain屬性是在另種設定, 不是在這
                            // 不要再從這裡改 <div style=padding:10px 50px></div>, 不會有效果的.
                            var $htmlContent = $("<div id='lecMain'></div>");
    
                            var cx1 = 100 / rspArr.length;
                            for (let j = 0; j < rspArr.length; j++) {
                                // 分3欄
                                var onever = $("<div class='vercol' style='width:" + cx1 + "%;display:inline-block;vertical-align:top; margin-top: " + (ps.fontSize * 1.25 - 15) + "px'></div>");
                                $htmlContent.append(onever);
                            }
    
                            // 每1欄內容
                            for (let j = 0; j < rspArr.length; j++) { //each version
                                for (var i = 0; i < rspArr[j].record_count; i++) {//each sec
                                    var maxR = rspArr[j].record[i]; //原 var maxR = rspArr[maxRecordIdx].record[i];
                                    var chap = maxR.chap, sec = maxR.sec;
                                    var rec = rspArr[j].record[i]; //原 var rec = getRecord(rspArr[j].record, null, chap, sec);
    
                                    var bibleText = "";
                                    if (rec != null)
                                        bibleText = parseBibleText(rec.bible_text, ps, isOld, rspArr[j].version);
                                    else
                                        bibleText = "";
                                    if (bibleText == "a") {
                                        bibleText = "【併入上節】";
                                    }
    
    
                                    if (rspArr[j].version == "bhs") 
                                    {
                                        bibleText = bibleText.split(/\n/g).reverse().join("<br>");
                                    }
                                    else if (rspArr[j].version == "cbol") {
                                        bibleText = bibleText.split(/\n/g).join("<br>");
                                        //console.log(bibleText);
                                    }
                                    else if (rspArr[j].version == "nwh") {
                                        bibleText = bibleText.split(/\n/g).join("<br>");
                                    }
    
                                    // 2018.01 客語特殊字型(太1)
                                    var className = 'verseContent ';
                                    if (rspArr[j].version == "thv12h" || rspArr[j].version == 'ttvh')
                                        className += ' bstw'
    
                                    // bhs 馬索拉原文 , 靠右對齊 要放在div, 放在 verseContent 無效
                                    // add by snow. 2021.07
                                    var classDiv = ''
                                    if (rspArr[j].version == 'bhs') {
                                        classDiv += ' hebrew-char-div'
                                    }
    
                                    // add by snow. 2021.07
                                    // 希伯來文右至左，使得「節」數字，會跑到左邊，應該放在右邊
                                    var brForHebrew = ''
                                    if (isHebrewOrGeekVersion(rspArr[j].version)) {
                                        brForHebrew += '<br/>'
                                    }
    
                                    // add by snow. 2021.07 原文字型大小獨立出來
                                    var bibleText2 = addHebrewOrGreekCharClass(rspArr[j].version, bibleText)

                                    
                                    let book = ps.bookIndex 
                                    
                                    let div_lec = $("<div>").addClass('lec').attr('ver', rspArr[j].version).attr('chap', chap).attr('sec', sec).attr('book', book).append($("<div>").addClass(classDiv).css('margin', '0px 0.25rem 0px 0.25rem').css('padding', '7px 0px').css('height', '100%').append($("<span>").addClass('verseNumber').text(sec)).append(brForHebrew).append($("<span>").addClass(className).html(bibleText2)))
                                    
                                    $htmlContent.children().eq(j).append(div_lec)
                                }//for each verse
                            }//for each version


                            function get_sn_stastic(rspArr){
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
                                const div_lec = $(div_lecMain).find(`div.lec[ver=${version_sn}]`)
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
                            ps.sn_stastic = get_sn_stastic(rspArr)
    
                            // add 2016.10 地圖與照片
                            if (ps.ispos || ps.ispho) {
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
                            }
                            else
                                htmlContent = $htmlContent.html();//.html()不包含自己 ... 所以這裡不是設 lecMain 有用的地方
    
                        }
                        break;
    
                    case 2:
                        { // case2 是不同版本交錯， case1 是不同版本並排
    
                            // 注意, 這個變數, 只是暫存的, 它輽出的結果是 html 文字, 不包含自己, 所以lecMain屬性是在另種設定, 不是在這
                            // 不要再從這裡改 <div style=padding:10px 50px></div>, 不會有效果的.
                            var $htmlContent = $("<div id='lecMain'></div>");
    
                            var onever = $("<div class='vercol' style='vertical-align:top; margin-top: " + (ps.fontSize * 1.25 - 15) + "px'></div>");

                            $htmlContent.append(onever);
    
                            // 每一節內容
                            for (var i = 0; i < maxRecordCnt; i++) {
                                var maxR = rspArr[maxRecordIdx].record[i]; //原 var maxR = rspArr[maxRecordIdx].record[i];
                                var chap = maxR.chap, sec = maxR.sec;
    
                                for (var j = 0; j < rspArr.length; j++) 
                                {
                                    var r1 = rspArr[j];

                                    if (rspArr.length > 1) 
                                    {
                                        var vname = "<br/><span class='ver'> (" + r1.v_name + ")</span> "; //新譯本 合和本 etc
                                    }
                                    else
                                    {
                                        var vname = ""; //只有一種版本就不要加了
                                    }

                                    if (i >= r1.record_count) 
                                    {
                                        //此版本 本章節比較少,
                                        var className = 'verseContent ';
                                        if (rspArr[j].version == "thv12h" || rspArr[j].version == 'ttvh') // 2018.01 客語特殊字型(太1)
                                            className += ' bstw'

                                        let book = ps.bookIndex
                                        let div_lec = $("<div>").addClass("lec").attr('book',book).attr('chap',chap).attr('sec',sec).attr('ver',rspArr[j].version).append(
                                            $("<div>").css('margin', '0px 0px 0px 0px').css('padding', '7px 0px').css('height', '100%').append(
                                                $("<span>").addClass('verseNumber').text(sec)).append($("<span>").addClass(className).html(vname))
                                        )
    
                                        onever.append(div_lec)

                                    }
                                    else 
                                    {
    
                                        var rec = rspArr[j].record[i]; //原 var rec = getRecord(rspArr[j].record, null, chap, sec);
                                        var bibleText = "";
                                        if (rec != null)
                                            bibleText = parseBibleText(rec.bible_text, ps, isOld, rspArr[j].version);
                                        else
                                            bibleText = "";
                                        if (bibleText == "a") {
                                            bibleText = "【併入上節】";
                                        }
                                        if (rspArr[j].version == "bhs") {
                                            // bhs 馬索拉原文 (希伯來文)
                                            bibleText = bibleText.split(/\n/g).reverse().join("<br>");
                                        }
                                        else if (rspArr[j].version == "cbol") {
                                            // cbol: 原文直譯參考用
                                            bibleText = bibleText.split(/\n/g).join("<br>");
                                            //console.log(bibleText);
                                        }
                                        else if (rspArr[j].version == "nwh") {
                                            bibleText = bibleText.split(/\n/g).join("<br>");
                                        }
    
                                        var className = 'verseContent';
                                        if (rspArr[j].version == "thv12h" || rspArr[j].version == 'ttvh') // 2018.01 客語特殊字型(太1)
                                            className += ' bstw'
    
                                        // bhs 馬索拉原文 , 靠右對齊 要放在div, 放在 verseContent 無效
                                        // add by snow. 2021.07
                                        var classDiv = ''
                                        if (rspArr[j].version == 'bhs') {
                                            classDiv += ' hebrew-char-div'
                                        }
    
                                        // add by snow. 2021.07
                                        // 希伯來文右至左，使得「節」數字，會跑到左邊，應該放在右邊
                                        var brForHebrew = ''
                                        if (isHebrewOrGeekVersion(rspArr[j].version)) {
                                            brForHebrew += '<br/>'
                                        }
    
                                        // add by snow. 2021.07 原文字型大小獨立出來                
                                        bibleText2 = addHebrewOrGreekCharClass(rspArr[j].version, bibleText)
                                        
                                        let book = ps.bookIndex
                                        let div_lec = $("<div>").addClass("lec").attr('book',book).attr('chap',chap).attr('sec',sec).attr('ver',rspArr[j].version).append(
                                            $("<div>").addClass(classDiv).css('margin', '0px 0.25rem 0px 0.25rem').css('padding', '7px 0px').css('height', '100%').append(
                                                $("<span>").addClass('verseNumber').text(sec)).append(brForHebrew).append($("<span>").addClass(className).html(bibleText2 + vname))
                                        )
                                        onever.append(div_lec)
                                    }
                                }
                            }
    
                            // add 2016.10 地圖與照片
                            if (ps.ispos || ps.ispho) {
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
                                        var nas = {};
                                        nas[aaa2.cname] = 1;
                                        nas[aaa2.c1name] = 1;
                                        nas[aaa2.c2name] = 1;
                                        nas[aaa2.ename] = 1;
    
                                        var nas2 = [];
                                        $.each(nas, function (b1, b2) {
                                            // 2016.10 nas2 若出現 ()會造成一定成立.
                                            if (b1 != null && b1.trim().length != 0)
                                                nas2.push(b1);
                                        });
    
                                        var regstr = "((" + nas2.join(")|(") + "))"; // ((羅馬)|(Rome))
                                        var regex = new RegExp(regstr, "i");
                                        id2obj[id] = aaa2;
                                        id2reg[id] = regex;
                                    }, null);
                                    $htmlContent.find(".verseContent").each(function (c1, c2) {
                                        var str = c2.innerHTML;
                                        var ischanged = false;
    
                                        // 每1節都要測所有的 regex, 並取代
                                        $.each(id2reg, function (b1, b2) 
                                        {
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
                            }
                            else
                                htmlContent = $htmlContent.html();//.html()不包含自己 ... 所以這裡不是設 lecMain 有用的地方
                        } break;
                }
    
    
                $lec.find('#lecMain').first()
                    .html(htmlContent)
                    .attr('mode', mode);
                $('#lecMain').css({ 'padding': '' })
    

    
    
                fhlLecture.reshape(ps);
    
                // 2016.01.21(四) 版權宣告 snow
                {
                    let div_copyrigh = $('<div id="div_copyright" class="lec copyright"></div>');
                    $('#lecMain').append(div_copyrigh); // 放在 lecMain 才會在最下面. 因為 parent 有設 position 屬性
                    let rr = React.createElement(copyright_api.R.frame, { ver: ps.version });
                    const ss = React.render(rr, document.getElementById("div_copyright"));  // snow add 2016.01.21(四),
                    // bug 小心: 版權宣告 render 必須在 dom.html 之後唷, 這樣才找到的 divCopyright 實體
                }
    
                if (mode == 0) {
                    for (var i = 0; i < maxRecordCnt; i++) {
                        var r = rspArr[maxRecordIdx].record[i];
                        dom.find('.lec:eq(' + i + ')').attr('chap', r.chap);
                        dom.find('.lec:eq(' + i + ')').attr('sec', r.sec);
                    }
                }
                setCSS(col, ps);
                setFont();
                that.selectLecture(null, null, ps.sec);
    
                {// 2016.08 snow, 注腳
                    $lec.find('.lec').each(function (a1, a2) {
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

                
    
    
    
                that.registerEvents(ps);
            });
            return
            function setFont() {
                $('.bhs').addClass('hebrew');
                $('.nwh').addClass('greek');
                $('.lxx').addClass('greek');
            }
            function checkOldNew(ps) {
                //0 - Old
                //1 - New
                return (book.indexOf(ps.chineses) >= 39) ? 0 : 1;
            }
            function parseBibleText(text, ps, isOld, bibleVersion) {
                var ret;
                
                // <RF><Rf> 這個到 jQuery 就會錯了，所以要先轉換...小寫的 <Rf> 要變為 </Rf> <Fi> 要變 </Fi>
                if ( bibleVersion == "kjv"){
                    text = text.replace(/<Rf>/g, "</Rf>"); // 大小寫很重要，所以不能寫 /gi 要用 /g
                    text = text.replace(/<Fi>/g, "</Fi>");
                }
                


                
                if ( -1 != ["unv","kjv", "rcuv","fhlwh"].indexOf(bibleVersion) ) {
                    // 和合本 KJV 和合本2010
                    text = do_sn(text)
                       
                    // 下面使用 jquery 操作，最後取 .html()
                    let text_jq = $(`<span>${text}</span>`)

                    // 將 sn 前面對應的文字，加上 sn-text class
                    add_sn_text(text_jq)

                    // 因為現在所有資料都包含 sn，所以若 strong=0，則要隱藏
                    add_sn_hidden_if_need(text_jq, ps)

                    text = text_jq.html()
                } // if 具有 sn 的譯本
                
                
                ret = text;

                if ( bibleVersion == "bhs" || bibleVersion == "fhlwh") {
                    // 舊約馬索拉原文, 新約WH原文
                    // 新約原文，加上 SN 了，再加這兩行會錯誤 (但我不確定這會不會用到，所以還保留著)
                    // ret = ret.replace(/</g, "&lt");
                    // ret = ret.replace(/>/g, "&gt");
                    ret = ret.replace(/\r\n/g, "<br>");
                }
                // console.log(ret);
                return ret;   
                
                // 將 sn 前面對應的文字，加上 sn-text class
                /**
                 * @param {JQuery<HTMLElement>} text_jq
                 * @returns {void}
                 * @description 開發 詩篇148
                 */
                function add_sn_text(text_jq) 
                {
                    
                    // 不是使用 .children() 因為這樣取不到 文字，不只要取到 span 也要取到 文字，所以要用 .contents()
                    let textContents = text_jq.contents()
                    
                    // 從最後一個到第一個，如果這個 i 是 .sn ，那麼 若 i-1 是文字 #text，那麼就把這段文字處理一下 ... 到 >= 1 就好，因為處理 i=0 的時候，前面就沒文字了呀
                    for (let i = textContents.length - 1; i >= 1; i--) {
                        /** @type {HTMLElement} */
                        let one_dom = textContents[i]
                        if (one_dom.nodeType != 3 && $(one_dom).hasClass("sn") && textContents[i-1].nodeType == 3) {
                            
                            // 花括號，就 continue。因為花括號表示中文字沒有，原文有
                            if (one_dom.innerText[0]=='{'){
                                // console.log($(one_dom))
                                continue
                            }
                            
                            // 分割文字，成2部分
                            let text_split = split_two_part(textContents[i-1].data)
                            let text_prev1 = text_split[0]
                            let text_prev2 = text_split[1]

                            // 若第二個字是 empty string 就不處理
                            if (text_prev2.trim() == ''){
                                continue
                            } else {
                                // 判斷，它的 sn 是什麼。 如果 [i] 的 sn 是超過 9000 ， 那麼就要用 i+1 的 sn，不會有連續2個超過 9000。
                                let sn = $(one_dom).attr('sn')
                                let n = $(one_dom).attr('n')
                                if (parseInt(sn) > 9000){
                                    sn = $(textContents[i+1]).attr('sn')
                                    n = $(textContents[i+1]).attr('n')
                                }
                                // console.log(sn);
                                
                                
                                // 要把原本位置的 #text 刪掉，然後加上 2 個 span, text_prev1 是純文字， text_prev2 是 <span class="sn-text" sn=sn n=n>text_prev2</span>
                                let sn_text2 = `<span class="sn-text" sn=${sn} n=${n}>${text_prev2}</span>`
                                $(textContents[i-1]).remove()
                                if ( text_prev1.trim().length != 0){
                                    $(one_dom).before(text_prev1)
                                }
                                $(one_dom).before(sn_text2)
                            }

                        } else if ( textContents[i-1].nodeName == 'U') {
                            // 和合本2010 詩篇148
                            // console.log(textContents[i-1]);
                            // [i-1] 從 <u>以色列</u> 變 <u class="sn-text">以色列</u>
                            let sn_n = get_sn_text_sn_n(i, textContents)
                            let sn = sn_n[0]
                            let n = sn_n[1]
                            $(textContents[i-1]).addClass('sn-text').attr('sn', sn).attr('n', n)
                        }                            
                    }  
                    
                    return // text_jq 是 input, output
                    function split_two_part(one_text)
                    {
                        // 將文字分為 2 部分，切割位置，是從 尾端 找，第一個出現 `：「！，。；（）？、』『` 中任何一個符號的位置。`因此他（或譯：他使）一切` 此例應該斷在 ）而非 （
                    
                        // let pos = text_prev.search(/[：「！，。；（）？、』『]/)
                        // let pos = text_prev.reverse().search(/[：「！，。；（）？、』『]/)
                        let istr = one_text.split('')
                        let pos = -1
                        for(let i=istr.length - 1;i>=0;i--){
                            if (istr[i].match(/[：「！，。；（）？、』『.:;,]/)){
                                pos = i
                                break
                            }
                        }


                        // 將文字分為 2 部分，前面的文字，後面的文字
                        let text_prev1 = one_text.slice(0, pos+1)
                        let text_prev2 = one_text.slice(pos+1)
                        // console.log(text_prev1);
                        // console.log(text_prev2);
                        
                        return [text_prev1, text_prev2]
                    }
                    /**
                     * 
                     * @param {number} i 
                     * @param {HTMLElement[]} textContents 
                     * @returns {[string, string]} sn, n
                     */
                    function get_sn_text_sn_n(i, textContents){
                        // 判斷，它的 sn 是什麼。 如果 [i] 的 sn 是超過 9000 ， 那麼就要用 i+1 的 sn，不會有連續2個超過 9000。
                        let sn = $(textContents[i]).attr('sn')
                        let n = $(textContents[i]).attr('n')
                        if (parseInt(sn) > 9000){
                            sn = $(textContents[i+1]).attr('sn')
                            n = $(textContents[i+1]).attr('n')
                        }
                        return [sn, n]
                    }
                }
                function add_sn_hidden_if_need(text_jq,ps){
                    // 因為現在所有資料都包含 sn，所以若 strong=0，則要隱藏
                    if ( ps.strong == 0 ){
                        // 將 text 轉為 jQuery，然後將 .sn 的 span 加入 .hidden
                        text_jq.find('.sn').addClass('sn-hidden')
                    }
                }
                /**
                 * 用 string replace 處理，將 WTH WH WAH 等 sn 轉換成 span tag
                 * @param {string} text api 得到的值，包含許多 WTH 的文字 
                 * @returns {string} 處理過的文字，是一個 html 格式
                 */
                function do_sn(text){
                    function snReplace(s, s1, s2, s3, s4, s5, s6, s7, s8) {
                        //console.log(s, s1, s2, s3, s4, s5, s6, s7, s8);
                        
                        // 當有 { } 時, 是用 s1 s2 s3 s4
                        // s1, s5: A or T or ""
                        // s2, s6: H or G
                        // s3, s7: 09002 之類的, 若有 a 不會包含， a 會在 s4
                        // s4, s8: a or ""

                        // 判斷 A or T s1 或 s5
                        let sAT = s1 || s5;
                        let sHG = s2 || s6;
                        let sSN = s3 || s7;
                        let sA = s4 || s8;
                        
                        // 判斷有無 { }
                        const isExistBrace = s1 != undefined
                        // 判斷是要用 < > chevrons 還是 ( ) parentheses  
                        const isUseParentheses = sAT == 'T' 
                        // sn 去掉多餘的0 (轉成數字，再轉回文字) + a (若有)
                        let sn = parseInt(sSN).toString() + (sA == 'a' ? sA : '')
                        // N=1 舊約, N=0 新約
                        let N = sHG == 'H' ? 1 : 0 

                        // 新增一個 span tag, 使用 jquery
                        let span = $("<span></span>")
                        // 加上 class, sn, N
                        span.addClass('sn').attr('sn', sn).attr('N', N)
                        // 顯示內容
                        var text = isUseParentheses ? `(${sn})` : `<${sn}>`
                        // 如果有 { } 就加上
                        if (isExistBrace) {
                            text = `{${text}}`
                        }
                        // 加上文字
                        span.html(text)

                        return span[0].outerHTML
                    }
                    
                    let reg1 = /<W([AT]?)([HG])([0-9]+)(a?)>/gi // T是顯示是用小括號，但原始是<>，那是後處理
                    // 有可能有 { } ， 也可能沒有
                    let reg2 = new RegExp("{"+reg1.source+"}" + "|" + reg1.source, "gi")
                    text = text.replace(reg2, snReplace);
                    
                    return text
                }                    
            }
            function getRecord(r, b, c, s) {
                var ret = null;
                for (var i = 0; i < r.length; i++) {
                    if (r[i] == null)
                        break;
                    if (r[i].chap == c && r[i].sec == s) {
                        ret = r[i];
                        break;
                    }
                }
                return ret;
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
             * 用在主畫面時的經文, 若非符合版本, 會直接回傳原來的 bibleText
             * fhlwh 新約原文 lxx 七十士譯本 bhs 馬索拉原文
             * @param {string} version - rspArr[j].version  fhlwh, lxx, bhs 都會特定處理
             * @param {string} bibleText - 通常是純文字，也有可能被加上一些 html 語法了
             * @returns {string}
            */
            function addHebrewOrGreekCharClass(version, bibleText) {
                // add by snow. 2021.07, 將希臘文，希伯來文加入 class
                if (isHebrewOrGeekVersion(version)) {
                    return charHG(bibleText)
                }
                return bibleText
            }
            /** 
            * fhlwh 新約原文 lxx 七十士譯本(舊約用希臘文) bhs 馬索拉原文 (希伯來文)
            * @param {string} ver - fhlwh lxx bhs
            */
            function isHebrewOrGeekVersion(ver) {
                return ['fhlwh', 'lxx', 'bhs'].indexOf(ver) != -1
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
                        testThenDoAsync(() => window.fhlwh_sn != undefined).then(() => {
                            // bookIndex 45 chap 1
                            /** @type {{number,number,number,string}[]} */
                            const fhlwh_sn = window.fhlwh_sn
    
                            const bk = ps.bookIndex
                            const ch = ps.chap
                            // where [0]=bk and [1]=ch
                            const jaBible = fhlwh_sn.filter(ja => ja[0] == bk && ja[1] == ch)
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
    
                                cbk(jsonObj);
                                sem--;
                            }
                        });
                    }                 

                })
    
                testThenDoAsync(() => sem == 0)
                    .then(() => defCbk())
            }
        };
    }
}
