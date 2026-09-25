import { CtxMenu }       from '../09_smart_table_selection_rect_demo/CtxMenu.js';
import { TableSelector } from '../10_smart_table_joTable_demo/TableSelector.js';
import { TableRenderer } from '../10_smart_table_joTable_demo/TableRenderer.js';
import { cvt_others }    from '../../cvt_others.js';
import { dtexts_render } from '../../dtext/dtexts_render.js';

// ── 固定查詢參數 ───────────────────────────────────────────────────────
const QSTR     = '弗3';
const ENGS     = 'Eph';
const VERSIONS = ['unv', 'kjv', 'rcuv'];
const API_URL  = 'https://bible.fhl.net/json/qsb.php';

// ── UI 元件 ────────────────────────────────────────────────────────────
const loadingStatus = document.getElementById('loading-status');
const modeBadge     = document.getElementById('mode-badge');
const statusDetail  = document.getElementById('status-detail');
const copyOutput    = document.getElementById('copy-output');
const btnCopy       = document.getElementById('btn-copy');

// ── API 呼叫 ───────────────────────────────────────────────────────────
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
  if (!data.version) data.version = version;
  return data;
}

// ── 從 rspArr 建構 joTable（content 為 DText[]） ──────────────────────
function buildJoTable(rspArr) {
  // 對每個譯本呼叫 cvt_others，轉換 bible_text → DText[]
  // sec → { versionCode: DText[] }
  const secMap = new Map();
  for (const rsp of rspArr) {
    const records_with_addr = rsp.record.map(rec => [rec.book, rec.chap, rec.sec, rec.bible_text]);
    const dtexts_with_addr  = cvt_others(rsp.version, records_with_addr);
    for (const [, , sec, dtexts] of dtexts_with_addr) {
      if (!secMap.has(sec)) secMap.set(sec, {});
      secMap.get(sec)[rsp.version] = dtexts;
    }
  }

  const secList = [...secMap.keys()].sort((a, b) => a - b);
  const cells   = [];
  for (const sec of secList) {
    const row = secMap.get(sec);
    rspArr.forEach((rsp, idx) => {
      const dtexts = row[rsp.version] ?? [];
      cells.push({ r: sec, c: idx + 1, content: dtexts });
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

// ── render_dtexts：DText[] → DocumentFragment（透過 dtexts_render） ──
function render_dtexts(content) {
  const $jq = dtexts_render(content);
  const frag = document.createDocumentFragment();
  $jq.each((_, el) => frag.appendChild(el));
  return frag;
}

// ── cellToText：從 DText[] 萃取純文字（供 copy 邏輯使用） ────────────
function cellToText_dtexts(dtexts) {
  return dtexts.flatMap(d => {
    if (d.sn && d.tp2 && !snVisible) return [];   // 真正的 SN（有 tp2）隱藏時跳過
    if (d.w)        return [d.w];
    if (d.children) return [cellToText_dtexts(d.children)];
    return [];
  }).join('');
}

// ── 主流程 ────────────────────────────────────────────────────────────
let joTable   = null;
let snVisible = true;   // SN 顯示狀態（供 cellToText_dtexts 使用）

(async () => {
  try {
    const rspArr = await Promise.all(VERSIONS.map(v => fetchVersion(v)));

    joTable = buildJoTable(rspArr);

    const table = TableRenderer.buildDom(joTable, render_dtexts);
    table.id = 'demo';
    document.getElementById('table-container').appendChild(table);

    loadingStatus.textContent = `以弗所書第3章（${rspArr.map(r => r.v_name || r.version).join(' / ')}）`;
    loadingStatus.className   = 'done';

    // ── TableSelector ────────────────────────────────────────────────
    const ctxMenu = new CtxMenu(document.getElementById('ctx-menu'));
    const sel     = new TableSelector(table);

    let lastSelCells = null;

    sel.addEventListener('selectionstart', () => {
      lastSelCells             = null;
      modeBadge.textContent    = '— 尚未選取 —';
      modeBadge.className      = 'badge-none';
      statusDetail.textContent = '';
      btnCopy.disabled         = true;
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
        const cols = [...new Set(lastSelCells.map(x => x.joCell.c))];
        const rows = lastSelCells.map(x => x.joCell.r);
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
      return cellToText_dtexts(joCell.content);
    }

    function buildCopyData() {
      if (!lastSelCells || lastSelCells.length === 0) return { plain: null, html: null };

      const selectedTds = table.querySelectorAll('td.sel');
      if (selectedTds.length === 0) {
        // single desktop：優先用原生選取文字，退回整格文字
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
        `<tr>${row.map(cell => {
          const frag    = render_dtexts(cell.content);
          const $wrap = $('<span>').append($(frag));
          if (!snVisible) $wrap.find('.sn').remove();
          return `<td>${$wrap.html()}</td>`;
        }).join('')}</tr>`
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
      // single desktop（無 td.sel）：讓瀏覽器原生處理 Ctrl+C
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

    function showCtxMenu(x, y) {
      ctxMenu.show(x, y, [
        { label: '📋 複製', onClick: performCopy, disabled: !lastSelCells },
      ]);
    }

    btnCopy.addEventListener('click', () => performCopy());

    const btnSn = document.getElementById('btn-sn');
    btnSn.addEventListener('click', () => {
      snVisible = !snVisible;
      table.classList.toggle('sn-hidden', !snVisible);
      btnSn.textContent = snVisible ? '隱藏 SN' : '顯示 SN';
      btnSn.classList.toggle('sn-hidden', !snVisible);
    });

  } catch (err) {
    loadingStatus.textContent = `載入失敗：${err.message}`;
    loadingStatus.className   = 'error';
    console.error(err);
  }
})();
