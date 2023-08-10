(function (root) {
    root.bookSelectChapter = {
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
    };
})(this)