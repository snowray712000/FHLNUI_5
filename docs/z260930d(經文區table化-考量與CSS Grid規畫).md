# 經文區 table 化：考量與 CSS Grid 規畫

日期：2026-09-30

這份文件是給「下一次實際動手改經文區 (lecture) 的 AI / 人」的輸入。
它整理了 2026-03 在 `index/lecture/` 做的 01–18 demo、`TableSelection/`、`docs/TableSelection/` 的發展脈絡，推論出：

1. 為何想用 table
2. 為何目前不想用 table
3. 過程中還考量了哪些事
4. 建議方案：CSS Grid（table 的版面 + 欄方向的 DOM 順序）

> 標「推論」的是從 demo 推出來、demo 沒明寫的；其餘都有檔案出處。

---

## 〇、現況（2026-09-30）

- 主程式用的是 div 版：[FhlLecture.es2023.js:29](../index/FhlLecture.es2023.js) `import { FhlLecture_render_core } from './lecture/FhlLecture_render_core.js'`
- 結構（mode 1/3）：`#lecMain > .vercol(每譯本一個, inline-block, width = 100/n %) > .paragraph > span.lec[ver,book,chap,sec] > .verseNumber + .verseContent`
- mode 2/4：只有一個 `.vercol`，`.paragraph` 依譯本交錯
- 各欄「第 i 個 `.paragraph`」的高度由 `reshape_for_align_each_sec()`（[FhlLecture.es2023.js:640](../index/FhlLecture.es2023.js)）用 JS 量高度、設成同高來對齊
- 譯本名稱在另一個 `#lecMainTitle` div，不在 `#lecMain` 裡
- 經文可以原生反白（`.vercol` 沒有 `user-select: none`）

### demo 位置

| 路徑 | 內容 |
|------|------|
| `index/lecture/01-05/01_dom_order_selection_demo.html` | table / flex-row / CSS columns / 三個獨立 div：原生反白跟著 DOM 順序走 |
| `01-05/02–05` | 自訂拖曳選取：同欄 = col、跨欄 = 矩形 row、單格 = 原生選字；05 加 joTable + rowspan |
| `06–09` | Pointer Events、電腦/平板分流、CtxMenu 元件、`TableSelector extends EventTarget` 解耦 |
| `10–17` | joTable → `TableRenderer` → 接真 API、`cvt_others` / `dtexts_render`、SN 切換、書卷/譯本 dialog、注腳（先全部查完 → 漸進式）、節碼 DText、併入上節 rowspan |
| `18` | mode 1–4 全用 table（`buildColTable` / `buildRowTable`），加 ncv 段落；另有「重構教學.md」+ 三張 PlantUML |
| `TableSelection/` + `docs/TableSelection/01–09` | 選取控制器獨立成可攜模組（core / renderers / adapters / ui），mode 收斂成 `single / crossed`，跨格後回到原格可還原字元 anchor |
| `mode_1_4_demo.html` | mode 1–4 的 div HTML 規格，含 `copy_dir="col" / "row"` |
| `sp1.js` / `sp2.js` | 最早的想法：「想像最終是一個 table」；以及要求試做 `FhlLecture_render_core_table.js` |
| `docs/260327a` / `260327b` | mouse / touch / pointer 事件整理；電腦與平板行為規畫 |

### 已知過時 / 不一致的文件（動手前先知道）

- `18_smart_table_joTable_demo/CHANGES.md` 說 18 版「改用 `div.lec-main > div.vercol …`、選取複製：無」，**但 18 的程式其實是 table**（`buildColTable` / `buildRowTable` + `TableSelector`）。以程式為準。
- `index/lecture/RENDER_CORE_SWITCH.md` 說「Table 版（現在啟用）」，但 `FhlLecture_render_core_table.js` **從未 commit、目前不存在**，主程式仍是 div 版。推論：試接過主程式後退回。
- 18 版仍 import `10_…/TableSelector.js`，沒有用 `TableSelection/` 的新 core；兩條線沒合流。

