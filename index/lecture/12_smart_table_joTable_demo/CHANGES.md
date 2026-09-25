# 12_smart_table_joTable_demo — 變更說明

## 背景

11 版驗證了動態 API 取得以弗所書第3章並建構 joTable 的流程，
但 `content` 儲存的是原始 `bible_text` 字串（`[{ w: bible_text }]`），
render 也只是輸出純文字，rcuv 合併節的 `"a"` 直接顯示。

12 版的目標：接入完整的標準轉換管道，讓表格內容與主程式的 render 品質一致。

---

## 核心目標

- 導入標準轉換管道：`bible_text` → `cvt_others()` → `DText[]` → `dtexts_render()` → DOM
- 加入 Strong Number 顯示/隱藏切換按鈕
- 其餘架構（TableRenderer、TableSelector、CtxMenu、copy 邏輯）完全繼承 11 版

---

## 標準轉換管道

### 1. `cvt_others`（`index/cvt_others.js`）

```js
import { cvt_others } from '../../cvt_others.js';

// 簽名
cvt_others(version: string, records: [book, chap, sec, bible_text][])
  → [[book, chap, sec, DText[]], ...]
```

- 負責將 API 回傳的 `bible_text` 字串解析為 `DText[]`
- 內部使用 `TPPageState.s`，但 `.s` 有 auto-create 邏輯，standalone demo 下安全呼叫
- rcuv 合併節（`bible_text = "a"`）會解析為空 DText[]（`[]`）

### 2. `dtexts_render`（`index/dtext/dtexts_render.js`）

```js
import { dtexts_render } from '../../dtext/dtexts_render.js';

// 簽名
dtexts_render(dtexts: DText[]) → JQuery<HTMLElement>
```

- 使用全域 `$`（jQuery），**不做 import**，因此 HTML 需先以 `<script>` 載入 jQuery CDN，
  再以 `<script type="module">` 載入主 JS
- 回傳 jQuery 物件（`<span>` 的 children），需轉成 `DocumentFragment` 供 `TableRenderer` 使用

### 3. `render_dtexts`（本地包裝）

```js
function render_dtexts(content) {
  const $jq = dtexts_render(content);
  const frag = document.createDocumentFragment();
  $jq.each((_, el) => frag.appendChild(el));
  return frag;  // DocumentFragment 是 Node，TableRenderer.#fillCell 支援
}
```

`TableRenderer.#fillCell` 判斷 `result instanceof Node` → `td.appendChild(result)`，
`DocumentFragment` 繼承 `Node`，直接可用，無需修改 TableRenderer。

### 4. `buildJoTable`：content 改存 `DText[]`

```js
// 11 版：content: [{ w: bible_text }]
// 12 版：content: DText[]（cvt_others 回傳）

const records_with_addr = rsp.record.map(rec => [rec.book, rec.chap, rec.sec, rec.bible_text]);
const dtexts_with_addr  = cvt_others(rsp.version, records_with_addr);
for (const [, , sec, dtexts] of dtexts_with_addr) {
  secMap.get(sec)[rsp.version] = dtexts;
}
cells.push({ r: sec, c: idx + 1, content: dtexts });
```

---

## DText 結構與 SN 類別說明

`dtexts_render` 輸出的 DOM 有兩種 SN 相關 CSS 類別：

| CSS class  | 條件             | 意義                                  |
|------------|------------------|---------------------------------------|
| `.sn`      | `d.tp2` 存在     | 真正的 Strong Number（`<H1234>` 等）  |
| `.sn-text` | `d.tp2` 不存在   | 語言學對齊標記，供其他功能使用，不隱藏 |

辨別方式：`render_sn` 內 `const isRealSn = snData?.tp2`。

---

## SN 顯示/隱藏切換

### UI
Panel 中新增 `#btn-sn` 按鈕，預設文字「隱藏 SN」。
切換後按鈕變黃底，文字改為「顯示 SN」。

