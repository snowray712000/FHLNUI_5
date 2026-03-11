/// <reference path='./../../libs/jsdoc/jquery.js' />
/**
 * @typedef {import("./../DText.js").DText} DText
 */

/**
 * @param {DText[]} dtexts 
 * @returns {JQuery<HTMLElement>}
 */
export function dtexts_render(dtexts) {
    const container = $('<span></span>');
    for (const dtext of dtexts) {
        const $dtext = dtext_render(dtext);
        container.append($dtext);
    }
    return container.children();
}

/**
 * @param {DText} dtext
 * @returns {JQuery<HTMLElement>} 
 */
function dtext_render(dtext) {
    // Hr
    if (dtext?.isHr) {
        return $('<hr/>');
    }

    // Br
    if (dtext?.isBr) {
        return $('<br/>');
    }

    // rawTable - raw string content
    if (dtext?.rawTable) {
        return $('<pre></pre>').addClass('raw-table').text(dtext.rawTable);
    }

    // joRaw - raw HTML content (backward compatibility)
    if (dtext?.joRaw) {
        return $(dtext.joRaw);
    }


    // joTable
    if (dtext?.joTable) {
        return render_joTable(dtext.joTable);
    }

    // childrenlist - ul/li structures
    if (dtext?.childrenlist) {
        return render_childrenlist(dtext, true);
    }

    // children - nested DText[]
    if (dtext?.children) {
        return render_children(dtext);
    }

    // foot 註腳
    if (dtext?.foot) {
        return render_foot(dtext);
    }

    // Ref (交互參照)
    if (dtext?.isRef) {
        return render_ref(dtext);
    }

    // Strong Number (sn)
    if (dtext?.sn) {
        return render_sn(dtext);
    }

    // Regular text with classes and styles
    return render_regular_text(dtext);
}

/**
 * @param {any} textData
 * @returns {JQuery<HTMLElement>}
 */
function render_regular_text(textData) {
    const $span = $('<span></span>');

    // Set text content (use refDescription as fallback if w is missing)
    const text = textData?.w ?? textData?.refDescription ?? '';
    $span.text(text);

    // Add classes based on flags
    const classes = [];
    if (textData?.isTitle1) classes.push('isTitle1');
    if (textData?.isBold) classes.push('isBold');
    if (textData?.isName) classes.push('isName');
    if (textData?.isGODSay) classes.push('isGODSay');
    if (textData?.isOrigNotExist) classes.push('isOrigNotExist');
    if (textData?.isParenthesesFW) classes.push('isParenthesesFW');
    if (textData?.isParenthesesHW) classes.push('isParenthesesHW');
    if (textData?.isParenthesesFW2) classes.push('isParenthesesFW2');

    if (classes.length > 0) {
        $span.attr('class', classes.join(' '));
    }

    // Add custom class
    if (textData?.class) {
        $span.addClass(textData.class);
    }

    // Add color style
    if (textData?.cssColor) {
        $span.css('color', textData.cssColor);
    }

    return $span;
}

/**
 * @param {any} textData
 * @returns {boolean}
 */
function has_text_style(textData) {
    return !!(
        textData?.isTitle1 ||
        textData?.isBold ||
        textData?.isName ||
        textData?.isGODSay ||
        textData?.isOrigNotExist ||
        textData?.isParenthesesFW ||
        textData?.isParenthesesHW ||
        textData?.isParenthesesFW2 ||
        textData?.class ||
        textData?.cssColor
    );
}

/**
 * @param {any} refData
 * @returns {JQuery<HTMLElement>}
 */
function render_ref(refData) {
    const $span = $('<span></span>').addClass('ref');

    // Set text content (use refDescription as fallback if w is missing)
    const text = refData?.w ?? refData?.refDescription ?? '';
    $span.text(text);

    // Keep both attributes for compatibility with old/new event handlers.
    if (refData?.refDescription) {
        $span.attr('addr-desc', refData.refDescription);
        $span.attr('addr-desc', refData.refDescription);
    }

    // Add addr-data attribute
    if (refData?.refAddresses) {
        $span.attr('addr-data', JSON.stringify(refData.refAddresses));
    }

    return $span;
}

/**
 * @param {any} footData
 * @returns {JQuery<HTMLElement>}
 */
function render_foot(footData) {
    const $span = $('<span></span>').addClass('foot');
    const foot = footData?.foot || {};
    const footId = foot?.id;

    $span.append('【註');

    // 和合本2010 會用 -1 表示沒有 id
    if (footId != null && footId !== -1) {
        $span.append($('<span></span>').text(String(footId)));
    }

    if (Array.isArray(foot?.footContent)) {
        $span.append('：');
        for (const one of foot.footContent) {
            $span.append(dtext_render(one));
        }
    } else if (footId != null && footId !== -1) {
        // 只有 id，沿用舊行為可點擊查詢 rt
        $span.addClass('ft');
        $span.attr('ft', footId);
        if (foot?.book != null) $span.attr('book', foot.book);
        if (foot?.chap != null) $span.attr('chap', foot.chap);
        if (foot?.sec != null) $span.attr('sec', foot.sec);
        if (foot?.version != null) $span.attr('ver', foot.version);
    }

    $span.append('】');
    return $span;
}

/**
 * @param {any} snData
 * @returns {JQuery<HTMLElement>}
 */
