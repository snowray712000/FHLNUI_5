/**
 * @typedef {import('./../TpQUnit.js').TpQUnit} TpQUnit
 * @typedef {import('./../TpQUnit.js').TpAssert} TpAssert
  * @typedef {import('./../../index/tsks/TpTsks.js').DText} DText
 * @typedef {import('./../../index/tsks/TpTsks.js').DAddress} DAddress
 * @typedef {import('./../../index/tsks/TpTsks.js').TskBlock} TskBlock
 */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

import { parseTsk } from './../../index/tsks/parseTsk.js'
import { BibleConstantHelper } from './../../index/BibleConstantHelper.es2023.js'

QUnit.module('parseTsk');

QUnit.test('summary + keyword + ref merge', assert => {
    const s = "\n  1;  God creates heaven and earth;\n  3;  the light;\n\n * beginning.\n # Pr 8:22-24; 16:4|\n # Mr 13:19|\n\n";
    const r = parseTsk(s, { sec: 1 });

    assert.equal(r.length, 2, '應有 2 個 block');
    assert.equal(r[0].type, 'summary', '第一段是 summary');
    assert.ok(r[0].items.length > 0, 'summary 有 items');

    assert.equal(r[1].type, 'keyword', '第二段是 keyword');
    assert.equal(r[1].keyword, 'beginning.', 'keyword 正確');
    const refItems = r[1].items.filter(it => it.type === 'ref');
    assert.equal(refItems.length, 1, 'ref 應合併為 1 個');
});

QUnit.test('refOnly', assert => {
    const s = "\n # Job 26:7|\n # Isa 45:18|\n\n";
    const r = parseTsk(s, { sec: 9 });
    assert.equal(r.length, 1, '應有 1 個 block');
    assert.equal(r[0].type, 'refOnly', '應判定為 refOnly');
    const refItems = r[0].items.filter(it => it.type === 'ref');
    assert.equal(refItems.length, 1, 'ref 應合併為 1 個');
});

QUnit.test('empty (sec matches)', assert => {
    const s = "\n # 13|\n\n";
    const r = parseTsk(s, { sec: 13 });
    assert.equal(r.length, 1, '應有 1 個 block');
    assert.equal(r[0].type, 'empty', '應判定為 empty');
    assert.equal(r[0].items.length, 0, 'empty 無 items');
});

QUnit.test('not empty when sec mismatch', assert => {
    const s = "\n # 15|\n\n";
    const r = parseTsk(s, { sec: 13 });
    assert.equal(r.length, 1, '應有 1 個 block');
    assert.equal(r[0].type, 'refOnly', 'sec 不符時應為 refOnly');
});

QUnit.test('keyword without ref (note in keyword block)', assert => {
    const s = "\n * the light from the darkness.  Heb. between the light and\n   between the darkness.\n\n";
    const r = parseTsk(s, { sec: 4 });
    assert.equal(r.length, 1, '應有 1 個 block');
    assert.equal(r[0].type, 'keyword', '應判定為 keyword');
    assert.equal(r[0].keyword, 'the light from the darkness', 'keyword 正確');
    assert.ok(r[0].items.some(it => it.type === 'text'), '應有 text items');
});

QUnit.test('orig and fb inline', assert => {
    const s = "\n * seventh day God.\n   [vav <<FB>See definition 02053<Fb>>,] which stands for six.\n\n";
    const r = parseTsk(s, { sec: 2 });
    console.log(r);

    assert.equal(r.length, 1, '應有 1 個 block');
    assert.equal(r[0].type, 'keyword', '應判定為 keyword');

    const items = r[0].items
    assert.equal(items[0].w, '[vav <')
    assert.equal(items[1].w, 'See definition 02053')
    assert.equal(items[2].w, '>,] which stands for six.')

    assert.equal(items[0].type, 'text');
    assert.equal(items[1].type, 'text-fb', '應判定為 text-fb');
    assert.equal(items[2].type, 'text');
});

