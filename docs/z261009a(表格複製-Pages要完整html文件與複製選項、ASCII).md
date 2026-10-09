# 表格複製：Pages 要完整 html 文件、複製選項 ⚙、ASCII (7.5.3)

## 起因

複製「表格」貼到 Pages 變純文字，貼到 Keynote 卻是表格。

## 查到的

- 以前只寫 `text/html` = 一段 `<table>…</table>` 片段 + `text/plain`。
- 網路上查不到 Apple 的說法（只有使用者討論：Pages 不太解讀剪貼簿的 html 表格）。曾猜是「瀏覽器原生複製還會多寫 RTF」，試了 `execCommand('copy')` 選取隱藏表格的原生複製，Pages 確實貼成表格；但**網頁讀剪貼簿 (paste 事件) 只看得到 `text/html` 與 `text/plain`，沒有 RTF**，所以不是 RTF 的功勞。
- 對照原生複製寫出的 `text/html`：開頭是 `<!DOCTYPE html><head><meta charset="UTF-8"></head><body dir="ltr">…`，我們的只有 `<table>`。
- **結論：包成完整文件 (`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>…</body></html>`) 就好**，Pages 貼成表格，也會自動換行（先前列不換行、第二行被切掉，是原生版的問題）。`asHtmlDoc()`。
- 因 `navigator.clipboard.write` 會對 html 消毒（可能洗掉 meta / DOCTYPE），改成先攔 `copy` 事件用 `setData`，失敗才退回 `clipboard.write`。Ctrl+C (`#onCopy`) 也同樣包。
- 原生複製版有太多雜訊（`box-sizing`、`transition: none !important`、app 的 `font-family`），已移除，不要再做。

## 其他踩到的

- Pages 表格會有灰底：是 Pages 預設勾選「交換列顏色」（表格格式 → 交換列顏色），取消就好，跟我們的 html 無關。曾懷疑 `background-color:transparent`，但那樣沒差，後來完全不寫背景。
- Keynote 表頭 `<th>` 列偏高：選項「表頭用 th」可改成粗體的一般格。
- 偵錯：console 執行 `fhlCopyDebug(true)`，複製後畫面出現面板，列出我們產生的 `text/html` / `text/plain`，最下面「貼上檢視」框按 Cmd+V 可看剪貼簿**實際**內容；`fhlCopyDebug(false)` 關。（一開始就是靠它才看出差異。）
- 模組載入時不能直接碰 `window`（vitest 在 Node 跑會掛），`window.fhlCopyDebug` 要先判斷。

## ⚙ 表格複製選項

按鈕列最右的 ⚙ 開面板，存 localStorage `fhlCopyTableOpts`（`OPT_DEFS` / `loadOpts`）。沒勾的就完全不寫進 html：

| 選項 | 預設 | |
|---|---|---|
| 字色 | 勾 | 表格的 `color`（節碼、註的顏色一定會有） |
| 框線 | 勾 | `border="1"` + `border-collapse`；不勾 `border="0"` |
| 背景色 | 否 | 往上找第一個不透明的背景色 |
| 字型 | 否 | 經文區目前的 `font-family` |
| 字級 | 否 | 經文區目前的 `font-size`（內容字級，不是介面字級） |
| 依目前主題 | 否 | 不勾：`Theme.s.withLightPalette` 一律用淺色；勾：深色就複製深色顏色 (`inCopyPalette`) |
| 表頭用 th | 勾 | 不勾：粗體 `<td><b>` |

預設是「字色 + 框線」而不是只有字色：沒框線的表貼到備忘錄像一堆字，欄分不清。

面板的 pointerdown `preventDefault`（除了 checkbox）以免選取消失；`closest('.lct-opts')` 也算自己人，點它不會取消 sticky。

## 按鈕列

- 超過 4 顆且文字類 (文字 / 連續文字 / 連續含出處) 與表格類 (表格 / MD / ASCII / ⚙) 都有 → 兩列：上排文字類各 1/3，下排表格類各 1/4。用 12 欄 grid，js `#layoutBtns` 設 `grid-column: span 12/n`；格線用 `gap: 1px` 畫。
- 字級 `calc(12pt * var(--ui-k, 1))`（介面字級，docs/z261008a），按鈕與 ⚙ 面板都是。

## ASCII 按鈕

純文字畫框的表格（`+---+` / `| |`），貼到純文字信件、聊天、程式碼註解。

- 與 MD 共用資料來源（`toMarkdown(table, fmt)` 第二個參數是格式函式，`asciiTable`）。
- 整張寬度上限 80 欄（`ASCII_MAX_W`），欄寬按比例縮、每欄至少 8；格內太長折行（`wrapW`，英文盡量在空白斷，中文隨處可斷）。
- 顯示寬度 `dispW`：CJK / 全形標點算 2。補空格：含中文的行用全形空白 U+3000 補 (2 欄寬一個，奇數再補半形)，非等寬字型也比較齊；純英文行用半形。邊框 `| + -` 還是半形，非等寬字型仍可能有點歪，決定不再追。
