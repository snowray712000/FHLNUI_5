/**
 * @typedef {import('./../index/DText.js').DText} DText
 * @typedef {import('./../index/DText.js').DAddress} DAddress
 * @typedef {import('./../index/tsks/TpTsks.js').TskBlock} TskBlock
 */

// 目標: parseTsk -> block array -> 中繼檔案 (Dtext []) -> html
// 現在，請 update 0228h.js 中的 4 個 TODO function，將 parseTsk 的 output block array 轉成 DText[]，以供後續轉成 html 用。

// --- summary type block ---

// input:
//   {
//     "type": "summary",
//     "keyword": null,
//     "items": [
//       {
//         "type": "summaryItem",
//         "text": "God creates heaven and earth;",
//         "ref": "創1:1-2",
//         "w": "1-2"
//       },
//       {
//         "type": "summaryItem",
//         "text": "the light;",
//         "ref": "創1:3-5",
//         "w": "3-5"
//       },
//     ]
//   },
// output:
// /**
//  * @type {DText[]}
//  */
// const summaryDTexts = [
//     { w: "章本總覽", isTitle1: 1 ,
//         childrenlist: [
//             { 
//                 marker: "●",
//                 children: [
//                     { w: "1-2" , isRef: 1, refDescription: "創1:1-2" },
//                     { w: "God creates heaven and earth;"},
//                 ]
//             },
//             {
//                 marker: "●",
//                 children: [
//                     { w: "3-5" , isRef: 1, refDescription: "創1:3-5" },
//                     { w: "the light;"},
//                 ]
//             }
//         ]
//     }
// ]

/**
 * @param {TskBlock} block 
 * @returns {DText[]}
 */
function cvt_dtexts_from_summary_block(block) {
    // TODO:
}

// --- 本節相關 Case 1 ---

// input: (來自 創2:12 ... 手動變型)
//   const input = 
//   [
//     {
//         "type": "note",
//         "keyword": null,
//         "items": 
//         [
//             {
//                 "type": "text",
//                 "w": "Bdellium is a transparent aromatic gum. The onyx is a precious stone, so called from a Greek word signifying a man's nail, to the colour of which it nearly approaches. See defintion 02053. in Sec. 15."
//             }, 
//             {
//                 "type": "add-in-text",
//                 "item": 
//                 [
//                     {
//                         "type": "sn",
//                         "tp": "H",
//                         "sn": "2053"
//                     },
//                     {
//                         "type": "sn",
//                         "tp": "G",
//                         "sn": "2053"
//                     },
//                     { 
//                         "type": "ref",
//                         "w": "Sec. 15",
//                         "ref": "創1:15"
//                     }
//                 ]
//             }
//         ]
//     },
//     {
//         "type": "refOnly",
//         "keyword": null,
//         "items": 
//         [
//             {
//             "type": "ref",
//             "w": "# 民 11:7|",
//             "ref": "# 民 11:7|"
//             }
//         ]
//     }
// ]

// /**
//  * @type {DText[]}
//  */
// const thisSectionDTexts = [
//     { w: "本節相關", isTitle1: 1 },
//     { isBr: 1 },
//     { w: "Bdellium is a transparent aromatic gum. The onyx is a precious stone, so called from a Greek word signifying a man's nail, to the colour of which it nearly approaches."},
//     { isBr: 1 },
//     { 
//         children: 
//         [
//             { w: "文中特殊字眼:"},
//             { w: "H2053", tp: "H", sn: "2053" },
//             { w: "、"},
//             { w: "G2053", tp: "G", sn: "2053" },
//             { w: "、"},
//             { w: "Sec. 15", isRef: 1, refDescription: "創1:15" },
//         ]
//     },
//     { isBr: 1 },
//     { w: "# 民 11:7|", isRef: 1, refDescription: "民 11:7" },
// ]

// --- 本節相關 Case2 ---

// const jaInput =
//     [
//         {
//             "type": "refOnly",
//             "keyword": null,
//             "items": [
//                 {
//                     "type": "ref",
//                     "w": "# 28; 8:17; 9:1; 30:27,30; 35:11; 利 26:9; 伯 40:15; 42:12; 詩 107:31,38; 128:3; 144:13,14; 箴 10:22|",
//                     "ref": "# 創 1:28; 8:17; 9:1; 30:27,30; 35:11; 利 26:9; 伯 40:15; 42:12; 詩 107:31,38; 128:3; 144:13,14; 箴 10:22|"
//                 }
//             ]
//         }
//     ]

// /** @type {DText[]} */
// const thisSectionDTexts2 = 
// [
//     { w: "本節相關", isTitle1: 1 },
//     { isBr: 1 },
//     { w: "# 28; 8:17; 9:1; 30:27,30; 35:11; 利 26:9; 伯 40:15; 42:12; 詩 107:31,38; 128:3; 144:13,14; 箴 10:22|", isRef: 1, refDescription: "創 1:28; 8:17; 9:1; 30:27,30; 35:11; 利 26:9; 伯 40:15; 42:12; 詩 107:31,38; 128:3; 144:13,14; 箴 10:22|" },
// ]

