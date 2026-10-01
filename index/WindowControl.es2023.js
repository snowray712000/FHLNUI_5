/// <reference path="../libs/jsdoc/linq.d.ts" />
/// <reference path="../libs/ijnjs/ijnjs.d.js" />
/// <reference path="../libs/jsdoc/jquery.js" />
/// <reference path="../libs/jsdoc/jquery-ui.js" />
/// <reference path="../libs/jsdoc/jquery.ui.touch-punch.js" />

/*
工具列上開關左右側欄、全螢幕的按鈕 (按鈕在 appSkeleton.es2023.js，版面見 TopBar.es2023.js)
- button#fhlLeftWindowControl，≡ 左側顯示與隱藏
- button#fhlInfoWindowControl，右側顯示與隱藏，右側有許多功能，串珠、Parsing、註釋等等
- button#fullscreenControl，全螢幕 (窄的時候在 ⋮ 選單)

原本還有 i#windowControlIcon (收合這組按鈕) 與 span#versionSelect3 (選擇譯本)。
選擇譯本改成點經文上方的譯本名稱，或左側欄的「聖經譯本選擇」
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

  }
  render(ps, dom) {
    // 按鈕已在骨架裡
  }
}