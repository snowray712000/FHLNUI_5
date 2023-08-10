/// <reference path="../jsdoc/linq.d.ts" />
/// <reference path="../jsdoc/jquery.js" />
/// <reference path="../jsdoc/jquery-ui.js" />
/// <reference path="../jsdoc/jquery.ui.touch-punch.js" />
/// <reference path="../jsdoc/lodash.d.js" />
/// <reference path="../jsdoc/require.js" />
/// <reference path="ijnjs.d.js" />

(function (root) {
  // 馬上匯出給使用
  window.testThenDo = testThenDo
  window.testThenDoAsync = testThenDoAsync
  window.getSrd = getSrd
  window.MergeImports = MergeImports
  window.getCacheAsync = getCacheAsync

  // 設定路徑
  var thirdPartFileDescription = [
    { na: 'jquery', url: 'https://code.jquery.com/jquery-3.6.0.min.js' },
    { na: 'linq', url: 'https://unpkg.com/linq@3.2.4/linq.min.js' },
    { na: 'jquery-ui', url: 'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js' },
    { na: 'jquery-ui-css', url: 'https://code.jquery.com/ui/1.12.1/themes/blitzer/jquery-ui.css' },
    { na: 'jquery-touch', url: '../jquery.ui.touch-punch.min.js' },
    { na: 'bootstrap-css', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css' },
    { na: 'bootstrap', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js' },
    { na: 'lodash', url: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js' }
    // { na: 'bootstrap', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.map' },
  ]

  var ijnjsFileDescript = [
    'SplitStringByRegex', 'assert', 'TestTime', 'rem2Px',
    {
      dir: 'Path', children: ['Path']
    },
    {
      dir: 'BookChapDialog', children: [
        // 'BookChapDialog', 'BookChapDialog.css', 'BookChapDialog.html'
      ]
    }
  ]

  /** @class */
  function Libs() {
    /**
     * @type {{$:jQuery;Enumerable:Enumerable;bootstrap:bootstrap;_:_}}
     */
    this.libs = {}
  }
  Libs.s = new Libs()

  function FileCache() {
    /**
     * dict jsDoc 寫法
     * @type {Object.<string, {str:string}>}
     */
    this.caches = {}
    this.clear = () => this.caches = {}

    /**
     * cache[na].str = str     
     * @param {string} na 
     * @param {string} str 若是 undefined 則是 delete this.caches[na]
     */
    this.setStr = function (na, str) {
      if (str == undefined) {
        if (this.caches[na] != undefined) {
          delete this.caches[na]
        }
        return
      }

      if (this.caches[na] == undefined) {
        this.caches[na] = {}
      }
      this.caches[na].str = str
    }
    /**
     * return cache[na].str
     * @param {string} na 
     * @returns {string|undefined}
     */
    this.getStr = function (na, isClear) {
      isClear = isClear == undefined ? true : false
      if (this.caches[na] == undefined) {
        console.warn('get cache, but can\'t find ' + na)
        return undefined
      }
      var str = this.caches[na].str
      if (isClear) {
        this.setStr(na, undefined)
      }
      return str
    }
    this.getList = function () {
      return Object.keys(this.caches)
    }
  }

  function FileCache3rd() {
    this.data = new FileCache()
    // 產生 jsDoc 註解用
    // console.log(libs.map(a1 => "'" + a1.na + "'").join('|'))
    /**     
     * @param {'popper'|'jquery'|'linq'|'jquery-ui'|'jquery-ui-css'|'jquery-touch'|'bootstrap-css'|'bootstrap'|'lodash'} na 
     * @returns {string}
     */
    this.getStr = function (na) {
      if (this.data.caches[na] == undefined) {
        this.data.caches[na] = {}
      }
      return this.data.caches[na].str
    }
    /**     
     * @param {'popper'|'jquery'|'linq'|'jquery-ui'|'jquery-ui-css'|'jquery-touch'|'bootstrap-css'|'bootstrap'|'lodash'} na 
     * @param {string} str
     * @returns 
     */
    this.setStr = function (na, str) {
      if (this.data.caches[na] == undefined) {
        this.data.caches[na] = {}
      }
      this.data.caches[na].str = str
    }
    /**   
     * jquery 會略過，因為它應該已經取得   
     * @param {{na:string;url:string}[]} libs 
     * @returns {Promise<any>}
     */
    this.loadAsync = function loadAsync(libs) {
      var $ = Ijnjs.Libs.s.libs.$

      var srd = getSrd('ijnjs')
      var promises = libs.filter(a1 => a1.na != 'jquery').map(a1 => {
        var isHttp = /https?:\/\//i.test(a1.url)
        if (isHttp == false) {
          a1.url = srd + a1.url
        }

        return new Promise((res2) => {
          $.ajax({
            url: a1.url,
            dataType: 'text',
            complete: () => {
              res2()
            }, success: str => {
              this.data.caches[a1.na] = { str: str }
            }
          })
        })
      })
      return Promise.all(promises)
    }
  }
  FileCache3rd.s = new FileCache3rd()



  function Ijnjs() { this.name = 'Ijnjs' }
  Ijnjs.Libs = Libs
  Ijnjs.FileCache = FileCache
  Ijnjs.FileCache3rd = FileCache3rd
  Ijnjs.getCacheAsync = getCacheAsync

  getJQueryAsync().then(a1 => {
    Libs.s.libs.$ = a1.$

    // 開始抓檔案
    var promiseGetFiles3rd = FileCache3rd.s.loadAsync(thirdPartFileDescription)
    var promiseGetFilesIjnjs = getCacheAsync(ijnjsFileDescript, true, 'ijnjs')

    promiseGetFiles3rd.then(() => {
      process3rdFile() // 處理檔案

      promiseGetFilesIjnjs.then(caches => {
        processIjnjsFile(caches) // 處理檔案

        releaseCacheFromIjnjsAsync() // 清掉 cache 檔

        // short link (常用$，卻每次打很長，很煩Ijnjs.Libs.s.libs.$)
        Ijnjs.st = {
          $: () => Ijnjs.Libs.s.libs.$,
          Enumerable: () => Ijnjs.Libs.s.libs.Enumerable
        }

        exportToRootAndDefine() // export 到 root
      })
    })
  })

  return
  /**
   * 只有 jquery 不是用 $.ajax 
   * @returns {Promise<{$:jQuery}>} 
   * */
  function getJQueryAsync() {
    return new Promise((res, rej) => {
      var r1 = new XMLHttpRequest()
      r1.onerror = a1 => { rej(a1) }
      r1.onload = (a1) => {
        if (304 == r1.status || (r1.status >= 200 && r1.status < 300)) {
          var isAlreadyHave = window.$ != undefined
          FileCache3rd.s.setStr("jquery", r1.responseText)
          noRequireJs(() => {
            eval(FileCache3rd.s.getStr("jquery")) // 經測試與看 source code，在 es5下，都是輸出到 window.$
          })
          var r2 = {}
          r2.$ = window.$
          if (isAlreadyHave == false) {
            delete window.$
            delete window.jQuery
          }
          res(r2)
        } else {
          rej(new Error('status code ' + r1.status + ' ' + r1.statusText))
        }
      }
      r1.open('get', thirdPartFileDescription[0].url, true)
      r1.send()
    })
  }
  function processIjnjsFile(caches) {
    for (var a1 of ['Path/Path', 'SplitStringByRegex', 'assert', 'TestTime', 'rem2Px']) {
      function f1() { eval(caches.getStr(a1)) }
      var tmp = {}
      f1.call(tmp)

      new MergeImports().main(Ijnjs, tmp)
    }

  }
  // 全部完成後，準備要 export 時用到
  function releaseCacheFromIjnjsAsync() {
    return testThenDoAsync({
      cbTest: () => Ijnjs.Libs.s.libs.bootstrap != undefined,
      msg: 'release ijnjs cache'
    }).then(() => {
      // (不能在這釋放，還有些要在 ready 的時候用)
      FileCache3rd.s.data.clear()
      delete Ijnjs.FileCache3rd
    })
  }
  function exportToRootAndDefine() {
    // 學 lodash, 就是不論有沒有 define, 都還是輸出 root
    // 像我的 es5 專案的 define 裡的 callback 就沒呼叫，不知道哪弄錯
    root.Ijnjs = Ijnjs

    var isAMD = typeof define === 'function' && define.amd
    if (isAMD) {
      define('Ijnjs', [], function () {
        return Ijnjs
      })
    }
  }
  /**
   * 供 ijnjs 或 ijnjs-ui 等等，一個 lib 的 main.js 使用
   * 可以取得它的路徑，再結合 location.href 或 pathname, 就可以知道，該傳什麼相對路徑
   * 不需等到 ijnjs 即可使用, 與 testThenDo 一樣
   * 
   * @param {string} nameThisJs 'ijnjs.js' 傳入 'ijnjs' 即可, 可能 .jn 或 .min.js 都可
   * @returns {string}
   */
  function getSrd(nameThisJs) {
    // 情境
    // pathname: /NUI_dev/tests/ijnjsTests.html 
    // 自己: http://127.0.0.1:5502/NUI_dev/src/assets/libs/ijnjs/ijnjs.js 
    // 目標(以下兩種都可成功，試過了)
    // var srd = '/NUI_dev/src/assets/libs/ijnjs/'
    // var srd = '../src/assets/libs/ijnjs/'
    // 
    // step1: 自己變 /NUI_dev/src/assets/libs/ijnjs/ijnjs.js

    var r1 = getHrefFromDocumentScripts(nameThisJs)
    var r2 = r1.substring(0, r1.lastIndexOf('/') + 1)
    var r3 = r2.replace(location.origin, '')
    return r3
    /**
     * 供 ijnjs 或 ijnjs-ui 等等，一個 lib 的 main.js 使用
     * 可以取得它的路徑，再結合 location.href 或 pathname, 就可以知道，該傳什麼相對路徑
     * 不需等到 ijnjs 即可使用, 與 testThenDo 一樣
     * 
     * @param {string} nameThisJs 'ijnjs.js' 傳入 'ijnjs' 即可, 可能 .jn 或 .min.js 都可
     * @returns {string}
     */
    function getHrefFromDocumentScripts(nameThisJs) {
      var reg = new RegExp(nameThisJs + '(?:.min)?.js$', 'i')
      // ijnjs.js/require.js ... 這種 case 要避免

      // ijnjs.js.ui.js ... 這種 case 要避免 Regexp 要加尾端 $
      // 承上，(測試成功，把檔案拿掉尾巴即可測，就會變undefine)

      // ijnjs.min.js ijnjs.js 都要可以
      // regex 多一個 (.min)? 但不 capture 所以再加 ?:

      // 測試過，還沒 docuemnt.ready 也可以取得局部  
      // Path 工具還沒載入，不能在這使用
      for (var a1 of document.scripts) {
        if (a1.src != undefined) {
          var na = getName(a1.src)
          if (na != undefined) {
            if (reg.test(na)) {
              return a1.src
            }
          }
        }
      }
      return undefined
      /** 
       * http://127.0.0.1:5502/NUI_dev/jsdoc/require.min.js => require.min.js
       * @param {string} src 
       * */
      function getName(src) {
        var n = src.length
        for (let i = n - 1; i >= 0; i--) {
          if (src[i] == '/') {
            return src.substr(i + 1)
          }
        }
        return undefined
      }
    }
  }

  /** 不包含 jqueryui */
  function process3rdFile() {
    noRequireJs(() => {
      addLinqJs()
      addJQueryUiAndTouchNowAndCssWhenReady()
      addBootstrapWhenReady() // ready 才加的 js，裡面也要 
      addLodash()
    })

    return
    function addLodash() {
      var isExist = window._ != undefined
      if (isExist == false) {
        function aaa() { eval(FileCache3rd.s.getStr("lodash")) }
        aaa.call(window) // 只能 window
      }
      Libs.s.libs._ = window._
      if (isExist == false) {
        delete window._
      }
    }
    function addBootstrapWhenReady() {
      var $ = Libs.s.libs.$
      $(() => {
        noRequireJs(() => {
          // ready 時，加入 css
          $('<style>', {
            text: FileCache3rd.s.getStr("bootstrap-css")
          }).appendTo($('head'))

          function aaa() {
            eval(FileCache3rd.s.getStr("bootstrap"))
          }
          aaa.call(window) // 在 window 下，呼叫才會生效
          // 不 delete window.bootstrap 不知道它什麼時候會用到
          Libs.s.libs.bootstrap = window.bootstrap
        })
      })
    }
    function addJQueryUiAndTouchNowAndCssWhenReady() {
      var isExist = window.jQuery != undefined
      var $ = Libs.s.libs.$
      if (isExist==false){
        window.jQuery = $ // 它會作用到 window.jQuery 上，所以要先加回去
      }
      function aaa() {
        eval(FileCache3rd.s.getStr("jquery-ui"))
        eval(FileCache3rd.s.getStr("jquery-touch"))
      }

      aaa.call(window)

      $(() => {
        //ready 時，加入 css
        $("<style>", { text: FileCache3rd.s.getStr("jquery-ui-css") }).appendTo($('head'))
      })
      if (isExist == false ){
        delete window.jQuery
      }
    }
    function addLinqJs() {
      function aaa() {
        eval(FileCache3rd.s.getStr("linq"))
      }
      aaa.call(Libs.s.libs)
    }
  }
  function noRequireJs(cbDo) {
    var old = {}
    backup()
    cbDo()
    restore()
    return
    function backup() {
      if (window.define != undefined) {
        for (var a of ['define', 'requirejs', 'require']) {
          old[a] = window[a]
          window[a] = undefined
        }
      }
    }
    function restore() {
      if (old.define != undefined) {
        for (var a of ['define', 'requirejs', 'require']) {
          window[a] = old[a]
          delete old[a]
        }
      }
    }
  }


  /**
   * @param {{cbTest:()=>boolean;ms?:number;msg?:string;cntMax?:number}} args 
   */
  function testThenDoAsync(args) {
    ifArgsIsUndefined()
    ifArgsIsCallbackTest()

    if (typeof args != 'object') { throw new Error('call testThen Do, args already use {}') }
    return new Promise((res, rej) => {
      args.cbDo = () => res()
      args.cbErr = (err) => res(err)
      testThenDo(args)
    })
    function ifArgsIsUndefined(){
      if (args == undefined){        
        args = {
          cbTest: () => window.Ijnjs != undefined
        }
      }
    }
    function ifArgsIsCallbackTest() {
      if (typeof args == 'function') {
        // 太常只傳 cbTest 了
        cbTest = args
        args = {
          cbTest: cbTest,
          msg: cbTest.toString()
        }
      }
    }
  }
  /**
   * @param {{cbDo:()=>{};cbTest:()=>boolean;ms?:number;msg?:string;cntMax?:number;cbErr?:(err:any)=>{}}} args 
   */
  function testThenDo(args) {
    if (typeof args != 'object') { throw new Error('call testThen Do, args already use {}') }

    var ms = args.ms == undefined ? 333 : args.ms
    var test = args.cbTest == undefined ? () => true : args.cbTest
    var msg = args.msg == undefined ? '' : args.msg
    var cbErr = args.cbErr == undefined ? () => { } : args.cbErr
    var cbDo = args.cbDo == undefined ? () => { } : args.cbDo

    var cntMax = args.cntMax == undefined ? 50 : args.cntMax
    var cnt = 0

    var fnOnce = once;
    try {
      once()
    } catch (error) {
      cbErr(error)
    }

    return
    function once() {
      if (test()) {
        cbDo()
      } else {
        cnt += 1
        if (cnt > cntMax) {
          console.log('wait limit max count. ' + cntMax)
          cbErr(new Error('wait limit max count.' + cntMax))
        } else {
          console.log('wait ' + msg)
          setTimeout(() => {
            fnOnce()
          }, ms)
        }
      }
    }
  }

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
    this.main = function (beMerged, objImport) {
      if (objImport.exports != undefined) {
        var ks = Object.keys(objImport.exports)
        for (var k of ks) {
          var tmp2 = {}
          tmp2[k] = objImport.exports[k]
          this.main(beMerged, tmp2)
        }
        return
      }

      var ks = Object.keys(objImport)
      this.assert(ks.length == 1)
      var k = ks[0]

      if (beMerged[k] != undefined) {
        // function 比 object 更廣 (object 沒有 propotype)
        // 若 beMerged 原本是 object, 先將它轉為 function
        if (this.isObject(beMerged[k])) {
          // 直接用 newFn = function(){} 會是暱名函式, 再去設定它的 .name = k 也無效
          var newFn = eval('this.f = function ' + k + ' (){}')
          var ks3 = Object.keys(beMerged[k])
          for (var k3 of ks3) {
            newFn[k3] = beMerged[k][k3] // object 相當於 function 的 static function
          }
          beMerged[k] = newFn
        }

        // 開始合併
        this.assert(this.isFunction(beMerged[k]))
        if (this.isObject(objImport[k])) {
          this.mergeEachKey(beMerged[k], objImport[k])
        } else if (this.isFunction(objImport[k])) {
          var constructor1 = this.getInnerCode(beMerged[k])
          var constructor2 = this.getInnerCode(objImport[k])
          var newFn = this.genereateNewClass(k, constructor1 + '\r\n' + constructor2)

          this.mergeEachKey(newFn, beMerged[k])
          this.mergeEachKey(newFn, objImport[k])

          // 在還沒 merge 前的建構子，所建出來的 object，並沒有包含所有資料
          // 要再重新用 merge 後的建構子，重新宣告一份，這樣才會包含所有成員
          var ks4 = Object.keys(newFn)
          for (var k4 of ks4) {
            var o = newFn[k4]
            if (this.isObject(o)) {
              if (o instanceof objImport[k] || o instanceof beMerged[k]) { // static 變數              
                newFn[k4] = new newFn() // 重 new 一個

                for (var k5 of Object.keys(o)) { // 還原原本 已經有的值 
                  newFn[k4][k5] = o[k5]
                }
              }
            }
          }

          beMerged[k] = newFn
        } else {
          // objImport[k] 不是 object 也不是 function, 而是 string, boolean, number 等等
          // 而 beMerge 也存在, 這樣是無法 merge 的, 就只好寫出訊息, 去修改 code, 不然會覆蓋原本的資料
          // 例子 Ijnjs.Path 是個 namespace，若 { Path: 42 } 是匯入的， Ijnjs.Path = 42 了
          throw new Error('MergeImport 設計不良, 會覆蓋原有的資料 ' + k)
        }
      } else {
        beMerged[k] = objImport[k]
      }
    }

    this.isObject = function (o) { return /object/.test(typeof o) }
    this.isFunction = function (o) { return /function/.test(typeof o) }
    this.genereateNewClass = function (nameOfClass, content) {
      try {
        var newFn = eval('this.f = function ' + nameOfClass + ' (){\r\n' + content + '\r\n}')

        return newFn
      } catch {
        console.error('name ' + nameOfClass + '\r\n' + content)
        return eval('this.f = function ' + nameOfClass + ' (){}')
      }
    }
    this.mergeEachKey = function (newFn, oldFn) {
      if (oldFn.prototype != undefined) { // 加這個 if, 就可以使 oldFn = object 也可以用
        var ks2 = Object.keys(oldFn.prototype)
        for (var k2 of ks2) {
          if (newFn.prototype[k2] != undefined) {
            console.error('Merge Import 沒有處理 prototype 中，也已存在的值 ' + k2)
          }
          newFn.prototype[k2] = oldFn.prototype[k2]
        }
      }
      var ks3 = Object.keys(oldFn) // static 變數也在這 .s   
      for (var k3 of ks3) {
        if (newFn[k3] == undefined) {
          newFn[k3] = oldFn[k3]
        } else {
          var tmp2 = {}
          tmp2[k3] = oldFn[k3]
          this.main(newFn, tmp2)
        }
      }
    }
    this.getInnerCode = function (o) {
      var r1 = o.toString()
      var i1 = r1.indexOf('{')
      var i2 = r1.lastIndexOf('}')
      if (i1 == i2 - 1) { return '' }
      return r1.substring(i1 + 1, i2 - 1)
    }
    this.assert = function (testor, msg) {
      msg = msg == undefined ? 'assert false' : msg

      if (typeof testor == 'function') {
        if (testor() == false) {
          throw new Error(msg)
        }
      } else {
        if (testor == false) {
          throw new Error(msg)
        }
      }
    }
  }
  /**
   * 
   * @param {(string|{dir:string,children:any[]})[]} fileDescription 
   * @param {boolean} isMin 決定要 load .min.js 還是 .js
   * @param {string} mainJsName 供 getSrd 使用的參數 ijnjs 例如 ijnjs-ui ijnjs-fhl
   * @returns {Promise<FileCache>}
   */
  function getCacheAsync(fileDescription, isMin, mainJsName) {
    var $ = Ijnjs.Libs.s.libs.$
    var r1 = toStandardUrls(fileDescription, isMin, mainJsName)

    return Promise.all(r1.map(a1 => {
      return new Promise((res, rej) => {
        $.ajax({
          url: a1.url,
          dataType: 'text',
          complete: () => res(a1),
          success: (str) => {
            a1.str = str
            res(a1)
          }
        })
      })
    })).then(re => {
      var r2 = new Ijnjs.FileCache()
      for (var a1 of re) {
        if (a1.str != undefined) {
          r2.caches[a1.na] = { str: a1.str }
        }
      }
      return r2
    })

    return
    /**
     * 取得 ijnjs 分離的檔案過程要用的
     * @param {(string|{dir:string;children:any[]})[]} descript 
     */
    function toStandardUrls(descript, isMin, mainJsName) {
      /** @type {{na:string;url:string}[]} */
      var re = []

      // // 中途會轉成這樣去處理(遞迴結構，轉為 {}[])
      // var libs2 = [
      //   { na: 'Path', },
      //   { na: 'SplitStringByRegex', },
      //   { na: 'assert',},
      //   { na: 'TestTime', },
      //   { na: 'rem2Px',  },
      //   { na: 'BookChapDialog/BookChapDialog',  },
      //   { na: 'BookChapDialog/BookChapDialog.css',},
      //   { na: 'BookChapDialog/BookChapDialog.html', },
      //   { na: 'BookChapDialog/dir2/file1', url: },
      // ]    
      var fn = function (ja, dir) {
        for (var a1 of ja) {
          if (typeof a1 == 'string') {
            re.push({ na: dir + a1 })
          } else {
            var dir2 = dir == '' ? (a1.dir + '/') : (dir + a1.dir + '/')
            fn(a1.children, dir2)
          }
        }
      }
      fn(descript, '')

      var srd = getSrd(mainJsName)
      for (var a1 of re) {
        var ext = getExt(a1.na)
        if (ext == undefined) {
          if (isMin) {
            a1.url = srd + a1.na + '.min.js'
          } else {
            a1.url = srd + a1.na + '.js'
          }
        } else {
          if (isMin) {
            var na = removeLastExtension(a1.na)
            a1.url = srd + na + '.min' + ext
          } else {
            a1.url = srd + a1.na
          }
        }
      }

      return re
      /** 
       * 要用在 自動加 .js 用
       * @param {string} na
       * @returns {string|undefined}
       */
      function getExt(na) {
        var n = na.length
        for (var i = n - 1; i >= 0; i--) {
          if (na[i] == '/') {
            return undefined
          } else if (na[i] == '.') {
            return na.substr(i)
          }
        }
        return undefined
      }
      function removeLastExtension(path) {
        var i2 = path.lastIndexOf('.')
        return path.substring(0, i2)
      }
    }
  }
})(this)