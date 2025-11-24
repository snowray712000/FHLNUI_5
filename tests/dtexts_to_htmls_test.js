
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

import { TPPageState } from '../index/TPPageState.es2023.js';
import { BibleConstantHelper } from '../index/BibleConstantHelper.es2023.js';
import { prepare_dtexts_for_html } from '../index/prepare_dtexts_for_html.js';


// QUnit tests
QUnit.module("dtexts_to_htmls");

QUnit.test("Case 1: ", assert => {
    const dtexts_with_addr1 = [42, 6, 37, [{w: "{<2532>}", tp: "G", sn: "2532", isCurly: 1},{ w: "你們不要"},{w:"<3361>", tp:"G", sn:"3361"},{ w: "論斷"}]];
    const dtexts_with_addr2 = [42, 6, 38, [{ w: "你們要給人" },{w: "<1325>", tp: "G", sn: "1325"},{w: '(5720)', tp: 'G', sn: '5720'},{ w: '，就'}]];

    // 不合併型，一個就一行，用 br 隔開
    const datas1 = [dtexts_with_addr1,dtexts_with_addr2]
    const datas2 = prepare_dtexts_for_html(datas1, 2);
    
    console.error(datas2);
    

    // in-place, 所以 需 clone 一份
    // 37 你們不要論斷 38 你們要給人，就 (路6:37-38)
    // 
    assert.ok(false)

    
});

QUnit.test("Case 1: ", assert => {
    const dtexts_with_addr1 = [42, 6, 37, [{w: "{<2532>}", tp: "G", sn: "2532", isCurly: 1},{ w: "你們不要"},{w:"<3361>", tp:"G", sn:"3361"},{ w: "論斷"}]];
    const dtexts_with_addr2 = [42, 6, 38, [{ w: "你們要給人" },{w: "<1325>", tp: "G", sn: "1325"},{w: '(5720)', tp: 'G', sn: '5720'},{ w: '，就'}]];

    // 不合併型，一個就一行，用 br 隔開
    const datas = [[dtexts_with_addr1,dtexts_with_addr2]]

});