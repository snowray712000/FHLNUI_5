/// <reference path="sephp.search.js" />
/// <reference path="../libs/jquery-1.10.2.js" />
/// <reference path="../libs/linq.js_ver2.2.0.2/linq.min.js" />
/// <reference path="../libs/linq.js_ver2.2.0.2/jquery.linq.js" />
/// <reference path="abvphp_api.js" />
/// <reference path="fhl_api.js" />
var sephp = sephp || {};
sephp.pre_search_sn = function pre_search_sn(keyword, isGB, version) {
  /// <summary> 取得超過 500 限制的結果. 從和合本版本搜尋(因為目前只有它有SN), 新約舊約都會找(依順序輸出) </summary>
  /// <param type="string" name="keyword" parameterArray="false">ex: 652, 652a</param>
  /// <param type="bool" name="isGB" parameterArray="false" optional="true">是簡體結果顯示嗎(預設false)....index only不應該分繁簡體才對...</param>
  /// <param type="string" name="version" parameterArray="false" optional="true">ex: 'unv' 預設unv, 目前也只有unv,kjv可查sn</param>
  /// add 2015.07.17(六)

  
  if (version == undefined)
    version = 'unv';
  if (isGB == undefined)
    isGB = false;

  // 說明: RANGE orig offset q 變數是用來產生 url
  // 下面的程式碼會改 RANGE orig offset
  // 有點像 func_get_url() 4個參數變成 "全域"變數的感覺
  // 真正開始執行是 呼叫 action_do_search 函式
  // 因為 api 有 500 個限制，所以會重覆 call 自己
  var q = keyword;
  var RANGE = 2;//從舊約起
  var orig = 2;//一定要加,不然會錯誤 23 會找出一堆非 23的
  var offset = 0;
  var func_get_url = function func_get_url() {
    return "se.php?index_only=1&limit=500&" + 
    "offset=" + offset + "&orig="+orig+
    "&RANGE=" + RANGE + "&q=" + q;
  };

  var jret = null; // 產出的結果, 在 action_do_search 中生成
  var linqRecord = Enumerable.empty() ; // 產出的結果, 在 action_do_search 中生成
  var action_do_search = function(){}; // 下面這個函式會更新

  function searchNewTestment(){
    RANGE = 1;
    orig = 1;
    offset = 0;//重設為0
    action_do_search();
  }
  function searchOldTestment(){
    RANGE = 2;
    orig = 2;
    offset = 0;//重設為0
    action_do_search();
  }

  // 2021-07 add by snow,
  // 修正 q 
  // keyword 已經有可能包含 H 或 G, 但原本設計是沒有的
  let reRegex = /(G|H)?(\d+a?)/i.exec(keyword)
  if ( reRegex == null ) { 
    throw "impossible, determine_keywordType 已經判斷過了"
  }
  q = reRegex[2]
  
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
      // 到此查詢結束
    }// 準備結束了
  };// action search 

  // 執行查執 (改變 offset q RANGE 參數即可, 裡面包含了呼叫等)
  action_do_search = function action_do_search() {
    fhl.json_api_text(func_get_url(), action_search, function (text, pdata) { throw "pre_search_sn text:" + text + " url:" + func_get_url(); }, null, false);
  };//action 

  // 2021-07 修改 by snow
  // 不再搜尋全部原文
  function isOldTestment(){
    if (reRegex[1] === undefined ){
      return sephp.ibook_cur < 39 // 當沒有 G 或 H 來決定是新約、舊約的原文時, 就用目前書卷吧
    } else {
      return reRegex[1].toUpperCase() == "H"
    }
  }
  if (isOldTestment()){
    searchOldTestment()
  } else {
    searchNewTestment()
  }

  return jret;
};