QUnit.test('split multi keyword in one block', assert => {
    const s = "\n  1;  God creates heaven and earth;\n  3;  the light;\n  6;  the firmament;\n  9;  separates the dry land;\n 14;  forms the sun, moon, and stars;\n 20;  fishes and fowls;\n 24;  cattle, wild beasts, and creeping things;\n 26;  creates man in his own image, blesses him;\n 29;  grants the fruits of the earth for food.\n\n * beginning.\n # Pr 8:22-24; 16:4; Mr 13:19; Joh 1:1-3; Heb 1:10; 1Jo 1:1|\n * God.\n # Ex 20:11; 31:18; 1Ch 16:26; Ne 9:6; Job 26:13; 38:4; Ps 8:3; 33:6,9|\n # Ps 89:11,12; 96:5; 102:25; 104:24,30; 115:15; 121:2; 124:8; 134:3|\n # Ps 136:5; 146:6; 148:4,5; Pr 3:19; 8:22-30; Ec 12:1; Isa 37:16; 40:26|\n # Isa 40:28; 42:5; 44:24; 45:18; 51:13,16; 65:17; Jer 10:12; 32:17|\n # Jer 51:15; Zec 12:1; Mt 11:25; Ac 4:24; 14:15; 17:24; Ro 1:19,20|\n # Ro 11:36; 1Co 8:6; Eph 3:9; Col 1:16,17; Heb 1:2; 3:4; 11:3; 2Pe 3:5|\n # Re 3:14; 4:11; 10:6; 14:7; 21:6; 22:13|\n\n";

    const r = parseTsk(s, { sec: 1 });

    assert.equal(r.length, 3, '應有 3 個 block');
    assert.equal(r[0].type, 'summary', '第一段是 summary');
    assert.equal(r[1].type, 'keyword', '第二段是 keyword');
    assert.equal(r[1].keyword, 'beginning.', 'keyword 正確');
    assert.equal(r[2].type, 'keyword', '第三段是 keyword');
    assert.equal(r[2].keyword, 'God.', 'keyword 正確');
});

