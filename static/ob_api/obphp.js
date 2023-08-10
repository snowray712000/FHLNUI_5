/// <reference path="../../jsdoc/jquery.js" />
/// <reference path="../../jsdoc/linq.d.ts" />

/// <reference path="../libs/react/react-0.13.1.min.js" />
/// <reference path="../libs/react/react-with-addons-0.13.1.min.js" />

/// <reference path="../search_api/fhl_api.js" />
//http://localhost:19833/ob_api.css
//http://localhost:19833/ob_table.css

// 典藏功能 react 
var obphp = obphp || {};
obphp.R = obphp.R || {
  yearitem: React.createClass({
    handleClick: function () {
      this.props._set_year_range(this.props.yy);
    },
    displayName: "yearitem",
    getDefaultProps: function () {
      return {
        tt: "", //ex: 19世紀早期
        yy: "" // ex: 1800-1833 , 0-9999
      };
    },
    componentDidMount: function () {
      var domthis = this.getDOMNode();
      if (this.props.isact == 1) {
        $(domthis).addClass("selected");
      } else {
        $(domthis).removeClass("selected");
      }
    },
    componentDidUpdate: function (nextProps) {
      var domthis = this.getDOMNode();
      if (this.props.isact == 1) {
        $(domthis).addClass("selected");
      } else {
        $(domthis).removeClass("selected");
      }
    },
    render: function () {
      var rRet = React.createElement("span", {
        onClick: this.handleClick,
        className: 'yearitem'
      }, this.props.tt);
      return rRet;
    }
  }),
  year: React.createClass({
    displayName: "year",
    getDefaultProps: function () {
      return {
        sels: [
          { t: "全部", y: "0-9999" },
          { t: "19世紀早期", y: "1800-1833" },
          { t: "19世紀中期", y: "1834-1866" },
          { t: "19世紀晚期", y: "1867-1899" },
          { t: "20世紀上半", y: "1900-1950" },
          { t: "20世紀下半", y: "1951-2000" },
        ]
      };
    },
    render: function () {

      var year_set = this.props.year_set;

      var pthis = this; // 給下面的 function 內部用的.
      var rs = this.props.sels.map(function (a1) {
        return React.createElement(obphp.R.yearitem, {
          tt: a1.t, yy: a1.y,
          _set_year_range: pthis.props._set_year_range,
          isact: (a1.y == year_set) ? 1 : 0
        });
      });

      var rRet = React.createElement("div", {}, rs);
      return rRet;
    }
  }),
  styleitem: React.createClass({
    handleClick: function () {
      if (this.props.tt == "全部")
        this.props._set_style("");
      else
        this.props._set_style(this.props.tt);
    },
    displayName: "styleitem",
    getDefaultProps: function () {
      return {
        tt: "", //ex: 少數民族及各地方言
      };
    },
    componentDidMount: function () {
      var domthis = this.getDOMNode();
      if (this.props.isact == 1) {
        $(domthis).addClass("selected");
      } else {
        $(domthis).removeClass("selected");
      }
    },
    componentDidUpdate: function (nextProps) {
      var domthis = this.getDOMNode();
      if (this.props.isact == 1) {
        $(domthis).addClass("selected");
      } else {
        $(domthis).removeClass("selected");
      }
    },
    render: function () {

      //console.debug("frame.top.style.styleitem.render");
      //console.log(this.props);

      var rRet = React.createElement("span", {
        onClick: this.handleClick,
        className: 'styleitem'
      }, this.props.tt);
      //if (this.props.isact == true)
      return rRet;
    }
  }),
  style: React.createClass({
    displayName: "style",
    getDefaultProps: function () {
      return {
        sels: [
          { t: "全部" },
          { t: "白話（官話）" },
          { t: "深文理" },
          { t: "淺文理" },
          { t: "少數民族及各地方言" },
          { t: "外文" },
          { t: "雙語" }
        ]
      };
    },
    render: function () {

      //console.debug("frame.top.style.render");
      //console.log(this.props);

      // style active 要用的
      var style_set = this.props.style_set;
      if (style_set == "")
        style_set = "全部";

      var pthis = this; // map 中用
      var rs = this.props.sels.map(function (a1) {

        return React.createElement(obphp.R.styleitem, {
          tt: a1.t,
          _set_style: pthis.props._set_style,
          isact: (a1.t == style_set) ? 1 : 0
        });

      });

      var rRet = React.createElement("div", {}, rs);
      return rRet;
    }
  }),
  top: React.createClass({
    displayName: "top",
    render: function () {

      //console.debug("frame.top.render");
      //console.log(this.props);

      var r1 = null;
      if (this.props.isgb == 0)
      {
        // 繁體.
        r1 = React.createElement(obphp.R.year, {
          _set_year_range: this.props._set_year_range,
          year_set: this.props.year_set //為了要畫 active 是哪個, 所以要傳下去
        });//top.year
      }
      else
      {
        // 簡體.
        r1 = React.createElement(obphp.R.year, {
          _set_year_range: this.props._set_year_range,
          year_set: this.props.year_set, //為了要畫 active 是哪個, 所以要傳下去
          sels: [
  { t: "全部", y: "0-9999" },
  { t: "19世纪早期", y: "1800-1833" },
  { t: "19世纪中期", y: "1834-1866" },
  { t: "19世纪晚期", y: "1867-1899" },
  { t: "20世纪上半", y: "1900-1950" },
  { t: "20世纪下半", y: "1951-2000" },
          ]
        });//top.year
      }

      
      var r2 = null;
      if (this.props.isgb == 0)
      {
        r2 = React.createElement(obphp.R.style, {
        _set_style: this.props._set_style,
        style_set: this.props.style_set // 為了要畫 active 是哪個, 所以要傳下去
      });//top.style
      }
      else
      {
        r2 = React.createElement(obphp.R.style, {
          _set_style: this.props._set_style,
          style_set: this.props.style_set, // 為了要畫 active 是哪個, 所以要傳下去
          sels: [
                  { t: "全部" },
                  { t: "白话（官话）" },
                  { t: "深文理" },
                  { t: "浅文理" },
                  { t: "少数民族及各地方言" },
                  { t: "外文" },
                  { t: "双语" }
          ]
        });//top.style
      }

      var rRet = React.createElement("div", {}, r1, r2);
      return rRet;
    }
  }),
  content_list_item: React.createClass({
    _onclick_read_this_book: function () {
      this.props._set_book_id(this.props.iid);
      this.props._set_content_type("read");
    },
    displayName: "content_list_item",
    render: function () {
      //var rtds = [this.props.y, this.props.a, this.props.t, this.props.l, this.props.iid].map(function (a1) {
      var rtds = [this.props.y, this.props.a, this.props.t, this.props.l].map(function (a1) {
        return React.createElement('td', {}, a1);
      });
      var rinfo = React.createElement("td", { className: "list_item_info" }, "說明");
      var rread = React.createElement("td", { className: "list_item_read", onClick: this._onclick_read_this_book }, (this.props.isgb == 0) ? "閱讀" : "阅读");
      return React.createElement("tr", {}, rtds, rread);
      //return React.createElement("tr", {}, rtds,rinfo,rread);//含「說明」版本
    }
  }),
  content_list: React.createClass({
    displayName: "content_list",
    componentDidMount: function () {
      var domthis = this.refs.table1;
    },
    render: function () {

      var titles = [];
      if (this.props.isgb == 0)
        titles = ["年代", "作者/譯者", "書名", "語言", "閱讀"];
      else
        titles = ["年代", "作者/译者", "书名", "语言", "阅读"];

      //var ths=  React.createElement("tr", {},["年代", "作者/譯者", "書名", "語言", "", "說明", "閱讀"].map(function (a1) {
      var pthis = this;
      var ths = React.createElement("tr", { isgb: this.props.isgb }, titles.map(function (a1) {
        return React.createElement("td", { isgb: pthis.props.isgb }, a1);
      }));

      // 準備table的tbody      
      var rtbody = null;
      {
        if (this.props.records != null) {
          var pthis = this;
          var rs = this.props.records.map(function (a1) {
            return React.createElement(obphp.R.content_list_item, {
              y: a1.age,
              a: a1.author,
              l: a1.lang,
              t: a1.title,
              iid: a1.id,
              _set_content_type: pthis.props._set_content_type,
              _set_book_id: pthis.props._set_book_id,
              isgb: pthis.props.isgb
            })
          });
          rtbody = React.createElement("tbody", null, ths, rs);
        }
        else {
          rtbody = React.createElement("tbody", null);
        }
      }
      var rtable = React.createElement("table", { className: "obtable" }, rtbody);
      //return rtable;
      return React.createElement("div", {}, rtable);
    }
  }),
  content: React.createClass({
    _onclick_goto_menu: function () {
      this.props._set_content_type("list");
    },
    _onclick_goto_prev_page: function () {
      var re_record = this.props.records[0];
      this.props._set_read_page(re_record.prev);
    },
    _onclick_goto_next_page: function () {
      var re_record = this.props.records[0];
      this.props._set_read_page(re_record.next);
    },
    _onclick_image_newwindow: function () {

    },
    displayName: "content",
    render: function () {

      switch (this.props.content_type) {
        case "list":
          return React.createElement(obphp.R.content_list, {
            records: this.props.records,
            _set_content_type: this.props._set_content_type,
            _set_book_id: this.props._set_book_id,
            isgb: this.props.isgb
          });
        case "read":
          {
            //var re_record = {
            //  name: "1927新舊約串珠淺文理施約瑟主教譯本",
            //  page: 443,
            //  prev: 442,
            //  next: 444,
            //  vid:40, // 40:表示馬太福音, 所以ibook=vid-1
            //  bchap: 1,
            //  bsec: 0,
            //  echap: 2,
            //  esec: 0,  
            // orig: "http://bible.fhl.net/new/gm.php?fn=b000/800/m40_001_001_001_006.jpg",
            //small:"http://bible.fhl.net/new/gm.php?fn=b000/m40_001_001_001_006.jpg"
            //};

            //console.log(this.props.records);

            if (this.props.records == null || this.props.records.length == 0)
              return React.createElement("div", {});
            var re_record = this.props.records[0];

         {
              var rmenu = React.createElement("span", { className: "read_button", onClick: this._onclick_goto_menu }, this.props.isgb? "回清单":"回清單");
              var rprev = React.createElement("span", { className: "read_button", onClick: this._onclick_goto_prev_page }, this.props.isgb? "翻上一页" : "翻上一頁");
              var rtitle = React.createElement("span", { className: "read_span" }, re_record.name); // 1927新舊約串珠淺文理施約瑟主教譯本

              var rtitle2 = null;
              if (re_record.vid != 0) // 封面的 vid = 0 
                rtitle2 = React.createElement("span", { className: "read_span" }, fhl.g_book_allAuto(this.props.isgb)[re_record.vid - 1][3]) // 馬太福音
              else
                rtitle2 = React.createElement("span", { className: "read_span" }, "封面") //繁簡寫一樣

              var rtitle3 = React.createElement("span", { className: "read_span" }, "page:" + re_record.page);
              var rtitle4;
              {
                // 章節至 // 章节至
                var res = "";
                if (re_record.vid != 0) // 封面的 vid = 0 時, chap sec 屬性都不值得參考
                {
                  if (re_record.bchap != 0) {
                    res += re_record.bchap.toString() + "章";
                    if (re_record.bsec != 0)
                      res += re_record.bsec.toString() + this.props.isgb? "节": "節";
                    res += "至";
                  }
                  if (re_record.echap != 0) {
                    res += re_record.echap.toString() + "章";
                    if (re_record.esec != 0)
                      res += re_record.esec.toString() + this.props.isgb ? "节" : "節";
                  }
                }
                rtitle4 = React.createElement("span", { className: "read_span" }, res);
              }
              var rnext = React.createElement("span", { className: "read_button", onClick: this._onclick_goto_next_page }, this.props.isgb ? "翻下一页" : "翻下一頁");
            }//for rtop
            var rtop = React.createElement("div", {}, rmenu, rprev, rnext, rtitle, rtitle2, rtitle3, rtitle4);

            //http://bible.fhl.net/new/gm.php?fn=b000/800/m40_001_001_001_006.jpg
            {
              var ab_url = re_record.small;


              var rimg = React.createElement("img", { src: ab_url });
              var rimga = React.createElement("a", { href: re_record.orig, target: "_blank" }, rimg); //超連結
              var rdiv = React.createElement("div", { className: "ob_divimg" }, rimga); //為了把img加水平卷軸(但又不要影響到「回清單」那一些
            }
            var rret = React.createElement("div", {}, rtop, rdiv);
            return rret;
          }
        default:
          return React.createElement("div", {}, "not support content_type");
      }
    }
  }),
  frame: React.createClass({
    _set_year_range: function (years) {
      /// <summary> 給 top.year.yearitem.onclick 使用的</summary>
      /// <param type="string" name="years" parameterArray="false">ex: 0-9999, 1900-1933</param>
      //console.debug("_set_year_range");

      this.setState({ year_set: years });
      this._set_obdata_from_ajax();
    },
    _set_style: function (style_tytle) {
      /// <summary> 給 top.style.styleitem.onclick 使用的</summary>
      /// <param type="string" name="style_tytle" parameterArray="false">ex: "", 淺文理, 少數民族及各地方言</param>
      //console.debug("_set_style");

      this.setState({ style_set: style_tytle });
      this._set_obdata_from_ajax();
    },
    _set_content_type: function (content_type) {
      //console.debug("_set_content_type");

      switch (content_type) {
        case "list":
          this.setState({ content_type: content_type });
          //this._set_obdata_from_ajax();
          break;
        case "read":
          this.setState({ content_type: content_type });
          //this._query_sob_from_ajax();
          break;
      }
    },
    _set_read_page: function (page1) {
      //console.debug("_set_read_page");

      this.setState({ page: page1 });
      this._query_sob_from_ajax_page(page1);
    },
    _set_book_id: function (idxbook1) {
      //console.debug("_set_book_id");

      this.setState({ idxbook: idxbook1 });
      this._query_sob_from_ajax_idxbook(idxbook1);

    },
    _set_ibook_chap_sec: function(ibook,ichap,isec){
      _query_sob_from_ajax_book_chap_sec(ibook, ichap, isec);
    },
    displayName: "frame",
    getDefaultProps: function () {
      return {
        ibook: 39,
        ichap: 1,
        isec: 1,
        isgb: false,
        cy:640
      };
    },
    getInitialState: function () {
      //console.debug("frame getInitialState");

      var oRet = {};
      //oRet.isgb = false; //換到props去
      oRet.obdata = [];
      oRet.err_msg = ""; //當產生錯誤訊息寫在這
      oRet.year_set = "0-9999";//初始化是所有範圍 _set_year_range 會改變
      oRet.style_set = "";//初始化是所有範圍 _set_style 會改變

      oRet.content_type = "list"; //list 載入時的清單, read 讀某一個

      // 此3個是外部切換的. 內部不會切換. 換到props
      //oRet.ibook = 39;
      //oRet.ichap = 1;
      //oRet.isec = 1;

      oRet.idxbook = 257; //香港聖經公會 新舊約全書 1959
      oRet.page = -1;
      oRet.sobdata = [];

      return oRet;
    },
    componentWillMount: function () {
      //console.debug("frame componentWillMount");
      //this._query_sob_from_ajax();
      this._set_obdata_from_ajax();
    },
    componentDidMount: function () {
      //console.debug("frame componentDidMount");

    },
    componentWillReceiveProps: function (nextProps) {
      this._query_sob_from_ajax_book_chap_sec(nextProps.ibook, nextProps.ichap, nextProps.isec);
    },
    componentWillUpdate: function () {
      //console.debug("frame componentWillUpdate");
      //this._query_sob_from_ajax();
    },
    
    render: function () {
      //console.debug("frame render");

      // 例外顯示
      if (this.state.err_msg.length > 0)
        return React.createElement("div", {}, this.state.err_msg);

      //console.debug("frame.render");
      //console.log(this.state);


      //var r2 = React.createElement(obphp.R.content, {content_type:"list", records:this.state.obdata });//frame.content
      var r2 = null;
      if (this.state.content_type == "list")
        r2 = React.createElement(obphp.R.content, {
          content_type: "list",
          records: this.state.obdata,
          _set_content_type: this._set_content_type,
          _set_book_id: this._set_book_id,
          isgb:this.props.isgb // 繁簡體
        });//frame.content
      else {
        r2 = React.createElement(obphp.R.content, {
          content_type: this.state.content_type,
          records: this.state.sobdata,
          _set_content_type: this._set_content_type,
          _set_read_page: this._set_read_page,
          isgb:this.props.isgb // 繁簡體
        });//frame.content
      }

      if (this.state.content_type == "list") {
        // 一般

        var r1 = React.createElement(obphp.R.top, {
          _set_year_range: this._set_year_range,
          _set_style: this._set_style,
          year_set: this.state.year_set, //為了要畫 active 是哪個, 所以要傳下去
          style_set: this.state.style_set, //為了要畫 active 是哪個, 所以要傳下去
          _set_content_type: this._set_content_type,
          isgb: this.props.isgb // 為了繁簡體
        });//frame.top

        return React.createElement("div", { style: { height:this.props.cy, "overflow-y": "auto"}}, r1, r2);
      }
      else
        return React.createElement("div", {}, r2); //不用rtop
    },
    _set_obdata_from_ajax: function () {
      //console.debug("_set_obdata_from_ajax");

      var url = "ob.php";
      if (this.props.isgb)
        url += "?gb=1";
      else
        url += "?gb=0";

      var pthis = this;
      fhl.json_api_text(url, function (jstr, pthis) {
        var juc = JSON.parse(jstr);
        if (juc.status == "success") {
          //console.log(juc.record);

          // 加入目前經節才有的書卷
          {
            var url2 = "sob.php";
            if (pthis.props.isgb)
              url2 += "?gb=1";
            else
              url2 += "?gb=0";
            url2 += "&book=all";
            url2 += "&engs=" + fhl.g_book_all[pthis.props.ibook][0];
            url2 += "&chap=" + pthis.props.ichap;
            fhl.json_api_text(url2, function (jstr2, pthis) {
              //console.log(jstr2);
              var juc2 = JSON.parse(jstr2);
              if (juc2.status == "success") {
                var books2 = Enumerable.from(juc2.record).select(function (a1) { return a1.book; });
                // console.log(books2.ToArray()); // [0, 4, 8, 12, 13, 14, 15, 16, 17, 19, 21, 22, 23, 24, 25, 37, 45, 48, 54, 61, 67, 68, 69, 70, 71, 75, 76, 77, 78, 79, 81, 90, 96, 101, 113, 114, 124, 128, 131, 133, 134, 136, 145, 154, 160, 167, 168, 179, 180, 182, 183, 184, 187, 188, 189, 190, 193, 194, 195, 197, 198, 199, 200, 201, 209, 211, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 232, 233, 234, 235, 236, 237, 238, 240, 248, 249, 250, 257, 264, 265, 266, 269, 281…]

                // 加入 日期範圍
                {
                  var years = pthis.state.year_set.split('-', 2);
                  var y1 = years[0];
                  var y2 = years[1];
                  var styles = pthis.state.style_set;

                  //age: 1988 //style: "少數民族及各地方言"
                  var re_in_year_in_style = Enumerable.empty();
                  re_in_year_in_style = Enumerable.from(juc.record).where(a1=> {
                    if (a1.age >= y1 && a1.age <= y2 && (styles.length == 0 || styles == a1.style))
                      return true;
                    return false;
                  });
                  //console.log(re_in_year_in_style.Count()); //403 
                  re_in_year_in_style = re_in_year_in_style.where(a1=> {
                    if (books2.contains(a1.id))
                      return true;
                    return false;
                  });

                  //console.log(re_in_year_in_style.Count()); // 403->155
                }

                pthis.setState({
                  obdata: re_in_year_in_style.toArray(),
                  err_msg: ""
                });// set State

              } else {
                // 失敗處里
                pthis.setState({ err_msg: "sob.php book=all 錯誤" });
              }
            },
        function (msg, pthis) {
          // 失敗處里
          pthis.setState({ err_msg: msg });
        },
        pthis,
        true);// url2 ajax

          }

        }
        else {
          // 失敗處里
          pthis.setState({ err_msg: "ob.php錯誤" });
        }
      }, function (msg, pthis) {
        // 失敗處里
        pthis.setState({ err_msg: msg });
      }, this);
    },
    _query_sob_from_ajax: function () {
      //console.debug("_query_sob_from_ajax");
      //console.debug("..his state:");
      //console.log(this.state);

      var url = "sob.php";
      if (this.props.isgb)
        url += "?gb=1";
      else
        url += "?gb=0";
      var idxbook = this.state.idxbook;
      var engs = fhl.g_book_all[this.props.ibook][0];
      var chap = this.props.ichap;
      var sec = this.props.isec;
      url += "&book=" + idxbook + "&engs=" + engs + "&chap=" + chap + "&sec=" + sec;

      var pthis = this;
      fhl.json_api_text(url, function (jstr, pthis) {
        var juc = JSON.parse(jstr);
        if (juc.status == "success") {
          console.log(juc.record);

          pthis.setState({
            sobdata: juc.record,
            err_msg: ""
          });
        }

      }, function (msg, pthis) {
        pthis.setState({ err_msg: "sob.php錯誤" });
      }, this, true);
    },
    _query_sob_from_ajax_book_chap_sec: function (book1,cahp1,sec1) {
      //console.debug("_query_sob_from_ajax");
      //console.debug("..his state:");
      //console.log(this.state);

      var url = "sob.php";
      if (this.props.isgb)
        url += "?gb=1";
      else
        url += "?gb=0";
      var idxbook = this.state.idxbook;
      var engs = fhl.g_book_all[book1][0];
      //var engs = fhl.g_book_all[this.state.ibook][0];
      var chap = cahp1;
      //var chap = this.props.ichap;
      var sec = sec1;
      //var sec = this.props.isec;
      url += "&book=" + idxbook + "&engs=" + engs + "&chap=" + chap + "&sec=" + sec;

      var pthis = this;
      fhl.json_api_text(url, function (jstr, pthis) {
        var juc = JSON.parse(jstr);
        if (juc.status == "success") {
          //console.log(juc.record);

          pthis.setState({
            sobdata: juc.record,
            err_msg: ""
          });
        }

      }, function (msg, pthis) {
        pthis.setState({ err_msg: "sob.php錯誤" });
      }, this, true);
    },
    _query_sob_from_ajax_idxbook: function (idxbook1) {
      //console.debug("_query_sob_from_ajax_idxbook");
      //console.debug("..his state:");
      //console.log(this.state);

      var url = "sob.php";
      if (this.props.isgb)
        url += "?gb=1";
      else
        url += "?gb=0";
      //var idxbook = this.state.idxbook;
      var idxbook = idxbook1;
      var engs = fhl.g_book_all[this.props.ibook][0];
      var chap = this.props.ichap;
      var sec = this.props.isec;
      url += "&book=" + idxbook + "&engs=" + engs + "&chap=" + chap + "&sec=" + sec;

      var pthis = this;
      fhl.json_api_text(url, function (jstr, pthis) {
        var juc = JSON.parse(jstr);
        if (juc.status == "success") {
          //console.log(juc.record);

          pthis.setState({
            idxbook, idxbook1,
              sobdata: juc.record,
              err_msg: ""
            });
            }

            }, function (msg, pthis) {
        pthis.setState({ err_msg: "sob.php錯誤" });
            }, this, true);
            },
              _query_sob_from_ajax_page: function (page1) {
      //console.debug("_query_sob_from_ajax_page");

      var url = "sob.php";
      if (this.props.isgb)
        url += "?gb=1";
            else
        url += "?gb=0";
      var idxbook = this.state.idxbook;
      var page = page1;
      url += "&book=" +idxbook + "&page=" +page;

      //console.log(url);

      var pthis = this;
      fhl.json_api_text(url, function (jstr, pthis) {
        var juc = JSON.parse(jstr);
        if (juc.status == "success") {
          //console.log(juc.record);

          pthis.setState({
            sobdata: juc.record,
            err_msg: ""
          });
        }

      }, function (msg, pthis) {
        pthis.setState({ err_msg: "sob.php錯誤" });
      }, this, true);
              }
  })// frame class
};// define react class

//obphp.r = {};
//obphp.r.frame = React.createElement(obphp.R.frame);// r:react Ob:(Old Bible) Frame
// example: React.render(obphp.r.frame, document.getElementById("re1"));

