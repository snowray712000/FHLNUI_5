var Ijnjs = gIjnjs()
initPageStateFlow(currentSWVer)
var BibleConstant = declareBibleConstants()
Ijnjs.BibleConstant = BibleConstant
initBookChapDialogAsync().then( a1 => {
    Ijnjs.BookChapDialog = a1
})
var fhl = gFhl()
var abvphp = gAbvphp()
$(function () { abvphp.init_g_bibleversions(); }); // 版本資訊

doNoReadyStep3()

doReadyStep1()
doReadyStep2()

var fhlToolBar = gfhlToolBar()
var help = gHelp()
var helpingPopUp = gHelpingPopUp()
var windowControl = gWindowControl()
var bookSelect = gBookSelect()
var bookSelectPopUp = gBookSelectPopUp()
var bookSelectName = gBookSelectName()
var bookSelectChapter = gBookSelectChapter()
// Left Window 相關
var fhlLeftWindow = gFhlLeftWindow()
var settings = gSettings()
var snSelect = gSnSelect()
var gbSelect = gGbSelect()
var show_mode = gShowMode()
var realTimePopUpSelect = gRealTimePopUpSelect()
var mapTool = gMapTool()
var imageTool = gImageTool()
var fontSizeTool = gFontSizeTool()
var versionSelect = gVersionSelect()
var docEvent = gDocEvent()
var viewHistory = gViewHistory()
var fhlMidWindow = gfhlMidWindow()
var fhlLecture = gfhlLecture()
var fhlMidBottomWindow = gfhlMidBottomWindow()

var fhlInfo = gfhlInfo()
var bibleAudio = gbibleAudio()
var fhlInfoTitle = gfhlInfoTitle()
var fhlInfoContent = gfhlInfoContent()
var parsingPopUp = gparsingPopUp()
var searchTool = gsearchTool()
declareFontSizeToolBase()
doAddUrlChangedEventsAddViewHistoryEventsRemoveHelpTextAddVersionInfosDialog()

loadFhlCssAndAppendToHeadAsync()

// 以下順序隨便

/**
 * @returns {Promise<BookChapDialog>}
 */
function initBookChapDialogAsync() {
    /** 這個是 BookChapDialog class 內部會用的 interface @type {FHL.BookChapDialogDataG} */
    var dataG

    return new Promise((res, rej) => {
        $.ajax({
            url: './libs/ijnjs-ui/BookChapDialog/BookChapDialog.html',
            dataType: 'text',
            success: text => {
                addHtmlToBody(text)
                testThenDoAsync({
                    cbTest: () => FHL != undefined && FHL.BibleConstant != undefined && FHL.BibleConstant.s != undefined,
                }).then(() => {
                    /** @type {FHL.BookChapDialogDataG} */
                    dataG = {
                        get CHINESE_BOOK_NAMES() { return FHL.BibleConstant.s.CHINESE_BOOK_NAMES },
                        get CHINESE_BOOK_NAMES_GB() { return FHL.BibleConstant.s.CHINESE_BOOK_NAMES_GB },
                        get CHINESE_BOOK_ABBREVIATIONS() { return FHL.BibleConstant.s.CHINESE_BOOK_ABBREVIATIONS },
                        get CHINESE_BOOK_ABBREVIATIONS_GB() { return FHL.BibleConstant.s.CHINESE_BOOK_ABBREVIATIONS_GB },
                        get BOOK_WHERE_1CHAP() { return FHL.BibleConstant.s.BOOK_WHERE_1CHAP },

                        getCountChapOfBook: FHL.getCountChapOfBook,
                        gHebrewOrder: () => FHL.BibleConstant.s.ORDER_OF_HEBREW,
                    }
                    testThenDoAsync({
                        cbTest: ()=>$('#book-chap-dialog').length != 0
                    }).then(()=>{
                        BookChapDialog.s = new BookChapDialog()
                        res(BookChapDialog)
                    })
                })

            },
            error: er => rej(er)
        })
    })
    function addHtmlToBody(fileOfBookChapDialogHtml) {
        var r3 = Enumerable.from($(fileOfBookChapDialogHtml)).firstOrDefault(a1 => $(a1).attr("id") == 'book-chap-dialog')
        $(r3.outerHTML).appendTo('body')
    }
    function BookChapDialog() {
        var that = this
        // renderAsync 完成後，會設定此 private 變數
        var dialog$ = $()
        // renderAsync 完成後，會設定此 private 變數
        var contents$ = $()
        this.cbShowed = () => { }
        this.cbHided = () => { }
        /**
         * @param {FHL.BookChapDialogArgs} args 
         */
        this.show = (args) => {
            setArgsDefault()
            dialog$.data('args', args)
            dialog$.dialog('open')
            return
            function setArgsDefault() {
                var argsLast = getLastArgsOrDefault()

                if (args == null) {
                    args = {}
                }
                for (const a1 of ["isFullname", "isHebrewOrder", "book", "chap", "isGb"]) {
                    if (args[a1] == undefined) {
                        args[a1] = argsLast[a1]
                    }
                }
            }
            function getLastArgsOrDefault() {
                /** @type {FHL.BookChapDialogArgs} */
                var args = dialog$.data('args') || {}
                if (args.book == undefined) { args.book = 1 }
                if (args.chap == undefined) { args.chap = 1 }
                if (args.isFullname == undefined) { args.isFullname = false }
                if (args.isGb == undefined) { args.isGb = false }
                if (args.isHebrewOrder == undefined) { args.isHebrewOrder = false }
                return args;
            }
        }
        this.setCBHided = (cb) => {
            this.cbHided = cb
        }
        this.setCBShowed = (cb) => {
            this.cbShowed = cb
        }
        /**
         * @returns {FHL.BookChapDialogArgs}
         */
        this.getArgs = () => dialog$.data('args')
        /**
         * @returns {book:number;chap:number}
         */
        this.getResult = () => dialog$.data('result')

        dialogingDom()
        addWindowSizeChanged()

        return

        function dialogingDom() {
            dialog$ = $('#book-chap-dialog')
            contents$ = dialog$.find('.contents')
            dialog$.dialog({
                autoOpen: false,
                modal: true,
                position: {
                    my: 'center top',
                    at: 'center top',
                },
                open: cbShow
            })

        }
        function addWindowSizeChanged() {

            $(window).on('resize', _.debounce(function (e) {
                if (e.target == window) {
                    var r1 = $(window)
                    var cy = r1.height()
                    var cx = r1.width()
                    // initial 時候呼叫會錯誤
                    dialog$.dialog("option", "maxHeight", cy * 0.95);
                    dialog$.dialog("option", "height", cy * 0.95);
                    dialog$.dialog("option", "maxWidth", cx * 0.95);
                    dialog$.dialog("option", "width", cx * 0.95);
                }
            }, 200))
        }
        function cbShow() {
            updateMaxHeightAsync()

            var args = getArgs()
            /**
             * 這個變數，是用在 按 full-name 時，要自動再按一次最後一個。
             * @type {JQuery<HTMLElement>?}
             */
            var lastClickToolbarItem

            copyArgsToResult()
            addToolbarsClickEvents()
            if (args.isFullname) {
                getToolbarsOptions().eq(4).addClass('active')
            }
            clickAutolyWhenInitial()

            BookChapDialog.s.cbShowed()
            return
            function updateArgs() {
                dialog$.data('args', args)
            }
            function updateMaxHeightAsync() {
                setTimeout(() => {

                    // initial 時候呼叫會錯誤，所以加 timeout
                    var rc = getSize()
                    dialog$.dialog("option", "maxHeight", rc.cy * 1.0);
                    dialog$.dialog("option", "height", rc.cy * 1.0);
                    dialog$.dialog("option", "maxWidth", rc.cx * 0.90);
                    dialog$.dialog("option", "width", rc.cx * 0.90);
                    return
                    function getSize() {
                        var mainWindow$ = $('#mainWindow')
                        if (mainWindow$.length == 0) {
                            mainWindow$ = $(window)
                        }
                        return { cx: mainWindow$.width(), cy: mainWindow$.height() }
                    }
                }, 0);
            }
            function addToolbarsClickEvents() {
                var items = getToolbarsOptions()
                // 每次 open 都會呼叫，若有加事件，要小心不要重複加
                $(items[0]).off('click').on('click', function () {
                    // 舊約
                    $(this).trigger('focus')
                    args.isHebrewOrder = false
                    lastClickToolbarItem = $(this)

                    gBooks().gOldTestmentItems(getResult().book)
                })
                $(items[1]).off('click').on('click', function () {
                    // 新約
                    $(this).trigger('focus')
                    lastClickToolbarItem = $(this)

                    gBooks().gNewTestmentItems(getResult().book)
                })
                $(items[3]).off('click').on('click', function () {
                    // 舊約(希伯來排序)
                    $(this).trigger('focus')
                    args.isHebrewOrder = true
                    lastClickToolbarItem = $(this)

                    gBooks().gOldTestmentHebrewOrderItems(getResult().book)
                })
                $(items[2]).off('click').on('click', function () {
                    // chap
                    $(this).trigger('focus')
                    lastClickToolbarItem = $(this)

                    var r1 = getResult()
                    gChapItems(r1.book, r1.chap)
                })
                $(items[4]).off('click').on('click', function () {
                    // full name
                    var this$ = $(this)
                    switchActiveClassAndArgs()
                    lastClickToolbarItem.trigger('click')

                    return
                    function switchActiveClassAndArgs() {
                        if (this$.hasClass('active')) {
                            this$.removeClass('active')
                            args.isFullname = false
                        } else {
                            this$.addClass('active')
                            args.isFullname = true
                        }
                    }
                })
            }
            // 初始 init click 會用到。(要 click chap 還是書卷)
            // 在 click book 事件也會用到。(若是選到單一書卷的，則直接關閉視窗了，不用選章了)
            function isThisBookOnlyOneChap() {
                return dataG.BOOK_WHERE_1CHAP.includes(getResult().book)
            }

            function clickAutolyWhenInitial() {
                if (isThisBookOnlyOneChap()) {
                    getControlViaArgs().trigger('click')
                } else {
                    getToolbarsOptions().eq(2).trigger('click')
                }
                return

                function getControlViaArgs() {
                    var book = args.book
                    if (book > 39) {
                        return getToolbarsOptions().eq(1)
                    }
                    if (args.isHebrewOrder) {
                        return getToolbarsOptions().eq(3)
                    }
                    return getToolbarsOptions().eq(0)
                }
            }
            function copyArgsToResult() {
                var r = getArgs()
                updateResultBook(r.book)
                updateResultChap(r.chap)
            }
            /**       
             * @returns {FHL.BookChapDialogArgs}
             */
            function getArgs() {
                return dialog$.data('args') || {}
            }
            /**       
             * @returns {{book:number;chap:number}}
             */
            function getResult() {
                return dialog$.data('result') || {}
            }
            function updateResultBook(book) {
                var r = getResult()
                r.book = book
                dialog$.data('result', r)
            }
            function updateResultChap(chap) {
                var r = getResult()
                r.chap = chap
                dialog$.data('result', r)
            }


            function gChapItems(book, act) {
                contents$.empty()
                var cnt = dataG.getCountChapOfBook(book)
                for (var i = 0; i < cnt; ++i) {
                    var r1 = $('<button type="button" class="btn btn-outline-dark"></button>')
                    var bk = i + 1
                    r1.text(bk)
                    r1.data('val', bk)
                    if (bk == act) {
                        r1.addClass('active')
                    }
                    r1.one('click', function () {
                        var val = $(this).data('val')
                        updateResultChap(val)
                        triggerClose()
                    })
                    r1.appendTo(contents$)
                }
            }

            /** 有兩種呼叫，按完「章」之後，或按完「書卷」且這書卷只有一章的時候 */
            function triggerClose() {
                updateArgs()
                dialog$.dialog('close')
                BookChapDialog.s.cbHided()
            }
            function gBooks() {
                return {
                    gNewTestmentItems,
                    gOldTestmentItems,
                    gOldTestmentHebrewOrderItems,
                }
                /**
                 * @returns {string[]}
                 */
                function getBookNames() {
                    if (args.isGb) {
                        return args.isFullname ? dataG.CHINESE_BOOK_NAMES_GB : dataG.CHINESE_BOOK_ABBREVIATIONS_GB
                    } else {
                        return args.isFullname ? dataG.CHINESE_BOOK_NAMES : dataG.CHINESE_BOOK_ABBREVIATIONS
                    }
                }

                function clickChapOptionsOrCloseDialogWhenSelectBookOf1Chap() {
                    if (isThisBookOnlyOneChap()) {
                        updateResultChap(1)
                        triggerClose()
                    } else {
                        getToolbarsOptions().eq(2).trigger('click')
                    }
                }
                function gCore(text, val, actVal) {
                    var r1 = $('<button type="button" class="btn btn-outline-dark" tabindex="-1"></button>')
                    r1.text(text)
                    r1.data('val', val)
                    if (val == actVal) { r1.addClass('active') }
                    r1.one('click', cbCore)
                    return r1
                }
                function cbCore() {
                    var val = $(this).data('val')
                    updateResultBook(val)
                    clickChapOptionsOrCloseDialogWhenSelectBookOf1Chap()
                }
                function gOldTestmentHebrewOrderItems(act) {
                    contents$.empty()
                    var items = getBookNames()
                    var ods = dataG.gHebrewOrder()
                    for (var i = 0; i < 39; i++) {
                        var bk = ods[i]
                        var na = items[bk - 1]
                        var r1 = gCore(na, bk, act)
                        r1.appendTo(contents$)
                    }
                    return
                }
                function gOldTestmentItems(book) {
                    contents$.empty()
                    var items = getBookNames()
                    for (var i = 0; i < 39; i++) {
                        var bk = i + 1
                        var na = items[bk - 1]
                        var r1 = gCore(na, bk, book)
                        r1.appendTo(contents$)
                    }
                }
                function gNewTestmentItems(act) {
                    contents$.empty()
                    var items = getBookNames()
                    for (var i = 0; i < 27; i++) {
                        var bk = i + 40
                        var na = items[bk - 1]
                        var r1 = gCore(na, bk, act)
                        r1.appendTo(contents$)
                    }
                }
            }
            function getToolbarsOptions() {
                return dialog$.find(".toolbar").children()
            }
        }
    }
}

// 這是給 DialogTemplate 搭配用的
function findPrsingTableSnClassAndLetItCanClick(level, container) {
    level = level === undefined ? 0 : level;

    /// <summary> 當 dict-table 建好時, 就可呼叫這個內容 </summary>
    var r1 = container.find('.parsingTableSn');
    for (var it1 of r1) {
        eachDom(it1);
    }

    var r1 = container.find('.reference');
    for (var it1 of r1) {
        eachDomReference(it1);
    }

    function eachDom(it1) {
        var r2 = $(it1);

        eachTheSame(r2);
        var jo = {
            sn: r2.attr('k'),
            isOld: parseInt(r2.attr('n')),
        }
        r2.attr('data-data', JSON.stringify(jo));
    }

    function eachDomReference(it1) {
        var r2 = $(it1);


        eachTheSame(r2);

        var jo = {
            ref: r2.attr('ref'),
            book: parseInt(r2.attr('book')),
            chap: parseInt(r2.attr('chap')),
        }
        r2.attr('data-data', JSON.stringify(jo));
    }

    function eachTheSame(r2) {
        r2.attr('data-toggle', 'modal');
        r2.attr('data-target', '#SnDictDialog' + (level));
        r2.attr('data-level', level);
    }
}
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

