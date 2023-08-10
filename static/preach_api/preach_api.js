/// <reference path="../libs/jquery-1.11.3.js" />
/// <reference path="../libs/react/react-0.13.1.min.js" />
/// <reference path="../libs/react/react-with-addons-0.13.1.min.js" />
/// <reference path="../commonR/processbar.js" />
/// <reference path="../commonR/audio.js" />
/// <reference path="../search_api/fhl_api.js" />
var preach_api = preach_api || {};
preach_api.R = preach_api.R || {
  oneframe: React.createClass({
    getDefaultProps: function () {
      return {
        "bookid": 8,
        "data": null,
        _prev_click: function (engs, chap, sec) { }
      };
    },
    getInitialState: function () { return {}; },
    componentDidMount: function () { },
    componentWillUpdate: function (nextProp, nextState) { },
    componentDidUpdate: function (preProp, preState) { },
    render: function () {
      if (this.props.data == null)
        return null;

      var jret = JSON.parse(this.props.data);
      //console.log(jret);
      // darkorchid

      if (jret["record_count"] == 0)
        return null;
      var jrec = jret["record"][0];
      var rbook_name = React.createElement("div", {
        "style": { "color": "blue", "font-size": "1.6em" }
      }, jrec.book_name);
      var rtitle = React.createElement("div", {
        "style": { "color": "darkorchid", "font-size": "1.3em" }
      }, jrec.title);

      // 每一個結果
      // 目前有3種case
      // [media$N01_001_001_001_001_t.m3u]
      // [media$N01_001_001_001_001_m.m3u]
      // [media$1N01_001_001_001_001.m3u] ... /bookid/1/N01_001_001_001_001.mp3

      var robjs = [];
      var r1 = jrec.com_text;
      //r1 = r1.replace(/\n/g, "<br />"); // react <br/> \n 都不行, 要用 createElement("br")...
      var reg = new RegExp('\[media$[0-9/]*[N0-9_tm]+.m[3p][u3]\]', 'g'); //.m3u or .mp3

      var r2 = r1.match(reg);
      for (var i2 in r2) {
        //console.log(r2[i2]); // [media$1/N1_1_1_1_1.m3u]

        var idx3 = r1.indexOf(r2[i2]);
        var txt3 = r1.substr(0, idx3);
        r1 = r1.substr(idx3 + r2[i2].length);
        //console.log(txt3);/*宇宙之開放性及依存性<br />上帝之超然, 主權、能力、智慧 <br />上帝之存在乃信心宣告<br />神蹟之理論可能性<br />*/
        var txtobjs = [];
        while (true) {
          var idx4 = txt3.indexOf("\n");
          if (idx4 == -1) {
            txtobjs.push(React.createElement("span", {}, txt3));
            break;
          }
          txtobjs.push(React.createElement("span", {}, txt3.substr(0, idx4)));
          txtobjs.push(React.createElement("br"));
          txt3 = txt3.substr(idx4 + 1);
        }
        robjs.push(React.createElement("span", {}, txtobjs));

        var reg1 = new RegExp('[0-9/]*N[0-9_mt]+', 'g');
        var str_na = reg1.exec(r2[i2])[0]; // 'N01_001_001_001_001_t'
        //console.debug("str_na");
        //console.log(str_na);

        // 產生mp3_url
        var mp3_url = "http://media.fhl.net/cbolcom/" + this.props.bookid + "/" + str_na + ".mp3";
        var onprev = null;
        if (jret.prev != null) {
          var pthis = this;
          onprev = function (audio_obj) {
            pthis.props._prev_click(jret.prev.engs, jret.prev.chap, jret.prev.sec);
          };
        }
        var onnext = null;
        if (jret.next != null) {
          var pthis = this;
          onnext = function (audio_obj) {
            pthis.props._prev_click(jret.next.engs, jret.next.chap, jret.next.sec);
          };
        }
        var rAudio = React.createElement(commonR.R.audio.frame, {
          "src": mp3_url,
          "onprev": onprev,
          "onnext": onnext
        });
        robjs.push(rAudio);
        robjs.push(
          React.createElement("a", { "href": mp3_url },
          React.createElement("img", { "src": "images/download.png", "style": { "height": "1.5em", "cursor": "pointer" } })
          )
          );

        //var html5_audio = "<audio src=\"" + mp3_url + "\" controls preload=\"none\" playbackRate=\"1\" >HTML5 audio not supported</audio>";
        //var html_download = "<a href=\"" + mp3_url + "\">下載</a>";
        //var html_audio_obj = html5_audio + html_download;
        //var html_out = "<span>" + html_audio_obj + "</span>";

        //r1 = r1.replace(str_ori, "");
      }//for i2 in r2
      {
        //console.log(txt3);/*宇宙之開放性及依存性<br />上帝之超然, 主權、能力、智慧 <br />上帝之存在乃信心宣告<br />神蹟之理論可能性<br />*/
        var txt3 = r1;
        var txtobjs = [];
        while (true) {
          var idx4 = txt3.indexOf("\n");
          if (idx4 == -1) {
            txtobjs.push(React.createElement("span", {}, txt3));
            break;
          }
          txtobjs.push(React.createElement("span", {}, txt3.substr(0, idx4)));
          txtobjs.push(React.createElement("br"));
          txt3 = txt3.substr(idx4 + 1);
        }
        robjs.push(React.createElement("span", {}, txtobjs));
      }


      var rend = React.createElement("hr", {});
      return React.createElement("div", {}, rbook_name, rtitle, robjs, rend);
    }
  }),
  frame: React.createClass({
    getDefaultProps: function () {
      return {
        "engs": "Gen",
        "chap": 1,
        "sec": 1,
        "isgb": 0,
        "onset": function (engs, chap, sec) { }
      };
    },
    getInitialState: function () {
      return {
        "data8": null, //蔡茂堂
        "data9": null,
        "data10": null //康來昌
      };
    },
    componentDidMount: function () {
      this._query(8, this.props.engs, this.props.chap, this.props.sec, this.props.isgb);
      this._query(9, this.props.engs, this.props.chap, this.props.sec, this.props.isgb);
      this._query(10, this.props.engs, this.props.chap, this.props.sec, this.props.isgb);
    },
    componentWillUpdate: function (nextProp, nextState) { },
    componentDidUpdate: function (preProp, preState) { },
    componentWillReceiveProps: function (nextProp) {
      // 外部重新設定之後 props
      this._query(8, nextProp.engs, nextProp.chap, nextProp.sec, nextProp.isgb);
      this._query(9, nextProp.engs, nextProp.chap, nextProp.sec, nextProp.isgb);
      this._query(10, nextProp.engs, nextProp.chap, nextProp.sec, nextProp.isgb);
    },
    _query: function (bookid, engs, chap, sec, isgb) {
      var url = "sc.php?engs=" + engs + "&chap=" + chap + "&sec=" + sec + "&book=" + bookid + "&gb=" + isgb + "";
      fhl.json_api_text(url,
        function (re1, param) {
          var data = {};
          data[param.st] = re1;
          param.obj.setState(data); // 若直接 setState({st_name:re1}); 會變成 state多一個叫 st_name
        },
        function (param) {
          var data = {};
          data[param.st] = "error";
          param.obj.setState(data); // 若直接 setState({st_name:re1}); 會變成 state多一個叫 st_name
        },
        { "obj": this, "st": "data" + bookid }, true);
    },
    _prev_click: function (engs, chap, sec) {
      // oneframe 按下 prev 時呼叫
      //this.setProps({"engs":engs,"chap":chap,"sec":sec});
      this.props.onset(engs, chap, sec);
    },
    render: function () {
      var r8 = React.createElement(preach_api.R.oneframe, { "bookid": 8, "data": this.state.data8, "_prev_click": this._prev_click });
      var r9 = React.createElement(preach_api.R.oneframe, { "bookid": 9, "data": this.state.data9, "_prev_click": this._prev_click });
      var r10 = React.createElement(preach_api.R.oneframe, { "bookid": 10, "data": this.state.data10, "_prev_click": this._prev_click });
      return React.createElement("div", {}, r8, r9, r10);
      //return React.createElement("div", {},r8);
    }
  })
};

// example
//var chap = 1, sec = 1, engs = "Gen";
//var ss;
//var onset = function (engs, chap, sec) {
//  console.log("外部onset");
//  ss.setProps({ "engs": engs, "chap": chap, "sec": sec });
//};
//var rr = React.createElement(preach_api.R.frame, {
//  "engs": engs,
//  "chap": chap,
//  "sec": sec,
//  "onset": onset
//});
//ss = React.render(rr, document.getElementById("re1"));