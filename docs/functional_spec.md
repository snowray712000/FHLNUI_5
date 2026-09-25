# 信望愛聖經工具 NUI — 功能規格

**版本**：v5.5.1
**文件日期**：2026-03-30
**技術棧**：純瀏覽器執行，ES2023 Native Modules，無建置步驟

---

## 1. 系統概述

信望愛聖經工具 (FHL NUI) 是一套純前端的聖經研讀 Web 應用，提供多譯本對照、原文分析、串珠、講道、地圖等豐富工具，不需要後端伺服器即可執行。進入點為 `index.html`，透過 `index/index.js`（ES Module）載入所有功能。

### 1.1 執行環境

| 項目 | 說明 |
|------|------|
| 執行方式 | 直接開啟瀏覽器，無需建置 |
| Dev Server | `http://127.0.0.1:5502/NUI_dev/` |
| 相容性 | 支援 ES2023 的現代瀏覽器 |
| 語言 | 繁體中文（可切換為簡體） |

---

## 2. UI 版面結構

應用採三欄式版面，各欄可調整寬度，並可隱藏。

```
┌─────────────────────────────────────────────────────────┐
│                    Toolbar (工具列)                      │
├──────────────┬─────────────────────────┬────────────────┤
│  Left Window │   Mid Window (主要內容) │  Right Window  │
│  (左側面板)  │   FhlLecture 經文區域   │  (資訊面板)    │
│              │   FhlMidBottomWindow    │  FhlInfo       │
│  - 設定      │                         │  - 工具分頁    │
│  - 版本選擇  │                         │                │
│  - 瀏覽歷史  │                         │                │
└──────────────┴─────────────────────────┴────────────────┘
```

### 2.1 Toolbar（工具列）

| 元件 | 功能 |
|------|------|
| Help | 說明文件 |
| WindowControl | 控制視窗顯示/隱藏（左、右面板） |
| BookSelect | 選擇書卷、章節、節 |
| SearchTool | 關鍵字/Strong Number 搜尋入口 |

### 2.2 Left Window（左側面板）

| 元件 | 功能 |
|------|------|
| Settings | 使用者設定（字型、顯示模式等） |
| VersionSelect | 聖經譯本選擇 |
| ViewHistory | 瀏覽章節歷史紀錄 |

### 2.3 Mid Window（中間主視窗）

| 元件 | 功能 |
|------|------|
| FhlLecture | 主要聖經經文顯示區 |
| FhlMidBottomWindow | 中間下方輔助視窗 |

### 2.4 Right Window — FhlInfo（資訊面板）

可以用滑鼠拖拉左側邊框來調整寬度，預設寬度 500px。

---

## 3. 核心功能模組

### 3.1 聖經經文顯示（FhlLecture）

#### 3.1.1 多譯本顯示

- 可同時選擇多個譯本對照閱讀
- 支援有 Strong Number 標記的譯本（和合本、KJV）
- 譯本名稱顯示於 `#lecMainTitle`，點擊可切換譯本

Strong Number 標記格式：
```
奉<1223>神<2316>旨意<2307> ...
其中 {<...>} 表示原文有但譯本未譯出的字詞
<...> 表示非動詞時態的 SN
(...) 表示動詞時態的 SN
```

#### 3.1.2 四種顯示模式（displayMode / show_mode）

| 模式 | 名稱 | 說明 |
|------|------|------|
| 1 | 不分段\_併排 | 逐節顯示，多譯本並排（同節同列） |
| 2 | 不分段\_交錯 | 逐節顯示，多譯本交錯（同節佔多列） |
| 3 | 分段\_併排 | 依段落（以新譯本為基準）分組，多譯本並排 |
| 4 | 分段\_交錯 | 依段落分組，多譯本交錯 |

預設：模式 3

#### 3.1.3 章節導覽

- 上一章（`.chapBack`）、下一章（`.chapNext`）按鈕
- 目錄跳頁（BookSelect）
- 上一次/下一次瀏覽紀錄（ViewHistory 按鈕）

#### 3.1.4 Strong Number 互動

- 滑鼠移過 SN：即時顯示 SN 對應字典資訊
- 滑鼠移過某 SN：同章節中相同 SN 標記為紅色
- 同源字標記為暗紅色（新約限定，sd_same.json）
- SN 統計（`ps.sn_stastic`）

#### 3.1.5 交互參照（Cross Reference）

點擊經文中的交互參照，根據 `ps.reference_method` 設定：
- `0`：每次詢問（對話框選擇方法 1 或方法 2）
- `1`：直接使用方法 1（對話框快速呈現）
- `2`：直接使用方法 2（跳至對應章節）