function gFhl() {
    /// <reference path="../../jsdoc/jquery.js" />
    /// <reference path="../../jsdoc/linq.d.ts" />
    var fhl = fhl || {};

    // console.log(location); // file://
    var isRDLocation = location.origin === 'file://' || location.hostname === '127.0.0.1' || location.hostname === 'localhost';
    var urlJSON = '/json/';
    var urlAjax = '/ajax/';
    if (isRDLocation === true) {
        urlJSON = 'https://bible.fhl.net/json/';
        urlAjax = 'https://bible.fhl.net/ajax/';
    }

    fhl.isRDLocation = isRDLocation;
    fhl.urlJSON = urlJSON;
    fhl.urlAjax = urlAjax;

    // 定義常用的 json xml 函式 2 個 全域變數 1 個 
    // fhl.xml_api 、 fhl.json_api
    // fhl.g_book_group

    // fhl.xml_api fhl.json_api 函式定義 (這用在 se.php sq.php abv.php 都可以用到)
    fhl.xml_api = function xml_api(url, fncb_success, fncb_error, obj_param, isAsync) {
        if (isAsync == undefined)//default value
            isAsync = true;
        // var root_url = "https://bkbible.fhl.net/ajax/";
        var root_url = fhl.urlAjax;

        var ab_url = root_url + url;
        ab_url = encodeURI(ab_url).replace("#", "%23"); // encodeURI 不會轉換#符號, 手動轉換
        return $.ajax({
            url: ab_url,
            type: "GET",
            dataType: "xml",
            async: isAsync,
            error: function (xml) {
                console.debug("xml api error ...");
                if (fncb_error != null) fncb_error(xml, obj_param);
            },
            success: function (xml) {
                if (fncb_success != null) fncb_success(xml, obj_param);
            }
        });// $.ajax(...);
    };//fhl.xml_api function
    // 小雪 fhl.xml_api fhl.json_api 函式定義 (這用在 se.php sq.php abv.php 都可以用到)
    fhl.json_api = function json_api(url, fncb_success, fncb_error, obj_param, isAsync) {
        if (isAsync == undefined)//default value
            isAsync = true;
        //var root_url = "https://bible.fhl.net/json/";
        var root_url = fhl.urlJSON;
        var ab_url = root_url + url;
        ab_url = encodeURI(ab_url).replace("#", "%23"); // encodeURI 不會轉換#符號, 手動轉換
        return $.ajax({
            url: ab_url,
            type: "GET",
            dataType: "json",
            async: isAsync,
            error: function (json) {
                console.debug("json api error ...");
                if (fncb_error != null) fncb_error(json, obj_param);
            },
            success: function (json) {
                if (fncb_success != null) fncb_success(json, obj_param);
            }
        });// $.ajax(...);
    };//fhl.json_api function

    fhl.xml_api_text = function xml_api(url, fncb_success, fncb_error, obj_param, isAsync) {
        /// <summary> 取fhl的json資料, 但是確是取得最原始資料, 原因是 json 有時候不正確, 還是回傳純文字好了 </summary>
        /// <param type="string" name="url">例如 se.php?q=.... 不用包含全部網址 </param>
        /// <param type="Action&lt;string,T>" name="fncb_success">當API成功，要作什麼事，arg1是回傳的文字，arg2是obj_param傳入的。可傳null表示不作事</param>
        /// <param type="Action&lt;string,T>" name="fncb_error">當API失敗時，要作什麼事，arg1是回傳的文字，arg2是obj_param傳入的。可傳null表示不作事</param>
        /// <param type="Action&lt;T>" name="obj_param">傳入給fnch_success第2個參數。通常是作為存回傳值用的</param>
        /// <param type="bool" name="isAsync" optional="true">true表示主執行緒會繼續執行，false表示主執行緒會等這個api回傳後再繼續。</param>

        if (isAsync == undefined)//default value
            isAsync = true;
        // var root_url = "https://bkbible.fhl.net/ajax/";
        var root_url = fhl.urlAjax;
        var ab_url = root_url + url;
        ab_url = encodeURI(ab_url).replace("#", "%23"); // encodeURI 不會轉換#符號, 手動轉換
        return $.ajax({
            url: ab_url,
            type: "GET",
            dataType: "text",
            async: isAsync,
            error: function (xml) {
                console.debug("xml api error ...");
                if (fncb_error != null) fncb_error(xml, obj_param);
            },
            success: function (xml) {
                if (fncb_success != null) fncb_success(xml, obj_param);
            }
        });// $.ajax(...);
    };//fhl.xml_api_text function
    fhl.json_api_text = function json_api_text(url, fncb_success, fncb_error, obj_param, isAsync) {
        /// <summary> 取fhl的json資料, 但是確是取得最原始資料, 原因是 json 有時候不正確, 還是回傳純文字好了 </summary>
        /// <param type="string" name="url">例如 se.php?q=.... 不用包含全部網址 </param>
        /// <param type="Action&lt;string,T>" name="fncb_success">當API成功，要作什麼事，arg1是回傳的文字，arg2是obj_param傳入的。可傳null表示不作事</param>
        /// <param type="Action&lt;string,T>" name="fncb_error">當API失敗時，要作什麼事，arg1是回傳的文字，arg2是obj_param傳入的。可傳null表示不作事</param>
        /// <param type="Action&lt;T>" name="obj_param">傳入給fnch_success第2個參數。通常是作為存回傳值用的</param>
        /// <param type="bool" name="isAsync" optional="true">true表示主執行緒會繼續執行，false表示主執行緒會等這個api回傳後再繼續。</param>

        if (isAsync == undefined)//default value
            isAsync = true;
        // var root_url = "https://bible.fhl.net/json/";
        var root_url = fhl.urlJSON;
        var ab_url = root_url + url;
        ab_url = encodeURI(ab_url).replace("#", "%23"); // encodeURI 不會轉換#符號, 手動轉換
        return $.ajax({
            url: ab_url,
            type: "GET",
            dataType: "text",
            async: isAsync,
            error: function (jstr) {
                console.debug("xml api error ...");
                if (fncb_error != null) fncb_error(jstr, obj_param);
            },
            success: function (jstr) {
                if (fncb_success != null) fncb_success(jstr, obj_param);
            }
        });// $.ajax(...);
    };//fhl.json_api_text function
    fhl.json_api_text_post = function json_api_text_post(url, data, fncb_success, fncb_error, obj_param, isAsync) {
        /// <summary> 取fhl的json資料, 但是確是取得最原始資料, 原因是 json 有時候不正確, 還是回傳純文字好了 </summary>
        /// <param type="string" name="url">例如 se.php?q=.... 不用包含全部網址 </param>
        /// <param type="Action&lt;string,T>" name="fncb_success">當API成功，要作什麼事，arg1是回傳的文字，arg2是obj_param傳入的。可傳null表示不作事</param>
        /// <param type="Action&lt;string,T>" name="fncb_error">當API失敗時，要作什麼事，arg1是回傳的文字，arg2是obj_param傳入的。可傳null表示不作事</param>
        /// <param type="Action&lt;T>" name="obj_param">傳入給fnch_success第2個參數。通常是作為存回傳值用的</param>
        /// <param type="bool" name="isAsync" optional="true">true表示主執行緒會繼續執行，false表示主執行緒會等這個api回傳後再繼續。</param>

        if (isAsync == undefined)//default value
            isAsync = true;
        // var root_url = "https://bible.fhl.net/json/";
        var root_url = fhl.urlJSON;
        var ab_url = root_url + url;
        ab_url = encodeURI(ab_url).replace("#", "%23"); // encodeURI 不會轉換#符號, 手動轉換
        return $.ajax({
            url: ab_url,
            type: "POST",
            data: data,
            dataType: "text",
            async: isAsync,
            error: function (jstr) {
                console.debug("xml api error ...");
                if (fncb_error != null) fncb_error(jstr, obj_param);
            },
            success: function (jstr) {
                if (fncb_success != null) fncb_success(jstr, obj_param);
            }
        });// $.ajax(...);
    };
    // 小雪 聖經書卷群組(目前用在搜尋功能)...因為覺得是共用的，所以定義在fhl namespace中
    fhl.g_book_group = {
        "整卷聖經": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65],
        "舊約": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
        "新約": [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65],
        "摩西五經": [0, 1, 2, 3, 4],
        "歷史書": [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        "詩歌智慧書": [17, 18, 19, 20, 21],
        "大先知書": [22, 23, 24, 25, 26],
        "小先知書": [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],//若只有先知書，太長了，對切換書卷不方便
        "福音書": [39, 40, 41, 42, 43], // 使徒行傳加到福音書(畢竟是路加寫的下集)
        "保羅書信": [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
        "其它書信": [57, 58, 59, 60, 61, 62, 63, 64, 65] // 希伯來書加在這55
    };

    fhl.xml_tool = {} || fhl.xml_tool;
    // var re1 = var re1 = fhl.xml_tool.parseXml(test_aaa,-1);
    // 因為用 $.ajax() type 為 xml 的時候, 因為內容也會有<00883>, 這就不是成對出現 <00883></00883> 這樣子, ajax會回傳失敗.
    // 因為上面會綠故. 所以特別開發這個. 讓不成對出現的. 略過.
    fhl.xml_tool.parseXml = function parseXml(str, max_deep) {
        if (max_deep == undefined)
            max_deep = -1;
        // 演算法測試資料 : 
        //var test_aaa = "<result><status>success</status><orig>0</orig><key>摩西</key><record_count>7</record_count><record><id>23350</id><chineses>太</chineses><engs>Matt</engs><chap>8</chap><sec>4</sec><bible_text>耶穌對他說：「你切不可告訴人，只要去把身體給祭司察看，獻上摩西所吩咐的禮物，對眾人作證據。」</bible_text></record><record><id>23704</id><chineses>太</chineses><engs>Matt</engs><chap>17</chap><sec>3</sec><bible_text>忽然，有摩西、以利亞向他們顯現，同耶穌說話。</bible_text></record><record><id>23705</id><chineses>太</chineses><engs>Matt</engs><chap>17</chap><sec>4</sec><bible_text>彼得對耶穌說：「主啊，我們在這裡真好！你若願意，我就在這裡搭三座棚，一座為你，一座為摩西，一座為以利亞。」</bible_text></record><record><id>23770</id><chineses>太</chineses><engs>Matt</engs><chap>19</chap><sec>7</sec><bible_text>法利賽人說：「這樣，摩西為甚麼吩咐給妻子休書，就可以休她呢？」</bible_text></record><record><id>23771</id><chineses>太</chineses><engs>Matt</engs><chap>19</chap><sec>8</sec><bible_text>耶穌說：「摩西因為你們的心硬，所以許你們休妻，但起初並不是這樣。</bible_text></record><record><id>23897</id><chineses>太</chineses><engs>Matt</engs><chap>22</chap><sec>24</sec><bible_text>「夫子，摩西說：『人若死了，沒有孩子，他兄弟當娶他的妻，為哥哥生子立後。』</bible_text></record><record><id>23921</id><chineses>太</chineses><engs>Matt</engs><chap>23</chap><sec>2</sec><bible_text>說：「文士和法利賽人坐在摩西的位上，</bible_text></record></result>";
        // var re1 = fhl.xml_tool.parseXml(test_aaa,-1);
        // var re2 = fhl.xml_tool.parseXml(test_aaa,2);

        // <a>aa</a>  ... {a:aa}
        // <a><a>aa</a></a> ... {a:{a:aa}}
        // <a>aa</a><a>bb</a> ... {a:[aa,bb]}
        // <a><b>b</b></a><a>c<a/> ... {a:[{b:b},c]}
        if (max_deep == 0)
            return str;

        var key_array = {};
        var text = undefined;
        var pos4 = -1;
        while (true) {
            var pos1 = str.indexOf("<", pos4 + 1);
            if (pos1 == -1) {
                var laststrlen = str.length - pos4 - 1;
                if (laststrlen != 0)
                    text = str.substr(pos4 + 1, laststrlen);
                break;//break while loop
            }

            var pos2 = str.indexOf(">", pos1);
            if (pos2 == -1) {
                var laststrlen = str.length - pos4 - 1;
                if (laststrlen != 0)
                    text = str.substr(pos4 + 1, laststrlen);
                break;//break while loop
            }
            var strkey = str.substr(pos1 + 1, pos2 - pos1 - 1); //result
            var pos3 = str.indexOf("</" + strkey + ">", pos2 + 1);
            if (pos3 == -1) {
                var laststrlen = str.length - pos4 - 1;
                if (laststrlen != 0)
                    text = str.substr(pos4 + 1, laststrlen);
                break;//break while loop
            }
            var strValue = str.substr(pos2 + 1, pos3 - pos2 - 1);

            if ((strkey in key_array) == false)
                key_array[strkey] = [];
            key_array[strkey].push(strValue);

            pos4 = pos3 + strkey.length + 2;
        }//end while 

        var re1 = Object.keys(key_array);
        if (re1.length == 0 && text == undefined) {
            return null;
        } else if (re1.length == 0 && text != undefined) {
            return text;//pData確定是字串.不是物件
        } else {
            var pData = {}; //pData確定是個物件.不是字串. //要遞迴向下的Case
            for (var x1 in key_array) {
                // x1: aaa key_array[x1]: <a>b</a><a>c><a/>
                if (key_array[x1].length == 1) { //如果 ... aaa:[<b></b>] ... 只有1個 ... aaa[<b></b>,<c></c>]就是有兩個...
                    if (max_deep == -1)
                        pData[x1] = parseXml(key_array[x1][0], -1);
                    else
                        pData[x1] = parseXml(key_array[x1][0], max_deep - 1);
                } else {
                    pData[x1] = [];//雖然還不知道內容,但確定它是個陣列了.
                    var val_array = key_array[x1];
                    for (var x2 in val_array) {
                        if (max_deep == -1)
                            pData[x1].push(parseXml(val_array[x2], -1));
                        else
                            pData[x1].push(parseXml(val_array[x2], max_deep));
                    }
                }
            }
            return pData;
        }//要遞迴向下的Case
        console.debug("impossible here");
        return null;
    };

    // listall.html 
    // [0][0]: Gen [0][1]=Genesis [0][2]=創 [0][3]=創世記 [0][4]=Ge ;
    fhl.g_book_all = JSON.parse('[["Gen","Genesis","創","創世記","Ge"],["Ex","Exodus","出","出埃及記","Ex"],["Lev","Leviticus","利","利未記","Le"],["Num","Numbers","民","民數記","Nu"],["Deut","Deuteronomy","申","申命記","De"],["Josh","Joshua","書","約書亞記","Jos"],["Judg","Judges","士","士師記","Jud"],["Ruth","Ruth","得","路得記","Ru"],["1 Sam","First Samuel","撒上","撒母耳記上","1Sa"],["2 Sam","Second Samuel","撒下","撒母耳記下","2Sa"],["1 Kin","First Kings","王上","列王紀上","1Ki"],["2 Kin","Second Kings","王下","列王紀下","2Ki"],["1 Chr","First Chronicles","代上","歷代志上","1Ch"],["2 Chr","Second Chronicles","代下","歷代志下","2Ch"],["Ezra","Ezra","拉","以斯拉記","Ezr"],["Neh","Nehemiah","尼","尼希米記","Ne"],["Esth","Esther","斯","以斯帖記","Es"],["Job","Job","伯","約伯記","Job"],["Ps","Psalms","詩","詩篇","Ps"],["Prov","Proverbs","箴","箴言","Pr"],["Eccl","Ecclesiastes","傳","傳道書","Ec"],["Song","Song of Solomon","歌","雅歌","So"],["Is","Isaiah","賽","以賽亞書","Isa"],["Jer","Jeremiah","耶","耶利米書","Jer"],["Lam","Lamentations","哀","耶利米哀歌","La"],["Ezek","Ezekiel","結","以西結書","Eze"],["Dan","Daniel","但","但以理書","Da"],["Hos","Hosea","何","何西阿書","Ho"],["Joel","Joel","珥","約珥書","Joe"],["Amos","Amos","摩","阿摩司書","Am"],["Obad","Obadiah","俄","俄巴底亞書","Ob"],["Jon","Jonah","拿","約拿書","Jon"],["Mic","Micah","彌","彌迦書","Mic"],["Nah","Nahum","鴻","那鴻書","Na"],["Hab","Habakkuk","哈","哈巴谷書","Hab"],["Zeph","Zephaniah","番","西番雅書","Zep"],["Hag","Haggai","該","哈該書","Hag"],["Zech","Zechariah","亞","撒迦利亞書","Zec"],["Mal","Malachi","瑪","瑪拉基書","Mal"],["Matt","Matthew","太","馬太福音","Mt"],["Mark","Mark","可","馬可福音","Mr"],["Luke","Luke","路","路加福音","Lu"],["John","John","約","約翰福音","Joh"],["Acts","Acts","徒","使徒行傳","Ac"],["Rom","Romans","羅","羅馬書","Ro"],["1 Cor","First Corinthians","林前","哥林多前書","1Co"],["2 Cor","Second Corinthians","林後","哥林多後書","2Co"],["Gal","Galatians","加","加拉太書","Ga"],["Eph","Ephesians","弗","以弗所書","Eph"],["Phil","Philippians","腓","腓立比書","Php"],["Col","Colossians","西","歌羅西書","Col"],["1 Thess","First Thessalonians","帖前","帖撒羅尼迦前書","1Th"],["2 Thess","Second Thessalonians","帖後","帖撒羅尼迦後書","2Th"],["1 Tim","First Timothy","提前","提摩太前書","1Ti"],["2 Tim","Second Timothy","提後","提摩太後書","2Ti"],["Titus","Titus","多","提多書","Tit"],["Philem","Philemon","門","腓利門書","Phm"],["Heb","Hebrews","來","希伯來書","Heb"],["James","James","雅","雅各書","Jas"],["1 Pet","First Peter","彼前","彼得前書","1Pe"],["2 Pet","Second Peter","彼後","彼得後書","2Pe"],["1 John","First John","約一","約翰一書","1Jo"],["2 John","second John","約二","約翰二書","2Jo"],["3 John","Third John","約三","約翰三書","3Jo"],["Jude","Jude","猶","猶大書","Jude"],["Rev","Revelation","啟","啟示錄","Re"]]');
    fhl.g_book_allGb = JSON.parse('[["Gen","Genesis","创","创世记","Ge"],["Ex","Exodus","出","出埃及记","Ex"],["Lev","Leviticus","利","利未记","Le"],["Num","Numbers","民","民数记","Nu"],["Deut","Deuteronomy","申","申命记","De"],["Josh","Joshua","书","约书亚记","Jos"],["Judg","Judges","士","士师记","Jud"],["Ruth","Ruth","得","路得记","Ru"],["1 Sam","First Samuel","撒上","撒母耳记上","1Sa"],["2 Sam","Second Samuel","撒下","撒母耳记下","2Sa"],["1 Kin","First Kings","王上","列王纪上","1Ki"],["2 Kin","Second Kings","王下","列王纪下","2Ki"],["1 Chr","First Chronicles","代上","历代志上","1Ch"],["2 Chr","Second Chronicles","代下","历代志下","2Ch"],["Ezra","Ezra","拉","以斯拉记","Ezr"],["Neh","Nehemiah","尼","尼希米记","Ne"],["Esth","Esther","斯","以斯帖记","Es"],["Job","Job","伯","约伯记","Job"],["Ps","Psalms","诗","诗篇","Ps"],["Prov","Proverbs","箴","箴言","Pr"],["Eccl","Ecclesiastes","传","传道书","Ec"],["Song","Song of Solomon","歌","雅歌","So"],["Is","Isaiah","赛","以赛亚书","Isa"],["Jer","Jeremiah","耶","耶利米书","Jer"],["Lam","Lamentations","哀","耶利米哀歌","La"],["Ezek","Ezekiel","结","以西结书","Eze"],["Dan","Daniel","但","但以理书","Da"],["Hos","Hosea","何","何西阿书","Ho"],["Joel","Joel","珥","约珥书","Joe"],["Amos","Amos","摩","阿摩司书","Am"],["Obad","Obadiah","俄","俄巴底亚书","Ob"],["Jon","Jonah","拿","约拿书","Jon"],["Mic","Micah","弥","弥迦书","Mic"],["Nah","Nahum","鸿","那鸿书","Na"],["Hab","Habakkuk","哈","哈巴谷书","Hab"],["Zeph","Zephaniah","番","西番雅书","Zep"],["Hag","Haggai","该","哈该书","Hag"],["Zech","Zechariah","亚","撒迦利亚书","Zec"],["Mal","Malachi","玛","玛拉基书","Mal"],["Matt","Matthew","太","马太福音","Mt"],["Mark","Mark","可","马可福音","Mr"],["Luke","Luke","路","路加福音","Lu"],["John","John","约","约翰福音","Joh"],["Acts","Acts","徒","使徒行传","Ac"],["Rom","Romans","罗","罗马书","Ro"],["1 Cor","First Corinthians","林前","哥林多前书","1Co"],["2 Cor","Second Corinthians","林後","哥林多後书","2Co"],["Gal","Galatians","加","加拉太书","Ga"],["Eph","Ephesians","弗","以弗所书","Eph"],["Phil","Philippians","腓","腓立比书","Php"],["Col","Colossians","西","歌罗西书","Col"],["1 Thess","First Thessalonians","帖前","帖撒罗尼迦前书","1Th"],["2 Thess","Second Thessalonians","帖後","帖撒罗尼迦後书","2Th"],["1 Tim","First Timothy","提前","提摩太前书","1Ti"],["2 Tim","Second Timothy","提後","提摩太後书","2Ti"],["Titus","Titus","多","提多书","Tit"],["Philem","Philemon","门","腓利门书","Phm"],["Heb","Hebrews","来","希伯来书","Heb"],["James","James","雅","雅各书","Jas"],["1 Pet","First Peter","彼前","彼得前书","1Pe"],["2 Pet","Second Peter","彼後","彼得後书","2Pe"],["1 John","First John","约一","约翰一书","1Jo"],["2 John","second John","约二","约翰二书","2Jo"],["3 John","Third John","约三","约翰三书","3Jo"],["Jude","Jude","犹","犹大书","Jude"],["Rev","Revelation","启","启示录","Re"]]');
    // sephp.isGb ? fhl.g_book_allGb : fhl.g_book_all
    // 2021.07 Snow 太多人用了
    fhl.g_book_allAuto = function g_book_allAuto(isGb) {
        if (isGb == undefined) {
            throw "2021.07 isGb 參數"
        }
        return isGb ? fhl.g_book_allGb : fhl.g_book_all
    }
    // 使用 0-based [0]創紀記、[0]第1章、[0]第1節
    // id = 1 是 創世記1章1節
    fhl.book_chap_sec_2_id = function book_chap_sec_2_id(iBook, iChap, iSec) {
        var obj = fhl._book_chap_2_id_data[iBook][iChap];
        return obj.id + iSec;
    };
    //1:絕對id1，是書本0，章節0 (創世紀第1章)
    //32:絕對id32，是書本0，章節1 (創世紀第2章)
    //供 id_2_book_chap_sec 使用

    // 回傳值為 0-base [0]創世紀 [0]第1章 [0]第1節
    // 1 <= id <= 31103
    fhl.id_2_book_chap_sec = function id_2_book_chap_sec(id) {
        if (id < 1)
            id = 1;
        else if (id > 31103)
            id = 31103

        var obj_base = fhl._id_2_book_chap_sec_data["1"];
        var id_base = 1;
        for (var idbase in fhl._id_2_book_chap_sec_data) {
            if (id < parseInt(idbase))
                break;
            obj_base = fhl._id_2_book_chap_sec_data[idbase];
            id_base = parseInt(idbase);
        }
        if (obj_base == null) {
            console.warn("輸入錯誤的id " + id);
            return null;
        }
        return { iBook: obj_base.b, iChap: obj_base.c, iSec: id - id_base };
    };
    // mark by snow 2021.07 好像沒有人用了
    // // 創: return 0;
    // // -1表示不存在,輸入錯了
    // fhl.chineses_2_iBook = function chineses_2_iBook(book_chinesename) {
    //   for (var idxBook in fhl.g_book_all) {
    //     if (fhl.g_book_all[idxBook][2] == book_chinesename) {
    //       return parseInt(idxBook);
    //     }
    //   }
    //   return -1;
    // }
    fhl.engs_2_iBook = function engs_2_iBook(engs) {
        /// <summary> 取得0-based的書卷代碼 </summary>
        /// <param type="string" name="engs" parameterArray="false">Ex: Gen 2 John</param
        for (var idxBook in fhl.g_book_all) {
            if (fhl.g_book_all[idxBook][0] == engs) {
                return parseInt(idxBook);
            }
        }
        return -1;
    }
    fhl.get_chap_count = function get_chap_count(ibook) {
        var cnum = [50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22];
        if (ibook >= 0 && ibook < 66)
            return cnum[ibook];
    }
    // 開發給 有聲聖經 用的
    // 沒有回傳. 表示ibook=65,ichap=21. 沒有next了
    fhl.get_next_chap = function get_next_chap(ibook, ichap) {
        // next
        var ibooknx = ibook;
        var ichapnx = ichap + 1;
        var cnum = fhl.get_chap_count(ibook);
        if (ichapnx >= cnum) {
            ibooknx = ibooknx + 1;
            ichapnx = 0;
        }
        if (ibooknx < 66)
            return { ibook: ibooknx, ichap: ichapnx };
    }
    // 開發給 有聲聖經 用的
    // 沒有回傳. 表示ibook=0,ichap=0. 沒有prev了
    fhl.get_prev_chap = function get_prev_chap(ibook, ichap) {
        var ibookpv = ibook;
        var ichappv = ichap - 1;
        if (ichappv == -1) {
            if (ibookpv == 0)
                ibookpv = -1;
            else {
                ibookpv = ibookpv - 1;
                ichappv = fhl.get_chap_count(ibookpv) - 1;
            }
        }
        if (ibookpv != -1)
            return { ibook: ibookpv, ichap: ichappv };
    }
    fhl.any_name_2_iBook = function any_name_2_iBook(name, isgb) {
        /// <summary> 不論輸入 Ex Exodus 出 出埃及記 Ex 都會回傳1 (0-based)，若不存在回傳-1 </<summary>
        /// <param type="bool" name="gb" parameterArray="false" optional="true">是簡體結果顯示嗎(預設false)</param>
        if (isgb == undefined) {
            throw "2021.07 改版，要加 isgb 參數 bool "
        }

        var g_book_all = fhl.g_book_allAuto(isgb)
        var jr1 = Enumerable.from(g_book_all);

        // 會回傳 ["Ex", "Exodus", "出", "出埃及記", "Ex"]
        var jr2 = jr1.firstOrDefault(null, function (a1) {
            if (Enumerable.from(a1).any("a2=>a2=='" + name + "'") == true)
                return true;
            return false;
        });
        if (jr2 == null)
            return -1;

        return jr1.indexOf(jr2);
    }

    var sephp = sephp || {};
    sephp.node_search_result = document.createElement("div");
    sephp.node_pre_search = document.createElement("div");
    sephp.act_sn_button_click = function act_sn_button_click(pdata) {
        /// <summary> 會傳入 engs, keyword, ver </summary>
        console.log("act_sn_button_click not assign., 會傳入 engs, keyword, ver 資訊. 通常是把查詢輸入的地方文字變為keyword");
        console.log('ex: {engs: "Dan",keyword: "03478",ver: "unv"}');
    };
    sephp.act_ref_button_click = function act_ref_button_click(pdata) {
        /// <summary> 會傳入 engs, chap, sec, ver 資訊. 通常是用來切換章節</summary>
        console.log("act_ref_button_click not assign., 會傳入 engs, chap, sec, ver 資訊. 通常是用來切換章節");
    };
    sephp.keyword = "";
    sephp.issn = true;
    sephp.isgb = false;

    return fhl
}
function gAbvphp() {
    // 必須已經完成 fhl 的 class 

    /** @type {{string:string}} */
    abvphp.g_bibleversionsGb = {}
    /** @type {{string:string}} */
    abvphp.g_bibleversions = {}
    abvphp.isReadyGlobalBibleVersions = isReadyGlobalBibleVersions
    abvphp.init_g_bibleversions = init_g_bibleversions
    abvphp.get_cname_from_book = get_cname_from_book
    abvphp.get_book_from_cname = get_book_from_cname

    // 小雪 常常要用到 聖經版本資訊 但是不斷的 abv.php 是沒必要的. 查一次就好. 然後存到全域變數
    // "和合本": {A}, "原文直譯(參考用)":{A}, "KJV": {A} .....
    // A.book: "unv", A.ntonly: "0", A.otonly: "0", strong: "0"
    function abvphp() { }
    /**
     * index.js 裡會用, 因為它要確定抓過了嗎
     * @returns {boolean}
     */
    function isReadyGlobalBibleVersions() {
        return Object.keys(abvphp.g_bibleversions).length != 0 &&
            Object.keys(abvphp.g_bibleversionsGb).length != 0
    }
    // obj[和合本].book = unv
    var isAlreadySendCommand = false
    function init_g_bibleversions() {
        if (isAlreadySendCommand) { return }
        isAlreadySendCommand = true

        var isAsync = true
        fhl.json_api_text("uiabv.php?gb=0", fn2, null, null, isAsync)
        fhl.json_api_text("uiabv.php?gb=1", fn3, null, null, isAsync)

        /// dict 可能是 abvphp.g_bibleversions 或 abvphp.g_bibleversionsGb
        function fnCore(r1, dict) {
            var r2 = JSON.parse(r1)
            var r3 = r2["record"]
            r3.forEach(function (it) {
                var obj = {
                    book: it["book"],
                    ntonly: it["ntonly"],
                    otonly: it["otonly"],
                    strong: it["strong"]
                }
                dict[it["cname"]] = obj
            })
        }
        function fn2(r1) {
            abvphp.g_bibleversions = {};
            fnCore(r1, abvphp.g_bibleversions)
            console.log('完成 abvphp.')
        }
        function fn3(r1) {
            abvphp.g_bibleversionsGb = {};
            fnCore(r1, abvphp.g_bibleversionsGb)
            console.log('完成 abvphpGb.')
        }

    };//init g_bibleversions



    /// <summary> unv 取得 '和合本' </summary>
    /// <param type="string" name="book" parameterArray="false">Ex: unv</param>
    /// <param type="bool" name="isgb" parameterArray="false">0 or 1</param>
    function get_cname_from_book(book, isgb) {
        /// <summary> unv 取得 '和合本' </summary>
        /// <param type="string" name="book" parameterArray="false">Ex: unv</param>
        /// <param type="bool" name="isgb" parameterArray="false">0 or 1</param>
        var dict = isgb == false ? abvphp.g_bibleversions : abvphp.g_bibleversionsGb
        var ret = "";
        $.each(dict, function (key, obj) {
            if (obj.book.localeCompare(book) == 0) {
                ret = key;
                return;
            }
        });//foreach
        return ret;
    };

    /**
     * 
     * @param {string} cname 
     * @param {boolean} isgb 
     * @returns {string?}
     */
    function get_book_from_cname(cname, isgb) {
        if (isgb == undefined) {
            isgb = pageState.gb != 0
        }
        var dict = isgb == false ? abvphp.g_bibleversions : abvphp.g_bibleversionsGb

        var r1 = dict[cname]
        if (r1 == undefined) { return undefined }
        return r1.book
    }
    return abvphp
}
function loadFhlCssAndAppendToHeadAsync() {
    return new Promise((res, rej) => {
        $.ajax({
            url: './index/fhl.css',
            dataType: 'text',
            success: str => {
                $("<style>", {
                    text: str
                }).appendTo($("head"))
                res() // ok
            },
            error: er => {
                rej(new Error('fhl.css $.ajax failure.'))
            }
        })
    })
}
function gIjnjs() {
    Libs.s = new Libs()
    FileCache3rd.s = new FileCache3rd()

    Ijnjs.Libs = Libs
    Ijnjs.FileCache = FileCache
    Ijnjs.FileCache3rd = FileCache3rd
    Ijnjs.getCacheAsync = getCacheAsync
    Ijnjs.rem2Px = rem2Px
    Ijnjs.testThenDo = testThenDo
    Ijnjs.testThenDoAsync = testThenDoAsync
    Ijnjs.splitStringByRegex = splitStringByRegex
    Ijnjs.matchGlobalWithCapture = matchGlobalWithCapture

    // 以下順序隨便
    function rem2Px(rem) {
        /** @type {number?} */
        var r2
        if (r2 == undefined) {
            getr2()
            return 16 * rem
        }

        return r2 * rem
        function getr2() {
            testThenDo({
                cbDo: () => {
                    r2 = parseFloat($('body').css('font-size'))
                },
                cbTest: () => $('body').length != 0,

            })
        }
    }
    function Ijnjs() { this.name = 'Ijnjs' }
    /** @class */
    function Libs() {
        /**
         * @type {{$:jQuery;Enumerable:Enumerable;bootstrap:bootstrap;_:_}}
         */
        this.libs = {}
    }
    function FileCache() {
        /**
         * dict jsDoc 寫法
         * @type {Object.<string, {str:string}>}
         */
        this.caches = {}
        this.clear = () => this.caches = {}

        /**
         * cache[na].str = str     
         * @param {string} na 
         * @param {string} str 若是 undefined 則是 delete this.caches[na]
         */
        this.setStr = function (na, str) {
            if (str == undefined) {
                if (this.caches[na] != undefined) {
                    delete this.caches[na]
                }
                return
            }

            if (this.caches[na] == undefined) {
                this.caches[na] = {}
            }
            this.caches[na].str = str
        }
        /**
         * return cache[na].str
         * @param {string} na 
         * @returns {string|undefined}
         */
        this.getStr = function (na, isClear) {
            isClear = isClear == undefined ? true : false
            if (this.caches[na] == undefined) {
                console.warn('get cache, but can\'t find ' + na)
                return undefined
            }
            var str = this.caches[na].str
            if (isClear) {
                this.setStr(na, undefined)
            }
            return str
        }
        this.getList = function () {
            return Object.keys(this.caches)
        }
    }

    function FileCache3rd() {
        this.data = new FileCache()
        // 產生 jsDoc 註解用
        // console.log(libs.map(a1 => "'" + a1.na + "'").join('|'))
        /**     
         * @param {'popper'|'jquery'|'linq'|'jquery-ui'|'jquery-ui-css'|'jquery-touch'|'bootstrap-css'|'bootstrap'|'lodash'} na 
         * @returns {string}
         */
        this.getStr = function (na) {
            if (this.data.caches[na] == undefined) {
                this.data.caches[na] = {}
            }
            return this.data.caches[na].str
        }
        /**     
         * @param {'popper'|'jquery'|'linq'|'jquery-ui'|'jquery-ui-css'|'jquery-touch'|'bootstrap-css'|'bootstrap'|'lodash'} na 
         * @param {string} str
         * @returns 
         */
        this.setStr = function (na, str) {
            if (this.data.caches[na] == undefined) {
                this.data.caches[na] = {}
            }
            this.data.caches[na].str = str
        }
        /**   
         * jquery 會略過，因為它應該已經取得   
         * @param {{na:string;url:string}[]} libs 
         * @returns {Promise<any>}
         */
        this.loadAsync = function loadAsync(libs) {
            var $ = Ijnjs.Libs.s.libs.$

            var srd = getSrd('ijnjs')
            var promises = libs.filter(a1 => a1.na != 'jquery').map(a1 => {
                var isHttp = /https?:\/\//i.test(a1.url)
                if (isHttp == false) {
                    a1.url = srd + a1.url
                }

                return new Promise((res2) => {
                    $.ajax({
                        url: a1.url,
                        dataType: 'text',
                        complete: () => {
                            res2()
                        }, success: str => {
                            this.data.caches[a1.na] = { str: str }
                        }
                    })
                })
            })
            return Promise.all(promises)
        }
    }
    /**
     * 只有 jquery 不是用 $.ajax 
     * @returns {Promise<{$:jQuery}>} 
     * */
    function getJQueryAsync() {
        return new Promise((res, rej) => {
            var r1 = new XMLHttpRequest()
            r1.onerror = a1 => { rej(a1) }
            r1.onload = (a1) => {
                if (304 == r1.status || (r1.status >= 200 && r1.status < 300)) {
                    var isAlreadyHave = window.$ != undefined
                    FileCache3rd.s.setStr("jquery", r1.responseText)
                    noRequireJs(() => {
                        eval(FileCache3rd.s.getStr("jquery")) // 經測試與看 source code，在 es5下，都是輸出到 window.$
                    })
                    var r2 = {}
                    r2.$ = window.$
                    if (isAlreadyHave == false) {
                        delete window.$
                        delete window.jQuery
                    }
                    res(r2)
                } else {
                    rej(new Error('status code ' + r1.status + ' ' + r1.statusText))
                }
            }
            r1.open('get', thirdPartFileDescription[0].url, true)
            r1.send()
        })
    }
    /**
     * 供 ijnjs 或 ijnjs-ui 等等，一個 lib 的 main.js 使用
     * 可以取得它的路徑，再結合 location.href 或 pathname, 就可以知道，該傳什麼相對路徑
     * 不需等到 ijnjs 即可使用, 與 testThenDo 一樣
     * 
     * @param {string} nameThisJs 'ijnjs.js' 傳入 'ijnjs' 即可, 可能 .jn 或 .min.js 都可
     * @returns {string}
     */
    function getSrd(nameThisJs) {
        // 情境
        // pathname: /NUI_dev/tests/ijnjsTests.html 
        // 自己: http://127.0.0.1:5502/NUI_dev/src/assets/libs/ijnjs/ijnjs.js 
        // 目標(以下兩種都可成功，試過了)
        // var srd = '/NUI_dev/src/assets/libs/ijnjs/'
        // var srd = '../src/assets/libs/ijnjs/'
        // 
        // step1: 自己變 /NUI_dev/src/assets/libs/ijnjs/ijnjs.js

        var r1 = getHrefFromDocumentScripts(nameThisJs)
        var r2 = r1.substring(0, r1.lastIndexOf('/') + 1)
        var r3 = r2.replace(location.origin, '')
        return r3
        /**
         * 供 ijnjs 或 ijnjs-ui 等等，一個 lib 的 main.js 使用
         * 可以取得它的路徑，再結合 location.href 或 pathname, 就可以知道，該傳什麼相對路徑
         * 不需等到 ijnjs 即可使用, 與 testThenDo 一樣
         * 
         * @param {string} nameThisJs 'ijnjs.js' 傳入 'ijnjs' 即可, 可能 .jn 或 .min.js 都可
         * @returns {string}
         */
        function getHrefFromDocumentScripts(nameThisJs) {
            var reg = new RegExp(nameThisJs + '(?:.min)?.js$', 'i')
            // ijnjs.js/require.js ... 這種 case 要避免

            // ijnjs.js.ui.js ... 這種 case 要避免 Regexp 要加尾端 $
            // 承上，(測試成功，把檔案拿掉尾巴即可測，就會變undefine)

            // ijnjs.min.js ijnjs.js 都要可以
            // regex 多一個 (.min)? 但不 capture 所以再加 ?:

            // 測試過，還沒 docuemnt.ready 也可以取得局部  
            // Path 工具還沒載入，不能在這使用
            for (var a1 of document.scripts) {
                if (a1.src != undefined) {
                    var na = getName(a1.src)
                    if (na != undefined) {
                        if (reg.test(na)) {
                            return a1.src
                        }
                    }
                }
            }
            return undefined
            /** 
             * http://127.0.0.1:5502/NUI_dev/jsdoc/require.min.js => require.min.js
             * @param {string} src 
             * */
            function getName(src) {
                var n = src.length
                for (let i = n - 1; i >= 0; i--) {
                    if (src[i] == '/') {
                        return src.substr(i + 1)
                    }
                }
                return undefined
            }
        }
    }
    /**
    * 
    * @param {(string|{dir:string,children:any[]})[]} fileDescription 
    * @param {boolean} isMin 決定要 load .min.js 還是 .js
    * @param {string} mainJsName 供 getSrd 使用的參數 ijnjs 例如 ijnjs-ui ijnjs-fhl
    * @returns {Promise<FileCache>}
    */
    function getCacheAsync(fileDescription, isMin, mainJsName) {
        var $ = Ijnjs.Libs.s.libs.$
        var r1 = toStandardUrls(fileDescription, isMin, mainJsName)

        return Promise.all(r1.map(a1 => {
            return new Promise((res, rej) => {
                $.ajax({
                    url: a1.url,
                    dataType: 'text',
                    complete: () => res(a1),
                    success: (str) => {
                        a1.str = str
                        res(a1)
                    }
                })
            })
        })).then(re => {
            var r2 = new Ijnjs.FileCache()
            for (var a1 of re) {
                if (a1.str != undefined) {
                    r2.caches[a1.na] = { str: a1.str }
                }
            }
            return r2
        })

        return
        /**
         * 取得 ijnjs 分離的檔案過程要用的
         * @param {(string|{dir:string;children:any[]})[]} descript 
         */
        function toStandardUrls(descript, isMin, mainJsName) {
            /** @type {{na:string;url:string}[]} */
            var re = []

            // // 中途會轉成這樣去處理(遞迴結構，轉為 {}[])
            // var libs2 = [
            //   { na: 'Path', },
            //   { na: 'SplitStringByRegex', },
            //   { na: 'assert',},
            //   { na: 'TestTime', },
            //   { na: 'rem2Px',  },
            //   { na: 'BookChapDialog/BookChapDialog',  },
            //   { na: 'BookChapDialog/BookChapDialog.css',},
            //   { na: 'BookChapDialog/BookChapDialog.html', },
            //   { na: 'BookChapDialog/dir2/file1', url: },
            // ]    
            var fn = function (ja, dir) {
                for (var a1 of ja) {
                    if (typeof a1 == 'string') {
                        re.push({ na: dir + a1 })
                    } else {
                        var dir2 = dir == '' ? (a1.dir + '/') : (dir + a1.dir + '/')
                        fn(a1.children, dir2)
                    }
                }
            }
            fn(descript, '')

            var srd = getSrd(mainJsName)
            for (var a1 of re) {
                var ext = getExt(a1.na)
                if (ext == undefined) {
                    if (isMin) {
                        a1.url = srd + a1.na + '.min.js'
                    } else {
                        a1.url = srd + a1.na + '.js'
                    }
                } else {
                    if (isMin) {
                        var na = removeLastExtension(a1.na)
                        a1.url = srd + na + '.min' + ext
                    } else {
                        a1.url = srd + a1.na
                    }
                }
            }

            return re
            /** 
             * 要用在 自動加 .js 用
             * @param {string} na
             * @returns {string|undefined}
             */
            function getExt(na) {
                var n = na.length
                for (var i = n - 1; i >= 0; i--) {
                    if (na[i] == '/') {
                        return undefined
                    } else if (na[i] == '.') {
                        return na.substr(i)
                    }
                }
                return undefined
            }
            function removeLastExtension(path) {
                var i2 = path.lastIndexOf('.')
                return path.substring(0, i2)
            }
        }
    }
    return Ijnjs
}

/**
 * @param {string} name - "Hebrew" "Greek" "Sn" 之類的
 */
function FontSizeToolBase(name) {
    this.getIdName = name == undefined ? "Hebrew" : name;
    /** @desc 介面上，那個按下會變小的 div Id */
    this.getIdSmaller = this.getIdName + "FontSizeSmaller";
    /** @desc 介面上，那個按下會變小的 div Id */
    this.getIdLarger = this.getIdName + "FontSizeLarger";
    /** @desc 介面上，那個滑塊 div Id */
    this.getIdSlider = this.getIdName + "FontSizeSliderBar";
    /** @desc 介面上，那個輸入值的 input text Id */
    this.getIdText = this.getIdName + "FontSize";
    // HebrewfontSizeTool
    this.dom = $('#' + this.getId())
}
function declareFontSizeToolBase() {
    FontSizeToolBase.prototype.getId = function () {
        return this.getIdName + "fontSizeTool"
    }
    FontSizeToolBase.prototype.registerEvents = function (ps) {
        var that = this
        $('#' + that.getIdSlider).change(function () {
            var domInput = $('#' + that.getIdSlider)
            var sz = parseInt(domInput.val())

            makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
        });
        $('#' + that.getIdText).change(function () {
            var domInput = $('#' + that.getIdText)
            var sz = parseInt(domInput.val())

            makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
        });
        $('#' + that.getIdSmaller).click(function () {
            var domInput = $('#' + that.getIdText)
            var sz = parseInt(domInput.val())
            sz -= 1

            makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
        });
        $('#' + that.getIdLarger).click(function () {
            var domInput = $('#' + that.getIdText)
            var sz = parseInt(domInput.val())
            sz += 1
            makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
        });
        return; // end of register
        function makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz) {
            sz = sz > 60 ? 60 : sz
            sz = sz < 6 ? 6 : sz

            updatePageStateFontSize(sz)

            $('#' + that.getIdText).val(sz)
            $("#" + that.getIdSlider).val(sz)

            updateFontSize()
            fhlLecture.reshape(pageState)
            return

            function updateFontSize() {
                updateFontSizeWithClassName(that.getClassNameForJQueryToSetFontSize())
                function updateFontSizeWithClassName(className) {
                    if (className === undefined) { return }
                    $(className).css('font-size', sz + 'pt')
                }
            }
            function updatePageStateFontSize(sz) {
                if (that.isGreek()) { pageState.fontSizeGreek = sz }
                else if (that.isHebrew()) { pageState.fontSizeHebrew = sz }
                else if (that.isStrongNumber()) { pageState.fontSizeStrongNumber = sz }
                updateLocalStorage()
            }
        }
    }
    FontSizeToolBase.prototype.getClassNameForJQueryToSetFontSize = function () {
        if (this.isGreek()) { return '.hebrew-char' }
        if (this.isHebrew()) { return '.greek-char' }
        if (this.isStrongNumber()) { return '.sn' }
        return undefined
    }
    /** 
     * 使用 name 是否 = Hebrew 字串
     * 用在 render 時，載入初始值時
     * 用在 大小變更後, 是變更 .hebrew-char 還是 .greek-char
    */
    FontSizeToolBase.prototype.isHebrew = function () {
        return this.getIdName == 'Hebrew'
    }

    FontSizeToolBase.prototype.isGreek = function () {
        return this.getIdName == 'Greek'
    }
    FontSizeToolBase.prototype.isStrongNumber = function () {
        return this.getIdName == 'Sn'
    }
    /** 在 render 中使用 */
    FontSizeToolBase.prototype.getSizeForInitial = function () {
        if (this.isHebrew()) {
            return pageState.fontSizeHebrew
        } else if (this.isGreek()) {
            return pageState.fontSizeGreek
        } else if (this.isStrongNumber()) {
            return pageState.fontSizeStrongNumber
        }
        return pageState.fontSize
    }
    FontSizeToolBase.prototype.render = function (ps, dom) {
        var sz = this.getSizeForInitial()
        var HorG = ''
        if (this.isHebrew()) {
            HorG = 'H'
        } else if (this.isGreek()) {
            HorG = 'G'
        } else if (this.isStrongNumber()) {
            HorG = 'SN'
        }
        var html = "<div>" + HorG + gbText("字大小", ps.gb) + ":</div>";
        html += ' <div id="' + this.getIdSmaller + '" class="FontSizeButtonLargeSmaller">A<span>-</span></div>\
                                    <div id="'+ this.getIdLarger + '" class="FontSizeButtonLargeSmaller">A<span>+</span></div>\
                                    <div style="display: block; margin-top: 5px; height: 30px;">\
                                        <input id="'+ this.getIdSlider + '" type="range" min="6" max="60" value="' + sz + '" step="1" style="width: 95px;"/>\
                                        <input id="'+ this.getIdText + '" type="text" value="' + sz + '" style="width:2em;"/>\
                                    </div>\
                                    ';
        dom.html(html);
    }
    FontSizeToolBase.prototype.init = function (ps, dom) {
        this.dom = dom
        this.render(ps, this.dom)
        this.registerEvents(ps)
    }
}
/** 
 * 將純文字 str, 若裡面存在 hebrew 或 greek 則會用 span 包起來
 * @param {string} str 傳入的資料，包含中文、原文的資料。例如傳入 wform。
 * @returns {string} 回傳 html 資料
*/
function charHG(str) {
    if (str === undefined) { return str }

    var r1 = splitStringByRegex(str, /([\u0590-\u05fe\- ]+)|([\u0370-\u03ff\u1f00-\u1fff]+)/ig)
    // var r1 = new Ijnjs.SplitStringByRegex().main(str, /([\u0590-\u05fe\- ]+)|([\u0370-\u03ff\u1f00-\u1fff]+)/ig)
    if (r1 == null) { return str }

    /** @type {string[]} 表示是 html結果*/
    var re = []
    re = r1.map(function (a1, i1) {
        if (a1.exec == null) {
            return a1.w
        } else if (a1.exec[1] != null) {
            return "<span class='hebrew-char'>" + a1.w + "</span>"
        } else {
            return "<span class='greek-char'>" + a1.w + "</span>"
        }
    })

    return re.join('')
}
/** 
* $(".hebrew-char") $(".greek-char") $(".sn") 的 font-size
* 讀取 pageState 資料以設定
* 它在 經文顯示時，最後一步驟會作
* 它在 Parsing工具，也會作
* add by snow. 2021.07
*/
function setFontSizeHebrewGreekStrongNumber() {
    $(".hebrew-char").css("font-size", pageState.fontSizeHebrew + "pt")
    $(".greek-char").css("font-size", pageState.fontSizeGreek + "pt")
    $(".sn").css("font-size", pageState.fontSizeStrongNumber + "pt")
}
function coreInfoWindowShowHide(fnCompleted, isShow1, isShow3) {
    /// <summary> 這是為了開發 "記錄上一次設定 左右視窗 寬度 和 顯示與否 功能而整理" </summary>
    /// 在 click 與 resize 事件中會被呼叫
    /// 2021.07 by snow
    if (isShow1 === undefined) {
        isShow1 = $("#fhlLeftWindowControl").hasClass("selected")
    }
    if (isShow3 === undefined) {
        isShow3 = $('#fhlInfoWindowControl').hasClass('selected')
    }

    pageState.isVisibleInfoWindow = isShow3 ? 1 : 0
    pageState.isVisibleLeftWindow = isShow1 ? 1 : 0
    updateLocalStorage()

    if (isShow1) {
        $("#fhlLeftWindowControl").addClass("selected")
    } else {
        $("#fhlLeftWindowControl").removeClass("selected")
    }

    if (isShow3) {
        $('#fhlInfoWindowControl').addClass('selected')
    } else {
        $('#fhlInfoWindowControl').removeClass('selected')
    }

    var sizes = getSizes(isShow1, isShow3)
    sizes.rc3.opacity = isShow3 ? 1 : 0
    sizes.rc1.opacity = isShow1 ? 1 : 0

    var o1 = $("#fhlLeftWindow")
    var o2 = $("#fhlMidWindow")
    var o3 = $("#fhlInfo")
    var o4 = $("#fhlToolBar")
    function isLeftOrWidthNoChange(o, rc) {
        return o.position().left == rc.left && o.width() == rc.width
        // 注意，不能用 o.css("left")，這會是 '12px' 而不是 12
    }
    var isCh1 = isLeftOrWidthNoChange(o1, sizes.rc1);
    var isCh2 = isLeftOrWidthNoChange(o2, sizes.rc2);
    var isCh3 = isLeftOrWidthNoChange(o3, sizes.rc3);
    var isCh4 = isLeftOrWidthNoChange(o4, sizes.rc4);

    if (!isCh1) {
        if (sizes.rc1.width != 0) {
            o1.show()
        }
        o1.animate(sizes.rc1, 400, () => {
            if (sizes.rc1.width == 0) {
                o1.hide()
            }
        })
    }
    if (!isCh3) {
        if (sizes.rc3.width != 0) {
            o3.show()
        }
        o3.animate(sizes.rc3, 400, () => {
            // 若只是 optical 設為 0 ，邊邊的元件還是會被按到，影響結果
            // 像換「下一切」的箭頭就會被擋到 (被 parsing 工具的擋到)
            if (sizes.rc3.width == 0) {
                o3.hide()
            }
        })
    }
    if (!isCh4) {
        if (sizes.rc4.height != undefined) {
            // 窄的時候，高度會變2行
            o4.animate(sizes.rc4, 400)
            $('#help').css('top', '2.25rem')
            $('#windowControl').css('top', '2rem')
            $('#searchTool').css('top', '2rem')
            $('#searchTool').css('max-width', '40%')
            $('#title').contents().first()[0].textContent = "FHL " //太寬會讓 se 擋到 手動更新功能
        } else {
            o4.animate(sizes.rc4, 400)
            o4.css('height', '')
            $('#help').css('top', '')
            $('#windowControl').css('top', '')
            $('#searchTool').css('top', '')
            $('#searchTool').css('max-width', '')
            $('#title').contents().first()[0].textContent = "信望愛聖經工具"
        }
    }

    chnageControlsMaxWidthInToolbar(sizes.rc4)
    // changeSearchInputMaxWidthIfNeed(sizes.rc4)

    o2.animate(sizes.rc2, 400, fnCompleted)

    return // end function
    function chnageControlsMaxWidthInToolbar(rc4) {
        var rc4Width = rc4.width
        // 不只要設定 max-width, 當小到一個程度  還要設它的 padding 與 maring 不然會看不到
        var r1 = $("#windowControl")
        if (r1 === undefined) { return }

        if (testIsChangedMaxWidth(rc4Width)) {
            changeMaxWidth(rc4Width)
        }

        return

        function testIsChangedMaxWidth(rc4Width) {
            var r2 = parseInt(r1.css("max-width")) // 481px 會直接是 481, 若沒有值, 會是 NaN
            if (isNaN(r2)) { return true } // 需要設定一個 max-width

            if (rc4.height != null) {
                return r2 != '40%'
            } else {
                var r3 = Math.round(rc4Width / 4.0)
                return r2 != r3
            }
        }
        function changeMaxWidth(rc4Width) {
            var w = Math.round(rc4Width / 4.0) // max-width 與 buttons 都會用到
            if (rc4.height != null) {
                r1.css('max-width', '40%')
            } else {
                r1.css("max-width", w)
            }

            setBottons()
            if (w < 250) {
                $('#windowControlIcon').hide()
                $('#windowControlButtons').css('left', '0')
            } else {
                $('#windowControlIcon').show()
                $('#windowControlButtons').css('left', '')
            }

            return
            function setBottons() {
                var btns = r1.find("span")
                btns.css(getCss(w))
                function getCss(w) {
                    if (w < 190) {
                        return { padding: "0px 0px 3px", margin: "0px 0px", }
                    }
                    if (w < 250) {
                        return { padding: "0px 3px 3px", margin: "0px 6px", }
                    }
                    return { padding: "0px 7px 3px", margin: "0px 12px", } // 原本
                }
            }
        }
    }
    function changeSearchInputMaxWidthIfNeed(rc4) {
        var rc4Width = rc4.width
        var r1 = $("#searchTool .icon-search-container")
        if (r1 === undefined) { return }

        if (testIsChSearchInputMaxWidth(rc4Width)) {
            chSearchInputMaxWidth(rc4Width)
        }

        return

        function testIsChSearchInputMaxWidth(rc4Width) {
            var r2 = parseInt(r1.css("max-width")) // 481px 會直接是 481, 若沒有值, 會是 NaN
            if (isNaN(r2)) { return true } // 需要設定一個 max-width

            var r3 = Math.round(rc4Width / 4.0)
            return r2 != r3
        }
        function chSearchInputMaxWidth(rc4Width) {
            r1.css("max-width", Math.round(rc4Width / 4.0))
        }
    }

    function getSizes(is1, is3, cx1, cx3) {
        // 為了 "當 info 視窗 縮起來/展開來後" 之類的 animate 參數要用
        makeSureParams() // 確保有 is1, is3, cx1, cx3

        // ui-resizable 的 width = 12
        var wBar = 12
        var wWin = $(window).width()

        // 0: main, 1: left+main, 2:right+main, 3:left+right+main
        var tp = getTp()
        var rc1 = getWin1() // left window
        var rc3 = getWin3() // info window
        var rc2 = getWin2() // mid window
        var rc4 = getWin4() // 上面那條細長的 toolbar (含 search 與 工具按扭的)

        return { rc1, rc2, rc3, rc4 }
        function getTp() {
            // return: 0: main, 1: left+main, 2:right+main, 3:left+right+main
            if (is1 && is3) { return 3; }
            if (is1 == false && is3 == false) { return 0; }
            if (is3 == false) { return 1; }
            return 2;
        }
        function addR(o) {
            // 每個都算 left width, 然後用這2個去算 right
            // 注意, right 的值是 animate 用的，是從右邊 pixel 開始計算
            // 在 getWin1 getWin2 3 4 都會到
            o.right = wWin - o.left - o.width
            return o
        }
        function getWin1() {
            // win1: left windows, 從左到右，依序為 win1 win2 win3 編號
            var isVisibleWin1 = tp != 0 && tp != 2
            if (false == isVisibleWin1) {
                return addR({ width: 0, left: 0 })
            }

            return addR({ width: cx1, left: wBar })
        }
        function getWin3() {
            // win3: info windows, 從左到右，依序為 win1 win2 win3 編號
            var isVisibleWin3 = tp != 0 && tp != 1
            if (false == isVisibleWin3) {
                return addR({ width: 0, left: wWin })
            }

            var w = cx3 > wWin ? wWin - wBar : cx3
            var l = wWin - wBar - w
            return addR({ width: w, left: l })
        }
        function getWin2() {
            // win2: mid windows, 從左到右，依序為 win1 win2 win3 編號
            var l = is1 ? (rc1.left + rc1.width + wBar) : wBar
            var w = is3 ? rc3.left - wBar - l : wWin - wBar - l
            return addR({ width: w, left: l })
        }
        function getWin4() {
            // win4: 上面那條細長的 toolbar 
            // var l = rc2.left
            // var w = wWin - wBar - l
            var l = 12
            var w = wWin - wBar - wBar

            if (wWin < Ijnjs.rem2Px(36)) {
                // 12 rem 帖撒羅尼迦前書：第四章，12 字
                var h = Ijnjs.rem2Px(4)
                return addR({ width: w, left: l, height: h })
            } else {
                return addR({ width: w, left: l })
            }
        }
        function makeSureParams() {
            is1 = is1 == undefined ? $("#fhlLeftWindowControl").hasClass("selected") : is1
            is3 = is3 == undefined ? $("#fhlInfoWindowControl").hasClass("selected") : is3
            cx1 = cx1 == undefined ? pageState.cxLeftWindow : cx1
            cx3 = cx3 == undefined ? pageState.cxInfoWindow : cx3
        }
    }
}
function gsearchTool() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {
            var that = this;

            var $searchTrigger = $('[data-ic-class="search-trigger"]'),
                $searchInput = $('[data-ic-class="search-input"]'),
                $searchClear = $('[data-ic-class="search-clear"]');

            // 放大鏡，按下之後，事件。
            $searchTrigger.click(function () {
                var $this = $('[data-ic-class="search-trigger"]');

                // 2021-07 修改 by snow
                // 1. 展開 (按下放大鏡) 2. 開始搜尋 3. 縮起 (若沒有文字時)
                if ($this.hasClass('active') == false) {
                    $this.addClass('active');
                    $searchInput.focus();
                } else {
                    if ($searchInput.val().length > 0) {
                        $('.searchBtn').click()
                    } else {
                        // 不要隱藏，會防礙輸入 (滑鼠點過去，就縮起來)
                        // $this.removeClass('active');
                    }
                }

            });

            $searchInput.blur(function () {
                if ($searchInput.val().length > 0) {
                    return false;
                } else {
                    // 2021-07 mark by snow, 下面1行，滑鼠離開後，不要隱藏起來，保持著。(道仁提出)
                    // $searchTrigger.removeClass('active');
                }
            });

            $searchClear.click(function () {
                $searchInput.val('');
            });

            $searchInput.focus(function () {
                $searchTrigger.addClass('active');
            });

            $('.searchBtn').click(function () {
                //ps.leftBtmWinShow = true;
                triggerGoEventWhenPageStateAddressChange(ps);
                fhlMidBottomWindow.render(ps);
                //doSearch($('.searchBox').val(),"search",0);
                doSearch($('.searchBox').val(), ps);
                $searchInput.val('');
                // 2021-07 mark by snow, 下面2行，搜尋後，不要隱藏起來，保持著。(道仁提出)
                // $searchInput.blur();
                // $searchTrigger.removeClass('active');
                if (!$('#fhlMidBottomWindowControl').hasClass('selected')) {
                    $('#fhlMidBottomWindowControl').trigger("click");
                }
            });
        },
        render: function (ps, dom) {
            var html = "";/*&#x1f50d;*/
            html += ' <div class="wrapper">\
                      <div class="icon-search-container active" data-ic-class="search-trigger">\
                        <span class="search"><i class="fa fa-search fa-fw"></i></span>\
                        <input type="text" class="searchBox search-input" data-ic-class="search-input" placeholder="Search" on/>\
                        <span class="times-circle" data-ic-class="search-clear">×</span>\
                      </div>\
                      <span class="searchBtn">快速搜尋</span>\
                    </div>'
            dom.html(html);
        }
    };
}


