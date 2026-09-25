const table        = document.getElementById('demo');
const modeBadge    = document.getElementById('mode-badge');
const statusDetail = document.getElementById('status-detail');
const copyOutput   = document.getElementById('copy-output');
const btnCopy      = document.getElementById('btn-copy');
const ctxMenu      = document.getElementById('ctx-menu');
const ctxCopy      = document.getElementById('ctx-copy');
const ctxNative    = document.getElementById('ctx-native');

let startCell   = null;
let currentCell = null;
let hasCrossed  = false;
let currentMode = null;   // 'col' | 'row' | 'single' | null
let rowGroups   = null;

// ── helpers ───────────────────────────────────────────────────────────

function tdAt(x, y) {
  const el = document.elementFromPoint(x, y);
  return el?.closest('#demo tbody td') ?? null;
}

function pos(td) {
  return { row: td.parentElement.rowIndex, col: td.cellIndex };
}

function clearHighlights() {
  table.querySelectorAll('td.col-sel, td.row-sel').forEach(td =>
    td.classList.remove('col-sel', 'row-sel'));
}

function setStatus(mode, detail) {
  currentMode = mode;
  const cfg = {
    col:    { text: 'Column-based',   cls: 'badge-col'    },
    row:    { text: 'Row-based 矩形',  cls: 'badge-row'    },
    single: { text: '單格字元選取',    cls: 'badge-single' },
  };
  modeBadge.textContent = cfg[mode].text;
  modeBadge.className   = cfg[mode].cls;
  statusDetail.textContent = detail;
  btnCopy.disabled = false;
  ctxCopy.classList.remove('disabled');
}

// ── Selection logic ───────────────────────────────────────────────────

function applySingleCell(td) {
  clearHighlights();
  rowGroups = null;
  const sel = window.getSelection();
  sel.removeAllRanges();
  const range = document.createRange();
  range.selectNodeContents(td);
  sel.addRange(range);
  const p = pos(td);
  setStatus('single', `(列${p.row},欄${p.col}) — 整格選取`);
}

function applyColSelection(start, end) {
  clearHighlights();
  const sp = pos(start), ep = pos(end);
  const col    = sp.col;
  const minRow = Math.min(sp.row, ep.row);
  const maxRow = Math.max(sp.row, ep.row);
  window.getSelection().removeAllRanges();
  for (let r = minRow; r <= maxRow; r++)
    table.rows[r].cells[col].classList.add('col-sel');
  setStatus('col', `欄 ${col}，列 ${minRow}–${maxRow}（${maxRow - minRow + 1} 格）`);
}

function buildRowGroups(start, end) {
  const sp = pos(start), ep = pos(end);
  const minRow = Math.min(sp.row, ep.row), maxRow = Math.max(sp.row, ep.row);
  const minCol = Math.min(sp.col, ep.col), maxCol = Math.max(sp.col, ep.col);
  const groups = [];
  for (let r = minRow; r <= maxRow; r++) {
    const row = [];
    for (let c = minCol; c <= maxCol; c++) row.push(table.rows[r].cells[c]);
    groups.push(row);
  }
  return groups;
}

function applyRowSelection(start, end) {
  clearHighlights();
  rowGroups = buildRowGroups(start, end);
  window.getSelection().removeAllRanges();
  rowGroups.forEach(row => row.forEach(td => td.classList.add('row-sel')));
  const sp = pos(start), ep = pos(end);
  const minRow = Math.min(sp.row, ep.row), maxRow = Math.max(sp.row, ep.row);
  const minCol = Math.min(sp.col, ep.col), maxCol = Math.max(sp.col, ep.col);
  setStatus('row',
    `矩形 列${minRow}–${maxRow} × 欄${minCol}–${maxCol}（${rowGroups.flat().length} 格）`);
}

// ── Copy logic（三種觸發方式共用）────────────────────────────────────

function buildCopyData() {
  if (currentMode === 'col') {
    const cells = [...table.querySelectorAll('td.col-sel')];
    const plain    = cells.map(td => td.textContent).join('\n');
    const htmlRows = cells.map(td => `<tr><td>${td.innerHTML}</td></tr>`).join('');
    return { plain, html: `<table border="1">${htmlRows}</table>` };
  }
  if (currentMode === 'row') {
    const groups = rowGroups ?? [];
    const plain  = groups.map(r => r.map(td => td.textContent).join('\t')).join('\n');
    const htmlRows = groups.map(r =>
      `<tr>${r.map(td => `<td>${td.innerHTML}</td>`).join('')}</tr>`).join('');
    return { plain, html: `<table border="1">${htmlRows}</table>` };
  }
  if (currentMode === 'single') {
    return { plain: window.getSelection().toString(), html: null };
  }
  return { plain: null, html: null };
}

