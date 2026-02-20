// {{type:'text'|'table_raw', lines:{text:string,indent:number,isTableLine:boolean}[]}} line

/**
 * @typedef {import('../TpQUnit.js').TpQUnit} TpQUnit
 */
const QUnit = /** @type {TpQUnit} */ (window.QUnit);

import { tokenizeLine } from './../../index/comments/tokenizeLine.js';

function mkTextBlock(text, indent = 0) {
  return {
    type: 'text',
    lines: [{ text, indent, isTableLine: false }]
  };
}

function mkTableBlock(lines, indent = 0) {
  return {
    type: 'table_raw',
    lines: lines.map(t => ({ text: t, indent, isTableLine: true }))
  };
}

QUnit.module('tokenizeLine', function () {

  QUnit.test('note01_無序符號_感想', assert => {
    const text = '◎這是感想';
    const input_pre = mkTextBlock(text);
    const tokens = tokenizeLine(input_pre);
    const t = tokens[0];

    assert.equal(t.kind, 'note');
    assert.equal(t.marker, '◎');
    assert.equal(t.text, '這是感想');
  });

  QUnit.test('lex01_字詞註解', assert => {
    const text = '●「太初」：SG 746';
    const input_pre = mkTextBlock(text);
    const tokens = tokenizeLine(input_pre);
    const t = tokens[0];

    assert.equal(t.kind, 'lex');
    assert.equal(t.marker, '●');
  });

  QUnit.test('ordered01_a', assert => {
    const text = 'a.父愛子';
    const input_pre = mkTextBlock(text);
    const tokens = tokenizeLine(input_pre);
    const t = tokens[0];  

    assert.equal(t.kind, 'ordered');
    assert.equal(t.marker, 'a.');
    assert.equal(t.levelHint, 'a');
  });

  QUnit.test('ordered02_num', assert => {
    const text = '1.背景說明';
    const input_pre = mkTextBlock(text);
    const tokens = tokenizeLine(input_pre);
    const t = tokens[0];

    assert.equal(t.kind, 'ordered');
    assert.equal(t.marker, '1.');
  });

  QUnit.test('ordered03_paren', assert => {
    const text = '(1)前提';
    const input_pre = mkTextBlock(text);
    const tokens = tokenizeLine(input_pre);
    const t = tokens[0];

    assert.equal(t.kind, 'ordered');
    assert.equal(t.marker, '(1)');
  });

  QUnit.test('ordered04_cn', assert => {
    const text = '（一）作者';
    const input_pre = mkTextBlock(text);
    const tokens = tokenizeLine(input_pre);
    const t = tokens[0];

    assert.equal(t.kind, 'ordered');
    assert.equal(t.marker, '（一）');
  });

  QUnit.test('plain01_text', assert => {
    const text = '這是一段普通說明';
    const input_pre = mkTextBlock(text);
    const tokens = tokenizeLine(input_pre);
    const t = tokens[0];
    assert.equal(t.kind, 'text');
  });

});
