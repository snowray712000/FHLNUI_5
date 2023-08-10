/// <reference path="../jsdoc/linq.d.ts" />
/// <reference path="../jsdoc/jquery.js" />
/// <reference path="../jsdoc/jquery-ui.js" />
/// <reference path="../jsdoc/jquery.ui.touch-punch.js" />
/// <reference path="../jsdoc/lodash.d.js" />
/// <reference path="../jsdoc/require.js" />
/**
 * 只要 include ijnjs.js 馬上就能用了，會定義到 window
 * 但 ijnjs 則是 async 的
 * 你可以使用 testThenDo().then(...)
 * @param {{cbTest:()=>boolean;ms?:number;msg?:string;cntMax?:number}} args 
 */
function testThenDo(arg) { }

/**
 * @param {{cbTest:()=>boolean;ms?:number;msg?:string;cntMax?:number}} args 
 * @returns {Promise<any>}
 */
function testThenDoAsync(args) { }

/**
 * 供 ijnjs 或 ijnjs-ui 等等，一個 lib 的 main.js 使用
 * 可以取得它的路徑，再結合 location.href 或 pathname, 就可以知道，該傳什麼相對路徑
 * 不需等到 ijnjs 即可使用, 與 testThenDo 一樣
 * @param {string} nameThisJs 'ijnjs.js' 傳入 'ijnjs' 即可, 可能 .jn 或 .min.js 都可
 * @returns {string}
 */
function getSrd(nameThisJs) { }

/**
 * 這是在 ijnjs 載入各別 js 檔後，
 * 要將 各別 js export 的東西, merge 回 root 時用的
 * 
 * 因為想像這會是一個複雜的工作，所以直接以 class 實作，而非一個函式而已
 * UnitTest:
 * 於 http://127.0.0.1:5502/NUI_dev/tests/MergeImportsTests.html 
 * 
 * 後記: 2021-08-26
 * 中途我已經放棄作這個了，這個作了3天
 * 感謝神，冷靜下來後，隔天才有靈感繼續再試試
 * 雖然不確定還有沒有沒想到的 case，
 * 但目前這樣應該是夠了
 */
function MergeImports() {
    /**
     * 
     * @param {Function} beMerged 
     * @param {Function} objImport 
     */
    this.main = function (beMerged, objImport) { }
}

