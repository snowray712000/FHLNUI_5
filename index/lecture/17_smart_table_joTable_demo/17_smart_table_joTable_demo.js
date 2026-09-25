import { CtxMenu }             from '../09_smart_table_selection_rect_demo/CtxMenu.js';
import { TableSelector }       from '../10_smart_table_joTable_demo/TableSelector.js';
import { TableRenderer }       from '../10_smart_table_joTable_demo/TableRenderer.js';
import { cvt_others }          from '../../cvt_others.js';
import { dtexts_render }       from '../../dtext/dtexts_render.js';
import { BibleConstant }       from '../../BibleConstant.es2023.js';
import { BibleConstantHelper } from '../../BibleConstantHelper.es2023.js';
import { queryFootsAsync }     from '../../queryFootsAsync.js';

// ── 固定查詢參數 ───────────────────────────────────────────────────────
const API_URL = 'https://bible.fhl.net/json/qsb.php';

// ── UI 元件 ────────────────────────────────────────────────────────────
const loadingStatus = document.getElementById('loading-status');
const footStatus    = document.getElementById('foot-status');
const modeBadge     = document.getElementById('mode-badge');
const statusDetail  = document.getElementById('status-detail');
const copyOutput    = document.getElementById('copy-output');
const btnCopy       = document.getElementById('btn-copy');
const btnSn         = document.getElementById('btn-sn');
const btnBook       = document.getElementById('btn-book');
const btnVersion    = document.getElementById('btn-version');

// ── 書卷章節工具 ───────────────────────────────────────────────────────
function bookChapToParams(bookIndex, chap) {
  return {
    qstr: BibleConstant.CHINESE_BOOK_ABBREVIATIONS[bookIndex - 1] + chap,
    engs: BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[bookIndex - 1],
  };
}

function bookChapDisplayName(bookIndex, chap) {
  return BibleConstant.CHINESE_BOOK_NAMES[bookIndex - 1] + ' 第' + chap + '章';
}

