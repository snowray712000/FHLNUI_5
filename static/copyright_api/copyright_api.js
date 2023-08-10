/// <reference path="../libs/jquery-1.11.3.js" />
/// <reference path="../libs/react/react-0.13.1.min.js" />
/// <reference path="../libs/react/react-with-addons-0.13.1.min.js" />
/*
<script src="../libs/jquery-1.11.3.js"></script>
<script src="../libs/react/react-0.13.1.min.js"></script>
<script src="../libs/react/react-with-addons-0.13.1.min.js"></script>
*/
// copyright_api
var copyright_data = {
  ncv: '《聖經新譯本》©1976, 1992, 1999, 2001, 2005, 2010版權屬於<a href="http://www.wwbible.org">環球聖經公會</a>。',
  tcv: '《現代中文譯本》©1997版權屬於聯合聖經公會，由台灣聖經公會授權信望愛站使用。',
  esv: 'The Holy Bible, English Standard Version ©2001 Crossway Bibles, a publishing ministry of Good News Publishers. <a href="https://bkbible.fhl.net/new/ESV.html">All rights reserved. ESV Fully Copyright Notice and Permissions Information</a>',
  recover: '恢復本經文由<a href="http://www.twgbr.org.tw">台灣福音書房</a>授權給信望愛資訊中心網路刊載用。',
  '日語聖經': '日語聖經Colloquil Japanese Version 由<a href="http://bible.salterrae.net/kougo/html/">http://bible.salterrae.net/kougo/html/</a>取得。',// 尚未有代碼
  apskcl: '紅皮聖經全羅版的著作權資料如<a href="http://taigi.fhl.net/Godspeak/Godspeak24.html">所示</a>。',
  apskhl: '紅皮聖經漢羅翻寫版與巴克禮白話字聖經漢羅翻寫由林俊育先生提供，並蒙允許使用。網頁使用的Unicode字型來自<a href="http://www.phahng.idv.tw/">拋荒台語文工作室</a>，並蒙允許使用。另感謝陳鄭弘堯先生提供SQL格式之資料協助紅皮聖經轉入CBOL計劃。',
  bklcl: '[台語白話字聖經（巴克禮全羅版）]於1933年由聖經公會印製完成。',
  bklhl: '紅皮聖經漢羅翻寫版與巴克禮白話字聖經漢羅翻寫由林俊育先生提供，並蒙允許使用。網頁使用的Unicode字型來自<a href="http://www.phahng.idv.tw/">拋荒台語文工作室</a>，並蒙允許使用。另感謝陳鄭弘堯先生提供SQL格式之資料協助紅皮聖經轉入CBOL計劃。'

};
var copyright_api = copyright_api || {};
copyright_api.R = copyright_api.R || {
  frame: React.createClass({
    getDefaultProps: function () {
      return {
        ver: [] //["unv", "tcv"]
      };
    },
    getInitialState: function () { return {}; },
    componentWillMount: function () { },
    componentDidMount: function () {
      var divThis = this.getDOMNode();
      if (divThis == null)
        return;

      $.each(this.props.ver, function () {
        if ( copyright_data[this] != null )
        {
          var newelem = $('<span>' + copyright_data[this] + '</span>');
          $(divThis).append(newelem);
        }
      });
    },
    componentWillReceiveProps: function (nextProp) {         },
    componentWillUpdate: function (nextProp, nextState) { },
    componentDidUpdate: function (preProp, preState) {
      this.componentWillUnmount();
      this.componentDidMount();
    },
    componentWillUnmount: function () {
      var divThis = this.getDOMNode();
      if (divThis == null)
        return;
      $(divThis).empty();//清空所有的child元件(在did建的)
      //$(divThis).off();//移除所有監聽
    },//通常在DidMount建的 DOM 在這裡要移除. timer 也是
    render: function () {
      return React.createElement("div", {ref:"mainframe"});
    }
  })
};