var Ijnjs = (() => {
    function Ijnjs() { }

    function Libs() {
        /** @type {{$:jQuery;Enumerable:Enumerable;_:_}} */
        this.libs = {}
    }
    Libs.s = new Libs()

    function FileCache() {
        /**
         * dict jsDoc 寫法
         * @type {Object.<string, {str:string}>}
         */
        this.caches = {}
    }
    /**
     * return cache[na].str
     * @param {string} na 
     * @param {boolean} isClear 取得後，自動清除，預設為 true，清除是用 setStr(na,undefined)
     * @returns {string|undefined}
     */
    FileCache.prototype.getStr = function (na, isClear) { }
    /**
     * cache[na].str = str     
     * @param {string} na 
     * @param {string} str 若是 undefined 則是 delete this.caches[na]
     */
    FileCache.prototype.setStr = function (na, str) { }
    FileCache.prototype.clear = function () { }
    /**
     * Object.Keys(this.caches)
     * @returns {string[]}
     */
    FileCache.prototype.getList = function () { }

    /**
     * 供 ijnjs 或 ijnjs-ui 等等，一個 lib 的 main.js 使用
     * 可以取得它的路徑，再結合 location.href 或 pathname, 就可以知道，該傳什麼相對路徑
     * 不需等到 ijnjs 即可使用, 與 testThenDo 一樣
     * @param {string} nameThisJs 'ijnjs.js' 傳入 'ijnjs' 即可, 可能 .jn 或 .min.js 都可
     * @returns {string}
     */
    function getHrefFromDocumentScripts(nameThisJs) { }
    /** 
     * js global 的 exec 我覺得不直覺，所以寫一個 exec global 版的
     * @param {RegExp} reg reg 若非 global 會自動變為 global, 但我不能幫你變, 因為這是唯讀
     * @param {string} str
     * @returns {RegExpExecArray[]}
     */
    function matchGlobalWithCapture(reg, str) { }
    /**
     * 因為 string.split 不夠我使用，所以開發一個 regex 的來用
     * @example
     * // 12321
     * new SplitStringByRegex().main("取出eng的word",/\w+/ig)
     * @class
     */
    function SplitStringByRegex() { }
    /** 
     * 若沒有符合 Regex，仍然會回傳 [{w:str}]
     * @param {string} str asfwefwe
     * @param {Split} reg fwefwaefwf
     * @returns {{w:string; exec?:RegExpExecArray }[]}
     */
    SplitStringByRegex.prototype.main = function (str, reg) { }
    /**
     * 用於 lib 載入時用
     * @param {{}} fileDescription 參考 ijnjs.js
     * @param {boolean} isMin 決定要 load .min.js 還是 .js
     * @param {string} mainJsName 供 getSrd 使用的參數 ijnjs 例如 ijnjs-ui ijnjs-fhl
     * @returns {Promise<FileCache>}
     */
    function getCacheAsync(fileDescription, isMin, mainJsName) { }

    /** 
     * 使用 .s 唯一的實體
     * @class
     */
    function BibleConstant() { }
    /** @type {number[]} 50, 40, 27, 36, 34, 24, 21, 4, */
    BibleConstant.prototype.COUNT_OF_CHAP = [50, 40]
    /** @type {number[][]} [31, 25, 24, 26 */
    BibleConstant.prototype.COUNT_OF_VERSE = [
        [31, 25, 24, 26],
        []
    ]
    /** @type {nubmer[]} [31, 57, 63, 64, 65] */
    BibleConstant.prototype.BOOK_WHERE_1CHAP = [31, 57, 63, 64, 65]
    /** @type {nubmer[]} 1, 2, 3, 4, 5, */
    BibleConstant.prototype.ORDER_OF_HEBREW = [1, 2, 3, 4, 5]
    /** @type {string[]} '零', '一', '二', '三', '四', '五' '十' 十一 '一百' '一百零三' '一百五十'*/
    BibleConstant.prototype.CHINESE_NUMBERS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
    /** @type {string[]} '創', '出', '利', '民', '申' */
    BibleConstant.prototype.CHINESE_BOOK_ABBREVIATIONS = ['創', '出', '利']
    /** @type {string[]} '创', '出', '利', '民', '申' */
    BibleConstant.prototype.CHINESE_BOOK_ABBREVIATIONS_GB = ['创', '出', '利']
    /** @type {string[]} '創世記', '出埃及記', '利未記', '民數記' */
    BibleConstant.prototype.CHINESE_BOOK_NAMES = ['創世記', '出埃及記', '利未記']
    /** @type {string[]}  '创世记', '出埃及记', '利未记', '民数记' */
    BibleConstant.prototype.CHINESE_BOOK_NAMES_GB = ['创世记', '出埃及记', '利未记']
    /** @type {string[]}  'Gen', 'Ex', 'Lev', 'Num', 'Deut' */
    BibleConstant.prototype.ENGLISH_BOOK_ABBREVIATIONS = ['Gen', 'Ex', 'Lev']
    /** @type {string[]} 'Genesis', 'Exodus', 'Leviticus', 'Numbers' ... */
    BibleConstant.prototype.ENGLISH_BOOK_NAMES = ['Genesis', 'Exodus', 'Leviticus']
    /** @type {string[]} 'Ge', 'Ex', 'Le', 'Nu', 'De' ... */
    BibleConstant.prototype.ENGLISH_BOOK_SHORT_ABBREVIATIONS = ['Ge', 'Ex', 'Le']
    /**
     * 取得章的數目
     * @param {*} book1based 太，傳40。用1based非0based
     */
    function getCountChapOfBook(book1based) { }
    /**
     * 取得章的數目
     * @param {*} book1based 太，傳40。用1based非0based
     * @param {*} chap1based 
     */
    function getCountVerseOfChap(book1based, chap1based) { }
    /**
     * 不會跨書卷，每書卷的最後一節，都會是回傳 undfined
     * 若是最後一節，回傳 undefined
     * @param {FHL.DAdress} addr
     * @returns {FHL.DAdress?}
     */
    function getNextAddress(addr) { }
    /**
     * 任何一個 undefined 都會視為不相同
     * @param {FHL.DAdress} addr1
     * @param {FHL.DAdress} addr2
     * @returns {boolean}
     */
    function isTheSameAddress(addr1, addr2) { }
    BibleConstant.getCountChapOfBook = getCountChapOfBook
    BibleConstant.getCountVerseOfChap = getCountVerseOfChap
    BibleConstant.getNextAddress = getNextAddress
    BibleConstant.isTheSameAddress = isTheSameAddress
    BibleConstant.s = new BibleConstant()

    /**
     * @class
     */
    function FHL() { }
    FHL.BibleConstant = BibleConstant

    /**
     * generateDTextDom(data).appendTo(xxxx)
     * @param {DText[]} data
     * @returns {JQuery<HTMLElement>}
     */
    function generateDTextDom(data) { }
    FHL.generateDTextDom = generateDTextDom

    /**
     * debug 過程用的
     * @param {boolean} isLog 
     * @class
     */
    function TestTime(isLog) { }
    /**
     * console.log 輸出
     * @param {string} msg 
     * @param {boolean} isReset 
     */
    TestTime.prototype.log = function (msg, isReset) { }

    Ijnjs.Libs = Libs
    Ijnjs.FileCache = FileCache
    Ijnjs.getHrefFromDocumentScripts = getHrefFromDocumentScripts
    Ijnjs.matchGlobalWithCapture = matchGlobalWithCapture
    Ijnjs.SplitStringByRegex = SplitStringByRegex
    Ijnjs.getCacheAsync = getCacheAsync
    Ijnjs.FHL = FHL
    /**   
     * @param {()=>boolean} cbTest 
     * @param {string} msg 
     */
    Ijnjs.assert = function assert(cbTest, msg) { }
    Ijnjs.TestTime = TestTime

    // short link (常用$，卻每次打很長，很煩Ijnjs.Libs.s.libs.$)
    Ijnjs.st = {
        $: () => Ijnjs.Libs.s.libs.$,
        Enumerable: () => Ijnjs.Libs.s.libs.Enumerable
    }
    return Ijnjs
})()



