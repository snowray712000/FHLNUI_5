# 註釋功能_維護索引

> 目的：讓工程師與 AI 能從零理解「註釋解析/渲染」的設計脈絡、資料規格、關鍵決策與目前狀態。  
> 更新日期：2026-02-20

---

## 1. 必要保留（核心）
這些文件對維護與理解系統「必不可少」，請長期保留。

1. **設計總覽（架構/動機/方法）**
   - `docs/z260215a_PGM說明註釋資料.md`  
     - **用途**：完整交代 parseComment 管線（前處理→tokenize→table block→buildTree→normalize）。  
     - **價值**：新工程師快速理解「為什麼這樣設計」。

2. **Inline 解析設計（交互參照 / SN 偵測）**
   - `docs/z260219b_PGM說明2.md`  
     - **用途**：inline 解析應在 normalizeTree 後統一處理，並保持主輸出中立。  
     - **價值**：避免渲染層各自偵測造成不一致。

3. **DText 設計與示例**
   - `docs/z260219c_DText為了註釋規畫.md`  
     - **用途**：DText 結構與 children/childrenlist/joTable 的規格示意。  
     - **價值**：後續擴充/除錯的結構依據。

4. **Parsing Rules（最新版）**
   - `docs/parsing_rules5_updated.md`  
     - **用途**：最新版規則（含羅馬數字、對話標籤、表格處理）。  
     - **價值**：規則是 parser 行為的「規格」文件。

---

## 2. 建議保留（重要參考）
這些文件不一定每天用，但對理解資料特性與回溯決策有幫助。

1. **實際案例集合**
   - `docs/0216a_table1_cases.md`  
   - `docs/0216c_cases.md`  
   - **用途**：提供真實樣本，方便回歸測試與規則修正。

2. **歷史規則演進**
   - `docs/parsing_rules1.md`  
   - `docs/parsing_rules2.md`  
   - `docs/parsing_rules3.md`  
   - `docs/parsing_rules4.md`  
   - **用途**：回溯為何規則改動，避免重複踩坑。

---

## 3. 可封存（Archive）
這些文件描述過程或早期討論，可移到 `docs/_archive/`。

- `docs/0212b.md`  
- `docs/0212c.md`  
- `docs/0212d.md`  
- `docs/0212e.md`  
- `docs/z260213a.md`  
- `docs/z260205a(沒報告_睡過頭).md`

---

## 4. 可刪除候選（若空內容或過時）
- `docs/0216b_table2_cases.md`（目前是空檔）

---

## 5. 推薦閱讀順序（新手 / AI）
1. `z260215a_PGM說明註釋資料.md`（總覽）
2. `parsing_rules5_updated.md`（規則）
3. `z260219b_PGM說明2.md`（inline 解析）
4. `z260219c_DText為了註釋規畫.md`（輸出結構）
5. `0216a_table1_cases.md` / `0216c_cases.md`（案例）

---

## 6. 目前系統要點（快速摘要）
- **parseComment** 是主管線：  
  `preprocessCaseToLines → tokenizeLine → detectTableBlocks → buildTree → normalizeTree`
- **輸出主體**：DocNode（保留 `w`），渲染或互動需求則用 `inline: DText[]`
- **表格**：建議以標準化 JSON table 處理（可解析 cell 文字以偵測 ref/sn）
- **DText**：children 用於 inline；list 結構請放在 `childrenlist`

---

## 7. 待補（建議未來補齊）
- **單元測試索引**：列出 tests/ 的關鍵測試檔與案例對應  
- **資料規格版本化**：DText/DocNode/joTable 的 version 標記  
- **渲染端約定**：inline fallback w 的規則說明

---


# 待加入資訊

- 決策:
  - table 在 parseComment 中，以取代方式處理
    - 因為我發現 table 不多。
    - 以 json 而非 .md 作中繼
      - 因為 .json 才能表達 合併儲存格
  - 解析 SN 與 Ref 的時機
    - parseComment 要處理的問題是「ol ul li 這些結構」，不要同時作這樣的事。
    - 所以應該在 parseComment 完成這事。
    - 並且，最終能與其它地方，能「一致」以 DText 方式，然後接著繪圖。
    - 所以 parseComment 的輸出，可以輸出成別的，只是目前應用，輸出成 DText 。
- TDD
  - 1 使用 AI 產生 parseComment 中的每個步驟，並對應的 unit test。
  - 2 寫一個 test 是 for parseComment 的畫面可以看，但 input 是寫死的。
  - 3 寫一個 test 是從 api 取得真正資料，並且用 ai 產生 render 的結果
  - 4 寫一個 test 是用 hard code 畫出 dtext 的結果 (但還沒有轉換)
    - 成功後，再寫成 api 取得，並用 ai 產生程式，是 parseComment 的結果，轉換到 DText 的過程