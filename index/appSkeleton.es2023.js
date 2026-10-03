import { RESOURCES_HTML } from './Resources.es2023.js'

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
<li><div id="fontSizeTool"></div></li>
<li><div id="themeTool"></div></li></ul></div></div></div>
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
