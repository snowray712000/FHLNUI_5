# 17_smart_table_joTable_demo — 變更說明

## 背景

16 版完成了注腳 Progressive 載入，但尚未處理 `bible_text="a"` 的情況。
當某譯本某節的聖經文字為 `"a"`，表示此節在該譯本中與上一節合併。
16 版會直接顯示一格只有「a」字的儲存格，視覺上不正確。

17 版目標：
1. 將節碼嵌入每格內容最前方（以 DText 形式）
2. 正確處理「併入上節」，產生 rowspan 合併儲存格

---

## 核心目標

- 每格內容最前面插入節碼 DText：`{ w: "20-21", isRef: 1, refDescription: "西2" }`
- 偵測 `bible_text="a"` 並以 `rowspan` 合併儲存格，不顯示「a」
- 合併時節碼顯示範圍（如 "20-21"）；`refDescription` 只到章（"西2"），為未來 click 查看上下文預留

---

## 相對於 16 版的架構變化

### 1. 節碼 DText 設計

每個 cell 的 `content` 陣列最前面插入：

```js
{ w: verseLabel, isRef: 1, refDescription: bookChapRef }
```

- `verseLabel`：節號字串，合併時為範圍，如 `"20-21"`
- `bookChapRef`：中文書卷縮寫 + 章號，如 `"西2"`（不含節號）
  - 使用 `BibleConstant.CHINESE_BOOK_ABBREVIATIONS[bookIndex - 1] + chap` 計算
  - `refDescription` 只到章，是為了將來點擊可查看整章上下文

`isRef: 1` 使 `dtexts_render` 以 `render_ref()` 渲染，產生 `<span class="ref" addr-desc="西2">20-21</span>`。

### 2. `buildJoTable` 加入 `bookChapRef` 參數

```js
function buildJoTable(rspArr, bookChapRef) { ... }
```

`loadTable` 呼叫時傳入：
```js
const bookChapRef = BibleConstant.CHINESE_BOOK_ABBREVIATIONS[bookIndex - 1] + chap;
const { joTable: jt, footWork } = buildJoTable(rspArr, bookChapRef);
```

### 3. 「併入上節」處理

**mergeInfo**：`Map<"version:sec", prevSec>`

- 偵測：`isMergeWithPrevVerse(dtexts)` — `dtexts.length === 1 && dtexts[0].w === 'a'`
- 合併節：記錄 mergeInfo，secMap 設空陣列，**不更新** `prevSec`

**rsMap**：`Map<"version:prevSec", rowspan>`

**cells 建構**：合併節跳過（TableRenderer 自動跳過已佔用格），前一節加 `rs`：

```js
cells.push({ r: sec, c, content: [verseNumDtext, ...dtexts], ...(rs > 1 ? { rs } : {}) });
```

### 4. `FootWork` 新增 `verseNumDtext`

```js
/** @typedef {{ one_record, version, r, c, verseNumDtext }} FootWork */
```

注腳 progressive 重渲時需帶上節碼：

```js
td.appendChild(render_dtexts([verseNumDtext, ...one_record[3]]));
```

### 5. 節碼標籤範圍計算

當**所有譯本**都同意某節為「a」時，前一節的 `verseLabel` 更新為範圍：

```js
labelMap.set(prevSec, `${rangeStart}-${sec}`);   // 如 "20-21"
```

### 6. 初始章節改為歌羅西書 2

`currentBook = 51`（歌羅西書）、`currentChap = 2`，因含 "a" 節，便於直接觀察效果。

---

## 與 16 版差異摘要

| 項目 | 16 版 | 17 版 |
|------|-------|-------|
| 節碼顯示 | 無 | 嵌入每格內容前方（isRef DText）|
| `bible_text="a"` | 顯示「a」字 | rowspan 合併至前一節 |
| `buildJoTable` 參數 | `(rspArr)` | `(rspArr, bookChapRef)` |
| `FootWork` 結構 | `{ one_record, version, r, c }` | 加 `verseNumDtext` |
| 注腳重渲 | `render_dtexts(one_record[3])` | `render_dtexts([verseNumDtext, ...one_record[3]])` |
| 初始章節 | 以弗所書 3 | 歌羅西書 2（含 "a" 節）|

---

## 檔案清單

| 檔案 | 說明 |
|------|------|
| `17_smart_table_joTable_demo.html` | 更新標題、說明文字 |
| `17_smart_table_joTable_demo.js`   | 節碼 DText 插入；合併處理；FootWork 加 verseNumDtext |
| `17_smart_table_joTable_demo.css`  | 移除節碼標籤欄樣式；新增 `#demo .ref` 節碼樣式 |

**複用（import，不複製）**：
- 與 16 版完全相同
