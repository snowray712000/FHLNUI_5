// input: {type:'text'|'table_raw', lines:{text:string,indent:number,isTableLine:boolean}[]}
// output: token[] (text block -> many tokens, table_raw -> one token)

/**
 * @typedef {{text:string, indent:number, isTableLine:boolean}} PreLine
 * @typedef {{type:'text'|'table_raw', lines:PreLine[]}} Block
 */

/**
 * @param {Block} block
 * @returns {Array<object>}
 */
export function tokenizeLine(block) {

  // Phase 2 已經判斷過表格：這裡只要「包成 table token」即可
  if (block.type === 'table_raw') {
    const first = block.lines[0];
    return [{
      kind: 'table',
      indent: first ? first.indent : 0,
      raw: block,                // 保留整個 block 以便後續用 meta/rawLines render
      lines: block.lines,        // 直接帶下去
      text: block.lines.map(l => l.text).join('\n') // 可選：方便 debug
    }];
  }

  // 一般文字：逐行 tokenize
  return block.lines.map(l => tokenizeTextLine(l));
}

/**
 * @param {{text:string, indent:number, isTableLine:boolean}} line
 */
export function tokenizeTextLine(line) {

  // Phase 2 已
  const raw = line;

  // ✅ raw fence 區塊：保留原文（含換行/空白），不做 trim、不做 marker 判斷
  if (line.isRaw) {
    return {
      raw,
      indent: line.indent ?? 0,
      kind: 'text',
      text: String(line.text ?? "")
    };
  }

  // ✅ 新增：一行 JSON table => joTable
  const joTable = tryParseJoTableJsonLine(line.text);
  if (joTable) {
    return {
      raw,
      indent: line.indent ?? 0,
      kind: 'joTable',
      joTable,
      text: ''
    };
  }

  const text = (line.text ?? "").trim();

  // 無序符號
  if (/^[◎○☆※]/.test(text)) {
    const marker = text[0];
    return { raw, indent: line.indent, kind: 'note', marker, text: text.slice(1).trim() };
  }

  // 字詞註解
  if (/^●/.test(text)) {
    return { raw, indent: line.indent, kind: 'lex', marker: '●', text: text.slice(1).trim() };
  }

  // 通常順序: 壹、 => 一、 => (一) => 1. => a. A. ...


  // 有序：壹、貳、…
  let m = text.match(/^([零壹貳參肆伍陸柒捌玖拾]+、)/);
  if (m) {
    return {
      raw, indent: line.indent,
      kind: 'ordered',
      marker: m[1],
      levelHint: 'cn-wide',
      text: text.slice(m[1].length).trim()
    };
  }


  m = text.match(/^([一二三四五六七八九十]+、)/);
  if (m) {
    return {
      raw, indent: line.indent,
      kind: 'ordered',
      marker: m[1],
      levelHint: 'cn',
      text: text.slice(m[1].length).trim()
    };
  }

  // 有序：（一）
  m = text.match(/^(（[一二三四五六七八九十]+）)/);
  if (m) {
    return {
      raw, indent: line.indent,
      kind: 'ordered',
      marker: m[1],
      levelHint: 'cn',
      text: text.slice(m[1].length).trim()
    };
  }

  // 有序：(1)
  m = text.match(/^(\(\d+\))/);
  if (m) {
    return {
      raw, indent: line.indent,
      kind: 'ordered',
      marker: m[1],
      levelHint: 'num-paren',
      text: text.slice(m[1].length).trim()
    };
  }

  // 有序：a. A. 1.
  m = text.match(/^([A-Za-z0-9]+)\./);
  if (m) {
    return {
      raw, indent: line.indent,
      kind: 'ordered',
      marker: m[0],
      levelHint: m[1],
      text: text.slice(m[0].length).trim()
    };
  }



  // 預設
  return { raw, indent: line.indent, kind: 'text', text };
}


/**
 * 解析你插入的標準表格 JSON（單行）
 * 期望格式：{"rows":6,"cols":3,"cells":[{"r":0,"c":0,"text":"..."}, ...]}
 * @param {string} s
 * @returns {null | {rows:number, cols:number, cells:Array<{r:number,c:number,rowSpan:number,colSpan:number,text:string}>}}
 */
function tryParseJoTableJsonLine(s) {
  if (typeof s !== 'string') return null;
  const t = s.trim();
  if (!t.startsWith('{') || !t.endsWith('}')) return null;

  // 快速過濾：避免誤判一般 JSON
  if (!(t.includes('"rows"') && t.includes('"cols"') && t.includes('"cells"'))) return null;

  let obj;
  try {
    obj = JSON.parse(t);
  } catch {
    return null;
  }

  if (!obj || typeof obj !== 'object') return null;
  const { rows, cols, cells } = obj;

  if (!Number.isInteger(rows) || rows <= 0) return null;
  if (!Number.isInteger(cols) || cols <= 0) return null;
  if (!Array.isArray(cells)) return null;

  const normCells = [];
  for (const cell of cells) {
    if (!cell || typeof cell !== 'object') continue;
    if (!Number.isInteger(cell.r) || !Number.isInteger(cell.c)) continue;

    normCells.push({
      r: cell.r,
      c: cell.c,
      rowSpan: Number.isInteger(cell.rowSpan) && cell.rowSpan > 0 ? cell.rowSpan : 1,
      colSpan: Number.isInteger(cell.colSpan) && cell.colSpan > 0 ? cell.colSpan : 1,
      text: String(cell.text ?? '')
    });
  }

  return { rows, cols, cells: normCells };
}