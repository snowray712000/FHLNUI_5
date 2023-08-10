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

/**
 * index.js 裡會用, 因為它要確定抓過了嗎
 * @returns {boolean}
 */
abvphp.isReadyGlobalBibleVersions = function () {
  return Object.keys(abvphp.g_bibleversions).length != 0 &&
    Object.keys(abvphp.g_bibleversionsGb).length != 0
}
// obj[和合本].book = unv
var isAlreadySendCommand = false
abvphp.init_g_bibleversions = function init_g_bibleversions() {
  if (isAlreadySendCommand) { return }
  isAlreadySendCommand = true

  var isAsync = true
  fhl.json_api_text("uiabv.php?gb=0", fn2, null, null, isAsync)
  fhl.json_api_text("uiabv.php?gb=1", fn3, null, null, isAsync)

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

function gAbvphp() {

  /** @type {{string:string}} */
  abvphp.g_bibleversionsGb = {}
  /** @type {{string:string}} */
  abvphp.g_bibleversions = {}
  abvphp.isReadyGlobalBibleVersions = isReadyGlobalBibleVersions
  abvphp.init_g_bibleversions = init_g_bibleversions
  abvphp.get_cname_from_book = get_cname_from_book
  abvphp.get_book_from_cname = get_book_from_cname

  // 小雪 常常要用到 聖經版本資訊 但是不斷的 abv.php 是沒必要的. 查一次就好. 然後存到全域變數
  // "和合本": {A}, "原文直譯(參考用)":{A}, "KJV": {A} .....
  // A.book: "unv", A.ntonly: "0", A.otonly: "0", strong: "0"
  function abvphp() { }
  /**
   * index.js 裡會用, 因為它要確定抓過了嗎
   * @returns {boolean}
   */
  function isReadyGlobalBibleVersions() {
    return Object.keys(abvphp.g_bibleversions).length != 0 &&
      Object.keys(abvphp.g_bibleversionsGb).length != 0
  }
  // obj[和合本].book = unv
  var isAlreadySendCommand = false
  function init_g_bibleversions() {
    if (isAlreadySendCommand) { return }
    isAlreadySendCommand = true

    var isAsync = true
    fhl.json_api_text("uiabv.php?gb=0", fn2, null, null, isAsync)
    fhl.json_api_text("uiabv.php?gb=1", fn3, null, null, isAsync)

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



  /// <summary> unv 取得 '和合本' </summary>
  /// <param type="string" name="book" parameterArray="false">Ex: unv</param>
  /// <param type="bool" name="isgb" parameterArray="false">0 or 1</param>
  function get_cname_from_book(book, isgb) {
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
  function get_book_from_cname(cname, isgb) {
    if (isgb == undefined) {
      isgb = pageState.gb != 0
    }
    var dict = isgb == false ? abvphp.g_bibleversions : abvphp.g_bibleversionsGb

    var r1 = dict[cname]
    if (r1 == undefined) { return undefined }
    return r1.book
  }
  return abvphp
}