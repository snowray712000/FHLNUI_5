/// <reference path="../../jsdoc/jquery.js" />
/// <reference path="../../jsdoc/jquery-ui.js" />
/// <reference path="../../jsdoc/linq.d.ts" />
/// <reference path="../../ijnjs/ijnjs.d.ts" />

((root) => {
  testThenDoAsync(() => window.Ijnjs != undefined)
    .then(() => {
      var $ = Ijnjs.Libs.s.libs.$
      testThenDoAsync(() => $('#bible-version-dialog').length != 0)
        .then(() => {
          step1()
          root.BibieVersionDialog = BibieVersionDialog          
        })
    })

  return
  function BibieVersionDialog() { this.id = 'bible-version-dialog' }
  function step1() {
    var $ = Ijnjs.Libs.s.libs.$

    // langs 只管分類 (語言分組、年代 yr、cds、排序 od)，譯本名稱從 abvphp 拿 (abvphp_snapshot.js，npm run gen:uiabv)；
    // 只有 uiabv.php 沒列的譯本才寫 cna。gen:uiabv 會列出 API 有、這裡沒分類的譯本 (否則落到「其它」)
    var constants = {
      langs: [
        {
          na: 'ch', cna: '中文', od: 1, vers: [
            { na: 'cbol', cds: ['yrnow', 'pr', 'officer'] },
            { na: 'tcv2019', yr: 2019, cds: ['yrnow', 'pr', 'officer'] },
            { na: 'cccbst', yr: 2015, cds: ['yrnow', 'pr', 'officer'] },
            { na: 'cnet', yr: 2011, cds: ['yrnow', 'pr', 'study'] },
            { na: 'rcuv', yr: 2010, cds: ['yrnow', 'pr', 'officer'] },
            { na: 'csb', yr: 2008, cds: ['yrnow', 'pr', 'officer'] },
            { na: 'recover', yr: 2003, cds: ['yrnow', 'pr', 'officer'] },
            { na: 'tcv95', yr: 1995, cds: ['yrnow', 'pr', 'officer'] },
            { na: 'ncv', yr: 1992, cds: ['yrnow', 'pr', 'officer'] },
            { na: 'wcb', yr: 2023, cds: ['yrnow', 'pr', 'officer'] },
            { na: 'lcc', yr: 1970, cds: ['yrnow', 'pr', 'officer', 'officer'] },
            { na: 'ofm', yr: 1968, cds: ['yrnow', 'cc', 'officer'] },
            { na: 'cwang', yr: 1933, cds: ['pr', 'yr1960', 'officer'] },
            { na: 'cumv', yr: 1919, cds: ['pr', 'yr1960', 'officer'] },
            { na: 'unv', yr: 1911, cds: ['pr', 'yr1919', 'officer'] },
            { na: 'orthdox', yr: 1910, cds: ['ro', 'yr1919', 'ccht'], cna2: '東正教譯本新約與詩篇' },
            { na: 'cuwv', yr: 1907, cds: ['pr', 'yr1919', 'ccht'] },
            { na: 'wlunv', yr: 1906, cds: ['pr', 'yr1960', 'ccht'] },
            { na: 'cuwve', yr: 1906, cds: ['pr', 'yr1919', 'ccht'] },
            { na: 'ssewb', yr: 1902, cds: ['pr', 'yr1919', 'ccht'] },
            { na: 'pmb', yr: 1878, cds: ['pr', 'yr1919', 'officer'] },
            { na: 'deanwb', yr: 1870, cds: ['pr', 'yr1919', 'ccht'] },
            { na: 'hudsonwb', yr: 1867, cds: ['pr', 'yr1919', 'ccht'] },
            { na: 'wdv', yr: 1854, cds: ['pr', 'yr1919', 'ccht'] },
            { na: 'goddwb', yr: 1853, cds: ['pr', 'yr1919', 'ccht'] },
            { na: 'nt1864', yr: 1840, cds: ['pr', 'yr1850', 'ccht'] },
            { na: 'mormil', yr: 1823, cds: ['pr', 'yr1850', 'ccht'] },
            { na: 'marwb', yr: 1822, cds: ['pr', 'yr1850', 'ccht'] },
            { na: 'basset', yr: 1707, cds: ['pr', 'yr1800', "ccht"] },
            { na: 'cmxuhsb', yr: 1948, cds: ['pr', 'yr1960', "officer"] },
            { na: 'cwangdmm', yr: 1875, cds: ['pr', 'yr1919', "ccht"] },
            { na: 'cwhsiaosb', yr: 1949, cds: ['pr', 'yr1960', "officer"] },
            { na: 'cwmgbm', yr: 1837, cds: ['pr', '1837', "ccht"] },
            { na: 'cwfaubsb', yr: 0, cds: ['cc'] },
            { na: 'cwjdsb', yr: 0, cds: ['cc'] },
            { na: 'cwkfag', yr: 1838, cds: ['pr', 'yr1850', "ccht"] },
            { na: 'cwliwysb', yr: 1875, cds: ['pr', 'yr1919', "ccht"] },
            { na: 'cwmxb', yr: 1937, cds: ['pr', 'yr1919', "ccht"] },
            { na: 'cwont', yr: 0, cds: ['ro'] },
            { na: 'cwplbsb', yr: 0, cds: ['cc'] },
            { na: 'cwtaiping', yr: 1853, cds: ['pr', 'yr1919', "ccht"] },
            { na: 'cwwuchsb', cna: '吳經熊新經全集聖詠譯義', yr: 1946, cds: ['cc', 'yr1960', "ccht"] }, // uiabv.php 沒列，名稱寫在這裡
            { na: 'cxubinwsb', yr: 1899, cds: ['pr', 'yr1919', "ccht"] },
            { na: 'cogorw', yr: 0, cds: ['ro'] },
            { na: 'cogorw', yr: 0, cds: ['ro'] },
          ]
        },
        {
          na: 'en', cna: '英文', od: 3, vers: [
            { na: 'kjv', yr: 1611, od: 1 },
            { na: 'darby', yr: 1890, od: 3 },
            { na: 'bbe', yr: 1965, od: 5 },
            { na: 'erv', yr: 1987, od: 7 },
            { na: 'asv', yr: 1901, od: 9 },
            { na: 'web', yr: 2000, od: 11 },
            { na: 'esv', yr: 2001, od: 13 }
          ]
        },
        {
          na: 'hg', cna: '希伯來、希臘', od: 5, vers: [
            { na: 'bhs', od: 1 },
            { na: 'fhlwh', od: 3 },
            { na: 'lxx', od: 5 },
            { na: 'gnt6', od: 7 },
          ]
        },
        {
          na: 'fo', cna: '其它外語', od: 7, vers: [
            { na: 'vietnamese', od: 1 },
            { na: 'russian', od: 3 },
            // 今日發現印尼的著作權保護年限與台灣不同。台灣是50年，印尼是70年。為了不侵犯著作權，所以立即將印尼聖經下架，並請同工去洽詢印尼聖經公會授權的可能。新介面正在處理下架中
            // 已購買 印尼、韓文 譯本的授權
            { na: 'korean', od: 5 },
            { na: 'jp', od: 7 },
            { na: 'baru', od: 9 }, 
            { na: 'ind1958', od: 11 },
            { na: 'cvul', od: 13 },
            { na: 'nvul', od: 15 },
          ]
        },
        {
          na: 'mi', cna: '台語', od: 9, vers: [
            { na: 'ttvhl2021', od: 29 },
            { na: 'ttvcl2021', od: 27 },
            { na: 'ttvh', od: 3 },            
            { na: 'tte', od: 1 },
            { na: 'sgebklhl', od: 25 },
            { na: 'sgebklcl', od: 23 },
            { na: 'apskhl', od: 11 },
            { na: 'apskcl', od: 9 },
            { na: 'bklhl', od: 15 },
            { na: 'bklcl', od: 13 },
            { na: 'tghg', od: 17 },
            { na: 'prebklcl', od: 19 },
            // {na:'prebklhl',od:20,cna:'馬雅各漢羅'}, // 要廢棄的，因為目前漢羅轉換差異，沒辦法順利轉換
          ]
        },
        {
          na: 'ha', cna: '客語', od: 10, vers: [
            { na: 'thv2e', od: 5 },
            { na: 'thv12h', od: 7 },
            { na: 'hakka', od: 21 }
          ]
        },
        {
          na: 'in', cna: '台灣原住民語', od: 11, vers: [
            { na: 'rukai', od: 1 },
            { na: 'wanshandia', od: 19 },
            { na: 'maolindia', od: 21 },
            { na: 'tonadia', od: 23 },
            { na: 'tsou', od: 3 },
            { na: 'ams', od: 5 },
            { na: 'amis2', od: 7 },
            { na: 'ttnt94', od: 9 },
            { na: 'sed', od: 11 },
            { na: 'tru', od: 13 },
            { na: 'bunun', od: 15 },
            { na: 'tay', od: 17 },
            { na: 'pinuyan', od: 25 },
          ]
        },
        { na: 'ot', cna: '其它', od: 13, vers: [{ na: 'tibet', od: 1, cna: '藏語聖經' },] },
      ],
      chSubs: [
        { na: 'pr', cna: '基督新教' },
        { na: 'cc', cna: '羅馬天主教' },
        { na: 'ro', cna: '俄羅斯正教' },
        { na: 'officer', cna: '官話(白話文)' },
        { na: 'ccht', cna: '文理(文言文)' },
        { na: 'study', cna: '研讀本' },
        { na: 'yr1800', cna: '1800前' },
        { na: 'yr1850', cna: '1800-50' },
        { na: 'yr1919', cna: '1850-1918' },
        { na: 'yr1960', cna: '1919-60' },
        { na: 'yrnow', cna: '近代' },
      ],
      chSubBr: ['ro', 'study'],
    }

    var dlg$ = $('#bible-version-dialog')
    var selecteds$ = dlg$.find('.selecteds')
    var offens$ = dlg$.find('.offens')
    var sets$ = dlg$.find('.sets')
    var lang$ = dlg$.find('.lang')
    var chSubs$ = dlg$.find('.ch-subs')
    var flexCheckDefault$ = chSubs$.find('#flexCheckDefault')
    var chSub$ = dlg$.find('.ch-sub')
    var vers$ = dlg$.find('.vers')


    /**   
     * @param {{selects:string[];offens:string[];sets:string[][]}} jo 
     */
    var cbClosed = (jo) => { console.log(jo) }
    var setCallbackClosed = (cb) => cbClosed = cb
    var cbOpened = (jo) => { }
    var setCallbackOpened = (cb) => cbOpened = cb
    /**
     * @param {{na:string;cna:string}[]} vers 
     */
    var setVersionsFromApi = (vers) => {
      testThenDoAsync(() => vers$.find('.book-item').length != 0)
        .then(a1 => {
          replaceItems()
          return
          function replaceItems() {
            const others$ = vers$.children('.ot')
            const dictNa2Dom$ = Enumerable.from(vers$.find('.book-item')).toDictionary(a1 => $(a1).data('data').na, a1 => $(a1));

            // 強制不從 api更新 的譯本
            const ignore_nas = []; 

            // for each ver in vers
            for(const ver of vers) {
              if(ignore_nas.includes(ver.na)) {
                continue; // skip
              }

              let r1 = dictNa2Dom$.get(ver.na);
              if (r1 != null) {
                let dataori = r1.data('data'); // 可能包含 cds 其它資料
                dataori.cna = ver.cna;
                r1.data('data', dataori)
                  .text(ver.cna);
              } else {
                $('<span>', {
                  text: ver.cna,
                  class: 'book-item btn btn-outline-success',
                }).data('data', { na: ver.na, cna: ver.cna })
                  .appendTo(others$);
              }
            }
          }
        })
    }


    /**   
     * @param {{selects:string[];offens:string[];sets:string[][]}} jo 
     */
    var open = (jo) => {      
      defaultJo()
      dlg$.data('args', jo)
      dlg$.dialog('open')
      cbOpened({ dom$: dlg$ })
      return
      function defaultJo() {
        var def = {
          selects: ['unv'],
          offens: ['cbol', 'esv'],
          sets: [['unv', 'kjv', 'esv', 'cbol'], ['unv', 'esv']]
        }

        if (jo == undefined) { jo = {} }
        if (jo.selects == undefined) { jo.selects = g(def.selects) }
        if (jo.offens == undefined) { jo.offens = g(def.offens) }
        if (jo.sets == undefined) { jo.sets = g(def.sets) }

        return
        function g(ja) {
          /** @type {string[]} */
          var r = []
          for (var a of ja) { r.push(a) }
          return r
        }
      }
    }

    render()
    registerEvent()
    lang$.find('.lang-item').eq(0).trigger('click')
    chSub$.children().eq(0).trigger('click')
    
    dlg$.dialog({
      autoOpen: false,
      modal: true,
      position: {
        my: 'center top',
        at: 'center top',
      },
      closeOnEscape: true,
      close: function () {
        var jo = getSelectsAndOffensAndSets()
        cbClosed(jo)
      },
      open: function () {
        setWidthHeightAsync()
        initSelectsAndOffensWhenOpen()
        cbOpened()
        return
        function setWidthHeightAsync() {
          setTimeout(() => {
            var cy = $(window).height()
            var cx = $(window).width()

            // dlg$.dialog("option", "maxHeight", cy * 0.95)
            dlg$.dialog("option", "height", cy * 0.95)
            // dlg$.dialog("option", "maxWidth", cx * 0.95)
            dlg$.dialog("option", "width", cx * 0.95)
          }, 0);
        }
      }
    })

    BibieVersionDialog.prototype.setCallbackClosed = setCallbackClosed
    BibieVersionDialog.prototype.setCallbackOpened = setCallbackOpened
    BibieVersionDialog.prototype.open = open
    BibieVersionDialog.prototype.setVersionsFromApi = setVersionsFromApi
    BibieVersionDialog.s = new BibieVersionDialog() // static
    return // end (){}
    function render() {
      renderLang()
      renderChSub()
      renderItems()
      return
      function renderLang() {
        lang$.empty()
        constants.langs.map(a1 => {
          var r1 = $('<span />', {
            class: "btn btn-outline-dark lang-item",
            text: a1.cna,
          })
          r1.data('data', { na: a1.na, cna: a1.cna })
          return r1
        }).forEach(a1 => {
          a1.appendTo(lang$)
        })
      }
      function renderChSub() {
        chSub$.empty()
        constants.chSubs.map(a1 => {
          var r1 = $('<span>', {
            class: "btn btn-outline-info ch-sub-item",
            text: a1.cna,
          }).data('data', a1.na)
          return r1
        }).forEach(a1 => {
          a1.appendTo(chSub$)
          var r1 = a1.data('data')
          if (constants.chSubBr.includes(r1)) {
            chSub$.append($('<br/>'))
          }
        })
      }

      function renderItems() {
        vers$.empty()
        constants.langs.map(a1 => {
          var re = $('<div />', {
            class: 'group ' + a1.na
          })
          re.data('lang', a1.na)
          
          a1.vers.map(a2 => {
            a2.cna = window.abvphp?.get_cname_from_book?.(a2.na, false) || a2.cna || a2.na
            var r3 = $('<span/>', {
              text: a2.cna,
              class: 'book-item btn btn-outline-success',
            }).data('data', a2).attr('na', a2.na)
            return r3
          }).forEach(a2 => {
            re.append(a2)
          })
          return re
        }).forEach(a1 => {
          vers$.append(a1)
        })
      }

    }
    function registerEvent() {
      lang$.find('.lang-item').on('click', function () {
        var this$ = $(this)
        var isOrignal = this$.hasClass('active')
        if (isOrignal) {
          return
        }

        lang$.children().removeClass('active')
        this$.addClass('active')


        var lang = this$.data('data').na

        if (lang == 'ch') {
          chSubs$.show()
        } else {
          chSubs$.hide()
        }

        for (var a1 of vers$.children()) {
          if (lang != $(a1).data('lang')) {
            $(a1).hide()
          } else {
            $(a1).show()
          }
        }

        if (lang == 'ch') {
          flexCheckDefault$.trigger('change')
        }
      })

      addChineseSubOptions()

      flexCheckDefault$.on('change', function () {
        var isChk = $(this).is(":checked")
        if (isChk) {
          chSub$.show()
          filterChineses()
        } else {
          chSub$.hide()
          vers$.children('.ch').children().show() // true -> false, 全變 visible
        }
      })

      // selects 中的 help (清除所選)
      selecteds$.children('.group-help').on('click', function () {
        Enumerable.from(selecteds$.children('span')).reverse().select(a1 => $(a1).data('dom$')).forEach(a1 => a1.trigger('click'))
      })

      // offen 中的 help (清除常用)
      offens$.children('.group-help').on('click', function () {
        offens$.children('span').remove()
      })

      // sets 中的 help (清除常用)
      sets$.children('.group-help').on('click', function () {
        sets$.children('span').remove()
      })

      // selecteds$ 中的 span
      selecteds$.on({
        click: function () {
          $(this).data('dom$').trigger('click')
        }
      }, 'span')

      // offen 中的 span
      offens$.on({
        click: function () {
          $(this).data('dom$').trigger('click')
        }
      }, 'span')

      // sets$ 中的 span 
      sets$.on({
        click: function () {
          var this$ = $(this)
          Enumerable.from(selecteds$.children('span')).reverse().forEach(a1 => $(a1).trigger('click'))
          Enumerable.from(this$.data('dom$')).forEach(a1 => a1.trigger('click'))
        }
      }, 'span')

      // 任何一版本 vers 中的 .book-item
      vers$.on({
        click: function () {
          var this$ = $(this)
          this$.toggleClass('active')

          var data = this$.data('data')
          if (this$.hasClass('active')) {
            addItem(data, this)
          } else {
            removeItem(data, this)
          }
        }
      }, '.book-item')

      return
      /**
       * 
       * @param {{na:string;cna:string}} data 
       */
      function addItem(data, pthis) {
        addToSelected()
        removeIfOffenExist()
        return
        function addToSelected() {
          var r1 = $('<span>', {
            class: 'btn btn-outline-primary',
            text: data.cna
          }).data('data', data)
            .data('dom$', $(pthis))
            .appendTo(selecteds$)
        }
        function removeIfOffenExist() {
          var r1 = Enumerable.from(offens$.children('span'))
            .firstOrDefault(a1 => $(a1).data('data').na == data.na)
          if (r1 != undefined) { $(r1).remove() }
        }
        // <button type="button" class="btn btn-outline-primary">Primary</button>
      }
      /**
       * 
       * @param {{na:string;cna:string}} data 
       */
      function removeItem(data, pthis) {
        removeIfSelectedExist()
        addToOffens()
        return
        function removeIfSelectedExist() {
          var r1 = Enumerable.from(selecteds$.children('span'))
            .firstOrDefault(a1 => $(a1).data('data').na == data.na)
          if (r1 != undefined) { $(r1).remove() }
        }
        function addToOffens() {
          $('<span>', {
            class: 'btn btn-outline-secondary btn-sm',
            text: data.cna
          }).data('data', data)
            .data('dom$', $(pthis))
            .prependTo(offens$)
          offens$.children(':gt(10)').remove()
        }
      }
      function addChineseSubOptions() {
        // chSub$.children() 還包含 br , 這是易出錯的 bug
        var chSubOpts$ = chSub$.children('span')
        var optsSkip3$ = chSubOpts$.filter(':gt(2)')

        chSubOpts$.eq(0).on('click', function () {
          // 基督新教
          var isOri = $(this).hasClass('active')
          if (isOri == true) { return }

          setClass012(0)
          for (var a1 of [3, 4, 5, 10]) {
            chSubOpts$.eq(a1).addClass('active')
          }
          optsSkip3$.show()
          flexCheckDefault$.trigger('change')
        })
        chSubOpts$.eq(1).on('click', function () {
          // 天主教
          var isOri = $(this).hasClass('active')
          if (isOri == true) { return }

          setClass012(1)
          optsSkip3$.hide()
          flexCheckDefault$.trigger('change')
        })
        chSubOpts$.eq(2).on('click', function () {
          // 東正教
          var isOri = $(this).hasClass('active')
          if (isOri == true) { return }

          setClass012(2)
          optsSkip3$.hide()
          flexCheckDefault$.trigger('change')
        })
        optsSkip3$.on('click', function () {
          $(this).toggleClass('active')
          flexCheckDefault$.trigger('change')
        })
        return
        function setClass012(i) {
          for (var a of [0, 1, 2]) {
            if (a == i) {
              chSubOpts$.eq(a).addClass('active')
            } else {
              chSubOpts$.eq(a).removeClass('active')
            }
          }
        }
      }
      /** 被 checked box change 呼叫 */
      function filterChineses() {
        vers$.children('.ch').children().hide()

        var cds = getConditions()
        for (var a1 of vers$.children('.ch').children()) {
          var a1$ = $(a1)
          if (isFit()) {
            a1$.show()
          } else {
            a1$.hide()
          }
          continue;

          function isFit() {
            /** @type {string[]} */
            var r2 = a1$.data('data').cds
            for (var a2 of r2) {
              if (cds.includes(a2) == false) {
                return false
              } // 任一個條件不成立，則不顯示
            }
            return true
          }
        }

        return
        function getConditions() {
          /** @type {string[]} */
          var re = []
          for (var a1 of chSub$.children(".active")) {
            re.push($(a1).data('data'))
          }
          return re
        }
      }
    }
    function getSelectsAndOffensAndSets() {
      /** @type {string[]} */
      var selects = Enumerable.from(selecteds$.children('span'))
        .select(a1 => $(a1).data('data').na).toArray()

      /** @type {string[]} */
      var offens = Enumerable.from(offens$.children('span'))
        .select(a1 => $(a1).data('data').na).toArray()

      /** @type {string[][]} */
      var sets = Enumerable.from(sets$.children('span'))
        .select(a1 => Enumerable.from($(a1).data('data')).select(a2 => a2.na).toArray()).toArray()

      // 目前 offens 這組，是否要新增到「新的一組」、或交換順序 (順序不同，視為不同組)     
      addSetsToRecent()
      return {
        selects,
        offens,
        sets,
      }

      function addSetsToRecent() {
        var idx = findIndex()
        if (idx != -1) {
          sets.splice(idx, 1)
        }
        sets.unshift(selects)
        if (sets.length > 10) {
          sets.pop()
        }

        return
        function findIndex() {
          for (let i = 0; i < sets.length; i++) {
            var set = sets[i];
            if (set.length == selects.length) {
              if (Enumerable.range(0, set.length).all(i => set[i] == selects[i])) {
                return i
              }
            }
          }
          return -1
        }
      }
    }
    function initSelectsAndOffensWhenOpen() {
      var jo = getSelectsAndOffensFromArgs()

      selecteds$.children('span').remove()
      offens$.children('span').remove()
      sets$.children('span').remove()
      var r3 = vers$.find('.book-item')
      r3.removeClass('active')

      getWhereNa(jo.selects).forEach(a1 => a1.trigger('click'))
      getWhereNa(jo.offens).reverse().forEach(a1 => {
        $(a1).trigger('click')
        $(a1).trigger('click') // trigger 兩次就會被移到 常用了        
      })
      jo.sets.forEach(addEachSet)

      return
      function addEachSet(set) {
        var r1 = getWhereNa(set)
        var r2 = Enumerable.from(r1).select(a1 => a1.data('data')).toArray()
        var cnas = getText()
        var tooltip = Enumerable.from(r2).select(a1 => a1.cna).toArray().join(',')

        $('<span>', {
          text: cnas,
          class: 'btn btn-outline-secondary btn-sm',
          'data-toggle': "tooltip",
          'data-placement': "top",
          'title': tooltip
        }).data('data', r2)
          .data('dom$', r1)
          .tooltip()
          .appendTo(sets$)
        return
        function getText() {
          /** @type {string[]} */
          var nas = Enumerable.from(r2).select(a1 => a1.cna).toArray()
          var two = Enumerable.from(nas).select(a1 => a1.substr(0, 2)).toArray().join(',')
          // (4) 和合,ES,KJ,CV
          return '(' + nas.length + ')' + two
        }
      }
      function getWhereNa(names) {
        if (getWhereNa.prototype.dicts == undefined) {
          getWhereNa.prototype.dicts = Enumerable.from(r3).toDictionary(a1 => $(a1).data('data').na, a1 => $(a1))
        }
        /** @type {Enumerable.IDictionary<any, JQuery<HTMLElement>>} */
        var dicts = getWhereNa.prototype.dicts

        addNewItemNotInCode()

        return Enumerable.from(names).select(a1 => dicts.get(a1)).where(a1 => a1 != undefined)
        function addNewItemNotInCode() {
          // 當新的版本有的時候，但是還沒有改程式碼
          // 在使用者呼叫完 uiabv.php 的時候，他會呼叫 setVersionsFromApi
          // 那時候就會把版本加到 選項中了，但是，若他選了那個版本(不論成為常用，或是被選，下次開啟時)
          // 就仍然不存在{被選、常選中}
          Enumerable.from(names).where(a1 => dicts.get(a1) == undefined)
            .toArray()
            .forEach(a1 => {
              // insert item
              var r1 = $('<span>', {
                text: a1,
                class: 'book-item btn btn-outline-success',
              }).data('data', { na: a1, cna: a1 })
                .appendTo(vers$.children('.ot'))
              // insert to dict
              dicts.add(a1, r1)
            })
        }
      }
      /** @returns {{selects:string[];offens:string[];sets:string[][]}} */
      function getSelectsAndOffensFromArgs() {
        return dlg$.data('args') // assert , 
      }
    }
  }

})(this)
