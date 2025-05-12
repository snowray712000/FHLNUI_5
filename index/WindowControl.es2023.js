/// <reference path="../libs/jsdoc/linq.d.ts" />
/// <reference path="../libs/ijnjs/ijnjs.d.js" />
/// <reference path="../libs/jsdoc/jquery.js" />
/// <reference path="../libs/jsdoc/jquery-ui.js" />
/// <reference path="../libs/jsdoc/jquery.ui.touch-punch.js" />

/*
- span#versionSelect3，選擇譯本
- span#fhlLeftWindowControl，左側顯示與隱藏
- span#fhlMidBottomWindowControl，底部顯示與隱藏，底部負責搜尋的結果
- span#fhlInfoWindowControl，右側顯示與隱藏，右側有許多功能，串珠、Parsing、註釋等等
- span#fullscreenControl，螢幕全螢幕顯示與隱藏，但通常會自動換行所以看不到，算是Bug
- i#windowControlIcon，決定 div#windowControlButtons 的顯示與隱藏 ... 很窄的時候，會自動隱藏

```html
<div#windowControl>
  <i#windowControlIcon></i> ... 很窄的時候，會自動隱藏
  <div#windowControlButtons>
    <span#versionSelect3>
    <span#fhlLeftWindowControl>
    <span#fhlMidBottomWindowControl>
    <span#fhlInfoWindowControl>
    <span#fullscreenControl>
  </div>
</div>
```
*/

import { FhlLecture } from "./FhlLecture.es2023.js";
import { FhlMidBottomWindow } from "./FhlMidBottomWindow.es2023.js";
import { requestFullscreen } from "./requestFullscreen.es2023.js";
import { coreInfoWindowShowHide } from "./coreInfoWindowShowHide.es2023.js";

