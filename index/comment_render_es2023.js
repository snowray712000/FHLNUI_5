import { eachFitDo } from "./eachFitDo.es2023.js";
import { getAjaxUrl } from "./getAjaxUrl.es2023.js";
import { getBookFunc } from './getBookFunc.es2023.js'
import { comment_register_events } from "./comment_register_events_es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";
import { assert } from "./assert_es2023.js";
import { BibleConstant } from "./BibleConstant.es2023.js";
import { gbText } from "./gbText.es2023.js";
import { sc_api_async } from "./sc_api_es2023.js";
import { ScAddress } from "./ScResult_es2023.js";
/**
 * 
 * @param {ScAddress} address 
 * @param {"prev"|"next"} prev_next 是否是上一章下一章
 */
function generate_div_comment_back_next(address, prev_next) {
    const book = address.book66();
    const chap = address.chap;
    const sec = address.sec;

    const na_class = prev_next == "prev" ? "commentSecBack" : "commentSecNext";
    const na_text = prev_next == "prev" ? "<span>❮</span>" : "<span>❯</span>"; // 左箭頭或右箭頭

    const jdom = $("<div></div>")
        .addClass(na_class)
        .attr("book", book).attr("chap", chap).attr("sec", sec)
    $(na_text).appendTo(jdom);
    return jdom;
}
function generate_div_comment_title(sc) {
    const ps = TPPageState.s;

    if (ps.chap == 0) {
        return $("<div id='commentTitle'></div>").text(gbText("書卷資料"));
    } else {
        return $("<div id='commentTitle'></div>").text(sc.record[0].title);
    }
}
function generate_top_div_comment(isEmpty = false) {
    if (isEmpty) {
        return $("<div style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); '></div>").text(gbText("施工中..."));
    } else {
        return $("<div style='position: static; padding: 0px; top: 0px; bottom: 0px; overflow: auto;'></div>");
    }
}
function generate_div_background() {
    const ps = TPPageState.s;

    const book = ps.bookIndex;
    const chap = ps.chap != 0 ? 0 : ps.commentBackgroundChap;
    const sec = ps.chap != 0 ? 0 : ps.commentBackgroundSec;
    const text = ps.chap != 0 ? gbText("書卷背景") : gbText("返回註釋");

    return $("<div></div>")
        .addClass("commentBackground")
        .attr({ book, chap, sec })
        .text(text);
}
function generate_div_comment_content(res) {
    // 2024.12 移除注釋原本的換行與空白，但卻不要移除●◎(1)等。

    let html = do_com_text(res.record[0].com_text);
    html = parseComment(html);

    return $("<div id='commentScrollDiv'></div>").html(html);

    function do_com_text(text) {
        let reg_tp1 = /[零壹貳參肆伍陸柒捌玖拾]+、/g // 壹、
        let reg_tp2 = /[零一二三四五六七八九十百]+、/g // 一、
        let reg_tp3 = /（[零一二三四五六七八九十百]+）/g // （一）
        let reg_tp4 = /\d+\./g // 1.
        let reg_tp5 = /\(\d+\)/g // (1)
        let reg_tp6 = /[a-zA-Z]+\./g // a.
        let reg_tp7 = /[●◎⓪☆○※]/g
        let reg_tp8 = /\r?\n/g
        let reg_tp9 = /SNG|SNH/g // 創1:1


        // 組成字串, 以 | 分隔，為了製作組合的正規表達式
        let reg_tps = [reg_tp1, reg_tp2, reg_tp3, reg_tp4, reg_tp5, reg_tp6, reg_tp7, reg_tp8, reg_tp9]


        // 簡單實例 /\r?\n\s*(●|◎|a.|b.|c.|[零壹]、|\S)
        // 就是將上面的 用 `|` 組起來，最後加上 \S，前面加上 \r\n\s*
        let reg_pre = /\r?\n\s*/g
        let reg_tp_str = reg_tps.map(reg => reg.source).join("|")
        let reg_combile_str = "(" + reg_pre.source + ")" + "(" + reg_tp_str + "|\\S)"
        let reg_combile = new RegExp(reg_combile_str, "g")

        // 結果字串
        let text_result = text.replace(reg_combile, (match, p1, p2) => {
            reg_tps.forEach(reg => reg.lastIndex = 0) // reset 正規化表達式，不然第2次會失效。
            if (reg_tps.some(reg => reg.test(p2))) {
                return p1 + p2
            } else {
                return p2
            }
        })
        
        return text_result + "\r\n\r\n\r\n" // 為了不要被遮到最下面
    }
    function parseComment(t) {
        t = t.replace(/\n/g, "</br>");
        t = t.replace(/ /g, "&nbsp");
        var pt, pt1;
        var tok, tok_str;
        var span_str;
        var i = 0;

        // 2017.12 詩篇 30 篇 #30| 按下去會變 undefined Bug
        eachFitDo(/#([0-9]+)\|/, t, function (m1) {
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
                    span_str += BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[BibleConstant.CHINESE_BOOK_ABBREVIATIONS.indexOf(bookName)];
                }
                span_str += " chap=" + chapNumber + " sec='" + secNumber + "'>" + tok + "</span>&nbsp;";
            }
            t = t.substring(0, pt) + span_str + t.substring(pt1 + 1);
        }

        function sn_replace(...s) {
            let tp = s[1]
            //  parseInt 把前面的 0 去掉，||"" 若沒有 a, 才不會出現 
            let sn = `${parseInt(s[2])}${s[3] || ""}`;

            let span = $('<span></span>')
            span.addClass('sn').attr('sn', sn).attr('tp', tp).attr('N', tp == 'H' ? 1 : 0)
            span.text(`${tp.toUpperCase()}${sn}`)
            return span[0].outerHTML
        }
        t = t.replace(/SN([HG])([0-9]+)(a?)/gi, sn_replace)

        return t;
    }
}

/**
 * ### fhlInfoContent 重構過來的
<div#fhlInfoContent>
  <div.top>
    <div#commentTitle></div>
    <div#commentBackground></div>
    <div#commentContent>
      <div.commentSecBack></div>
      <div.commentSecNext></div>
      <div#commentScrollDiv>
        ...
      </div>
    </div>
  </div>
</div>
 */
export async function comment_render_async() {
    let res = await sc_api_async();

    if (res.status === "success" && res.record_count !== 0) {
        let jtop = generate_top_div_comment(false);

        generate_div_comment_title(res).appendTo(jtop)
        generate_div_background().appendTo(jtop);

        let jcommentContent = $("<div id='commentContent'></div>").appendTo(jtop);

        if (res.prev != null) {
            generate_div_comment_back_next(new ScAddress(res.prev), "prev").appendTo(jcommentContent);
        }
        if (res.next != null) {
            generate_div_comment_back_next(new ScAddress(res.next), "next").appendTo(jcommentContent);
        }

        generate_div_comment_content(res).appendTo(jcommentContent);

        $("#fhlInfoContent").html(jtop);
        comment_register_events();
    } else {
        const jtop = generate_top_div_comment(true);
        $("#fhlInfoContent").html(jtop);
        comment_register_events();
    }
}

