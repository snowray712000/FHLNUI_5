// ...existing code...
/**
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").TpOneRecordBibleText} TpOneRecordBibleText
 * @typedef {[number, number, number, import("./DText.js").DText[]]} DTextsWithAddr
 * @typedef {import("./grouping_by_paragraph.js").GroupedParagraph} GroupedParagraph
 */
import { grouping_by_paragraph } from "./grouping_by_paragraph.js";

/**
 * 本來 grouping 就支援，因為 toHash 寫的很好。舊的、新的都支援。
 * @param {DTextsWithAddr[]} dtexts_with_addr 
 * @param {Array<number|string>} paragraphData
 * @returns {GroupedParagraph[]}
 */
export function grouping_by_paragraph_for_dtexts_with_addr(dtexts_with_addr, paragraphData) {
    if (!Array.isArray(dtexts_with_addr) || dtexts_with_addr.length === 0) {
        return [];
    }
    return grouping_by_paragraph(dtexts_with_addr, paragraphData);
}
// ...existing code...