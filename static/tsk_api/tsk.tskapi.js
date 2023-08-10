/// <reference path="../search_api/fhl_api.js" />
/// <reference path="./../../ijnjs/BibleConstantHelper.es6.js" />
/// <reference path="./../../ijnjs/BibleConstants.es6.js" />

var tsk = tsk || {};
tsk.tskapi = function (engs, chap, sec, gb) {
  /// <summary> 串珠 </summary>
  /// <param type="string" name="engs" parameterArray="false">ex:"Mark"</param>
  /// <param type="string" name="chap" parameterArray="false" optional="true" >ex:6</param>
  /// <param type="bool" name="sec" parameterArray="false" optional="true">ex:1 節數</param>
  /// <param type="bool" name="gb" parameterArray="false" optional="true">是簡體結果顯示嗎(預設false)</param>
  /// <returns type="T"></returns>
  /// <example>
  /// example: var jret = tsk.tskapi("Mark", 1, 1, false);
  /// </example>
  /// add 2015.11.18(四)

  // 準備php需要變數
  // 預設參數
  const BibleConstantHelper = BibleConstantHelperEs6Js()
  const BibleConstant = BibleConstantEs6Js()
  const ibook = BibleConstantHelper.getBookId (engs.toLocaleLowerCase()) - 1
  if (ibook < 0){
    throw new Error("engs=" + engs + " 是不合規定的")
  }

  const engs2 = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[ibook]
  // var engs2 = fhl.g_book_allAuto(gb)[ibook][0];

  // 採用 url + data 方式. 就是POST 方式, 否則 GET 可能會不足
  var url = "sc.php";
  var data = "book=4&engs=" + engs2;
  if (gb)
    data += "&gb=1";
  else
    data += "&gb=0";
  data += "&chap=" + chap + "&sec=" + sec;

  // 準備查詢
  var jret = null;

  // 處理查詢後結果, 存到jret
  var action_success = function (text, pdata) {
    if (text.indexOf('"status":"success"') == -1) {
      var r1 = '{"status":"success","record":[]}'; // 零筆的資訊
      jret = JSON.parse(r1);
    }
    else {
      jret = JSON.parse(text);
    }

    // 函式結束於此.
  };// action_success

  // console.log(data);
  //book=4&engs=Mark&gb=0&chap=1&sec=1

  fhl.json_api_text_post(url, data, action_success, function (text, pdata) { throw text; }, null, false);

  // console.log(jret);
  // .status: "success"
  // .record: [{},{},{}...] ..
  // each .. 
  // book_name:"串珠", title:"馬可福音 1章1節 到 1章1節", com_text: "...."
  return jret;
};
