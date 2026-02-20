import { normalizeTree } from './../../index/comments/normalizeTree.js';

QUnit.module('normalizeTree', function () {

    QUnit.test('norm01_basic', assert => {

        const tree = [
            {
                text: '前言',
                token: { kind: 'ordered', marker: '1.' },
                children: [
                    {
                        text: '補充',
                        token: { kind: 'note', marker: '◎' },
                        children: []
                    }
                ]
            }
        ];

        const out = normalizeTree(tree);

        assert.equal(out[0].type, 'item');
        assert.equal(out[0].w, '前言');

        assert.equal(out[0].children[0].type, 'note');
    });


    QUnit.test('norm02_table', assert => {

        const tree = [
            {
                text: '[TABLE]',
                token: {
                    kind: 'table',
                    raw: { type: 'table_raw', lines: [{ text: 'A  B  C', indent: 0, isTableLine: true }] },
                    lines: [{ text: 'A  B  C', indent: 0, isTableLine: true }]
                },
                children: []
            }
        ];

        const out = normalizeTree(tree);

        assert.equal(out[0].type, 'table');
        assert.ok(out[0].meta);
        assert.ok(out[0].meta.rawBlock);
        assert.ok(Array.isArray(out[0].meta.rawLines));
        assert.ok(out[0].meta.rawLines.length > 0);
        assert.equal(out[0].meta.rawLines[0].text, 'A  B  C');
    });

});