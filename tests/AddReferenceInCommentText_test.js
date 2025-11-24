/**
 * Unit tests for AddReferenceInCommentText
 *
 * These tests follow the style of the example you provided.
 *
 * Notes:
 * - The tests monkey-patch VerseRange.fD and DisplayLangSetting.s.getValueIsGB
 *   so we can run deterministically without depending on full VerseRange.
 * - The tests call AddReferenceInCommentText.main(datas, addrSet) directly.
 *
 * If your test runner imports .js files after compilation, adjust the import paths
 * to point to the compiled .js modules instead of the .ts source.
 */

/**
 * @typedef {import('./../index/DText.js').DText } DText
 * @typedef {import('./../index/cvt_others.js').DTextsWithAddr } DTextsWithAddr
 */

/** @typedef {import('./TpQUnit.js').TpQUnit} TpQUnit */
/** @typedef {import('./TpQUnit.js').TpAssert} TpAssert */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

// Import the class under test and the modules we will mock.
// Adjust extension if your environment requires .js instead of .ts
import { add_reference_in_comment_text } from './../index/AddReferenceInCommentText.js';
import { VerseRange } from './../index/VerseRange.js';
import { TPPageState } from '../index/TPPageState.es2023.js';
QUnit.module('add_reference_in_comment_text', hooks => {

    const original_gb = TPPageState.s.gb
    const original_fD = VerseRange.fD;

    hooks.afterEach(() => {
        TPPageState.s.gb = original_gb;
        VerseRange.fD = original_fD;
    });

    QUnit.test('沒有 ref 文字', assert => {
        const input = [
            { w: "這是一段沒有 reference 的文字。" }
        ];
        const addr = { book: 1 };

        const out = add_reference_in_comment_text(input, addr);

        assert.equal(JSON.stringify(out), JSON.stringify(input), 'output should equal input when no #...| appears');
    });

    QUnit.test('一個參照', assert => {

        const input = [{ w: "前言 #創1:1| 後文" }]

        const addr = { book: 1 };

        const out = add_reference_in_comment_text(input, addr);

        assert.equal(out.length, 3, '會分成 3 個');
        assert.equal(out[0].w, '前言 ', '第一段文字正確');
        assert.equal(out[1].w, '#創1:1|', '第二段是參照文字');
        assert.equal(out[1].isRef, 1, '第二段有 isRef 標記');
        assert.equal(out[1].refDescription, '創1:1', '參照描述正確');
        assert.equal(out[2].w, ' 後文', '第三段文字正確');
    });
    QUnit.test('預設書卷(繁體、簡體)', assert => {
        const input = [{ w: "前言 #1:1| 後文" }]

        const addr = { book: 45 };

        TPPageState.s.gb = 0 // 繁體

        const out = add_reference_in_comment_text(input, addr);

        assert.equal(out.length, 3, '會分成 3 個');
        assert.equal(out[1].w, '#1:1|', '第二段是參照文字');
        assert.equal(out[1].isRef, 1, '第二段有 isRef 標記');
        assert.equal(out[1].refDescription, '羅1:1', '參照描述正確');

        TPPageState.s.gb = 1 // 簡體

        const out2 = add_reference_in_comment_text(input, addr);

        assert.equal(out2[1].w, '#1:1|', '第二段是參照文字');
        assert.equal(out2[1].refDescription, '罗1:1', '參照描述正確');
    })

    QUnit.test('將、full-width comma 合併', assert => {
        
        const input = [{ w: "參考：#1:1、出2:3|。結束" }];
        const addr = { book: 40 };

        const out = add_reference_in_comment_text(input, addr);

        assert.equal(out[1].w, '#1:1、出2:3|', '#1:1、出2:3|');
        assert.equal(out[1].refDescription, '太1:1;出2:3', '太1:1;出2:3');

        const input2 = [{ w: "參考：#1:1|、#出2:3|。結束" }];
        
        const out2 = add_reference_in_comment_text(input2, addr);

        assert.equal(out2[1].w, '#1:1|、#出2:3|', '#1:1|、#出2:3|');
        assert.equal(out2[1].refDescription, '太1:1;出2:3', '太1:1;出2:3');
        
    });

    QUnit.test('不合理參照，視為文字', assert => {
        
        TPPageState.s.gb = 0; // 繁體

        // Use a marker that our mock will throw on
        const input = [{ w: "注：#不存在的書卷名稱 71:7|" }]; // 不合理，就會視為文字

        const out = add_reference_in_comment_text(input, { book: 40 });

        // The code's catch deletes a1.isRef and a1.refDescription for failing items
        assert.equal(out.length, 2, '會切成2個，但不是參照');
        assert.equal(out[0].w, '注：', '前段文字正確');
        assert.equal(out[1].w, '#不存在的書卷名稱 71:7|', '#不存在的書卷名稱 71:7|');
        assert.equal(out[1].isRef, undefined, '不合理參照不應有 isRef');
        assert.equal(out[1].refDescription, undefined, '不合理參照不應有 refDescription');

        const input2 = [{ w: "#創71:1|" }]; // 不合理，就會視為文字
        const out2 = add_reference_in_comment_text(input2, { book: 40 });
        
        assert.equal(out2.length, 1, '不合理參照不切分');
        assert.equal(out2[0].w, '#創71:1|', '#創71:1|');
        assert.equal(out2[0].isRef, undefined, '不合理參照不應有 isRef');
        assert.equal(out2[0].refDescription, undefined, '不合理參照不應有 refDescription');
    });
})
