/// <reference path="../../jsdoc/jquery.js" />
/// <reference path="../../jsdoc/linq.d.ts" />

var qsbphp = qsbphp || {};
qsbphp.create_color_span_from_bible_text = function create_color_span_from_bible_text(keywords, bible_text, cButton, cseKey, cseSn) {
  /// <summary> 把qsbphp或是sephp回傳的結果 bible_text 上色 </summary>
  /// <param type="string" name="keywords" parameterArray="false">Ex: '摩西 神' Ex2: 2316</param>
  /// <param type="string" name="bible_text" parameterArray="false">sephp或qsbphp回傳的bible_text,可能有sn或沒有sn</param>
  /// <param type="string" name="cButton" parameterArray="false" optional="true">click SN可以查詢,所以可傳入class Button的樣式.預設sebutton</param>
  /// <param type="string" name="cseKey" parameterArray="false" optional="true">關鍵字會上色,class Key, 預設 seKey</param>
  /// <param type="string" name="cseKey" parameterArray="false" optional="true">SN關鍵字會上色,class Key, 預設 seSN</param>
  /// add 2015.07.22(三)

  // class 樣式 (之後作成參數可被取代)
  if (cButton == undefined)
    cButton = "sebutton"; //可以按 (cursor pointer),
  if (cseKey == undefined)
    cseKey = "seKey"; //關鍵字(上藍色)
  if (cseSn == undefined)
    cseSn = "seSN"; //關鍵字
  
  function do_sn(bible_text, keySn){
    var reg1 = /<WA?(T?)([HG])([0-9]+)(a?)>/gi
    var reg2 = new RegExp(`{${reg1.source}}|${reg1.source}`, 'gi');
    function replace_sn(s0,s1,s2,s3,s4,s5,s6,s7,s8){
      sT = s1 || s5
      sHG = s2 || s6
      sNum = s3 || s7
      sA = s4 || s8 || ""

      // 大括號
      isBrace = s2 != undefined
      // sn
      sn = `${parseInt(sNum)}${sA}`

      // 使用 jquery 並重構
      let span  = $('<span>').addClass('seSN').addClass('sebutton').addClass('sn') /// @type {JQuery<HTMLElement>?}
      let str1 = sT == 'T' ? `(${sn})` : `<${sn}>`
      let str2 = isBrace ? `{${str1}}` : str1
      span.text(str2)
      span.attr('sn', sn)
      span.attr('N', sHG == 'H' ? 1 : 0)

      // 關鍵字嗎
      if (keySn == sn){
        span.addClass(cseKey)
      }

      return span[0].outerHTML
    }
    return bible_text.replace(reg2, replace_sn);
  }

  var span_text = document.createElement("span");

  // 取代所有sn
  // act_all_sn1_wt();
  // act_all_sn2_w();
  
  // 所有 keywords 上色
  // 1. 目前不支援 SN 與 關鍵字 同時搜尋，例如 `摩西 h2316`，結果會是 2316 搜尋 
  // 2. 目前不支援 多個 SN 搜尋，例如 `h2316 h2317`，結果會是 2316 搜尋
  
  function get_keyword_if_sn(keywords){
    let reg1 = /([0-9]+)(a?)/gi
    let result = reg1.exec(keywords)
    if (result){
      return `${parseInt(result[1])}${result[2] || ""}`
    }
    return undefined // 表示，不是 SN Keyword
  }
  keySn = get_keyword_if_sn(keywords)
  bible_text = do_sn(bible_text, keySn);

  if ( keySn == undefined ){
    // 原流程，多個文字關鍵字
    Enumerable.from(keywords.split(' ')).forEach(function (a_key) 
    {
      a_key = "" + a_key.trim().toLowerCase();
      if (a_key.length == 0)
        return;
      if (a_key == "and" || a_key == "not" || a_key == "or")
        return;
  
      var a_span_key = "<span class='" + cseKey + "'>" + a_key + "</span>";
      bible_text = bible_text.replace(a_key, a_span_key);
    }) 
  }

  span_text.innerHTML = bible_text;

  return span_text;
};

