# dev、build 與上傳注意事項

> 背景與原因見 [z260925a(vite化緣由與過程).md](z260925a(vite化緣由與過程).md)。本文只列操作時要注意的事。

---

## `npm run dev`

- **dev 版不等於正式版**。
  - 舊式 script 在 dev 下是一支一支載入，ijnjs 的小檔也照舊一支支下載。
  - 所以 dev 正常，不代表打包後也正常。
  - 上傳前請用 `npm run preview`（`http://127.0.0.1:5175/`）再測一次。
- **舊式檔案在 dev 下不經過 Vite 處理**，會原樣送出。
  - 改了 `static/` 裡的檔案，要重新整理頁面才會生效，不會熱更新。
- **不同 port 是不同網站**。
  - 5173、5175、正式站各自有自己的 localStorage。
  - 所以停留的經節、分頁、字級都可能不同，畫面內容不一樣是正常的。

## `npm run build`

- **每次 build 都會先把整個 `dist/` 刪掉**。不要把自己的檔案放在 `dist/` 裡。
- **新增「執行時才讀取」的檔案時**（例如用 `$.ajax` / `fetch` 讀的資料、html 片段），要確認它在 `vite.config.js` 的 `LEGACY_COPY` 範圍內。
  - 不在範圍內的檔案，不會出現在 `dist/`。
- **在 `index.html` 新增 `<script src>` 時**：
  - 這支檔案會被併進 `legacy-*.js`，而且會變成 defer。
  - 如果某段程式必須在 `ijnjs.js` 之前執行，要寫成 inline。
- **不要動 `index.html` `<head>` 裡的 `<div class="markdown-body">`，也不要調整 CSS 的先後順序**，否則畫面會跑掉。
- **發新版時**，以下兩處都要改：
  - `index.html` 的 `currentSWVer`
  - `app_versions.json`

## 資料檔更新 (信望愛的原文資料)

`index/` 裡有幾個檔案是從信望愛公開的 [bible_parsing.zip](https://ftp.fhl.net/FHL/COBS/data/)（sqlite）產生的，信望愛更新資料後，要重新產生、build、上傳：

| 檔案 | 用途 |
|---|---|
| `bible_fhlwh.json.gz` | 讀經「新約原文」，每個字嵌 SN |
| `bible_bhs.json.gz` | 讀經「舊約馬索拉原文」，每個字嵌 SN |
| `bible_bhs_code.json.gz` | 舊約希伯來文搜尋 (信望愛內碼) |

1. **`npm run check:data`**：只送 HEAD 比對 zip 的 Last-Modified，全部 ✓ 就不用做下面的步驟。發版前順手跑一次。
2. **`npm run gen:orig`**：下載 zip（約 40MB，快取在 `tools/.cache/`，不進 git），產生上面 3 個檔。
   - 會印出新舊約各自「對不上」的筆數，細節在 `tools/.cache/gen_bible_orig_report.txt`。平常新約約 7 筆、舊約約 6 筆（上游的錯字、重複字）；突然變多，表示資料格式變了，先別上傳。
3. `npm test`，再 `npm run dev` 抽看幾節（新約原文、舊約原文、希伯來文搜尋）。
4. commit，`npm run build`，上傳 `dist/index/` 裡這 3 個檔（不必重傳 `assets/`，除非程式也有改）。

`index/audio_bible_index.json`（`npm run gen:audio`）來源是 API，沒有可比對的日期，`check:data` 不會檢查它。

## 上傳

### 哪些要傳

| 情況 | 檔案 |
|---|---|
| 每次都要傳 | `index.html`、`assets/` |
| 有改才傳 | `app_versions.json`、`index/` 裡的資料檔、`index/bs4-compat.css`、`libs/ijnjs*`、`frmUpdated.html` |
| 不用重傳（沒改的話） | `static/font`（76MB）、`images/`（34MB）等 |

- **改了 `static/` 裡的舊程式（講道、搜尋…）時，要傳的是 `assets/` 和 `index.html`**。
  - 這些程式已經被打包進 `legacy-*.js`。
  - 只上傳 `static/` 裡的那支檔案不會生效。

### 上傳順序與清理

- **先傳 `assets/`，最後才傳 `index.html`**。
  - 順序反過來的話，上傳期間有人開頁，會拿到新的 `index.html`，但它指向的檔案還不存在。
- **伺服器上舊的 `assets/` 檔案不要馬上刪**。
  - 有些使用者的瀏覽器還在用舊的 `index.html`，它指向的是舊檔名。
  - 隔幾個版本再清理。

### 工具與測試

- **同步工具不要用修改時間判斷要傳哪些檔案**。
  - 每次 build 所有檔案的時間都會變新，會變成全部重傳。
  - 請改用大小或內容比較。
- **上傳後第一次開頁，看到舊畫面是正常的**。
  - 伺服器沒有送快取設定，瀏覽器可能會沿用舊的 `index.html` 一段時間。
  - 測試時用強制重新整理（Ctrl+F5）或無痕視窗。
