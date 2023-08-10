/// <reference path="../../jsdoc/jquery.js" />
/// <reference path="../../jsdoc/linq.d.ts" />
/// <reference path="abvphp_api.js" />
/// <reference path="fhl_api.js" />
var sephp = sephp || {};
sephp.pre_search_keyword_core = function pre_search_keyword_core(keyword, version, isGB) {
  /// <summary> 取得超過 500 限制的結果.  </summary>
  /// <param type="string" name="keyword" parameterArray="false">ex: 652, 652a</param>
  /// <param type="string" name="version" parameterArray="false" optional="true">ex: 'unv' 參考:https://bkbible.fhl.net/ajax/abv.php </param>
  /// <param type="bool" name="isGB" parameterArray="false" optional="true">關鍵字是簡體嗎? default=false</param>
  /// add 2015.07.17(六)

  if (version == undefined)
    version = 'unv';
  if (isGB == undefined)
    isGB = false;

  var q = keyword;
  var offset = 0;
  var func_get_url = function func_get_url() {

    var url = "se.php?orig=0&VERSION=" + version + "&index_only=1&limit=500&offset=" + offset + "&q=" + q;
    if (isGB)
      url += "&gb=1";
    else
      url += "&gb=0";
    return url;
  };

  var jret = null;
  var linqRecord = Enumerable.empty();
  var action_do_search = null;

  // 查詢後處理
  var action_search = function (text, pdata) {
    if (text.indexOf('"status":"success"') == -1) {
      throw "搜尋回傳錯誤 url:" + func_get_url();
    }

    var jr1 = JSON.parse(text);
    if (jret == null) {
      jret = jr1;
      linqRecord = Enumerable.from(jr1["record"]);
    }
    else {
      linqRecord = linqRecord.concat(Enumerable.from(jr1["record"]));
    }

    // 判斷是不是要繼續
    var cnt_this = jr1["record_count"];
    if (cnt_this == 500) {
      offset = 500 + offset;
      action_do_search();
    }// 繼續找. 500 筆
    else {
      jret["record"] = linqRecord.toArray();
      jret["record_count"] = linqRecord.count();

      // 把每個record附加資訊
      linqRecord.forEach(function (a1) {
        a1["ver"] = version;
        a1["ibook"] = fhl.engs_2_iBook(a1.engs);
      });

      // 到此結束. end function
    }// 準備結束了
  };// action search 

  action_do_search = function action_do_search() {
    fhl.json_api_text(func_get_url(), action_search, function (text, pdata) { throw "pre_search_keyword_core text:" + text + " url:" + func_get_url(); }, null, false);
  };//action 

  // 開始搜尋
  action_do_search();

  return jret;
  //console.log(jret); //debug
  //console.log(func_get_url());//debug
  //linqRecord.WriteLine("$.chineses + '_' + $.chap + '_' + $.sec ");//debug
};
sephp.pre_search_keyword = function pre_search_keyword(keyword, versions, isGB) {
  /// <summary> 取得超過 500 限制的結果. 一個version一個結果. (此平行處理呼叫 pre_search_keyword_core 處理各版本 Parallel)   </summary>
  /// <param type="string" name="keyword" parameterArray="false">ex: 摩西</param>
  /// <param type="string array" name="versions" parameterArray="true">ex: ['unv','kjv'] 參考:https://bkbible.fhl.net/ajax/abv.php </param>
  /// <param type="bool" name="isGB" parameterArray="false" optional="true">關鍵字是簡體嗎? default=false</param>
  /// add 2015.07.18(主)

  var jrets = [];
  var act_search = function (str, idx) {
    var jret = sephp.pre_search_keyword_core(keyword, str, isGB);
    jrets.push(jret);
  };
  Enumerable.from(versions).forEach(act_search);

  return jrets;
};// sephp.pre_search_keyword
