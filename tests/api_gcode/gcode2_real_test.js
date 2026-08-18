/**
 * @typedef {import('./../TpQUnit.js').TpQUnit} TpQUnit
 * @typedef {import('./../TpQUnit.js').TpAssert} TpAssert
 */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

QUnit.module('gcode_2_real_test');

import { gcode_2 } from './gcode2.js';
import { BibleConstantHelper } from './../../index/BibleConstantHelper.es2023.js'

QUnit.test('真實 case', async assert => {

    const done = assert.async();
    await test_start_count(assert, 40, 10,16, 1)
    await test_start_count(assert, 40, 16,25, 1)
    await test_start_count(assert, 40, 18,21, 1)
    done()
})

async function test_start_count(assert, book, chap, sec, countMax) {
    let count = 0

    while (count < countMax) {
        // 127.0.0.1:15600/gcode2/swift_test.php?book=40&chap=1&sec=1
        const url = `http://127.0.0.1:15600/gcode2/swift_test.php?book=${book}&chap=${chap}&sec=${sec}`;
        const response = await fetch(url);
        const apiResult = await response.text();
        const joResult = JSON.parse(apiResult);

        const expected = joResult.api
        const input = joResult.sqlite // input
        const output2 = joResult.gcode2 // python 的 gcode2 轉換結果

        const result2 = gcode_2(input)

        const isSuccess = assert_equal_no_space(assert, input, expected, result2, book, chap, sec);
        if (!isSuccess) {
            break
        }

        count++;
        // 下一個地址
        const nextAddress = BibleConstantHelper.getNextAddress({ book, chap, sec });
        if (nextAddress) {
            [book, chap, sec] = nextAddress;
        } else {
            console.log('已經到書卷末尾，停止測試');
            break;
        }
    }
}


/**
 * @param {number} book
 * @param {number} chap
 * @param {number} sec
 * @returns {Promise<{api: string, sqlite: string, gcode2: string}>}
 */
async function fetch_api_result(book, chap, sec) {
    const url = `http://127.0.0.1:15600/gcode2/swift_test.php?book=${book}&chap=${chap}&sec=${sec}`;
    const response = await fetch(url);
    const apiResult = await response.text();
    return JSON.parse(apiResult);
}
function gen_error_msg(input, excepted, result, book, chap, sec) {
    return `Input:\n ${JSON.stringify(input)}\nExpected:\n ${JSON.stringify(excepted)}\nGot:\n ${JSON.stringify(result)}\n

    first diff index: ${first_diff(excepted, result)[0]}
    expected char: ${JSON.stringify(first_diff(excepted, result)[1])} U+${first_diff(excepted, result)[1]?.codePointAt(0)?.toString(16)?.toUpperCase() ?? 'EOF'}
    result char  : ${JSON.stringify(first_diff(excepted, result)[2])} U+${first_diff(excepted, result)[2]?.codePointAt(0)?.toString(16)?.toUpperCase() ?? 'EOF'}

    At Book: ${book} Chap: ${chap} Sec: ${sec}

`;
}
function gen_success_msg(book, chap, sec) {
    return `book: ${book} chap: ${chap} sec: ${sec} okay`
}
/**
 *
 * @param {TpAssert} assert
 * @param {string} input
 * @param {string} expected
 * @param {string} result
 * @param {number} book
 * @param {number} chap
 * @param {number} sec
 */
function assert_equal_no_space(assert, input, expected, result, book, chap, sec) {
    const no_space = a => a.replace(/\s/g, '');
    const excepted_no_space = no_space(expected);
    const result_no_space = no_space(result);
    if (excepted_no_space != result_no_space) {
        // assert.ok(false, gen_error_msg(input, expected, result, book, chap, sec));
        assert.equal(result_no_space, excepted_no_space, gen_error_msg(input, expected, result, book, chap, sec));
        return false
    } else {
        assert.ok(true, gen_success_msg(book, chap, sec));
        return true
    }
}

function first_diff(a, b) {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
        if (a[i] !== b[i]) {
            return [i, a[i], b[i]];
        }
    }
    if (a.length !== b.length) {
        return [n, a.slice(n, n + 1), b.slice(n, n + 1)];
    }
    return [-1, "", ""];
}
