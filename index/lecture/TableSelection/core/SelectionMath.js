export function isSameCell(anchor, focus) {
  if (!anchor || !focus) return false;
  return anchor.row === focus.row && anchor.col === focus.col;
}

export function inferMode(anchor, focus) {
  if (!anchor || !focus) return null;
  if (isSameCell(anchor, focus)) return 'single';
  return 'crossed';
}

export function normalizeRange(anchor, focus) {
  if (!anchor || !focus) return null;

  return {
    startRow: Math.min(anchor.row, focus.row),
    startCol: Math.min(anchor.col, focus.col),
    endRow: Math.max(anchor.row, focus.row),
    endCol: Math.max(anchor.col, focus.col),
  };
}

export function isCollapsed(anchor, focus) {
  return isSameCell(anchor, focus);
}