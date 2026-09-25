import { CtxMenu }       from './CtxMenu.js';
import { TableSelector } from './TableSelector.js';

const table        = document.getElementById('demo');
const modeBadge    = document.getElementById('mode-badge');
const statusDetail = document.getElementById('status-detail');
const copyOutput   = document.getElementById('copy-output');
const btnCopy      = document.getElementById('btn-copy');

const ctxMenu = new CtxMenu(document.getElementById('ctx-menu'));
const sel     = new TableSelector(table);

// ── 選取狀態（由 selectioncommit detail 填入，copy 時使用） ──────────
let lastDetail = null;

// ── listener: selectionstart → 重置面板 ───────────────────────────────
sel.addEventListener('selectionstart', () => {
  lastDetail = null;
  modeBadge.textContent    = '— 尚未選取 —';
  modeBadge.className      = 'badge-none';
  statusDetail.textContent = '';
  btnCopy.disabled         = true;
});

// ── listener: selectiondrag → 拖曳中提示 ─────────────────────────────
sel.addEventListener('selectiondrag', () => {
  modeBadge.textContent = '拖曳中…';
  modeBadge.className   = 'badge-none';
});

// ── listener: selectioncommit → 更新狀態面板 ─────────────────────────
sel.addEventListener('selectioncommit', ({ detail }) => {
  lastDetail = detail;
  const { mode, startRow, startCol, endRow, endCol, isTouch } = detail;

  if (mode === 'single') {
    modeBadge.textContent    = '單格';
    modeBadge.className      = 'badge-single';
    statusDetail.textContent = `(列${startRow},欄${startCol}) — ${isTouch ? '整格' : '原生選取'}`;
  } else if (mode === 'col') {
    const col    = startCol;
    const minRow = Math.min(startRow, endRow), maxRow = Math.max(startRow, endRow);
    modeBadge.textContent    = 'Column-based';
    modeBadge.className      = 'badge-sel';
    statusDetail.textContent = `欄 ${col}，列 ${minRow}–${maxRow}（${maxRow - minRow + 1} 格）`;
  } else {
    const minRow = Math.min(startRow, endRow), maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol), maxCol = Math.max(startCol, endCol);
    const count  = (maxRow - minRow + 1) * (maxCol - minCol + 1);
    modeBadge.textContent    = 'Row-based 矩形';
    modeBadge.className      = 'badge-sel';
    statusDetail.textContent = `矩形 列${minRow}–${maxRow} × 欄${minCol}–${maxCol}（${count} 格）`;
  }
  btnCopy.disabled = false;
});

// ── listener: selectioncommit → context menu（業務規則在此端決定） ──
// 電腦 single 模式不自動跳選單（保留原生選字體驗）；其餘情況自動跳出。
sel.addEventListener('selectioncommit', ({ detail }) => {
  if (detail.isTouch || detail.mode !== 'single') {
    showCtxMenu(detail.x, detail.y);
  }
});

// ── listener: selectioncancel → 重置 ─────────────────────────────────
sel.addEventListener('selectioncancel', () => {
  lastDetail               = null;
  modeBadge.textContent    = '— 尚未選取 —';
  modeBadge.className      = 'badge-none';
  statusDetail.textContent = '';
  btnCopy.disabled         = true;
});

// ── Copy logic ────────────────────────────────────────────────────────

function buildCopyData() {
  if (!lastDetail) return { plain: null, html: null };
  const { mode, startRow, startCol, endRow, endCol } = lastDetail;

  if (mode === 'col') {
    const col    = startCol;
    const minRow = Math.min(startRow, endRow), maxRow = Math.max(startRow, endRow);
    const cells  = [];
    for (let r = minRow; r <= maxRow; r++) cells.push(table.rows[r].cells[col]);
    const plain    = cells.map(td => td.textContent).join('\n');
    const htmlRows = cells.map(td => `<tr><td>${td.innerHTML}</td></tr>`).join('');
    return { plain, html: `<table border="1">${htmlRows}</table>` };
  }

  if (mode === 'row') {
    const minRow = Math.min(startRow, endRow), maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol), maxCol = Math.max(startCol, endCol);
    const groups = [];
    for (let r = minRow; r <= maxRow; r++) {
      const row = [];
      for (let c = minCol; c <= maxCol; c++) row.push(table.rows[r].cells[c]);
      groups.push(row);
    }
    const plain    = groups.map(r => r.map(td => td.textContent).join('\t')).join('\n');
    const htmlRows = groups.map(r =>
      `<tr>${r.map(td => `<td>${td.innerHTML}</td>`).join('')}</tr>`).join('');
    return { plain, html: `<table border="1">${htmlRows}</table>` };
  }

  if (mode === 'single') {
    const selText = window.getSelection().toString();
    const selCell = table.querySelector('td.sel');
    const plain   = selText || selCell?.textContent || '';
    return { plain, html: null };
  }

  return { plain: null, html: null };
}

async function performCopy() {
  const { plain, html } = buildCopyData();
  if (plain === null) return;

  let succeeded = false;
  if (navigator.clipboard) {
    try {
      if (html && navigator.clipboard.write) {
        await navigator.clipboard.write([new ClipboardItem({
          'text/html':  new Blob([html],  { type: 'text/html'  }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        })]);
      } else {
        await navigator.clipboard.writeText(plain);
      }
      succeeded = true;
    } catch (_) {}
  }
  if (!succeeded) {
    const ta = Object.assign(document.createElement('textarea'), {
      value: plain, style: 'position:fixed;opacity:0;',
    });
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  copyOutput.textContent =
    (html ? '[HTML table + 純文字]' : '[純文字]') + '\n' + plain;
}

// ── Ctrl+C ────────────────────────────────────────────────────────────
document.addEventListener('copy', e => {
  if (!lastDetail) return;
  e.preventDefault();
  const { plain, html } = buildCopyData();
  if (html) {
    e.clipboardData.setData('text/html',  html);
    e.clipboardData.setData('text/plain', plain);
  } else if (plain !== null) {
    e.clipboardData.setData('text/plain', plain);
  }
  copyOutput.textContent =
    (html ? '[HTML table + 純文字]' : '[純文字]') + '\n' + (plain ?? '');
});

// ── Context Menu ──────────────────────────────────────────────────────
function showCtxMenu(x, y) {
  ctxMenu.show(x, y, [
    { label: '📋 複製', onClick: performCopy, disabled: !lastDetail },
  ]);
}

// ── 面板複製按鈕 ───────────────────────────────────────────────────────
btnCopy.addEventListener('click', () => performCopy());
