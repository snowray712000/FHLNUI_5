# 13_smart_table_joTable_demo — 變更說明

## 背景

12 版完成了標準轉換管道（`cvt_others` → `DText[]` → `dtexts_render`），
但書卷章節固定為「以弗所書第3章」（`QSTR = '弗3'`），無法切換。

13 版的目標：加入書卷章節切換 UI，使用專案內建的 `Ijnjs.BookChapDialog.s`。

---

## 核心目標

- 加入「切換章節」按鈕，開啟 `Ijnjs.BookChapDialog.s` 對話框
- 支援重複載入：同一頁面內切換任意書卷章節，不需重新整理
- 其餘功能（DText 轉換、TableSelector、SN toggle、copy）完全繼承 12 版

---

## 相對於 12 版的架構變化

### 1. 書卷章節參數：靜態 → 動態

```js
// 12 版（固定常數）
const QSTR = '弗3';
const ENGS = 'Eph';

// 13 版（模組層級狀態 + 工具函式）
let currentBook = 49;   // 以弗所書
let currentChap = 3;

function bookChapToParams(bookIndex, chap) {
  return {
    qstr: BibleConstant.CHINESE_BOOK_ABBREVIATIONS[bookIndex - 1] + chap,
    engs: BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[bookIndex - 1],
  };
}
```

- `BibleConstant` 直接 ES module import，純靜態資料，無依賴問題

### 2. `loadTable(bookIndex, chap)` — 可重複呼叫

```js
async function loadTable(bookIndex, chap) {
  currentBook = bookIndex;
  currentChap = chap;
  const { qstr, engs } = bookChapToParams(bookIndex, chap);
  const rspArr = await Promise.all(VERSIONS.map(v => fetchVersion(v, qstr, engs)));
  joTable = buildJoTable(rspArr);

  const newTable = TableRenderer.buildDom(joTable, render_dtexts);
  newTable.id = 'demo';
  container.innerHTML = '';
  container.appendChild(newTable);
  table = newTable;

  setupSelector(table);
  // 重置選取狀態...
}
```

每次呼叫：
1. 舊 `table` DOM 直接被 `container.innerHTML = ''` 刪除
2. 舊 `TableSelector` 自然失效（它的 `#startCell` 在 pointerup 時檢查後早退）
3. 新 table 傳入 `setupSelector` 重建事件綁定

### 3. `setupSelector(tbl)` — 封裝 TableSelector 初始化

12 版的 TableSelector 事件監聽全在 async IIFE 內，無法重複呼叫。
13 版抽出為 `setupSelector(tbl)` 函式，`loadTable` 每次換 table 後呼叫。

```js
function setupSelector(tbl) {
  const sel = new TableSelector(tbl);
  sel.addEventListener('selectionstart', () => { ... });
  sel.addEventListener('selectioncommit', ({ detail }) => { ... });
  sel.addEventListener('selectioncancel', () => { ... });
}
```

### 4. 模組層級狀態（所有函式共享）

```js
let joTable      = null;
let table        = null;
let lastSelCells = null;
let snVisible    = true;
let currentBook  = 49;
let currentChap  = 3;
```

12 版的 `joTable`、`table`、`lastSelCells` 在 async IIFE 的 closure 內，
13 版提升為模組層級，讓 `buildCopyData`、`performCopy`、`document copy` 等直接引用。

### 5. `document.addEventListener('copy', ...)` 一次註冊

12 版每次 IIFE 執行只跑一次，沒問題。
13 版 `loadTable` 會多次呼叫，因此 `copy` 事件只在模組載入時註冊一次，
透過 module 層級 `table` / `lastSelCells` 引用最新狀態：

```js
document.addEventListener('copy', e => {
  if (!lastSelCells || lastSelCells.length === 0) return;
  if (!table || !table.querySelectorAll('td.sel').length) return;  // ← 加 table 空值防護
  e.preventDefault();
  // ...
});
```

---

## `Ijnjs.BookChapDialog.s` 整合

