/// <reference path="../libs/jquery-1.11.3.js" />
/// <reference path="../libs/react/react-0.13.1.min.js" />
/// <reference path="../libs/react/react-with-addons-0.13.1.min.js" />
/// <reference path="processbar.js" />
commonR = commonR || {};
commonR.R = commonR.R || {};
commonR.R.audio = commonR.R.audio || {
  dom: React.createClass({
    // 因為 React 的 audio 元件並不完整可以控制. 所以才用這個 dom 
    getDefaultProps: function () {
      return {
        playbackRate: 1,
        //volume: 1,
        src: "",
        play:1
      };
    },
    getInitialState: function () { return {}; },
    componentWillMount: function(){},
    componentDidMount: function () {
      // 每次都建 audio dom
      var divThis = this.getDOMNode();
      if (divThis == null)
        return;
      
      if (this.props.src.length == 0) 
        return;

      var newelem = $('<audio src="http://media.fhl.net/unv1/2/2_004.mp3" type="audio/mpeg" controls preload="none"> Your browser does not support the audio element </audio>');//src必須馬上接在audio後面
      //var newelem = $('<audio src="'+this.props.src+'" type="audio/mpeg" preload="none"> Your browser does not support the audio element </audio>');//src必須馬上接在audio後面
      $(divThis).append(newelem);

      // 播放
      //$("audio", $(divThis)).get(0).play();
      var domplay = $("audio", $(divThis)).get(0);
      domplay.defaultPlaybackRate = this.props.playbackRate; //firefox 要用這個
      domplay.playbackRate = this.props.playbackRate; //chrome 要用這個
      if ( this.props["volume"] != null )
      domplay.volume = this.props.volume; //chrome 要用這個
      if ( this.props.play != 0)
        domplay.play();
    },
    componentWillReceiveProps: function (nextProp) { },
    componentWillUpdate: function (nextProp, nextState) { },
    componentDidUpdate: function (preProp, preState) {
      this.componentWillUnmount();
      this.componentDidMount();
    },
    componentWillUnmount: function () {
      var divThis = this.getDOMNode();
      if (divThis == null)
        return;
      $(divThis).empty(); //清空所有的child元件(在did建的)
    },
    render: function () { return React.createElement("span", {}); },
  }),
  playrate: React.createClass({
    getDefaultProps: function () {
      return { rate: 1.0 };
    },
    getInitialState: function () { return { isShowSel: false }; },
    componentDidMount: function () {
      var pthis = this;

      if (this.refs.ss == null)
        return;

      $(this.refs.ss.getDOMNode()).bind("click", function () {
        if (pthis.state.isShowSel == false)
          pthis.setState({ isShowSel: true });
      });

      // 這裡無法加入, 因為 DidMount 呼叫時, 會沒有呼叫到下面, 以後也沒有機會呼叫到
      //if (this.refs.s0 == null)
      //  return;
      //$(this.refs.s0.getDOMNode()).bind("click", function () { pthis.onsetrate(0.5); });
      //$(this.refs.s1.getDOMNode()).bind("click", function () { pthis.onsetrate(1.0); });
      //$(this.refs.s2.getDOMNode()).bind("click", function () { pthis.onsetrate(1.25); });
      //$(this.refs.s3.getDOMNode()).bind("click", function () { pthis.onsetrate(1.50); });
      //$(this.refs.s4.getDOMNode()).bind("click", function () { pthis.onsetrate(1.75); });
      //$(this.refs.s5.getDOMNode()).bind("click", function () { pthis.onsetrate(2.00); });
    },
    componentWillUpdate: function (nextProp, nextState) {

      if (this.refs.s0 == null)
        return;
      var pthis = this;

      if (nextState.isShowSel == false && this.state.isShowSel == true) {
        //console.log("解除");
        $(this.refs.s0.getDOMNode()).unbind("click");
        $(this.refs.s1.getDOMNode()).unbind("click");
        //$(this.refs.s2.getDOMNode()).unbind("click");
        $(this.refs.s3.getDOMNode()).unbind("click");
        //$(this.refs.s4.getDOMNode()).unbind("click");
        $(this.refs.s5.getDOMNode()).unbind("click");
      }
    },
    componentDidUpdate: function (preProp, preState) {
      if (this.refs.s0 == null)
        return;
      var pthis = this;

      if (this.state.isShowSel == true && preState.isShowSel == false) {
        //console.log("新增");
        $(this.refs.s0.getDOMNode()).bind("click", function () { pthis.onsetrate(0.5); });
        $(this.refs.s1.getDOMNode()).bind("click", function () { pthis.onsetrate(1.0); });
        //$(this.refs.s2.getDOMNode()).bind("click", function () { pthis.onsetrate(1.25); });
        $(this.refs.s3.getDOMNode()).bind("click", function () { pthis.onsetrate(1.50); });
        //$(this.refs.s4.getDOMNode()).bind("click", function () { pthis.onsetrate(1.75); });
        $(this.refs.s5.getDOMNode()).bind("click", function () { pthis.onsetrate(2.00); });
      }

    },
    onsetrate: function (v) {
      //console.log(v);
      this.setState({ isShowSel: false });
      this.props._setPlayrate(v);
    },
    render: function () {
      var rShow = React.createElement("span", { style: { "height": "1.5em", "line-height": "1.5em", "vertical-align": "top","cursor":"pointer" }, "ref": "ss" }, " x" + this.props.rate + " ");

      var rSel0 = React.createElement("span", { style: { "height": "1.5em", "line-height": "1.5em", "vertical-align": "top", "cursor": "pointer" }, "ref": "s0" }, " x0.5 ");
      var rSel1 = React.createElement("span", { style: { "height": "1.5em", "line-height": "1.5em", "vertical-align": "top", "cursor": "pointer" }, "ref": "s1" }, " x1.0 ");
      //var rSel2 = React.createElement("span", { style: { "height": "1.5em", "line-height": "1.5em", "vertical-align": "top","cursor":"pointer" }, "ref": "s2" }, " x1.25 ");
      var rSel2 = null;
      var rSel3 = React.createElement("span", { style: { "height": "1.5em", "line-height": "1.5em", "vertical-align": "top", "cursor": "pointer" }, "ref": "s3" }, " x1.5 ");
      //var rSel4 = React.createElement("span", { style: { "height": "1.5em", "line-height": "1.5em", "vertical-align": "top" ,"cursor":"pointer"}, "ref": "s4" }, " x1.75 ");
      var rSel4 = null;
      var rSel5 = React.createElement("span", { style: { "height": "1.5em", "line-height": "1.5em", "vertical-align": "top", "cursor": "pointer" }, "ref": "s5" }, " x2.0 ");

      if (this.state.isShowSel == false)
        return React.createElement("span", { style: {} }, rShow);
      return React.createElement("span", { style: {} }, rShow, rSel0, rSel1, rSel2, rSel3, rSel4, rSel5);
    }
  }),
  frame: React.createClass({
    getDefaultProps: function () {
      return {
        "src": "http://media.fhl.net/unv1/1/1_001.mp3"
        //onend: function (audioDOM) { }
        //onnext: function (audioDOM) { }
        //onprev: function (audioDOM) { }
      };
    },
    getInitialState: function () {
      return {
        isplaying: 0,
        percent: 0.0,
        playrate: 1.0,
        "msg": "",
        audiolength: 0,
        is_ever_click_play:0
      };
    },
    componentDidMount: function () {
      // DOM 的 event bind 搬到 DidUpdate 
    },
    componentWillReceiveProps: function (nextProp) {
      // 切換章節的時候, (點經文), 要重設
      this.setState({
        isplaying: 0,
        percent: 0.0,
        //playrate: 1.0,
        "msg": "",
        audiolength: 0,
        is_ever_click_play: 0
      });
    },
    componentDidUpdate: function (preProp, preState) {
      var pthis = this;
      if ( pthis.state.is_ever_click_play == 1 && preState.is_ever_click_play == 0) // first 變化. 加入事件
      {
        var domAudio = this.refs.audio_obj.getDOMNode();
        if (domAudio == null) {
          console.debug("按規畫,這裡應該不會是null");
          return;
        }

        domAudio.play();
        domAudio.playbackRate = this.state.playrate; // 新建一個 react audio. 會變回 x1 速度, 所以要調回去
        //domAudio.src = "";

        $(domAudio).bind("timeupdate", function (e) {
          pthis.setState({ "percent": domAudio.currentTime * 100.0 / domAudio.duration });
        }).bind("ended", function (e) {
          //console.log("ended");
          pthis.setState({ "isplaying": 0 });
          if (pthis.props.onend != null)
            pthis.props.onend(domAudio);
        }).bind("play", function (e) {
          //console.log("play");
          pthis.setState({
            "isplaying": 1,
          });
          domAudio.playbackRate = pthis.state.playrate; //換src時,會重置速度
        }).bind("pause", function (e) {
          //console.log("pause");
          pthis.setState({ "isplaying": 0 });
        }).bind("error", function (e) {
          //console.log("error");
          pthis.setState({ "msg": "error src" });
        }).bind("canplay", function (e) {
          //console.log("canplay");
          // 若把 這事件放在 play, 換下一首取得的 .duration 會是 NaN...這個改放到 metadataload
          pthis.setState({
            "audiolength": domAudio.duration,
            "msg": ""
          });
        }).bind("stalled", function (e) {
          //console.log("stalled");
          //domAudio.load();
          //domAudio.src = pthis.props.src;
          //pthis.setState({ "msg": "error load" });
        }).bind("abort", function () {
          //console.log("abort");
          // 換 src 的時候, 會abort 前一個. 觸發完 abort , 就會觸發 emptied 
          pthis.setState({
            "isplaying": 0,
            "percent": 0,
            "audiolength": 0,
          });
        }).bind("canplaythrough", function () {
          //console.log("canplaythrough");
        }).bind("emptied", function () {
          //console.log("emptied");
          // 換 src 的時候, 會abort 前一個. 觸發完 abort , 就會觸發 emptied (下面這些在abort時呼叫了)
          //pthis.setState({
          //  "percent": 0,
          //  "audiolength": 0
          //});
        }).bind("suspend", function () {
          //console.log("suspend");
        }).bind("loadstart", function () {
          //console.log("loadstart");
          // abort, emptied, loadstart, loadmetadata, loaddata 順序 ...
        }).bind("loadedmetadata", function () {
          //console.log("loadedmetadata");
          // abort, emptied, loadstart, loadmetadata, loaddata, canplay 順序 ... ( 從canplay呼叫吧)
          // 資料長度那些, 好像就叫 metadata
          //pthis.setState({
          //  "percent": 0,
          //  "audiolength": 0,
          //});
        }).bind("loadeddata", function () {
          //console.log("loadeddata");
        });
      }
    },
    _handlePlayClick: function () {
      if (this.state.is_ever_click_play == 0)
      {
        this.setState({ is_ever_click_play: 1 });
      }
      else
      {
        var domAudio = this.refs.audio_obj.getDOMNode();
        if (domAudio == null)
          return;

        domAudio.play();
      }
    },
    _handlePauseClick: function () {
      var domAudio = this.refs.audio_obj.getDOMNode();
      if (domAudio == null)
        return;
      domAudio.pause();
    },
    _setProcessPercent: function (percent) {
      var domAudio = this.refs.audio_obj.getDOMNode();
      if (domAudio == null)
        return;

      var sec = domAudio.duration * percent / 100.0;
      domAudio.currentTime = sec;
      this.setState({ percent: percent });
    },
    _setPlayrate: function (rate) {
      var domAudio = this.refs.audio_obj.getDOMNode();
      if (domAudio == null)
        return;

      domAudio.playbackRate = rate;
      this.setState({ playrate: rate });
    },
    _onnext: function () {
      if (this.props.onnext != null)
      {
        this.setState({
          isplaying: 0,
          percent: 0.0,
          //playrate: 1.0,
          "msg": "",
          audiolength: 0,
          is_ever_click_play: 0
        });
        //this.props.onnext(this.refs.audio_obj.getDOMNode());
        this.props.onnext(null);
      }
        
    },
    _onprev: function () {
      if (this.props.onprev != null) {
        this.setState({
          isplaying: 0,
          percent: 0.0,
          //playrate: 1.0,
          "msg": "",
          audiolength: 0,
          is_ever_click_play: 0
        });
        //this.props.onprev(this.refs.audio_obj.getDOMNode());
        this.props.onprev(null);
      }
        
    },
    render: function () {
      var rAudioObj = (this.state.is_ever_click_play==1) ? React.createElement("audio", {
        "src": this.props.src,
        "type": "audio/mpeg",
        //"controls": "controls",
        "ref": "audio_obj"
      }):null;

      if (this.state.msg.length != 0)
        return React.createElement("div", {}, this.props.src + " " + this.state.msg );

      var rBtnPre = (this.props.onprev != null) ? React.createElement("img", { "src": "images/prev_u607.png", "style": { "height": "1.5em", "cursor": "pointer" }, "onClick": this._onprev }) : null;
      var rBtnPlay = (this.state.isplaying == 0 || this.state.is_ever_click_play == 0) ? React.createElement("img", { "src": "images/audioPlay.png", "style": { "height": "1.5em", "cursor": "pointer" }, "onClick": this._handlePlayClick }) : null;
      var rBtnPause = (this.state.isplaying != 0 ) ? React.createElement("img", { "src": "images/audioPause.png", "style": { "height": "1.5em", "cursor": "pointer" }, "onClick": this._handlePauseClick }) : null;
      var rBtnNext = (this.props.onnext != null) ? React.createElement("img", { "src": "images/next_u607.png", "style": { "height": "1.5em", "cursor": "pointer" }, "onClick": this._onnext }) : null;

      var rPlayRate = React.createElement(commonR.R.audio.playrate, { "_setPlayrate": this._setPlayrate, "rate": this.state.playrate });
      var rProgress = (this.state.is_ever_click_play != 0) ? React.createElement(commonR.R.processbar, { "onset": this._setProcessPercent, "value": this.state.percent, "cxem": 9, "cyem": 1.5 }) : null;

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

      var curstr = gettimestr(this.state.percent * this.state.audiolength / 100);
      var totalstr = gettimestr(this.state.audiolength);
      var rProgressText = (totalstr != null && totalstr != 0 && this.state.is_ever_click_play != 0) ? React.createElement("span", { style: { "height": "1.5em", "line-height": "1.5em", "vertical-align": "top" } }, curstr + " / " + totalstr) : null;

      return React.createElement("span", {}, rBtnPre, rBtnPlay, rBtnPause, rBtnNext, rAudioObj, rPlayRate, rProgress, rProgressText);
    }
  }),
};