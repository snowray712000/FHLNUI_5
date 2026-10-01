# 平板拖灰框：touch-punch 載入順序；上下章箭頭不反白；「聖經譯本選擇」

7.0.6 (2026-10-02)。處理 app_versions.json TODOs 的 2、3、4 三項。

## 一、平板拖不動灰框 (TODO 3)

### 現象

電腦上可以拖經文區與左側欄、右側資訊區之間的灰框 (`.ui-resizable-handle`) 調整寬度；iPad 上拖了沒反應。

### 原因

灰框是 jQuery UI `resizable` (`index/FhlInfo.es2023.js` 的 `handles: 'w'`、`index/FhlLeftWindow.es2023.js` 的 `handles: 'e'`)。jQuery UI 1.12 的 `$.ui.mouse` 只聽滑鼠事件；iPad 拖曳不會產生相容的 mousemove，所以要靠 `jquery.ui.touch-punch` 把 touch 轉成 mouse。

`index.html` 早就載入了 `static/libs/jquery.ui.touch-punch.min.js`，但放在 `jquery-ui.min.js` **之前**。touch-punch 一開頭：

```js
a.support.touch = "ontouchend" in document
if (a.support.touch) { var b = a.ui.mouse.prototype ... }
```

- 電腦：`ontouchend` 不在 document → 什麼都不做，所以沒人發現。
- 觸控裝置：`a.ui` 還是 undefined → 載入就丟 TypeError，從未生效。

### 修正

把 touch-punch 的 `<script>` 移到 `jquery-ui.min.js` 之後 (index.html 有註解)。

### build 版為何可能本來就正常

`vite.config.js` 的 `bundle-legacy-scripts` 把本地的傳統 `<script src>` 串成 deferred 的 `assets/legacy-[hash].js`；CDN 的 jquery-ui 不串、仍是同步載入。所以 `dist/` 裡 touch-punch 其實在 jquery-ui 之後執行。問題主要出在 dev (`npm run dev`) 與未經 build 的直接部署。若上線版 (dist) 平板仍拖不動，要另查原因。

### 影響範圍

touch-punch 包的是 `$.ui.mouse`，全專案用到它的只有：

- 左右兩個 `resizable` 灰框
- jQuery UI dialog 的 `draggable` (標題列) 與 `resizable` (邊角)

touch-punch 只在 touchstart 落在 handle 上 (`_mouseCapture` 為真) 時才接手並 `preventDefault`，所以經文區、資訊區、對話框內容的捲動不受影響；dialog 的關閉鈕在 draggable 的 `cancel` 裡，也不受影響。iPad 模擬器實測：拖灰框可調寬、兩區上下捲動正常、捲動不會動到灰框。

### 未做

灰框只有 12px 寬，手指不好按。可在 `@media (pointer: coarse)` 用 `::before` 把可按範圍加寬而外觀不變 (jQuery UI 判斷 target 是 handle，偽元素算在 handle 上)。

## 二、上一章、下一章箭頭不反白 (TODO 4)

`#fhlLecture .chapControl` (`index/appSkeleton.es2023.js` 的 `.chapBack` / `.chapNext`，內容是 ❮ ❯) 加：

```css
-webkit-user-select: none;
user-select: none;
-webkit-touch-callout: none;
```

驗證：`selectNodeContents(#fhlLecture)` 後 `toString()` 不含 ❮ ❯。

## 三、「聖經版本選擇」改「聖經譯本選擇」(TODO 2)

- `index/FhlLeftWindow.es2023.js` 左側按鈕文字 (`gbText('聖經譯本選擇', ps.gb)`)
- `index/gbText.es2023.js` 簡體對照 `"聖經譯本選擇": "圣经译本选择"` (key 要跟著改，否則簡體模式找不到)
- `docs/使用說明.md`、`index/lecture/docs/譯本選擇.md`、`FhlLecture` / `WindowControl` 的註解
- `app_versions.json` 舊版本的條目是歷史紀錄，不改

## 四、新增的 TODO

- 併入上節：例如西2:20-21 (和合本) 合併成一節，節碼應呈現「20-21」
- 複製對照表多一種 Markdown 表格 (可貼到 .md)。剪貼簿格式要想：`text/plain` 放 md 表格 (但目前 plain 是 tab 分隔，給 Excel 用)？顏色 (SN、上色的字) 在 md 裡會丟失；還是另給一個按鈕 / 選項。待討論
