/// <reference path="../qsb_api/qsb.qsbapi.js" />
/// <reference path="tsk.tskapi.js" />
/// <reference path="./../../index/queryReferenceAndShowAtDialogAsync.es6.js" />

/// <reference path="./../../ijnjs/BibleConstantHelper.es6.js" />
/// <reference path="./../../ijnjs/splitReference.es6.js" />

var tsk = tsk || {};
tsk.R = tsk.R || {
  /// <summary> 當其中一行是 "# 2Ki 1:8; Zec 13:4; Mt 3:4|" 的類型，就會使用此型 </summary>
  oneref: React.createClass({
    pfn_click_oneref: function (reftxt, event) {
      // 修正後，相依的程式
      const splitReference = splitReferenceEs6Js()
      const queryReferenceAndShowAtDialogAsync = queryReferenceAndShowAtDialogAsyncEs6Js()
      const BibleConstantHelper = BibleConstantHelperEs6Js()
      const cvtAddrsToRef = cvtAddrsToRefEs6Js()
      
      // 取得 react 的 props 會用到的資訊
      const chap = this.props.chap
      const verse = this.props.verse
      let bookId = BibleConstantHelper.getBookId(this.props.default_book.toLocaleLowerCase())
      
      // 新方法(因為api處理不好 1Ti, 將其轉為中文)

      // 創1:4, 10,12,18,25,31; Ec 2:13; 11:7 要變為 1:10,12,18,25,31;
      if ( false == /^\s*\d+:\d+/g.test(reftxt) ){
        // 詩1:1, 「26:4,5;」不能被判定；「6;」必需被判定；「81:12;」不能被判定；
        // 創1:4, 「10,12,18,25,31; 」必需被判定；創1:27「26」必需被判定；創1:21「18,25,31」必需被判定

        // 其實就是 「12-32」「1,4,1」這兩類必須要
        // 反過來說，有「:」這個，就是不要的
        reftxt = chap + ":" + reftxt.trimStart()
      }

      let r1 = splitReference(reftxt, { book: bookId, chap, verse})
      // console.log(r1);
      let r2 = Enumerable.from(r1).firstOrDefault(a1 => a1.refAddresses != null)
      if (r2 == null) { throw new Error("assert r2 is not null in tsk.R.pfn_click_oneref") }
      
      let r3 = cvtAddrsToRef(r2.refAddresses, "羅")
      reftxt = r3
      
      // 原流程
      queryReferenceAndShowAtDialogAsync({ 
        addrsDescription: reftxt, 
        addrs: r2.refAddresses,
        bookDefault: bookId , 
        event: event})
    },
    handleClick: function (event) {
      if (this.state.rDetail == null) {
        var txt = this.props.txt_ori.trim();
        var keyword2 = txt.substr(1, txt.length - 2); // 去頭去尾 # |
        this.pfn_click_oneref(keyword2, event);
      } else {
        this.setState({
          rDetail: null
        });
      }
    },
    getInitialState: function () {
      return {
        rDetail: null //使用者 click oneref 時, 查詢後的結果, 
      };
    },
    getDefaultProps: function () {
      return {
        txt_ori: "# 2Ki 1:8; Zec 13:4; Mt 3:4|",
        default_book: "Matt",
        default_version: "unv",
        isSN: true,
        isGB: false,
        pfn_search_sn: null,
      };
    },
    render: function () {

      // 開始處理
      var pthis = this;
      var txt_ori = this.props.txt_ori;

      var keyword2 = txt_ori; { // 去頭去尾 # |
        keyword2 = keyword2.trim();
        keyword2 = keyword2.substr(1, keyword2.length - 2);
      }

      var r1 = React.createElement("div", {
        className: "commentJump sebutton",
        onClick: this.handleClick
      }, keyword2);
      return React.createElement("div", {}, r1, this.state.rDetail);
    }
  }),
  /// <summary> 使用 tsk.tskapi 查詢後, 可使用此 frame 來將結果表示出來 .</summary>
  frame: React.createClass({
    // 總查詢後的結果
    getDefaultProps: function () {
      return {
        txt_ori: ' * clothed.\r\n # 2Ki 1:8; Zec 13:4; Mt 3:4-7|\r\n* in.\r\n   Several MSS. have, "by Isaiah the prophet."  See the parallel texts.\r\n* clothed.\r\n # 2Ki 1:8; Zec 13:4; Mt 3:4-7|\r\n ',
        default_book: "Matt",
        default_version: "unv",
        isSN: true,
        isGB: false,
        cy: 640,
        pfn_search_sn: null,
        fontSize: 16, //var strFontSzeStyle = "font-size: " + ps.fontSize + "pt; line-height: " + ps.fontSize * 1.25 + "pt; margin-top: " + (ps.fontSize * 1.25 - 15) + "px";
      };
    },
    render: function () {
      var pthis = this;
      var aaa = this.props.txt_ori.trim().split("\n");
      var rs = [];
      $.each(aaa, function (idx, a1) {
        // 其實有可能存在沒有 # 的
        var a2 = a1.trim();
        var idx = a2.indexOf("#");
        if (idx == -1) {
          rs.push(React.createElement("div", {}, a2));
        } else {
          var body = a2.substr(idx, a2.length - idx).trim();
          //console.log(body);
          // "# 2Ki 1:8; Zec 13:4; Mt 3:4|"
          var r2 = React.createElement(tsk.R.oneref, {
            txt_ori: body,
            default_book: pthis.props.default_book,
            default_version: pthis.props.default_version,
            chap: pthis.props.chap,
            verse: pthis.props.verse,
            isSN: pthis.props.isSN,
            isGB: pthis.props.isGB,
            pfn_search_sn: pthis.props.pfn_search_sn
          });
          rs.push(r2);
        }
      });
      return React.createElement("div", {
        style: {
          height: this.props.cy,
          "overflow-y": "auto",
          "margin": "7px",
          "margin-top": "7px",
          "margin-right": "7px",
          "font-size": this.props.fontSize + "pt",
          "line-height": this.props.fontSize * 1.25 + "pt",
          "margin-top": (this.props.fontSize * 1.25 - 15) + "px",
        }
      }, rs);
    }
  })
};

/// example
//{
//  var jret = tsk.tskapi("Mark", 1, 1, false);
//  var r = React.createElement(tsk.R.frame, {
//    txt_ori: jret.record[0].com_text,
//    default_book: "Matt",
//    default_version: "unv",
//    isSN: false,
//    isGB: false,
//    pfn_search_sn: null //指定按下sn的結果
//  });
//  React.render(r, document.getElementById("re1"));
//}
