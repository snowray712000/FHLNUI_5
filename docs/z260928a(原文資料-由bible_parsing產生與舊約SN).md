# 原文資料改由 bible_parsing.zip 產生、舊約每字嵌 SN（6.10.5）

## 起因

TODOs 裡兩個彼前4:13 的 bug：

1. **原文 Parsing，SN 2526 的備註**顯示成 `καθό!>= καθ᾽ ὅ!>`。
   - qp.php 的 remark 是 `<!καθό!>= <! καθ᾽ ὅ!>`。`<!…!>` 是信望愛標「這段是原文」的記號，資料庫裡包的是希臘文內碼（`<!kaqov!>`），qp.php 轉成 Unicode 但沒拿掉記號。
   - 直接放進 html，`<!…>` 被瀏覽器當成註解吃掉。
   - 修正：`parsing_render_bottom_table.es2023.js` 在轉 html 前先 `replace(/<!\s*(.*?)\s*!>/g, ' $1 ')`。
2. **複製新約原文，該有的空白沒空白**：3.5.1 已修好。但查的時候發現本機 `index/bible_fhlwh.json.gz`（新約原文嵌 SN，2025-04 手動產生）與 API 經文有 180 節不同：
   - 缺標點（彼前4:13 `παθήμασιν` 後的逗號）
   - 送氣符號加抑揚符不見（彼前2:25 `ἦτε` → `ὴτε`、`ἶ` → `ὶ`）
   - 路1:46/47 錯位，還有 `<WG5547 >`、`<αχρισ>` 這類殘缺標記
   - 推測當時是由逐字 parsing 拼出，逐字資料的錯字與缺標點都帶進來了。

## 資料來源：bible_parsing.zip

信望愛公開 <https://ftp.fhl.net/FHL/COBS/data/bible_parsing.zip>（約 40MB，解開是 sqlite）。iOS 版的離線 parsing 也是用它，研究筆記見 iOS 專案 `FHLBible/doc/260927a_離線parsing資料庫_bible_parsing.md`。重點：

- 表 `fhlwhparsing`（新約 7959 節）、`lparsing`（舊約 23145 節）、`version(dt)`。
- `wid=0` 是整節原文（含 `\n` 分行；新約有 `+ 韋 + 聯 +` 異文），`wid>=1` 是逐字，`sn` 五碼（`02526`、`0031a`；新約的 `+` 為 `00000`）。
- `word` / `orig` 是信望愛內碼，`uword` / `uorig` 是 Unicode。
  - 新約 `uword` = `gcode_2(word)`，可直接用。
  - 舊約逐字的 `uword` = `umscode(word)`；但 **wid=0 多行時 `uword` 行序顛倒**：`umscode` 會把整串反轉（內碼是視覺順序），整節一次轉，行也反了（創1:1 第一個字跑到最後）。qsb.php 的 bhs 也一樣，以前讀經時要 `reverse()` 行。
- 新約 `sn` 是信望愛現行編號（和合本、qp.php 也是），`osn` 是舊式編號（例 οἶδα 舊 1492、新 3608a / 3708）。

### 三方比對（新約）

| 比對 | 結果 |
|---|---|
| qsb.php (fhlwh) vs `bible_fhlwh.zip` | 忽略空白全同（15 節只差換行位置），即網站「新約原文」的文字 |
| qsb.php vs parsing wid=0 | 132 節不同，多半 parsing 較正確：太10:3 API `Θμᾶς`、太26:57 `καϊάφαν`、太16:2 括號不成對 `+((ὀψίας`；parsing 另有 WH 括號段落（太6:1 `(δὲ)`、太21:44 整節括號） |

決定：**文字以 parsing wid=0 為準**，SN 與它同一份資料，對齊最穩。

舊約：parsing wid=0 的內碼與 se.php 的 bhs 內碼 23143 節完全相同；se.php 缺 出16:36、代上22:19。

## 產生器：tools/gen_bible_orig.mjs（npm run gen:orig）

- 下載 zip（HEAD 比 Last-Modified，沒變就用 `tools/.cache/` 的快取，不進 git），自己解 zip（`zlib.inflateRawSync`），用 Node 內建 `node:sqlite` 讀，不加套件。
- 輸出 3 個檔：

| 檔案 | 內容 | 用途 |
|---|---|---|
| `index/bible_fhlwh.json.gz` | 新約 `ἀλλὰ<WG235> καθὸ<WG2526> …` | 讀經「新約原文」 |
| `index/bible_bhs.json.gz` | 舊約 `בְּרֵאשִׁית<WH7225> בָּרָא<WH1254> …`（約 1.4MB） | 讀經「舊約馬索拉原文」 |
| `index/bible_bhs_code.json.gz` | 舊約整節內碼（不含 SN） | 舊約希伯來文搜尋（取代打 se.php 的 `gen:bhs`） |

- 每個檔都有 `ver`（資料庫 `version.dt`）與 `src`（zip 網址、Last-Modified）。
- 文字：新約用 wid=0 的 `uword`；舊約用 wid=0 的 `word` **逐行** `umscode`。
- 對齊（`attach_sn`）：整節以空白切段，逐字依序對上去，比較時用 `key()`（去重音、氣號、母音點、大小寫，只留字母與 `+`），所以：
  - `(κατα)καίεται` 對得到逐字 `κατακαίεται`
  - 一段可含多個字：`+(ὀψίας)`、maqaf 連起來的 `אֶת־הָרָקִיעַ`
  - 對不上時：下一個對得上就當錯字（例 逐字 `Θμᾶς` / 整節 `Θωμᾶς`）；逐字多一個就略過
  - SN 只接在字母（與其附加符號、省略號 ᾽）後面
- 結果：新約 14.4 萬字全對上（`+` 4673 個不加），報告 7 筆；舊約 30.8 萬字，報告 6 筆（上游逐字重複：王下5:18 `הַזֶּה`、斯9:19 `פ`、尼7:68）。報告在 `tools/.cache/gen_bible_orig_report.txt`。

## App 端

- `lecture_get_data_async_es2023.js`：`fhlwh`、`bhs` 都走 `get_orig_async`，讀本機檔（`Bible_fhlwh_json`、新的 `Bible_bhs_json`），不打 qsb.php；拿掉 bhs 的行序 `reverse()`。
- SN 的 active（滑鼠移過去同 SN 標紅、與和合本連動）本來就支援 `<WH…>`（`attach_sn_text`），舊約有資料後就能用。例 創1 滑到 אֱלֹהִים：32 處希伯來文與和合本 93 處一起標出。
- SN ≥ 9000（例 לָכֶם 9001、段落記號 ס פ 9014 / 9015）照既有規則不綁 sn-text。

## 檢查是否過期：tools/check_data.mjs（npm run check:data）

只對 zip 送 HEAD，與 3 個檔的 `src.lastModified` 比；過期時 exit code 1。更新流程見 `docs/z260925b(dev、build與上傳注意事項).md`「資料檔更新」。

## 已知、未處理

- 徒13:33：上游整節 `+ αὐτῶν + (αὐτῶν)+`、逐字 `+ ἡμῶν + αὐτῶν … +` 不一致；原文分頁 (qp.php) 開這節 console 會報 `record 與 word 以空白隔開數量不同`。
- iOS 離線 parsing 的新約 remark 會顯示 `<!kaqov!>` 這種內碼；舊約 wid=0 標題列應也有行序顛倒。
- 可以回報信望愛：qsb.php 新約的錯字與不成對括號、bhs 缺 出16:36、代上22:19、qp.php remark 殘留 `<!…!>`。
