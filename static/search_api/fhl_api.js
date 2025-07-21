/// <reference path="./../../libs/jsdoc/jquery.js" />
/// <reference path="./../../libs/jsdoc/linq.d.ts" />
/// <reference path="./../../ijnjs/BibleConstantHelper.es6.js" />
/// <reference path="./../../index/queryReferenceAndShowAtDialogAsync.es6.js" />

var fhl = fhl || {};

// console.log(location); // file://
var isRDLocation = location.origin === 'file://' || location.hostname === '127.0.0.1' || location.hostname === 'localhost';
var urlJSON = '/json/';
var urlAjax = '/ajax/';
if (isRDLocation === true) {
  urlJSON = 'https://bible.fhl.net/json/';
  urlAjax = 'https://bible.fhl.net/ajax/';
}

fhl.isRDLocation = isRDLocation;
fhl.urlJSON = urlJSON;
fhl.urlAjax = urlAjax;

// 定義常用的 json xml 函式 2 個 全域變數 1 個 
// fhl.xml_api 、 fhl.json_api
// fhl.g_book_group

// fhl.xml_api fhl.json_api 函式定義 (這用在 se.php sq.php abv.php 都可以用到)
fhl.xml_api = function xml_api(url, fncb_success, fncb_error, obj_param, isAsync) {
  if (isAsync == undefined)//default value
    isAsync = true;
  // var root_url = "https://bkbible.fhl.net/ajax/";
  var root_url = fhl.urlAjax;

  var ab_url = root_url + url;
  ab_url = encodeURI(ab_url).replace("#", "%23"); // encodeURI 不會轉換#符號, 手動轉換
  return $.ajax({
    url: ab_url,
    type: "GET",
    dataType: "xml",
    async: isAsync,
    error: function (xml) {
      console.debug("xml api error ...");
      if (fncb_error != null) fncb_error(xml, obj_param);
    },
    success: function (xml) {
      if (fncb_success != null) fncb_success(xml, obj_param);
    }
  });// $.ajax(...);
};//fhl.xml_api function
// 小雪 fhl.xml_api fhl.json_api 函式定義 (這用在 se.php sq.php abv.php 都可以用到)
fhl.json_api = function json_api(url, fncb_success, fncb_error, obj_param, isAsync) {
  if (isAsync == undefined)//default value
    isAsync = true;
  //var root_url = "https://bible.fhl.net/json/";
  var root_url = fhl.urlJSON;
  var ab_url = root_url + url;
  ab_url = encodeURI(ab_url).replace("#", "%23"); // encodeURI 不會轉換#符號, 手動轉換
  return $.ajax({
    url: ab_url,
    type: "GET",
    dataType: "json",
    async: isAsync,
    error: function (json) {
      console.debug("json api error ...");
      if (fncb_error != null) fncb_error(json, obj_param);
    },
    success: function (json) {
      if (fncb_success != null) fncb_success(json, obj_param);
    }
  });// $.ajax(...);
};//fhl.json_api function

