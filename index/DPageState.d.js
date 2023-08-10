function DPageState() {
  this.swVer = "0.0.0";
  this.engs = "Gen";
  this.chineses = "創";
  this.chap = 1;
  this.sec = 1;
  /** book 這個變數被先用掉了 */
  this.bookIndex = 1;
  this.version = ["unv"];
  this.strong = 0;
  this.gb = 0;
  this.isVisibleInfoWindow = 1;
  this.isVisibleLeftWindow = 1;
  this.cxInfoWindow = 500;
  this.cxLeftWindow = 190;
  this.fontSize = 12;
  this.fontSizeHebrew = 26;
  this.fontSizeGreek = 26;
  this.fontSizeStrongNumber = 14; // add by snow. 2021.07  
  this.ispho = false;
  this.ispos = false;
  // book 別以為是 bookIndex, 因為 book 先被注釋用掉了 sc.php 參數
  this.book = 3, this.N = 0, this.k = "", this.cname = ["和合本"], this.realTimePopUp = 0, this.titleId = "fhlInfoComment", this.history = [{ chineses: "創", chap: 1 }], this.commentBackgroundChap = 1, this.commentBackgroundSec = 1, this.leftBtmWinShow = true, this.searchTitleMsg = "", this.audio = 0;
}