#### 3.1.6 URL 路由（Hash-based）

```
格式：#/bible/[bookIndex]/[chapter]/[verse]
範例：#/bible/1/3/16
```

- `location.hash` 是狀態的來源
- 章節切換使用 `history.pushState()` 記錄瀏覽器歷史
- 頁面載入時由 `hash_change_on_initial()` 讀取並初始化狀態
- 使用者點擊瀏覽器上一頁/下一頁會觸發 `hashchange` 事件

---

### 3.2 資訊面板分頁（FhlInfo / FhlInfoTitle）

右側面板頂端有分頁標籤，點擊切換顯示對應內容：

| 分頁 ID | 繁體名稱 | 說明 |
|---------|---------|------|
| `fhlInfoParsing` | 原文 | 原文 Parsing 分析表 |
| `fhlInfoComment` | 註釋 | 聖經章節註釋（預設分頁） |
| `fhlInfoPreach` | 講道 | 錄音/影片講道資料 |
| `fhlInfoTsk` | 串珠 | TSK 字詞交互參照 |
| `fhlInfoOb` | 典藏 | 聖經照片典藏 |
| `fhlInfoAudio` | 有聲 | 有聲聖經 MP3 |
| `fhlInfoMap` | 地圖 | 章節地點地圖（整合 OpenStreetMap/Leaflet） |
| `fhlSnBranch` | 樹狀圖 | SN 樹狀圖（**僅羅馬書顯示**） |
| `fhlAi` | AI | AI 功能 |

#### 3.2.1 原文 Parsing（fhlInfoParsing）

- 針對單節經文顯示原文形態分析
- 資料來源：後端 API（純文字格式）
- 程式關鍵字：`parsing`
- SN 按鈕可點擊顯示字典對話框（`DialogHtml`）
- 顯示格式：上方 (`parsing_render_top`) + 下方表格 (`parsing_render_bottom_table`)

#### 3.2.2 註釋（fhlInfoComment）

- 某段連續章節對應一份純文字註釋
- 資料來源：後端 API
- 包含「書卷背景」（`chap = 0`）功能
- 程式關鍵字：`comment`

#### 3.2.3 講道（fhlInfoPreach）

- 某段經文對應一段錄音/影片
- 資料包含：連結（URL）＋描述文字
- 資料來源：後端 API
- 程式關鍵字：`preach`

#### 3.2.4 串珠 TSK（fhlInfoTsk）

- 每節經文有對應的字詞交互參照（Treasury of Scripture Knowledge）
- 資料來源：後端 API（純文字）
- 顯示模式（`ps.tsk_show_mode`）：
  - `0`：英文原始格式
  - `1`：中文縮寫（預設）
  - `2`：中文全名
- 程式關鍵字：`tsk`、`renderTsk`

#### 3.2.5 典藏（fhlInfoOb）

- 聖經各譯本的照片掃描檔
- 資料來源：API 回傳圖片連結
- 程式關鍵字：`ob`

#### 3.2.6 有聲聖經（fhlInfoAudio）

- 朗讀聖經的 MP3 錄音
- 通常為每章一段，可能有多種譯本
- 資料來源：API 回傳 MP3 連結
- 程式關鍵字：`audio`

#### 3.2.7 地圖（fhlInfoMap）

- 章節中出現的地點在地圖上標記
- 整合 Leaflet.js + OpenStreetMap
- 點擊地點標記顯示地點資訊
- 經文中點擊地名可在地圖上定位（`sobj_pos` 事件）
- 程式關鍵字：`map`

#### 3.2.8 樹狀圖（fhlSnBranch）

- 以樹狀圖呈現 Strong Number 的關聯
- **僅羅馬書（bookIndex = 45）顯示此分頁**
- 其他書卷導覽時自動隱藏，並切換回上一個分頁
- 程式關鍵字：`SnBranchRender`

#### 3.2.9 AI 功能（fhlAi）

- AI 輔助研讀功能
- 可設定自動分析節數範圍：
  - `ps.ai_count_of_verse`：節數（預設 3）
  - `ps.ai_is_auto_count_of_verse`：`0`=固定節數、`1`=自動依段落、`2`=本章、`3`=章數

---

### 3.3 書卷章節選擇（BookSelect）

- 選擇 66 卷聖經中的任一書卷
- 選擇章節（1-based）
- 選擇節（verse，1-based）
- 顯示方式由 `ps.book_select_method` 控制：
  - `0`：依視窗大小動態調整（預設）
  - `1`：簡易模式

---

### 3.4 搜尋功能（SearchTool）

#### 3.4.1 關鍵字搜尋

