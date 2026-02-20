/**
 * 將 lines[] 切成 block：
 * - text
 * - table_raw
 *
 * @param {{text:string,indent:number,isTableLine:boolean}[]} lines
 * @returns {{type:'text'|'table_raw', lines:{text:string,indent:number,isTableLine:boolean}[]}[]}
 */
export function detectTableBlocks(lines) {

    const blocks = [];

    let buf = [];
    let inTable = false;


    function flush() {
        if (!buf.length) return;

        blocks.push({
            type: inTable ? 'table_raw' : 'text',
            lines: buf
        });

        buf = [];
    }


    function isBoxLine(line) {
        // 約: 1:18
        // ┌────┬────────────┬───────────┐
        // │差異    │   施洗約翰             │ 光╱道╱耶穌         │
        //

        // 1 整行都是 [┌┬┐├┼┤└┴┘│─] 這些符號（允許空白，但不允許其他文字），因為 「壹、導言─道成肉身的顯明 1:1-2:11」裡面就有 「─」
        // 2 trim 後，開頭 與 結尾，都有 │，中間可能有其它字
        return /^[ \t]*[┌┬┐├┼┤└┴┘│─]+[ \t]*$/.test(line.text) || /^[ \t]*│.*│[ \t]*$/.test(line.text);
    }


    function isDashLine(line) {
        return /^[ \t\-─]{10,}$/.test(line.text);
    }


    function isColumnHeader(line) {
        // 2+ spaces or tab = likely column
        return /\S+(\s{2,}|\t)\S+/.test(line.text);
    }


    function isTableStart(line, next) {

        if (isBoxLine(line)) return true;

        if (isColumnHeader(line) && next && isDashLine(next)) {
            return true;
        }

        return false;
    }


    for (let i = 0; i < lines.length; i++) {

        const line = lines[i];
        const next = lines[i + 1];

        // ✅ raw 行：強制離開表格狀態，並當作一般文字塞進 text block
        if (line.isRaw) {
            if (inTable) {
                flush();
                inTable = false;
            }
            buf.push(line);
            continue;
        }

        // 尚未進表格 → 偵測開始
        if (!inTable && isTableStart(line, next)) {
            flush();
            inTable = true;
        }

        // 已在表格 → 偵測結束
        if (inTable) {

            const end =
                /^[◎●○☆]/.test(line.text) ||
                (/^\S/.test(line.text) && !isBoxLine(line) && !isColumnHeader(line) && !isDashLine(line));

            if (end && buf.length) {
                flush();
                inTable = false;
            }
        }

        buf.push(line);
    }

    flush();

    return blocks;
}
