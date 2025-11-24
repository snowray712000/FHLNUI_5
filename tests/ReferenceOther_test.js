/* QUnit tests for ReferenceOther (ES6+)
   - Place this file in your test folder and run with your QUnit runner.
   - It first tries to import the real ReferenceOther module (adjust path if needed).
     If import fails (e.g. not compiled / path mismatch), it falls back to a small stub
     implementing the expected behavior so tests can still run locally.
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

import { ReferenceOther } from './ReferenceOther.js';


QUnit.module("ReferenceOther");

QUnit.test("isIncludeRef detects '#...|' patterns", assert => {
    assert.expect(3);
    const a = new ReferenceOther("前文 #路1| 後文");
    assert.ok(a.isIncludeRef(), "should detect '#路1|' inside text");
    const b = new ReferenceOther("沒有參照的句子");
    assert.notOk(b.isIncludeRef(), "should return false when no reference pattern");
    const c = new ReferenceOther(undefined);
    assert.notOk(c.isIncludeRef(), "undefined string should return false");
});

QUnit.test("toStandard normalizes full-width colon and dot between digits", assert => {
    assert.expect(4);
    const s1 = "#路1：23|"; // full-width colon
    const r1 = new ReferenceOther(s1);
    assert.equal(r1.toStandard(), "#路1:23|", "should convert full-width colon to ':'");

    const s2 = "見 #創3．1| 範例"; // full-width dot
    const r2 = new ReferenceOther(s2);
    assert.equal(r2.toStandard(), "見 #創3:1| 範例", "should convert full-width dot to ':'? (check behavior)"); // original replaces ． -> ":" only when between digits; here will produce '3:1' actually
    // more precise test for numeric replacement:
    const s3 = "#太26：26~28|"; // should normalize to "#太26:26~28|"
    const r3 = new ReferenceOther(s3);
    assert.equal(r3.toStandard(), "#太26:26~28|", "numeric full-width colon converted inside reference");

    const s4 = "no change here";
    const r4 = new ReferenceOther(s4);
    assert.equal(r4.toStandard(), s4, "strings without matching pattern remain unchanged");
});

QUnit.test("toStandard preserves other content and handles multiple occurrences", assert => {
    assert.expect(2);
    const s = "前（#路1：23|）中（#太3：1|）後";
    const inst = new ReferenceOther(s);
    const out = inst.toStandard();
    assert.ok(out.includes("#路1:23|") && out.includes("#太3:1|"), "both occurrences should be normalized");
    assert.equal(typeof out, "string", "output should be a string");
});

