/// <reference path="../../jsdoc/jquery.js" />
/// <reference path="../../jsdoc/linq.d.ts" />
/// <reference path="sephp.create_dialog_presearch.js" />
/// <reference path="fhl_api.js" />
/// <reference path="abvphp_api.js" />
/// <reference path="sephp.search.js" />
var sephp = sephp || {};
sephp.node_sephp_copy = document.createElement("textarea");//copy經文用 .id= 'sephp_copy_id' 2015.08.19(三)
sephp.sn_click = function sn_click(pdata) {
  /// <summary> 查詢後結果,SN按下的時候 </summary>
  // console.log(pdata);

  let elem = pdata.target
  // 使用 jquery
  let span = $(elem)
  // 取得 attr sn N
  let sn = span.attr('sn')
  let N = span.attr('N')
  console.log(sn, N);

  queryDictionaryAndShowAtDialogAsync({ sn, isOld: N == 1 })
  
  // 點擊 sn 時，不要切換 active 節
  pdata.stopPropagation()
  
  // 不再查詢SN，而是改為字典
  // var keyword = pdata.data.keyword;
  // var ver = pdata.data.ver;
  // var engs = pdata.data.engs;
  // sephp.isAll = false;
  // sephp.ibook_cur = fhl.engs_2_iBook(engs);

  // var jret = sephp.pre_search_sn(keyword);
  // var jrets = []; jrets.push(jret);

  // sephp.keyword = keyword;
  // sephp.node_pre_search.innerHTML = "";
  // sephp.node_search_result.innerHTML = "";
  // sephp.create_dialog_presearch(jrets);

  // sephp.act_sn_button_click(pdata);
};
sephp.open_ref_click = function open_ref_click(pdata) {
  /// <summary> 列出經文的白圓圈被點擊的時候 </summary>
  sephp.act_ref_button_click(pdata);
};
sephp.copy_text = function copy_text(pdata) {
  /// <summary> 列出經文的剪刀被點擊的時候 </summary>
  sephp.node_sephp_copy.value = pdata.data.bible_text;

  //console.log($(this).find('.verseContent').text());
  //$('‪#myClipboard‬').text($(this).find('.verseContent').text());
  var copyTextarea = document.querySelector('#sephp_copy_id');
  copyTextarea.select();
  document.execCommand('copy');
};
sephp.create_dialog_search_result = function create_dialog_search_result(jrecords) {
  /// <param type="T[]" name="jrecords" parameterArray="true">ibook, chap, sec, ver, bible_text (通常是排序好了)</param>
  /// <param type="Node" name="node_search_result" parameterArray="true">document.getElementById('search_result')</param>
  
  var div_verse_group = document.createElement("div");
    
  $.each(jrecords, function (idx, obj) {
    // bible_text
    var span_text = qsbphp.create_color_span_from_bible_text(sephp.keyword, obj["bible_text"], "sebutton", "seKey", "seSN");

    // 這個span接著要加入所有的click訊息
    var ver = obj.ver;
    var engs = fhl.g_book_allAuto(sephp.isgb)[obj.ibook][0];
    $(span_text).find('span.seSN').each(function (idx2, obj2) {
      var newkeyword = obj2.innerText.substr(1, obj2.innerText.length - 2);

      $(obj2).click({
        keyword: newkeyword,
        engs: engs,
        ver: ver
      }, sephp.sn_click);
    });//加上each sn的click訊息

    // 準備要加進的 div 與 span 
    var div_one = document.createElement("div");
    var div_left = document.createElement("div");
    var div_right = document.createElement("div");
    $(div_one).addClass("seOneSec");
    $.data(div_one, 'book', fhl.g_book_allAuto(sephp.isgb)[obj.ibook][2]);
    $.data(div_one, 'chap', obj.chap);
    $.data(div_one, 'sec', obj.sec);
    $.data(div_one, 'ver', obj.ver); // add by snow. 2021.07 (要 click 的時候取出來用)
    $.data(div_one, 'engs', fhl.g_book_allAuto(sephp.isgb)[obj.ibook][0]); // add by snow. 2021.07 (要 click 的時候取出來用)
    $(div_left).addClass("seOneSecRef");
    $(div_right).addClass("seOneSecText");
    div_one.appendChild(div_left);
    div_one.appendChild(div_right);
    
    {// 經文加入
      div_right.appendChild(span_text);
    }// 經文加入

    {//經文資訊加入
      //var span_ref = document.createElement("span");
      {// 顯示 (出 1:1 合和本) => 恩洋改成顯示 (合和本) 2015.08.28
        var spanTmp = document.createElement("span");
        var innerSpanTmp = document.createElement("span");
        innerSpanTmp.innerHTML = abvphp.get_cname_from_book(obj.ver, sephp.isgb);
        $(innerSpanTmp).addClass('version');
        spanTmp.appendChild(innerSpanTmp);
        
        // remove 2021.07 不再按這個 2021.07, 按共同的「經文」部分 (但顯示還是要留著)
        // replace 2015.08.05(三)
        // $(spanTmp).addClass("sebutton"); // 
        // $(spanTmp).click({
        //   engs: fhl.g_book_allAuto(sephp.isgb)[obj.ibook][0],
        //   chap: obj.chap,
        //   sec: obj.sec,
        //   ver: obj.ver
        // }, sephp.open_ref_click);

        div_left.appendChild(spanTmp);
      }// 顯示 (出 1:1 合和本) end

      // mark 2015.08.05(三)
      // 2015.08.05(三) 因為沒有其它功能, 所以點經文就好了.
      //{//本視窗開啟
      //  var divTmp = document.createElement("span");
      //  divTmp.innerHTML = "○";
      //  $(divTmp).addClass("sebutton");

      //  $(divTmp).click({
      //    engs: fhl.g_book_all[obj.ibook][0],
      //    chap: obj.chap,
      //    sec: obj.sec,
      //    ver: obj.ver,
      //    bible_text: span_text,
      //    dom: divTmp
      //  }, sephp.open_ref_click);
        
      //  div_left.appendChild(divTmp);
      //}

      // 2015.08.19(三)
      {//copy純文字
        var divTmp = document.createElement("div");
        divTmp.innerHTML = "&nbsp;<i class='fa fa-files-o'></i>";
        $(divTmp).addClass("sebutton");
        $(divTmp).addClass("copy");

        // replace 2015.08.05(三)
        $(divTmp).addClass("sebutton");
        $(divTmp).click({
          engs: fhl.g_book_allAuto(sephp.isgb)[obj.ibook][0],
          chap: obj.chap,
          sec: obj.sec,
          ver: obj.ver,
          bible_text: obj["bible_text"], //copy用的純文字
          dom: divTmp
        }, sephp.copy_text);

        div_one.appendChild(divTmp);
      }
      //div_left.appendChild(span_ref);
    }//經文資訊加入
    
    // 2015.08.28 恩洋
    // 如果已經是最後一個，但是還沒有印出來，就要讓程式繼續找，找到最後已經找完了就也要全部印出來  
    groupAddressAndCreateDoms()
      
    // function callback (滾到最下面的時候,呼叫) 2015.08.19(三)
    // 恩洋修改成離最下面還有 100 時就繼續搜尋 2015.08.26(三)
    $(sephp.node_search_result).scroll(null, function (pdata) {

      if ($(this).scrollTop() + $(this).innerHeight() + 100 >= this.scrollHeight)
      {
        var re = sephp.continue_search();
        if (re != null)
         sephp.create_dialog_search_result(re);
      }

    });
    return // each recorder $.each
    // 在 $.each 寫 return, 下面就是放 each 裡面會用到的局部函式
  
    function groupAddressAndCreateDoms(){
      main ()
      return 
      // 重構 下面恩洋的 if 
      // a1: div_one 
      // a2: div_verse_group.firstChild
      function isNotTheSameVerse(a1,a2){
        if ($.data(a1, "book") != $.data(a2, "book")) return true
        if ($.data(a1, "chap") != $.data(a2, "chap")) return true
        if ($.data(a1, "sec") != $.data(a2, "sec")) return true
        return false
      }
      // 重構，提高可讀性 <div class="seOneSec">
      // 這個含有 $.data book chap sec engs ver (上面初始化設定的)
      function getGroup1stDivSeOneSec(){
        return div_verse_group.firstChild
      }
      // 重構，提高可讀性 <div class="seOneSecRef">
      function getGroup2ndDivSeOneSecRef(){
        return getGroup1stDivSeOneSec().firstChild
      }
      // 重構，提高可讀性 <span> 申 11:1 </span> 這個 span
      function getGroup3rdSpanAddress(){
        return getGroup2ndDivSeOneSecRef().firstChild
      }
      // 重構，提高可讀性 申 11:1 <br/>
      function getAddressStringHtml(dom){
        return $.data(dom, 'book') + "&nbsp;" + $.data(dom, 'chap') + ":" + $.data(dom, 'sec') + "<br/>"
      }
      // 重構，提高可讀性 在 申 11:1 那個 span 加入 click 事件 <br/>
      function addClickEventOnDom(dom){
        var domRef = getGroup1stDivSeOneSec()
        var engs = $.data(domRef, "engs")
        var chap = $.data(domRef, "chap")
        var sec = $.data(domRef, "sec")
        var ver = $.data(domRef, "ver")
        $(dom).click({
          engs: engs,
          chap: chap,
          sec: sec,
          ver: ver
        }, sephp.open_ref_click);
      }
      function generateAddressSpanInGroup(){
        var innerSpanTmp = document.createElement("span");//在同一節的第一個結果版本前面加上 書卷跟章節
        innerSpanTmp.innerHTML = getAddressStringHtml(getGroup1stDivSeOneSec());
        $(innerSpanTmp).addClass('verse');
        getGroup2ndDivSeOneSecRef().insertBefore(innerSpanTmp, getGroup3rdSpanAddress());
        $(innerSpanTmp).addClass('sebutton'); // add by snow. 2021.07
        addClickEventOnDom(innerSpanTmp) // add by snow. 2021.07
        
      }
      function main(){
          if((parseInt($.data($('#search_result')[0], 'cnt_recorder'))-1)===parseInt(idx)){
            if(div_verse_group.hasChildNodes() && isNotTheSameVerse(div_one, getGroup1stDivSeOneSec())){
              generateAddressSpanInGroup()
              sephp.node_search_result.appendChild(div_verse_group);
              div_verse_group = document.createElement("div");
            }  
            div_verse_group.appendChild(div_one);
            generateAddressSpanInGroup() // 必需先上一行, 因為此函式過程會取 group first
            sephp.node_search_result.appendChild(div_verse_group);
          }
          else if(div_verse_group.hasChildNodes() && isNotTheSameVerse(div_one,getGroup1stDivSeOneSec())){
            generateAddressSpanInGroup()
            sephp.node_search_result.appendChild(div_verse_group);
            div_verse_group = document.createElement("div");
            
            div_verse_group.appendChild(div_one);
          }
          else{
            div_verse_group.appendChild(div_one);
          }
        }
      }
  });// each recorder
  
}; // end sephp.create_dialog_result

