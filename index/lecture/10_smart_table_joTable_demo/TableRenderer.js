/**
 * TableRenderer — 將 joTable 資料結構渲染為 <table> DOM。
 *
 * joTable 格式：
 *   {
 *     r: number,           // 總行數（1-based）
 *     c: number,           // 總欄數（1-based）
 *     headers: [{ c, content, cs? }],
 *     cells:   [{ r, c, rs?, cs?, content }]
 *   }
 *
 * render_dtexts(content) → string（HTML）或 HTMLElement
 *   content = [{w, isRef, 'ref-desc', ...}, ...]
 *
 * 每個 <td> 帶 data-r / data-c（joTable 邏輯位置），供 copy 邏輯反查。
 */
export class TableRenderer {

  /**
   * @param {object}   joTable       - joTable 資料
   * @param {Function} render_dtexts - (content) → string | HTMLElement
   * @returns {HTMLTableElement}
   */
  static buildDom(joTable, render_dtexts) {
    const table = document.createElement('table');

    // ── thead ──────────────────────────────────────────────────────────
    if (joTable.headers?.length) {
      const thead = table.createTHead();
      const htr   = thead.insertRow();
      for (const h of joTable.headers) {
        const th = document.createElement('td');
        if ((h.cs ?? 1) > 1) th.colSpan = h.cs;
        TableRenderer.#fillCell(th, h.content, render_dtexts);
        htr.appendChild(th);
      }
    }

    // ── tbody ──────────────────────────────────────────────────────────
    const tbody    = table.createTBody();
    const occupied = {};   // key: `${r},${c}` → true

    for (let r = 1; r <= joTable.r; r++) {
      const tr = tbody.insertRow();
      for (let c = 1; c <= joTable.c; c++) {
        if (occupied[`${r},${c}`]) continue;

        const cell = joTable.cells.find(cell => cell.r === r && cell.c === c);
        if (!cell) continue;

        const td = document.createElement('td');
        const rs = cell.rs ?? 1;
        const cs = cell.cs ?? 1;
        if (rs > 1) td.rowSpan = rs;
        if (cs > 1) td.colSpan = cs;

        // 邏輯位置，供 copy 反查
        td.dataset.r = r;
        td.dataset.c = c;

        // 標記佔用格
        for (let dr = 0; dr < rs; dr++)
          for (let dc = 0; dc < cs; dc++)
            occupied[`${r + dr},${c + dc}`] = true;

        TableRenderer.#fillCell(td, cell.content, render_dtexts);
        tr.appendChild(td);
      }
    }

    return table;
  }

  /** 將 render_dtexts 結果填入 td（支援 string 或 HTMLElement） */
  static #fillCell(td, content, render_dtexts) {
    const result = render_dtexts(content);
    if (typeof result === 'string') {
      td.innerHTML = result;
    } else if (result instanceof Node) {
      td.appendChild(result);
    }
  }
}
