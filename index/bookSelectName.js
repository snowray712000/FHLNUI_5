(function (root) {
    root.bookSelectName = {
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
    };
})(this)