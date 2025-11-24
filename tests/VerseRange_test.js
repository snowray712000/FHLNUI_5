/**
 * QUnit tests for src/app/bible-address/VerseRange.ts
 *
 * 目的：用較小的、可預測的範例，逐步展示 VerseRange 與 VerseRangeComparor 等的行為，
 *      讓你更容易理解原始檔案中的邏輯。
 *
 * 注意：
 * - 這組測試不會呼叫繁重的解析器（ParsingReferenceDescription）或外部 IO。
 * - 我們使用簡單的 DAddress 形狀 ({book, chap, verse}) 當作測試資料。
 *
 * 若你的環境在執行時需要改用編譯後的 .js 檔，請把 import 路徑改成編譯輸出的路徑。
 */
/**
 * @typedef {import('./../index/DText.js').DText } DText
 * @typedef {import('./../index/cvt_others.js').DTextsWithAddr } DTextsWithAddr
 */

import { BibleConstantHelper } from '../index/BibleConstantHelper.es2023.js';
import { VerseRange, VerseRangeComparor, DAddressComparor, BookNameTryGetBookId } from './../index/VerseRange.js';

/** @typedef {import('./TpQUnit.js').TpQUnit} TpQUnit */
/** @typedef {import('./TpQUnit.js').TpAssert} TpAssert */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

// 小型型別提示（方便閱讀）
// type DAddressT = { book: number | string, chap: number, verse: number };

QUnit.module('VerseRange 基本行為', hooks => {
  QUnit.test(' fD ', assert => {
    const out = VerseRange.fD('創1:1-3', 45)
    const addrs = out.verses
    assert.equal(addrs.length, 3, '創1:1-3 應展開為 3 節');
    assert.deepEqual(addrs[0], { book: 1, chap: 1, verse: 1 }, '第一節應為 創1:1');
    assert.deepEqual(addrs[1], { book: 1, chap: 1, verse: 2 }, '第二節應為 創1:2');
    assert.deepEqual(addrs[2], { book: 1, chap: 1, verse: 3 }, '第三節應為 創1:3');
  })
  QUnit.test(' fD 書卷名稱錯誤', assert => {
    // 書，會以為是「約書亞記」，就會斷錯。
    const out = VerseRange.fD('錯誤書卷名稱4:1-3', 45)
    assert.equal(out, null, '錯誤書卷名稱4:1-3 null');
  })

  QUnit.test('add / addRange / isIn', assert => {
    // 建立一個空的 VerseRange
    const vr = new VerseRange();

    // 尚未加入任何 verse，isIn 應為 false
    assert.notOk(vr.isIn({ book: 1, chap: 1, verse: 1 }), '初始狀態不包含任何地址');

    // add 單一節
    vr.add({ book: 1, chap: 1, verse: 1 });
    assert.ok(vr.isIn({ book: 1, chap: 1, verse: 1 }), '加入單一節後可以找到該節');

    // addRange 加多個
    vr.addRange([
      { book: 1, chap: 2, verse: 3 },
      { book: 2, chap: 1, verse: 1 }
    ]);
    assert.ok(vr.isIn({ book: 1, chap: 2, verse: 3 }), 'addRange 可加入第二組節');
    assert.ok(vr.isIn({ book: 2, chap: 1, verse: 1 }), 'addRange 可加入跨卷的節');
    assert.notOk(vr.isIn({ book: 1, chap: 99, verse: 99 }), '不存在的節回傳 false');
  });

  QUnit.test('isTheSame: 比較兩個 VerseRange 是否相同', assert => {
    const a = new VerseRange();
    a.add({ book: 1, chap: 1, verse: 1 });
    a.add({ book: 1, chap: 1, verse: 2 });

    const b = new VerseRange();
    b.add({ book: 1, chap: 1, verse: 1 });
    b.add({ book: 1, chap: 1, verse: 2 });

    const c = new VerseRange();
    c.add({ book: 1, chap: 1, verse: 1 }); // 少一節

    assert.ok(VerseRange.isTheSame(a, b), '兩個具有相同 verses（順序、內容皆相同）應視為相同');
    assert.notOk(VerseRange.isTheSame(a, c), '不同長度或內容的 VerseRange 不視為相同');
    assert.notOk(VerseRange.isTheSame(a, undefined), '任一方 undefined 應回傳 false');
  });
});

