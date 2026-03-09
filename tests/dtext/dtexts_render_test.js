/// <reference path='./../../libs/jsdoc/jquery.js' />

/**
  * @typedef {import('./../../index/DText.js').DText} DText
  * @typedef {import('./../TpQUnit.js').TpQUnit} TpQUnit
  * @typedef {import('./../TpQUnit.js').TpAssert} TpAssert
 */
const QUnit = /** @type {TpQUnit} */ (window.QUnit);

import { dtexts_render } from './../../index/dtext/dtexts_render.js'
import { cvtAddrsToRef } from './../../index/cvtAddrsToRef.es2023.js'
import { splitReference } from './../../index/splitReference.es2023.js'

/** @type {DText[]} */
let input = [];
/** @type {JQuery<HTMLElement>} */
let except = $('<span></span>');
/** @type {JQuery<HTMLElement>} */
let result = $('<span></span>');

QUnit.module("render_dtexts")

function equalJQueryHtml(assert, $result, $except) {
  // clone and append to span
  const re2 = $result.clone()
  const ex2 = $except.clone()
  const tmp1 = $('<span></span>').append(re2)
  const tmp2 = $('<span></span>').append(ex2)

  const resultHtml = tmp1[0].outerHTML;
  const exceptHtml = tmp2[0].outerHTML;

  assert.equal(resultHtml, exceptHtml);
}

// --- case 1 最基本的 文字 Hr Br
QUnit.test("1 基本 文字 Hr Br", assert => {
  input =
    [
      { w: "God" },
      { w: "God", isTitle1: 1 },
      { w: "God", isBold: 1 },
      { w: "God", isName: 1 },
      { w: "God", isName: 1, isBold: 1, isTitle1: 1 },
      { isHr: 1 },
      { isBr: 1 }
    ]

  except = $('<span>God</span><span class="isTitle1">God</span><span class="isBold">God</span><span class="isName">God</span><span class="isTitle1 isBold isName">God</span><hr/><br/>');

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);
})

QUnit.test("1 基本 文字 ", assert => {
  // 1. **一般文字樣式旗標**
  //    - `isGODSay`, `isOrigNotExist`, `isParenthesesFW/HW/FW2`, `cssColor`, `class`
  //    - 目前只測 `isTitle1/isBold/isName`，其餘還沒覆蓋（型別定義在 `DText`）。

  input =
    [
      { w: "aa", isGODSay: 1 },
      { w: "bb", isOrigNotExist: 1 },
      { w: "cc", isParenthesesFW: 1 },
      { w: "dd", isParenthesesHW: 1 },
      { w: "ee", isParenthesesFW2: 1 },
      { w: "ff", cssColor: "rgb(195, 39, 43)" },
      { w: "gg", class: "testClass" },
    ]

  except = $('<span class="isGODSay">aa</span><span class="isOrigNotExist">bb</span><span class="isParenthesesFW">cc</span><span class="isParenthesesHW">dd</span><span class="isParenthesesFW2">ee</span><span style="color: rgb(195, 39, 43);">ff</span><span class="testClass">gg</span>');

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);
})

// --- case 2 交互參照 ref

// dtext ref 交互參照 規則
// - html 相關的 class 是 .ref
// - 使用的是 attr ( 'addr-desc' ) 
// - 或是使用 attr ( 'data-addrs' ) ... 但回傳值會被 JSON.parse( ) ... 內容應該是 jaArray, 是 [{book,chap,verse},... ] 的集合
// - 若能使用 addr-desc 較好，因為 data-addrs 最終也會被轉去 addr-desc 方式，再配合 qsb.php 來取得資料
// - 若缺 w 時，先嘗試用 refDesc 來當 w 的內容

QUnit.test("2 交互參照 ref case 1", assert => {

  input =
    [
      { w: "# 1, 5;2:1-3;Joh 3:1 |", isRef: 1, refDescription: "創 1:1, 5;2:1-3;約 3:1" },
    ]

  except = $('<span class="ref" data-desc="創 1:1, 5;2:1-3;約 3:1"># 1, 5;2:1-3;Joh 3:1 |</span>');

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);
})

