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
import { splitStringByRegex } from "./splitStringByRegex.es2023.js";

import { parseComment } from "./comments/parseComment.js"
import { convertDocToDText } from "./comments/convertDocToDText.js"
import { renderCommentDTexts } from "./comments/render_comments_in_dtexts.js"

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

        // render comment content
        let jcommentScrollDiv = $("<div id='commentScrollDiv'></div>").appendTo(jcommentContent);
        const ps = TPPageState.s;
        const address = [ps.bookIndex, ps.chap, ps.sec]
        const doc = parseComment(res.record[0].com_text, address)
        const dtexts = convertDocToDText(doc)
        renderCommentDTexts(dtexts, jcommentScrollDiv)
        jcommentContent.append($("<br/><br/><br/><br/>")) // 為了不要被遮到最下面
        // generate_div_comment_content(res).appendTo(jcommentContent);

        $("#fhlInfoContent").html(jtop);
        comment_register_events();
    } else {
        const jtop = generate_top_div_comment(true);
        $("#fhlInfoContent").html(jtop);
        comment_register_events();
    }
}



