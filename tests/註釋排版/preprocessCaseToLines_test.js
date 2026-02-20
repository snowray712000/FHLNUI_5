/**
 應該做到：

去掉空白行（或至少 trim 後的空行）
把「被排版硬切行」合併回上一行（靠縮排判斷）
表格線不要被合併（遇到 ┌│─┘ 這類就保留原行）

 */

/**
 * @typedef {import('./../TpQUnit.js').TpQUnit} TpQUnit
 */
const QUnit = /** @type {TpQUnit} */ (window.QUnit);

import { preprocessCaseToLines } from './../../index/comments/preprocessCaseToLines.js';

QUnit.module('preprocessCaseToLines', function () {

  QUnit.test('wrap01_縮排續行要合併', function (assert) {
    const raw =
      `◎此處耶穌慎重的說明自己做這些「衝撞傳統」的事情，並非是自
  發的，而是看到上帝的作為，才跟著去做。`;

    const lines = preprocessCaseToLines(raw);
    assert.equal(lines.length, 1);
    assert.equal(lines[0].text, '◎此處耶穌慎重的說明自己做這些「衝撞傳統」的事情，並非是自發的，而是看到上帝的作為，才跟著去做。');
  });
  QUnit.test('wrap01a_前面空白', function (assert) {
    const raw =
      `  ◎此處耶穌慎重的說明自己做這些「衝撞傳統」的事情，並非是自
    發的，而是看到上帝的作為，才跟著去做。`;

    const lines = preprocessCaseToLines(raw);
    assert.equal(lines.length, 1);
    assert.equal(lines[0].text, '◎此處耶穌慎重的說明自己做這些「衝撞傳統」的事情，並非是自發的，而是看到上帝的作為，才跟著去做。');
    assert.equal(lines[0].indent, 2);
  });
  QUnit.test('wrap01a_前空白差不多時', function (assert) {
    const raw =
      `  ◎此處耶穌慎重的說明自己做這些「衝撞傳統」的事情，並非是自
   發的，而是看到上帝的作為，才跟著去做。`;

    // 2 空白，3空白 ... 第2行被視為 同一層 ... 並且 ... 因為空白數其實應該是 2，所以第2個 3 會被修正為 2
    const lines = preprocessCaseToLines(raw);
    assert.equal(lines.length, 2);
    assert.equal(lines[0].text, '◎此處耶穌慎重的說明自己做這些「衝撞傳統」的事情，並非是自');
    assert.equal(lines[0].indent, 2);
    assert.equal(lines[1].text, '發的，而是看到上帝的作為，才跟著去做。');
    assert.equal(lines[1].indent, 2); //  因為空白數其實應該是 2，所以第2個 3 會被修正為 2
  });

  QUnit.test('wrap02_縮排續行但遇到新條目不合併', function (assert) {
    const raw =
      `a.父愛子，將一切所做的事指給子看（使子可照做）。
  ●「太初」：SG 746，「開始」、「起源」。`;

    const lines = preprocessCaseToLines(raw);
    assert.equal(lines.length, 2);
    assert.equal(lines[0].text, 'a.父愛子，將一切所做的事指給子看（使子可照做）。');
    assert.equal(lines[1].text, '●「太初」：SG 746，「開始」、「起源」。');
  });

  QUnit.test('wrap03_同層縮排誤差±1_不應誤判為續行', function (assert) {
    // 同一層，但縮排有抖動：8 個空白 vs 9 個空白
    // 若沒有「桶化容錯」，會因為 9 > 8 且不是新條目而被誤合併
    const raw =
      `        時間：修殿節（冬天）。
         地點：耶路撒冷聖殿中的所羅門廊下。`;

    const lines = preprocessCaseToLines(raw);
    assert.equal(lines.length, 2);
    assert.equal(lines[0].text, '時間：修殿節（冬天）。');
    assert.equal(lines[0].indent, 8);
    assert.equal(lines[1].text, '地點：耶路撒冷聖殿中的所羅門廊下。');
    assert.equal(lines[1].indent, 8); // 因為空白數其實應該是 8，所以第2個 9 會被修正為 8
  });


  QUnit.test('table01_表格線不合併_保留行', function (assert) {
    const raw =
      `◎下面是表格
  ┌────┬────┐
  │A   │B   │
  └────┴────┘
◎表格結束`;


const lines = preprocessCaseToLines(raw);

    // 這裡我們只要求：表格四行都還在（不被接到上一行）
    assert.ok(lines[1].text.includes('┌────┬────┐'));
    assert.ok(lines[2].text.includes('│A   │B   │'));
    assert.ok(lines[3].text.includes('└────┴────┘'));
  });

  QUnit.test('table02_破折線表格_整段不可被續行合併', function (assert) {
    const DASH = '----------------------------------------------------------------------------------------------------------------';
    const raw =
      `◎聖經中具名的亞述王共有六位，統治期間是西元前745-669(共77年)。
    名稱               筆數    時代(西元前)     同期猶大以色列王      與猶大/以色列關係             經節
  ${DASH}
                                                                      比加年間俘虜以色列民。        王下 15:19
  ${DASH}
  ◎表格結束`;

    const lines = preprocessCaseToLines(raw);
    
    // 1) 破折線本身應該是一行（不能被下一行合併）
    const dashIdx = lines.findIndex(x => x.text === DASH);
    assert.ok(dashIdx >= 0, '應該能找到破折線分隔行');

    // 2) 破折線後面的「表格內容列」要獨立成行（不能黏到 DASH）
    assert.ok(lines[dashIdx + 1].text.includes('比加年間俘虜以色列民。'), '破折線後應該是表格內容列');
    assert.ok(lines[dashIdx + 1].text.includes('王下 15:19'), '表格內容列應該包含經節');

    // 3) 第二條破折線也要是獨立一行
    const dashIdx2 = lines.findIndex((x, i) => i > dashIdx && x.text === DASH);
    assert.ok(dashIdx2 > dashIdx, '應該能找到第二條破折線分隔行');
  });
});

