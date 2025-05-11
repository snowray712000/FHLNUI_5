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

import { FhlLecture } from './FhlLecture.es2023.js'
import { load_json_gz_Async } from './load_json_gz_Async.es2023.js'

import { do_preach } from './do_preach.es2023.js' // 講道
import { renderTsk } from './renderTsk.es2023.js' // 串珠
import { SnBranchRender } from './SnBranchRender.es2023.js' // 樹狀圖(羅馬書才有)

import { FhlInfo } from './FhlInfo.es2023.js' // fhlInfoContent 用
import { FhlInfoTitle } from './FhlInfoTitle.es2023.js' // fhlInfoContent 用
import { FhlInfoContent } from './fhlInfoContent.es2023.js'

import { getBookFunc } from './getBookFunc.es2023.js'
import { BookSelect } from './BookSelect.es2023.js'

import { ViewHistory } from './ViewHistory.es2023.js'
import { VersionSelect } from './VersionSelect.es2023.js'

import { LeftWindowTool } from './LeftWindowTool.es2023.js'
import { FhlLeftWindow } from './FhlLeftWindow.es2023.js'

import { FhlToolBar } from './FhlToolBar.es2023.js'
import { FhlMidWindow } from './FhlMidWindow.es2023.js'

(function (root) {
    // // 相容其它 .js 還沒有重構成 import export 格式
    window.getBookFunc = getBookFunc

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
    // window.FhlLectureEs6Js = () => FhlLecture // 不需要，別人只用到實體 window.fhlLecture

    window.renderTsk = renderTsk // 因為 fhlInfoContent 還沒成 es2023
    window.SnBranchRender = SnBranchRender // 樹狀圖(羅馬書才有)
    window.do_preach = do_preach // 講道
    window.fhlInfo = FhlInfo.s // fhlInfoContent 用
    window.fhlInfoTitle = FhlInfoTitle.s // fhlInfoContent 用
    window.fhlInfoContent = FhlInfoContent.s // fhlInfoContent 用

    window.bookSelect = BookSelect.s // bookSelect 用

    window.viewHistory = ViewHistory.s // viewHistory 用

    window.versionSelect = VersionSelect.s // versionSelect 用


    // 串珠也會用到，但串珠沒有這幾個函式定義
    // window.BibleConstantEs6Js = BibleConstantEs6Js 
    // window.BibleConstantHelperEs6Js = BibleConstantHelperEs6Js
    // window.splitReferenceEs6Js = splitReferenceEs6Js 
    // window.cvtAddrsToRefEs6Js = cvtAddrsToRefEs6Js 
    // window.queryReferenceAndShowAtDialogAsyncEs6Js = queryReferenceAndShowAtDialogAsyncEs6Js

    load_json_gz_Async()
    
    window.fhlLecture = FhlLecture.s

    if (AppVersion.s.testIsLastVersion() == true || false) {
        testThenDoAsync(() => window.Ijnjs != undefined)
            .then(() => {
                var files = [
                    'initPageStateFlow', 
                    // 'LeftWindowTool',
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
                    // 'getBookFunc',
                    'requestFullscreen',
                    'registerEvents',

                    // 'fhlToolBar',
                    // 'help',
                    // 'helpingPopUp',
                    // 'windowControl',
                    // 'bookSelect',
                    // 'bookSelectPopUp',
                    // 'bookSelectName',
                    // 'bookSelectChapter',

                    // 'fhlLeftWindow',
                    // 'settings',
                    // 'snSelect',
                    // 'gbSelect',
                    // 'show_mode',
                    // 'realTimePopUpSelect',
                    // 'mapTool',
                    // 'imageTool',
                    // 'renderTsk', //es 模式成功，讓這個被拿掉
                    // 'SnBranchRender', //es 模式成功，讓這個被拿掉
                    // 'fontSizeTool',
                    
                    // 'versionSelect',
                    'docEvent',
                    // 'viewHistory',
                    // 'fhlMidWindow',
                    //'fhlLecture', //es 模式成功，讓這個被拿掉
                    // 'fhlMidBottomWindow',
                    'SN_Act_Color',
                    'parsing_render_top',
                    'parsing_render_bottom_table',
                    // 'fhlInfoContent',
                    'parsingPopUp',
                    // 'searchTool',
                    'coreInfoWindowShowHide',
                    // 'FontSizeToolBase',
                    'charHG',
                    'doSearch',
                    // 'do_preach',
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
    // function fn1() { eval(caches.getStr('LeftWindowTool')) }
    // fn1.call(window)

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

    var leftWindowTool = LeftWindowTool.s

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

        FhlToolBar.s.init(pageState);
        FhlLeftWindow.s.init(pageState);
        FhlMidWindow.s.init(pageState);
        FhlInfo.s.init(pageState);
        registerEvents(pageState);

        $('#title')[0].firstChild.nodeValue = pageState.gb === 1 ? "信望爱圣经工具 " : "信望愛聖經工具 ";
        // console.log($('#title')[0].childNodes[1]);
        $('#title')[0].childNodes[1].textContent = "v" + pageState.swVer;
        checkHtmlVersion() // checkHtmlVersion.js

        // add by snow. 2021.07
        // 開啟時，保持上次設定 (左、右功能視窗，隱藏 or 顯示)
        coreInfoWindowShowHide(function () {
            setTimeout(function () {
                FhlLecture.s.reshape(pageState); // 加這行會有 Bug, 因此要在 setTimeout 中 (其它地方呼叫不需要如此)         
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
