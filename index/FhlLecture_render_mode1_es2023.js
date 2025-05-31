import { charHG } from "./charHG.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js"

import { addHebrewOrGreekCharClass, generate_verse_number_jdom, isHebrewOrGeekVersion, parseBibleText, replace_newline_char } from "./FhlLecture_render_mode_common_es2023.js";


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
 * 
 * @param {TpResultBibleText[]} rspApp 
 * @returns {JQuery<HTMLElement>} htmlContent
 */
export function FhlLecture_render_mode1(rspApp) {
    const ps = TPPageState.s


    let htmlContent = generate_htmlContent_with_VersionColumns(rspApp, ps.fontSize);

    for (let iver = 0; iver < rspApp.length; iver++) {
        const version_of_ps = rspApp[iver].version;
        const one_result_of_version = rspApp[iver]

        for (let irow = 0; irow < one_result_of_version.record.length; irow++) {
            const one_record = one_result_of_version.record[irow];

            let div_lec = generate_div_lec(one_record, ps, version_of_ps);
            htmlContent.children().eq(iver).append(div_lec)

        }
    }

    return htmlContent;
}

/**
 * 
 * @param {TpOneRecordBibleText} one_record 
 * @param {TPPageState} ps 
 * @param {string} version_of_record 
 */
function generate_div_lec(one_record, ps, version_of_record) {
    let bibleText = "";
    if (one_record != null) {
        const isOld = one_record.book < 40
        bibleText = parseBibleText(one_record.bible_text, ps, isOld, version_of_record);
    }
    else {
        bibleText = "";
    }

    if (bibleText == "a") {
        bibleText = "【併入上節】";
    } 

    // 換行處理 \n 變成 <br/> 或 ↩
    bibleText = replace_newline_char(bibleText, version_of_record)

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
    var bibleText2 = addHebrewOrGreekCharClass(version_of_record, bibleText)

    const book = one_record.book
    const chap = one_record.chap;
    const sec = one_record.sec;

    let div_lec = $("<div>").addClass('lec').attr('ver', version_of_record).attr('chap', chap).attr('sec', sec).attr('book', book)
    
    let div_lec2 =$("<div>").addClass(classDiv).css({
        margin: '0px 0.25rem 0px 0.25rem',
        padding: '7px 0px',
        height: '100%',
    }).appendTo(div_lec);

    // <span.verseNumber>1 </span>
    div_lec2.append(generate_verse_number_jdom(sec, version_of_record))

    div_lec2.append($("<span>").addClass(className).html(bibleText2))    

    return div_lec;
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


