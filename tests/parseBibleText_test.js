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

import { parseBibleText } from '../index/FhlLecture_render_mode_common_es2023.js';

QUnit.test('1 基本經文解析 - 無特殊標記', (assert) => {
    // 安排
    const bible_text = '起初，神創造天地。';
    const ps = { fontSize: 14 };
    const isOT = true;
    const version = 'xxx';

    // 執行
    const result = parseBibleText(bible_text, ps, isOT, version);

    // 驗證
    assert.ok(result.includes('起初'), '應包含原文');
    assert.ok(!result.includes('<WTH'), '應移除 Strong Number 標記');
});

QUnit.test('2 Strong Number 標記處理', (assert) => {
    const bible_text = '<WTH1><WTH2>起初<WTH3><WTH4>，神創造天地。';
    const ps = { show_mode: 1, strong: 0 };
    const isOT = true;
    const version = 'unv';

    const result = parseBibleText(bible_text, ps, isOT, version);
    console.log(result);
    

    // 應該轉換為可點擊的 span
    assert.ok(result.includes('sn-text') || result.includes('class'), '應為 SN 文字添加適當的 class');
    assert.ok(result.includes('起初'), '應保留原文');
});

QUnit.test('換行符號處理', (assert) => {
    const bible_text = '第一行\n第二行';
    const ps = { fontSize: 14 };
    const isOT = true;
    const version = 'cuvs';

    const result = parseBibleText(bible_text, ps, isOT, version);

    // 根據您的實現，可能是 <br/> 或其他換行標記
    assert.ok(result.includes('br') || result.includes('\n'),
        '應保留換行');
});

QUnit.test('特殊譯本處理 - KJV', (assert) => {
    const bible_text = '生命<Rf>a</Rf>的道';
    const ps = { fontSize: 14 };
    const isOT = true;
    const version = 'kjv';

    const result = parseBibleText(bible_text, ps, isOT, version);

    // KJV 應該特別處理 <Rf> 標記
    assert.ok(result.includes('生命'), '應保留主要文字');
    assert.notOk(result.includes('<Rf>'), '應移除 <Rf> 標記');
});

QUnit.test('特殊譯本處理 - 客語（thv12h）', (assert) => {
    const bible_text = '起初，神創造天地。';
    const ps = { fontSize: 14 };
    const isOT = true;
    const version = 'thv12h';

    const result = parseBibleText(bible_text, ps, isOT, version);

    // 客語應添加特殊字型 class
    assert.ok(result.includes('bstw') || result.includes('thv'),
        '應為客語添加特殊字型 class');
});

QUnit.test('新約 vs 舊約標記差異', (assert) => {
    const bible_text = '<WTH1000>道</WTH1000>';
    const ps = { fontSize: 14 };
    const version = 'cuvs';

    const resultOT = parseBibleText(bible_text, ps, true, version);  // 舊約
    const resultNT = parseBibleText(bible_text, ps, false, version); // 新約

    // 兩者可能使用不同的 Strong Number 系統
    assert.ok(resultOT.includes('道'), '舊約應保留文字');
    assert.ok(resultNT.includes('道'), '新約應保留文字');
});

QUnit.test('併入上節的情況', (assert) => {
    const bible_text = 'a'; // 根據您的程式碼，'a' 表示併入上節
    const ps = { fontSize: 14 };
    const isOT = true;
    const version = 'cuvs';

    const result = parseBibleText(bible_text, ps, isOT, version);

    // 在 FhlLecture_render_mode3_es2023.js 中會被替換為 "【併入上節】"
    assert.equal(result, 'a', '應返回 "a" 供上層程式碼判斷');
});

QUnit.test('複雜混合內容', (assert) => {
    const bible_text = '起初<WTH1>神</WTH1>創造\n天<WTH2>地</WTH2>。';
    const ps = { fontSize: 14 };
    const isOT = true;
    const version = 'cuvs';

    const result = parseBibleText(bible_text, ps, isOT, version);

    // 應同時處理 SN、換行等
    assert.ok(result.includes('起初'), '應保留開頭');
    assert.ok(result.includes('神'), '應保留 SN 對應文字');
    assert.ok(result.includes('地'), '應保留結尾文字');
    assert.ok(result.includes('br') || result.includes('\n'), '應保留換行');
});

QUnit.test('parseBibleText_to_DText 回傳 DText 陣列', (assert) => {
    const bible_text = '<WTH1>起初</WTH1>，神創造天地。';
    const ps = { fontSize: 14 };

    const result = parseBibleText_to_DText(bible_text, ps, true, 'cuvs');

    assert.ok(Array.isArray(result), '應回傳陣列');
    assert.ok(result.length > 0, '陣列不應為空');
    assert.ok(result.some(item => item.w === '起初'), '應包含對應的 DText 元素');
});

QUnit.test('parseBibleText_to_DText → cvtDTextsToHtml 輸出應與舊函數相同', (assert) => {
    const bible_text = '<WTH1>起初</WTH1>，神創造天地。';
    const ps = { fontSize: 14 };

    // 舊方式
    const oldResult = parseBibleText(bible_text, ps, true, 'cuvs');

    // 新方式
    const dTexts = parseBibleText_to_DText(bible_text, ps, true, 'cuvs');
    const newResult = cvtDTextsToHtml(dTexts);

    assert.equal(newResult, oldResult, '新舊輸出應相同');
});