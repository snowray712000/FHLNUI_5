/// <reference path="../libs/jsdoc/linq.d.ts" />
/// <reference path="../libs/jsdoc/jquery.js" />
/// <reference path="../libs/jsdoc/jquery-ui.js" />
/// <reference path="../libs/ijnjs/ijnjs.d.ts" />
/// <reference path="./DataOfDictOfFhl.d.ts" />

(function (root) {
    let queryDictionaryAndShowAtDialogAsync = queryDictionaryAndShowAtDialogAsyncEs6Js()
    const queryReferenceAndShowAtDialogAsync = queryReferenceAndShowAtDialogAsyncEs6Js()
    const splitReference = splitReferenceEs6Js()

    var fhlInfo = {
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
            fhlInfoContent.render(ps, fhlInfoContent.dom);
        }
    };

    var bibleAudio = {
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

    var fhlInfoTitle = {
        init: function (ps, dom) {
            this.dom = dom;
            this.setTitleViaGb(ps);
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {
            // 型成 jquery 用字串.
            // #fhlInfoParsing,#fhlInfoComment,#fhlInfoPreach,#fhlInfoTsk,#fhlInfoOb,#fhlInfoAudio,#fhlInfoMap,#fhlSnBranch
            var selectAll = this.title.map(a1 => `#${a1.id}`).join(',')

            $(selectAll).on('click', function (_) {
                var idTitle = $(this).attr('id');
                if (idTitle == ps.titleId) {
                    // 目前是注釋，又點了一次注釋 (防呆)
                } else {
                    $(selectAll).removeClass('selected');
                    $(this).addClass('selected'); // this 是指被 click 那個

                    ps.titleIdold = ps.titleId; // add 2015.12.10(四) 為了有聲聖經,切換問題
                    ps.titleId = idTitle;
                    triggerGoEventWhenPageStateAddressChange(ps);
                    triggerInfoTitleChanged(ps)

                    fhlInfoContent.render(ps, fhlInfoContent.dom);
                }
            })

            // 樹狀圖，只有在羅馬書才會出現title        
            $(document).on('go', function (event, addr) {
                // assert ps.titleIdold != ps.titleId
                if (ps.titleId == "fhlSnBranch") {
                    if (addr.book != 45) { // 若目前是 樹狀圖，但變成不是時，會隱藏，但要自動切換掉
                        $('#' + ps.titleIdold).trigger('click')
                    }
                } else {
                    if (addr.book == 45) {
                        $('#fhlSnBranch').css('visibility', '');
                    } else {
                        $('#fhlSnBranch').css('visibility', 'hidden');
                    }
                }
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
                    { "name": "地図", "id": "fhlInfoMap" },
                    { "name": "树状图", "id": "fhlSnBranch" },
                ];
            } else {
                this.title = [
                    { "name": "原文", "id": "fhlInfoParsing" },
                    { "name": "註釋", "id": "fhlInfoComment" },
                    { "name": "講道", "id": "fhlInfoPreach" },
                    { "name": "串珠", "id": "fhlInfoTsk" },
                    { "name": "典藏", "id": "fhlInfoOb" },
                    { "name": "有聲", "id": "fhlInfoAudio" },
                    { "name": "地圖", "id": "fhlInfoMap" },
                    { "name": "樹狀圖", "id": "fhlSnBranch" },
                ];
            }
        }
    };


    var fhlInfoContent = {
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
                    $('#fhlInfoContent').off('click', '.sn').on('click', '.sn', ev => {
                        let that = $(ev.target)
                        let sn = that.attr('sn');
                        let N = that.attr('tp') == 'H' ? 1 : 0 // 0 是新約 1 是舊約
                        queryDictionaryAndShowAtDialogAsync({ sn, isOld: N == 1 })
                    })
                    $('#fhlInfoContent').off('click', '.commentJump').on('click', '.commentJump', ev => {
                        /** @type {JQuery<HTMLElement>} */
                        let that = $(ev.target)
                        let engs = that.attr('engs')
                        let book = getBookFunc('indexByEngs', engs) + 1
                        let chap = that.attr("chap")
                        let sec = that.attr("sec")
                        let addrDefault = { book: book, chap: parseInt(chap), verse: parseInt(sec) }

                        let refs = that[0].innerHTML

                        /** @type {DText[]} */
                        let dtexts = splitReference(refs, addrDefault)
                        queryReferenceAndShowAtDialogAsync({
                            addrs: dtexts[0].refAddresses
                        })
                    })

                    $('.commentSecBack, .commentSecNext').click(function () {
                        // $('.commentSecBack, .commentSecNext, .commentJump').click(function () {
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

                                    function do_remark(remark){
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
                                                } 
                                                nstr = nstr + "<a href=\"" + link_url + "\" target=\"grammer\">" + subheb[si] + "</a> ";
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
                                    function charHebrew_Inline_Block(remark){
                                        // <span class='hebrew-char'>אֶל</span> 用長基本型 <span class='hebrew-char'>אֱלֵי</span>

                                        // 將字串 'hebrew-char' 以 'hebrew-char hebrew-char-inline-block' 取代
                                        return remark.replace(/'hebrew-char'/g, '\'hebrew-char hebrew-char-inline-block\'')
                                    }
                                    remark = charHG (do_remark (remark) )
                                    remark = charHebrew_Inline_Block(remark) // 3 單陽詞尾 הוּ + ֵי 合起來 ... 像這個 + 就可能因為沒有 inline-block 而錯誤

                                    body_str = body_str + "<tr bgcolor=\"" + clrstr + "\"><td class=\"" + orig_font + "\">" + charHG(word) + "</td><td class=\"g0\"><span class=\"parsingTableSn\" N=" + N + " k=" + sn + ">" + sn + "</span></td><td class=\"g0\">";

                                    if (N == 0) {
                                        // 只有新約有 pro
                                        body_str = body_str + charHG(pro) + "</td><td class=\"g0\">";
                                    }

                                    wform = charHebrew_Inline_Block( charHG(wform) )
                                    
                                    body_str = body_str + wform + "</td><td class=\"" + orig_font + "\">" + charHG(orig) + "</td><td class=\"g0\">" + charHG(exp) + "</td><td class=\"g0\">" +
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

                                    $('#parsingTable').off('click', '.parsingTableSn').on({
                                        "click": function () {
                                            var r2 = $(this)
                                            var jo = {
                                                sn: r2.attr('k'),
                                                isOld: parseInt(r2.attr('n')),
                                            }

                                            // BUG:
                                            queryDictionaryAndShowAtDialogAsync(jo)
                                        }
                                    }, ".parsingTableSn").on({
                                        "click": function () {
                                            var r2 = $(this)
                                            var jo = {
                                                ref: r2.attr('ref'),
                                                book: parseInt(r2.attr('book')),
                                                chap: parseInt(r2.attr('chap')),
                                            }
                                        }
                                    }, ".reference")
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
                case "fhlSnBranch":
                    SnBranchRender.s.render(ps)
                    break
            }
            fhlmap_titleId_prev = ps.titleId; //地圖 map 會用到, 因為切換走分頁, 再切換回來要 re-create render object. see also: fhlmap_render
        }
    };

    root.fhlInfo = fhlInfo
    root.bibleAudio = bibleAudio
    root.fhlInfoTitle = fhlInfoTitle
    root.fhlInfoContent = fhlInfoContent
})(this)