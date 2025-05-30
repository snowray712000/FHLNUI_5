import { TPPageState } from "./TPPageState.es2023.js";
import { addHebrewOrGreekCharClass, isHebrewOrGeekVersion, parseBibleText } from "./FhlLecture_render_mode_common_es2023.js";

{/* <div id="lecMain">
    <div class="vercol" style="vertical-align:top; margin-top: [計算值]px">
        <!-- 每一節內容 -->
        <div class="lec" book="[書卷索引]" chap="[章]" sec="[節]" ver="[版本]">
            <div class="[可能的 classDiv]" style="margin: 0px 0.25rem 0px 0.25rem; padding: 7px 0px; height: 100%;">
                <span class="verseNumber">[節數]</span>
                [可能的 brForHebrew]
                <span class="verseContent [可能的 bstw]">[經文內容 + 版本名稱]</span>
            </div>
        </div>
        <!-- 更多的 .lec -->
    </div>
</div> */}


/**
 * 
 * @param {import("./FhlLecture_render_mode_common.es2023").TpResultBibleText[]} rspArr 
 * @returns 
 */
export function FhlLecture_render_mode2(rspArr) {
    const ps = TPPageState.s

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

    // 注意, 這個變數, 只是暫存的, 它輽出的結果是 html 文字, 不包含自己, 所以lecMain屬性是在另種設定, 不是在這
    // 不要再從這裡改 <div style=padding:10px 50px></div>, 不會有效果的.
    var $htmlContent = $("<div id='lecMain'></div>");

    var onever = $("<div class='vercol' style='vertical-align:top; margin-top: " + (ps.fontSize * 1.25 - 15) + "px'></div>");

    $htmlContent.append(onever);

    // 每一節內容
    for (var i = 0; i < maxRecordCnt; i++) {
        var maxR = rspArr[maxRecordIdx].record[i]; //原 var maxR = rspArr[maxRecordIdx].record[i];
        var chap = maxR.chap, sec = maxR.sec;

        for (var j = 0; j < rspArr.length; j++) {
            var r1 = rspArr[j];
            const version_of_record = rspArr[j].version;

            if (rspArr.length > 1) {
                var vname = "<br/><span class='ver'> (" + r1.v_name + ")</span> "; //新譯本 合和本 etc
            }
            else {
                var vname = ""; //只有一種版本就不要加了
            }

            if (i >= r1.record_count) {
                //此版本 本章節比較少,
                var className = 'verseContent ';
                if (version_of_record == "thv12h" || version_of_record == 'ttvh') // 2018.01 客語特殊字型(太1)
                    className += ' bstw'

                let book = ps.bookIndex
                let div_lec = $("<div>").addClass("lec").attr('book', book).attr('chap', chap).attr('sec', sec).attr('ver', version_of_record).append(
                    $("<div>").css('margin', '0px 0px 0px 0px').css('padding', '7px 0px').css('height', '100%').append(
                        $("<span>").addClass('verseNumber').text(sec)).append($("<span>").addClass(className).html(vname))
                )

                onever.append(div_lec)

            }
            else {

                const rec = rspArr[j].record[i]; //原 var rec = getRecord(rspArr[j].record, null, chap, sec);
                let bibleText = "";
                const isOld = rec.book < 40

                if (rec != null)
                    bibleText = parseBibleText(rec.bible_text, ps, isOld, version_of_record);
                else
                    bibleText = "";
                if (bibleText == "a") {
                    bibleText = "【併入上節】";
                }
                if (version_of_record == "bhs") {
                    // bhs 馬索拉原文 (希伯來文)
                    bibleText = bibleText.split(/\n/g).reverse().join("<br>");
                }
                else if (version_of_record == "cbol") {
                    // cbol: 原文直譯參考用
                    bibleText = bibleText.split(/\n/g).join("<br>");
                    //console.log(bibleText);
                }
                else if (version_of_record == "nwh") {
                    bibleText = bibleText.split(/\n/g).join("<br>");
                }

                var className = 'verseContent';
                if (version_of_record == "thv12h" || version_of_record == 'ttvh') // 2018.01 客語特殊字型(太1)
                    className += ' bstw'

                // bhs 馬索拉原文 , 靠右對齊 要放在div, 放在 verseContent 無效
                // add by snow. 2021.07
                var classDiv = ''
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
                const bibleText2 = addHebrewOrGreekCharClass(version_of_record, bibleText)

                let book = ps.bookIndex
                let div_lec = $("<div>").addClass("lec").attr('book', book).attr('chap', chap).attr('sec', sec).attr('ver', version_of_record).append(
                    $("<div>").addClass(classDiv).css('margin', '0px 0.25rem 0px 0.25rem').css('padding', '7px 0px').css('height', '100%').append(
                        $("<span>").addClass('verseNumber').text(sec)).append(brForHebrew).append($("<span>").addClass(className).html(bibleText2 + vname))
                )
                onever.append(div_lec)
            }
        }
    }


    return $htmlContent
}