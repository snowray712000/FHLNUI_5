/**
 * TableSelector — 封裝 table 選取狀態機，解耦繪圖以外的所有業務邏輯。
 *
 * 繼承 EventTarget，選取確認後發出 `selectioncommit` 事件。
 *
 * 與 09 版的差異：
 *   #pos() 優先讀 td.dataset.r / td.dataset.c（邏輯位置），
 *   #applyColSelection / #applyRowSelection 也改用 data 屬性查詢，
 *   讓 rowspan / colspan 的 table 能正確判斷欄位。
 *   若 td 沒有 data-r / data-c，回退到原本的 DOM index 行為（向下相容）。
 *
 * 發出的事件：
 *   selectionstart   — pointerdown 命中有效 td 時（無 detail）
 *   selectiondrag    — 第一次跨 cell 時（無 detail）
 *   selectioncommit  — pointerup 後選取確認（detail 見下）
 *   selectioncancel  — pointercancel 時（無 detail）
 *
 * selectioncommit detail：
 *   { isTouch, x, y, mode, startRow, startCol, endRow, endCol }
 *   - isTouch   : boolean  — true = 平板 touch
 *   - x, y      : number   — clientX/Y，供 context menu 定位
 *   - mode      : 'single' | 'col' | 'row'
 *   - startRow, startCol, endRow, endCol : number — 邏輯位置（data-r/c 優先）
 */
export class TableSelector extends EventTarget {
  #table;
  #startCell   = null;
  #currentCell = null;
  #hasCrossed  = false;
  #dragIsTouch = false;

  constructor(tableEl) {
    super();
    this.#table = tableEl;
    this.#bindEvents();
  }

  // ── Private helpers ────────────────────────────────────────────────