/**
 * 符合繪圖需求的最小單位
 * 可以想像，每一個 DText {} 就是一個 DOM
 * 通常會是 DText[] 來型成一串資料
 * 
 * 這個不是拿來 new DText() 
 * 沒有地方定義這個，這個是用在 jsDoc 的 @type 用的
 * @interface DText
 */
function DText() { }
/** @type {string} */
DText.prototype.w = ""
/** @type {string} 不含 H 或 G, 且數字若有零會去頭 */
DText.prototype.sn = "777a"
/** @type {'H'|'G'} H, Hebrew G, Greek //'H' | 'G'; */
DText.prototype.tp = undefined
/** @type {'WG' | 'WTG' | 'WAG' | 'WTH' | 'WH' } T, time 時態 */
DText.prototype.tp2 = undefined
/** @type {0|1} 是否等於目前 active sn 0|1 */
DText.prototype.isSnActived = 0
/** @type {0|1} 花括號，大括號 */
DText.prototype.isCurly = 0
/**
 * 此節是 'a', 且無法與上節合併時, 會顯示 '併入上節' 並且加上 isMerge=1, 若已與上節合併, 會修正上節的 verses, 並將此節 remove 掉 1
 * @type {0|1}
 */
DText.prototype.isMerge = 0
/**
 * 和合本 小括號(全型 FullWidth), 用在注解(或譯....), 或是標題時(大衛的詩)  1
 * @type {0|1}
 */
DText.prototype.isParenthesesFW = 0
/**
 * 和合本 小括號(半型 HalfWidth), cbol時 1
 * @type {0|1}
 */
DText.prototype.isParenthesesHW = 0
/**
 * 和合本 小括號(全型), 連續2層括號, 內層 新譯本 詩3:1 1
 * @type {0|1}
 */
DText.prototype.isParenthesesFW2 = 0
/**
 * sobj 的資料, 地圖與相片
 * @type {any}
 */
DText.prototype.sobj = undefined
/**
 * 是否是地圖
 * @type {boolean}
 */
DText.prototype.isMap = undefined
/**
 * 是否是照片
 * @type {boolean}
 */
DText.prototype.isPhoto = undefined
/**
 * 新譯本是 h3；和合本2010 h2 1
 * @type {1|0}
 */
DText.prototype.isTitle1 = undefined
/**
 * 交互參照 1
 * @type {1|0}
 */
DText.prototype.isRef = undefined
/**
 * 交互參照內容
 * @type {string}
 */
DText.prototype.refDescription = undefined
/**
 * 換行, 新譯本 h3 與 非h3 交接觸
 * @type {0|1}
 */
DText.prototype.isBr = undefined
/**
 * hr/, 原文字典，不同本用這個隔開
 * @type {0|1}
 */
DText.prototype.isHr = undefined
/**
 * 搜尋時，找到的keyword，例如「摩西」
 * @type {string}
 */
DText.prototype.key = undefined
/**
 * 搜尋時，找到的keyword，例如「摩西 亞倫」, 摩西, 0, 這可能是上色要用到
 * @type {number}
 */
DText.prototype.keyIdx0based = undefined
/**
 * 改用 tpContain 吧，這個是早期的了
 * @type {"ol"|"ul"}
 * @deprecated
 */
DText.prototype.listTp = undefined
/**
 * 1是第一層, 0就是純文字了
 * @type {number}
 */
DText.prototype.listLevel = undefined
/**
 * 當時分析的層數
 * @type {number[]}
 */
DText.prototype.listIdx = undefined
/**
 * 若出現這個, html 就要加 <li>
 * @type {0|1}
 */
DText.prototype.isListStart = undefined
/**
 * 若出現這個, html 就要加 </li>  0 | 1;
 * @type {0|1}
 */
