/**
 * QUnit tests for VerseRangeToString.js
 *
 * These tests monkey-patch external helpers lightly where needed (BibleBookNames)
 * so we can verify formatting behavior for in-book, contiguous verse groups.
 *
 * Run in an environment where QUnit is available as global `QUnit`.
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

import { VerseRangeToString } from '../index/VerseRangeToString.js';

// import { BibleBookNames } from 'src/app/const/book-name/BibleBookNames.js';
// import { BookNameLang } from 'src/app/const/book-name/BookNameLang.js';

QUnit.module('VerseRangeToString', hooks => {
    hooks.before(() => {
        // origGetBookName = BibleBookNames.getBookName;
    });

    hooks.after(() => {
        // if (origGetBookName) BibleBookNames.getBookName = origGetBookName;
    });

    QUnit.test('簡單合併 太1:1-2,4', assert => {
        // Monkey-patch the book name resolution so the output is stable
        const vts = [
            { book: 40, chap: 1, verse: 1 },
            { book: 40, chap: 1, verse: 2 },
            { book: 40, chap: 1, verse: 4 }
        ];

        const s = new VerseRangeToString();
        const out = s.main(vts, "羅");

        // Expect: '太1:1-2,4'
        assert.equal(out, '太1:1-2,4', '連續節會合併成範圍並正確加上書卷名稱');
    });
});