### 用法

```js
btnBook.addEventListener('click', () => {
  const dlg = window.Ijnjs?.BookChapDialog?.s;
  if (!dlg) { alert('聖經目錄尚未就緒，請稍候再試'); return; }
  dlg.setCBHided(async () => {
    const result = dlg.getResult();  // { book: number, chap: number }
    await loadTable(result.book, result.chap);
  });
  dlg.show({ book: currentBook, chap: currentChap });
});
```

- `show({ book, chap, isGb })` — 開啟，預設顯示目前書卷章節
- `setCBHided(cb)` — 對話框關閉時 callback
- `getResult()` — 回傳 `{ book: number, chap: number }`（1-based）

### HTML 依賴載入順序

`Ijnjs.BookChapDialog.s` 是非同步初始化的（ijnjs-ui 用 fetch 載入 BookChapDialog.js 和 .html）。
因此 HTML 需要依序載入：

```html
<script src="libs/ijnjs/ijnjs.js"></script>       <!-- 建立 testThenDoAsync -->
<script src="libs/ijnjs-fhl/ijnjs-fhl.js"></script> <!-- 建立 Ijnjs.FHL（BibleConstant 等） -->
<script src="libs/ijnjs-ui/ijnjs-ui.js"></script>   <!-- 建立 Ijnjs.BookChapDialog.s -->
```

在按鈕 click 時才存取 `Ijnjs.BookChapDialog.s`（lazy），
給 ijnjs-ui 足夠時間完成非同步初始化（頁面載入期間已足夠）。

---

## 面板佈局調整

13 版面板按鈕順序：
1. `#btn-book`（切換章節）— 顯示目前書卷名
2. `#btn-sn`（SN toggle）
3. `#btn-copy`（複製）

---

## 與 12 版差異摘要

| 項目             | 12 版                          | 13 版                                      |
|------------------|--------------------------------|--------------------------------------------|
| 書卷章節         | hardcoded 弗3                  | `currentBook/currentChap`，可動態切換      |
| `fetchVersion`   | 使用 `QSTR`/`ENGS` 全域常數    | 接受 `qstr`/`engs` 參數                    |
| 主流程           | 單次 async IIFE                | `loadTable(book, chap)` 可重複呼叫         |
| TableSelector    | IIFE 內建立一次                | `setupSelector(tbl)` 每次換 table 重建     |
| 切換按鈕         | 無                             | `#btn-book` → `Ijnjs.BookChapDialog.s`     |
| 新增 import      | 無                             | `BibleConstant`（純靜態）                  |
| 新增 `<script>`  | 無（只有 jQuery CDN + module） | ijnjs / ijnjs-fhl / ijnjs-ui               |

---

## 檔案清單

| 檔案 | 說明 |
|------|------|
| `13_smart_table_joTable_demo.html` | 加入 ijnjs 系列 script；panel 加 `#btn-book` |
| `13_smart_table_joTable_demo.js`   | 加入 `BibleConstant` import；`loadTable`/`setupSelector` 架構 |
| `13_smart_table_joTable_demo.css`  | 加入 `#btn-book` 樣式；修正 Bootstrap 干擾 |

**複用（import，不複製）**：
- `../10_smart_table_joTable_demo/TableRenderer.js`
- `../10_smart_table_joTable_demo/TableSelector.js`
- `../09_smart_table_selection_rect_demo/CtxMenu.js`
- `../../cvt_others.js`
- `../../dtext/dtexts_render.js`
- `../../BibleConstant.es2023.js`

---

## 下一步（14 版）

- 加入**譯本切換** UI：`#btn-version` → `Ijnjs.BibieVersionDialog.s`
- 注意拼法：`BibieVersionDialog`（原始碼 typo，非 BibleVersionDialog）
- API：`open({ selects: string[] })` + `setCallbackClosed(jo => jo.selects)`
- `loadTable` 簽名擴充為 `loadTable(bookIndex, chap, versions)`
