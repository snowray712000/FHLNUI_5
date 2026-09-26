# 搜尋重構：依閱讀位置選範圍、改用 dialog

> 寫給之後接手的 AI（與人）。讀完應該能回答：「搜尋結果為什麼一打開就停在某卷書 / 某分類？這是怎麼決定的？搜尋的程式分成哪幾塊、各自負責什麼？舊的 sephp 到哪去了？」
>
> 時間：2026-09-26，版本 6.5.1。相關 commit（都在 `main`）：`67ef0c4`、`7c05d95`、`13e8bfd`、`dfa5b87`、`e2c969e`、`00e01e5`。

---

## 1. 一句話總結

搜尋結果不再一律顯示「整卷聖經」，而是**依目前閱讀的書卷**自動選範圍：**同卷 → 同作者 / 同分類 → 同約 → 整卷聖經**，筆數夠多（≥ 10 節）才縮小。結果改在一個大的、非模態的 dialog 裡顯示，取代原本畫面下方的搜尋視窗。

---

## 2. 核心概念：範圍依「閱讀位置」決定

### 2.1 為什麼

使用者搜尋時，通常最想先知道的是：

1. **同一卷書**裡哪裡出現（正在讀雅各書，搜「信心」，先看雅各書怎麼講）
2. 再來是**同作者**（約翰福音 → 約翰著作）或**同分類**（保羅書信）
3. 再來是**同約**（新約）
4. 最後才是整本聖經

而且：結果很多時，只看這卷書就夠了；結果很少時，只顯示這卷書反而太少，應該放大到同分類。

這個想法最早做在 RWD 版（Angular），參見第 7 節。這次把它移植到 NUI，**沒有用 Angular**。

### 2.2 規則

實作在 `index/Search_suggestFilter_es2023.js`，純函式，不碰 DOM：

```
Search_suggestFilter(cnt_of_book, book_group, ibook, min_count = 10)
  → { group_name, ibook | null }
```

1. 目前書卷的節數 ≥ `min_count` → 選這卷書（`ibook` 有值），分類則是「包含此卷的最小分類」
2. 否則，把包含此卷的分類**由小到大**排序，選第一個節數 ≥ `min_count` 的
3. 都不夠 → 整卷聖經

門檻 `SearchDialog.MIN_COUNT_TO_NARROW = 10`（與 RWD 的 `count > 9` 相同）。

**卷數相同時，後定義的優先。** 例：約翰福音同時在「福音書」與「約翰著作」，兩者都是 5 卷。`fhl.g_book_group` 中同作者的分類放在最後，所以會優先選「約翰著作」。之後若要再加同作者分類，**加在最後面**即可，程式不用改。

### 2.3 分類 (`fhl.g_book_group`，在 `static/search_api/fhl_api.js`)

| 分類 | 書卷 |
|---|---|
| 整卷聖經、舊約、新約 | |
| 摩西五經、歷史書、詩歌智慧書、大先知書、小先知書 | |
| 福音書 | 太–徒（使徒行傳算在福音書，路加的下集） |
| 保羅書信 | 羅–門 |
| 其它書信 | 來–啟 |
| **路加著作**（新增） | 路、徒 |
| **約翰著作**（新增） | 約、約壹、約貳、約參、啟 |

索引是 **0based**（創世記 = 0），分類名固定用**繁體**當 key，顯示時再經 `gbText()` 轉簡體。

### 2.4 實測例子（只開和合本）

| 正在讀 | 搜尋 | 自動選到 |
|---|---|---|
| 雅 | 弟兄 | 其它書信(71) ▸ 雅(17) |
| 雅 | 信心 | 其它書信(26)（雅不到 10） |
| 約 | 光 | 約翰著作(34) ▸ 約(17) |
| 約壹 | 光 | 約翰著作(34)（約壹不到 10，上一層是約翰著作而不是其它書信） |
| 徒 | 聖靈 | 路加著作(64) ▸ 徒(49) |
| 啟 | 羔羊 | 約翰著作(30) ▸ 啟(28) |

---

## 3. 架構

```
工具列搜尋框 SearchTool ─┐
原文字典「出現經文」 ────┤
ParsingPopUp ────────────┼─→ SearchDialog.s.searchAsync(keyword)
                         │         │
                         │         ├─ new SearchSession(...)   資料與狀態，不碰 DOM
                         │         │     ├─ runAsync()          找出所有符合的節 (只有位置)
                         │         │     ├─ setFilter(books)    選範圍
                         │         │     └─ loadMoreAsync()     一批 30 節，取經文
                         │         │           └─ SearchApi      se.php / qsb.php
                         │         ├─ Search_suggestFilter(...)  決定預設範圍
                         │         └─ 畫面：分類按鈕、書卷按鈕、結果列表
```

