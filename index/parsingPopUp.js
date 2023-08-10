
(function (root) {

    var parsingPopUp = {
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

    root.parseDic = parseDic
    root.parsingPopUp = parsingPopUp
})(this)