QUnit.test('split multi keyword in one block', assert => {
    const s = "\n  1;  God creates heaven and earth;\n  3;  the light;\n  6;  the firmament;\n  9;  separates the dry land;\n 14;  forms the sun, moon, and stars;\n 20;  fishes and fowls;\n 24;  cattle, wild beasts, and creeping things;\n 26;  creates man in his own image, blesses him;\n 29;  grants the fruits of the earth for food.\n\n * beginning.\n # Pr 8:22-24; 16:4; Mr 13:19; Joh 1:1-3; Heb 1:10; 1Jo 1:1|\n * God.\n # Ex 20:11; 31:18; 1Ch 16:26; Ne 9:6; Job 26:13; 38:4; Ps 8:3; 33:6,9|\n # Ps 89:11,12; 96:5; 102:25; 104:24,30; 115:15; 121:2; 124:8; 134:3|\n # Ps 136:5; 146:6; 148:4,5; Pr 3:19; 8:22-30; Ec 12:1; Isa 37:16; 40:26|\n # Isa 40:28; 42:5; 44:24; 45:18; 51:13,16; 65:17; Jer 10:12; 32:17|\n # Jer 51:15; Zec 12:1; Mt 11:25; Ac 4:24; 14:15; 17:24; Ro 1:19,20|\n # Ro 11:36; 1Co 8:6; Eph 3:9; Col 1:16,17; Heb 1:2; 3:4; 11:3; 2Pe 3:5|\n # Re 3:14; 4:11; 10:6; 14:7; 21:6; 22:13|\n\n";

    const r = parseTsk(s, { sec: 1 });

    assert.equal(r.length, 3, '應有 3 個 block');
    assert.equal(r[0].type, 'summary', '第一段是 summary');
    assert.equal(r[1].type, 'keyword', '第二段是 keyword');
    assert.equal(r[1].keyword, 'beginning.', 'keyword 正確');
    assert.equal(r[2].type, 'keyword', '第三段是 keyword');
    assert.equal(r[2].keyword, 'God.', 'keyword 正確');

    const refItems = r[2].items.filter(it => it.type === 'ref');
    assert.equal(refItems.length, 1, '同一 keyword 的多段 ref 應合併成 1 個');
    assert.ok(refItems[0].w.includes('Ex 20:11'), 'ref 應包含多段內容');
    assert.ok(refItems[0].w.includes('Re 3:14'), 'ref 應包含多段內容');

    const hashCount = (refItems[0].w.match(/#/g) || []).length;
    const pipeCount = (refItems[0].w.match(/\|/g) || []).length;
    assert.equal(hashCount, 1, '合併後只保留最前面的 #');
    assert.equal(pipeCount, 1, '合併後只保留最後面的 |');
});

QUnit.test('ref without book/chap should add ref prop with current book/chap', assert => {
    const s = "\n * that.\n # 10,12,18,25,31; Ec 2:13; 11:7|\n * the light from the darkness.  Heb. between the light and\n   between the darkness.\n\n";
    const r = parseTsk(s, { book: 1, chap: 1, sec: 4 });

    const refItems = r[0].items.filter(it => it.type === 'ref');
    assert.equal(refItems.length, 1, 'ref 應有 1 個');
    assert.equal(refItems[0].w, "# 10,12,18,25,31; Ec 2:13; 11:7|", 'w 保留原文');

    const bookName = BibleConstantHelper.getBookNameArrayEnglishShort()[0];
    assert.equal(refItems[0].ref, `# ${bookName} 1:10,12,18,25,31; Ec 2:13; 11:7|`, 'ref 補上書卷與章');
});

QUnit.test('ref starting with chap only should add book name', assert => {
    const s = "\n * that.\n # 8:22; Ps 19:2; 74:16|\n\n";
    const r = parseTsk(s, { book: 1, chap: 1, sec: 4 });

    const refItems = r[0].items.filter(it => it.type === 'ref');
    assert.equal(refItems.length, 1, 'ref 應有 1 個');

    const bookName = BibleConstantHelper.getBookNameArrayEnglishShort()[0];
    assert.equal(refItems[0].ref, `# ${bookName} 8:22; Ps 19:2; 74:16|`, 'ref 補上書卷名');
});

QUnit.test('ref should drop *marg: but keep in w', assert => {
    const s = "\n * moveth.  Heb. creepeth.\n # Ps 69:34; *marg:|\n\n";
    const r = parseTsk(s, { book: 1, chap: 1, sec: 28 });

    const refItems = r[0].items.filter(it => it.type === 'ref');
    assert.equal(refItems.length, 1, 'ref 應有 1 個');
    assert.equal(refItems[0].w, "# Ps 69:34; *marg:|", 'w 保留 *marg:');
    assert.equal(refItems[0].ref, "# Ps 69:34;|", 'ref 移除 *marg:');
});

QUnit.test('ref should drop *MARG: but keep in w', assert => {
    const s = "\n * moveth.  Heb. creepeth.\n # Ps 69:34; *MArG:|\n\n";
    const r = parseTsk(s, { book: 1, chap: 1, sec: 28 });

    const refItems = r[0].items.filter(it => it.type === 'ref');
    assert.equal(refItems.length, 1, 'ref 應有 1 個');
    assert.equal(refItems[0].w, "# Ps 69:34; *MArG:|", 'w 保留 *MArG:');
    assert.equal(refItems[0].ref, "# Ps 69:34;|", 'ref 移除 *MArG:');
});

QUnit.test('ref with numeric book name should not be prefixed', assert => {
    const s = "\n * that.\n # 1 Cor 2:1; 1Co 3:2|\n\n";
    const r = parseTsk(s, { book: 1, chap: 1, sec: 4 });

    const refItems = r[0].items.filter(it => it.type === 'ref');
    assert.equal(refItems.length, 1, 'ref 應有 1 個');
    assert.equal(refItems[0].ref, "# 1 Cor 2:1; 1Co 3:2|", '不應補上 Ge 1:');
});

QUnit.test('text should remove newline in non-summary blocks', assert => {
    const s = "\n * that.\n # 10,12,18,25,31; Ec 2:13; 11:7|\n * the light from the darkness.  Heb. between the light and\n   between the darkness.\n\n";

    const r = parseTsk(s, { book: 1, chap: 1, sec: 4 });

    assert.equal(r.length, 2, '應有 2 個 block');
    assert.equal(r[1].type, 'keyword', '第二段是 keyword');

    const textItems = r[1].items.filter(it => it.type === 'text');
    assert.equal(textItems.length, 1, '應有 1 個 text');
    assert.equal(
        textItems[0].w,
        "Heb. between the light and between the darkness.",
        'text 應移除換行排版'
    );
});

QUnit.test('keyword split uses Heb/Gr dot else newline', assert => {
    const s = "\n * Let there.\n # De 4:19; Job 25:3,5; 38:12-14; Ps 8:3,4; 19:1-6; 74:16,17; 104:19,20|\n # Ps 119:91; 136:7-9; 148:3,6; Isa 40:26; Jer 31:35; 33:20,25|\n * lights.\n   Or, rather, luminaries or light-bearers; being a different\n   world from that rendered light, in ver. 3, the day from the\n   night.\n\n * between the day and between the night.  and let.\n # 8:22; 9:13; Job 3:9; 38:31,32; Ps 81:3; Eze 32:7,8; 46:1,6|\n # Joe 2:10,30,31; 3:15; Am 5:8; 8:9; Mt 2:2; 16:2,3; 24:29; Mr 13:24|\n # Lu 21:25,26; 23:45; Ac 2:19,20; Re 6:12; 8:12; 9:2|\n\n";

    const r = parseTsk(s, { book: 1, chap: 1, sec: 4 });

    assert.equal(r.length, 3, '應有 3 個 block');

    assert.equal(r[2].keyword, 'between the day and between the night.  and let.', 'keyword 應包含 and let');
    const textItems = r[2].items.filter(it => it.type === 'text');
    assert.equal(textItems.length, 0, '不應產生多餘的 text item');
    const refItems = r[2].items.filter(it => it.type === 'ref');
    assert.equal(refItems.length, 1, 'ref 應有 1 個');
});

let input = ""
/** @type {TskBlock[]} */
let except = []
/** @type {DText[]} */
let actual = []
/** @type {DAddress} */
let address = []


QUnit.test('傳9:1', assert => {

    input = `\n  1;  Like things happen to good and bad.\n  4;  There is a necessity of death unto men.\n  7;  Comfort is all their portion in this life.\n 11;  God's providence rules over all.\n 13;  Wisdom is better than strength.\n\n * considered in my heart.  Heb. gave, or set to my heart.\n # 1:17; 7:25; 8:16; 12:9,10|\n * that the.\n # 8:14; De 33:3; 1Sa 2:9; 2Sa 15:25,26; Job 5:8; Ps 10:14; 31:5|\n # Ps 37:5,6; Pr 16:3; Isa 26:12; 49:1-4; Jer 1:18,19; Joh 10:27-30|\n # 1Co 3:5-15; 2Ti 1:12; 1Pe 1:5|\n * no man.\n # 7:15; Ps 73:3,11-13; Mal 3:15-18|\n\n`
    address = [21, 9, 1]

    actual = parseTsk(input, address)

    except =
        [
            {
                "type": "summary",
                "keyword": null,
                "items": [
                    {
                        "type": "summaryItem",
                        "text": "Like things happen to good and bad.",
                        "ref": "傳9:1-3",
                        "w": "1-3"
                    },
                    {
                        "type": "summaryItem",
                        "text": "There is a necessity of death unto men.",
                        "ref": "傳9:4-6",
                        "w": "4-6"
                    },
                    {
                        "type": "summaryItem",
                        "text": "Comfort is all their portion in this life.",
                        "ref": "傳9:7-10",
                        "w": "7-10"
                    },
                    {
                        "type": "summaryItem",
                        "text": "God's providence rules over all.",
                        "ref": "傳9:11-12",
                        "w": "11-12"
                    },
                    {
                        "type": "summaryItem",
                        "text": "Wisdom is better than strength.",
                        "ref": "傳9:13-18",
                        "w": "13-18"
                    }
                ],
            },
            {
                "type": "keyword",
                "keyword": "considered in my heart",
                "items": [
                    {
                        "type": "text",
                        "w": "Heb. gave, or set to my heart."
                    },
                    {
                        "type": "ref",
                        "w": "# 1:17; 7:25; 8:16; 12:9,10|",
                        "ref": "# Ec 1:17; 7:25; 8:16; 12:9,10|"
                    }
                ],
            },
            {
                "type": "keyword",
                "keyword": "that the.",
                "items": [
                    {
                        "type": "ref",
                        "w": "# 8:14; De 33:3; 1Sa 2:9; 2Sa 15:25,26; Job 5:8; Ps 10:14; 31:5; 37:5,6; Pr 16:3; Isa 26:12; 49:1-4; Jer 1:18,19; Joh 10:27-30; 1Co 3:5-15; 2Ti 1:12; 1Pe 1:5|",
                        "ref": "# Ec 8:14; De 33:3; 1Sa 2:9; 2Sa 15:25,26; Job 5:8; Ps 10:14; 31:5; 37:5,6; Pr 16:3; Isa 26:12; 49:1-4; Jer 1:18,19; Joh 10:27-30; 1Co 3:5-15; 2Ti 1:12; 1Pe 1:5|"
                    }
                ],

            },
            {
                "type": "keyword",
                "keyword": "no man.",
                "items": [
                    {
                        "type": "ref",
                        "w": "# 7:15; Ps 73:3,11-13; Mal 3:15-18|",
                        "ref": "# Ec 7:15; Ps 73:3,11-13; Mal 3:15-18|"
                    }
                ],

            }
        ]
    removerawprop(actual);

    assert.deepEqual(actual, except, 'parseTsk 應正確解析傳9:1的內容');


})

// ---
function removerawprop(tskBlocks) {
    for (const block of tskBlocks) {
        if (!block || !Array.isArray(block.items)) continue;

        delete block.raw
    }
}