/// <reference path="../../jsdoc/jquery.js" />
/// <reference path="../../jsdoc/linq.d.ts" />
/// <reference path="fhl_api.js" />
/// <reference path="sephp.create_dialog_search_result.js" />
/// <reference path="sephp.se_record_2_qsb_str.js" />
var sephp = sephp || {};
sephp.cnt_set = 15;// continue search use, 不會變, 一次讀幾筆
sephp.cnt_search = 0; // continue search use
sephp.Lq_ret_group = Enumerable.empty();// continue search use (所有jrets2中,且在ibooks中的)
sephp.pre_search_click = function pre_search_click(pdata) {
  /// <summary> 使用於使用者按下 button 後繼續查詢的結果 </summary>
  /// <param type="T" name="pdata" parameterArray="false">{jrets:...,issn:...,ibooks:[...]}</param>
  /// <param type="Node" name="node_search_result" parameterArray="true">document.getElementById('search_result')</param>
  /// <mark> 這裡不要實作查詢後的結果怎麼畫,因為查詢reference之後也要畫結果.這兩個動作應該獨立一個函式.再從這串接 
  /// 2015.08.01(六) 
  /// 1. 若是 group, 則先隱藏所有, 再把同個group的顯示
  /// 2. 若是筆數>100, 則group搜尋不要自動.
  /// </mark>
  /// add 2015.07.21(二)
  /// 恩洋把所有span 修改成div
  /// add 2015.08.26(三)
  var jrets = pdata.data.jrets;
  var jret2 = pdata.data.jret2;
  var ibooks = pdata.data.ibooks;
  var issn = sephp.issn;
  var cnt_recorder = pdata.data.cnt; //2015.08.01(六)
  var group_name = pdata.data.group_name;
  var book_name = pdata.data.book_name;
  //var cnt_search = pdata.data.cnt_search; //2015.08.17(一)

  sephp.cnt_search = 0;//初始化
  sephp.Lq_ret_group = Enumerable.empty();//初始化
    
  sephp.node_search_result.innerHTML = '<i class="fa fa-spinner fa-pulse center"></i>';
    
  if (typeof book_name === "undefined")
    $('.group_name.selected + .div_books').slideUp(400);
  $.data($('#search_result')[0], 'cnt_recorder', cnt_recorder);

  setTimeout(function() {
      // 2015.08.01(六) 
      if (ibooks.length > 1) // group click
      {
        var domDivBook = document.getElementsByClassName("div_books");

        // step1: 全隱藏 0-65
        $(domDivBook).children().each(function (idx, obj) {
          $(obj).addClass("invisible");
        });

        // step2: 有結果 && 在 ibooks 範圍內的顯示
        $.each(ibooks, function (idx, obj) {
          var domDiv = $(domDivBook).find(':nth-child(' + (obj + 1) + ')').each(function (idx2, obj2) {
            if ($(this).hasClass("presearch_div_exist")) {
              $(this).removeClass("invisible");
            }
          });
        });
      }

      // 如果有30筆限制,其實可以找 2015.08.19(三)
      //// 2015.08.01(六) ... > 100 筆不要搜尋
      //if (cnt_recorder > 100 && ibooks.length > 1)
      //{
      //  return;
      //}

      if (isNaN(parseInt(sephp.keyword)) == false)
        issn = true;

      var isgb = sephp.isgb;

      // Lq_r3s 就是 filter 後結果, 例如，只點「創」，然後有 18 筆。
      // 後面就是將 這些 顯示出來
      var Lq_r3s = Enumerable.empty();
      {//jrets只留ibooks裡的 2015.08.17(一)
        var Lq_ibooks = Enumerable.from(ibooks);

        Lq_r3s = Enumerable.from(jret2).where(function (a1) {
          if (Lq_ibooks.contains(a1.ibook))
            return true;
          return false;
        });
      }
      sephp.Lq_ret_group = Lq_r3s; //2015.08.19(三) continue search

      var re = sephp.continue_search();
      if (re != null)
      {
        sephp.node_search_result.innerHTML = "";
        sephp.create_dialog_search_result(re);
      }

      if (typeof book_name !== "undefined") {//when book_name is clicked
        $('.div_books .book').removeClass('selected');
        $('.div_books .book[book_name="'+book_name+'"]').addClass('selected');
      }
      else{
        //$('.div_books').removeClass('selected');
        $('.div_books .book').removeClass('selected');
        if(!$('.group_name[group_name="'+group_name+'"]').hasClass('selected')){//如果按下去的按鈕是沒有selected 的
          $('.group_name').removeClass('selected');
          
          if(group_name !== '整卷聖經' )
            $('.group_name[group_name="'+group_name+'"]').next('.div_books').slideDown(400);
          $('.group_name[group_name="'+group_name+'"]').addClass('selected');
        }
        else
          $('.group_name').removeClass('selected');
      }
  }, 400);
  
};//pre_search_click