function gparsingPopUp() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.dom.hide();
        },
        registerEvents: function (ps) {
            var that = this;

            this.dom.on("mousedown", function (e) {
                if (e.which == 3)
                    $(this).addClass("right");
            }).on("mouseleave", function (e) {
                if (!$(this).hasClass("right"))
                    that.dom.hide();
            }).on("mouseenter", function (e) {
                clearTimeout($.data($('#parsingPopUp')[0], "parsingPopUpAutoCloseTimeout"));
                if ($(this).hasClass("right"))
                    setTimeout(function () { $('#parsingPopUp').removeClass("right"); }, 1);
            });

            $('.snParse').click(function () {
                //var offset=parsingPopUp.dom.offset;
                ps.N = $(this).attr('N');
                ps.k = $(this).html();
                parsingPopUp.render(ps, parsingPopUp.dom, null);
            });
            $('.searchBibleVerse').click(function () {
                var searchText = $(this).html();
                searchText = searchText.replace(/&nbsp;/g, " ");
                searchText = "#" + searchText + "|";

                // replace 2015.08.01(六)
                doSearch(searchText, ps);

                // mark 2015.08.01(六)
                // doSearch("#" + searchText + "|", "search", 0);
            });

            $('.searchSN').click(function () {
                if (!$('#fhlMidBottomWindowControl').hasClass('selected')) {
                    $('#fhlMidBottomWindowControl').trigger("click");
                }
                var keywords = $(this).attr('k'); // sn
                //keywords = '3478'; //example;

                //replace 2015.08.01(六)
                doSearch(keywords, ps, false);

                // mark 2015.08.01(六)
                //doSearch($(this).attr('k'),"search",parseInt($(this).attr('N'))+1);
            });
        },
        render: function (ps, dom, offset, par) {
            var that = this;
            if (par == "ft") {
                var html = '<div id="parsingPopUpTriangle"></div><div id="parsingPopUpInside">' + "取得資料中..." + '</div>';
                dom.html(html);
                var winH = $(window).height();
                var domH = (that.dom.height() > 200) ? 200 + 30 : that.dom.height();

                if (offset != null) {
                    if (offset.top + domH + 12 + 15 > winH) {
                        offset.top -= domH + 40;
                        offset.left -= 40;
                        $("#parsingPopUpTriangle").addClass("parsingPopUpLowerTriangle");
                    }
                    else {
                        offset.top += 0;
                        offset.left -= 40;
                        $("#parsingPopUpTriangle").addClass("parsingPopUpUpperTriangle");
                    }
                }

                that.dom.show();
                dom.offset(offset);
                that.registerEvents(ps);
            }
            else if (par == "psn") {
                var ajaxUrl = getAjaxUrl('sd', ps);
                $.ajax({
                    url: ajaxUrl
                }).done(function (d, s, j) {
                    var jsonObj = JSON.parse(j.responseText);
                    var html = jsonObj.record[0].dic_text;
                    html = parseDic(html);


                    html = '<div id="parsingPopUpTriangle"></div><div id="parsingPopUpInside">' + html + '</div>';
                    dom.html(html);
                    var winH = $(window).height();
                    var domH = (that.dom.height() > 200) ? 200 + 40 : that.dom.height();
                    whenoverwindow_offset_modified();
                    if (offset != null) {
                        if (offset.top + domH + 12 + 15 > winH) {
                            offset.top -= domH + 40;
                            offset.left -= 40;
                            $("#parsingPopUpTriangle").addClass("parsingPopUpLowerTriangle");
                        }
                        else {
                            offset.top += 0;
                            offset.left -= 40;
                            $("#parsingPopUpTriangle").addClass("parsingPopUpUpperTriangle");
                        }
                        that.dom.show();
                        dom.offset(offset);
                    }

                    /*dom.html(html);
                    if(offset!=null){
                      var lecTop=164;
                      var lecTopOffset=120;
                      var RightWinH=$('#fhlInfo').height();
                      var domH=dom.height();
                    //console.log("top:"+offset.top+",domH:"+domH+",RightWinH:"+RightWinH);
        
                      if(domH>RightWinH){
                        //set css to auto scroll
                      }else if(offset.top+domH>RightWinH){
                        offset.top-=(offset.top>domH)?domH:offset.top;
                        offset.left+=70;
                      }
                      that.dom.show();
                      dom.offset(offset);
                    }        */
                    that.registerEvents(ps);
                });
            } else if (par != null) {
                var html = par;
                dom.html(html);
                that.dom.show();
                if (offset != null) {
                    dom.offset(offset);
                }
                //that.dom.scrollTop(0);
                that.registerEvents(ps);
            } else {
                var ajaxUrl = getAjaxUrl('sd', ps);
                $.ajax({
                    url: ajaxUrl
                }).done(function (d, s, j) {
                    var jsonObj = JSON.parse(j.responseText);

                    // replace 2015.10.29(四) snow
                    // 使用 j.responseText 的 .sn=00430, 但顯示是 0430, 要用 0430作為關鍵字, 才會被畫上藍色, 因為00430不等於0430 (snow) 2015.10.29(四)
                    // 因此. 出現經文按下去的時候. 若是k=00430, 就不會有正確的畫出藍色
                    // "record":[{"sn":"00430","dic_text":"0430  ... 這是 j.responseText 局部
                    var snShow = /[0-9]+/.exec(jsonObj.record[0].dic_text); //add 2015.10.29(四)
                    var title = "";
                    if (snShow == null)
                        title = "<span class='searchSN' N=" + jsonObj.record[0].dic_type + " k=" + jsonObj.record[0].sn + ">";//原本的
                    else
                        title = "<span class='searchSN' N=" + jsonObj.record[0].dic_type + " k=" + snShow[0] + ">";
                    //var title="<span class='searchSN' N="+jsonObj.record[0].dic_type+" k="+jsonObj.record[0].sn+">"; //mark 2015.10.29(四) snow
                    title += "出現經文</span></br>";
                    var html = jsonObj.record[0].dic_text;
                    html = parseDic(html);
                    html = '<div id="parsingPopUpTriangle"></div><div id="parsingPopUpInside">' + title + html + '</div>';
                    dom.html(html);
                    var winH = $(window).height();
                    var domH = (that.dom.height() > 200) ? 200 + 40 : that.dom.height();
                    //whenoverwindow_offset_modified();
                    if (offset != null) {
                        if (offset.top + domH + 12 + 15 > winH) {
                            offset.top -= domH + 30;
                            offset.left -= 40;
                            $("#parsingPopUpTriangle").addClass("parsingPopUpLowerTriangle");
                        }
                        else {
                            offset.top += 10;
                            offset.left -= 40;
                            $("#parsingPopUpTriangle").addClass("parsingPopUpUpperTriangle");
                        }
                        that.dom.show();
                        dom.offset(offset);
                    }
                    that.registerEvents(ps);
                });
            }
        }
    };
}
function parseDic(text) {
    var ps = pageState;
    text = text.replace(/(定義|自希伯來文|於|自|參|與|同義詞|和|見|from|and|See|see entry)(\s+)/g,
        function replacer(match, p1, offset, string) { return p1; });
    text = text.replace(/ /g, "&nbsp;");
    text = text.replace(/(於|自|參|與|同義詞|和|見|from|and|See|see entry)(\d+)/g,
        function replacer(match, p1, p2, offset, string) {
            return p1 + "<span class='snParse sn' N=" + ps.N + ">" + p2 + "</span>";
        });
    text = text.replace(/自希伯來文(\d+)/g, function replacer(match, p1, offset, string) {
        return "自希伯來文<span class='snParse sn' N=1>" + p1 + "</span>";
    });
    text = text.replace(/定義(\d+)/g, function replacer(match, p1, offset, string) {
        return "定義<span class='snParse sn' N=" + ps.N + ">" + p1 + "</span>";
    });
    text = text.replace(/#(.*?)\|/g, function replacer(match, p1, offset, string) {
        return "<span class='searchBibleVerse'>" + p1 + "</span>";
    });
    text = text.replace(/\r\n/g, "</br>");
    return text;
}
function gfhlInfo() {
    return {
        init: function (ps) {
            bibleAudio.init(ps, $('#bibleAudio'));
            bibleAudio.registerEvents(ps);
            fhlInfoTitle.init(ps, $('#fhlInfoTitle'));
            fhlInfoTitle.registerEvents(ps);
            fhlInfoContent.init(ps, $('#fhlInfoContent'));
            fhlInfoContent.registerEvents(ps);
            parsingPopUp.init(ps, $('#parsingPopUp'));
            this.registerEvents();
            this.render(ps);
            var fhlInfoWidth = 500; //這邊改了，css裡面也要改
            $('#fhlInfo').css({ 'left': $(window).width() - fhlInfoWidth - 12 + 'px' }); // 12 是外面border

            // snow add, 2016.10 經文中的地點mark被click,
            $(document).on({
                'sobj_pos': function (e, p1) {
                    if (ps.titleId == "fhlInfoMap") {
                        rfhlmap.set_active(p1.sid);
                    }
                }
            });
        },
        registerEvents: function () {
            var cx = $(window).width()
            $('#fhlInfo').resizable({
                handles: 'w',
                maxWidth: cx * 0.9,
                // minWidth: 300,
                resize: function (event, ui) {
                    var currentWidth = ui.size.width;

                    // add by snow. 2021.07
                    pageState.cxInfoWindow = currentWidth
                    updateLocalStorage()

                    var width = 0;
                    if ($("#fhlLeftWindow").css('left') == '12px')
                        width = $(window).width() - $("#fhlLeftWindow").width() - currentWidth;
                    else
                        width = $(window).width() - currentWidth + 12;
                    $("#fhlMidWindow").css({
                        'width': width - 48 + 'px',
                        'right': currentWidth + 'px'
                    });

                    fhlLecture.reshape(pageState); // snow add 2016-07
                }
            });
            $('.ui-resizable-handle.ui-resizable-w').html('<span>&#9776;</span>');
        },
        render: function (ps) {
            //fhlInfoTitle.render(ps,$('#fhlInfoTitle'));
            fhlInfoContent.render(ps, fhlInfoContent.dom);
        }
    };
}
function gbibleAudio() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {

        },
        render: function (ps, dom) {
            //var html="有聲聖經 ";
            //if(ps.chineses==book[0]&&ps.chap==1){
            //  html+="";
            //}else{
            //  html+="<img class='menuImage' src='./static/images/lastChapter.png'/>";
            //}
            //if(ps.audio==0){
            //  html+="<img class='menuImage' src='./static/images/audioPlay.png'/>";
            //}else{
            //  html+="<img class='menuImage' src='./static/images/audioPause.png'/>";
            //}
            //if(ps.chineses==book[65]&&ps.chap==22){
            //  html+="";
            //}else{
            //  html+="<img class='menuImage' src='./static/images/nextChapter.png'/>";
            //}
            //dom.html(html);
        }
    }
}
function gfhlInfoTitle() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.setTitleViaGb(ps);
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {
            //select all elements of info title
            var selectAll = "";
            for (var i = 0; i < this.title.length; i++) {
                selectAll += "#" + this.title[i].id + ",";
            }
            selectAll = selectAll.substring(0, selectAll.length - 1); // 去掉,號
            // console.log(selectAll); // #fhlInfoParsing,#fhlInfoComment,#fhlInfoPreach,#fhlInfoTsk,#fhlInfoOb,#fhlInfoAudio,#fhlInfoMap
            $(selectAll).click(function () {
                $(selectAll).removeClass('selected');
                $(this).addClass('selected');
                ps.titleIdold = ps.titleId; // add 2015.12.10(四) 為了有聲聖經,切換問題
                ps.titleId = $(this).attr('id');
                triggerGoEventWhenPageStateAddressChange(ps);
                fhlInfoContent.render(ps, fhlInfoContent.dom);
            });
        },
        render: function (ps, dom) {
            this.setTitleViaGb(ps);
            var html = "<ul>";
            for (var i = 0; i < this.title.length; i++) {
                html += "<li>" + this.title[i].name + "</li>";
            }
            html += "</ul>";
            dom.html(html);
            for (var i = 0; i < this.title.length; i++) {
                dom.find('li:eq(' + i + ')').attr('id', this.title[i].id);
            }
            $('#' + ps.titleId).addClass('selected');
        },
        setTitleViaGb: function (ps) {
            if (ps.gb === 1) {
                this.title = [
                    { "name": "原文", "id": "fhlInfoParsing" },
                    { "name": "注释", "id": "fhlInfoComment" },
                    { "name": "讲道", "id": "fhlInfoPreach" },
                    { "name": "串珠", "id": "fhlInfoTsk" },
                    { "name": "典藏", "id": "fhlInfoOb" },
                    { "name": "有声", "id": "fhlInfoAudio" },
                    { "name": "地図", "id": "fhlInfoMap" }
                ];
            } else {
                this.title = [
                    { "name": "原文", "id": "fhlInfoParsing" },
                    { "name": "註釋", "id": "fhlInfoComment" },
                    { "name": "講道", "id": "fhlInfoPreach" },
                    { "name": "串珠", "id": "fhlInfoTsk" },
                    { "name": "典藏", "id": "fhlInfoOb" },
                    { "name": "有聲", "id": "fhlInfoAudio" },
                    { "name": "地圖", "id": "fhlInfoMap" }
                ];
            }
        }
    };
}
function gfhlInfoContent() {
    /**
     * TODO:
     * @class
     */
    function ConvertDTextsToHtml() {
        /**
         * 開發時，是為了寫 SN Dictionary Bug 用
         * @param {DText[]} dtexts 
         * @returns {string}
         */
        this.main = function (dtexts) {

            return "<div>" + doDTexts(dtexts) + "</div>"
            /**
             * 
             * @param {DText[]} array 
             * @returns {string}
             */
            function doDTexts(array) {
                let ss = ""
                for (const a1 of array) {
                    if (a1.children != undefined) {
                        ss = ss + "<div>" + doDTexts(a1.children) + "</div>"
                    } else {
                        ss = ss + a1.w
                    }
                }
                return ss;
            }
        }
    }
    /**
     * @interface
     */
    function DataOfDictOfFhl() {
        /** @type {"success"} */
        this.status
        /** @type {number} */
        this.record_count
        /** @type {OneRecord[]} */
        this.record

        /**
         * @interface
         */
        function OneRecord() {
            /** @type {string} */
            this.sn
            /** @type {string} */
            this.dic_text
        }

        // 下面2個資訊，不是 api 回傳的, 是我新增的, 因為twcb與cbol的轉換為 dtexts 可能不同

        /** @type {'cbol'|'twcb'} */
        this.src
        /** @type {1|0} */
        this.isOld
    }
    /**
     * 將會有 Twcb 版的實作、Cbol 版的實作
     * @interface
     */
    function ISnDictionary() { }
    /**
     * @param {{sn:string,isOld:boolean}} param 
     * @returns {Promise<DataOfDictOfFhl>}
     */
    ISnDictionary.prototype.queryAsync = function (param) { }
    /**
     * @param {DataOfDictOfFhl} dataOfFhl 
     * @returns {DText[]}
     */
    ISnDictionary.prototype.cvtToDTexts = function (dataOfFhl) { }
    function SnDictOfTwcb() {
        /**
         * @param {{sn:string,isOld:boolean}} param 
         * @returns {Promise<DataOfDictOfFhl>}
         */
        this.queryAsync = function (param) {
            /** @type {DataOfDictOfFhl} */
            let re = {}
            if (param.isOld) {
                re = virtualOld()
            } else {
                re = virtualNew()
            }
            return new Promise((res, rej) => res(re))

            function virtualNew(sn) {
                return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00011","dic_text":"Ἀβραάμ, ὁ 人名　無變格\\r\\n（אַבְרָהָם H85「<span class=\\"exp\\">多人之父</span>」）「<span class=\\"exp\\">亞伯拉罕</span>」。出現於耶穌的家譜中，#太1:1,2,17;路3:34|。是以色列民族的父，亦為基督徒這真以色列人的父，#太3:9;路1:73;3:8;約8:39,53,56;徒7:2;羅4:1;雅2:21|。因此，以色列百姓稱為亞伯拉罕的後裔，#約8:33,37;羅9:7;11:1;林後11:22;加3:29;來2:16|。是得蒙應許者，#徒3:25;7:17;羅4:13;加3:8,14,16,18;來6:13|。滿有信心，#羅4:3|（#創15:6|）#羅4:9,12,16;加3:6|（#創15:6|）,#加3:9;雅2:23|。此處並稱之為神的朋友（參#賽41:8;代下20:7;但3:35|;參#出33:11|）;在來世具有顯赫地位，#路16:22|以下（見 κόλπος G2859一），以撒、雅各和眾先知亦同，#路13:28|。神被描述為亞伯拉罕、以撒、雅各的神（#出3:6|）#太22:32;可12:26;路20:37;徒3:13;7:32|。他與以撒、雅各一同在神國中坐席，#太8:11|。"}]}')
            }
            function virtualOld(sn) {
                return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00011","dic_text":"00011\\r\\n【0011】אֲבַדּוֹן\\r\\n＜音譯＞’abaddown\\r\\n＜詞類＞名、陰\\r\\n＜字義＞毀滅之地、滅亡、亞巴頓\\r\\n＜字源＞來自HB6的加強語氣\\r\\n＜LXX＞G3  G623\\r\\n＜神出＞2d   #伯26:6|\\r\\n＜譯詞＞滅亡3 燬滅1 滅沒1 （5）\\r\\n＜解釋＞\\r\\n<div class=\\"idt\\">一、指陰間裡停放要滅亡的死人之處，是陰間有分隔間的概念發展之後產生的字。<span class=\\"bibtext\\"><span class=\\"exp\\">燬滅</span></span>，#伯31:12|。平行字שְׁאוֹל陰間，#伯26:6;箴15:11|；וָמָוֶת死亡，#伯28:22|；קֶבֶר墳墓，#詩88:11|。</div>\\r\\n<div class=\\"idt\\">二、舊約希伯來文讀音為亞巴頓，新約希臘文讀音是亞玻倫，意指惡魔，撒但與無底坑的使者，#啟9:11|。</div>"}]}')
            }
        }
        /**
         * @param {DataOfDictOfFhl} dataOfFhl 
         * @returns {DText[]}
         */
        this.cvtToDTexts = function (dataOfFhl) {
            return [{ w: dataOfFhl.record[0].dic_text }]
            throw new Error("not implement yet. cvtToDTexts")
        }
    }
    SnDictOfTwcb.prototype = new ISnDictionary()
    SnDictOfTwcb.prototype.constructor = SnDictOfTwcb
    function SnDictOfCbol() {
        /**
         * TODO:
         * @param {{sn:string,isOld:boolean}} param 
         * @returns {Promise<DataOfDictOfFhl>}
         */
        this.queryAsync = function (param) {
            /** @type {DataOfDictOfFhl} */
            let re = {}
            if (param.isOld) {
                re = virtualOld()
            } else {
                re = virtualNew()
            }
            return new Promise((res, rej) => res(re))

            function virtualNew(sn) {
                return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00011","dic_text":"Ἀβραάμ, ὁ 人名　無變格\\r\\n（אַבְרָהָם H85「<span class=\\"exp\\">多人之父</span>」）「<span class=\\"exp\\">亞伯拉罕</span>」。出現於耶穌的家譜中，#太1:1,2,17;路3:34|。是以色列民族的父，亦為基督徒這真以色列人的父，#太3:9;路1:73;3:8;約8:39,53,56;徒7:2;羅4:1;雅2:21|。因此，以色列百姓稱為亞伯拉罕的後裔，#約8:33,37;羅9:7;11:1;林後11:22;加3:29;來2:16|。是得蒙應許者，#徒3:25;7:17;羅4:13;加3:8,14,16,18;來6:13|。滿有信心，#羅4:3|（#創15:6|）#羅4:9,12,16;加3:6|（#創15:6|）,#加3:9;雅2:23|。此處並稱之為神的朋友（參#賽41:8;代下20:7;但3:35|;參#出33:11|）;在來世具有顯赫地位，#路16:22|以下（見 κόλπος G2859一），以撒、雅各和眾先知亦同，#路13:28|。神被描述為亞伯拉罕、以撒、雅各的神（#出3:6|）#太22:32;可12:26;路20:37;徒3:13;7:32|。他與以撒、雅各一同在神國中坐席，#太8:11|。"}]}')
            }
            function virtualOld(sn) {
                return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00011","dic_text":"00011\\r\\n【0011】אֲבַדּוֹן\\r\\n＜音譯＞’abaddown\\r\\n＜詞類＞名、陰\\r\\n＜字義＞毀滅之地、滅亡、亞巴頓\\r\\n＜字源＞來自HB6的加強語氣\\r\\n＜LXX＞G3  G623\\r\\n＜神出＞2d   #伯26:6|\\r\\n＜譯詞＞滅亡3 燬滅1 滅沒1 （5）\\r\\n＜解釋＞\\r\\n<div class=\\"idt\\">一、指陰間裡停放要滅亡的死人之處，是陰間有分隔間的概念發展之後產生的字。<span class=\\"bibtext\\"><span class=\\"exp\\">燬滅</span></span>，#伯31:12|。平行字שְׁאוֹל陰間，#伯26:6;箴15:11|；וָמָוֶת死亡，#伯28:22|；קֶבֶר墳墓，#詩88:11|。</div>\\r\\n<div class=\\"idt\\">二、舊約希伯來文讀音為亞巴頓，新約希臘文讀音是亞玻倫，意指惡魔，撒但與無底坑的使者，#啟9:11|。</div>"}]}')
            }
        }
        /**
         * TODO:
         * @param {DataOfDictOfFhl} dataOfFhl 
         * @returns {DText[]}
         */
        this.cvtToDTexts = function (dataOfFhl) {
            return [{ w: dataOfFhl.record[0].dic_text }]
            throw new Error("not implement yet. cvtToDTexts")
        }
    }
    SnDictOfCbol.prototype = new ISnDictionary()
    SnDictOfCbol.prototype.constructor = SnDictOfCbol
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {
            var that = this;
            switch (ps.titleId) {
                case "fhlInfoParsing":
                    if (ps.realTimePopUp == 1) {
                        $('.parsing').mouseenter(function () {
                            var offset = $(this).offset();
                            offset.top += $(this).height() + 10;
                            ps.N = $(this).attr('N');
                            ps.k = $(this).attr('k');
                            var par = decodeURIComponent($(this).attr('par'));
                            parsingPopUp.render(ps, parsingPopUp.dom, offset, par);
                        });
                        /*$('.parsing').mouseleave(function(){
                          parsingPopUp.dom.hide();
                        });*/
                        // $('.parsingTableSn').mouseenter(function () {
                        //   var offset = $(this).offset();
                        //   offset.top += $(this).height() + 10;
                        //   ps.N = $(this).attr('N');
                        //   ps.k = $(this).attr('k');
                        //   parsingPopUp.render(ps, parsingPopUp.dom, offset);
                        // });
                        /*$('.parsingTable').mouseleave(function(){
                          parsingPopUp.dom.hide();
                        });*/
                    } else {
                        $('.parsing').click(function () {
                            var offset = $(this).offset();
                            offset.top += $(this).height() + 10;
                            ps.N = $(this).attr('N');
                            ps.k = $(this).attr('k');
                            var par = decodeURIComponent($(this).attr('par'));
                            parsingPopUp.render(ps, parsingPopUp.dom, offset, par);
                        });
                        // $('.parsingTableSn').click(function () {
                        //   var offset = $(this).offset();
                        //   offset.top += $(this).height() + 10;
                        //   ps.N = $(this).attr('N');
                        //   ps.k = $(this).attr('k');
                        //   parsingPopUp.render(ps, parsingPopUp.dom, offset);
                        // });
                    }

                    // $('.parsingTableSn').mouseleave(function () {
                    //   if (ps.realTimePopUp == 1) {
                    //     $.data($('#parsingPopUp')[0], "parsingPopUpAutoCloseTimeout", setTimeout(function () {
                    //       if ($('#parsingPopUp').css('display') == 'block') {
                    //         $('#parsingPopUp').hide();
                    //       }
                    //     }, 100));
                    //   }
                    // });
                    $('.parsingSecBack, .parsingSecNext').click(function () {
                        var oldEngs = ps.engs;
                        var oldChap = ps.chap;
                        ps.engs = $(this).attr('engs');
                        var idx = getBookFunc('indexByEngs', ps.engs);
                        ps.chineses = book[idx];
                        ps.chap = $(this).attr('chap');
                        ps.sec = $(this).attr('sec');
                        triggerGoEventWhenPageStateAddressChange(ps);
                        bookSelect.render(ps, bookSelect.dom);
                        if (oldEngs != ps.engs || oldChap != ps.chap)
                            fhlLecture.render(ps, fhlLecture.dom);
                        fhlInfo.render(ps);
                        fhlLecture.selectLecture(null, null, ps.sec);
                        viewHistory.render(ps, viewHistory.dom);
                    });
                    break;
                case "fhlInfoComment":
                    // 2017.12
                    console.log('$.sn click');
                    $('#fhlInfoContent .sn').click(function () {
                        var sn = $(this).attr('sn');
                        var tp = $(this).attr('tp');
                        var offset = $(this).offset();
                        offset.top += $(this).height() + 10;
                        ps.N = tp == 'H' ? 1 : 0; // 0 是新約 1 是舊約
                        ps.k = sn;
                        parsingPopUp.render(ps, parsingPopUp.dom, offset, null);
                    });

                    $('.commentSecBack, .commentSecNext, .commentJump').click(function () {
                        var oldEngs = ps.engs;
                        var oldChap = ps.chap;
                        ps.engs = $(this).attr('engs');
                        var idx = getBookFunc('indexByEngs', ps.engs);
                        ps.chineses = book[idx];
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
                            ps.chineses = book[idx];
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

                    $('.commentJump').css({
                        "display": "inline-block",
                        "cursor": "pointer",
                        "color": "rgba(50, 50, 100, 1)"
                    }).hover(function () {
                        $(this).css({
                            "color": "rgba(200, 0, 0, 1)",
                            "text-decoration": "underline"
                        });
                    }, function () {
                        $(this).css({
                            "color": "rgba(50, 50, 100, 1)",
                            "text-decoration": "none"
                        });
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
        },
        render: function (ps, dom) {
            var that = this;
            switch (ps.titleId) {
                case "fhlInfoParsing":
                    var html = "";
                    var ajaxUrl = getAjaxUrl("qp", ps);
                    $.ajax({
                        url: ajaxUrl
                    }).done(function (d, s, j) {
                        //console.log(d);// d 是回傳 純文字版, 但直接 JSON.parse 就要要用到的資料 (羅16:24有問題)
                        //console.log(s);// s 是回傳 success 字串
                        //console.log(j);// j 是回傳 ??物件, 總之 j.responseText 即是 d
                        if (j) {
                            var jsonObj = JSON.parse(j.responseText);
                            var v_name = jsonObj.v_name;
                            var version = jsonObj.version;
                            var prev_chineses = jsonObj.prev.chineses;
                            var prev_engs = jsonObj.prev.engs;
                            var prev_chap = jsonObj.prev.chap;
                            var prev_sec = jsonObj.prev.sec;
                            var next_chineses = jsonObj.next.chineses;
                            var next_engs = jsonObj.next.engs;
                            var next_chap = jsonObj.next.chap;
                            var next_sec = jsonObj.next.sec;
                            var proc = jsonObj.proc;
                            var div_name = ps.titleId;
                            if (version == "cbol") proc = 10; //原文直譯
                            var orig_font;
                            var head_str = "";
                            var chap_ctrl_str = "";
                            var body_str = "";
                            var clrstr = "";
                            var clrcnt = 0;
                            /** 
                             * @description - N:0 新約 , N:1 舊約
                             * @type {number}
                             */
                            var N = jsonObj.N;
                            if (N == 0) orig_font = "g1";
                            else orig_font = "g2";
                            var html = jsonObj.N + "</br>";
                            for (var i = 0; i < jsonObj.record.length; i++) {
                                var wid = jsonObj.record[i].wid;
                                /** @type {string} - 原文字 */
                                var word = jsonObj.record[i].word;
                                //console.log("word= " + word);
                                var exp = jsonObj.record[i].exp;
                                var id = jsonObj.record[i].id;
                                var parallel = "";
                                var align_str = "";
                                if (wid == 0) {
                                    // 處理上面半部, 原文與中文部分 wid = 0 ( 下面 wid != 就是畫成 table 部分 )
                                    if (N == 0) //NT (新約)
                                    {
                                        var wstr = "";
                                        var wd = word.split("+");
                                        //console.log("wd= " + wd);
                                        if (wd.length > 0) {
                                            for (var ii = 0; ii < wd.length; ii++) {
                                                if (ii % 3 == 0)
                                                    wstr = wstr + wd[ii];
                                                else if (ii % 3 == 1)
                                                    wstr = wstr + "(韋：" + wd[ii] + ")";
                                                else if (ii % 3 == 2)
                                                    wstr = wstr + "(聯：" + wd[ii] + ")";
                                            }
                                            word = wstr;
                                            //console.log(word);
                                        }
                                    } else if (N == 1) //OT (舊約)
                                    {
                                        var remark = jsonObj.record[i].remark;
                                        var engs = jsonObj.record[i].engs;
                                        if (remark.length > 0) {
                                            parallel = "平行經文：" + remark;
                                        }
                                        align_str = "align=\"right\" style=\"padding:0px 10px 0px 0px;\"";
                                    }

                                    var bookName = getBookFunc("bookFullName", ps.chineses);

                                    // record[0]中的 word,
                                    if (bookName != "failed") {
                                        if (ps.chineses == book[0] && ps.chap == 1 && ps.sec == 1) {
                                            chap_ctrl_str += "";
                                        } else {
                                            chap_ctrl_str += "<div class='parsingSecBack' ";
                                            var engsSafe = "'" + prev_engs + "'" // add by snow. 2021.07 存在空白會錯誤
                                            chap_ctrl_str += "engs=" + engsSafe + " chap=" + prev_chap + " sec=" + prev_sec;
                                            chap_ctrl_str += "><span>&#x276e;</span></div>";
                                        }
                                        if (ps.chineses == book[65] && ps.chap == 22 && ps.sec == 21) {
                                            chap_ctrl_str += "";
                                        } else {
                                            chap_ctrl_str += "<div class='parsingSecNext' ";
                                            var engsSafe = "'" + next_engs + "'" // add by snow. 2021.07 存在空白會錯誤
                                            chap_ctrl_str += "engs=" + engsSafe + " chap=" + next_chap + " sec=" + next_sec;
                                            chap_ctrl_str += "><span>&#x276f;</span></div>";
                                        }
                                        chap_ctrl_str += "<div style='position: absolute; top: 10px; left: 15px; /*transform: translate(-50%, 0%);*/ font-size: 12pt; color: rgba(100, 100, 100, 0.5);'>" + bookName;
                                        chap_ctrl_str += "&nbsp&nbsp" + ps.chap + ":" + ps.sec + "</div>";
                                    }

                                    var nword = word.split("\n"); // [0].word變 nword(舊約split後會反序,不知為何)
                                    var nexp = exp.split("\n");
                                    if (N == 1) { //OT
                                        var wid = 1;
                                        //console.log("nword length=" + nword.length);
                                        for (var ii = 0; ii < nword.length; ii++) {
                                            var t = nword[nword.length - ii - 1].split(" +"); // " +"是必須同時存在,不是其中1個符號存在即可.
                                            if (t.length !== 1)
                                                console.dir("t.length=" + t.length);

                                            // add by snow. 2021.07
                                            // charHG(t[iii]) 在原文上半部不需加這個, 下半部表格中才需要
                                            // 但在包含它們的div要設 hebrew-char 字型大小才會跟著被影響
                                            head_str += "<div class='hebrew-char hebrew-char-div'>";
                                            for (var iii = 0; iii < t.length; iii++) {
                                                if (t[iii].indexOf(" ") == -1 && t[iii].indexOf("-") == -1) {
                                                    // 大部分都不成立, 都是另1個.
                                                    var sn = jsonObj.record[wid].sn;
                                                    var wform = jsonObj.record[wid].wform;
                                                    var orig = jsonObj.record[wid].orig;
                                                    var remark = jsonObj.record[wid].remark;
                                                    var exp1 = jsonObj.record[wid].exp;
                                                    var par = encodeURIComponent(wform + '|' + orig + '|' + exp1 + '|' + remark + '|');
                                                    head_str += "<span class=parsing N=1 k=" + sn + " par=" + par + ">";
                                                    head_str += t[iii] + "&nbsp</span>";
                                                    wid++;
                                                } else {
                                                    var no_padding_str = t[iii];
                                                    for (var index = t[iii].length - 1; ; index--) {
                                                        if (t[iii].charAt(index) != " " && t[iii].charAt(index) != "\n") {
                                                            // console.log(t[iii] + " index:"+index +" t[iii].length:"  +  t[iii].length);
                                                            no_padding_str = t[iii].substr(0, index + 1);
                                                            break; // 大部分是 t[iii].length-1, 第1個, 就是成立的(不是空白也不是\n)
                                                        }
                                                    }
                                                    var start_pos = no_padding_str.search(/[^\u000A-\u0020]/); // 開始的符號(其中包含0x20空白, 回車0x10, 換行0x13
                                                    // console.log("start_pos="+start_pos);
                                                    do {
                                                        try {
                                                            var sn = jsonObj.record[wid].sn;
                                                            var wform = jsonObj.record[wid].wform;
                                                            var orig = jsonObj.record[wid].orig;
                                                            var remark = jsonObj.record[wid].remark;
                                                            var exp1 = jsonObj.record[wid].exp;
                                                            var par = encodeURIComponent(wform + '|' + orig + '|' + exp1 + '|' + remark + '|');
                                                        } catch (e) {
                                                            console.log("e" + e)
                                                        }
                                                        head_str += "<span class=parsing N=1 k=" + sn + " par=" + par + ">";
                                                        wid++;

                                                        var next_s = no_padding_str.indexOf(" ", start_pos); // s: space
                                                        var next_m = no_padding_str.indexOf("-", start_pos); // m:
                                                        var str;
                                                        if (next_m != -1 &&
                                                            (next_s == -1 || next_m < next_s)) {
                                                            // aaa-bbb ddd 這種 case. 或 aaa-bbb 這種case 先是'-'遇到.
                                                            str = no_padding_str.substr(start_pos, next_m - start_pos);
                                                            //console.log(str + ".length=" + str.length);
                                                            //if (str.length == 1)
                                                            //  console.log(str.charCodeAt(0));
                                                            start_pos = next_m + 1;
                                                            head_str += str + "-</span>";
                                                        } else if (next_s != -1 &&
                                                            (next_m == -1 || next_s < next_m)) {
                                                            // aaa bbb-ddd 這種 case. 或 aaa bbb 這種case 先是' '遇到.
                                                            str = no_padding_str.substr(start_pos, next_s - start_pos);
                                                            //console.log(str + ".length=" + str.length);
                                                            //if (str.length == 1)
                                                            //  console.log(str.charCodeAt(0));

                                                            start_pos = next_s + 1;
                                                            head_str += str + "&nbsp</span>"; //空白
                                                        } else {
                                                            //console.log("m:" + next_m + " s:" + next_s);
                                                            //end
                                                            // aaa 這種case. 就是最後1個字了.
                                                            str = no_padding_str.substr(start_pos, no_padding_str.length - start_pos);
                                                            head_str += str + "</span>";
                                                            break;
                                                        }
                                                        //console.log("next_s=" + next_s + " next_m=" + next_m + " str=" + str + " str.length=" + str.length);
                                                    } while (next_m != -1 || next_s != -1);

                                                    /*var s=t[iii].split(/[ -]/);
                                                      console.log("s="+s);
                                                    for(iiii=0;iiii<s.length;iiii++){
                                                      var sn=jsonObj.record[wid].sn;
                                                      var wform=jsonObj.record[wid].wform;
                                                      var orig=jsonObj.record[wid].orig;
                                                      var remark=jsonObj.record[wid].remark;
                                                      var exp1=jsonObj.record[wid].exp;
                                                      var par=encodeURIComponent(wform+'|'+orig+'|'+exp1+'|'+remark+'|');
                                                      head_str+="<span class=parsing N=1 k="+sn+" par="+par+">";
                                                      if(iiii==0)
                                                        head_str+=s[iiii]+iiii+"&nbsp</span>";
                                                      else
                                                        head_str+=s[iiii]+iiii+"&nbsp</span>";
                                                      wid++;
                                                    }*/
                                                }
                                            }
                                            head_str += "</div>";
                                            head_str += "<div>" + nexp[ii] + "</div>";
                                        }
                                    } else if (N == 0) { // 新約
                                        var wid = 1;
                                        for (var ii = 0; ii < nword.length; ii++) {
                                            nword[ii] = nword[ii].trim();
                                            var t = nword[ii].split(" ");
                                            // add by snow. 2021.07
                                            // charHG(t[iii]) 在原文上半部不需加這個, 
                                            // 但在包含它們的div要設 hebrew-char 字型大小才會跟著被影響

                                            head_str += "<div class='greek-char'>";
                                            for (var iii = 0; iii < t.length; iii++, wid++) {
                                                var r1 = jsonObj.record[wid]; // 2017.12 馬可福音 1:34 原文
                                                if (r1 == null)
                                                    continue;

                                                var sn = jsonObj.record[wid].sn;
                                                var pro = jsonObj.record[wid].pro;
                                                var wform = jsonObj.record[wid].wform;
                                                var orig = jsonObj.record[wid].orig;
                                                var remark = jsonObj.record[wid].remark;
                                                var exp1 = jsonObj.record[wid].exp;
                                                var par = encodeURIComponent(pro + '|' + wform + '|' + orig + '|' + exp1 + '|' + remark + '|');
                                                head_str += "<span class=parsing N=0 k=" + sn + " par=" + par + ">";
                                                head_str += t[iii] + "&nbsp</span>";

                                            }
                                            head_str += "</div>";
                                            head_str += "<div>" + nexp[ii] + "</div>";
                                        }
                                    }
                                } // 以上是 wid = 0 的條件, 也就是處理上半部
                                else {
                                    if (N == 0 && word == "+") { // N=0 新約
                                        /*
                                          clrcnt=(clrcnt+1)%3;
                                          if (clrcnt==0) clrstr="";
                                          else if (clrcnt==1) clrstr="#ffff99";
                                          else if (clrcnt==2) clrstr="#ffcccc";
                                          msg=skip1tag(msg,"record");
                                          */
                                        continue;
                                    }
                                    var sn = jsonObj.record[i].sn;
                                    var pro = jsonObj.record[i].pro;
                                    var wform = jsonObj.record[i].wform;
                                    var orig = jsonObj.record[i].orig;
                                    var remark = jsonObj.record[i].remark;
                                    function do_remark(remark)
                                    {
                                        // 當 input 是 `沿用至今。[#2.19, 2.9, 4.2, 11.9#]` 後面那一段，要轉換為連結
                                        // <a href="/new/pimg/2.19.png" target="grammer">2.19</a>
                                        // <a href="/new/pimg/2.9.png" target="grammer">2.9</a>
                                        // 略..
                                        var pt = remark.indexOf("[#");
                                        var pt1 = remark.indexOf("#]");
                                        while (pt >= 0 && pt1 > pt) {
                                            var nstr = "";
                                            var pstr = remark.substring(pt + 2, pt1);

                                            pstr = pstr.replace(/０/g, "0");
                                            pstr = pstr.replace(/１/g, "1");
                                            pstr = pstr.replace(/２/g, "2");
                                            pstr = pstr.replace(/３/g, "3");
                                            pstr = pstr.replace(/４/g, "4");
                                            pstr = pstr.replace(/５/g, "5");
                                            pstr = pstr.replace(/６/g, "6");
                                            pstr = pstr.replace(/７/g, "7");
                                            pstr = pstr.replace(/８/g, "8");
                                            pstr = pstr.replace(/９/g, "9");
                                            pstr = pstr.replace(/．/g, ".");

                                            subheb = pstr.split(",");
                                            nstr = "§";
                                            for (si = 0; si < subheb.length; si++) {
                                                subheb[si] = subheb[si].trim();
                                                if (subheb[si].length == 0) continue;
                                                spt = subheb[si].split("-");

                                                link_url = "/new/pimg/" + spt[0] + ".png";
                                                // 希望在開發的時候，就是 port 是 5500 時，網址會從 /new/pimg/2.19.png 變成 http://bible.fhl.net:5500/new/pimg/2.19.png
                                                if (location.port == "5500") {
                                                    link_url = "http://bible.fhl.net:80" + link_url;
                                                } else {
                                                    link_url = "http://bible.fhl.net:80" + link_url;
                                                }

                                                nstr = nstr + "<a href=\"" + link_url + "\" target=\"grammer\">" + subheb[si] + "</a> ";
                                                console.log(nstr);
                                                
                                            }
                                            // `[#` 前面的字串
                                            let str1 = remark.substring(0, pt);
                                            // `#]` 後面的字串 
                                            let str2 = remark.substring(pt1 + 2);
                                            remark = str1 + nstr + str2
                                            pt = remark.indexOf("[#");
                                            pt1 = remark.indexOf("#]");
                                        }

                                        return remark
                                    }
                                    remark = do_remark( charHG(remark) )

                                    body_str = body_str + "<tr bgcolor=\"" + clrstr + "\"><td class=\"" + orig_font + "\">" + charHG(word) + "</td><td class=\"g0\"><span class=\"parsingTableSn\" N=" + N + " k=" + sn + ">" + sn + "</span></td><td class=\"g0\">";

                                    if (N == 0) // 只有新約有 pro
                                        body_str = body_str + charHG(pro) + "</td><td class=\"g0\">";

                                    body_str = body_str + charHG(wform) + "</td><td class=\"" + orig_font + "\">" + charHG(orig) + "</td><td class=\"g0\">" + charHG(exp) + "</td><td class=\"g0\">" +
                                        remark + "</td></tr>";

                                } //else wid != 0 (也就是這括號是處理下半部)
                            } //for I , api 回來的 record 中的每1個
                            var ptg = "";
                            if (N == 0)
                                ptg = "<td class=\"g0\">詞性</td>";
                            var strFontSizeStyle = "font-size: " + ps.fontSize + "pt; line-height: " + ps.fontSize * 1.25 + "pt; margin-top: " + (ps.fontSize * 1.25 - 15) + "px";
                            var headDivStyle = "<div class='parsingTop' style=\"position: absolute; left: 0px; right: 0px; top: 0px; height: 200px; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; overflow:auto; padding: 30px 50px 10px; box-shadow: inset 0px -4px 7px #808080;" + strFontSizeStyle + ";" + ((N == 1) ? "text-align:right;" : "") +
                                "\">";

                            var html = chap_ctrl_str + headDivStyle + head_str + "</div><div id='parsingTable' style=\"" + strFontSizeStyle + ";position: absolute; top: 212px; left: 0px; right: 0px; bottom: 20px; padding: 10px; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; overflow:auto;box-shadow: inset 0px 4px 7px #808080;\"><table border=\"1\" id='sn-table' class='table-striped'>" + getTitleHtml() + body_str + "</table></div>";


                            function getTitleHtml() {
                                var strs = ps.gb != 1 ? ['原文字', 'SN', '字彙分析', '原型', '原型簡義', '備註'] : ['原文字', 'SN', '字汇分析', '原型', '原型简义', '备注']

                                var r1 = Enumerable.from(strs)
                                    .select(a1 => '<th class="g0" scope="col">' + a1 + '</th>')
                                    .toArray().join('')
                                return '<thead><tr>' + r1 + '</tr></thead>'
                            }

                            html = "<div style='position: absolute; top: 200px; left: 0px; right: 0px; height: 12px; background: #A0A0A0;'></div>" + html + "";

                            dom.html(html);

                            // add by snow. 2021.07 原文解析，字型大小
                            setFontSizeHebrewGreekStrongNumber()

                            that.registerEvents(ps);


                            testThenDoAsync(() => window.DialogTemplate != undefined)
                                .then(() => {
                                    $('#parsingTable').on({
                                        "click": function () {
                                            var r2 = $(this)
                                            var jo = {
                                                sn: r2.attr('k'),
                                                isOld: parseInt(r2.attr('n')),
                                            }

                                            // BUG:
                                            console.log(JSON.stringify(jo))

                                            qDataAsync(jo).then(html => {
                                                let idDlg = getIdOfDialog();
                                                let dlg = $('#' + idDlg).dialog({
                                                    autoOpen: false,
                                                });

                                                dlg.html('') // 清除事件, 避免記憶體殘留
                                                dlg.html(html)

                                                dlg.dialog("option", "maxWidth", window.innerWidth * 0.80)
                                                dlg.dialog("option", "maxHeight", window.innerHeight * 0.80) // 若沒設，會自動很 高，就也不會出現卷軸
                                                dlg.dialog("option", "title", "原文字典" + jo.sn)

                                                dlg.dialog("open")

                                                registerEvents()
                                            });
                                            return

                                            /**
                                             * TODO:
                                             */
                                            function registerEvents() { }

                                            /**
                                             * 
                                             * @returns {string}
                                             */
                                            function getIdOfDialog() {
                                                // TODO: 多層時
                                                let id = "iddlg"
                                                if ($('#' + id).length == 0) {
                                                    console.log(652);
                                                    $("body").append($("<div id='iddlg'>dialog</div>"))
                                                }
                                                return "iddlg"
                                            }

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
                                                    console.log(datas);
                                                    /** @type {Promise<DText[]>[]} */
                                                    let dtexts = datas.map(a1 => a1.then(aa1 => new Promise((res2, rej2) => {
                                                        try {
                                                            res2(cvtToDTextArrayFromDictOfFhl(aa1))
                                                        } catch (error) {
                                                            rej2(error)
                                                        }
                                                    })))

                                                    console.log(dtexts);
                                                    Promise.all(dtexts).then(dtextss => {
                                                        let htmlTwcb = cvtToHtmlFromDTextArray(dtextss[0])
                                                        let htmlCbol = cvtToHtmlFromDTextArray(dtextss[1])

                                                        let declare1 = '<span>以上資料由<a href="http://twcb.fhl.net/" target="_blank">浸宣出版社</a>受權</span> <br/><hr/>'
                                                        res(htmlTwcb + "<br/>" + declare1 + '<br/>' + htmlCbol)
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
                                        }
                                    }, ".parsingTableSn").on({
                                        "click": function () {
                                            var r2 = $(this)
                                            var jo = {
                                                ref: r2.attr('ref'),
                                                book: parseInt(r2.attr('book')),
                                                chap: parseInt(r2.attr('chap')),
                                            }
                                            console.log(JSON.stringify(jo))
                                        }
                                    }, ".reference")
                                    new DialogTemplate().main();
                                    findPrsingTableSnClassAndLetItCanClick(0, $('#sn-table'));
                                })


                        } //if j , api succeess 時
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
                                            span_str += bookEng[book.indexOf(bookName)];
                                        }
                                        span_str += " chap=" + chapNumber + " sec='" + secNumber + "'>" + tok + "</span>&nbsp;";
                                    }
                                    t = t.substring(0, pt) + span_str + t.substring(pt1 + 1);
                                }

                                // 2017.12
                                var tmp = t
                                FHL.STR.eachFitDo(/SNH([0-9]+)/, tmp, function (m1) {
                                    var sn = m1[1];
                                    // var newTag = '<span class="sn" sn="09001">H09001</span>'
                                    var newTag = '<span class="sn" sn="' + sn + '" tp="H"> H' + sn + '</span>';
                                    t = t.replace(m1[0], newTag);
                                });
                                tmp = t
                                FHL.STR.eachFitDo(/SNG([0-9]+)/, tmp, function (m1) {
                                    var sn = m1[1];
                                    // var newTag = '<span class="sn" sn="09001">G09001</span>'
                                    var newTag = '<span class="sn" sn="' + sn + '" tp="G"> G' + sn + '</span>';
                                    t = t.replace(m1[0], newTag);
                                });

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

                                html = parseComment(html);
                                var strFontSizeStyle = "font-size: " + ps.fontSize + "pt; line-height: " + ps.fontSize * 1.25 + "pt; margin-top: " + (ps.fontSize * 1.25 - 15) + "px";
                                html = "<div style='position: static; padding: 0px; top: 0px; bottom: 0px; overflow: auto;'>" + head_str + '<div id="commentContent">' + control_str + "<div id='commentScrollDiv' style='" + strFontSizeStyle + ";position: absolute; top: 0px; left: 0px; right: 0px; bottom: 60px; padding: 60px 50px 0px; overflow: auto;'>" + html + "</div></div></div>";
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
                            ps.chineses = book[idx];
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
            }
            fhlmap_titleId_prev = ps.titleId; //地圖 map 會用到, 因為切換走分頁, 再切換回來要 re-create render object. see also: fhlmap_render
        }
    };
}

function gfhlMidBottomWindow() {
    return {
        dom$: $(),
        init: function (ps, dom$) {
            // 此處，每搜尋一次，只會呼叫一次
            this.dom$ = dom$;
            this.render(ps, dom$);
            this.registerEvents(ps);
        },
        updateMaxHeightOfResizableAndOfDom: function () {
            var mainWindow$ = $('#mainWindow')
            var fhlMidWindow$ = $('#fhlMidWindow')
            var fhlLecture$ = fhlMidWindow$.find('#fhlLecture')
            var lecMainTitle$ = fhlLecture$.find('#lecMainTitle')
            var fhlMidBottomWindow$ = fhlMidWindow$.find('#fhlMidBottomWindow')
            var limitHeight = mainWindow$.height() - (lecMainTitle$.height() + lecMainTitle$.offset().top)
            setTimeout(() => {
                fhlMidBottomWindow$.resizable("option", "maxHeight", limitHeight)
                fhlMidBottomWindow$.css('max-height', limitHeight + 'px')
            }, 0);
        },
        updateBottomOfLecture: function () {
            var fhlMidWindow$ = $('#fhlMidWindow')
            var fhlLecture$ = fhlMidWindow$.find('#fhlLecture')
            var fhlMidBottomWindow$ = fhlMidWindow$.find('#fhlMidBottomWindow')
            var isShow = $('#fhlMidBottomWindowControl').hasClass('selected')
            if (isShow == false) {
                fhlLecture$.css('bottom', '0')
                fhlLecture$.css('height', '')
            } else {
                fhlLecture$.css('bottom', fhlMidBottomWindow$.height() + 'px')
                fhlLecture$.css('height', '')
            }
        },
        registerEvents: function (ps) {
            var that = this
            var fhlMidBottomWindow$ = $('#fhlMidBottomWindow')
            var pre_search$ = fhlMidBottomWindow$.find('#pre_search')

            fhlMidBottomWindow$.resizable({
                handles: 'n',
                resize: _.debounce(function (event, ui) {
                    that.updateMaxHeightOfResizableAndOfDom()
                    that.updateBottomOfLecture()
                }, 200)
            });


        },
        /**
         * @param {DPageState} ps 
         * @param {JQuery<HTMLElement>} dom$ $('#fhlMidBottomWindow') 
         */
        render: function (ps, dom$) {
            dom$ = dom$ == undefined ? this.dom$ : dom$

            // 此處，每搜尋一次，都會呼叫一次
            if (dom$.find('#pre_search2').length == 0) {
                // 裡面那層，會被清空，有兩層才能維持 resizable 
                var pre_search$ = $('<div id="pre_search2"><div id="pre_search"></div></div>')
                var div_search_result$ = $('<div id="search_result2"><div id="search_result"></div></div>')
                var fhlMidBottomWindowContent$ = dom$.find('#fhlMidBottomWindowContent')

                fhlMidBottomWindowContent$.empty()
                pre_search$.appendTo(fhlMidBottomWindowContent$)
                div_search_result$.appendTo(fhlMidBottomWindowContent$)
                dom$.height($(window).height() * 0.33) // 雖然用 mainWindow 的 1/2 較合理，但起始的 mainWindow 是過高的，要 200ms 左右才是正確值

                pre_search$.resizable({
                    handles: 'e',
                    resize: _.debounce((event, ui) => {
                        var cx = pre_search$.width()
                        div_search_result$.children().css("left", cx)
                    }, 200)
                })
            }
        }
    };
}

function gfhlLecture() {
    return (function () {
        function FhlLecture() {
            this.that = this
        };

        var fn = FhlLecture.prototype;
        var $lecture;
        fn.init = function (ps, dom) {
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
                triggerGoEventWhenPageStateAddressChange(ps);
                viewHistory.render(ps, viewHistory.dom);
                fhlLecture.render(ps, fhlLecture.dom);
                fhlInfo.render(ps);
                bookSelect.render(ps, bookSelect.dom);
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
                }
            }, '.lec');
            // sn 的部分        
            $lecMain.on({
                click: function () {
                    if (ps.realTimePopUp != 1) {
                        var offset = $(this).offset();
                        offset.top += $(this).height();
                        ps.N = $(this).attr('N');
                        ps.k = $(this).attr('sn');
                        // // console.log($(this).html()) // &lt;09002&gt; 就是 <09002>
                        // var k = $(this).html().replace(/&lt;/g, "").replace(/&gt;/g, "");
                        // k = k.replace(/\(/g, "").replace(/\)/g, ""); // 可能是 (09002)
                        // k = k.replace(/\{/g, "").replace(/\}/g, "");// 可能是 {09002}
                        // ps.k = k; // 9002
                        parsingPopUp.render(ps, parsingPopUp.dom, offset);
                    }
                },
                mouseenter: function () {
                    if (ps.realTimePopUp == 1) {
                        var offset = $(this).offset();
                        //console.log(offset.top);
                        offset.top += $(this).height();
                        //console.log(offset.top);
                        //console.log('');
                        ps.N = $(this).attr('N');
                        var k = $(this).html().replace(/&lt;/g, "").replace(/&gt;/g, "");
                        k = k.replace(/\(/g, "").replace(/\)/g, "");
                        k = k.replace(/\{/g, "").replace(/\}/g, "");
                        ps.k = k;
                        setTimeout(function () { parsingPopUp.render(ps, parsingPopUp.dom, offset) }, 100);
                    }
                },
                mouseleave: function () {
                    if (ps.realTimePopUp == 1) {
                        $.data($('#parsingPopUp')[0], "parsingPopUpAutoCloseTimeout", setTimeout(function () {
                            if ($('#parsingPopUp').css('display') == 'block') {
                                $('#parsingPopUp').hide();
                            }
                        }, 100));
                    }
                }
            }, '.sn');
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

        fn.when_bclick_or_nclick = function (fnb, fnn) {
            /// <summary> fhlLecture 提供的 event </summary>
            /// <param type="fn(e)" name="fnb" parameterArray="false">older history view</param>
            /// <param type="fn(e)" name="fnn" parameterArray="false">newer history view</param>
            $lecture.on({
                bclick: fnb,
                nclick: fnn
            });
        };

        fn.selectLecture = function (book, chap, sec) {
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
        fn.reshape = function (ps) {
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

        fn.registerEvents = function (ps) {
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
        fn.render = function (ps, dom) {
            //console.log('start of fhlLecture render');
            function reverse(s) {
                var o = '';
                for (var i = s.length - 1; i >= 0; i--)
                    o += s[i];
                return o;
            }
            var $lec = $(this.dom);
            var that = this;
            var htmlTitle = "";
            var htmlContent = "";

            if (isRDLocation) {
                // location 不可以用新譯本
                console.warn('離線開發,不可用新譯本,上線才能用,略過');
                ps.version = ps.version.filter(function (a1) { return a1 !== 'ncv'; });
            }

            console.log(ps.version)
            var col = ps.version.length;
            var rspArr = new Array();
            var idx = 0;
            getBibleText(col, ps, function (o) {
                rspArr.push(o);
            }, function () {

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
                    else {
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
                            for (j = 0; j < rspArr.length; j++) {
                                // 分3欄
                                var onever = $("<div class='vercol' style='width:" + cx1 + "%;display:inline-block;vertical-align:top;font-size: " + ps.fontSize + "pt; line-height: " + ps.fontSize * 1.25 + "pt; margin-top: " + (ps.fontSize * 1.25 - 15) + "px'></div>");
                                $htmlContent.append(onever);
                            }

                            // 每1欄內容
                            for (j = 0; j < rspArr.length; j++) { //each version
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


                                    if (rspArr[j].version == "bhs") {
                                        bibleText = bibleText.split(/\n/g).reverse().join("<br>");
                                        //console.log(bibleText);
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

                                    $htmlContent.children().eq(j).append(
                                        $("<div ver='" + rspArr[j].version + "' chap=" + chap + " sec=" + sec + " class='lec'>\
                              <div class='" + classDiv + "' style='margin: 0px 0.25rem 0px 0.25rem; padding: 7px 0px; height: 100%;'>\
                                <span class='verseNumber'>" + sec + "</span>"
                                            + brForHebrew +
                                            "<span class='" + className + "'>" + bibleText2 + "</span>\
                                </div>\
                              </div>"));

                                }//for each verse
                            }//for each version


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

                            var onever = $("<div class='vercol' style='vertical-align:top;font-size: " + ps.fontSize + "pt; line-height: " + ps.fontSize * 1.25 + "pt; margin-top: " + (ps.fontSize * 1.25 - 15) + "px'></div>");
                            $htmlContent.append(onever);

                            // 每一節內容
                            for (var i = 0; i < maxRecordCnt; i++) {
                                var maxR = rspArr[maxRecordIdx].record[i]; //原 var maxR = rspArr[maxRecordIdx].record[i];
                                var chap = maxR.chap, sec = maxR.sec;

                                for (var j = 0; j < rspArr.length; j++) {
                                    var r1 = rspArr[j];
                                    if (rspArr.length > 1) {
                                        var vname = "<br/><span class='ver'> (" + r1.v_name + ")</span> "; //新譯本 合和本 etc
                                    }
                                    else
                                        var vname = ""; //只有一種版本就不要加了

                                    if (i >= r1.record_count) {
                                        //此版本 本章節比較少,
                                        var className = 'verseContent ';
                                        if (rspArr[j].version == "thv12h" || rspArr[j].version == 'ttvh') // 2018.01 客語特殊字型(太1)
                                            className += ' bstw'


                                        onever.append(
                                            $("<div ver='" + rspArr[j].version + "' chap=" + chap + " sec=" + sec + " class='lec'>\
                                <div style='margin: 0px 0px 0px 0px; padding: 7px 0px; height: 100%;'>\
                                  <span class='verseNumber'>" + sec + "</span>\
                                  <span class='" + className + "'>" + vname + "</span>\
                                </div></div>"));
                                    }
                                    else {

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
                                        var bibleText2 = addHebrewOrGreekCharClass(rspArr[j].version, bibleText)

                                        onever.append(
                                            $("<div ver='" + rspArr[j].version + "' chap=" + chap + " sec=" + sec + " class='lec'>\
                                  <div class='" + classDiv + "' style='margin: 0px 0px 0px 0px; padding: 7px 0px; height: 100%;'>\
                                    <span class='verseNumber'>" + sec + "</span>"
                                                + brForHebrew +
                                                "<span class='" + className + "'>" + bibleText2 + vname + "</span>\
                                  </div>\
                                </div>"));

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

                // 設定定型大小, 在 reshape 上面 add by snow. 2021.07
                // 另外, 若是 含有 hebrew-char 的 verseContent , 它的 text-align 要是 right
                setFontSizeHebrewGreekStrongNumber()


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
                checkOldNew(ps);
                switch (ps.strong) {
                    case 0:
                        ret = text;
                        break;
                    case 1:
                        //console.log(text);
                        if ( -1 != ["unv","kjv", "rcuv"].indexOf(bibleVersion) ) {
                            // 和合本 KJV 和合本2010
                            function snReplace(s) {
                                //console.log(s);
                                if (s.substr(0, 4) === '{<WT') {
                                    // case {<WTG5719>} become <span class='sn' sn='5719' n='0'>{(5719)}</span>
                                    // 其中 n=0, 表示舊約.
                                    var sn = s.substr(5, s.length - 5 - 2);
                                    s = "<span class='sn' sn='" + sn + "' N='" + isOld + "'>{(" + sn + ")}</span>";
                                }
                                else if (s.substr(0, 3) === '{<W') {
                                    // case {<WG2532>} become <span class='sn' sn='4394' n='0'>{<4394>}</span>
                                    var sn = s.substr(4, s.length - 4 - 2);
                                    s = "<span class='sn' sn='" + sn + "' N='" + isOld + "'>{&lt" + sn + "&gt}</span>";
                                }
                                else if (s.substr(0, 3) === '<WT') {
                                    // case <WTG5719> become <span class='sn' sn='5719' n='0'>(5719)</span>
                                    var sn = s.substr(4, s.length - 4 - 1);
                                    s = "<span class='sn' sn='" + sn + "' N='" + isOld + "'>(" + sn + ")</span>";
                                }
                                else if (s.substr(0, 2) === '<W') {
                                    // case <WG4394> become <span class='sn' sn='4394' n='0'><4394></span>
                                    var sn = s.substr(3, s.length - 3 - 1);
                                    s = "<span class='sn' sn='" + sn + "' N='" + isOld + "'>&lt" + sn + "&gt</span>";
                                }
                                else
                                    console.debug('sn parsing error!');
                                return s;
                            }
                            text = text.replace(/[{]*<W[A,T,G,H]+[0-9]+a?>[}]*/g, snReplace);

                            //text=text.replace(/[{}]/g,"");
                            //text=text.replace(/>/g,"&gt;</span>");
                            //text=text.replace(/<W[a-zA-Z]*/g,"<span class='sn' N="+isOld+">&lt;");

                        }
                        //console.log(text);
                        ret = text;
                        break;
                    default:
                        ret = text;
                        break;
                }
                if ( bibleVersion == "bhs" || bibleVersion == "fhlwh") {
                    // 舊約馬索拉原文, 新約WH原文
                    ret = ret.replace(/</g, "&lt");
                    ret = ret.replace(/>/g, "&gt");
                    ret = ret.replace(/\r\n/g, "<br>");
                }
                return ret;
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
            function getBibleText(col, ps, cbk, defCbk) {
                var sem = col;

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
                            // jsonObj.v_name = a1.vna // qb.php 有但 qsb.php 沒有
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

        return new FhlLecture();
    })();
}
function gfhlMidWindow() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            fhlLecture.init(pageState, $('#fhlLecture'));
            fhlMidBottomWindow.init(pageState, $('#fhlMidBottomWindow'));
            this.render(ps, dom);
        },
        render: function (ps, dom) {
            var width = $(window).width() - $("#fhlLeftWindow").width() - $("#fhlInfo").width() - 12 * 4;
            $("#fhlMidWindow").css({
                'width': width + 'px'
            });
        }
    }
}
function gViewHistory() {
    return (function () {
        function ViewHistory() { };
        var fn = ViewHistory.prototype;

        fn.when_liclick = function (fn) {
            /// <summary> ul 清單中的 li 被 click 的時候</summary>
            /// <param type="fn(e,p1)" name="fn" parameterArray="false">{idx},回傳的是ul指在清單中的idx,</param>
            $(viewHistory.dom).on({
                liclick: fn
            }, 'li');
        };
        fn.when_clearall = function (fn) {
            /// <summary> 清除所有 被按下去的時候 </summary>
            /// <param type="fn(e)" name="fn" parameterArray="false"></param>
            $(viewHistory.dom).on({
                clearall: fn
            }, '.clearHistory');
        };
        fn.init = function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
            this.registerEvents(ps);
            var viewHistoryTop = $('#fhlLeftWindow').height() - 38 - 12;
            $('#viewHistory').css({ top: viewHistoryTop });


            var $vh = $('#viewHistory');
            function renderList(datas) {
                /// <summary> 用於畫 li 清單, ul先被清空, 再一一加入 </summary>
                /// <param type="[{.chineses, .chap},{},{}]" name="datas" parameterArray="true">清單</param>
                var ul = $vh.find('ul').first();
                ul.empty();
                Enumerable.from(datas).forEach(function (a1) {
                    ul.append($("<li chineses=" + a1.chineses + " chap=" + a1.chap + ">" + a1.chineses + ":" + a1.chap + "</li>"));
                })
            }
            $(document).on({
                vh_init: function (e, p1) {
                    renderList(p1.datas);
                },
                vh_itemschanged: function (e, p1) {
                    renderList(p1.datas);
                }
            });

            $vh.on({
                click: function (e) {

                    // 傳出第幾個被點 ( 考慮 可5 可8 可5 ... 到底哪個可5被點 ) 0-based
                    var ul = $vh.find('ul').first();
                    var lis = ul.children();
                    for (var i = 0; i < lis.length; i++) {
                        if (lis[i] == this)
                            break;
                    }

                    $(this).trigger('liclick', {
                        idx: i,
                        chineses: $(this).attr('chineses'),
                        chap: parseInt($(this).attr('chap'))
                    });

                    // 下面是原本的code 還沒完全被取代掉
                    setBook(ps, $(this).attr('chineses'));
                    ps.chap = parseInt($(this).attr('chap'));
                    ps.sec = 1;
                    //setPageState(ps); // 不要 trigger 出 'go'
                    bookSelect.render(ps, bookSelect.dom);
                    fhlInfo.render(ps, fhlInfo.dom);
                    fhlLecture.render(ps, fhlLecture.dom);
                    // that.render(ps, that.dom); // 已經處理了. vh_itemchanged 會處理
                }
            }, 'li').on({
                click: function (e) {
                    $(this).trigger('clearall');
                }
            }, '.clearHistory');
        }
        fn.registerEvents = function (ps) {
            var that = this;
            $('#viewHistory p').on('click', function () {
                if (leftWindowTool.isOpenedHistory(this)) {
                    leftWindowTool.openSettings() // open setting 就是 close history
                } else {
                    leftWindowTool.closeSettings()
                }
            });

            $('#viewHistoryScrollDiv').scroll(function () {
                $(this).addClass('scrolling');
                clearTimeout($.data(this, "scrollCheck"));
                $.data(this, "scrollCheck", setTimeout(function () {
                    $('#viewHistoryScrollDiv').removeClass('scrolling');
                }, 350));
            });
        }
        fn.render = function (ps, dom) {
            $("#viewHistory p").text(leftWindowTool.getTitleOpenedSetting())
        }
        return new ViewHistory();
    })();
}
// 因為 document 的事件愈來愈多自訂的, 就不知道有哪些了,
// 所以新增一個物件來管理 document 的事件
function gDocEvent() {
    return (function () {
        var $doc = $(document);
        function DocEvent() { };
        var fn = DocEvent.prototype;

        fn.when_vh_init = function (fn) {
            /// <summary> view history init </summary>
            /// <param type="fn(e,p1)" name="fn" parameterArray="false">初始化完成時執行</param>
            $doc.on({
                vh_init: fn
            });
        };
        fn.when_vh_idxchanged = function (fn) {
            /// <summary> view history idx changed </summary>
            /// <param type="fn(e,p1)" name="fn" parameterArray="false">_idx 改變時執行 </param>
            $doc.on({
                vh_idxchanged: fn
            });
        };
        fn.when_vh_itemschanged = function (fn) {
            /// <summary> view history idx changed </summary>
            /// <param type="fn(e,p1)" name="fn" parameterArray="false"> 內容改變時執行 </param>
            $doc.on({
                vh_itemschanged: fn
            });
        };

        fn.when_go = function (fn) {
            /// <summary> setPageState() 被呼叫時, 將會觸發 go </summary>
            /// <param type="fn(e,p1)" name="fn" parameterArray="false">p1:{chineses,chap,sec}</param>
            $doc.on({
                go: fn
            });
        };

        return new DocEvent();
    })();
}
function gVersionSelect() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            var that = this;

            ajaxUrl = fhl.urlJSON + "uiabv.php?gb=" + ps.gb;
            if (fhl.urlJSON === undefined) {
                ajaxUrl = "/json/uiabv.php?gb=" + ps.gb;
            }
            $.ajax({
                url: ajaxUrl
            }).done(function (d, s, j) {
                if (j) {
                    //console.log(j.responseText);
                    var jsonObj = JSON.parse(j.responseText);
                    that.data = jsonObj;
                }
                that.render(ps, dom, that.data);
            });
            var versionSelectHeight = $('#fhlLeftWindow').height() - $('#settings').height() - $('#viewHistory').height() - 36;
            $('#versionSelect').css({ height: versionSelectHeight + 'px' });
        },
        registerEvents: function (ps) {
            var that = this;

            this.dom.find('li').click(function (e) {
                $(this).toggleClass('selected');
                if ($(this).hasClass('selected')) {
                    insertVersion(ps, $(this));
                } else {
                    var idx = ps.version.indexOf($(this).attr('book'));
                    ps.version.splice(idx, 1);
                    ps.cname.splice(idx, 1);
                }
                //Set Default version?
                if (ps.version.length == 0) {
                    var o = that.dom.find('li:eq(0)');
                    $(o).addClass("selected");
                    ps.version.push(o.attr('book'));
                    ps.cname.push(o.attr('cname'));
                }

                triggerGoEventWhenPageStateAddressChange(ps);
                fhlLecture.render(ps, fhlLecture.dom);
                e.stopPropagation();
            });

            $('#versionSelectScrollDiv').scroll(function () {
                $(this).addClass('scrolling');
                clearTimeout($.data(this, "scrollCheck"));
                $.data(this, "scrollCheck", setTimeout(function () {
                    $('#versionSelectScrollDiv').removeClass('scrolling');
                }, 350));
            });
            return
            function insertVersion(ps, dom) {
                var book = dom.attr('book');
                var cname = dom.attr('cname');
                var versionIdx = getVersionIdx(book);
                var inserted = false;
                //console.log('book='+book+",cname="+cname+",idx="+versionIdx);
                for (var i = 0; i < ps.version.length; i++) {
                    if (versionIdx < getVersionIdx(ps.version[i])) {
                        ps.version.splice(i, 0, book);
                        ps.cname.splice(i, 0, cname);
                        inserted = true;
                        break;
                    }
                }
                if (inserted == false) {
                    ps.version.push(book);
                    ps.cname.push(cname);
                }
                return

                function getVersionIdx(book) {
                    return $('#versionSelect').find("li[book=" + book + "]").index();
                }

            }

        },
        render: function (ps, dom, data) {
            var that = this;
        }
    }
}

function setBook(ps, bookName) {
    var idx = null;
    if (book.indexOf(bookName) != -1) {
        idx = book.indexOf(bookName);
    }
    else if (bookGB.indexOf(bookName) != -1) {
        idx = bookGB.indexOf(bookName);
    }
    else if (bookEng.indexOf(bookName) != -1) {
        idx = book.indexOf(bookName);
    } else {
        idx = null;
    }
    if (idx != null) {
        ps.chineses = book[idx];
        ps.engs = bookEng[idx];
    } else {
        console.log('setBook error:idx is null');
    }
}
function gRealTimePopUpSelect() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {
            $('#realTimeOnOffSwitch').change(
                function () {
                    if ($(this).is(':checked')) {
                        ps.realTimePopUp = 1;
                        fhlLecture.render(ps, fhlLecture.dom);
                        fhlInfo.render(ps, fhlInfoContent.dom);
                    }
                    else {
                        ps.realTimePopUp = 0;
                        fhlLecture.render(ps, fhlLecture.dom);
                        fhlInfo.render(ps, fhlInfoContent.dom);
                    }
                    triggerGoEventWhenPageStateAddressChange(ps);
                });
        },
        render: function (ps, dom) {
            var html = "<div>" + gbText("即時顯示", ps.gb) + ":</div>";
            html += '<div class="onOffSwitch">\
                                  <input type="checkbox" name="realTimeOnOffSwitch" class="onOffSwitch-checkbox" id="realTimeOnOffSwitch">\
                                  <label class="onOffSwitch-label" for="realTimeOnOffSwitch">\
                                      <span class="onOffSwitch-inner"></span>\
                                      <span class="onOffSwitch-switch"></span>\
                                  </label>\
                              </div>';
            dom.html(html);
            $('#realTimeOnOffSwitch').attr("checked", (ps.realTimePopUp == 1) ? true : false);
        }
    };
}
function gMapTool() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {
            $('#mapToolOnOffSwitch').change(
                function () {
                    if ($(this).is(':checked')) {
                        // checked 是指開啟圓圈移到右邊. 那就應該是 出現「ON」
                        ps.ispos = true;
                        fhlLecture.render(ps, fhlLecture.dom);
                    }
                    else {
                        // 出現「Off」
                        ps.ispos = false;
                        fhlLecture.render(ps, fhlLecture.dom);
                    }
                    triggerGoEventWhenPageStateAddressChange(ps);
                });
        },
        render: function (ps, dom) {
            var html = "<div>" + gbText("地圖顯示", ps.gb) + ":</div>";
            html += '<div class="onOffSwitch">\
                                  <input type="checkbox" name="mapToolOnOffSwitch" class="onOffSwitch-checkbox" id="mapToolOnOffSwitch">\
                                  <label class="onOffSwitch-label" for="mapToolOnOffSwitch">\
                                      <span class="onOffSwitch-inner"></span>\
                                      <span class="onOffSwitch-switch"></span>\
                                  </label>\
                              </div>';
            //html += '<span style="color: #770000;">施工中...</span>';
            dom.html(html);
            $('#mapToolOnOffSwitch').attr("checked", ps.ispos);
        }
    };

}
function renderTsk(ps) {
    if (ps.titleId == "fhlInfoTsk") {
        var dom2 = document.getElementById("fhlInfoContent");
        if (dom2 != null) {
            var pfn_search_sn = function (sn) {
                doSearch(sn, ps, false);
            };

            var jret = tsk.tskapi(ps.engs, ps.chap, ps.sec, ps.gb ? true : false);
            var r = React.createElement(tsk.R.frame, {
                txt_ori: jret.record[0].com_text,
                default_book: ps.engs,
                default_version: "unv",
                isSN: ps.strong == 1 ? true : false,
                isGB: ps.gb ? true : false,
                cy: $(dom2).height(),
                pfn_search_sn: pfn_search_sn,
                fontSize: ps.fontSize, //
            });
            React.render(r, dom2);
            var renderobj = React.render(r, dom2);
        }
    }
}
function gImageTool() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {
            $('#imageToolOnOffSwitch').change(
                function () {
                    if ($(this).is(':checked')) {
                        // checked 是指開啟圓圈移到右邊. 那就應該是 出現「ON」
                        ps.ispho = true;
                        fhlLecture.render(ps, fhlLecture.dom);
                    }
                    else {
                        // 出現「Off」
                        ps.ispho = false;
                        fhlLecture.render(ps, fhlLecture.dom);
                    }
                    triggerGoEventWhenPageStateAddressChange(ps);
                });
        },
        render: function (ps, dom) {
            var html = "<div>" + gbText("圖片顯示", ps.gb) + ":</div>";
            html += '<div class="onOffSwitch">\
                                  <input type="checkbox" name="imageToolOnOffSwitch" class="onOffSwitch-checkbox" id="imageToolOnOffSwitch">\
                                  <label class="onOffSwitch-label" for="imageToolOnOffSwitch">\
                                      <span class="onOffSwitch-inner"></span>\
                                      <span class="onOffSwitch-switch"></span>\
                                  </label>\
                              </div>';
            //html += '<span style="color: #770000;">施工中...</span>';
            dom.html(html);
            $('#imageToolOnOffSwitch').attr("checked", ps.ispho);
        }
    };
}
function gFontSizeTool() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {
            $('#fhlLectureFontSizeSliderBar').change(function () {
                $("#fhlLectureFontSize").val($('#fhlLectureFontSizeSliderBar').val());
                makeSureSizeBetween6and60();
                onFontSizeToolSizeChanged(parseInt($('#fhlLectureFontSize').val()), ps);
                fhlLecture.reshape(ps);//show add, 經文排整齊
            });
            $('#fhlLectureFontSize').change(function () {
                makeSureSizeBetween6and60();
                onFontSizeToolSizeChanged(parseInt($('#fhlLectureFontSize').val()), ps);
                fhlLecture.reshape(ps);//show add, 經文排整齊
            });
            $('#fhlLectureFontSizeSmaller').click(function () {
                $('#fhlLectureFontSize').val(parseInt($('#fhlLectureFontSize').val()) - 2);
                makeSureSizeBetween6and60();
                onFontSizeToolSizeChanged(parseInt($('#fhlLectureFontSize').val()), ps);
                fhlLecture.reshape(ps);//show add, 經文排整齊
            });
            $('#fhlLectureFontSizeLarger').click(function () {
                $('#fhlLectureFontSize').val(parseInt($('#fhlLectureFontSize').val()) + 2);
                makeSureSizeBetween6and60();
                onFontSizeToolSizeChanged(parseInt($('#fhlLectureFontSize').val()), ps);
                fhlLecture.reshape(ps);//show add, 經文排整齊
            });
            return
            function makeSureSizeBetween6and60() {
                if ($('#fhlLectureFontSize').val() > 60)
                    $('#fhlLectureFontSize').val(60);
                else if ($('#fhlLectureFontSize').val() < 6)
                    $('#fhlLectureFontSize').val(6);
            }

            function onFontSizeToolSizeChanged(sz, ps) {
                // sz: parseInt($('#fhlLectureFontSize').val())
                $('#fhlLectureFontSizeSliderBar').val(sz);

                $('#fhlLecture .lec').css({
                    'font-size': sz + 'pt',
                    'line-height': sz * 1.25 + 'pt',
                    'margin': sz * 1.25 - 15 + 'px 0px'
                });
                $('#commentScrollDiv').css({
                    'font-size': $('#fhlLectureFontSize').val() + 'pt',
                    'line-height': sz * 1.25 + 'pt',
                    'margin': sz * 1.25 - 15 + 'px 0px'
                });
                $('#fhlInfoContent .parsingTop').css({
                    'font-size': $('#fhlLectureFontSize').val() + 'pt',
                    'line-height': sz * 1.25 + 'pt',
                    'margin': sz * 1.25 - 15 + 'px 0px'
                });
                $('#parsingTable').css({
                    'font-size': $('#fhlLectureFontSize').val() + 'pt',
                    'line-height': sz * 1.25 + 'pt',
                    'margin': sz * 1.25 - 15 + 'px 0px'
                });
                $('#fhlLecture .lecContent.bhs.hebrew').css({
                    'font-size': (sz + 6) + 'pt',
                    'line-height': (sz + 6) * 1.25 + 'pt',
                    'margin': sz * 1.25 - 15 + 'px 0px'
                });
                ps.fontSize = sz;
                renderTsk(ps);
                return

            }

        },
        render: function (ps, dom) {
            var html = "<div>" + gbText("字體大小", ps.gb) + ":</div>";
            html += ' <div id="fhlLectureFontSizeSmaller">A<span>-</span></div>\
                              <div id="fhlLectureFontSizeLarger">A<span>+</span></div>\
                              <div style="display: block; margin-top: 5px; height: 30px;">\
                                  <input id="fhlLectureFontSizeSliderBar" type="range" min="6" max="60" value="'+ ps.fontSize + '" step="1" style="width: 95px;"/>\
                                  <input id="fhlLectureFontSize" type="text" value="'+ ps.fontSize + '" style="width:2em;"/>\
                              </div>\
                              ';
            dom.html(html);
        }
    };
}
function doSearch(keyword, ps, isAll) {
    /// <summary> 新版本 (2015.08.01, 搜尋</summary>
    /// <param type="string" name="keyword" parameterArray="false">Ex: #賽 21:1| or 3478 or 當把</param>
    /// <param type="bool" name="isAll" parameterArray="false">SN搜尋的時候,它若是在新約的時候,click,就只找新約,default:true</param>
    $('#fhlMidBottomWindowTitle').html('搜尋：' + keyword);
    if (isAll == undefined)
        isAll = true;

    sephp.act_sn_button_click = function (pdata) {
        //console.log('ex: {engs: "Dan",keyword: "03478",ver: "unv"}');
        $('.searchBox').val(pdata.data.keyword);
    };

    // 2015.07.29(三)
    sephp.act_ref_button_click = function (pdata) {
        /// <summary> 會傳入 engs, chap, sec, ver 資訊. 通常是用來切換章節</summary>
        // console.log("act_ref_button_click not assign., 會傳入 engs, chap, sec, ver 資訊. 通常是用來切換章節");
        var idx = getBookFunc("indexByEngs", pdata.data.engs);
        ps.chineses = book[idx];
        ps.engs = bookEng[idx];
        ps.chap = pdata.data.chap;
        ps.sec = pdata.data.sec;
        triggerGoEventWhenPageStateAddressChange(ps);
        bookSelect.render(pageState, bookSelect.dom);
        fhlLecture.render(pageState, fhlLecture.dom);
        fhlLecture.selectLecture(ps.engs, ps.chap, ps.sec);
        fhlInfo.render(pageState);
    }; //設定按下查詢之後的空白圓圈圈要作的事

    var issn = false;
    if (ps.strong == 1)
        issn = true;
    var isgb = false;
    if (ps.gb == 1)
        isgb = true;
    sephp.node_pre_search = document.getElementById("pre_search");
    sephp.node_search_result = document.getElementById("search_result");

    sephp.search(keyword, issn, isgb, ps.version, ps.engs, isAll);

    {//卷軸與介面.2015.07.29(三)        
        $('#pre_search').scroll(function () {
            $(this).addClass('scrolling');
            clearTimeout($.data(this, "scrollCheck"));
            $.data(this, "scrollCheck", setTimeout(function () {
                $('#pre_search').removeClass('scrolling');
            }, 350));
        });
        $('#search_result').scroll(function () {
            $(this).addClass('scrolling');
            clearTimeout($.data(this, "scrollCheck"));
            $.data(this, "scrollCheck", setTimeout(function () {
                $('#search_result').removeClass('scrolling');
            }, 350));
        });
    }//卷軸與介面.

}
function do_preach(ps, dom) {
    var rRender_Preach;
    var r_Preach;

    var dom2 = document.getElementById("fhlInfoContent");
    if (dom2 != null) {
        r_Preach = React.createElement(preach_api.R.frame, {
            "engs": ps.engs,
            "chap": ps.chap,
            "sec": ps.sec,
            "onset": onset_Preach,
            "isgb": ps.gb
        });
        rRender_Preach = React.render(r_Preach, dom2);
    }
    return;
    function onset_Preach(engs, chap, sec) {
        rRender_Preach.setProps({ "engs": engs, "chap": chap, "sec": sec });
    }
}
// gb: 1 or 0 2020/11 繁簡合併
function gbText(str, gb) {
    if (gb == undefined) {
        gb = pageState.gb;
    }
    if (gb !== 1) { return str; }

    var r1 = {
        "設定": "设定",
        "原文編號": "原文编号",
        "即時顯示": "即时显示",
        "繁簡切換": "繁简切换",
        "地圖顯示": "地图显示",
        "圖片顯示": "图片显示",
        "字體大小": "字体大小",
        "聖經版本選擇": "圣经版本选择",
        "歷史記錄": "历史纪录",
        "清除記錄": "清除记录",
        "經卷選擇": "经卷选择",

        "整卷聖經": "整卷圣经",
        "摩西五經": "摩西五经",
        "舊約歷史書": "旧约历史书",
        "詩歌智慧書": "诗歌智慧书",
        "大先知書": "大先知书",
        "小先知書": "小先知书",
        "福音書": "福音书",
        "新約歷史書": "新约历史书",
        "保羅書信": "保罗书信",
        "其他書信": "其他书信",
        "預言書": "预言书",
    };

    for (var a1 in r1) {
        if (str === a1) {
            return r1[a1];
        }
    }
    return str;
}
function updateLocalStorage() {
    localStorage.setItem("fhlPageState", JSON.stringify(pageState));
}
function triggerGoEventWhenPageStateAddressChange(ps) {
    // assert no use
    return 
    $(document).trigger('go', {
        chineses: ps.chineses,
        chap: ps.chap,
        sec: ps.sec
    });
    // 這個 go, 會使變數存起來, 下起開啟網頁還是會保留原本的 history
}
function windowAdjust() {
    if (!document.mozFullScreen && !document.webkitIsFullScreen) {
        $("#mainWindow").css({ top: "40px" });
        //$("#bookSelectPopUp").css({top: "100px"});
    }

    /* for leftWindow height */
    var height = $(window).height() - $('#fhlTopMenu').height() - 12;
    if (document.mozFullScreen || document.webkitIsFullScreen)
        height += $('#fhlTopMenu').height();

    // mark by snow. 2021.08 用 top bottom 決定大小了
    // $('#fhlLeftWindow').css({ height: height + 'px' });

    // mark by snow. 2021.07
    // $('#viewHistory').css({ top: $('#fhlLeftWindow').height() - $('#viewHistory').height() - 12 + 'px' });
    // $('#versionSelect').css({ height: $('#fhlLeftWindow').height() - $('#settings').height() - $('#viewHistory').height() - 36 + 'px' });
    /* for MidWindow and fhlInfo height */
    //var mainWindow = document.querySelector("#mainWindow");
    height = $(window).height() - $('#fhlTopMenu').height() - $('#fhlToolBar').height() - 36 - 1;
    if (document.mozFullScreen || document.webkitIsFullScreen)
        height += $('#fhlTopMenu').height();

    // mark by snow. 2021.08 用 top bottom 決定大小了
    // $('#fhlMidWindow').css({
    //     height: height + 'px'
    // });
    // mark by snow. 2021.08 用 top bottom 決定大小了
    // $('#fhlInfo').css({
    //     height: height + 'px'
    // });

    /* for MidBottomWindow height */
    var fhlMidBottomWindow$ = $("#fhlMidBottomWindow")
    var lecMain$ = $('#lecMain')
    var isVisiblefhlMidBottomWindowControl = $("#fhlMidBottomWindowControl").hasClass('selected')
    if (isVisiblefhlMidBottomWindowControl)
        height -= ($("#fhlMidBottomWindow").height() + 12);

    // $('#fhlLecture').css({
    //     height: height + 'px'
    // });


    // add by snow. 2021.08
    // $('#fhlMidBottomWindow').css({ 'top': height + 12 + 'px' });
    // if ( isVisiblefhlMidBottomWindowControl ){
    //     if ( fhlMidBottomWindow$.is(':hide') ){
    //         fhlMidBottomWindow$.show()
    //         console.log(lecMain$.offset().top)
    //     }
    // } else {
    //     if ( fhlMidBottomWindow$.is(':visible') ){
    //         fhlMidBottomWindow$.hide()
    //     }
    // }

    /* for fhlMidWinow width */
    var width = $(window).width() - 24;

    if ($("#fhlLeftWindowControl").hasClass('selected'))
        width -= ($("#fhlLeftWindow").width() + 12);

    if ($('#fhlInfoWindowControl').hasClass('selected'))
        width -= ($("#fhlInfo").width() + 12);

    // mark by snow. 2021.08 別的地方算好了
    // $("#fhlMidWindow").css({
    //     'width': width + 'px'
    // });


    /* for fhlInfo width */
    // mark by snow. 2021.08 別的地方算好了
    // var fhlInfoLeft = 10;
    // if ($('#fhlInfoWindowControl').hasClass('selected')) {
    //     $('#fhlInfo').css({
    //         'left': $(window).width() - $('#fhlInfo').width() - 12 + 'px'
    //     });
    // }
    // else {
    //     $('#fhlInfo').css({
    //         'left': $(window).width() + 15 + 'px'
    //     });
    // }

    /*  */
    console.log($('#lecMain'));
    $('#lecMain').scrollTop($('#lecMain').scrollTop() + $('#lecMain').find('.lec.selected').position().top - 80);
}
/**
 * @param {{cbTest:()=>boolean;ms?:number;msg?:string;cntMax?:number}} args 
 */