---

## 一、為何想用 table

### 1. 並排對齊，現在是 JS 硬撐

`reshape_for_align_each_sec()` 每列先設 `height:100%` 再取最大高度、全部設同高。必須記得在所有「會改高度」的時機呼叫：

- `FontSizeTool.es2023.js`（字型大小）
- `WindowControl.es2023.js`、`FhlLeftWindow.es2023.js`（左右欄開關）
- `FhlInfo.es2023.js`（右側資訊）
- `SnFilter.es2023.js`（SN 篩選會隱藏字）
- `index.js`（resize；註解說要放 `setTimeout` 裡否則有 bug）

漏一個就錯位；DOM 要先掛上才量得到高度；內容非同步變化（注腳、字型載入）時不會自動重排。table 的列高天生對齊。

### 2. 併入上節 = rowspan

API `bible_text = "a"` 表示本節併入上節（例：西 2:21）。div 版要留 `isMergePlaceholder` 空節佔位、上一節 `verseLabel` 改 `20-21`（[docs/併入上節處理.md](../index/lecture/docs/併入上節處理.md)）。table 用 rowspan 直接表達「這格跨 20–21 兩列」。

### 3. 心智模型本來就是 table

`sp1.js`：「想像最終是一個 table」。mode 1 一格 = 一節；mode 3 一格 = 一段；各譯本列數可能不同，所以每格要帶 address 對齊；合併一定是連續節。
joTable 格式 `{ r, c, headers, cells: [{ r, c, rs?, cs?, content: DText[] }] }` 由此而來。

### 4. 矩形 / 結構化複製

- 跨欄拖曳 = 矩形選取，複製成 `text/html` `<table>` + `text/plain`（tab 分隔），貼到 Word / Excel 仍是對照表。
- 複製從資料產生（`td.dataset.r/c` → joCell → DText），不從 DOM 抓字；SN 隱藏時純文字、HTML 都會一起濾掉 `.sn`（保留 `.sn-text`）。見 12 版 CHANGES「三層聯動」。

### 5. 表頭

`#lecMainTitle` 在 `#lecMain` 外，靠 `padding: 0 50px` 與 `--scrollbar-width` 算式對齊欄寬。table 可用 `<thead>`（或 sticky 表頭）。

---

## 二、為何目前不想用 table

### 1. 原生反白的方向會變成橫的（最關鍵）

01 demo 專門驗證：table / flex-row 的 DOM 順序是「列優先」，拖曳時選取會橫掃整列，把多個譯本交錯選進去；獨立 `.vercol` 才能沿欄往下選。
`sp1.js`：「通常可能是要選『一個譯本的連續多節』而非『多個交錯』」。
現行 div 版的原生反白剛好就是這個行為；改成 table 就必須整套自己接管選取（02→09 的 TableSelector）。

`mode_1_4_demo.html` 的 `copy_dir="col" / "row"` 也是同一個想法：**用 DOM 順序決定原生選取的方向**。

### 2. 自己接管選取的代價

- `tbody td` 預設 `user-select: none`，只有電腦單格才動態開（08 版）
- 平板完全不能選字：水滴 handle 與自訂拖曳衝突、會觸發 `pointercancel`（260327b）
- 04 版 table 設了 `touch-action: none`。**推論**：這會讓手指在經文區無法捲動，平板上是致命問題，demo 沒處理
- **推論**：mode 3 一格是一整段，跨格後只能整格選，做不到「從第 3 節中間選到第 7 節」；div 版原生選取做得到
- 單格原生選字 + 跨格接管 + 回原格還原 caret（`TableSelection` 09 篇）→ 各瀏覽器行為差異要實測

### 3. 格子內有很多可點的東西

`sp2.js` 點名：`.sn` / `.sn-text`（字典、hover 上色）、`.ft`（注腳）、`.ref`（交互參照）、sn-active 繪圖，還有點 `.lec` 選節、`.sobj` 地名。
08 版放行條件只有 `a, button, [data-action]`，這些 span 都不符合。`RENDER_CORE_SWITCH.md` 說「行為完全相同」，但找不到能證明的程式。

