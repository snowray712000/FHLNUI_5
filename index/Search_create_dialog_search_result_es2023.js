import { BibleConstantHelper } from './BibleConstantHelper.es2023.js'

/**
 * 定義型別別名
 * @typedef {import('./Search_Types_es2023').OneSeRecord} OneSeRecord
 */

/*
# 架構

### 主架構
- pre_search2 是顯示分類的
  - 我已經忘了，為了需要 2 層了，看起來沒必要
- search_result2 是顯示搜尋結果的
  - 我已經忘了，為了需要 2 層了，看起來沒必要
- 使用 position absolute 型成併排顯示

<div#fhlMidBottomWindowContent>
  <div#pre_search2>
    <div#pre_search>
    </div>
  </div>
  <div#search_result2>
    <div#search_result>
    </div>
  </div>
</div>
### 若多譯本時，若同一節，有多個譯本時，只有第一個 .seOneSec 中的 .seOneSecRef 中會有 span.address 與 br

<div.verse_group>
  <div.seOneSec> ... </div>
  <div.seOneSec> ... </div>
</div>

### 每一筆結果架構
- 以 div#search_result 為容器
- 每一筆原始資料，就是在 jrecords 中
- 每一筆結果的 div 結構如下，分 3 部分。 經文位置，經文內容，copy按鈕。

<div.verse_group>
  <div.seOneSec>
    <div.seOneSecRef>
      <span.address>太 1:20</span>
      <br/>
      <span.version>FHL和合本</span>
    </div>
    <div.seOneSecText>
      <span>...</span>
    </div>
    <div.copy.sebutton>
      <i class="fa fa-files-o"></i>
    </div>
  </div>
</div>
*/

/**
 * @param {OneSeRecord} recorda 
 * @param {OneSeRecord} recordb 
 * @returns {boolean}
 */
function isNotTheSameVerse(recorda, recordb){
  if (recorda.ibook != recordb.ibook) return true
  if (recorda.chap != recordb.chap) return true
  if (recorda.sec != recordb.sec) return true
  return false
}

/**
 * @param {OneSeRecord[]} records_ordered
 * @returns {OneSeRecord[][]}
 */
function groupByVerse(records_ordered){
  if (records_ordered.length === 0) return []

  const group = []

  let currentGroup = null
  records_ordered.forEach((record) => {
    if (currentGroup === null || isNotTheSameVerse(currentGroup[0], record)) {
      currentGroup = [record]
      group.push(currentGroup)
    } else {
      currentGroup.push(record)
    }
  })
  return group
}
/**
 * @param {OneSeRecord[]} group
 * @returns {JQuery<HTMLElement}
 * 
 * 下面結構，以 一節，有 2 個譯本為例
 * <div class='verse_group'>
 *  <div class='seOneSec'>
 *   <div class='seOneSecRef'>
 *    <span class='address'>太 1:20</span> ... 只有第1個譯本有
 *    <br/> ... 只有第1個譯本有
 *   <span class='version'>FHL和合本</span>
 *   </div.seOneSecRef>
 *   <div class='seOneSecText'>
 *     <span class='seKey'>...</span>
 *   </div.seOneSecText>
 *   <div class='copy sebutton'>
 *    <i class='fa fa-files-o'></i>
 *   </div>
 *  </div.seOneSec>
 *  <div.seOneSec>
 *   <div class='seOneSecRef'>
 *     <span class='version'>新譯本</span>
 *   </div.seOneSecRef>
 *   略...
 * </div.verse_group>
 * 
 */
function render_one_verse_group(group){
  let div_verse_group = $("<div class='verse_group'>");
  
  const ch_names = BibleConstantHelper.getBookNameArrayChineseShort()

  group.forEach((obj, idx) => {
    let div_se_one_sec = $("<div class='seOneSec'>");
    
    // 處理 <div.seOneSecRef>
    let div_se_one_sec_ref = $("<div class='seOneSecRef'>");
    if (idx == 0){
      let span_address = $("<span class='address'>").text(`${ch_names[obj.ibook]} ${obj.chap}:${obj.sec}`).attr('book', obj.ibook+1).attr('chap', obj.chap).attr('sec', obj.sec);
      div_se_one_sec_ref.append(span_address);
      div_se_one_sec_ref.append("<br/>");
    }
    let span_version = $("<span class='version'>").text(abvphp.get_cname_from_book(obj.ver, sephp.isgb));
    div_se_one_sec_ref.append(span_version);
    div_se_one_sec.append(div_se_one_sec_ref);

    // 處理 <div.seOneSecText>
    let div_se_one_sec_text = $("<div class='seOneSecText'>");
    let span_text = qsbphp.create_color_span_from_bible_text(sephp.keyword, obj["bible_text"], "sebutton", "seKey", "seSN")
    div_se_one_sec_text.append(span_text);
    div_se_one_sec.append(div_se_one_sec_text);

    // 處理 <div.copy.sebutton>
    let div_copy_button = $("<div class='copy sebutton'>").attr('text', obj.bible_text);
    div_copy_button.html("<i class='fa fa-files-o'></i>");
    div_se_one_sec.append(div_copy_button);

    // 將整個 div.seOneSec 加入到 div_verse_group
    div_verse_group.append(div_se_one_sec);
  });
  return div_verse_group;
}

/**
 * @param {OneSeRecord[]} jrecords 卷軸滾動的時候，新增的筆數，15筆。
 */
export function Search_create_dialog_search_result(jrecords) {
  const record_oreder = groupByVerse(jrecords);
  
  let search_result = $("#search_result");
  for ( const group of record_oreder ) {
    render_one_verse_group(group).appendTo(search_result);
  }
}; // end sephp.create_dialog_result