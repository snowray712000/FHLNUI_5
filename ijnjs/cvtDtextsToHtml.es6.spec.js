/// <reference path="./../libs/jsdoc/qunit.js" />
/// <reference path="./../libs/jsdoc/linq.d.ts" />
/// <reference path="./../libs/jsdoc/jquery.js" />
/// <reference path="./DText.d.ts" />

import {cvtDTextsToHtml} from './cvtDTextsToHtml.es6.js'



QUnit.test("cvtDTextsToHtml 換行", assert => {
    // 測試資料
    /** @type {DText[]} */
    let data = [{ w: '這是' }, { isBr: 1 }, { w: '換行' }]

    // 執行
    let re = cvtDTextsToHtml(data)

    // 驗證
    assert.equal(re, '<span>這是</span><br/><span>換行</span>')
    return
})

QUnit.test("cvtDTextsToHtml div.idt", assert => {
    // 測試資料
    /** @type {DText[]} */
    let data = [{
        tpContainer: '<div class="idt">',
        children: [
            { w: '這是' }, { isBr: 1 }, { w: '換行' }
        ]
    }]


    // 執行
    let re = cvtDTextsToHtml(data)

    // 驗證
    assert.equal(re, '<div class="idt"><span>這是</span><br/><span>換行</span></div>')
    return
})
QUnit.test("cvtDTextsToHtml span.bibtext span.exp", assert => {
    // 測試資料
    /** @type {DText[]} */
    let data = [{
        tpContainer: '<div class="idt">',
        children: [
            {
                tpContainer: '<span class="bibtext">',
                children: [
                    {
                        tpContainer: '<span class="exp">',
                        children: [
                            { w: '毀滅' }
                        ]
                    }
                ]
            },
            { w: '這是' }, { isBr: 1 }, { w: '換行' }
        ]
    }]


    // 執行
    let re = cvtDTextsToHtml(data)

    // 驗證
    assert.equal(re, '<div class="idt"><span class="bibtext"><span class="exp"><span>毀滅</span></span></span><span>這是</span><br/><span>換行</span></div>')
    return
})
QUnit.test("cvtDTextsToHtml 交互參照", assert => {
    // 測試資料
    /** @type {DText[]} */
    let data = [{ w: '#伯26:6|',refAddresses:[{book: 18, chap: 26, verse: 6}]}]

    // 執行
    let re = cvtDTextsToHtml(data)

    // 驗證
    let re2 = $('<span>',{
        text: '#伯26:6|',
        class: 'ref'
    })
    re2.attr('data-addrs',JSON.stringify([{book:18,chap:26,verse:6}]))

    assert.equal(re, re2[0].outerHTML)
    assert.deepEqual(JSON.parse($(re).attr('data-addrs')), [{book:18,chap:26,verse:6}],re2[0].outerHTML)
    return
})