// --- 本節相關 Case3 ---

// input: (來自 創2:12 ... 手動變型)
// const input =
//     [
//         {
//             "type": "note",
//             "keyword": null,
//             "items":
//                 [
//                     {
//                         "type": "text",
//                         "w": "Bdellium is a transparent aromatic gum. The onyx is a precious stone, so called from a Greek word signifying a man's nail, to the colour of which it nearly approaches."
//                     },
//                 ]
//         }
//     ]

// /**
//  * @type {DText[]}
//  */
// const thisSectionDTexts = [
//     { w: "本節相關", isTitle1: 1 },
//     { isBr: 1 },
//     { w: "Bdellium is a transparent aromatic gum. The onyx is a precious stone, so called from a Greek word signifying a man's nail, to the colour of which it nearly approaches." },
// ]

/**
 * @param {TskBlock[]} blocks 
 * @returns {DText[]}
 */
function cvt_dtexts_from_section_related_blocks(blocks) {
    // 通常會是 note 與 refOnly 兩種 type。有時只會出現一種，有時兩種都有，有時兩種都沒有。
    // TODO:

}

// --- 關鍵字相關 Case 1 ---

// const input =
//     [
//         [
//             {
//                 "type": "keyword",
//                 "keyword": "God.",
//                 "items": [
//                     {
//                         "type": "ref",
//                         "w": "# 詩 33:6,9; 148:5; 太 8:3; 約 11:43|",
//                         "ref": "# 詩 33:6,9; 148:5; 太 8:3; 約 11:43|"
//                     }
//                 ]
//             },
//             {
//                 "type": "keyword",
//                 "keyword": "Let.",
//                 "items": [
//                     {
//                         "type": "ref",
//                         "w": "# 伯 36:30; 38:19; 詩 97:11; 104:2; 118:27; 賽 45:7; 60:19; 約 1:5,9; 3:19; 林後 4:6; 弗 5:8,14; 提前 6:16; 約一 1:5; 2:8|",
//                         "ref": "# 伯 36:30; 38:19; 詩 97:11; 104:2; 118:27; 賽 45:7; 60:19; 約 1:5,9; 3:19; 林後 4:6; 弗 5:8,14; 提前 6:16; 約一 1:5; 2:8|"
//                     }
//                 ]
//             }
//         ]
//     ]

// /** @type {DText[]} */
// const keywordsDTexts =
//     [
//         { w: "God.", isTitle1: 1 },
//         { isBr: 1 },
//         { w: "# 詩 33:6,9; 148:5; 太 8:3; 約 11:43|", isRef: 1, refDescription: "詩 33:6,9; 148:5; 太 8:3; 約 11:43|" },
//         { isBr: 1 },
//         { w: "Let.", isTitle1: 1 },
//         { isBr: 1 },
//         { w: "# 伯 36:30; 38:19; 詩 97:11; 104:2; 118:27; 賽 45:7; 60:19; 約 1:5,9; 3:19; 林後 4:6; 弗 5:8,14; 提前 6:16; 約一 1:5; 2:8|", isRef: 1, refDescription: "伯 36:30; 38:19; 詩 97:11; 104:2; 118:27; 賽 45:7; 60:19; 約 1:5,9; 3:19; 林後 4:6; 弗 5:8,14; 提前 6:16; 約一 1:5; 2:8|" },
//     ]

// --- 關鍵字相關 Case 2 ---

// const input =
//     [
//         [
//             {
//                 "type": "keyword",
//                 "keyword": "Day, and.",
//                 "items": [
//                     {
//                         "type": "ref",
//                         "w": "# 8:22; 詩 19:2; 74:16; 104:20; 賽 45:7; 耶 33:20; 林前 3:13; 弗 5:13; 帖前 5:5|",
//                         "ref": "# 創 8:22; 詩 19:2; 74:16; 104:20; 賽 45:7; 耶 33:20; 林前 3:13; 弗 5:13; 帖前 5:5|"
//                     }
//                 ]
//             },
//             {
//                 "type": "keyword",
//                 "keyword": "And the evening and the morning were",
//                 "items": [
//                     {
//                         "type": "text",
//                         "w": "Heb. And the evening was, and the morning was."
//                     },
//                     {
//                         "type": "ref",
//                         "w": "# 8,13,19,23,31|",
//                         "ref": "# 創 1:8,13,19,23,31|"
//                     }
//                 ]
//             }
//         ]
//     ]

// /** @type {DText[]} */
// const keywordsDTexts =
//     [
//         { w: "Day, and.", isTitle1: 1 },
//         { isBr: 1 },
//         { w: "# 8:22; 詩 19:2; 74:16; 104:20; 賽 45:7; 耶 33:20; 林前 3:13; 弗 5:13; 帖前 5:5|", isRef: 1, refDescription: "創 8:22; 詩 19:2; 74:16; 104:20; 賽 45:7; 耶 33:20; 林前 3:13; 弗 5:13; 帖前 5:5|" },
//         { isBr: 1 },
//         { w: "And the evening and the morning were", isTitle1: 1 },
//         { isBr: 1 },
//         { w: "Heb. And the evening was, and the morning was." },
//         { isBr: 1 },
//         { w: "# 8,13,19,23,31|", isRef: 1, refDescription: "創 1:8,13,19,23,31|" },
//     ]

