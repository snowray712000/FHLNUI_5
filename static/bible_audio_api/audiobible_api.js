var fhl = fhl || {};
var abvphp = abvphp || {};
var sephp = sephp || {};
var audiobible = audiobible || {};

// defined react class
audiobible.R = audiobible.R || {
  version_item: React.createClass({
    _onclick: function () {
      this.props._set_cur(this.props.na);
    },
    render: function () {
      return React.createElement("div", {
        onClick: this._onclick,
        style: {
          zIndex: 1201,
          "cursor": "pointer",
          "white-space": "nowrap"
        }
      }, this.props.na);
    }
  }),
  version: React.createClass({
    _onclick_cur_button: function () {
      this.setState({ isvisible_combo: !this.state.isvisible_combo });
    },
    _set_cur: function (na) {
      /// <summary> 給 item onclick 時呼叫的 </summary>

      // 相同, 沒有變化
      if (na == this.props.ver_cur)
        return;

      if (this.props.pfn_switch == null)
        return;

      this.props.pfn_switch(na);

      // 設定上層的. 
      this.props._set_asrc_with_version(na);
    },
    getDefaultProps: function () {
      return {
        pfn_switch: null ,
        ver_cur:"和合本",
        vers: ["和合本", "現代中文譯本", "台語女聲", "台語男聲", "紅皮聖經", "廣東話", "希臘文", "客語"]
      };
    },
    getInitialState: function () {
      return {
        top_combo: "0px",
        width_combo: "0px",
        isvisible_combo: true // 先true,在DidMount再隱藏.這樣才能算寬度
      };
    },
    componentWillMount: function () {
      this.setState({
        isvisible_combo: true// 先true,在DidMount再隱藏.這樣才能算寬度
      });
    },
    componentDidMount: function () {
      var com_cur = this.refs.cur.getDOMNode();
      var com_combo = this.refs.combo.getDOMNode();

      //console.log($(com_combo).width());
      //console.log($(com_cur).height());
      this.setState({
        //width_combo: $(com_combo).width(),
        //top_combo: $(com_cur).height(),//$(com_combo).css("top", $(com_cur).height());
        isvisible_combo: false// 先true,在DidMount再隱藏.這樣才能算寬度
      });
    },
    componentDidUpdate: function () {
      if ( this.state.isvisible_combo == true )
      {
        var com_cur = this.refs.cur.getDOMNode();
        var com_combo = this.refs.combo.getDOMNode();

        if ($(com_combo).width() == 0)
          return;

        if ($(com_combo).width() != this.state.width_combo ) {
          this.setState({
            width_combo: $(com_combo).width()
            //top_combo: $(com_cur).height(),//$(com_combo).css("top", $(com_cur).height());
          });
        }

        top_combo: $(com_cur).height();
        if ($(com_cur).height() != this.state.top_combo){
          this.setState({
            top_combo: $(com_cur).height(),//$(com_combo).css("top", $(com_cur).height());
          });
        }
      }
    },
    componentWillReceiveProps: function (nextProps) {},
    render: function () {

      var r_cur = React.createElement("div", {
        onClick: this._onclick_cur_button,
        ref: "cur",
        style: {
          "width": this.state.width_combo,
          "white-space": "nowrap",
          "min-height": "24px",
          cursor: "pointer"
        }
      }, this.props.ver_cur);

      var pthis = this;
      var r_items = this.props.vers.map(function (a1, a2) {
        var ro = React.createElement(audiobible.R.version_item, {
          _set_cur: pthis._set_cur,
          na: a1
        });

        return ro;
      });

      var r_combox = React.createElement("div", {
        ref: "combo",
        style: {
          "background-color":"#E0E0E0",
          zIndex:1200,
          position: "absolute",
          top: this.state.top_combo
        }// style
      },
        r_items);

      return React.createElement("div",{}, r_cur, (this.state.isvisible_combo) ? r_combox : null);
      //return React.createElement("div", { style: { display: "inline-block", "vertical-align": "top" } }, r_cur, (this.state.isvisible_combo) ? r_combox : null);
    }
  }),
  
};//defined react class

