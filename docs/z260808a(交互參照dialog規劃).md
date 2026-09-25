# 交互參照 Dialog（cross-reference dialog）研究報告

> 目的：整理本專案（FHL NUI）中「交互參照 dialog」相關的程式碼、資料流、測試與已知問題，
> 供之後在另一個新專案中，以 TDD 方式重新設計/實作同類功能時參考。
> 交互參照 dialog 是共用彈窗機制，經文內容、原文字典、串珠(TSK)、註腳等都會用到它，
> 且彼此可以巢狀疊出多層 dialog。與一般經文閱讀不同，**單一譯本顯示即可，不需多譯本並排**（舊版固定用和合本 `unv`）。

---

## 1. 共用 Dialog 元件本體 — `index/DialogHtml.es2023.js`

`export class DialogHtml`：jQuery UI `.dialog()` 的輕量包裝類別。

- `dlg`：`showDialog()` 之後才有值，記錄目前開啟的 dialog jQuery 物件。
- `showDialog(jo)`：
  - `jo.html`：要塞入 dialog 的 HTML 字串。
  - `jo.maxWidth/maxHeight/width`：預設 `window.innerWidth/innerHeight * 0.80`。
  - `jo.position`：可指定初始位置，例如貼近觸發元素：
    ```js
    { my: "right top", at: "right top", of: $(jo.event.target) }
    ```
    jQuery UI 會在空間不夠時自動把 `right/left`、`top/bottom` 互換。
  - `jo.getTitle()`：回傳**純文字**標題（jQuery UI title 只能塞純文字；若要塞 HTML 需事後用 `.find('.ui-dialog-title').html(...)` 覆寫）。
  - `jo.registerEventWhenShowed(dlg)`：dialog 顯示後才綁事件的 callback — **巢狀交互參照事件委派的關鍵掛勾點**。
  - `dialogclose` 事件：關閉時把整個 dialog DOM 移除（`outerHTML = ""`），避免記憶體殘留。
  - 私有方法 `#getIdOfDialog()`：自動找一個沒被用過的 `#iddlgN` id，動態 append 一個 `<div>` 到 `<body>` —— **同一頁可同時疊多層 dialog**，巢狀交互參照就是靠這個機制疊出多層彈窗。
- `closeDialogViaTriggerCloseButton()`：透過模擬點擊「關閉鈕」關閉（而非直接呼叫 `.dialog('close')`），確保 `dialogclose` 事件與清理邏輯照常觸發。

配套文件 `readmeRD.md` 是作者對 `DialogHtml` 的心得：強調「初始位置」用 `of: $(jo.event.target)` 相對定位很好用；「初始大小」只能用 px（無法用 em），通常用視窗比例設定，height 用 auto。

### 新專案設計建議
- 保留「動態產生獨立 DOM 容器 + 遞增 id」以支援巢狀彈窗的思路。
- `getTitle()` 純文字限制、事後覆寫 HTML title 是個 hack，新專案可考慮一開始就設計成支援 HTML/元件化的 title，避免此 workaround。
- `dialogclose` 時清理 DOM，避免多層巢狀開關造成記憶體洩漏，這點必須保留。

---

## 2. 使用/繼承 DialogHtml 的地方

| 檔案 | 角色 |
|---|---|
| `index/queryReferenceAndShowAtDialogAsync.es2023.js` | **交互參照 dialog**（本報告核心） |
| `index/queryDictionaryAndShowAtDialogAsync.es2023.js` | 原文字典 dialog（Strong Number 點擊後顯示 TWCB/CBOL 字典資料） |
| `index/BookChapDialog.es6.js` | 書卷/章節選擇 dialog（舊 es6 版，import 已失效的 `DialogHtml.es6.js`，見第 8 節） |
| `index/DialogTemplate/DialogTemplate.js` | **更舊版**（Bootstrap modal，非 jQuery UI）字典/交互參照對話框樣板系統 |
| `index/FhlInfoContent.es2023.js` | Parsing 頁籤內即時彈出小 dialog 顯示 Parsing 結果；也負責 `.ref` 全域委派 |
| `index/FhlLecture.es2023.js` | 摘要/靈修頁面點擊經文參照 → 呼叫交互參照/字典 dialog |
| `index/Help.es2023.js` | 說明彈窗 |
| `index/index.js` | 把交互參照/字典查詢函式掛到 `window`，供尚未轉 ES module 的舊程式呼叫 |

