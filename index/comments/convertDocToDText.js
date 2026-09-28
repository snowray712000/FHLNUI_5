/**
 * @typedef {import('./TpComments.js').DocNode} DocNode
 * @typedef {import('./TpComments.js').DAddress} DAddress
 * @typedef {import('./TpComments.js').DText} DText
*/

import { splitStringByRegex } from './../splitStringByRegex.es2023.js'
import { BibleConstant } from './../BibleConstant.es2023.js'

/** 書卷縮寫 (繁、簡)，長的在前，例 林前 要比 林 先試 */
const BOOKS = [...new Set([...BibleConstant.CHINESE_BOOK_ABBREVIATIONS, ...BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB])]
    .sort((a, b) => b.length - a.length).join('|')
/** 一個參照：可有書卷，章:節 或 節，後面可接 -12、,5、:3 */
const ONE_REF = `(?:(?:${BOOKS})\\s*)?\\d+(?:\\s*:\\s*\\d+)?(?:\\s*[-,]\\s*\\d+(?:\\s*:\\s*\\d+)?)*`

/**
 * 註釋中的交互參照，形如 `#太 7:14-20|`、`#6|`
 * - 第 1 組：正常的，# 開頭 | 結尾；也接受全形 ＃ (路24:50、太6:5)、全形 ｜ (創19:1)
 *   - 中間不跨過 #：資料偶有 # 後漏了 | (創7:6 `#7:21都`)，以前會一路吞到下一個 |，把後面真正的參照也吃掉
 * - 第 2 組：資料漏了 #，只有 | 結尾，例 徒20:7 `「講論」徒 20:7|`、帖前2:5 `;徒 18:3;20:34|`。
 *   要看起來像經文位置 (至少有一個 章:節，多個用 ; 分隔) 才算，避免誤判
 * - 全部註釋 (信望愛公開的 bible_comm.zip) 漏 # 或用全形 ＃ 的共 10 處 (2026-09 查)
 */
export const REGEX_COMMENT_REF = new RegExp(`[#＃]([^|｜#＃]+)[|｜]|((?=[^|｜]*:)${ONE_REF}(?:\\s*;\\s*${ONE_REF})*)[|｜]`, 'g')

/**
 * @param {DocNode[]} docNode 
 * @param {DAddress} address 在交互參照分析時，會用到。例如「1:3」你不會知道是哪本書。
 * @returns {DText[]}
 */
export function convertDocToDText(docNode, address) {
    const nodes = Array.isArray(docNode) ? docNode : [];

    return nodes.map(n => convertNode(n, address)).filter(Boolean);
}

function parseInline(text, address) {
    /** @type {DText[]} */
    let dtexts = [{ w: text }];

    // 先解析 SN，再解析 ref（避免 ref token 被 SN 解析）
    dtexts = parse_sn_in_Comment(dtexts);
    dtexts = parse_ref_in_Comment(dtexts, address);

    return dtexts;
}

function convertNode(node, address) {
    if (!node) return null;

    /** @type {DText} */
    const dt = {};

    // marker
    if (node.marker) dt.marker = node.marker;

    // type -> tp (lex)
    if (node.type === 'lex') dt.tp = 'lex';

    // table / joTable
    const joTable = node?.meta?.joTable || node?.meta?.table || node?.joTable;
    if (node.type === 'joTable' || joTable) {
        dt.joTable = convertJoTable(joTable, address);
    } else if (node.type === 'table') {
        if (node.w) dt.w = node.w;
    }

    // inline children from w
    if (node.w && !dt.joTable) {
        dt.children = parseInline(node.w, address);
    }

    // children list
    if (Array.isArray(node.children) && node.children.length > 0) {
        dt.childrenlist = node.children.map(c => convertNode(c, address)).filter(Boolean);
    }

    return dt;
}


function convertJoTable(joTable, address) {
    if (!joTable || !Number.isInteger(joTable.rows) || !Number.isInteger(joTable.cols)) {
        return joTable;
    }

    const cells = Array.isArray(joTable.cells) ? joTable.cells : [];
    const mappedCells = cells.map(cell => {
        if (!cell) return cell;

        if (Array.isArray(cell.content)) {
            return cell;
        }

        if (typeof cell.text === 'string') {
            return {
                ...cell,
                content: parseInline(cell.text, address)
            };
        }

        return cell;
    });

    return {
        rows: joTable.rows,
        cols: joTable.cols,
        cells: mappedCells
    };
}

/**
 * 
 * @param {DText[]} dtexts 
 * @returns {DText[]}
 */
