import { FhlLecture } from "./FhlLecture.es2023.js";
import { updateLocalStorage } from './updateLocalStorage.es2023.js';
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from "./gbText.es2023.js";

/**
 * - 這個不是用 singleton 模式，會建 3 個物件，管理 Hebrew, Greek, Sn 字型大小
 */
export class FontSizeToolBase {
    constructor(name) {
        this.getIdName = name == undefined ? "Hebrew" : name;
        /** @desc 介面上，那個按下會變小的 div Id */
        this.getIdSmaller = this.getIdName + "FontSizeSmaller";
        /** @desc 介面上，那個按下會變小的 div Id */
        this.getIdLarger = this.getIdName + "FontSizeLarger";
        /** @desc 介面上，那個滑塊 div Id */
        this.getIdSlider = this.getIdName + "FontSizeSliderBar";
        /** @desc 介面上，那個輸入值的 input text Id */
        this.getIdText = this.getIdName + "FontSize";
        // HebrewfontSizeTool
        this.dom = $('#' + this.getId())
    }
    getId() {
        return this.getIdName + "fontSizeTool"
    }
    registerEvents(ps) {
        var that = this
        $('#' + that.getIdSlider).off('change').on('change', function () {
            var domInput = $('#' + that.getIdSlider)
            var sz = parseInt(domInput.val())

            makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
        });
        $('#' + that.getIdText).off('change').on('change', function () {
            var domInput = $('#' + that.getIdText)
            var sz = parseInt(domInput.val())

            makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
        });
        $('#' + that.getIdSmaller).off('click').on('click', function () {
            var domInput = $('#' + that.getIdText)
            var sz = parseInt(domInput.val())
            sz -= 1

            makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
        });
        $('#' + that.getIdLarger).off('click').on('click', function () {
            var domInput = $('#' + that.getIdText)
            var sz = parseInt(domInput.val())
            sz += 1
            makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
        });
        return; // end of register
        function makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz) {
            sz = sz > 60 ? 60 : sz
            sz = sz < 6 ? 6 : sz

            updatePageStateFontSize(sz)

            $('#' + that.getIdText).val(sz)
            $("#" + that.getIdSlider).val(sz)

            updateFontSize()
            FhlLecture.s.reshape(TPPageState.s)
            return

            function updateFontSize() {
                // 更新 body --fontsize
                // 字型大小，統一改用 --fontsize css 變數, line-height: 1.1em 
                if (that.isGreek()) {
                    document.body.style.setProperty("--fontsize-greek", sz + "pt")
                } else if (that.isHebrew()) {
                    document.body.style.setProperty("--fontsize-hebrew", sz + "pt")
                } else if (that.isStrongNumber()) {
                    document.body.style.setProperty("--fontsize-sn", sz + "pt")
                }
            }
            function updatePageStateFontSize(sz) {
                if (that.isGreek()) { TPPageState.s.fontSizeGreek = sz }
                else if (that.isHebrew()) { TPPageState.s.fontSizeHebrew = sz }
                else if (that.isStrongNumber()) { TPPageState.s.fontSizeStrongNumber = sz }
                updateLocalStorage()
            }
        }
    }
    getClassNameForJQueryToSetFontSize() {
        if (this.isGreek()) { return '.hebrew-char' }
        if (this.isHebrew()) { return '.greek-char' }
        if (this.isStrongNumber()) { return '.sn' }
        return undefined
    }
    /**
     * 使用 name 是否 = Hebrew 字串
     * 用在 render 時，載入初始值時
     * 用在 大小變更後, 是變更 .hebrew-char 還是 .greek-char
    */
    isHebrew() {
        return this.getIdName == 'Hebrew'
    }
    isGreek() {
        return this.getIdName == 'Greek'
    }
    isStrongNumber() {
        return this.getIdName == 'Sn'
    }
    /** 在 render 中使用 */
    getSizeForInitial() {
        if (this.isHebrew()) {
            return TPPageState.s.fontSizeHebrew
        } else if (this.isGreek()) {
            return TPPageState.s.fontSizeGreek
        } else if (this.isStrongNumber()) {
            return TPPageState.s.fontSizeStrongNumber
        }
        return TPPageState.s.fontSize
    }
    render(ps, dom) {
        var sz = this.getSizeForInitial()
        var HorG = ''
        if (this.isHebrew()) {
            HorG = 'H'
        } else if (this.isGreek()) {
            HorG = 'G'
        } else if (this.isStrongNumber()) {
            HorG = 'SN'
        }
        var html = "<div>" + HorG + gbText("字大小", ps.gb) + ":</div>";
        html += ' <div id="' + this.getIdSmaller + '" class="FontSizeButtonLargeSmaller">A<span>-</span></div>\
                                  <div id="'+ this.getIdLarger + '" class="FontSizeButtonLargeSmaller">A<span>+</span></div>\
                                  <div style="display: block; margin-top: 5px; height: 30px;">\
                                      <input id="'+ this.getIdSlider + '" type="range" min="6" max="60" value="' + sz + '" step="1" style="width: 95px;"/>\
                                      <input id="'+ this.getIdText + '" type="text" value="' + sz + '" style="width:2em;"/>\
                                  </div>\
                                  ';
        dom.html(html);
    }
    init(ps, dom) {
        this.dom = dom
        this.render(ps, this.dom)
        this.registerEvents(ps)
    }
}

