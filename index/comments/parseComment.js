import { preprocessCaseToLines } from './preprocessCaseToLines.js';
import { detectTableBlocks } from './detectTableBlocks.js';
import { tokenizeLine } from './tokenizeLine.js';
import { buildTree } from './buildTree.js';
import { normalizeTree } from './normalizeTree.js';
import { replaceApiResult } from './replaceApiResult.js';


// import DocNode from TpComments.js
/**
 * @typedef {import('./TpComments.js').DocNode} DocNode
 */
/**
 * @typedef {import ('./TpComments.js').DText} DText
 * @typedef {import ('./TpComments.js').DAddress} DAddress
 */

/**
 * 解析一段評論文字，依序執行：
 * 1. preprocessCaseToLines：將文字斷成可識別的行並標記縮排/表格
 * 2. detectTableBlocks：判斷哪些區塊是表格
 * 3. tokenizeLine：將每個區塊轉成 token
 * 4. buildTree：以 token 建立語意樹狀結構
 * 5. normalizeTree：將語意樹轉為帶有唯一 id、type、marker 與 metadata（如表格）的 DocNode 陣列
 *
 * @param {string} comment_text - 原始評論文字
 * @param {DAddress} address - 評論所對應的聖經地址（如 {book, chap, verse}），用於解析過程中處理交互參照等情況
 * @returns {DocNode[]} 解析後的 DocNode 樹陣列，每個節點含 id、文字、類型、marker（若有）和必要的 metadata
 */
export function parseComment(comment_text, address) {
    // if address is {book,chap,verse} to [book,chap,verse]
    if (Array.isArray(address)) {
    } else {
        address = [address.book, address.chap, address.verse];
    }

    comment_text = comment_text.replaceAll(/\r?\n\r?/g, '\n')

    const comment_text2 = replaceApiResult(comment_text, address);

    // Phase 1
    const lines =
        preprocessCaseToLines(comment_text2);

    // Phase 2
    const blocks =
        detectTableBlocks(lines);

    // Phase 3
    const tokens = blocks.flatMap(tokenizeLine);

    // Phase 4
    const tree =
        buildTree(tokens);

    // Phase 5
    const semantic =
        normalizeTree(tree);

    // console.warn("preprocessCaseToLines Result:\n");
    // console.log(JSON.stringify(lines, null, 2));
    // console.warn("detectTableBlocks Result:\n");
    // console.log(JSON.stringify(blocks, null, 2));
    // console.warn("tokenizeLine Result:\n");
    // console.log(JSON.stringify(tokens, null, 2));
    // console.warn("buildTree Result:\n");
    // console.log(JSON.stringify(tree, null, 2));
    // console.warn("normalizeTree Result:\n");
    // console.log(JSON.stringify(semantic, null, 2));

    return semantic;
}

