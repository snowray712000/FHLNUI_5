// @ts-check

/**
 * @typedef {import('./../DText.js').DText} DText
 * @typedef {import('./../DText.js').DAddress} DAddress
 * @typedef {import('./TpTsks.js').TskBlock} TskBlock
 */

// 可使用 BibleConstant.ENGLISH_BOOK_SHORT_ABBREVIATIONS ，判斷 Tsk 的書卷名稱縮寫
import { BibleConstant } from "./../BibleConstant.es2023.js"

/**
 * 將參照字串中僅有「節」的片段補上目前章（例如 11 -> 9:11）
 * @param {string} body
 * @param {DAddress=} address
 * @returns {string}
 */
function normalize_ref_body_with_current_chapter(body, address) {
    const chap = Array.isArray(address) ? Number(address[1]) : NaN;
    if (!Number.isFinite(chap)) return String(body || "").trim();

    const parts = String(body || "").trim().split(";").map(s => String(s || "").trim());
    const normalized = parts.map(p => {
        if (/^\d+(?:[-,]\d+)*$/.test(p)) {
            return `${chap}:${p}`;
        }
        return p;
    });

    return normalized.join("; ");
}

/**
 * @param {string} raw
 * @param {DAddress=} address
 * @param {{ prependBookAbbr?: boolean }=} opts
 * @returns {string}
 */
