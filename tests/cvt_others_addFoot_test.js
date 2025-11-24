/* QUnit tests for cvt_others -> addFoot flow (ES6+ / ES2023)
   Place in test folder and run with QUnit runner.

   This test file:
   - Defines a runAddFoot helper that mirrors cvt_others.addFoot behavior
     (splits "【n】" markers and attaches foot object).
   - Runs multiple QUnit tests covering the cases described in the spec above.
   - If you can import the real addFoot from your compiled code, replace runAddFoot usage accordingly.
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
/**
 * @typedef { import("../index/DText.js").DText } DText
 * @typedef {import('./../index/AddParenthesesUnvNcv.js').DTextsWithAddr} DTextsWithAddr
 */

import { runAddFoot } from './../index/cvt_others_addFoot.js';

// QUnit tests
QUnit.module("cvt_others.addFoot");

QUnit.test("Case 1: 前文【1】後文", assert => {
    assert.expect(5);

    const dtexts_with_addr = [45, 3, 7, [{ w: "前文【1】後文" }]];
    const ver = "v-test";

    // in-place, 所以 需 clone 一份
    const out = structuredClone(dtexts_with_addr);
    runAddFoot(out, ver);

    // after splitting we expect 3 children
    assert.equal(out[3].length, 3, "應該拆成三個 children 元素");
    assert.equal(out[3][0].w, "前文", "第一個為前文");
    assert.equal(out[3][1].w, "【1】", "第二個為完整的注腳標記");
    assert.ok(out[3][1].foot, "第二個節點應該有 foot 屬性");
    // verify foot object values
    assert.deepEqual(out[3][1].foot, { id: 1, version: "v-test", book: 45, chap: 3, verse: 7 }, "foot 物件應含 id/version/book/chap/verse");
});

QUnit.test("Case 2: A【1】B【2】C", assert => {
    assert.expect(6);

    const dtexts_with_addr = [10, 1, 1, [{ w: "A【1】B【2】C" }]];
    const ver = "abc";


    const out = structuredClone(dtexts_with_addr);
    runAddFoot(out, ver);

    const o_dtexts = out[3];

    // expected sequence: "A", "【1】", "B", "【2】", "C"
    assert.equal(o_dtexts.length, 5, "應拆為五個片段");
    assert.equal(o_dtexts[0].w, "A");
    assert.equal(o_dtexts[1].w, "【1】");
    assert.equal(o_dtexts[2].w, "B");
    assert.equal(o_dtexts[3].w, "【2】");
    assert.deepEqual(o_dtexts[3].foot, { id: 2, version: "abc", book: 10, chap: 1, verse: 1 }, "第二個 foot 應正確設定");
});

QUnit.test('Case 3: [{ w: "普通文字" }, { w: "另一段" }]', assert => {
    assert.expect(2);

    const dtexts_with_addr = [2, 2, 2, [{ w: "普通文字" }, { w: "另一段" }]];
    const ver = "v";

    const out = structuredClone(dtexts_with_addr);
    runAddFoot(out, ver);

    const out_dtexts = dtexts_with_addr[3];
    // No splitting expected; children should remain same number and same w values
    assert.equal(out[3].length, out_dtexts.length, "children 長度不變");
    assert.deepEqual(out[3].map(c => c.w), out_dtexts.map(c => c.w), "children 內容不變");
});

QUnit.test('Case 4: [{ w: "【5】開頭" }, { w: "結尾【9】" }]', assert => {
    assert.expect(4);

    const dtexts_with_addr = [3, 3, 3, [{ w: "【5】開頭" }, { w: "結尾【9】" }]];
    const ver = "ver1";

    const out = structuredClone(dtexts_with_addr);
    runAddFoot(out, ver);

    const out_dtexts = out[3];

    // First original child becomes two pieces
    assert.equal(out_dtexts[0].w, "【5】", "第一個拆出注腳在最前");
    assert.deepEqual(out_dtexts[0].foot, { id: 5, version: "ver1", book: 3, chap: 3, verse: 3 });
    // ensure last foot also parsed
    const last = out_dtexts.find(c => c.foot && c.foot.id === 9);
    assert.ok(last, "應該可以找到 id==9 的 foot 節點");
    assert.deepEqual(last.foot, { id: 9, version: "ver1", book: 3, chap: 3, verse: 3 });
});

QUnit.test('Case 5: "{ isBr: 1 }, { w: "文中【3】" },{}"', assert => {
    assert.expect(3);

    const dtexts_with_addr = [7, 7, 7, [{ isBr: 1 }, { w: "文中【3】" }, {}]];
    const ver = "vv";

    const out = structuredClone(dtexts_with_addr);
    runAddFoot(out, ver);

    const dtexts_out = out[3];

    // first node preserved

    assert.equal(dtexts_out[0].isBr, 1, "isBr node preserved");
    // middle should be split
    assert.ok(dtexts_out.some(c => c.foot && c.foot.id === 3), "應該有 id==3 的 foot");
    // last node (empty object) preserved as-is (w undefined)
    const hadEmpty = dtexts_out.some(c => c && c.w == undefined && c.isBr !== 1 && Object.keys(c).length === 0);
    assert.ok(hadEmpty, "empty object node preserved");
});

QUnit.test('Case 6: { w: "這裡有錯誤的【X】標記" }, { w: "空的【】標記" }', assert => {
    assert.expect(2);

    const dtexts_with_addr = [99, 9, 9, [{ w: "這裡有錯誤的【X】標記" }, { w: "空的【】標記" }]];
    const ver = "vX";

    const out = structuredClone(dtexts_with_addr);
    runAddFoot(out, ver);

    // Because our splitter looks for (\d+) inside brackets, these will not be treated as exec != null
    // so they remain as normal text segments (no foot property)
    const anyFoot = out[3].some(c => c.foot);
    assert.notOk(anyFoot, "沒有合法數字標記時不應產生 foot 屬性");
    // ensure function still returns a usable children array
    assert.ok(Array.isArray(out[3]) && out[3].length >= 1, "回傳 children 陣列");
});
