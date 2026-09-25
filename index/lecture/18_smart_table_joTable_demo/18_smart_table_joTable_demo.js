import { CtxMenu }              from '../09_smart_table_selection_rect_demo/CtxMenu.js';
import { TableSelector }        from '../10_smart_table_joTable_demo/TableSelector.js';
import { cvt_others }          from '../../cvt_others.js';
import { dtexts_render }       from '../../dtext/dtexts_render.js';
import { BibleConstant }       from '../../BibleConstant.es2023.js';
import { BibleConstantHelper } from '../../BibleConstantHelper.es2023.js';
import { grouping_by_paragraph_for_dtexts_with_addr } from '../../grouping_by_paragraph_for_dtexts_with_addr.js';
import { loadAndDecompressJsonGzAsync } from '../../loadAndDecompressJsonGzAsync.es2023.js';
import { queryFootsAsync }      from '../../queryFootsAsync.js';

// ── 固定查詢參數 ───────────────────────────────────────────────────────
const API_URL = 'https://bible.fhl.net/json/qsb.php';

// ── UI ────────────────────────────────────────────────────────────────
const loadingStatus = document.getElementById('loading-status');
const footStatus    = document.getElementById('foot-status');
const btnBook       = document.getElementById('btn-book');
const btnVersion    = document.getElementById('btn-version');
const btnSn         = document.getElementById('btn-sn');
const btnCopy       = document.getElementById('btn-copy');
const modeBadge     = document.getElementById('mode-badge');
const statusDetail  = document.getElementById('status-detail');
const copyOutput    = document.getElementById('copy-output');
const selMode       = document.getElementById('sel-mode');
const lecContainer  = document.getElementById('lec-container');

// ── 模組層級狀態 ───────────────────────────────────────────────────────
let paragraphData   = null;
let isShowVersion   = 1;   // Mode 2/4：是否在 cell 內顯示譯本名稱（0=隱藏）
let currentMode     = 1;
let currentBook     = 51;
let currentChap     = 2;
let currentVersions = ['unv', 'lcc', 'csb'];
let rspArrCache     = null;
let snVisible       = true;

// ── CtxMenu ───────────────────────────────────────────────────────────
const ctxMenu = new CtxMenu(document.getElementById('ctx-menu'));

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
  const body = new URLSearchParams({ qstr, engs, version, strong: '1', gb: '0' });
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

// ── 段落資料初始化 ─────────────────────────────────────────────────────
async function initParagraphData() {
  try {
    const json = await loadAndDecompressJsonGzAsync('../../paragraphs_ncv.json.gz');
    paragraphData = json.paragraphs;
  } catch (e) {
    console.warn('段落資料載入失敗，modes 3/4 將退為逐節分組', e);
    paragraphData = null;
  }
}

// ── 偵測「併入上節」 ─────────────────────────────────────────────────
function isMergeWithPrevVerse(dtexts) {
  return dtexts.length === 1 && dtexts[0].w === 'a';
}

// ── 建構一個版本的段落陣列 ─────────────────────────────────────────────
function buildParaGroups(dtexts_with_addrs, mode) {
  // Step 1：全域 first pass——先跨所有節解決「併入上節」label 問題
  // （若在段落分組後才處理，fake paragraph 每節各自一組，跨組找不到上一節）
  const allVerses = [];
  for (const [book, chap, sec, dtexts] of dtexts_with_addrs) {
    if (isMergeWithPrevVerse(dtexts)) {
      const last = allVerses[allVerses.length - 1];
      if (last && !last.hide) {
        const start = String(last.verseLabel).split('-')[0];
        last.verseLabel = `${start}-${sec}`;
      }
      allVerses.push({ book, chap, sec, dtexts, verseLabel: '', hide: true });
    } else {
      allVerses.push({ book, chap, sec, dtexts, verseLabel: String(sec), hide: false });
    }
  }

  // Step 2：段落分組
  const groupData = (mode === 3 || mode === 4) && paragraphData
    ? paragraphData
    : dtexts_with_addrs.map(a => [a[0], a[1], a[2], '']);

  const grouped = grouping_by_paragraph_for_dtexts_with_addr(dtexts_with_addrs, groupData);

  return grouped.map(([recordIndices, paragraphIndex]) => {
    const title = (paragraphIndex !== -1 && groupData[paragraphIndex])
      ? groupData[paragraphIndex][3]
      : '';
    const verses = recordIndices.map(idx => allVerses[idx]);
    return { title, verses };
  });
}