- 輸入中文/英文關鍵字搜尋聖經經文
- 搜尋前置處理（`sephp.pre_search_keyword`）
- 顯示搜尋結果對話框（`Search_create_dialog_search_result`）

#### 3.4.2 Strong Number 搜尋（原文彙編）

- 輸入 SN 號碼（如 `G1223`、`H3068`）
- 顯示所有出現該 SN 的章節位置
- 搜尋前置處理（`sephp.pre_search_sn`）

#### 3.4.3 搜尋結果分組顯示

- `Search_DataForGroupUi`：搜尋結果資料分組
- `Search_UiOfGroupRender`：分組結果 UI 渲染

---

### 3.5 原文字典（SN Dictionary）

透過對話框（`DialogHtml`）顯示，支援兩種來源：

| 來源 | 說明 |
|------|------|
| CBOL（`SnDictOfCbol`） | Chinese Bible Online 字典，以 KJV 為主 |
| 浸宣（`SnDictOfTwcb`） | 浸信宣道出版社授權的原文字典 |

- 互動入口：點擊經文中的 SN 數字
- 也可在 Parsing 畫面中點擊 SN 按鈕觸發

---

### 3.6 設定（Settings）

所有設定存入 `localStorage`（key: `fhlPageState`），跨次造訪保留。

#### 3.6.1 字型大小

| 設定項 | CSS 變數 | 預設值 |
|--------|---------|-------|
| 一般字型 | `--fontsize` | 12pt |
| 希伯來文 | `--fontsize-hebrew` | 26pt |
| 希臘文 | `--fontsize-greek` | 26pt |
| Strong Number | `--fontsize-sn` | 14pt |

#### 3.6.2 其他設定項

| 設定項 | 說明 | 可選值 |
|--------|------|--------|
| 顯示模式 | 譯本排列方式 | 1/2/3/4 |
| 繁/簡體 | 介面與書卷名稱語言 | 0=繁體, 1=簡體 |
| SN 顯示 | Strong Number 顯示方式 | 0=原文, 1=SN號碼 |
| 即時顯示 | 滑鼠移過 SN 是否即時顯示字典 | 0=關, 1=開 |
| 交互參照方法 | 點擊交互參照的處理方式 | 0=詢問, 1=方法1, 2=方法2 |
| 切換經文方法 | BookSelect 顯示模式 | 0=依視窗, 1=簡易 |
| 註腳顯示方式 | 腳注的顯示觸發方式 | 0=點擊, 2=直接載入 |
| TSK 顯示模式 | 串珠書卷名稱語言 | 0=英文, 1=中文縮寫, 2=中文全名 |

---

### 3.7 瀏覽歷史（ViewHistory）

- 左側面板顯示已瀏覽過的章節清單（如「創1 創2 出1…」）
- 點擊可快速返回任一章節
- `ps.history` 存放歷史紀錄陣列
- 也可從 FhlLecture 的導覽按鈕前進/後退

---

### 3.8 視窗控制（WindowControl）

- 左側面板（`#fhlLeftWindow`）可顯示/隱藏，預設顯示
- 右側資訊面板（`#fhlInfo`）可顯示/隱藏，預設顯示
- 右側面板可拖動左邊框調整寬度（最小 300px，最大視窗寬度 90%）
- 視窗 resize 時自動重新計算版面（防抖 200ms，使用 lodash）
- 設定存入 `ps.isVisibleLeftWindow`、`ps.isVisibleInfoWindow`、`ps.cxInfoWindow`

---

## 4. 全域狀態（TPPageState）

所有功能共用一個 singleton 狀態物件，透過 `TPPageState.s`（別名：`ps`、`pageState`）存取。

### 4.1 核心定位屬性

| 屬性 | 說明 |
|------|------|
| `bookIndex` | 目前書卷 (1-based, 1=創世記, 66=啟示錄) |
| `engs` | 英文書卷縮寫（如 `"Gen"`） |
| `chineses` | 中文書卷縮寫（如 `"創"`） |
| `chap` | 目前章節 (1-based，0=書卷背景) |
| `sec` | 目前節 (1-based) |

### 4.2 滑鼠 Hover 狀態

| 屬性 | 說明 |
|------|------|
| `book_hover` / `chap_hover` / `sec_hover` | 滑鼠懸停的位置 |
| `xy_hover` | 滑鼠 X/Y 座標（即時資訊用） |
| `snAct` | 目前啟動中的 SN 號碼 |
| `snActTp` | SN 語言類型（`"G"`=希臘文, `"H"`=希伯來文） |

---

## 5. 資料來源

### 5.1 本地資料

