/// <reference path="../search_api/fhl_api.js" />

var qsb = qsb || {};
qsb.qsbapi = function (keyword, default_book, default_version, isSN, isGB) {
  /// <summary> 搜尋參考結果 </summary>
  /// <param type="string" name="keyword" parameterArray="false">不包含#與|了，請先去掉。</param>
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
  // 準備php需要變數
  // 預設參數
  var ibook = fhl.any_name_2_iBook(default_book,isGB);
  if (ibook == -1)
    throw "search_reference default_book=" + default_book + " 是不合規定的";
  var engs = fhl.g_book_allAuto(isGB)[ibook][0];

  // 採用 url + data 方式. 就是POST 方式, 否則 GET 可能會不足
  var url = "qsb.php";
  var data = "version=" + default_version + "&engs=" + engs;
  if (isSN)
    data += "&strong=1";
  else
    data += "&strong=0";
  if (isGB)
    data += "&gb=1";
  else
    data += "&gb=0";
  var keyword2 = keyword.trim();
  //data += "&qstr=" + encodeURI(keyword2);//qstr的參數不包含#與|啦...要去掉orz..
  data += "&qstr=" + keyword2;//qstr的參數不包含#與|啦...要去掉orz..



  // 準備查詢
  var jret = null;

  // 處理查詢後結果, 存到jret
  var action_success = function (text, pdata) {
    if (text.indexOf('"status":"success"') == -1) {
      var r1 = '{"status":"success","record_count":0,"proc":0,"record":[],"ver":' + default_version + '}'; // 零筆的資訊
      jret = JSON.parse(r1);
    }
    else {
      jret = JSON.parse(text);
      $.each(jret["record"], function (idx, r1) {
        r1["ver"] = default_version;
        r1["ibook"] = fhl.engs_2_iBook(r1.engs);
      });
    }

    // 函式結束於此.
  };// action_success

  //console.log(data);
  //version=unv&engs=Matt&strong=0&gb=0&qstr=Matt 5

  fhl.json_api_text_post(url, data, action_success, function (text, pdata) { throw text; }, null, false);

  //console.log(jret);
  // .status: "success"
  // .record: [{},{},{}...] ..
  // each .. 
  // bible_text: "就<WG2532>差<WG3992><WTG5660>他们...", chap:2 , chinese:"太", engs:"Matt", ibook:39, sec:8, ver:"unv"
  return jret;
};
