/// <reference path="../libs/jquery-1.11.3.js" />
// copyright_api
var copyright_data = {
  ncv: '《聖經新譯本》版權聲明<br/>《聖經新譯本》©1976, 1992, 1999, 2001, 2005, 2010版權屬於環球聖經公會，蒙允准使用，謹此致謝。<br/>使用者不論以任何形式（包括書寫、印刷、錄音、視像或電子媒體等）引用《聖經新譯本》經文，必須註明出處，或於作銷售用途的聖經參考書、註釋書刊引用《聖經新譯本》，須先得環球聖經公會書面許可。有關申請須以電郵(legal@wwbible.org)、傳真(852-2356-7234)或信函(地址：香港九龍新蒲崗雙喜街九號匯達商業中心22樓)方式寫給環球聖經公會版權部負責人收。',
  wcb: '《環球聖經譯本》版權聲明<br/>《環球聖經譯本》© 2023，版權屬於環球聖經公會，蒙允准使用，謹此致謝。<br/>使用者不論以任何形式（包括書寫、印刷、錄音、視像或電子媒體等）引用《環球聖經譯本》經文，必須註明出處，或於作銷售用途的聖經參考書、註釋書刊引用《環球聖經譯本》，須先得環球聖經公會書面許可。有關申請須以電郵(legal@wwbible.org)、傳真(852-2356-7234)或信函(地址：香港九龍新蒲崗雙喜街九號匯達商業中心22樓)方式寫給環球聖經公會版權部負責人收。',
  tcv: '《現代中文譯本》©1997版權屬於聯合聖經公會，由台灣聖經公會授權信望愛站使用。',
  esv: 'The Holy Bible, English Standard Version ©2001 Crossway Bibles, a publishing ministry of Good News Publishers. <a href="https://bkbible.fhl.net/new/ESV.html" target="_blank">All rights reserved. ESV Fully Copyright Notice and Permissions Information</a>',
  recover: '恢復本經文由<a href="http://www.twgbr.org.tw" target="_blank">台灣福音書房</a>授權給信望愛資訊中心網路刊載用。',
  '日語聖經': '日語聖經Colloquil Japanese Version 由<a href="http://bible.salterrae.net/kougo/html/">http://bible.salterrae.net/kougo/html/</a>取得。',// 尚未有代碼
  apskcl: '紅皮聖經全羅版的著作權資料如<a href="http://taigi.fhl.net/Godspeak/Godspeak24.html" target="_blank">所示</a>。',
  apskhl: '紅皮聖經漢羅翻寫版與巴克禮白話字聖經漢羅翻寫由林俊育先生提供，並蒙允許使用。網頁使用的Unicode字型來自<a href="http://www.phahng.idv.tw/" target="_blank">拋荒台語文工作室</a>，並蒙允許使用。另感謝陳鄭弘堯先生提供SQL格式之資料協助紅皮聖經轉入CBOL計劃。',
  bklcl: '[台語白話字聖經（巴克禮全羅版）]於1933年由聖經公會印製完成。',
  bklhl: '紅皮聖經漢羅翻寫版與巴克禮白話字聖經漢羅翻寫由林俊育先生提供，並蒙允許使用。網頁使用的Unicode字型來自<a href="http://www.phahng.idv.tw/" target="_blank">拋荒台語文工作室</a>，並蒙允許使用。另感謝陳鄭弘堯先生提供SQL格式之資料協助紅皮聖經轉入CBOL計劃。',
  others: '各聖經譯本著作權如<a href="https://www.fhl.net/main/fhl/fhl8.html" target="_blank">版權說明</a>。'
};
var copyright_api = copyright_api || {};
/**
 * 在 container 裡放各譯本的版權宣告（原為 React 0.13 元件 copyright_api.R.frame）。
 * @param {HTMLElement} container
 * @param {string[]} ver ex: ["unv", "tcv"]
 */
copyright_api.render = function (container, ver) {
  var divThis = document.createElement("div");
  $(container).empty().append(divThis);

  $.each(ver || [], function () {
    if (copyright_data[this] != null) {
      var newelem = $('<hr/ style="margin:4px 0px;"><span class="copyright-text">' + copyright_data[this] + '</span>');
      $(divThis).append(newelem);
    }
  });

  $(divThis).append('<hr/ style="margin:4px 0px;"><span class="copyright-text">各聖經譯本著作權如<a href="https://www.fhl.net/main/fhl/fhl8.html" target="_blank">版權說明</a>。</span>');
};
