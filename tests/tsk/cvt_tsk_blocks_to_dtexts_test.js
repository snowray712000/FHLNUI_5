/**
 * @typedef {import('./../TpQUnit.js').TpQUnit} TpQUnit
 * @typedef {import('./../TpQUnit.js').TpAssert} TpAssert
 * @typedef {import('./../../index/tsks/TpTsks.js').DText} DText
 * @typedef {import('./../../index/tsks/TpTsks.js').DAddress} DAddress
 * @typedef {import('./../../index/tsks/TpTsks.js').TskBlock} TskBlock
 */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

/** @type {TskBlock[]} */
let blocks = []
/** @type {DText[]} */
let actual = []
/** @type {DText[]} */
let expected = []
/** @type {DAddress} */
let addr = []

QUnit.module('convertToDTexts');

import { cvt_tsk_blocks_to_dtexts } from './../../index/tsks/cvt_tsk_blocks_to_dtexts.js'

/**
 * @param {any} node
 * @returns {any}
 */
function normalizeNode(node) {
    const out = {};
    const keys = [
        "w",
        "isTitle1",
        "isBr",
        "isRef",
        "refDescription",
        "tp",
        "sn",
        "isBold",
        "marker",
        "isHr",
        "ishr"
    ];
    for (const k of keys) {
        if (node && Object.prototype.hasOwnProperty.call(node, k)) {
            out[k] = node[k];
        }
    }
    if (Array.isArray(node?.children)) {
        out.children = node.children.map(normalizeNode);
    }
    if (Array.isArray(node?.childrenlist)) {
        out.childrenlist = node.childrenlist.map(normalizeNode);
    }
    return out;
}

/**
 * @param {any[]} arr
 * @returns {any[]}
 */
function normalizeDTexts(arr) {
    return (arr || []).map(normalizeNode);
}

QUnit.test("傳9:13", assert => {
    const blocks =
        [
            {
                type: "refOnly",
                items:
                    [
                        {
                            type: "ref",
                            w: "# 11; 6:1; 7:15; 8:16|"
                        }
                    ]
            }
        ]
    const addr = [21, 9, 13]
    const actual = cvt_tsk_blocks_to_dtexts(blocks, addr)

    const expected = [
        {
            w: "本節相關",
            isTitle1: 1
        },
        { isBr: 1 },
        {
            w: "# 11; 6:1; 7:15; 8:16|",
            isRef: 1,
            refDescription: "Ec 9:11; 6:1; 7:15; 8:16" // 拿掉 # 與 |, 並且加上書卷名稱 (book 21 Ecclesiastes 傳道書) // 注意, 原本只有 11, 是指 「節」, 在轉換時, 發現只有 節的時候, 要補上書卷與章
        }
    ];

    assert.deepEqual(actual, expected);
});

QUnit.test("傳9:15", assert => {
    const blocks =
        [
            {
                type: "keyword",
                keyword: "yet.",
                items:
                    [
                        {
                            type: "ref",
                            w: "# Ge 40:23; Es 6:2,3|",
                            ref: "# Ge 40:23; Es 6:2,3|"
                        }
                    ]
            }
        ]

    const addr = [21, 9, 15]
    const actual = cvt_tsk_blocks_to_dtexts(blocks, addr)
    const expected = [
        {
            w: "yet.",
            isTitle1: 1
        },
        { isBr: 1 },
        {
            w: "# Ge 40:23; Es 6:2,3|",
            isRef: 1,
            refDescription: "Ge 40:23; Es 6:2,3" // 拿掉 # 與 |, 不加書卷名稱 (因為已經在 title1 中)
        }
    ];

    assert.deepEqual(actual, expected);
})

QUnit.test("傳9:14", assert => {
    const blocks =
        [
            {
                "type": "keyword",
                "keyword": "There was.",
                "items": [
                    {
                        "type": "ref",
                        "w": "# 2Sa 20:15-22; 2Ki 6:24-33; 7:1-20|"
                    }
                ]
            }
        ]

    const addr = [21, 9, 14]
    const actual = cvt_tsk_blocks_to_dtexts(blocks, addr)

    const expected =
        [
            {
                w: "There was.",
                isTitle1: 1
            },
            { isBr: 1 },
            {
                w: "# 2Sa 20:15-22; 2Ki 6:24-33; 7:1-20|",
                isRef: 1,
                refDescription: "2Sa 20:15-22; 2Ki 6:24-33; 7:1-20" // 拿掉 # 與 |, 不加書卷名稱 (因為已經在 title1 中 ... 2Sa 被誤判 2Ki 也被誤判)
            }
        ]

    assert.deepEqual(actual, expected);
})