// ── DText[] → DocumentFragment ────────────────────────────────────────
function makeDtextsFrag(dtexts) {
  const $jq = dtexts_render(dtexts);
  const frag = document.createDocumentFragment();
  $jq.each((_, el) => frag.appendChild(el));
  return frag;
}

// ── td 內填入節（inline span，Mode 3/4 可多節連續） ──────────────────
function appendVersesToCell(td, verses, version) {
  for (const verse of verses) {
    if (verse.hide) continue;

    const span = document.createElement('span');
    span.className = 'lec';
    span.setAttribute('ver', version);
    span.setAttribute('book', verse.book);
    span.setAttribute('chap', verse.chap);
    span.setAttribute('sec', verse.sec);

    const numSpan = document.createElement('span');
    numSpan.className = 'verseNumber';
    numSpan.textContent = verse.verseLabel + ' ';
    span.appendChild(numSpan);

    const contentSpan = document.createElement('span');
    contentSpan.className = 'verseContent';
    contentSpan.appendChild(makeDtextsFrag(verse.dtexts));
    span.appendChild(contentSpan);

    td.appendChild(span);
  }
}

// ── Mode 1 & 3：並排 table（columns = versions） ───────────────────────
function buildColTable(table, versionData) {
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  for (const vd of versionData) {
    const th = document.createElement('th');
    th.textContent = vd.vName;
    headerRow.appendChild(th);
  }

  const tbody = table.createTBody();
  const maxP = Math.max(...versionData.map(vd => vd.paraGroups.length), 0);

  // lastTd[vi]：每個版本欄最後一個有內容的 td，供 rowspan 累加
  const lastTd = new Array(versionData.length).fill(null);

  for (let pi = 0; pi < maxP; pi++) {
    // 若所有版本都全 hide，跳過整列
    const allHidden = versionData.every(vd => {
      const pg = vd.paraGroups[pi];
      return !pg || pg.verses.every(v => v.hide);
    });
    if (allHidden) continue;

    const dataRow = tbody.insertRow();
    versionData.forEach((vd, vi) => {
      const pg = vd.paraGroups[pi];
      const isHidden = !pg || pg.verses.every(v => v.hide);

      if (isHidden) {
        // 此版本此節是合併節 → 前一個 td 延伸 rowspan，不插入新 td
        if (lastTd[vi]) lastTd[vi].rowSpan = (lastTd[vi].rowSpan || 1) + 1;
      } else {
        const td = dataRow.insertCell();
        td.dataset.r = pi;
        td.dataset.c = vi + 1;
        td.setAttribute('ver', vd.version);
        appendVersesToCell(td, pg.verses, vd.version);
        lastTd[vi] = td;
      }
    });
  }
}

// ── Mode 2 & 4：交錯 table（1 欄，譯本名稱選擇性內嵌於 cell） ────────
function buildRowTable(table, versionData) {
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  const th = document.createElement('th');
  th.textContent = '經文';
  headerRow.appendChild(th);

  const tbody = table.createTBody();
  const maxP = Math.max(...versionData.map(vd => vd.paraGroups.length), 0);
  let rowNum = 0;

  for (let pi = 0; pi < maxP; pi++) {
    for (const vd of versionData) {
      const paraGroup = vd.paraGroups[pi];
      if (!paraGroup || paraGroup.verses.every(v => v.hide)) continue;

      const row = tbody.insertRow();
      const td = row.insertCell();
      td.setAttribute('ver', vd.version);
      td.dataset.r = rowNum;
      td.dataset.c = 1;

      if (isShowVersion) {
        const badge = document.createElement('span');
        badge.className = 'ver-badge';
        badge.textContent = vd.vName;
        td.appendChild(badge);
      }

      appendVersesToCell(td, paraGroup.verses, vd.version);
      rowNum++;
    }
  }
}

// ── 選取輔助：取得目前所有選取的 td ───────────────────────────────────
function getSelectedTds() {
  return [...document.querySelectorAll('#lec-table td.sel')];
}

// ── 依 data-r/c 將 td 分組，回傳排序後的二維陣列 rows[cols[td]] ──────
function groupSelectedTds(tds) {
  const byRow = {};
  for (const td of tds) {
    const r = td.dataset.r ?? td.parentElement.rowIndex;
    const c = td.dataset.c ?? td.cellIndex;
    if (!byRow[r]) byRow[r] = {};
    byRow[r][c] = td;
  }
  const rows = Object.keys(byRow).sort((a, b) => Number(a) - Number(b));
  return rows.map(r => {
    const cols = Object.keys(byRow[r]).sort((a, b) => Number(a) - Number(b));
    return cols.map(c => byRow[r][c]);
  });
}

