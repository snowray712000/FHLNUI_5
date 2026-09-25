import { buildSelectionGroups } from '../shared/SelectionCells.js';

export class ClipboardAdapter {
  #controller;
  #table;
  #document;
  #options;
  #lastDetail = null;
  #onCommit;
  #onCancel;
  #onDestroy;
  #onCopy;

  constructor(controller, tableEl, options = {}) {
    this.#controller = controller;
    this.#table = tableEl;
    this.#document = tableEl.ownerDocument;
    this.#options = options;

    this.#onCommit = e => {
      this.#lastDetail = e.detail;
    };
    this.#onCancel = () => {
      this.#lastDetail = null;
    };
    this.#onDestroy = () => this.destroy();
    this.#onCopy = e => this.#handleCopy(e);

    controller.addEventListener('selectioncommit', this.#onCommit);
    controller.addEventListener('selectioncancel', this.#onCancel);
    controller.addEventListener('destroy', this.#onDestroy);
    this.#document.addEventListener('copy', this.#onCopy);
  }

  destroy() {
    if (!this.#controller) return;
    this.#controller.removeEventListener('selectioncommit', this.#onCommit);
    this.#controller.removeEventListener('selectioncancel', this.#onCancel);
    this.#controller.removeEventListener('destroy', this.#onDestroy);
    this.#document.removeEventListener('copy', this.#onCopy);
    this.#controller = null;
    this.#lastDetail = null;
  }

  #handleCopy(event) {
    if (!this.#lastDetail) return;

    if (this.#lastDetail.mode === 'single') {
      this.#options.onCopy?.({
        kind: 'single',
        plain: this.#document.defaultView.getSelection()?.toString() ?? '',
        html: null,
        detail: this.#lastDetail,
      });
      return;
    }

    const groups = buildSelectionGroups(this.#table, this.#lastDetail, this.#options);
    if (groups.length === 0) return;

    const plain = groups
      .map(row => row.map(cell => cell.textContent).join('\t'))
      .join('\n');

    const htmlRows = groups.map(row => {
      const cells = row.map(cell => `<td>${cell.innerHTML}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    const html = `<table border="1">${htmlRows}</table>`;
    const isSingleColumn = this.#lastDetail.startCol === this.#lastDetail.endCol;

    event.preventDefault();
    event.clipboardData.setData('text/plain', plain);
    if (!isSingleColumn) {
      event.clipboardData.setData('text/html', html);
    }

    this.#options.onCopy?.({
      kind: this.#lastDetail.mode,
      plain,
      html: isSingleColumn ? null : html,
      isSingleColumn,
      detail: this.#lastDetail,
    });
  }
}