# 譯本名稱：uiabv 快照、譯本選擇對話框只管分類

日期：2026-10-01（發版 7.0.4）

起因：app_versions.json TODO「初次載入時，譯本名稱 (經文上方表頭) 有時是空白」。

程式：`static/search_api/abvphp_api.js`、`static/search_api/abvphp_snapshot.js`（產生的）、`tools/gen_uiabv.mjs`、`index/lecture_get_data_async_es2023.js`、`index/FhlLeftWindow.es2023.js`、`libs/ijnjs-ui/BibleVersionDialog/BibleVersionDialog.js`。

---

## 一、原因：兩個非同步請求賽跑

- 表頭名稱是 `FhlLecture` 的 `render_titles` 用 `o.v_name` 畫的。
  - 新約原文、舊約馬索拉原文、七十士：名稱寫死在 `lecture_get_data_async`，不會空白
  - 其它譯本：**qsb.php 不回傳譯本名稱**，所以用 `abvphp.get_cname_from_book(version, isgb)` 查
- `abvphp` 的字典要等 `$(ready)` 時發出的 `uiabv.php?gb=0`、`gb=1` 回來才有資料，沒人等它
- qsb.php 比 uiabv.php 先回來 → 字典是 `{}` → `get_cname_from_book` 回 `""` → 表頭空白；之後 uiabv.php 回來也不會重畫表頭，要換章才恢復。「有時」= 看誰先回來
- 只有左側（`FhlLeftWindow`，`testThenDoAsync(isReadyGlobalBibleVersions)`）有等；`LecCopyTable`、`SearchDialog` 查不到時退回譯本代碼 (`|| v`)，所以不會空白

重現方法：在 `init_g_bibleversions` 裡把 `uiabv.php?gb=0` 延後 3 秒再打（`setTimeout` 包一層），重新整理。

## 二、做法：寫死快照 + 背景更新（使用者 2026-10-01 決定）

考慮過的：

| 做法 | 結果 |
|---|---|
| 經文等 uiabv.php（最多 5 秒） | 第一版這樣做；但每次開頁都要等它 |
| localStorage 快取 | 第一次還是要等；要處理版本作廢、try/catch、快取與快照誰為準。有快照後只多「FHL 新加的譯本，第二次開頁就有名稱」這點好處，不值得 |
| **寫死快照 + 背景更新** | 採用。連第一次都不用等 |

- `npm run gen:uiabv`（`tools/gen_uiabv.mjs`）→ `static/search_api/abvphp_snapshot.js`，classic script，`var abvphpSnapshot = { generated, rows }`
  - row = `[book, 繁體名, 簡體名, ntonly, otonly, strong]`，91 個譯本約 6KB（uiabv.php 一支回應約 14KB）
- `index.html` 裡放在 `abvphp_api.js` 前面；build 時照順序併進 legacy bundle
- `abvphp_api.js` 一載入就用快照填 `g_bibleversions` / `g_bibleversionsGb`，所以 `isReadyGlobalBibleVersions()` 一開始就是 true
- `uiabv.php` 照樣打，回來後整個覆蓋字典（以伺服器為準，快照之後被拿掉的譯本也會消失）
- `init_g_bibleversions()` 回傳 Promise（兩支都結束才 resolve，失敗也 resolve）；重複呼叫回同一個
- `abvphp.readyAsync(books, isgb, timeoutMs = 5000)`：`books` 都查得到名稱就馬上 resolve；有查不到的（快照之後 FHL 新加的譯本）才等 uiabv.php，最多 5 秒
- 經文 `get_from_qsb_php_async`：`Promise.all([qsb(...), abvphp.readyAsync([version], isgb)])`；還是查不到 → 譯本代碼，`unv` 例外顯示「FHL和合本」

## 三、譯本選擇對話框：分類與名稱分開

`BibleVersionDialog.js` 的 `constants.langs` 原本寫死每個譯本的 `cna`，`setVersionsFromApi` 拿到 API 清單後：認得的換成 API 名稱，不認得的放到「其它」。比對（2026-10-01）發現寫死的名稱已有 5 個過時（`unv` 和合本 → FHL和合本、`ttvh`、`tte`、`ind1958`、`sed`），`gnt6` (UBS6) 落在「其它」。

- **名稱只有一份**：從 abvphp（快照 / uiabv.php）拿。`langs` 只留分類：語言分組、`yr`、`cds`（宗派、文白、年代）、`od`
  - `renderItems` 時 `a2.cna = abvphp.get_cname_from_book(a2.na, false) || a2.cna || a2.na`
  - 只有 uiabv.php 沒列的譯本才寫 `cna`：目前只有 `cwwuchsb`（吳經熊新經全集聖詠譯義，qsb.php 還取得到經文）
- `FhlLeftWindow`：先用快照呼叫 `setVersionsFromApi`，`init_g_bibleversions()` 回來再呼叫一次（FHL 改名、新加譯本）
- 分類修正：`gnt6` 放「希伯來、希臘」(od 7)；`cwwuchsb` 由 `pr` 改 `cc`（吳經熊是天主教徒）
- `prebklhl`（馬雅各漢羅）本來就註解掉了（漢羅轉換有差異），沒動
- `gen:uiabv` 跑完會列出：
  - uiabv.php 有、`langs` 沒分類的 → 請補到 `langs`，否則落到「其它」
  - `langs` 有、uiabv.php 沒列的 → 名稱用 `langs` 的 `cna`
  - （跳過註解掉的行）

## 四、什麼時候重跑 `npm run gen:uiabv`

- 看到「其它」裡多了譯本、或譯本名稱改了，就重跑，照它的輸出補 `langs`，然後發版
- 不重跑也不會壞：背景的 uiabv.php 會更新名稱；只是新譯本第一次顯示時，經文要等 uiabv.php

## 五、沒做的

- 開頁後切換繁簡，對話框的名稱不會跟著換（要重新整理）；改之前就這樣
- `cogorw` 在 `langs` 裡重複兩次，沒動
