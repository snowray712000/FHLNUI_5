import { add_parenttheses_unv_ncv } from './../index/AddParenthesesUnvNcv.js'

/** 
 * @typedef {import('./../index/AddParenthesesUnvNcv.js').DTextsWithAddr} DTextsWithAddr
 * @typedef {import('./../index/AddParenthesesUnvNcv.js').DText} DText
 */

/**
 * @typedef {import('./TpQUnit.js').TpQUnit} TpQUnit
 * @typedef {import('./TpQUnit.js').TpAssert} TpAssert
 */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

QUnit.module('add_parenttheses_unv_ncv', function () {
    // 一般測試
    QUnit.test('沒有動', assert => {
        test01(assert);
    });
    QUnit.test('單層小括號', assert => {
        test02(assert);
    })
    QUnit.test('雙層全型括號', assert => {
        test03(assert);
    });
    QUnit.test('RGB(...) 不會被拆', assert => {
        test04(assert);
    });
})

/**
 * @type {DTextsWithAddr}
 */
let dtexts

/**
 * @param {TpAssert} assert 
 */
function test01(assert) {
    dtexts = [1, 1, 1, [{ w: "起初，神創造天地。" }]]
    add_parenttheses_unv_ncv(dtexts); // 不會變
    assert.equal(to_str(dtexts[3]), to_str([{ w: "起初，神創造天地。" }]))

    dtexts = [1, 1, 1, [{ w: "起初，" }, { w: "神創造天地。" }]]
    add_parenttheses_unv_ncv(dtexts); // 不會變
    assert.equal(to_str(dtexts[3]), to_str([{ w: "起初，" }, { w: "神創造天地。" }]))
}
/**
 * @param {TpAssert} assert 
 */
function test02(assert) {
    // - 全型小括號
    dtexts = [40, 1, 1, [{ w: "亞伯拉罕的後裔，大衛的子孫（後裔，子孫：原文是兒子；下同），耶穌基督的家譜：" }]]
    add_parenttheses_unv_ncv(dtexts);

    let ans = to_str([
        { w: "亞伯拉罕的後裔，大衛的子孫" },
        {
            isParenthesesFW: 1,
            children: [
                { w: "（", isParenthesesFW: 1 },
                { w: "後裔，子孫：原文是兒子；下同" },
                { w: "）", isParenthesesFW: 1 }
            ]
        },
        { w: "，耶穌基督的家譜：" }])

    assert.equal(to_str(dtexts[3]), ans);

    // - 半型小括號
    dtexts = [40, 1, 1, [{ w: "亞伯拉罕的後裔，大衛的子孫(後裔，子孫：原文是兒子；下同)，耶穌基督的家譜：" }]]
    add_parenttheses_unv_ncv(dtexts);

    ans = to_str([
        { w: "亞伯拉罕的後裔，大衛的子孫" },
        {
            isParenthesesHW: 1,
            children: [
                { w: "(", isParenthesesHW: 1 },
                { w: "後裔，子孫：原文是兒子；下同" },
                { w: ")", isParenthesesHW: 1 }
            ]
        },
        { w: "，耶穌基督的家譜：" }])

    assert.equal(to_str(dtexts[3]), ans);
}

/**
 * @param {TpAssert} assert 
 */
function test03(assert) {
    // - 二層全型小括號
    dtexts = [40, 1, 1, [{ w: "亞伯拉罕的後裔，大衛的子孫（後裔，子孫：（原文是兒子；下同）），耶穌基督的家譜：" }]]
    add_parenttheses_unv_ncv(dtexts);

    let ans = to_str([
        { w: "亞伯拉罕的後裔，大衛的子孫" },
        {
            isParenthesesFW: 1,
            children: [
                { w: "（", isParenthesesFW: 1 },
                { w: "後裔，子孫：" },
                {
                    isParenthesesFW2: 1,
                    children: [
                        { w: "（", isParenthesesFW2: 1 },
                        { w: "原文是兒子；下同" },
                        { w: "）", isParenthesesFW2: 1 }
                    ]
                },
                { w: "）", isParenthesesFW: 1 }
            ]
        },
        { w: "，耶穌基督的家譜：" }])

    assert.equal(to_str(dtexts[3]), ans);

    // - 二層全型小括號
    dtexts = [40, 1, 1, [{ w: "亞伯拉罕的後裔，大衛的子孫（後裔，子孫：（原文是兒子；）下同），耶穌基督的家譜：" }]]
    add_parenttheses_unv_ncv(dtexts);

    ans = to_str([
        { w: "亞伯拉罕的後裔，大衛的子孫" },
        {
            isParenthesesFW: 1,
            children: [
                { w: "（", isParenthesesFW: 1 },
                { w: "後裔，子孫：" },
                {
                    isParenthesesFW2: 1,
                    children: [
                        { w: "（", isParenthesesFW2: 1 },
                        { w: "原文是兒子；" },
                        { w: "）", isParenthesesFW2: 1 }
                    ]
                },
                { w: "下同" },
                { w: "）", isParenthesesFW: 1 }
            ]
        },
        { w: "，耶穌基督的家譜：" }])

    assert.equal(to_str(dtexts[3]), ans);
}
/**
 * @param {TpAssert} assert
 */
function test04(assert) {
    // 處理像 <span style="color:rgb(195,39,43);"> 被切成三段的情況
    // - RGB(...) 不會被拆
    dtexts = [40, 3, 15, [{ w: "耶穌回答他，說：<span style=\"color:rgb(195,39,43);\">「現在你就答應吧，因為我們如此成全一切的義，是合宜的。」</span>於是<u>約翰</u>答應了他。" }]]
    add_parenttheses_unv_ncv(dtexts);

    let ans = to_str([
        { w: "耶穌回答他，說：<span style=\"color:rgb(195,39,43);\">「現在你就答應吧，因為我們如此成全一切的義，是合宜的。」</span>於是<u>約翰</u>答應了他。" },
    ])

    assert.equal(to_str(dtexts[3]), ans);
}


/**
 * @param {DText[]} dtexts
 * @returns {string} 
 */
function to_str(dtexts) {
    return JSON.stringify(dtexts);
}