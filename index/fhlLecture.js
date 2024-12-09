/// <reference path="../libs/jsdoc/linq.d.ts" />
/// <reference path="../libs/ijnjs/ijnjs.d.ts" />
/// <reference path="../libs/jsdoc/jquery.js" />
/// <reference path="../libs/jsdoc/jquery-ui.js" />

// 被 es6 模式取代了
var fhlLecture = (function () {
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

            console.log(63);
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
        console.log(343);
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

        // console.log(ps.version)
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


(function (root) {
    root.fhlLecture = fhlLecture
})(this)