function testThenDoAsync(args) {
    ifArgsIsUndefined()
    ifArgsIsCallbackTest()

    if (typeof args != 'object') { throw new Error('call testThen Do, args already use {}') }
    return new Promise((res, rej) => {
        args.cbDo = () => res()
        args.cbErr = (err) => res(err)
        testThenDo(args)
    })
    function ifArgsIsUndefined() {
        if (args == undefined) {
            args = {
                cbTest: () => window.Ijnjs != undefined
            }
        }
    }
    function ifArgsIsCallbackTest() {
        if (typeof args == 'function') {
            // 太常只傳 cbTest 了
            cbTest = args
            args = {
                cbTest: cbTest,
                msg: cbTest.toString()
            }
        }
    }
}
/**
 * @param {{cbDo:()=>{};cbTest:()=>boolean;ms?:number;msg?:string;cntMax?:number;cbErr?:(err:any)=>{}}} args 
 */
function testThenDo(args) {
    if (typeof args != 'object') { throw new Error('call testThen Do, args already use {}') }

    var ms = args.ms == undefined ? 333 : args.ms
    var test = args.cbTest == undefined ? () => true : args.cbTest
    var msg = args.msg == undefined ? '' : args.msg
    var cbErr = args.cbErr == undefined ? () => { } : args.cbErr
    var cbDo = args.cbDo == undefined ? () => { } : args.cbDo

    var cntMax = args.cntMax == undefined ? 50 : args.cntMax
    var cnt = 0

    var fnOnce = once;
    try {
        once()
    } catch (error) {
        cbErr(error)
    }

    return
    function once() {
        if (test()) {
            cbDo()
        } else {
            cnt += 1
            if (cnt > cntMax) {
                console.log('wait limit max count. ' + cntMax)
                cbErr(new Error('wait limit max count.' + cntMax))
            } else {
                console.log('wait ' + msg)
                setTimeout(() => {
                    fnOnce()
                }, ms)
            }
        }
    }
}
// 原本的 doIndelLast 中的最後一個
function doAddUrlChangedEventsAddViewHistoryEventsRemoveHelpTextAddVersionInfosDialog() {
    addUrlChangedEvents()
    addViewHistoryEvents()
    removeHelpText()
    addVersionInfosDialog()
    return

    function addUrlChangedEvents() {
        $(function () {
            $(fhlUrlParameter).on('bible', function () {
                console.log('bible trigger')
                // console.log(fhlUrlParameter.bibleResult) // {book: 1, chap: 12, sec: 9}
                if (pageState != undefined) {
                    pageState.chineses = FHL.CONSTANT.Bible.CHINESE_BOOK_ABBREVIATIONS[fhlUrlParameter.bibleResult.book - 1]
                    pageState.engs = FHL.CONSTANT.Bible.ENGLISH_BOOK_ABBREVIATIONS[fhlUrlParameter.bibleResult.book - 1]
                    if (fhlUrlParameter.bibleResult.book > 0) {

                        pageState.bookIndex = fhlUrlParameter.bibleResult.book
                        pageState.chap = fhlUrlParameter.bibleResult.chap >= 0 ? fhlUrlParameter.bibleResult.chap : 1
                        pageState.sec = fhlUrlParameter.bibleResult.sec >= 0 ? fhlUrlParameter.bibleResult.sec : 1

                        fhlLecture.render(pageState, fhlLecture.dom); // 內容
                        bookSelect.render(pageState, bookSelect.dom); // 內容的 title
                    }
                }
            }) // bible event
            $(window).trigger('hashchange')

            $(fhlLecture).on('chapchanged', function () {
                var bookEn = FHL.CONSTANT.Bible.ENGLISH_BOOK_SHORT_ABBREVIATIONS[pageState.bookIndex - 1]
                history.pushState(null, null, '#/bible/' + bookEn + '/' + pageState.chap)
            });
            $(fhlLecture).on('secchanged', function () {
                var bookEn = FHL.CONSTANT.Bible.ENGLISH_BOOK_SHORT_ABBREVIATIONS[pageState.bookIndex - 1];
                history.replaceState(null, null, '#/bible/' + bookEn + '/' + pageState.chap + '/' + pageState.sec)
            });
            $(fhlLecture).trigger('secchanged')

            $(bookSelectChapter).on('chapchanged', function () {
                var bookEn = FHL.CONSTANT.Bible.ENGLISH_BOOK_SHORT_ABBREVIATIONS[pageState.bookIndex - 1]
                history.pushState(null, null, '#/bible/' + bookEn + '/' + pageState.chap)
            })
        });
    }
    function addViewHistoryEvents() {
        $(function () {
            (function () {
                var _datas = [];
                var _idx = -1;

                function trigger_init() {
                    $(document).trigger('vh_init', { datas: _datas, idx: _idx });
                    trigger_vh_idxchanged();
                    trigger_vh_itemschanged();
                }
                function trigger_vh_idxchanged() {
                    $(document).trigger('vh_idxchanged', { datas: _datas, idx: _idx });
                }
                function trigger_vh_itemschanged() {
                    $(document).trigger('vh_itemschanged', { datas: _datas, idx: _idx });
                }

                // callback
                // viewHistory主界面, 按下其中一個選項的時候, 觸發 idx changed
                viewHistory.when_liclick(function (e, p1) {
                    _idx = p1.idx;
                    trigger_vh_idxchanged();
                });
                // viewHistory主界面, 按下清除所有的時候, 觸發 items changed
                viewHistory.when_clearall(function (e) {
                    _datas = [_datas[0]];
                    _idx = 0;
                    trigger_vh_itemschanged();
                });
                // 當別的地方切換章節的時候, 要新增到 datas, 並觸發事件
                docEvent.when_go(function (e, p1) {
                    if (_idx == -1) {
                        _datas = pageState.history;
                        _idx = 0;
                        trigger_init();
                    }
                    // 若只是「切換節」而不是「書卷或是章」，就不處理
                    else if (_datas[_idx].chap != p1.chap || _datas[_idx].chineses != p1.chineses) {
                        // 清空 idx 前
                        var a1 = _datas.slice(_idx, _datas.length);
                        a1.unshift(p1);
                        _datas = a1;
                        _idx = 0;

                        trigger_vh_itemschanged();
                    }
                });
                // 當 history 改變的時候, 要儲存 ps (其實這個不知道放到哪個class較好, 就先放在這)
                docEvent.when_vh_itemschanged(function (e, p1) {
                    pageState.history = p1.datas;
                    setBook(pageState, pageState.chineses);
                    localStorage.setItem("fhlPageState", JSON.stringify(pageState));
                });
                // 當 fhlLecture 中的 back click 或 nextclick 被按的時候
                fhlLecture.when_bclick_or_nclick(function () {
                    if (_idx < _datas.length - 1) {
                        _idx++;
                        trigger_vh_idxchanged();

                        // 下面是原本的code 還沒完全被取代掉 (切換章節,卻不送出go event)
                        var ps = pageState;
                        setBook(ps, _datas[_idx].chineses);
                        ps.chap = _datas[_idx].chap;
                        ps.sec = 1;
                        //setPageState(ps); // 不要 trigger 出 'go'
                        bookSelect.render(ps, bookSelect.dom);
                        fhlInfo.render(ps, fhlInfo.dom);
                        fhlLecture.render(ps, fhlLecture.dom);
                    }
                }, function () {
                    if (_idx > 0) {
                        _idx--;
                        trigger_vh_idxchanged();

                        // 下面是原本的code 還沒完全被取代掉 (切換章節,卻不送出go event)
                        var ps = pageState;
                        setBook(ps, _datas[_idx].chineses);
                        ps.chap = _datas[_idx].chap;
                        ps.sec = 1;
                        //setPageState(ps); // 不要 trigger 出 'go'
                        bookSelect.render(ps, bookSelect.dom);
                        fhlInfo.render(ps, fhlInfo.dom);
                        fhlLecture.render(ps, fhlLecture.dom);
                    }
                });
                // 等待 ps.history ok 就觸發觸始化
                (function () {
                    function tryit() {
                        if (pageState == null || pageState.history == null || pageState.history.length == 0)
                            setTimeout(tryit, 777);//try it again
                        else
                            triggerGoEventWhenPageStateAddressChange(pageState)                            
                    }
                    setTimeout(tryit, 777);
                })();

                // 模擬 1
                //_datas.push({ chineses: '創', chap: 1 });
                //_datas.push({ chineses: '出', chap: 1 });
                // _idx = 0;
                // trigger_init();

                // 模擬 2
                //setTimeout(function () {
                //  _idx = 1;
                //  trigger_vh_idxchanged();
                //}, 2000);

                // 模擬 3
                //setTimeout(function () {
                //  _datas.push({ chineses: '創', chap: 3 });
                //  _idx = 0;

            })();
        });
    }
    function removeHelpText() {
        /* 改由 after 來寫 ? 所以，padding 可一致 */
        testThenDoAsync(() => $('#help').length != 0 && $('#help').text().length != 0)
            .then(() => {
                $('#help').html('') // 清除掉原本的 ?         
            })
    }
    function addVersionInfosDialog() {
        // 會動態載入 .css 檔 (open時才會)
        // 會動態讀入 app_versions.json 資訊 (open時)
        testThenDoAsync(() => $('#title').length != 0).then(
            () => {
                {
                    var r1 = $('#title').children().first()
                    var r3 = $('<div id="version-infos"><div class="contents"></div></div>')
                    r1.append(r3)
                    r1.css({ "color": 'blue', "text-decoration": "underline", "cursor": "pointer" })

                    var cy = $(window).height()
                    var cx = $(window).width()
                    r3.dialog({
                        autoOpen: false,
                        resizable: true,
                        maxHeight: cy,
                        width: cx * 0.9,
                        title: 'NUI版本更新資訊',
                        modal: true,
                        position: {
                            my: 'center top',
                            at: 'center top',
                        },
                        show: {
                            effect: 'highlight'
                        },
                        open: function (event, ui) {
                            var r4 = r3.find('.contents')
                            if (r4.children().length == 0) {
                                setDomVersionInfo()
                                Ijnjs.loadCssSync('index/version-infos-dialog.css')
                            }
                            return;
                            function setDomVersionInfo() {
                                if (r4.children().length != 0) {
                                    return;
                                }

                                for (var it of getDataList()) {
                                    r4.append($(gHtml(it)));
                                }
                                r4.children(":odd").addClass("odd")

                                return;
                                function getDataList() {
                                    var jo = getJoAppVersion()

                                    return jo.nui.historys
                                    function getJoAppVersion() {
                                        var re = {
                                            nui: {
                                                last: '',
                                                historys: [{ na: '', na2: ['', ''], img: [''] }, { na: '', na2: [''] }]
                                            },
                                            rwd: {
                                                last: ''
                                            }
                                        }
                                        $.ajax({ url: 'app_versions.json', dataType: 'text', async: false, cache: false, success: cb })
                                        return re
                                        function cb(str) {
                                            re = JSON.parse(str)
                                        }
                                    }
                                }

                                function gHtml(it) {
                                    function isNullOrEmpty(str) {
                                        return str === undefined || str.length === 0;
                                    }

                                    function gArrayList_UlLi(array) {
                                        if (Array.isArray(array)) {

                                            var r4a = it.na2.map(function (a1) {
                                                return '<li>' + a1 + '</li>';
                                            }).join('');
                                            return re = '<span><ul>' + r4a + '</ul></span>';
                                        } else {
                                            return undefined;
                                        }
                                    }
                                    // <div>
                                    // <span>200529a_點擊節_工具隨著變</span>
                                    // youtube、示意圖、
                                    // xxxxxxxxxxxxxx<br/>xxxxxxxx
                                    // </div>
                                    var na = it.na;
                                    var r1 = '<span class="na">' + na + '</span><br/>';
                                    var r2 = !isNullOrEmpty(it.yt) ? ('<a href="' + it.yt + '" target="_blank">youtube、</a>') : '';
                                    // var r3 = !isNullOrEmpty(it.img) ? ('<a href="' + it.img + '" target="_blank">示意圖、</a>') : '';
                                    var r3 = doImgs(it.img)
                                    var r23 = r2 + r3;
                                    if (!isNullOrEmpty(r23)) r23 += '<br/>';

                                    var r4 = !isNullOrEmpty(it.na2) ? ('<span class="na2">' + it.na2 + '</span>') : '';
                                    if (Array.isArray(it.na2))
                                        r4 = gArrayList_UlLi(it.na2);
                                    // console.log(r4);

                                    return '<div>' + r1 + r23 + r4 + '</div>';

                                    /**
                                     * 
                                     * @param {string|string[]|undefined} imgs 
                                     * @returns 
                                     */
                                    function doImgs(imgs) {
                                        if (imgs === undefined) { return '' }
                                        // <a href="xxxxx.jpg" target="_blank">示意圖、</a>
                                        if (Array.isArray(imgs)) {
                                            return imgs.map(doImg).join('')
                                        } else if (typeof imgs === 'string') {
                                            return doImg(imgs)
                                        }
                                        return ''

                                        function doImg(img) {
                                            var url = getServerRootDirectory(img) + img
                                            var r2 = generateLink(url, gPicture(url))
                                            return r2

                                            function getServerRootDirectory(img) {
                                                if (/https?:\/\//i.test(img)) {
                                                    return ''
                                                }
                                                var r1 = Ijnjs.Path.getDirectoryName(location.pathname)
                                                return r1 + '/images/'
                                            }
                                            function generateLink(url, innerHtml) {
                                                return '<a href="' + url + '" target="_blank">' + innerHtml + '</a>'
                                            }
                                            function gImg(url) {
                                                return '<img src="' + url + '" alt="點擊觀看、"  style="height: 8rem;"></img>'
                                            }
                                            function gPicture(url) {
                                                // https://www.infoq.cn/article/animated-gif-without-the-gif

                                                var ext = Ijnjs.Path.getExtension(url)
                                                if (/(gif)|(mov)|(mp4)/i.test(ext)) {
                                                    // var r2 = $('<picture></picture>')                  
                                                    // var mov = Ijnjs.Path.changeExtension(url, '.mov')
                                                    // var mp4 = Ijnjs.Path.changeExtension(url, '.mp4')
                                                    // var gif = Ijnjs.Path.changeExtension(url, '.gif')
                                                    // $('<source type="video/mp4" srcset="' + mp4 + '">').appendTo(r2)
                                                    // $('<source type="video/mov" srcset="' + mov + '">').appendTo(r2)
                                                    // $(gImg(gif)).appendTo(r2)
                                                    // return r2[0].outerHTML
                                                    // console.log( navigator.userAgent )
                                                    if (/firefox/i.test(navigator.userAgent)) {
                                                        return '點擊觀看影片' // firefox 無法正確播放，很怪。
                                                    }

                                                    var mp4 = Ijnjs.Path.changeExtension(url, '.mp4')
                                                    var mov = Ijnjs.Path.changeExtension(url, '.mov')
                                                    return '<video muted loop controls class="img-thumbnail">' +
                                                        '<source src="' + mp4 + '" type="video/mp4" />' +
                                                        '<source src="' + mov + '" type="video/mov" />' +
                                                        // '<p>Your browser doesnt support HTML5 video. Here is a <a href="' + url + '">link to the video</a> instead.</p>' + 
                                                        '</video>'
                                                } else {
                                                    var r2 = $('<picture></picture>')
                                                    $(gImg(url)).appendTo(r2)
                                                    return r2[0].outerHTML
                                                }
                                            }

                                        }
                                    }
                                }
                            }

                        },
                    });
                    $(r1).click(() => {
                        r3.dialog("open")
                    })
                }
            }
        )
    }
}

