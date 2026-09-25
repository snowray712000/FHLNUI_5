import { CtxMenu }       from '../09_smart_table_selection_rect_demo/CtxMenu.js';
import { TableSelector } from './TableSelector.js';   // 本地版：支援 data-r/data-c 邏輯位置
import { TableRenderer } from './TableRenderer.js';

// ── joTable 資料（來自 sp1.js 的規畫） ────────────────────────────────
// 3 row 2 col，col 1 (KJV) row 2 有 rowspan=2（2-3節合一）
const joTable = {
  r: 3,
  c: 2,
  headers: [
    { c: 1, content: [{ w: 'KJV' }] },
    { c: 2, content: [{ w: '和合本' }] },
  ],
  cells: [
    { r: 1, c: 1, content: [{ w: '1 ', isRef: 1, 'ref-desc': '創1' }, { w: 'In the beginning God created the heavens and the earth.' }] },
    { r: 2, c: 1, rs: 2, content: [{ w: '2-3 ', isRef: 1, 'ref-desc': '創1' }, { w: 'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters. And God said, "Let there be light," and there was light.' }] },
    { r: 1, c: 2, content: [{ w: '1 ', isRef: 1, 'ref-desc': '創1' }, { w: '起初神創造天地。' }] },
    { r: 2, c: 2, content: [{ w: '2 ', isRef: 1, 'ref-desc': '創1' }, { w: '地是空虛混沌，淵面黑暗；　神的靈運行在水面上。' }] },
    { r: 3, c: 2, content: [{ w: '3 ', isRef: 1, 'ref-desc': '創1' }, { w: '神說，要有光，就有了光。' }] },
  ],
};

// ── render_dtexts：將 content[] 轉成 HTML string ──────────────────────
// 這裡是示範用的簡單實作；未來換成真正的 FHL render 只需替換此函式。
function render_dtexts(content) {
  return content.map(item => {
    if (item.isRef) {
      return `<span class="ref" title="${item['ref-desc'] ?? ''}">${item.w}</span>`;
    }
    return item.w;
  }).join('');
}

// ── 建立 table DOM，掛入容器 ───────────────────────────────────────────
const table = TableRenderer.buildDom(joTable, render_dtexts);
table.id = 'demo';
document.getElementById('table-container').appendChild(table);

// ── UI 元件 ────────────────────────────────────────────────────────────
const modeBadge    = document.getElementById('mode-badge');
const statusDetail = document.getElementById('status-detail');
const copyOutput   = document.getElementById('copy-output');
const btnCopy      = document.getElementById('btn-copy');

// ── TableSelector（09 原版，零修改） ──────────────────────────────────
const ctxMenu = new CtxMenu(document.getElementById('ctx-menu'));
const sel     = new TableSelector(table);

// ── 選取狀態 ──────────────────────────────────────────────────────────
let lastSelCells = null;   // [{ joCell, td }, ...] 選中的 cell 清單

// ── listener: selectionstart ──────────────────────────────────────────
sel.addEventListener('selectionstart', () => {
  lastSelCells           = null;
  modeBadge.textContent  = '— 尚未選取 —';
  modeBadge.className    = 'badge-none';
  statusDetail.textContent = '';
  btnCopy.disabled       = true;
});

// ── listener: selectiondrag ───────────────────────────────────────────
sel.addEventListener('selectiondrag', () => {
  modeBadge.textContent = '拖曳中…';
  modeBadge.className   = 'badge-none';
});

