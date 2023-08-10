/// <reference path='../libs/jsdoc/jquery.js' />
/// <reference path='../libs/jsdoc/linq.d.ts' />
/// <reference path='../libs/ijnjs/ijnjs.d.ts' />
/// <reference path='bookSelect.d.js' />
/// <reference path='DPageState.d.js' />
(function(root) {
    var bookSelect = {}
    bookSelect.init = function(ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
        bookSelectPopUp.init(ps, $('#bookSelectPopUp'));
        bookSelectPopUp.registerEvents(ps);
    }

    /**
     * 
     * @param {DPageState} ps 
     */
    bookSelect.registerEvents = function(ps) {
        var that = this;
        $('#bookSelect').unbind().click(function(e) { // 加上unbind() 讓創世記第二節之後的dropdown不會自動消失
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
                    setTimeout(function() {
                        bookSelect.dom.css({ 'color': '#D0D0D0' });
                    }, 200);
                } else {
                    bookSelectPopUp.dom.fadeIn('0.2');
                    bookSelect.dom.css({ 'color': '#00A0FF' });
                }
            }

            e.stopPropagation();
        });
        $('#bookSelectPopUp').click(function() {
            bookSelectPopUp.dom.fadeOut('0.2');
            setTimeout(function() { bookSelect.dom.css({ 'color': '#D0D0D0' }); }, 200);
        });
        $(document).click(function() {
            bookSelectPopUp.dom.fadeOut('0.2');
            setTimeout(function() { bookSelect.dom.css({ 'color': '#D0D0D0' }); }, 200);
        });
        $('#bookSelectName').click(function(e) {
            e.stopPropagation();
        });
        $('#bookSelect').mouseenter(function() {
            if (!bookSelectPopUp.dom.is(":visible")) {
                bookSelect.dom.css({ 'color': '#00A0FF' });
            }
        });
        $('#bookSelect').mouseleave(function() {
            if (!bookSelectPopUp.dom.is(":visible")) {
                bookSelect.dom.css({ 'color': '#D0D0D0' });
            }
        });
    }
    bookSelect.render = function(ps, dom) {
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
    root.bookSelect = bookSelect
})(this)