### 4. 波及範圍大

依賴 `.vercol` / `.lec` / `.paragraph` / `#lecMain` 的地方：

| 位置 | 依賴 |
|------|------|
| `FhlLecture.es2023.js` | jQuery 委派 `#lecMain` 上 `.lec` / `.sn, .sn-text` / `.ft` / `.ref` / `.sobj`；`reshape`；`selectLecture`；`render_copyright` 把 `#div_copyright.lec.copyright` append 進 `#lecMain` |
| `FhlLecture_render_core.js` | 產生結構；`generate_htmlContent_with_VersionColumns` 用 inline-block + 百分比寬 |
| `SnFilter.es2023.js` | 用 `.lec[book][chap][sec]` 分節 |
| `SN_Act_Color.es2023.js` | 在 `#lecMain` 內找 SN 上色 |
| `windowAdjust.es2023.js` | `.lec.selected` 的 `position().top` 捲動 |
| `render_pos_and_pho`（FhlLecture） | regex 改 `.verseContent` 的 innerHTML |
| `fhl.css` | `.vercol` 虛線邊框、`--fontsize`、`#fhlLecture .lec`、`.selected` |

mode 2/4 是單欄交錯，改成 table 只是一欄的表格，幾乎沒好處。

### 5. demo 本身還沒收斂

18 版被自評為 god file（見 `18_…/重構教學.md`），拆分只停在規畫；`TableSelection/` 的新 core 沒接回 18。

---

## 三、過程中還考量了哪些事（新方案也要顧到）

- **電腦 vs 平板**（260327b、08）：單格時電腦可選字、平板整格；選單電腦右鍵才出、平板 pointerup 自動出；Ctrl+C / 右鍵 / 按鈕三種複製
- **解耦**（09、TableSelection 01–04）：`EventTarget` 發語意事件，payload 用 index 不用 DOM；「要不要跳選單」是 listener 的 UI 政策
- **生命週期**（TableSelection 05、13）：換章/換譯本會重建 DOM，舊 listener 要清（`autoDestroyWhenDisconnected`）；`copy` 事件在 document 只註冊一次
- **注腳**（15、16）：`foot_note_show_method = 2` 全部查完才顯示會卡 → 先顯示、逐節 patch；重畫要帶節碼
- **節碼**（17）：節碼做成 DText `{ w:"20-21", isRef:1, refDescription:"西2" }`，只到章，預留點節碼看上下文
- **段落**（18）：mode 3/4 用 `paragraphs_ncv.json.gz` 套到所有譯本；mode 1/2 每節自成一段（`gen_fake_groups_for_mode1`）；併入上節要在分段前全域處理，否則跨段找不到上一節
- **複製**：SN 隱藏時濾 `.sn`、保留 `.sn-text`
- **依賴方向**（18 PlantUML）：Repository / LayoutService / Renderer / Presenter / CopyService / FootnoteService / DialogAdapter；renderer 不知道 controller state，service 不碰 DOM
- **驗證清單**（18 重構教學）：mode 1–4 一致、譯本切換、SN 切換、單格與矩形選取、複製純文字、複製 HTML 表格、注腳漸進、書卷/譯本 dialog

---

## 四、建議方案：CSS Grid

### 核心想法

**table 是資料模型與版面，不必是 DOM。**

CSS Grid 可以讓 DOM 順序與視覺位置分開：

- DOM 依「譯本 → 節」欄優先排列 → 原生反白沿欄往下（保留現行行為，不必接管選取）
- 每格用 `grid-column` / `grid-row` 指定位置 → 同一列自動等高，**拿掉 `reshape`**
- 併入上節用 `grid-row: r / span 2` → 等同 rowspan
- 字型大小、SN 篩選、注腳載入、視窗寬度改變時，grid 自己重排