| 檔案 | 說明 |
|------|------|
| `index/bible_fhlwh.json.gz` | 聖經本文索引（pako gzip 解壓縮） |
| `index/sd_cnt.json` | Strong Number 統計資料 |
| `index/sd_same.json` | Strong Number 同源字資料 |
| `app_versions.json` | 版本更新記錄 |

### 5.2 遠端 API

| 環境 | URL |
|------|-----|
| 本機 (`file://`) | `https://bible.fhl.net/json/` |
| 上線 | `/json/` (相對路徑) |

各功能的 API 呼叫由對應模組負責（`parsing`、`comment`、`tsk`、`ob`、`audio`、`map` 等）。

---

## 6. 版本管理

- 版本號儲存於 `index.html` 的 `currentSWVer` 變數（目前：`5.5.1`）
- 每次載入由 `AppVersion.js` 比對快取版本
- 若版本不符（`getCntThisVersion() == 1`）→ 強制 `location.reload(true)` 清除快取
- 版本更新時可顯示「更新提示」頁面（`frmUpdated.html`）

---

## 7. 聖經本文渲染流程

```
bible_fhlwh.json.gz（原始資料）
    ↓ load_json_gz_Async()
Bible_fhlwh_json（記憶體快取）
    ↓ twcbflow.es2023.js / cbolflow.es2023.js（解析）
DText[]（中間資料格式，每個 token：{w, tp, isRef, sn, ...}）
    ↓ cvtDTextsToHtml.es2023.js（渲染）
HTML（注入至 #lecMain）
```

段落資料由 `ParagraphData.es2023.js` 提供（模式 3/4 使用）。

---

## 8. 相依套件

### 8.1 CDN 套件

| 套件 | 版本 | 用途 |
|------|------|------|
| jQuery | 3.6.0 | DOM 操作、事件處理 |
| jQuery UI | 1.12.1 | 對話框、可調整大小元件 |
| Bootstrap | 4.5.0 | 版面、按鈕樣式 |
| Bootstrap Icons | 1.5.0 | 圖示 |
| LINQ.js | 3.2.3 | 資料查詢語法 |
| Lodash | 4.15.0 | 防抖（debounce）等工具 |
| pako | 2.1.0 | gzip 解壓縮（bible_fhlwh.json.gz） |
| Leaflet | 1.3.4 | 地圖顯示 |
| markdown-it | 14.1.0 | Markdown 渲染 |
| React | 0.13.1 | 舊版搜尋 UI（歷史遺留） |

### 8.2 本地套件

| 路徑 | 說明 |
|------|------|
| `libs/ijnjs/ijnjs.js` | 核心工具（路徑處理、非同步載入、快取） |
| `libs/ijnjs-fhl/ijnjs-fhl.js` | FHL 擴充（聖經常數、對話框） |
| `libs/ijnjs-ui/ijnjs-ui.js` | UI 元件擴充 |
| `FHL.linq.js` | LINQ 擴充 |
| `FHL.tools.js` | 通用工具函式 |

---

## 9. 模組職責對照表

| 模組 | 職責 |
|------|------|
| `TPPageState` | 全域狀態 singleton |
| `FhlToolBar` | 工具列初始化 |
| `FhlLeftWindow` | 左側面板初始化 |
| `FhlMidWindow` | 中間主視窗初始化 |
| `FhlLecture` | 聖經經文顯示、事件處理 |
| `FhlInfo` | 右側資訊面板容器 |
| `FhlInfoTitle` | 右側分頁標籤列 |
| `FhlInfoContent` | 右側分頁內容區 |
| `BookSelect` | 書卷章節選擇器 |
| `ViewHistory` | 瀏覽歷史 |
| `VersionSelect` | 譯本選擇 |
| `Settings` | 使用者設定 |
| `SearchTool` | 搜尋功能 |
| `BibleConstant` | 書卷/章節常數（66卷資料） |
| `BibleConstantHelper` | 位址運算（上/下章節計算） |
| `twcbflow` | 聖經本文解析（繁體和合本流程） |
| `cbolflow` | CBOL 本文解析流程 |
| `cvtDTextsToHtml` | DText[] → HTML 渲染 |
| `renderTsk` | 串珠渲染 |
| `do_preach` | 講道渲染 |
| `SnBranchRender` | SN 樹狀圖渲染 |
| `DialogHtml` | jQuery UI 對話框基礎類別 |
| `SN_Act_Color` | SN 懸停顏色標記 |
| `ParsingPopUp` | 原文解析彈出視窗 |
| `Hash_Changed` | 管理 hash 變更（避免迴圈觸發） |
