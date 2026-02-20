// 測試用，主專案不會用到。
// 這是為了測試 parseComment 這部分對不對用。

$(function () {

    // 測試用 CSS：關掉原生清單樣式，縮排由我們控制
    // 凸排效果: 若要讓第一行相對於後續行數「凸」出來 1em，邏輯是先將整段文字向右推移，再將第一行往回拉。即 .hanging-indent
    // .c-list 
    //  list-style: none; 很重要. 必要
    // padding-left: 1em; 預設會很大, 必要, 設為 1em, 要與 .hanging-indent 的 text-indent 的值相同, 不能直接設 0.
    // .c-li { margin: .15em 0; } 每行之間的間距, 可調整

    const css = `
        .hanging-indent {
            padding-left: 1em;
            text-indent: -1em;
        }
       
        .c-list { list-style: none; margin: 0; padding-left: 1em; }
        .c-li { margin: .15em 0; }
        .c-marker { display: inline-block; min-width: 0.5em; }
        .c-lex .c-marker { min-width: 0.5em; } 

        /* ✅ joTable/table 顯示 */
        .c-joTable { padding-left: 0; text-indent: 0; } /* 表格不用凸排 */
        .c-table-wrap { margin: .35em 0 .35em 0; overflow-x: auto; }
        table.c-table { border-collapse: collapse; font-size: 14px; }
        table.c-table td, table.c-table th { border: 1px solid #bbb; padding: 4px 6px; vertical-align: top; }
        pre.c-raw-table { margin: .35em 0; padding: .5em; background: #f6f6f6; border: 1px solid #ddd; white-space: pre; overflow-x: auto; }
      `;
    $('head').append($('<style>').text(css));
})


function renderNodesAsList(nodes) {
    const $list = $(`<ul class="c-list"></ul>`);

    (nodes || []).forEach((node) => {
        $list.append(renderNode(node));
    });

    return $list;
}

// ✅ 安全地渲染多行文字：\n => <br>，文字用 TextNode 避免 XSS
function appendMultilineText($el, text) {
    const s = String(text ?? '');
    const parts = s.split('\n');
    for (let i = 0; i < parts.length; i++) {
        if (i > 0) $el.append('<br>');
        $el.append(document.createTextNode(parts[i]));
    }
}

function renderNode(node) {
    // node: { id, w, type, marker, children }
    const text = node?.w ?? '';
    const marker = node?.marker ?? '';
    const type = node?.type ?? '';

    const $li = $('<li class="c-li hanging-indent"></li>');

    if (marker) $li.append($('<span class="c-marker">').text(marker + ' '));

    // ✅ joTable：直接 render 成 HTML table（不印出 node.w）
    if (type === 'joTable') {
        $li.addClass('c-joTable');

        const jt = node?.meta?.joTable;
        $li.append(renderJoTable(jt));

        if (node?.children?.length) {
            $li.append(renderNodesAsList(node.children));
        }
        return $li;
    }

    // ✅ raw table（舊表格）：先用 pre 顯示（你若已有別的 renderer 可替換這段）
    if (type === 'table') {
        const rawLines = node?.meta?.rawLines;
        const s = Array.isArray(rawLines) ? rawLines.map(l => l?.text ?? '').join('\n') : (text || '');
        $li.append($('<pre class="c-raw-table"></pre>').text(s));

        if (node?.children?.length) {
            $li.append(renderNodesAsList(node.children));
        }
        return $li;
    }

    // 一般文字
    if (text) {
        const $text = $('<span class="c-text"></span>');
        appendMultilineText($text, text);
        $li.append($text);
    }

    if (node?.children?.length) {
        $li.append(renderNodesAsList(node.children));
    }

    if (type === 'lex') $li.addClass('c-lex');

    return $li;
}

export function renderCommentTree(rootNodes, $container) {
    $container.empty();
    $container.append(renderNodesAsList(rootNodes));
}

function renderJoTable(joTable) {
    const rows = joTable?.rows ?? 0;
    const cols = joTable?.cols ?? 0;
    const cells = Array.isArray(joTable?.cells) ? joTable.cells : [];

    if (!Number.isInteger(rows) || rows <= 0 || !Number.isInteger(cols) || cols <= 0) {
        return $('<div>').text('[joTable: invalid rows/cols]');
    }

    // 建立 (r,c) -> cell 映射
    const byPos = new Map();
    for (const cell of cells) {
        if (!cell) continue;
        const r = cell.r, c = cell.c;
        if (!Number.isInteger(r) || !Number.isInteger(c)) continue;
        byPos.set(`${r},${c}`, cell);
    }

    // 占用表：避免輸出被 rowspan/colspan 覆蓋的格子
    const occupied = Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));

    const $wrap = $('<div class="c-table-wrap"></div>');
    const $table = $('<table class="c-table"></table>');
    const $tbody = $('<tbody></tbody>');

    for (let r = 0; r < rows; r++) {
        const $tr = $('<tr></tr>');

        for (let c = 0; c < cols; c++) {
            if (occupied[r][c]) continue;

            const cell = byPos.get(`${r},${c}`);
            if (!cell) {
                // 沒資料的格子，仍然輸出空 td（保持格線一致）
                $tr.append('<td></td>');
                continue;
            }

            const rs = Number.isInteger(cell.rowSpan) && cell.rowSpan > 0 ? cell.rowSpan : 1;
            const cs = Number.isInteger(cell.colSpan) && cell.colSpan > 0 ? cell.colSpan : 1;

            // 標記覆蓋區
            for (let rr = r; rr < Math.min(rows, r + rs); rr++) {
                for (let cc = c; cc < Math.min(cols, c + cs); cc++) {
                    occupied[rr][cc] = true;
                }
            }

            const $td = $('<td></td>');
            if (rs > 1) $td.attr('rowspan', String(rs));
            if (cs > 1) $td.attr('colspan', String(cs));
            // 將 \n 轉成 <br>
            appendMultilineText($td, cell.text ?? "");
            // $td.append(document.createTextNode(String(cell.text ?? '')));

            $tr.append($td);
        }

        $tbody.append($tr);
    }

    $table.append($tbody);
    $wrap.append($table);
    return $wrap;
}