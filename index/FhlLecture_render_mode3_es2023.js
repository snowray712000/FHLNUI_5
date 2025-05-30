import { charHG } from "./charHG.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js"

import { addHebrewOrGreekCharClass, isHebrewOrGeekVersion, parseBibleText } from "./FhlLecture_render_mode_common_es2023.js";
import { Hash_DAddress } from "./Hash_DAddress_es2023.js";
import { ParagraphData } from './ParagraphData_es2023.js'
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
                });

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

                if (version_of_record == "bhs") {
                    bibleText = bibleText.split(/\n/g).reverse().join("<br>");
                }
                else if (version_of_record == "cbol") {
                    bibleText = bibleText.split(/\n/g).join("<br>");
                    //console.log(bibleText);
                }
                else if (version_of_record == "nwh") {
                    bibleText = bibleText.split(/\n/g).join("<br>");
                }

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

                // add by snow. 2021.07
                // 希伯來文右至左，使得「節」數字，會跑到左邊，應該放在右邊
                var brForHebrew = ''
                if (isHebrewOrGeekVersion(version_of_record)) {
                    brForHebrew += '<br/>'
                }

                // add by snow. 2021.07 原文字型大小獨立出來
                let bibleText2 = addHebrewOrGreekCharClass(version_of_record, bibleText)

                let div_lec = $("<span>").addClass('lec').attr('ver', version_of_record).attr('chap', chap).attr('sec', sec).attr('book', book)

                let div_lec2 = $("<span>").addClass(classDiv).appendTo(div_lec);

                div_lec2.append($("<span>").addClass('verseNumber').text(sec))
                div_lec2.append(brForHebrew).append($("<span>").addClass(className).html(bibleText2))

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

/**
 * 
 * @param {import("./FhlLecture_render_mode_common_es2023.js").TpOneRecordBibleText[]} record 
 * @param {Array<number|string>} paragraphData [book, chap, sec, title]
 * @returns {Array} [[0,1,2], 0] 表示 record[0,1,2] 都屬於 paragraphData[0]。注意，段落若沒找到，則是用  -1
 */
function grouping_by_paragraph(record, paragraphData) {
    if (record.length == 0) {
        return [];
    }
    if (paragraphData.length == 0) {
        // 都在 -1 組
        return [record.map((a1, i) => i), -1];
    }
    // 先假設，內容一定是同一章，同卷書
    // const paragraphData = [[1, 1, 1, "上帝的創造"], [1, 2, 4, "創造的另一記載"], [1, 3, 1, "人違背命令"], [1, 3, 14, "上帝的宣判"], [1, 3, 22, "亞當和夏娃被趕出伊甸園"]]

    // 1. 維持原本 record 的順序 (例如，以後可能用到搜尋結果，或交互參照，就不會把原本的引用順序打亂)


    const paragraph_hash = paragraphData.map(a1 => Hash_DAddress.toHash(a1))

    const record_hash = record.map(a1 => Hash_DAddress.toHash(a1))

    // 每一個 record 屬於哪個 段落 i -> j (i hash 第一次 >= hash of j，就屬於那個 j。若沒有找到，就放在 -1，概念上也不屬於最後一個段落，就是空段落)
    // TODO: 這個應該要用二分搜尋法，因為段落是有順序的
    // const belong_to_paragraph = record_hash.map( hash => {
    //     for (let i = 0; i < paragraph_hash.length; i++) {
    //         if (hash >= paragraph_hash[i]) {
    //             return i; // 找到就回傳 i
    //         }
    //     }
    //     return -1; // 若沒有找到，就放在 -1，概念上也不屬於最後一個段落，就是空段落
    // });

    // 使用二分搜尋法來找出每個 record 屬於哪個段落
    const belong_to_paragraph = record_hash.map(hash => {
        let left = 0;
        let right = paragraph_hash.length - 1;
        let result = -1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (hash >= paragraph_hash[mid]) {
                result = mid; // 暫存可能的結果，繼續向右搜尋
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return result; // 若找不到，預設為 -1
    });
    // console.log(belong_to_paragraph);

    // 2. 將 record 按照段落分組 [[0,1,2], [3,4], [5,6,7]]，每個子陣列代表一個段落的 record index
    const grouped_records = [];
    let current_paragraph_index = belong_to_paragraph[0];
    let current_group = [];
    for (let i = 0; i < belong_to_paragraph.length; i++) {
        if (belong_to_paragraph[i] === current_paragraph_index) {
            current_group.push(i);
        } else {
            grouped_records.push(current_group);
            current_paragraph_index = belong_to_paragraph[i];
            current_group = [i];
        }
    }
    if (current_group.length > 0) {
        grouped_records.push(current_group);
    }

    // 3. 轉換資料，例如 原本 [[0,1,2]] 變為 [[0,1,2], 0], [[3,4], 1], [[5,6,7], 2]，最後一個數字是段落的 index
    const result = grouped_records.map(a1 => {
        // [0,1,2] 就取 [0] 即 0, 然後從 belong_to_paragraph 取得對應的段落索引 
        const paragraph_index = belong_to_paragraph[a1[0]]; // 取得第一個 record 的段落索引
        return [a1, paragraph_index];
    })

    return result
}