function gShowMode() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
            if (ps.show_mode == null)
                ps.show_mode = 1;
        },
        registerEvents: function (ps) {
            $('#show_modeSwitch').change(
                function () {
                    if ($(this).is(':checked')) {
                        // checked 是指開啟圓圈移到右邊. 那就應該是 出現「交錯」
                        ps.show_mode = 2;
                        pageState.show_mode = 2
                        //ps.chineses = bookGB[book.indexOf(ps.chineses)];
                        fhlLecture.render(ps, fhlLecture.dom);
                    }
                    else {
                        // 出現「並列」
                        ps.show_mode = 1;
                        pageState.show_mode = 1
                        //ps.chineses = book[bookGB.indexOf(ps.chineses)];
                        fhlLecture.render(ps, fhlLecture.dom);
                    }
                    triggerGoEventWhenPageStateAddressChange(ps);
                    updateLocalStorage()
                });
        },
        render: function (ps, dom) {
            var html = "<div>" + gbText("顯示切換", ps.gb) + ":</div>";
            html += '<div class="onOffSwitch">\
                                  <input type="checkbox" name="show_modeSwitch" class="onOffSwitch-checkbox" id="show_modeSwitch">\
                                  <label class="onOffSwitch-label" for="show_modeSwitch">\
                                      <span class="onOffSwitch-inner showmodeSwitch"></span>\
                                      <span class="onOffSwitch-switch"></span>\
                                  </label>\
                              </div>';
            //html += '<span style="color: #770000;">施工中...</span>';
            dom.html(html);
            $('#show_modeSwitch').attr("checked", (ps.show_mode == 2) ? true : false);
        }
    };
}
function gFhlLeftWindow() {
    return {
        init: function (ps) {
            settings.init(ps, $('#settings'));
            settings.registerEvents(ps);

            viewHistory.init(ps, $('#viewHistory'));
            initialVersionDialogAsync()

            this.registerEvents();
            return // init
            function initialVersionDialogAsync() {
                $('#versionSelect').hide()  // 不再使用，但又不知道它從哪初始
                return new Promise(res => {
                    setTimeout(() => {
                        // 如果沒用 timeout 400, 來 hide, 只會 hide 一個
                        // 也就是我不知道它從哪時建立起來的. 
                        $('.ui-resizable-handle.ui-resizable-s').hide()
                        $('#versionSelect').hide()

                        // 初始化
                        renderVersionSelect2()
                        renderVersionSelect3()

                        initSetVersionDialogAsync()
                        leftWindowTool.closeSettings()
                        res()
                    }, 300);
                })
                function renderVersionSelect3() {
                    $('<span>', {
                        id: 'versionSelect3',
                    }).append($('<i class="bi-layout-three-columns"></i>'))
                        .prependTo($('#windowControlButtons'))
                }
                function renderVersionSelect2() {
                    // <div id=versionSelect2><p>聖經版本選擇</</           
                    var r1 = $('<div>', {
                        id: 'versionSelect2',
                    }).append($('<p/>', {
                        text: gbText('聖經版本選擇', ps.gb)
                    }))
                    $('#settings').before(r1)
                }
                function initSetVersionDialogAsync() {
                    var aa = {}

                    testThenDoAsync({
                        cbTest: () => Ijnjs.BibieVersionDialog != undefined,
                        msg: '初始 Dialog 聖經版本選擇'
                    }).then(() => {
                        {
                            var s = Ijnjs.BibieVersionDialog.s
                            s.setCallbackClosed(jo => {
                                aa = jo
                                var vers = jo.selects
                                pageState.versionOffens = jo.offens
                                pageState.versionSets = jo.sets

                                if (vers.length == 0) {
                                    return // 不作事
                                }

                                /** @type {string[]} */
                                var r1 = pageState.version
                                var isChanged = vers.length != r1.length ||
                                    Enumerable.range(0, r1.length).any(i => r1[i] != vers[i]) // 順序交換，也是改變

                                if (isChanged) {
                                    pageState.version = vers
                                    // pageState.cname = [] // 原本也有設 cname,  (好像沒有也沒關係, 注解先保留著好了)
                                    triggerGoEventWhenPageStateAddressChange(pageState)
                                    fhlLecture.render(pageState, fhlLecture.dom)
                                }
                                updateLocalStorage()
                            })
                            s.setCallbackOpened(() => { })

                            testThenDoAsync(() => window.abvphp != null && window.abvphp.isReadyGlobalBibleVersions())
                                .then(() => {
                                    s.setVersionsFromApi(getAbvResult())
                                    function getAbvResult() {
                                        var r1 = pageState.gb == 1 ? abvphp.g_bibleversionsGb : abvphp.g_bibleversions
                                        var r2 = Enumerable.from(r1).select(a1 => ({ 'na': a1.value.book, 'cna': a1.key })).toArray()
                                        return r2
                                    }
                                })



                            $('#versionSelect2').on('click', open)
                            $('#versionSelect3').on('click', open)

                            return
                            function open() {
                                Ijnjs.BibieVersionDialog.s.open({
                                    selects: pageState.version,
                                    offens: pageState.versionOffens,
                                    sets: pageState.versionSets,
                                })

                            }
                        }
                    })
                }
            }

        },
        registerEvents: function () {
            $('#fhlLeftWindow').resizable({
                handles: 'e',
                maxWidth: 300,
                // minWidth: 170,
                resize: function (event, ui) {
                    var currentWidth = ui.size.width;

                    pageState.cxLeftWindow = currentWidth // add by snow. 2021.07
                    updateLocalStorage()

                    var fhlMidWindowWidth;
                    if ($('#fhlInfoWindowControl').hasClass('selected'))
                        fhlMidWindowWidth = $(window).width() - $("#fhlInfo").width() - currentWidth;
                    else
                        fhlMidWindowWidth = $(window).width() - currentWidth + 12;

                    $("#fhlMidWindow").css({
                        'width': fhlMidWindowWidth - 12 * 4 + 'px',
                        'left': currentWidth + 12 + 12 + 'px'
                    });

                    // add by snow. 2021.08
                    // toolbar 已經移到最上面，不需要再因 left 改變，而改變 toolbar 的 left 了
                    // $('#fhlToolBar').css({
                    //     //'width': $(window).width()-$("#fhlLeftWindow").width()-36+'px',
                    //     'left': currentWidth + 12 + 12 + 'px',
                    //     'right': '12px'
                    // });

                    // snow add 2016-07
                    fhlLecture.reshape(pageState);
                }
            });
            $('.ui-resizable-handle.ui-resizable-e').html('<span>☰</span>');
        }
    };
}
function gfhlToolBar() {
    return {
        init: function (ps) {
            //this.registerEvents();
            help.init(ps, $('#help'));
            windowControl.init(ps, $('#windowControl'));
            // windowControl.registerEvents(ps); // mark by snow. 2021.07 init 裡就有呼叫了                        
            bookSelect.init(ps, $('#bookSelect'));
            searchTool.init(ps, $('#searchTool'));
            searchTool.registerEvents(ps);
        }
    };
}
function gHelp() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
            helpingPopUp.init(ps, $('#helpingPopUp'));
        },
        registerEvents: function (ps) {
            this.dom.on('click', function () {
                // console.log($(this)) // div #help
                if ($('#helpingPopUp').css('opacity') == 1) {
                    $('#helpingPopUp').css({
                        'visibility': 'hidden',
                        'opacity': '0'
                    });
                } else {
                    $('#helpingPopUp').css({
                        'visibility': 'visible',
                        'opacity': '1'
                    });
                }
            });
        },
        render: function (ps, dom) {
            var html = "";
            html += '?';
            dom.html(html);
            this.registerEvents(ps);
        }
    };
}
function gHelpingPopUp() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {
            $('#helpCloseButton').click(function () {
                $('#helpingPopUp').css({
                    'visibility': 'hidden',
                    'opacity': '0'
                });
            });
        },
        render: function (ps, dom) {
            var html = "";
            html += '<div><div id="helpCloseButton"><i class="fa fa-times"></i></div><ul>\
                          <li>Alt + Shift + F: 搜尋</li>\
                          <li>Alt + Shift + S: 快速選章</li>\
                          <li>Alt + Shift + L: 全螢幕</li>\
                          <li>Alt + Shift + Z: 設定視窗開關</li>\
                          <li>Alt + Shift + X: 搜尋視窗開關</li>\
                          <li>Alt + Shift + C: 輔助視窗開關</li>\
                          <li>Alt + Shift + /: 幫助，跳出</li>\
                          </ul></div>';
            $('#helpingPopUpInside').html(html);
            this.registerEvents(ps);
        }
    }
}
function gWindowControl() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
            this.registerEvents(ps);
        },
        registerEvents: function (ps) {
            $('#windowControlIcon').click(function (e) {
                if ($(this).hasClass('selected')) {
                    var that = $(this);
                    that.animate({ left: '0px' });
                    $("#windowControl").animate({ width: '30px' }, function () {
                        that.removeClass('selected');
                    });
                    $("#windowControlButtons").animate({ opacity: 0 }, 100);
                }
                else {
                    var that = $(this);
                    that.animate({ left: '20px' });
                    $("#windowControl").animate({ width: '350px' }, function () {
                        that.addClass('selected');
                    });
                    $("#windowControlButtons").animate({ opacity: 1 }, 800);
                }
                e.stopPropagation();
            });
            $(document).click(function () {
                if ($('#windowControlIcon').hasClass('selected')) {
                    //$('#windowControlIcon').trigger( "click" );
                }
            });


            $('#fhlLeftWindowControl').click(function () {
                if ($(this).hasClass('selected')) {
                    coreInfoWindowShowHide(function () {
                        fhlLecture.reshape(ps);
                    }, false, undefined)
                }
                else {

                    coreInfoWindowShowHide(function () {
                        fhlLecture.reshape(ps);
                    }, true, undefined)
                }

            });
            $('#fhlMidBottomWindowControl').click(function () {
                var this$ = $(this)
                var fhlMidBottomWindow$ = $('#fhlMidBottomWindow')
                if (this$.hasClass('selected')) {
                    this$.removeClass('selected');
                    // var fhlMidBottomWindowHeight = fhlMidBottomWindow$.height();
                    // fhlMidBottomWindow$.animate({ top: $('#fhlMidWindow').height() + 15 + 'px', bottom: -fhlMidBottomWindowHeight - 15 + 'px' });
                    // $("#fhlLecture").animate({ bottom: '0px', height: $("#fhlLecture").height() + fhlMidBottomWindowHeight + 12 + 'px' }, function () {
                    //   this$.removeClass('selected');
                    // });
                    fhlMidBottomWindow$.hide()
                    fhlMidBottomWindow.updateBottomOfLecture()
                }
                else {
                    this$.addClass('selected');
                    fhlMidBottomWindow$.show()
                    // var fhlMidBottomWindowHeight = fhlMidBottomWindow$.height();
                    // fhlMidBottomWindow$.animate({ top: $('#fhlMidWindow').height() - fhlMidBottomWindowHeight + 'px', bottom: '0px' });            
                    // $("#fhlLecture").animate({ bottom: fhlMidBottomWindowHeight + 'px', height: $("#fhlLecture").height() - fhlMidBottomWindowHeight - 12 + 'px' }, function () {

                    // });
                    fhlMidBottomWindow.updateMaxHeightOfResizableAndOfDom()
                    fhlMidBottomWindow.updateBottomOfLecture()
                }
            });

            $('#fhlInfoWindowControl').click(function () {
                if ($(this).hasClass('selected')) {
                    coreInfoWindowShowHide(function () {
                        fhlLecture.reshape(ps);
                    }, undefined, false)
                } else {
                    coreInfoWindowShowHide(function () {
                        fhlLecture.reshape(ps);
                    }, undefined, true)
                }
            });
            $('#fullscreenControl').on('click', function () {
                if ($(this).hasClass('selected')) {
                    var that = $(this);
                    setTimeout(function () { that.removeClass('selected'); }, 1);
                }
                else {
                    var that = $(this);
                    requestFullscreen();
                    setTimeout(function () { that.addClass('selected'); }, 1);
                }
            })


            $('#windowControl').click(function (e) {
                e.stopPropagation();
            });
        },
        render: function (ps, dom) {
            var html = "<i id='windowControlIcon' class='fa fa-tv fa-fw selected'></i><div id='windowControlButtons'><span id='fhlLeftWindowControl' class='selected' ><i class='fa fa-wrench fa-fw'></i></span><span id='fhlMidBottomWindowControl'><i class='fa fa-search-plus fa-fw'></i></span><span id='fhlInfoWindowControl' class='selected'><i class='fa fa-file-text-o fa-fw'></i></span><space style='margin: 0px 10px; cursor: default; color: #D0D0D0;'>|</space><span id='fullscreenControl'><i class='fa fa-arrows-alt fa-fw'></i></span></div>";
            dom.html(html);
        }
    }
}
function gBookSelect() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
            bookSelectPopUp.init(ps, $('#bookSelectPopUp'));
            bookSelectPopUp.registerEvents(ps);
        },

        /**
         * 
         * @param {DPageState} ps 
         */
        registerEvents: function (ps) {
            var that = this;
            $('#bookSelect').unbind().click(function (e) { // 加上unbind() 讓創世記第二節之後的dropdown不會自動消失
                var cx = $(window).width()
                if (cx < 1280) { // 那個視窗大概需1100，取個 1280 吧
                    /**
                     * @type {Ijnjs.BookChapDialog}
                     */
                    var dlg = Ijnjs.BookChapDialog.s // 不想打字那麼長而已，非必要        
                    dlg.setCBHided(() => {
                        var re = dlg.getResult()
                        ps.chineses = book[re.book - 1]
                        ps.engs = bookEng[re.book - 1]
                        ps.chap = re.chap
                        ps.sec = 1
                        ps.bookIndex = re.book
                        triggerGoEventWhenPageStateAddressChange(ps);
                        bookSelect.render(ps, bookSelect.dom);
                        fhlLecture.render(ps, fhlLecture.dom);
                        viewHistory.render(ps, viewHistory.dom);
                        fhlInfo.render(ps);
                        bookSelectPopUp.dom.hide();
                        //bookselectchapter.dom.hide();
                        bookSelect.dom.css({
                            'color': '#FFFFFF'
                        });

                        $(that).trigger('chapchanged');
                    })
                    Ijnjs.BookChapDialog.s.show({ book: ps.bookIndex, chap: ps.chap, isGb: ps.gb == 1 })
                } else {
                    if (bookSelectPopUp.dom.is(":visible")) {
                        bookSelectPopUp.dom.fadeOut('0.2');
                        setTimeout(function () {
                            bookSelect.dom.css({ 'color': '#D0D0D0' });
                        }, 200);
                    } else {
                        bookSelectPopUp.dom.fadeIn('0.2');
                        bookSelect.dom.css({ 'color': '#00A0FF' });
                    }
                }

                e.stopPropagation();
            });
            $('#bookSelectPopUp').click(function () {
                bookSelectPopUp.dom.fadeOut('0.2');
                setTimeout(function () { bookSelect.dom.css({ 'color': '#D0D0D0' }); }, 200);
            });
            $(document).click(function () {
                bookSelectPopUp.dom.fadeOut('0.2');
                setTimeout(function () { bookSelect.dom.css({ 'color': '#D0D0D0' }); }, 200);
            });
            $('#bookSelectName').click(function (e) {
                e.stopPropagation();
            });
            $('#bookSelect').mouseenter(function () {
                if (!bookSelectPopUp.dom.is(":visible")) {
                    bookSelect.dom.css({ 'color': '#00A0FF' });
                }
            });
            $('#bookSelect').mouseleave(function () {
                if (!bookSelectPopUp.dom.is(":visible")) {
                    bookSelect.dom.css({ 'color': '#D0D0D0' });
                }
            });
        },
        render: function (ps, dom) {
            var bookName = getBookFunc("bookFullName", ps.chineses);
            var html = "";
            if (bookName != "詩篇" && bookName != "诗篇")
                html = bookName + "： 第" + chineseNumber[ps.chap] + "章";
            else
                html = bookName + "： 第" + chineseNumber[ps.chap] + "篇";
            html += '&nbsp;&#9660;';
            dom.html(html);
            this.registerEvents(ps);
        }
    }
}
function gBookSelectPopUp() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            bookSelectName.init(ps, $('#bookSelectName'));
            bookSelectName.registerEvents(ps);
            this.dom.hide();
        },
        registerEvents: function (ps) {
            var that = this;
            this.dom.click(function (e) {
                e.stopPropagation();
            });
        }
    }
}
function gBookSelectName() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {
            var that = this.dom;
            var isBookSelectChapterPopUp = false;

            this.dom.find('li li').click(function () {
                var that = $(this);
                var selectedColumnIndex = $(this).parents('li').index();
                //var previousColumnIndex = bookSelectName.dom.find('#old-testament>ul>li.selected').index();
                //var previousRowIndex = bookSelectName.dom.find('li li.selected').index();
                //console.log(previousColumnIndex);
                bookSelectName.dom.find('#old-testament>ul>li').removeClass('selected');

                if (bookSelectName.dom.find('li li.selected').attr('chineses') == $(this).attr('chineses'))
                    $('.testaments>ul>li').animate({ left: '0px' }, { queue: false, duration: 300 });
                else
                    $(this).parents('li').addClass('selected');
                setTimeout(function () {
                    if (isBookSelectChapterPopUp === true && that.hasClass('selected')) {
                        isBookSelectChapterPopUp = true;
                        bookSelectName.dom.find('li li').removeClass('selected');
                        bookSelectChapter.dom.hide();
                    }
                    else {
                        $('#old-testament>ul>li:lt(' + selectedColumnIndex + ')').animate({ left: '-75px' }, { queue: false, duration: 200 });
                        $('#old-testament>ul>li:eq(' + selectedColumnIndex + ')').animate({ left: '-75px' }, { queue: false, duration: 200 });
                        $('#old-testament>ul>li:gt(' + selectedColumnIndex + ')').animate({ left: '75px' }, { queue: false, duration: 200 });
                        var idx = getBookFunc("index", that.attr('chineses'));
                        var isIE11 = !!navigator.userAgent.match(/Trident.*rv\:11\./);

                        if (/msie/.test(navigator.userAgent.toLowerCase())) //replace 2016.11, 參照: http://www.fwolf.com/blog/post/35
                        // if ($.browser.msie || isIE11) ( jQuery 1.90之後就不支援了)//mark 2016.11
                        {
                            var position = that.offset();
                            position.left = $('#old-testament').offset().left + 128 * (selectedColumnIndex) + 50;
                            position.top = $('#old-testament').offset().top + 30;
                            bookSelectChapter.init(ps, $('#bookSelectChapter'), idx, position);
                        }
                        else {
                            var position = that.offset();
                            position.left = $('#old-testament').position().left + that.position().left + 128 * (selectedColumnIndex) + 40;
                            position.top = $('#old-testament').position().top + 25;
                            bookSelectChapter.init(ps, $('#bookSelectChapter'), idx, position);
                        }
                        bookSelectChapter.registerEvents(ps);
                        bookSelectName.dom.find('li li').removeClass('selected');
                        that.addClass('selected');
                        isBookSelectChapterPopUp = true;
                        bookSelectChapter.dom.show();
                    }
                }, 1);
            });
        },
        render: function (ps, dom) {
            var nagb = ps.gb !== 1 ? bookFullName : bookFullName2;
            // gb text
            function gbt(str) {
                return gbText(str, ps.gb) // 一致用 gbText 2021-07 Snow
            }
            var html = "<div id='bookSelectTitle'>" + gbt("經卷選擇") + "</div><div id='bookSelectChapter'></div>";
            html += "<div id='old-testament' class='testaments'><ul><li></li><li>";
            html += "<span class='bookClass'>" + gbt("摩西五經") + "</span>";
            html += "<ul>";
            for (var i = 0; i < 5; i++)
                html += "<li><span>" + nagb[i] + "<i class='fa fa-angle-right fa-fw'></i></span></li>";
            html += "</ul>";

            html += "<span class='bookClass'>" + gbt("舊約歷史書") + "</span><ul>";
            for (var i = 5; i < 17; i++)
                html += "<li><span>" + nagb[i] + "<i class='fa fa-angle-right fa-fw'></i></span></li>";
            html += "</ul></li><li><span class='bookClass'>" + gbt("詩歌智慧書") + "</span><ul>";
            for (var i = 17; i < 22; i++)
                html += "<li><span>" + nagb[i] + "<i class='fa fa-angle-right fa-fw'></i></span></li>";
            html += "</ul><span class='bookClass'>" + gbt("大先知書") + "</span><ul>";
            for (var i = 22; i < 27; i++)
                html += "<li><span>" + nagb[i] + "<i class='fa fa-angle-right fa-fw'></i></span></li>";
            html += "</ul></li><li><span class='bookClass'>" + gbt("小先知書") + "</span><ul>";
            for (var i = 27; i < 39; i++)
                html += "<li><span>" + nagb[i] + "<i class='fa fa-angle-right fa-fw'></i></span></li>";
            html += "</ul></li><li><span class='bookClass'>" + gbt("福音書") + "</span><ul>";
            for (var i = 39; i < 43; i++)
                html += "<li><span>" + nagb[i] + "<i class='fa fa-angle-right fa-fw'></i></span></li>";
            html += "</ul><span class='bookClass'>" + gbt("新約歷史書") + "</span><ul>";
            for (var i = 43; i < 44; i++)
                html += "<li><span>" + nagb[i] + "<i class='fa fa-angle-right fa-fw'></i></span></li>";
            html += "</ul></li><li><span class='bookClass'>" + gbt("保羅書信") + "</span><ul>";
            for (var i = 44; i < 57; i++)
                html += "<li><span>" + nagb[i] + "<i class='fa fa-angle-right fa-fw'></i></span></li>";
            html += "</ul></li><li><span class='bookClass'>" + gbt("其他書信") + "</span><ul>";
            for (var i = 57; i < 66; i++)
                html += "<li><span>" + nagb[i] + "<i class='fa fa-angle-right fa-fw'></i></span></li>";
            //html += "</ul><span class='bookClass'>"+gbt("預言書")+"</span><ul>";
            //for (var i = 65; i < 66; i++)
            //  html += "<li><span>" + nagb[i] + "<i class='fa fa-angle-right fa-fw'></i></span></li>";
            html += "</ul></li><li></li></ul></div>";

            dom.html(html);

            for (var i = 0; i < nagb.length; i++) {
                dom.find('li li:eq(' + i + ')').attr('chineses', book[i]);
            }
            /*for(var i=0;i<bookFullName.length;i++){
              dom.find('li:eq('+i+')').attr('chineses',book[i]);
            }*/
        }
    }
}
function gBookSelectChapter() {
    return {
        init: function (ps, dom, idx, position) {
            this.dom = dom;
            this.idx = idx;
            this.dom.css({
                'position': 'fixed',
                'left': position.left,
                'top': position.top,
                'box-shadow': 'inset 0px 0px 5px 1px rgba(0,0,0,0.75)',
            });
            this.render(ps, this.dom, this.idx);
        },
        registerEvents: function (ps) {
            var that = this;
            this.dom.find('li').click(function () {
                ps.chineses = book[that.idx];
                ps.engs = bookEng[that.idx];
                ps.chap = parseInt($(this).attr('chap'));
                ps.sec = 1;
                ps.bookIndex = that.idx + 1; // 0-based轉1-based (book已經被注釋用掉了)
                triggerGoEventWhenPageStateAddressChange(ps);
                bookSelect.render(ps, bookSelect.dom);
                fhlLecture.render(ps, fhlLecture.dom);
                viewHistory.render(ps, viewHistory.dom);
                fhlInfo.render(ps);
                bookSelectPopUp.dom.hide();
                //bookselectchapter.dom.hide();
                bookSelect.dom.css({ 'color': '#FFFFFF' });

                $(that).trigger('chapchanged');
            });
            $(document).click(function () {
                //bookselectchapter.dom.hide('0.2');
            });
            this.dom.mouseenter(function () {
                clearTimeout($.data($('#bookSelectChapter')[0], "bookSelectChapterAutoCloseTimeout"));
            });
        },
        render: function (ps, dom, idx) {
            var numOfChapters = bookChapters[idx];
            var html = "<div><ul>";
            for (var i = 1; i <= numOfChapters; i++) {
                html += "<li>" + i + "</li>";
            }
            html += "</ul></div>";
            dom.html(html);
            for (var i = 0; i < numOfChapters; i++) {
                dom.find('li:eq(' + i + ')').attr('chap', i + 1);
            }
        }
    }
}
function gSettings() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
            snSelect.init(ps, $('#snSelect'));
            snSelect.registerEvents(ps);
            realTimePopUpSelect.init(ps, $('#realTimePopUpSelect'));
            realTimePopUpSelect.registerEvents(ps);
            gbSelect.init(ps, $('#gbSelect'));
            gbSelect.registerEvents(ps);
            show_mode.init(ps, $('#show_mode'));
            show_mode.registerEvents(ps);
            mapTool.init(ps, $('#mapTool'));
            mapTool.registerEvents(ps);
            imageTool.init(ps, $('#imageTool'));
            imageTool.registerEvents(ps);
            fontSizeTool.init(ps, $('#fontSizeTool'));

            fontSizeTool.registerEvents(ps);
            // add by snow. 2021.07
            // 字體大小，希伯來文獨立出來設定
            var fontSizeHebrewTool = new FontSizeToolBase("Hebrew")
            $('#settingsScrollDiv ul').append("<li><div id='" + fontSizeHebrewTool.getId() + "'></div></li>")
            fontSizeHebrewTool.init(ps, $('#' + fontSizeHebrewTool.getId()))

            // add by snow. 2021.07
            // 字體大小，希臘文獨立出來設定
            var fontSizeGreekTool = new FontSizeToolBase("Greek")
            $('#settingsScrollDiv ul').append("<li><div id='" + fontSizeGreekTool.getId() + "'></div></li>")
            fontSizeGreekTool.init(ps, $('#' + fontSizeGreekTool.getId()))

            // add by snow. 2021.07
            // 字體大小，StrongNumber文獨立出來設定
            var fontSizeStrongNumberTool = new FontSizeToolBase("Sn")
            $('#settingsScrollDiv ul').append("<li><div id='" + fontSizeStrongNumberTool.getId() + "'></div></li>")
            fontSizeStrongNumberTool.init(ps, $('#' + fontSizeStrongNumberTool.getId()))
        },
        registerEvents: function (ps) {
            $('#settings p')
                .on('click', function () {
                    if (false == leftWindowTool.isOpenedSettings(this)) {
                        leftWindowTool.openSettings()
                    }
                    else {
                        leftWindowTool.closeSettings()
                    }
                });

            // mark by snow. 2021.07 不再允許 (沒有人會開著設定，通常是開著 history)
            // $('#settings').resizable({
            //   handles: 's',
            //   maxHeight: 280,
            //   minHeight: 38,
            //   resize: function (event, ui) {

            //     var maxHeight = $('#fhlLeftWindow').height() - 38 - $('#viewHistory').height() - 36;
            //     if (ui.size.height > maxHeight) {//不可以超過其他的bar
            //       ui.size.height = maxHeight;
            //       $("#versionSelect p").html("&#9654;&nbsp;"+gbText("聖經版本選擇",ps.gb));
            //     }
            //     var height = $('#fhlLeftWindow').height() - $('#viewHistory').height() - ui.size.height;
            //     $("#versionSelect").css({
            //       'top': ui.size.height + 12 + 'px',
            //       'height': height - 36 + 'px'
            //     });
            //     $(this).css({
            //       width: 'auto',
            //       right: '0px'
            //     });
            //     var html = $(this).css('height') == '38px' ? "&#9654;&nbsp;"+gbText("設定",ps.gb) : "&#9660;&nbsp;設定"+gbText("設定",ps.gb);
            //     $('#settings p').html(html);
            //     var html = $('#versionSelect').css('height') == '38px' ? "&#9654;&nbsp;"+gbText("聖經版本選擇",ps.gb) : "&#9660;&nbsp;"+gbText("聖經版本選擇",ps.gb);
            //     $('#versionSelect p').html(html);
            //   }
            // });
            // $('.ui-resizable-handle.ui-resizable-s').html('<span>☰</span>');
            $('#settingsScrollDiv').scroll(function () {
                $(this).addClass('scrolling');
                clearTimeout($.data(this, "scrollCheck"));
                $.data(this, "scrollCheck", setTimeout(function () {
                    $('#settingsScrollDiv').removeClass('scrolling');
                }, 350));
            });
        },
        render: function (ps, dom) {
            //dom.html("設定");
        }
    };
}
function gSnSelect() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {
            $('#snOnOffSwitch').change(
                function () {
                    if ($(this).is(':checked')) {
                        ps.strong = 1;
                        pageState.strong = 1
                        fhlLecture.render(ps, fhlLecture.dom);
                    }
                    else {
                        ps.strong = 0;
                        pageState.strong = 0
                        fhlLecture.render(ps, fhlLecture.dom);
                    }
                    triggerGoEventWhenPageStateAddressChange(ps);
                    updateLocalStorage()
                });
        },
        render: function (ps, dom) {
            var html = "<div>" + gbText("原文編號", ps.gb) + ":</div>";
            html += '<div class="onOffSwitch">\
                                  <input type="checkbox" name="snOnOffSwitch" class="onOffSwitch-checkbox" id="snOnOffSwitch">\
                                  <label class="onOffSwitch-label" for="snOnOffSwitch">\
                                      <span class="onOffSwitch-inner"></span>\
                                      <span class="onOffSwitch-switch"></span>\
                                  </label>\
                              </div>';
            dom.html(html);
            $('#snOnOffSwitch').attr("checked", (ps.strong == 1) ? true : false);
        }
    };
}
function gGbSelect() {
    return {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {
            $('#gbSelectSwitch').change(
                function () {
                    if ($(this).is(':checked')) {
                        ps.gb = 1;
                        pageState.gb = 1
                        //ps.chineses = bookGB[book.indexOf(ps.chineses)];
                        fhlLecture.render(ps, fhlLecture.dom);
                        fhlInfoTitle.render(ps, fhlInfoTitle.dom);
                        fhlInfoTitle.registerEvents(ps);
                        fhlInfo.render(ps);
                        bookSelectName.init(ps, $('#bookSelectName'));
                        bookSelectName.registerEvents(ps);

                        $('#title')[0].firstChild.nodeValue = "信望爱圣经工具 ";
                        alert('重新載入後生效')
                    }
                    else {
                        ps.gb = 0;
                        pageState.gb = 0
                        //ps.chineses = book[bookGB.indexOf(ps.chineses)];
                        fhlLecture.render(ps, fhlLecture.dom);
                        fhlInfoTitle.render(ps, fhlInfoTitle.dom);
                        fhlInfoTitle.registerEvents(ps);
                        fhlInfo.render(ps);
                        $('#title')[0].firstChild.nodeValue = "信望愛聖經工具 ";
                        bookSelectName.init(ps, $('#bookSelectName'));
                        bookSelectName.registerEvents(ps);
                        alert('重新載入後生效')
                    }
                    triggerGoEventWhenPageStateAddressChange(ps);
                    updateLocalStorage()
                });
        },
        render: function (ps, dom) {
            var html = "<div> " + gbText('繁簡切換', ps.gb) + ":</div>";
            html += '<div class="onOffSwitch">\
                                  <input type="checkbox" name="gbSelectSwitch" class="onOffSwitch-checkbox" id="gbSelectSwitch">\
                                  <label class="onOffSwitch-label" for="gbSelectSwitch">\
                                      <span class="onOffSwitch-inner traditional-simpleSwitch"></span>\
                                      <span class="onOffSwitch-switch"></span>\
                                  </label>\
                              </div>';
            //html += '<span style="color: #770000;">施工中...</span>';
            dom.html(html);
            $('#gbSelectSwitch').attr("checked", (ps.gb == 1) ? true : false);
        }
    };
}



