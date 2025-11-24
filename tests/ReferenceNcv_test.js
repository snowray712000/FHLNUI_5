/* QUnit tests for ReferenceNcv (ES6+)
   放置測試資料夾，並依需要調整 import 路徑以載入真實模組。 
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

import { ReferenceNcv } from './ReferenceNcv.js';

QUnit.module("ReferenceNcv");

QUnit.test("isIncludeRef: should detect NCV-style references in parentheses", assert => {
    assert.expect(3);
    const a = new ReferenceNcv("林前11 要用合適的態度吃主的聖餐（太26:26~28；可14:22~24；路22:17~20）");
    assert.ok(a.isIncludeRef(), "應偵測為包含參照");
    const b = new ReferenceNcv("這是一段沒有參照的句子。");
    assert.notOk(b.isIncludeRef(), "不含參照時應回傳 false");
    const c = new ReferenceNcv("徒 9 掃羅悔改歸主（徒22:3~16，26:9~18）");
    assert.ok(c.isIncludeRef(), "另一個包含參照的例子也應被偵測到");
});

QUnit.test("toStandard: converts NCV parentheses to #...| standardized form", assert => {
    assert.expect(2);
    const s = "林前11 要用合適的態度吃主的聖餐（太26:26~28；可14:22~24；路22:17~20）";
    const inst = new ReferenceNcv(s);
    const out = inst.toStandard();
    // 檢查是否將括號中的 ~ -> -、；、， 轉為分號 ;，並以 #...| 包住
    assert.ok(out.indexOf("（#") > -1 && out.indexOf("|）") > -1, "輸出應包含 '（#' 與 '|）' 包覆");
    // 檢查範例的 ~ 被換成 -
    assert.ok(/26-28/.test(out) && /22-24/.test(out), "範圍符號 '~' 應被轉成 '-'");
});

QUnit.test("toStandard: non-reference strings remain unchanged", assert => {
    assert.expect(1);
    const s = "這是一段沒有參照的句子。";
    const inst = new ReferenceNcv(s);
    const out = inst.toStandard();
    assert.equal(out, s, "無參照時 toStandard 不應修改原文字");
});

QUnit.test("toStandard: handles multiple occurrences in one string", assert => {
    assert.expect(2);
    const s = "語句一（太26:26~28；可14:22~24；路22:17~20）中段語句二（徒22:3~16，26:9~18）結尾";
    const inst = new ReferenceNcv(s);
    const out = inst.toStandard();
    // 應該把兩個括號內的參照都轉換為 #...|
    const matches = out.match(/（#([^|]+)\|\）/g) || [];
    assert.equal(matches.length, 2, "應該轉換出兩處包成 #...| 的括號參照");
    // 確認第一處的太26 範圍被轉換成 '-'
    assert.ok(/太26:26-28/.test(out) || /太26:26-28/.test(out), "第一處範圍應包含 '-'");
});

