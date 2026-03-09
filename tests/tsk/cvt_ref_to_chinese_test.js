/**
 * @typedef {import('./../TpQUnit.js').TpQUnit} TpQUnit
 * @typedef {import('./../TpQUnit.js').TpAssert} TpAssert
 */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

QUnit.module('cvt_ref_to_chinese');

/**
 * @typedef {import('./../TpQUnit.js').TpQUnit} TpQUnit
 * @typedef {import('./../TpQUnit.js').TpAssert} TpAssert
 */

import { cvt_ref_to_chinese } from "./../../index/tsks/cvt_ref_to_chinese.js";

QUnit.module('cvt_ref_to_chinese');

QUnit.test('基本案例: Job / Ps / Isa', function (assert) {
    /** @type {TpAssert} */
    const a = assert;
    const input = "# Job 26:14; Ps 33:6; 104:30; Isa 40:12-14|";
    const actual = cvt_ref_to_chinese(input, false, false);
    a.equal(actual, "# 伯 26:14; 詩 33:6; 104:30; 賽 40:12-14|");
});

QUnit.test('你的 Case: 前段無書卷 + Ec', function (assert) {
    /** @type {TpAssert} */
    const a = assert;
    const input = "# 10,12,18,25,31; Ec 2:13; 11:7|";
    const actual = cvt_ref_to_chinese(input, false, false);
    a.equal(actual, "# 10,12,18,25,31; 傳 2:13; 11:7|");
});

QUnit.test('數字書卷: 1Ki / 2Ki', function (assert) {
    /** @type {TpAssert} */
    const a = assert;
    const input = "# 1Ki 3:5; 2Ki 1:2; 1Ki 8:10|";
    const actual = cvt_ref_to_chinese(input, false, false);
    a.equal(actual, "# 王上 3:5; 王下 1:2; 王上 8:10|");
});

QUnit.test('數字書卷: 1Jo / 2Jo / 3Jo', function (assert) {
    /** @type {TpAssert} */
    const a = assert;
    const input = "# 1Jo 1:1; 2Jo 1:5; 3Jo 1:2|";
    const actual = cvt_ref_to_chinese(input, false, false);
    a.equal(actual, "# 約一 1:1; 約二 1:5; 約三 1:2|");
});

QUnit.test('簡體 + 全名（含數字書卷）', function (assert) {
    /** @type {TpAssert} */
    const a = assert;
    const input = "# 1Ki 3:5; 1Jo 1:1|";
    const actual = cvt_ref_to_chinese(input, true, true);
    a.equal(actual, "# 列王纪上 3:5; 约翰壹书 1:1|");
});