| 檔案 | 責任 |
|---|---|
| `index/SearchApi_es2023.js` | 呼叫 api。`searchKeywordAsync`、`searchSnAsync`（se.php，自動翻頁）、`queryQsbAsync`（qsb.php 取經文）、`addrsToQstr` |
| `index/SearchSession_es2023.js` | 一次搜尋：判斷種類、合併各譯本結果、每卷節數、目前範圍、分批取經文。可取消（`AbortController`） |
| `index/Search_suggestFilter_es2023.js` | 第 2 節的規則 |
| `index/SearchDialog_es2023.js` | dialog UI 與事件；`colorBibleText()` 將 SN 轉成可點的 span、關鍵字上色 |
| `index/SearchTool.es2023.js` | 工具列右上的搜尋框；`SearchTool.s.search(keyword)` 是其它地方要搜尋時的入口 |
| `index/Search.css` | 搜尋框與搜尋 dialog 的樣式（不放 `fhl.css`） |

### 3.1 搜尋種類 (`SearchSession.determineKind`)

| 種類 | 條件 | 例 |
|---|---|---|
| reference | `#` 開頭或 `\|` 結尾；或「書卷名 + 數字」開頭 | `#羅 1:3\|`、`羅1:3-4;約3:16`、`約壹 2:1` |
| sn | 整個字串是 `[GH]?數字[a]?` | `G80`、`H2316`、`652a` |
| keyword | 其它；空白分隔多個關鍵字 | `摩西 以利亞` |

- 舊版 SN 判斷沒有錨定，含數字就當 SN，所以 `約3:16` 會被當成 SN 搜尋。新版已修正。
- SN 沒寫 G/H 時，依目前閱讀的是舊約還是新約決定。
- reference 不分範圍（沒有分類按鈕），各譯本都取。

### 3.2 資料流與取消

- `runAsync` 只取「位置」（se.php `index_only=1`），很快；經文等使用者捲動時才一批批取（qsb.php）。
- 多譯本時，每節記錄「在哪些譯本找到」（`SearchVerse.vers`）；取經文時每個譯本只取自己找到的節。每卷節數以**不重複的節**計算（舊版會把多個譯本的筆數加總，重複計算）。
- 連續搜尋：新的 session 會 `abort()` 舊的。切換範圍：`#filterSeq` 遞增，舊批次回來後丟棄。捲動載入用 `#loadingToken`，避免舊請求回來時清掉新請求的載入狀態。

---

## 4. API 注意事項（踩過的坑）

- **se.php 一次最多 500 筆**，要用 `offset` 翻頁；`record_count == 500` 就繼續取。
- **原文譯本（`fhlwh`）用中文關鍵字查，se.php 回的是 XML**：`<result><status>Fail:fhlwh not found!</status></result>`。舊版用 `Promise.all`，一個譯本失敗就整個搜尋失敗、一筆都沒有。新版用 `Promise.allSettled`，失敗的譯本跳過，在狀態列顯示「（新約原文 無法搜尋）」。
- **qsb.php 的 `qstr` 可一次跨多卷**，用中文短書名：`雅 1:2,9;來 3:2`。
- **qsb 回的雅各書 `engs` 是 `James`**，不是常見的縮寫 `Jas`（`fhl.g_book_all` 剛好也是 `James`，所以對得上）。為保險，書卷換算先用 `fhl.engs_2_iBook`，失敗再用 `chineses` 比對繁、簡書名。
- **SN 搜尋**：`orig` 與 `RANGE` 都要帶（新約 1、舊約 2），否則 `23` 會找出一堆非 23 的。只有和合本有 SN，所以 SN 搜尋固定用 `unv`。
- `00000` 這類全 0 的 SN 會卡住，直接不查（2015 年的舊註解）。

---

## 5. 畫面與互動

### 5.1 搜尋 dialog

- 基於 `DialogHtml`（jQuery UI），**非模態**，同一時間只有一個；再搜尋時沿用已開的 dialog。為此 `DialogHtml.showDialog` 多了 `height` 參數。
- 上方：dialog 內的搜尋框（可直接再搜）、狀態（節數、無法搜尋的譯本）、**分類按鈕**（只列有結果的，含節數）、**書卷按鈕**（目前分類下有結果的；正在讀的那卷有紅框）。
- **點經文位置**：主畫面跳過去，dialog 保留（可拖到旁邊，連續點多筆）。會觸發 `chapchanged`，所以網址 hash 會更新、可按上一頁回來（舊版不會更新 hash）。
- **捲到底**再取下一批 30 節；內容不足以產生捲軸時自動繼續取。
- 關鍵字上色（`.seKey`），多個關鍵字都上色；只換 HTML 標籤以外的文字，不會改到 `<span sn="...">` 的屬性。
- SN：點擊開原文字典；滑過時 `SN_Act_Color` 標色（容器 id `#searchDlgResults` 已加入 `SN_Act_Color.ids()`）。
- 每列的複製按鈕：複製「位置 + 經文」。
- 手機寬度（< 768px）dialog 幾乎全寬，結果改為上下排列。

### 5.2 其它地方呼叫搜尋

