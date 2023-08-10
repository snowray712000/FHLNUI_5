/// <reference path="./../libs/jsdoc/qunit.js" />
/// <reference path="./../libs/jsdoc/linq.d.ts" />

import Enumerable from 'https://cdnjs.cloudflare.com/ajax/libs/linq.js/4.0.0/linq.min.js'
import { twcbflow, twcbflowEs6Js } from './twcbflow.es6.js'

QUnit.test("twcbflow", assert => {
    // 測試資料
    let str = virtualOld('11').record[0].dic_text
    // 執行
    let re = twcbflow(str)

    // 測試 div.idt span.bibtext span.exp
    assert.equal(re[21].tpContainer, "<div class=\"idt\">")
    assert.equal(re[22].isBr, 1)
    assert.equal(re[23].tpContainer, "<div class=\"idt\">")

    assert.equal(re[21].children[1].tpContainer, "<span class=\"bibtext\">")
    assert.equal(re[21].children[1].children[0].tpContainer, "<span class=\"exp\">")
    assert.equal(re[21].children[1].children[0].children[0].w, "燬滅")

    // 測試 reference 是否成功
    assert.equal(re[21].children[5].w, "#伯26:6;箴15:11|")
    assert.deepEqual(re[21].children[5].refAddresses, [
        { book: 18, chap: 26, verse: 6 },
        { book: 20, chap: 15, verse: 11 }
    ])


    return

    function virtualOld(sn) {
        return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00011","dic_text":"00011\\r\\n【0011】אֲבַדּוֹן\\r\\n＜音譯＞’abaddown\\r\\n＜詞類＞名、陰\\r\\n＜字義＞毀滅之地、滅亡、亞巴頓\\r\\n＜字源＞來自HB6的加強語氣\\r\\n＜LXX＞G3  G623\\r\\n＜神出＞2d   #伯26:6|\\r\\n＜譯詞＞滅亡3 燬滅1 滅沒1 （5）\\r\\n＜解釋＞\\r\\n<div class=\\"idt\\">一、指陰間裡停放要滅亡的死人之處，是陰間有分隔間的概念發展之後產生的字。<span class=\\"bibtext\\"><span class=\\"exp\\">燬滅</span></span>，#伯31:12|。平行字שְׁאוֹל陰間，#伯26:6;箴15:11|；וָמָוֶת死亡，#伯28:22|；קֶבֶר墳墓，#詩88:11|。</div>\\r\\n<div class=\\"idt\\">二、舊約希伯來文讀音為亞巴頓，新約希臘文讀音是亞玻倫，意指惡魔，撒但與無底坑的使者，#啟9:11|。</div>"}]}')
    }
})

QUnit.test("test3-bundle-split reference", assert => {
    // 測試資料
    let str = virtualOld('11').record[0].dic_text
    // 執行
    let re = twcbflowEs6Js()(str)
    // 測試 div.idt span.bibtext span.exp
    assert.equal(re[21].tpContainer, "<div class=\"idt\">")
    assert.equal(re[22].isBr, 1)
    assert.equal(re[23].tpContainer, "<div class=\"idt\">")

    assert.equal(re[21].children[1].tpContainer, "<span class=\"bibtext\">")
    assert.equal(re[21].children[1].children[0].tpContainer, "<span class=\"exp\">")
    assert.equal(re[21].children[1].children[0].children[0].w, "燬滅")

    // 測試 reference 是否成功
    assert.equal(re[21].children[5].w, "#伯26:6;箴15:11|")
    assert.deepEqual(re[21].children[5].refAddresses, [
        { book: 18, chap: 26, verse: 6 },
        { book: 20, chap: 15, verse: 11 }
    ])
    return
    function virtualOld(sn) {
        return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00011","dic_text":"00011\\r\\n【0011】אֲבַדּוֹן\\r\\n＜音譯＞’abaddown\\r\\n＜詞類＞名、陰\\r\\n＜字義＞毀滅之地、滅亡、亞巴頓\\r\\n＜字源＞來自HB6的加強語氣\\r\\n＜LXX＞G3  G623\\r\\n＜神出＞2d   #伯26:6|\\r\\n＜譯詞＞滅亡3 燬滅1 滅沒1 （5）\\r\\n＜解釋＞\\r\\n<div class=\\"idt\\">一、指陰間裡停放要滅亡的死人之處，是陰間有分隔間的概念發展之後產生的字。<span class=\\"bibtext\\"><span class=\\"exp\\">燬滅</span></span>，#伯31:12|。平行字שְׁאוֹל陰間，#伯26:6;箴15:11|；וָמָוֶת死亡，#伯28:22|；קֶבֶר墳墓，#詩88:11|。</div>\\r\\n<div class=\\"idt\\">二、舊約希伯來文讀音為亞巴頓，新約希臘文讀音是亞玻倫，意指惡魔，撒但與無底坑的使者，#啟9:11|。</div>"}]}')
    }
})


QUnit.test("twcbflow-bug-H00853", assert =>{
    let jo = JSON.parse( `{
        "status":"success",
        "record_count":1,
        "record":[{"sn":"00853","dic_text":"00853\\r\\n\\u30100853\\u3011\\u05d0\\u05b5\\u05ea\\r\\n\\uff1c\\u97f3\\u8b6f\\uff1e'eth\\r\\n\\uff1c\\u8a5e\\u985e\\uff1e\\u8cea\\r\\n\\uff1c\\u5b57\\u7fa9\\uff1e\\r\\n\\uff1c\\u5b57\\u6e90\\uff1e\\u672a\\u8b6f\\u51fa\\u7684\\u8cea\\u8a5e\\uff0c\\u660e\\u986f\\u5730\\u4f86\\u81eaHB226\\u4e4b\\u7565\\u8a9e\\uff0c\\u542b\\u5b58\\u5728\\u4e4b\\u610f\\r\\n\\uff1c\\u795e\\u51fa\\uff1e186 #\\u52751:1|\\r\\n\\uff1c\\u8b6f\\u8a5e\\uff1e\\u8207\\u62111 \\u62111 \\u4f601 \\u62101 \\u4ed6\\u50111 (5)"}]}
        `)
    let strC = jo.record[0].dic_text

    console.log(strC);
    let re = twcbflow(strC)
    console.log(re);


    console.log(re);

    assert.equal(1,1)
})
