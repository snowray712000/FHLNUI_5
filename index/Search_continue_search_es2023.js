/**
 * 定義型別別名
 * @typedef {import('./Search_Types_es2023').OneSeRecord} OneSeRecord
 */

// import Enumerable from '../libs/jsdoc/linq';

/**
 * @returns {OneSeRecord[]}
 */
export function Search_continue_search() {
  /// <summary> 卷軸到底的時候,會呼叫此函式來搜尋 </summary>
  // sephp.Lq_ret_group 可說是 input, 例如使用者已經「點選 "創(30)"」，這就是那30筆資料

  // continue search. 需要 jrets2 cnt_search
  let Lq_record = []

  let Lq_r4s = sephp.Lq_ret_group.slice(sephp.cnt_search, sephp.cnt_search + sephp.cnt_set); // 只搜0~29筆. 0, 30為參數時
  // var Lq_r4s = sephp.Lq_ret_group.skip(sephp.cnt_search).take(sephp.cnt_set); //只搜0~29筆. 0, 30為參數時
  sephp.cnt_search += sephp.cnt_set;

  var g_book_all = fhl.g_book_allAuto(sephp.isgb)

  var Lq5 = Enumerable.from( Lq_r4s) .groupBy(a1 => a1.ver); // qstr 只能1次1個版本. 所以要分離
  Lq5.forEach(function (a1) {
    if (a1.length == 0)
      return;

    var ver = a1.key();

    var default_book_name = g_book_all[a1.getSource()[0].ibook][2];// qsbphp 要用的 default_book_name

    var sqbstr = "#";
    a1.groupBy(a1 => a1.ibook).forEach(function (a2) {
      // Gen
      sqbstr += g_book_all[a2.key()][2] + " "; // 全都用英文 (撒上 1 Sam有Bug, 先全中文好了)

      // 可能會造成太長的結果 (改使用POST即可)
      var Lq3 = Enumerable.from(a2.getSource()).groupBy(a1 => a1.chap, a1 => a1.sec).select(a1 => a1.key() + ':' + a1.toJoinedString(",")); //用章節群組
      Lq3.forEach(function (a3) {
        // a2 = 3:1,2,5
        sqbstr += (a3 + ";");
      });
    });// a2 function
    sqbstr += "|";

    var jret_qsb = qsbphp.search_reference(sqbstr, default_book_name, ver, sephp.issn, sephp.isgb);
    Lq_record = Lq_record.concat(jret_qsb["record"]);
  });//a1

  if (Lq_record.length == 0)
    return null;

  // 使用 sort 進行多層排序
  Lq_record.sort((a, b) => {
    if (a.ibook !== b.ibook) {
      return a.ibook - b.ibook;
    }
    if (a.chap !== b.chap) {
      return a.chap - b.chap;
    }
    return a.sec - b.sec;
  });
  // 使用 map 進行投影
  const jr2 = Lq_record.map(a1 => {
    return {
      ibook: a1.ibook,
      chap: a1.chap,
      sec: a1.sec,
      ver: a1.ver,
      bible_text: a1.bible_text
    };
  });
  return jr2
}