| 需求 | table | div + reshape（現行） | CSS Grid |
|------|-------|------------------------|----------|
| 列高對齊 | 原生 | JS 量高度 | 原生 |
| 併節 | rowspan | 空節佔位 | `span` |
| 原生反白方向 | 橫（錯） | 縱（對） | 縱（對，DOM 順序決定） |
| 平板捲動 | 接管選取時會出事 | 正常 | 正常 |
| 格內可點元素 | 要放行清單 | 正常 | 正常 |
| 矩形複製 | 有（自訂選取） | 無 | 另做「複製對照表」（見下） |

### 結構（mode 1 / 3）

```html
<div id="lecMain" mode="1" class="lec-grid" style="--lec-cols: 3">
  <!-- 表頭：放最前面，sticky，不可選 -->
  <div class="lec-head" style="grid-column:1; grid-row:1">和合本</div>
  <div class="lec-head" style="grid-column:2; grid-row:1">KJV</div>
  <div class="lec-head" style="grid-column:3; grid-row:1">rcuv</div>

  <!-- 譯本 1：display: contents，子元素直接當 grid item -->
  <div class="vercol" ver="unv">
    <div class="paragraph" ver="unv" style="grid-column:1; grid-row:2">
      <span class="lec" ver="unv" book="51" chap="2" sec="20">…</span>
    </div>
    <div class="paragraph" ver="unv" style="grid-column:1; grid-row:3">…sec 21…</div>
  </div>

  <!-- 譯本 3：20–21 併節 → 跨兩列，21 不產生元素 -->
  <div class="vercol" ver="rcuv">
    <div class="paragraph" ver="rcuv" style="grid-column:3; grid-row:2 / span 2">
      <span class="lec" ver="rcuv" … sec="20"><span class="verseNumber">20-21 </span>…</span>
    </div>
  </div>

  <div id="div_copyright" class="lec copyright" style="grid-column:1 / -1">…</div>
</div>
```

```css
#lecMain.lec-grid {
  display: grid;
  grid-template-columns: repeat(var(--lec-cols), minmax(0, 1fr)); /* minmax(0,…) 防長字/表格撐破欄寬 */
  align-items: stretch;           /* 同列等高，邊框/底色才會齊 */
}
#lecMain.lec-grid > .vercol { display: contents; }
#lecMain.lec-grid .lec-head { position: sticky; top: 0; z-index: 1; user-select: none; }
#lecMain.lec-grid .paragraph { border-inline: 1px dashed lightgray; } /* .vercol 的邊框移到格子上 */
```

要點：

- **保留 `.vercol` 元素**（`display: contents`）：DOM 仍是「一個譯本一包」，原生反白沿欄走；既有 `.vercol` / `[ver]` 選擇器大多不用改。代價是 `.vercol` 自己不產生盒子，邊框、`margin-top` 要移到格子上
- 列號：mode 1 = 節序（第一列是表頭，所以 +1）；mode 3 = 段落序。和 18 版 `buildColTable` 一樣，以 `pi`（段落 index）當列
- 併節：沿用 18 版邏輯 —— 某譯本某列整組都是 hide → 前一格 `span` +1，不產生元素；所有譯本都 hide 的列整列跳過
- RTL（bhs 等）：只在格子上設 `direction: rtl; text-align: right`，欄順序不變
- 表頭：核心要支援（dialog 裡沒有 `#lecMainTitle`，見第五節），但經文區並排時可先關掉、沿用 `#lecMainTitle`，不急（第六節決議 1）。日後搬進 grid 時注意 `#lecMainTitle` 上有 `.versionName` click → 開譯本選擇，要一起搬；`closeButton` 已無用
- 列標籤欄：核心可選的最左一欄。交錯時放譯本名；搜尋 / 交互參照放經文位置；日後「段落一格、經文位置另一欄、內文不寫節碼」的顯示設定也用它
- `grid-row` / `grid-column` 用 inline style 或 CSS 變數都可；inline 最直接，也方便除錯

### mode 2 / 4（交錯）

