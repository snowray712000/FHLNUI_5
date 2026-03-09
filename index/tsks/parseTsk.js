
import { splitStringByRegex } from './../../index/splitStringByRegex.es2023.js'
import { BibleConstantHelper } from "./../BibleConstantHelper.es2023.js";

/**
 * @typedef {import('./TpTsks.js').TskBlock} TskBlock
 * @typedef {import('./TpTsks.js').TskItem} TskItem
 * @typedef {import('./TpTsks.js').TskSummaryItem} TskSummaryItem
 * @typedef {import('./TpTsks.js').AddInItem} AddInItem
 * @typedef {import('./TpTsks.js').DAddress} DAddress
 */

/**
 * @param {string} tsk_content
 * @param {DAddress=} address
 * @return {TskBlock[]}
 * @description 將串珠內容解析成 TskBlock 陣列，供前端渲染使用
 */
export function parseTsk(tsk_content, address) {
    if (typeof tsk_content !== "string") return [];

    if (Array.isArray(address)) {
        address = {book: address[0], chap: address[1], sec: address[2]};
    } else if ( address?.verse != null && address?.sec == null){
        address.sec = address.verse;
    }

    const normalized = tsk_content.replace(/\r\n/g, "\n");
    const rawBlocks = normalized.split(/\n\n+/).map(s => s.trim()).filter(Boolean);

    const expandedBlocks = rawBlocks.flatMap(raw => splitKeywordBlocks(raw));

    const blocks = expandedBlocks.map((raw, idx) => {
        const block = {
            type: "note",
            keyword: null,
            items: [],
            raw
        };

        const rawNoSpace = raw.replace(/\s+/g, " ").trim();

        // empty（僅當 #n| 且 n === address.sec）
        const mEmpty = /^#\s*(\d+)\s*\|$/.exec(rawNoSpace);
        if (mEmpty) {
            const sec = parseInt(mEmpty[1], 10);
            if (address && typeof address.sec === "number" && address.sec === sec) {
                block.type = "empty";
                block.items = [];
                return block;
            } else {
                block.type = "refOnly";
                block.items = parseInline(raw, address);
                normalizeTextItems(block.items);
                return block;
            }
        }

        if (idx === 0 && /^\s*\d+\s*;/.test(raw)) {
            block.type = "summary";
            block.items = parseInline(raw, address);
            return block;
        }

        if (/^\*\s+/.test(raw)) {
            block.type = "keyword";
            const afterStar = raw.replace(/^\*\s+/, "");
            const { keyword, rest } = splitKeywordAndRest(afterStar);
            block.keyword = keyword;
            block.items = rest ? parseInline(rest, address) : [];
            normalizeTextItems(block.items);
            return block;
        }

        if (/#\s*[^|]*\|/.test(raw) && !/^\*\s+/.test(raw)) {
            block.type = "refOnly";
            block.items = parseInline(raw, address);
            normalizeTextItems(block.items);
            return block;
        }

        block.type = "note";
        block.items = parseInline(raw, address);
        normalizeTextItems(block.items);
        return block;
    });

    const withSummary = postProcessSummaryBlocks(blocks, address);
    return injectAddInTextItems(withSummary, address);
}
/**
 * 將同一段中多個 * keyword 分拆成多段
 * @param {string} raw
 * @returns {string[]}
 */
function splitKeywordBlocks(raw) {
    const lines = raw.split(/\n/);
    let current = [];
    const blocks = [];

    const isKeywordLine = (line) => /^\s*\*\s+/.test(line);

    for (const line of lines) {
        if (isKeywordLine(line)) {
            if (current.length > 0) {
                blocks.push(current.join("\n").trim());
                current = [];
            }
        }
        current.push(line);
    }

    if (current.length > 0) {
        blocks.push(current.join("\n").trim());
    }

    return blocks.length > 0 ? blocks : [raw];
}
/**
 * 將段落內文拆成 inline items
 * - ref: #...|
 * - text-fb: <FB>...</Fb>（粗體標記，輸出純文字內容）
 * - text: 其他（包含 []）
 * 同一 block 內多段 ref 會合併成單一 ref item
 * @param {string} text
 * @param {DAddress=} address
 * @returns {TskItem[]}
 */
