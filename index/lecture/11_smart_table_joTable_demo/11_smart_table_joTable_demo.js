import { CtxMenu }       from '../09_smart_table_selection_rect_demo/CtxMenu.js';
import { TableSelector } from '../10_smart_table_joTable_demo/TableSelector.js';
import { TableRenderer } from '../10_smart_table_joTable_demo/TableRenderer.js';

// ── 固定查詢參數 ───────────────────────────────────────────────────────
const QSTR     = '弗3';
const ENGS     = 'Eph';
const VERSIONS = ['unv', 'kjv', 'rcuv'];
const API_URL  = 'https://bible.fhl.net/json/qsb.php';

// ── UI 元件（早期取得，以便 loading 時更新） ─────────────────────────
const loadingStatus = document.getElementById('loading-status');
const modeBadge     = document.getElementById('mode-badge');
const statusDetail  = document.getElementById('status-detail');
const copyOutput    = document.getElementById('copy-output');
const btnCopy       = document.getElementById('btn-copy');

// ── API 呼叫：取得單一譯本的經文 ──────────────────────────────────────
async function fetchVersion(version) {
  const body = new URLSearchParams({
    qstr:    QSTR,
    engs:    ENGS,
    version: version,
    strong:  '1',
    gb:      '0',
  });
  const rsp = await fetch(API_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body,
  });
  if (!rsp.ok) throw new Error(`HTTP ${rsp.status} for version=${version}`);
  const data = await rsp.json();
  // 補上 version 欄位（有些 API 回傳中可能沒有）
  if (!data.version) data.version = version;
  return data;
}

// ── 從 rspArr 建構 joTable ────────────────────────────────────────────
function buildJoTable(rspArr) {
  // 建 map: sec → { versionCode: bible_text }
  const secMap = new Map();
  for (const rsp of rspArr) {
    for (const rec of rsp.record) {
      if (!secMap.has(rec.sec)) secMap.set(rec.sec, {});
      secMap.get(rec.sec)[rsp.version] = rec.bible_text;
    }
  }

  const secList = [...secMap.keys()].sort((a, b) => a - b);
  const cells   = [];

  for (const sec of secList) {
    const row = secMap.get(sec);
    rspArr.forEach((rsp, idx) => {
      const text = row[rsp.version] ?? '';
      cells.push({ r: sec, c: idx + 1, content: [{ w: text }] });
    });
  }

  return {
    r:       secList.length,
    c:       rspArr.length,
    headers: rspArr.map((rsp, idx) => ({
      c:       idx + 1,
      content: [{ w: rsp.v_name || rsp.version }],
    })),
    cells,
  };
}

// ── render_dtexts：直接輸出純文字 ─────────────────────────────────────
function render_dtexts(content) {
  return content.map(item => item.w).join('');
}

// ── 主流程 ────────────────────────────────────────────────────────────
let joTable = null;   // 載入後才賦值，copy 邏輯會用到

(async () => {
  try {
    // 並行取得三個譯本
    const rspArr = await Promise.all(VERSIONS.map(v => fetchVersion(v)));

    // 建構 joTable
    joTable = buildJoTable(rspArr);

    // 建立 table DOM，掛入容器
    const table = TableRenderer.buildDom(joTable, render_dtexts);
    table.id = 'demo';
    document.getElementById('table-container').appendChild(table);

    loadingStatus.textContent = `以弗所書第3章（${rspArr.map(r => r.v_name || r.version).join(' / ')}）`;
    loadingStatus.className   = 'done';

    // ── UI 元件 ──────────────────────────────────────────────────────

    // ── TableSelector ────────────────────────────────────────────────
    const ctxMenu = new CtxMenu(document.getElementById('ctx-menu'));
    const sel     = new TableSelector(table);

    // ── 選取狀態 ─────────────────────────────────────────────────────
    let lastSelCells = null;

    sel.addEventListener('selectionstart', () => {
      lastSelCells           = null;
      modeBadge.textContent  = '— 尚未選取 —';
      modeBadge.className    = 'badge-none';
      statusDetail.textContent = '';
      btnCopy.disabled       = true;
    });

    sel.addEventListener('selectiondrag', () => {
      modeBadge.textContent = '拖曳中…';
      modeBadge.className   = 'badge-none';
    });

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
        modeBadge.textContent    = 'Column-based';
        modeBadge.className      = 'badge-sel';
        statusDetail.textContent = `欄 ${cols.join(',')}, 列 ${Math.min(...rows)}–${Math.max(...rows)}（${lastSelCells.length} 格）`;
      } else {
        const rows = lastSelCells.map(x => x.joCell.r);
        const cols = lastSelCells.map(x => x.joCell.c);
        modeBadge.textContent    = 'Row-based 矩形';
        modeBadge.className      = 'badge-sel';
        statusDetail.textContent = `列${Math.min(...rows)}–${Math.max(...rows)} × 欄${Math.min(...cols)}–${Math.max(...cols)}（${lastSelCells.length} 格）`;
      }
      btnCopy.disabled = false;
    });

    sel.addEventListener('selectioncommit', ({ detail }) => {
      if (detail.isTouch || detail.mode !== 'single') {
        showCtxMenu(detail.x, detail.y);
      }
    });

    sel.addEventListener('selectioncancel', () => {
      lastSelCells             = null;
      modeBadge.textContent    = '— 尚未選取 —';
      modeBadge.className      = 'badge-none';
      statusDetail.textContent = '';
      btnCopy.disabled         = true;
    });

    // ── Copy 核心邏輯 ─────────────────────────────────────────────────

    function buildSelCells(tbl, jot) {
      const result = [];
      tbl.querySelectorAll('td.sel').forEach(td => {
        const r      = Number(td.dataset.r);
        const c      = Number(td.dataset.c);
        const joCell = jot.cells.find(cell => cell.r === r && cell.c === c);
        if (joCell) result.push({ joCell, td });
      });
      return result;
    }

    function cellToText(joCell) {
      return joCell.content.map(item => item.w).join('');
    }

    function buildCopyData() {
      if (!lastSelCells || lastSelCells.length === 0) return { plain: null, html: null };

      const selectedTds = table.querySelectorAll('td.sel');
      if (selectedTds.length === 0) {
        // single desktop：優先用原生選取文字，點按鈕時 selection 已清空則退回整格文字
        const selText = window.getSelection().toString();
        return { plain: selText || cellToText(lastSelCells[0].joCell), html: null };
      }

      const grouped = {};
      for (const { joCell } of lastSelCells) {
        if (!grouped[joCell.r]) grouped[joCell.r] = {};
        grouped[joCell.r][joCell.c] = joCell;
      }
      const rows   = Object.keys(grouped).map(Number).sort((a, b) => a - b);
      const cols   = [...new Set(lastSelCells.map(x => x.joCell.c))].sort((a, b) => a - b);
      const groups = rows.map(r => cols.map(c => grouped[r]?.[c]).filter(Boolean));
      const plain  = groups.map(row => row.map(cellToText).join('\t')).join('\n');
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

    // ── Context Menu ─────────────────────────────────────────────────
    function showCtxMenu(x, y) {
      ctxMenu.show(x, y, [
        { label: '📋 複製', onClick: performCopy, disabled: !lastSelCells },
      ]);
    }

    // ── 面板複製按鈕 ──────────────────────────────────────────────────
    btnCopy.addEventListener('click', () => performCopy());

  } catch (err) {
    loadingStatus.textContent = `載入失敗：${err.message}`;
    loadingStatus.className   = 'error';
    console.error(err);
  }
})();
