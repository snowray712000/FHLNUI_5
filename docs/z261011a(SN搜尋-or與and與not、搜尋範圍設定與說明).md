# 7.5.10.3：SN 搜尋可組合 (or / and / not / 範圍)、搜尋範圍設定 ⚙、搜尋說明 ?

起因：讀雅 5:7-11，「忍耐」其實是 G3114、G3115、G5278、G5281 四個原文字 (和合本 `能忍耐` 是 3115，不是 3114)。SN 搜尋一次只能一個，要能 or。

## 1. SN 組合查詢 (`index/snQuery.es2023.js`，純函式，`tests/snQuery.test.js`)

| 想要 | 寫法 |
|---|---|
| or | `or` `OR` `,` `;` `\|` 與全形 `，；｜、` |
| and | 空白、`and`、`&` (`＆`) |
| not | `not` `NOT` `!` (`！`)，放在要排除的 SN 前 |
| 範圍 | `G3114-G3120` (`-` `–` `—` `~` 皆可)，每個都 or |

- 優先順序：not、範圍 > and > or。`G1 G2 or G3 not G4` = (G1 且 G2) 或 (G3 且非 G4)。結構是 `SnGroup[]` (外層 or) → `SnItem[]` (內層 and，`not` 旗標) → `terms` (範圍展開，item 內 or)。
- `parseSnQuery` 回 `null` = 不是 SN 查詢 (任何一項不是 SN、`G0`、`G1 not` 結尾、`G9-G3`、`G1-H3`) → 當關鍵字。`SearchSession.determineKind` 靠它判斷。單一 SN 行為不變。
- **se.php 沒有 or、而且「空白」未必是 and**：每個 SN 各查一次 (`searchSnAsync`)，在本機做交集 / 聯集 / 差集 (`combineSnResults`)。同時最多 3 個請求 (怕像 rt.php 被 503，見 z261010b)，不同 SN 去重。
- 上限 `SearchSession.MAX_SN_TERMS = 60` (範圍也一個一個算；`MAX_RANGE = 200` 展開時截斷，超過總數上限就報錯，不會真的展開 99999 個)。
- 只有 not 的一組 (`not G3115`、`G1 or not G2`) 丟錯誤 (`assertSnQuery`)，在發出任何請求之前。
- 沒寫 G/H 的號碼，依目前閱讀的是舊約或新約；同一個數字的 G、H 分開查。
- 標示 (`.seKey`)：`session.sns` = 所有「非 not」的 SN，`markSearchKeys` 吃 `{sns}`。
- 同源字視窗 (`FhlLecture` 的 `show_dialog`) 標題旁加「搜尋全部」(`.fn-search-same`)：把自己 + 同源字組成 `G… or G…` 填進搜尋框並搜尋。**同源字是字根家族，範圍很寬** (G3115 的家族有 26 個 SN，連「慾望」「怒」都在)，所以只是起點，使用者可以在搜尋框刪。目前只有新約有同源字資料。

## 2. SN 顯示關閉時，搜尋結果只顯示搜尋的 SN (`SnFilter.apply` 的 `offShowsAll`)

搜 SN 時 `strong` 被強制成 1 (結果要有 SN)。原本 `offShowsAll` 在 SN 關閉時 = 全部顯示 (淡灰色)；但搜尋結果複製成文字時沒有顏色，淡灰的 SN 一下子變全黑，很干擾。現在新增 `'keys'` 模式：SN 關閉 → 只留 `.seKey` (搜尋的 SN)，其它 `sn-hidden` (`innerText` 不含隱藏的，所以複製時乾淨)；篩選開 = 篩選的 + 搜尋的 (沒變)；全部開 = 全部 (沒變)。

注意順序：`VerseGrid.renderVerseLec` 逐節 apply 時 `.seKey` 還沒標，之後 `SearchDialog` 在 `markSearchKeys` 後再 apply 一次才正確。

## 3. 搜尋範圍設定 ⚙ (`SearchScope.es2023.js`、`SearchScopeDialog.es2023.js`、`tests/searchScope.test.js`)

