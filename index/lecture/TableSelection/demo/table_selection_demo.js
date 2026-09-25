import { TableSelectionController } from '../core/TableSelectionController.js';
import { SelectionClassRenderer } from '../renderers/SelectionClassRenderer.js';
import { ClipboardAdapter } from '../adapters/ClipboardAdapter.js';
import { SelectionStatusPresenter } from '../ui/SelectionStatusPresenter.js';

const table = document.getElementById('demo');
const modeBadge = document.getElementById('mode-badge');
const statusDetail = document.getElementById('status-detail');
const copyOutput = document.getElementById('copy-output');

const selector = new TableSelectionController(table, {
  autoDestroyWhenDisconnected: true,
});

new SelectionClassRenderer(selector, table);

new SelectionStatusPresenter(selector, {
  modeBadge,
  statusDetail,
});

new ClipboardAdapter(selector, table, {
  onCopy(result) {
    if (result.kind === 'single') {
      copyOutput.textContent = `[原生字元選取]\n${result.plain}`;
      return;
    }

    if (result.isSingleColumn) {
      copyOutput.textContent = `[純文字]\n${result.plain}`;
      return;
    }

    copyOutput.textContent = `[HTML table + 純文字]\n${result.plain}`;
  },
});