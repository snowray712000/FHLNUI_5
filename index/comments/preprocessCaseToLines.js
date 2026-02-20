/**
 * 將 API 回傳的一個 case 文字，轉成「可解析」的 lines[]
 * - 合併排版造成的續行（用縮排判斷，但允許縮排誤差 ±1）
 * - 表格線（┌│─┘ 等）不合併，保留原行
 * @param {string} raw
 * @returns {{text: string, indent: number,isTableLine: boolean}[]}
 */
export function preprocessCaseToLines(raw) {
    if (typeof raw !== 'string') return [];

    const lines = raw.replace(/\r?\n\r?/g, '\n').split('\n');

    /** @type {{text:string, indent:number, isTableLine:boolean}[]} */
    const out = [];
    let prev = null;

    // 縮排容錯：把縮排量先「桶化」，避免 8/9/7 這種抖動被誤判成下一層
    const INDENT_TOL = 1;
    /** @type {number[]} */
    const indentBuckets = [];

    function snapIndent(indent) {
        for (const b of indentBuckets) {
            if (Math.abs(indent - b) <= INDENT_TOL) return b;
        }
        indentBuckets.push(indent);
        return indent;
    }

    // ✅ 新增：偵測「短字串 + 冒號」類項目（並排除交互參照/joTable）
    function isColonItemContent(s) {
        if (!s) return false;
        if (isJoTableJsonLine(s)) return false;

        const m = /^\s*(.{1,8}?)\s*[:：]/.exec(s);
        if (!m) return false;

        const label = m[1];
        // 若冒號前已有 # 或 |，視為交互參照（如 #士 1:28|）
        if (/[#|]/.test(label)) return false;

        return true;
    }

    function getRawIndentByIndex(i) {
        const ln = lines[i] ?? '';
        return (ln.match(/^\s*/) || [''])[0].length;
    }
    function getPrevNonEmptyIndex(i) {
        for (let p = i - 1; p >= 0; p--) {
            if (lines[p] && lines[p].trim() !== '') return p;
        }
        return -1;
    }
    function getNextNonEmptyIndex(i) {
        for (let n = i + 1; n < lines.length; n++) {
            if (lines[n] && lines[n].trim() !== '') return n;
        }
        return -1;
    }
    function isColonItemLine(idx, content, rawIndent) {
        if (!isColonItemContent(content)) return false;

        const prevIdx = getPrevNonEmptyIndex(idx);
        const nextIdx = getNextNonEmptyIndex(idx);

        const prevOk = prevIdx >= 0
            && isColonItemContent(lines[prevIdx].trim())
            && Math.abs(getRawIndentByIndex(prevIdx) - rawIndent) <= INDENT_TOL;

        const nextOk = nextIdx >= 0
            && isColonItemContent(lines[nextIdx].trim())
            && Math.abs(getRawIndentByIndex(nextIdx) - rawIndent) <= INDENT_TOL;

        return prevOk || nextOk;
    }

    // raw fence：/*********   或   **********/
    const isRawFenceStart = (s) => /\/?\*{10,}/.test(s);
    const isRawFenceEnd = (s) => /\*{10,}\/?/.test(s);

    // fence 內文合併：段落內合併，但保留空行（\n\n 不會被合併）
    function mergeFencePreserveBlankLines(rawBuf) {
        if (!rawBuf?.length) return '';

        // 只有 1 行（不完整或只有 start）就原樣回傳
        if (rawBuf.length < 3) return rawBuf.join('\n');

        const startLine = rawBuf[0]; // 原樣保留
        const endLine = rawBuf[rawBuf.length - 1]; // 原樣保留
        const body = rawBuf.slice(1, -1);

        /** @type {string[]} */
        const merged = [];
        let cur = null; // 當前段落的合併字串（最後會變成單行）

        for (const ln of body) {
            // 空行：結束段落並保留空行（連續空行會保留成連續 ''）
            if (!ln || ln.trim() === '') {
                if (cur !== null) {
                    merged.push(cur);
                    cur = null;
                }
                merged.push(''); // 保留空行 => 形成 \n\n
                continue;
            }

            // 非空行：段落內合併（去掉多餘縮排/前後空白後直接相接）
            const piece = ln.trim();
            if (cur === null) cur = piece;
            else cur += piece;
        }

        if (cur !== null) merged.push(cur);

        return [startLine, ...merged, endLine].join('\n');
    }

    // for 備註2
    let inRaw = false;
    /** @type {string[]} */
    let rawBuf = [];

    for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];

        // for 備註2
        // ---- raw block handling (preserve exactly) ----
        if (!inRaw && isRawFenceStart(line)) {
            inRaw = true;
            rawBuf = [line];
            continue;
        }

        if (inRaw) {
            rawBuf.push(line);

            if (isRawFenceEnd(line)) {
                out.push({
                    text: mergeFencePreserveBlankLines(rawBuf),
                    indent: 0,
                    isTableLine: false,
                    isRaw: true
                });

                // raw 區塊前後不要被「續行合併」黏到
                prev = null;
                inRaw = false;
                rawBuf = [];
            }
            continue;
        }
        // ---- end raw block handling ----

        const trimmedRight = line.replace(/\s+$/g, '');
        const content = trimmedRight.trim();

        // 跳過空行（你若想保留空行語意，之後再加模式）
        // if (!content) continue;

        const rawIndent = (line.match(/^\s*/) || [''])[0].length; // 原始縮排量（空白數）
        const indent = snapIndent(rawIndent); // 縮排容錯：先桶化

        // ✅ 空行：保留為「段落分隔」，但一定要切斷 prev，避免下一行黏到空行上
        if (!content) {
            out.push({ text: '', indent, isTableLine: false });
            prev = null;
            continue;
        }
        // ✅ joTable JSON：永遠獨立成行，不參與續行合併
        if (isJoTableJsonLine(content)) {
            prev = { text: content, indent, isTableLine: true };
            out.push(prev);
            continue;
        }

        // 新條目開頭偵測（保守版，可再擴充）
        const isNewItem =
            /^[◎●○☆]/.test(content) ||
            /^[A-Za-z]\./.test(content) ||
            /^\(\d+\)/.test(content) ||
            /^\d+\./.test(content) ||
            /^（[一二三四五六七八九十]+）/.test(content) ||
            /^[零壹貳參肆伍陸柒捌玖拾]+、/.test(content) ||
            /^[一二三四五六七八九十]+、/.test(content) ||   // ✅ 補上「一、二、…」
            /^【註\d+】/.test(content) ||
            isColonItemLine(idx, content, rawIndent); // ✅ 短字串+冒號項目（連續判斷）

        // 表格線偵測：遇到這些符號，一律視為「不可合併的 raw line」
        const isGridTablechk = isGridTable(content);
        const isDashTable = isDashLine(content);
        const isDashTableHeader = isLikeDashTableHeader(lines, idx);

        const isTableLine = isGridTablechk || isDashTable || isDashTableHeader;

        // 合併條件：有 prev、桶化後縮排更深、不是表格行、且這行不是新條目
        // 注意：用「桶化後縮排」比對，可避免同層 8/9 這種抖動被誤判為續行
        if (prev && indent > prev.indent && false == isTableLine && false == isNewItem && false == prev.isTableLine && false == isDashTableHeader) {
            prev.text += content; // 先直接黏起來（不加空白），符合你「自\n發」需求
            continue;
        }

        prev = { text: content, indent, isTableLine };
        out.push(prev);
    }

    // 若 raw fence 不完整（缺 end），也盡量把收集到的原文吐出
    if (inRaw && rawBuf.length) {
        out.push({
            text: mergeFencePreserveBlankLines(rawBuf),
            indent: 0,
            isTableLine: false,
            isRaw: true
        });
    }

    return out // 保留 indent 資訊
}