// ── listener: selectioncommit → 更新狀態面板 + 建立 lastSelCells ─────
sel.addEventListener('selectioncommit', ({ detail }) => {
  const { mode, isTouch, startRow, startCol } = detail;

  if (mode === 'single' && !isTouch) {
    // Desktop single：無 td.sel，從邏輯位置反查 joCell
    const td     = table.querySelector(`tbody [data-r="${startRow}"][data-c="${startCol}"]`);
    const joCell = joTable.cells.find(cell => cell.r === startRow && cell.c === startCol);
    lastSelCells = (td && joCell) ? [{ joCell, td }] : [];
  } else {
    lastSelCells = buildSelCells(table, joTable);
  }

  if (lastSelCells.length === 0) return;

  if (mode === 'single') {
    modeBadge.textContent    = '單格';
    modeBadge.className      = 'badge-single';
    const { r, c } = lastSelCells[0]?.joCell ?? {};
    statusDetail.textContent = r != null
      ? `(列${r},欄${c}) — ${isTouch ? '整格' : '原生選取'}`
      : `— ${isTouch ? '整格' : '原生選取'}`;
  } else if (mode === 'col') {
    const cols  = [...new Set(lastSelCells.map(x => x.joCell.c))];
    const rows  = lastSelCells.map(x => x.joCell.r);
    const count = lastSelCells.length;
    modeBadge.textContent    = 'Column-based';
    modeBadge.className      = 'badge-sel';
    statusDetail.textContent = `欄 ${cols.join(',')}, 列 ${Math.min(...rows)}–${Math.max(...rows)}（${count} 格）`;
  } else {
    const rows  = lastSelCells.map(x => x.joCell.r);
    const cols  = lastSelCells.map(x => x.joCell.c);
    const count = lastSelCells.length;
    modeBadge.textContent    = 'Row-based 矩形';
    modeBadge.className      = 'badge-sel';
    statusDetail.textContent = `列${Math.min(...rows)}–${Math.max(...rows)} × 欄${Math.min(...cols)}–${Math.max(...cols)}（${count} 格）`;
  }
  btnCopy.disabled = false;
});

// ── listener: selectioncommit → context menu ─────────────────────────
sel.addEventListener('selectioncommit', ({ detail }) => {
  if (detail.isTouch || detail.mode !== 'single') {
    showCtxMenu(detail.x, detail.y);
  }
});

// ── listener: selectioncancel ─────────────────────────────────────────
sel.addEventListener('selectioncancel', () => {
  lastSelCells             = null;
  modeBadge.textContent    = '— 尚未選取 —';
  modeBadge.className      = 'badge-none';
  statusDetail.textContent = '';
  btnCopy.disabled         = true;
});

// ── Copy 核心邏輯 ─────────────────────────────────────────────────────

/**
 * 從 table.querySelectorAll('td.sel') 讀 data-r / data-c，
 * 反查 joTable.cells，回傳 [{ joCell, td }, ...]。
 * 這樣 copy 資料來自 joTable（資料層），而非 DOM text scraping。
 */
function buildSelCells(table, joTable) {
  const result = [];
  table.querySelectorAll('td.sel').forEach(td => {
    const r = Number(td.dataset.r);
    const c = Number(td.dataset.c);
    const joCell = joTable.cells.find(cell => cell.r === r && cell.c === c);
    if (joCell) result.push({ joCell, td });
  });
  return result;
}

/** 從 joCell.content 萃取純文字 */
function cellToText(joCell) {
  return joCell.content.map(item => item.w).join('');
}

function buildCopyData() {
  if (!lastSelCells || lastSelCells.length === 0) return { plain: null, html: null };

  // single：回傳原生選取文字，或整格文字
  const selectedTds = table.querySelectorAll('td.sel');
  if (selectedTds.length === 0) {
    // single desktop：優先用原生選取文字，點按鈕時 selection 已清空則退回整格文字
    const selText = window.getSelection().toString();
    return { plain: selText || cellToText(lastSelCells[0].joCell), html: null };
  }

  // 依邏輯列 / 欄分組
  const grouped = {};  // key: r → { c → joCell }
  for (const { joCell } of lastSelCells) {
    if (!grouped[joCell.r]) grouped[joCell.r] = {};
    grouped[joCell.r][joCell.c] = joCell;
  }
  const rows = Object.keys(grouped).map(Number).sort((a, b) => a - b);
  const cols = [...new Set(lastSelCells.map(x => x.joCell.c))].sort((a, b) => a - b);

  const groups = rows.map(r => cols.map(c => grouped[r]?.[c]).filter(Boolean));
  const plain    = groups.map(row => row.map(cellToText).join('\t')).join('\n');
  const htmlRows = groups.map(row =>
    `<tr>${row.map(cell => `<td>${render_dtexts(cell.content)}</td>`).join('')}</tr>`
  ).join('');
  return { plain, html: `<table border="1">${htmlRows}</table>` };
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
  if (!lastSelCells || lastSelCells.length === 0) return;
  // single desktop（無 td.sel）：讓瀏覽器原生處理 Ctrl+C，保留部分選字
  if (!table.querySelectorAll('td.sel').length) return;
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
    { label: '📋 複製', onClick: performCopy, disabled: !lastSelCells },
  ]);
}

// ── 面板複製按鈕 ───────────────────────────────────────────────────────
btnCopy.addEventListener('click', () => performCopy());
