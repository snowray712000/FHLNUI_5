/**
 * @typedef {import('./../DText.js').DText} DText
 * @typedef {import('./../DText.js').DAddress} DAddress
 */

/**
 * add-in-text 內的子項目：SN
 * @typedef {Object} AddInSnItem
 * @property {"sn"} type
 * @property {"H"|"G"} tp
 * @property {string} sn
 */

/**
 * add-in-text 內的子項目：ref
 * @typedef {Object} AddInRefItem
 * @property {"ref"} type
 * @property {string} w
 * @property {string} ref
 */

/**
 * @typedef {AddInSnItem | AddInRefItem} AddInItem
 */

/**
 * 一般文字
 * @typedef {Object} TskTextItem
 * @property {"text" | "text-fb" | "orig" | "fb"} type
 * @property {string} w
 */

/**
 * 經文參照
 * @typedef {Object} TskRefItem
 * @property {"ref"} type
 * @property {string} w
 * @property {string=} ref
 */

/**
 * 在 ref 前動態插入的輔助資訊
 * @typedef {Object} TskAddInTextItem
 * @property {"add-in-text"} type
 * @property {AddInItem[]} item
 */

/**
 * summary 專用項目
 * @typedef {Object} TskSummaryItem
 * @property {"summaryItem"} type
 * @property {string} text
 * @property {string} ref
 * @property {string} w
 */

/**
 * 供 parseTsk 回傳 block.items 用
 * @typedef {TskTextItem | TskRefItem | TskAddInTextItem | TskSummaryItem} TskItem
 */

/**
 * 供 parseTsk 回傳用
 * @typedef {Object} TskBlock
 * @property {"summary" | "keyword" | "refOnly" | "note" | "empty"} type
 * @property {string|null} keyword
 * @property {TskItem[]} items
 * @property {string} raw
 */


export { }