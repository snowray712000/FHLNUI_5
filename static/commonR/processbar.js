/// <reference path="../libs/jquery-1.11.3.js" />
/// <reference path="../libs/react/react-0.13.1.min.js" />
/// <reference path="../libs/react/react-with-addons-0.13.1.min.js" />
// 進度列: 
// 目前應用於: 有聲聖經的bar
var commonR = commonR || {};
commonR.R = commonR.R || {
  processbar: React.createClass({
    getDefaultProps: function () {
      return {
        "cxem": 9, // 9em
        "cyem": 1.5, //高1.5em, 但bar會除以3的高, top也除以3(垂直置中)
        "value": 0.0, // 0-100
        "onset": function (per) { }
      };
    },
    getInitialState: function () { return {}; },
    componentDidMount: function () {
      var dom1 = this.refs.rectfront.getDOMNode();
      if (dom1 == null)
        return;
      var pthis = this;
      $(dom1).bind("mousedown", function (e) {
        if (pthis.props.onset != null)
          pthis.props.onset(e.offsetX * 100 / $(this).width());
      });
    },
    render: function () {
      var cybar = this.props.cyem / 3 + "em";
      var cx = this.props.cxem + "em";
      var cx_front = this.props.cxem * this.props.value / 100.0; //紅色長度

      var rback = React.createElement("span", { style: { "height": cybar, "width": cx, "background-color": "whitesmoke", "display": "inline-block", "position": "absolute", "top": cybar } });
      var rfront = (this.props.value > 0) ? React.createElement("span", { style: { "height": cybar, "width": cx_front + "em", "background-color": "red", "display": "inline-block", "position": "absolute", "top": cybar } }) : null;
      var rfrontclick = React.createElement("span", { style: { "height": cybar, "width": cx, "display": "inline-block", "position": "absolute", "top": cybar }, "ref": "rectfront" });
      return React.createElement("span", { style: { "height": this.props.cyem + "em", "width": cx, "display": "inline-block", "position": "relative" } },
        rback, rfront, rfrontclick);
    }
  })
};