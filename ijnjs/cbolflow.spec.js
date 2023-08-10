/// <reference path="./../libs/jsdoc/qunit.js" />
/// <reference path="./../libs/jsdoc/linq.d.ts" />
/// <reference path="./../libs/jsdoc/jquery.js" />
/// <reference path="./DText.d.ts" />

import Enumerable from 'https://cdnjs.cloudflare.com/ajax/libs/linq.js/4.0.0/linq.min.js'
import { cbolflow } from './cbolflow.es6.js'

QUnit.test("cbolflow", assert => {
    // 測試資料
    let strC = virtualOld('128').record[0].dic_text
    let strE = virtualOld('128').record[0].edic_text
    
    // 執行
    let re = cbolflow(strC)
    let re2 = cbolflow(strE)
    
    // 測試 reference 是否成功

    assert.deepEqual([
        {w:`0128 'Adamah {a-da:-ma:'}`},
        {isBr:1},
        {isBr:1},
        {w:`與 0127 同; 專有名詞 地名`},
        {isBr:1},
        {isBr:1},
        {w:`欽定本 - Adamah 1; 1`},
        {isBr:1},
        {isBr:1},
        {w:`亞大瑪 = "地土"`},
        {isBr:1},
        {w: `1) 拿弗他利的城鎮 (`},
        {w: `#書 19:36|`, refAddresses: [{book:6,chap:19,verse:36}]},
        {w: `)`}
    ], re)

    return

    function virtualOld(sn) {
        return JSON.parse(`{
            "status":"success",
            "record_count":1,
            "record":[{"sn":"00128","dic_text":"0128 'Adamah {a-da:-ma:'}\\r\\n\\r\\n\\u8207 0127 \\u540c; \\u5c08\\u6709\\u540d\\u8a5e \\u5730\\u540d\\r\\n\\r\\n\\u6b3d\\u5b9a\\u672c - Adamah 1; 1\\r\\n\\r\\n\\u4e9e\\u5927\\u746a = \\"\\u5730\\u571f\\"\\r\\n1) \\u62ff\\u5f17\\u4ed6\\u5229\\u7684\\u57ce\\u93ae (#\\u66f8 19:36|)","edic_text":"0128 'Adamah {ad-aw-maw'}\\n\\nthe same as 0127;; n pr loc\\n\\nAV - Adamah 1; 1\\n\\nAdamah = \\"the earth\\"\\n1) city in Naphtali","dic_type":1,"orig":"\\u05d0\\u05b2\\u05d3\\u05b8\\u05de\\u05b8\\u05d4"}]}
            `)
    }
})
QUnit.test("cbolflow-01", assert =>{
    let strC = "1) 拿弗他利的城鎮 (#書 19:36|)"

    // 執行
    let re = cbolflow(strC)

    assert.deepEqual([
        {w: `1) 拿弗他利的城鎮 (`},
        {w: `#書 19:36|`, refAddresses: [{book:6,chap:19,verse:36}]},
        {w: `)`}
    ],re)
})

QUnit.test("cbolflow-bug-H00853", assert =>{
    let jo = JSON.parse( `{
        "status":"success",
        "record_count":1,
        "record":[{"sn":"00853","dic_text":"0853 'eth {e:t}\\r\\n\\r\\n\\u986f\\u7136\\u662f 0226 \\u7684\\u7e2e\\u77ed\\u578b, \\u53d6\\u5176\\"\\u5be6\\u9ad4\\"\\u4e4b\\u6307\\u793a\\u610f\\u601d; TWOT - 186; \\u672a\\u7ffb\\u8b6f\\u7684\\u8cea\\u8a5e\\r\\n\\r\\n\\u6b3d\\u5b9a\\u672c - not translated; 22\\r\\n\\r\\n1) \\u5b9a\\u76f4\\u63a5\\u53d7\\u8a5e\\u7684\\u8a18\\u865f, \\u5728\\u4e2d\\u82f1\\u6587\\u7686\\u672a\\u8b6f\\u51fa, \\u901a\\u5e38\\u5728\\u76f4\\u63a5\\u53d7\\u683c\\u7684\\u524d\\u9762, \\u4ee5\\u8868\\u793a\\u5176\\u683c","edic_text":"0853 'eth {ayth}\\n\\napparent contracted from 0226 in the demonstrative sense of\\n   entity; TWOT - 186; untranslated particle\\n\\nAV - not translated; 22\\n\\n1) sign of the definite direct object, not translated in English\\n   but generally preceding and indicating the accusative","dic_type":1,"orig":"\\u05d0\\u05b2\\u05e9\\u05c1\\u05b6\\u05e8\\n\\u05d0\\u05b5\\u05ea\\n\\u05d1\\u05bc\\u05b7\\u05ea\\n\\u05d0\\u05b6\\u05ea"}]}
        `)
    let strC = jo.record[0].dic_text
    let strE = jo.record[0].edic_text
    let re = cbolflow(strC)
    let re2 =  cbolflow(strE)


    console.log(re);
    console.log(re2);

    assert.equal(1,1)
})
