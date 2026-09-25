# 10_smart_table_joTable_demo — 變更說明

## 背景

09 demo 驗證了 `TableSelector extends EventTarget` 的解耦設計：
選取狀態機與業務邏輯（copy、context menu）完全分離。

但 09 的 table 是靜態 HTML，cell 內容是純文字，沒有資料層。
10 demo 的目標是引入「資料驅動」架構，為未來 FhlLecture 使用做準備。

---

## 核心思路（三層解耦）

```
joTable（資料層）
    ↓  TableRenderer.buildDom(joTable, render_dtexts)
<table> DOM（每個 <td> 帶 data-r / data-c）
    ↓  TableSelector
selectioncommit event
    ↓  業務層 listener
copy / context menu / 狀態面板
```

### 1. joTable 資料結構（來自 sp1.js 規畫）

```js
{
  r: 3, c: 2,
  headers: [{ c, content }],
  cells:   [{ r, c, rs?, cs?, content }]
}
```

- `content` 是 `[{w, isRef, 'ref-desc', ...}]` 的陣列（dtext 格式）
- `rs` = rowspan，`cs` = colspan
- 1-based，與 FhlLecture 的節碼系統對齊

### 2. render_dtexts callback

```js
function render_dtexts(content) → string（HTML）
```

10 demo 用的是簡單示範版（`item.w` 串接）。
**未來換成 FHL 真正的 render 只需替換這一個函式**，其餘結構不動。

### 3. data-r / data-c 屬性

`TableRenderer` 在每個 `<td>` 上標記邏輯位置：
- `td.dataset.r` = joTable 的 r（1-based）
- `td.dataset.c` = joTable 的 c（1-based）

這讓 copy 邏輯可以從 `td.sel` 反查 `joTable.cells`，
**不需要 DOM text scraping**。

---

## TableSelector 修改（相對於 09 版）

**問題根因**：09 的 `#pos(td)` 用 `td.cellIndex`（DOM index）。
當 table 有 rowspan 時，後面的列少了被 span 的格，cellIndex 會錯位，
導致「同欄拖曳」被誤判為「跨欄矩形選取」。

**修改方式**（10 目錄的本地副本，09 原版不動）：

| 方法 | 09 版 | 10 版 |
|------|------|------|
| `#pos(td)` | `{ row: tr.rowIndex, col: td.cellIndex }` | 優先讀 `data-r/data-c`，無則退回 DOM index |
| `#applyColSelection` | `table.rows[r].cells[col]` 逐格加 `.sel` | `querySelectorAll('tbody td')` 過濾 `dataset.c === col && dataset.r in range` |
| `#applyRowSelection` | `table.rows[r].cells[c]` 雙迴圈 | 同上，過濾 `dataset.r in range && dataset.c in range` |

**向下相容**：若 td 沒有 `data-r`，退回舊的 DOM index 行為，09 的靜態 HTML table 仍可直接套用。

---

## 已知限制

1. **rowspan cell 的視覺選取**：若選取範圍橫跨某個 rowspan cell 的「中間」
   （例如 rowspan=3 的 cell，只選 row2~row3），
   highlight 仍會從 row1 開始顯示（因為 DOM 只有一個 `<td>`）。
   這是 HTML rowspan 的特性限制，不是 bug。

2. **copy 邏輯以 `data-r` 為準**：一個 rowspan=2 的 cell 在 copy 時算一個 cell，
   文字輸出一次（不重複）。

---

## 檔案清單

| 檔案 | 說明 |
|------|------|
| `TableRenderer.js` | 新增。joTable + render_dtexts → `<table>` DOM |
| `TableSelector.js` | 09 版的本地副本，加入 data-r/data-c 支援 |
| `10_smart_table_joTable_demo.js` | 主邏輯。joTable 資料、render_dtexts、事件串接 |
| `10_smart_table_joTable_demo.html` | HTML 骨架（table 由 JS 動態插入） |
| `10_smart_table_joTable_demo.css` | 樣式（與 09 接近，多了 `.ref` 節碼樣式） |

**複用**：`CtxMenu.js` 直接 import 自 `../09_.../CtxMenu.js`，未修改。

---

## 下一步（供未來參考）

- 將 `render_dtexts` 換成 `dtexts_render.js` 的真實實作
  → index/dtext/dtexts_render.js（使用者已開啟過此檔）
- 將 `joTable` 的建構邏輯移入 FhlLecture 的 render pipeline，
  讓 `build_table_vm()` 輸出 joTable 格式
- `TableSelector` 的 data-r/data-c 版可直接用於 `FhlLecture_render_core_table.js`