QUnit.test("2 交互參照 ref case 2", assert => {

  const ja = JSON.parse('[{"book":1,"chap":1,"verse":1},{"book":1,"chap":1,"verse":5},{"book":1,"chap":2,"verse":1},{"book":1,"chap":2,"verse":2},{"book":1,"chap":2,"verse":3},{"book":43,"chap":3,"verse":1}]')

  input =
    [
      { w: "# 1, 5;2:1-3;Joh 3:1 |", isRef: 1, refAddresses: ja },
    ]

  except = $('<span class="ref" data-addrs=\'[{"book":1,"chap":1,"verse":1},{"book":1,"chap":1,"verse":5},{"book":1,"chap":2,"verse":1},{"book":1,"chap":2,"verse":2},{"book":1,"chap":2,"verse":3},{"book":43,"chap":3,"verse":1}]\'># 1, 5;2:1-3;Joh 3:1 |</span>');

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);
})


QUnit.test("2 交互參照 ref case 3", assert => {

  const ja = JSON.parse('[{"book":1,"chap":1,"verse":1},{"book":1,"chap":1,"verse":5},{"book":1,"chap":2,"verse":1},{"book":1,"chap":2,"verse":2},{"book":1,"chap":2,"verse":3},{"book":43,"chap":3,"verse":1}]')

  input =
    [
      { w: "# 1, 5;2:1-3;Joh 3:1 |", isRef: 1, refAddresses: ja, refDescription: "創 1:1, 5;2:1-3;約 3:1" },
    ]


  except = $('<span class="ref" data-desc="創 1:1, 5;2:1-3;約 3:1" data-addrs=\'[{"book":1,"chap":1,"verse":1},{"book":1,"chap":1,"verse":5},{"book":1,"chap":2,"verse":1},{"book":1,"chap":2,"verse":2},{"book":1,"chap":2,"verse":3},{"book":43,"chap":3,"verse":1}]\'># 1, 5;2:1-3;Joh 3:1 |</span>');

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);
})

QUnit.test("2 交互參照 ref case 4 缺 w 時用 refDesc", assert => {
  // 2. **Ref 顯示 fallback 規則**
  //    - `isRef=1` 且 `w` 缺省時，是否用 `refDescription` 顯示。
  //    - `refAddresses` 與 `refDescription` 同時存在時，attr 優先順序（你有測，但可再補「`w` 缺省」）。
  //    - 參考現有行為來源：`appendInlineDTexts`、`cvtDTextsToHtml`。

  input =
    [
      { isRef: 1, refDescription: "創 1:1, 5;2:1-3;約 3:1" },
    ]

  except = $('<span class="ref" data-desc="創 1:1, 5;2:1-3;約 3:1">創 1:1, 5;2:1-3;約 3:1</span>');

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})



// --- case 3 Strong Number sn

// dtext sn Strong Number 規則
// - html 相關的 class 是 .sn
// - 會使用 attr ( 'tp' ) 來區分 H 或 G
// - 會使用 attr ( 'sn' ) 來區分 SN
// - 若有 sn 且有 tp2 才是真正的 .sn, 不然就是 .sn-text (這是「閱讀」功能，所以 註釋 要配合這規則，雖然不知道 tp2, 但確定是真 sn, 就加個 tp2 )
// - 若有 w 則 text 是 w，若沒有, text 則是 tp + sn
// - WTH WTG 都是 動詞時態, 若沒有 w, 是用 (tp + sn) 來顯示, 若 tp2 非 T 若用 <tp + sn> 來顯示, 即 &lt; &gt;
// - sn 並非都是數字
// - isCurly { } 