audiobible.r = {};
audiobible.r.vers = React.createElement(audiobible.R.version);

audiobible.c_audiobible = function c_audiobible() { };// 定義有一個 class c_param{};

audiobible.c_audiobible.prototype.m_cur_idx = 1;
audiobible.c_audiobible.prototype.m_ibook = 0;
audiobible.c_audiobible.prototype.m_ichap = 0;
audiobible.c_audiobible.prototype.m_dstdiv = null;
audiobible.c_audiobible.prototype.m_divs = null;
audiobible.c_audiobible.prototype.m_isplaying = false;
audiobible.c_audiobible.prototype.m_isexist_audio_url = true;//某些版本聖經語言，只有新約時，就是false
audiobible.c_audiobible.prototype.m_pfn_after_set = null;//如果沒設定，就不呼叫 fn(ichap,ibook) 

function measure_cx_cy(div_can_see, txt) {
  var span1 = document.createElement("span");
  div_can_see.appendChild(span1);
  $(span1).text(txt);

  var obj = { cx: $(span1).width(), cy: $(span1).height() };
  div_can_see.removeChild(span1);
  return obj;
}
function init_dropdownlist(div_dropdownlist, items, item_init, fn_switch) {
  var pfn_switch = fn_switch; // fn_switch(txt)

  var div_main = div_dropdownlist;
  div_main.innerHTML = "";
  $(div_main).css("position", "relative");
  $(div_main).css("display", "inline-block");//一開始還不要inline-blcok，不然寬度max_cx會算錯
  $(div_main).css("vertical-align", "top");//一開始還不要inline-blcok，不然寬度max_cx會算錯

  var div_cur = document.createElement("div");
  div_main.appendChild(div_cur);
  $(div_cur).css("display", "div");
  $(div_cur).css("cursor", "pointer");

  div_cur.innerText = item_init + "▼";

  var div_items = document.createElement("div");
  div_main.appendChild(div_items);
  $(div_items).css("display", "inline-block");//一開始還不要隱藏，因為要取得max_cx，取得後再隱藏
  $(div_items).css("position", "absolute");
  $(div_items).css("left", "0px");
  //$(div_items).css("top", $(div_cur).css("height"));//這裡算只會得到零,算出maxcy再指定吧
  var max_cx = 0;
  var max_cy = 0;
  for (var idx in items) {
    var item_text = items[idx];
    var div_item = document.createElement("div");
    div_item.innerText = item_text;
    $(div_item).css("display", "inline-block");
    if (idx != 0)
      div_items.innerHTML += "<br/>";

    $(div_item).css("z-index", "503");
    $(div_item).css("cursor", "pointer");

    div_items.appendChild(div_item);

    // 算 max cx max cy
    {
      var cxcy = measure_cx_cy(audiobible.g_audiobible.m_dstdiv, item_text);
      var cx = cxcy.cx;
      var cy = cxcy.cy;
      if (max_cx < cx)
        max_cx = cx;
      if (max_cy < cy)
        max_cy = cy;
    }// 算 max cx max cy
  }// for each items

  $(div_cur).width(max_cx + 20);
  $(div_items).width(max_cx + 20);
  $(div_items).css("display", "none");//一開始還不要隱藏，因為要取得max_cx，取得後再隱藏
  $(div_main).css("display", "inline-block");//一開始還不要inline-blcok，不然寬度max_cx會算錯
  $(div_items).css("top", max_cy);//這裡算只會得到零,算出maxcy再指定吧


  $(div_cur).css("text-align", "center");
  $(div_items).css("text-align", "center");
  $(div_items).css("z-index", "500");
  $(div_items).css("back-groundcolor", "white");

  $(div_items).find("div").each(function () {
    $(this).width(max_cx + 20);
    $(this).click(function () {
      $(div_cur).text($(this).text());
      if (pfn_switch != null)
        pfn_switch($(this).text());
      //隱藏起來
      $(div_items).css('display', 'none');
      //$(div_items).animate({ display: 'none' }, 300, 'easeOutBack');
    });
  });

  $(div_cur).click(function () {
    // 彈出選單
    $(div_items).css('display', 'inline-block');
  });
}
// 2 要變 002 就用 pad(2,3);
function pad(num, size) {
  var s = "000000000" + num;
  return s.substr(s.length - size);
}
// 給 fn_unv1 fn_tcv 用的 (他們只有root不一樣)
function fn_read_bible_common_filename1(ibook, ichap) {
  // <source id="mp3" src="http://media.fhl.net/unv1/2/2_004.mp3" type="audio/mpeg"> 出埃及記
  // <source id="mp3" src="http://media.fhl.net/unv1/40/40_001.mp3" type="audio/mpeg"> 馬太福音
  var filename = (ibook + 1).toString() + "/" + (ibook + 1).toString() + "_" + pad(ichap + 1, 3) + ".mp3";
  // return 
  var re1 = {};
  re1.cur = filename;
  return re1;
}
// 0-based ibook ichap (和合本)
function fn_unv1(ibook, ichap) {
  // <source id="mp3" src="http://media.fhl.net/unv1/2/2_004.mp3" type="audio/mpeg"> 出埃及記
  // <source id="mp3" src="http://media.fhl.net/unv1/40/40_001.mp3" type="audio/mpeg"> 馬太福音
  var root1 = "http://media.fhl.net/unv1/";
  var re2 = fn_read_bible_common_filename1(ibook, ichap);
  // return 
  var re1 = {};
  re1.cur = root1 + re2.cur;
  return re1;
}
// 0-based ibook ichap (現代中文譯本)
function fn_tcv(ibook, ichap) {
  //<source id="mp3" src="http://media.fhl.net/tcv/40/40_001.mp3" type="audio/mpeg">
  //<source id="mp3" src="http://media.fhl.net/tcv/40/40_002.mp3" type="audio/mpeg">
  //<source id="mp3" src="http://media.fhl.net/tcv/1/1_002.mp3" type="audio/mpeg">
  var root1 = "http://media.fhl.net/tcv/";
  var re2 = fn_read_bible_common_filename1(ibook, ichap);
  var re1 = {};
  re1.cur = root1 + re2.cur;
  return re1;
}
// 0-based ibook ichap (台語女聲)
function fn_Taiwanese(ibook, ichap) {
  //台語女聲
  //<source id="mp3" src="http://media.fhl.net/Taiwanese/55/55_003.mp3" type="audio/mpeg">
  //<source id="mp3" src="http://media.fhl.net/Taiwanese/1/1_001.mp3" type="audio/mpeg">
  var root1 = "http://media.fhl.net/Taiwanese/";
  var re2 = fn_read_bible_common_filename1(ibook, ichap);
  var re1 = {};
  re1.cur = root1 + re2.cur;
  return re1;
}
function fn_tai(ibook, ichap) {
  //台語男聲 (新約only)
  //<source id="mp3" src="http://media.fhl.net/tai/40/40_001.mp3" type="audio/mpeg">
  if (ibook < 39)
    return null;

  var root1 = "http://media.fhl.net/tai/";
  var re2 = fn_read_bible_common_filename1(ibook, ichap);
  var re1 = {};
  re1.cur = root1 + re2.cur;
  return re1;
}
function fn_apsk(ibook, ichap) {
  //紅皮聖經 (新約only)
  //<source id="mp3" src="http://media.fhl.net/apsk/40/40_001.mp3" type="audio/mpeg">
  if (ibook < 39)
    return null;

  var root1 = "http://media.fhl.net/apsk/";
  var re2 = fn_read_bible_common_filename1(ibook, ichap);
  var re1 = {};
  re1.cur = root1 + re2.cur;
  return re1;
}
function fn_Cantonese1(ibook, ichap) {
  //廣東話 (新約only)
  //<source id="mp3" src="http://media.fhl.net/Cantonese1/40/40_001.mp3" type="audio/mpeg">
  if (ibook < 39)
    return null;

  var root1 = "http://media.fhl.net/Cantonese1/";
  var re2 = fn_read_bible_common_filename1(ibook, ichap);
  var re1 = {};
  re1.cur = root1 + re2.cur;
  return re1;
}

