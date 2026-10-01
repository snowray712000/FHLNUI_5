/// <reference path="fhl_api.js" />
/// <reference path="../../jsdoc/jquery.js" />
/// <reference path="../../jsdoc/linq.d.ts" />
var fhl = fhl || {};
var abvphp = abvphp || {};

// 小雪 常常要用到 聖經版本資訊 但是不斷的 abv.php 是沒必要的. 查一次就好. 然後存到全域變數
// "和合本": {A}, "原文直譯(參考用)":{A}, "KJV": {A} .....
// A.book: "unv", A.ntonly: "0", A.otonly: "0", strong: "0"

/**
 * @type {{string:string}}
 */
abvphp.g_bibleversions = {};
abvphp.g_bibleversionsGb = {};

// 先用快照填 (abvphp_snapshot.js，npm run gen:uiabv 產生)，開頁就有譯本名稱；uiabv.php 回來後再覆蓋
if (typeof abvphpSnapshot != "undefined") {
  abvphpSnapshot.rows.forEach(function (a) {
    abvphp.g_bibleversions[a[1]] = { book: a[0], ntonly: a[3], otonly: a[4], strong: a[5] }
    abvphp.g_bibleversionsGb[a[2]] = { book: a[0], ntonly: a[3], otonly: a[4], strong: a[5] }
  })
}

/**
 * index.js 裡會用, 因為它要確定抓過了嗎
 * @returns {boolean}
 */
abvphp.isReadyGlobalBibleVersions = function () {
  return Object.keys(abvphp.g_bibleversions).length != 0 &&
    Object.keys(abvphp.g_bibleversionsGb).length != 0
}
// obj[和合本].book = unv
var abvphpReadyPromise = null
abvphp.init_g_bibleversions = function init_g_bibleversions() {
  if (abvphpReadyPromise != null) { return abvphpReadyPromise }

  // 兩支都完成 (成功或失敗) 才 resolve；失敗時字典是空的，呼叫端要自己退回譯本代碼
  abvphpReadyPromise = Promise.all([
    fhl.json_api_text("uiabv.php?gb=0", fn2),
    fhl.json_api_text("uiabv.php?gb=1", fn3)
  ]).catch(function (er) { console.error(er) })
  return abvphpReadyPromise

  /// dict 可能是 abvphp.g_bibleversions 或 abvphp.g_bibleversionsGb
  function fnCore(r1, dict) {
    var r2 = JSON.parse(r1)
    var r3 = r2["record"]
    r3.forEach(function (it) {
      var obj = {
        book: it["book"],
        ntonly: it["ntonly"],
        otonly: it["otonly"],
        strong: it["strong"]
      }
      dict[it["cname"]] = obj
    })
  }
  function fn2(r1) {
    abvphp.g_bibleversions = {};
    fnCore(r1, abvphp.g_bibleversions)
    console.log('完成 abvphp.')
  }
  function fn3(r1) {
    abvphp.g_bibleversionsGb = {};
    fnCore(r1, abvphp.g_bibleversionsGb)
    console.log('完成 abvphpGb.')
  }

};//init g_bibleversions

$(function () {
  abvphp.init_g_bibleversions();
});

/**
 * 確定 books 的譯本名稱查得到。快照裡有就馬上 resolve；有查不到的 (快照之後 FHL 新加的譯本) 才等 uiabv.php，
 * 最多等 timeoutMs，逾時或失敗都照樣 resolve，此時 get_cname_from_book 回傳 ""
 * @param {string[]} books 例如 ["unv", "kjv"]
 * @param {boolean} isgb
 * @param {number} [timeoutMs=5000]
 * @returns {Promise<void>}
 */
abvphp.readyAsync = function (books, isgb, timeoutMs) {
  var isAllFound = books.every(function (book) { return abvphp.get_cname_from_book(book, isgb) != "" })
  if (isAllFound) { return Promise.resolve() }
  var timeout = new Promise(function (res) { setTimeout(res, timeoutMs == null ? 5000 : timeoutMs) })
  return Promise.race([abvphp.init_g_bibleversions(), timeout]).then(function () { })
};

/// <summary> unv 取得 '和合本' </summary>
/// <param type="string" name="book" parameterArray="false">Ex: unv</param>
/// <param type="bool" name="isgb" parameterArray="false">0 or 1</param>
abvphp.get_cname_from_book = function (book, isgb) {
  /// <summary> unv 取得 '和合本' </summary>
  /// <param type="string" name="book" parameterArray="false">Ex: unv</param>
  /// <param type="bool" name="isgb" parameterArray="false">0 or 1</param>
  var dict = isgb == false ? abvphp.g_bibleversions : abvphp.g_bibleversionsGb
  var ret = "";
  $.each(dict, function (key, obj) {
    if (obj.book.localeCompare(book) == 0) {
      ret = key;
      return;
    }
  });//foreach
  return ret;
};

/**
 * 
 * @param {string} cname 
 * @param {boolean} isgb 
 * @returns {string?}
 */
abvphp.get_book_from_cname = function (cname, isgb) {
  if (isgb == undefined) {
    isgb = pageState.gb != 0
  }
  var dict = isgb == false ? abvphp.g_bibleversions : abvphp.g_bibleversionsGb

  var r1 = dict[cname]
  if (r1 == undefined) { return undefined }
  return r1.book
}