function render_sn(snData) {
    const $span = $('<span></span>');

    // Determine if this is a real sn (has tp2) or just sn-text
    const isRealSn = snData?.tp2;

    if (isRealSn) {
        $span.addClass('sn');
    } else {
        $span.addClass('sn-text');
    }

    // Add isCurly class
    if (snData?.isCurly) {
        $span.addClass('isCurly');
    }

    // Set attributes
    if (snData?.tp) {
        $span.attr('tp', snData.tp);
    }
    if (snData?.sn) {
        $span.attr('sn', snData.sn);
    }

    // Determine text content
    let text;
    if (snData?.w) {
        text = snData.w;
    } else {
        // Build text from tp and sn
        const tp = snData?.tp || '';
        const sn = snData?.sn || '';
        const baseSn = tp + sn;

        if (snData?.isCurly) {
            // For curly braces, check tp2 to determine () or <>
            if (snData?.tp2 === 'WTH' || snData?.tp2 === 'WTG') {
                text = '{(' + baseSn + ')}';
            } else {
                text = '{<' + baseSn + '>}';
            }
        } else if (isRealSn) {
            // For real sn (has tp2), check if it's a tense marker
            if (snData?.tp2 === 'WTH' || snData?.tp2 === 'WTG') {
                text = '(' + baseSn + ')';
            } else {
                text = '<' + baseSn + '>';
            }
        } else {
            text = baseSn;
        }
    }

    $span.text(text);

    return $span;
}

/**
 * @param {any} childrenData
 * @returns {JQuery<HTMLElement>}
 */
function render_children(childrenData) {
    const container = $('<span></span>');

    // Process children array
    const childrenArray = childrenData?.children || [];
    for (const child of childrenArray) {
        const $child = dtext_render(child);
        container.append($child);
    }

    // Wrap in tpContainer if specified
    if (childrenData?.tpContainer) {
        const $wrapper = $(childrenData.tpContainer);
        $wrapper.append(container.children());
        return $wrapper;
    }

    return container;
}

/**
 * @param {any} listData
 * @returns {JQuery<HTMLElement>}
 */
function render_childrenlist(listData, isTop = false) {
    const $ul = $('<ul></ul>');

    // 只有最上層 listData.w 會直接放在 <ul> 內
    if (listData?.w != null && isTop) {
        $ul.append(render_regular_text(listData));
    }

    const items = listData?.childrenlist || [];
    for (const item of items) {
        const $li = $('<li></li>').addClass('hanging-indent');

        // marker
        if (item?.marker) {
            $li.append($('<span></span>').addClass('marker').text(item.marker));
        }

        // 主要內容：w / children（二選一）
        if (item?.w != null) {
            $li.append(render_regular_text(item));
        } else if (item?.children) {
            $li.append(render_children(item));
        }

        // 附加內容：可與 w 同時存在
        if (item?.joTable) {
            $li.append(render_joTable(item.joTable));
        }
        if (item?.rawTable) {
            $li.append($('<pre></pre>').addClass('raw-table').text(item.rawTable));
        }
        if (item?.joRaw) {
            $li.append($(item.joRaw));
        }

        // 巢狀 childrenlist
        if (item?.childrenlist) {
            $li.append(render_childrenlist(item, false));
        }

        $ul.append($li);
    }

    return $ul;
}

/**
 * @param {any} tableData
 * @returns {JQuery<HTMLElement>}
 */
function render_joTable(tableData) {
    const rows = tableData?.rows || 0;
    const cols = tableData?.cols || 0;

    // Validate rows and cols
    if (rows <= 0 || cols <= 0) {
        return $('<span></span>').text('[joTable: invalid rows/cols]');
    }

    const $div = $('<div></div>').addClass('joTable');
    const $table = $('<table></table>');
    const $tbody = $('<tbody></tbody>');

    // Create a grid to track cell positions
    const grid = Array(rows).fill(null).map(() => Array(cols).fill(null));

    // Get cells data
    const cells = tableData?.cells || [];

    // Sort cells by row then column for proper rendering
    const sortedCells = [...cells].sort((a, b) => a.r !== b.r ? a.r - b.r : a.c - b.c);

    // Mark occupied cells due to rowSpan/colSpan
    for (const cell of sortedCells) {
        if (cell.r >= 0 && cell.r < rows && cell.c >= 0 && cell.c < cols) {
            const rowSpan = cell.rowSpan || 1;
            const colSpan = cell.colSpan || 1;
            for (let r = cell.r; r < cell.r + rowSpan && r < rows; r++) {
                for (let c = cell.c; c < cell.c + colSpan && c < cols; c++) {
                    grid[r][c] = cell;
                }
            }
        }
    }

    // Build table rows
    for (let r = 0; r < rows; r++) {
        const $tr = $('<tr></tr>');
        for (let c = 0; c < cols; c++) {
            const cell = grid[r][c];

            // Skip if this cell is occupied by a previous cell's span
            if (cell && (cell.r !== r || cell.c !== c)) {
                continue;
            }

            // Create td for actual cell or empty cell
            const $td = $('<td></td>');

            if (cell) {
                // Add rowSpan if present
                if (cell.rowSpan && cell.rowSpan > 1) {
                    $td.attr('rowspan', cell.rowSpan);
                }
                // Add colSpan if present
                if (cell.colSpan && cell.colSpan > 1) {
                    $td.attr('colspan', cell.colSpan);
                }

                // Add content
                if (cell.content) {
                    for (const dtextItem of cell.content) {
                        const $item = dtext_render(dtextItem);
                        $td.append($item);
                    }
                } else if (cell.text) {
                    $td.text(cell.text);
                }
            }

            $tr.append($td);
        }
        $tbody.append($tr);
    }

    $table.append($tbody);
    $div.append($table);

    return $div;
}