註腳（footnote）不是獨立 dialog 子類別，而是被渲染成 `.foot`/`.ft` span，資料直接塞進 dtexts（見 `index/queryFootsAsync.js`）。

---

## 3. 交互參照 / 串珠（TSK）資料流細節

### 3.1 觸發點：`index/queryReferenceAndShowAtDialogAsync.es2023.js`（交互參照 dialog 主入口）

```
export function queryReferenceAndShowAtDialogAsync(jo)
```

- `jo` 型別 `DQueryReferenceParam`：
  - `addrs`（`DAddress[]`，優先使用）
  - `addrsDescription`（字串，沒有 `addrs` 時用來查詢）
  - `version`（**預設 `"unv"`，印證單一譯本顯示**）
  - `bookDefault`（預設書卷 1-based，預設 45＝羅馬書）
  - `event`（滑鼠事件，決定顯示位置）
  - `method`
- 顯示方式由 `TPPageState.s.reference_method` 控制：
  - `0` = 每次詢問使用者要用哪種方式
  - `1` = 直接彈 dialog
  - `2` = 直接跳頁內嵌顯示（`show_in_embed()`）
- 對應函式：
  - `show_dialog_choose_method()`：先跳一個小 dialog 讓使用者選「方法1/方法2/說明」，位置貼近滑鼠。
  - `show_help_dialog(ev)`：說明彈窗，內含 `<select id="reference_method">` 讓使用者切換偏好並寫回 `pageState.reference_method`。
  - `show_in_embed()`：不開 dialog，直接把主頁面 `TPPageState.s` 的 `bookIndex/chap/sec` 改成目標經文，重繪 `BookSelect`／`FhlLecture`／`FhlInfo`／`ViewHistory`。
  - **`show_in_dialog()`（核心流程）**：
    1. `addrsDescription` 若沒給，用 `cvtAddrsToRef(jo.addrs, '羅')` 轉字串。
    2. 呼叫 `qsb({ qstr, ver, bookDefault })`（`index/api/qsb.js`）非同步取得經文資料（`DQsbResult`）。
    3. `when_qsbAsync(a1)`：API 回傳的 `record[]` → `records_with_addr`（`[book, chap, sec, text]`）→ `cvt_others(ver, records_with_addr)` 轉成 dtexts → `prepare_dtexts_for_html()`。
    4. 若 `ps.foot_note_show_method == 2`，會額外 `await queryFootsAsync(dtexts_with_addr, ver)` 把註腳資料非同步塞進 dtexts（交互參照內容帶出巢狀註腳的來源）。
    5. `cvtDTextsToHtml()` 轉成最終 HTML；再用 jQuery 把 `.sn` 加上 `.sn-hidden`（依 `ps.strong` 設定隱藏 Strong number 標記）。
    6. `new DialogHtml().showDialog({ html, getTitle: () => addrsDescription, registerEventWhenShowed })`。
    7. **巢狀交互參照的處理邏輯就在 `registerEventWhenShowed` 內**：
       ```js
       dlg.on('click', '.ref', a1 => {
           let addrs = JSON.parse($(a1.target).attr('addr-data'))
           queryReferenceAndShowAtDialogAsync({ addrs: addrs, event: a1 })
       })
       ```
       對 dialog 內容裡任何帶 `.ref` class 的 span 委派點擊事件，遞迴呼叫自己，於是在既有 dialog 之上再疊一層新的 `DialogHtml`（因 `#getIdOfDialog()` 自動配新 id），達成多層巢狀彈窗。
