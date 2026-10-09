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
import { infoBarHtml } from "./InfoBar.es2023.js";
import { splitStringByRegex } from "./splitStringByRegex.es2023.js";

import { parseComment } from "./comments/parseComment.js"
import { convertDocToDText } from "./comments/convertDocToDText.js"
import { renderCommentDTexts } from "./comments/render_comments_in_dtexts.js"

/** @param {ScAddress | null | undefined} sc 沒有 (第一 / 最後) 就是 null */
function toAddr(sc) {
    return sc ? { book: sc.book66(), chap: sc.chap, sec: sc.sec } : null
}
function comment_title(sc) {
    return TPPageState.s.chap == 0 ? gbText("書卷資料") : sc.record[0].title
}
function generate_top_div_comment(isEmpty = false) {
    if (isEmpty) {
        return $("<div style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); '></div>").text(gbText("施工中..."));
    } else {
        return $("<div class='comment-col'></div>");
    }
}
/** 「書卷背景」/「返回註釋」按鈕 (放在前 後之後、標題之前) */
function background_button_html() {
    const ps = TPPageState.s;

    const book = ps.bookIndex;
    const chap = ps.chap != 0 ? 0 : ps.commentBackgroundChap;
    const sec = ps.chap != 0 ? 0 : ps.commentBackgroundSec;
    const text = ps.chap != 0 ? gbText("書卷背景") : gbText("返回註釋");

    return `<button class="commentBackground btn btn-sm btn-outline-secondary" book="${book}" chap="${chap}" sec="${sec}">${text}</button>`;
}

/**
 * ### fhlInfoContent 重構過來的
<div#fhlInfoContent>
  <div.comment-col>
    <div#commentContent>
      <div#commentScrollDiv>
        <div.info-bar-top> 前 後 書卷背景 標題 </div>
        ...
        <div.info-bar-bottom> (同上) </div>
      </div>
    </div>
  </div>
</div>
 */
export async function comment_render_async() {
    let res = await sc_api_async();

    if (res.status === "success" && res.record_count !== 0) {
        let jtop = generate_top_div_comment(false);

        const barOpt = pos => infoBarHtml({
            prev: { cls: 'commentSecBack', addr: toAddr(res.prev != null ? new ScAddress(res.prev) : null) },
            next: { cls: 'commentSecNext', addr: toAddr(res.next != null ? new ScAddress(res.next) : null) },
            extrasHtml: background_button_html(), title: comment_title(res), pos,
        })

        let jcommentContent = $("<div id='commentContent'></div>").appendTo(jtop);

        // render comment content
        let jcommentScrollDiv = $("<div id='commentScrollDiv'></div>").appendTo(jcommentContent);
        const ps = TPPageState.s;
        const address = [ps.bookIndex, ps.chap, ps.sec]
        const doc = parseComment(res.record[0].com_text, address)
        const dtexts = convertDocToDText(doc)
        renderCommentDTexts(dtexts, jcommentScrollDiv)
        // 隨內容捲動 (與串珠一致)：開頭一列、結尾一列 (render 會清掉容器，所以在它之後才放)
        jcommentScrollDiv.prepend(barOpt('top')).append(barOpt('bottom'))
        // generate_div_comment_content(res).appendTo(jcommentContent);

        $("#fhlInfoContent").html(jtop);
        comment_register_events();
    } else {
        const jtop = generate_top_div_comment(true);
        $("#fhlInfoContent").html(jtop);
        comment_register_events();
    }
}



