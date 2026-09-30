/**
 * 頁面骨架：各元件（FhlLecture、FhlInfo、Settings…）要掛上去的容器。
 *
 * 原本由 static/js 的 webpack Vue app（manifest/vendor/app，內含 Vue 2.5.16，約 190KB）產生。
 * 那個 Vue app 只有靜態模板，沒有 methods、事件、生命週期，所以改成直接插入它渲染出的 HTML。
 * 內容原與 Vue 輸出逐字相同，只在原本就有空白的地方換行（不影響行內元素間距）。
 * 上方 nav 已改成一列的工具列 (見 TopBar.es2023.js)：原本滑過才出現的「讀經、教學…」
 * 改成 #resourcesPanel (▦ 點了才開)，窄的時候收進 #moreMenu (⋮)。
 * 版本號 v1.2 之後會被 TopBar.setVersion 改寫，手動更新按鈕由 checkHtmlVersion 加入 #appVer。
 */

/**
 * ▦ 信望愛資源面板的連結：[網址, 標題, 一行簡介]。
 * 各連結是什麼、和本工具哪個功能重疊，見 docs/z260930c(信望愛資源-各連結說明與首頁比對).md
 */
const RESOURCES = [
    ['讀經', [
        ['https://bkbible.fhl.net/NUI/', '讀經介面(new)', '本工具 (備份站)'],
        ['https://bible.fhl.net/new/record.html', '閱讀計劃', '排個人讀經計畫、記錄進度'],
        ['https://bible.fhl.net/daily/sy_fhl.php', '讀經進度表', '聖經公會一年讀完進度'],
        ['http://a2z.fhl.net/fore/', '主題研經', '「永恆答問」主題短文'],
        ['http://a2z.fhl.net/bible/', '專卷研經', '註釋整卷一次看 (同註釋分頁)'],
        ['https://bible.fhl.net/huang/gospel_show.php', '四福音合參', '四福音平行經文並排'],
        ['https://bible.fhl.net/huang/parallel/hist.php', '舊約歷史合參', '撒母耳、列王、歷代並排'],
        ['https://bible.fhl.net/huang/parallel/paul.php', '保羅書信合參', '保羅書信平行段落'],
        ['https://bible.fhl.net/huang/parallel/other.php', '先知詩篇合參', '先知書、詩篇平行經文'],
        ['https://bible.fhl.net/sy/', '經課集', '教會年曆每週經課'],
        ['https://bible.fhl.net/new/readsub.html', '次經', '1933《次經全書》'],
        ['https://bible.fhl.net/AF/readaf.html', '使徒教父', '革利免、伊格那丟等著作'],
    ]],
    ['教學', [
        ['https://bible.fhl.net/annouce/annouce84.html', '中國教會史', '蘇文峰 12 講影片'],
        ['https://bible.fhl.net/isa/isa1.html', '聖經課程', '成人主日學 8 季課程'],
        ['http://fungclass.fhl.net/', '多媒體教學', '互動式聖經故事教學'],
        ['https://bible.fhl.net/kimotintr/', '舊約導論', '金京來 8 堂影片'],
        ['https://bible.fhl.net/seedvideo/', '播種聖經課程', '依書卷分站的影片課程'],
        ['https://bible.fhl.net/isa_ttv/1.html', '現中導讀', '現代中文譯本導讀影片'],
        ['https://media.fhl.net/liu/', '海德堡要理問答', '劉清虔牧師逐問講解'],
        ['https://bible.fhl.net/studyhowto/main.html', '查經專輯', '字典、原文、註釋怎麼用'],
        ['https://bible.fhl.net/letwordbe/', '文以載道', '奈達與聖經翻譯 (全書)'],
        ['https://bible.fhl.net/report/', '報告格式手冊', '神學院報告註腳、書目格式'],
    ]],
    ['原文學習', [
        ['http://bible.fhl.net/kim/index.php', '原文解經(new)', '金京來逐章原文解經影片'],
        ['https://bible.fhl.net/kim/song/', '原文學習歌曲', '金京來唱歌學原文 13 堂'],
        ['http://bible.fhl.net/kim/HebrewBibleSong.fsp.mp4/', '希伯來文歌', '金京來希伯來文歌 (舊版)'],
        ['https://bible.fhl.net/kim/learn/', '有趣的希伯來文', '金京來希伯來文入門 12 堂'],
        ['https://bible.fhl.net/kimgreek/', '新約希臘文', '金京來希臘文 16 堂'],
        ['https://bible.fhl.net/kim/arama.html', '亞蘭文課', '舊約中的亞蘭文 2 講'],
        ['https://bible.fhl.net/wheat_class/', '麥種希臘文', '希臘文基礎課 36 課'],
        ['https://bible.fhl.net/new/greekbookc/', '陳維進希臘文法', '線上文法書 20 章'],
        ['https://bible.fhl.net/grkebook/', '程玲希臘文法', '線上文法書 基礎+進階'],
        ['https://bible.fhl.net/hebook/', '希伯來文法', '王維瑩課文、PDF、影音'],
        ['https://nanclass.fhl.net/', '陳俊南原文課', '希臘文、希伯來文錄音課'],
        ['https://bible.fhl.net/new/flash.html', '原文單字表', '依出現次數背原文單字'],
    ]],
    ['查詢', [
        ['http://bible.fhl.net/new/topic.html', '主題查詢', 'Torrey、Nave\'s 主題索引'],
        ['http://bible.fhl.net/new/search.html', '經文查詢', '關鍵字、SN 搜尋 (同搜尋框)'],
        ['https://bible.fhl.net/new/smap.html', '物件地理查詢', '地名、物件 (同地圖分頁)'],
        ['http://church.fhl.net/', '教會查詢', '依住址、名稱找教會'],
        ['http://bible.fhl.net/new/sdict.html', '其他查詢', '註釋、原文字典全文搜尋'],
        ['http://music.fhl.net/song/', '聖詩查詢', '頌主聖詩歌譜、MIDI、MP3'],
        ['https://bible.fhl.net/SDBG_zh.html', '語義大詞典', '新約希臘字依語意分類'],
        ['https://bible.fhl.net/Mar/', '動植物物件字典', '聖經中的動植物與器物'],
        ['https://biblegeography.holylight.org.tw/', '聖經地理(聖光)', '地名照片、地圖、考古'],
        ['https://taigi.fhl.net/song/', '台語聖詩', '台語聖詩投影片、伴奏'],
    ]],
    ['工具', [
        ['http://bible.fhl.net/new/parsing.html', '舊約字彙分析', '逐字文法、依字幹跨卷查'],
        ['http://bible.fhl.net/new/fhlwhparsing.html', '新約字彙分析', '逐字文法、依詞性時態查'],
        ['https://bible.fhl.net/new/measurement.html', '度量衡', '重量長度錢幣換算公制'],
        ['http://bible.fhl.net/new/listall.html', '簡寫對照', '書卷中英文縮寫表'],
        ['https://bible.fhl.net/new/heb.html', '文法對照', '和合本時態碼對照表'],
        ['https://bible.fhl.net/chart/', '聖經圖表', '列王先知、節期等圖表'],
    ]],
    ['AI', [
        ['https://biblequest.ai/#/chat?_n=1', '問道AI', 'AI 聖經助手 (測試版)'],
        ['https://gemini.google.com/gem/1GeZBoPW1JLGUdcHX3aK4uUCfmLLk1LD-?usp=sharing', '信望愛 GEM', 'Google Gemini 上的助手'],
        ['https://bible.fhl.net/aitest.html', 'AI 應用測試', '站內問答、兒主故事生成等'],
        ['https://github.com/ytssamuel/FHL_MCP_SERVER', 'MCP Server', '讓 AI 查信望愛 API (開發者)'],
    ]],
    ['專欄', [
        ['https://www.fhl.net/main/what_new.html', '電子報', '每週新文章索引'],
        ['http://a2z.fhl.net/history/', '歷史走廊', '教會歷史、聖地考察'],
        ['http://a2z.fhl.net/textual/', '經文鑑別', '抄本、校勘、考古文章'],
        ['https://bible.fhl.net/cover/', '信望愛論壇', '信仰與社會議題'],
        ['https://bible.fhl.net/preach/', '神學與生活', '神學落實到生活'],
        ['https://bible.fhl.net/sundayschool/', '主日學教育', '兒童主日學故事'],
        ['https://bible.fhl.net/writer/', '網路作家', '投稿作者文章'],
        ['https://bible.fhl.net/food/', '靈糧選集', '靈修、輔導譯文'],
    ]],
    ['連結', [
        ['https://www.fhl.net/main/', '信望愛WWW', '信望愛總站、國際日報專欄'],
        ['https://bible.fhl.net/', '聖經資源', '信望愛聖經網站首頁'],
        ['http://taigi.fhl.net/', '台語信望愛', '台語文章、白話字'],
        ['http://hakka.fhl.net/', '客語信望愛', '客語文章、客語聖經'],
        ['http://sloan.fhl.net/', '盲人點字', '點字版網站'],
        ['http://ttlib.fhl.net/', '神學圖書', '九所神學院聯合書目'],
        ['http://photo.fhl.net/main/', '圖片資源', '攝影作品、電子卡片'],
        ['http://music.fhl.net/', '音樂網', '聖詩投影片、伴奏下載'],
        ['https://hb.fhl.net/', '手機/Android', 'App、離線版下載'],
        ['https://bible.fhl.net/annouce/annouce165.html', '其他聖經網站', '其他線上聖經資源介紹'],
        ['https://wbbs.fhl.net/php/ann.php', 'BBS精華區', '信望愛 BBS 文章'],
    ]],
    ['義工', [
        ['https://bible.fhl.net/annouce/', '公告', '編輯案頭最新文章'],
        ['http://www.fhl.net/main/fhl/fhl4.html', '關於我們', '網站簡介、信仰告白'],
        ['http://bible.fhl.net/new/', 'COBS工作區', '舊 COBS 功能清單'],
        ['https://bkbible.fhl.net/work.html', '工作區', '義工翻譯、parsing 工作區'],
        ['https://bible.fhl.net/credit.html', '義工群', '參與的義工名單'],
        ['http://www.fhl.net/main/fhl/fhl2.html', '徵稿', '投稿說明'],
        ['https://www.fhl.net/main/fhl/fhl6.html', '捐款', '劃撥、轉帳、刷卡'],
        ['https://service.fhl.net/cgi-bin/rogbook.cgi?user=service&bid=0', '帳目徵信', '基金會每月帳目'],
        ['http://www.fhl.net/cgi-bin/rogbook.cgi?webwork', '刊登消息', '公佈欄 (較少更新)'],
        ['http://www.fhl.net/statistics/bible.fhl.net/', '流量', '網站每月流量統計'],
        ['https://bible.fhl.net/json/', 'JSON API', '聖經資料 API 說明'],
        ['https://bible.fhl.net/public/', '開放資料', '經文、parsing 資料下載'],
    ]],
]

const escAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
const RESOURCES_HTML = RESOURCES.map(([h, links]) => `<section><h4>${h}</h4><ul>${links.map(([url, t, desc]) =>
    `<li><a target="_blank" href="${escAttr(url)}">${t}<small>${desc}</small></a></li>`).join('\n')}</ul></section>`).join('\n')

export const APP_SKELETON_HTML = `<div><nav id="fhlTopMenu"><div id="fhlToolBar">
<button type="button" id="fhlLeftWindowControl" class="tb-btn selected" title="左側欄 (譯本、設定、歷史)"><i class="bi bi-list"></i></button>
<span id="brand"><img id="logoFHL" src="static/images/FHLLOGO.png" alt="FHL"><span id="title"><span class="t-full">信望愛聖經工具</span><span class="t-short">聖經工具</span></span></span>
<span id="appVer"><a id="appVerNum" title="版本變更">v1.2</a></span>
<div id="bookSelect"></div>
<div id="searchTool" class="smallText"></div>
<button type="button" id="searchToggle" class="tb-btn tb-narrow" title="搜尋"><i class="bi bi-search"></i></button>
<button type="button" id="resourcesMenuBtn" class="tb-btn tb-wide" title="信望愛資源"><i class="bi bi-grid-3x3-gap"></i></button>
<button type="button" id="help" class="tb-btn tb-wide" title="使用說明"><i class="bi bi-question-circle"></i></button>
<button type="button" id="fullscreenControl" class="tb-btn tb-wide" title="全螢幕"><i class="bi bi-arrows-fullscreen"></i></button>
<a id="problemsReport" class="tb-btn tb-wide" title="問題回報"><i class="bi bi-envelope"></i></a>
<button type="button" id="moreMenuBtn" class="tb-btn tb-narrow" title="更多"><i class="bi bi-three-dots-vertical"></i></button>
<button type="button" id="fhlInfoWindowControl" class="tb-btn selected" title="右側欄 (註釋、串珠、原文…)"><i class="bi bi-layout-sidebar-inset-reverse"></i></button>
</div>
<div id="resourcesPanel" class="tb-panel" hidden><div class="rp-grid">
${RESOURCES_HTML}</div></div>
<div id="moreMenu" class="tb-panel" hidden>
<button type="button" data-act="resources"><i class="bi bi-grid-3x3-gap"></i>信望愛資源</button>
<button type="button" data-act="help"><i class="bi bi-question-circle"></i>使用說明</button>
<button type="button" data-act="fullscreen"><i class="bi bi-arrows-fullscreen"></i>全螢幕</button>
<a data-act="report"><i class="bi bi-envelope"></i>問題回報</a>
<button type="button" data-act="versions"><i class="bi bi-clock-history"></i>版本變更 <span class="mm-ver"></span></button>
<button type="button" data-act="reload"><i class="bi bi-arrow-clockwise"></i><span class="mm-reload">手動更新</span></button>
</div>
<div id="tbBackdrop" hidden></div></nav>
<div id="mainWindow"><div id="fhlLeftWindow" class="leftWindow"><div class="leftWindowInside"><div id="settings"><div class="secondLevelInside"><p>▼&nbsp;設定</p>
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
<div id="lecMain" style="padding: 10px 50px;"></div></div></div>
<div id="fhlInfo"><div id="fhlInfoTitle"></div>
<div id="fhlInfoContent"></div></div>
<div id="bookSelectPopUp"><div id="bookSelectName"></div></div>
<div id="parsingPopUp"></div>
<div id="helpingPopUp"><div id="helpingPopUpInside"></div></div>
<div id="dictionaryPopUp"></div></div></div>`
