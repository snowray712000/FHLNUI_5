/// <reference path="./../FHL.BibleConstant.js" />


/**
* @typedef {"fhlInfoParsing"|"fhlInfoComment"|"fhlInfoPreach"|"fhlInfoTsk"|"fhlInfoOb"|"fhlInfoAudio"|"fhlInfoMap"|"fhlSnBranch"} TPFhlTitleId
*/

class TPPageState {
  constructor() {
    this.swVer = "0.0.0";
    /** @type {TPENGLISH_BOOK_ABBREVIATIONS} */
    this.engs = "Gen";
    /** @type {TPCHINESE_BOOK_ABBREVIATIONS|TPCHINESE_BOOK_ABBREVIATIONS_GB} */
    this.chineses = "創";
    /** @type {number} 1based 第幾章。有時候 第0章 指向書卷背景 */
    this.chap = 1;
    /** @type {number} 1based 第幾節 */
    this.sec = 1;
    /** @type {number} 滑鼠移過去的，而上面的 chap sec 是，滑鼠按下去 activate 的節 */    
    this.book_hover = -1;
    /** @type {number} 滑鼠移過去的，而上面的 chap sec 是，滑鼠按下去 activate 的節 */ 
    this.chap_hover = -1;
    /** @type {number} 滑鼠移過去的，而上面的 chap sec 是，滑鼠按下去 activate 的節 */ 
    this.sec_hover = -1;
    /** @type {{ x: number, y: number }} 滑鼠 x y。即時訊息要用到的值。 .sn mouseenter 更新 */
    this.xy_hover = { x: -1, y: -1 };
    /** @type {number} 1based book。之所以不用 book， 是這個變數被先用掉了，這個值與 chinese engs 都是相依的，到時候另外兩個應該改為 setter getter */
    this.bookIndex = 1;
    /** @type {string[]} 使用的譯本 */
    this.version = ["unv"];
    /** @type {string} 目前選擇的譯本, 顯示名稱 */
    this.cname = ["FHL和合本"]
    /** @type {0|1} 0: 顯示原文 1: 顯示 strong number */
    this.strong = 0;
    /** @type {0|1} 0: 繁體 1: 簡體 */
    this.gb = 0;
    /** @type {0|1} 0: 顯示 1: 隱藏 工具視窗*/
    this.isVisibleInfoWindow = 1;
    /** @type {0|1} 0: 顯示 1: 隱藏 左方視窗*/
    this.isVisibleLeftWindow = 1;
    /** @type {number} 工具視窗寬度  */
    this.cxInfoWindow = 500;
    /** @type {number} 左方視窗寬度 */
    this.cxLeftWindow = 190;
    /** @type {number} 字體大小，css 中有一個對應的 --fontsize 的 css 變數  */
    this.fontSize = 12;
    /** @type {number} 希伯來文字體大小。 css 中有一個對應的 --fontsize-hebrew */
    this.fontSizeHebrew = 26;
    /** @type {number} 希臘文字體大小。 css 中有一個對應的 --fontsize-greek */
    this.fontSizeGreek = 26;
    /** @type {number} strong number 字體大小。 css 中有一個對應的 --fontsize-sn */
    this.fontSizeStrongNumber = 14; // add by snow. 2021.07  
    /** @type {boolean} 是否顯示照片，與左方開啟關閉相關 */
    this.ispho = false;
    /** @type {boolean} 是否顯示位置，與左方開啟關閉相關 */
    this.ispos = false;
    // book 別以為是 bookIndex, 因為 book 先被注釋用掉了 sc.php 參數
    this.book = 3
    /** @type {0|1} 0: 新約 1: 舊約 */
    this.N = 0
    /** @type {string} sn，例如 312。 */
    this.k = ""
    /** @type {string} sn，例如 312，mouseenter 成為 activate，有 snAct 在 css 中對應。同源字是 snAct2 */
    this.snAct = ""
    /** @type {0|1|-1} sn是新約還舊約，mouseenter 成為 activate*/
    this.snActN = -1
    /** @type {0|1} 是否開啟 即時顯示，這個與左方開關同步 */
    this.realTimePopUp = 0
    /** @type {TPFhlTitleId} 原文 parsing 註釋 comment 講道 preach 串珠 tsk 典藏 ob 地圖 map 樹狀圖 sn branch */
    this.titleId = "fhlInfoComment"
    /**
     * @type {{ chineses: TPCHINESE_BOOK_ABBREVIATIONS|TPCHINESE_BOOK_ABBREVIATIONS_GB, chap: number }[]} 左側的歷史紀錄，創1 創2
     */
    this.history = [{ chineses: "創", chap: 1 }]
    this.commentBackgroundChap = 1
    this.commentBackgroundSec = 1
    this.leftBtmWinShow = true
    this.searchTitleMsg = ""
    this.audio = 0
    /** @type {string} 程式版本 */
    this.swVer = "0.0.0"
    /** @type {0|1|2} 0是早期顯示版本，1是併排，2是交錯 */
    this.show_mode = 1
  }
}