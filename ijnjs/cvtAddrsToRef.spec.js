/// <reference path="./../libs/jsdoc/qunit.js" />
/// <reference path="./../libs/jsdoc/linq.d.ts" />
/// <reference path="./BibleConstants.es6.js" />
/// <reference path="./matchGlobalWithCapture.es6.js" />
/// <reference path="./splitStringByRegex.es6.js" />
/// <reference path="./splitBtw.es6.js" />
/// <reference path="./splitReference.es6.js" />
/// <reference path="./DText.d.ts" />

import { cvtAddrsToRef } from "./cvtAddrsToRef.es6.js"
import { splitReference } from "./splitReference.es6.js"

// import Enumerable from 'https://cdnjs.cloudflare.com/ajax/libs/linq.js/4.0.0/linq.min.js'


QUnit.test("test1", assert => {
    // https://bible.fhl.net/new/allreadme.html

    // default book:45, chap:2

    // 31:12
    // 31:12-14
    // 31:12-32:12
    // 31:12,15,17
    // 31:12-15,18,19-31
    // 12 (x) 羅12章？羅2:12節？ … 章
    // 約12 (v) 約12章
    // 4-12 4到12節
    // 31:12-end
    // 31:12-e
    // 31:12,15-17,20
    // #31:12|
    // 滅亡3 燬滅1 滅沒1 （5）… f 必須要有 book，例如約12
    // ＜神出＞2d   #伯26:6| ... f 必須要有 book

    let answers2 = {}
    answers2["31:30-32:4"] = "創31:30-32:4" //跨2章，且各章都只有一群，且頭尾有相接
    answers2["31:30-32:4;32:7-8"] = "創31:30-55;32:1-4,7-8" // 跨2章，但某一章，有2群以上 (後一章)
    answers2["31:24;31:30-32:4"] = "創31:24,30-55;32:1-4" //跨2章，但某一章，有2群以上 (前一章)

    answers2["31:30-33:4"] = "創31:30-33:4" // 跨3章
    answers2["31:30-33:4;33:7-8"] = "創31:30-32:32;33:1-4,7-8" // 跨3章, 但第3章有2群，故前2章連續。

    for (const k of Object.keys(answers2)) {
        let r1 = splitReference(k)

        for (const it of r1) {
            if (it.refAddresses != undefined) {
                assert.equal(cvtAddrsToRef(it.refAddresses, '羅'), answers2[k], k)
            }
        }
    }
})

QUnit.test("Bug20220325a", assert => {
    let re = cvtAddrsToRef([
        { book: 1, chap: 1, verse: 1 },
        { book: 1, chap: 2, verse: 1 },
    ], "羅")

    assert.equal(re, "創1:1;2:1")
})
QUnit.test("Bug20220403a", assert =>{
    let re = cvtAddrsToRef([
        { book: 1, chap: 1, verse: 1 },
        { book: 1, chap: 1, verse: 31 },
    ], "羅")

    assert.equal(re, "創1:1,31")
})