export function getCellPosition(cell, options = {}) {
  const rowAttr = options.rowAttr ?? 'data-r';
  const colAttr = options.colAttr ?? 'data-c';
  const rowValue = cell.getAttribute(rowAttr);
  const colValue = cell.getAttribute(colAttr);

  if (rowValue != null && colValue != null) {
    return { row: Number(rowValue), col: Number(colValue) };
  }

  return { row: cell.parentElement.rowIndex, col: cell.cellIndex };
}

export function collectSelectionCells(tableEl, detail, options = {}) {
  const cellSelector = options.cellSelector ?? 'tbody td';
  const cells = [...tableEl.querySelectorAll(cellSelector)];

  if (!detail || !detail.mode || detail.mode === 'single') return [];

  return cells.filter(cell => {
    const pos = getCellPosition(cell, options);
    return pos.row >= detail.startRow && pos.row <= detail.endRow
      && pos.col >= detail.startCol && pos.col <= detail.endCol;
  });
}

export function buildSelectionGroups(tableEl, detail, options = {}) {
  if (!detail || !detail.mode || detail.mode === 'single') return [];

  const cells = collectSelectionCells(tableEl, detail, options);
  if (detail.startCol === detail.endCol) {
    return cells
      .sort((left, right) => getCellPosition(left, options).row - getCellPosition(right, options).row)
      .map(cell => [cell]);
  }

  const grouped = new Map();
  cells.forEach(cell => {
    const pos = getCellPosition(cell, options);
    if (!grouped.has(pos.row)) grouped.set(pos.row, []);
    grouped.get(pos.row).push(cell);
  });

  return [...grouped.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([, rowCells]) => rowCells.sort((left, right) => {
      return getCellPosition(left, options).col - getCellPosition(right, options).col;
    }));
}