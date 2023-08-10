
/**
 * 仿好用的 c# System.IO.Path
 * 當時，為了處理 副檔名 取代 而開始作
 * 在 tests 中，有 PathTests.js
 * @namespace
 */
var Path = {
  getDirectoryName,
  getFileName,
  getFileNameWithoutExtension,
  getExtension,
  changeExtension,
}

/**
 * @namespace
 */
var Ijnjs = {
  Path,
  TestTime,
  SplitStringByRegex,
  BibleVersionDialog,
  DialogBase,
  loadJsSync,
  isReady,
  testThenDo,
  appendObjectTo,
  assert,
  rem2Px,
  isLessMidWindow,
  getSrd,
  loadJsInIIFEModel,
}


/**
 * @constructor 
 * @param {boolean} isLog 當測試完後，常常是把所有 code 拿掉, 用這變數可以讓 code 留著. 但在 log 時直接 return
 */
function TestTime(isLog) { }
TestTime.prototype.log = function (msg, isReset) { }

/**
 * 取代 原本的 script scr，所以是 sync 的
 * @param {string} url ajax 的 url 參數
 */
function loadJsSync(url: string) { }

/**
 * Ijnjs 所有的套件都戴入成功了嗎
 * 可以直接使用 testThenDo 即可
 * 使用 testThenDo 第2個參數不傳, 就是用些函式作為 callback
 * @returns {boolean}
 */
function isReady()

/**
 * 初始化，是動態的載入
 * @param cbDo 要作的事。callback Do
 * @param cbTest 條件成立，才去作 cbDo。若 undefined, 則預設為 isReady, 也就是 Ijnjs 的所有 都初始化好了嗎
 * @param ms 每次等待幾 ms
 */
function testThenDo(cbDo: () => void, cbTest?: (Ijnjs) => boolean, ms?: number) { }
/**
 * assert 工具
 * @param cbTest assert 條件。
 * @param msg 預設值，若 cbTest 是函式，會顯示出它的 function；若 cbTest 是值，只會寫 assert fail.
 */
function assert(cbTest: () => boolean | boolean, msg?: string) { }

function appendObjectTo(objSrc: Object, objDst: Object) { }

/**
 * 將 rem * body 的 font-size
 * 常見是 16
 * 目前假設，沒事不會去改 body 的 font-size
 * @param rem 
 */
function rem2Px(rem: number): number { }
/**
 * coreInfoWindowShowHide.js 原本用到，就是 toolbar 的寬度太窄時，要換成2行
 * 現在選書卷經文 click ，也要用到了
 * window.width < 36rem
 */
function isLessMidWindow(): boolean { }
/**
 * 測試的 /tests/xxx.html 與 /index.html 位置不同
 * 回傳 ../ijnjs/ 或 ijnjs/ 或 NUII/ijnjs/ 
 * @param {string} dir 例如，'ijnjs' 'ijnjs-fhl'
 * @returns 
 */
function getSrd(dir: string): string { }
/**
 * 
 * @param path 相對於 index.html 的路徑，在前面會加 /NUI/ 或 /NUII/，例如傳入 'ijnjs/ijnjs.js'
 * @param isCache true 或 false
 */
function loadJsInIIFEModel(path: string, isCache: boolean): Promise<Object> { }

/**
 * 以 class 方式實作 split by regex 
 * @class
*/
function SplitStringByRegex() { }
/**
 * 因為 string.split 不夠我使用，所以開發一個 regex 的來用
 * @param str 
 * @param reg 
 * @example
 * new SplitStringByRegex().main("取出eng的word",/\w+/ig)
 */
SplitStringByRegex.prototype.main = function (str: string, reg: RegExp): { w: string; exec?: RegExpExecArray }[] { }


/**
 * 以 class 方式實作 dialog base
 * @class
 */
function DialogBase() { }

/**
 * 
 * @param id 例 'dialog-version' 這個用在 append 到 body 中時
 * @param fnClosedDialog 這個用在關閉之後的動作 (但版本是否變更的邏輯，不是這個 dialog 負責的)
 * @param abvRecords 這個用在繁體、簡體時用，程式開發是用繁體，但若是簡體，會取代掉。
 * @param cbShowed 在不同app可能會有不同限制，例如 nui 用的時候，上面的 toolbar 就會擋到。rwd 用的時候，z-index要變為1才不會被擋到
 */
function BibleVersionDialog(id: string,
  fnClosedDialog: (vers: string[]) => void,
  abvRecords: { book: string, cname: string }[],
  cbShowed: () => void) {
}

BibleVersionDialog.prototype.show = function (vers: string[]) { }



/**
 * '/sdasd/asdgsdg' => '/sdasd
 * '/sdasd' => ''
 * '' => ''
 * '\sdasd\asdgsdg' => '\sdasd'
 * @param {string} path 
 * @returns {string}
 */
function getDirectoryName(path: string): string
/**
 * 'c:/sdasd/asdgsdg.txt' => asdgsdg.txt
 * c:/sdasd/asdgsdg => asdgsdg
 * c:/sdasd/ => ''
 * asdgsdg.txt => asdgsdg.txt
 * @param path 
 */
function getFileName(path: string): string
/**
 * @param path 
 * @see Path.getFileName
 */
function getFileNameWithoutExtension(path: string): string
/**
 * c:/asdf.txt => .txt
 * c:/asdf.com.txt => .txt
 * c:/asdf/asdf.txt => .txt
 * c:/asdf.com/asdf => ''
 * @param path 
 */
function getExtension(path: string): string
/**
 * asdf.txt => asdf.mov
 * asdf/asdf.txt => asdf/asdf.mov
 * asdf.com.txt => asdf.com.mov
 * asdf.com/asdf => asdf.com/asdf.mov
 * asdf.com/ => asdf.com/.mov
 * asdf => asdf.mov
 * asdf/ => asdf/.mov
 * @param path 
 * @param ext .mov 包含. , 若 undefined, 則移除 (同等於 getFileNameWithoutExtension)
 */
function changeExtension(path: string, ext?: string): string
