/**
 * @typedef {import('./TpQUnit').TpQUnit} TpQUnit
 * @typedef {import('../index/DText.js').DText} DText
 */
import { attach_sn_text } from '../index/attach_sn_text.js';

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

QUnit.module('attach_sn_text (DText[])', () => {
    const T = (w) => ({ w });
    const SN = (sn, tp = 'G', extra = {}) => ({ sn: String(sn), tp, ...extra });

    QUnit.test('恩典<G5485>', assert => {
        const in1 = [T('恩典'), SN(5485, 'G')];
        const out = attach_sn_text(in1, 'unv');

        // 還是 2 個, 但第一個被加了 sn 與 tp
        assert.equal(out.length, 2, '仍為兩個元素');
        assert.equal(out[0].sn, '5485', '第一個元素有 sn 屬性');
        assert.equal(out[0].tp, 'G', '第一個元素有 tp 屬性');
        // 第 2 個不變
        assert.deepEqual(out[1], in1[1], '第二個元素保持不變');
    });

    QUnit.test('你好，世界<G111>', assert => {
        const in1 = [T('你好，世界'), SN(111, 'G')];
        const out = attach_sn_text(in1, 'unv');

        // 會變 4 個，符號會被拆開。
        assert.equal(out.length, 4, 'split into 4 parts');
        // 世界會被標記 111 G, 其它不會，而 G111 不變
        assert.equal(out[2].w, '世界', 'second part is "世界"');
        assert.equal(out[2].sn, '111', 'second part has sn 111');
        assert.equal(out[2].tp, 'G', 'second part has tp G');

        assert.equal(out[0].w, '你好', 'first part is "你好，"');
        assert.equal(out[0].sn, undefined, 'first part has no sn');

        assert.equal(out[1].w, '，', 'third part is "，"');
        assert.equal(out[1].sn, undefined, 'third part has no sn');

        assert.deepEqual(out[3], in1[1], 'fourth part remains unchanged');
    });

    QUnit.test('的{<G1234>}', assert => {
        const in1 = [T('的'), SN(1234, 'G', { isCurly: 1, w: '{<1234>}' })];
        const out = attach_sn_text(in1, 'unv');

        // 會有 2 個，但因為是大括號，所以 「的」仍然不會有 sn
        assert.equal(out.length, 2, 'still 2 parts');
        assert.equal(out[0].w, '的', 'first part is "的"');
        assert.equal(out[0].sn, undefined, 'first part has no sn');
        assert.deepEqual(out[1], in1[1], 'second part remains unchanged');
    });

    QUnit.test('恩典<G3588><G5485>', assert => {
        const in1 = [T('恩典'), SN(3588, 'G'), SN(5485, 'G')];
        const out = attach_sn_text(in1, 'unv');

        // 會有 3 個，但 恩典 會被標記為 5485，因為 3588 是冠詞
        assert.equal(out.length, 3, 'still 3 parts');
        assert.equal(out[0].w, '恩典', 'first part is "恩典"');
        assert.equal(out[0].sn, '5485', 'first part has sn 5485');
        assert.equal(out[0].tp, 'G', 'first part has tp G');
        assert.deepEqual(out[1], in1[1], 'second part remains unchanged');
        assert.deepEqual(out[2], in1[2], 'third part remains unchanged');
    });

    QUnit.test('；恩典<G3588><G5485>', assert => {
        const in1 = [T('；恩典'), SN(3588, 'G'), SN(5485, 'G')];
        const out = attach_sn_text(in1, 'unv');

        // 會有 4 個，因為標點符號，會被跳開。
        assert.equal(out.length, 4, 'split into 4 parts');
        assert.equal(out[0].w, '；', 'first part is "；"');
        assert.equal(out[0].ispun, 1, 'first part is punctuation');
        assert.equal(out[1].w, '恩典', 'second part is "恩典"');
        assert.equal(out[1].sn, '5485', 'second part has sn 5485');
        assert.equal(out[1].tp, 'G', 'second part has tp G');
        assert.deepEqual(out[2], in1[1], 'third part remains unchanged');
        assert.deepEqual(out[3], in1[2], 'fourth part remains unchanged');
    });

    QUnit.test('恩典<G9001><G1234>', assert => {
        const in1 = [T('恩典'), SN(9001, 'G'), SN(1234, 'G')];
        const out = attach_sn_text(in1, 'unv');

        // 會有 3 個，但 恩典 會被標記為 1234，因為 9001 被跳過
        assert.equal(out.length, 3, 'still 3 parts');
        assert.equal(out[0].w, '恩典', 'first part is "恩典"');
        assert.equal(out[0].sn, '1234', 'first part has sn 1234');
        assert.equal(out[0].tp, 'G', 'first part has tp G');

        assert.deepEqual(out[1], in1[1], 'second part remains unchanged');
        assert.deepEqual(out[2], in1[2], 'third part remains unchanged');
    });

    QUnit.test('以色列<G5485>', assert => {
        const in1 = [{ w: '以色列', isName: 1 }, SN(5485, 'G')];
        const out = attach_sn_text(in1, 'unv');

        // 會有 2 個，且 以色列 被標記為 5485
        assert.equal(out.length, 2, 'still 2 parts');
        assert.equal(out[0].w, '以色列', 'first part is "以色列"');
        assert.equal(out[0].sn, '5485', 'first part has sn 5485');
        assert.equal(out[0].tp, 'G', 'first part has tp G');
        assert.deepEqual(out[1], in1[1], 'second part remains unchanged');
    });

    QUnit.test('恩典<G9001><G77>', assert => {
        const in1 = [{ w: '恩典', isName: 1 }, SN(9001, 'G'), SN(77, 'G')];
        const out = attach_sn_text(in1, 'unv');

        // 會有 3 個，且 恩典 被標記為 77
        assert.equal(out.length, 3, 'still 3 parts');
        assert.equal(out[0].w, '恩典', 'first part is "恩典"');
        assert.equal(out[0].sn, '77', 'first part has sn 77');
        assert.equal(out[0].tp, 'G', 'first part has tp G');
        assert.deepEqual(out[1], in1[1], 'second part remains unchanged');
        assert.deepEqual(out[2], in1[2], 'third part remains unchanged');
    });

    QUnit.test('恩典<G100>', assert => {
        const in1 = [T('恩典'), SN(100, 'G')];
        const out = attach_sn_text(in1, 'kjv');

        // 會有 2 個，且 恩典 被標記為 100
        assert.equal(out.length, 2, 'still 2 parts');
        assert.equal(out[0].w, '恩典', 'first part is "恩典"');
        assert.equal(out[0].sn, '100', 'first part has sn 100');
        assert.equal(out[0].tp, 'G', 'first part has tp G');
        assert.deepEqual(out[1], in1[1], 'second part remains unchanged');
    });

    // ...existing code...
    QUnit.test('子陣列 children 恩典<G5485>', assert => {
        const in1 = [{ children: [{ w: '恩典' }, { sn: '5485', tp: 'G' }] }];
        const out = attach_sn_text(in1, 'unv');

        // 
        console.log(out);

        const child = out[0].children;
        assert.equal(child[0].w, '恩典', ' ');
        assert.equal(child[0].sn, '5485', 'child[0] 套用 sn=5485');
        assert.equal(child[0].tp, 'G', 'child[0] tp=G');
        assert.deepEqual(child[1], in1[0].children[1], 'child[1] 保持不變');
    });

    QUnit.test('連續標點分割：甲，乙：丙<G200>', assert => {
        const in1 = [{ w: '甲，乙：丙' }, { sn: '200', tp: 'G' }];
        const out = attach_sn_text(in1, 'unv');
        const words = out.filter(d => d.w && !d.ispun).map(d => d.w);
        assert.deepEqual(words, ['甲', '乙', '丙'], '文字被正確分割');
        const snText = out.find(d => d.w === '丙');
        assert.equal(snText.sn, '200', '最後段落「丙」套上 sn=200');
    });

    QUnit.test('3588 之後是 brace，再之後才是有效 sn', assert => {
        const in1 = [{ w: '恩典' }, { sn: '3588', tp: 'G' }, { sn: '1234', tp: 'G', isCurly: 1, w: '{<1234>}' }, { sn: '5485', tp: 'G' }];
        const out = attach_sn_text(in1, 'unv');
        assert.equal(out[0].sn, '5485', '跳過 brace，取下一個有效 sn=5485');
        assert.equal(out[0].tp, 'G', 'tp=G');
    });

    QUnit.test('連續 >9000 的 sn 跳過直到有效', assert => {
        const in1 = [{ w: 'X' }, { sn: '9001', tp: 'G' }, { sn: '9002', tp: 'G' }, { sn: '77', tp: 'G' }];
        const out = attach_sn_text(in1, 'unv');
        assert.equal(out[0].sn, '77', '連續 >9000 都跳過，取 sn=77');
    });

    QUnit.test('SN 節點含 children：不應越界套用', assert => {
        const in1 = [{ w: '文字' }, { sn: '5485', tp: 'G', children: [{ w: '子' }] }];
        const out = attach_sn_text(in1, 'unv');
        assert.equal(out[0].sn, undefined, '前文字未套 sn（因 SN 有 children）');
        assert.deepEqual(out[1], in1[1], 'SN 節點保持不變');
    });

    QUnit.test('詞(G5740)<W5485>', assert => {
        // 當前文字若有 tp2，或目標 SN 的 tp2 包含 T，則跳過
        const in1 = [{ w: '詞' }, { sn: '5740', tp: 'G', tp2: 'WTG' }, { sn: '5485', tp: 'G' }];
        const out = attach_sn_text(in1, 'unv');

        // 雖然不太可能，但這時，應該是 w5485
        assert.equal(out[0].sn, '5485', '套用後方 sn=5485');
        assert.equal(out[0].tp, 'G', 'tp=G');

        assert.deepEqual(out[1], in1[1], '中間 sn 節點保持不變');
        assert.deepEqual(out[2], in1[2], '最後 sn 節點保持不變');
        
    });

    QUnit.test('沒有可用 SN：文字保持不變', assert => {
        const in1 = [{ w: '無SN' }];
        const out = attach_sn_text(in1, 'unv');
        assert.equal(out.length, 1, '仍為一個元素');
        assert.equal(out[0].sn, undefined, '沒有 sn');
        assert.equal(out[0].w, '無SN', '文字保持不變');
    });

    QUnit.test('已含 sn 的文字不覆蓋', assert => {
        const in1 = [{ w: '已套', sn: '100', tp: 'G' }, { sn: '200', tp: 'G' }];
        const out = attach_sn_text(in1, 'unv');
        assert.equal(out[0].sn, '100', '保留原 sn=100');
        assert.equal(out[0].tp, 'G', '保留原 tp');
        assert.deepEqual(out[1], in1[1], '後續 sn 保持不變');
    });

    QUnit.test('標點本身不套 sn 且 ispun=1', assert => {
        const in1 = [{ w: '，' }, { sn: '300', tp: 'G' }];
        const out = attach_sn_text(in1, 'unv');
        const p = out[0];
        assert.equal(p.w, '，', '保留標點');
        assert.equal(p.ispun, 1, '標記 ispun=1');
        assert.equal(p.sn, undefined, '標點不應套 sn');
    });

    QUnit.test('跨 children 邊界不可套 sn（父級文字 + 子級 SN）', assert => {
        const in1 = [{ w: '父文字' }, { children: [{ sn: '5485', tp: 'G' }] }];
        const out = attach_sn_text(in1, 'unv');
        assert.equal(out[0].sn, undefined, '父文字未套 sn（子級 SN 不應影響父級）');
    });
    // ...existing code...
});