function getAjaxUrl(func, ps, idx) {
    var paramArr = ["engs", "chineses", "chap", "sec", "version",
        "strong", "gb", "book", "N", "k"];
    var urlParams = {
        sc: [0, 2, 3, 6, 7],
        qb: [1, 2, 4, 5, 6],
        qp: [0, 2, 3, 6],
        sd: [6, 8, 9],
        sbdag: [6, 8, 9],
        stwcbhdic: [6, 8, 9],
    };

    if (func == 'qb') {
        // add by snow. 2021.07
        var r1 = Enumerable.from(bookEng).indexOf(ps.engs);
        var r2 = ps.gb == 1 ? bookGB : book;
        ps.chineses = r2[r1];
    }

    var getFullAjaxUrl = function (func, ps, idx) {
        var ret = fhl.urlJSON + func + ".php?";
        if (fhl.urlJSON === undefined) {
            ret = '/json/' + func + '.php?';
        }
        for (var i = 0; i < urlParams[func].length; i++) {
            var paramKey = paramArr[urlParams[func][i]];
            if (paramKey == "version") {
                ret += paramKey;
                ret += "=";
                ret += encodeURIComponent(ps[paramKey][idx]);
                ret += "&";
            } else {
                ret += paramKey;
                ret += "=";
                ret += encodeURIComponent(ps[paramKey]);
                ret += "&";
            }
        };

        ret = ret.substring(0, ret.length - 1);
        console.log(ret); //https://bkbible.fhl.net/json/qp.php?engs=Rom&chap=16&sec=27&gb=0
        return ret;
    };

    return getFullAjaxUrl(func, ps, idx);
}
function getBookFunc(func, bookName) {
    var i;
    // 2016.11, 簡體中文, 會取出 null, 修正完畢
    for (i = 0; i < book.length; i++) {
        if (BibleConstant.CHINESE_BOOK_ABBREVIATIONS[i] == bookName)
            break;
        if (BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB[i] == bookName)
            break;
    }

    var ret;
    switch (func) {
        case "index":
            ret = i;
            break;
        case "indexByEngs":
            for (i = 0; i < bookEng.length; i++)
                if (bookEng[i] == bookName)
                    break;
            ret = i;
            break;
        case "bookFullName":
            ret = (pageState.gb == 1) ? bookFullName2[i] : bookFullName[i];
            break;
        case "bookChapters":
            ret = bookChapters[i];
            break;
        case "bookEng":
            ret = bookEng[i];
            break;
        default:
            ret = "failed";
            break;
    }
    return ret;
}
function requestFullscreen() {
    $("#mainWindow").css({ top: "0px" });
    //$("#bookSelectPopUp").css({top: "0px"});
    var mainWindow = document.querySelector("#mainWindow");
    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
        if (mainWindow.requestFullScreen) {
            mainWindow.requestFullScreen().then(afterExit)
        } else if (mainWindow.webkitRequestFullScreen) {
            // safari, chrome, edge
            mainWindow.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT).then(afterExit)
        } else if (mainWindow.mozRequestFullScreen) {
            // firefox test
            mainWindow.mozRequestFullScreen().then(afterExit)
        } else if (mainWindow.msRequestFullscreen) {
            mainWindow.msRequestFullscreen().then(afterExit)
        }
    }
    return
    function afterExit() {
        $('#fullscreenControl').removeClass('selected')
        windowAdjust()
    }
}
function registerEvents(ps) {
    /* scrolling register */
    /*setTimeout(function() {
        $('div').scroll(function() {
            $(this).addClass('scrolling');
            clearTimeout( $.data( this, "scrollCheck" ) );
            $.data( this, "scrollCheck", setTimeout(function() {
                $('div').removeClass('scrolling');
            }, 350) );
        });
    }, 2000);*/ //等到其他function 跑完 (backup 用)
    /*shortcut register*/
    // 快速鍵
    $(document).on('keyup', function (e) {
        if (e.altKey && e.shiftKey) {
            var maps = {
                'KeyS': () => {
                    var idx = getBookFunc("index", ps.chineses);
                    var position = $('#bookSelect').position();
                    position.left = '40%'; //$('#bookSelect').position().left;
                    position.top = '20%'; //$('#bookSelect').position().top+$('#bookSelect').height()+10;
                    bookSelectChapter.init(ps, $('#bookSelectChapter'), idx, position);
                    bookSelectChapter.registerEvents(ps);
                    //isBookSelectChapterPopUp=true;
                    //bookselectchapter.dom.hide();
                    bookSelectChapter.dom.show();
                    //alert(pageState.chineses);
                },
                'KeyF': () => {
                    $('[data-ic-class="search-trigger"]').trigger("click");
                    setTimeout(function () { $('[data-ic-class="search-clear"]').trigger("click"); }, 1);
                }, // 
                'Slash': () => $('#help').trigger("click"), // 反斜線 /
                'KeyC': () => $('#fhlInfoWindowControl').trigger('click'), // 
                'KeyZ': () => $('#fhlLeftWindowControl').trigger('click'), // 
                'KeyX': () => $('#fhlMidBottomWindowControl').trigger('click'), // 
                'KeyL': () => $('#fullscreenControl').trigger('click'), // 全螢幕
            }
            if (maps[e.code] != undefined) {
                maps[e.code]()
            }
            console.log(e.code);
        }
    })

    // $(document).bind('keydown', 'esc', function () {
    //     $('#helpingPopUp').css({
    //         'visibility': 'hidden',
    //         'opacity': '0'
    //     });
    // });            
    // $(document).bind('keydown', 'ctrl+c', function () {
    //     var copyTextarea = document.querySelector('#test');
    //     //copyTextarea.style.backgroundColor = "red";
    //     copyTextarea.select();
    // });

    /*in search input*/
    $('[data-ic-class="search-input"]').on('keydown', 'alt+shift+f', function () {
        console.log(64);
        $('[data-ic-class="search-trigger"]').trigger("click");
        setTimeout(function () { $('[data-ic-class="search-clear"]').trigger("click"); }, 1);
    });
    $('[data-ic-class="search-input"]').on('keydown', 'esc', function () {
        console.log(69);
        $('[data-ic-class="search-input"]').val('');
        $('[data-ic-class="search-trigger"]').removeClass('active');
    });
    $('[data-ic-class="search-input"]').on('keydown', 'return', function () {
        console.log(74);
        $('.searchBtn').trigger("click");
    });
}

