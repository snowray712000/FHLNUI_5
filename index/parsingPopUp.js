
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
        render: function (ps, dom, offset, par) 
        {
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
                
                // 產生 2 個執行緒，一個查 cbol 字典，一個查 twcb 字典，結果用 dict 存起來 "cbol":{...},"twcb":{...}
                var dict = {}
                var count_wait = 2

                // cbol 字典
                let ajaxUrl = getAjaxUrl('sd', ps);
                $.ajax({
                    url: ajaxUrl
                }).done((d, s, j) => {
                    try {
                        dict['cbol'] = JSON.parse(j.responseText);;
                    } catch (error) {
                        console.error("Error parsing response:", error);
                    } finally {
                        count_wait--;
                    }
                }).fail((jqXHR, textStatus, errorThrown) => {
                    console.error("AJAX request failed:", textStatus, errorThrown);
                    count_wait--;
                });

                // twcb 字典
                isNewTestament = ps.N == 0
                let ajaxUrl2 = getAjaxUrl(isNewTestament ? 'sbdag' : 'stwcbhdic', ps);
                $.ajax({
                    url: ajaxUrl2
                }).done((d, s, j) => {
                    try {
                        // 如果是 local development，回傳假資料
                        if (isLocalHost()) {
                            if (isNewTestament) {
                                dict['twcb'] = JSON.parse(dev_sbdag());
                            } else {
                                dict['twcb'] = JSON.parse(dev_stwcbhdic());
                            }
                        } else {
                            dict['twcb'] = JSON.parse(j.responseText);;
                        }
                    } catch (error) {
                        console.error("Error parsing response:", error);
                    } finally {
                        count_wait--;
                    }
                }).fail((jqXHR, textStatus, errorThrown) => {
                    console.error("AJAX request failed:", textStatus, errorThrown);
                    count_wait--;
                });                    

                testThenDoAsync( () => count_wait == 0)
                .then(() => 
                {
                    // 原流程
                    var jsonObj = dict['cbol'];
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
                    
                    var html_cbol = '<div class="cbol">無法成功取得資料</div>'
                    if ('cbol' in dict)
                    {
                        html_cbol = jsonObj.record[0].dic_text;
                        html_cbol = parseDic(html_cbol);
                        html_cbol = `<div class="cbol">${html_cbol}</div>`
                    }

                    var html_twcb = '<div class="twcb">無法成功取得資料</div>'
                    if ('twcb' in dict)
                    {
                        html_twcb = dict['twcb'].record[0].dic_text;
                        html_twcb = parse_dic_stwcbhdic(html_twcb)
                        html_twcb = `<div class="twcb">${html_twcb}</div>`
                    }

                    
                    var html = '<div id="parsingPopUpTriangle"></div><div id="parsingPopUpInside">' + title + html_cbol + '<hr/>' + html_twcb +'</div>';
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
                    
                })

                
            }
        }
    };
    function parse_dic_stwcbhdic(html){
        // \r\n 以 <br /> 取代
        html = html.replace(/\r\n?|\r?\n/g, "<br />"); 

        html = `<div class="twcbhdic">${html}</div>`
        
        // 交互參照 #創1:2;出2:3-4|
        html = parseRef(html)
        
        // 原文，希伯來文，希臘文。字型放大，縮小
        html = parseGreekOrHebrew(html)

        return html
        function parseGreekOrHebrew(html){
            regex = /([\u0590-\u05fe]+)|([\u0370-\u03ff\u1f00-\u1fff]+)/ig
            html = html.replace(regex, function (match, p1, p2) {
                if (p1 != null) {
                    return `<span class='hebrew-char'>${p1}</span>`
                } else {
                    return `<span class='greek-char'>${p2}</span>`
                }
            })
            return html        
        }
        function parseRef(html){
            // 交互參照 #創1:2;出2:3-4|
            let regex = generateRegex()
            
            return html.replace(regex, function (match) {
                var r1 = FHL.ParsingReferenceToAddresses(match);
                var r2 = FHL.ParsingAddressesToReferenceLink(r1);
                return `<span class='ref'>${match}</span>`;
            })
            
            function generateRegex(){
                // 將書卷名，產生 (創|出...) 的正規表達式，字串
                books = new BibleBookNames().arrayNamesOrderByLength.join('|')
                
                // 經文範例，會出現的字元 1:2-3;4;1:2,3,4
                r2 = /[0123456789:\-;,；]+/.source
    
                // 其中一組, 會是 `創1:2-3;4;1:2,3,4`，在注釋，可能會沒有書卷名
                var oneBook = `(${books})?\\s*${r2}`
    
                // 交互參照 #創1:2;出2:3-4|
                var regex = new RegExp(`#\\s*(${oneBook})+\\s*\\|`, 'gi');
                
                return regex
            }
        }
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

    root.parseDic = parseDic
    root.parsingPopUp = parsingPopUp
})(this)