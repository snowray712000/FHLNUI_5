/// <reference path='../libs/jsdoc/jquery.js' />
/// <reference path='../libs/jsdoc/linq.d.ts' />
/// <reference path='../libs/ijnjs/ijnjs.d.js' />
/// <reference path='./SN_Act_Color.js' />
/// <reference path='./DataOfDictOfFhl.d.ts' />
/// <reference path='./fhlParsing.d.ts' />
/// <reference path='./DPageState.d.js' />

(function (root) {
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

})(this)

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

// 下面是 Es6Js code copy
function queryDictionaryAndShowAtDialogAsyncEs6Js() {
    let SnDictOfCbol = SnDictOfCbolEs6Js()
    let SnDictOfTwcb = SnDictOfTwcbEs6Js()
    let DialogHtml = DialogHtmlEs6Js()

    return queryDictionaryAndShowAtDialogAsync
    /**
     * 開發給 原字Parsing時，點擊原文字，要跳出字典內容
     * @param {{sn:string;isOld:boolean}} jo 
     * @returns {Promise<void>}
     */
    function queryDictionaryAndShowAtDialogAsync(jo) {
        qDataAsync(jo).then(html => {
            let dlg = new DialogHtml()
            dlg.showDialog({
                html: html,
                getTitle: () => "原文字典" + jo.sn,
                registerEventWhenShowed: dlg => {     
                    dlg.on('click', '.ref', a1 => {
                        queryDictionaryAndShowAtDialogAsync({ sn: $(a1.target).attr('data-addrs'), isOld: false })
                        //let addrs = JSON.parse($(a1.target).attr('data-addrs'))
                        //console.log(addrs);
                        //window.location.hash = "#/bible/Ge/3/28"
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
                let cvtDTextsToHtml = cvtDTextsToHtmlEs6Js()
                return "<div>" + cvtDTextsToHtml(dtexts) + "</div>"
            }
        }
    }
}

function DialogHtmlEs6Js() {
    return DialogHtml
    /**
     * 呈現 html 資料的 dialog。
     * 用在 原文字典 點擊後，取得資料，轉為 html，呈現。
     * 也將會用到 交互參照 點擊後，取得資料，轉為 html，呈現。
     * @class
     */
    function DialogHtml() {
        /**
         * @param {{DDialogHtml}} jo 
         * @returns 
         */
        this.showDialog = function (jo) {
            let idDlg = getIdOfDialog();
            let dlg = $('#' + idDlg).dialog({
                autoOpen: false,
            });

            // 真正有效 清除事件, 避免記憶體殘留
            dlg.on("dialogclose", function (event, ui) {
                dlg.parent()[0].outerHTML = ""
            });
            // 將 close button 的 x 顯示 (因為與 bootstrap 衝突，會不見)
            const imgUrl = './images/ui-icons_cc0000b_256x240.png'
            dlg.on("dialogopen", function (event, ui) {
                // https://stackoverflow.com/questions/17367736/jquery-ui-dialog-missing-close-icon
                $(this).closest(".ui-dialog")
                    .find(".ui-dialog-titlebar-close")
                    // .removeClass("ui-dialog-titlebar-close")
                    .html("<span class='ui-button-icon-primary ui-icon ui-icon-closethick' style='margin: -16px 0px 0px -2px;background-image: url(\"" + imgUrl + "\");'></span>");
            });
            dlg.html(jo.html)

            // maxWidth。如果 jo 有，就用 jo 的
            if (jo.maxWidth) 
                dlg.dialog("option", "maxWidth", jo.maxWidth)
            else
                dlg.dialog("option", "maxWidth", window.innerWidth * 0.80)

            // maxHeight。如果 jo 有，就用 jo 的
            if (jo.maxHeight)
                dlg.dialog("option", "maxHeight", jo.maxHeight)
            else
                dlg.dialog("option", "maxHeight", window.innerHeight * 0.80) // 若沒設，會自動很 高，就也不會出現卷軸
            
            // width。如果 jo 有，就用 jo 的
            if (jo.width)
                dlg.dialog("option", "width", jo.width)
            else
                dlg.dialog("option", "width", window.innerWidth * 0.80)

            // position。如果 jo 有，就設
            if (jo.position){
                dlg.dialog("option", "position", jo.position)
            }
            
            // dlg.dialog("option", "height", window.innerHeight * 0.80) // 若沒設，會自動很 高，就也不會出現卷軸
            // dlg.dialog("option", "title", "原文字典" + jo.sn)

            dlg.dialog("option", "title", jo.getTitle())
            dlg.dialog("open")

            jo.registerEventWhenShowed(dlg)
            // registerEvents(dlg)
            return
            /**
             * 自動取得合適的 id，不合適的 id 就是「正在使用的」。
             * @returns {string}
             */
            function getIdOfDialog() {
                const prefix = "iddlg"
                const prefix2 = "#" + prefix // jquery '#idxxxx', 所以有#字號

                let idx = tryGetId(0)
                return prefix + idx

                function tryGetId(id) {
                    let dom = $(prefix2 + id)
                    if (dom.length == 0) {
                        $("<div>", {
                            id: prefix + id,
                            text: "dialog"
                        }).appendTo($("body"))
                        return id // 沒被用過
                    }
                    return tryGetId(id + 1)
                }
            }
        }
    }
}
function SnDictOfTwcbEs6Js() {
    let ISnDictionary = ISnDictionaryEs6Js()
    let twcbflow = twcbflowEs6Js()
    let isRDLocation = isRDLocationEs6Js()

    SnDictOfTwcb.prototype = new ISnDictionary()
    SnDictOfTwcb.prototype.constructor = SnDictOfTwcb

    return SnDictOfTwcb

    function SnDictOfTwcb() {
        /**
         * @param {{sn:string,isOld:boolean}} param 
         * @returns {Promise<DataOfDictOfFhl>}
         */
        this.queryAsync = function (param) {
            const isRD = isRDLocation()
            let url = param.isOld ? "/json/stwcbhdic.php" : "/json/sbdag.php"
            let val = "?k=" + param.sn
            val += "&gb=0"
            url += val
            if (isRD == false) { // 真實上線 (才不會有 cross-domain 問題)
                return new Promise((res, rej) => {
                    $.ajax({
                        url: url,
                        error: er => {
                            console.error(er);
                            rej(er)
                        },
                        success: reStr => {
                            res(JSON.parse(reStr))
                        },
                    })
                })

            } else { // 先嘗試 127.0.0.1:5600 proxy，失敗再用 虛擬資料(開發用)
                return new Promise((res, rej) => {
                    $.ajax({
                        url: `http://127.0.0.1:5600${url}`,
                        timeout: 1000,
                        error: er => {
                            console.warn("可以開啟 python flask 作的 proxy.");
                            try {
                                // 嘗試使用 virtual data
                                // let re = param.isOld ? virtualOld() : virtualNew();
                                virtualNewOld(param.sn, param.isOld).then( re2 => res( JSON.parse(re2) ))
                            } catch (error) {
                                rej(er);
                            }
                        },
                        success: reStr => {
                            // api 回傳 text，
                            res(JSON.parse(reStr));
                        },
                    });
                })
                
                function virtualNewOld(sn, isOld){
                    let json_file = isOld ? './index/sd_virtual_old_twcb.json' : './index/sd_virtual_new_twcb.json'
                    return new Promise((res, rej) => {
                        $.ajax({
                            url: json_file,
                            error: er => {
                                rej(er)
                            },
                            success: joFile => {
                                let textFile = JSON.stringify(joFile)
                                res(textFile)
                            },
                        })
                    })
                }
            }
        }
        /**
         * @param {DataOfDictOfFhl} dataOfFhl 
         * @returns {DText[]}
         */
        this.cvtToDTexts = function (dataOfFhl) {
            let re = twcbflow(dataOfFhl.record[0].dic_text)
            return re
        }
    }
}
function ISnDictionaryEs6Js() {
    /**
     * 取得資料
     * @param {{sn:string,isOld:boolean}} param 
     * @returns {Promise<DataOfDictOfFhl>}
     */
    ISnDictionary.prototype.queryAsync = function (param) { throw new Error("this is a abstract function.") }
    /**
     * 將資料轉換為 DText[]
     * @param {DataOfDictOfFhl} dataOfFhl 
     * @returns {DText[]}
     */
    ISnDictionary.prototype.cvtToDTexts = function (dataOfFhl) { throw new Error("this is a abstract function.") }
    return ISnDictionary
    /**
     * 將會有 Twcb 版的實作、Cbol 版的實作
     * SnDictOfTwcb SnDictOfCbol
     * @interface
     */
    function ISnDictionary() { }
}
function twcbflowEs6Js() {
    let splitBtw = splitBtwEs6Js()
    let splitReference = splitReferenceEs6Js()
    let splitBrOne = splitBrOneEs6Js()

    return twcbflow
    /**
     * 轉換成 DTexts of 原文字典 of 浸宣 (twcb)
     * @param {string} str aaa.record[0].dic_text
     * @returns {DText[]}
     */
    function twcbflow(str) {
        let regs = {
            reg1: () => /<div class=\"idt\">/g,
            reg2: () => /<\/div>/g
        }
        let regs2 = {
            reg1: () => /<span class=\"bibtext\">|<span class=\"exp\">/g,
            reg2: () => /<\/span>/g
        }
        let r1 = splitBtw(str, regs)
        if (r1 == null) { r1 = [{ w: str }] }

        let re = splitSpansOne(r1)

        let r3 = splitBrOne(re)

        let r4 = splitReference(r3) // splitRefs(r3)
        return r4

        /**
         * @param {DText[]} data 
         */
        function splitSpansOne(data) {
            let re = []
            for (const it of data) {
                if (it.tpContainer == null) {
                    let r2 = splitBtw(it.w, regs2)
                    if (r2 == null) {
                        re.push(it)
                    } else {
                        for (const it2 of r2) {
                            re.push(it2)
                        }
                    }
                } else {
                    let r3 = splitSpansOne(it.children)
                    it.children = r3
                    re.push(it)
                }
            }
            return re
        }
    }
}
function SnDictOfCbolEs6Js() {
    let ISnDictionary = ISnDictionaryEs6Js()
    let isRDLocation = isRDLocationEs6Js()
    let cbolflow = cbolflowEs6Js()

    SnDictOfCbol.prototype = new ISnDictionary()
    SnDictOfCbol.prototype.constructor = SnDictOfCbol

    return SnDictOfCbol
    function SnDictOfCbol() {
        /**
         * TODO:
         * @param {{sn:string,isOld:boolean}} param 
         * @returns {Promise<DataOfDictOfFhl>}
         */
        this.queryAsync = function (param) {
            const isRD = isRDLocation()
            // /json/sd.php?N=1&k=0128&gb=1
            let val = "?N=" + (param.isOld ? "1" : "0")
            val += "&k=" + param.sn
            val += "&gb=0"
            let url = "/json/sd.php" + val
            if (isRD == false) {
                return new Promise((res, rej) => {
                    $.ajax({
                        url: url,
                        error: er => {
                            console.error(er);
                            rej(er)
                        },
                        success: reStr => {
                            
                            res(reStr) // sd.php 回傳本來就是一個 json 物件，所以不要再用 JSON.parse
                        },
                    })
                })
            } else {
                // 如果 127.0.0.1:5600 有開著，就使用這個作為 proxy
                return new Promise((res, rej) =>{
                    $.ajax({
                        url: `http://127.0.0.1:5600/json/sd.php${val}`,
                        timeout: 1000,
                        error: er => {
                            console.warn("可以開啟 python flask 作的 proxy.");
                            try {
                                // 嘗試使用 virtual data
                                gVirtualData().then(re => res(re))                               
                            } catch (error) {
                                rej(er);
                                
                            }
                        },
                        success: reStr => {
                            res(reStr);
                        },
                    });
                })

            }

            /**
             * 
             * @returns {Promise<DataOfDictOfFhl>}
             */
            function gVirtualData() {
                let virtual_json_path = param.isOld ? "./index/sd_virtual_old.json" : "./index/sd_virtual_new.json"
                return new Promise((res, rej) => {
                    $.ajax({
                        url: virtual_json_path,
                        success: re => res(re),
                        error: er => rej(er)
                    })
                })
            }            
        }
        /**
         * TODO:
         * @param {DataOfDictOfFhl} dataOfFhl 
         * @returns {DText[]}
         */
        this.cvtToDTexts = function (dataOfFhl) {
            let strCht = dataOfFhl.record[0].dic_text
            let strEn = dataOfFhl.record[0].edic_text

            let ch = cbolflow(strCht)
            let en = cbolflow(strEn)
            return Enumerable.from(ch).concat([{ isBr: 1 },{ isHr: 1 }]).concat(en).toArray()
            return [{ w: dataOfFhl.record[0].dic_text }]
            throw new Error("not implement yet. cvtToDTexts")
        }
    }
}
function cbolflowEs6Js() {
    let splitReference = splitReferenceEs6Js()
    let splitBrOne = splitBrOneEs6Js()

    return cbolflow
    /**
     * 轉換成 DTexts of 原文字典 of cbol
     * @param {string} str aaa.record[0].dic_text
     * @param {?1} isEng aaa.record[0].edic_text 時，會是英文
     * @returns {DText[]}
     */
    function cbolflow(str, isEng) {
        let r1 = splitBrOne(str)

        // 通常會有 3 組 換行換行 (cbol 字典，前面幾個，不會有 reference，因為 「欽定本 - Adamah 1; 1」這些字眼，會導致誤判)
        let r2a = findIdxOr3NewLineNewLine(r1)

        /** @type {DText[]} */
        let r2 = r2a == -1 ? splitReference(r1) : splitWhen3NewLineExist(r2a, r1)

        return r2

        /**
         * -1 若找不到。 3，表示 包含 [3] 之後要處理 splitReference
         * @param {DText[]} dtexts 
         * @returns {number}
         */
        function findIdxOr3NewLineNewLine(dtexts) {
            let idx = -1
            let cnt = 0
            for (let i = 0; i < dtexts.length - 1; i++) {
                if (cnt >= 3) {
                    idx = i
                    break
                }
                const it = dtexts[i];
                const it2 = dtexts[i + 1];
                if (it.isBr == 1 && it2.isBr == 1) {
                    ++cnt
                    ++i // 這裡 +1 , 等下還有 i++, 共加2
                }
            }
            return idx
        }
        /**
         * 
         * @param {number} idx 
         * @param {DText[]} dtexts 
         * @returns {DText[]}
         */
        function splitWhen3NewLineExist(idx, dtexts) {
            let r1a = Enumerable.from(dtexts).take(idx)
            let r2a = Enumerable.from(dtexts).skip(idx).toArray()
            let r2b = splitReference(r2a)
            return r1a.concat(Enumerable.from(r2b)).toArray()
        }
    }
}
function splitBrOneEs6Js() {
    let splitStringByRegex = splitStringByRegexEs6Js()

    return splitBrOne

    /**
     * @param {DText[]|string} data 
     * @returns {DText[]}
     */
    function splitBrOne(data) {
        if (Array.isArray(data) == false) {
            // assert data is string
            return splitBrOne([{ w: data }])
        }

        let re = []
        for (const it of data) {
            if (it.tpContainer == null) {
                let r2 = splitStringByRegex(it.w, /\r?\n/g)
                if (r2 == null) { // 沒有任何符合
                    re.push(it)
                } else {
                    for (const it2 of r2) {
                        if (it2.exec == null) {
                            re.push({ w: it2.w })
                        } else {
                            re.push({ isBr: 1 })
                        }
                    }
                }
            } else {
                let r3 = splitBrOne(it.children)
                it.children = r3
                re.push(it)
            }
        }
        return re
    }
}
function splitBtwEs6Js() {
    let matchGlobalWithCapture = matchGlobalWithCaptureEs6Js()

    return splitBtw
    /**
     * @param {string} str 
     * @param {{reg1:()=>RegExp,reg2:()=>RegExp}} regs 
     * @returns {DText[]|null}
     */
    function splitBtw(str, regs) {

        // 0,3,s ... 6.3.e "abc345cba"
        // 1,3,s ... 7,3,e "0abc456cba",
        // 1,3,s ... 7,3,e
        // 1,3,s ... 6,3,s ... 11,3,e ... 17,3,s ... 22,3,e ... 28,3,e "0abc45abc90cba456abc01cba567cba1"
        // 
        // 7,3,e
        // 1,3,s ... 6,3,e ... 12,3,s ... 18,3,e "0abc45cba901abc567cba"
        // 1,3,s ... 4,3,s ... 9,3,e ... 13,3,e "0abcabc78cbacba"
        let pos = findDPos()
        if (pos == null || pos.length == 0) { return null }
        // console.log(pos);

        let pairs = findPair(pos)
        // console.log(pairs);
        if (pairs == null || pairs.length == 0) { return null }

        return generateDText(pairs)

        /** @returns {DPos[]} */
        function findDPos() {
            let reg1 = regs.reg1()
            let reg2 = regs.reg2()

            let r1 = matchGlobalWithCapture(reg1, str).map(a1 => {
                return {
                    i: a1.index,
                    cnt: a1[0].length,
                    tp: 0
                }
            })

            if (r1.length == 0) { return null }
            let r2 = matchGlobalWithCapture(reg2, str).map(a1 => {
                return {
                    i: a1.index,
                    cnt: a1[0].length,
                    tp: 1
                }
            })

            return Enumerable.from(r1).concat(r2).orderBy(a1 => a1.i).toArray()
        }

        /** 
         * @param {DPos[]} pos
         * @param {DPair?} parent
         * @returns {DPair[]} */
        function findPair(pos, parent) {
            let is = -1
            let ie = -1
            let cnt = 0 // 為避免 tp=1時，就以為找到一對了，但其實是下一層的結尾，所以需要這個變數
            /** @type {DPair[]} */
            let re = []

            for (let i = 0; i < pos.length; i++) {
                const it = pos[i];
                if (it.tp == 0) { cnt = cnt + 1 }
                if (it.tp == 1 && cnt > 0) { cnt = cnt - 1 }

                if (is == -1) {
                    if (it.tp == 0) {
                        is = i
                    }
                } else if (ie == -1 && cnt == 0) {
                    ie = i
                    /** @type {DPair} */
                    let one = { s: pos[is], e: pos[ie] }
                    if (parent != undefined) { one.p = parent }

                    if (ie != is + 1) { // 有 children

                        let pos2 = Enumerable.range(is + 1, ie - is - 1).select(i2 => pos[i2]).toArray()
                        let children = findPair(pos2, one)
                        if (children != null) one.children = children
                    }
                    re.push(one)

                    is = -1 // reset 下一組
                    ie = -1
                }
            }

            if (re.length == 0) { return null }
            return re
        }

        /** 
         * @param {DPair[]} pairs
         * @returns {DText[]} */
        function generateDText(pairs) {
            /** @type {DText[]} */
            let re = []
            // 0,3,s ... 6.3.e "abc345cba"
            // 1,3,s ... 6,3,s ... 11,3,e ... 17,3,s ... 22,3,e ... 28,3,e "0abc45abc90cba456abc01cba567cba1"
            // 1,3,s ... 6,3,e ... 12,3,s ... 18,3,e "0abc45cba901abc567cba"
            // 1,3,s ... 4,3,s ... 9,3,e ... 13,3,e "0abcabc78cbacba"
            for (let i = 0; i < pairs.length; i++) {
                const it = pairs[i];
                if (i == 0) {
                    if (it.p == undefined) {
                        let w = str.substring(0, it.s.i)
                        if (w.length > 0)
                            re.push({ w: w })
                    } else {
                        let w = str.substring(it.p.s.i + it.p.s.cnt, it.s.i)
                        if (w.length > 0)
                            re.push({ w: w })
                    }
                }


                {
                    let one = {}

                    let w = str.substring(it.s.i, it.s.i + it.s.cnt)
                    let w2 = str.substring(it.e.i, it.e.i + it.e.cnt)
                    one.w = w
                    one.w2 = w2
                    one.tpContainer = w

                    if (it.children == undefined) {
                        let w = str.substring(it.s.i + it.s.cnt, it.e.i)
                        one.children = [{ w: w }]
                    } else {
                        let re2 = generateDText(it.children)
                        one.children = re2
                    }

                    re.push(one)
                }

                // 與上一個 end
                if (i != pairs.length - 1) {
                    // // 1,3,s ... 6,3,e ... 12,3,s ... 18,3,e "0abc45cba901abc567cba"
                    // 就是中間 6,3,e ~ 12,3,s
                    let itn = pairs[i + 1] // n: next
                    let w = str.substring(it.e.i + it.e.cnt, itn.s.i)
                    if (w.length != 0) {
                        re.push({ w: w })
                    }
                }

                if (i == pairs.length - 1) {
                    // 0,3,s ... 6.3.e "abc345cba"
                    // 1,3,s ... 6,3,s ... 11,3,e ... 17,3,s ... 22,3,e ... 28,3,e "0abc45abc90cba456abc01cba567cba1"
                    // 1,3,s ... 6,3,e ... 12,3,s ... 18,3,e "0abc45cba901abc567cba"
                    // 1,3,s ... 4,3,s ... 9,3,e ... 13,3,e "0abcabc78cbacba"
                    if (it.p == undefined) {
                        let w = str.substring(it.e.i + it.e.cnt)
                        if (w.length != 0) {
                            re.push({ w: w })
                        }
                    } else {
                        let w = str.substring(it.e.i + it.e.cnt, it.p.e.i)
                        if (w.length != 0)
                            re.push({ w: w })
                    }
                }
            }

            return re
        }
    }
    /**
     * @interface DPos
     */
    function DPos() {
        /** @type {number} */
        this.i
        /** @type {number} */
        this.cnt
        /** @type {0|1} */
        this.tp
    }
    function DPair() {
        /** @type {DPos} */
        this.s
        /** @type {DPos} */
        this.e
        /** @type {DPair[]} */
        this.children
        /** @type {DPair} */
        this.p
    }
}
function matchGlobalWithCaptureEs6Js() {
    return matchGlobalWithCapture
    /** 
     * js global 的 exec 我覺得不直覺，所以寫一個 exec global 版的
     * @param {RegExp} reg reg 若非 global 會自動變為 global, 但我不能幫你變, 因為這是唯讀
     * @param {string} str
     * @returns {RegExpExecArray[]}
    */
    function matchGlobalWithCapture(reg, str) {
        if (reg.global == false) {
            throw "reg must global."
        }

        reg.lastIndex = 0 // reset

        var re = []
        /** @type {?RegExpExecArray} **/
        var r1
        while ((r1 = reg.exec(str)) !== null) {
            {
                re.push(r1)
            }
        }

        reg.lastIndex = 0 // reset

        return re
    }
}
function splitStringByRegexEs6Js() {
    let matchGlobalWithCapture = matchGlobalWithCaptureEs6Js()
    return splitStringByRegex
    /**
     * 若沒有符合，回傳 null
     * @param {string} str 
     * @param {RegExp} reg 若不是 global 會自動被設為 global, 否則會無窮迴圈
     * @returns {{w:string, exec?: RegExpExecArray}[]}
     */
    function splitStringByRegex(str, reg) {
        var r1 = matchGlobalWithCapture(reg, str);
        if (r1 == null || r1.length == 0) { return null }

        var data = []; //const data: { w: string; exec?: RegExpExecArray }[] = [];

        if (r1.length === 0) {
            data.push({
                w: str
            });
        } else {
            if (r1[0].index > 0) {
                var w = str.substr(0, r1[0].index);
                data.push({
                    w
                });
            }

            for (let i = 0; i < r1.length; i++) {
                var it = r1[i];
                var len = it[0].length;
                data.push({
                    w: it[0],
                    exec: it
                });

                // tslint:disable-next-line: max-line-length
                var w = (i !== r1.length - 1) ? str.substr(it.index + len, r1[i + 1].index - it.index - len) : str.substr(it.index + len, str.length - it.index - len);
                if (w.length !== 0) {
                    data.push({
                        w
                    });
                }
            }
        }
        return data;
    }
}
// 以下 bundle
function splitReferenceEs6Js() {
    let splitStringByRegex = splitStringByRegexEs6Js()
    let BibleConstantHelper = BibleConstantHelperEs6Js()
    let BibleConstant = BibleConstantEs6Js()

    return splitReference
    /**
     * input 是 string 時，可能會回傳 null，也是原本的核心功能
     * input 是 DText[] 時，一定回傳 DText[]，因為本質應該也是 splitReference 管理，所以重構放在這裡
     * @param {string|DText[]} str 
     * @param {DAddress} addrDefault
     * @returns {?DText[]}
     */
    function splitReference(str, addrDefault) {
        if (Array.isArray(str)) {
            return splitWhenDTextsInput(str, addrDefault)
        } else {
            return splitWhenStringInput(str, addrDefault)
        }
    }

    /**
     * 核心，即原本的 split reference 
     * @param {string} str 
     * @param {DAddress} addrDefault 
     * @returns {?DText[]}
     */
    function splitWhenStringInput(str, addrDefault) {

        let re = findRefernece(str)

        if (re == null) {
            return null
        }

        let re2 = merge(re)
        removeTpf(re2)
        connectPureStringCauseOfTypeFRemove(re2)

        // 將 refs 轉為經節
        addrDefault = makeSureAddrExist(addrDefault)
        let re3 = cvtToDTexts(re2, addrDefault)
        return re3
    }
    /**
     * 原本在 twcbflow 中的，但 cbolflow 也會用，所以抽出來
     * @param {DText[]} dtexts 
     * @param {DAddress} addrDefault 
     * @returns {DText[]}
     */
    function splitWhenDTextsInput(dtexts, addrDefault) {
        // if (dtexts == null ){throw Error("assert data not null.")}

        let re = []
        for (const it of dtexts) {
            if (it.tpContainer != null) {
                let r3 = splitWhenDTextsInput(it.children)
                it.children = r3
                re.push(it)
                continue
            }

            // assert ( it.tpContainer == null )

            if (it.w == null || it.w.length == 0) {
                re.push(it)
                continue
            }

            let r2 = splitWhenStringInput(it.w, addrDefault)
            if (r2 == null) { // 沒有任何符合
                re.push(it)
            } else {
                for (const it2 of r2) {
                    re.push(it2)
                }
            }
        }
        return re
    }
    /**
 * 
 * @param {(DRefs|DText)[]} data 
 * @param {DAddress} addrDefault 
 * @returns 
 */
    function cvtToDTexts(data, addrDefault) {
        /** @type {DText[]} */
        let re = []
        for (let i = 0; i < data.length; i++) {
            const it1 = data[i];
            if (it1.refs == undefined) {
                re.push(it1)
                continue
            }

            let r1 = gDTextRef(it1.refs, addrDefault)
            re.push(r1)
        }
        return re

        /**
         * 
         * @param {DRef[]} refs 
         * @param {DAddress} addrDefault
         * @returns {DText}
         */
        function gDTextRef(refs, addrDefault) {
            let book = addrDefault.book
            let chap = addrDefault.chap

            /** @type {DAddress[]} */
            let reAddr = []
            let appendAddrs = (addrs) => {
                reAddr.push.apply(reAddr, addrs) // fast append
            }
            let w = ""

            /**
             * 
             * @param {string} str
             * @param {RegExp} reg 
             * @param {number} cnt exec[1] exec[2] 就是傳入 2個
             * @returns {number[]|null}
             */
            let fnExecToIntOrNull = (str, reg, cnt) => {
                let exec = reg.exec(str)
                if (exec == null) { return null }
                return Enumerable.range(1, cnt).select(i => parseInt(exec[i])).toArray() // ps: params
            }

            for (let i = 0; i < refs.length; i++) {
                const it = refs[i];
                w += it.w

                if (it.book != undefined) book = it.book

                if (it.tp == 'a') {
                    let ps = fnExecToIntOrNull(it.descExcludeBook, /(\d+):(\d+)-(\d+):(\d+)/, 4)
                    let re = BibleConstantHelper.generateAddressesTpA(book, ps[0], ps[1], ps[2], ps[3])
                    appendAddrs(re)
                    chap = ps[3]
                } else if (it.tp == 'b') {
                    let ps = fnExecToIntOrNull(it.descExcludeBook, /(\d+):(\d+)/, 2)
                    let re = BibleConstantHelper.generateAddressesTpB(book, ps[0], ps[1])
                    appendAddrs(re)
                    chap = ps[0]
                } else if (it.tp == 'c' || it.tp == 'd') {
                    // d 的作法剛好可以與 c 相同
                    let r1 = /(\d+):([\d\-,]+)/.exec(it.descExcludeBook)
                    chap = parseInt(r1[1])

                    let r2 = splitStringByRegex(r1[2], /,/g)
                    if (r2 == null) { r2 = [{ w: r1[2] }] }

                    let r3 = [] // verses 12-15 18 19-31
                    Enumerable.from(r2).where(a1 => a1.exec == undefined).forEach(a1 => {
                        let r4 = fnExecToIntOrNull(a1.w, /(\d+)-(\d+)/, 2)
                        if (r4 == null) {
                            r3.push({ book: book, chap: chap, verse: parseInt(a1.w) })
                        } else {
                            r3.push.apply(r3, BibleConstantHelper.generateAddressesTpE(book, chap, r4[0], r4[1]))
                        }
                    })
                    appendAddrs(r3)
                } else if (it.tp == 'e') {
                    let ps = fnExecToIntOrNull(it.descExcludeBook, /(\d+)-(\d+)/, 2)
                    let addrs = BibleConstantHelper.generateAddressesTpE(book, chap, ps[0], ps[1])
                    appendAddrs(addrs)
                } else if (it.tp == 'f') {
                    let addrs = BibleConstantHelper.generateAddressesTpF(book, parseInt(it.descExcludeBook))
                    appendAddrs(addrs)
                }
            }

            return { w: w, refAddresses: reAddr }
        }
    }

    /**
     * 
     * @param {DAddress} addrDefault 
     * @returns {DAddress}
     */
    function makeSureAddrExist(addrDefault) {
        if (addrDefault == undefined) {
            addrDefault = { book: 1, chap: 1, verse: 1 }
        } else {
            if (addrDefault.book == undefined) { addrDefault.book = 1 }
            if (addrDefault.chap == undefined) { addrDefault.chap = 1 }
        }
        return addrDefault
    }
    /**
     * '殘忍 2 #約12:21|' 的 2 會被誤判為 reference，因為曾考慮 約2，表示第2章。有了這個，會把純數字誤判轉為純文字。
     * @param {(DText|DRefs)[]} data 
     */
    function removeTpf(data) {
        // 去除 type f 而把純數字誤判為 ref 的東西。例如 殘忍 2 #約12:21| ，其實2不是 reference，凡「純數字」並沒有「約一」這些book字眼，則要轉換為 {w} 純文字的 DText

        for (let i = 0; i < data.length; i++) {
            const it = data[i];
            if (it.refs == undefined) { continue }

            let isInsertNew = false // while true 過程，可能會插入資料在 i 之前
            // assert it refs [ ] exist
            while (true) {
                if (it.refs.length == 0) {
                    break;
                }

                // 如果第1個是，則與「上一個 w」結合。上一個可能是refs exist嗎？可能，上一個若有 | 作為結尾。
                /** @type {DRef} */
                const it2 = it.refs[0]
                if (it2.tp != 'f' || it2.book != undefined) {
                    break // break while true
                }

                // 下面共用的函式
                let insertNewDTextWAndDeleteTypeF = () => {
                    data.splice(i, 0, { w: it2.descExcludeBook })
                    it.refs.splice(0, 1)
                    isInsertNew = true
                }


                if (i == 0) { // 2出現在句子第1組
                    insertNewDTextWAndDeleteTypeF()
                } else {
                    // assert i != 0
                    if (data[i - 1].refs != undefined) { // 前一組不是 {w:} ，所以無法合併。但又是 refs. (可能是 | 結尾)。因此要新增一個 {w}
                        insertNewDTextWAndDeleteTypeF()
                    } else if (data[i - 1].w != undefined) {
                        data[i - 1].w = data[i - 1].w + it2.descExcludeBook
                        it.refs.splice(0, 1)
                    } else {
                        // 其它狀況，其實也是新增一個 {w}
                        insertNewDTextWAndDeleteTypeF()
                    }
                }
            }

            if (it.refs.length == 0) {
                // 因為移動，最後變成這個不再有資料時
                if (isInsertNew) {
                    data.splice(i + 1, 1)
                } else {
                    data.splice(i, 1)
                }
                i--
            } else {
                if (isInsertNew) {
                    i--
                }
            }
        }
    }
    /**
     * '殘忍 2 失望 #約12:21|' 若沒這個，會變為 '殘忍 2' '失望' '#約12:21|' 三組。有了這個，就會變為 '殘忍 2失望' '#約12:21|' 兩組。
     * @param {(DText|DRefs)[]} data 
     */
    function connectPureStringCauseOfTypeFRemove(data) {
        // merge pure w ... 因為上一步，去除 f type 而造成的，例如， 殘忍 2 失望 #約12:21|。若沒有這個，會變為 殘忍 2、失望、#約12:21| 3個部分，但是，經過這段處理，會變為 殘忍 2 失望、#約12:21| 2個部分。
        for (let i = 0; i < data.length; i++) {
            if (i == 0) { continue }
            if (data[i].w == undefined) { continue }
            if (data[i - 1].w == undefined) { continue }
            data[i - 1].w = data[i - 1].w + data[i].w
            data.splice(i, 1)
            i--
        }
    }
    /**
     * @param {DRef[]} data 
     * @returns 
     */
    function merge(data) {
        if (data == null) { throw Error('assert data is not null.') }

        /** @type {(DText|DRefs)[]} */
        let re = []
        let getReLast = () => re[re.length - 1]
        for (let i = 0; i < data.length; i++) {
            const it = data[i];
            if (it.descExcludeBook == undefined) {
                re.push(it)
            } else {
                // assert( it.desc != null )
                let pushNewRefs = () => {
                    let r1 = new DRefs()
                    r1.refs.push(it)
                    re.push(r1)
                }

                if (i == 0 || data[i - 1].descExcludeBook == undefined) {
                    pushNewRefs()
                } else if (it.isS) {
                    // assert i != 0
                    pushNewRefs()
                } else if (data[i - 1].isE) {
                    // assert i != 0
                    pushNewRefs()
                } else {
                    // assert i != 0
                    // assert it before is ref
                    // assert it is ref
                    getReLast().refs.push(it)
                }
            }
        }
        return re
    }


    /**
     * 最核心，找每個部分，但還沒有merge。
     * @param {string}} str 
     * @returns {DRef[]}
     */
    function findRefernece(str) {
        // https://bible.fhl.net/new/allreadme.html

        // default book:45, chap:2

        // 下面的 abcde 是 regex 中，的 or 順序
        //d 31:12
        //c 31:12-14
        //a 31:12-32:12
        //d 31:12,15,17
        //c 31:12-15,18,19-31
        //f 12 (x) 羅12章？羅2:12節？ … 章
        //f 約12 (v) 約12章
        //e 4-12 4到12節
        //b 31:12-end
        //b 31:12-e
        //d 31:12,15-17,20

        // 這個變數，會有2處共用，1個是分割書卷，1個是原字串
        let r2 = Enumerable.from(BibleConstant.CHINESE_BOOK_ABBREVIATIONS)
            .concat(BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB)
            .concat(BibleConstant.CHINESE_BOOK_NAMES)
            .concat(BibleConstant.CHINESE_BOOK_NAMES_GB)
            .concat(BibleConstant.ENGLISH_BOOK_SHORT_ABBREVIATIONS)
            .concat(BibleConstant.ENGLISH_BOOK_ABBREVIATIONS)
            .concat(BibleConstant.ENGLISH_BOOK_NAMES)
            .distinct().orderByDescending(a1 => a1.length).toArray()
        let r3 = '(' + r2.join('|') + ')' // 書卷名

        // 這是原本的流程
        // 書卷名允許後面1個空白 r3?「 ?」，另外，空白也可能是&nbsp;
        let reg = new RegExp("(#)?" + r3 + "?(?: |&nbsp;)?((\\d+:\\d+-\\d+:\\d+)|(\\d+:\\d+-e(?:nd)?)|(\\d+:\\d+-\\d+[\\d,\\-]*)|(\\d+:\\d+[\\d,-]*)|(\\d+-\\d+)|(\\d+))(;)?(\\|)?", "g")

        //let reg = /#?(?:約|羅)?(\d+:\d+-\d+:\d+|\d+:\d+-e(?:nd)?|\d+:\d+-\d+[\d,\-]*|\d+:\d+[\d,-]*|\d+-\d+|\d+);?\|?/g
        // console.log(reg); // Hint 從上一行，轉為 RegExp ，先 log 後，再copy 裡面的 source。就會把 \d 變為 \\d，這樣才會對。

        // 新增的步驟
        let str2 = splitByBook(str)

        // 使用 doOneBook, 對每一個 字串 處理
        return doEachAndPushToContain()


        /**
         * 
         * @param {{w?:string, exec?:RegExpExecArray}} it 
         * @returns {DRef}
         */
        function toDRef(it) {
            /** @type {DRef} */
            let re = {}
            re.w = it.exec[0]

            if (it.exec[1] != undefined) {
                re.isS = true
            }
            if (it.exec[11] != undefined) {
                re.isE = true
            }
            if (it.exec[10] != undefined) {
                re.isC = true
            }

            if (it.exec[2] != undefined) {
                let bk = BibleConstantHelper.getBookId(it.exec[2].toLocaleLowerCase())
                if (bk != -1) {
                    re.book = bk
                }
            }

            re.descExcludeBook = it.exec[3]

            /** @type {Object.<() => boolean, string>} */
            // let tpDetermine = {}
            // tpDetermine[()=>it.exec[4] != undefined] = 'a'
            // tpDetermine[()=>it.exec[5] != undefined] = 'b'
            // tpDetermine[()=>it.exec[6] != undefined] = 'c'
            // tpDetermine[()=>it.exec[7] != undefined] = 'd'
            // tpDetermine[()=>it.exec[8] != undefined] = 'e'
            // tpDetermine[()=>it.exec[9] != undefined] = 'f'
            let idx = Enumerable.range(0, 6).firstOrDefault(i => it.exec[i + 4] != undefined)
            if (idx != undefined) { re.tp = String.fromCharCode('a'.charCodeAt(0) + idx) }

            return re
        }

        /**
         * 先以書卷名切開，因為面對了，1Ti的1會被前一個用到。
         * @param {string} str 
         * @returns {string[]}
         */
        function splitByBook(str) {
            //let reg2 = new RegExp("#?" + r3 + "\\s*(?:\\d+:\\d+-\\d+-\\d+|\\d+:\\d+-\\d+|\\d+:\\d+|\\d+-\\d+|\\d+)", 'g')
            let reg2 = new RegExp("(#)?" + r3, 'g')
            let rr1 = splitStringByRegex(str, reg2)

            let re2 = []
            if (rr1 == null) {
                re2.push(str) // 原本的值
            } else {
                let w = rr1[0].w
                for (let i = 1; i < rr1.length; i++) {
                    const aa1 = rr1[i];
                    if (aa1.exec == null) {
                        w += aa1.w
                    } else {
                        re2.push(w)
                        w = aa1.w
                    }
                }
                if (w.length != 0) {
                    re2.push(w)
                }
            }
            return re2
        }
        /**
         * 原本的流程，但因為多了 splitByBook，現在要各別字串去處理
         * @param {string} str 
         * @returns {DText[]|null}
         */
        function doOneBook(str) {
            let r1 = splitStringByRegex(str, reg)
            if (r1 == null) {
                return null
            } else {
                /** @type {DRef[]} */
                let re = []
                for (const it of r1) {
                    if (it.exec == null) {
                        re.push({ w: it.w })
                    } else {
                        re.push(toDRef(it))
                    }
                }
                return re
            }
        }
        /**
         * 
         * @returns {DText[]}
         */
        function doEachAndPushToContain() {
            let isAnyFit = false
            let dtexts = []
            const reg3 = /^\s+$/g // 全都是空白字元, 略過
            for (const a1 of str2) {
                let reDtexts = doOneBook(a1)
                if (reDtexts != null) {
                    for (const a2 of reDtexts) {
                        if (a2.w != null && false == reg3.test(a2.w)) {
                            dtexts.push(a2)
                            isAnyFit = true
                        }
                    }
                } else {
                    dtexts.push({ w: a1 })
                }
            }

            return isAnyFit ? dtexts : null
        }
    }
    function DRef() {
        /** @type {number} */
        this.book
        /** @type {'a'|'b'|'c'|string} */
        this.tp
        /** @type {boolean} 表示，有#符號在頭，s: start */
        this.isS
        /** @type {boolean} 表示，有|符號在尾，e: end */
        this.isE
        /** @type {boolean} 表示，有;符號，c: continue */
        this.isC
        /** @type {string} 不包含book名稱的描述 */
        this.descExcludeBook
        /** @type {string} 原始資料 */
        this.w
    }

    function DRefs() {
        /** @type {DRef[]} */
        this.refs = []
    }
}
function BibleConstantHelperEs6Js() {
    let BibleConstant = BibleConstantEs6Js()
    /**
     * 提供許多 static function
     */
    function BibleConstantHelper() { }

    /** @type {Object.<string, number>} */
    BibleConstantHelper._mapName2Id
    /**
     * @returns {Object.<string, number>}
     */
    BibleConstantHelper.getMapName2Id = () => {
        if (BibleConstantHelper._mapName2Id == undefined) {
            BibleConstantHelper._mapName2Id = generate()
        }
        return BibleConstantHelper._mapName2Id

        function generate() {
            let r1 = BibleConstant
            var r2 = [r1.CHINESE_BOOK_NAMES, 
                r1.CHINESE_BOOK_NAMES_GB, 
                r1.CHINESE_BOOK_ABBREVIATIONS, 
                r1.CHINESE_BOOK_ABBREVIATIONS_GB, 
                r1.ENGLISH_BOOK_ABBREVIATIONS, 
                r1.ENGLISH_BOOK_NAMES, 
                r1.ENGLISH_BOOK_SHORT_ABBREVIATIONS];

            /** @type {Object.<string, number>} */
            let r3 = {}
            Enumerable.from(r2).forEach(a2 => {
                Enumerable.from(a2).forEach((a1, i1) => {
                    r3[a1.toLowerCase()] = i1 + 1
                })
            })

            // 特殊中文字 / 別名
            var sp1 = [
                { id: 62, na: ['約壹', '约壹', '約翰壹書', '约翰壹书', '約翰一書', '约翰一书', '約一', '约一'] },
                { id: 63, na: ['約貳', '约贰', '約翰貳書', '约翰贰书', '約翰二書', '约翰二书', '約二', '约二'] },
                { id: 64, na: ['約參', '约参', '約翰參書', '约翰参书', '約翰三書', '约翰三书', '约三', '約三'] },
            ];
            Enumerable.from(sp1).forEach(a1 => {
                Enumerable.from(a1.na).forEach(a2 => {
                    r3[a2] = a1.id
                })
            })
            return r3
        }
    }

    /**
     * 取得 1-based 的 book id.
     * @param {string} name 若是英文，要小寫
     * @returns 若不存在，回傳-1
     */
    BibleConstantHelper.getBookId = (name) => {

        let r1 = BibleConstantHelper.getMapName2Id()
        let r2 = r1[name]
        return r2 ?? -1
    }


    /**
     * 緣由: 開發 splitReference 時要用到的
     * 4-7 
     * @param {number} book 
     * @param {number} chap 
     * @param {number} verse1 
     * @param {number} verse2 
     * @returns {DAddress[]}
     */
    BibleConstantHelper.generateAddressesTpE = (book, chap, verse1, verse2) => {
        if (verse2 > verse1) {
            return Enumerable.range(verse1, verse2 - verse1 + 1).select(v => ({ book: book, chap: chap, verse: v })).toArray()
        }
        return Enumerable.range(verse2, verse1 - verse2 + 1).select(v => ({ book: book, chap: chap, verse: v })).toArray()
    }
    /**
     * 緣由: 開發 splitReference 時要用到的
     * 2:3-end or 2:3-e
     * @param {number} book 
     * @param {number} chap 
     * @param {number} verse 
     * @returns {DAddress[]}
     */
    BibleConstantHelper.generateAddressesTpB = (book, chap, verse) => {
        const cnt = BibleConstant.COUNT_OF_VERSE[book - 1][chap - 1]
        return Enumerable.range(verse, cnt - verse + 1).select(i => ({ book: book, chap: chap, verse: i })).toArray()
    }

    /**
     * 緣由: 開發 splitReference 時要用到的
     * 約12，整章
     * @param {number}} book 
     * @param {number} chap 
     * @returns {DAddress[]}
     */
    BibleConstantHelper.generateAddressesTpF = (book, chap) => {
        const cnt = BibleConstant.COUNT_OF_VERSE[book - 1][chap - 1]
        return Enumerable.range(1, cnt).select(i => ({ book: book, chap: chap, verse: i })).toArray()
    }

    /**
     * 緣由: 開發 splitReference 時要用到的
     * 2:1-4:4
     * @param {number} book 
     * @param {number} chap1 
     * @param {number} verse1 
     * @param {number} chap2 
     * @param {number} verse2 
     */
    BibleConstantHelper.generateAddressesTpA = (book, chap1, verse1, chap2, verse2) => {
        let re1 = BibleConstantHelper.generateAddressesTpB(book, chap1, verse1)

        let re2 = []
        if (chap2 - chap1 > 1) {
            Enumerable.range(chap1 + 1, chap2 - chap1 - 1).forEach(ch => {
                re2.push.apply(re2, BibleConstantHelper.generateAddressesTpF(book, ch))
            })
        }

        let re3 = BibleConstantHelper.generateAddressesTpE(book, chap2, 1, verse2)
        return re1.concat(re2, re3)
    }

    /**
     * 緣由: 開發 cvtAddrsToRef 時作的。
     * @param {'羅'|'羅馬書'|'罗'|'罗马书'|'romans'|'rom'|'ro'} tp 
     * @returns {string[]}
     */
    BibleConstantHelper.getBookNameArrayWhereTp = (tp) => {
        if (tp == '羅') { return BibleConstant.CHINESE_BOOK_ABBREVIATIONS }
        else if (tp == '罗') { return BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB }
        else if (tp == '羅馬書') { return BibleConstant.CHINESE_BOOK_NAMES }
        else if (tp == '罗马书') { return BibleConstant.CHINESE_BOOK_NAMES_GB }
        else if (tp == 'romans') { return BibleConstant.ENGLISH_BOOK_NAMES }
        else if (tp == 'rom') { return BibleConstant.ENGLISH_BOOK_ABBREVIATIONS }
        else if (tp == 'ro') { return BibleConstant.ENGLISH_BOOK_SHORT_ABBREVIATIONS }
        return BibleConstant.CHINESE_BOOK_ABBREVIATIONS
    }
    /**
     * 確定要有短名字時，但若沒這個，就會有一小段的 where 處理
     * @param {boolean} isGb 
     * @returns {string[]}
     */
    BibleConstantHelper.getBookNameArrayChineseShort = (isGb) => {
        return isGb ? BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB : BibleConstant.CHINESE_BOOK_ABBREVIATIONS
    }
    /**
     * 相對於 getBookNameArrayChineseShort，這個是完整名字
     * @param {boolean} isGb 
     * @returns {string[]}
     */
    BibleConstantHelper.getBookNameArrayChineseFull = (isGb) => {
        return isGb ? BibleConstant.CHINESE_BOOK_NAMES_GB : BibleConstant.CHINESE_BOOK_NAMES
    }
    /**
     * api 常用的 engs 就是 'rom' 這種 type，而不是 ro 也不是 romans
     * @returns {string[]}
     */
    BibleConstantHelper.getBookNameArrayEnglishNormal = () => {
        return BibleConstant.ENGLISH_BOOK_ABBREVIATIONS
    }

    /**
     * 取得 verses, 裡面沒有作任何保護, 因為覺得這是外面介面要作的.
     * @param {number} book 1-based, book id
     * @param {number} chap 1-based, chap
     * @returns {number}
     */
    BibleConstantHelper.getCountVerseOfChap = (book, chap) => {
        let r1 = BibleConstant.COUNT_OF_VERSE
        return r1[book - 1][chap - 1]
    }

    return BibleConstantHelper
}
function BibleConstantEs6Js() {

    /**
     * @namespace BibleConstant
     */
    function BibleConstant() { }
    /** @const {string[]} 零', '一', '二'... */
    BibleConstant.CHINESE_NUMBERS = [
        '零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', '三十',
        '三十一', '三十二', '三十三', '三十四', '三十五', '三十六', '三十七', '三十八', '三十九', '四十',
        '四十一', '四十二', '四十三', '四十四', '四十五', '四十六', '四十七', '四十八', '四十九', '五十',
        '五十一', '五十二', '五十三', '五十四', '五十五', '五十六', '五十七', '五十八', '五十九', '六十',
        '六十一', '六十二', '六十三', '六十四', '六十五', '六十六', '六十七', '六十八', '六十九', '七十',
        '七十一', '七十二', '七十三', '七十四', '七十五', '七十六', '七十七', '七十八', '七十九', '八十',
        '八十一', '八十二', '八十三', '八十四', '八十五', '八十六', '八十七', '八十八', '八十九', '九十',
        '九十一', '九十二', '九十三', '九十四', '九十五', '九十六', '九十七', '九十八', '九十九', '一百',
        '一百零一', '一百零二', '一百零三', '一百零四', '一百零五', '一百零六', '一百零七', '一百零八', '一百零九', '一百一十',
        '一百一十一', '一百一十二', '一百一十三', '一百一十四', '一百一十五', '一百一十六', '一百一十七', '一百一十八', '一百一十九', '一百二十',
        '一百二十一', '一百二十二', '一百二十三', '一百二十四', '一百二十五', '一百二十六', '一百二十七', '一百二十八', '一百二十九', '一百三十',
        '一百三十一', '一百三十二', '一百三十三', '一百三十四', '一百三十五', '一百三十六', '一百三十七', '一百三十八', '一百三十九', '一百四十',
        '一百四十一', '一百四十二', '一百四十三', '一百四十四', '一百四十五', '一百四十六', '一百四十七', '一百四十八', '一百四十九', '一百五十'
    ];
    /** @const {string[]} '創', '出', '利'... */
    BibleConstant.CHINESE_BOOK_ABBREVIATIONS = [
        '創', '出', '利', '民', '申',
        '書', '士', '得', '撒上', '撒下', '王上', '王下', '代上', '代下', '拉', '尼', '斯',
        '伯', '詩', '箴', '傳', '歌',
        '賽', '耶', '哀', '結', '但',
        '何', '珥', '摩', '俄', '拿', '彌', '鴻', '哈', '番', '該', '亞', '瑪',
        '太', '可', '路', '約',
        '徒',
        '羅', '林前', '林後', '加', '弗', '腓', '西', '帖前', '帖後', '提前', '提後', '多', '門',
        '來', '雅', '彼前', '彼後', '約一', '約二', '約三', '猶',
        '啟'
    ];
    /** @const {string[]} '创', '出', '利',... */
    BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB = [
        '创', '出', '利', '民', '申',
        '书', '士', '得', '撒上', '撒下', '王上', '王下', '代上', '代下', '拉', '尼', '斯',
        '伯', '诗', '箴', '传', '歌',
        '赛', '耶', '哀', '结', '但',
        '何', '珥', '摩', '俄', '拿', '弥', '鸿', '哈', '番', '该', '亚', '玛',
        '太', '可', '路', '约',
        '徒',
        '罗', '林前', '林后', '加', '弗', '腓', '西', '帖前', '帖后', '提后', '提后', '多', '门',
        '来', '雅', '彼前', '彼后', '约一', '约二', '约三', '犹',
        '启'
    ];
    /** @const {string[]} '創世記', '出埃及記', '利未記', ,... */
    BibleConstant.CHINESE_BOOK_NAMES = [
        '創世記', '出埃及記', '利未記', '民數記', '申命記',
        '約書亞記', '士師記', '路得記', '撒母耳記上', '撒母耳記下', '列王紀上', '列王紀下', '歷代志上', '歷代志下', '以斯拉記', '尼希米記', '以斯帖記',
        '約伯記', '詩篇', '箴言', '傳道書', '雅歌',
        '以賽亞書', '耶利米書', '耶利米哀歌', '以西結書', '但以理書',
        '何西阿書', '約珥書', '阿摩司書', '俄巴底亞書', '約拿書', '彌迦書', '那鴻書', '哈巴谷書', '西番雅書', '哈該書', '撒迦利亞書', '瑪拉基書',
        '馬太福音', '馬可福音', '路加福音', '約翰福音',
        '使徒行傳',
        '羅馬書', '哥林多前書', '哥林多後書', '加拉太書', '以弗所書', '腓立比書', '歌羅西書',
        '帖撒羅尼迦前書', '帖撒羅尼迦後書', '提摩太前書', '提摩太後書', '提多書', '腓利門書',
        '希伯來書', '雅各書', '彼得前書', '彼得後書', '約翰壹書', '約翰貳書', '約翰參書', '猶大書',
        '啟示錄'
    ];

    /** @const {string[]} '创世记', '出埃及记', '利未记',... */
    BibleConstant.CHINESE_BOOK_NAMES_GB = [
        '创世记', '出埃及记', '利未记', '民数记', '申命记',
        '约书亚记', '士师记', '路得记', '撒母耳记上', '撒母耳记下', '列王纪上', '列王纪下', '历代志上', '历代志下', '以斯拉记', '尼希米记', '以斯帖记',
        '约伯记', '诗篇', '箴言', '传道书', '雅歌',
        '以赛亚书', '耶利米书', '耶利米哀歌', '以西结书', '但以理书',
        '何西阿书', '约珥书', '阿摩司书', '俄巴底亚书', '约拿书', '弥迦书', '那鸿书', '哈巴谷书', '西番雅书', '哈该书', '撒迦利亚书', '玛拉基书',
        '马太福音', '马可福音', '路加福音', '约翰福音',
        '使徒行传',
        '罗马书', '哥林多前书', '哥林多后书', '加拉太书', '以弗所书', '腓立比书', '歌罗西书',
        '帖撒罗尼迦前书', '帖撒罗尼迦后书', '提摩太前书', '提摩太后书', '提多书', '腓利门书',
        '希伯来书', '雅各书', '彼得前书', '彼得后书', '约翰壹书', '约翰贰书', '约翰参书', '犹大书',
        '启示录'
    ];


    /** @const {string[]} 'Gen', 'Ex', 'Lev', 'Num'... */
    BibleConstant.ENGLISH_BOOK_ABBREVIATIONS = [
        'Gen', 'Ex', 'Lev', 'Num', 'Deut',
        'Josh', 'Judg', 'Ruth', '1 Sam', '2 Sam',
        '1 Kin', '2 Kin', '1 Chr', '2 Chr', 'Ezra', 'Neh', 'Esth',
        'Job', 'Ps', 'Prov', 'Eccl', 'Song',
        'Is', 'Jer', 'Lam', 'Ezek', 'Dan',
        'Hos', 'Joel', 'Amos', 'Obad', 'Jon', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal',
        'Matt', 'Mark', 'Luke', 'John',
        'Acts',
        'Rom', '1 Cor', '2 Cor', 'Gal', 'Eph', 'Phil', 'Col',
        '1 Thess', '2 Thess', '1 Tim', '2 Tim', 'Titus', 'Philem',
        'Heb', 'James', '1 Pet', '2 Pet', '1 John', '2 John', '3 John', 'Jude',
        'Rev'
    ];
    /** @const {string[]} 'Genesis', 'Exodus', 'Leviticus', ... */
    BibleConstant.ENGLISH_BOOK_NAMES = [
        'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
        'Joshua', 'Judges', 'Ruth', 'First Samuel', 'Second Samuel',
        'First Kings', 'Second Kings', 'First Chronicles', 'Second Chronicles', 'Ezra', 'Nehemiah', 'Esther',
        'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
        'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
        'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
        'Matthew', 'Mark', 'Luke', 'John',
        'Acts',
        'Romans', 'First Corinthians', 'Second Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
        'First Thessalonians', 'Second Thessalonians', 'First Timothy', 'Second Timothy', 'Titus', 'Philemon',
        'Hebrews', 'James', 'First Peter', 'Second Peter', 'First John', 'second John', 'Third John', 'Jude',
        'Revelation'
    ];
    /** @const {string[]} 'Ge', 'Ex', 'Le',... */
    BibleConstant.ENGLISH_BOOK_SHORT_ABBREVIATIONS = [
        'Ge', 'Ex', 'Le', 'Nu', 'De',
        'Jos', 'Jud', 'Ru', '1Sa', '2Sa',
        '1Ki', '2Ki', '1Ch', '2Ch', 'Ezr', 'Ne', 'Es',
        'Job', 'Ps', 'Pr', 'Ec', 'So', 'Isa', 'Jer', 'La', 'Eze', 'Da',
        'Ho', 'Joe', 'Am', 'Ob', 'Jon', 'Mic', 'Na', 'Hab', 'Zep', 'Hag', 'Zec', 'Mal',
        'Mt', 'Mr', 'Lu', 'Joh',
        'Ac',
        'Ro', '1Co', '2Co', 'Ga', 'Eph', 'Php', 'Col',
        '1Th', '2Th', '1Ti', '2Ti', 'Tit', 'Phm',
        'Heb', 'Jas', '1Pe', '2Pe', '1Jo', '2Jo', '3Jo', 'Jude',
        'Re'
    ];
    /** @const {number[]} 50, 40, 27, 36, 34,... */
    BibleConstant.COUNT_OF_CHAP = [
        50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25,
        29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52,
        5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4,
        28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4,
        5, 3, 6, 4, 3, 1, 13, 5,
        5, 3, 5, 1, 1, 1, 22
    ];
    BibleConstant.BOOK_WHERE_1CHAP = [31, 57, 63, 64, 65]
    /** @const {number[][]} 建議用 getCountVerseOfChap(book,chap), 例 太2節數 return COUNT_OF_VERSE[39][1] */
    BibleConstant.COUNT_OF_VERSE = [
        [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
        [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
        [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
        [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13],
        [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12],
        [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33],
        [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25],
        [22, 23, 18, 22],
        [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13],
        [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25],
        [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53],
        [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
        [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
        [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
        [11, 70, 13, 24, 17, 22, 28, 36, 15, 44],
        [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31],
        [22, 23, 15, 17, 14, 14, 10, 17, 32, 3],
        [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17],
        [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6],
        [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31],
        [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14],
        [17, 17, 11, 16, 16, 13, 13, 14],
        [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24],
        [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
        [22, 22, 66, 22, 22],
        [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
        [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13],
        [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9],
        [20, 32, 21],
        [15, 16, 15, 13, 27, 14, 17, 14, 15],
        [21],
        [17, 10, 10, 11],
        [16, 13, 12, 13, 15, 16, 20],
        [15, 13, 19],
        [17, 20, 19],
        [18, 15, 20],
        [15, 23],
        [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
        [14, 17, 18, 6],
        [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
        [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20],
        [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53],
        [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
        [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31],
        [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27],
        [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24],
        [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14],
        [24, 21, 29, 31, 26, 18],
        [23, 22, 21, 32, 33, 24],
        [30, 30, 21, 23],
        [29, 23, 25, 18],
        [10, 20, 13, 18, 28],
        [12, 17, 18],
        [20, 15, 16, 16, 25, 21],
        [18, 26, 17, 22],
        [16, 15, 15],
        [25],
        [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25],
        [27, 26, 18, 17, 20],
        [25, 25, 22, 19, 14],
        [21, 22, 18],
        [10, 29, 24, 21, 21],
        [13],
        [14],
        [25],
        [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21]
    ];

    return BibleConstant

}
function queryDictionaryAndShowAtDialogAsyncEs6Js() {
    const SnDictOfCbol = SnDictOfCbolEs6Js()
    const SnDictOfTwcb = SnDictOfTwcbEs6Js()
    const DialogHtml = DialogHtmlEs6Js()
    const cvtDTextsToHtml = cvtDTextsToHtmlEs6Js()
    const queryReferenceAndShowAtDialogAsync = queryReferenceAndShowAtDialogAsyncEs6Js()

    return queryDictionaryAndShowAtDialogAsync
    /**
     * 開發給 原字Parsing時，點擊原文字，要跳出字典內容
     * @param {{sn:string;isOld:boolean}} jo 
     * @returns {Promise<void>}
     */
    function queryDictionaryAndShowAtDialogAsync(jo) {
        qDataAsync(jo).then(html => {
            let dlg = new DialogHtml()
            dlg.showDialog({
                html: html,
                getTitle: () => "原文字典" + jo.sn,
                registerEventWhenShowed: dlg => {
                    dlg.on('click', '.ref', a1 => {
                        // queryDictionaryAndShowAtDialogAsync({ sn: $(a1.target).attr('data-addrs'), isOld: false })
                        let addrs = JSON.parse($(a1.target).attr('data-addrs'))
                        queryReferenceAndShowAtDialogAsync({ addrs: addrs })

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
}

function queryReferenceAndShowAtDialogAsyncEs6Js() {
    const splitReference = splitReferenceEs6Js() // 經文章節，成為ref
    const qsbAsync = qsbAsyncEs6Js()
    const DialogHtml = DialogHtmlEs6Js()
    const cvtDTextsToHtml = cvtDTextsToHtmlEs6Js()
    const cvtAddrsToRef = cvtAddrsToRefEs6Js()
    const BibleConstant = BibleConstantEs6Js()

    return queryReferenceAndShowAtDialogAsync
    /**
     * 開發給 原字Parsing時，點擊原文字，要跳出字典內容
     * 像串珠功能，就是直接有 addrsDescription, 而非 addrs[]
     * @param {{addrs?:DAddress[];addrsDescription?:string;version?:string;bookDefault?:number}} jo 
     * @returns {Promise<void>}
     */
    function queryReferenceAndShowAtDialogAsync(jo) {
        if (jo.addrs == null && jo.addrsDescription == null ){
            throw new Error("assert .addrs != null || .addrDescription != null")
        }

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
                        queryReferenceAndShowAtDialogAsync({addrs:addrs})
                    })
                }
            })

        })
        return
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
}

function isRDLocationEs6Js() {
    return isRDLocation
    /**
     * 因為有 ajax 有 cross-domain 問題，所以需要虛擬資料
     * 
     * @returns {boolean}
     */
    function isRDLocation() {
        return location.origin === 'file://' || location.hostname === '127.0.0.1' || location.hostname === 'localhost' ;
    }
}
function qsbAsyncEs6Js() {
    let isRDLocation = isRDLocationEs6Js()

    return qsbAsync;
    /**
     * qsb.php 取得交互參照經文
     * @param {DQsbParam} args
     * @returns {Promise<DQsbResult>}
     */
    function qsbAsync(args) {
        makeSureArgsValid();

        return new Promise((res, rej) => {
            $.ajax({
                url: cvtArgsToUrl(),
                success: a1 => {
                    res(a1);
                },
                error: er => {
                    console.error(er);
                }
            });
        });
        function makeSureArgsValid() {
            if (args == null) { args = {}; }

            args.ver = args.ver != null ? args.ver : 'unv';
            args.isGb = args.isGb != null ? args.ver : 0;
            args.isSn = args.isSn != null ? args.isSn : 0;
            args.bookDefault = args.bookDefault != null ? args.bookDefault : 'Ro';

            if (false == Enumerable.from(['unv', 'kjv']).contains(args.ver)) {
                args.isSn = 0;
            }
        }
        function cvtArgsToUrl() {
            var gb = `gb=${(args.isGb === 0 ? '0' : '1')}`;
            var ver = `version=${args.ver}`;
            var strong = `strong=${args.isSn === 1 ? '1' : '0'}`;
            const engs = `engs=${args.bookDefault}`
            var url2 = `?qstr=${args.qstr}&${engs}&${strong}&${gb}&${ver}`;
            return (isRDLocation() ? 'https://bible.fhl.net' : '') + '/json/qsb.php' + url2;
        }
    }
}
function cvtDTextsToHtmlEs6Js() {
    return cvtDTextsToHtml
    /**
 * 開發，是在 dict 的資料轉為 dtexts 後，第2步，要轉為 html 時
 * @param {DText[]} dtexts 
 * @returns {string}
 */
    function cvtDTextsToHtml(dtexts) {
        return cvtDTextsToHtmlRecursive(dtexts)
        return
        /**
         * 
         * @param {DText[]} dtexts 
         * @returns {string}
         */
        function cvtDTextsToHtmlRecursive(dtexts) {
            if (dtexts.length == 0) { return "" }

            let re = ""
            for (let a1 of dtexts) {
                if (a1.tpContainer != null) {
                    let re2 = cvtDTextsToHtmlRecursive(a1.children)

                    if (a1.tpContainer == '<div class="idt">') {
                        re += '<div class="idt">' + re2 + '</div>'
                    } else if (a1.tpContainer == '<span class="bibtext">') {
                        re += '<span class="bibtext">' + re2 + '</span>'
                    } else if (a1.tpContainer == '<span class="exp">') {
                        re += '<span class="exp">' + re2 + '</span>'
                    } else {
                        re += '<div>' + re2 + '</div>'
                    }
                } else {
                    if (a1.isBr == 1) {
                        re += "<br/>"
                    } else if (a1.isHr == 1) {
                        re += "<hr/>"
                    } else if (a1.refAddresses != null) {
                        let tmp = $('<span>', {
                            text: a1.w,
                            class: 'ref',
                        })
                        tmp.attr('data-addrs', JSON.stringify(a1.refAddresses))
                        re += tmp[0].outerHTML
                    } else {
                        re += "<span>" + a1.w + "</span>"
                    }
                }
            }
            return re
        }
    }
}
function cvtAddrsToRefEs6Js() {
    const BibleConstantHelper = BibleConstantHelperEs6Js()
    return cvtAddrsToRef

    /**
     * 緣由:
     * splitReference 的結果，會得到 Address 的集合，但要從這集合轉到 Reference 描述的需求。(去請求qsb.php時，就要用到)。
     * @param {DAddress[]} addrs 
     * @param {'羅'|'羅馬書'|'罗'|'罗马书'|'romans'|'rom'|'ro'} tp
     * @returns {string}
     */
    function cvtAddrsToRef(addrs, tp) {
        let r1 = Enumerable.from(addrs).groupBy(a1 => a1.book).select(a1 => getName(a1.key(), tp) + oneBookExcludeName(a1.toArray(), a1.key())).toArray()
        return r1.join(";")

        function getName(book) {
            return BibleConstantHelper.getBookNameArrayWhereTp(tp)[book - 1]
        }
    }
    /**
     * @param {DAddress[]} addrs 
     * @param {number} book 卷書id. 後來發現需要, 於 step3, 因為要知道哪卷書,才能知道「目前章，的節數目」，才能判斷是不是連續
     * @returns {string}
     */
    function oneBookExcludeName(addrs, book) {
        // addrs 目前是同 book 
        // 直覺，是分章，再分連續的節
        // 但，若章連續，又要合起來
        // 簡易版，只要不是全章，就不連續章
        // 31:23-32:12，就會變成31:23-55;32-1-12 這樣又很爛 ... 改為，不是全章，但各章，只能有一組時，就可能連
        // 所以 31:23-32:12;33:23-12 就會維持原樣
        // 31:23-32:4;32:6-8 就會變成 31:23-55;32:4,6-8

        // 預計，中繼會變成這樣
        // 31:[23-55] 32:[1-12]
        // 31:[23-55] 32:[4, 6-8]

        // step: 變成 [{chap:31, verses:[23,24,25,26,27,28,...55]},{chap:32, verses:[...]}]
        let r1 = Enumerable.from(addrs).groupBy(a1 => a1.chap).select(a1 => ({
            chap: a1.key(),
            verses: a1.select(a2 => a2.verse).distinct().orderBy(a2 => a2).toArray()
        })
        ).toArray()
        // console.log(r1);

        // step: 變成 [{"chap":31,"verses":[{"s":30,"e":55}]},{"chap":32,"verses":[{"s":1,"e":32}]},{"chap":33,"verses":[{"s":1,"e":4},{"s":7,"e":8}]}]
        let r2 = Enumerable.from(r1).select(a1 => step2(a1)).toArray()
        // console.log(JSON.stringify(r2));

        // step: 哪些chap要合, (31),(32,33) or (31,33) or (31,32) (33)
        let r3 = step3(r2, book)
        // console.log(JSON.stringify(r3));

        // step: [31,32] 就要合成為 31:30-32:32 [33] 就要變為 33:1-4,7-8
        let r4 = step4(r3, r2)
        // console.log(r4);

        return r4
        /**
         * 
         * @param {number[][]} reStep3 
         * @param {DOneChap[]} reStep2 
         */
        function step4(reStep3, reStep2) {
            // 非必要，只是為提高效率。 因為，一直用到  Enumerable.from(reStep2).first(a1=>a1.chap == chaps[0])
            let map = Enumerable.from(reStep2).toDictionary(a1 => a1.chap)

            return Enumerable.from(reStep3).select(chaps => {
                let r1 = map.get(chaps[0])
                if (chaps.length >= 2) {
                    let r2 = map.get(chaps[chaps.length - 1])
                    return r1.chap + ":" + r1.verses[0].s + "-" + r2.chap + ":" + r2.verses[0].e
                } else {
                    let r3 = Enumerable.from(r1.verses).select(a2 => {
                        if (a2.e == undefined || a2.e == a2.s) {
                            return a2.s
                        } else {
                            return a2.s + "-" + a2.e
                        }
                    }).toArray().join(",")
                    return r1.chap + ":" + r3
                }
            }).toArray().join(";")
        }
        /**
         * 
         * @param {DOneChap[]} oneChaps
         * @returns {number[][]} 
         */
        function step3(oneChaps, book) {
            /** @type {number[][]} */
            let re = []

            // 我，已經在別章？此章有多章嗎？下一章，是多章嗎？下一章，是下一章嗎？節，有連續嗎？
            let alreadys = new Set()
            let fnAlreadyAndAutoAdd = ch => {
                let r1 = alreadys.has(ch)
                if (r1 == false) {
                    alreadys.add(ch)
                }
                return r1
            }
            let fnIsThisChapOnlyOneAndNextOnlyOneAndContinueChap = i => {
                if (oneChaps[i].verses.length != 1) { return false; }
                if (i == oneChaps.length - 1) { return false; } // 最後一個，就沒有
                // console.log(oneChaps[i].verses.length + " " + oneChaps[i+1].verses.length);
                if (oneChaps[i + 1].verses.length != 1) { return false; }
                if (oneChaps[i + 1].chap != oneChaps[i].chap + 1) { return false; }
                return true;
            }
            let fnIsContinueVerses = i => {
                // assert true == fnIsThisChapOnlyOneAndNextOnlyOneAndContinueChap
                // 因上式, assert r1.verse.length == 1
                if (oneChaps[i + 1].verses[0].s != 1) { return false; }

                let r1 = oneChaps[i]
                let r2 = BibleConstantHelper.getCountVerseOfChap(book, r1.chap)
                if (r1.verses[0].e != r2) { return false; }
                return true
            }

            // 是。例31是，(假設34章不是)，那麼回傳 [31,32,33]
            let fnGetChapsCoutinued = i => {
                // true == fnIsThisChapOnlyOneAndNextOnlyOneAndContinueChap(i2) && fnIsContinueVerses(i2)
                let re = [oneChaps[i].chap, oneChaps[i + 1].chap]

                for (let i2 = i + 1; i2 < oneChaps.length; i2++) {
                    if (fnIsThisChapOnlyOneAndNextOnlyOneAndContinueChap(i2) && fnIsContinueVerses(i2)) {
                        re.push(oneChaps[i2 + 1].chap)
                    } else {
                        break
                    }
                }
                return re
            }



            // [] -> [31] -> [31,32] -> [31,32,33]
            for (let i = 0; i < oneChaps.length; i++) {
                if (fnAlreadyAndAutoAdd(oneChaps[i].chap)) {
                    continue
                }
                // console.log(JSON.stringify(re));
                if (fnIsThisChapOnlyOneAndNextOnlyOneAndContinueChap(i) && fnIsContinueVerses(i)) {
                    let chaps = fnGetChapsCoutinued(i)
                    for (const ch of chaps) { alreadys.add(ch) } // 上面 already 就會略過
                    re.push(chaps)
                } else {
                    re.push([oneChaps[i].chap])
                }
            }

            return re
        }
        /**
         * 
         * @param {{chap:number, verses:number[]}} aa1 
         * @returns {DOneChap[]}}
         */
        function step2(aa1) {
            if (aa1.verses.length == 1) {
                let r2 = aa1.verses[0]
                return { chap: aa1.chap, verses: [{ s: r2, e: r2 }] }
            }

            // 123679
            // 123 67 9 <== 預期結果

            let r1 = aa1.verses
            let r2 = r1[0] // cur // assert aa1.length > 0
            let r3 = r2 // header
            let re = []
            for (let i = 1; i < r1.length; i++) {
                const it = r1[i]; // verse
                if (it == r2 + 1) {
                    r2++
                } else {
                    re.push({ s: r3, e: r2 })
                    r3 = it
                    r2 = it
                }
            }

            // 只有一組，上面的 loop 不會 push 任何一組，所以要加這個
            re.push({ s: r3, e: r2 })

            return { chap: aa1.chap, verses: re }
        }
        function DOneChap() {
            /** @type {number} */
            this.chap = 31
            /**
             * @type {{s:number,e:number}[]}
             */
            this.verses = []
        }
    }
}


function FhlLectureEs6Js(){
    const isRDLocation = isRDLocationEs6Js()
    const qsbAsync = qsbAsyncEs6Js()

    const queryDictionaryAndShowAtDialogAsync = queryDictionaryAndShowAtDialogAsyncEs6Js()
    const queryReferenceAndShowAtDialogAsync = queryReferenceAndShowAtDialogAsyncEs6Js()
    const splitReference = splitReferenceEs6Js()
    

    // 讓別處也能用 dict
    if (window.queryDictionaryAndShowAtDialogAsync == undefined ){
        window.queryDictionaryAndShowAtDialogAsync = queryDictionaryAndShowAtDialogAsync
    }
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
    function get_sn_count(sn, N){
        if (window.sd_cnt == undefined) return -2
        
        let hg = N == 0 ? "greek" : "hebrew"
        let cnt = window.sd_cnt[hg][sn]
        if ( cnt != undefined ){
            return cnt
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
                            let engs = new BibleConstant().ENGLISH_BOOK_ABBREVIATIONS[one.book-1]
                            let chap = one.chap
                            let sec = one.sec
    
                            let endpoint = `/json/qp.php?engs=${engs}&chap=${chap}&sec=${sec}&gb=0`
                            let host = isRDLocation() ? 'https://bible.fhl.net' : ''
                            let url = host + endpoint
                        
                            $.ajax({
                                url,
                                contentType: "application/json",
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
                                        res("找不到資料")
                                    }
                                },
                                error: er => {
                                    res("找不到資料")
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
                            contentType: "application/json",
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
                                    res("找不到資料")
                                }
                            },
                            error: er => {
                                res("找不到資料")
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

                    // 本章 n 次，聖經 n 次。
                    // 聖經出現次數，還沒用到，但快用到                    
                    let cnt_in_bible = get_sn_count(sn, N)
                    // let cnt_in_this_chap = -1
                    // if (ps.sn_stastic != undefined){
                    //     cnt_in_this_chap = ps.sn_stastic[sn] || -1
                    // }
                    // 本章出現次數
                    // 嘗試取得 sn 出數 (同一章，N一定是相同)
                    let cnt_in_this_chap = ps.sn_stastic?.[sn] ?? -1;

                    let span_count = $('<span>').append($('<span>').text(`本章 ${cnt_in_this_chap > -1 ?cnt_in_this_chap:'?'} 次，聖經 ${cnt_in_bible > -1 ?cnt_in_bible:'?'} 次。`))
                    // let span_count = $('<span>').append($('<span>').text(`聖經 ${cnt_in_bible > -1 ?cnt_in_bible:'?'} 次。`))
                    
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
                                .append(span_orig)
                                .append(span_mean)
                                .append(span_parsing)
                                [0].outerHTML
                            )
                            
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
                                            var b3 = id2obj[b1];
                                            var issite = b3.objpath == null || b3.objpath.trim().length == 0 ? false : true;
                                            var isphoto = true; //目前無法判定是不是相片,全都當是 TODO
    
                                            // 再優化部分(能不regex,就略過)
                                            if (ps.ispos && ps.ispho == false && issite == false)
                                                return;//next reg
                                            else if (ps.ispho && ps.ispos == false && isphoto == false)
                                                return;//next reg
    
                                            if (b2.test(str)) {
                                                ischanged = true;
                                                //var strpho = (ps.ispho == false || isphoto == false) ? "" : "<img class='pho'></img>";
                                                var strpho = (ps.ispho == false || isphoto == false) ? "" : "<a target='_blank' href='http://bible.fhl.net/object/sd.php?gb=" + ps.gb + "&LIMIT=" + b1 + "'><img class='pho'></img></a>";
                                                var strsite = (ps.ispos == false || issite == false) ? "" : "<img class='pos'></img>";
    
                                                str = str.replace(b2, "<span class='sobj' sid=" + b1 + "><span>$1</span>" + strsite + strpho + "</span>");
    
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
                                        $.each(id2reg, function (b1, b2) {
                                            var b3 = id2obj[b1];
                                            var issite = b3.objpath == null || b3.objpath.trim().length == 0 ? false : true;
                                            var isphoto = true; //目前無法判定是不是相片,全都當是 TODO
    
                                            // 再優化部分(能不regex,就略過)
                                            if (ps.ispos && ps.ispho == false && issite == false)
                                                return;//next reg
                                            else if (ps.ispho && ps.ispos == false && isphoto == false)
                                                return;//next reg
    
                                            if (b2.test(str)) {
                                                ischanged = true;
                                                //var strpho = (ps.ispho == false || isphoto == false) ? "" : "<img class='pho'></img>";
                                                var strpho = (ps.ispho == false || isphoto == false) ? "" : "<a target='_blank' href='http://bible.fhl.net/object/sd.php?gb=0&LIMIT=" + b1 + "'><img class='pho'></img></a>";
                                                var strsite = (ps.ispos == false || issite == false) ? "" : "<img class='pos'></img>";
    
                                                str = str.replace(b2, "<span class='sobj' sid=" + b1 + "><span>$2</span>" + strsite + strpho + "</span>");
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
                    var div_copyrigh = $('<div id="div_copyright" class="lec copyright"></div>');
                    $('#lecMain').append(div_copyrigh); // 放在 lecMain 才會在最下面. 因為 parent 有設 position 屬性
                    rr = React.createElement(copyright_api.R.frame, { ver: ps.version });
                    ss = React.render(rr, document.getElementById("div_copyright"));  // snow add 2016.01.21(四),
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
                

                
                if ( -1 != ["unv","kjv", "rcuv"].indexOf(bibleVersion) ) {
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
                    ret = ret.replace(/</g, "&lt");
                    ret = ret.replace(/>/g, "&gt");
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
                        isExistBrace = s1 != undefined
                        // 判斷是要用 < > chevrons 還是 ( ) parentheses  
                        isUseParentheses = sAT == 'T' 
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
                    
                    reg1 = /<W([AT]?)([HG])([0-9]+)(a?)>/gi // T是顯示是用小括號，但原始是<>，那是後處理
                    // 有可能有 { } ， 也可能沒有
                    reg2 = new RegExp("{"+reg1.source+"}" + "|" + reg1.source, "gi")
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
                })
    
                testThenDoAsync(() => sem == 0)
                    .then(() => defCbk())
            }
        };
    }
}