- 輔助函式 `get_first_addr(jo)`：優先用 `jo.addrs[0]`，否則呼叫 `splitReference(jo.addrsDescription)` 解析第一個地址。
- 檔頭有 `// TODO: 還沒完全重構` 註記，作者自認此檔仍未完工。

### 3.2 原文字典的巢狀處理：`index/queryDictionaryAndShowAtDialogAsync.es2023.js`

- 同樣用 `DialogHtml`，資料源是 `SnDictOfTwcb`／`SnDictOfCbol`（浸宣 + CBOL 兩個原文字典來源），`Promise.all` 平行查詢後合併 HTML。
- title 用特殊方式塞入含「出現經文」自動搜尋連結的 HTML（`getTitle()` 只能純文字，改用 `dlg.parent().find('.ui-dialog-title').html(...)` 二次覆寫）。
- **巢狀處理**：
  ```js
  dlg.on('click', '.ref', a1 => {
      let addrs = JSON.parse($(a1.target).attr('addr-data'))
      queryReferenceAndShowAtDialogAsync({ addrs: addrs, event: a1})
  })
  ```
  字典 dialog 內若出現 `.ref`，會呼叫 `queryReferenceAndShowAtDialogAsync` 疊出交互參照 dialog —— 即「原文字典 dialog → 交互參照 dialog」的跨類型巢狀。

### 3.3 全域統一觸發點：`index/FhlInfoContent.es2023.js`

```js
$('#fhlInfoContent').off('click', '.ref').on('click', '.ref', function (ev) {
    const addr_data = $(target).attr('addr-data')
    const addr_desc = $(target).attr("addr-desc")
    const jaAddrs = addr_data ? JSON.parse(addr_data) : null
    queryReferenceAndShowAtDialogAsync({
        addrs: jaAddrs, addrsDescription: addr_desc,
        version: ps.version[0], bookDefault: ps.bookIndex, event: ev
    })
})
```

右側資訊面板（`#fhlInfoContent`，涵蓋 Parsing／註釋／串珠／典藏等頁籤）內容中所有 `.ref` 元素共用的委派事件處理器。同時支援 `addr-data`（JSON 陣列，來自舊版 `cvtDTextsToHtml`）與 `addr-desc`（字串，來自新版 `dtexts_render.js` 的 `render_ref`）—— **專案中同時存在兩套 `.ref` 屬性格式**（見第 8 節）。

### 3.4 串珠（TSK）新版渲染管線 — `index/tsks/`

1. **`TpTsks.js`** — 純 JSDoc typedef，定義 `TskBlock`／`TskItem`（`text`/`text-fb`/`orig`/`fb`/`ref`/`add-in-text`/`summaryItem`），對應 `docs/z260222e(串珠規畫).md` 的 schema 規劃。

2. **`parseTsk.js`** — `export function parseTsk(tsk_content, address)`：把 API 原始串珠文字（如 `"* clothed.\n # 2Ki 1:8; Zec 13:4|\n\n"`）依雙換行切成 block，判斷類型（`summary`/`keyword`/`refOnly`/`empty`/`note`），解析行內 `ref`/`text`/`text-fb` items。
   - `mergeAdjacentRefs()`：合併同一 block 內多段 `#...|`，同書卷時省略重複書名。
   - `addRefProp()`：為每個 `ref` item 補上缺省的書卷/章（原文常只寫「12,22」這種純節號）。
   - `postProcessSummaryBlocks()`：把「本章總覽」的 `n; text...` 轉成 `summaryItem[]`，用 `BibleConstantHelper.getCountVerseOfChap` 推算每項節數範圍。
   - `collectAddInTextItems()`：從文字抓出「See definition 02053」（Strong Number）、「ver. 3」、「ch. 2:19」、「Joh 8:44」等特殊字眼，轉成 `add-in-text` 的 `sn`/`ref` 子項目 —— **串珠內容中「隱藏的交互參照/SN」的抽取邏輯**，點擊會導到交互參照或原文字典 dialog。

