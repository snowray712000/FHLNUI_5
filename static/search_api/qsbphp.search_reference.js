/// <reference path="../libs/jquery-1.10.2.js" />
/// <reference path="../libs/linq.js_ver2.2.0.2/linq.min.js" />
/// <reference path="../libs/linq.js_ver2.2.0.2/jquery.linq.min.js" />
/// <reference path="fhl_api.js" />
/// <reference path="abvphp_api.js" />
var qsbphp = qsbphp || {};
qsbphp.search_reference = function search_reference(keyword, default_book, default_version, isSN, isGB) {
  /// <summary> 搜尋參考結果 </summary>
  /// <param type="string" name="keyword" parameterArray="false">以#為頭,|為結尾的字串</param>
  /// <param type="string" name="default_book" parameterArray="false">當參考只有 21:2-5時, 就不知道是哪卷書了, 所以要傳入1個default書卷</param>
  /// <param type="string" name="default_version" parameterArray="false" optional="true" integer="unv">參考只寫Ge 21:2-5, 不知道是哪個版本聖經, 所以要傳入1個default版本(預設unv)</param>
  /// <param type="bool" name="isSN" parameterArray="false" optional="true">要把SN一同顯示出來嗎(預設false)</param>
  /// <param type="bool" name="isGB" parameterArray="false" optional="true">是簡體結果顯示嗎(預設false)</param>
  /// <returns type="T"></returns>
  /// <example>
  /// qsbphp.search_reference("# Ge 21:2-5; Jos 24:2,3; 1Ch 1:28; Isa 51:2; Lu 3:34; Ac 7:8|", "Gen", "unv");//繁體無SN
  /// qsbphp.search_reference("# Ge 21:2-5; Jos 24:2,3; 1Ch 1:28; Isa 51:2; Lu 3:34; Ac 7:8|", "Gen", "unv",false,true);//簡體無SN
  /// qsbphp.search_reference("# Ge 21:2-5; Jos 24:2,3; 1Ch 1:28; Isa 51:2; Lu 3:34; Ac 7:8|", "Gen", "unv", true);//繁體SN測試
  /// </example>
  /// add 2015.07.17(六)

  // 預設參數
  if (default_version == undefined)
    default_version = "unv";
  if (isSN == undefined)
    isSN = false;
  if (isGB == undefined)
    isGB = false;

  // 準備php需要變數
  var ibook = fhl.any_name_2_iBook(default_book, isGB);
  if (ibook == -1)
  throw "search_reference default_book=" + default_book + " 是不合規定的";
  
  var g_book_all = isGB ? fhl.g_book_all : fhl.g_book_allGb
  var engs = g_book_all[ibook][0];

  var url = "qsb.php?";
  var data = "version=" + default_version + "&engs=" + engs;
  if (isSN)
    data += "&strong=1";
  else
    data += "&strong=0";
  if (isGB)
    data += "&gb=1";
  else
    data += "&gb=0";
  var keyword2;
  {// 去頭去尾 # |
    keyword2 = keyword.trim();
    keyword2 = keyword2.substr(1, keyword2.length - 2);
  }
  data += "&qstr=" + encodeURI(keyword2);//qstr的參數不包含#與|啦...要去掉orz..

  // get 方式
  //var url = "qsb.php?version=" + default_version + "&engs=" + engs;
  //if (isSN)
  //  url += "&strong=1";
  //else
  //  url += "&strong=0";
  //if (isGB)
  //  url += "&gb=1";
  //else
  //  url += "&gb=0";
  //var keyword2;
  //{// 去頭去尾 # |
  //  keyword2 = keyword.trim();
  //  keyword2 = keyword2.substr(1, keyword2.length - 2);
  //}
  //url += "&qstr=" + keyword2;//qstr的參數不包含#與|啦...要去掉orz..

  // 準備查詢
  var jret = null;


  // 處理查詢後結果, 存到jret
  var action_success = function (text, pdata) {
    if (text.indexOf('"status":"success"') == -1) {
      var r1 = '{"status":"success","record_count":0,"proc":0,"record":[],"ver":' + default_version + '}'; // 零筆的資訊
      jret = JSON.parse(r1);
      return;
    }

    jret = JSON.parse(text);
    $.each(jret["record"], function (idx, r1) {
      r1["ver"] = default_version;
      r1["ibook"] = fhl.engs_2_iBook(r1.engs);
    });

    // 函式結束於此.
  };// action_success

  fhl.json_api_text_post(url,data, action_success, function (text, pdata) { throw text; }, null, false);
  // fhl.json_api_text(url, action_success, function (text, pdata) { throw text; }, null, false);

  return jret;
};