/// <reference path="../libs/jsdoc/linq.d.ts" />
/// <reference path="../libs/ijnjs/ijnjs.d.js" />
/// <reference path="../libs/jsdoc/jquery.js" />
/// <reference path="../libs/jsdoc/jquery-ui.js" />
/// <reference path="../libs/jsdoc/jquery.ui.touch-punch.js" />

/*
- span#versionSelect3，選擇譯本
- span#fhlLeftWindowControl，左側顯示與隱藏
- span#fhlInfoWindowControl，右側顯示與隱藏，右側有許多功能，串珠、Parsing、註釋等等
- span#fullscreenControl，螢幕全螢幕顯示與隱藏，但通常會自動換行所以看不到，算是Bug
- i#windowControlIcon，決定 div#windowControlButtons 的顯示與隱藏 ... 很窄的時候，會自動隱藏

```html
<div#windowControl>
  <i#windowControlIcon></i> ... 很窄的時候，會自動隱藏
  <div#windowControlButtons>
    <span#versionSelect3>
    <span#fhlLeftWindowControl>
    <span#fhlInfoWindowControl>
    <span#fullscreenControl>
  </div>
</div>
```
*/

import { FhlLecture } from "./FhlLecture.es2023.js";
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
    var html = "<i id='windowControlIcon' class='fa fa-tv fa-fw selected'></i><div id='windowControlButtons'><span id='fhlLeftWindowControl' class='selected' ><i class='fa fa-wrench fa-fw'></i></span><span id='fhlInfoWindowControl' class='selected'><i class='fa fa-file-text-o fa-fw'></i></span><space style='margin: 0px 10px; cursor: default; color: #D0D0D0;'>|</space><span id='fullscreenControl'><i class='fa fa-arrows-alt fa-fw'></i></span></div>";
    dom.html(html);
  }
}