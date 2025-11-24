## continue_search

### ❓ Lq_ret_group 是什麼

`var Lq_r4s = sephp.Lq_ret_group.skip(sephp.cnt_search).take(sephp.cnt_set); //只搜0~29筆. `

#### 🔍 研究
- 被初始化
  - 有 2 處，一個是 「搜尋後」，按下分類「新約(301)」這個按鈕，一個是開啟一個「新搜尋」
- 呼叫堆疊
  - sephp.Lq_ret_group = Enumerable.from(jret2) // 於 `sephp.create_dialog_presearch(jrets)` 中
  - 承上，包裝在 `sephp.search(keyword, issn, isgb, ps.version, ps.engs, isAll)` 中
  - 承上，於 `doSearch($('.searchBox').val(), ps)` 中被呼叫
- 參數研究
  - jret2 這個參數，是從 函數的 input jrets 經過一些過濾得到
  - jrets 來源則是 2 個，一個是搜尋 sn，一個是關鍵字搜尋
    - `var jrets = sephp.pre_search_keyword(keyword, verions, sephp.isgb);`
    - `var jrets = sephp.pre_search_sn(keyword, isgb, 'unv');`
  - 以 keyword 為例，來了解 jrets 資料結構
  - 真正的 搜尋api se.php 只能一次搜尋一個譯本，所以真正產生 jrets 的是 pre_search_keyword_core
    - `var jret = sephp.pre_search_keyword_core(keyword, str, isGB)`;
  - 而， pre_search_keyword 只是把 每一個 return 型成 array 形式。 
  - 要了解 jrets 要了解 pre_search_keyword_core
- pre_search_keyword_core 研究  
    - se.php 有幾個特色，了解這特色有助於看懂程式碼
      - 搜尋上限 500 筆，所以要用這個把所有搜尋一次
      - 搜尋只能一次一個 譯本，所以要多個 api 整合
      - 能夠加入 index_only=1 參數，不要把內容帶回來，單純統計 
    - se.php 官方回傳結構
      - {record_count, record}
      - 其中每個 record {id, chineses, engs, chap, sec, bible_text}
      - id 經文絕對節
    - 加入 ver, ibook 
      - 從 api 取得後，會將 ver ibook 加入到每個 record 中
      - ibook 是 用 engs 來取得的，並且是 0based
    - 遞迴搜尋
      - 原函數裡是遞迴搜尋，因為 500 的限制
    - 不論是 sn搜尋 還是 關鍵字搜尋 都是同樣呼叫這個
      - 但參數 jrets 使用 pre_search_keyword 產生，是什麼呢？
        - 核心是 se.php 搜尋，但是卻是 index_only=1
- ✅ 小結
  - jrets 是 [{record, record_count},{record, record_count}, ...]
  - 每個 record 是 {engs, chineses, ibook, chap, sec, ver} ... 其中是用 engs 來取得 ibook

### 搜尋_分類結果

- 群組名稱 說明(如下)
  - 定義於 fhl.g_book_group
  - key 為 繁體中文, value 是 0based book index
- .presearch_div_button
  - 可點擊，因為搜尋有結果。
- .presearch_div_exist
  - 有結果，否則沒有這個 class
- .invisible
  - 一開始所有「卷」是隱藏，全部都產生
- .selected
  - 當前選擇的群組，會有這個 class
- div#pre_search 不會被刪除，每次都是 **div#div_groups 重新產生**。

#### 架構
```html
<div id="pre_search">
  <div id="div_groups">
    <!-- 群組名稱 -->
    <div class="group_name presearch_div_button presearch_div_exist selected" group_name="整卷聖經">整卷聖經(74)</div>
    <div class="div_books">
      <!-- 書卷 -->
      <div class="invisible book" book_name="創">創</div>
      <div class="invisible book presearch_div_button presearch_div_exist" book_name="出">出(6)</div>
      <div class="invisible book presearch_div_button presearch_div_exist" book_name="利">利(1)</div>
      <!-- 其他書卷省略 -->
    </div>
    <!-- 其他群組省略 -->
  </div>
  <textarea id="sephp_copy_id" style="position: fixed; z-index: -10000; opacity: 0;"></textarea>
</div>
```

#### 搜尋結果

```js
/**
 * @typedef {Object} OneSeRecord
 * @property {number} chap
 * @property {number} sec
 * @property {number} ibook 3
 * @property {string} engs Num
 * @property {string} chineses 民
 * @property {string} ver lcc
 * @property {string} bible_text
 **/
/**  
 * @typedef {Object} OneVerResult
 * @property {string} key
 * @property {OneSeRecord[]} record
 * @property {number} record_count
 */
```