// ── 建構純文字 + HTML table（跨欄時）────────────────────────────────
function buildCopyData() {
  const tds = getSelectedTds();
  if (tds.length === 0) return { plain: null, html: null };

  const grid = groupSelectedTds(tds);

  // 純文字：tab 分欄，換行分列
  const plain = grid.map(row => row.map(td => td.textContent.trim()).join('\t')).join('\n');

  // HTML table（多格時才包 table 標籤）
  const htmlRows = grid.map(row => {
    const cells = row.map(td => {
      const clone = td.cloneNode(true);
      if (!snVisible) clone.querySelectorAll('.sn').forEach(el => el.remove());
      return `<td>${clone.innerHTML}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  const html = tds.length > 1 ? `<table border="1">${htmlRows}</table>` : null;

  return { plain, html };
}

async function performCopy() {
  const { plain, html } = buildCopyData();
  if (plain === null) return;

  let succeeded = false;
  if (navigator.clipboard?.write && html) {
    try {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html':  new Blob([html],  { type: 'text/html'  }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      })]);
      succeeded = true;
    } catch (_) {}
  }
  if (!succeeded) {
    try {
      await navigator.clipboard.writeText(plain);
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

  copyOutput.textContent = (html ? '[HTML table + 純文字]' : '[純文字]') + '\n' + plain;
}

// ── document copy 事件（Ctrl+C 攔截） ────────────────────────────────
document.addEventListener('copy', e => {
  const tds = getSelectedTds();
  if (tds.length === 0) return;   // 無選取格，走瀏覽器原生 copy
  e.preventDefault();
  const { plain, html } = buildCopyData();
  if (html)           e.clipboardData.setData('text/html',  html);
  if (plain !== null) e.clipboardData.setData('text/plain', plain);
  copyOutput.textContent = (html ? '[HTML table + 純文字]' : '[純文字]') + '\n' + (plain ?? '');
});

// ── 重設選取狀態面板 ──────────────────────────────────────────────────
function resetSelectionUI() {
  modeBadge.textContent    = '— 尚未選取 —';
  modeBadge.className      = 'badge-none';
  statusDetail.textContent = '';
  btnCopy.disabled         = true;
}

// ── TableSelector 設定 ────────────────────────────────────────────────
function setupSelector(tbl) {
  const sel = new TableSelector(tbl);

  sel.addEventListener('selectionstart', () => {
    resetSelectionUI();
  });

  sel.addEventListener('selectioncommit', ({ detail }) => {
    const { isTouch, x, y, mode, startRow, startCol, endRow, endCol } = detail;
    const tds = getSelectedTds();

    if (tds.length === 0 && mode === 'single' && !isTouch) {
      // 電腦單格原生選字，不更新 badge
    } else if (mode === 'single') {
      modeBadge.textContent    = '單格';
      modeBadge.className      = 'badge-single';
      statusDetail.textContent = `(列${startRow},欄${startCol}) — ${isTouch ? '整格' : '原生選取'}`;
      btnCopy.disabled         = tds.length === 0;
    } else if (mode === 'col') {
      modeBadge.textContent    = 'Column-based';
      modeBadge.className      = 'badge-sel';
      statusDetail.textContent = `欄${startCol}, 列${Math.min(startRow,endRow)}–${Math.max(startRow,endRow)}（${tds.length} 格）`;
      btnCopy.disabled         = false;
    } else {
      modeBadge.textContent    = 'Row-based 矩形';
      modeBadge.className      = 'badge-sel';
      statusDetail.textContent = `列${Math.min(startRow,endRow)}–${Math.max(startRow,endRow)} × 欄${Math.min(startCol,endCol)}–${Math.max(startCol,endCol)}（${tds.length} 格）`;
      btnCopy.disabled         = false;
    }

    if (isTouch || mode !== 'single') {
      ctxMenu.show(x, y, [
        { label: '📋 複製', onClick: performCopy },
      ]);
    }
  });

  sel.addEventListener('selectioncancel', () => {
    resetSelectionUI();
    ctxMenu.hide();
  });
}

// ── 注腳 progressive 載入 ─────────────────────────────────────────────
// footWork: [{ record: [book,chap,sec,dtexts], version, book, chap, sec }]
function loadFootsProgressively(footWork, table) {
  if (footWork.length === 0) {
    footStatus.textContent = '';
    return;
  }

  let remaining = footWork.length;
  footStatus.textContent = `注腳載入中 0/${remaining}…`;

  for (const { record, version, book, chap, sec } of footWork) {
    queryFootsAsync([record], version)
      .then(() => {
        // 找到對應的 .lec span，局部重繪 .verseContent
        const lecSpan = table.querySelector(
          `span.lec[ver="${version}"][book="${book}"][chap="${chap}"][sec="${sec}"]`
        );
        if (lecSpan) {
          const contentSpan = lecSpan.querySelector('.verseContent');
          if (contentSpan) {
            contentSpan.innerHTML = '';
            contentSpan.appendChild(makeDtextsFrag(record[3]));
          }
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

// ── 核心 render：依 mode 決定版面 ──────────────────────────────────────
function renderToContainer(rspArr, mode) {
  const footWork = [];

  const versionData = rspArr.map(rsp => {
    const records = rsp.record.map(rec => [
      BibleConstantHelper.getBookId(rec.engs.toLowerCase()),
      rec.chap, rec.sec, rec.bible_text,
    ]);
    const dtexts_with_addrs = cvt_others(rsp.version, records);

    // 收集有待載入注腳的節
    for (const record of dtexts_with_addrs) {
      const [book, chap, sec, dtexts] = record;
      if (dtexts.some(d => d.foot != null && d.foot.footContent == null)) {
        footWork.push({ record, version: rsp.version, book, chap, sec });
      }
    }

    const paraGroups = buildParaGroups(dtexts_with_addrs, mode);
    return { version: rsp.version, vName: rsp.v_name || rsp.version, paraGroups };
  });

  const table = document.createElement('table');
  table.id = 'lec-table';
  if (!snVisible) table.classList.add('sn-hidden');

  if (mode === 1 || mode === 3) {
    buildColTable(table, versionData);
  } else {
    buildRowTable(table, versionData);
  }

  lecContainer.innerHTML = '';
  lecContainer.appendChild(table);

  setupSelector(table);
  loadFootsProgressively(footWork, table);
}

// ── 載入指定書卷章節 + 譯本 ───────────────────────────────────────────
async function loadTable(bookIndex, chap, versions) {
  currentBook     = bookIndex;
  currentChap     = chap;
  currentVersions = [...versions];

  loadingStatus.textContent = '載入中…';
  loadingStatus.className   = '';

  const { qstr, engs } = bookChapToParams(bookIndex, chap);
  rspArrCache = await Promise.all(versions.map(v => fetchVersion(v, qstr, engs)));

  renderToContainer(rspArrCache, currentMode);

  const versNames = rspArrCache.map(r => r.v_name || r.version).join(' / ');
  loadingStatus.textContent = `${bookChapDisplayName(bookIndex, chap)}（${versNames}）`;
  loadingStatus.className   = 'done';
  btnBook.textContent       = bookChapDisplayName(bookIndex, chap);
  btnVersion.textContent    = currentVersions.join(' / ');
}

// ── 按鈕 / 選單事件 ───────────────────────────────────────────────────
btnCopy.addEventListener('click', () => performCopy());

document.getElementById('chk-show-version').addEventListener('change', e => {
  isShowVersion = e.target.checked ? 1 : 0;
  if (rspArrCache && (currentMode === 2 || currentMode === 4)) {
    renderToContainer(rspArrCache, currentMode);
  }
});

selMode.addEventListener('change', () => {
  currentMode = Number(selMode.value);
  if (rspArrCache) renderToContainer(rspArrCache, currentMode);
});

btnSn.addEventListener('click', () => {
  snVisible = !snVisible;
  const lecTable = document.getElementById('lec-table');
  if (lecTable) lecTable.classList.toggle('sn-hidden', !snVisible);
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
  const [, tableResult] = await Promise.allSettled([
    initParagraphData(),
    loadTable(currentBook, currentChap, currentVersions),
  ]);

  if (tableResult.status === 'rejected') {
    loadingStatus.textContent = `載入失敗：${tableResult.reason?.message ?? tableResult.reason}`;
    loadingStatus.className   = 'error';
    console.error(tableResult.reason);
  }
})();