function normalize_ref_description(raw, address, opts) {
    const txt = String(raw || "").trim();
    const m = txt.match(/^#\s*(.*?)\|$/);
    if (!m) return txt;

    const body = String(m[1] || "").trim();
    const normalizedBody = normalize_ref_body_with_current_chapter(body, address);
    const prependBookAbbr = opts?.prependBookAbbr !== false;
    if (!prependBookAbbr) return normalizedBody;

    const book = Array.isArray(address) ? Number(address[0]) : NaN;
    const abbr = Number.isFinite(book)
        ? BibleConstant.ENGLISH_BOOK_SHORT_ABBREVIATIONS?.[book-1]
        : undefined;

    return abbr ? `${abbr} ${normalizedBody}` : normalizedBody;
}

/**
 * @param {any[]} addInItems
 * @param {DAddress=} address
 * @param {{ prependBookAbbr?: boolean }=} opts
 * @returns {DText | null}
 */
function cvt_add_in_text(addInItems, address, opts) {
    if (!Array.isArray(addInItems) || addInItems.length === 0) return null;

    /** @type {DText[]} */
    const children = [{ w: "文中特殊字眼:" }];

    let first = true;
    for (const it of addInItems) {
        if (!it) continue;

        if (!first) children.push({ w: "、" });
        first = false;

        if (it.type === "sn") {
            const tp2 = it.tp === "H" ? "WH" : "WG";
            children.push({
                w: `${it.tp}${it.sn}`,
                tp: it.tp,
                sn: String(it.sn),
                tp2: tp2
            });
        } else if (it.type === "ref") {
            children.push({
                w: String(it.w || ""),
                isRef: 1,
                refDescription: normalize_ref_description((it.ref || it.w), address, opts)
            });
        } else {
            // fallback
            children.push({ w: String(it.w || "") });
        }
    }

    if (children.length <= 1) return null;
    return { children };
}

/**
 * @param {any} item
 * @param {DAddress=} address
 * @param {{ prependBookAbbr?: boolean }=} opts
 * @returns {DText | null}
 */
function cvt_normal_item(item, address, opts) {
    if (!item) return null;

    if (item.type === "text") {
        return { w: String(item.w || "") };
    }
    if (item.type === "text-fb") {
        return { w: String(item.w || ""), isBold: 1 };
    }
    if (item.type === "ref") {
        return {
            w: String(item.w || ""),
            isRef: 1,
            refDescription: normalize_ref_description((item.ref || item.w), address, opts)
        };
    }

    return null;
}

/**
 * summary block -> DText[]
 * @param {TskBlock} block
 * @returns {DText[]}
 */
function cvt_dtexts_from_summary_block(block) {
    if (!block || block.type !== "summary" || !Array.isArray(block.items)) return [];

    /** @type {DText[]} */
    const childrenlist = [];

    for (const it of block.items) {
        if (!it || it.type !== "summaryItem") continue;

        childrenlist.push({
            marker: "●",
            children: [
                { w: String(it.w || ""), isRef: 1, refDescription: (it.ref || it.w) },
                { w: String(it.text || "") }
            ]
        });
    }

    if (childrenlist.length === 0) return [];
    return [{ w: "本章總覽", isTitle1: 1, childrenlist }];
}

/**
 * 本節相關 blocks -> DText[]
 * @param {TskBlock[]} blocks
 * @param {DAddress=} address
 * @returns {DText[]}
 */
function cvt_dtexts_from_section_related_blocks(blocks, address) {
    if (!Array.isArray(blocks) || blocks.length === 0) return [];

    /** @type {DText[]} */
    const out = [];
    out.push({ w: "本節相關", isTitle1: 1 });
    out.push({ isBr: 1 });

    let hasAnyBody = false;

    for (const block of blocks) {
        if (!block || !Array.isArray(block.items)) continue;
        if (block.type !== "note" && block.type !== "refOnly") continue;

        for (let i = 0; i < block.items.length; i++) {
            const item = block.items[i];
            if (!item) continue;

            if (item.type === "add-in-text") {
                // add-in-text 之前換行（若前面已有內容且不是換行）
                if (hasAnyBody && out[out.length - 1]?.isBr !== 1) {
                    out.push({ isBr: 1 });
                }

                const addInNode = cvt_add_in_text(item.item, address);
                if (addInNode) {
                    out.push(addInNode);
                    hasAnyBody = true;

                    // add-in-text 後若還有後續項目，補換行
                    const hasMore = block.items.slice(i + 1).some(x => !!x);
                    if (hasMore) out.push({ isBr: 1 });
                }
                continue;
            }

            const node = cvt_normal_item(item, address);
            if (!node) continue;

            // 一般節點直接接續；若前一個是 add-in-text，會由上方規則插入 br
            out.push(node);
            hasAnyBody = true;
        }

        // block 與 block 之間換行（若下一個區塊仍有可輸出內容）
        const idx = blocks.indexOf(block);
        const hasNextUseful = blocks.slice(idx + 1).some(b =>
            b &&
            (b.type === "note" || b.type === "refOnly") &&
            Array.isArray(b.items) &&
            b.items.length > 0
        );

        if (hasNextUseful && hasAnyBody && out[out.length - 1]?.isBr !== 1) {
            out.push({ isBr: 1 });
        }
    }

    // 若 title 後完全沒有內容，回空
    if (!hasAnyBody) return [];
    return out;
}

/**
 * 關鍵字 blocks -> DText[]
 * @param {TskBlock[]} blocks
 * @param {DAddress=} address
 * @returns {DText[]}
 */
function cvt_dtexts_from_keywords_blocks(blocks, address) {
    if (!Array.isArray(blocks) || blocks.length === 0) return [];

    /** @type {DText[]} */
    const out = [];

    const usefulBlocks = blocks.filter(b => b && b.type === "keyword");
    for (let bi = 0; bi < usefulBlocks.length; bi++) {
        const block = usefulBlocks[bi];
        if (!block) continue;

        out.push({ w: String(block.keyword || ""), isTitle1: 1 });
        out.push({ isBr: 1 });

        const items = Array.isArray(block.items) ? block.items : [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) continue;

            if (item.type === "add-in-text") {
                if (out[out.length - 1]?.isBr !== 1) out.push({ isBr: 1 });

                const addInNode = cvt_add_in_text(item.item, address, { prependBookAbbr: false });
                if (addInNode) out.push(addInNode);

                const hasMore = items.slice(i + 1).some(x => !!x);
                if (hasMore) out.push({ isBr: 1 });
                continue;
            }

            if (item.type === "ref" && out[out.length - 1]?.isBr !== 1) {
                out.push({ isBr: 1 });
            }

            const node = cvt_normal_item(item, address, { prependBookAbbr: false });
            if (node) out.push(node);

            if (item.type === "ref") {
                const hasMore = items.slice(i + 1).some(x => !!x);
                if (hasMore && out[out.length - 1]?.isBr !== 1) {
                    out.push({ isBr: 1 });
                }
            }
        }

        if (bi < usefulBlocks.length - 1) {
            if (out[out.length - 1]?.isBr !== 1) out.push({ isBr: 1 });
        }
    }

    return out;
}

/**
 * parseTsk 的 block array -> DText[]
 * @param {TskBlock[]} blocks
 * @param {DAddress=} address
 * @returns {DText[]}
 */
export function cvt_tsk_blocks_to_dtexts(blocks, address) {
    if (!Array.isArray(blocks) || blocks.length === 0) return [{ w: "(本節無資料)" }];

    const summaryBlock = blocks.find(b => b?.type === "summary");
    const sectionBlocks = blocks.filter(b => b && (b.type === "note" || b.type === "refOnly"));
    const keywordBlocks = blocks.filter(b => b?.type === "keyword");

    const partSummary = summaryBlock ? cvt_dtexts_from_summary_block(summaryBlock) : [];
    const partSection = cvt_dtexts_from_section_related_blocks(sectionBlocks, address);
    const partKeywords = cvt_dtexts_from_keywords_blocks(keywordBlocks, address);

    const parts = [partSummary, partSection, partKeywords].filter(p => Array.isArray(p) && p.length > 0);

    /** @type {DText[]} */
    const out = [];
    parts.forEach((p, i) => {
        if (i > 0) out.push({ isHr: 1 });
        out.push(...p);
    });

    return out.length > 0 ? out : [{ w: "(本節無資料)" }];
}