function initPageStateFlow(currentSWVer) {
    //fhlTopMenu.init(pageState);
    //fhlTopMenu.render(pageState);
    //Check cache
    if (localStorage.getItem("fhlPageState") != null) {
        //console.log(localStorage.getItem("fhlPageState"));
        var tmp = JSON.parse(localStorage.getItem("fhlPageState"));
        if (tmp.swVer != currentSWVer) {
            // pageState 版本變更            
            // replace by snow. 2021.07 不要再直接更新所有設定，
            // 而是透過 makeSureValueExistForNewVersions 新增的 key
            // pageStateInit(); 
            pageState = tmp // 然後缺的會在下面補足
            pageState.swVer = currentSWVer // 更新                        
        } else {
            // 從 localStorage 載入
            pageState = tmp;
        }
    } else {
        pageStateInit();
        // 2017.07 若人家是直接貼上url含有 書卷章節, 就從裡面取代
    }

    makeSureValueExistForNewVersions()
    $(function () {
        triggerGoEventWhenPageStateAddressChange(pageState);
    })

    return
    function pageStateInit() {
        pageState = genereateDefaultPageState();
    }
    /** 
     * 當工程師，在新增 pageState 參數時，因為版本沒更新，所以常常忘了它是 undfined
     * 所以這個會自動將 不存在的 pageState 補上，我們只有專注維護 genereateDefaultPageState
     * 另外，這樣也才不會，因為更新版本，過去的設定都清空歸 0 了
     */
    function makeSureValueExistForNewVersions() {
        var ps = genereateDefaultPageState()
        for (var k in ps) {
            if (pageState[k] == undefined) {
                pageState[k] = ps[k]
            }
        }
    }
    function genereateDefaultPageState() {
        return {
            // 'Gen'
            engs: "Gen",
            // '創'
            chineses: "創",
            // 1
            chap: 1,
            // 1
            sec: 1,
            // bookIndex, book 這個先被用掉了.
            bookIndex: 1,
            // ['unv', 'svc']
            version: ["unv"],
            // 0
            strong: 0,
            // 0
            gb: 0, // 0: 繁體預設值
            isVisibleInfoWindow: 1,  // add by snow. 2021.07
            isVisibleLeftWindow: 1, // add by snow. 2021.07
            cxInfoWindow: 500, // add by snow. 2021.07
            cxLeftWindow: 190, // add by snow. 2021.07
            fontSizeHebrew: 26, // add by snow. 2021.07
            fontSizeGreek: 26, // add by snow. 2021.07
            fontSizeStrongNumber: 14, // add by snow. 2021.07
            // book 別以為是 bookIndex, 因為 book 先被注釋用掉了 sc.php 參數
            book: 3, N: 0, k: "", cname: ["FHL和合本"], realTimePopUp: 0, titleId: "fhlInfoComment",
            history: [{ chineses: "創", chap: 1 }], fontSize: 12, commentBackgroundChap: 1, commentBackgroundSec: 1,
            leftBtmWinShow: true, searchTitleMsg: "", audio: 0, swVer: "0.0.0",
            ispho: false, ispos: false
        }
    }
}