3. **`cvt_tsk_blocks_to_dtexts.js`** — `export function cvt_tsk_blocks_to_dtexts(blocks, address)`：把 `TskBlock[]` 轉成專案共用的 `DText[]`。分三段輸出：`summary`（本章總覽）、`section`（本節相關 note/refOnly）、`keywords`（`*` 開頭關鍵字群），中間用 `{isHr:1}` 分隔。`cvt_add_in_text()`／`cvt_normal_item()` 把 `ref` item 轉成 `{ isRef:1, refDescription }`（**注意：串珠這條路徑用 `refDescription` 字串，不是 `refAddresses` 陣列**，與舊版 `cvtDTextsToHtml.es2023.js` 的資料格式不同）。

4. **`cvt_ref_to_chinese.js`** — `export function cvt_ref_to_chinese(ref, isgb, isfullname)`：把 TSK 原文英文書卷縮寫（如 `Job 26:14; Ps 33:6`）轉中文（`伯 26:14; 詩 33:6`），支援簡繁/簡稱全名四種組合。

5. **`renderTsk.js`（新版，`index/tsks/renderTsk.js`）** — `export async function renderTsk()`：新版串珠渲染主流程：
   - `api_tsk()`：`fetch(sc.php?book=4&...)`（`book=4` 代表串珠 API，`book=3` 是註釋 —— **`book` 參數是內容類型代碼，非聖經書卷編號**，容易混淆）。
   - 主體：`parseTsk()` → `cvt_tsk_blocks_to_dtexts()` → 對每個 dtext `cvt_ref_to_chinese_in_dtext()`（依 `ps.tsk_show_mode` 決定縮寫或全名）→ `dtexts_render()` 產生 jQuery 節點 → 清空並重繪 `#fhlInfoContent`，含上下 toolbar（「前」「後」按鈕依 API 回傳的 `prev`/`next` 更新）。
   - **不直接開 dialog** —— 串珠內容渲染在 `#fhlInfoContent` 面板內；其中 `.ref` 元素靠 3.3 節的全域委派觸發交互參照 dialog，即「串珠 → 交互參照 dialog」的巢狀入口。

### 3.5 統一渲染器：`index/dtext/dtexts_render.js`（新版）

- `export function dtexts_render(dtexts)`：`DText[] → jQuery` 渲染器（相對舊版字串式 `cvtDTextsToHtml.es2023.js`）。
- 依欄位優先序分派：`isHr`→`<hr/>`；`isBr`→`<br/>`；`rawTable`；`joRaw`；`joTable`；`childrenlist`（→`render_childrenlist`，支援巢狀 ul/li，`item?.childrenlist` 遞迴）；`children`（→`render_children`，遞迴）；`foot`（→`render_foot`，若 `foot.footContent` 是陣列，對每個子項再呼叫 `dtext_render(one)`，即註腳內容本身也可能含 ref/sn）；`isRef`（→`render_ref`）；`sn`（→`render_sn`）；否則一般文字。
- `render_ref(refData)`：同時輸出 `addr-desc`（若有 `refDescription`）與 `addr-data`（若有 `refAddresses`），呼應「兩套屬性並存」的相容處理。

### 3.6 舊版字串式渲染：`index/cvtDTextsToHtml.es2023.js`

- `export function cvtDTextsToHtml(dtexts)`：字串拼接方式產生 HTML（**交互參照 dialog 主流程目前仍使用這個而非新版 `dtexts_render`**），只認 `a1.refAddresses`（陣列）產生 `.ref` + `addr-data`，不支援 `refDescription`；巢狀 `children`/`tpContainer` 支援較陽春（字串拼接，無法表達 `childrenlist`）。

---