fhl.xml_api_text = function xml_api(url, fncb_success, fncb_error, obj_param, isAsync) {
  /// <summary> 取fhl的json資料, 但是確是取得最原始資料, 原因是 json 有時候不正確, 還是回傳純文字好了 </summary>
  /// <param type="string" name="url">例如 se.php?q=.... 不用包含全部網址 </param>
  /// <param type="Action&lt;string,T>" name="fncb_success">當API成功，要作什麼事，arg1是回傳的文字，arg2是obj_param傳入的。可傳null表示不作事</param>
  /// <param type="Action&lt;string,T>" name="fncb_error">當API失敗時，要作什麼事，arg1是回傳的文字，arg2是obj_param傳入的。可傳null表示不作事</param>
  /// <param type="Action&lt;T>" name="obj_param">傳入給fnch_success第2個參數。通常是作為存回傳值用的</param>
  /// <param type="bool" name="isAsync" optional="true">true表示主執行緒會繼續執行，false表示主執行緒會等這個api回傳後再繼續。</param>

  if (isAsync == undefined)//default value
    isAsync = true;
  // var root_url = "https://bkbible.fhl.net/ajax/";
  var root_url = fhl.urlAjax;
  var ab_url = root_url + url;
  ab_url = encodeURI(ab_url).replace("#", "%23"); // encodeURI 不會轉換#符號, 手動轉換
  return $.ajax({
    url: ab_url,
    type: "GET",
    dataType: "text",
    async: isAsync,
    error: function (xml) {
      console.debug("xml api error ...");
      if (fncb_error != null) fncb_error(xml, obj_param);
    },
    success: function (xml) {
      if (fncb_success != null) fncb_success(xml, obj_param);
    }
  });// $.ajax(...);
};//fhl.xml_api_text function
fhl.json_api_text = function json_api_text(url, fncb_success, fncb_error, obj_param, isAsync) {
  /// <summary> 取fhl的json資料, 但是確是取得最原始資料, 原因是 json 有時候不正確, 還是回傳純文字好了 </summary>
  /// <param type="string" name="url">例如 se.php?q=.... 不用包含全部網址 </param>
  /// <param type="Action&lt;string,T>" name="fncb_success">當API成功，要作什麼事，arg1是回傳的文字，arg2是obj_param傳入的。可傳null表示不作事</param>
  /// <param type="Action&lt;string,T>" name="fncb_error">當API失敗時，要作什麼事，arg1是回傳的文字，arg2是obj_param傳入的。可傳null表示不作事</param>
  /// <param type="Action&lt;T>" name="obj_param">傳入給fnch_success第2個參數。通常是作為存回傳值用的</param>
  /// <param type="bool" name="isAsync" optional="true">true表示主執行緒會繼續執行，false表示主執行緒會等這個api回傳後再繼續。</param>

  if (isAsync == undefined)//default value
    isAsync = true;
  // var root_url = "https://bible.fhl.net/json/";
  var root_url = fhl.urlJSON;
  var ab_url = root_url + url;
  ab_url = encodeURI(ab_url).replace("#", "%23"); // encodeURI 不會轉換#符號, 手動轉換
  return $.ajax({
    url: ab_url,
    type: "GET",
    dataType: "text",
    async: isAsync,
    error: function (jstr) {
      console.debug("xml api error ...");
      if (fncb_error != null) fncb_error(jstr, obj_param);
    },
    success: function (jstr) {
      if (fncb_success != null) fncb_success(jstr, obj_param);
    }
  });// $.ajax(...);
};//fhl.json_api_text function
fhl.json_api_text_post = function json_api_text_post(url, data, fncb_success, fncb_error, obj_param, isAsync) {
  /// <summary> 取fhl的json資料, 但是確是取得最原始資料, 原因是 json 有時候不正確, 還是回傳純文字好了 </summary>
  /// <param type="string" name="url">例如 se.php?q=.... 不用包含全部網址 </param>
  /// <param type="Action&lt;string,T>" name="fncb_success">當API成功，要作什麼事，arg1是回傳的文字，arg2是obj_param傳入的。可傳null表示不作事</param>
  /// <param type="Action&lt;string,T>" name="fncb_error">當API失敗時，要作什麼事，arg1是回傳的文字，arg2是obj_param傳入的。可傳null表示不作事</param>
  /// <param type="Action&lt;T>" name="obj_param">傳入給fnch_success第2個參數。通常是作為存回傳值用的</param>
  /// <param type="bool" name="isAsync" optional="true">true表示主執行緒會繼續執行，false表示主執行緒會等這個api回傳後再繼續。</param>

  if (isAsync == undefined)//default value
    isAsync = true;
  // var root_url = "https://bible.fhl.net/json/";
  var root_url = fhl.urlJSON;
  var ab_url = root_url + url;
  ab_url = encodeURI(ab_url).replace("#", "%23"); // encodeURI 不會轉換#符號, 手動轉換
  return $.ajax({
    url: ab_url,
    type: "POST",
    data: data,
    dataType: "text",
    async: isAsync,
    error: function (jstr) {
      console.debug("xml api error ...");
      if (fncb_error != null) fncb_error(jstr, obj_param);
    },
    success: function (jstr) {
      if (fncb_success != null) fncb_success(jstr, obj_param);
    }
  });// $.ajax(...);
};
// 小雪 聖經書卷群組(目前用在搜尋功能)...因為覺得是共用的，所以定義在fhl namespace中
/**
 * @type {{[key: "整卷聖經"|"舊約"|"新約"|"摩西五經"| "歷史書"|"詩歌智慧書"|"大先知書"|"小先知書"|"福音書"|"保羅書信"|"其它書信"]: number[]}}
 */
