/// <reference path="./../libs/jsdoc/qunit.js" />
/// <reference path="./../libs/jsdoc/linq.d.ts" />
/// <reference path="./../libs/jsdoc/jquery.js" />
/// <reference path="./DText.d.ts" />

import {splitReference} from './splitReference.es6.js'
QUnit.test("split Reference 空白", assert =>{
    let re = splitReference("太&nbsp;23:1-36",{book:39,chap:1,verse:1})
    // 太&nbsp;23:1-36
    assert.deepEqual(re[0].refAddresses[0].book , 40, JSON.stringify(re[0]))

    let re2 = splitReference("太 23:1-36",{book:39,chap:1,verse:1})
    assert.deepEqual(re2[0].refAddresses[0].book , 40, JSON.stringify(re2[0]))
})

QUnit.test("split 2Co 11:5; 1Ti 2:3;2:7", assert =>{
    // 處理，林前1:1 串珠時，發現的 Bug
    let re = splitReference("2Co 11:5; 1Ti 2:3;2:7",{book:46,chap:1,verse:1})
    console.log(re);
    assert.deepEqual(re[0].refAddresses[0].book , 47, "2Co成功被解析")
    assert.deepEqual(re[0].refAddresses[1].book , 54, "1Ti的1沒被斷開")
})

QUnit.test("split null", assert =>{
    // 處理，林前1:1 串珠時，發現的 Bug
    let re = splitReference("這沒有交互參照",{book:46,chap:1,verse:1})
    
    assert.equal(re , null)
})