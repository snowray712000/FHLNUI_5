/**
 * @typedef {import("../DText.js").DText} DText
 */
import { charHG } from "../charHG.es2023.js";
import { TPPageState } from "../TPPageState.es2023.js"

import { addHebrewOrGreekCharClass, generate_verse_number_jdom, isHebrewOrGeekVersion, parseBibleText, replace_newline_char } from "./FhlLecture_render_mode_common_es2023.js";
import { Hash_DAddress } from "../Hash_DAddress_es2023.js";
import { ParagraphData } from '../ParagraphData_es2023.js'
import { grouping_by_paragraph } from "../grouping_by_paragraph.js";
import { cvt_others } from "../cvt_others.js";
import { grouping_by_paragraph_for_dtexts_with_addr } from '../grouping_by_paragraph_for_dtexts_with_addr.js'
// vercol 本來是併排用的，但交錯時，它其實裡面的內容就不是同一譯本了。
// 新增「段落功能後」，.lec 原本是「單節」的設計，現在多一層 grouped 的概念，新增 .paragraph 的 div 好了。
// 也就是說 以後 模式4，交錯的話，應該是 <div.paragraph ver='ver1'> </div> <div.paragraph ver='ver2'> </div> 也就是說, 真正確定同個譯本的, 會是 .paragraph，也不是 .vercol。

// <div#lecMain>
//     <div.vercol>
//     <div.lec>...第1節內容...</div>
//     <div.lec>...第2節內容...</div>
//     <div.lec>...</div>
//     </div>
//     <div.vercol>
//     <div.lec>...</div>
//     <div.lec>...</div>
//     <div.lec>...</div>
//     </div>
//     <div#div_copyright.vercol>...</div>
// </div>

/**
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").TpResultBibleText} TpResultBibleText
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").TpOneRecordBibleText} TpOneRecordBibleText
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").DAddress} DAddress
 */

import { queryFootsAsync } from "../queryFootsAsync.js"
import { render_dtexts } from "../render_dtexts.js";
function add_sn_hidden_if_need(text_jq) {
    // 因為現在所有資料都包含 sn，所以若 strong=0，則要隱藏
    const ps = TPPageState.s;
    if (ps.strong == 0) {
        // 將 text 轉為 jQuery，然後將 .sn 的 span 加入 .hidden
        text_jq.find('.sn').addClass('sn-hidden')
    }
}
function is_merge_with_prev_verse(dtexts_with_addr2) {
    // 例如歌羅西書2:21節，會有一筆資料是 sec=21，bible_text="a"，這筆資料的內容是「併入上節」，它的 verse number 是 21，但實際上它應該是併入上一節的，所以在 render 的時候，要把它的 verse number 隱藏掉。
    const dtexts = dtexts_with_addr2[3]
    if (dtexts.length != 1) return false;

    if (dtexts[0].w == "a") return true;

    return false;
}
function gen_fake_groups_for_mode1(dtexts_with_addrs) {
    // 原本是 [book, chap, sec, dtexts[]]
    // 現在 map 產生 [book, chap, sec, ""] 即可
    return dtexts_with_addrs.map(a1 => {
        return [a1[0], a1[1], a1[2], ""]
    })
}
function get_all_address_need(rspApp) {
    // 每一個 rspApp 的 record 的每一個 record 的 book, chap, sec 可以 toHash
    let allhashs = rspApp.map(a1 => a1.record.map(a2 => Hash_DAddress.toHash(a2)))
    allhashs = allhashs.flat()

    // unique
    allhashs = [...new Set(allhashs)]

    // order
    allhashs.sort((a, b) => a - b)

    // return
    const addrs = allhashs.map(a1 => Hash_DAddress.toAddress(a1))
    return addrs
}

/**
 * 
 * @param {TpResultBibleText[]} rspApp 
 * @returns {JQuery<HTMLElement>} htmlContent
 */