fhl.g_book_group = {
  "整卷聖經": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65],
  "舊約": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
  "新約": [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65],
  "摩西五經": [0, 1, 2, 3, 4],
  "歷史書": [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  "詩歌智慧書": [17, 18, 19, 20, 21],
  "大先知書": [22, 23, 24, 25, 26],
  "小先知書": [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],//若只有先知書，太長了，對切換書卷不方便
  "福音書": [39, 40, 41, 42, 43], // 使徒行傳加到福音書(畢竟是路加寫的下集)
  "保羅書信": [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
  "其它書信": [57, 58, 59, 60, 61, 62, 63, 64, 65] // 希伯來書加在這55
};

fhl.xml_tool = {} || fhl.xml_tool;
// var re1 = var re1 = fhl.xml_tool.parseXml(test_aaa,-1);
// 因為用 $.ajax() type 為 xml 的時候, 因為內容也會有<00883>, 這就不是成對出現 <00883></00883> 這樣子, ajax會回傳失敗.
// 因為上面會綠故. 所以特別開發這個. 讓不成對出現的. 略過.
fhl.xml_tool.parseXml = function parseXml(str, max_deep) {
  if (max_deep == undefined)
    max_deep = -1;
  // 演算法測試資料 : 
  //var test_aaa = "<result><status>success</status><orig>0</orig><key>摩西</key><record_count>7</record_count><record><id>23350</id><chineses>太</chineses><engs>Matt</engs><chap>8</chap><sec>4</sec><bible_text>耶穌對他說：「你切不可告訴人，只要去把身體給祭司察看，獻上摩西所吩咐的禮物，對眾人作證據。」</bible_text></record><record><id>23704</id><chineses>太</chineses><engs>Matt</engs><chap>17</chap><sec>3</sec><bible_text>忽然，有摩西、以利亞向他們顯現，同耶穌說話。</bible_text></record><record><id>23705</id><chineses>太</chineses><engs>Matt</engs><chap>17</chap><sec>4</sec><bible_text>彼得對耶穌說：「主啊，我們在這裡真好！你若願意，我就在這裡搭三座棚，一座為你，一座為摩西，一座為以利亞。」</bible_text></record><record><id>23770</id><chineses>太</chineses><engs>Matt</engs><chap>19</chap><sec>7</sec><bible_text>法利賽人說：「這樣，摩西為甚麼吩咐給妻子休書，就可以休她呢？」</bible_text></record><record><id>23771</id><chineses>太</chineses><engs>Matt</engs><chap>19</chap><sec>8</sec><bible_text>耶穌說：「摩西因為你們的心硬，所以許你們休妻，但起初並不是這樣。</bible_text></record><record><id>23897</id><chineses>太</chineses><engs>Matt</engs><chap>22</chap><sec>24</sec><bible_text>「夫子，摩西說：『人若死了，沒有孩子，他兄弟當娶他的妻，為哥哥生子立後。』</bible_text></record><record><id>23921</id><chineses>太</chineses><engs>Matt</engs><chap>23</chap><sec>2</sec><bible_text>說：「文士和法利賽人坐在摩西的位上，</bible_text></record></result>";
  // var re1 = fhl.xml_tool.parseXml(test_aaa,-1);
  // var re2 = fhl.xml_tool.parseXml(test_aaa,2);

  // <a>aa</a>  ... {a:aa}
  // <a><a>aa</a></a> ... {a:{a:aa}}
  // <a>aa</a><a>bb</a> ... {a:[aa,bb]}
  // <a><b>b</b></a><a>c<a/> ... {a:[{b:b},c]}
  if (max_deep == 0)
    return str;

  var key_array = {};
  var text = undefined;
  var pos4 = -1;
  while (true) {
    var pos1 = str.indexOf("<", pos4 + 1);
    if (pos1 == -1) {
      var laststrlen = str.length - pos4 - 1;
      if (laststrlen != 0)
        text = str.substr(pos4 + 1, laststrlen);
      break;//break while loop
    }

    var pos2 = str.indexOf(">", pos1);
    if (pos2 == -1) {
      var laststrlen = str.length - pos4 - 1;
      if (laststrlen != 0)
        text = str.substr(pos4 + 1, laststrlen);
      break;//break while loop
    }
    var strkey = str.substr(pos1 + 1, pos2 - pos1 - 1); //result
    var pos3 = str.indexOf("</" + strkey + ">", pos2 + 1);
    if (pos3 == -1) {
      var laststrlen = str.length - pos4 - 1;
      if (laststrlen != 0)
        text = str.substr(pos4 + 1, laststrlen);
      break;//break while loop
    }
    var strValue = str.substr(pos2 + 1, pos3 - pos2 - 1);

    if ((strkey in key_array) == false)
      key_array[strkey] = [];
    key_array[strkey].push(strValue);

    pos4 = pos3 + strkey.length + 2;
  }//end while 

  var re1 = Object.keys(key_array);
  if (re1.length == 0 && text == undefined) {
    return null;
  } else if (re1.length == 0 && text != undefined) {
    return text;//pData確定是字串.不是物件
  } else {
    var pData = {}; //pData確定是個物件.不是字串. //要遞迴向下的Case
    for (var x1 in key_array) {
      // x1: aaa key_array[x1]: <a>b</a><a>c><a/>
      if (key_array[x1].length == 1) { //如果 ... aaa:[<b></b>] ... 只有1個 ... aaa[<b></b>,<c></c>]就是有兩個...
        if (max_deep == -1)
          pData[x1] = parseXml(key_array[x1][0], -1);
        else
          pData[x1] = parseXml(key_array[x1][0], max_deep - 1);
      } else {
        pData[x1] = [];//雖然還不知道內容,但確定它是個陣列了.
        var val_array = key_array[x1];
        for (var x2 in val_array) {
          if (max_deep == -1)
            pData[x1].push(parseXml(val_array[x2], -1));
          else
            pData[x1].push(parseXml(val_array[x2], max_deep));
        }
      }
    }
    return pData;
  }//要遞迴向下的Case
  console.debug("impossible here");
  return null;
};

// listall.html 
// [0][0]: Gen [0][1]=Genesis [0][2]=創 [0][3]=創世記 [0][4]=Ge ;
fhl.g_book_all = JSON.parse('[["Gen","Genesis","創","創世記","Ge"],["Ex","Exodus","出","出埃及記","Ex"],["Lev","Leviticus","利","利未記","Le"],["Num","Numbers","民","民數記","Nu"],["Deut","Deuteronomy","申","申命記","De"],["Josh","Joshua","書","約書亞記","Jos"],["Judg","Judges","士","士師記","Jud"],["Ruth","Ruth","得","路得記","Ru"],["1 Sam","First Samuel","撒上","撒母耳記上","1Sa"],["2 Sam","Second Samuel","撒下","撒母耳記下","2Sa"],["1 Kin","First Kings","王上","列王紀上","1Ki"],["2 Kin","Second Kings","王下","列王紀下","2Ki"],["1 Chr","First Chronicles","代上","歷代志上","1Ch"],["2 Chr","Second Chronicles","代下","歷代志下","2Ch"],["Ezra","Ezra","拉","以斯拉記","Ezr"],["Neh","Nehemiah","尼","尼希米記","Ne"],["Esth","Esther","斯","以斯帖記","Es"],["Job","Job","伯","約伯記","Job"],["Ps","Psalms","詩","詩篇","Ps"],["Prov","Proverbs","箴","箴言","Pr"],["Eccl","Ecclesiastes","傳","傳道書","Ec"],["Song","Song of Solomon","歌","雅歌","So"],["Is","Isaiah","賽","以賽亞書","Isa"],["Jer","Jeremiah","耶","耶利米書","Jer"],["Lam","Lamentations","哀","耶利米哀歌","La"],["Ezek","Ezekiel","結","以西結書","Eze"],["Dan","Daniel","但","但以理書","Da"],["Hos","Hosea","何","何西阿書","Ho"],["Joel","Joel","珥","約珥書","Joe"],["Amos","Amos","摩","阿摩司書","Am"],["Obad","Obadiah","俄","俄巴底亞書","Ob"],["Jon","Jonah","拿","約拿書","Jon"],["Mic","Micah","彌","彌迦書","Mic"],["Nah","Nahum","鴻","那鴻書","Na"],["Hab","Habakkuk","哈","哈巴谷書","Hab"],["Zeph","Zephaniah","番","西番雅書","Zep"],["Hag","Haggai","該","哈該書","Hag"],["Zech","Zechariah","亞","撒迦利亞書","Zec"],["Mal","Malachi","瑪","瑪拉基書","Mal"],["Matt","Matthew","太","馬太福音","Mt"],["Mark","Mark","可","馬可福音","Mr"],["Luke","Luke","路","路加福音","Lu"],["John","John","約","約翰福音","Joh"],["Acts","Acts","徒","使徒行傳","Ac"],["Rom","Romans","羅","羅馬書","Ro"],["1 Cor","First Corinthians","林前","哥林多前書","1Co"],["2 Cor","Second Corinthians","林後","哥林多後書","2Co"],["Gal","Galatians","加","加拉太書","Ga"],["Eph","Ephesians","弗","以弗所書","Eph"],["Phil","Philippians","腓","腓立比書","Php"],["Col","Colossians","西","歌羅西書","Col"],["1 Thess","First Thessalonians","帖前","帖撒羅尼迦前書","1Th"],["2 Thess","Second Thessalonians","帖後","帖撒羅尼迦後書","2Th"],["1 Tim","First Timothy","提前","提摩太前書","1Ti"],["2 Tim","Second Timothy","提後","提摩太後書","2Ti"],["Titus","Titus","多","提多書","Tit"],["Philem","Philemon","門","腓利門書","Phm"],["Heb","Hebrews","來","希伯來書","Heb"],["James","James","雅","雅各書","Jas"],["1 Pet","First Peter","彼前","彼得前書","1Pe"],["2 Pet","Second Peter","彼後","彼得後書","2Pe"],["1 John","First John","約一","約翰一書","1Jo"],["2 John","second John","約二","約翰二書","2Jo"],["3 John","Third John","約三","約翰三書","3Jo"],["Jude","Jude","猶","猶大書","Jude"],["Rev","Revelation","啟","啟示錄","Re"]]');
fhl.g_book_allGb = JSON.parse('[["Gen","Genesis","创","创世记","Ge"],["Ex","Exodus","出","出埃及记","Ex"],["Lev","Leviticus","利","利未记","Le"],["Num","Numbers","民","民数记","Nu"],["Deut","Deuteronomy","申","申命记","De"],["Josh","Joshua","书","约书亚记","Jos"],["Judg","Judges","士","士师记","Jud"],["Ruth","Ruth","得","路得记","Ru"],["1 Sam","First Samuel","撒上","撒母耳记上","1Sa"],["2 Sam","Second Samuel","撒下","撒母耳记下","2Sa"],["1 Kin","First Kings","王上","列王纪上","1Ki"],["2 Kin","Second Kings","王下","列王纪下","2Ki"],["1 Chr","First Chronicles","代上","历代志上","1Ch"],["2 Chr","Second Chronicles","代下","历代志下","2Ch"],["Ezra","Ezra","拉","以斯拉记","Ezr"],["Neh","Nehemiah","尼","尼希米记","Ne"],["Esth","Esther","斯","以斯帖记","Es"],["Job","Job","伯","约伯记","Job"],["Ps","Psalms","诗","诗篇","Ps"],["Prov","Proverbs","箴","箴言","Pr"],["Eccl","Ecclesiastes","传","传道书","Ec"],["Song","Song of Solomon","歌","雅歌","So"],["Is","Isaiah","赛","以赛亚书","Isa"],["Jer","Jeremiah","耶","耶利米书","Jer"],["Lam","Lamentations","哀","耶利米哀歌","La"],["Ezek","Ezekiel","结","以西结书","Eze"],["Dan","Daniel","但","但以理书","Da"],["Hos","Hosea","何","何西阿书","Ho"],["Joel","Joel","珥","约珥书","Joe"],["Amos","Amos","摩","阿摩司书","Am"],["Obad","Obadiah","俄","俄巴底亚书","Ob"],["Jon","Jonah","拿","约拿书","Jon"],["Mic","Micah","弥","弥迦书","Mic"],["Nah","Nahum","鸿","那鸿书","Na"],["Hab","Habakkuk","哈","哈巴谷书","Hab"],["Zeph","Zephaniah","番","西番雅书","Zep"],["Hag","Haggai","该","哈该书","Hag"],["Zech","Zechariah","亚","撒迦利亚书","Zec"],["Mal","Malachi","玛","玛拉基书","Mal"],["Matt","Matthew","太","马太福音","Mt"],["Mark","Mark","可","马可福音","Mr"],["Luke","Luke","路","路加福音","Lu"],["John","John","约","约翰福音","Joh"],["Acts","Acts","徒","使徒行传","Ac"],["Rom","Romans","罗","罗马书","Ro"],["1 Cor","First Corinthians","林前","哥林多前书","1Co"],["2 Cor","Second Corinthians","林後","哥林多後书","2Co"],["Gal","Galatians","加","加拉太书","Ga"],["Eph","Ephesians","弗","以弗所书","Eph"],["Phil","Philippians","腓","腓立比书","Php"],["Col","Colossians","西","歌罗西书","Col"],["1 Thess","First Thessalonians","帖前","帖撒罗尼迦前书","1Th"],["2 Thess","Second Thessalonians","帖後","帖撒罗尼迦後书","2Th"],["1 Tim","First Timothy","提前","提摩太前书","1Ti"],["2 Tim","Second Timothy","提後","提摩太後书","2Ti"],["Titus","Titus","多","提多书","Tit"],["Philem","Philemon","门","腓利门书","Phm"],["Heb","Hebrews","来","希伯来书","Heb"],["James","James","雅","雅各书","Jas"],["1 Pet","First Peter","彼前","彼得前书","1Pe"],["2 Pet","Second Peter","彼後","彼得後书","2Pe"],["1 John","First John","约一","约翰一书","1Jo"],["2 John","second John","约二","约翰二书","2Jo"],["3 John","Third John","约三","约翰三书","3Jo"],["Jude","Jude","犹","犹大书","Jude"],["Rev","Revelation","启","启示录","Re"]]');
// sephp.isGb ? fhl.g_book_allGb : fhl.g_book_all
// 2021.07 Snow 太多人用了
fhl.g_book_allAuto = function g_book_allAuto(isGb){
  console.warn("deprecated, fhl.g_book_allAuto 可以用 BibleConstant 取代");
  if (isGb == undefined ){
    throw "2021.07 isGb 參數"
  }  
  return isGb ? fhl.g_book_allGb : fhl.g_book_all
}
// 使用 0-based [0]創紀記、[0]第1章、[0]第1節
// id = 1 是 創世記1章1節
fhl.book_chap_sec_2_id = function book_chap_sec_2_id(iBook, iChap, iSec) {
  var obj = fhl._book_chap_2_id_data[iBook][iChap];
  return obj.id + iSec;
};
//1:絕對id1，是書本0，章節0 (創世紀第1章)
//32:絕對id32，是書本0，章節1 (創世紀第2章)
//供 id_2_book_chap_sec 使用

// 回傳值為 0-base [0]創世紀 [0]第1章 [0]第1節
// 1 <= id <= 31103
fhl.id_2_book_chap_sec = function id_2_book_chap_sec(id) {
  if (id < 1)
    id = 1;
  else if (id > 31103)
    id = 31103

  var obj_base = fhl._id_2_book_chap_sec_data["1"];
  var id_base = 1;
  for (var idbase in fhl._id_2_book_chap_sec_data) {
    if (id < parseInt(idbase))
      break;
    obj_base = fhl._id_2_book_chap_sec_data[idbase];
    id_base = parseInt(idbase);
  }
  if (obj_base == null) {
    console.warn("輸入錯誤的id " + id);
    return null;
  }
  return { iBook: obj_base.b, iChap: obj_base.c, iSec: id - id_base };
};
// mark by snow 2021.07 好像沒有人用了
// // 創: return 0;
// // -1表示不存在,輸入錯了
// fhl.chineses_2_iBook = function chineses_2_iBook(book_chinesename) {
//   for (var idxBook in fhl.g_book_all) {
//     if (fhl.g_book_all[idxBook][2] == book_chinesename) {
//       return parseInt(idxBook);
//     }
//   }
//   return -1;
// }
fhl.engs_2_iBook = function engs_2_iBook(engs) {
  /// <summary> 取得0-based的書卷代碼 </summary>
  /// <param type="string" name="engs" parameterArray="false">Ex: Gen 2 John</param
  for (var idxBook in fhl.g_book_all) {
    if (fhl.g_book_all[idxBook][0] == engs) {
      return parseInt(idxBook);
    }
  }
  return -1;
}
fhl.get_chap_count = function get_chap_count(ibook) {
  var cnum = [50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22];
  if (ibook >= 0 && ibook < 66)
    return cnum[ibook];
}
// 開發給 有聲聖經 用的
// 沒有回傳. 表示ibook=65,ichap=21. 沒有next了
fhl.get_next_chap = function get_next_chap(ibook, ichap) {
  // next
  var ibooknx = ibook;
  var ichapnx = ichap + 1;
  var cnum = fhl.get_chap_count(ibook);
  if (ichapnx >= cnum) {
    ibooknx = ibooknx + 1;
    ichapnx = 0;
  }
  if (ibooknx < 66)
    return { ibook: ibooknx, ichap: ichapnx };
}
// 開發給 有聲聖經 用的
// 沒有回傳. 表示ibook=0,ichap=0. 沒有prev了
fhl.get_prev_chap = function get_prev_chap(ibook, ichap) {
  var ibookpv = ibook;
  var ichappv = ichap - 1;
  if (ichappv == -1) {
    if (ibookpv == 0)
      ibookpv = -1;
    else {
      ibookpv = ibookpv - 1;
      ichappv = fhl.get_chap_count(ibookpv) - 1;
    }
  }
  if (ibookpv != -1)
    return { ibook: ibookpv, ichap: ichappv };
}

/**
 * 不論輸入 Ex Exodus 出 出埃及記 Ex 都會回傳1 (0-based)，若不存在回傳-1
 * @param {string} name 
 * @param {boolean} isgb 是簡體結果顯示嗎(預設false)
 * @returns 
 * @deprecated
 */
fhl.any_name_2_iBook = function any_name_2_iBook(name, isgb) {
  console.warn("deprecated, fhl.any_name_2_iBook 請以 BibleConstantHelperEs6Js 取代.");
  /// <summary> 不論輸入 Ex Exodus 出 出埃及記 Ex 都會回傳1 (0-based)，若不存在回傳-1 </<summary>
  /// <param type="bool" name="gb" parameterArray="false" optional="true">是簡體結果顯示嗎(預設false)</param>
  if (isgb==undefined){
    throw "2021.07 改版，要加 isgb 參數 bool "
  }

  var g_book_all = fhl.g_book_allAuto(isgb)
  var jr1 = Enumerable.from(g_book_all);

  // 會回傳 ["Ex", "Exodus", "出", "出埃及記", "Ex"]
  var jr2 = jr1.firstOrDefault(null, function (a1) {
    if (Enumerable.from(a1).any("a2=>a2=='" + name + "'") == true)
      return true;
    return false;
  });
  if (jr2 == null)
    return -1;

  return jr1.indexOf(jr2);
}

var sephp = sephp || {};
sephp.node_search_result = document.createElement("div");
sephp.node_pre_search = document.createElement("div");
sephp.act_sn_button_click = function act_sn_button_click(pdata) {
  /// <summary> 會傳入 engs, keyword, ver </summary>
  console.log("act_sn_button_click not assign., 會傳入 engs, keyword, ver 資訊. 通常是把查詢輸入的地方文字變為keyword");
  console.log('ex: {engs: "Dan",keyword: "03478",ver: "unv"}');
};
sephp.act_ref_button_click = function act_ref_button_click(pdata) {
  /// <summary> 會傳入 engs, chap, sec, ver 資訊. 通常是用來切換章節</summary>
  console.log("act_ref_button_click not assign., 會傳入 engs, chap, sec, ver 資訊. 通常是用來切換章節");
};
sephp.keyword = "";
sephp.issn = true;
sephp.isgb = false;

