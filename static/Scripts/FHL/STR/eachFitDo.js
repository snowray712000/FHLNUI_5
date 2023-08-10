FHL.STR.eachFitDo = (function () {
  function eachFitDo(regPattern, strTest, fnDoEach) {
    /// <summary> matchResult = exec(strTest), 回傳值會作為 callback whenExec 的第1個參數, 通常取 matchResult[0] 是字串 </summary>
    /// <param type="function()" name="fnDoEach" parameterArray="false"> while( match = regex.match(strTest)) fnDoEach(match) </param>
    var exp1 = new RegExp(regPattern, 'g');
    var match = null;
    while ((match = exp1.exec(strTest)) !== null) {
      fnDoEach(match);
    }
  }
  return eachFitDo
})()