function isDashLine(line_text) {
    return /^[ \t\-─]{5,}$/.test(line_text);
}
function isLikeDashTableHeader(lines, idx) {
    // header ... 通常中間會有一些 空白 或 tab 分隔，若存在 2 個以上空白，或 1個 tab。就達成第一個條件
    const isCond1 = /\S(\s{2,}|\t)\S/.test(lines[idx].trim());
    if (!isCond1) return false;

    // 接著看下一行（非空行）是否為 dash line（----- 或 ────）
    for (let i = idx + 1; i < lines.length; i++) {
        const nextLine = lines[i].trim();
        if (!nextLine) continue; // 跳過空行
        return isDashLine(nextLine);
    }
    return false;
}

// ✅ 偵測「單行 joTable JSON」
function isJoTableJsonLine(s) {
    if (!s) return false;
    const t = s.trim();
    if (!(t.startsWith('{') && t.endsWith('}'))) return false;
    // 快速過濾：避免一般 JSON 誤判
    return t.includes('"rows"') && t.includes('"cols"') && t.includes('"cells"');
}

function isGridTable(line_text) {
    // 約: 1:18
    // ┌────┬────────────┬───────────┐
    // │差異    │   施洗約翰             │ 光╱道╱耶穌         │
    //
    // 1 整行都是 [┌┬┐├┼┤└┴┘│─] 這些符號（允許空白，但不允許其他文字），因為 「壹、導言─道成肉身的顯明 1:1-2:11」裡面就有 「─」
    // 2 trim 後，開頭 與 結尾，都有 │，中間可能有其它字
    return /^\s*[┌┬┐├┼┤└┴┘│─\s]+\s*$/.test(line_text) || /^\s*│.*│\s*$/.test(line_text);
}

function isMarker(line_text) {
    // 註釋，背景資料，都是 /**** 包起來， ****
    return /\*{5,}/.test(line_text);
}


/*備註1:
六、以色列歷史概論：
時代                 事件
---------------------------------------------------

要小心這種 case, 時代   事件，不能被合併到上一行去。
*/

/*備註2:
書卷背景，通常會有前言，是以下面格式包起來。

顯示的時候，就按原本的文字不修改即可，包含換行也要留著。

但是若有無謂的空白，要合併，也就是若是連續 \n\n 就一定不要合併

註: 這種格式，叫 fence

/*********
.....

.....
.....

.....
******************\/

*/

/*備註3:
以下這種，無符號的 case，但卻像是 list。

通常是『：」符號，是項目。所以可以是 /^\s*.{1,8}\s*[:：]/ 這種 regex, 尤其連續幾個, 並且它們的 indent 差不多的時候, 就更像了。

判斷依據，「這一行」是，並且「上一行或下一行，也是，並且它們的 indent 差不多」，就確定是這一類的。

但要注意，因為章節位置也有 : 符號，但在註釋中，章節位置 交互參照，有 # | 符號包圍，例如 「 #士 1:28|」。只是，也不要小心過度，因為「第一步: 在 #創1:2| 所示」這種，雖然有 #, 並且 # 在 8 個字元之內，但在 : 之後，所以可以。

要注意，將會有一種 joTable 的 JSON 格式，也會有 : 符號，但它是整行的 JSON 字串，且會有 "rows" "cols" "cells" 這些關鍵字，所以不難排除。

☆代號說明：
  「●」：經文註釋
  「◎」：個人感想與應用
  「○」：相關經文
  「☆」：特殊注意事項
*/