  #tdAt(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const td = el.closest('tbody td');
    return td && this.#table.contains(td) ? td : null;
  }

  /**
   * 回傳 td 的邏輯位置。
   * 優先使用 data-r / data-c（由 TableRenderer 設定），
   * 沒有時退回 DOM rowIndex / cellIndex。
   */
  #pos(td) {
    if (td.dataset.r !== undefined && td.dataset.c !== undefined) {
      return { row: Number(td.dataset.r), col: Number(td.dataset.c) };
    }
    return { row: td.parentElement.rowIndex, col: td.cellIndex };
  }

  /** td 是否使用邏輯位置屬性 */
  #hasDataPos(td) {
    return td.dataset.r !== undefined && td.dataset.c !== undefined;
  }

  #clearHighlights() {
    this.#table.querySelectorAll('td.sel').forEach(td => td.classList.remove('sel'));
    this.#table.classList.remove('cross-sel');
  }

  #enterCrossSelMode() {
    this.#table.classList.add('cross-sel');
    window.getSelection().removeAllRanges();
  }

  #applySingleCell(td, isTouch) {
    this.#clearHighlights();
    if (isTouch) {
      td.classList.add('sel');
      window.getSelection().removeAllRanges();
    }
    // 電腦：不介入，保留原生選字行為
  }

  #applyColSelection(start, end) {
    this.#clearHighlights();
    this.#enterCrossSelMode();
    const sp = this.#pos(start), ep = this.#pos(end);
    const col    = sp.col;
    const minRow = Math.min(sp.row, ep.row);
    const maxRow = Math.max(sp.row, ep.row);

    if (this.#hasDataPos(start)) {
      // 用邏輯 data-r / data-c 篩選（正確處理 rowspan）
      this.#table.querySelectorAll('tbody td').forEach(td => {
        const r = Number(td.dataset.r), c = Number(td.dataset.c);
        if (c === col && r >= minRow && r <= maxRow) td.classList.add('sel');
      });
    } else {
      // 退回 DOM index
      for (let r = minRow; r <= maxRow; r++)
        this.#table.rows[r].cells[col].classList.add('sel');
    }
  }

  #applyRowSelection(start, end) {
    this.#clearHighlights();
    this.#enterCrossSelMode();
    const sp = this.#pos(start), ep = this.#pos(end);
    const minRow = Math.min(sp.row, ep.row), maxRow = Math.max(sp.row, ep.row);
    const minCol = Math.min(sp.col, ep.col), maxCol = Math.max(sp.col, ep.col);

    if (this.#hasDataPos(start)) {
      // 用邏輯 data-r / data-c 篩選（正確處理 rowspan / colspan）
      this.#table.querySelectorAll('tbody td').forEach(td => {
        const r = Number(td.dataset.r), c = Number(td.dataset.c);
        if (r >= minRow && r <= maxRow && c >= minCol && c <= maxCol)
          td.classList.add('sel');
      });
    } else {
      // 退回 DOM index
      for (let r = minRow; r <= maxRow; r++)
        for (let c = minCol; c <= maxCol; c++)
          this.#table.rows[r].cells[c].classList.add('sel');
    }
  }

  // ── Event binding ──────────────────────────────────────────────────

  #bindEvents() {
    this.#table.addEventListener('pointerdown', e => this.#onDown(e));
    this.#table.addEventListener('pointermove', e => this.#onMove(e));
    document.addEventListener('pointerup',     e => this.#onUp(e));
    document.addEventListener('pointercancel', e => this.#onCancel(e));
  }

  #onDown(e) {
    if (e.target.closest('a, button, [data-action]')) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const td = this.#tdAt(e.clientX, e.clientY);
    if (!td) return;

    this.#dragIsTouch = e.pointerType === 'touch';
    this.#startCell   = td;
    this.#currentCell = td;
    this.#hasCrossed  = false;
    this.#clearHighlights();

    if (this.#dragIsTouch) {
      this.#table.setPointerCapture(e.pointerId);
      this.#enterCrossSelMode();
    }

    this.dispatchEvent(new CustomEvent('selectionstart'));
  }

  #onMove(e) {
    if (!this.#startCell) return;
    const td = this.#tdAt(e.clientX, e.clientY);
    if (!td) return;
    if (!this.#hasCrossed && td === this.#startCell) return;

    if (!this.#hasCrossed) {
      this.#hasCrossed = true;
      if (!this.#dragIsTouch) {
        this.#table.setPointerCapture(e.pointerId);
        this.#enterCrossSelMode();
      }
      this.dispatchEvent(new CustomEvent('selectiondrag'));
    }

    if (td === this.#currentCell) return;
    this.#currentCell = td;

    const sp = this.#pos(this.#startCell), ep = this.#pos(this.#currentCell);
    if (sp.col === ep.col) this.#applyColSelection(this.#startCell, this.#currentCell);
    else                   this.#applyRowSelection(this.#startCell, this.#currentCell);
  }

  #onUp(e) {
    if (!this.#startCell) return;

    const isTouch = e.pointerType === 'touch';
    let mode, startRow, startCol, endRow, endCol;

    if (!this.#hasCrossed) {
      this.#applySingleCell(this.#startCell, isTouch);
      const p = this.#pos(this.#startCell);
      mode = 'single';
      startRow = endRow = p.row;
      startCol = endCol = p.col;
    } else {
      const sp = this.#pos(this.#startCell), ep = this.#pos(this.#currentCell);
      startRow = sp.row; startCol = sp.col;
      endRow   = ep.row; endCol   = ep.col;
      mode = (sp.col === ep.col) ? 'col' : 'row';
    }

    this.#startCell = null;

    this.dispatchEvent(new CustomEvent('selectioncommit', {
      detail: { isTouch, x: e.clientX, y: e.clientY, mode, startRow, startCol, endRow, endCol }
    }));
  }

  #onCancel(e) {
    if (!this.#startCell) return;
    this.#startCell = null;
    this.#clearHighlights();
    this.dispatchEvent(new CustomEvent('selectioncancel'));
  }
}
