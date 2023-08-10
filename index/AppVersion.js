// 定義 AppVersion class
(function (root) {
  // 放在 index.html 中，全域變數
  // var currentSWVer = "1.6.5.1";

  function AppVersion() {
    var that = this;
    this.getHtmlVersion = () => currentSWVer;
    this.getLastVersion = () => {
      var ver = "";
      $.ajax({ url: './app_versions.json', dataType: 'text', cache: false, async: false, success: cb })
      return ver;
      function cb(str) {
        var r1 = JSON.parse(str);
        ver = r1["nui"]["last"];
      }
    }
    this.testIsLastVersion = function () {
      return this.getHtmlVersion() == this.getLastVersion()
    };

    var _cntThisVersion = -1;
    this.getCntThisVersion = function () {
      if (_cntThisVersion == -1) {
        _cntThisVersion = getCntAndUpdateLocalStorage();
      }
      return _cntThisVersion;
      function getCntAndUpdateLocalStorage() {
        var kLastVersion = 'nui-version-last';
        var kCntThisVersion = 'nui-cnt-this-version';

        var verlast = localStorage.getItem(kLastVersion);
        if (verlast == null || currentSWVer == null) {
          setVersionFirstly();
          return 1;
        } else if (verlast != currentSWVer) {
          setVersionFirstly();
          return 1;
        }
        var cnt = getCntOrDefault0() + 1;
        localStorage.setItem(kCntThisVersion, cnt.toString())
        return cnt;

        function setVersionFirstly() {
          // 當 bug, 造成 swver 是 null, 不要更新
          if (currentSWVer != null) {
            localStorage.setItem(kLastVersion, currentSWVer);
            localStorage.setItem(kCntThisVersion, '1');
          }
        }
        function getCntOrDefault0() {
          var r1 = localStorage.getItem(kCntThisVersion);
          var r2 = r1 == null ? 0 : parseInt(r1);
          return r2;
        }
      }
    }


    this.setUpdateDialogVersion = function () {
      $(document).ready(() => {
        // document ready 才能用下面才引用的 Ijnjs
        testThenDoAsync({
          cbTest: $('#ver-old').length != 0,
          ms: 100
        }).then(() => {
          $('#ver-old').text(currentSWVer); // html 檔的版本
          var ver = that.getLastVersion(); // app_versions.json 中的版本
          $('#ver-new').text(ver)
        })
      })
    }

    this.addClickListVerionsInfosEvent = function () {
      $(document).ready(() => {
        testThenDoAsync({
          cbTest: () => $('#version-info-address').length != 0
        }).then(()=>{
          $('#version-info-address').click(function () {
            setDomVersionInfo();
          })
        })        
      })
      return;
      function setDomVersionInfo() {
        if ($('#version-info').children().length != 0) {
          return;
        }

        for (var it of getDataList()) {
          $('#version-info').append($(gHtml(it)));
        }
        $('#version-info').children(":odd").addClass("odd")

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
              console.log(url)
              return generateLink(url, gPicture(url))

              function getServerRootDirectory(img) {
                if (/https?:\/\//i.test(img)) {
                  return ''
                }

                console.log(location.pathname)
                var r1 = Ijnjs.Path.getDirectoryName(location.pathname)
                console.log(r1)
                return r1 + '/images/'
                return '../images/'
              }
              function generateLink(url, innerHtml) {
                return '<a href="' + url + '" target="_blank">' + innerHtml + '</a>'
              }
              function gImg(url) {
                return '<img src="' + url + '" alt="點擊觀看、"  height="120"></img>'
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
                  return '<video muted loop controls class="img-thumbnail" height="240">' +
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

    }
  };

  AppVersion.s = new AppVersion(); // static

  root.AppVersion = AppVersion; // exports
})(this);