export class CellLocator {
  #table;
  #cellSelector;
  #rowAttr;
  #colAttr;
  #positionResolver;

  constructor(tableEl, options = {}) {
    this.#table = tableEl;
    this.#cellSelector = options.cellSelector ?? 'tbody td';
    this.#rowAttr = options.rowAttr ?? 'data-r';
    this.#colAttr = options.colAttr ?? 'data-c';
    this.#positionResolver = options.positionResolver ?? null;
  }

  cellAtPoint(x, y) {
    const doc = this.#table.ownerDocument;
    const element = doc.elementFromPoint(x, y);
    if (!element) return null;

    const cell = element.closest(this.#cellSelector);
    if (!cell || !this.#table.contains(cell)) return null;
    return cell;
  }

  normalizeCell(target) {
    if (!target) return null;
    const cell = target.closest?.(this.#cellSelector) ?? null;
    if (!cell || !this.#table.contains(cell)) return null;
    return cell;
  }

  getPosition(cell) {
    if (!cell) return null;

    if (this.#positionResolver) {
      const resolved = this.#positionResolver(cell, this.#table);
      if (resolved?.row != null && resolved?.col != null) {
        return { row: Number(resolved.row), col: Number(resolved.col) };
      }
    }

    const rowValue = cell.getAttribute(this.#rowAttr);
    const colValue = cell.getAttribute(this.#colAttr);
    if (rowValue != null && colValue != null) {
      return { row: Number(rowValue), col: Number(colValue) };
    }

    return { row: cell.parentElement.rowIndex, col: cell.cellIndex };
  }
}