DText.prototype.isListEnd = undefined
/**
 * 若出現這個, html 就要加 <ol> 或 <ul>
 * @type {0|1}
 */
DText.prototype.isOrderStart = undefined
/**
 * 若出現這個, html 就要加 </ol> 或 </ul>
 * @type {0|1}
 */
DText.prototype.isOrderEnd = undefined
/**
 * idxOrder, 有這個 html 繪圖可以更加漂亮, 交錯深度之類的
 * @type {number}
 */
DText.prototype.idxOrder = undefined
/**
 * twcb orig dict 出現的, 它原本就是 html 格式, 若巢狀, 愈前面的 class 愈裡層
 * @type {string}
 */
DText.prototype.cssClass = undefined

/**
 * 用於 DText 中的 Foot
 * { w: '【180】', foot: { book:1, chap: 4, version: 'cnet', id: 180 } } NET聖經中譯本
 * { w: '([4.1]「該隱」意思是「得」。)', foot: { text: '「該隱」意思是「得」。' } } 和合本2010
 * @param {string} text 
 * @param {number} book 
 * @param {nubmer} chap 
 * @param {number} verse 
 * @param {string} version 
 * @param {number} id 
 */
function DFoot(text, book, chap, verse, version, id) {
    this.text = text
    this.book = book
    this.chap = chap
    this.verse = verse
    this.version = version
    this.id = id
}

/**
 * 【180】 這種，用藍色
 * @param {DFoot} ft 
 * @returns {boolean}
 */
DFoot.isBlueColor = (ft) => {
    return ft != undefined && ft.id != undefined
}
/**
 * foot: { text: '「該隱」意思是「得」。' } } 這種，用紫色。
 * @param {DFoot} ft 
 * @returns {boolean}
 */
DFoot.isPurpleColor = (ft) => {
    return ft != undefined && ft.id == undefined
}
/**
 * rt.php?engs=Gen&chap=4&version=cnet&id=182 真的缺一參數不可,試過只有id不行
 * 和合本 2010 版, 是只有 text ([4.1]「該隱」意思是「得」。)
 * csb: 中文標準譯本 cnet: NET聖經中譯本
 * @type {DFoot}
 */
DText.prototype.foot = undefined
/**
 * 私名號。底線  0 | 1
 * @type {0|1}
 */
DText.prototype.isName = undefined
/**
 * 粗體。和合本2010、<b></b>
 * @type {0|1}
 */
DText.prototype.isBold = undefined
/**
 * 紅字。耶穌說的話，會被標紅色。有些版本這麼作。
 * @type {0|1}
 */
DText.prototype.isGODSay = undefined
/**
 * 虛點點。和合本，原文不存在，為了句子通順加上的翻譯
 * @type {0|1}
 */
DText.prototype.isOrigNotExist = undefined
/**
 * rgb(195,39,43) 中文標準譯本 csb ， 紅字，是用 span style css color rgb(x,x,x)
 * @type {string}
 */
DText.prototype.cssColor = undefined
/**
 * 思考，怎麼實作，ul ol時，就想到這個
 * 這個是比較直覺的，再結合遞迴實作出來
 * @type {DText[]}
 */
DText.prototype.children = undefined
/**
 * 配合 children 的，描述父類別是什麼型態
 * 是一個 ul 還是一個 ol 還是一個 h3 又或是一個 )
 * @type {string}
 */
DText.prototype.tpContain = undefined

/**
 * 在註釋中，可能 reference 只有 2:1，但沒有目前書卷
 * 此時，這個就是放，目前正在閱讀的書卷
 * @type {number} 1based
 */
DText.prototype.book = undefined

/**
 * 在註釋中，可能 reference 只有 2:1，但沒有目前書卷
 * 此時，這個就是放，目前正在閱讀的書卷
 * @type {number} 1based
 */
 DText.prototype.chap = undefined

 /**
  * 查詢一個 dtext，要進行什麼，是彙編 list ? 還是 所有字典結果 dict ? 或是只有某個字典 cbol 中文 e 英文 還是浸宣 twcb .
  * 這是在實作 parsing 功能，點擊的時候用所需要的
  * @type {"list"|"dict"|"cbol"|"cbole"|"twcb"|"ref"}
  */
 DText.prototype.queryTp = undefined


 /** 取得多節經文時，若有2個版本以上，要對齊時，需要用到 addr。*/
function OneVerse(){}
/** @type {DText[]} */
OneVerse.prototype.children = []
/** @type {string} 羅1:2-3 之類的描述 */
OneVerse.prototype.addr 

/** 取得多節經文時，若有2個版本以上時，完整描述資料結構 */
function OneVersion(){}
/** @type {string} 和合本 新譯本*/
OneVersion.prototype.ver
/** @type {OneVerse[]} */
OneVersion.prototype.verses = []