$(function () {
    const css = `
        .hanging-indent { padding-left: 0.5rem; text-indent: -0.5rem; }
        .c-list { list-style: none; margin: 0; padding-left: 0.5rem; }
        .c-li { margin: .15em 0; }
        .c-marker { display: inline-block; min-width: 0.125rem; }
        .c-lex .c-marker { min-width: 0.125rem; }

        /* joTable/table 顯示 */
        .c-joTable { padding-left: 0; text-indent: 0; }
        .c-table-wrap { margin: .35em 0 .35em 0; overflow-x: auto; }
        table.c-table { border-collapse: collapse;  }
        table.c-table td, table.c-table th { border: 1px solid #bbb; padding: 4px 6px; vertical-align: top; }

        /* inline tokens */
        .c-ref { color: #0a58ca; text-decoration: underline; cursor: pointer; }
        .c-sn { color: #6f42c1; }
    `;
    $('head').append($('<style>').text(css));
});

function renderDTextList(dtexts) {
    const $list = $(`<ul class="c-list"></ul>`);
    (dtexts || []).forEach(dt => $list.append(renderDTextNode(dt)));
    return $list;
}

function renderDTextNode(dt) {
    const $li = $('<li class="c-li hanging-indent"></li>');

    if (dt?.marker) {
        $li.append($('<span class="c-marker"></span>').text(dt.marker + ' '));
    }

    if (dt?.joTable) {
        $li.addClass('c-joTable');
        $li.append(renderJoTableFromDText(dt.joTable));
        if (dt?.childrenlist?.length) {
            $li.append(renderDTextList(dt.childrenlist));
        }
        return $li;
    }

    if (Array.isArray(dt?.children) && dt.children.length > 0) {
        const $text = $('<span class="c-text"></span>');
        appendInlineDTexts($text, dt.children);
        $li.append($text);
    } else if (dt?.w) {
        const $text = $('<span class="c-text"></span>');
        appendMultilineText($text, dt.w);
        $li.append($text);
    }

    if (Array.isArray(dt?.childrenlist) && dt.childrenlist.length > 0) {
        $li.append(renderDTextList(dt.childrenlist));
    }

    if (dt?.tp === 'lex') $li.addClass('c-lex');

    return $li;
}

function appendInlineDTexts($el, inlines) {
    for (const t of (inlines || [])) {
        if (t?.isRef) {
            const $a = $('<span class="commentJump" href="javascript:void(0)"></span>');
            // 顯示文字
            $a.text(t.w ?? t.refDescription ?? '');
            // 事件需要的 attrs
            if (t?.refAddress?.book) $a.attr('book', String(t.refAddress.book));
            if (t?.refAddress?.chap != null) $a.attr('chap', String(t.refAddress.chap));
            if (t?.refAddress?.verse != null) $a.attr('sec', String(t.refAddress.verse));
            if (t?.refDescription != null) $a.attr('refDescription', String(t.refDescription));
            $el.append($a);
        } else if (t?.sn) {
            const $sn = $('<span class="sn" href="javascript:void(0)"></span>');
            $sn.text(t.w ?? t.sn);
            // 事件需要的 attrs
            if (t?.sn) $sn.attr('sn', String(t.sn));
            if (t?.tp) $sn.attr('tp', String(t.tp));
            $el.append($sn);
        } else if (t?.w) {
            appendMultilineText($el, t.w);
        }
    }
}

function appendMultilineText($el, text) {
    const s = String(text ?? '');
    const parts = s.split('\n');
    for (let i = 0; i < parts.length; i++) {
        if (i > 0) $el.append('<br>');
        $el.append(document.createTextNode(parts[i]));
    }
}

function renderJoTableFromDText(joTable) {
    const rows = joTable?.rows ?? 0;
    const cols = joTable?.cols ?? 0;
    const cells = Array.isArray(joTable?.cells) ? joTable.cells : [];

    if (!Number.isInteger(rows) || rows <= 0 || !Number.isInteger(cols) || cols <= 0) {
        return $('<div>').text('[joTable: invalid rows/cols]');
    }

    const byPos = new Map();
    for (const cell of cells) {
        if (!cell) continue;
        const r = cell.r, c = cell.c;
        if (!Number.isInteger(r) || !Number.isInteger(c)) continue;
        byPos.set(`${r},${c}`, cell);
    }

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
                $tr.append('<td></td>');
                continue;
            }

            const rs = Number.isInteger(cell.rowSpan) && cell.rowSpan > 0 ? cell.rowSpan : 1;
            const cs = Number.isInteger(cell.colSpan) && cell.colSpan > 0 ? cell.colSpan : 1;

            for (let rr = r; rr < Math.min(rows, r + rs); rr++) {
                for (let cc = c; cc < Math.min(cols, c + cs); cc++) {
                    occupied[rr][cc] = true;
                }
            }

            const $td = $('<td></td>');
            if (rs > 1) $td.attr('rowspan', String(rs));
            if (cs > 1) $td.attr('colspan', String(cs));

            if (Array.isArray(cell.content)) {
                appendInlineDTexts($td, cell.content);
            } else if (cell.text) {
                appendMultilineText($td, cell.text);
            }

            $tr.append($td);
        }

        $tbody.append($tr);
    }

    $table.append($tbody);
    $wrap.append($table);
    return $wrap;
}

function isInlineOnlyDTexts(dtexts) {
    return (dtexts || []).every(dt =>
        dt &&
        !dt.marker &&
        !dt.childrenlist &&
        !dt.joTable &&
        !dt.children &&
        (dt.w || dt.isRef || dt.sn)
    );
}


export function renderCommentDTexts(dtexts, $container) {
    $container.empty();

    if (isInlineOnlyDTexts(dtexts)) {
        const $p = $('<div class="c-text"></div>');
        appendInlineDTexts($p, dtexts);
        $container.append($p);
        return;
    }

    $container.append(renderDTextList(dtexts));
}