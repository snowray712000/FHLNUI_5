/**
 * @typedef {import('../TpQUnit.js').TpQUnit} TpQUnit
 */
const QUnit = /** @type {TpQUnit} */ (window.QUnit);

import { detectTableBlocks } from './../../index/comments/detectTableBlocks.js';

// inputs 變為這樣了
// {text: '壹、導言─道成肉身的顯明 1:1-2:11', indent: 0, isTableLine: true}

QUnit.module('detectTableBlocks', function () {

    QUnit.test('table01_box_drawing', assert => {

        const lines_core = [
            '◎標題',
            '┌────┬────┐',
            '│ A  │ B  │',
            '└────┴────┘',
            '◎結束'
        ];

        // 轉為 preprocessCaseToLines 的 inputs ()
        const lines = lines_core.map(text => ({ text, indent: 2, isTableLine: false }));
        lines[1].isTableLine = true;
        lines[3].isTableLine = true;

        const blocks = detectTableBlocks(lines);

        assert.equal(blocks.length, 3);

        assert.equal(blocks[0].type, 'text');
        assert.equal(blocks[1].type, 'table_raw');
        assert.equal(blocks[2].type, 'text');

        assert.equal(blocks[1].lines.length, 3);
    });


    QUnit.test('table02_dash_columns', assert => {

        const lines_core = [
            '◎對照表',
            '中文翻譯    原文編號    原文簡義',
            '----------------------------',
            '觀兆        SH6049      卜卦',
            '觀兆的      SH1505      占星',
            '◎結語'
        ];

        // 轉為 preprocessCaseToLines 的 inputs ()
        const lines = lines_core.map(text => ({ text, indent: 0, isTableLine: false }));
        lines[2].isTableLine = true;

        const blocks = detectTableBlocks(lines);

        assert.equal(blocks.length, 3);

        assert.equal(blocks[1].type, 'table_raw');
        assert.equal(blocks[1].lines.length, 4);
    });


    QUnit.test('table03_no_false_positive', assert => {

        const lines_core = [
            '這是一段普通說明',
            '沒有    表格',
            '只是  多  空白',
            '◎結束'
        ];
        // 轉為 preprocessCaseToLines 的 inputs ()
        const lines = lines_core.map(text => ({ text, indent: 0, isTableLine: false }));
        // 注意：這裡沒有任何一行被標記為 isTableLine

        const blocks = detectTableBlocks(lines);

        assert.equal(blocks.length, 1);
        assert.equal(blocks[0].type, 'text');
    });

});