不需要跨欄對齊。可維持現行（一個 `.vercol`，`.paragraph` 交錯）；若開列標籤欄（左欄譯本名、右欄經文），就是兩欄 grid，`grid-template-columns: auto minmax(0, 1fr)`。

### 原生反白的行為（與現行相同）

- 同欄往下拖：選同一譯本連續多節 ✔
- 拖進別欄：依 DOM 順序，會選到「本欄剩下的全部 + 別欄開頭到游標處」（01 demo D 的行為，現行就是如此）
- mode 3 可從段落中間選到另一段中間 ✔
- 平板原生水滴、捲動都不受影響 ✔

### 矩形 / 對照表複製：改成「動作」，不接管拖曳

不再用 TableSelector 接管 pointer。改成：

1. 使用者照常原生反白
2. 選取範圍（非空、在經文區內）出現後，旁邊浮出小按鈕「複製對照表」（`selectionchange` + debounce 定位）。電腦、平板同一顆；不覆蓋右鍵選單，Ctrl+C 維持原生
3. 由 Range 的起訖用 `closest('.lec')` 取得起訖節，並收集選取碰到的譯本
4. 組出「起訖節之間的節 × 選取碰到的譯本」，格 = 真的反白到的節（起訖截斷、補節碼）；輸出 `text/html` `<table>` + `text/plain`（tab 分隔）；看不到的不複製
5. 併節照 rowspan 輸出

原型已做在現行 div 版，見第六節「2、3 的原型」。

選取規則與注腳見第六節決議 2、3。這保留了 table 版最有價值的輸出，卻不用碰電腦/平板選取的所有坑。`TableSelection/` 的 core 先不接；拖曳矩形選取仍需要，但啟用方式未定（第六節決議 5）。

### 要一起改的地方

| 項目 | 變更 |
|------|------|
| `FhlLecture_render_core.js` | `generate_htmlContent_with_VersionColumns` 改 grid 容器；`render_paragraph_div` 的格子加 `grid-column` / `grid-row`；併節改為 span + 不產生元素（mode 1/3），`isMergePlaceholder` 只剩 mode 2/4 需要時才留 |
| `reshape_for_align_each_sec` | grid 模式下不再需要。先讓 `reshape()` 在 grid 時直接 return（保留呼叫點，減少波及），穩定後再清掉各呼叫點 |
| `render_copyright` | `#div_copyright` 不再帶 `.vercol`（現在 reshape 已刻意排除它），加 `grid-column: 1 / -1` |
| `render_titles` / `#lecMainTitle` | 表頭搬進 grid 或維持但改用相同 `grid-template-columns` |
| `fhl.css` | `.vercol` 邊框 / `font-size: var(--fontsize)` / `line-height` 要能作用到格子（`display: contents` 下 `.vercol` 的繼承屬性仍會傳給子元素，但邊框、padding、margin 不會） |
| `windowAdjust.es2023.js` | `.lec.selected` 的 `position().top` 依 offsetParent，`#lecMain` 仍是 `position:absolute`，應不受影響，要實測 |
| `SnFilter` / `SN_Act_Color` / pos-pho | 依 `.lec` / `.verseContent`，結構保留就不用改；SnFilter 裡呼叫 `reshape` 可留（會 no-op） |

### 分階段

1. **P1 版面**（✅ 2026-09-30 完成，見下方「P1 實作」）：mode 1/3 改 grid + `display: contents`；`reshape` 在 grid 時 no-op；併節 span；表頭先維持 `#lecMainTitle`。以 feature flag（例如 `ps` 或 localStorage）可切回舊版。**模型、單節渲染、grid 版面寫成不依賴 `#lecMain` 的模組**（第五節），表頭、列標籤欄是選項
2. **P2 表頭（可延後）**：經文區要不要改用 grid 內 sticky 表頭、移除 `#lecMainTitle` 寬度算式，到時再決定；交錯模式可開列標籤欄
3. **P3 複製對照表**：原型已在 div 版（`index/LecCopyTable.es2023.js`）；改 grid 後確認仍可用，取字可改從資料模型
4. **P4 清理**：移除 `reshape_for_align_each_sec` 與各呼叫點、`isMergePlaceholder` 在 mode 1/3 的路徑、flag
5. **P5–P7**：交互參照、搜尋結果改用同一核心（第五節）

