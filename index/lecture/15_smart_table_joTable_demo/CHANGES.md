# 15_smart_table_joTable_demo — 變更說明

## 背景

14 版完成了多譯本並排與版本切換，但注腳標誌 `【n】` 只以純文字顯示，內容未載入。

15 版的目標：加入注腳支援（`foot_note_show_method = 2`，直接載入），
在表格渲染前先 `await` 所有注腳查詢完成。

---

## 核心目標

- 注腳查詢策略：method = 2（先查完所有注腳，再渲染）
- 使用 `queryFootsAsync`，各譯本並行查詢
- 修正 raw API 不含 `book` 欄位的問題（`engs → book`）

---

## 相對於 14 版的架構變化

### 1. 新增 import

```js
import { BibleConstantHelper } from '../../BibleConstantHelper.es2023.js';
import { queryFootsAsync }     from '../../queryFootsAsync.js';
```

### 2. `rec.book` 補正（Bug 修正）

Raw QSB API 回傳的 record 不含 `book`（數字），只有 `engs`（英文書卷名）。
`qsb.js` wrapper 內部呼叫 `qsbRecordToStd()` 補上，但本 demo 直接 `fetch` 故需手動轉換：

```js
// 14 版（有 bug：rec.book = undefined）
const records_with_addr = rsp.record.map(rec => [rec.book, rec.chap, rec.sec, rec.bible_text]);

// 15 版（修正：engs → book）
const records_with_addr = rsp.record.map(rec => [
  BibleConstantHelper.getBookId(rec.engs.toLowerCase()),
  rec.chap, rec.sec, rec.bible_text,
]);
```

若不修正，`foot.book = undefined` → `rtAsync` 組出 `engs=undefined` → API 無結果 → `TypeError`。

### 3. `buildJoTable` 改為 `async`，加入注腳查詢

```js
async function buildJoTable(rspArr) {
  const secMap    = new Map();
  const footTasks = [];

  for (const rsp of rspArr) {
    const records_with_addr = rsp.record.map(rec => [
      BibleConstantHelper.getBookId(rec.engs.toLowerCase()),
      rec.chap, rec.sec, rec.bible_text,
    ]);
    const dtexts_with_addr = cvt_others(rsp.version, records_with_addr);

    // foot_note_show_method == 2：蒐集 Promise，稍後並行等待
    footTasks.push(queryFootsAsync(dtexts_with_addr, rsp.version));

    for (const [, , sec, dtexts] of dtexts_with_addr) {
      // ... secMap 建構 ...
    }
  }

  await Promise.all(footTasks); // 等待所有注腳查詢完成

  // ... 組 cells、回傳 joTable ...
}
```

### 4. `loadTable` 改為 `await buildJoTable`

```js
// 14 版
joTable = buildJoTable(rspArr);

// 15 版
joTable = await buildJoTable(rspArr);
```

### 5. 預設譯本變更

```js
// 14 版
let currentVersions = ['unv', 'kjv', 'rcuv'];

// 15 版（lcc、csb 有注腳；csb 為新約 only，以弗所書 OK）
let currentVersions = ['unv', 'lcc', 'csb'];
```

### 6. 注腳 CSS 樣式（新增）

```css
.foot { display: inline; color: #ff00c1; }
.foot .ref { color: #1d4ed8; text-decoration: underline; cursor: pointer; }
```

---

## 注腳流程說明

```
fetchVersion × 3（並行，production API）
  ↓
cvt_others × 3
  → runAddFoot 掃描 【n】，建立 DFoot{ id, book, chap, verse, version, footContent: undefined }
  ↓
queryFootsAsync × 3（並行，rt.php）
  → rtAsync 查詢各注腳文字
  → 填入 dtext.foot.footContent = [{ w: text }]
  → cvt_foot_csb / cvt_foot_cnet（版本別格式化，識別交互參照）
  ↓
await Promise.all → 全部注腳就緒
  ↓
dtexts_render → 注腳展開為【註n：...】
```

### `queryFootsAsync` 的版本處理

| 版本 | `runAddFoot` 呼叫 | 格式化 |
|------|------------------|--------|
| `unv` | ❌（排除） | 無注腳 |
| `lcc` | ✓ | 無需格式化 |
| `csb` | ✓ | `cvt_foot_csb()`：識別《書卷名》 |
| `cnet` | ✓ | `cvt_foot_cnet()`：動態正則書卷名 |

### rt.php API 端點

```js
// rtAsync.js
const domain = isRDLocation() ? "http://127.0.0.1:5600" : ""
// → 本地開發時需在 port 5600 有 PHP server
```

---

## 已知問題（→ 16 版改進）

method = 2 策略的缺點：全部注腳查完才渲染，章節長時有「卡住」感。
16 版改為「先渲染表格（注腳顯示佔位符 `【n】`），背景逐節更新」。

---

## 與 14 版差異摘要

| 項目 | 14 版 | 15 版 |
|------|-------|-------|
| 注腳 | 未載入，顯示 `【n】` | method = 2，渲染前全部查完 |
| `buildJoTable` | `function`（sync） | `async function` |
| `rec.book` | `undefined`（bug） | `BibleConstantHelper.getBookId(rec.engs)` |
| 新增 import | — | `BibleConstantHelper`、`queryFootsAsync` |
| 預設譯本 | `unv / kjv / rcuv` | `unv / lcc / csb` |
| 載入提示 | 「載入中…」 | 「載入中（含注腳查詢）…」 |

---

## 檔案清單

| 檔案 | 說明 |
|------|------|
| `15_smart_table_joTable_demo.html` | 更新標題與描述 |
| `15_smart_table_joTable_demo.js`   | 新增 import；`buildJoTable` async；`engs→book` 修正 |
| `15_smart_table_joTable_demo.css`  | 新增 `.foot` / `.foot .ref` 樣式 |

---

## 下一步（16 版）

- 改為 **Progressive 載入**：先渲染表格，背景逐節更新注腳
- `buildJoTable` 改回 sync，回傳 `{ joTable, footWork }`
- `footWork`：每個有注腳的 `(one_record, version, r, c)` 一筆
- `loadFootsProgressively(footWork, table)`：每筆呼叫 `queryFootsAsync([one_record], version)`，
  `.then()` 重渲染對應 `td`
- 新增 `#foot-status` 顯示「注腳載入中 X/N…」進度