export class WindowControl {
  static #s = null
  /** @returns {WindowControl} */
  static get s() { if (!this.#s) this.#s = new WindowControl(); return this.#s; }

  /** @type {HTMLElement} */
  dom = null;
  init(ps, dom) {
    this.dom = dom
    this.render(ps, this.dom);
    this.registerEvents(ps);
  }
  registerEvents(ps) {
    // 決定顯示控制項與否
    $('#windowControlIcon').on('click',
      /**
       * @param {Event} e 
       */
      function (e) {
        const that = $(e.currentTarget);

        if (that.hasClass('selected')) {
          that.animate({ left: '0px' });
          $("#windowControl").animate({ width: '30px' }, function () {
            that.removeClass('selected');
          });
          $("#windowControlButtons").animate({ opacity: 0 }, 100);
        }
        else {

          that.animate({ left: '20px' });
          $("#windowControl").animate({ width: '350px' }, function () {
            that.addClass('selected');
          });
          $("#windowControlButtons").animate({ opacity: 1 }, 800);
        }
        e.stopPropagation();
      }
    );

    // 第1個功能 左側顯示與隱藏
    $('#fhlLeftWindowControl').on('click',
      function (e) {
        const that = $(e.currentTarget);

        if (that.hasClass('selected')) {
          coreInfoWindowShowHide(function () {
            FhlLecture.s.reshape(ps);
          }, false, undefined)
        } else {
          coreInfoWindowShowHide(function () {
            FhlLecture.s.reshape(ps);
          }, true, undefined)
        }
      }
    );

    // 第2個功能 底部顯示與隱藏，就是搜尋結果
    $('#fhlMidBottomWindowControl').on('click',
      function (e) {
        const that = $(e.currentTarget)

        var fhlMidBottomWindow$ = $('#fhlMidBottomWindow')
        if (that.hasClass('selected')) {
          that.removeClass('selected');

          fhlMidBottomWindow$.hide()
          FhlMidBottomWindow.s.updateBottomOfLecture()
        }
        else {
          that.addClass('selected');
          fhlMidBottomWindow$.show()

          FhlMidBottomWindow.s.updateMaxHeightOfResizableAndOfDom()
          FhlMidBottomWindow.s.updateBottomOfLecture()
        }
      }
    );

    // 第3個功能 右側顯示與隱藏
    $('#fhlInfoWindowControl').on('click',
      function (e) {
        const that = $(e.currentTarget)
        if (that.hasClass('selected')) {
          coreInfoWindowShowHide(function () {
            FhlLecture.s.reshape(ps);
          }, undefined, false)
        } else {
          coreInfoWindowShowHide(function () {
            FhlLecture.s.reshape(ps);
          }, undefined, true)
        }
      }
    );
    // 第4個功能 全螢幕顯示與隱藏
    $('#fullscreenControl').on('click',
      function (e) {
        const that = $(e.currentTarget)

        if (that.hasClass('selected')) {
          setTimeout(function () { that.removeClass('selected'); }, 1);
        }
        else {
          requestFullscreen();
          setTimeout(function () { that.addClass('selected'); }, 1);
        }
      }
    )

    // 其它
    $('#windowControl').on('click', function (e) {
      e.stopPropagation();
    });
  }
  render(ps, dom) {
    var html = "<i id='windowControlIcon' class='fa fa-tv fa-fw selected'></i><div id='windowControlButtons'><span id='fhlLeftWindowControl' class='selected' ><i class='fa fa-wrench fa-fw'></i></span><span id='fhlMidBottomWindowControl'><i class='fa fa-search-plus fa-fw'></i></span><span id='fhlInfoWindowControl' class='selected'><i class='fa fa-file-text-o fa-fw'></i></span><space style='margin: 0px 10px; cursor: default; color: #D0D0D0;'>|</space><span id='fullscreenControl'><i class='fa fa-arrows-alt fa-fw'></i></span></div>";
    dom.html(html);
  }
}

// (function (root) {
//   root.windowControl = {
//     init: function (ps, dom) {
//       this.dom = dom;
//       this.render(ps, this.dom);
//       this.registerEvents(ps);
//     },
//     registerEvents: function (ps) {
//       $('#windowControlIcon').click(function (e) {
//         if ($(this).hasClass('selected')) {
//           var that = $(this);
//           that.animate({ left: '0px' });
//           $("#windowControl").animate({ width: '30px' }, function () {
//             that.removeClass('selected');
//           });
//           $("#windowControlButtons").animate({ opacity: 0 }, 100);
//         }
//         else {
//           var that = $(this);
//           that.animate({ left: '20px' });
//           $("#windowControl").animate({ width: '350px' }, function () {
//             that.addClass('selected');
//           });
//           $("#windowControlButtons").animate({ opacity: 1 }, 800);
//         }
//         e.stopPropagation();
//       });
//       $(document).click(function () {
//         if ($('#windowControlIcon').hasClass('selected')) {
//           //$('#windowControlIcon').trigger( "click" );
//         }
//       });


//       $('#fhlLeftWindowControl').click(function () {
//         if ($(this).hasClass('selected')) {
//           coreInfoWindowShowHide(function () {
//             fhlLecture.reshape(ps);
//           }, false, undefined)
//         }
//         else {

//           coreInfoWindowShowHide(function () {
//             fhlLecture.reshape(ps);
//           }, true, undefined)
//         }

//       });
//       $('#fhlMidBottomWindowControl').click(function () {
//         var this$ = $(this)
//         var fhlMidBottomWindow$ = $('#fhlMidBottomWindow')
//         if (this$.hasClass('selected')) {
//           this$.removeClass('selected');
//           // var fhlMidBottomWindowHeight = fhlMidBottomWindow$.height();
//           // fhlMidBottomWindow$.animate({ top: $('#fhlMidWindow').height() + 15 + 'px', bottom: -fhlMidBottomWindowHeight - 15 + 'px' });
//           // $("#fhlLecture").animate({ bottom: '0px', height: $("#fhlLecture").height() + fhlMidBottomWindowHeight + 12 + 'px' }, function () {
//           //   this$.removeClass('selected');
//           // });
//           fhlMidBottomWindow$.hide()
//           fhlMidBottomWindow.updateBottomOfLecture()
//         }
//         else {
//           this$.addClass('selected');
//           fhlMidBottomWindow$.show()
//           // var fhlMidBottomWindowHeight = fhlMidBottomWindow$.height();
//           // fhlMidBottomWindow$.animate({ top: $('#fhlMidWindow').height() - fhlMidBottomWindowHeight + 'px', bottom: '0px' });            
//           // $("#fhlLecture").animate({ bottom: fhlMidBottomWindowHeight + 'px', height: $("#fhlLecture").height() - fhlMidBottomWindowHeight - 12 + 'px' }, function () {

//           // });
//           fhlMidBottomWindow.updateMaxHeightOfResizableAndOfDom()
//           fhlMidBottomWindow.updateBottomOfLecture()
//         }
//       });

//       $('#fhlInfoWindowControl').click(function () {
//         if ($(this).hasClass('selected')) {
//           coreInfoWindowShowHide(function () {
//             fhlLecture.reshape(ps);
//           }, undefined, false)
//         } else {
//           coreInfoWindowShowHide(function () {
//             fhlLecture.reshape(ps);
//           }, undefined, true)
//         }
//       });
//       $('#fullscreenControl').on('click', function () {
//         if ($(this).hasClass('selected')) {
//           var that = $(this);
//           setTimeout(function () { that.removeClass('selected'); }, 1);
//         }
//         else {
//           var that = $(this);
//           requestFullscreen();
//           setTimeout(function () { that.addClass('selected'); }, 1);
//         }
//       })


//       $('#windowControl').click(function (e) {
//         e.stopPropagation();
//       });
//     },
//     render: function (ps, dom) {
//       var html = "<i id='windowControlIcon' class='fa fa-tv fa-fw selected'></i><div id='windowControlButtons'><span id='fhlLeftWindowControl' class='selected' ><i class='fa fa-wrench fa-fw'></i></span><span id='fhlMidBottomWindowControl'><i class='fa fa-search-plus fa-fw'></i></span><span id='fhlInfoWindowControl' class='selected'><i class='fa fa-file-text-o fa-fw'></i></span><space style='margin: 0px 10px; cursor: default; color: #D0D0D0;'>|</space><span id='fullscreenControl'><i class='fa fa-arrows-alt fa-fw'></i></span></div>";
//       dom.html(html);
//     }
//   };

// })(this)