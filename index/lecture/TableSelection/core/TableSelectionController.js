import { CellLocator } from './CellLocator.js';
import { buildSelectionSnapshot, createInitialSelectionState, resetSelectionState } from './SelectionState.js';
import { inferMode, isCollapsed } from './SelectionMath.js';

export class TableSelectionController extends EventTarget {
  #table;
  #locator;
  #state;
  #destroyed = false;
  #observer = null;
  #activePointerId = null;
  #hasCrossed = false;
  #hadCrossed = false;
  #anchorCaret = null;
  #options;
  #onPointerDown;
  #onPointerMove;
  #onPointerUp;
  #onPointerCancel;
  #initialInlineUserSelect;

  constructor(tableEl, options = {}) {
    super();

    if (!tableEl || typeof tableEl.addEventListener !== 'function') {
      throw new TypeError('TableSelectionController requires a table element.');
    }

    this.#table = tableEl;
    this.#options = options;
    this.#locator = new CellLocator(tableEl, options);
    this.#state = createInitialSelectionState();
    this.#initialInlineUserSelect = tableEl.style.userSelect;

    this.#onPointerDown = e => this.#handlePointerDown(e);
    this.#onPointerMove = e => this.#handlePointerMove(e);
    this.#onPointerUp = e => this.#handlePointerUp(e);
    this.#onPointerCancel = e => this.#handlePointerCancel(e);

    this.#bindEvents();
    if (options.autoDestroyWhenDisconnected) this.#observeDisconnect();
  }

