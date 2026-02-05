// ...existing code...

/**
 * @typedef {import('./TpQUnit').TpQUnit} TpQUnit
 */
import { grouping_by_paragraph } from '../index/grouping_by_paragraph.js';
import { grouping_by_paragraph_for_dtexts_with_addr } from '../index/grouping_by_paragraph_for_dtexts_with_addr.js';

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

QUnit.module('grouping_by_paragraph_for_dtexts_with_addr');

function makeParagraphData() {
    return [
        [1, 1, 1, "上帝的創造"],
        [1, 1, 5, "第二段"],
        [1, 2, 1, "第三段"]
    ];
}

/**
 * @param {number} book
 * @param {number} chap
 * @param {number} sec
 */
function makeDTextRecord(book, chap, sec) {
    return [book, chap, sec, []];
}
function runScenario(assert, paragraphData, records) {
    const dtexts_with_addr = records.map(([book, chap, sec]) => makeDTextRecord(book, chap, sec));
    const expected = grouping_by_paragraph(records.map(([book, chap, sec]) => [book, chap, sec, ""]), paragraphData);
    const actual = grouping_by_paragraph_for_dtexts_with_addr(dtexts_with_addr, paragraphData);
    assert.deepEqual(actual, expected, `與 grouping_by_paragraph 一致：${JSON.stringify(records)}`);
}
QUnit.test('與原本 grouping_by_paragraph 輸出一致', assert => {
    const paragraphData = makeParagraphData();
    const dtexts_with_addr = [
        makeDTextRecord(1, 1, 1),
        makeDTextRecord(1, 1, 2),

        makeDTextRecord(1, 1, 5),

        makeDTextRecord(1, 2, 1)
    ];

    const expected = grouping_by_paragraph(
        dtexts_with_addr.map(([book, chap, sec]) => [book, chap, sec, ""]),
        paragraphData
    );
    const actual = grouping_by_paragraph_for_dtexts_with_addr(dtexts_with_addr, paragraphData);

    assert.deepEqual(actual, expected, 'DText 版本與原始分段結果一致');
});

QUnit.test('空資料回傳空陣列', assert => {
    assert.deepEqual(grouping_by_paragraph_for_dtexts_with_addr([], makeParagraphData()), [], '無輸入回空陣列');
});

QUnit.test('無段落資料時全部屬於 -1', assert => {
    const dtexts_with_addr = [
        makeDTextRecord(1, 1, 1),
        makeDTextRecord(1, 1, 2)
    ];
    const actual = grouping_by_paragraph_for_dtexts_with_addr(dtexts_with_addr, []);
    assert.deepEqual(actual, [[[0,1],-1]], '未提供段落即聚成一組並標記 -1');
});
// ...existing code...

QUnit.test('跨章三段落', assert => {
    runScenario(assert, [
        [1, 1, 1, "p1"],
        [1, 1, 5, "p2"],
        [1, 2, 1, "p3"],
    ], [
        [1, 1, 1],
        [1, 1, 2],
        [1, 1, 5],
        [1, 1, 6],
        [1, 2, 1],
    ]);
});

QUnit.test('記錄在段落之前會先歸 -1', assert => {
    runScenario(assert, [
        [1, 1, 5, "p1"]
    ], [
        [1, 1, 1],
        [1, 1, 2],
        [1, 1, 5],
        [1, 1, 6],
    ]);
});

QUnit.test('全部在最後一段落', assert => {
    runScenario(assert, [
        [1, 1, 1, "p1"],
        [1, 1, 2, "p2"],
    ], [
        [1, 1, 2],
        [1, 1, 3],
        [1, 1, 4],
    ]);
});

QUnit.test('交錯多段落', assert => {
    runScenario(assert, [
        [1, 1, 5, "p1"],
        [1, 1, 10, "p2"],
        [1, 2, 1, "p3"],
    ], [
        [1, 1, 1],
        [1, 1, 4],
        [1, 1, 5],
        [1, 1, 9],
        [1, 1, 10],
        [1, 1, 11],
        [1, 2, 1],
        [1, 1, 5],
        [1, 1, 9],
    ]);
});