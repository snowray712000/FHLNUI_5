/// <reference path="../libs/jsdoc/linq.d.ts" />
/// <reference path="../libs/jsdoc/jquery.js" />
/// <reference path="../libs/jsdoc/jquery-ui.js" />
/// <reference path="../libs/jsdoc/jquery.ui.touch-punch.js" />
/// <reference path="../libs/ijnjs/ijnjs.d.js" />

(function (root) {
  doLast5()
  doLast4()
  doLast3()
  doLast2()
  doLast1() 

  // 好用，大家用
  window.ajaxLoadAndDecompressJsonGz = ajaxLoadAndDecompressJsonGz

  // 載入 bible_fhlwh.json.gz
  if ( window.fhlwh_sn == undefined ){
    path = "./index/bible_fhlwh.json.gz"
    ajaxLoadAndDecompressJsonGz(path, function (joData){
      window.fhlwh_sn = joData["data"] // 這是一個 [book,chap,sec,bible_text]
    })
  }
  
  // 這 sn，有哪些同源字
  load_sd_same_to_global_variable_async()
  
  // 這 sn，在聖經出現幾次
  load_sd_cnt_to_global_variable_async()
  // 這卷書，某 sn 出現幾次 (較小，先載)
  load_sn_book_cnt_to_global_variable_async()
  // 這 sn，在這卷書出現的分佈
  load_sn_chap_cnt_to_global_variable_async()

  // 搜尋 #fhlMidBottomWindow .sn mouseenter mouseleave 事件使用，改變 sn 顏色
  let_sn_color_change_in_search_result()
  
})(this)

/**
 * 載入 gzipped JSON .json.gz 檔案並解壓縮
 * @param {string} url 檔案路徑
 * @param {function} successCallback 成功回呼函式，接收解壓縮後的 JSON 物件。若失敗，這內部會有 error log
 */
function ajaxLoadAndDecompressJsonGz(url, successCallback) {
  $.ajax({
    url: url,
    method: 'GET',
    processData: false,
    xhrFields: {
      responseType: 'arraybuffer'
    },
    success: function (data) {
      const decompressed = pako.ungzip(new Uint8Array(data), { to: 'string' });
      const jsonData = JSON.parse(decompressed);
      successCallback(jsonData);
    },
    error: function (jqxhr, textStatus, error) {
      console.error("取得 " + url + " 發生錯誤: " + textStatus + ", " + error);
    }
  });
}

function let_sn_color_change_in_search_result(){
  $('#fhlMidBottomWindow').on('mouseenter', '.sn', function () {
    var sn = $(this).attr('sn')
    var N = $(this).attr('N')
    pageState.snAct = sn
    pageState.snActN = N    
    
    SN_Act_Color.act_add(sn, N)
  }).on('mouseleave', '.sn', function () {
    SN_Act_Color.act_remove()
    pageState.snAct = ''
    pageState.snActN = -1
  })
}

function doLast5() {
  var caches = Ijnjs.cachesIndex
  Enumerable.from([
    'getAjaxUrl',
    'getBookFunc',
    'requestFullscreen',
    'registerEvents',
  ]).forEach(a1 => {
    function aaa() { eval(caches.getStr(a1)) }
    aaa.call(window)
  })
}
function doLast4() {
  // Toolbar 相關
  var caches = Ijnjs.cachesIndex
  Enumerable.from([
    'fhlToolBar',
    'help',
    'helpingPopUp',
    'windowControl',
    'bookSelect',
    'bookSelectPopUp',
    'bookSelectName',
    'bookSelectChapter',
  ]).forEach(a1 => {
    function aaa() { eval(caches.getStr(a1)) }
    aaa.call(window)
  })
}

function doLast3() {
  // Left Window 相關
  var caches = Ijnjs.cachesIndex
  Enumerable.from([
    'fhlLeftWindow',
    'settings',
    'snSelect',
    'gbSelect',
    'show_mode',
    'realTimePopUpSelect',
    'mapTool',
    'imageTool',
    'renderTsk',
    'SN_Act_Color',
    'parsing_render_top',
    'parsing_render_bottom_table',
    'SnBranchRender',
    'fontSizeTool',
  ]).forEach(a1 => {
    function aaa() { eval(caches.getStr(a1)) }
    aaa.call(window)
  })
}