  destroy() {
    if (this.#destroyed) return;

    this.#destroyed = true;
    this.#restoreNativeSelection();
    this.#releasePointerCapture();
    this.#unbindEvents();
    this.#observer?.disconnect();
    this.#observer = null;
    this.#activePointerId = null;
    this.#hasCrossed = false;
    this.#hadCrossed = false;
    this.#anchorCaret = null;
    this.#state = resetSelectionState();
    this.dispatchEvent(new CustomEvent('destroy'));
  }

  clear() {
    const wasActive = this.#state.phase === 'pressed' || this.#state.phase === 'dragging';
    const detail = this.getState();

    this.#restoreNativeSelection();
    this.#releasePointerCapture();
    this.#activePointerId = null;
    this.#hasCrossed = false;
    this.#hadCrossed = false;
    this.#anchorCaret = null;
    this.#state = resetSelectionState();

    if (wasActive) {
      this.dispatchEvent(new CustomEvent('selectioncancel', { detail }));
    }
  }

  refresh() {
    if (this.#destroyed) return;
    this.#locator = new CellLocator(this.#table, this.#options);
  }

  getState() {
    return buildSelectionSnapshot(this.#state, {
      table: this.#table,
      destroyed: this.#destroyed,
    });
  }

  isDestroyed() {
    return this.#destroyed;
  }

  #bindEvents() {
    const doc = this.#table.ownerDocument;
    this.#table.addEventListener('pointerdown', this.#onPointerDown);
    doc.addEventListener('pointermove', this.#onPointerMove);
    doc.addEventListener('pointerup', this.#onPointerUp);
    doc.addEventListener('pointercancel', this.#onPointerCancel);
  }

  #unbindEvents() {
    const doc = this.#table.ownerDocument;
    this.#table.removeEventListener('pointerdown', this.#onPointerDown);
    doc.removeEventListener('pointermove', this.#onPointerMove);
    doc.removeEventListener('pointerup', this.#onPointerUp);
    doc.removeEventListener('pointercancel', this.#onPointerCancel);
  }

  #observeDisconnect() {
    const root = this.#table.ownerDocument.body;
    if (!root || typeof MutationObserver === 'undefined') return;

    this.#observer = new MutationObserver(() => {
      if (!this.#table.isConnected) this.destroy();
    });

    this.#observer.observe(root, { childList: true, subtree: true });
  }

  #handlePointerDown(event) {
    if (this.#destroyed) return;
    if (this.#activePointerId != null) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    if (event.target.closest('a, button, input, textarea, select, option, [data-action]')) return;

    const cell = this.#locator.cellAtPoint(event.clientX, event.clientY);
    if (!cell) return;

    const pos = this.#locator.getPosition(cell);
    this.#activePointerId = event.pointerId;
    this.#hasCrossed = false;
    this.#hadCrossed = false;
    this.#anchorCaret = this.#resolveCaretBoundary(event.clientX, event.clientY, cell);
    this.#state = {
      phase: 'pressed',
      pointerType: event.pointerType,
      anchorRow: pos.row,
      anchorCol: pos.col,
      focusRow: pos.row,
      focusCol: pos.col,
      mode: 'single',
    };

    this.#capturePointer(event.pointerId);
    this.#dispatchSelectionEvent('selectionstart', event, { cell });
  }

  #handlePointerMove(event) {
    if (!this.#isActivePointer(event)) return;
    if (this.#state.phase !== 'pressed' && this.#state.phase !== 'dragging') return;

    const cell = this.#locator.cellAtPoint(event.clientX, event.clientY);
    if (!cell) return;

    const pos = this.#locator.getPosition(cell);
    if (pos.row === this.#state.focusRow && pos.col === this.#state.focusCol) {
      if (this.#hadCrossed && this.#state.mode === 'single') {
        this.#restoreSingleCellSelection(cell, event.clientX, event.clientY, event.pointerType);
      }
      return;
    }

    const anchor = { row: this.#state.anchorRow, col: this.#state.anchorCol };
    const nextMode = inferMode(anchor, pos);
    const wasCollapsed = isCollapsed(anchor, {
      row: this.#state.focusRow,
      col: this.#state.focusCol,
    });

    if (nextMode === 'crossed') {
      event.preventDefault();
      this.#enterCrossedSelection();
    } else if (this.#hasCrossed) {
      this.#restoreSingleCellSelection(cell, event.clientX, event.clientY, event.pointerType);
      this.#hasCrossed = false;
    }

    this.#state = {
      ...this.#state,
      phase: nextMode === 'single' ? 'pressed' : 'dragging',
      focusRow: pos.row,
      focusCol: pos.col,
      mode: nextMode,
    };

    if (wasCollapsed && nextMode === 'crossed') {
      this.#hasCrossed = true;
      this.#dispatchSelectionEvent('selectiondrag', event, { cell });
    }
    this.#dispatchSelectionEvent('selectionchange', event, { cell });
  }

  #handlePointerUp(event) {
    if (!this.#isActivePointer(event)) return;
    if (this.#state.phase === 'idle') return;

    const cell = this.#locator.cellAtPoint(event.clientX, event.clientY);
    if (cell) {
      const pos = this.#locator.getPosition(cell);
      this.#state = {
        ...this.#state,
        focusRow: pos.row,
        focusCol: pos.col,
      };
    }

    this.#state = {
      ...this.#state,
      phase: 'committed',
      mode: inferMode(
        { row: this.#state.anchorRow, col: this.#state.anchorCol },
        { row: this.#state.focusRow, col: this.#state.focusCol }
      ),
    };

    if (this.#state.mode === 'single' && this.#hasCrossed && cell) {
      this.#restoreSingleCellSelection(cell, event.clientX, event.clientY, event.pointerType);
      this.#hasCrossed = false;
    }

    const detail = this.#buildEventDetail(event, { cell });
    if (detail.mode === 'single' && !this.#hadCrossed) {
      this.dispatchEvent(new CustomEvent('cellclick', { detail }));
    }
    this.dispatchEvent(new CustomEvent('selectioncommit', { detail }));

    this.#restoreNativeSelection();
    this.#releasePointerCapture();
    this.#activePointerId = null;
    this.#hasCrossed = false;
    this.#hadCrossed = false;
    this.#anchorCaret = null;
  }

  #handlePointerCancel(event) {
    if (!this.#isActivePointer(event)) return;

    this.#state = {
      ...this.#state,
      phase: 'canceled',
    };
    this.#dispatchSelectionEvent('selectioncancel', event);

    this.#restoreNativeSelection();
    this.#releasePointerCapture();
    this.#activePointerId = null;
    this.#hasCrossed = false;
    this.#hadCrossed = false;
    this.#anchorCaret = null;
    this.#state = resetSelectionState();
  }

  #isActivePointer(event) {
    return this.#activePointerId != null && event.pointerId === this.#activePointerId;
  }

  #capturePointer(pointerId) {
    if (typeof this.#table.setPointerCapture !== 'function') return;
    try {
      this.#table.setPointerCapture(pointerId);
    } catch {
      // Ignore browsers or edge cases that reject capture.
    }
  }

  #releasePointerCapture() {
    if (this.#activePointerId == null) return;
    if (typeof this.#table.releasePointerCapture !== 'function') return;
    try {
      if (this.#table.hasPointerCapture?.(this.#activePointerId)) {
        this.#table.releasePointerCapture(this.#activePointerId);
      }
    } catch {
      // Ignore browsers or edge cases that reject release.
    }
  }

  #enterCrossedSelection() {
    if (this.#hasCrossed) {
      this.#clearNativeSelection();
      return;
    }

    this.#hasCrossed = true;
    this.#hadCrossed = true;
    this.#table.style.userSelect = 'none';
    this.#clearNativeSelection();
  }

  #restoreNativeSelection() {
    this.#table.style.userSelect = this.#initialInlineUserSelect;
  }

  #clearNativeSelection() {
    this.#table.ownerDocument.defaultView?.getSelection()?.removeAllRanges();
  }

  #restoreSingleCellSelection(cell, clientX, clientY, pointerType) {
    this.#restoreNativeSelection();
    this.#clearNativeSelection();
    if (pointerType === 'touch') return;

    const selection = this.#table.ownerDocument.defaultView?.getSelection();
    if (!selection) return;

    const anchorCaret = this.#anchorCaret ?? this.#resolveCaretBoundary(clientX, clientY, cell);
    const focusCaret = this.#resolveCaretBoundary(clientX, clientY, cell) ?? anchorCaret;
    if (!anchorCaret || !focusCaret) return;

    if (typeof selection.setBaseAndExtent === 'function') {
      selection.setBaseAndExtent(
        anchorCaret.node,
        anchorCaret.offset,
        focusCaret.node,
        focusCaret.offset
      );
      return;
    }

    if (typeof selection.collapse === 'function' && typeof selection.extend === 'function') {
      selection.collapse(anchorCaret.node, anchorCaret.offset);
      selection.extend(focusCaret.node, focusCaret.offset);
      return;
    }

    const range = this.#table.ownerDocument.createRange();
    if (this.#compareCaretBoundaries(anchorCaret, focusCaret) <= 0) {
      range.setStart(anchorCaret.node, anchorCaret.offset);
      range.setEnd(focusCaret.node, focusCaret.offset);
    } else {
      range.setStart(focusCaret.node, focusCaret.offset);
      range.setEnd(anchorCaret.node, anchorCaret.offset);
    }
    selection.addRange(range);
  }