async function performCopy() {
  const { plain, html } = buildCopyData();
  if (!plain && plain !== '') return;

  let succeeded = false;

  // 優先：navigator.clipboard（現代瀏覽器，支援 HTML）
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
    } catch (_) { /* fallback below */ }
  }

  // Fallback：textarea + execCommand（舊瀏覽器 / file:// 不允許 clipboard API）
  if (!succeeded) {
    const ta = Object.assign(document.createElement('textarea'), {
      value: plain,
      style: 'position:fixed;opacity:0;',
    });
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  copyOutput.textContent =
    (html ? '[HTML table + 純文字]' : '[純文字]') + '\n' + plain;
}

// ── Ctrl+C 仍保留（透過 copy 事件）──────────────────────────────────

document.addEventListener('copy', e => {
  if (!currentMode) return;
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

// ── Mouse events ──────────────────────────────────────────────────────

function onDragStart(td) {
  startCell   = td;
  currentCell = td;
  hasCrossed  = false;
  currentMode = null;
  rowGroups   = null;
  clearHighlights();
  btnCopy.disabled = true;
  ctxCopy.classList.add('disabled');
  modeBadge.textContent = '拖曳中…';
  modeBadge.className   = 'badge-none';
  statusDetail.textContent = '';
}

function onDragMove(x, y, isTouch) {
  if (!startCell) return;
  const td = tdAt(x, y);
  if (!td) return;
  if (!hasCrossed && td === startCell) return;

  hasCrossed = true;
  if (td === currentCell) return;
  currentCell = td;

  if (td === startCell) { applySingleCell(td); return; }

  window.getSelection().removeAllRanges();
  const sp = pos(startCell), ep = pos(currentCell);
  if (sp.col === ep.col) applyColSelection(startCell, currentCell);
  else                   applyRowSelection(startCell, currentCell);
}

function onDragEnd() {
  if (!startCell) return;
  if (!hasCrossed) {
    const p = pos(startCell);
    setStatus('single', `(列${p.row},欄${p.col}) — 可拖曳選取字元`);
  }
  startCell = null;
}

table.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  const td = tdAt(e.clientX, e.clientY);
  if (td) onDragStart(td);
});

document.addEventListener('mousemove', e => {
  if (!startCell || !(e.buttons & 1)) return;
  e.preventDefault();
  onDragMove(e.clientX, e.clientY, false);
});

document.addEventListener('mouseup', () => onDragEnd());

// ── Touch events ──────────────────────────────────────────────────────

table.addEventListener('touchstart', e => {
  const t = e.touches[0];
  const td = tdAt(t.clientX, t.clientY);
  if (td) onDragStart(td);
}, { passive: true });

table.addEventListener('touchmove', e => {
  if (!startCell) return;
  const t = e.touches[0];
  const td = tdAt(t.clientX, t.clientY);
  if (td && td !== startCell) e.preventDefault();
  onDragMove(t.clientX, t.clientY, true);
}, { passive: false });

table.addEventListener('touchend', () => onDragEnd());

// ── 右鍵 Context Menu ─────────────────────────────────────────────────

function showCtxMenu(x, y) {
  ctxMenu.style.left    = x + 'px';
  ctxMenu.style.top     = y + 'px';
  ctxMenu.style.display = 'block';
  const r = ctxMenu.getBoundingClientRect();
  if (r.right  > window.innerWidth)  ctxMenu.style.left = (x - r.width)  + 'px';
  if (r.bottom > window.innerHeight) ctxMenu.style.top  = (y - r.height) + 'px';
}

function hideCtxMenu() { ctxMenu.style.display = 'none'; }

let bypassNextContextMenu = false;

table.addEventListener('contextmenu', e => {
  if (bypassNextContextMenu) {
    bypassNextContextMenu = false;
    return;
  }
  e.preventDefault();
  showCtxMenu(e.clientX, e.clientY);
});

document.addEventListener('click',  e => { if (!ctxMenu.contains(e.target)) hideCtxMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') hideCtxMenu(); });

ctxCopy.addEventListener('click', () => {
  if (ctxCopy.classList.contains('disabled')) return;
  hideCtxMenu();
  performCopy();
});

ctxNative.addEventListener('click', () => {
  hideCtxMenu();
  bypassNextContextMenu = true;
  statusDetail.textContent = '請再按一次右鍵，即顯示瀏覽器原本選單';
});

// ── 面板複製按鈕 ───────────────────────────────────────────────────────

btnCopy.addEventListener('click', () => performCopy());
