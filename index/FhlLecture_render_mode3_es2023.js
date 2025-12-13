/**
 * @typedef {import("./DText.js").DText} DText
 */
import { charHG } from "./charHG.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js"

import { addHebrewOrGreekCharClass, generate_verse_number_jdom, isHebrewOrGeekVersion, parseBibleText, replace_newline_char } from "./FhlLecture_render_mode_common_es2023.js";
import { Hash_DAddress } from "./Hash_DAddress_es2023.js";
import { ParagraphData } from './ParagraphData_es2023.js'
import { grouping_by_paragraph } from "./grouping_by_paragraph.js";
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

/**
 * 
 * @param {TpResultBibleText[]} rspApp 
 * @returns {JQuery<HTMLElement>} htmlContent
 */
export function FhlLecture_render_mode3(rspApp) {
    const ps = TPPageState.s
    // 先假設，內容一定是同一章，同卷書
    const paragraphData = ParagraphData.s.isReadyAndStartingIfNeed() ? ParagraphData.s.data : [[1, 1, 1, "上帝的創造"], [1, 2, 4, "創造的另一記載"], [1, 3, 1, "人違背命令"], [1, 3, 14, "上帝的宣判"], [1, 3, 22, "亞當和夏娃被趕出伊甸園"]]
    
    let htmlContent = generate_htmlContent_with_VersionColumns(rspApp, ps.fontSize);

    for (let iver = 0; iver < rspApp.length; iver++) {
        const version_of_record = rspApp[iver].version;
        const one_result_of_version = rspApp[iver]

        const grouped = grouping_by_paragraph(one_result_of_version.record, paragraphData);
        // console.error(grouped);
        
        for (let iGrouped=0; iGrouped < grouped.length; iGrouped++) {
            const one_group = grouped[iGrouped];

            const paragraphIndex = one_group[1]; // 段落索引
            const recordIndices = one_group[0]; // 段落內的 record 索引
            const titleOfParagraph = paragraphIndex != -1 ? paragraphData[paragraphIndex][3] : ""; // TODO: 還沒用到

            let div_grouped = $("<div>").css({
                    margin: '0px 0.25rem 0px 0.25rem',
                    padding: '7px 0px',
                    height: '100%',
                }).addClass('paragraph').attr('ver', version_of_record)
            
            if ( version_of_record == "bhs" ) {
                div_grouped.css({
                    'text-align': 'right',
                    'direction': 'rtl', // 右至左
                });
            }

            for (let i = 0; i < recordIndices.length; i++) {
                const recordIndex = recordIndices[i];
                const one_record = one_result_of_version.record[recordIndex];

                // 這裡的 book, chap, sec 是從 one_record 取得的
                const book = one_record.book;
                const chap = one_record.chap;
                const sec = one_record.sec;

                let bibleText = parseBibleText(one_record.bible_text, ps, one_record.book < 40, version_of_record);

                if (bibleText == "a") {
                    bibleText = "【併入上節】";
                }
                
                bibleText = replace_newline_char(bibleText, version_of_record, ps.show_mode);

                // 2018.01 客語特殊字型(太1)
                let className = 'verseContent ';
                if (version_of_record == "thv12h" || version_of_record == 'ttvh')
                    className += ' bstw'

                // bhs 馬索拉原文 , 靠右對齊 要放在div, 放在 verseContent 無效
                // add by snow. 2021.07
                let classDiv = ''
                if (version_of_record == 'bhs') {
                    classDiv += ' hebrew-char-div'
                }
            
                // add by snow. 2021.07 原文字型大小獨立出來
                let bibleText2 = addHebrewOrGreekCharClass(version_of_record, bibleText)

                let div_lec = $("<span>").addClass('lec').attr('ver', version_of_record).attr('chap', chap).attr('sec', sec).attr('book', book)

                let div_lec2 = $("<span>").addClass(classDiv).appendTo(div_lec);
                
                // <span.verseNumber>1 </span>
                div_lec2.append(generate_verse_number_jdom(sec, version_of_record))

                div_lec2.append($("<span>").addClass(className).html(bibleText2))

                div_grouped.append(div_lec);
            }


            htmlContent.children().eq(iver).append(div_grouped)
        }


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

