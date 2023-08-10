
/// <reference path="../libs/jsdoc/jquery.js" />
/// <reference path="../libs/jsdoc/jquery-ui.js" />
/// <reference path="../libs/jsdoc/linq.d.ts" />
/// <reference path="../libs/jsdoc/qunit.js" />
/// <reference path="../libs/jsdoc/lodash.d.js" />


QUnit.module('MergeImports', function () {
  // 基本
  QUnit.test("01a-基本", assert => {
    // 假設，匯出一個 Path namespace，有2個函式
    function Path() { }
    function getExtension(path) { return '.tmp' }
    function getDirection(path) { return '/nui/' }
    Path.getExtension = getExtension // 這樣語法，同等於 class 的 static function
    Path.getDirection = getDirection

    // 滙入的部分
    var tmp = { Path }

    // 假設，目前 ijnjs 沒有 Path namespace 或 Path 相關的東西
    // 之後，會假設，在匯入上面之前，已經存在 Path 了，就要避免，不要把原本的覆蓋掉
    // 承上，原本的若是 function(){} 的 class
    // 承上，原本的若是 {} 的 object
    // 但，原本若是 function, Array, variable, (很難想像會有這樣的情境), 就直接覆蓋, 當然，也輸出警告
    // 這樣應該是規畫不良，一下把 Path 當成 namespace 或 class 或 變數
    function Ijnjs() { }

    new MergeImports().main(Ijnjs, tmp)

    assert.equal(Ijnjs.Path.getExtension('/nui/aa.tmp'), '.tmp')
    assert.equal(Ijnjs.Path.getDirection('/nui/aa.tmp'), '/nui/')
  })
  function exportJsFile01(root) {
    // 假設，匯出一個 Path namespace，有2個函式
    function Path() { }
    function getExtension(path) { return '.tmp' }
    function getDirection(path) { return '/nui/' }
    Path.getExtension = getExtension // 這樣語法，同等於 class 的 static function
    Path.getDirection = getDirection

    root.Path = Path
  }
  QUnit.test("01b-避免覆蓋Function", assert => {
    var tmp = {}
    exportJsFile01(tmp)

    // 假設原本的 Ijnjs 中已經有別的檔案匯入過 Path namespace 
    // 並且，實作 namespace 的方式也是 function Path(){}
    // (註: 有人實作 namespace 是用 {} 去實作 01c 就會處理那個)
    function Ijnjs() { }
    function Path() { }
    Path.isHttp = function (path) { return true }
    Ijnjs.Path = Path

    new MergeImports().main(Ijnjs, tmp)

    assert.equal(Ijnjs.Path.getExtension('/nui/aa.tmp'), '.tmp')
    assert.equal(Ijnjs.Path.getDirection('/nui/aa.tmp'), '/nui/')
    assert.equal(Ijnjs.Path.isHttp('/nui/aa.tmp'), true)
  })
  QUnit.test("01c-避免覆蓋Object", assert => {
    var tmp = {}
    exportJsFile01(tmp)

    // 假設原本的 Ijnjs 中已經有別的檔案匯入過 Path namespace 
    // 並且，實作 namespace 的方式 是 {}
    function Ijnjs() { }
    var Path = {}
    // 實作方式，用 {} 就是沒有 prototype ，如下
    // console.log(Path.prototype == undefined)
    // 因此，最終會用較有彈性的 function() {} 作為最終結果
    Path.isHttp = function (path) { return true }
    Ijnjs.Path = Path

    new MergeImports().main(Ijnjs, tmp)

    assert.equal(Ijnjs.Path.getExtension('/nui/aa.tmp'), '.tmp')
    assert.equal(Ijnjs.Path.getDirection('/nui/aa.tmp'), '/nui/')
    assert.equal(Ijnjs.Path.isHttp('/nui/aa.tmp'), true)
    assert.equal(typeof Ijnjs.Path == 'function', true)
  })
  // class
  QUnit.test("02a-class", assert => {
    // 假設，匯出一個 Path namespace，有2個函式，並且有 prototype，還有實體
    function Path() {
      this.id = 'id' // 這是 new Path() 才會有的屬性
      this.fnMember = function fnMember() { return 'fnMember' } // 這是 new Path().fnMember() 才能呼叫的
    }
    Path.prototype.fnPrototype = function fnPrototype() { return 'fnPrototype' }  // 這是 new Path().fnMember() 才能呼叫的
    Path.s = new Path() // static variable (這個技巧我常使用)
    function getExtension(path) { return '.tmp' }
    function getDirection(path) { return '/nui/' }
    Path.getExtension = getExtension // 這樣語法，同等於 class 的 static function
    Path.getDirection = getDirection

    // 匯出到此
    var tmp = {}
    tmp.Path = Path

    // 開始 merge 
    function Ijnjs() { }

    new MergeImports().main(Ijnjs, tmp)

    // 測試
    assert.equal(Ijnjs.Path.getExtension('/nui/aa.tmp'), '.tmp')
    assert.equal(Ijnjs.Path.getDirection('/nui/aa.tmp'), '/nui/')
    // assert.equal(Ijnjs.Path.s.getDirection('/nui/aa.tmp'), '/nui/') //static function不可用此呼叫
    assert.equal(Ijnjs.Path.s.fnMember(), 'fnMember')
    assert.equal(Ijnjs.Path.s.fnPrototype(), 'fnPrototype')
    assert.equal(Ijnjs.Path.s.id, 'id')
    assert.equal(new Ijnjs.Path().fnMember(), 'fnMember')
    assert.equal(new Ijnjs.Path().fnPrototype(), 'fnPrototype')
    assert.equal(new Ijnjs.Path().id, 'id')
  })
  function exportJsFile02(root) {
    // 假設，匯出一個 Path namespace，有2個函式，並且有 prototype，還有實體
    function Path() {
      this.id = 'id' // 這是 new Path() 才會有的屬性
      this.fnMember = function fnMember() { return 'fnMember' } // 這是 new Path().fnMember() 才能呼叫的
    }
    Path.prototype.fnPrototype = function fnPrototype() { return 'fnPrototype' }  // 這是 new Path().fnMember() 才能呼叫的
    Path.s = new Path() // static variable (這個技巧我常使用)
    function getExtension(path) { return '.tmp' }
    function getDirection(path) { return '/nui/' }
    Path.getExtension = getExtension // 這樣語法，同等於 class 的 static function
    Path.getDirection = getDirection

    root.Path = Path
  }
  QUnit.test("02b-class", assert => {
    var tmp = {}
    exportJsFile02(tmp)

    // 開始 merge 
    function Ijnjs() { }
    function Path() {
      this.id2 = "id2"
      this.fnMember2 = () => "fnMember2"
    }

    Path.prototype.fnPrototype2 = () => "fnPrototype2"
    Ijnjs.Path = Path

    new MergeImports().main(Ijnjs, tmp)

    // 測試 b 主要部分
    assert.equal(Ijnjs.Path.s.fnMember2(), 'fnMember2')
    assert.equal(Ijnjs.Path.s.fnPrototype2(), 'fnPrototype2')
    assert.equal(Ijnjs.Path.s.id2, 'id2')
    assert.equal(new Ijnjs.Path().fnMember2(), 'fnMember2')
    assert.equal(new Ijnjs.Path().fnPrototype2(), 'fnPrototype2')
    assert.equal(new Ijnjs.Path().id2, 'id2')

    // 測試 (下面與a完全一樣)
    assert.equal(Ijnjs.Path.getExtension('/nui/aa.tmp'), '.tmp')
    assert.equal(Ijnjs.Path.getDirection('/nui/aa.tmp'), '/nui/')
    assert.equal(Ijnjs.Path.s.fnMember(), 'fnMember')
    assert.equal(Ijnjs.Path.s.fnPrototype(), 'fnPrototype')
    assert.equal(Ijnjs.Path.s.id, 'id')
    assert.equal(new Ijnjs.Path().fnMember(), 'fnMember')
    assert.equal(new Ijnjs.Path().fnPrototype(), 'fnPrototype')
    assert.equal(new Ijnjs.Path().id, 'id')

  })
  QUnit.test("02c-class", assert => {
    var tmp = {}
    exportJsFile02(tmp)

    // 開始 merge 
    function Ijnjs() { }
    var Path = {
      id2: 'id2',
      fnMember2: () => "fnMember2",
    }

    Ijnjs.Path = Path

    new MergeImports().main(Ijnjs, tmp)

    // 測試 c 主要部分
    assert.equal(Ijnjs.Path.fnMember2(), 'fnMember2')
    assert.equal(Ijnjs.Path.id2, 'id2')

    // 測試 (下面與a完全一樣)
    assert.equal(Ijnjs.Path.getExtension('/nui/aa.tmp'), '.tmp')
    assert.equal(Ijnjs.Path.getDirection('/nui/aa.tmp'), '/nui/')
    assert.equal(Ijnjs.Path.s.fnMember(), 'fnMember')
    assert.equal(Ijnjs.Path.s.fnPrototype(), 'fnPrototype')
    assert.equal(Ijnjs.Path.s.id, 'id')
    assert.equal(new Ijnjs.Path().fnMember(), 'fnMember')
    assert.equal(new Ijnjs.Path().fnPrototype(), 'fnPrototype')
    assert.equal(new Ijnjs.Path().id, 'id')

  })
  // 多層
  QUnit.test("03a-多層", assert => {
    // 實際一點，通常多層會是 namespace 多層, 例如 c# IO.Path
    function IO() { }
    IO.Path = Path

    // 下面與 02 一樣
    function Path() {
      this.id = 'id' // 這是 new Path() 才會有的屬性
      this.fnMember = function fnMember() { return 'fnMember' } // 這是 new Path().fnMember() 才能呼叫的
    }
    Path.prototype.fnPrototype = function fnPrototype() { return 'fnPrototype' }  // 這是 new Path().fnMember() 才能呼叫的
    Path.s = new Path() // static variable (這個技巧我常使用)
    function getExtension(path) { return '.tmp' }
    function getDirection(path) { return '/nui/' }
    Path.getExtension = getExtension // 這樣語法，同等於 class 的 static function
    Path.getDirection = getDirection

    // import 
    var tmp = {}
    tmp.IO = IO

    // 被 merge 的部分
    function Ijnjs() { }

    new MergeImports().main(Ijnjs, tmp)

    // 測試 (下面與a完全一樣)
    assert.equal(Ijnjs.IO.Path.getExtension('/nui/aa.tmp'), '.tmp')
    assert.equal(Ijnjs.IO.Path.getDirection('/nui/aa.tmp'), '/nui/')
    assert.equal(Ijnjs.IO.Path.s.fnMember(), 'fnMember')
    assert.equal(Ijnjs.IO.Path.s.fnPrototype(), 'fnPrototype')
    assert.equal(Ijnjs.IO.Path.s.id, 'id')
    assert.equal(new Ijnjs.IO.Path().fnMember(), 'fnMember')
    assert.equal(new Ijnjs.IO.Path().fnPrototype(), 'fnPrototype')
    assert.equal(new Ijnjs.IO.Path().id, 'id')
  })
  function exportJsFile03(root) {
    // 實際一點，通常多層會是 namespace 多層, 例如 c# IO.Path
    function IO() { }
    IO.Path = Path

    // 下面與 02 一樣
    function Path() {
      this.id = 'id' // 這是 new Path() 才會有的屬性
      this.fnMember = function fnMember() { return 'fnMember' } // 這是 new Path().fnMember() 才能呼叫的
    }
    Path.prototype.fnPrototype = function fnPrototype() { return 'fnPrototype' }  // 這是 new Path().fnMember() 才能呼叫的
    Path.s = new Path() // static variable (這個技巧我常使用)
    function getExtension(path) { return '.tmp' }
    function getDirection(path) { return '/nui/' }
    Path.getExtension = getExtension // 這樣語法，同等於 class 的 static function
    Path.getDirection = getDirection

    root.IO = IO
  }
  QUnit.test("03b-多層", assert => {
    // import 
    var tmp = {}
    exportJsFile03(tmp)

    // 被 merge 的部分
    function Ijnjs() { }
    function IO() { }
    function Path() {
      this.id2 = "id2"
      this.fnMember2 = () => "fnMember2"
    }
    Path.prototype.fnPrototype2 = () => "fnPrototype2"
    IO.Path = Path
    Ijnjs.IO = IO

    new MergeImports().main(Ijnjs, tmp)

    // 測試 b 主要部分
    assert.equal(Ijnjs.IO.Path.s.fnMember2(), 'fnMember2')
    assert.equal(Ijnjs.IO.Path.s.fnPrototype2(), 'fnPrototype2')
    assert.equal(Ijnjs.IO.Path.s.id2, 'id2')
    assert.equal(new Ijnjs.IO.Path().fnMember2(), 'fnMember2')
    assert.equal(new Ijnjs.IO.Path().fnPrototype2(), 'fnPrototype2')
    assert.equal(new Ijnjs.IO.Path().id2, 'id2')

    // 測試 (下面與a完全一樣)
    assert.equal(Ijnjs.IO.Path.getExtension('/nui/aa.tmp'), '.tmp')
    assert.equal(Ijnjs.IO.Path.getDirection('/nui/aa.tmp'), '/nui/')
    assert.equal(Ijnjs.IO.Path.s.fnMember(), 'fnMember')
    assert.equal(Ijnjs.IO.Path.s.fnPrototype(), 'fnPrototype')
    assert.equal(Ijnjs.IO.Path.s.id, 'id')
    assert.equal(new Ijnjs.IO.Path().fnMember(), 'fnMember')
    assert.equal(new Ijnjs.IO.Path().fnPrototype(), 'fnPrototype')
    assert.equal(new Ijnjs.IO.Path().id, 'id')
  })
  QUnit.test("03c-多層", assert => {
    // import 
    var tmp = {}
    exportJsFile03(tmp)

    // 被 merge 的部分
    function Ijnjs() { }
    var IO = {}
    function Path() {
      this.id2 = "id2"
      this.fnMember2 = () => "fnMember2"
    }
    Path.prototype.fnPrototype2 = () => "fnPrototype2"
    IO.Path = Path
    Ijnjs.IO = IO

    new MergeImports().main(Ijnjs, tmp)

    // 測試 c 主要部分
    assert.equal(Ijnjs.IO.Path.s.fnMember2(), 'fnMember2')
    assert.equal(Ijnjs.IO.Path.s.fnPrototype2(), 'fnPrototype2')
    assert.equal(Ijnjs.IO.Path.s.id2, 'id2')
    assert.equal(new Ijnjs.IO.Path().fnMember2(), 'fnMember2')
    assert.equal(new Ijnjs.IO.Path().fnPrototype2(), 'fnPrototype2')
    assert.equal(new Ijnjs.IO.Path().id2, 'id2')

    // 測試 (下面與a完全一樣)
    assert.equal(Ijnjs.IO.Path.getExtension('/nui/aa.tmp'), '.tmp')
    assert.equal(Ijnjs.IO.Path.getDirection('/nui/aa.tmp'), '/nui/')
    assert.equal(Ijnjs.IO.Path.s.fnMember(), 'fnMember')
    assert.equal(Ijnjs.IO.Path.s.fnPrototype(), 'fnPrototype')
    assert.equal(Ijnjs.IO.Path.s.id, 'id')
    assert.equal(new Ijnjs.IO.Path().fnMember(), 'fnMember')
    assert.equal(new Ijnjs.IO.Path().fnPrototype(), 'fnPrototype')
    assert.equal(new Ijnjs.IO.Path().id, 'id')
  })

  // exports 多個
  QUnit.test("04a-多個", assert => {
    // 輸出 exports = {Path, Directory}    
    function Directory() {
      this.id3 = 'id3'
      this.fnMember3 = () => 'fnMember3'
    }
    Directory.prototype.fnPrototype3 = () => 'fnPrototype3'
    Directory.fnStatic3 = () => 'fnStatic3'

    function Path() {
      this.id = 'id' // 這是 new Path() 才會有的屬性
      this.fnMember = function fnMember() { return 'fnMember' } // 這是 new Path().fnMember() 才能呼叫的
    }
    Path.prototype.fnPrototype = function fnPrototype() { return 'fnPrototype' }  // 這是 new Path().fnMember() 才能呼叫的
    Path.s = new Path() // static variable (這個技巧我常使用)
    function getExtension(path) { return '.tmp' }
    function getDirection(path) { return '/nui/' }
    Path.getExtension = getExtension // 這樣語法，同等於 class 的 static function
    Path.getDirection = getDirection

    // 模擬 import
    var tmp = {}
    tmp.exports = { Path, Directory }

    // merge
    function Ijnjs() { }

    new MergeImports().main(Ijnjs, tmp)

    // 主要測試
    assert.equal(Ijnjs.Directory.fnStatic3(), 'fnStatic3')
    assert.equal(new Ijnjs.Directory().id3, 'id3')
    assert.equal(new Ijnjs.Directory().fnMember3(), 'fnMember3')
    assert.equal(new Ijnjs.Directory().fnPrototype3(), 'fnPrototype3')

    // 測試 
    assert.equal(Ijnjs.Path.getExtension('/nui/aa.tmp'), '.tmp')
    assert.equal(Ijnjs.Path.getDirection('/nui/aa.tmp'), '/nui/')
    assert.equal(Ijnjs.Path.s.fnMember(), 'fnMember')
    assert.equal(Ijnjs.Path.s.fnPrototype(), 'fnPrototype')
    assert.equal(Ijnjs.Path.s.id, 'id')

  })
})