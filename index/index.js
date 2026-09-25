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
import { qsb } from './api/qsb.js'
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
import { APP_SKELETON_HTML } from './appSkeleton.es2023.js'
// 以下原本由 Ijnjs.getCacheAsync 在啟動時下載成文字再 eval
import { initDialogTemplate } from './DialogTemplate/DialogTemplate.js'
import { checkHtmlVersion } from './checkHtmlVersion.js'
import { runIndexLast } from './indexLast.js'
import fhlCss from './fhl.css?raw' // 以 <style> 插在最後以蓋過 bootstrap 5；內含相對於頁面的 url()，不能交給 Vite 處理

// Bootstrap 5.1 css。原本由 ijnjs 以 XHR 下載、DOM ready 後以 <style> 插入；現在直接以 <link> 插到 <head> 最後，
// 維持相同的層疊順序：在 index.html 所有 css（含 Vite 打包的 css、bs4-compat.css）之後、fhl.css 之前。
document.head.appendChild(Object.assign(document.createElement('link'), {
    rel: 'stylesheet',
    href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css',
}))
import './load_json_gz_Async.es2023.js' // 設定 window.Sd_same_json；SN 資料改為用到時才載入（ensureSnDataAsync）

import { do_preach } from './do_preach.es2023.js' // 講道
import { SnBranchRender } from './SnBranchRender.es2023.js' // 樹狀圖(羅馬書才有)

import { FhlInfo } from './FhlInfo.es2023.js' // fhlInfoContent 用
import { FhlInfoTitle } from './FhlInfoTitle.es2023.js' // fhlInfoContent 用
import { FhlInfoContent } from './FhlInfoContent.es2023.js'

import { getBookFunc } from './getBookFunc.es2023.js'
import { BookSelect } from './BookSelect.es2023.js'

import { ViewHistory } from './ViewHistory.es2023.js'
import { VersionSelect } from './VersionSelect.es2023.js'

import { LeftWindowTool } from './LeftWindowTool.es2023.js'
import { FhlLeftWindow } from './FhlLeftWindow.es2023.js'

import { FhlToolBar } from './FhlToolBar.es2023.js'
import { FhlMidWindow } from './FhlMidWindow.es2023.js'
import { windowAdjust } from './windowAdjust.es2023.js'
import { triggerGoEventWhenPageStateAddressChange } from './triggerGoEventWhenPageStateAddressChange.es2023.js'
import { initPageStateFlow } from './initPageStateFlow.es2023.js'
import { coreInfoWindowShowHide } from "./coreInfoWindowShowHide.es2023.js";
import { SN_Act_Color } from './SN_Act_Color.es2023.js'
import { TPPageState } from "./TPPageState.es2023.js";
import { DocEvent } from './DocEvent.es2023.js'
import { gbText } from './gbText.es2023.js'
import { registerEvents_doc } from './registerEvents_doc.es2023.js'
import { ParagraphData } from './ParagraphData_es2023.js'
import { addViewHistoryEvents } from './addViewHistoryEvents_es2023.js'
import { SearchFlow } from './SearchFlow_es2023.js'

