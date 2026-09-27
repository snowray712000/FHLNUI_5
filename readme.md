# 信望愛聖經工具 (FHL NUI)

信望愛站 ([bible.fhl.net](https://bible.fhl.net/)) 的網頁版聖經研讀工具，線上版：<https://bible.fhl.net/NUI/>

## 功能

- 多譯本對照閱讀：逐節／段落 × 並排／交錯，共 4 種顯示模式
- 原文：新約希臘文、舊約希伯來文、七十士譯本，Strong Number (SN) 即時字典、Parsing、同源字
- 註釋、串珠 (交互參照)、講道、典藏
- 搜尋：依目前閱讀的書卷自動選範圍，支援希臘文／希伯來文原文搜尋
- 地圖 (Leaflet)
- RWD，手機可用

## 開發

需要 Node.js (建議 24 以上)。

```bash
npm install
```

```bash
npm run dev
```

開啟 <http://127.0.0.1:5173/>。其實不用 build 也能跑：`index.html` 直接用瀏覽器的原生 ES module 載入 `index/index.js`，任何靜態伺服器都行。

| 指令 | 用途 |
|------|------|
| `npm run dev` | Vite 開發伺服器 (5173) |
| `npm run build` | 打包到 `dist/` |
| `npm run preview` | 預覽 `dist/` (5175) |
| `npm test` | Vitest 單元測試 (`tests/**/*.test.js`) |
| `npm run depgraph` | 重新產生模組依賴圖 `docs/dependency-graph.mmd` |
| `npm run gen:orig` | 從信望愛公開的 `bible_parsing.zip` 重新產生新舊約原文 (嵌 SN) `index/bible_fhlwh.json.gz`、`index/bible_bhs.json.gz`，與舊約希伯來文搜尋資料 `index/bible_bhs_code.json.gz` |
| `npm run check:data` | 檢查上面這些資料檔是否已過期 (信望愛更新了 zip)，只送 HEAD 不下載 |

部署時上傳 `dist/` 的內容，注意事項見 [docs/z260925b(dev、build與上傳注意事項).md](docs/z260925b(dev、build與上傳注意事項).md)。

## 發版

1. 修改 `index.html` 中的 `currentSWVer`
2. 在 `app_versions.json` 加上這一版的更新說明 (`nui.last` 也要改)

## 目錄

| 路徑 | 內容 |
|------|------|
| `index.html` | 進入點 |
| `index/` | 主要程式碼 (`*.es2023.js` ES module)、資料檔 (`*.json.gz`) |
| `libs/` | ijnjs 核心函式庫與 FHL 擴充 |
| `static/` | 舊元件 (classic script)，build 時合併成一個 legacy bundle |
| `tests/` | Vitest 測試；`*.html` 是舊的瀏覽器手動測試 |
| `tools/` | 資料產生腳本 |
| `docs/` | 規格、設計紀錄 (中文) |

## 文件

- [docs/使用說明.md](docs/使用說明.md)：給使用者的操作說明，依「想做什麼」介紹各功能
- [CLAUDE.md](CLAUDE.md)：架構、慣例、build 限制 (給 AI 也給人看)
- [docs/z260221a(給ai的總綱).md](docs/z260221a(給ai的總綱).md)：專案總綱
- [docs/z260925a(vite化緣由與過程).md](docs/z260925a(vite化緣由與過程).md)：為何與如何加入 Vite
- [docs/dependency-graph.mmd](docs/dependency-graph.mmd)：模組依賴圖

## 相關連結

- 信望愛站：<https://bible.fhl.net/>
- 問題回報表單：<https://forms.gle/BmuPe2rmKKWgMUr5A>
