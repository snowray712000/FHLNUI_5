/**
 * @param {string} name - "Hebrew" "Greek" "Sn" 之類的
 */
function FontSizeToolBase(name) {
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

(function (root) {

  // 這個函式，若放在外部， cache 時會無效
  (function () {
    FontSizeToolBase.prototype.getId = function () {
      return this.getIdName + "fontSizeTool"
    }
    FontSizeToolBase.prototype.registerEvents = function (ps) {
      var that = this
      $('#' + that.getIdSlider).change(function () {
        var domInput = $('#' + that.getIdSlider)
        var sz = parseInt(domInput.val())

        makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
      });
      $('#' + that.getIdText).change(function () {
        var domInput = $('#' + that.getIdText)
        var sz = parseInt(domInput.val())

        makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
      });
      $('#' + that.getIdSmaller).click(function () {
        var domInput = $('#' + that.getIdText)
        var sz = parseInt(domInput.val())
        sz -= 1

        makeSureBtw6And60AndUpdateOtherUIForSizeChanged(sz)
      });
      $('#' + that.getIdLarger).click(function () {
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
        fhlLecture.reshape(pageState)
        return

        function updateFontSize() {
          updateFontSizeWithClassName(that.getClassNameForJQueryToSetFontSize())
          function updateFontSizeWithClassName(className) {
            if (className === undefined) { return }
            $(className).css('font-size', sz + 'pt')
          }
        }
        function updatePageStateFontSize(sz) {
          if (that.isGreek()) { pageState.fontSizeGreek = sz }
          else if (that.isHebrew()) { pageState.fontSizeHebrew = sz }
          else if (that.isStrongNumber()) { pageState.fontSizeStrongNumber = sz }
          updateLocalStorage()
        }
      }
    }
    FontSizeToolBase.prototype.getClassNameForJQueryToSetFontSize = function () {
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
    FontSizeToolBase.prototype.isHebrew = function () {
      return this.getIdName == 'Hebrew'
    }

    FontSizeToolBase.prototype.isGreek = function () {
      return this.getIdName == 'Greek'
    }
    FontSizeToolBase.prototype.isStrongNumber = function () {
      return this.getIdName == 'Sn'
    }
    /** 在 render 中使用 */
    FontSizeToolBase.prototype.getSizeForInitial = function () {
      if (this.isHebrew()) {
        return pageState.fontSizeHebrew
      } else if (this.isGreek()) {
        return pageState.fontSizeGreek
      } else if (this.isStrongNumber()) {
        return pageState.fontSizeStrongNumber
      }
      return pageState.fontSize
    }
    FontSizeToolBase.prototype.render = function (ps, dom) {
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
    FontSizeToolBase.prototype.init = function (ps, dom) {
      this.dom = dom
      this.render(ps, this.dom)
      this.registerEvents(ps)
    }
  })()

  root.FontSizeToolBase = FontSizeToolBase
})(this)