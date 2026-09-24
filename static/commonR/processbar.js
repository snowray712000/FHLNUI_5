/// <reference path="h.js" />
// 進度列:
// 目前應用於: 講道的 audio (commonR.audio.Frame)
// 原為 React 0.13 元件，改為純 JS。用法：
//   var bar = new commonR.Processbar({ value: 30, onset: function (per) { } });
//   parent.appendChild(bar.el); bar.setProps({ value: 40 });
var commonR = commonR || {};
commonR.Processbar = function (props) {
  this.props = $.extend({
    "cxem": 9, // 9em
    "cyem": 1.5, //高1.5em, 但bar會除以3的高, top也除以3(垂直置中)
    "value": 0.0, // 0-100
    "onset": function (per) { }
  }, props);

  var h = commonR.h;
  var pthis = this;
  this.el = h("span");
  this.rback = h("span");
  this.rfront = h("span");
  this.rfrontclick = h("span");
  $(this.rfrontclick).bind("mousedown", function (e) {
    if (pthis.props.onset != null)
      pthis.props.onset(e.offsetX * 100 / $(this).width());
  });
  this.render();
};
commonR.Processbar.prototype.setProps = function (props) {
  $.extend(this.props, props);
  this.render();
};
commonR.Processbar.prototype.render = function () {
  var cybar = this.props.cyem / 3 + "em";
  var cx = this.props.cxem + "em";
  var cx_front = this.props.cxem * this.props.value / 100.0; //紅色長度

  var setStyle = commonR.setStyle;
  setStyle(this.el, { "height": this.props.cyem + "em", "width": cx, "display": "inline-block", "position": "relative" });
  setStyle(this.rback, { "height": cybar, "width": cx, "background-color": "whitesmoke", "display": "inline-block", "position": "absolute", "top": cybar });
  setStyle(this.rfront, { "height": cybar, "width": cx_front + "em", "background-color": "red", "display": "inline-block", "position": "absolute", "top": cybar });
  setStyle(this.rfrontclick, { "height": cybar, "width": cx, "display": "inline-block", "position": "absolute", "top": cybar });

  commonR.syncChildren(this.el, [this.rback, (this.props.value > 0) ? this.rfront : null, this.rfrontclick]);
};
