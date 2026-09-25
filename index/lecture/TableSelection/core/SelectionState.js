import { inferMode, normalizeRange } from './SelectionMath.js';

export function createInitialSelectionState() {
  return {
    phase: 'idle',
    pointerType: null,
    anchorRow: null,
    anchorCol: null,
    focusRow: null,
    focusCol: null,
    mode: null,
  };
}

export function resetSelectionState() {
  return createInitialSelectionState();
}

export function buildSelectionSnapshot(state, extras = {}) {
  const hasAnchor = state.anchorRow != null && state.anchorCol != null;
  const hasFocus = state.focusRow != null && state.focusCol != null;
  const anchor = hasAnchor ? { row: state.anchorRow, col: state.anchorCol } : null;
  const focus = hasFocus ? { row: state.focusRow, col: state.focusCol } : null;
  const range = normalizeRange(anchor, focus);
  const mode = state.mode ?? inferMode(anchor, focus);

  return {
    phase: state.phase,
    pointerType: state.pointerType,
    mode,
    row: focus?.row ?? null,
    col: focus?.col ?? null,
    anchorRow: anchor?.row ?? null,
    anchorCol: anchor?.col ?? null,
    focusRow: focus?.row ?? null,
    focusCol: focus?.col ?? null,
    startRow: range?.startRow ?? null,
    startCol: range?.startCol ?? null,
    endRow: range?.endRow ?? null,
    endCol: range?.endCol ?? null,
    ...extras,
  };
}