function fn_greek(ibook, ichap) {
  //希臘文 新約only
  //<source id="mp3" src="http://media.fhl.net/greek/40/40_001.mp3" type="audio/mpeg">
  if (ibook < 39)
    return null;

  var root1 = "http://media.fhl.net/greek/";
  var re2 = fn_read_bible_common_filename1(ibook, ichap);
  var re1 = {};
  re1.cur = root1 + re2.cur;
  return re1;
}
function fn_haka(ibook, ichap) {
  //客語 (新約only)
  //<source src="http://media.fhl.net/haka/40/40_001.ogg" type="audio/ogg">
  if (ibook < 39)
    return null;

  var root1 = "http://media.fhl.net/haka/";
  var re2 = fn_read_bible_common_filename1(ibook, ichap);
  var re1 = {};
  re1.cur = root1 + re2.cur;
  return re1;

  //福州話 (新舊約都沒有)
  //希伯來文 (新舊約都沒有)
}

audiobible.c_audiobible.prototype.m_versions = ["和合本", "現代中文譯本", "台語女聲", "台語男聲", "紅皮聖經", "廣東話", "希臘文", "客語"];
audiobible.c_audiobible.prototype.fn_audio_srcs = [fn_unv1, fn_tcv, fn_Taiwanese, fn_tai, fn_apsk, fn_Cantonese1, fn_greek, fn_haka];

