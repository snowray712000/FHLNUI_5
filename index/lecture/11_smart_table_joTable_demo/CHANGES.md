# 11_smart_table_joTable_demo — 變更說明

## 背景

10 版 demo 驗證了「joTable 資料驅動 + TableRenderer + TableSelector」的架構，
但資料是靜態寫死的（創世記前3節）。
11 版的目標是接入真實 API，驗證動態建構 joTable 的流程，
為未來 FhlLecture 整合做準備。

---

## 核心目標

- 固定查詢：**以弗所書第3章**，譯本 **unv / kjv / rcuv**
- 以弗所書3章在 rcuv 譯本有合併節（`bible_text = "a"`），作為合併節的邊界測試
- 不實作版本切換 / 書卷選擇 UI
- 直接將 API 回傳的 `bible_text` 原始字串放入表格，不做格式轉換（留給 12 版）

---

## 相對於 10 版的變化

### 1. 資料層：靜態 → 動態 API

| 項目 | 10 版 | 11 版 |
|------|------|------|
| 資料來源 | 靜態 `joTable` 常數 | POST `bible.fhl.net/json/qsb.php` |
| 譯本 | KJV / 和合本（2欄） | unv / kjv / rcuv（3欄） |
| 建構方式 | 直接寫死 | `buildJoTable(rspArr)` 動態生成 |
| content 格式 | `[{ w, isRef, 'ref-desc' }]` | `[{ w: bible_text }]` 純字串 |

### 2. 主流程改為 async IIFE

```
(async () => {
  rspArr = await Promise.all([fetchVersion('unv'), fetchVersion('kjv'), fetchVersion('rcuv')])
  joTable = buildJoTable(rspArr)
  table = TableRenderer.buildDom(joTable, render_dtexts)
  → 初始化 TableSelector、CtxMenu（同 10 版）
})()
```

所有 UI 邏輯（TableSelector、事件監聽、copy 邏輯）皆在 async IIFE 內，
透過 closure 共享 `table`、`joTable`、`lastSelCells`。

### 3. buildJoTable：以 sec 為 row、版本為 col

```js
// sec → { version: bible_text } map
// secList 排序後依序建立 cells
cells.push({ r: sec, c: versionIdx + 1, content: [{ w: bible_text }] })
```

rcuv 合併節（`bible_text = "a"`）直接顯示，不做特殊處理（留給 12 版）。

### 4. 複用 10 版元件（不複製）

TableRenderer、TableSelector 直接 import 自 `../10_smart_table_joTable_demo/`。
CtxMenu import 自 `../09_smart_table_selection_rect_demo/`。

---

## Bug Fix：單格文字選取無法複製

**發現時機**：11 版因有長篇中文文字，實際測試了單格文字選取 + 複製，才暴露問題。
**同步修正 10 版**（同樣的 bug）。

### 根本原因

`buildSelCells` 依賴 `td.sel` 查詢：
```js
function buildSelCells(tbl, jot) {
  tbl.querySelectorAll('td.sel').forEach(...)  // ← 問題根源
}
```
但 single desktop mode（`#applySingleCell` 不加 `.sel`）→ 回傳 `[]` →
`selectioncommit` early return → `btnCopy.disabled` 永遠不被解除。

### 連鎖問題

| 問題 | 現象 |
|------|------|
| `lastSelCells = []` | `btnCopy` 永遠 disabled |
| `copy` handler 只檢查 `!lastSelCells`（不檢查 `length`） | `[]` 是 truthy → `e.preventDefault()` 被執行 → Ctrl+C 被攔截 |
| `buildCopyData` 的 `selectedTds.length === 0` 分支 | 死碼：上一行的 `length === 0` early return 先攔截 |

### 修正方案（3處）

**① `selectioncommit`：single desktop 模式從邏輯位置反查 joCell**
```js
if (mode === 'single' && !isTouch) {
  const td     = table.querySelector(`tbody [data-r="${startRow}"][data-c="${startCol}"]`);
  const joCell = joTable.cells.find(cell => cell.r === startRow && cell.c === startCol);
  lastSelCells = (td && joCell) ? [{ joCell, td }] : [];
} else {
  lastSelCells = buildSelCells(table, joTable);
}
```

**② `buildCopyData`：`selectedTds` 為空時退回整格文字**
```js
if (selectedTds.length === 0) {
  const selText = window.getSelection().toString();
  return { plain: selText || cellToText(lastSelCells[0].joCell), html: null };
}
```
- Ctrl+C 前仍有原生選取 → 複製反白文字
- 點複製按鈕（點按鈕會清除原生選取） → 退回整格文字

**③ `copy` event handler：single desktop 不阻擋原生 Ctrl+C**
```js
if (!lastSelCells || lastSelCells.length === 0) return;
if (!table.querySelectorAll('td.sel').length) return;  // ← 新增
e.preventDefault();
```

### 修正後行為

| 操作 | 行為 |
|------|------|
| 反白局部文字 + Ctrl+C | 瀏覽器原生處理，複製反白的部分文字 |
| 反白局部文字 + 複製按鈕 | 退回整格文字（按鈕點擊清除了原生 selection） |
| touch 單格 / 跨格選取 | 原有邏輯不變 |

---

## 檔案清單

| 檔案 | 說明 |
|------|------|
| `11_smart_table_joTable_demo.html` | HTML 骨架（同 10 版結構，加 `#loading-status`） |
| `11_smart_table_joTable_demo.js` | 主邏輯：API fetch + buildJoTable + TableSelector 串接 |
| `11_smart_table_joTable_demo.css` | 樣式（同 10 版，稍調整欄寬） |

**複用（import，不複製）**：
- `../10_smart_table_joTable_demo/TableRenderer.js`
- `../10_smart_table_joTable_demo/TableSelector.js`
- `../09_smart_table_selection_rect_demo/CtxMenu.js`

---

## 下一步（12 版）

- 將 `content: [{ w: bible_text }]` 換成真正的 `DText[]`：
  - 呼叫 `cvt_others(version, [[book, chap, sec, bible_text]])` → `DText[]`
- 將 `render_dtexts` 換成真正的 `dtexts_render(content)` → jQuery DOM → HTML string
- rcuv 合併節（`bible_text = "a"`）在 `cvt_others` 解析後會變成空 DText，
  可在 `buildJoTable` 中識別並加上 `rs`（rowspan）