QUnit.test("summary block -> DText[] (本章總覽 + childrenlist)", assert => {
    const blocks = [
        {
            type: "summary",
            keyword: null,
            raw: "1; God creates heaven and earth;\n3; the light;",
            items: [
                { type: "summaryItem", text: "God creates heaven and earth;", ref: "創1:1-2", w: "1-2" },
                { type: "summaryItem", text: "the light;", ref: "創1:3-5", w: "3-5" }
            ]
        }
    ];

    const actual = cvt_tsk_blocks_to_dtexts(blocks);
    // const actual = normalizeDTexts(cvt_tsk_blocks_to_dtexts(blocks));
    const expected = [
        {
            w: "本章總覽",
            isTitle1: 1,
            childrenlist: [
                {
                    marker: "●",
                    children: [
                        { w: "1-2", isRef: 1, refDescription: "創1:1-2" },
                        { w: "God creates heaven and earth;" }
                    ]
                },
                {
                    marker: "●",
                    children: [
                        { w: "3-5", isRef: 1, refDescription: "創1:3-5" },
                        { w: "the light;" }
                    ]
                }
            ]
        }
    ];

    assert.deepEqual(actual, expected);
});

QUnit.test("section related case1 -> note + add-in-text + refOnly", assert => {
    const blocks = [
        {
            type: "note",
            keyword: null,
            raw: "",
            items: [
                {
                    type: "text",
                    w: "Bdellium is a transparent aromatic gum. The onyx is a precious stone, so called from a Greek word signifying a man's nail, to the colour of which it nearly approaches."
                },
                {
                    type: "add-in-text",
                    item: [
                        { type: "sn", tp: "H", sn: "2053" },
                        { type: "sn", tp: "G", sn: "2053" },
                        { type: "ref", w: "Sec. 15", ref: "創1:15" }
                    ]
                }
            ]
        },
        {
            type: "refOnly",
            keyword: null,
            raw: "",
            items: [
                { type: "ref", w: "# 民 11:7|", ref: "# 民 11:7|" }
            ]
        }
    ];

    const actual = normalizeDTexts(cvt_tsk_blocks_to_dtexts(blocks));

    assert.equal(actual[0]?.w, "本節相關");
    assert.equal(actual[0]?.isTitle1, 1);

    assert.deepEqual(actual[1], { isBr: 1 });
    assert.equal(
        actual[2]?.w,
        "Bdellium is a transparent aromatic gum. The onyx is a precious stone, so called from a Greek word signifying a man's nail, to the colour of which it nearly approaches."
    );
    assert.deepEqual(actual[3], { isBr: 1 });

    assert.deepEqual(actual[4], {
        children: [
            { w: "文中特殊字眼:" },
            { w: "H2053", tp: "H", sn: "2053" },
            { w: "、" },
            { w: "G2053", tp: "G", sn: "2053" },
            { w: "、" },
            { w: "Sec. 15", isRef: 1, refDescription: "創1:15" }
        ]
    });

    assert.deepEqual(actual[5], { isBr: 1 });
    assert.equal(actual[6]?.w, "# 民 11:7|");
    assert.equal(actual[6]?.isRef, 1);
    assert.ok(
        String(actual[6]?.refDescription || "").includes("民 11:7"),
        "refDescription should contain 民 11:7"
    );
});

QUnit.test("section related case2 -> only refOnly", assert => {
    const blocks = [
        {
            type: "refOnly",
            keyword: null,
            raw: "",
            items: [
                {
                    type: "ref",
                    w: "# 28; 8:17; 9:1; 30:27,30; 35:11; 利 26:9; 伯 40:15; 42:12; 詩 107:31,38; 128:3; 144:13,14; 箴 10:22|",
                    ref: "# 創 1:28; 8:17; 9:1; 30:27,30; 35:11; 利 26:9; 伯 40:15; 42:12; 詩 107:31,38; 128:3; 144:13,14; 箴 10:22|"
                }
            ]
        }
    ];

    const actual = normalizeDTexts(cvt_tsk_blocks_to_dtexts(blocks));

    assert.equal(actual[0]?.w, "本節相關");
    assert.equal(actual[0]?.isTitle1, 1);
    assert.deepEqual(actual[1], { isBr: 1 });
    assert.equal(
        actual[2]?.w,
        "# 28; 8:17; 9:1; 30:27,30; 35:11; 利 26:9; 伯 40:15; 42:12; 詩 107:31,38; 128:3; 144:13,14; 箴 10:22|"
    );
    assert.equal(actual[2]?.isRef, 1);
    assert.equal(
        actual[2]?.refDescription,
        "創 1:28; 8:17; 9:1; 30:27,30; 35:11; 利 26:9; 伯 40:15; 42:12; 詩 107:31,38; 128:3; 144:13,14; 箴 10:22"
    );
});

