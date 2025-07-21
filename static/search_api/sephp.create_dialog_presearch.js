/// <reference path="../../jsdoc/jquery.js" />
/// <reference path="../../jsdoc/linq.d.ts" />
/// <reference path="fhl_api.js" />
/// <reference path="sephp.create_dialog_search_result.js" />
/// <reference path="sephp.se_record_2_qsb_str.js" />
/// <reference path="../../index/Search_DataForGroupUi_es2023.js" />
/// <reference path="../../index/Search_UiOfGroupRender_es2023.js" />


var sephp = sephp || {};
sephp.cnt_set = 15;// continue search use, 不會變, 一次讀幾筆
sephp.cnt_search = 0; // continue search use
sephp.Lq_ret_group = [];// continue search use (所有jrets2中,且在ibooks中的)
sephp.pre_search_click = function pre_search_click(pdata) {
  Search_pre_search_click(pdata)
};

/**
 * @typedef {Object} OneSeRecord
 * @property {number} chap
 * @property {number} sec
 * @property {number} ibook 3
 * @property {string} engs Num
 * @property {string} chineses 民
 * @property {string} ver lcc
 * @property {string} bible_text
 * @typedef {Object} OneVerResult
 * @property {string} key
 * @property {OneSeRecord[]} record
 * @property {number} record_count
 */

/**
 * 
 * @param {(OneVerResult | null)[]} jrets 
 */
sephp.create_dialog_presearch = function create_dialog_presearch(jrets) {
  /// <param type="jret[]" name="jrets" parameterArray="true">通常是 pre_search_sn pre_search_keyword 結果</param>
  const jrets_a = jrets.filter(a1 => a1 != null);

  Search_DataForGroupUi.s.update(jrets_a);
  const uiGroup = new Search_UiOfGroupRender().main(Search_DataForGroupUi.s);
  $(sephp.node_pre_search).append(uiGroup);

  // textarea 每次都要重新建, 改用 jQuery
  let textarea = new Search_UiOfGroupRender().gen_textarea_for_copy();
  $(sephp.node_pre_search).append(textarea);
  sephp.node_sephp_copy = textarea[0]; // 相容舊版
  
  // trigger click 
  const group_name = "整卷聖經";
  $(`.group_name[group_name="${group_name}"]`).trigger('click');
};

testThenDoAsync({cbTest: () => window.Search_initializePreSearchEventHandlersAsync != undefined}).then(() => {
  // 初始化事件處理 
  Search_initializePreSearchEventHandlersAsync()
})
