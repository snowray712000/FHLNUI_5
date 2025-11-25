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

import { grouping_by_paragraph } from "./../index/grouping_by_paragraph.js";
import { Hash_DAddress } from "./../index/Hash_DAddress_es2023.js";

/**
 * @typedef {import('./TpQUnit.js').TpQUnit} TpQUnit
 * @typedef {import('./TpQUnit.js').TpAssert} TpAssert
 */

QUnit.module("grouping_by_paragraph", hooks => {
    // Mock Hash_DAddress for consistent hashing in tests
    hooks.before(() => {
        // This simple hash is sufficient for testing the grouping logic
        // as long as it maintains order.
        Hash_DAddress.toHash = (addr) => {
            const book = addr.book ?? addr[0];
            const chap = addr.chap ?? addr[1];
            const sec = addr.sec ?? addr[2];
            return book * 1000000 + chap * 1000 + sec;
        };
    });

    QUnit.test("空資料，回傳空", assert => {
        const record = [];
        const paragraphData = [[1, 1, 1, "p1"]];
        const result = grouping_by_paragraph(record, paragraphData);
        assert.deepEqual(result, [], "Should return an empty array for empty record");
    });

    QUnit.test("沒在任何段落中，全進-1陣列", assert => {
        const record = [
            { book: 1, chap: 1, sec: 1 },
            { book: 1, chap: 1, sec: 2 },
        ];
        const paragraphData = [];
        
        const result = grouping_by_paragraph(record, paragraphData);
        console.log(result);
        assert.deepEqual(result, [[[0, 1], -1]], "All records should be in group -1");
    });

    QUnit.test("跨1章，3段落", assert => {
        const record = [
            { book: 1, chap: 1, sec: 1 }, // p0
            { book: 1, chap: 1, sec: 2 }, // p0
            { book: 1, chap: 1, sec: 5 }, // p1
            { book: 1, chap: 1, sec: 6 }, // p1
            { book: 1, chap: 2, sec: 1 }, // p2
        ];
        const paragraphData = [
            [1, 1, 1, "p1"],
            [1, 1, 5, "p2"],
            [1, 2, 1, "p3"],
        ];
        const result = grouping_by_paragraph(record, paragraphData);
        const expected = [
            [[0, 1], 0],
            [[2, 3], 1],
            [[4], 2],
        ];
        assert.deepEqual(result, expected, "Should group records into their respective paragraphs");
    });

    QUnit.test("段落範圍更前面，有2筆，進-1", assert => {
        const record = [
            { book: 1, chap: 1, sec: 1 }, // -1
            { book: 1, chap: 1, sec: 2 }, // -1
            { book: 1, chap: 1, sec: 5 }, // p0
            { book: 1, chap: 1, sec: 6 }, // p0
        ];
        const paragraphData = [
            [1, 1, 5, "p1"],
        ];
        const result = grouping_by_paragraph(record, paragraphData);
        const expected = [
            [[0, 1], -1],
            [[2, 3], 0],
        ];
        assert.deepEqual(result, expected, "Should group records before the first paragraph into -1");
    });

    QUnit.test("段落範圍更後面也有資料，併入最後一個", assert => {
        const record = [
            { book: 1, chap: 1, sec: 2 },
            { book: 1, chap: 1, sec: 3 },
            { book: 1, chap: 1, sec: 4 },
        ];
        const paragraphData = [
            [1, 1, 1, "p1"],
            [1, 1, 2, "p2"],
        ];
        const result = grouping_by_paragraph(record, paragraphData);
        const expected = [
            [[0, 1, 2], 1],
        ];
        assert.deepEqual(result, expected, "All records should be in a single group");
    });

    QUnit.test("都落在段落上", assert => {
        const record = [
            { book: 1, chap: 1, sec: 1 },
            { book: 1, chap: 1, sec: 5 },
            { book: 1, chap: 2, sec: 3 },
        ];
        const paragraphData = [
            [1, 1, 1, "p1"],
            [1, 1, 5, "p2"],
            [1, 2, 3, "p3"],
        ];
        const result = grouping_by_paragraph(record, paragraphData);
        const expected = [
            [[0], 0],
            [[1], 1],
            [[2], 2],
        ];
        assert.deepEqual(result, expected, "Each record should start a new paragraph group");
    });

    QUnit.test("複雜場景", assert => {
        const record = [
            { book: 1, chap: 1, sec: 1 }, // -1
            { book: 1, chap: 1, sec: 4 }, // -1
            { book: 1, chap: 1, sec: 5 }, // p0
            { book: 1, chap: 1, sec: 9 }, // p0
            { book: 1, chap: 1, sec: 10 },// p1
            { book: 1, chap: 1, sec: 11 },// p1
            { book: 1, chap: 2, sec: 1 }, // p2
        ];
        const paragraphData = [
            [1, 1, 5, "p1"],
            [1, 1, 10, "p2"],
            [1, 2, 1, "p3"],
        ];
        const result = grouping_by_paragraph(record, paragraphData);
        const expected = [
            [[0, 1], -1],
            [[2, 3], 0],
            [[4, 5], 1],
            [[6], 2],
        ];
        assert.deepEqual(result, expected, "Should handle a complex mix of groupings correctly");
    });
    QUnit.test("交錯順序(交互參照、搜尋結果將會用)", assert => {
        const record = [
            { book: 1, chap: 1, sec: 1 }, // -1
            { book: 1, chap: 1, sec: 4 }, // -1
            { book: 1, chap: 1, sec: 5 }, // p0
            { book: 1, chap: 1, sec: 9 }, // p0
            { book: 1, chap: 1, sec: 10 },// p1
            { book: 1, chap: 1, sec: 11 },// p1
            { book: 1, chap: 2, sec: 1 }, // p2
            { book: 1, chap: 1, sec: 5 }, // p0
            { book: 1, chap: 1, sec: 9 }, // p0
        ];
        const paragraphData = [
            [1, 1, 5, "p1"],
            [1, 1, 10, "p2"],
            [1, 2, 1, "p3"],
        ];
        const result = grouping_by_paragraph(record, paragraphData);
        const expected = [
            [[0, 1], -1],
            [[2, 3], 0],
            [[4, 5], 1],
            [[6], 2],
            [[7, 8], 0],
        ];
        assert.deepEqual(result, expected, "Should handle a complex mix of groupings correctly");
    });
});