QUnit.module('VerseRangeComparor 與 hashNumer', () => {
  QUnit.test('compare: empty / 非 empty 的排序規則', assert => {
    const vrEmpty = new VerseRange(); // empty
    const vrOne = new VerseRange();
    vrOne.add({ book: 1, chap: 1, verse: 1 });

    // 當任一為 undefined 或 empty 時，compare 的行為：
    // - 如果 a1 是 empty、a2 非 empty => compare(a1,a2) 回傳 1（a1 被視為較大）
    // - 反過來則回傳 -1
    assert.equal(VerseRangeComparor.s.compare(vrEmpty, vrOne), 1,
      'empty 比 non-empty 被視為較大 => compare(empty, non-empty) === 1');
    assert.equal(VerseRangeComparor.s.compare(vrOne, vrEmpty), -1,
      'non-empty 比 empty 被視為較小 => compare(non-empty, empty) === -1');

    // 若兩者都 empty，應回傳 0
    const vrEmpty2 = new VerseRange();
    assert.equal(VerseRangeComparor.s.compare(vrEmpty, vrEmpty2), 0, '兩個 empty 視為相等');
  });

  QUnit.test('compare: 依序比對 addresses，長度短者較前', assert => {
    const ra = new VerseRange();
    ra.add({ book: 1, chap: 1, verse: 1 });

    const rb = new VerseRange();
    rb.add({ book: 1, chap: 1, verse: 1 });
    rb.add({ book: 1, chap: 1, verse: 2 });

    // ra 與 rb 前面第一個 address 相同，但 ra 比 rb 短 => ra < rb => compare 回傳 -1
    assert.equal(VerseRangeComparor.s.compare(ra, rb), -1, '同前綴但較短者較前');

    // 若長度相同，會使用 DAddressComparor2 逐位置比較
    const rX = new VerseRange();
    rX.add({ book: 1, chap: 1, verse: 1 });
    rX.add({ book: 1, chap: 1, verse: 2 });

    const rY = new VerseRange();
    rY.add({ book: 1, chap: 1, verse: 1 });
    rY.add({ book: 1, chap: 2, verse: 1 });

    // 第二個位置 (1:1-2) vs (1:2-1) 比較結果應由 DAddressComparor2 決定；
    // 我們只要驗證 compare 的 sign 是合理的（rX 的第二個節 chap=1, rY 的 chap=2，rX 較小）
    const cmpXY = VerseRangeComparor.s.compare(rX, rY);
    assert.ok(cmpXY < 0, 'rX (1:1-2) 應被視為小於 rY (1:2-1) => compare < 0');
  });

  QUnit.test('hashNumer: 等於各 address 經 DAddressComparor 的加總', assert => {
    const r = new VerseRange();
    const addrList = [
      { book: 1, chap: 1, verse: 1 },
      { book: 1, chap: 2, verse: 3 },
    ];
    r.addRange(addrList);

    // 計算預期的 sum
    const expected = addrList.reduce((s, a) => s + DAddressComparor(a), 0);
    const got = VerseRangeComparor.s.hashNumer(r);

    assert.equal(got, expected, 'hashNumer 應等於每個 address 經 DAddressComparor 的總和');
  });
});

QUnit.module('BookNameTryGetBookId 解析範例', () => {
  QUnit.test('能抓出書卷名稱（範例：太 = 馬太）', assert => {
    const bn = new BookNameTryGetBookId();
    // 使用一個簡單範例："太 1:1-3" 應該被切成 book name 與描述
    const r = bn.main('太 1:1-3');

    // BookNameAndId 可把名稱映射為 id（此處我們檢查回傳的 id 等於 BookNameAndId 的查詢結果）
    const expectedId = BibleConstantHelper.getBookId('太');
    assert.equal(r.idbook, expectedId, '解析出的 idbook 應與 BookNameAndId 的查詢一致');
    assert.equal(r.descript, '1:1-3', 'descript 應為去除卷名後的數字段');
  });
});