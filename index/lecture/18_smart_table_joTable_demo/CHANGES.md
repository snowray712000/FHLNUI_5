# 18_smart_table_joTable_demo — 變更說明

## 背景

17 版完成了 joTable 的注腳 Progressive 載入與「併入上節」合併儲存格。
18 版目標：離開 joTable / TableRenderer，改用 **Render Mode 1–4** 展示聖經文字，
並以簡易下拉選單切換 4 種模式。

---

## 4 種 Render Mode 說明

| Mode | 版面     | 段落分組        |
|------|----------|----------------|
| 1    | 並排     | 每節 = 一段落（假段落）|
| 2    | 交錯     | 每節 = 一段落（假段落）|
| 3    | 並排     | ncv 真實段落邊界 |
| 4    | 交錯     | ncv 真實段落邊界 |

**並排（col）**：每個譯本獨立一欄，欄頂顯示版本標題。
**交錯（row）**：所有譯本在同一欄，以段落序號輪流排列，每段落前顯示譯本標籤。

---

## 核心架構

### 1. 假段落（Modes 1 & 2）vs 真段落（Modes 3 & 4）

```js
function buildParaGroups(dtexts_with_addrs, mode) {
  const groupData = (mode === 3 || mode === 4) && paragraphData
    ? paragraphData                                        // 真段落
    : dtexts_with_addrs.map(a => [a[0], a[1], a[2], '']); // 假段落（每節一段）

  const grouped = grouping_by_paragraph_for_dtexts_with_addr(dtexts_with_addrs, groupData);
  // grouped: [[recordIndices[], paragraphIndex], ...]
  ...
}
```

**假段落**等同於主專案 `gen_fake_groups_for_mode1`：每節產生一筆 `[book, chap, sec, '']`，
傳給 `grouping_by_paragraph` 後，每節都自成一個段落。

### 2. 段落資料載入（ncv）

`paragraphs_ncv.json.gz` 路徑：`../../paragraphs_ncv.json.gz`（相對於 demo HTML）

```js
async function initParagraphData() {
  const json = await loadAndDecompressJsonGzAsync('../../paragraphs_ncv.json.gz');
  paragraphData = json.paragraphs;
}
```

與聖經資料**並行**載入（`Promise.allSettled`），若失敗則 modes 3/4 退為逐節分組。

### 3. 並排 vs 交錯 render

```js
if (mode === 1 || mode === 3) {
  // 並排：每個版本各自一個 .vercol
  for (const vd of versionData) {
    const col = createVercol(vd.vName);
    for (const paraGroup of vd.paraGroups)
      col.appendChild(renderParagraph(paraGroup, ...));
  }
} else {
  // 交錯：所有版本同一個 .vercol，以 paragraphIndex 輪流插入
  const col = createVercol();
  for (let pi = 0; pi < maxP; pi++)
    for (const vd of versionData)
      col.appendChild(renderParagraph(vd.paraGroups[pi], ...showVerBadge=true));
}
```

### 4. 「併入上節」處理

與 17 版邏輯相同：偵測 `dtexts.length === 1 && dtexts[0].w === 'a'`，
更新前一節 `verseLabel` 為範圍（如 "20-21"），本節設 `hide: true`。

### 5. isTitle1（段落標題 DText）

`cvt_others` 解析到 `<h2>` / `<FO>` 標籤 → DText `{ w: ..., isTitle1: 1 }` →
`dtexts_render` 產生 `<span class="isTitle1">...</span>` → CSS 套用深紫色加粗樣式。
**18 版 CSS 定義**：`display: block; font-weight: 800; color: #8b008b`

---

## 相對於 17 版的差異

| 項目 | 17 版 | 18 版 |
|------|-------|-------|
| 呈現結構 | `<table>` (joTable / TableRenderer) | `div.lec-main > div.vercol > div.paragraph > span.lec` |
| 段落分組 | 無（每節 = 一格） | Mode 1/2 假段落；Mode 3/4 ncv 真段落 |
| 交錯顯示 | 無 | Mode 2 & 4 |
| 選取複製 | 有（TableSelector）| 無（native 原生選取）|
| 注腳 progressive | 有 | 無（不另外處理）|
| 初始模式 | — | Mode 1 |

---

## 檔案清單

| 檔案 | 說明 |
|------|------|
| `18_smart_table_joTable_demo.html` | 加入 pako CDN；mode 下拉選單 |
| `18_smart_table_joTable_demo.js`   | 4 種 mode 渲染；段落資料載入；建構 vercol/paragraph DOM |
| `18_smart_table_joTable_demo.css`  | layout-col / layout-row；ver-header；para-title；ver-badge |

**複用（import，不複製）**：
- `cvt_others`、`dtexts_render`、`BibleConstant`、`BibleConstantHelper`
- `grouping_by_paragraph_for_dtexts_with_addr`
- `loadAndDecompressJsonGzAsync`
- ijnjs 書卷目錄、譯本選擇 dialog（與 17 版相同）