### P1 實作（2026-09-30）

- `index/lecture/FhlLecture_render_core.js` `render_grid()`：mode 1/3 產生 `#lecMain > .lec-grid > .vercol[ver] (display: contents) > .paragraph`，`.paragraph` 用 inline `grid-column` / `grid-row` 定位，帶 `data-row`（列，0 起）
- 整段都是併入上節的 placeholder → 不產生元素，上一段 `grid-row: r / span n`
- `isLecGridEnabled()`：`localStorage.fhlLecLayout = 'div'` 切回舊版（inline-block + reshape）
- `reshape_for_align_each_sec()` 遇到 `.lec-grid` 直接 return（呼叫點都還在，P4 再清）
- 版權宣告仍 append 在 `#lecMain`，在 `.lec-grid` 外面，不必處理 grid 位置
- 原本 `.vercol` 的 `margin-top`（依字型大小）改成 `.lec-grid` 的 `padding-top`；邊框改畫在 `.paragraph`（`fhl.css`）
- 表頭仍是 `#lecMainTitle`（沒動）；mode 2/4 仍走舊的交錯版
- `LecCopyTable` 一段一列改看 `data-row`（grid 版 index 會因省略 placeholder 而錯位）
- 已測（瀏覽器）：西 2（unv / rcuv / csb）mode 1、3 各列對齊、併節 span；改 `--fontsize`、縮窄 `#lecMain` 後不呼叫 reshape 仍對齊；複製對照表 mode 1 / 3；點選節、`selectLecture` 捲到選取節；創 1（unv / bhs / csb）RTL、無橫向溢出；切回 div 版；console 無錯誤。**平板、SN 篩選、注腳直接載入、pos/pho 尚未實測**

### 驗證（每階段）

- mode 1–4 × 1 / 2 / 5 個譯本；含併節的章（西 2、弗 3 rcuv）；有段落標題的譯本（isTitle1）
- 含 bhs（RTL）與 fhlwh / lxx（SN 很多）並排
- 字型 A+ / A−、左右欄開關、視窗縮放、SN 篩選切換後，各列仍對齊（不呼叫 reshape）
- 注腳 method 0 / 2；`.sn` / `.ft` / `.ref` / `.sobj` 點擊、SN hover 上色、點 `.lec` 選節、捲到選取節
- 原生反白：同欄多節、mode 3 跨段、手機/平板捲動與選字
- 版權宣告在最下方、跨全寬
- 詩 119（176 節）× 多譯本的重排速度
- `npm run build` 後 `dist/` 也正常（CSS 順序見 CLAUDE.md）

---

## 五、延伸：交互參照與搜尋結果用同一核心

本質相同（一組經文位置 × 一組譯本），但現在是三套：

| | 經文區 | 搜尋結果 (`SearchDialog_es2023.js`) | 交互參照 dialog (`queryReferenceAndShowAtDialogAsync.es2023.js`) |
|---|---|---|---|
| 位置 | 一章、連續節 | 不連續節 | 不連續節 / 範圍 |
| 譯本 | 多個 | 多個（`ps.version`） | 一個，預設且被寫死 `"unv"`（FhlLecture 點 `.ref` 就是傳 unv） |
| 版面 | 並排 / 交錯 + 段落 | 每節一塊，譯本上下疊（= 交錯） | 單欄 |
| 渲染 | `cvt_others` → `render_dtexts` / `dtexts_render` | `colorBibleText()` 對 `bible_text` 字串 regex，**不走 DText** | `cvt_others` → `prepare_dtexts_for_html` → `cvtDTextsToHtml` |
| 節標記 | `.lec[book][chap][sec]` | `[data-vaddr][data-ver]` | 無 |
| 複製 | 原生反白 | 每譯本一顆 `.sd-copy` | 原生反白 |