// --- 關鍵字相關 Case 3 ---

// const intput =
//     [
//         [
//             {
//                 "type": "keyword",
//                 "keyword": "he made the stars also.",
//                 "items": [
//                     {
//                         "type": "text",
//                         "w": "Or, with the stars also."
//                     }
//                 ]
//             }
//         ]
//     ]

// const keywordsDTexts = 
// [
//     { w: "he made the stars also.", isTitle1: 1 },
//     { isBr: 1 },
//     { w: "Or, with the stars also." },
// ]

// --- 關鍵字相關 Case 4 ---

// const input =
//     [
//         [
//             {
//                 "type": "keyword",
//                 "keyword": "And on.",
//                 "items": [
//                     {
//                         "type": "ref",
//                         "w": "# 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4|",
//                         "ref": "# 創 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4|"
//                     }
//                 ]
//             },
//             {
//                 "type": "keyword",
//                 "keyword": "seventh day God.",
//                 "items": [
//                     {
//                         "type": "text",
//                         "w": "The LXX., Syriac, and the Samaritan Text read the sixth day, which is probably the true reading; as [vav <"
//                     },
//                     {
//                         "type": "text-fb",
//                         "w": "See definition 02053"
//                     },
//                     {
//                         "type": "text",
//                         "w": ">,] which stands for six, might easily be changed into [zayin,] which denotes seven."
//                     },
//                     {
//                         "type": "add-in-text",
//                         "item": [
//                             {
//                                 "type": "sn",
//                                 "tp": "H",
//                                 "sn": "2053"
//                             },
//                             {
//                                 "type": "sn",
//                                 "tp": "G",
//                                 "sn": "2053"
//                             }
//                         ]
//                     }
//                 ]
//             },
//             {
//                 "type": "keyword",
//                 "keyword": "rested.",
//                 "items": [
//                     {
//                         "type": "text",
//                         "w": "Or, rather, ceased, as the Hebrew word is not opposed to weariness, but to action; as the Divine Being can neither know fatigue, nor stand in need of rest."
//                     }
//                 ]
//             }
//         ]
//     ]

//     /** @type {DText[]} */
// const keywordsDTexts =
// [
//     { w: "And on.", isTitle1: 1 },
//     { isBr: 1 },
//     { w: "# 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4|", isRef: 1, refDescription: "創 1:31; 出 20:11; 23:12; 31:17; 申 5:14; 賽 58:13; 約 5:17; 來 4:4|" },
//     { isBr: 1 },
//     { w: "seventh day God.", isTitle1: 1 },
//     { isBr: 1 },
//     { w: "The LXX., Syriac, and the Samaritan Text read the sixth day, which is probably the true reading; as [vav <" }, {w: "See definition 02053", isBold: 1  }, { w: ">,] which stands for six, might easily be changed into [zayin,] which denotes seven." },
//     { isBr: 1 },
//     {
//         children: 
//         [
//             { w: "文中特殊字眼:"},
//             { w: "H2053", tp: "H", sn: "2053" },
//             { w: "、"},
//             { w: "G2053", tp: "G", sn: "2053" }
//         ]
//     },
//     { isBr: 1 },
//     { w: "rested.", isTitle1: 1 },
//     { isBr: 1 },
//     { w: "Or, rather, ceased, as the Hebrew word is not opposed to weariness, but to action; as the Divine Being can neither know fatigue, nor stand in need of rest." },
// ]

/**
 * 
 * @param {TskBlock[]} blocks 
 * @returns {DText[]}
 */
function cvt_dtexts_from_keywords_blocks(blocks) {
    // TODO:

}

// --- 整體流程 ---
// - parseTsk 的 output 是 block array。
// - input 除了 block array, 還會有 address 資訊，表示目前是哪一章節 [book, chap, sec]
// - `summary 一定是一個 block ，若存在的話，通常是第 1 個
// - `section related` 可能會有 note 與 refOnly 兩種 type 的 block，兩種 type 的 block 都可能存在，也可能都不存在。
// - `keyword` 可能會有多個，每個 keyword 都是一個 block，且每個 block 的 items 都是 ref 類型的 item。
// - 以上三種 block 的處理，會分別寫成三個 function，最後在一個總 function 中呼叫這三個 function，將結果合併成一個 DText[] 回傳。
// - 然後這 3 大區塊，再用 hr 隔開, Dtext 有 { ishr: 1}

/**
 * 
 * @param {TskBlock[]} blocks 
 * @param {DAddress=} address 
 * @returns {DText[]}
 */
export function cvt_tsk_blocks_to_dtexts(blocks, address) {
    // TODO:
}