/**
 * @typedef {Object} OneSeRecord
 * @property {number} chap
 * @property {number} sec
 * @property {number} ibook 3
 * @property {string} engs Num
 * @property {string} chineses 民
 * @property {string} ver lcc
 * @property {string} bible_text
 * @typedef {Object} OneVerResult
 * @property {string} key
 * @property {OneSeRecord[]} record
 * @property {number} record_count
 */

/**
 * 
 * @param {(OneVerResult | null)[]} jrets 
 */
sephp.create_dialog_presearch = function create_dialog_presearch(jrets) {
  /// <param type="jret[]" name="jrets" parameterArray="true">通常是 pre_search_sn pre_search_keyword 結果</param>
  const jrets_a = jrets.filter(a1=>a1 != null);

  var jret2 = {};
  {//2015.08.13(四) 先把先有排序
    // 合併
    var Lq_tmp = Enumerable.empty();
    $.each(jrets_a, function (idx, obj) {
      Lq_tmp = Lq_tmp.concat(Enumerable.from(obj.record));
    });

    // 排序
    Lq_tmp = Lq_tmp.orderBy(a1=>a1.ibook).thenBy(a1=>a1.chap).thenBy(a1=>a1.sec)

    jret2 = Lq_tmp.toArray();
  }

  //合併 jrets 中的 record 
  var Lq1 = Enumerable.empty();
  $.each(jrets_a, function (idx, jret) {
    Lq1 = Lq1.concat(Enumerable.from(jret["record"]));
  });

  //列出有哪些經卷有值  
  var distinct_ibooks = [];
  var cnt_ibooks = {}; //0:32 表示創世記 32 筆 //Ex: {1: 2, 8: 1, 39: 2, 44: 1, 45: 3, 47: 1, 50: 1}
  Lq1.groupBy(a1=>a1.ibook).forEach(function (a1) {
    cnt_ibooks[a1.key()] = a1.getSource().length
    distinct_ibooks.push(a1.key());
  });

  //group gook
  var div_groups = document.createElement("div");
  div_groups.id = "div_groups";

  // action ... add to div_groups
  var act_create_one_group = function (group_name, group_ibooks) {
    /// <param type="string" name="group_name" parameterArray="false">ex 摩西五經</param>
    /// <param type="string" name="group_ibooks" parameterArray="true">ex [0 1 2 3 4]</param>

    var div = document.createElement("div");
    // span.innerText = group_name;//加上數量
    div.className = "group_name";
    div.setAttribute("group_name", group_name);
    div_groups.appendChild(div);

    var isExistResult = Enumerable.from(group_ibooks).any(function (a1) {
      if (Enumerable.from(distinct_ibooks).contains(a1))
        return true;
      return false;
    });
    var cnt_recorder = 0;//2015.08.01(六) ... 限制100筆就自動查
    if (isExistResult) {
      var cnt = 0;
      $.each(group_ibooks, function (idx, obj) {
        if (cnt_ibooks[obj] != undefined)
          cnt += cnt_ibooks[obj];
      });
      div.innerText = group_name + "(" + cnt + ")";
      cnt_recorder = cnt;
    }
    else
      div.innerText = group_name;

    $(div).addClass('presearch_div_button');
    if (isExistResult) {
      $(div).addClass("presearch_div_exist");
    } else {
      $(div).addClass("presearch_div_empty");
    }

    // click
    if (isExistResult) {
      $(div).click(
        {
          jrets: jrets,
          jret2: jret2,
          ibooks: group_ibooks, // ex[0 1 2 3 4 5]
          cnt: cnt_recorder,
          group_name: group_name
          //issn: issn,
          //isgb: isgb,
        }
        , sephp.pre_search_click);
    }// click 

  };// act_create_one_group

    
  ///目前我的做法是先把每個分類的下面都加上所有搜尋出來的書卷，但只有讓點選的那個類別顯示
  ///雖然這樣的做法比較消耗資源，但是我還沒有時間仔細去看其他部分的code，因此先用這個方法
  ///by 恩洋 2015.8.26
  $.each(fhl.g_book_group, function (key, val) {
    act_create_one_group(gbText(key), val)
      
    // each book
    var div_books = document.createElement("div");
    div_books.className = "div_books";
    {
      // 2021.07 Snow, 修改, 簡體中文搜尋分類還是繁體(且為影響正確性)
      var g_book_all = sephp.isgb == false ? fhl.g_book_all : fhl.g_book_allGb 
    //2015.08.01(六)
    Enumerable.range(0, 66).forEach(function (ibook) {
      var div = document.createElement("div");

      $(div).addClass('invisible');//第1次建立的時候,全都隱藏.
      $(div).addClass('book');
      div.setAttribute("book_name", g_book_all[ibook][2]);
      if ( cnt_ibooks[ibook] != null )
      {
        $(div).addClass('presearch_div_button');
        $(div).addClass("presearch_div_exist");

        div.innerText = g_book_all[ibook][2] + "(" + cnt_ibooks[ibook] + ")"; //創(52) ...52筆結果
      }
      else
        div.innerText = g_book_all[ibook][2]; // 創

      div_books.appendChild(div);

      // click
      var group_ibooks = [];
      group_ibooks.push(ibook); //一本書 (key會被轉為string)
      $(div).click(
        {
          jrets: jrets,
          jret2: jret2,
          ibooks: group_ibooks,
          cnt: cnt_ibooks[ibook],
          book_name: g_book_all[ibook][2]
        }
        , sephp.pre_search_click);
    });
    }
    div_groups.appendChild(div_books);
  });

  sephp.node_pre_search.appendChild(div_groups);

  // copy 功能
  sephp.node_pre_search.appendChild(sephp.node_sephp_copy);
  sephp.node_sephp_copy.id = "sephp_copy_id";
  $(sephp.node_sephp_copy).css('position', 'fixed');
  $(sephp.node_sephp_copy).css('z-index', '-10000');
  $(sephp.node_sephp_copy).css('opacity', '0.0');//若只有這個,沒有z-index是不行的.可能會在點選的時候擋到人家. 也不能用display:none, 會copy失效
 
  // 一開始就把所有的結果找出來 2015.08.19(三) (限制在30筆內)
  sephp.cnt_search = 0;//初始化
  sephp.Lq_ret_group = Enumerable.from(jret2); //所有都在ibooks
  var re = sephp.continue_search();
  
  if (re != null) {
    var cnt = 0;// 恩洋加上這一段，為了讓別的地方可以把同樣的經文但不同版本分類
    $.each(fhl.g_book_group["整卷聖經"], function (idx, obj) {
    if (cnt_ibooks[obj] != undefined)
      cnt += cnt_ibooks[obj];
    });
    $.data($('#search_result')[0], 'cnt_recorder', cnt);
    $('.group_name[group_name="整卷聖經"]').addClass('selected');
      
    sephp.node_search_result.innerHTML = "";
    sephp.create_dialog_search_result(re);
  }
};