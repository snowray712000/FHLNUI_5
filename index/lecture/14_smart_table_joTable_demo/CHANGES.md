# 14_smart_table_joTable_demo — 變更說明

## 背景

13 版加入了書卷章節切換，但譯本固定為 `['unv', 'kjv', 'rcuv']` 常數，無法在 UI 中更換。

14 版的目標：加入譯本切換 UI，使用專案內建的 `Ijnjs.BibieVersionDialog.s`。

---

## 核心目標

- 加入「切換譯本」按鈕，開啟 `Ijnjs.BibieVersionDialog.s` 對話框
- `loadTable` 簽名擴充：`(bookIndex, chap)` → `(bookIndex, chap, versions)`
- 其餘功能（DText 轉換、TableSelector、SN toggle、copy）完全繼承 13 版

---

## 相對於 13 版的架構變化

### 1. `currentVersions` — 新增模組層級狀態

```js
// 13 版（固定常數）
const VERSIONS = ['unv', 'kjv', 'rcuv'];

// 14 版（模組層級狀態）
let currentVersions = ['unv', 'kjv', 'rcuv'];
```

### 2. `loadTable` 簽名擴充

```js
// 13 版
async function loadTable(bookIndex, chap)

// 14 版
async function loadTable(bookIndex, chap, versions) {
  currentBook     = bookIndex;
  currentChap     = chap;
  currentVersions = versions;
  // ...
  const rspArr = await Promise.all(versions.map(v => fetchVersion(v, qstr, engs)));
  // ...
}
```

所有呼叫點（初始載入、書卷切換、版本切換）都傳入 `currentVersions`。

### 3. `Ijnjs.BibieVersionDialog.s` 整合

```js
btnVersion.addEventListener('click', () => {
  const dlg = window.Ijnjs?.BibieVersionDialog?.s;
  if (!dlg) { alert('譯本選擇尚未就緒，請稍候再試'); return; }
  dlg.setCallbackClosed(async jo => {
    const newVersions = jo.selects;    // string[]
    if (!newVersions || newVersions.length === 0) return;
    await loadTable(currentBook, currentChap, newVersions);
  });
  dlg.open({ selects: currentVersions, offens: [], sets: [] });
});
```

注意：原始碼 typo 為 `BibieVersionDialog`（非 `BibleVersionDialog`），需原樣使用。

| API | 說明 |
|-----|------|
| `dlg.open({ selects, offens, sets })` | 開啟對話框，`selects` 為目前已選版本 |
| `dlg.setCallbackClosed(jo => ...)` | 關閉後 callback，`jo.selects` 為新選版本 |

### 4. 按鈕顯示更新

```js
// loadTable 末尾
btnVersion.textContent = currentVersions.join(' / ');
```

載入完成後按鈕文字同步更新為目前版本清單。

---

## 面板佈局調整

14 版面板按鈕順序：
1. `#btn-book`（切換章節）
2. `#btn-version`（切換譯本）— 新增
3. `#btn-sn`（SN toggle）
4. `#btn-copy`（複製）

---

## 與 13 版差異摘要

| 項目 | 13 版 | 14 版 |
|------|-------|-------|
| 譯本 | 固定常數 `VERSIONS` | `currentVersions`，可動態切換 |
| `loadTable` 簽名 | `(bookIndex, chap)` | `(bookIndex, chap, versions)` |
| 切換譯本按鈕 | 無 | `#btn-version` → `Ijnjs.BibieVersionDialog.s` |
| `btnVersion` 文字 | 固定 `unv / kjv / rcuv` | 動態反映目前版本 |

---

## 檔案清單

| 檔案 | 說明 |
|------|------|
| `14_smart_table_joTable_demo.html` | panel 加 `#btn-version` |
| `14_smart_table_joTable_demo.js`   | `currentVersions`、`loadTable` 簽名擴充、`BibieVersionDialog` 整合 |
| `14_smart_table_joTable_demo.css`  | 加入 `#btn-version` 樣式（綠底） |

**複用（import，不複製）**：
- `../10_smart_table_joTable_demo/TableRenderer.js`
- `../10_smart_table_joTable_demo/TableSelector.js`
- `../09_smart_table_selection_rect_demo/CtxMenu.js`
- `../../cvt_others.js`
- `../../dtext/dtexts_render.js`
- `../../BibleConstant.es2023.js`

---

## 下一步（15 版）

- 加入**注腳支援**：`foot_note_show_method = 2`（直接載入）
- 需 import `queryFootsAsync` 與 `BibleConstantHelper`
- `buildJoTable` 改為 `async`，在渲染前 `await queryFootsAsync`
- `rec.book` 注意：raw API 不含 `book`，需用 `BibleConstantHelper.getBookId(rec.engs.toLowerCase())` 轉換
- 預設譯本改為 `['unv', 'lcc', 'csb']`（lcc、csb 有注腳）
