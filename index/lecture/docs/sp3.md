
## ❓ 引導問題集(與簡答)

- 聖經目錄 相關程式在哪裡？
  - index\BookSelect.es2023.js
  - keywords: `Ijnjs.BookChapDialog.s`
  - 詳細：[聖經目錄.md](聖經目錄.md)
- 取得經文資料 相關程式在哪裡？
  - index\lecture_get_data_async_es2023.js
  - keywords: `lecture_get_data_async`
  - 詳細：[取得經文資料.md](取得經文資料.md)
- 譯本選擇 相關程式在哪裡？
  - index\FhlLeftWindow.es2023.js
  - keywords: `Ijnjs.BibieVersionDialog.s`
  - 詳細：[譯本選擇.md](譯本選擇.md)
- 資料render流程, 從 api 取得資料後, 整理, 最終型成 jquery<htmlelement> 的流程在哪裡？
  - index\FhlLecture.es2023.js
  - keywords: `$htmlContent = await FhlLecture_render_core(rspArr, mode);`
  - 詳細：[資料 render 流程.md](資料%20render%20流程.md)
- 注腳資料 ... 在流程中是如何處理的？
  - index\DText.js index\DFoot.js
  - tests\foots_query_test.js
  - 每個譯本的注腳都不太一樣的格式
  - keywords: foot_note_show_method queryFootsAsync
- 併入上節處理 ... 目前還沒處理，所以沒出現合併儲存格
  - 經文中出現 a 表示這個譯本這一節與上一節合在一起
  - 了解一下專案原本是怎麼處理的
  - keywords:
    - is_merge_with_prev_verse (index\lecture\FhlLecture_render_core.js)
  - 詳細：[併入上節處理.md](併入上節處理.md)
- Paragraph 的概念是什麼？
  - index\lecture\FhlLecture_render_core.js
    - keywords: get_paragraphs grouping_by_paragraph_for_dtexts_with_addr
  - render mode 有「分段落」與「不分段落」兩種 ... 不分段落，就是每一節視為一段落即可, 關鍵字在 gen_fake_groups_for_mode1

---

## ✅ 回答集

### 聖經目錄

參照 [聖經目錄.md](聖經目錄.md)

### 取得經文資料

參照 [取得經文資料.md](取得經文資料.md)

### 譯本選擇

參照 [譯本選擇.md](譯本選擇.md)

### 資料 render 流程

參照 [資料 render 流程.md](資料%20render%20流程.md)

### 注腳資料

參照 [注腳.md](注腳.md)

### 併入上節處理

參照 [併入上節處理.md](併入上節處理.md)