### 狀態
```js
let snVisible = true;  // module 層級，cellToText_dtexts 與 IIFE 內部共用
```

### 三層聯動

| 層次         | 機制                                                                              |
|--------------|-----------------------------------------------------------------------------------|
| **DOM 顯示** | `table.classList.toggle('sn-hidden', !snVisible)` + CSS `#demo.sn-hidden .sn { display: none; }` |
| **純文字 copy** | `cellToText_dtexts` 中 `if (d.sn && d.tp2 && !snVisible) return []`            |
| **HTML copy**   | `buildCopyData` 中 `if (!snVisible) $wrap.find('.sn').remove()`                 |

`.sn-text` 在三層都**不被隱藏/過濾**。

---

## `cellToText_dtexts`（遞迴）

```js
function cellToText_dtexts(dtexts) {
  return dtexts.flatMap(d => {
    if (d.sn && d.tp2 && !snVisible) return [];  // 真正的 SN 隱藏時跳過
    if (d.w)        return [d.w];
    if (d.children) return [cellToText_dtexts(d.children)];
    return [];
  }).join('');
}
```

遞迴處理 `d.children`（巢狀 DText，如交叉參照節點）。

---

## HTML copy 路徑

```js
const frag    = render_dtexts(cell.content);      // 重新 render（不取 DOM）
const $wrap = $('<span>').append($(frag));
if (!snVisible) $wrap.find('.sn').remove();        // 移除 SN 元素再序列化
return `<td>${$wrap.html()}</td>`;
```

用 `$('<span>').append($(frag)).html()` 序列化 DocumentFragment 為 HTML 字串。

---

## jQuery 依賴說明

`dtexts_render.js` 使用全域 `$`，無 import 宣告。
12 版 HTML 解法：

```html
<!-- jQuery CDN 必須在 module 之前載入 -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js" ...></script>
<script type="module" src="12_smart_table_joTable_demo.js"></script>
```

ES module 可存取頁面全域（`window.$`），但 `<script>` 標籤須在 `type="module"` 之前。

---

## 相對於 11 版的差異摘要

| 項目               | 11 版                        | 12 版                                  |
|--------------------|------------------------------|----------------------------------------|
| `content` 格式     | `[{ w: bible_text }]`        | `DText[]`（`cvt_others` 解析後）       |
| `render_dtexts` 輸出 | `string`（純文字）          | `DocumentFragment`（真實 DOM）         |
| `cellToText_dtexts` | `item.w` 直接取             | 遞迴 + SN 隱藏過濾                     |
| SN 切換按鈕        | 無                           | `#btn-sn`，三層聯動（DOM / plain / HTML）|
| jQuery 依賴        | 無                           | CDN `<script>` 先於 module             |
| rcuv 合併節        | 顯示 `"a"` 字串              | `cvt_others` 解析為空 `DText[]`，格空白 |

---

## 檔案清單

| 檔案 | 說明 |
|------|------|
| `12_smart_table_joTable_demo.html` | HTML 骨架；jQuery CDN 置於 module script 前；panel 加 `#btn-sn` |
| `12_smart_table_joTable_demo.js`   | 主邏輯；加 `cvt_others` / `dtexts_render` 轉換管道；SN toggle |
| `12_smart_table_joTable_demo.css`  | 同 11 版；新增 `#btn-sn` 樣式、`#demo.sn-hidden .sn { display:none }` |

**複用（import，不複製）**：
- `../10_smart_table_joTable_demo/TableRenderer.js`
- `../10_smart_table_joTable_demo/TableSelector.js`
- `../09_smart_table_selection_rect_demo/CtxMenu.js`

---

## 下一步（13 版）

- 加入**聖經目錄切換** UI（書卷 + 章節 selector）
- 動態更新 `QSTR`/`ENGS`，重新 fetch + rebuild joTable + rebuild DOM
- rcuv 合併節（空 DText[]）可識別並加上 `rs`（rowspan）合併顯示
