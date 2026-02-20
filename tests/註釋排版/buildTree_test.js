/**
 * @typedef {import('../TpQUnit.js').TpQUnit} TpQUnit
 */
const QUnit = /** @type {TpQUnit} */ (window.QUnit);

import { buildTree } from './../../index/comments/buildTree.js';

QUnit.module('buildTree', function () {

    QUnit.test('tree01_basic_indent', assert => {
        /*
(1) 前提
  a. 第一點
    ◎補充
  b. 第二點
(2) 結果
        */
        const tokens = [
            { kind: 'ordered', marker: '(1)', text: '前提', indent: 0 },
            { kind: 'ordered', marker: 'a.', text: '第一點', indent: 2 },
            { kind: 'note', marker: '◎', text: '補充', indent: 4 },
            { kind: 'ordered', marker: 'b.', text: '第二點', indent: 2 },
            { kind: 'ordered', marker: '(2)', text: '結果', indent: 0 }
        ];

        const tree = buildTree(tokens);

        assert.equal(tree.length, 2);

        assert.equal(tree[0].text, '前提');
        assert.equal(tree[0].children.length, 2);

        assert.equal(tree[0].children[0].text, '第一點');
        assert.equal(tree[0].children[0].children.length, 1);
        assert.equal(tree[0].children[0].children[0].text, '補充');

        assert.equal(tree[0].children[1].text, '第二點');

        assert.equal(tree[1].text, '結果');
    });


    QUnit.test('tree02_plain_attach_by_indent', assert => {
        /*
1. 背景
  這是說明
  再補一句
        */
        const tokens = [
            { kind: 'ordered', marker: '1.', text: '背景', indent: 0 },
            { kind: 'text', text: '這是說明', indent: 2 },
            { kind: 'text', text: '再補一句', indent: 2 }
        ];

        const tree = buildTree(tokens);

        assert.equal(tree.length, 1);
        assert.equal(tree[0].text, '背景');

        assert.equal(tree[0].children.length, 2);
        assert.equal(tree[0].children[0].text, '這是說明');
        assert.equal(tree[0].children[1].text, '再補一句');
    });

});