sephp.continue_search = function continue_search() {
  /// <summary> 卷軸到底的時候,會呼叫此函式來搜尋 </summary>
  // sephp.Lq_ret_group 可說是 input, 例如使用者已經「點選 "創(30)"」，這就是那30筆資料

  // continue search. 需要 jrets2 cnt_search
  var Lq_record = Enumerable.empty();

  var Lq_r4s = sephp.Lq_ret_group.skip(sephp.cnt_search).take(sephp.cnt_set); //只搜0~29筆. 0, 30為參數時
  sephp.cnt_search += sephp.cnt_set;

  var g_book_all = fhl.g_book_allAuto(sephp.isgb)

  var Lq5 = Lq_r4s.groupBy(a1=>a1.ver); // qstr 只能1次1個版本. 所以要分離
  Lq5.forEach(function (a1) {
    if (a1.length == 0)
      return;

    var ver = a1.key();
    
    var default_book_name = g_book_all[a1.getSource()[0].ibook][2];// qsbphp 要用的 default_book_name

    var sqbstr = "#";
    a1.groupBy(a1=>a1.ibook).forEach(function (a2) {
      // Gen
      sqbstr += g_book_all[a2.key()][2] + " "; // 全都用英文 (撒上 1 Sam有Bug, 先全中文好了)

      // 可能會造成太長的結果 (改使用POST即可)
      var Lq3 = Enumerable.from(a2.getSource()).groupBy(a1=>a1.chap,a1=>a1.sec).select(a1=>a1.key()+':'+a1.toJoinedString(",")); //用章節群組
      Lq3.forEach(function (a3) {
        // a2 = 3:1,2,5
        sqbstr += (a3 + ";");
      });
    });// a2 function
    sqbstr += "|";

    //console.log(fhl.g_book_all[a1.ibook][2]);
    var jret_qsb = qsbphp.search_reference(sqbstr, default_book_name, ver, sephp.issn, sephp.isgb);
    Lq_record = Lq_record.concat(Enumerable.from(jret_qsb["record"]));
  });//a1

  if (Lq_record.count() == 0)
    return null;

  // 使用 jr2 來產生繪圖結果
  var jr2 = Lq_record.orderBy(a1=>a1.ibook)
  .thenBy(a1=>a1.chap)
  .thenBy(a1=>a1.sec)
  .select(a1=>{
    return {
      ibook: a1.ibook,
      chap: a1.chap,
      sec: a1.sec,
      ver: a1.ver,
      bible_text: a1.bible_text
    }
  }).toArray()

  return jr2;
  //console.log(jr2);
  //sephp.create_dialog_search_result(jr2);
}
