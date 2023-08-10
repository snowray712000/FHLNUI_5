/// <reference path="../FHL.js" />
/// <reference path="../STR/eachFitDo.js" />
FHL.NET.UrlParameter = (function () {
  function UrlParameter() {
    /// <summary> 
    /// UrlParameter class 
    /// '#/aaa/bbb' 或 '#aaa/bbb' 皆可. 
    /// 在 index.html new 一個全域變數, 例如  
    /// var urlRouter = new URLParameter()
    /// $(urlRouter).on('changed', function(){
    ///     var hashArray = urlRouter.result
    /// })
    /// 通常會用 $(window).trigger('hashchange') 在初始化trigger一次.
    /// </summary>

    if (!(this instanceof arguments.callee))
      throw "It's class, you leak 'new' operator."

    if (FHL === undefined || FHL.STR.eachFitDo === undefined)
      throw "need library include. FHL.STR.eachFitDo."

    // 成員變數 結果.
    this.result = [] // this 全域變數 

    function urlHashParse(hash) {
      /// <summary> 內部用函式 </summary>
      var resultArray = []
      FHL.STR.eachFitDo('(#/|/|#)([^/#]+)', hash, function (r1) {
        resultArray.push(r1[2])
      })
      return resultArray
    }

    var that = this
    window.onhashchange = function () {
      // 2022/04 這裡目前無效，測過了。
      var hash = window.location.hash
      that.result = urlHashParse(hash)
      $(that).trigger('changed')
    }
    $(window).trigger('hashchange') //initial
  }
  return UrlParameter
})()

``