要共用的：

1. **模型**：列 = 經文位置（可為範圍，如 `20-21`）；欄 = 譯本；格 = DText[]；經文區多一層段落分組
2. **單節渲染**：一節一譯本一律產生 `.lec[ver][book][chap][sec] > .verseNumber + .verseContent`。`.sn` / `.ft` / `.ref`、SnFilter、SN_Act_Color 只認一種結構。搜尋改走 DText 時，關鍵字上色要改在 DText 階段標記（主要工作量）
3. **grid 版面元件**：並排 / 交錯、是否分段、表頭、列標籤欄（位置或譯本名）皆為選項。搜尋結果可多一個「並排」；交互參照改用 `ps.version`
4. **複製對照表**：三處都用同一個動作

不和經文區同一批改：經文區波及已大；搜尋還有關鍵字上色、分組 / 書卷篩選、`.sd-copy`。不連續節也碰不到經文區最麻煩的併節 / 段落 / `reshape`。順序：

- P5：交互參照 dialog 改用核心，支援多譯本
- P6：搜尋結果改走 DText + 核心，關鍵字上色移到 DText，提供並排 / 交錯
- P7：複製對照表擴及搜尋與交互參照；SnFilter 移除 `[data-vaddr]` 分支

---

## 六、決議（2026-09-30）與仍待決定

### 1. 表頭

- 經文區只有並排時，`#lecMainTitle` 夠用，目前不需要進 grid
- 但核心要支援表頭與列標籤欄，因為交互參照 / 搜尋在 dialog 裡沒有 `#lecMainTitle`；交錯模式要的其實是「列標籤欄」（每列的譯本名），不是表頭

### 2. 複製對照表的入口

- 不用長按：長按是平板原生開始選字的手勢，iOS Safari 對文字長按也不送 `contextmenu`；且使用者可能還在調整選取範圍
- 改為：選取範圍出現後，旁邊浮出小按鈕，拖動水滴時跟著移動，按了才動作（不會選到一半就跳選單）
- 電腦也用同一顆；不覆蓋右鍵選單；Ctrl+C 大致維持原生（跨欄時改為對照表、html 只留顏色，見下方原型）

### 3. 複製的內容

- 範圍 = 選到的內容：列 = 起訖節之間的節；欄 = 選取碰到的譯本；格 = 真的反白到的節，沒反白到的留空。並排時（DOM 欄優先）結果就是矩形；交錯（mode 2/4）時不會多帶沒反白的節。只在一欄內選 → 只有該譯本，約等於原生 Ctrl+C
- **不一定整節**：起訖兩節照反白位置截斷（經文筆記常只要後半節）
- **節碼：一律包含**，截斷的節也補上節碼。段落一格時更需要；貼到 pptx 的經文通常也含節碼
- 日後可能的顯示設定：多一欄放經文位置、內文不寫節碼（少數人需要，情境還不明，先不做；用列標籤欄即可實現）
- **選到就是看到的**：隱藏的（`display:none`，如 `.sn-hidden`）不複製；注腳還沒載入就是 `【n】`，不另外查詢

### 2、3 的原型（2026-09-30，已實作在現行 div 版）

`index/LecCopyTable.es2023.js`（`index.js` 裡 `LecCopyTable.s.init()`，css 在 `fhl.css` 最後 `.lec-copy-table`）。現行 `.vercol` 本來就是欄優先的 DOM，不必等 grid。