  #resolveCaretBoundary(clientX, clientY, cell) {
    const doc = this.#table.ownerDocument;

    if (typeof doc.caretPositionFromPoint === 'function') {
      const caret = doc.caretPositionFromPoint(clientX, clientY);
      if (caret?.offsetNode && cell.contains(caret.offsetNode)) {
        return { node: caret.offsetNode, offset: caret.offset };
      }
    }

    if (typeof doc.caretRangeFromPoint === 'function') {
      const range = doc.caretRangeFromPoint(clientX, clientY);
      if (range?.startContainer && cell.contains(range.startContainer)) {
        return { node: range.startContainer, offset: range.startOffset };
      }
    }

    return this.#fallbackCaretBoundary(cell, clientX);
  }

  #fallbackCaretBoundary(cell, clientX) {
    const textNodes = [];
    const walker = this.#table.ownerDocument.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    if (textNodes.length === 0) {
      const rect = cell.getBoundingClientRect();
      const offset = clientX <= rect.left + rect.width / 2 ? 0 : cell.childNodes.length;
      return { node: cell, offset };
    }

    const rect = cell.getBoundingClientRect();
    if (clientX <= rect.left + rect.width / 2) {
      return { node: textNodes[0], offset: 0 };
    }

    const lastNode = textNodes[textNodes.length - 1];
    return { node: lastNode, offset: lastNode.textContent?.length ?? 0 };
  }

  #compareCaretBoundaries(left, right) {
    if (left.node === right.node) {
      return left.offset - right.offset;
    }

    const position = left.node.compareDocumentPosition(right.node);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  }

  #dispatchSelectionEvent(type, nativeEvent, extras = {}) {
    this.dispatchEvent(new CustomEvent(type, {
      detail: this.#buildEventDetail(nativeEvent, extras),
    }));
  }

  #buildEventDetail(nativeEvent, extras = {}) {
    return buildSelectionSnapshot(this.#state, {
      table: this.#table,
      nativeEvent,
      ...extras,
    });
  }
}