// /**
//  * @param {string} name - "Hebrew" "Greek" "Sn" 之類的
//  */
// function FontSizeToolBase(name) {
//   this.getIdName = name == undefined ? "Hebrew" : name;
//   /** @desc 介面上，那個按下會變小的 div Id */
//   this.getIdSmaller = this.getIdName + "FontSizeSmaller";
//   /** @desc 介面上，那個按下會變小的 div Id */
//   this.getIdLarger = this.getIdName + "FontSizeLarger";
//   /** @desc 介面上，那個滑塊 div Id */
//   this.getIdSlider = this.getIdName + "FontSizeSliderBar";
//   /** @desc 介面上，那個輸入值的 input text Id */
//   this.getIdText = this.getIdName + "FontSize";
//   // HebrewfontSizeTool
//   this.dom = $('#' + this.getId())
// }

// (function (root) {

//   // 這個函式，若放在外部， cache 時會無效
//   (function () {
//     FontSizeToolBase.prototype.getId = function () {
//       return this.getIdName + "fontSizeTool"
//     }
//     FontSizeToolBase.prototype.registerEvents = function (ps) {
//       var that = this
//       $('#' + that.getIdSlider).change(function () {
//         var domInput = $('#' + that.getIdSlider)
//         var sz = parseInt(domInput.val())

//         makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
//       });
//       $('#' + that.getIdText).change(function () {
//         var domInput = $('#' + that.getIdText)
//         var sz = parseInt(domInput.val())

//         makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
//       });
//       $('#' + that.getIdSmaller).click(function () {
//         var domInput = $('#' + that.getIdText)
//         var sz = parseInt(domInput.val())
//         sz -= 1

//         makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
//       });
//       $('#' + that.getIdLarger).click(function () {
//         var domInput = $('#' + that.getIdText)
//         var sz = parseInt(domInput.val())
//         sz += 1
//         makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
//       });
//       return; // end of register
//       function makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz) {
//         sz = sz > 60 ? 60 : sz
//         sz = sz < 6 ? 6 : sz

//         updatePageStateFontSize(sz)

//         $('#' + that.getIdText).val(sz)
//         $("#" + that.getIdSlider).val(sz)

//         updateFontSize()
//         fhlLecture.reshape(TPPageState.s)
//         return

//         function updateFontSize() {
//           // 更新 body --fontsize
//           // 字型大小，統一改用 --fontsize css 變數, line-height: 1.1em
//           if (that.isGreek()){
//             document.body.style.setProperty("--fontsize-greek", sz + "pt")
//           } else if (that.isHebrew()){
//             document.body.style.setProperty("--fontsize-hebrew", sz + "pt")
//           } else if (that.isStrongNumber()){
//             document.body.style.setProperty("--fontsize-sn", sz + "pt")
//           }
//         }
//         function updatePageStateFontSize(sz) {
//           if (that.isGreek()) { TPPageState.s.fontSizeGreek = sz }
//           else if (that.isHebrew()) { TPPageState.s.fontSizeHebrew = sz }
//           else if (that.isStrongNumber()) { TPPageState.s.fontSizeStrongNumber = sz }
//           updateLocalStorage()
//         }
//       }
//     }
//     FontSizeToolBase.prototype.getClassNameForJQueryToSetFontSize = function () {
//       if (this.isGreek()) { return '.hebrew-char' }
//       if (this.isHebrew()) { return '.greek-char' }
//       if (this.isStrongNumber()) { return '.sn' }
//       return undefined
//     }
//     /**
//      * 使用 name 是否 = Hebrew 字串
//      * 用在 render 時，載入初始值時
//      * 用在 大小變更後, 是變更 .hebrew-char 還是 .greek-char
//     */
//     FontSizeToolBase.prototype.isHebrew = function () {
//       return this.getIdName == 'Hebrew'
//     }

//     FontSizeToolBase.prototype.isGreek = function () {
//       return this.getIdName == 'Greek'
//     }
//     FontSizeToolBase.prototype.isStrongNumber = function () {
//       return this.getIdName == 'Sn'
//     }
//     /** 在 render 中使用 */
//     FontSizeToolBase.prototype.getSizeForInitial = function () {
//       if (this.isHebrew()) {
//         return TPPageState.s.fontSizeHebrew
//       } else if (this.isGreek()) {
//         return TPPageState.s.fontSizeGreek
//       } else if (this.isStrongNumber()) {
//         return TPPageState.s.fontSizeStrongNumber
//       }
//       return TPPageState.s.fontSize
//     }
//     FontSizeToolBase.prototype.render = function (ps, dom) {
//       var sz = this.getSizeForInitial()
//       var HorG = ''
//       if (this.isHebrew()) {
//         HorG = 'H'
//       } else if (this.isGreek()) {
//         HorG = 'G'
//       } else if (this.isStrongNumber()) {
//         HorG = 'SN'
//       }
//       var html = "<div>" + HorG + gbText("字大小", ps.gb) + ":</div>";
//       html += ' <div id="' + this.getIdSmaller + '" class="FontSizeButtonLargeSmaller">A<span>-</span></div>\
//                                   <div id="'+ this.getIdLarger + '" class="FontSizeButtonLargeSmaller">A<span>+</span></div>\
//                                   <div style="display: block; margin-top: 5px; height: 30px;">\
//                                       <input id="'+ this.getIdSlider + '" type="range" min="6" max="60" value="' + sz + '" step="1" style="width: 95px;"/>\
//                                       <input id="'+ this.getIdText + '" type="text" value="' + sz + '" style="width:2em;"/>\
//                                   </div>\
//                                   ';
//       dom.html(html);
//     }
//     FontSizeToolBase.prototype.init = function (ps, dom) {
//       this.dom = dom
//       this.render(ps, this.dom)
//       this.registerEvents(ps)
//     }
//   })()

//   root.FontSizeToolBase = FontSizeToolBase
// })(this)