- `selectionchange`（debounce 150ms）→ 選取在 `#lecMain` 內、真的選到某節的字 → 顯示浮動按鈕，位置在選取最後一行下方（觸控再往下 28px 避開水滴），`#lecMain` 捲動時跟著移
- 按鈕 `pointerdown` 時 `preventDefault` 保住選取，並記下當時的 Range（平板點按鈕可能先清掉選取）
- 從 DOM 取字（TreeWalker，略過 `display:none`、`<br>` → 換行）；起訖所在的 `.lec` 用 Range 截斷，節碼取 `.verseNumber`
- 併入上節：該譯本沒有那節的 `.lec` → 上一格 rowspan +1
- 並排多譯本：`text/html` `<table>`（表頭用 `abvphp.get_cname_from_book`）+ `text/plain`（tab 分隔）。mode 1 一節一列（併入上節 rowspan）；**mode 3 如所見一段一列**（各欄第 i 個 `.paragraph` 是同一列，格內選到的節接在一起）；單一譯本：如所見，同一個 `.paragraph` 的節接在一起、換段才換行（mode 3/4 一段多節不會被拆行；mode 1/2 每節一行）
- 交錯（mode 2/4）多譯本：如所見，一欄多列，每個 `.paragraph`（一個譯本的一節或一段）一列，不加表頭
- 寫剪貼簿：`navigator.clipboard.write` + `ClipboardItem`，失敗退回 `execCommand('copy')` 攔 `copy` 事件
- **跨欄時的反白**（並排 mode 1/3、選到 2 個以上譯本）：原生反白照 DOM 順序畫（第一欄從起點畫到底、中間整欄、最後一欄從頭畫到終點），跟實際複製的不同、會誤導。改為 `#lecMain.lct-crossed ::selection { background: transparent }`，用 CSS Custom Highlight（`CSS.highlights.set('lec-copy', …)`、`::highlight(lec-copy)`）只畫要複製的格子（節碼 + 截斷後的內容）；不支援的瀏覽器退回整節加 `.lct-cell` 底色。交錯模式原生反白本來就準，不換
- **Ctrl+C**：跨欄時也改成複製對照表（看到的 = 複製的）。沒跨欄時仍是反白的內容，但自己產生 html、**只留顏色**：瀏覽器原生 copy 會帶一堆計算後的樣式（貼到 pptx 時注腳不換行、衝出邊界）。區塊（mode 1 每節一個 div）之間換行
- 對照表的格子也帶顏色（節碼藍、注腳粉紅、標題紫…），顏色取 `getComputedStyle().color`，與 `#lecMain` 預設色相同的不寫
- 貼到 PowerPoint：在投影片空白處貼上會新建文字方塊，預設「不自動換行」（HTML 無法控制）；先點進內文版面配置區再貼，就會照框寬換行
- selectionchange 用 40ms 節流（不是 debounce），拖曳中就換掉原生反白
- 已測（瀏覽器，西 2，unv / rcuv / csb）：mode 1 跨三欄（rowspan、截斷、只畫矩形、Ctrl+C = 對照表）、單欄（Ctrl+C 只留顏色）、mode 3、mode 2 交錯；真的滑鼠點按鈕後選取仍在。**平板尚未實測**
- 發現既有 bug（另開任務）：mode 1/2 併入上節時，上一節節碼沒變成 `20-21`（`build_view_model` 的 `verses` 是每段各自一份，假段落每節一段 → 找不到上一節）；mode 3 同一段內才正確

改成 grid 後，取字可以改從資料模型（DText）來，不必走 DOM；但「選到就是看到的」規則要保留。

### 4. demo 保留

`index/lecture/` 01–18 與 `TableSelection/` 先保留，做完再說。用途：討論時可以說「就像 demo 05 的 rowspan」「像 08 的平板整格選取」。第〇節的 demo 對照表就是索引。

### 5. 拖曳矩形選取（需要，啟用方式未定）

限制：不能干擾預設的原生反白與平板捲動。候選：

- 電腦：按住修飾鍵（如 Alt）拖曳才進入矩形選取
- 平板：工具列切換「表格選取模式」，開啟時才設 `touch-action: none`、接管 pointer
- 在節碼上拖曳（節碼區當「把手」）
- 核心可用 `TableSelection/` 的 controller，但 cell 定位要改成 grid 的 `grid-row` / `grid-column`（或 `data-r` / `data-c`），不是 `td`