原文字典（`queryDictionaryAndShowAtDialogAsync`）與 `FhlLecture` 的「出現經文」按下後，會**關閉所有 dialog**。所以順序必須是**先關閉、再搜尋**，否則剛開的搜尋 dialog 也被關掉。一律呼叫 `SearchTool.s.search(keyword)`（會同時把關鍵字填進工具列搜尋框），不要再 trigger `.searchBtn`（已不存在）。

### 5.3 工具列搜尋框

- 舊版把 click 綁在整個框上，**點輸入框就會搜尋**；Enter 又被兩個地方處理（`keypress` 與 hotkeys 的 `return`），**每次搜尋兩次**。
- 新版是 `<form>`：只有**放大鏡**或 **Enter** 送出。× 只在有文字時出現（`:placeholder-shown`），Esc 清空。
- Alt+Shift+F：游標移到搜尋框（原本標示「失效」）。
- **手機寬度**（工具列 2 行）：原本視窗按鈕與搜尋框各 `max-width: 40%`，搜尋框只有 140px。改為視窗按鈕縮到剛好的寬度，其餘給搜尋框（375px 寬時 140 → 197px）。實作在 `coreInfoWindowShowHide.es2023.js` 的 `applyFitSearchTool`：
  - 按鈕寬度會變（選取的按鈕 padding 較大；`FhlLeftWindow` 之後才插入按鈕；啟動時 `#windowControlButtons` 可能還不存在），所以用 `MutationObserver`（看 `#windowControl`）+ `ResizeObserver`（看按鈕）重算。
  - 量寬度前設 `white-space: nowrap`，否則縮窄後按鈕換行，再量就量到換行後的寬度。
  - 「是否窄」存在 DOM（`#fhlToolBar.toolbar-narrow`），不存在 module 變數：dev 時 Vite 可能因 HMR 時間戳不同載入兩份同一個 module，各自的變數會打架。

---

## 6. 移除的東西

| 移除 | 說明 |
|---|---|
| `#fhlMidBottomWindow`（下方搜尋視窗） | 骨架、`FhlMidBottomWindow.es2023.js`、工具列的開關按鈕、`windowAdjust` 的高度計算、Alt+Shift+X |
| `static/search_api/sephp.*.js`、`qsbphp.*.js`、`search.css` | 由 `SearchApi` / `SearchSession` / `SearchDialog` 取代 |
| `index/Search_*_es2023.js`（舊的分組 UI、continue_search 等）、`doSearch`、`SearchFlow` | 同上 |
| `libs/jsdoc/sephp.d.js`、`fhl_api.js` 裡的 `sephp` 預設值 | |
| `fhl.css` 舊搜尋框（`.icon-search-container` 系列、`.searchBtn`、`.wrapper`）、`#fhlMidBottomWindow` 系列、`#pre_search2`、`#search_result` | `#searchTool` 保留（仍決定搜尋框位置） |
| `indexLast.js` 的 `let_sn_color_change_in_search_result` | 移到 `SearchDialog` 的事件 |

`tests/`、`libs/ijnjs/ijnjsold.js` 裡仍有 sephp 的死碼副本，沒有動。

---

## 7. 參照：RWD 版

- 專案：`/Users/snow/coding/FHLRWD`（Angular），線上 `https://bible.fhl.net/NUI/_rwd/`
- `src/app/rwd-frameset/search-result-dialog/search-result-dialog.component.ts`
  - `setGroupTabSearchToSuggest()`：本次移植的規則（`tryGetInBook` → `tryGetInClassor`）
  - `SearchClassorOrderGetter`：包含某卷的分類，依卷數由小到大
- `KeywordSearchGetter.ts`：三步驟（找 index → 取經文 → setFilter 分批轉換），`SearchSession` 的分工參考它
- `src/app/const/book-classify/BookClassor.ts`：分類定義（與 `fhl.g_book_group` 相同，NUI 多了兩個同作者分類）

與 RWD 的差異：RWD 用分頁籤（分類 / 書卷 / 設定），NUI 直接把分類與書卷兩列按鈕都攤開；RWD 在「只有 ≤ 1 個分類 ≥ 10」時直接選「全部」，NUI 則照「由小到大第一個 ≥ 10」走（結果多半相同）。

---

## 8. 已知限制與後續

- SN 搜尋固定用和合本（`unv`）；RWD 可選有 SN 的譯本（`VerForSnSearch`）。
- dialog 沒有「關鍵字上色」開關（RWD 有，用於複製到簡報時不要顏色）。
- `app_versions.json` 的 TODO「搜尋貼上交互參照，可跳出」：現在可以貼 `羅1:3-4;約3:16` 直接搜尋；是否算完成由作者判斷。
- `npm run depgraph` 在 Node 25 無法執行（dependency-cruiser 只支援 22 / 24 / ≥ 26），`docs/dependency-graph.mmd` 尚未更新。
- 瀏覽器的 viewport 模擬不會觸發 `resize` 事件；手機寬度的搜尋框是手動觸發 resize 驗證的，未在實機旋轉測試。
