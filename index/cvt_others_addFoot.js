/**
 * @typedef { import("../index/DText.js").DText } DText
 * @typedef {import('./../index/AddParenthesesUnvNcv.js').DTextsWithAddr} DTextsWithAddr
 */

import { splitStringByRegex } from "../index/splitStringByRegex.es2023.js";


/**
 * runAddFoot emulates the behavior of the addFoot inner function in cvt_others.
 * Input: it1: { children: DText[], addresses: { verses: [ { book, chap, verse } ] } }, ver: string
 * Returns: modified { children, addresses, ver } (same shape as original addFoot return)
 */

/**
 * 遇到 【 32 】將其拆成獨立的 DText 元素，並加上 foot 屬性
 * @param {DTextsWithAddr} dtexts_with_addr 
 * @param {string} ver string
 * @returns {DTextsWithAddr}
 */
export function runAddFoot(dtexts_with_addr, ver) {
    const addr = { book: dtexts_with_addr[0], chap: dtexts_with_addr[1], verse: dtexts_with_addr[2] };
    const dtexts = dtexts_with_addr[3];

    // clone input to avoid mutating original test fixtures
    const it = structuredClone(dtexts);

    let isChanged = false;
    const re = [];
    for (const it2 of it) {
        const re2 = doText(it2);
        if (re2.length === 1) {
            re.push(re2[0]);
        }
        else {
            if (isChanged === false) isChanged = true;
            for (const it3 of re2) re.push(it3);
        }
    }
    if (isChanged) {
        dtexts_with_addr[3] = re;
    }
    return it;

    /**
     * doText implementation (mirrors original)
     * @param {DText} it2 
     * @returns {DText[]}
     */
    function doText(it2) {
        if (it2.w === undefined) {
            return [it2];
        }

        const reLocal = [];
        // split by fullwidth brackets like 【n】
        const r3 = splitStringByRegex(it2.w, /【(\d+)】/g);
        if (r3 == null) {
            reLocal.push(it2);
        } else if (r3.length == 1) {
            reLocal.push(it2);
        } else {
            // there will be multiple pieces
            for (const it3 of r3) {
                // deep copy original it2 for properties carryover
                const r4 = structuredClone(it2);
                r4.w = it3.w;
                if (it3.exec != null) {
                    // exec[1] is the captured number
                    r4.foot = {
                        id: parseInt(it3.exec[1], 10),
                        version: ver,
                        book: addr.book,
                        chap: addr.chap,
                        verse: addr.verse,
                    };
                }
                reLocal.push(r4);
            }
        }
        return reLocal;
    }
}