function doLast2() {
  var caches = Ijnjs.cachesIndex
  Enumerable.from([
    'versionSelect',
    'docEvent',
    'viewHistory',
    'fhlMidWindow',
    'fhlLecture',
    'fhlMidBottomWindow',
    'fhlInfoContent',
    'parsingPopUp',
    'searchTool',
    'coreInfoWindowShowHide',
    'FontSizeToolBase',
    'charHG',
    'doSearch',
    'do_preach',
    'gbText',
    'updateLocalStorage',
    'triggerGoEventWhenPageStateAddressChange',
    'windowAdjust',
  ]).forEach(a1 => {
    function aaa() { eval(caches.getStr(a1)) }
    aaa.call(window)
  })
}
function doLast1() {
  addUrlChangedEvents()
  addViewHistoryEvents()
  removeHelpText()
  addVersionInfosDialog()
  return

  function addUrlChangedEvents() {
    $(function () {
      $(fhlUrlParameter).on('bible', function () {
        console.log('bible trigger')
        // console.log(fhlUrlParameter.bibleResult) // {book: 1, chap: 12, sec: 9}
        if (pageState != undefined) {
          pageState.chineses = FHL.CONSTANT.Bible.CHINESE_BOOK_ABBREVIATIONS[fhlUrlParameter.bibleResult.book - 1]
          pageState.engs = FHL.CONSTANT.Bible.ENGLISH_BOOK_ABBREVIATIONS[fhlUrlParameter.bibleResult.book - 1]
          if (fhlUrlParameter.bibleResult.book > 0) {

            pageState.bookIndex = fhlUrlParameter.bibleResult.book
            pageState.chap = fhlUrlParameter.bibleResult.chap >= 0 ? fhlUrlParameter.bibleResult.chap : 1
            pageState.sec = fhlUrlParameter.bibleResult.sec >= 0 ? fhlUrlParameter.bibleResult.sec : 1

            fhlLecture.render(pageState, fhlLecture.dom); // 內容
            bookSelect.render(pageState, bookSelect.dom); // 內容的 title
          }
        }
      }) // bible event
      $(window).trigger('hashchange')

      $(fhlLecture).on('chapchanged', function () {
        var bookEn = FHL.CONSTANT.Bible.ENGLISH_BOOK_SHORT_ABBREVIATIONS[pageState.bookIndex - 1]
        history.pushState(null, null, '#/bible/' + bookEn + '/' + pageState.chap)
      });
      $(fhlLecture).on('secchanged', function () {
        var bookEn = FHL.CONSTANT.Bible.ENGLISH_BOOK_SHORT_ABBREVIATIONS[pageState.bookIndex - 1];
        history.replaceState(null, null, '#/bible/' + bookEn + '/' + pageState.chap + '/' + pageState.sec)
      });
      $(fhlLecture).trigger('secchanged')

      $(bookSelectChapter).on('chapchanged', function () {
        var bookEn = FHL.CONSTANT.Bible.ENGLISH_BOOK_SHORT_ABBREVIATIONS[pageState.bookIndex - 1]
        history.pushState(null, null, '#/bible/' + bookEn + '/' + pageState.chap)
      })
    });
  }
  function addViewHistoryEvents() {
    $(function () {
      (function () {
        var _datas = [];
        var _idx = -1;

        function trigger_init() {
          $(document).trigger('vh_init', { datas: _datas, idx: _idx });
          trigger_vh_idxchanged();
          trigger_vh_itemschanged();
        }
        function trigger_vh_idxchanged() {
          $(document).trigger('vh_idxchanged', { datas: _datas, idx: _idx });
        }
        function trigger_vh_itemschanged() {
          $(document).trigger('vh_itemschanged', { datas: _datas, idx: _idx });
        }

        // callback
        // viewHistory主界面, 按下其中一個選項的時候, 觸發 idx changed
        viewHistory.when_liclick(function (e, p1) {
          _idx = p1.idx;
          trigger_vh_idxchanged();
        });
        // viewHistory主界面, 按下清除所有的時候, 觸發 items changed
        viewHistory.when_clearall(function (e) {
          _datas = [_datas[0]];
          _idx = 0;
          trigger_vh_itemschanged();
        });
        // 當別的地方切換章節的時候, 要新增到 datas, 並觸發事件
        docEvent.when_go(function (e, p1) {
          if (_idx == -1) {
            _datas = pageState.history;
            _idx = 0;
            trigger_init();
          }
          // 若只是「切換節」而不是「書卷或是章」，就不處理
          else if (_datas[_idx].chap != p1.chap || _datas[_idx].chineses != p1.chineses) {
            // 清空 idx 前
            var a1 = _datas.slice(_idx, _datas.length);
            a1.unshift(p1);
            _datas = a1;
            _idx = 0;

            trigger_vh_itemschanged();
          }
        });
        // 當 history 改變的時候, 要儲存 ps (其實這個不知道放到哪個class較好, 就先放在這)
        docEvent.when_vh_itemschanged(function (e, p1) {
          pageState.history = p1.datas;
          setBook(pageState, pageState.chineses);
          localStorage.setItem("fhlPageState", JSON.stringify(pageState));
        });
        // 當 fhlLecture 中的 back click 或 nextclick 被按的時候
        fhlLecture.when_bclick_or_nclick(function () {
          if (_idx < _datas.length - 1) {
            _idx++;
            trigger_vh_idxchanged();

            // 下面是原本的code 還沒完全被取代掉 (切換章節,卻不送出go event)
            var ps = pageState;
            setBook(ps, _datas[_idx].chineses);
            ps.chap = _datas[_idx].chap;
            ps.sec = 1;
            //setPageState(ps); // 不要 trigger 出 'go'
            bookSelect.render(ps, bookSelect.dom);
            fhlInfo.render(ps, fhlInfo.dom);
            fhlLecture.render(ps, fhlLecture.dom);
          }
        }, function () {
          if (_idx > 0) {
            _idx--;
            trigger_vh_idxchanged();

            // 下面是原本的code 還沒完全被取代掉 (切換章節,卻不送出go event)
            var ps = pageState;
            setBook(ps, _datas[_idx].chineses);
            ps.chap = _datas[_idx].chap;
            ps.sec = 1;
            //setPageState(ps); // 不要 trigger 出 'go'
            bookSelect.render(ps, bookSelect.dom);
            fhlInfo.render(ps, fhlInfo.dom);
            fhlLecture.render(ps, fhlLecture.dom);
          }
        });
        // 等待 ps.history ok 就觸發觸始化
        (function () {
          function tryit() {
            if (pageState == null || pageState.history == null || pageState.history.length == 0)
              setTimeout(tryit, 777);//try it again
            else
              triggerGoEventWhenPageStateAddressChange(pageState)              
          }
          setTimeout(tryit, 777);
        })();

        // 模擬 1
        //_datas.push({ chineses: '創', chap: 1 });
        //_datas.push({ chineses: '出', chap: 1 });
        // _idx = 0;
        // trigger_init();

        // 模擬 2
        //setTimeout(function () {
        //  _idx = 1;
        //  trigger_vh_idxchanged();
        //}, 2000);

        // 模擬 3
        //setTimeout(function () {
        //  _datas.push({ chineses: '創', chap: 3 });
        //  _idx = 0;

      })();
    });
  }
  function removeHelpText() {
    /* 改由 after 來寫 ? 所以，padding 可一致 */
    testThenDoAsync(() => $('#help').length != 0 && $('#help').text().length != 0)
      .then(() => {
        $('#help').html('') // 清除掉原本的 ?         
      })
  }
  function addVersionInfosDialog() {
    // 會動態載入 .css 檔 (open時才會)
    // 會動態讀入 app_versions.json 資訊 (open時)
    testThenDoAsync(() => $('#title').length != 0)
      .then(() => {
        {
          var r1 = $('#title').children().first()
          var r3 = $('<div id="version-infos"><div class="contents"></div></div>')
          r1.append(r3)
          r1.css({ "color": 'blue', "text-decoration": "underline", "cursor": "pointer" })

          var cy = $(window).height()
          var cx = $(window).width()
          r3.dialog({
            autoOpen: false,
            resizable: true,
            maxHeight: cy,
            width: cx * 0.9,
            title: 'NUI版本更新資訊',
            modal: true,
            position: {
              my: 'center top',
              at: 'center top',
            },
            show: {
              effect: 'highlight'
            },
            open: function (event, ui) {
              var r4 = r3.find('.contents')
              if (r4.children().length == 0) {
                setDomVersionInfo()
                Ijnjs.loadCssSync('index/version-infos-dialog.css')
              }
              return;
              function setDomVersionInfo() {
                if (r4.children().length != 0) {
                  return;
                }

                for (var it of getDataList()) {
                  r4.append($(gHtml(it)));
                }
                r4.children(":odd").addClass("odd")

                return;
                function getDataList() {
                  var jo = getJoAppVersion()

                  return jo.nui.historys
                  function getJoAppVersion() {
                    var re = {
                      nui: {
                        last: '',
                        historys: [{ na: '', na2: ['', ''], img: [''] }, { na: '', na2: [''] }]
                      },
                      rwd: {
                        last: ''
                      }
                    }
                    $.ajax({ url: 'app_versions.json', dataType: 'text', async: false, cache: false, success: cb })
                    return re
                    function cb(str) {
                      re = JSON.parse(str)
                    }
                  }
                }

                function gHtml(it) {
                  function isNullOrEmpty(str) {
                    return str === undefined || str.length === 0;
                  }

                  function gArrayList_UlLi(array) {
                    if (Array.isArray(array)) {

                      var r4a = it.na2.map(function (a1) {
                        return '<li>' + a1 + '</li>';
                      }).join('');
                      return re = '<span><ul>' + r4a + '</ul></span>';
                    } else {
                      return undefined;
                    }
                  }
                  // <div>
                  // <span>200529a_點擊節_工具隨著變</span>
                  // youtube、示意圖、
                  // xxxxxxxxxxxxxx<br/>xxxxxxxx
                  // </div>
                  var na = it.na;
                  var r1 = '<span class="na">' + na + '</span><br/>';
                  var r2 = !isNullOrEmpty(it.yt) ? ('<a href="' + it.yt + '" target="_blank">youtube、</a>') : '';
                  // var r3 = !isNullOrEmpty(it.img) ? ('<a href="' + it.img + '" target="_blank">示意圖、</a>') : '';
                  var r3 = doImgs(it.img)
                  var r23 = r2 + r3;
                  if (!isNullOrEmpty(r23)) r23 += '<br/>';

                  var r4 = !isNullOrEmpty(it.na2) ? ('<span class="na2">' + it.na2 + '</span>') : '';
                  if (Array.isArray(it.na2))
                    r4 = gArrayList_UlLi(it.na2);
                  // console.log(r4);

                  return '<div>' + r1 + r23 + r4 + '</div>';

                  /**
                   * 
                   * @param {string|string[]|undefined} imgs 
                   * @returns 
                   */
                  function doImgs(imgs) {
                    if (imgs === undefined) { return '' }
                    // <a href="xxxxx.jpg" target="_blank">示意圖、</a>
                    if (Array.isArray(imgs)) {
                      return imgs.map(doImg).join('')
                    } else if (typeof imgs === 'string') {
                      return doImg(imgs)
                    }
                    return ''

                    function doImg(img) {
                      var url = getServerRootDirectory(img) + img
                      var r2 = generateLink(url, gPicture(url))
                      return r2

                      function getServerRootDirectory(img) {
                        if (/https?:\/\//i.test(img)) {
                          return ''
                        }
                        var r1 = Ijnjs.Path.getDirectoryName(location.pathname)
                        return r1 + '/images/'
                      }
                      function generateLink(url, innerHtml) {
                        return '<a href="' + url + '" target="_blank">' + innerHtml + '</a>'
                      }
                      function gImg(url) {
                        return '<img src="' + url + '" alt="點擊觀看、"  style="height: 8rem;"></img>'
                      }
                      function gPicture(url) {
                        // https://www.infoq.cn/article/animated-gif-without-the-gif

                        var ext = Ijnjs.Path.getExtension(url)
                        if (/(gif)|(mov)|(mp4)/i.test(ext)) {
                          // var r2 = $('<picture></picture>')                  
                          // var mov = Ijnjs.Path.changeExtension(url, '.mov')
                          // var mp4 = Ijnjs.Path.changeExtension(url, '.mp4')
                          // var gif = Ijnjs.Path.changeExtension(url, '.gif')
                          // $('<source type="video/mp4" srcset="' + mp4 + '">').appendTo(r2)
                          // $('<source type="video/mov" srcset="' + mov + '">').appendTo(r2)
                          // $(gImg(gif)).appendTo(r2)
                          // return r2[0].outerHTML
                          // console.log( navigator.userAgent )
                          if (/firefox/i.test(navigator.userAgent)) {
                            return '點擊觀看影片' // firefox 無法正確播放，很怪。
                          }

                          var mp4 = Ijnjs.Path.changeExtension(url, '.mp4')
                          var mov = Ijnjs.Path.changeExtension(url, '.mov')
                          return '<video muted loop controls class="img-thumbnail">' +
                            '<source src="' + mp4 + '" type="video/mp4" />' +
                            '<source src="' + mov + '" type="video/mov" />' +
                            // '<p>Your browser doesnt support HTML5 video. Here is a <a href="' + url + '">link to the video</a> instead.</p>' + 
                            '</video>'
                        } else {
                          var r2 = $('<picture></picture>')
                          $(gImg(url)).appendTo(r2)
                          return r2[0].outerHTML
                        }
                      }

                    }
                  }
                }
              }

            },
          });
          $(r1).click(() => {
            r3.dialog("open")
          })
        }
      })

  }
}