function parse_sn_in_Comment(dtexts) {
    // 處理 SNH03588 、 SNG03588 的格式
    // - 動機: 小心，有可能會有 SN 是有尾碼 a 之類的
    const results = []
    for (const dtext of dtexts) {
        if (dtext.w == null) {
            results.push(dtext)
        } else {
            const reg1 = splitStringByRegex(dtext.w, /SN(G|H)\s*([0-9]+)(a?)/gi)
            if (reg1 == null) {
                results.push(dtext)
            } else {
                for (const reg1a of reg1) {
                    const dtext_clone = structuredClone(dtext)
                    if (reg1a.exec == null) {
                        dtext_clone.w = reg1a.w
                        results.push(dtext_clone)
                    } else {
                        // - 注意: 要將 SN 的前面的 0 先去掉，再結合若有尾碼
                        const tp = reg1a.exec[1] // G 或 H
                        const sn = `${parseInt(reg1a.exec[2])}${reg1a.exec[3] || ""}`
                        dtext_clone.w = `${tp}${sn}`
                        dtext_clone.sn = sn
                        dtext_clone.tp = tp
                        dtext_clone.tp2 = 'W' + tp // 有 tp2, 才不會被斷定成 .sn-text ... WG 或 WH
                        results.push(dtext_clone)
                    }
                }
            }
        }
    }

    // 若是連續的 .sn，則中間插入 {w: "、" }。
    for (let i = 1; i < results.length; i++) {
        if (results[i - 1].sn != null && results[i].sn != null) {
            results.splice(i, 0, { w: "、" })
            i++
        }
    }

    return results
}
/**
 * 
 * @param {DText[]} dtexts 
 * @param {DAddress} address
 * @returns {DText[]}
 */
function parse_ref_in_Comment(dtexts, address) {
    // - 動機: 詩篇 143 中有連續的 #6|#32|#38|#51|#102|#130|#143|，顯示黏在一起很醜。
    // - Case: #6| #1:32| #2:1-32| #太 7:14-20| ...

    const results = []
    for (const dtext of dtexts) {
        if (dtext.w == null) {
            results.push(dtext)
        } else {
            const reg1 = splitStringByRegex(dtext.w, REGEX_COMMENT_REF)
            if (reg1 == null) {
                results.push(dtext)
            } else {
                for (const reg1a of reg1) {
                    const dtext_clone = structuredClone(dtext)
                    if (reg1a.exec == null) {
                        dtext_clone.w = reg1a.w
                        results.push(dtext_clone)
                    } else {
                        const raw = (reg1a.exec[1] ?? reg1a.exec[2]).trim()
                        dtext_clone.w = raw
                        dtext_clone.isRef = 1
                        dtext_clone.refDescription = raw

                        const refAddress = resolveRefAddress(raw, address)
                        if (refAddress) {
                            dtext_clone.refAddress = refAddress
                        }

                        results.push(dtext_clone)
                    }
                }
            }
        }
    }

    // 若是連續的 .isRef，則中間插入 {w: "、" }。
    for (let i = 1; i < results.length; i++) {
        if (results[i - 1].isRef == 1 && results[i].isRef == 1) {
            results.splice(i, 0, { w: "、" })
            i++
        }
    }

    return results
}

/**
 * 解析沒有書卷的參照，使用 address 補預設值
 * - 非詩篇：#6| => 同書同章第 6 節
 * - 詩篇：#6| => 詩篇第 6 篇（chap=6, verse=0）
 * @param {string} refText
 * @param {DAddress} address
 * @returns {{book:number, chap:number, verse:number} | null}
 */
function resolveRefAddress(refText, address) {
    const addr = normalizeAddress(address)
    if (!addr || !addr.book) return null

    const t = String(refText ?? '').trim()
    if (!t) return null

    // 已包含書卷名稱/縮寫：交給外部處理（不在這裡推斷）
    if (/[A-Za-z\u4e00-\u9fa5]/.test(t) && !/^\d+(:\d+)?/.test(t)) {
        return null
    }

    // case: 單一數字（#6|）
    if (/^\d+$/.test(t)) {
        const num = parseInt(t, 10)
        if (addr.book === 19) { // 詩篇
            return { book: addr.book, chap: num, verse: 0 }
        }
        const chap = addr.chap || 0
        return { book: addr.book, chap, verse: num }
    }

    // case: 1:3 或 7:10-16（只抓第一節）
    const m = t.match(/^(\d+)\s*:\s*(\d+)/)
    if (m) {
        const chap = parseInt(m[1], 10)
        const verse = parseInt(m[2], 10)
        return { book: addr.book, chap, verse }
    }

    return null
}

/**
 * @param {DAddress} address
 * @returns {{book:number, chap:number, verse:number} | null}
 */
function normalizeAddress(address) {
    if (!address) return null
    if (Array.isArray(address)) {
        return {
            book: Number(address[0]) || 0,
            chap: Number(address[1]) || 0,
            verse: Number(address[2]) || 0,
        }
    }
    return {
        book: Number(address.book) || 0,
        chap: Number(address.chap) || 0,
        verse: Number(address.verse ?? address.sec) || 0,
    }
}