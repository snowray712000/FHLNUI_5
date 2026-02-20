// ❓ 問題: 有沒有使用到下面規則，就是 「壹、」-> 「一、」->「（一）、」->「1.」這 4 類還是可以直接使用，是之後的可能會要以 空白 為主。而不用全都以空白為主，不知道目前的程式碼，有沒有按這樣邏輯撰寫。
// ✅ 目前沒有。

/**
 * @typedef {object} Token
 * @property {'ordered'|'note'|'lex'|'text'|'table'|'joTable'} kind
 * @property {string} text
 * @property {string} [marker]
 * @property {number} [indent]
 * @property {any} [raw]
 * @property {any[]} [lines]
 * @property {string} [levelHint]
 * @property {any} [joTable]           // ✅ 新增：標準表格資料
 */

/**
 * @typedef {object} TreeNode
 * @property {string} text
 * @property {Token} token
 * @property {TreeNode[]} children
 */

/**
 * Token[] → TreeNode[]
 * 主要以 indent 建樹；可選在 indent 相同時用 markerRank 微調。
 *
 * @param {Token[]} tokens
 * @param {{ useMarkerRankWhenIndentEqual?: boolean }} [opts]
 * @returns {TreeNode[]}
 */
export function buildTree(tokens, opts = {}) {
    const { useMarkerRankWhenIndentEqual = false } = opts;

    /** @type {TreeNode} */
    const rootNode = { text: '', token: /** @type {any} */({ kind: 'text', text: '' }), children: [] };

    // stack frame：記錄目前節點的 indent 與（可選）marker rank
    const stack = [{
        indent: -1,
        rank: -1,
        node: rootNode
    }];

    function getIndent(token) {
        if (typeof token.indent === 'number') return token.indent;
        if (token.raw && typeof token.raw.indent === 'number') return token.raw.indent;
        return 0;
    }

    // 只在 ordered 上給一個「相對順位」；數字. < 字母. < (數字)
    // 注意：這不是完整語意，只是 indent 相同時的可選輔助。
    function getMarkerRank(token) {
        if (!token || token.kind !== 'ordered') return 0;
        const m = token.marker || '';

        if (/^\d+\./.test(m)) return 10;        // 1.
        if (/^[a-z]\./i.test(m)) return 20;     // A. a.
        if (/^\(\d+\)/.test(m)) return 30;      // (1)
        if (/^(（[一二三四五六七八九十]+）)/.test(m)) return 15; // （一）(暫放中間)
        return 5;
    }

    for (const token of tokens) {
        const indent = getIndent(token);
        const rank = getMarkerRank(token);

        /** @type {TreeNode} */
        const node = {
            text: token.text,
            token,
            children: []
        };

        // 找到正確 parent
        while (stack.length > 1) {
            const top = stack[stack.length - 1];

            // 主要規則：indent 變淺或相同 → 回到上一層
            if (indent < top.indent) {
                stack.pop();
                continue;
            }

            if (indent === top.indent) {
                if (useMarkerRankWhenIndentEqual) {
                    // 同 indent：rank 小或相等 → sibling（pop）
                    if (rank <= top.rank) {
                        stack.pop();
                        continue;
                    }
                    // rank 更大 → 允許當作 child（不 pop）
                } else {
                    stack.pop();
                    continue;
                }
            }

            // indent > top.indent → child（停止 pop）
            break;
        }

        const parent = stack[stack.length - 1].node;
        parent.children.push(node);

        stack.push({ indent, rank, node });
    }

    return rootNode.children;
}