function load_sd_same_to_global_variable_async(){                        
  // sd_same.json 是 同源字 用途
  if ( window.sd_same == undefined ){
    const path = "./index/sd_same.json.gz"
    ajaxLoadAndDecompressJsonGz(path, function (joData){
      window.sd_same = joData // {hebrew, greek}
      // 而每個都是 {sn: [sn]}
    })
  }
}

function load_sd_cnt_to_global_variable_async()
{
  // sd_cnt.json 是 聖經出現次數 用途
  if ( window.sd_cnt == undefined ){
    const path = "./index/sd_cnt.json.gz"
    ajaxLoadAndDecompressJsonGz(path, function (joData){
      window.sd_cnt = joData // {hebrew, greek}
      // 而每個都是 {sn: int}
    })
  }
}
function load_sn_book_cnt_to_global_variable_async(){
  // sn: strong number 
  // cnt: count
  // book: in bible book, 1based
  // unv: 從和合本分析的
  if ( window.sn_cnt_book_unv == undefined )
  {
    // sn_cnt_book_unv_min.json 是 在此卷書 出現次數功能
    const path = "./index/sn_cnt_book_unv_min.json.gz"
    ajaxLoadAndDecompressJsonGz(path, function (joData){
        window.sn_cnt_book_unv = joData
    })
  }
}
function load_sn_chap_cnt_to_global_variable_async(){
  // sn: strong number
  // cnt: count
  // chap: in bible chapter, 1based
  // unv: 從和合本分析的
  if ( window.sn_cnt_chap_unv == undefined ){
    // sn_cnt_chap_unv_min.json 是 每章的分佈次數 
    const path = "./index/sn_cnt_chap_unv_min.json.gz"
    ajaxLoadAndDecompressJsonGz(path, function (joData){
        window.sn_cnt_chap_unv = joData
    })
  }
}