export async function FhlLecture_render_mode1_and_mode3(rspApp, mode) {
    // 我先作好 mode 3，然後意識到 mode1 其實就是 mode 3 的每一節為一段的特例, 就作這個假的分段, 就可以用同一個程式碼了
    const paragraphDataFake = mode == 1 ? gen_fake_groups_for_mode1(get_all_address_need(rspApp)) : null

    const ps = TPPageState.s
    // 先假設，內容一定是同一章，同卷書
    const paragraphData = ParagraphData.s.isReadyAndStartingIfNeed() ? ParagraphData.s.data : [[1, 1, 1, "上帝的創造"], [1, 2, 4, "創造的另一記載"], [1, 3, 1, "人違背命令"], [1, 3, 14, "上帝的宣判"], [1, 3, 22, "亞當和夏娃被趕出伊甸園"]]

    let htmlContent = generate_htmlContent_with_VersionColumns(rspApp, ps.fontSize);

    // 逐版本處理
    for (let iver = 0; iver < rspApp.length; iver++) {
        const version_of_record = rspApp[iver].version;
        const one_result_of_version = rspApp[iver]

        // prepare data
        let dtexts_with_addrs = cvt_others(version_of_record, one_result_of_version.record.map(a1 => {
            return [a1.book, a1.chap, a1.sec, a1.bible_text]
        }));
        // console.log(dtexts_with_addrs);

        // foot 注腳 csb 中文標準譯本 cnet NET聖經中譯本 lcc 呂振中譯本
        if (ps.foot_note_show_method == 2) {
            await queryFootsAsync(dtexts_with_addrs, version_of_record)
        }

        const paragraphDataUsed = mode == 1 ? paragraphDataFake : paragraphData;
        const grouped2 = grouping_by_paragraph_for_dtexts_with_addr(dtexts_with_addrs, paragraphDataUsed)
        // console.log(grouped2);

        // 每一段落
        for (let iGrouped = 0; iGrouped < grouped2.length; iGrouped++) {
            const one_group = grouped2[iGrouped];
            const paragraphIndex = one_group[1]; // 段落索引
            const recordIndices = one_group[0]; // 段落內的 record 索引
            const titleOfParagraph = paragraphIndex != -1 ? paragraphDataUsed[paragraphIndex][3] : ""; // TODO: 還沒用到

            let div_grouped = $("<div>").css({
                margin: '0px 0.25rem 0px 0.25rem',
                padding: '7px 0px',
                height: '100%',
            }).addClass('paragraph').attr('ver', version_of_record)

            if (version_of_record == "bhs") {
                div_grouped.css({
                    'text-align': 'right',
                    'direction': 'rtl', // 右至左
                });
            }

            // for each recordIndices
            for (const idx of recordIndices) {
                const dtexts_with_addr2 = dtexts_with_addrs[idx];

                const book = dtexts_with_addr2[0]
                const chap = dtexts_with_addr2[1]
                const sec = dtexts_with_addr2[2]

                // a (併入上節) 的處理，例如歌羅西書2:21節
                if (is_merge_with_prev_verse(dtexts_with_addr2)) {
                    // 取得 last in span_lec，它原本可能是 <span.verseNumber>20</span> 讓它變 <span.verseNumber>20-21</span> 。若原本就有存在 - 符號，例如 20-21, 就讓它變成 20-{sec}
                    const last_lec = div_grouped.children().last();
                    const verseNumberSpan = last_lec.find('.verseNumber').first();
                    const currentVerseNumberText = verseNumberSpan.text().trim();
                    const currentVerseNumber = parseInt(currentVerseNumberText);

                    if (currentVerseNumberText.includes('-')) {
                        // 已經有 - 符號了，讓它變成 20-{sec}
                        const newVerseNumberText = currentVerseNumberText.split('-')[0] + '-' + sec;
                        verseNumberSpan.text(newVerseNumberText);
                    } else {
                        // 沒有 - 符號，讓它變成 20-21
                        const newVerseNumberText = currentVerseNumber + '-' + sec;
                        verseNumberSpan.text(newVerseNumberText);
                    }

                    continue
                }

                // <span class="lec" ver="unv" chap="2" sec="1" book="40">
                const span_lec = $("<span>").addClass('lec').attr('ver', version_of_record).attr('chap', chap).attr('sec', sec).attr('book', book)

                // <span class="verseNumber">1 </span>
                span_lec.append(generate_verse_number_jdom(sec, version_of_record))

                // <span class="verseContent">
                const span_verseContent = $("<span>").addClass('verseContent');

                const htmlContentOfParagraph = render_dtexts([dtexts_with_addr2], version_of_record);
                add_sn_hidden_if_need(htmlContentOfParagraph);

                span_verseContent.append(htmlContentOfParagraph);

                span_lec.append(span_verseContent);

                div_grouped.append(span_lec);

            }

            // const dtexts_with_addr2 = recordIndices.map( idx => dtexts_with_addrs[idx] )

            // const htmlContentOfParagraph = render_dtexts(dtexts_with_addr2, version_of_record);
            // div_grouped.append(htmlContentOfParagraph);
            htmlContent.children().eq(iver).append(div_grouped)
        }
        continue
    }

    return htmlContent;
}

/**
 * 
 * @param {TpResultBibleText} rspArr 
 * @param {number} fontSizeOfPs ps.fontSize
 * @returns 
 */
function generate_htmlContent_with_VersionColumns(rspArr, fontSizeOfPs) {
    // case1: 不同版本，併排顯示；case2，不同版本，交錯顯示
    // 注意, 這個變數, 只是暫存的, 它輽出的結果是 html 文字, 不包含自己, 所以lecMain屬性是在另種設定, 不是在這
    // 不要再從這裡改 <div style=padding:10px 50px></div>, 不會有效果的.
    let $htmlContent = $("<div id='lecMain'></div>");

    let cx1 = 100 / rspArr.length;
    for (let j = 0; j < rspArr.length; j++) {
        // 分3欄
        let onever = $("<div class='vercol' style='width:" + cx1 + "%;display:inline-block;vertical-align:top; margin-top: " + (fontSizeOfPs * 1.25 - 15) + "px'></div>");

        $htmlContent.append(onever);
    }

    return $htmlContent;
}