- 什麼都沒勾 = 只搜尋目前閱讀的書卷；勾了分類 (`fhl.g_book_group`，不含整卷聖經) 就也搜尋那些。
- 大分類勾了，小分類視同勾選 (UI 顯示打勾、不能改、標「含於 新約」)。「包含」用書卷比對算 (`scopeTree`：上一層 = 包含它的最小分類)，不是寫死：路加著作 ⊂ 福音書 ⊂ 新約；約翰著作含啟示錄，不在福音書，在新約。
- 「全部勾選 / 全部不勾」同一顆。**預設全勾** (= 整本聖經，與有這個設定之前一樣)。localStorage `fhlSearchScope` (自己勾的分類名陣列)。
- 篩選發生在本機：`SearchSession` 保留 `allVerses`，`verses` 是範圍內的 (`setScope` 重算，不重新搜尋)。se.php 找位置那一步沒變快；qsb 取經文是一批一批、只取範圍內的節，所以量少很多。之後可考慮把範圍也用在 API 請求上 (SN 的 `RANGE` 可分新舊約；關鍵字要確認 se.php 有沒有書卷參數)。
- ⚙ 在頂端搜尋框與搜尋視窗各一顆，放在 `?` 旁邊；改設定後 `SearchDialog.applyScopeChange()` 直接重新篩選目前結果。經 callback 傳入，避免 `SearchDialog` ↔ `SearchScopeDialog` 循環 import。
- 搜尋視窗顯示「範圍：雅＋保羅書信」(`scopeLabel`) 與「範圍外還有 N 節，全部顯示」(這次搜尋改成整本聖經，設定不變)。⚙ 的 title 在滑鼠移上去時才算 (換書卷會變)。
- 結果一出來先選哪裡 (`SearchDialog.#suggestFilter`)：
  - 範圍只有目前這卷：選這卷，**分類按鈕一顆都不列**，不論幾節 (否則「整卷聖經」被選取卻只有一卷，怪)。
  - 範圍有勾別的分類：原規則 (這卷 ≥ 10 選這卷；否則由小到大選第一個夠多的分類；都不夠 = 範圍內全部)，候選分類限定在範圍內 (`scopeGroups`)；分類按鈕只列範圍內的，「整卷聖經」改叫「範圍內全部」。
  - `Search_suggestFilter` 補一條：沒有分類包含這卷時，這卷夠多就選這卷 (原本直接回全部)；補了 `tests/searchSuggestFilter.test.js`。
- 狀態列「N 節」是範圍內的總數，不是目前選取那顆的數量 (原本就這樣)。

## 4. 搜尋說明 `?` (`docs/搜尋說明.md`)

`IntroHelp` 新增 `'search'` 類型，頂端搜尋框與搜尋視窗各一顆；內容：能打什麼、什麼時候用 (雅 5:7-11 的忍耐)、SN 組合表、搜尋範圍、其它。表格裡的 `|` 要寫 `\|`。檔案已加進 `vite.config.js` 的 `LEGACY_COPY`。

## 5. 小坑

- `?` ⚙ 在 flex 容器 (搜尋框) 裡被擠成 17.2 × 18 (不是正圓)：`.intro-help` / `.search-scope-btn` 加 `flex: none`；頂端搜尋框內改 22px (空間夠)，搜尋視窗內維持 18px。
- macOS 的 `sed -i` 需要 `-i ''`，用 `&&` 串起來時前面失敗後面全沒跑，改用 python 取代並檢查有取代到。
- 用 `#/bible/雅5/10` 之類的 hash 會被解析成別處，測試用 `#/bible/雅5:10`。
- 同源字視窗要點 `.sn`：先 click 那節的 `.lec` 讓它 selected，再 click `.sn` (即時模式 `ps.realTimePopUp` 要另外看)。

## 6. 沒測的

簡體模式、觸控 (⚙ 視窗與 `?` 視窗)、窄螢幕 (搜尋框收成 🔍 時按 `?` ⚙，焦點離開會收起搜尋框)、舊約 H 的多 SN 搜尋、SN 篩選開著時的 `keys` 模式 (只讀程式，沒實際點)。
