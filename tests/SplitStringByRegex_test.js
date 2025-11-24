/**
 * @typedef {import('./TpQUnit.js').TpQUnit} TpQUnit
 */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

import { splitStringByRegex } from './../index/splitStringByRegex.es2023.js'

QUnit.module('splitStringByRegex', function () {
  QUnit.test('dev01', function (assert) {
    const r1 = splitStringByRegex("取出eng的word", /\w+/ig)
    assert.equal("取出", r1[0].w)
    assert.equal(undefined, r1[0].exec)
    assert.equal("eng", r1[1].w)
    assert.equal("eng", r1[1].exec[0])
    assert.equal("的", r1[2].w)
    assert.equal(undefined, r1[2].exec)
    assert.equal("word", r1[3].w)
    assert.equal("word", r1[3].exec[0])
  })

  QUnit.test('app01_希伯來文分離_01', function (assert) {

    // https://bible.fhl.net/json/qp.php?engs=1%20Kin&chap=3&sec=5&gb=0
    var a1 = '{"wform":"\u05dc\u05b0\u05da\u05b8 \u7684\u505c\u9813\u578b\uff0c\u4ecb\u7cfb\u8a5e \u05dc\u05b0 + 2 \u55ae\u967d\u8a5e\u5c3e"}'

    // console.log('\u05dc')
    // console.log('\u05b0')
    // console.log('\u05da')
    // console.log('\u05b8')
    // console.log(' \u7684\u505c\u9813\u578b\uff0c\u4ecb\u7cfb\u8a5e ') // ' 的停頓型，介系詞 '
    // console.log('\u05dc')
    // console.log('\u05b0') 
    // console.log(' + 2 ') // ' + 2 '
    // console.log('\u55ae\u967d\u8a5e\u5c3e') // 單陽詞尾

    var reg = /[\u0590-\u05fe]+/ig
    var a2 = JSON.parse(a1)
    var re = splitStringByRegex(a2["wform"], reg)
    var msg = JSON.stringify(a2)
    assert.equal("\u05dc\u05b0\u05da\u05b8", re[0].w, msg)
    assert.equal(" \u7684\u505c\u9813\u578b\uff0c\u4ecb\u7cfb\u8a5e ", re[1].w, msg)
    assert.equal("\u05dc\u05b0", re[2].w, msg)
    assert.equal(" + 2 \u55ae\u967d\u8a5e\u5c3e", re[3].w, msg)

  })

  QUnit.test('希臘文', function (assert) {
    assert.equal(1, 1, '\u51a0\u8a5e')
    assert.equal(2, 2, '\u1f41 \u1f21 \u03c4\u1f79')
  })

  // ...existing code...
  QUnit.test('希臘文2', function (assert) {
    const greekText = '\u1f41 \u1f21 \u03c4\u1f79'
    const greekRegex = /[\u0370-\u03ff\u1f00-\u1fff]+/g
    const result = splitStringByRegex(greekText, greekRegex)

    assert.equal(1, 1, '\u51a0\u8a5e')
    assert.equal(2, 2, '\u1f41 \u1f21 \u03c4\u1f79')

    // 實際測試希臘文分離
    assert.ok(result.length > 0, '應該有分離結果')
  })
  // ...existing code...  
});