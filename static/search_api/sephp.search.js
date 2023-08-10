/// <reference path="sephp.se_record_2_qsb_str.js" />
/// <reference path="sephp.create_dialog_presearch.js" />
/// <reference path="sephp.create_dialog_search_result.js" />
/// <reference path="sephp.pre_search_keyword.js" />
/// <reference path="sephp.pre_search_sn.js" />
/// <reference path="qsbphp.search_reference.js" />
/// <reference path="qsbphp.create_color_span_from_bible_text.js" />
/// <reference path="abvphp_api.js" />
/// <reference path="../../jsdoc/jquery.js" />
/// <reference path="../../jsdoc/fhl.d.js" />
/// <reference path="../../jsdoc/linq.d.ts" />
//// <reference path="fhl_api.js" />



var sephp = sephp || {};
sephp.isAll = true;//sn搜尋時,可能要分新舊約
sephp.ibook_cur = 0;//sn搜尋時,判斷目前是閱讀的新約還是舊約
sephp.determine_keywordType = function determine_keywordType(strKeyword) {
  /// <summary> 0: keywords 1: SN 2:Reference </summary>
  /// <param type="string" name="strKeyword" parameterArray="false">Ex:摩西 Ex:2610 Ex:#Gen 1:2|</param>

  // 是不是 參考 查詢
  {

    var strTest = strKeyword.trim();
    if (strTest[0] == '#' && strTest[strTest.length - 1] == '|')
      return 2;
  }

  // 是不是 Strong Number 查詢
  // 2021-07 Snow 修改, 判斷方式從(能否轉為整數)換成(Regex)
  if (/(G|H)?(\d+a?)/i.test(strKeyword) ){
    return 1
  }

  return 0;
};
sephp.search = function search(keyword, issn, isgb, verions, default_book,isAll) {
  /// <summary> 0: keywords 1: SN 2:Reference </summary>

  if (keyword == undefined || keyword.length == 0 )
    return;

  sephp.isgb = isgb;
  sephp.issn = issn;
  sephp.isAll = isAll;
  sephp.ibook_cur = fhl.engs_2_iBook(default_book);

  var itype = sephp.determine_keywordType(keyword);
  if (itype == 2) {
    /*reference*/
    var jret_qsb = qsbphp.search_reference(keyword, default_book, verions[0], issn, isgb);

    // 產生 result dialog 要用的資料  (這段code與 sephp.create_dialog_presearch.js 中 sephp.pre_search_click  很像)
    var Lq_record = Enumerable.from(jret_qsb["record"]);
    var jr2 = Lq_record.orderBy(a1=>a1.ibook).thenBy(a1=>a1.chap).thenBy(a1=>a1.sec)
    .select(a1=>{
      return {
        ibook: a1.ibook,
        chap:a1.chap,
        sec:a1.sec,
        ver:a1.ver,
        bible_text:a1.bible_text
      }
    }).toArray()
    // .select("{ibook:$.ibook,chap:$.chap,sec:$.sec,ver:$.ver,bible_text:$.bible_text}").ToArray();
    sephp.node_search_result.innerHTML = "";
    sephp.node_pre_search.innerHTML = "";
    sephp.create_dialog_search_result(jr2);
  } else if (itype == 1) {
    /*sn keyword*/

    if (parseInt(keyword) == 0)// 00000 結果造成卡死 2015.08.01(六)
      return;

    // add by snow, 2021-07
    // 搜尋 SN 時，搜尋 UI 開啟 sn。(但經文保持原設定)
    sephp.issn = 1
    
    var jret = sephp.pre_search_sn(keyword, isgb, 'unv');

    var jrets = []; jrets.push(jret);
    sephp.keyword = /(G|H)?(\d+a?)/i.exec(keyword)[2] // 上色 Bug 2021-07 snow
    sephp.node_pre_search.innerHTML = "";
    sephp.node_search_result.innerHTML = "";
    sephp.create_dialog_presearch(jrets);
  } else {
    /*keyword*/
    var jrets = sephp.pre_search_keyword(keyword, verions, sephp.isgb);
      
    sephp.keyword = keyword;
    sephp.node_pre_search.innerHTML = "";
    sephp.node_search_result.innerHTML = "";
    sephp.create_dialog_presearch(jrets);
  }
};