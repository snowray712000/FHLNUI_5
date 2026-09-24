/// <reference path="h.js" />
/// <reference path="processbar.js" />
// 播放器（播放/暫停/上一個/下一個/速度/進度）
// 目前應用於: 講道 (preach_api)
// 原為 React 0.13 元件，改為純 JS。用法：
//   var f = new commonR.audio.Frame({ src: "...mp3", onprev: fn, onnext: fn });
//   parent.appendChild(f.el); f.setProps({ src: "...", ... });
// 注意：出現錯誤訊息時根節點會由 span 換成 div，所以要用 f.el 取得目前的根節點。
var commonR = commonR || {};
commonR.audio = commonR.audio || {};

commonR.audio.BTN_STYLE = { "height": "1.5em", "cursor": "pointer" };
commonR.audio.TEXT_STYLE = { "height": "1.5em", "line-height": "1.5em", "vertical-align": "top" };

/** 播放速度。點目前速度會展開可選的速度，選了之後收合 */
commonR.audio.Playrate = function (props) {
  var h = commonR.h;
  var pthis = this;
  this.props = $.extend({ rate: 1.0 }, props);
  this.state = { isShowSel: false };

  var style = $.extend({}, commonR.audio.TEXT_STYLE, { "cursor": "pointer" });
  this.el = h("span");
  this.rShow = h("span", { style: style });
  $(this.rShow).bind("click", function () {
    if (pthis.state.isShowSel == false)
      pthis.setState({ isShowSel: true });
  });
  // x1.25、x1.75 原本就註解掉
  this.rSels = [0.5, 1.0, 1.5, 2.0].map(function (v) {
    var el = h("span", { style: style }, " x" + v.toFixed(1) + " ");
    $(el).bind("click", function () { pthis.onsetrate(v); });
    return el;
  });
  this.render();
};
commonR.audio.Playrate.prototype.setProps = function (props) {
  $.extend(this.props, props);
  this.render();
};
commonR.audio.Playrate.prototype.setState = function (state) {
  $.extend(this.state, state);
  this.render();
};
commonR.audio.Playrate.prototype.onsetrate = function (v) {
  this.setState({ isShowSel: false });
  this.props._setPlayrate(v);
};
commonR.audio.Playrate.prototype.render = function () {
  this.rShow.textContent = " x" + this.props.rate + " ";
  commonR.syncChildren(this.el, [this.rShow, this.state.isShowSel ? this.rSels : null]);
};

commonR.audio.Frame = function (props) {
  var h = commonR.h;
  var pthis = this;
  this.props = $.extend({
    "src": "http://media.fhl.net/unv1/1/1_001.mp3"
    //onend: function (audioDOM) { }
    //onnext: function (audioDOM) { }
    //onprev: function (audioDOM) { }
  }, props);
  this.state = {
    isplaying: 0,
    percent: 0.0,
    playrate: 1.0,
    "msg": "",
    audiolength: 0,
    is_ever_click_play: 0
  };

  this.rootSpan = h("span");
  this.rootMsg = h("div");
  this.el = this.rootSpan;
  this.audio = null; // 第一次按播放才建立；重設時丟掉

  this.rBtnPre = h("img", { "src": "images/prev_u607.png", "style": commonR.audio.BTN_STYLE, "onClick": function () { pthis._onprev(); } });
  this.rBtnPlay = h("img", { "src": "images/audioPlay.png", "style": commonR.audio.BTN_STYLE, "onClick": function () { pthis._handlePlayClick(); } });
  this.rBtnPause = h("img", { "src": "images/audioPause.png", "style": commonR.audio.BTN_STYLE, "onClick": function () { pthis._handlePauseClick(); } });
  this.rBtnNext = h("img", { "src": "images/next_u607.png", "style": commonR.audio.BTN_STYLE, "onClick": function () { pthis._onnext(); } });
  this.rPlayRate = new commonR.audio.Playrate({ "_setPlayrate": function (rate) { pthis._setPlayrate(rate); }, "rate": this.state.playrate });
  this.rProgress = new commonR.Processbar({ "onset": function (per) { pthis._setProcessPercent(per); }, "value": this.state.percent, "cxem": 9, "cyem": 1.5 });
  this.rProgressText = h("span", { style: commonR.audio.TEXT_STYLE });

  this.render();
};

commonR.audio.Frame.prototype.setProps = function (props) {
  // 切換章節的時候, (點經文), 要重設
  this._reset();
  $.extend(this.props, props);
  this.render();
};

commonR.audio.Frame.prototype.setState = function (state) {
  var preState = $.extend({}, this.state);
  $.extend(this.state, state);
  this.render();
  this._didUpdate(preState);
};

commonR.audio.Frame.prototype._reset = function () {
  $.extend(this.state, {
    isplaying: 0,
    percent: 0.0,
    //playrate: 1.0,
    "msg": "",
    audiolength: 0,
    is_ever_click_play: 0
  });
};

