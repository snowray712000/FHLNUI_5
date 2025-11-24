
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

QUnit.module("prepare_dtexts_for_html");


QUnit.test("tp=1: 一行一個，不合併", assert => {
    const book = 40;
    const chap = 6;
    const verse = 37;
    const bookName = BibleConstantHelper.getBookNameArrayChineseShort()[book - 1];
    const addrStr = `${bookName} ${chap}:${verse}`;
    const address = BibleConstantHelper.generateAddressesTpF(book, chap);

    const input = [
        [book, chap, verse, [{ w: "你們不要" }, { w: "論斷" }]]
    ];

    const expected = [
        { w: addrStr, refDescription: addrStr, isRef: 1, refAddresses: address },
        { w: " " },
        { w: "你們不要" },
        { w: "論斷" }
    ];

    const out = prepare_dtexts_for_html(input, 1);
    assert.deepEqual(out, expected, "tp=1 output matches expected structure");
});


QUnit.test("tp=2: 連續的會放一起", assert => {
    const book = 40;
    const bookName = BibleConstantHelper.getBookNameArrayChineseShort()[book - 1];

    const input = [
        [book, 1, 2, [{ w: "a" }]],
        [book, 1, 3, [{ w: "b" }]],
        [book, 1, 4, [{ w: "c" }]],
        [book, 2, 1, [{ w: "d" }]]
    ];

    // Build expected by imitating prepare_dtexts_for_html behavior
    const expected = [];

    // First group: verses 2,3,4 (contiguous in chap 1)
    const group1Addrs = [];
    for (const [b, ch, v, contents] of input.slice(0, 3)) {
        // verse ref
        expected.push({
            w: `${v}`,
            refDescription: `${bookName}:${ch}`,
            isRef: 1,
            refAddresses: BibleConstantHelper.generateAddressesTpF(b, ch)
        });
        expected.push({ w: " " });
        // contents
        for (const dt of contents) {
            expected.push(dt);
        }
        group1Addrs.push({ book: b, chap: ch, verse: v });
    }
    // merged addr for group1
    const addrStr1 = `(${bookName}1:2-4)`;
    expected.push({ w: addrStr1, refDescription: addrStr1, isRef: 1, refAddresses: structuredClone(group1Addrs) });
    expected.push({ isBr: 1 });

    // Second group: single verse (book,2,1)
    const [b2, ch2, v2, contents2] = input[3];
    expected.push({
        w: `${v2}`,
        refDescription: `${bookName}:${ch2}`,
        isRef: 1,
        refAddresses: BibleConstantHelper.generateAddressesTpF(b2, ch2)
    });
    expected.push({ w: " " });
    for (const dt of contents2) expected.push(dt);

    // merged addr for single verse (no trailing br because function removes final br)
    const addrStr2 = `(${bookName}${ch2}:${v2})`;
    expected.push({ w: addrStr2, refDescription: addrStr2, isRef: 1, refAddresses: [{ book: b2, chap: ch2, verse: v2 }] });

    const out = prepare_dtexts_for_html(input, 2);

    assert.deepEqual(out, expected, "tp=2 output matches expected merged ranges and items");
});