function parseInline(text, address) {
    /** @type {TskItem[]} */
    const items = [];

    // 只辨識 ref 與 FB；[] 一律視為普通文字
    const regex = /(#\s*[^|]*\|)|(<FB>[\s\S]*?<Fb>)/g;
    const parts = splitStringByRegex(text, regex);

    if (!parts) {
        return text && text.trim() !== "" ? [{ type: "text", w: text }] : [];
    }

    for (const p of parts) {
        const w = p.w;
        if (!w || w.trim() === "") continue;

        if (p.exec) {
            const token = p.exec[0];
            if (token.startsWith("#")) {
                const prev = items[items.length - 1];
                if (prev && prev.type === "ref") {
                    prev.w = (prev.w + " " + token).replace(/\s+/g, " ").trim();
                } else {
                    items.push({ type: "ref", w: token });
                }
            } else if (token.startsWith("<FB>")) {
                // <FB>...</Fb> -> text-fb（僅保留內容）
                const fbText = token
                    .replace(/^<FB>/i, "")
                    .replace(/<Fb>$/i, "")
                    .trim();
                if (fbText) {
                    items.push({ type: "text-fb", w: fbText });
                }
            } else {
                items.push({ type: "text", w: token });
            }
        } else {
            items.push({ type: "text", w });
        }
    }

    const merged = mergeAdjacentRefs(items);
    return addRefProp(merged, address);
}

/**
 * 合併相鄰的 ref items
 * - 若合併的還是同卷書，會拿掉書卷名
 * - 合併時，會拿掉「\n # 」等多餘空白與符號，並以 ; 分隔
 * @param {TskItem[]} items
 * @returns {TskItem[]}
 */
function mergeAdjacentRefs(items) {
    /** @type {TskItem[]} */
    const merged = [];

    const splitClauses = (s) =>
        String(s)
            .split(/\s*;\s*/g)
            .map(x => x.trim())
            .filter(Boolean);

    const extractRefContents = (w) => {
        const res = [];
        const re = /#\s*([^|]*?)\s*\|/g;
        let m;
        while ((m = re.exec(w))) {
            const seg = (m[1] || "").trim();
            if (seg) res.push(...splitClauses(seg));
        }
        if (res.length === 0) {
            const cleaned = String(w).replace(/^\s*#\s*/, "").replace(/\s*\|\s*$/, "").trim();
            if (cleaned) res.push(...splitClauses(cleaned));
        }
        return res;
    };

    const normalizeBook = (s) => s.replace(/\s+/g, "").replace(/\./g, "").toLowerCase();

    // 同卷書連續出現時，省略後面的書名（例：Ps 33:6,9; Ps 104:2 -> Ps 33:6,9; 104:2）
    const compactSameBook = (clauses) => {
        const out = [];
        let currentBook = null;

        for (let clause of clauses) {
            clause = clause.replace(/\s+/g, " ").trim();
            if (!clause) continue;

            const m = clause.match(/^((?:[1-3]\s*)?[A-Za-z][A-Za-z.]*)\s+(.+)$/);
            if (m) {
                const book = normalizeBook(m[1]);
                const rest = m[2].trim();

                // 只有在「同書 + 後段確實是章節」時才省略書名
                if (currentBook && currentBook === book && /^\d+\s*:/.test(rest)) {
                    clause = rest;
                } else {
                    currentBook = book;
                }
            }

            out.push(clause);
        }

        return out;
    };

    const buildRef = (contents) => {
        const compacted = compactSameBook(contents);
        const text = compacted.join("; ").replace(/\s+/g, " ").trim();
        return text ? `# ${text}|` : "#|";
    };

    for (const it of items) {
        if (it.type === "ref") {
            const prev = merged[merged.length - 1];
            const curContents = extractRefContents(it.w);

            if (prev && prev.type === "ref") {
                const prevContents = extractRefContents(prev.w);
                // 用 ; 串接，不直接相連
                prev.w = buildRef([...prevContents, ...curContents]);
                continue;
            } else {
                it.w = buildRef(curContents);
            }
        }
        merged.push(it);
    }

    return merged;
}

/**
 * 為 ref item 新增 ref 屬性（補書卷與章）
 * @param {TskItem[]} items
 * @param {DAddress=} address
 * @returns {TskItem[]}
 */
function addRefProp(items, address) {
    if (!address) return items;

    const books = BibleConstantHelper.getBookNameArrayEnglishShort();
    const bookName = (typeof address.book === "number") ? books[address.book - 1] : null;
    const chap = address.chap;

    if (!bookName || !chap) return items;

    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const bookRegex = new RegExp(`^(${books.map(escapeRegExp).join("|")})(\\s|$)`);

    for (const it of items) {
        if (it.type !== "ref") continue;

        let inner = it.w.replace(/^\s*#\s*/, "").replace(/\s*\|\s*$/, "").trim();
        if (!inner) {
            it.ref = it.w;
            continue;
        }

        const firstSeg = inner.split(";")[0].trim();
        const hasBook = bookRegex.test(firstSeg) || /^\d+\s*[A-Za-z]/.test(firstSeg);
        const hasChap = firstSeg.includes(":");

        if (!hasBook && !hasChap) {
            inner = `${bookName} ${chap}:${inner}`;
        } else if (!hasBook && hasChap) {
            inner = `${bookName} ${inner}`;
        }

        // ref 內不需要 *marg:
        inner = inner.replace(/\s*\*marg:\s*/gi, " ").replace(/\s+/g, " ").trim();

        it.ref = `# ${inner}|`;
    }

    return items;
}

/**
 * 非 summary 的 text item 移除換行排版
 * @param {TskItem[]} items
 */
function normalizeTextItems(items) {
    for (const it of items) {
        if (it.type === "text" && typeof it.w === "string") {
            it.w = it.w.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
        }
    }
}

/**
 * keyword 切分規則：
 * - 若第一行遇到 ". Heb" 或 ". Gr" 則在該點切分
 * - 若第一行遇到 ". Or," 也在該點切分（句點保留在 keyword）
 * - 否則以換行作為 keyword 與內容分界
 * @param {string} afterStar
 * @returns {{keyword: (string|null), rest: string}}
 */
function splitKeywordAndRest(afterStar) {
    const lines = afterStar.split(/\n/);
    const head = (lines[0] || "").trim();

    // 先判斷 ". Or,"（保留句點在 keyword）
    const mOr = head.search(/\.\s*Or,/i);
    if (mOr >= 0) {
        const keyword = head.slice(0, mOr + 1).trim() || null; // 含句點
        const restHead = head.slice(mOr + 1).trim();           // 從 or, 開始
        const rest = [restHead, ...lines.slice(1)]
            .filter(s => s && s.trim() !== "")
            .join("\n")
            .trim();
        return { keyword, rest };
    }

    // 原有 ". Heb" / ". Gr" 規則
    const m = head.search(/\.\s*(Heb|Gr)\b/i);
    if (m >= 0) {
        const keyword = head.slice(0, m).trim() || null;
        const restHead = head.slice(m + 1).trim();
        const rest = [restHead, ...lines.slice(1)]
            .filter(s => s && s.trim() !== "")
            .join("\n")
            .trim();
        return { keyword, rest };
    }

    const keyword = head || null;
    const rest = lines.slice(1).join("\n").trim();
    return { keyword, rest };
}

/**
 * summary block 後處理
 * - 將「n; text...」轉成 summaryItem
 * - 依下一個起始節推算區間（最後一段到本章最後一節）
 * @param {TskBlock[]} blocks
 * @param {DAddress=} address
 * @returns {TskBlock[]}
 */
function postProcessSummaryBlocks(blocks, address) {
    if (!Array.isArray(blocks) || !address) return blocks;
    if (typeof address.book !== "number" || typeof address.chap !== "number") return blocks;

    const getBookNameForSummary = () => {
        if (typeof BibleConstantHelper.getBookNameArrayChineseShort === "function") {
            const zhBooks = BibleConstantHelper.getBookNameArrayChineseShort();
            if (Array.isArray(zhBooks) && zhBooks[address.book - 1]) return zhBooks[address.book - 1];
        }
        const enBooks = BibleConstantHelper.getBookNameArrayEnglishShort?.();
        if (Array.isArray(enBooks) && enBooks[address.book - 1]) return enBooks[address.book - 1];
        return "";
    };

    const getVerseCount = () => {
        const fn = BibleConstantHelper.getCountVerseOfChap;
        if (typeof fn !== "function") return null;

        let v = Number(fn(address.book, address.chap));
        if (Number.isFinite(v) && v > 0) return v;

        // 保險：若 helper 以 0-based 書卷索引
        v = Number(fn(address.book - 1, address.chap));
        if (Number.isFinite(v) && v > 0) return v;

        return null;
    };

    const bookName = getBookNameForSummary();
    const chap = address.chap;
    const verseCount = getVerseCount();

    for (const block of blocks) {
        if (!block || block.type !== "summary" || typeof block.raw !== "string") continue;

        const lines = block.raw.split(/\n/);
        /** @type {{start: number, text: string}[]} */
        const entries = [];

        for (const line of lines) {
            const t = line.trim();
            if (!t) continue;

            const m = /^(\d+)\s*;\s*(.*)$/.exec(t);
            if (m) {
                entries.push({
                    start: parseInt(m[1], 10),
                    text: (m[2] || "").trim()
                });
            } else if (entries.length > 0) {
                // 延續上一行（例如 15; ... only / forbidden.）
                entries[entries.length - 1].text = `${entries[entries.length - 1].text} ${t}`.replace(/\s+/g, " ").trim();
            }
        }

        if (entries.length === 0) continue;

        const summaryItems = entries.map((e, i) => {
            const next = entries[i + 1];
            let end = next ? (next.start - 1) : (verseCount || e.start);
            if (!Number.isFinite(end) || end < e.start) end = e.start;

            const w = (e.start === end) ? `${e.start}` : `${e.start}-${end}`;
            const ref = `${bookName}${chap}:${w}`;

            return {
                type: "summaryItem",
                text: e.text,
                ref,
                w
            };
        });

        block.items = summaryItems;
    }

    return blocks;
}

/**
 * 在每個 block 裡，偵測每個 ref 前的 text/text-fb 是否包含特殊字眼，
 * 若有則在 ref 前插入 add-in-text item（保留原文 text 不變）
 * @param {TskBlock[]} blocks
 * @param {DAddress=} address
 * @returns {TskBlock[]}
 */
function injectAddInTextItems(blocks, address) {
    if (!Array.isArray(blocks)) return blocks;

    for (const block of blocks) {
        if (!block || !Array.isArray(block.items) || block.items.length === 0) continue;
        if (block.type === "summary") continue;

        const hasRef = block.items.some(it => it?.type === "ref");
        const nextItems = [];
        const textBuffer = [];

        const flushSpecial = () => {
            const joined = textBuffer.join(" ").trim();
            textBuffer.length = 0;
            if (!joined) return;

            const specialItems = collectAddInTextItems(joined, address);
            if (specialItems.length > 0) {
                nextItems.push({
                    type: "add-in-text",
                    item: specialItems
                });
            }
        };

        for (const it of block.items) {
            if (!it) continue;

            if (it.type === "ref") {
                // 有 ref 時：只在 ref 前插入
                flushSpecial();
                nextItems.push(it);
                continue;
            }

            nextItems.push(it);

            if (it.type === "text" || it.type === "text-fb") {
                const w = String(it.w || "").trim();
                if (w) textBuffer.push(w);
            }
        }

        // 只有「整個 block 沒 ref」才放尾端
        if (!hasRef) {
            flushSpecial();
        }

        block.items = nextItems;
    }

    return blocks;
}

/**
 * 從文字中擷取 SN / 交互參照（ver. / ch. / Joh 8:44）
 * @param {string} text
 * @param {DAddress=} address
 * @returns {AddInItem[]}
 */
function collectAddInTextItems(text, address) {
    const src = String(text || "");
    if (!src) return [];

    const out = [];
    const seen = new Set();

    const addUnique = (key, obj) => {
        if (seen.has(key)) return;
        seen.add(key);
        out.push(obj);
    };

    // 1) SN: See definition 02053 / See 02053 / 02053a
    const reSN = /\bsee(?:\s+definition)?\.?\s+(\d{1,5}[a-z]?)\b/ig;
    let m;
    while ((m = reSN.exec(src))) {
        const sn = normalizeSN(m[1]);
        if (!sn) continue;
        addUnique(`sn:H:${sn}`, { type: "sn", tp: "H", sn });
        addUnique(`sn:G:${sn}`, { type: "sn", tp: "G", sn });
    }

    // 2) ver. 3 / ver 15
    const reVer = /\bver\.?\s*(\d+)\b/ig;
    while ((m = reVer.exec(src))) {
        const v = String(parseInt(m[1], 10));
        const ref = toLocalizedRef(address?.book, address?.chap, v);
        if (!ref) continue;
        addUnique(`ref:ver:${address?.book}:${address?.chap}:${v}`, {
            type: "ref",
            w: `ver. ${v}`,
            ref
        });
    }

    // 3) ch. 2:19
    const reCh = /\bch\.?\s*(\d+)\s*:\s*([\d,-]+)\b/ig;
    while ((m = reCh.exec(src))) {
        const c = parseInt(m[1], 10);
        const v = (m[2] || "").trim();
        const ref = toLocalizedRef(address?.book, c, v);
        if (!ref) continue;
        addUnique(`ref:ch:${address?.book}:${c}:${v}`, {
            type: "ref",
            w: `ch. ${c}:${v}`,
            ref
        });
    }

    // 4) Joh 8:44 / 1Ki 3:2
    const books = getEnglishBookAliases();
    if (books.length > 0) {
        const escaped = books
            .slice()
            .sort((a, b) => b.length - a.length)
            .map(escapeRegExp)
            .join("|");

        const reBookRef = new RegExp(`\\b(${escaped})\\s*(\\d+)\\s*:\\s*([\\d,-]+)\\b`, "g");
        while ((m = reBookRef.exec(src))) {
            const bookToken = m[1];
            const chap = parseInt(m[2], 10);
            const verseSpec = (m[3] || "").trim();
            const bookId = BibleConstantHelper.getBookId?.(String(bookToken).toLowerCase());
            if (!bookId || !chap || !verseSpec) continue;

            const ref = toLocalizedRef(bookId, chap, verseSpec);
            if (!ref) continue;

            addUnique(`ref:book:${bookId}:${chap}:${verseSpec}`, {
                type: "ref",
                w: `${bookToken} ${chap}:${verseSpec}`,
                ref
            });
        }
    }

    return out;
}

function normalizeSN(raw) {
    const s = String(raw || "").trim();
    const m = /^0*(\d+)([a-z]?)$/i.exec(s);
    if (!m) return null;
    const num = m[1] || "0";
    const suffix = (m[2] || "").toLowerCase();
    return `${num}${suffix}`;
}

function getEnglishBookAliases() {
    const arr = BibleConstantHelper.getBookNameArrayEnglishShort?.();
    if (!Array.isArray(arr)) return [];
    return [...new Set(arr.filter(Boolean).map(x => String(x).trim()))];
}

function toLocalizedRef(bookId, chap, verseSpec) {
    if (!bookId || !chap || !verseSpec) return "";

    const zh = BibleConstantHelper.getBookNameArrayChineseShort?.();
    if (Array.isArray(zh) && zh[bookId - 1]) {
        return `${zh[bookId - 1]}${chap}:${verseSpec}`;
    }

    const en = BibleConstantHelper.getBookNameArrayEnglishShort?.();
    if (Array.isArray(en) && en[bookId - 1]) {
        return `${en[bookId - 1]} ${chap}:${verseSpec}`;
    }

    return `${chap}:${verseSpec}`;
}

function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