## 4. `tests/` 目錄下相關測試

`tests/tsk/`：
| 檔案 | 內容 |
|---|---|
| `parseTsk_test.js` | `parseTsk()` 單元測試，涵蓋各種 block 判斷與 inline 解析規則 |
| `cvt_tsk_blocks_to_dtexts_test.js` | `cvt_tsk_blocks_to_dtexts()` 單元測試 |
| `cvt_ref_to_chinese_test.js` | 書卷縮寫中英轉換測試 |
| `tsk1_test.html`/`.js`、`tsk2_test.html`/`.js` | 早期手動測試頁 |
| `tsk3_test.html`/`.js` | 手動測試頁，串接完整新管線：`fetch sc.php` → `parseTsk` → `applyBookNameMode`（呼叫 `cvt_ref_to_chinese`）→ `cvt_tsk_blocks_to_dtexts` → `dtexts_render`，附上一節/下一節按鈕，最貼近正式串珠渲染流程 |

`tests/dtext/`：
- `dtexts_render_test.js`：`dtexts_render()` 完整測試，涵蓋 ref／sn／foot／childrenlist／joTable 等各種 DText 型態，含巢狀情境。
- `childrenlist.html`：巢狀清單渲染手動測試頁。

`tests/註釋排版/dtext_comment_render_test.js`：註釋渲染測試，因與 `.ref` 共用委派機制而與交互參照相關（見 `index/comment_register_events_es2023.js`）。

Dialog 相關手動測試頁（非串珠，但同屬 Dialog 家族）：
- `tests/DialogTemplateTests.html`：舊版 `DialogTemplate.js`（Bootstrap modal）系統的測試頁，屬舊架構。
- `tests/sn-dictionary-dialog.html`：jQuery UI 1.12.1（同 `DialogHtml.es2023.js` 依賴元件），測試字典 dialog 顯示。
- `tests/BibleVersionDialogTests.html`、`tests/bible-version-dialog-pickerTests.html`、`tests/book-chap-dialog-pickerTests.html`：其他 dialog 測試頁，可交叉參考定位/尺寸邏輯用法。

---

## 5. Legacy 專案（`static/js`、`static/tsk_api`）調查結果

- `static/js/` 下只有 webpack 打包後的 minified 產物（`app.*.js`、`manifest.*.js`、`vendor.*.js`），無原始碼可讀，難以研究其邏輯。
- 但找到仍在使用的舊 React 模組 `static/tsk_api/`：
  - `tsk.tskapi.js`：呼叫 `sc.php?book=4...` 取得串珠原始資料的 API 包裝。
  - `tsk.R.frame.oneref.js`：**舊版串珠 React 元件**，`tsk.R.oneref`（單一參照可點擊按鈕，`pfn_click_oneref` 內呼叫舊版 `queryReferenceAndShowAtDialogAsyncEs6Js()`，但引用路徑 `./../../index/queryReferenceAndShowAtDialogAsync.es6.js` 已不存在，見第 8 節）與 `tsk.R.frame`（把整段 `com_text` 依行拆解，含 `#...|` 的行用 `tsk.R.oneref` 渲染成可點擊項目）。這是**單一譯本（`unv` 和合本）** 舊實作，被 `index/renderTsk.es2023.js`（頂層舊版，非 `index/tsks/renderTsk.js`）調用（`React.createElement(tsk.R.frame, {...default_version:"unv"...})`）。
  - 這條舊 React 路徑目前僅透過 `window.renderTsk` 暴露為全域相容 API，實際頁面渲染已改用 `index/tsks/renderTsk.js` 新管線。**兩套「renderTsk」同名但邏輯完全不同並存於程式庫中**，是重構過渡期產物（見第 8 節第 6 點）。