QUnit.test("keywords case4 -> title1 + ref/text-fb/add-in-text conversion", assert => {
    const blocks = [
        {
            type: "keyword",
            keyword: "And on.",
            raw: "",
            items: [
                {
                    type: "ref",
                    w: "# 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4|",
                    ref: "# 創 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4|"
                }
            ]
        },
        {
            type: "keyword",
            keyword: "seventh day God.",
            raw: "",
            items: [
                { type: "text", w: "The LXX., Syriac, and the Samaritan Text read the sixth day, which is probably the true reading; as [vav <" },
                { type: "text-fb", w: "See definition 02053" },
                { type: "text", w: ">,] which stands for six, might easily be changed into [zayin,] which denotes seven." },
                {
                    type: "add-in-text",
                    item: [
                        { type: "sn", tp: "H", sn: "2053" },
                        { type: "sn", tp: "G", sn: "2053" }
                    ]
                }
            ]
        },
        {
            type: "keyword",
            keyword: "rested.",
            raw: "",
            items: [
                {
                    type: "text",
                    w: "Or, rather, ceased, as the Hebrew word is not opposed to weariness, but to action; as the Divine Being can neither know fatigue, nor stand in need of rest."
                }
            ]
        }
    ];

    const actual = normalizeDTexts(cvt_tsk_blocks_to_dtexts(blocks));
    const expected = [
        { w: "And on.", isTitle1: 1 },
        { isBr: 1 },
        { w: "# 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4|", isRef: 1, refDescription: "創 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4" },
        { isBr: 1 },

        { w: "seventh day God.", isTitle1: 1 },
        { isBr: 1 },
        { w: "The LXX., Syriac, and the Samaritan Text read the sixth day, which is probably the true reading; as [vav <" },
        { w: "See definition 02053", isBold: 1 },
        { w: ">,] which stands for six, might easily be changed into [zayin,] which denotes seven." },
        { isBr: 1 },
        {
            children: [
                { w: "文中特殊字眼:" },
                { w: "H2053", tp: "H", sn: "2053" },
                { w: "、" },
                { w: "G2053", tp: "G", sn: "2053" }
            ]
        },
        { isBr: 1 },

        { w: "rested.", isTitle1: 1 },
        { isBr: 1 },
        { w: "Or, rather, ceased, as the Hebrew word is not opposed to weariness, but to action; as the Divine Being can neither know fatigue, nor stand in need of rest." }
    ];

    assert.deepEqual(actual, expected);
});

QUnit.test("keywords case4b", assert => {
    const blocks = [
        {
            type: "keyword",
            keyword: "And on.",
            raw: "",
            items: [
                {
                    type: "text",
                    w: "aaa bbb ccc",
                },
                {
                    type: "ref",
                    w: "# 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4|",
                    ref: "# 創 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4|"
                }
            ]
        }
    ];

    const actual = normalizeDTexts(cvt_tsk_blocks_to_dtexts(blocks));
    const expected = [
        { w: "And on.", isTitle1: 1 },
        { isBr: 1 },
        { w: "aaa bbb ccc" },
        { isBr: 1 },
        { w: "# 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4|", isRef: 1, refDescription: "創 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4" },
    ];

    assert.deepEqual(actual, expected);
});

QUnit.test("keywords case4c", assert => {
    const blocks = [
        {
            type: "keyword",
            keyword: "And on.",
            raw: "",
            items: [
                {
                    type: "ref",
                    w: "# 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4|",
                    ref: "# 創 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4|"
                },
                {
                    type: "text",
                    w: "aaa bbb ccc",
                },
            ]
        }
    ];

    const actual = normalizeDTexts(cvt_tsk_blocks_to_dtexts(blocks));
    const expected = [
        { w: "And on.", isTitle1: 1 },
        { isBr: 1 },
        { w: "# 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4|", isRef: 1, refDescription: "創 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4" },
        { isBr: 1 },
        { w: "aaa bbb ccc" },
    ];

    assert.deepEqual(actual, expected);
});

QUnit.test("full composition -> summary / section / keywords with hr separators", assert => {
    const blocks = [
        {
            type: "summary",
            keyword: null,
            raw: "",
            items: [{ type: "summaryItem", text: "the light;", ref: "創1:3-5", w: "3-5" }]
        },
        {
            type: "note",
            keyword: null,
            raw: "",
            items: [{ type: "text", w: "section-note" }]
        },
        {
            type: "keyword",
            keyword: "God.",
            raw: "",
            items: [{ type: "ref", w: "# 詩 33:6,9|", ref: "# 詩 33:6,9|" }]
        }
    ];

    const actualRaw = cvt_tsk_blocks_to_dtexts(blocks);
    const actual = normalizeDTexts(actualRaw);

    const hrCount = actual.filter(x => x.isHr === 1 || x.ishr === 1).length;
    assert.equal(hrCount, 2, "should place 2 HR separators between 3 non-empty sections");

    const idxSummary = actual.findIndex(x => x.w === "本章總覽");
    const idxSection = actual.findIndex(x => x.w === "本節相關");
    const idxKeyword = actual.findIndex(x => x.w === "God.");
    assert.ok(idxSummary >= 0, "has summary section");
    assert.ok(idxSection >= 0, "has section-related section");
    assert.ok(idxKeyword >= 0, "has keywords section");
    assert.ok(idxSummary < idxSection && idxSection < idxKeyword, "section order is summary -> section -> keywords");
});

QUnit.test("empty blocks -> empty dtexts", assert => {
    const actual = cvt_tsk_blocks_to_dtexts([]);

    const expected = [
        { w: "(本節無資料)" },
    ];

    assert.deepEqual(actual, expected);
});