audiobible.c_audiobible.prototype.set_book_chap = function set_book_chap(ibook, ichap, dstdiv) {
  this.m_ibook = ibook;
  this.m_ichap = ichap;
  this.m_dstdiv = dstdiv;

  this.create();
  this.m_dstdiv.innerHTML = "";
  this.m_dstdiv.appendChild(this.m_divs.big_img);
  this.m_dstdiv.appendChild(this.m_divs.main);


}//set_book_chap
audiobible.c_audiobible.prototype.create = function create() {
  var divs = {};
    
  /* added by sean */
  var div_big_img = document.createElement("div");
  divs.big_img = div_big_img;
  var fa_stack = document.createElement("span");
  fa_stack.className = "fa-stack";
  var fa_dot_circle_o = document.createElement("i");
  $(fa_dot_circle_o).css({
      "font-size": "80px"
  });
  fa_dot_circle_o.className = "fa fa-dot-circle-o fa-stack-1x fa-inverse";
  var fa_circle = document.createElement("i");
  fa_circle.className = "fa fa-circle fa-stack-2x";
  fa_stack.appendChild(fa_circle);
  fa_stack.appendChild(fa_dot_circle_o);
  $(fa_stack).css({
      "font-size": "100px",
      "position": "absolute",
      "left": "50%",
      "top": "50%",
      "transform": "translate(-50%, -100%)"
  });
  div_big_img.appendChild(fa_stack);

  /* added by sean */
  var div_big_img = document.createElement("div");
  divs.big_img = div_big_img;
  var fa_stack = document.createElement("span");
  fa_stack.className = "fa-stack";
  var fa_dot_circle_o = document.createElement("i");
  $(fa_dot_circle_o).css({
    "font-size": "80px"
  });
  fa_dot_circle_o.className = "fa fa-dot-circle-o fa-stack-1x fa-inverse";
  var fa_circle = document.createElement("i");
  fa_circle.className = "fa fa-circle fa-stack-2x";
  fa_stack.appendChild(fa_circle);
  fa_stack.appendChild(fa_dot_circle_o);
  $(fa_stack).css({
    "font-size": "100px",
    "position": "absolute",
    "left": "50%",
    "top": "50%",
    "transform": "translate(-50%, -100%)"
  });
  div_big_img.appendChild(fa_stack);

  var div_main = document.createElement("div");
  divs.main = div_main;
  $(div_main).css({
      "display": "inline-block",
      "height": "24px",
      "margin": "0px",
      "padding": "0px",
      "width": "200px",
      "position": "absolute",
      "left": "50%",
      "top": "50%",
      "transform": "translate(-50%, 50%)"
  });


  //var dom_audio = '<audio src="'+  +'" type="audio/mpeg" controls="controls">your browser not support html5 audio tag.</audio>';
  var dom_audio = document.createElement("audio");
  divs.dom_audio = dom_audio;
  div_main.appendChild(divs.dom_audio);
  //var mp3param = vobj.fn(ibook, ichap);
  var mp3param = this.fn_audio_srcs[this.m_cur_idx](this.m_ibook, this.m_ichap);
  if (mp3param == null)
    this.m_isexist_audio_url = false;
  else
    this.m_isexist_audio_url = true;

  if (this.m_isexist_audio_url) {
    $(dom_audio).attr('src', mp3param.cur);
    $(dom_audio).attr('type', 'audio/mpeg');
    $(dom_audio).attr('controls', 'controls');
    $(dom_audio).css('display', 'none');
    dom_audio.innerText = 'your browser not support html5 audio tag.';
    //dom_audio.playbackRate = 2;
  }


  var div_control = document.createElement("div");
  divs.control = div_control;
  div_main.appendChild(div_control);
  $(div_control).css("display", "inline-block");
  $(div_control).css("height", "24px");
  //$(div_control).css("margin", "0px");
  //$(div_control).css("padding", "0px");
  //$(div_control).css("vertical-align", "top");


  // play next prev
  var div_prev = document.createElement("div");
  var div_play = document.createElement("div");
  var div_pause = document.createElement("div");
  var div_next = document.createElement("div");
  {
    div_control.appendChild(div_prev);
    div_control.appendChild(div_play);
    div_control.appendChild(div_pause);
    div_control.appendChild(div_next);

    $(div_prev).css("display", "inline-block");
    $(div_prev).css("height", "24px");
    $(div_play).css("display", "inline-block");
    $(div_play).css("height", "24px");
    $(div_pause).css("display", "inline-block");
    $(div_pause).css("height", "24px");
    $(div_next).css("display", "inline-block");
    $(div_next).css("height", "24px");

    $(div_pause).css("cursor", "pointer");
    $(div_prev).css("cursor", "pointer");
    $(div_next).css("cursor", "pointer");
    $(div_play).css("cursor", "pointer");

    var img_next = document.createElement("img");
    $(img_next).attr("src", "images/next_u607.png");
    $(img_next).attr("height", "100%");
    var img_play = document.createElement("img");
    $(img_play).attr("src", "images/play_pause_u609.png");
    $(img_play).attr("height", "100%");
    var img_pause = document.createElement("img");
    $(img_pause).attr("src", "images/play_pause_u609_selected.png");
    $(img_pause).attr("height", "100%");
    $(div_pause).css("display", "none");
    var img_prev = document.createElement("img");
    $(img_prev).attr("src", "images/prev_u607.png");
    $(img_prev).attr("height", "100%");

    div_prev.appendChild(img_prev);
    div_next.appendChild(img_next);
    div_play.appendChild(img_play);
    div_pause.appendChild(img_pause);

    $(div_play).click(this, function (fn) {
      dom_audio.play();
      $(div_play).css("display", "none");
      $(div_pause).css("display", "inline-block");
      $(div_progress).css("display", "inline-block");

      fn.data.m_isplaying = true;
    });

    $(div_pause).click(this, function (fn) {
      dom_audio.pause();
      //$(this).css("display", "none");
      //$(div_play).css("display", "inline-block");

      $(div_pause).css("display", "none");
      $(div_play).css("display", "inline-block");
      $(div_progress).css("display", "none");

      fn.data.m_isplaying = false;
    });

    $(div_next).click(this, function (fn) {
      var nxt = fhl.get_next_chap(fn.data.m_ibook, fn.data.m_ichap);
      if (nxt == null)
        return;

      fn.data.set_book_chap(nxt.ibook, nxt.ichap, fn.data.m_dstdiv);
      //var nextdivs = create_audio_div(vobj, nxt.ibook, nxt.ichap);

      //// 取代舊的
      //var pParent = div_main.parentNode;
      //pParent.insertBefore(nextdivs.main, div_main);
      //var paused = dom_audio.paused; //要在removeChild之前存起來，不然都會變true
      //pParent.removeChild(div_main);

      // 若已經在播放了，按next就自動播放
      if (fn.data.m_isplaying)
        fn.data.m_divs.dom_audio.play();

      if (fn.data.m_pfn_after_set != null)
        fn.data.m_pfn_after_set(nxt.ibook, nxt.ichap);
    });

    $(div_prev).click(this, function (fn) {
      var nxt = fhl.get_prev_chap(fn.data.m_ibook, fn.data.m_ichap);
      if (nxt == null)
        return;

      fn.data.set_book_chap(nxt.ibook, nxt.ichap, fn.data.m_dstdiv);
      if (fn.data.m_isplaying)
        fn.data.m_divs.dom_audio.play();
      //var nextdivs = create_audio_div(vobj, nxt.ibook, nxt.ichap);

      //// 取代舊的
      //var pParent = div_main.parentNode;
      //pParent.insertBefore(nextdivs.main, div_main);
      //var paused = dom_audio.paused; //要在removeChild之前存起來，不然都會變true
      //pParent.removeChild(div_main);

      //// 若已經在播放了，按next就自動播放
      //if (paused == false)
      //  nextdivs.dom_audio.play();
      // 若已經在播放了，按next就自動播放
      if (fn.data.m_isplaying)
        fn.data.m_divs.dom_audio.play();

      if (fn.data.m_pfn_after_set != null)
        fn.data.m_pfn_after_set(nxt.ibook, nxt.ichap);
    });

  }// play next prev

  {// 版本切換
    var div_dropdown = document.createElement("div");
    //div_progress.appendChild(div_dropdown);
    div_main.appendChild(div_dropdown);

    var pthis = this;
    var pfn_switch = function (txt) {
      for (var idx in pthis.m_versions) {
        var txt2 = pthis.m_versions[idx];
        if (txt2 == txt) {
          pthis.m_cur_idx = idx;
          pthis.m_dstdiv.innerHTML = "";
          pthis.set_book_chap(pthis.m_ibook, pthis.m_ichap, pthis.m_dstdiv);
          break;
        }
      }
    }

    //var rvers = React.createElement(audiobible.R.version, {
    //    pfn_switch: pfn_switch,
    //    vers: this.m_versions,
    //    ver_cur: this.m_versions[this.m_cur_idx]
    //});
    //var renderobj = React.render(rvers, div_dropdown);

    var renderobj = React.render(audiobible.r.vers, div_dropdown);
    renderobj.setProps({
      vers: this.m_versions,
      ver_cur: this.m_versions[this.m_cur_idx],
      pfn_switch: pfn_switch
    });
    $(div_dropdown).css("display", "inline-block");
    $(div_dropdown).css("vertical-align", "top");
     //"display:inline-block;vertical-align:top;";
    //init_dropdownlist(div_dropdown, this.m_versions, this.m_versions[this.m_cur_idx], pfn_switch);
  }

  var div_progress = document.createElement("div");
  divs.div_progress = div_progress;
  $(div_progress).css("display", "inline-block");
  $(div_progress).css("vertical-align", "top");
  div_main.appendChild(div_progress);

  if (this.m_isexist_audio_url) {
    var div_pbar = document.createElement("div");
    divs.div_pbar = div_pbar;
    div_progress.appendChild(div_pbar);
    $(div_pbar).css("display", "inline-block");
    $(div_pbar).css("position", "relative");
    $(div_pbar).css("min-width", "150px");//沒加這個. 字會在bar的起頭
    $(div_pbar).css("min-height", "24px");

    var img_barback = document.createElement("img");
    //$(img_barback).attr("src", "play_progress_u614.png");
    $(img_barback).attr("src", "images/play_progress_u614.png");
    $(img_barback).attr("width", "150px");
    $(img_barback).attr("height", "12px");
    $(img_barback).css("position", "absolute");
    $(img_barback).css("top", "6px");
    $(img_barback).css("z-index", "-2");
    div_pbar.appendChild(img_barback);


    var img_barpt = document.createElement("img");
    divs.img_barpt = img_barpt;
    $(img_barpt).attr("src", "images/play_progress_pointer_u616.png");
    $(img_barpt).attr("width", "12px");
    $(img_barpt).attr("height", "12px");
    $(img_barpt).css("top", "6px");
    $(img_barpt).css("position", "absolute");
    $(img_barpt).css("z-index", "2");
    $(img_barpt).css("cursor", "pointer");
    div_pbar.appendChild(img_barpt);

    $(img_barpt).draggable({
      containment: "parent"
      , axis: "x"
      , start: function () {
        dom_audio.pause();
      }
      , drag: function () {

      }
      , stop: function () {

        var duration = dom_audio.duration;
        var left2 = parseFloat($(divs.img_barpt).css("left"));
        var currentTime = left2 * duration / (150.0 - 12.0);

        //不然會自動跳到下一首 (拖曳應該不要跳到下一首)
        if (currentTime >= duration)
          currentTime = duration - 1;

        dom_audio.currentTime = currentTime;
        dom_audio.play();
      }
    });
  }
  if (this.m_isexist_audio_url == false) {
    var div_pbar = document.createElement("div");
    divs.div_pbar = div_pbar;
    div_progress.appendChild(div_pbar);
    $(div_pbar).css("display", "inline-block");
    $(div_pbar).css("position", "relative");
    $(div_pbar).css("min-width", "150px");//沒加這個. 字會在bar的起頭
    $(div_pbar).css("min-height", "24px");
    $(div_pbar).text("本章無語音");
  }

  if (this.m_isexist_audio_url) {//倒數秒數
    var div_time = document.createElement("div");
    div_progress.appendChild(div_time);
    divs.div_time = div_time;
    $(div_time).text("00:00");
    $(div_time).css("vertical-align", "top");
    $(div_time).css("display", "inline-block");
    $(div_time).css("height", "24px");
    $(div_time).css("min-height", "24px");
  }//倒數秒數

  if (this.m_isexist_audio_url) {
    $(dom_audio).on('ended', null, this, function (param) {
      // ended 自動播放下一首.
      $(div_next).trigger('click', this);
    }).on('timeupdate', null, this, function (param) {
      // 播放過程, 進度列更新.
      var duration = dom_audio.duration;
      var currentTime = dom_audio.currentTime;
      $(divs.img_barpt).css("left", (currentTime / duration * (150 - 12)).toString() + "px");
      // 秒轉為 H:m:s
      {
        var sec1 = duration - currentTime;
        var re_str = "-";
        if (sec1 > 3600) {
          var hours = Math.floor(sec1 / 3600).toString();
          sec1 = sec1 % 3600;
          re_str = hours + ":";
        }
        var mins = Math.floor(sec1 / 60).toString();
        sec1 = sec1 % 60;
        var sec = Math.floor(sec1).toString();
        $(divs.div_time).text(re_str + mins + ":" + sec);
      }
    }).on('play', null, this, function (param) {
      // 開始播放. 隱藏與隱示
      $(div_pause).css("display", "inline-block");
      $(div_play).css("display", "none");
      $(div_progress).css("display", "inline-block");
    }).on('pause', null, this, function (param) {
    }).on('seeked', null, this, function (param) {
    });
  }

  this.m_divs = divs;

  if (this.m_isplaying)
    $(div_play).trigger('click', this);
  else
    $(div_pause).trigger('click', this);
}//create

audiobible.g_audiobible = new audiobible.c_audiobible(); //全域變數