import { Search_DataForGroupUi } from './Search_DataForGroupUi_es2023.js'
import { Search_UiOfGroupRender } from './Search_UiOfGroupRender_es2023.js'
import { Search_initializePreSearchEventHandlersAsync } from './Search_initializePreSearchEventHandlersAsync_es2023.js'
import { Search_continue_search } from './Search_continue_search_es2023.js'
import { Search_create_dialog_search_result } from './Search_create_dialog_search_result_es2023.js'
import { Search_pre_search_click } from './Search_pre_search_click_es2023.js'
import { hash_change_on_initial } from './hash_change_on_initial.js'
import { Hash_Changed } from './Hash_Changed.js'
(function (root) {
    // // 相容其它 .js 還沒有重構成 import export 格式
    window.getBookFunc = getBookFunc
    window.Search_DataForGroupUi = Search_DataForGroupUi
    window.Search_UiOfGroupRender = Search_UiOfGroupRender
    window.Search_initializePreSearchEventHandlersAsync = Search_initializePreSearchEventHandlersAsync
    window.Search_continue_search = Search_continue_search
    window.Search_create_dialog_search_result = Search_create_dialog_search_result
    window.Search_pre_search_click = Search_pre_search_click

    window.BibleConstantEs6Js = () => BibleConstant
    window.BibleConstantHelperEs6Js = () => BibleConstantHelper
    window.splitStringByRegexEs6Js = () => splitStringByRegex
    window.matchGlobalWithCaptureEs6Js = () => matchGlobalWithCapture
    window.DialogHtmlEs6Js = () => DialogHtml
    window.isRDLocationEs6Js = () => isRDLocation
    window.qsbAsyncEs6Js = () => qsb
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
    window.SearchFlow = SearchFlow
    window.SnBranchRender = SnBranchRender // 樹狀圖(羅馬書才有)
    window.do_preach = do_preach // 講道
    window.fhlInfo = FhlInfo.s // fhlInfoContent 用
    window.fhlInfoTitle = FhlInfoTitle.s // fhlInfoContent 用
    window.fhlInfoContent = FhlInfoContent.s // fhlInfoContent 用

    window.bookSelect = BookSelect.s // bookSelect 用

    window.viewHistory = ViewHistory.s // viewHistory 用

    window.versionSelect = VersionSelect.s // versionSelect 用

    window.triggerGoEventWhenPageStateAddressChange = triggerGoEventWhenPageStateAddressChange // indexLast 重構前，還是要有
    window.SN_Act_Color = SN_Act_Color // SN_Act_Color 用

    // indexLast 還在用
    window.BibleConstant = BibleConstant
    window.docEvent = DocEvent.s //
    window.TPPageState = TPPageState
    window.gbText = gbText // sephp.create_dialog_presearch 用
    window.addViewHistoryEvents = addViewHistoryEvents
    Object.defineProperty(window, 'pageState', {
        get() {
            return TPPageState.s; // 假設 TPPageState.s 是你的全域狀態
        },
        configurable: true, // 允許重新定義
        enumerable: true    // 允許列舉
    });
    Object.defineProperty(window, 'ps', {
        get() {
            return TPPageState.s; // 假設 TPPageState.s 是你的全域狀態
        },
        configurable: true, // 允許重新定義
        enumerable: true    // 允許列舉
    });


    // 串珠也會用到，但串珠沒有這幾個函式定義
    // window.BibleConstantEs6Js = BibleConstantEs6Js 
    // window.BibleConstantHelperEs6Js = BibleConstantHelperEs6Js
    // window.splitReferenceEs6Js = splitReferenceEs6Js 
    // window.cvtAddrsToRefEs6Js = cvtAddrsToRefEs6Js 
    // window.queryReferenceAndShowAtDialogAsyncEs6Js = queryReferenceAndShowAtDialogAsyncEs6Js

    ParagraphData.s.isReadyAndStartingIfNeed()

    window.fhlLecture = FhlLecture.s

    // 原本 testIsLastVersion() 以同步 ajax 取 app_versions.json，會卡住整頁
    AppVersion.s.testIsLastVersionAsync().then(isLastVersion => {
    if (isLastVersion) {
        testThenDoAsync(() => window.Ijnjs != undefined)
            .then(() => {
                // 原本先以 Ijnjs.getCacheAsync 下載 DialogTemplate/*、checkHtmlVersion、indexLast、fhl.css 成文字，
                // 再逐一 eval；現在都是一般 import（見本檔開頭），省下這一輪請求。
                (async () => {
                    doNoReadyStep1()
                    doNoReadyStep2() //廢棄
                    doNoReadyStep3()

                    // doNoReadyStep1 會載入這個全域變數
                    init_fontsize_css_variable_from_pagestate(TPPageState.s)

                    await hash_change_on_initial()

                    doReadyStep1()
                    doReadyStep2()

                    // 頁面骨架。原本在這裡 eval static/js 的 webpack Vue app（manifest/vendor/app）產生，
                    // 它只有靜態模板，改為直接插入同樣的 HTML（見 appSkeleton.es2023.js）。
                    document.getElementById('app').innerHTML = APP_SKELETON_HTML

                    runIndexLast()

                    $("<style>", {
                        text: fhlCss
                    }).appendTo($("head"))

                    setTimeout(() => {
                        $('#app').show()
                        $('#waiting').hide()
                    }, 300);
                })()
            })
    } else {
        // 原本 $('#app').load('frmUpdated.html #app .container')：只取該片段，不執行裡面的 <script>
        fetch('frmUpdated.html')
            .then(response => response.text())
            .then(html => {
                const container = new DOMParser().parseFromString(html, 'text/html').querySelector('#app .container')
                document.getElementById('app').replaceChildren(...(container ? [document.importNode(container, true)] : []))
            })
            .catch(er => console.error(er))
        AppVersion.s.setUpdateDialogVersion();
        AppVersion.s.addClickListVerionsInfosEvent();
        $('#waiting').hide()
    }
    })


    $(() => {
        setTimeout(() => {
            $(window).off("hashchange").on("hashchange", async ev => {

                const hc = Hash_Changed.s
                if (hc.is_setting_by_code() == true) {
                    console.warn("ignore once hashchange event");
                    hc.reset_is_setting_by_code()
                    return
                }

                await hash_change_on_initial()
                
                const ps = TPPageState.s
                $(document).trigger('go', { book: ps.bookIndex, chap: ps.chap, sec: ps.sec })

                BookSelect.s.render();
                FhlInfo.s.render(ps);
                FhlLecture.s.render();
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

function init_fontsize_css_variable_from_pagestate(ps) {
    document.body.style.setProperty("--fontsize", ps.fontSize + "pt")
    document.body.style.setProperty("--fontsize-greek", ps.fontSizeGreek + "pt")
    document.body.style.setProperty("--fontsize-hebrew", ps.fontSizeHebrew + "pt")
    document.body.style.setProperty("--fontsize-sn", ps.fontSizeStrongNumber + "pt")
}
function doNoReadyStep1() {
    // export window.initPageStateFlow
    // eval(caches.getStr('initPageStateFlow'))

    // export window.LeftWindowTool
    // function fn1() { eval(caches.getStr('LeftWindowTool')) }
    // fn1.call(window)

    // export DialogTemplate and findPrsingTableSnClassAndLetItCanClick
    initDialogTemplate()

    // checkHtmlVersion：現在直接 import（window.checkHtmlVersion 也在該模組載入時設定）

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

    // var chineseNumber = FHL.CONSTANT.Bible.CHINESE_NUMBERS;
    // var book = FHL.CONSTANT.Bible.CHINESE_BOOK_ABBREVIATIONS;
    // var bookGB = FHL.CONSTANT.Bible.CHINESE_BOOK_ABBREVIATIONS_GB;
    // var bookFullName = FHL.CONSTANT.Bible.CHINESE_BOOK_NAMES;
    // var bookFullName2 = FHL.CONSTANT.Bible.CHINESE_BOOK_NAMES_GB;
    // var bookChapters = FHL.CONSTANT.Bible.BOOK_CHAPTERS;
    // var bookEng = FHL.CONSTANT.Bible.ENGLISH_BOOK_ABBREVIATIONS;
    // var bookEngShort = FHL.CONSTANT.Bible.ENGLISH_BOOK_SHORT_ABBREVIATIONS
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
            testThenDoAsync(() => windowAdjust != null)
                .then(a1 => {
                    windowAdjust();
                })

            // add by snow. 2021.07, device 旋轉也算
            coreInfoWindowShowHide(function () {
                fhlLecture.reshape(TPPageState.s); //ps的全域即是 TPPageState.s, 只是這裡沒有傳過來, 只好偷存取全域的 snow-add
            }, TPPageState.s.isVisibleLeftWindow, TPPageState.s.isVisibleInfoWindow)

        }
    }, 200))

    // window.isRDLocation = isRDLocation
    // window.urlJSON = urlJSON
    // window.chineseNumber = chineseNumber
    // window.book = book
    // window.bookGB = bookGB
    // window.bookFullName = bookFullName
    // window.bookFullName2 = bookFullName2
    // window.bookChapters = bookChapters
    // window.bookEng = bookEng
    // window.bookEngShort = bookEngShort

    // window.leftWindowTool = leftWindowTool
}

function doReadyStep1() {
    calcScrollWidthAndSetToCssBodyVariable()

    return
    /**
     * 用在 #lecMain fhl.css 樣式中的 padding-right
     */
    function calcScrollWidthAndSetToCssBodyVariable() {
        $(() => {
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

        FhlToolBar.s.init(TPPageState.s);
        FhlLeftWindow.s.init(TPPageState.s);
        FhlMidWindow.s.init(TPPageState.s);
        FhlInfo.s.init(TPPageState.s);
        registerEvents_doc(TPPageState.s);

        $('#title')[0].firstChild.nodeValue = TPPageState.s.gb === 1 ? "信望爱圣经工具 " : "信望愛聖經工具 ";
        // console.log($('#title')[0].childNodes[1]);
        $('#title')[0].childNodes[1].textContent = "v" + TPPageState.s.swVer;
        checkHtmlVersion() // checkHtmlVersion.js

        // add by snow. 2021.07
        // 開啟時，保持上次設定 (左、右功能視窗，隱藏 or 顯示)
        coreInfoWindowShowHide(function () {
            setTimeout(function () {
                FhlLecture.s.reshape(TPPageState.s); // 加這行會有 Bug, 因此要在 setTimeout 中 (其它地方呼叫不需要如此)         
            }, 0)
        }, TPPageState.s.isVisibleLeftWindow == 1, TPPageState.s.isVisibleInfoWindow == 1)

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
