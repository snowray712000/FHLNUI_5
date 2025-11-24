/* QUnit tests for cvt_others -> addReference flow
   ES6+ (works in Node 14+ / modern runtimes). 
   將以下檔案放在測試資料夾並依需要調整 import 路徑。 
*/

/** 
 * @typedef {import('./../index/AddParenthesesUnvNcv.js').DTextsWithAddr} DTextsWithAddr
 * @typedef {import('./../index/AddParenthesesUnvNcv.js').DText} DText
 */

/**
 * @typedef {import('./TpQUnit.js').TpQUnit} TpQUnit
 * @typedef {import('./TpQUnit.js').TpAssert} TpAssert
 */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);


import { add_reference_in_comment_text } from './../index/AddReferenceInCommentText.js'
import { ReferenceNcv } from './ReferenceNcv.js'
import { ReferenceOther } from './ReferenceOther.js'
import { TPPageState } from '../index/TPPageState.es2023.js';
/**
 * 
 * @param {DTextsWithAddr} dtexts_with_addr 
 * @param {string} ver
 */
function addReference(dtexts_with_addr, ver = 'ncv') {
    const dtexts = dtexts_with_addr[3];
    toStandard();

    // console.log("after toStandard");
    // console.log(JSON.stringify(dtexts));

    const re1 = add_reference_in_comment_text(dtexts_with_addr[3], { book: dtexts_with_addr[0], chap: dtexts_with_addr[1], verse: dtexts_with_addr[2] });

    // console.log("after in_comment_text");
    // console.log(JSON.stringify(re1));
    
    dtexts_with_addr[3] = re1;


    return
    // return { children: re1, addresses: it1.addresses, ver: it1.ver };

    /** 讓參考形如 路:1-2 */
    function toStandard() {

        const isGb = TPPageState.s.gb == 1 ? 1 : undefined;
        for (const it2 of dtexts) {
            // 新譯本特別處理
            let refTool =
                ver === 'ncv' ? new ReferenceNcv(it2.w, isGb) : new ReferenceOther(it2.w, isGb);

            if (refTool.isIncludeRef()) {
                it2.w = refTool.toStandard();
                // 這裡不用加 .isRef 之類的，這個工作交給 add_reference_in_comment_text 處理
                // 這裡主要是將 全型之類 的轉成準備的
                // 而這個全型是因為不同的譯本產生的。                
            }
        }
        return;
    }
}

QUnit.module("cvt_others.addReference flow");
QUnit.test("Case 1: single shorthand '#1:1|' becomes isRef with refDescription using addr book", assert => {
    /** @type {DTextsWithAddr} */
    const input = [45, 1, 1, [
        { w: "（一）表明自己身分（" },
        { w: "#1:1|" },
        { w: "）" }
    ]]

    addReference(input, 'unv');

    console.log(JSON.stringify(input));
    
    const out_dtexts = input[3]
    const refNodes = out_dtexts.filter(c => c && c.isRef === 1);
    assert.equal(refNodes.length, 1, "應該有一個 isRef 節點");
    // assert.equal(refNodes[0].w.replace(/^\s+|\s+$/g, ''), "#1:1|", "isRef 的 w 內容應該是 '#1:1|'（或已被正規化）");
    // assert.equal(refNodes[0].refDescription, "羅1:1", "refDescription 應以地址的書卷為預設 (book:45 -> '羅')");
})