function LeftWindowTool() {
    var that = this
    this.getCssForOpenedSetting = function () {
        return { top: '2.5rem', height: 'auto', bottom: '2.5rem', position: 'absolute' }
    }
    this.getCssForClosedSetting = function () {
        return { top: '2.5rem', height: '2rem', bottom: 'auto', position: 'absolute' }
    }
    this.getCssForOpenedHistory = function () {
        return { top: '5.0rem', height: 'auto', bottom: '0rem' }
    }
    this.getCssForClosedHistory = function () {
        return { top: 'auto', height: '2rem', bottom: '0rem' }
    }
    this.getTitleClosedSetting = function () {
        return "▶ " + gbText("設定", pageState.gb)
    }
    this.getTitleOpenedSetting = function () {
        return "▼ " + gbText("設定", pageState.gb)
    }
    this.getTitleClosedHistory = function () {
        return "▶ " + gbText("歷史記錄", pageState.gb)
    }
    this.getTitleOpenedHistory = function () {
        return "▼ " + gbText("歷史記錄", pageState.gb)
    }
    this.isOpenedHistory = function (pthis) {
        return $(pthis).text() == that.getTitleOpenedHistory()
    }
    this.isOpenedSettings = function (pthis) {
        return $(pthis).text() == that.getTitleOpenedSetting()
    }

    /** close setting 就是 open history */
    this.closeSettings = function () {
        var css1 = that.getCssForClosedSetting()
        var css2 = that.getCssForOpenedHistory()
        var title1 = that.getTitleClosedSetting()
        var title2 = that.getTitleOpenedHistory()
        $('#settings').css(css1)
        $('#viewHistory').css(css2)
        $('#settings p').text(title1)
        $('#viewHistory p').text(title2)
    }
    this.openSettings = function () {
        var css1 = that.getCssForOpenedSetting()
        var css2 = that.getCssForClosedHistory()
        var title1 = that.getTitleOpenedSetting()
        var title2 = that.getTitleClosedHistory()
        $('#settings').css(css1)
        $('#viewHistory').css(css2)
        $('#settings p').text(title1)
        $('#viewHistory p').text(title2)
    }
}

// 檢查 .html 是否需要更新 (會在 document.ready 之後作)
function checkHtmlVersion() {
    render()
    checkVersionAndSetText()


    return
    function checkVersionAndSetText() {
        getLastVersion(ver => {
            var r1 = '更新至 ' + ver
            if (ver == window.currentSWVer) {
                r1 = '手動更新' // 已最新
            }
            $('#force-reload button').text(r1)

            return
        })
        return
        function getLastVersion(cb) {
            $.ajax({
                url: './app_versions.json',
                dataType: 'text',
                cache: false,
                /**             
                 * @param {string} jo 
                 */
                success: (jo) => {
                    try {
                        /** @type {{"nui":{"last":string}}} */
                        var r1 = JSON.parse(jo)
                        cb(r1["nui"]["last"])
                    } catch (error) {
                        alert('當檢查是否更新，發生錯誤\n. ' + error)
                    }
                },
                error: (err) => {
                    alert('當檢查是否更新，發生錯誤\n. ' + err.status + ' ' + err.statusText + ' ' + err.responseText)
                }
            })
        }
    }
    function render() {
        var r1 = $('#title')
        // var r3 = $('<button onclick="window.location.reload(true)">檢查更新</button>')
        // r3.css({ "border": "0", "background-color": "rgba(0,0,0,0)", "text-decoration": "underline", "color": "blue", "font-size": "0.7rem" })
        // r3.appendTo(r1)

        var url = '' // action 不加路徑，就等於「自己網址」
        if (location.port != "" && window.location.port != 80) { // 應該是 dev 版本
            url = 'https://bkbible.fhl.net/NUI/index.html' // live server extension, 無法支援 post 方法
        }
        var r2 = $('<form action=' + url + ' method="POST" id="force-reload"></form>')
        r2.css({ "display": "inline-block", "font-size": "0.7rem" })
        var r3 = $('<button type="button">檢查更新</button>')
        r3.css({ "border": "0", "background-color": "rgba(0,0,0,0)", "text-decoration": "underline", "color": "blue" })
        r3.attr('onclick', "try {window.location.reload(true);} catch (er) { $(this).parent().submit(); }")
        r3.appendTo(r2)
        r2.appendTo(r1)
        return;
    }
}

function declareBibleConstants() {
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

    // 下面是為了相容舊版
    testThenDoAsync({cbTest: () => Ijnjs != undefined }).then(()=>{
        FHL.BibleConstant = BibleConstant
        FHL.BibleConstant.s = new BibleConstant()
    })
    return BibleConstant
}
function doNoReadyStep3() {
    // console.log(location); // file://
    var isRDLocation = location.origin === 'file://';
    var urlJSON = '/json/';
    if (isRDLocation) {
        urlJSON = 'https://bible.fhl.net/json/';
    }
    // 本機， url 用絕對路徑，上線，用相對路徑
    // 本機， 新譯本不可下載，不然會出錯。

    // 2017.07 下面整理與NUI2一致.


    var chineseNumber = BibleConstant.CHINESE_NUMBERS;
    var book = BibleConstant.CHINESE_BOOK_ABBREVIATIONS;
    var bookGB = BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB;
    var bookFullName = BibleConstant.CHINESE_BOOK_NAMES;
    var bookFullName2 = BibleConstant.CHINESE_BOOK_NAMES_GB;
    var bookChapters = BibleConstant.BOOK_CHAPTERS;
    var bookEng = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS;
    var bookEngShort = BibleConstant.ENGLISH_BOOK_SHORT_ABBREVIATIONS

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
        $(() => {
            $(document.body).css('overflow', 'scroll')
            // console.log(window.innerWidth)
            // console.log(document.body.clientWidth)
            document.body.style.setProperty(
                "--scrollbar-width",
                `${window.innerWidth - document.body.clientWidth}px`)
            $(document.body).css('overflow', '')

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