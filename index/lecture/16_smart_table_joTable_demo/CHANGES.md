# 16_smart_table_joTable_demo — 變更說明

## 背景

15 版採用 `foot_note_show_method = 2`（直接載入），在渲染前 `await` 所有注腳查詢，
導致章節越長等待時間越久、有「卡住」感。

16 版的目標：改為 **Progressive 載入**——先立即渲染表格（注腳以 `【n】` 佔位），
背景逐節查詢注腳，查完一節就局部更新那格的 DOM，消除卡頓感。

---

## 核心目標

- 表格**立即**顯示（不等注腳）
- 注腳**逐節**背景載入，每節完成就更新對應 `<td>`
- 顯示「注腳載入中 X/N…」進度，載入完畢後 2 秒消失

---

## 相對於 15 版的架構變化

### 1. `buildJoTable`：async → sync，回傳型別改變

```js
// 15 版
async function buildJoTable(rspArr): Promise<joTable>

// 16 版
function buildJoTable(rspArr): { joTable, footWork }
```

`footWork` 是一個陣列，每筆代表「一節有待載入的注腳」：

```js
/** @typedef {{ one_record: DTextsWithAddr, version: string, r: number, c: number }} FootWork */
```

- `one_record`：`[book, chap, sec, DText[]]`，是 `cvt_others` 回傳的單節資料
- `r`：joTable 列號（= `sec`）
- `c`：joTable 欄號（= 版本在 `rspArr` 的 index + 1）

### 2. `footWork` 收集邏輯

```js
rspArr.forEach((rsp, idx) => {
  const c = idx + 1;
  // ...
  for (const one_record of dtexts_with_addr) {
    const [, , sec, dtexts] = one_record;
    // ...
    if (dtexts.some(d => d.foot != null && d.foot.footContent == null)) {
      footWork.push({ one_record, version: rsp.version, r: sec, c });
    }
  }
});
```

每個 `(版本, 節)` 組合是一筆獨立的 footWork。
`unv` 因 `runAddFoot` 排除，故 `dtexts.some(...)` 永遠 false，不會產生 footWork。

### 3. `loadFootsProgressively(footWork, tbl)` — 新函式

```js
function loadFootsProgressively(footWork, tbl) {
  if (footWork.length === 0) { footStatus.textContent = ''; return; }

  let remaining = footWork.length;
  footStatus.textContent = `注腳載入中 0/${remaining}…`;

  for (const { one_record, version, r, c } of footWork) {
    queryFootsAsync([one_record], version)    // 單節呼叫
      .then(() => {
        const td = tbl.querySelector(`tbody [data-r="${r}"][data-c="${c}"]`);
        if (td) {
          td.innerHTML = '';
          td.appendChild(render_dtexts(one_record[3]));  // 重渲染（注腳已填入）
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
```

關鍵設計：
- `queryFootsAsync([one_record], version)` — **單節呼叫**（傳入長度為 1 的陣列）
- `queryFootsAsync` 本身已支援任意長度陣列，單節呼叫完全相容
- `.then()` 中的 `one_record[3]`（DText[]）已被 `queryFootsAsync` in-place 更新
- `render_dtexts(one_record[3])` 重渲染時，`foot.footContent` 已有值，展開為完整注腳

### 4. `loadTable` 中的呼叫順序

```js
async function loadTable(bookIndex, chap, versions) {
  // ...
  const rspArr = await Promise.all(versions.map(v => fetchVersion(v, qstr, engs)));

  const { joTable: jt, footWork } = buildJoTable(rspArr);  // sync
  joTable = jt;

  const newTable = TableRenderer.buildDom(joTable, render_dtexts);
  // ... 加入 DOM、setupSelector ...

  // ← 這裡表格已可見
  loadingStatus.className = 'done';  // 狀態列隱藏
  btnBook/btnVersion 更新

  loadFootsProgressively(footWork, table);  // 不 await，背景執行
}
```

`loadFootsProgressively` 不被 `await`，因此不阻擋 `loadTable` 回傳。

### 5. HTML 新增 `#foot-status`

```html
<p id="loading-status">載入中…</p>
<p id="foot-status"></p>          <!-- 新增 -->
```

```css
#foot-status {
  margin: 0 0 12px;
  color: #2563eb;
  font-size: 0.82em;
  min-height: 1.4em;  /* 保留空間，避免版面跳動 */
}
```

---

## Progressive 載入的 DOM 更新機制

注腳載入後能正確更新 DOM，依賴三個前提：

1. **`one_record[3]` 是同一個 DText[] 參考**
   `secMap` 與 `footWork` 都指向 `cvt_others` 回傳的同一陣列，
   `queryFootsAsync` in-place 修改 `dtext.foot.footContent`，
   兩邊都能看到更新。

2. **`td.dataset.r/c` 由 `TableRenderer.buildDom` 設定**
   `table.querySelector('tbody [data-r="${r}"][data-c="${c}"]')` 可精確定位目標格。

3. **`render_dtexts(one_record[3])` 重渲染而非 diff**
   整格替換（`td.innerHTML = ''` + `td.appendChild(frag)`），
   簡單可靠，不需要 virtual DOM。

---

## 與 15 版差異摘要

| 項目 | 15 版 | 16 版 |
|------|-------|-------|
| 表格顯示時機 | 全部注腳查完才顯示 | **立即顯示** |
| 注腳載入策略 | `await Promise.all`（全版本並行） | 逐節背景載入，各自 `.then()` 更新 |
| `buildJoTable` | `async`，回傳 `joTable` | `sync`，回傳 `{ joTable, footWork }` |
| 注腳佔位 | 不存在（查完才渲染） | `【n】`（`footContent == null` 時的預設渲染） |
| DOM 更新 | 一次全渲染 | 逐節 `td.innerHTML = '' + appendChild` |
| `#foot-status` | 無 | 「注腳載入中 X/N…」進度 + 完成後自動消失 |
| 單節失敗處理 | `Promise.all` 任一失敗即整批失敗 | `.catch()` 靜默忽略，其他節繼續 |

---

## 檔案清單

| 檔案 | 說明 |
|------|------|
| `16_smart_table_joTable_demo.html` | 新增 `#foot-status` 元素 |
| `16_smart_table_joTable_demo.js`   | `buildJoTable` sync；`loadFootsProgressively` 新函式 |
| `16_smart_table_joTable_demo.css`  | 新增 `#foot-status` 樣式 |

**複用（import，不複製）**：
- 與 15 版完全相同
