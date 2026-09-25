export class SelectionStatusPresenter {
  #controller;
  #modeBadge;
  #statusDetail;
  #handlers;
  #texts;

  constructor(controller, elements, options = {}) {
    this.#controller = controller;
    this.#modeBadge = elements.modeBadge;
    this.#statusDetail = elements.statusDetail;
    this.#texts = {
      idle: options.idleText ?? '— 尚未選取 —',
      dragging: options.draggingText ?? '拖曳中…',
      single: options.singleText ?? '單格字元選取',
      crossed: options.crossedText ?? '跨 cell 選取',
    };

    this.#handlers = {
      start: () => this.#renderStart(),
      change: e => this.#renderDetail(e.detail),
      commit: e => this.#renderDetail(e.detail),
      cancel: () => this.#renderIdle(),
      destroy: () => this.destroy(),
    };

    controller.addEventListener('selectionstart', this.#handlers.start);
    controller.addEventListener('selectionchange', this.#handlers.change);
    controller.addEventListener('selectioncommit', this.#handlers.commit);
    controller.addEventListener('selectioncancel', this.#handlers.cancel);
    controller.addEventListener('destroy', this.#handlers.destroy);

    this.#renderIdle();
  }

  destroy() {
    if (!this.#controller) return;
    this.#controller.removeEventListener('selectionstart', this.#handlers.start);
    this.#controller.removeEventListener('selectionchange', this.#handlers.change);
    this.#controller.removeEventListener('selectioncommit', this.#handlers.commit);
    this.#controller.removeEventListener('selectioncancel', this.#handlers.cancel);
    this.#controller.removeEventListener('destroy', this.#handlers.destroy);
    this.#controller = null;
  }

  #renderIdle() {
    this.#modeBadge.textContent = this.#texts.idle;
    this.#modeBadge.className = 'badge-none';
    this.#statusDetail.textContent = '';
  }

  #renderStart() {
    this.#modeBadge.textContent = this.#texts.dragging;
    this.#modeBadge.className = 'badge-none';
    this.#statusDetail.textContent = '';
  }

  #renderDetail(detail) {
    if (!detail || !detail.mode) return;

    if (detail.mode === 'single') {
      this.#modeBadge.textContent = this.#texts.single;
      this.#modeBadge.className = 'badge-single';
      this.#statusDetail.textContent = `(列${detail.row},欄${detail.col}) — 可拖曳選取字元`;
      return;
    }

    this.#modeBadge.textContent = this.#texts.crossed;
    this.#modeBadge.className = 'badge-crossed';
    const count = (detail.endRow - detail.startRow + 1) * (detail.endCol - detail.startCol + 1);
    this.#statusDetail.textContent = `(列${detail.anchorRow},欄${detail.anchorCol}) → (列${detail.focusRow},欄${detail.focusCol})，共 ${count} 格`;
  }
}