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

  var act_all_sn1_wt = function () {
    var bug_protect = 0;
    while (true)//no keyword step2
    {
      var reg_WTHG = new RegExp('<WT[G,H]\\d+\\w*>', "g");
      var reg_re = reg_WTHG.exec(bible_text);
      if (reg_re == null)
        break;
      var str1 = reg_re[0]; // <WTH7423> or <WTG7421> or <WTH7423a>

      if (bug_protect++ > 100) {
        console.debug("SN上色可能有bug，發生於" + str1)
        break;
      }

      var reg_sn_no_tag = new RegExp('\\d+\\w*', 'g');
      str2 = reg_sn_no_tag.exec(str1)[0]; // 7423 or 7421 or 7423a
      //console.debug(str2);

      var reg_replace = new RegExp(str1, 'g');//要把 <WTH7423> 取代成 <span xxx>(7423)</span>
      //var click_sn_dic = "onclick=sdic(1,\"" + str2 + "\")";//這三行是要新增字典
      //if (this.mp_chineses.indexOf(info['chineses']) > 38)
      //click_sn_dic = "onclick=sdic(0,\"" + str2 + "\")";
      bible_text = bible_text.replace(reg_replace, "<span class='" + cseSn + " " + cButton + "'>(" + str2 + ")</span>");
    }
  };
  var act_all_sn2_w = function () {
    bug_protect = 0;
    while (true)//step4 nokeyword
    {
      var reg_WAHG = new RegExp('<W[A,G,H]+\\d+\\w*>', "g");
      var reg_re = reg_WAHG.exec(bible_text);
      if (reg_re == null)
        break;
      var str1 = reg_re[0]; // <WH777> or <WAH777> or <WG777> or <WAG777> or <WH777a>

      if (bug_protect++ > 100) {
        console.debug("SN上色可能有bug，發生於" + str1)
        break;
      }

      var reg_sn_no_tag = new RegExp('\\d+\\w*', 'g');
      str2 = reg_sn_no_tag.exec(str1)[0]; // 777 or 777a

      var reg_replace = new RegExp(str1, 'g');//要把 <WH777> 取代成 <span xxx><777></span>
      //re1 = re1.replace(reg_replace, "<span class='seSN'>&lt;" + str2 + "&gt;</span>");
      bible_text = bible_text.replace(reg_replace, "<span class='" + cseSn + " " + cButton + "'>&lt;" + str2 + "&gt;</span>");
    }
  };

  var span_text = document.createElement("span");

  // 取代所有sn
  act_all_sn1_wt();
  act_all_sn2_w();

  // 所有 keywords 上色
  Enumerable.from(keywords.split(' ')).forEach(function (a_key) {
    a_key = "" + a_key.trim().toLowerCase();
    if (a_key.length == 0)
      return;
    if (a_key == "and" || a_key == "not" || a_key == "or")
      return;

    // 必須分開 SN 與 一般關鍵字處理, 因為 SN 若用 6, 直接replace 會使 2316 的6也被取代顏色
    if (isNaN(parseInt(a_key))) //非SN
    {
      var a_span_key = "<span class='" + cseKey + "'>" + a_key + "</span>";
      bible_text = bible_text.replace(a_key, a_span_key);
    }
    else {
      {
        var a_span_key = "<span class='" + cseKey + "'>(" + a_key + ")</span>";
        bible_text = bible_text.replace("(" + a_key + ")", a_span_key);

        a_span_key = "<span class='" + cseKey + "'>(" + '0' + a_key + ")</span>";//摸魚的作法
        bible_text = bible_text.replace("(" + '0' + a_key + ")", a_span_key);//摸魚的作法
        a_span_key = "<span class='" + cseKey + "'>(" + '00' + a_key + ")</span>";//摸魚的作法
        bible_text = bible_text.replace("(" + '00' + a_key + ")", a_span_key);//摸魚的作法
        a_span_key = "<span class='" + cseKey + "'>(" + '000' + a_key + ")</span>";//摸魚的作法
        bible_text = bible_text.replace("(" + '000' + a_key + ")", a_span_key);//摸魚的作法
        a_span_key = "<span class='" + cseKey + "'>(" + '0000' + a_key + ")</span>";//摸魚的作法
        bible_text = bible_text.replace("(" + '0000' + a_key + ")", a_span_key);//摸魚的作法
      }
      {
        var a_span_key = "<span class='" + cseKey + "'>&lt;" + a_key + "&gt;</span>";
        bible_text = bible_text.replace("&lt;" + a_key + "&gt;", a_span_key);

        a_span_key = "<span class='" + cseKey + "'>&lt;" + '0'+ a_key + "&gt;</span>";
        bible_text = bible_text.replace("&lt;" + '0' + a_key + "&gt;", a_span_key);
        a_span_key = "<span class='" + cseKey + "'>&lt;" + '00' + a_key + "&gt;</span>";
        bible_text = bible_text.replace("&lt;" + '00' + a_key + "&gt;", a_span_key);
        a_span_key = "<span class='" + cseKey + "'>&lt;" + '000' + a_key + "&gt;</span>";
        bible_text = bible_text.replace("&lt;" + '000' + a_key + "&gt;", a_span_key);
        a_span_key = "<span class='" + cseKey + "'>&lt;" + '0000' + a_key + "&gt;</span>";
        bible_text = bible_text.replace("&lt;" + '0000' + a_key + "&gt;", a_span_key);
      }
    }
  });

  span_text.innerHTML = bible_text;

  return span_text;
};