#### 規畫_DataForUi

- 從 Ui 來看，有所有 Record 陣列
- 先統計 {book: cnt} 就可以完成上面的 group
- 而名稱可以用 fhl.g_book_group 來取得

```js
class DataForGroupUi {
  /** @type {OneSeRecord[]} 所有的紀錄，已經按照 ibook, chap, sec 排序 **/
  _record_ordered = []
  /** @type {Object.<number, number>} 例如 {0: 32, 1: 25} 表示創世記有32筆，出埃及記有25筆 **/
  _cnt_of_book = {}
  /**
   * 會使用 this._cnt_of_book 與 fhl.g_book_group 來計算
   * @return {Object.<string, number[]>} 例如 {"摩西五經": [0, 1, 2, 3, 4], "歷史書": [5, 6, 7, 8]}
   */
  calc_cnt_of_group(){}
```

#### 規畫_Ui

- 配合 Data 來作 Html 的 Render
- 以下是「假設已經完成 UiOfGroupRender」的使用情境

```js
const jrets = ... // se php 搜尋結果並整理
const dataForGroupUi = new DataForGroupUi(jrets)
const uiGroup = new UiOfGroupRender().main(dataForGroupUi)
$(sephp.node_pre_search).append(uiGroup);
```

#### UiOfGroupRender

```js
class UiOfGroupRender {
  main(data_of_ui){
    let div_groups = $('<div id="div_groups"></div>');

    const cnt_of_group = data_of_ui.calc_cnt_of_group(); // 只需算一次，較有效率
    for (const [group_name, cnt] of Object.entries(cnt_of_group)) {
      let div_group = this._gen_group_name(group_name, cnt);
      div_groups.append(div_group);

      let div_books = this._gen_books_in_group(group_name, data_of_ui);
      div_groups.append(div_books);
    }
    return div_groups;
  }
  _gen_group_name(group_name, cnt_of_group){
    // <div class="group_name presearch_div_button presearch_div_exist selected" group_name="整卷聖經">整卷聖經(74)</div>
    let div_group = $('<div class="group"></div>')
    .addClass("group_name")
    .attr("group_name", group_name) // 固定用 繁體
    .attr("cnt", cnt_of_group)

    if (cnt_of_group > 0){
      div_group.addClass("presearch_div_button presearch_div_exist");
      div_group.text(`${gbText(group_name)}(${cnt_of_group})`);
    } else {
      div_group.addClass("invisible");
      div_group.text(`${gbText(group_name)}`);
    }

    return div_group;
  }
  _gen_books_in_group(group_name, data_of_ui){
    // <div class="invisible book" book_name="創">創</div>
    // <div class="invisible book presearch_div_button presearch_div_exist" book_name="出">出(6)</div>  
    let div_books = $('<div class="div_books"></div>');
    let book_ids = fhl.g_book_group[group_name] || [] // 0based

    const na = BibleConstantHelperEs6Js().getBookNameArrayChineseShort();
    const naBig5 = BibleConstantHelperEs6Js().getBookNameArrayChineseShort(false);
    for ( const book_id of book_ids ){
      const cnt = data_of_ui._cnt_of_book[book_id] || 0;

      let div_book = $('<div class="book invisible"></div>')
        .attr("book_name", naBig5[book_id]) // 一定是繁體
        .attr("cnt", cnt) // 就算是 0 也要顯示 0
      if ( cnt > 0 ){
        div_book.addClass("presearch_div_button presearch_div_exist");
        div_book.text(`${na[book_id]}(${cnt})`);
      } else {
        div_book.text(`${na[book_id]}`);
      }

      div_books.append(div_book);
    } 

    return div_books;
  }
}
```

#### Ui_Event

- 點擊，群組時
  - 原本是 for loop 中，加入事件，但可以一次綁定(或是永久綁定，但所需參數要透過 attr 傳入)
- 點擊，書卷時
  - 雖然原本是 隱藏狀態，但也是建立時綁定
- 原本，所需參數
  - jrets2
  - books: 例如 [0,1,2,3,4]
  - cnt: 74 (這個)
  - group_name
- 規畫
  - jrets2 是全部 record 沒辦法放在 attr 中
  - jrets2 是所有的，不是只有某個 group 的
  - 或許，在下一個關鍵字前，可以用一個 singleton 存著。****
  - continue search 是用 qsb 但還是用同一個 jrets2

