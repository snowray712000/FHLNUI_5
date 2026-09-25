import { collectSelectionCells } from '../shared/SelectionCells.js';

export class SelectionClassRenderer {
  #controller;
  #table;
  #options;
  #classNames;
  #handlers;

  constructor(controller, tableEl, options = {}) {
    this.#controller = controller;
    this.#table = tableEl;
    this.#options = options;
    this.#classNames = {
      active: options.activeClass ?? 'ts-cross-sel',
      crossed: options.crossedClass ?? 'ts-sel-crossed',
      single: options.singleClass ?? 'ts-sel-single',
    };

    this.#handlers = {
      start: e => this.#handleStart(e),
      change: e => this.#renderFromDetail(e.detail),
      commit: e => this.#renderFromDetail(e.detail),
      cancel: () => this.clear(),
      destroy: () => this.destroy(),
    };

    controller.addEventListener('selectionstart', this.#handlers.start);
    controller.addEventListener('selectionchange', this.#handlers.change);
    controller.addEventListener('selectioncommit', this.#handlers.commit);
    controller.addEventListener('selectioncancel', this.#handlers.cancel);
    controller.addEventListener('destroy', this.#handlers.destroy);
  }

  clear() {
    this.#table.classList.remove(this.#classNames.active);
    this.#table.querySelectorAll('td').forEach(cell => {
      cell.classList.remove(
        this.#classNames.crossed,
        this.#classNames.single
      );
    });
  }

  destroy() {
    if (!this.#controller) return;
    this.clear();
    this.#controller.removeEventListener('selectionstart', this.#handlers.start);
    this.#controller.removeEventListener('selectionchange', this.#handlers.change);
    this.#controller.removeEventListener('selectioncommit', this.#handlers.commit);
    this.#controller.removeEventListener('selectioncancel', this.#handlers.cancel);
    this.#controller.removeEventListener('destroy', this.#handlers.destroy);
    this.#controller = null;
  }

  #handleStart() {
    this.clear();
  }

  #renderFromDetail(detail) {
    this.clear();
    if (!detail || !detail.mode) return;

    if (detail.mode === 'single') {
      if (detail.pointerType === 'touch' && detail.cell) {
        detail.cell.classList.add(this.#classNames.single);
      }
      return;
    }

    this.#table.classList.add(this.#classNames.active);
    collectSelectionCells(this.#table, detail, this.#options).forEach(cell => {
      cell.classList.add(this.#classNames.crossed);
    });
  }
}