commonR.audio.Frame.prototype._didUpdate = function (preState) {
  var pthis = this;
  if (pthis.state.is_ever_click_play == 1 && preState.is_ever_click_play == 0) // first 變化. 加入事件
  {
    var domAudio = this.audio;

    domAudio.play();
    domAudio.playbackRate = this.state.playrate; // 新建的 audio 會是 x1 速度, 所以要調回去

    $(domAudio).bind("timeupdate", function (e) {
      pthis.setState({ "percent": domAudio.currentTime * 100.0 / domAudio.duration });
    }).bind("ended", function (e) {
      pthis.setState({ "isplaying": 0 });
      if (pthis.props.onend != null)
        pthis.props.onend(domAudio);
    }).bind("play", function (e) {
      pthis.setState({
        "isplaying": 1,
      });
      domAudio.playbackRate = pthis.state.playrate; //換src時,會重置速度
    }).bind("pause", function (e) {
      pthis.setState({ "isplaying": 0 });
    }).bind("error", function (e) {
      pthis.setState({ "msg": "error src" });
    }).bind("canplay", function (e) {
      // 若把 這事件放在 play, 換下一首取得的 .duration 會是 NaN
      pthis.setState({
        "audiolength": domAudio.duration,
        "msg": ""
      });
    }).bind("abort", function () {
      // 換 src 的時候, 會abort 前一個. 觸發完 abort , 就會觸發 emptied
      pthis.setState({
        "isplaying": 0,
        "percent": 0,
        "audiolength": 0,
      });
    });
  }
};

commonR.audio.Frame.prototype._handlePlayClick = function () {
  if (this.state.is_ever_click_play == 0)
    this.setState({ is_ever_click_play: 1 });
  else if (this.audio != null)
    this.audio.play();
};
commonR.audio.Frame.prototype._handlePauseClick = function () {
  if (this.audio != null)
    this.audio.pause();
};
commonR.audio.Frame.prototype._setProcessPercent = function (percent) {
  var domAudio = this.audio;
  if (domAudio == null)
    return;

  var sec = domAudio.duration * percent / 100.0;
  domAudio.currentTime = sec;
  this.setState({ percent: percent });
};
commonR.audio.Frame.prototype._setPlayrate = function (rate) {
  // 原本 React 版在還沒按過播放時會出錯、速度設不上；現在先記住，播放時套用
  if (this.audio != null)
    this.audio.playbackRate = rate;
  this.setState({ playrate: rate });
};
commonR.audio.Frame.prototype._onnext = function () {
  if (this.props.onnext != null) {
    this._reset();
    this.render();
    this.props.onnext(null);
  }
};
commonR.audio.Frame.prototype._onprev = function () {
  if (this.props.onprev != null) {
    this._reset();
    this.render();
    this.props.onprev(null);
  }
};

commonR.audio.Frame.prototype.render = function () {
  var s = this.state;

  // 有錯誤訊息時整個換成一個 div
  var root = (s.msg.length != 0) ? this.rootMsg : this.rootSpan;
  if (root !== this.el) {
    if (this.el.parentNode != null)
      this.el.parentNode.replaceChild(root, this.el);
    this.el = root;
  }
  if (s.msg.length != 0) {
    this.rootMsg.textContent = this.props.src + " " + s.msg;
    return;
  }

  if (s.is_ever_click_play == 1) {
    if (this.audio == null)
      this.audio = commonR.h("audio", { "src": this.props.src, "type": "audio/mpeg" });
    else if (this.audio.getAttribute("src") != this.props.src)
      this.audio.setAttribute("src", this.props.src);
  } else {
    this.audio = null;
  }

  var gettimestr = function (totalsec) {
    var str = "";
    var hh = Math.floor(totalsec / 3600);
    totalsec -= hh * 3600;
    var mm = Math.floor(totalsec / 60);
    totalsec -= mm * 60;
    totalsec = Math.floor(totalsec);
    if (hh > 0)
      str = hh + ":" + mm + ":" + totalsec;
    else if (mm > 0)
      str = mm + ":" + totalsec;
    else
      str = totalsec;
    return str;
  };
  var curstr = gettimestr(s.percent * s.audiolength / 100);
  var totalstr = gettimestr(s.audiolength);
  var isShowText = (totalstr != null && totalstr != 0 && s.is_ever_click_play != 0);
  if (isShowText)
    this.rProgressText.textContent = curstr + " / " + totalstr;

  this.rPlayRate.setProps({ "rate": s.playrate });
  if (s.is_ever_click_play != 0)
    this.rProgress.setProps({ "value": s.percent });

  commonR.syncChildren(this.rootSpan, [
    (this.props.onprev != null) ? this.rBtnPre : null,
    (s.isplaying == 0 || s.is_ever_click_play == 0) ? this.rBtnPlay : null,
    (s.isplaying != 0) ? this.rBtnPause : null,
    (this.props.onnext != null) ? this.rBtnNext : null,
    this.audio,
    this.rPlayRate.el,
    (s.is_ever_click_play != 0) ? this.rProgress.el : null,
    isShowText ? this.rProgressText : null
  ]);
};
