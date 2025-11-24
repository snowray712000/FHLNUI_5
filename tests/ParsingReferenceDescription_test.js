/**
 * QUnit tests for ParsingReferenceDescription.js
 *
 * These tests monkey-patch dependent classes (BookNameAndId, SplitStringByRegexVer2,
 * GetAddresses, SmartDescriptEndParsing) by overriding prototype methods so we can test
 * ParsingReferenceDescription behavior deterministically without loading the full app.
 *
 * Run in an environment where QUnit is available as global `QUnit`.
 */

/** 
 * @typedef {import('./../index/AddParenthesesUnvNcv.js').DTextsWithAddr} DTextsWithAddr
 * @typedef {import('./../index/AddParenthesesUnvNcv.js').DText} DText
 */

/**
 * @typedef {import('./TpQUnit.js').TpQUnit} TpQUnit
 * @typedef {import('./TpQUnit.js').TpAssert} TpAssert
 */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

import { ParsingReferenceDescription } from './../index/ParsingReferenceDescription.js';


QUnit.module('ParsingReferenceDescription', hooks => {
  QUnit.test('splitBook + getAddressesOneBook basic flow', assert => {
    // Stub GetAddresses to parse a simple "X:Y-Z" or "X:Y" into DAddress entries
    const p = new ParsingReferenceDescription();
    const out = p.main('太 1:1-2;創 2:3', { book: 99 });
    
    // Expect 3 addresses: 太 1:1, 太 1:2, 創 2:3
    assert.equal(out.length, 3, '應解析出 3 個 DAddress');
    assert.deepEqual(out[0], { book: 40, chap: 1, verse: 1 }, '第一項應為 太 1:1');
    assert.deepEqual(out[1], { book: 40, chap: 1, verse: 2 }, '第二項應為 太 1:2');
    assert.deepEqual(out[2], { book: 1, chap: 2, verse: 3 }, '第三項應為 創 2:3');
  });
  QUnit.test('第一個沒有書卷名稱', assert => {
    const p = new ParsingReferenceDescription();
    const out = p.main('1:1;太 1:4-5', { book: 39});

    assert.equal(out.length, 3, '應解析出 3 個 DAddress');
    assert.deepEqual(out[0], {book: 39, chap: 1, verse: 1}, '應解析出 瑪 1:1');
    assert.deepEqual(out[1], {book: 40, chap: 1, verse: 4}, '應解析出 太 1:4');
    assert.deepEqual(out[2], {book: 40, chap: 1, verse: 5}, '應解析出 太 1:5');
  })
  QUnit.test('多個沒書卷名稱', assert => {
    const p = new ParsingReferenceDescription();
    const out = p.main('1:1;1:4-5', { book: 40});
    
    assert.equal(out.length, 3, '應解析出 3 個 DAddress');
    assert.deepEqual(out[0], {book: 40, chap: 1, verse: 1}, '應解析出 太 1:1');
    assert.deepEqual(out[1], {book: 40, chap: 1, verse: 4}, '應解析出 太 1:4');
    assert.deepEqual(out[2], {book: 40, chap: 1, verse: 5}, '應解析出 太 1:5');

  })
  QUnit.test('第一個沒有書卷，但預設又與後面相同', assert => {
    const p = new ParsingReferenceDescription();
    const out = p.main('1:1;太1:4-5', { book: 40});
    assert.equal(out.length, 3, '應解析出 3 個 DAddress');
    assert.deepEqual(out[0], {book: 40, chap: 1, verse: 1}, '應解析出 太 1:1');
    assert.deepEqual(out[1], {book: 40, chap: 1, verse: 4}, '應解析出 太 1:4');
    assert.deepEqual(out[2], {book: 40, chap: 1, verse: 5}, '應解析出 太 1:5');    
  })
  QUnit.test('錯誤書卷名稱，沒有這種書卷', assert => {
    const p = new ParsingReferenceDescription();
    const out = p.main('錯誤書卷名稱4:1-3', { book: 45});
    assert.equal(out.length, 0, '應解析出 0 個 DAddress');  
  })
  QUnit.test('錯誤 Address，沒有 120章', assert => {
    const p = new ParsingReferenceDescription();
    const out = p.main('太120:1-2', { book: 40});
    assert.equal(out.length, 0, '應解析出 0 個 DAddress');  
  });
});