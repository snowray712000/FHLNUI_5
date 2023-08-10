/// <reference path="../../ijnjs/ijnjs.d.js" />
/// <reference path="../../jsdoc/linq.d.ts" />

(function (root) {
    /** @type {Ijnjs.FHL}*/
    var FHL
    /** @type {JQueryStatic} */
    var $
    /** @type {globalThis.Enumerable} */
    var Enumerable
    /**  */
    var _
    /** @type {FHL.BookChapDialogDataG} */
    var dataG

    testThenDoAsync(() => window.Ijnjs != undefined)
        .then(() => {
            testThenDoAsync(() => Ijnjs.FHL != undefined)
                .then(() => {
                    FHL = Ijnjs.FHL
                    $ = Ijnjs.Libs.s.libs.$
                    Enumerable = Ijnjs.Libs.s.libs.Enumerable
                    _ = Ijnjs.Libs.s.libs._

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

                    testThenDoAsync(() => $('#book-chap-dialog').length != 0)
                        .then(() => {
                            BookChapDialog.s = new BookChapDialog()
                            root.BookChapDialog = BookChapDialog
                        })
                })
        })


    return
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


})(this)