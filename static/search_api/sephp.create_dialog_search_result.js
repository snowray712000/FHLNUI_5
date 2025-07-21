/// <reference path="../../jsdoc/jquery.js" />
/// <reference path="../../jsdoc/linq.d.ts" />
/// <reference path="sephp.create_dialog_presearch.js" />
/// <reference path="fhl_api.js" />
/// <reference path="abvphp_api.js" />
/// <reference path="sephp.search.js" />
/// <reference path="./../../index/SearchFlow_es2023.js" />
/// <reference path="./../../index/Search_continue_search_es2023.js" />
/// <reference path="./../../index/Search_create_dialog_search_result_es2023.js" />

/** @type {SearchFlow} */
const SearchFlow = window.SearchFlow;

var sephp = sephp || {};
sephp.node_sephp_copy = document.createElement("textarea");//copy經文用 .id= 'sephp_copy_id' 2015.08.19(三)
sephp.sn_click = function sn_click(pdata) {
  /// <summary> 查詢後結果,SN按下的時候 </summary>
  // console.log(pdata);

  let elem = pdata.target
  // 使用 jquery
  let span = $(elem)
  // 取得 attr sn N
  let sn = span.attr('sn')
  let N = span.attr('N')
  console.log(sn, N);

  queryDictionaryAndShowAtDialogAsync({ sn, isOld: N == 1 })
  
  // 點擊 sn 時，不要切換 active 節
  pdata.stopPropagation()
};
sephp.open_ref_click = function open_ref_click(pdata) {
  /// <summary> 列出經文的白圓圈被點擊的時候 </summary>
  sephp.act_ref_button_click(pdata);
};
sephp.copy_text = function copy_text(event) {
  /// <summary> 列出經文的剪刀被點擊的時候 </summary>

  const bible_text = $(event.currentTarget).attr('text')

  sephp.node_sephp_copy.value = bible_text

  //console.log($(this).find('.verseContent').text());
  //$('‪#myClipboard‬').text($(this).find('.verseContent').text());
  var copyTextarea = document.querySelector('#sephp_copy_id');
  copyTextarea.select();
  document.execCommand('copy');
};

sephp.create_dialog_search_result = function create_dialog_search_result(jrecords) {
  Search_create_dialog_search_result(jrecords);
}; 

/**
 * 
 * @returns {{ibook: number, chap: number, sec: number, bible_text: string}[]} ordered records
 */
sephp.continue_search = function continue_search() {
  return Search_continue_search()
}
