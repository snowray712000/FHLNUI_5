/// <reference path="../libs/jquery-1.11.3.js" />
/// <reference path="../commonR/h.js" />
/// <reference path="../commonR/processbar.js" />
/// <reference path="../commonR/audio.js" />
/// <reference path="../search_api/fhl_api.js" />
var preach_api = preach_api || {};
// 原為 React 0.13 元件，改為純 JS。用法：
//   var f = new preach_api.Frame(container, { engs, chap, sec, isgb, onset });
//   f.setProps({ engs, chap, sec });

/** 一位講員的講道（蔡茂堂 8、9，康來昌 10） */
preach_api.OneFrame = function (bookid, _prev_click) {
  this.bookid = bookid;
  this._prev_click = _prev_click;
  this.data = null;
  this.el = null; // 沒資料時為 null（不顯示）
  this.audios = []; // 重新 render 時沿用同位置的播放器（保留播放速度）
};
preach_api.OneFrame.prototype.setData = function (data) {
  if (data === this.data && this.el != null)
    return;
  this.data = data;
  this.el = this.render();
};
preach_api.OneFrame.prototype.render = function () {
  var h = commonR.h;
  if (this.data == null)
    return null;

  var jret;
  try { jret = JSON.parse(this.data); } catch (e) { return null; } // 查詢失敗時 data 是 "error"
  if (jret["record_count"] == 0)
    return null;
  var jrec = jret["record"][0];
  var rbook_name = h("div", {
    "style": { "color": "blue", "font-size": "1.6em" }
  }, jrec.book_name);
  var rtitle = h("div", {
    "style": { "color": "darkorchid", "font-size": "1.3em" }
  }, jrec.title);

  // 每一個結果
  // 目前有3種case
  // [media$N01_001_001_001_001_t.m3u]
  // [media$N01_001_001_001_001_m.m3u]
  // [media$1N01_001_001_001_001.m3u] ... /bookid/1/N01_001_001_001_001.mp3

  // 文字中的 \n 變成 <br>
  var txt2spans = function (txt3) {
    var txtobjs = [];
    while (true) {
      var idx4 = txt3.indexOf("\n");
      if (idx4 == -1) {
        txtobjs.push(h("span", {}, txt3));
        break;
      }
      txtobjs.push(h("span", {}, txt3.substr(0, idx4)));
      txtobjs.push(h("br"));
      txt3 = txt3.substr(idx4 + 1);
    }
    return h("span", {}, txtobjs);
  };

  var robjs = [];
  var r1 = jrec.com_text;
  var reg = new RegExp('\[media$[0-9/]*[N0-9_tm]+.m[3p][u3]\]', 'g'); //.m3u or .mp3

  var pthis = this;
  var onprev = null;
  if (jret.prev != null) {
    onprev = function (audio_obj) {
      pthis._prev_click(jret.prev.engs, jret.prev.chap, jret.prev.sec);
    };
  }
  var onnext = null;
  if (jret.next != null) {
    onnext = function (audio_obj) {
      pthis._prev_click(jret.next.engs, jret.next.chap, jret.next.sec);
    };
  }

  var r2 = r1.match(reg);
  var iAudio = 0;
  for (var i2 in r2) {
    var idx3 = r1.indexOf(r2[i2]);
    var txt3 = r1.substr(0, idx3);
    r1 = r1.substr(idx3 + r2[i2].length);
    robjs.push(txt2spans(txt3));

    var reg1 = new RegExp('[0-9/]*N[0-9_mt]+', 'g');
    var str_na = reg1.exec(r2[i2])[0]; // 'N01_001_001_001_001_t'

    // 產生mp3_url
    var mp3_url = "http://media.fhl.net/cbolcom/" + this.bookid + "/" + str_na + ".mp3";
    var audioProps = {
      "src": mp3_url,
      "onprev": onprev,
      "onnext": onnext
    };
    var rAudio = this.audios[iAudio];
    if (rAudio == null)
      rAudio = this.audios[iAudio] = new commonR.audio.Frame(audioProps);
    else
      rAudio.setProps(audioProps);
    iAudio++;
    robjs.push(rAudio.el);
    robjs.push(
      h("a", { "href": mp3_url },
        h("img", { "src": "images/download.png", "style": { "height": "1.5em", "cursor": "pointer" } })
      )
    );
  }//for i2 in r2
  this.audios.length = iAudio;
  robjs.push(txt2spans(r1));

  var rend = h("hr", {});
  return h("div", {}, rbook_name, rtitle, robjs, rend);
};

preach_api.Frame = function (container, props) {
  var pthis = this;
  this.container = container;
  this.props = $.extend({
    "engs": "Gen",
    "chap": 1,
    "sec": 1,
    "isgb": 0,
    "onset": function (engs, chap, sec) { }
  }, props);
  var _prev_click = function (engs, chap, sec) {
    // oneframe 按下 prev / next 時呼叫
    pthis.props.onset(engs, chap, sec);
  };
  this.frames = [8, 9, 10].map(function (bookid) { return new preach_api.OneFrame(bookid, _prev_click); });
  this.el = commonR.h("div");
  $(container).empty().append(this.el);
  this.render();
  this._queryAll();
};
preach_api.Frame.prototype.setProps = function (props) {
  $.extend(this.props, props);
  this._queryAll();
};
preach_api.Frame.prototype._queryAll = function () {
  var p = this.props;
  var pthis = this;
  this.frames.forEach(function (f) { pthis._query(f, p.engs, p.chap, p.sec, p.isgb); });
};
preach_api.Frame.prototype._query = function (oneframe, engs, chap, sec, isgb) {
  var pthis = this;
  var url = "sc.php?engs=" + engs + "&chap=" + chap + "&sec=" + sec + "&book=" + oneframe.bookid + "&gb=" + isgb + "";
  fhl.json_api_text(url,
    function (re1, param) {
      oneframe.setData(re1);
      pthis.render();
    },
    function (param) {
      oneframe.setData("error");
      pthis.render();
    },
    {}, true);
};
preach_api.Frame.prototype.render = function () {
  commonR.syncChildren(this.el, this.frames.map(function (f) { return f.el; }));
};

// example
//var f = new preach_api.Frame(document.getElementById("re1"), {
//  "engs": "Gen", "chap": 1, "sec": 1,
//  "onset": function (engs, chap, sec) { f.setProps({ "engs": engs, "chap": chap, "sec": sec }); }
//});