QUnit.test("3 Strong Number sn case 1", assert => {

  input =
    [
      { w: " ww1234 ", tp: "H", sn: "1234", tp2: "WH" },
      { tp: "H", sn: "1234", tp2: "WH" },
    ]

  except = $('<span class="sn" tp="H" sn="1234"> ww1234 </span><span class="sn" tp="H" sn="1234">&lt;H1234&gt;</span>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("3 Strong Number sn case 2", assert => {

  input =
    [
      { w: "H1234", tp: "H", sn: "1234" },
      { w: "G5678", tp: "G", sn: "5678" },
      { w: "H1234", tp: "H", sn: "1234", tp2: "WH" },
      { w: "G5678", tp: "G", sn: "5678", tp2: "WG" },
    ]

  except = $('<span class="sn-text" tp="H" sn="1234">H1234</span><span class="sn-text" tp="G" sn="5678">G5678</span><span class="sn" tp="H" sn="1234">H1234</span><span class="sn" tp="G" sn="5678">G5678</span>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("3 Strong Number sn case 3", assert => {

  input =
    [
      { tp: "H", sn: "1234", tp2: "WTH" },
      { tp: "H", sn: "1234", tp2: "WH" },
      { tp: "G", sn: "5678", tp2: "WTG" },
      { tp: "G", sn: "5678", tp2: "WG" },
      { w: "ww1234", tp: "H", sn: "1234", tp2: "WH" },
    ]

  except = $('<span class="sn" tp="H" sn="1234">(H1234)</span><span class="sn" tp="H" sn="1234">&lt;H1234&gt;</span><span class="sn" tp="G" sn="5678">(G5678)</span><span class="sn" tp="G" sn="5678">&lt;G5678&gt;</span><span class="sn" tp="H" sn="1234">ww1234</span>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);
})


QUnit.test("3 Strong Number sn case 4", assert => {

  input =
    [
      { tp: "H", sn: "1234a", tp2: "WH" },
    ]

  except = $('<span class="sn" tp="H" sn="1234a">&lt;H1234a&gt;</span>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);
})

QUnit.test("3 Strong Number sn case 5 isCurly", assert => {

  input =
    [
      { sn: "1234", tp2: "WH", isCurly: 1 },
      { sn: "1234", tp2: "WTH", isCurly: 1 },
      { w: "ww1234", sn: "1234", tp2: "WH", isCurly: 1 },
    ]

  except = $('<span class="sn isCurly" sn="1234">{&lt;1234&gt;}</span><span class="sn isCurly" sn="1234">{(1234)}</span><span class="sn isCurly" sn="1234">ww1234</span>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

// --- case 4 children

// dtext children 規則
// - children 是 DText[] 的結構
// - children 與 w 是 二選一 ... children 是較複雜的內容時 ... w 是較單純的內容時
// - tpContainer 也可以配合它用, 若這個沒有, 就是 span 包起來
// - .idt .bibletext .exp 都是浸宣字典格式

/*
                // .idt 是 浸宣字典格式;
                // .bibtext 也是 浸宣字典格式
                if (a1.tpContainer == '<div class="idt">') {
                    re += '<div class="idt">' + re2 + '</div>'
                } else if (a1.tpContainer == '<span class="bibtext">') {
                    re += '<span class="bibtext">' + re2 + '</span>'
                } else if (a1.tpContainer == '<span class="exp">') {
                    re += '<span class="exp">' + re2 + '</span>'                
                } 
                else {
                    re += '<span>' + re2 + '</span>'
                }
*/

QUnit.test("4 children case 1", assert => {

  input =
    [
      {
        children:
          [
            { w: "aa" },
            { sn: "1234", tp: "H", tp2: "WH", w: "H1234" },
            { w: "bb" },
          ]
      }
    ]

  except = $('<span><span>aa</span><span class="sn" tp="H" sn="1234">H1234</span><span>bb</span></span>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("4 children case 2", assert => {

  input =
    [
      {
        tpContainer: '<div class="idt">',
        children:
          [
            { w: "aa" },
            { sn: "1234", tp: "H", tp2: "WH", w: "H1234" },
            { w: "bb" },
          ]
      }
    ]

  except = $('<div class="idt"><span>aa</span><span class="sn" tp="H" sn="1234">H1234</span><span>bb</span></div>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("4 children case 3", assert => {

  input =
    [
      {
        tpContainer: '<span class="bibtext">',
        children:
          [
            { w: "aa" },
            { sn: "1234", tp: "H", tp2: "WH", w: "H1234" },
            { w: "bb" },
          ]
      }
    ]

  except = $('<span class="bibtext"><span>aa</span><span class="sn" tp="H" sn="1234">H1234</span><span>bb</span></span>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("4 children case 4", assert => {

  input =
    [
      {
        tpContainer: '<span class="exp">',
        children:
          [
            { w: "aa" },
            { sn: "1234", tp: "H", tp2: "WH", w: "H1234" },
            { w: "bb" },
          ]
      }
    ]

  except = $('<span class="exp"><span>aa</span><span class="sn" tp="H" sn="1234">H1234</span><span>bb</span></span>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

// --- case 5 childrenlist
// - 開發 註釋 的過程產生的. 因為有許多 ul li 結構
// - ul 若存在 w, 則是 <ul> w <li> item1 </li><li> item2 </li> ... </ul>
// - ul 若不存在 w, 則是 <ul><li> item1 </li><li> item2 </li> ... </ul>
// - 2 層的 ul li 是這樣. <ul> w <li> item1 <ul> w2 <li> item11 </li><li> item12 </li> ... </ul> </li><li> item2 </li> ... </ul> 
// - li 通常會與 .marker 配合使用
// - w 與 chileren 與 joTable 與 joRaw 是四選一的關係, children 是較複雜的內容時, w 是較單純的內容時, joTable 是表格內容, joRaw 是原始 html 內容時


QUnit.test("5 childrenlist case 1", assert => {

  input =
    [
      {
        childrenlist:
          [
            { w: "項目1" },
            { w: "項目2" },
          ]
      }
    ]

  except = $('<ul><li class="hanging-indent"><span>項目1</span></li><li class="hanging-indent"><span>項目2</span></li></ul>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("5 childrenlist case 2", assert => {

  input =
    [
      {
        w: "列表",
        childrenlist:
          [
            { w: "項目1" },
            { w: "項目2" },
          ]
      }
    ]

  except = $('<ul><span>列表</span><li class="hanging-indent"><span>項目1</span></li><li class="hanging-indent"><span>項目2</span></li></ul>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("5 childrenlist case 2a 非巢狀，w 有樣式", assert => {

  input =
    [
      {
        w: "清單",
        isTitle1: 1,
        childrenlist:
          [
            { w: "項目1" },
            { w: "項目2" },
          ]
      }
    ]

  except = $('<ul><span class="isTitle1">清單</span><li class="hanging-indent"><span>項目1</span></li><li class="hanging-indent"><span>項目2</span></li></ul>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("5 childrenlist case 3", assert => {
  input =
    [
      {
        childrenlist:
          [
            {
              w: "項目1", childrenlist: [
                { w: "子項目1" },
                { w: "子項目2" },
              ]
            },
            { w: "項目2" },
          ]
      }
    ]

  except = $('<ul><li class="hanging-indent"><span>項目1</span><ul><li class="hanging-indent"><span>子項目1</span></li><li class="hanging-indent"><span>子項目2</span></li></ul></li><li class="hanging-indent"><span>項目2</span></li></ul>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("5 childrenlist case 4 marker 輸出格式", assert => {

  input =
    [
      {
        childrenlist:
          [
            { w: "項目1", marker: "●" },
            { w: "項目2", marker: "●" },
          ]
      }
    ]

  except = $('<ul><li class="hanging-indent"><span class="marker">●</span><span>項目1</span></li><li class="hanging-indent"><span class="marker">●</span><span>項目2</span></li></ul>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("5 childrenlist case 5 w + childrenlist + marker", assert => {

  input =
    [
      {
        w: "列表標題",
        childrenlist:
          [
            { w: "項目1", marker: "1." },
            { w: "項目2", marker: "2." },
          ]
      }
    ]

  except = $('<ul><span>列表標題</span><li class="hanging-indent"><span class="marker">1.</span><span>項目1</span></li><li class="hanging-indent"><span class="marker">2.</span><span>項目2</span></li></ul>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("5 childrenlist case 6 巢狀 list + marker 混用", assert => {

  input =
    [
      {
        w: "外層列表",
        childrenlist:
          [
            {
              w: "項目1",
              marker: "●",
              childrenlist: [
                { w: "子項目1", marker: "○" },
                { w: "子項目2", marker: "○" },
              ]
            },
            { w: "項目2", marker: "●" },
          ]
      }
    ]

  except = $('<ul><span>外層列表</span><li class="hanging-indent"><span class="marker">●</span><span>項目1</span><ul><li class="hanging-indent"><span class="marker">○</span><span>子項目1</span></li><li class="hanging-indent"><span class="marker">○</span><span>子項目2</span></li></ul></li><li class="hanging-indent"><span class="marker">●</span><span>項目2</span></li></ul>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("5 childrenlist case 7 巢狀 li 內容為 children", assert => {
  input =
    [
      {
        childrenlist: [
          {
            children: [
              { w: "aaa" },
              { w: "H1234", tp: "H", sn: "1234", tp2: "WH" },
              { w: "bbbb" },
            ],
            childrenlist: [
              { w: "子項目1" },
              { w: "子項目2" },
            ]
          },
          { w: "項目2" },
        ]
      }
    ]

  except = $('<ul><li class="hanging-indent"><span><span>aaa</span><span class="sn" tp="H" sn="1234">H1234</span><span>bbbb</span></span><ul><li class="hanging-indent"><span>子項目1</span></li><li class="hanging-indent"><span>子項目2</span></li></ul></li><li class="hanging-indent"><span>項目2</span></li></ul>')

  result = dtexts_render(input)

  equalJQueryHtml(assert, result, except)
})

QUnit.test("5 childrenlist case 8 巢狀 li 內容為 children + tpContainer", assert => {
  input =
    [
      {
        childrenlist: [
          {
            tpContainer: '<div class="idt">',
            children: [
              { w: "aaa" },
              { w: "H1234", tp: "H", sn: "1234", tp2: "WH" },
              { w: "bbbb" },
            ],
            childrenlist: [
              { w: "子項目1" },
              { w: "子項目2" },
            ]
          },
          { w: "項目2" },
        ]
      }
    ]

  except = $('<ul><li class="hanging-indent"><div class="idt"><span>aaa</span><span class="sn" tp="H" sn="1234">H1234</span><span>bbbb</span></div><ul><li class="hanging-indent"><span>子項目1</span></li><li class="hanging-indent"><span>子項目2</span></li></ul></li><li class="hanging-indent"><span>項目2</span></li></ul>')

  result = dtexts_render(input)

  equalJQueryHtml(assert, result, except)
})

QUnit.test("5 childrenlist case 9 巢狀 li 內容為 joTable", assert => {
  input =
    [
      {
        childrenlist: [
          {
            w: "項目1",
            joTable: {
              rows: 3, cols: 2, cells: [
                { r: 0, c: 0, content: [{ w: "c00" }] },
                { r: 0, c: 1, content: [{ w: "c01" }] },
                { r: 1, c: 0, content: [{ w: "r00c00" }] },
                { r: 1, c: 1, content: [{ w: "r00c01" }] },
                { r: 2, c: 0, content: [{ w: "r01c00" }] },
                { r: 2, c: 1, content: [{ w: "r01c01" }] },
              ]
            }
          },
          { w: "項目2" },
        ]
      }
    ]

  except = $('<ul><li class="hanging-indent"><span>項目1</span><div class="joTable"><table><tbody><tr><td><span>c00</span></td><td><span>c01</span></td></tr><tr><td><span>r00c00</span></td><td><span>r00c01</span></td></tr><tr><td><span>r01c00</span></td><td><span>r01c01</span></td></tr></tbody></table></div></li><li class="hanging-indent"><span>項目2</span></li></ul>')

  result = dtexts_render(input)

  equalJQueryHtml(assert, result, except)
})

QUnit.test("5 childrenlist case 9b 巢狀 li 內容為 joTable", assert => {
  input =
    [
      {
        childrenlist: [
          {
            joTable: {
              rows: 3, cols: 2, cells: [
                { r: 0, c: 0, content: [{ w: "c00" }] },
                { r: 0, c: 1, content: [{ w: "c01" }] },
                { r: 1, c: 0, content: [{ w: "r00c00" }] },
                { r: 1, c: 1, content: [{ w: "r00c01" }] },
                { r: 2, c: 0, content: [{ w: "r01c00" }] },
                { r: 2, c: 1, content: [{ w: "r01c01" }] },
              ]
            }
          },
          { w: "項目2" },
        ]
      }
    ]

  except = $('<ul><li class="hanging-indent"><div class="joTable"><table><tbody><tr><td><span>c00</span></td><td><span>c01</span></td></tr><tr><td><span>r00c00</span></td><td><span>r00c01</span></td></tr><tr><td><span>r01c00</span></td><td><span>r01c01</span></td></tr></tbody></table></div></li><li class="hanging-indent"><span>項目2</span></li></ul>')

  result = dtexts_render(input)

  equalJQueryHtml(assert, result, except)
})


QUnit.test("5 childrenlist case 10 巢狀 li 內容為 rawTable", assert => {
  input =
    [
      {
        childrenlist: [
          { w: "項目1", rawTable: " raw_string_content " },
          { w: "項目2" },
        ]
      }
    ]

  except = $('<ul><li class="hanging-indent"><span>項目1</span><pre class="raw-table"> raw_string_content </pre></li><li class="hanging-indent"><span>項目2</span></li></ul>')

  result = dtexts_render(input)

  equalJQueryHtml(assert, result, except)
})

QUnit.test("5 childrenlist case 10a 巢狀 li 是 w 且有 isTitle1 類樣式", assert => {
  input =
    [
      {
        childrenlist: [
          {
            w: "項目1",
            isTitle1: 1,
            childrenlist: [
              { w: "子項目1" },
              { w: "子項目2" },
            ]
          },
          { w: "項目2" },
        ]
      }
    ]

  except = $('<ul><li class="hanging-indent"><span class="isTitle1">項目1</span><ul><li class="hanging-indent"><span>子項目1</span></li><li class="hanging-indent"><span>子項目2</span></li></ul></li><li class="hanging-indent"><span>項目2</span></li></ul>')

  result = dtexts_render(input)

  equalJQueryHtml(assert, result, except)
})

QUnit.test("5 childrenlist case 11 巢狀 li 中間層無文字/無 children", assert => {
  input =
    [
      {
        childrenlist: [
          {
            childrenlist: [
              { w: "子項目1" },
              { w: "子項目2" },
            ]
          },
          { w: "項目2" },
        ]
      }
    ]

  except = $('<ul><li class="hanging-indent"><ul><li class="hanging-indent"><span>子項目1</span></li><li class="hanging-indent"><span>子項目2</span></li></ul></li><li class="hanging-indent"><span>項目2</span></li></ul>')

  result = dtexts_render(input)

  equalJQueryHtml(assert, result, except)
})

// --- case 6 joTable 與 joRaw
// - dtext 的 table 原本是在開發 註釋 過程中出現的
// - joTable 結構: { rows, cols, cells: [{r, c, content/text, rowSpan?, colSpan?}, ...] }
// - cell content 為 DText[]（含 ref/sn）或純文字
// - rowSpan/colSpan 會佔據對應的格位
// - invalid rows/cols 或缺少必要欄位時應處理

QUnit.test("6 joTable case 1 基本表格", assert => {

  input =
    [
      {
        joTable: {
          rows: 2, cols: 2, cells: [
            { r: 0, c: 0, content: [{ w: "標題1" }] },
            { r: 0, c: 1, content: [{ w: "標題2" }] },
            { r: 1, c: 0, content: [{ w: "內容1" }] },
            { r: 1, c: 1, content: [{ w: "內容2" }] },
          ]
        }
      }
    ]

  except = $('<div class="joTable"><table><tbody><tr><td><span>標題1</span></td><td><span>標題2</span></td></tr><tr><td><span>內容1</span></td><td><span>內容2</span></td></tr></tbody></table></div>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("6 joTable case 2 rowSpan/colSpan", assert => {

  input =
    [
      {
        joTable: {
          rows: 3, cols: 3, cells: [
            { r: 0, c: 0, content: [{ w: "合併行" }], rowSpan: 2 },
            { r: 0, c: 1, content: [{ w: "標題B" }] },
            { r: 0, c: 2, content: [{ w: "標題C" }] },
            { r: 1, c: 1, content: [{ w: "內容B1" }] },
            { r: 1, c: 2, content: [{ w: "內容C1" }] },
            { r: 2, c: 0, content: [{ w: "標題A2" }], colSpan: 2 },
            { r: 2, c: 2, content: [{ w: "內容C2" }] },
          ]
        }
      }
    ]

  except = $('<div class="joTable"><table><tbody><tr><td rowspan="2"><span>合併行</span></td><td><span>標題B</span></td><td><span>標題C</span></td></tr><tr><td><span>內容B1</span></td><td><span>內容C1</span></td></tr><tr><td colspan="2"><span>標題A2</span></td><td><span>內容C2</span></td></tr></tbody></table></div>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("6 joTable case 3 空 cell", assert => {

  input =
    [
      {
        joTable: {
          rows: 2, cols: 3, cells: [
            { r: 0, c: 0, content: [{ w: "A" }] },
            { r: 0, c: 2, content: [{ w: "C" }] },
            { r: 1, c: 1, content: [{ w: "B2" }] },
          ]
        }
      }
    ]

  except = $('<div class="joTable"><table><tbody><tr><td><span>A</span></td><td></td><td><span>C</span></td></tr><tr><td></td><td><span>B2</span></td><td></td></tr></tbody></table></div>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("6 joTable case 4 cell content 為 DText[]（含 ref/sn）", assert => {

  const ja = JSON.parse(`[{"book":1,"chap":1,"verse":1}]`);

  input =
    [
      {
        joTable: {
          rows: 2, cols: 2, cells: [
            { r: 0, c: 0, content: [{ w: "經文" }] },
            { r: 0, c: 1, content: [{ w: "Strong Number" }] },
            { r: 1, c: 0, content: [{ w: " Gen 1:1 ", isRef: 1, refDescription: "創 1:1", refAddresses: ja }] },
            { r: 1, c: 1, content: [{ w: "H430", tp: "H", sn: "430", tp2: "WH" }] },
          ]
        }
      }
    ]

  except = $('<div class="joTable"><table><tbody><tr><td><span>經文</span></td><td><span>Strong Number</span></td></tr><tr><td><span class="ref" data-desc="創 1:1" data-addrs=\'[{"book":1,"chap":1,"verse":1}]\'> Gen 1:1 </span></td><td><span class="sn" tp="H" sn="430">H430</span></td></tr></tbody></table></div>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("6 joTable case 5 cell text 為純文字", assert => {

  input =
    [
      {
        joTable: {
          rows: 2, cols: 2, cells: [
            { r: 0, c: 0, text: "課程" },
            { r: 0, c: 1, text: "時間" },
            { r: 1, c: 0, text: "數學" },
            { r: 1, c: 1, text: "2小時" },
          ]
        }
      }
    ]

  except = $('<div class="joTable"><table><tbody><tr><td>課程</td><td>時間</td></tr><tr><td>數學</td><td>2小時</td></tr></tbody></table></div>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

QUnit.test("6 joTable case 6 invalid rows/cols", assert => {

  input =
    [
      {
        joTable: {
          rows: -1, cols: 2, cells: []
        }
      }
    ]

  result = dtexts_render(input);

  // 應該產生錯誤訊息或空容器
  assert.ok(result.text().includes('[joTable: invalid rows/cols]') || result.find('.joTable').length === 0);

})

QUnit.test("6 joTable case 7 複雜表格 rowSpan colSpan 混合", assert => {

  input =
    [
      {
        joTable: {
          rows: 4, cols: 4, cells: [
            { r: 0, c: 0, content: [{ w: 'Header A' }] },
            { r: 0, c: 1, content: [{ w: 'Header B' }], colSpan: 2 },
            { r: 0, c: 3, content: [{ w: 'Header D' }] },
            { r: 1, c: 0, content: [{ w: 'Row1-A' }], rowSpan: 2 },
            { r: 1, c: 1, content: [{ w: 'Row1-B' }] },
            { r: 1, c: 2, content: [{ w: 'Row1-C' }] },
            { r: 1, c: 3, content: [{ w: 'Row1-D' }] },
            { r: 2, c: 1, content: [{ w: 'Row2-B' }], colSpan: 2 },
            { r: 2, c: 3, content: [{ w: 'Row2-D' }] },
            { r: 3, c: 0, content: [{ w: 'Row3-A' }], colSpan: 2 },
            { r: 3, c: 2, content: [{ w: 'Row3-C' }], colSpan: 2 },
          ]
        }
      }
    ]

  except = $('<div class="joTable"><table><tbody><tr><td><span>Header A</span></td><td colspan="2"><span>Header B</span></td><td><span>Header D</span></td></tr><tr><td rowspan="2"><span>Row1-A</span></td><td><span>Row1-B</span></td><td><span>Row1-C</span></td><td><span>Row1-D</span></td></tr><tr><td colspan="2"><span>Row2-B</span></td><td><span>Row2-D</span></td></tr><tr><td colspan="2"><span>Row3-A</span></td><td colspan="2"><span>Row3-C</span></td></tr></tbody></table></div>')

  result = dtexts_render(input);

  equalJQueryHtml(assert, result, except);

})