- `index/DialogTemplate/DialogTemplate.js`（Bootstrap modal 版）是比 React 版更早的「原文字典 + 交互參照」彈窗實作：用 `data-toggle="modal"` + `.reference`/`.parsingTableSn` class 委派點擊，透過 `level`（`data-level`）疊出多層 `#SnDictDialogN` modal 達成巢狀效果（`cloneTemplateSnDictDialog`），是 `DialogHtml.es2023.js` 巢狀機制的前身概念（但用複製 DOM 樣板而非動態建立新 `div#iddlgN`）。

---

## 6. `docs/z260222e(串珠規畫).md` 重點摘要

- **先分「段落類型」再分「行內元素」**，讓後續 `DText[]` 穩定。
- Block 層級：`summary`（章節摘要，只在第1節出現）/`keyword`（`*` 開頭）/`refOnly`（只有 `#...|`）/`note`（無 `#` 的說明文字）/`empty`（`# 13|` 這種「原書無此節」）。
- Inline 層級：`text`/`ref`（`#...|`）/`orig`（`[vav,]` 原文片段）/`fb`（`<FB>...<Fb>` 粗體）。
- 規則觀察：`*` 開頭視為 keyword block；多段 `#...|` 應合併為同一 ref 群（不可拆散）；只有 `#...|` 無 `*` → refOnly；`*marg:` 是 ref 的附註，應與 ref 關聯而非獨立文字。
- 提供 JSON schema 草案（`blocks[].{type, keyword, items[], raw}`），與 `TpTsks.js` 中實際的 JSDoc typedef 幾乎一致，規劃有被落實到程式碼。

配套文件：
- `docs/z260221b(串珠bug).md`：記錄作者決定「把原本用 React 的串珠渲染，全部改成 es2023 + `DText[]` pipeline」的動機與真實 bug case，並記錄自己發現「`renderTsk.js` 竟然不是被 import 的」這個坑（呼應第 8 節第 6 點）。
- `docs/z260221c(串珠的Case).md`：列舉各種串珠原始文字格式 case。
- `docs/串珠的介紹.md`：說明串珠功能本身的意義。

---

## 7. 巢狀引用（nested reference）處理邏輯彙總

| 情境 | 檔案 | 函數/位置 |
|---|---|---|
| 交互參照 dialog 內再點交互參照 | `index/queryReferenceAndShowAtDialogAsync.es2023.js` | `show_in_dialog()` 內 `registerEventWhenShowed`，`dlg.on('click','.ref', ...)` 遞迴呼叫自己 |
| 原文字典 dialog 內點交互參照 | `index/queryDictionaryAndShowAtDialogAsync.es2023.js` | `dlg.on('click', '.ref', ...)` → 呼叫 `queryReferenceAndShowAtDialogAsync` |
| 主面板（Parsing/註釋/串珠/典藏）內容中的交互參照 | `index/FhlInfoContent.es2023.js` | `$('#fhlInfoContent').on('click', '.ref', ...)`，全域委派，同時解析 `addr-data`/`addr-desc` 兩種屬性 |
| 原文字典 dialog 標題列的「出現經文」自動搜尋 | `index/queryDictionaryAndShowAtDialogAsync.es2023.js` | `domtitle.find('.fn-search-sn').on('click', ...)`，改搜尋框內容而非再開 dialog |
| 交互參照內容含註腳（foot） | `index/queryReferenceAndShowAtDialogAsync.es2023.js` | `when_qsbAsync()`，`ps.foot_note_show_method == 2` 時呼叫 `await queryFootsAsync(dtexts_with_addr, ver)` |
| 註腳內容本身巢狀渲染 sn/ref | `index/dtext/dtexts_render.js` | `render_foot()`，`foot.footContent` 為陣列時對每個子項遞迴呼叫 `dtext_render()` |
| 串珠內文中隱藏的 SN/ref 抽取（如「See definition 02053」「ver. 3」「Joh 8:44」） | `index/tsks/parseTsk.js` | `collectAddInTextItems()`、`injectAddInTextItems()` |
| 巢狀清單（`childrenlist`）遞迴渲染 | `index/dtext/dtexts_render.js` | `render_childrenlist()`，`item?.childrenlist` 遞迴呼叫自己 |
| （舊版）巢狀 Bootstrap modal | `index/DialogTemplate/DialogTemplate.js` | `IEventShowDialog.FnShowBsModal` + `setLevelAndPrepareNextLevelDialog()` 用 `data-level` 疊出 `#SnDictDialogN` |