// ── API 呼叫 ───────────────────────────────────────────────────────────
async function fetchVersion(version, qstr, engs) {
  const body = new URLSearchParams({
    qstr, engs, version, strong: '1', gb: '0',
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

// ── 偵測「併入上節」：單一 dtexts 陣列，且唯一一筆 w === "a" ──────────
function isMergeWithPrevVerse(dtexts) {
  return dtexts.length === 1 && dtexts[0].w === 'a';
}

// ── 從 rspArr 建構 joTable（同步，不等注腳） ──────────────────────────
//
// 「節碼 DText」設計：
//   每個 cell 的 content 最前面插入一筆 { w: verseLabel + " ", class: "verseNumber" }
//   verseLabel = 節號字串，合併時為範圍，如 "20-21"
//   沿用主專案 .verseNumber 的樣式（藍色、margin）
//
// 「併入上節」處理：
//   當某譯本某節 bible_text="a"，表示此節在該譯本中併入前一節。
//   做法：將前一節（該譯本欄）的 cell 加上 rs（rowspan），跳過本節該欄的 cell。
//
/**
 * @typedef {{ one_record: any, version: string, r: number, c: number, verseNumDtext: object }} FootWork
 */

/**
 * @param {any[]} rspArr
 * @returns {{ joTable: object, footWork: FootWork[] }}
 */
function buildJoTable(rspArr) {
  const secMap = new Map();        // sec → { [version]: DText[] }
  /** @type {FootWork[]} */
  const footWork = [];
  // mergeInfo: "version:sec" → prevSec（該版本此節要併入的前一節）
  const mergeInfo = new Map();

  rspArr.forEach((rsp, idx) => {
    const c = idx + 1;   // 欄號（1-based）
    const records_with_addr = rsp.record.map(rec => [
      BibleConstantHelper.getBookId(rec.engs.toLowerCase()),
      rec.chap, rec.sec, rec.bible_text,
    ]);
    const dtexts_with_addr = cvt_others(rsp.version, records_with_addr);

    let prevSec = null;   // 上一個「非 a」的 sec

    for (const one_record of dtexts_with_addr) {
      const [, , sec, dtexts] = one_record;
      if (!secMap.has(sec)) secMap.set(sec, {});

      if (isMergeWithPrevVerse(dtexts)) {
        // 這節在此譯本中為「併入上節」——記錄合併關係，內容留空
        if (prevSec !== null) {
          mergeInfo.set(`${rsp.version}:${sec}`, prevSec);
        }
        secMap.get(sec)[rsp.version] = [];   // 空內容（不渲染）
      } else {
        secMap.get(sec)[rsp.version] = dtexts;
        // 記錄待 progressive 載入的注腳（含 c，供定位 td；verseNumDtext 待後面補入）
        if (dtexts.some(d => d.foot != null && d.foot.footContent == null)) {
          footWork.push({ one_record, version: rsp.version, r: sec, c, verseNumDtext: null });
        }
        prevSec = sec;   // 只有非「a」節才更新 prevSec
      }
    }
  });

  // ── 計算各 cell 的 rowspan ─────────────────────────────────────────
  // rsMap: "version:prevSec" → rowspan 值
  const rsMap = new Map();
  for (const [key, prevSec] of mergeInfo) {
    const version = key.split(':')[0];
    const rsKey   = `${version}:${prevSec}`;
    rsMap.set(rsKey, (rsMap.get(rsKey) ?? 1) + 1);
  }

  // ── 計算各版本各節的節碼標籤 ─────────────────────────────────────────
  // versionLabelMap: "version:sec" → label
  // 每個版本各自計算，因為只有「該版本有 a」的格才顯示範圍（如 "20-21"）
  const versionLabelMap = new Map();

  // 按 sec 排序後處理，確保連續合併（如 21→20, 22→20）能正確累積範圍
  const mergeEntries = [...mergeInfo.entries()]
    .map(([key, prevSec]) => {
      const [version, secStr] = key.split(':');
      return { version, sec: Number(secStr), prevSec };
    })
    .sort((a, b) => a.sec - b.sec);

  for (const { version, sec, prevSec } of mergeEntries) {
    const prevKey      = `${version}:${prevSec}`;
    const currentLabel = versionLabelMap.get(prevKey) ?? String(prevSec);
    const rangeStart   = currentLabel.split('-')[0];
    versionLabelMap.set(prevKey, `${rangeStart}-${sec}`);
  }

  // ── 建構 cells 陣列 ────────────────────────────────────────────────
  const secList = [...secMap.keys()].sort((a, b) => a - b);
  const cells   = [];

  rspArr.forEach((rsp, idx) => {
    const c = idx + 1;
    for (const sec of secList) {
      // 此節此譯本為「a」→ 跳過（已由前一節的 rs 覆蓋）
      if (mergeInfo.has(`${rsp.version}:${sec}`)) continue;

      const dtexts        = secMap.get(sec)[rsp.version] ?? [];
      const rs            = rsMap.get(`${rsp.version}:${sec}`) ?? 1;
      const label         = versionLabelMap.get(`${rsp.version}:${sec}`) ?? String(sec);
      const verseNumDtext = { w: label + ' ', class: 'verseNumber' };

      cells.push({ r: sec, c, content: [verseNumDtext, ...dtexts], ...(rs > 1 ? { rs } : {}) });
    }
  });

  // ── 將 verseNumDtext 補入 footWork（建構 cells 後才能拿到正確 label） ──
  for (const fw of footWork) {
    const label      = versionLabelMap.get(`${fw.version}:${fw.r}`) ?? String(fw.r);
    fw.verseNumDtext = { w: label + ' ', class: 'verseNumber' };
  }

  return {
    joTable: {
      r:       secList.length,
      c:       rspArr.length,
      headers: rspArr.map((rsp, idx) => ({
        c:       idx + 1,
        content: [{ w: rsp.v_name || rsp.version }],
      })),
      cells,
    },
    footWork,
  };
}

// ── render_dtexts：DText[] → DocumentFragment ─────────────────────────
function render_dtexts(content) {
  const $jq = dtexts_render(content);
  const frag = document.createDocumentFragment();
  $jq.each((_, el) => frag.appendChild(el));
  return frag;
}

// ── 注腳 progressive 載入（先渲染表格，再逐節更新注腳內容） ───────────
/**
 * @param {FootWork[]} footWork
 * @param {HTMLTableElement} tbl
 */
function loadFootsProgressively(footWork, tbl) {
  if (footWork.length === 0) {
    footStatus.textContent = '';
    return;
  }

  let remaining = footWork.length;
  footStatus.textContent = `注腳載入中 0/${remaining}…`;

  for (const fw of footWork) {
    const { one_record, version, r, c, verseNumDtext } = fw;
    queryFootsAsync([one_record], version)
      .then(() => {
        // 注腳已填入 one_record[3]，重渲染時需帶上節碼 DText
        const td = tbl.querySelector(`tbody [data-r="${r}"][data-c="${c}"]`);
        if (td) {
          td.innerHTML = '';
          td.appendChild(render_dtexts([verseNumDtext, ...one_record[3]]));
        }
      })
      .catch(() => {/* 靜默忽略單格失敗 */})
      .finally(() => {
        remaining--;
        if (remaining > 0) {
          footStatus.textContent = `注腳載入中 ${footWork.length - remaining}/${footWork.length}…`;
        } else {
          footStatus.textContent = `注腳已全部載入（共 ${footWork.length} 節）`;
          setTimeout(() => { footStatus.textContent = ''; }, 2000);
        }
      });
  }
}

// ── cellToText：從 DText[] 萃取純文字 ────────────────────────────────
function cellToText_dtexts(dtexts) {
  return dtexts.flatMap(d => {
    if (d.sn && d.tp2 && !snVisible) return [];
    if (d.w)        return [d.w];
    if (d.children) return [cellToText_dtexts(d.children)];
    return [];
  }).join('');
}

// ── 模組層級狀態 ───────────────────────────────────────────────────────
let joTable         = null;
let table           = null;
let lastSelCells    = null;
let snVisible       = true;
let currentBook     = 51;   // 歌羅西書（含 "a" 節，便於測試）
let currentChap     = 2;
let currentVersions = ['unv', 'lcc', 'csb'];

// ── 選取 / Copy 輔助函式 ──────────────────────────────────────────────
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
      const frag  = render_dtexts(cell.content);
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

// ── CtxMenu ───────────────────────────────────────────────────────────
const ctxMenu = new CtxMenu(document.getElementById('ctx-menu'));

function showCtxMenu(x, y) {
  ctxMenu.show(x, y, [
    { label: '📋 複製', onClick: performCopy, disabled: !lastSelCells },
  ]);
}

// ── 建立 / 重建 TableSelector ─────────────────────────────────────────
function setupSelector(tbl) {
  const sel = new TableSelector(tbl);

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
      const td     = tbl.querySelector(`tbody [data-r="${startRow}"][data-c="${startCol}"]`);
      const joCell = joTable.cells.find(cell => cell.r === startRow && cell.c === startCol);
      lastSelCells = (td && joCell) ? [{ joCell, td }] : [];
    } else {
      lastSelCells = buildSelCells(tbl, joTable);
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
}

// ── 載入指定書卷章節 + 譯本（可重複呼叫） ────────────────────────────
async function loadTable(bookIndex, chap, versions) {
  currentBook     = bookIndex;
  currentChap     = chap;
  currentVersions = versions;

  loadingStatus.textContent = '載入中…';
  loadingStatus.className   = '';
  footStatus.textContent    = '';

  const { qstr, engs } = bookChapToParams(bookIndex, chap);
  const rspArr = await Promise.all(versions.map(v => fetchVersion(v, qstr, engs)));

  // 同步建構 joTable（含「併入上節」處理與節碼 DText，不等注腳）
  const { joTable: jt, footWork } = buildJoTable(rspArr);
  joTable = jt;

  const newTable = TableRenderer.buildDom(joTable, render_dtexts);
  newTable.id = 'demo';
  if (!snVisible) newTable.classList.add('sn-hidden');

  const container = document.getElementById('table-container');
  container.innerHTML = '';
  container.appendChild(newTable);
  table = newTable;

  lastSelCells             = null;
  modeBadge.textContent    = '— 尚未選取 —';
  modeBadge.className      = 'badge-none';
  statusDetail.textContent = '';
  btnCopy.disabled         = true;

  setupSelector(table);

  const versNames = rspArr.map(r => r.v_name || r.version).join(' / ');
  loadingStatus.textContent = `${bookChapDisplayName(bookIndex, chap)}（${versNames}）`;
  loadingStatus.className   = 'done';
  btnBook.textContent       = bookChapDisplayName(bookIndex, chap);
  btnVersion.textContent    = currentVersions.join(' / ');

  // 表格已顯示，背景逐節載入注腳
  loadFootsProgressively(footWork, table);
}

// ── document copy 事件（一次註冊） ────────────────────────────────────
document.addEventListener('copy', e => {
  if (!lastSelCells || lastSelCells.length === 0) return;
  if (!table || !table.querySelectorAll('td.sel').length) return;
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

// ── 按鈕事件（一次註冊） ──────────────────────────────────────────────
btnCopy.addEventListener('click', () => performCopy());

btnSn.addEventListener('click', () => {
  snVisible = !snVisible;
  if (table) table.classList.toggle('sn-hidden', !snVisible);
  btnSn.textContent = snVisible ? '隱藏 SN' : '顯示 SN';
  btnSn.classList.toggle('sn-hidden', !snVisible);
});

btnBook.addEventListener('click', () => {
  const dlg = window.Ijnjs?.BookChapDialog?.s;
  if (!dlg) { alert('聖經目錄尚未就緒，請稍候再試'); return; }
  dlg.setCBHided(async () => {
    const result = dlg.getResult();
    try {
      await loadTable(result.book, result.chap, currentVersions);
    } catch (err) {
      loadingStatus.textContent = `載入失敗：${err.message}`;
      loadingStatus.className   = 'error';
      console.error(err);
    }
  });
  dlg.show({ book: currentBook, chap: currentChap });
});

btnVersion.addEventListener('click', () => {
  const dlg = window.Ijnjs?.BibieVersionDialog?.s;
  if (!dlg) { alert('譯本選擇尚未就緒，請稍候再試'); return; }
  dlg.setCallbackClosed(async jo => {
    const newVersions = jo.selects;
    if (!newVersions || newVersions.length === 0) return;
    try {
      await loadTable(currentBook, currentChap, newVersions);
    } catch (err) {
      loadingStatus.textContent = `載入失敗：${err.message}`;
      loadingStatus.className   = 'error';
      console.error(err);
    }
  });
  dlg.open({ selects: currentVersions, offens: [], sets: [] });
});

// ── 初始載入 ──────────────────────────────────────────────────────────
(async () => {
  try {
    await loadTable(currentBook, currentChap, currentVersions);
  } catch (err) {
    loadingStatus.textContent = `載入失敗：${err.message}`;
    loadingStatus.className   = 'error';
    console.error(err);
  }
})();
