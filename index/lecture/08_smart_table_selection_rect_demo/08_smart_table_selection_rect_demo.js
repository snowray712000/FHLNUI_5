import { CtxMenu } from './CtxMenu.js';

const table        = document.getElementById('demo');
const modeBadge    = document.getElementById('mode-badge');
const statusDetail = document.getElementById('status-detail');
const copyOutput   = document.getElementById('copy-output');
const btnCopy      = document.getElementById('btn-copy');

const ctxMenu = new CtxMenu(document.getElementById('ctx-menu'));

let startCell   = null;
let currentCell = null;
let hasCrossed  = false;
let currentMode = null;   // 'col' | 'row' | 'single' | null
let rowGroups   = null;
let dragIsTouch = false;

// ── helpers ───────────────────────────────────────────────────────────

function tdAt(x, y) {
  const el = document.elementFromPoint(x, y);
  return el?.closest('#demo tbody td') ?? null;
}

function pos(td) {
  return { row: td.parentElement.rowIndex, col: td.cellIndex };
}

function clearHighlights() {
  table.querySelectorAll('td.sel').forEach(td => td.classList.remove('sel'));
  table.classList.remove('cross-sel');
}

function enterCrossSelMode() {
  // 進入跨 cell 模式：禁止原生選字、改游標
  table.classList.add('cross-sel');
  window.getSelection().removeAllRanges();
}

function setStatus(mode, detail) {
  currentMode = mode;
  if (mode === 'single') {
    modeBadge.textContent = '單格';
    modeBadge.className   = 'badge-single';
  } else {
    modeBadge.textContent = mode === 'col' ? 'Column-based' : 'Row-based 矩形';
    modeBadge.className   = 'badge-sel';
  }
  statusDetail.textContent = detail;
  btnCopy.disabled = false;
}

function resetStatus() {
  currentMode = null;
  rowGroups   = null;
  modeBadge.textContent = '— 尚未選取 —';
  modeBadge.className   = 'badge-none';
  statusDetail.textContent = '';
  btnCopy.disabled = true;
}

// ── Selection logic ───────────────────────────────────────────────────

function applySingleCell(td, isTouch) {
  clearHighlights();
  rowGroups = null;
  const p = pos(td);

  if (isTouch) {
    // 平板：整格 highlight，不開字元選取
    td.classList.add('sel');
    window.getSelection().removeAllRanges();
    setStatus('single', `(列${p.row},欄${p.col}) — 整格`);
  } else {
    // 電腦：原生選字，游標自然顯示（CSS 預設 user-select:text / cursor:text）
    // 不做額外操作，讓瀏覽器原生選取行為保留
    setStatus('single', `(列${p.row},欄${p.col}) — 原生選取`);
  }
}

function applyColSelection(start, end) {
  clearHighlights();
  enterCrossSelMode();
  const sp = pos(start), ep = pos(end);
  const col    = sp.col;
  const minRow = Math.min(sp.row, ep.row);
  const maxRow = Math.max(sp.row, ep.row);
  for (let r = minRow; r <= maxRow; r++)
    table.rows[r].cells[col].classList.add('sel');
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
  enterCrossSelMode();
  rowGroups = buildRowGroups(start, end);
  rowGroups.forEach(row => row.forEach(td => td.classList.add('sel')));
  const sp = pos(start), ep = pos(end);
  const minRow = Math.min(sp.row, ep.row), maxRow = Math.max(sp.row, ep.row);
  const minCol = Math.min(sp.col, ep.col), maxCol = Math.max(sp.col, ep.col);
  setStatus('row',
    `矩形 列${minRow}–${maxRow} × 欄${minCol}–${maxCol}（${rowGroups.flat().length} 格）`);
}

// ── Copy logic ────────────────────────────────────────────────────────

function buildCopyData() {
  if (currentMode === 'col') {
    const cells    = [...table.querySelectorAll('td.sel')];
    const plain    = cells.map(td => td.textContent).join('\n');
    const htmlRows = cells.map(td => `<tr><td>${td.innerHTML}</td></tr>`).join('');
    return { plain, html: `<table border="1">${htmlRows}</table>` };
  }
  if (currentMode === 'row') {
    const groups   = rowGroups ?? [];
    const plain    = groups.map(r => r.map(td => td.textContent).join('\t')).join('\n');
    const htmlRows = groups.map(r =>
      `<tr>${r.map(td => `<td>${td.innerHTML}</td>`).join('')}</tr>`).join('');
    return { plain, html: `<table border="1">${htmlRows}</table>` };
  }
  if (currentMode === 'single') {
    // 電腦：取原生游標選取文字；平板：取 sel 格整格文字
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

// ── Pointer Events ────────────────────────────────────────────────────

table.addEventListener('pointerdown', e => {
  if (e.target.closest('a, button, [data-action]')) return;
  if (e.button !== 0 && e.pointerType === 'mouse') return;

  const td = tdAt(e.clientX, e.clientY);
  if (!td) return;

  dragIsTouch = e.pointerType === 'touch';
  startCell   = td;
  currentCell = td;
  hasCrossed  = false;
  resetStatus();

  if (dragIsTouch) {
    // 平板：立即攔截，不讓原生選字介入
    table.setPointerCapture(e.pointerId);
    enterCrossSelMode();
  }
  // 電腦：先不攔截，讓原生選字/游標自然作用；
  //       等到真正跨 cell 才在 pointermove 裡接管
});

table.addEventListener('pointermove', e => {
  if (!startCell) return;
  const td = tdAt(e.clientX, e.clientY);
  if (!td) return;
  if (!hasCrossed && td === startCell) return;

  // 第一次跨 cell
  if (!hasCrossed) {
    hasCrossed = true;
    if (!dragIsTouch) {
      // 電腦：這時才接管，設定 capture 並進入跨 cell 模式
      table.setPointerCapture(e.pointerId);
      enterCrossSelMode();
    }
    modeBadge.textContent = '拖曳中…';
    modeBadge.className   = 'badge-none';
  }

  if (td === currentCell) return;
  currentCell = td;

  const sp = pos(startCell), ep = pos(currentCell);
  if (sp.col === ep.col) applyColSelection(startCell, currentCell);
  else                   applyRowSelection(startCell, currentCell);
});

document.addEventListener('pointerup', e => {
  if (!startCell) return;
  const isTouch = e.pointerType === 'touch';

  if (!hasCrossed) {
    applySingleCell(startCell, isTouch);
  }
  startCell = null;

  // 自動跳出選單：
  //   平板 → 全部（single + cross）
  //   電腦 → 只有 cross cell（single 維持原生，不跳選單）
  if (currentMode && (isTouch || currentMode !== 'single')) {
    showCtxMenuForCopy(e.clientX, e.clientY);
  }
});

document.addEventListener('pointercancel', e => {
  if (!startCell) return;
  startCell = null;
  clearHighlights();
  resetStatus();
});

// ── Context Menu ──────────────────────────────────────────────────────

function showCtxMenuForCopy(x, y) {
  ctxMenu.show(x, y, [
    { label: '📋 複製', onClick: performCopy, disabled: !currentMode },
  ]);
}

// ── 面板複製按鈕 ───────────────────────────────────────────────────────

btnCopy.addEventListener('click', () => performCopy());