---

## 8. 觀察到的容易出錯 / 需注意的設計細節（新專案應避免重蹈）

1. **死連結的 es6 檔案**：`index/BookChapDialog.es6.js` 仍 `import { DialogHtmlEs6Js } from './DialogHtml.es6.js'`，但 repo 中只剩 `DialogHtml.es2023.js`；`static/tsk_api/tsk.R.frame.oneref.js` 也引用不存在的 `queryReferenceAndShowAtDialogAsync.es6.js`。若這兩支檔案仍被載入執行會直接拋錯 —— 新專案應避免留下這類「改名但沒清乾淨」的引用。

2. **兩套 `.ref` 資料格式並存**：
   - 舊版 `cvtDTextsToHtml.es2023.js` 只認 `refAddresses`（`DAddress[]`）→ 產生 `addr-data`（JSON 陣列字串）。
   - 新版 `cvt_tsk_blocks_to_dtexts.js`／`dtexts_render.js` 用 `refDescription`（字串）→ 產生 `addr-desc`。
   - 全域委派處理器兩者都要接，且 `addrs`（陣列）優先於 `addrsDescription`（字串）。日後若新來源只給其中一種、或格式不符（純數字節號未補書卷章），地址解析可能失敗或給錯地址。
   - **新專案建議**：一開始就統一成單一資料格式，不要讓新舊格式並存。

3. **地址解析（「純數字節號」補書卷/章）邏輯分散在至少三處**：`BookChapDialog.es6.js` 的 `fix_addr_description()`、`tsk.R.frame.oneref.js` 的 `pfn_click_oneref`、`parseTsk.js` 的 `normalize_ref_body_with_current_chapter()`/`addRefProp()`，各自用不同正則判斷，規則略有差異（如詩篇整卷 vs 一般書卷特例）。**新專案建議集中成單一「地址正規化」函式並寫好單元測試**。

4. **`BibleConstantHelper.getBookId(name)` 要求小寫英文書卷名**，若呼叫端忘記 `.toLowerCase()` 會靜默回傳 `-1`（無警告）造成後續地址計算錯誤。**新專案建議：對非法輸入要明確拋錯或記錄警告，而非靜默失敗**。

5. **非同步載入與競態**：
   - `show_in_dialog()` 的 `qsb(...).then(...)` 是非同步的，若使用者快速連續點擊多個 `.ref`，可能疊出多個 pending dialog；`DialogHtml` 沒有防抖/防重複開啟機制。
   - `ps.foot_note_show_method == 2` 時 `await queryFootsAsync(...)` 增加額外網路請求延遲，且此設定值是全域狀態，dialog 顯示當下若使用者改了設定，行為可能不一致。
   - `FhlInfoContent.es2023.js` 用 polling（`testThenDoAsync`，300ms 間隔，最多 1000 次≈5分鐘）等待 DOM 節點出現才綁事件，屬於 polling-based 初始化。
   - **新專案建議**：用 loading state + 取消機制（如 AbortController）取代 polling 與無防抖點擊。

6. **舊/新兩套「renderTsk」同名並存**：`index/renderTsk.es2023.js`（頂層，React + `unv` 單一譯本，掛在 `window.renderTsk`）與 `index/tsks/renderTsk.js`（新版管線，被 `FhlInfoContent.es2023.js` 直接 import）。若有程式碼呼叫全域 `window.renderTsk()`，實際不會走新版邏輯，曾造成作者自己混淆（`docs/z260221b(串珠bug).md` 有記錄）。**新專案建議：重構時徹底移除舊路徑，不要用同名不同邏輯的函式並存**。

