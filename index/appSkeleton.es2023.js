/**
 * 頁面骨架：各元件（FhlLecture、FhlInfo、Settings…）要掛上去的容器。
 *
 * 原本由 static/js 的 webpack Vue app（manifest/vendor/app，內含 Vue 2.5.16，約 190KB）產生。
 * 那個 Vue app 只有靜態模板，沒有 methods、事件、生命週期，所以改成直接插入它渲染出的 HTML。
 * 內容與 Vue 輸出逐字相同，只在原本就有空白的地方換行（不影響行內元素間距）。
 * 標題的 v1.2 之後會被 checkHtmlVersion 等程式改寫，與原本相同。
 */
export const APP_SKELETON_HTML = `<div><nav id="fhlTopMenu"><div><img id="logoFHL" src="static/images/FHLLOGO.png">
<a id="title">信望愛聖經工具&nbsp;<span>v1.2</span></a></div>
<ul class="menu"><li><a href="#"><span>讀經</span></a>
<ul class="menu-hover"><li><a target="_blank" href="https://bkbible.fhl.net/NUI/"> 讀經介面(new)</a></li>
<li><a target="_blank" href="https://bible.fhl.net/new/record.html"> 閱讀計劃</a></li>
<li><a target="_blank" href="https://bible.fhl.net/daily/sy_fhl.php"> 讀經計劃表</a></li>
<li><a target="_blank" href="http://a2z.fhl.net/fore/"> 主題研經</a></li>
<li><a target="_blank" href="http://a2z.fhl.net/bible/"> 專卷研經</a></li></ul></li>
<li><a href="#"><span>教學</span></a>
<ul class="menu-hover"><li><a target="_blank" href="http://bible.fhl.net/kim/index.php"> 原文解經(new)</a></li>
<li><a target="_blank" href="https://bible.fhl.net/new/audio_hb.php?version=7"> 希伯來文朗讀</a></li>
<li><a target="_blank" href="http://bible.fhl.net/kim/HebrewBibleSong.fsp.mp4/"> 希臘文朗讀</a></li>
<li><a target="_blank" href="http://bible.fhl.net/kim/HebrewBibleSong.fsp.mp4/"> 希伯來文歌</a></li>
<li><a target="_blank" href="https://bible.fhl.net/annouce/annouce84.html"> 中國教會史</a></li>
<li><a target="_blank" href="https://bible.fhl.net/isa/isa1.html"> 聖經課程</a></li>
<li><a target="_blank" href="http://fungclass.fhl.net/"> 多媒體教學</a></li></ul></li>
<li><a href="#"><span>查詢</span></a>
<ul class="menu-hover"><li><a target="_blank" href="http://bible.fhl.net/new/topic.html"> 主題查詢</a></li>
<li><a target="_blank" href="http://bible.fhl.net/new/search.html"> 經文查詢</a></li>
<li><a target="_blank" href="https://bible.fhl.net/new/smap.html"> 物件地理查詢</a></li>
<li><a target="_blank" href="http://church.fhl.net/"> 教會查詢</a></li>
<li><a target="_blank" href="http://bible.fhl.net/new/sdict.html"> 其他查詢</a></li>
<li><a target="_blank" href="http://music.fhl.net/song/"> 聖詩查詢</a></li></ul></li>
<li><a href="#"><span>工具</span></a>
<ul class="menu-hover"><li><a target="_blank" href="http://bible.fhl.net/new/parsing.html"> 舊約字彙分析</a></li>
<li><a target="_blank" href="http://bible.fhl.net/new/fhlwhparsing.html"> 新約字彙分析</a></li>
<li><a target="_blank" href="https://bible.fhl.net/new/measurement.html"> 度量衡</a></li>
<li><a target="_blank" href="http://bible.fhl.net/new/listall.html"> 簡寫對照</a></li>
<li><a target="_blank" href="https://bible.fhl.net/new/heb.html"> 文法對照</a></li></ul></li>
<li><a href="#"><span>專欄</span></a>
<ul class="menu-hover"><li><a target="_blank" href="https://www.fhl.net/main/what_new.html"> 電子報</a></li>
<li><a target="_blank" href="http://a2z.fhl.net/history/"> 歷史走廊</a></li>
<li><a target="_blank" href="https://bible.fhl.net/wu/"> 英雄本色</a></li>
<li><a target="_blank" href="http://a2z.fhl.net/textual/"> 經文鑑別</a></li>
<li><a target="_blank" href="https://bible.fhl.net/cover/"> 信望愛論壇</a></li>
<li><a target="_blank" href="https://bible.fhl.net/preach/"> 神學與生活</a></li>
<li><a target="_blank" href="https://bible.fhl.net/sundayschool/"> 主日學教育</a></li>
<li><a target="_blank" href="https://bible.fhl.net/writer/"> 網路作家</a></li>
<li><a target="_blank" href="https://bible.fhl.net/food/"> 靈糧選集</a></li></ul></li>
<li><a href="#"><span>連結</span></a>
<ul class="menu-hover"><li><a target="_blank" href="https://www.fhl.net/main/"> 信望愛WWW</a></li>
<li><a target="_blank" href="https://bible.fhl.net/"> 聖經資源</a></li>
<li><a target="_blank" href="http://taigi.fhl.net/"> 台語信望愛</a></li>
<li><a target="_blank" href="http://hakka.fhl.net/"> 客語信望愛</a></li>
<li><a target="_blank" href="http://sloan.fhl.net/"> 盲人點字</a></li>
<li><a target="_blank" href="http://ttlib.fhl.net/"> 神學圖書</a></li>
<li><a target="_blank" href="http://photo.fhl.net/main/"> 圖片資源</a></li>
<li><a target="_blank" href="http://music.fhl.net/"> 音樂網</a></li></ul></li>
<li><a href="#"><span>義工</span></a>
<ul class="menu-hover"><li><a target="_blank" href="https://bible.fhl.net/annouce/"> 公告</a></li>
<li><a target="_blank" href="http://www.fhl.net/main/fhl/fhl4.html"> 關於我們</a></li>
<li><a target="_blank" href="http://bible.fhl.net/new/"> COBS工作區</a></li>
<li><a target="_blank" href="https://bible.fhl.net/credit.html"> 義工群</a></li>
<li><a target="_blank" href="http://www.fhl.net/main/fhl/fhl2.html"> 徵稿</a></li>
<li><a target="_blank" href="https://www.fhl.net/main/fhl/fhl6.html"> 捐款</a></li>
<li><a target="_blank" href="http://www.fhl.net/cgi-bin/rogbook.cgi?webwork"> 刊登消息</a></li>
<li><a target="_blank" href="http://www.fhl.net/statistics/bible.fhl.net/"> 流量</a></li></ul></li></ul>
<a id="problemsReport"><div style="width: 30px; margin: auto;"><i class="fa fa-envelope-o fa-2x"></i></div>
<div style="width: 60px; margin: auto;">
      問題回報
    </div></a></nav>
<div id="mainWindow"><div id="fhlToolBar"><div id="help"></div>
<div id="windowControl"></div>
<div id="bookSelect"></div>
<div id="searchTool" class="smallText"></div></div>
<div id="fhlLeftWindow" class="leftWindow"><div class="leftWindowInside"><div id="settings"><div class="secondLevelInside"><p>▼&nbsp;設定</p>
<div id="settingsScrollDiv"><ul><li><div id="snSelect"></div></li>
<li><div id="realTimePopUpSelect"></div></li>
<li><div id="gbSelect"></div></li>
<li><div id="show_mode"></div></li>
<li><div id="mapTool"></div></li>
<li><div id="imageTool"></div></li>
<li><div id="fontSizeTool"></div></li></ul></div></div></div>
<div id="versionSelect"></div>
<div id="viewHistory"><div class="secondLevelInside"><p>▶&nbsp;歷史紀錄</p>
<span class="clearHistory">清除記錄</span>
<div id="viewHistoryScrollDiv"><ul class="viewHistoryList"></ul></div></div></div></div></div>
<div id="fhlMidWindow"><div id="fhlLecture"><div class="chapBack chapControl"><span>❮</span></div>
<div class="chapNext chapControl"><span>❯</span></div>
<span id="viewHistoryButton" style="position: absolute; right: 10px; cursor: pointer; font-size: 28px; font-weight: 800;"><span class="b noselect">←</span><span class="n noselect">→</span></span>
<div id="lecMainTitle"></div>
<div id="lecMain" style="padding: 10px 50px;"></div></div>
<div id="fhlMidBottomWindow"><div id="fhlMidBottomWindowTitle"></div>
<div id="fhlMidBottomWindowContent"></div></div></div>
<div id="fhlInfo"><div id="fhlInfoTitle"></div>
<div id="fhlInfoContent"></div></div>
<div id="bookSelectPopUp"><div id="bookSelectName"></div></div>
<div id="parsingPopUp"></div>
<div id="helpingPopUp"><div id="helpingPopUpInside"></div></div>
<div id="dictionaryPopUp"></div></div></div>`
