import { add_sn_text } from "../index/add_sn_text.js";

/**
@typedef {import('../tests/TpQUnit').TpQUnit} TpQUnit
**/

const QUnit = /* @type {TpQUnit} */ (window.QUnit);


function makeSn(sn, n, innerText, withBrace = false) {
    const t = innerText !== undefined ? innerText : `<${sn}>`;
    const txt = withBrace ? `{${t}}` : t;
    return $("<span>").addClass("sn").attr({ sn: String(sn), n: String(n) }).text(txt);
}

QUnit.module('add_sn_text', () => {
    QUnit.test('wraps previous text into sn-text (unv)', assert => {
        const root = $("<span>");
        root.append("恩典");
        root.append(makeSn(5485, 0));
        add_sn_text(root, 'unv');
        const st = root.find("span.sn-text");
        assert.equal(st.length, 1, 'sn-text created');
        assert.equal(st.attr('sn'), '5485', 'sn-text sn attr');
        assert.equal(st.attr('n'), '0', 'sn-text n attr');
        assert.equal(st.text(), '恩典', 'sn-text content is previous text');
    });

    QUnit.test('splits by last punctuation and preserves it', assert => {
        const root = $("<span>");
        root.append("你好，世界"); // last punctuation is ，
        root.append(makeSn(111, 1));
        add_sn_text(root, 'unv');
        const contents = root.contents().toArray();
        assert.ok(contents[0].nodeType === 3, 'first is text node');
        assert.equal(contents[0].data, '你好，', 'punctuation kept with previous part');

        const st = root.find("span.sn-text");
        assert.equal(st.text(), '世界', 'sn-text got trailing part after punctuation');
        assert.equal(st.attr('sn'), '111', 'sn-text sn');
    });

    QUnit.test('skips when sn innerText starts with brace', assert => {
        const root = $("<span>");
        root.append("的");
        root.append(makeSn(1234, 1, "{<1234>}", true));
        add_sn_text(root, 'unv');
        assert.equal(root.find("span.sn-text").length, 0, 'no sn-text created');
        const contents = root.contents().toArray();
        assert.ok(contents[0].nodeType === 3 && contents[0].data === '的', 'original text remains');
    });

    QUnit.test('冠詞 3588： 恩典<3588><5485>', assert => {
        const root = $("<span>");
        root.append("恩典");
        root.append(makeSn(3588, 0));
        root.append(makeSn(5485, 0));
        // console.log(Array.from($(root).contents()));

        add_sn_text(root, 'unv');
        console.log(root.contents());


        const st = root.find("span.sn-text");
        assert.equal(st.attr('sn'), '5485', 'sn-text uses next sn after 3588');
        assert.equal(st.attr('n'), '0', 'sn-text n');
        assert.equal(st.text(), '恩典', 'sn-text content is original text');

        const firstSn = root.find("span.sn").first(); // should be 3588
        assert.equal(firstSn.attr('sn'), '3588', 'first sn remains 3588');
        assert.ok(firstSn.prev().hasClass('sn-text'), 'sn-text inserted before 3588 span');
    });
    QUnit.test('冠詞 3588： ；恩典<3588><5485>', assert => {
        const root = $("<span>");
        root.append("；恩典");
        root.append(makeSn(3588, 0));
        root.append(makeSn(5485, 0));
        // console.log(Array.from($(root).contents()));

        add_sn_text(root, 'unv');
        
        const st = root.find("span.sn-text");
        assert.equal(st.attr('sn'), '5485', 'sn-text uses next sn after 3588, is 5485');
        assert.equal(st.attr('n'), '0', 'sn-text n');
        assert.equal(st.text(), '恩典', 'sn-text content is original text');

        const firstSn = root.find("span.sn").first(); // should be 3588
        assert.equal(firstSn.attr('sn'), '3588', 'first sn remains 3588');
        assert.ok(firstSn.prev().hasClass('sn-text'), 'sn-text inserted before 3588 span');
    });

    QUnit.test('uses next sn when current sn > 9000', assert => {
        const root = $("<span>");
        root.append("X");
        root.append(makeSn(9001, 0));
        root.append(makeSn(1234, 0));
        add_sn_text(root, 'unv');
        const st = root.find("span.sn-text");
        assert.equal(st.attr('sn'), '1234', 'sn-text sn taken from next');
        assert.equal(st.attr('n'), '0', 'sn-text n taken from next');
        assert.equal(st.text(), 'X', 'sn-text wraps previous text');

        const firstSn = root.find("span.sn").first();
        assert.equal(firstSn.attr('sn'), '9001', 'original large sn remains');
        assert.ok(firstSn.prev().hasClass('sn-text'), 'sn-text inserted before the >9000 sn');
    });

    QUnit.test('U tag case: adds sn-text class and attrs to <u>', assert => {
        const root = $("<span>");
        const u = $("<u>").text("以色列").appendTo(root);
        root.append(makeSn(5485, 0));
        add_sn_text(root, 'unv');
        assert.ok(u.hasClass('sn-text'), '<u> got sn-text class');
        assert.equal(u.attr('sn'), '5485', 'u sn attr from following sn');
        assert.equal(u.attr('n'), '0', 'u n attr from following sn');
    });

    QUnit.test('U tag case with sn > 9000 uses next sn', assert => {
        const root = $("<span>");
        const u = $("<u>").text("X").appendTo(root);
        root.append(makeSn(9001, 1));
        root.append(makeSn(77, 1));
        add_sn_text(root, 'unv');

        assert.ok(u.hasClass('sn-text'), '<u> got sn-text class');
        assert.equal(u.attr('sn'), '77', 'u sn attr taken from next sn');
        assert.equal(u.attr('n'), '1', 'u n attr taken from next sn');
    });

    QUnit.test('adds leading space for kjv', assert => {
        const root = $("<span>");
        root.append("X");
        root.append(makeSn(100, 0));
        add_sn_text(root, 'kjv');

        const contents = root.contents().toArray();
        assert.ok(contents[0].nodeType === 3, 'first is text node');
        assert.equal(contents[0].data, ' ', 'leading space inserted for kjv');

        const st = root.find("span.sn-text");
        assert.equal(st.attr('sn'), '100', 'sn-text sn');
        assert.equal(st.text(), 'X', 'sn-text wraps previous text');
    });
});