7. **`DialogHtml` 的 `title` 只能純文字**：字典 dialog 為了塞 HTML title，用「先設純文字再用 DOM 操作覆寫 `.ui-dialog-title`」的 hack，若底層 UI 套件版本更新改變內部結構會直接失效。**新專案建議：一開始就把 title 設計成可接受 HTML/元件，不要依賴底層 DOM 結構**。

8. **多個全域顯示旗標交織**：串珠渲染要同時考慮「顯示縮寫/全名書卷」（`tsk_show_mode`）、「是否顯示 Strong Number」（`ps.strong`，靠加 `.sn-hidden` class 而非不渲染）、「簡繁體」（`ps.gb`）。這些旗標分散在不同檔案，且 `queryReferenceAndShowAtDialogAsync.es2023.js` 內定義的 `add_sn_hidden_if_need` 疑似是死程式碼（定義了卻沒看到呼叫點）。**新專案建議：顯示設定集中管理，並清除死程式碼**。

9. **API 參數命名混淆**：`sc.php` 的 `book` 參數其實是「內容類型代碼」（`book=4`=串珠、`book=3`=註釋），而非聖經書卷編號，容易與同一函式參數 `address` 陣列中真正的書卷編號搞混。**新專案建議：API 參數命名要語意明確，不要重複使用容易混淆的字**。

10. **缺乏統一錯誤處理**：`show_in_dialog()` 沒有 `.catch()`，`api_tsk()` 也沒有 try/catch。若 API 掛掉或本地開發環境未啟動（`isRDLocation()` 判斷本地/正式 API domain），dialog 會直接 fetch 失敗但沒有錯誤提示 UI。**新專案建議：所有非同步查詢都要有明確的錯誤/loading/empty 狀態 UI**。

---

## 9. 給新專案的功能摘要（給 TDD 用的最小需求描述）

交互參照 dialog 的核心行為（與譯本無關的部分）：

1. **輸入**：一組經文地址（`書卷/章/節`，可以是單一節或範圍），或是一段可被解析成地址的描述字串。
2. **查詢**：依地址向後端/資料源查詢**單一譯本**的經文內容（不需多譯本並排）。
3. **顯示**：以彈出視窗（dialog/popover）顯示查到的經文內容，標題顯示地址描述（例：「羅 3:23」）。
4. **巢狀**：查到的內容中，若本身又含有「交互參照」標記（例如某節經文內又引用了另一處經文、或字典/註腳內容中也有交互參照），點擊後應該**在原本的 dialog 之上再疊一層新的 dialog**，而不是取代原本內容 — 使用者可以一路點下去疊出多層，並可逐層關閉。
5. **可選附加資料**：依設定決定要不要一併帶出註腳內容（本節如果有註腳，且設定開啟時，隨經文一起顯示）。
6. **關閉行為**：每層 dialog 各自獨立開關，關閉時徹底清除該層 DOM，不殘留。
7. **定位**：dialog 開啟位置預設貼近使用者點擊的觸發元素，视窗空間不足時自動翻轉方向。
8. **顯示模式切換**（次要功能）：使用者可設定「每次點擊都彈出 dialog」或「直接跳轉頁面內嵌顯示」兩種模式。

建議 TDD 切分：
- 地址正規化/解析（單一函式、高覆蓋率單元測試，是本專案最脆弱的一環）。
- 資料查詢層（mock API，測試單一譯本查詢的資料轉換）。
- 渲染層（`DText[]`-like 中繼格式 → HTML/元件，測試巢狀 ref/foot 渲染）。
- Dialog 容器元件（開關、疊層、定位、清理，皆可用純前端元件測試，不需真的呼叫 API）。
- 事件委派（點擊 `.ref` 觸發下一層查詢+顯示，測試巢狀情境是否正確疊層而非取代）。
