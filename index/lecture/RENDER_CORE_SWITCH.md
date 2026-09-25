# FhlLecture Render Core 切換說明

## 兩個版本

| 檔案 | 結構 | 選取 |
|------|------|------|
| `FhlLecture_render_core.js` | `<div>` + `<span>` 巢狀 | 無拖曳選取 |
| `FhlLecture_render_core_table.js` | HTML `<table>` | 拖曳選取（欄/矩形/單格） |

---

## 切換方式

**只改一行**，在 `index/FhlLecture.es2023.js` 第 28 行：

```js
// 原本（div 版）
import { FhlLecture_render_core } from './lecture/FhlLecture_render_core.js'

// Table 版（現在啟用）
import { FhlLecture_render_core } from './lecture/FhlLecture_render_core_table.js'
// 切回原本：改回 FhlLecture_render_core.js
```

---

## Table 版行為

### Display Mode 對應

| Mode | 說明 | Table 結構 |
|------|------|------------|
| 1 | Verse-by-verse，side-by-side | 多欄：各譯本一欄，各節一行 |
| 3 | Paragraph，side-by-side | 同上（段落由 rspan 自然對齊） |
| 2 | Verse-by-verse，interleaved | 2欄：譯本名 \| 經文，交錯排列 |
| 4 | Paragraph，interleaved | 同上（段落為單位交錯） |

### 選取模式（Mode 1/3 多欄時最實用）

| 操作 | 結果 |
|------|------|
| 同一欄拖曳 | Column-based（藍色），複製為單欄表格 |
| 跨欄拖曳 | Row-based 矩形（橘色），複製為多欄表格 |
| 單格點擊（不拖） | 原生文字選取 |
| Ctrl+C | 複製 `text/html` 表格 + `text/plain` |

### 互動元素不受影響

在 `.sn`（Strong's Number）、`.ft`（注腳）、`.ref`（交互參照）上點擊，行為與原本完全相同，不會觸發拖曳選取。

---

## Merged verses（合併節）處理

例如歌羅西書 2:21 的 `"a"` 節（併入上節），table 版自動計算 `rowspan`：

```
      和合本          KJV
┌─────────────┬──────────────────┐
│ 20 經文…    │ 20-21 經文…      │ ← KJV rowspan=2
├─────────────┤                  │
│ 21 經文…    │ (rowspan 佔用)   │
└─────────────┴──────────────────┘
```

---

## 架構說明

```
FhlLecture_render_core_table.js
  ├── import build_view_model      ← 從 FhlLecture_render_core.js（新增 export）
  ├── import build_layout_vm       ← 同上
  ├── import render_paragraph_div  ← 同上（cell 內容與原本完全相同）
  │
  ├── build_table_vm()    資料層：ContentVm → TableVm（headers + rows + gridMap）
  ├── build_table_dom()   DOM 層：TableVm → <table class="lecTable">
  └── initDocumentEventsOnce()  選取邏輯（document-level，只掛一次）
                                _currentGridMap 每次 render 更新
```

`FhlLecture.es2023.js` 的 jQuery event delegation（`.lec`、`.sn`、`.ft`、`.ref`）和 `reshape`、`selectLecture` 等函式**不需要任何修改**。
