# 主題切換：Apple 色票與 css 變數

7.2.0 (2026-10-03)。可切換 **跟隨系統 / 淺色 / 深色 / 高對比淺色 / 高對比深色**，顏色來自自己發佈的套件 `@fhlnet/color-apple` (Apple iOS system colors)。系統中寫死的顏色 (#hex、rgb()、顏色名稱) 全部改成 css 變數，切主題時整個畫面跟著變。

## 一、決定 (2026-10-03，與使用者討論)

| 項目 | 決定 |
|---|---|
| 淺色外觀 | **Apple 風淺色**：窗框 systemGray4 (#D1D1D6)、工具列淺底深字。原本是灰框 #A0A0A0 + 深色工具列 #404040，畫面明顯變亮 |
| jQuery UI 對話框標題列 | 原本 blitzer 紅色漸層，先改中性色；**同日改回紅色**：對話框內容與主經文同底色，中性標題列看不出是對話框。`--dlg-title-bg` = systemRed 混 20% 黑 (高對比深色混 30%，`--dlg-k`)，白字各主題 ≥ 5:1 (淺 5.24、深 5.05、高對比淺 7.60、高對比深 5.31)；只套 `.ui-dialog .ui-dialog-titlebar`，tab 列等 `.ui-widget-header` 仍中性；關閉鈕的紅 X 圖保留 |
| 套件 0.3.0 的層疊 bug | **先修套件出 0.3.1** (見 §七-1)，FHLNUI 用 0.3.1 |
| 地圖圖磚 | **保持原樣** (亮的)，只改控制鈕、popup、地名標籤 |

## 二、引入方式：複製 css 進專案

| 方式 | dev | build | 原始碼直接上傳 | |
|---|---|---|---|---|
| importmap → node_modules | ✗ 套件 `dist/index.js` 第一行 `import "./apple-color-ios.css"`，原生 module 不能 import css | | ✗ 伺服器沒有 node_modules | 不行 |
| `<link href=node_modules/…>` | ✓ | 要另外複製 | ✗ | 不行 |
| **複製 css 進專案** | ✓ | ✓ (`index/` 整個在 `LEGACY_COPY`) | ✓ | 採用 |

- `npm run gen:theme` (`tools/gen_apple_color.mjs`)：`node_modules/@fhlnet/color-apple/dist/apple-color-ios.css` → `index/theme/apple-color-ios.css`，檔頭記版本。可給來源資料夾：`node tools/gen_apple_color.mjs ../fhlnet-color-apple` (套件還沒發佈時用)
- `setTheme` / `cssVar` 只有幾行，自己寫在 `index/theme/Theme.es2023.js` (多了 localStorage、跟隨系統、`withLightPalette`)。JSDoc 用 `import('@fhlnet/color-apple').CssVarName` 取型別 (只有編輯器用，執行時不 import)

## 三、檔案與載入順序

| 檔案 | 內容 | 怎麼載入 |
|---|---|---|
| `index/theme/apple-color-ios.css` | Apple 色票 (`--systemBlue`、`--label`…，4 種變體) | `index.html` `<head>` 最前面 `<link vite-ignore>` |
| `index/theme/theme-vars.css` | **語意變數** (§四)、`color-scheme`、`html` 底色 | 同上，緊接在後 |
| `index/theme/theme-3rd.css` | 第三方樣式的覆寫 (§六) | `index.js` 以 `<style>` 接在 fhl.css **後面** |
| `index/theme/Theme.es2023.js` | `Theme.s.mode` 讀寫、`onChange`、`withLightPalette`、`cssVar` | module；`window.theme` |
| `index/ThemeTool.es2023.js` | 設定面板的切換列 | `Settings.es2023.js` |

- 前兩支只有 `:root` 變數與 `html` 底色，放最前面不影響其他規則的先後。驗證：改動前後，全頁 2369 個元素「排除顏色屬性」的 computed style 只差在設定清單多了一列 (之後的 li 往下移)
- **不閃白**：`<head>` 開頭的 inline script 讀 localStorage `fhlTheme`，設 `<html data-theme>`；加上 `html { background: var(--app-bg) }`，fhl.css (index.js 執行時才插入) 還沒來時底色就對。保持 inline：寫成 `<script src>` 會被 build 併入 defer 的 legacy bundle，太晚 (CLAUDE.md)
- build 後 `dist/index.html`：inline script 在 `versionLegacyUrls` 注入的 script 後面、所有 css 前面；兩個 `<link>` 自動加 `?v=`

## 四、語意變數 (theme-vars.css)

規則：**各 css / js 只用語意變數**，Apple 色名只出現在 `theme-vars.css`。既有的元件變數群名稱不變，改指語意變數，例 `--tb-bg: var(--chrome-bg)`、`--au-accent: var(--accent-fg)`、`--ob-border: var(--line-strong)`、`--vg-head-bg: var(--surface2-bg)`、`--snc-v: var(--orange-fg)`、`--ref-act-verse-bg: var(--hl-verse-bg)`、`--lct-hl: var(--copy-cell-bg)`。

| 分類 | 語意變數 | Apple | 原本 (例) |
|---|---|---|---|
| 背景層級 | `--app-bg` `--frame-bg` | systemGray4 (高對比 Gray5) | body、窗框、標題列 #A0A0A0 |
| | `--splitter-bg` | systemGray3 | 可拖的灰框 |
| | `--chrome-bg` / `--chrome-fg` | secondarySystemBackground / label | 工具列 #404040 / #D0D0D0 |
| | `--surface-bg` | systemBackground | 經文區、對話框 white |
| | `--surface2-bg` | secondarySystemBackground | 右側分頁、左側清單 #F0F0F0 |
| | `--popup-bg` | tertiarySystemBackground | 浮出選單 #FAFAFA |
| | `--hover-bg` `--pressed-bg` `--zebra-bg` | tertiary / systemFill / quaternary | #E8E8E8 / #ccc / whitesmoke |
| | `--selected-bg` / `--selected-fg` | systemBlue / on-accent | 選中 #404040 白字 |
| | `--raised-bg` `--note-bg` `--btn-bg` | systemGray5、黃 mix、secondaryFill | 註釋按鈕、原文 popup 淡黃、A− A+ |
| | `--shadow` `--overlay-bg` `--tip-bg` | darkText / systemBackground / label 的 mix | 各處 rgba(0,0,0,.x) |
| 文字 | `--fg` `--fg-muted` | label / secondaryLabel | #303030 / #555 ~ #909090 |
| | `--fg-subtle` | systemGray 混 15% label | #888 ~ #B0B0B0 (要讀得到的提示) |
| | `--fg-disabled` | tertiaryLabel | 停用的 ← →、清除記錄 |
| | `--fg-on-accent` | 白 (高對比深色是黑) | 藍、紅底上的字 |
| 線 | `--line` / `--line-strong` | separator / systemGray2 | #ddd、lightgray / #999、#bbb |
| 譯本間虛線 | `--col-line` | systemGray3，深色 systemGray2 | lightgray (經文區 `.vercol` / `.paragraph`、搜尋結果 `.verse-grid`)。原本用 `--line`，但 separator 是半透明，1px 虛線在黑底上看不到 |
| 強調、狀態 | `--accent` `--accent-fg` `--accent-bg` | systemBlue | #00A0FF、#0050DD、#0969da |
| | `--link-fg` | systemBlue (不用 `--link`，§七-6) | blue |
| | `--brand` `--danger` `--warn` `--success` `--info` `--neutral` | Purple / Red / Orange / Green / Teal / Gray | #905090、#d9534f、#FFC060… |
| | `--success-fill` `--info-fill` | Green / Teal 混黑 (`--fill-k`) | 白字的綠底按鈕 |
| 經文標記 | `--verse-num-fg` `--ver-name-fg` `--sn-fg` | blue-fg | .verseNumber、.sn blue |
| | `--sn-hover-fg` `--sn-act-fg` / `--sn-act2-fg` | red-fg / 紅混灰 | red / darkred (SN_Act_Color) |
| | `--ref-fg` `--ref-hover-fg` `--foot-fg` | link / red / pink | blue / red / #ff00c1 |
| | `--orig-fg` | purple-fg | 希臘文、希伯來文 mediumpurple |
| | `--exp-fg` `--bibtext-fg` `--paren-fw-fg` `--title1-fg` | purple / indigo / purple / purple 混 label | purple、violet、#9400d3、#8b008b |
| | `--wh-bg` / `--ubs-bg` | systemYellow / systemRed 的 mix | 韋 #FFFF99 / 聯 #FFCCCC (css 與 parsing_render_top 共用) |
| | `--red-letter-fg` | red-fg | 資料裡的紅字 rgb(195,39,43) |
| active / 選取 | `--hl-verse-bg` `--hl-verse-fg` `--hl-chap-bg` `--hl-chap-border` | systemYellow mix | 字典高亮 #ffe27a / #fff5cc / #d4a300 |
| | `--lec-selected-bg` | systemYellow 13% / 23% | 選取的節 |
| | `--copy-cell-bg` | systemBlue mix | 複製對照表整格 |
| SN 上色 `--snc-*` | v→orange、c→red、p→brown、neg→purple、pn→indigo、pf→green、impf→purple、wq→green+yellow、vol→pink、inf→teal、ptc→blue、vx→fg-muted | | Open Color 色碼 |
| 地圖 | `--map-shape-stroke` / `--map-shape-fill` | systemRed / systemGreen | '#f02' / '#5f3' |

### 比例變數：淺、深、高對比各給不同比例

`color-mix()` 的比例用 var()，在 `:root` 依主題換值 (寫法照 `fhlnet-color-apple/demo/index.css` 的 `--selectionBackground`)：

| 變數 | 用途 | 淺 | 深 | 高對比淺 | 高對比深 |
|---|---|---|---|---|---|
| `--tint` | 藍紅紫粉靛「當文字」時混 `--label` 的比例 | 80% | 100% | 90% | 75% (混白) |
| `--tint-bright` | 綠青黃橘 當文字 | 62% | 100% | 82% | 85% |
| `--hl-sel` `--hl-1` `--hl-2` `--hl-3` | 高亮底的濃度 | 13 18 30 50% | 23 22 32 38% | 同淺 | 同深 |
| `--fill-k` | 綠、青當白字底時混黑 | 65% | 55% | 90% | 100% (字是黑) |
| `--shadow-k` | 陰影 | 30% | 70% | | |
| `--icon-filter` | 深灰的 icon 圖 (jQuery UI sprite、Bootstrap ×) | none | invert(1) | | |

深色要寫兩次：`:root[data-theme$="dark"]` 與 `@media (prefers-color-scheme: dark) { :root:not([data-theme]) }` (跟隨系統)；高對比同理用 `(prefers-contrast: more)`。

## 五、切換 UI 與記錄

- 設定面板 (字體大小下面)：`[自動] [淺色] [深色] ☐ 高對比`。自動 = 跟隨系統 (深色、增強對比都跟)，此時「高對比」不能勾；淺/深 + 高對比 = hc-light / hc-dark
- localStorage `fhlTheme`：`light|dark|hc-light|hc-dark`，沒有 = 自動
- 其他分頁切換時跟著變 (`storage` 事件)；`<meta name="theme-color">` 跟工具列同色
- 切換時加 `html.theme-no-transition` 一個 frame，各處的 transition 不會慢慢變色
- console：`theme.mode = 'hc-dark'`

## 六、第三方樣式 (theme-3rd.css)

- **jQuery UI blitzer**：`.ui-widget-content` / `-header` / `.ui-state-*` / `.ui-button` 改語意變數；內容區的 `.ui-icon` (深灰 sprite，例 右下角拉大小) 用 `--icon-filter` 反白
- **Bootstrap 5.1** (沒有深色模式)：`--bs-body-*`、`a`、`.btn-light`、`.btn-outline-*` (含 `.active`、`.btn-check:checked +`)、`.modal-content`、`.card`、`.form-check-input`、`.btn-close`。bs4-compat.css 的 focus / active 也改了
- **github-markdown-css**：它自己用 `@media (prefers-color-scheme)` 決定明暗，**原本系統是深色時說明頁就已經錯配**。改成在 `.markdown-body` 裡把它的 `--fgColor-*` `--bgColor-*` `--borderColor-*` 指到語意變數，`color-scheme: inherit`。CDN 網址原本沒寫版本，**固定成 `@5.9.0`**，升版要比對變數名稱
- **leaflet**：leaflet.css 是切到地圖分頁才插入 (比 theme-3rd.css 晚)，選擇器前面都加 `#fhlmapContainer` 提高權重。`#fhlmapContainer` 本身就是 `.leaflet-container`

## 七、坑

1. **套件 0.3.0 的層疊 bug**：系統偏好的 `@media` 區塊用 `:root:not([data-theme="light"])`，與 `:root[data-theme="hc-light"]` 同權重而寫在後面 → 系統「深色 + 增強對比」時選 hc-light 變 hc-dark；增強對比時選 light 變 hc-light、dark 變 hc-dark。0.3.1 改成 `@media` 內只用 `:root:not([data-theme])`，手動選的主題完全不受系統影響；加 `tests/cascade.test.js`
2. **bs4-compat.css 的 `:root{--danger:#dc3545}`** 載入得比 theme-vars.css 晚，蓋掉語意變數 `--danger`。那些 4.5 顏色變數沒人用，刪掉。新增語意變數前要查名稱有沒有撞到
3. **leaflet 的 `color` 選項寫成 SVG 屬性**，屬性不吃 `var()` → 改給 `className: 'fhlmap-line' / 'fhlmap-area'`，css 的 `stroke` / `fill` 蓋過屬性
4. **資料裡的紅字** (中文標準譯本等 `<span style="color:rgb(195,39,43)">`) 深色底上太暗：用屬性選擇器 `[style*="rgb(195,39,43)"]` (有、無空白兩種) `!important` 蓋成 `--red-letter-fg`，不用改資料流程 (經文區是原 html，註釋是 dtexts_render 的 `.css()`)
5. **Apple 的 tertiaryLabel 只有 30% 不透明**：拿來放「要讀的提示」(速度、聲音來源) 只有 1.7:1。分成 `--fg-subtle` (systemGray 混 label) 與 `--fg-disabled` (tertiaryLabel，只給停用)
6. **Apple 的 `--link` 在高對比下不變深** (仍 #007AFF)，連結在高對比只有 3.4:1 → `--link-fg` 改用 systemBlue (有高對比變體；淺色時兩者相同)
7. **高對比深色的強調色很亮** (#409CFF)，上面的白字只有 2.8:1 → 該主題 `--fg-on-accent` 改黑
8. **systemGreen 當白字的底**只有 2:1 (譯本選擇的選中按鈕) → `--success-fill` 混黑
9. **黃色高亮在深色要淡一點**：原本想深色濃一點，結果 60% 黃 + 藍色連結 = 1.05:1 (字典的「同一節」)。深色 `--hl-3` 改 38%，高亮裡的字改一般字色 (`--hl-verse-fg`)
10. **複製對照表的顏色**：讀 getComputedStyle 寫進剪貼簿 html。深色主題下會貼出深色版的顏色 → `Theme.s.withLightPalette(fn)` 暫時設 `data-theme="light"` 讀完再還原 (同步，不會重繪；加 `theme-no-transition`，否則有 transition 的元素會讀到動畫起點)。另外 color-mix 的 computed 值是 `color(srgb 0 0.38 0.8)`，Word 不一定認得 → `toRgb()` 轉成 `rgb()` (`tests/lecCopyTable-toRgb.test.js`)
11. 顏色名稱不只常見的那幾個：fhl.css 的希臘 / 希伯來文是 `mediumpurple`，第一次盤點的清單漏了。lint 測試改用完整的 148 個 css 顏色名稱
12. parsing_render_bottom_table 原本另一半寫 `attr('style', 'white')`，不是合法 css，等於沒底色 → 改 `.parsing-zebra` class

## 八、防止退步：tests/theme-colors.test.js

- css：各檔的**宣告值** (不看選擇器；看 color / background / border / shadow / fill / stroke / filter 等屬性與 `--*`) 出現 #hex、rgb()/hsl()…、148 個顏色名稱就失敗。`var(--red-fg)` 這種變數名稱不算
- `theme-vars.css` 的值只能用 Apple 色票
- js (`index/`、`static/fhlmap_api`、`static/ob_api`、`static/search_api`、`libs/ijnjs-ui`、`libs/ijnjs-fhl`)：`color: …`、`.css('color', …)`、`{ color: '…' }` 這類寫法，以及單獨的 `'#ffff99'` 字串。資料解析的檔案 (AddParenthesesUnvNcv、cvt_others、DText) 白名單
- 已驗證：用 git 上舊版的 BookSelect、FhlLecture、parsing_render_*、render_comments_in_dtexts、fhlmap_main、FhlInfoOb 跑，全部抓得到

## 九、驗證 (dev 5177、dist 5175)

- 4 個主題 + 跟隨系統 (`colorScheme` 模擬淺 / 深；瀏覽器面板不能模擬 `prefers-contrast`，高對比只用明確的 data-theme 測)
- 對比檢查 (console 腳本)：每個看得見的文字，算它與實際底色 (往上疊透明底) 的對比，一般主題 < 3、高對比 < 4.5 列出；深色主題另列「亮的大塊底色」。範圍：主畫面、9 個右側分頁、搜尋 / 原文字典 / 譯本選擇 / 字型大小 / SN 篩選 / 使用說明 (markdown) 對話框、信望愛資源面板與說明、經卷選擇、地圖 (河流 stroke、地名標籤)、有聲 mini player、複製對照表整格底色
- 剩下 (接受)：停用的 ← → 與「清除記錄」(刻意淡)；高對比淺色時原文分析表格隔行底上的綠色粗體小標 4.28:1
- `npm run build` → dist：inline script、`<link>` 版號正確，hc-dark 正常，console 無錯

## 十、未做 / 待辦

- ~~發佈 `@fhlnet/color-apple@0.3.1`~~ 已發佈並裝成 devDependency；npm 版產生的 css 與先前從 `../fhlnet-color-apple` 產生的完全相同。`tests/theme-apple-copy.test.js` 檢查複本與已安裝版本一致 (升版後忘了 `npm run gen:theme` 會失敗)
- (發佈時的小插曲：`npm publish` 先回 401，改走網頁授權，要在瀏覽器完成授權才算發佈；只看到 Tarball Details 不代表成功，以 registry 有新版本為準)
- `frmUpdated.html` (舊的更新頁) 與 `static/js/` 舊 Vue bundle 沒有主題化
- 地圖圖磚在深色仍是亮的 (決定如此)；要的話可在 `.leaflet-tile-pane` 加 `filter: invert(1) hue-rotate(180deg)`
