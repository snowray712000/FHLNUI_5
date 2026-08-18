
var rfhlmap = null;
var layer = null;
var streetLayer = null;
var humanitarianLayer = null;
var fhlmap_engs_prev = ""; //防止同一章一直載入
var fhlmap_chap_prev = -1; //防止同一章一直載入
var fhlmap_titleId_prev = ""; //當切換成地圖以外功能,又切換回來的時候.要切換章才會顯示
var ptsAllForAutoZoom = []; // 一章載入後，所有的點資訊，作為 auto zoom 使用。
var markersLast = []; // 切換到下一章的時候，要清除掉上一章的所有 marker

function generateMap(idMapDiv) {
  var ptJerusalem = [31.786235, 35.202731]; //耶路撒冷
  var map = L.map(idMapDiv).setView(ptJerusalem, 8);
  if (layer == null) {
    // 預設使用地形圖，較適合聖經地理中的山地、河谷與高低差。
    layer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution:
        'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://opentopomap.org/">OpenTopoMap</a> (CC-BY-SA)'
    });
  }
  if (streetLayer == null) {
    streetLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
  }
  if (humanitarianLayer == null) {
    humanitarianLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        '&copy; <a href="https://www.hotosm.org/">Humanitarian OpenStreetMap Team</a>'
    });
  }

  layer.addTo(map);
  L.control.layers({
    '地形圖': layer,
    '一般地圖': streetLayer,
    'Humanitarian 高對比圖': humanitarianLayer
  }).addTo(map);

  return map;
}

function objpath2coordinate(objpathStr) {
  // 這是一個 float reg: /^-?\d+(\.\d+)?$/
  var re = []
  var reg = /(-?\d+(\.\d+)?), *(-?\d+(\.\d+)?)/g
  var tmp
  while ((tmp = reg.exec(objpathStr)) !== null) {
    var x = parseFloat(tmp[1])
    var y = parseFloat(tmp[3])
    re.push([x, y])
  }
  return re
}

function fhlmap_render(ps, dom) {
  /// <summary> 整合到 index 的 code 放在這裡, 可以集中上面的全域變數. 比較好理解 </summary>

  var dom2 = document.getElementById("fhlInfoContent");
  if (dom2 != null && rfhlmap == null || fhlmap_titleId_prev != "fhlInfoMap") {
    if (rfhlmap != null) // 切完功能回來, 若沒先 remove 掉原本的 map container 會出現錯誤
      rfhlmap.remove();
    rfhlmap = generateMap(dom2);
    fhlmap_chap_prev = -1; // 為了trigger 下面的 set 函式, 當「rfhlmap_titleId_prev != "fhlInfoMap"」時必須用到, 因為它重新create了
  }

  if (fhlmap_chap_prev != ps.chap || fhlmap_engs_prev != ps.bookIndex) {
    const bibleConstantHelper = BibleConstantHelperEs6Js()
    const engss = bibleConstantHelper.getBookNameArrayEnglishNormal()
    const engs = engss[ps.bookIndex - 1] // 轉成 engs

    fhl.json_api_text_post("sobj.php?engs=" + engs + "&chap=" + ps.chap + "&gb="+ps.gb, null, function (jstr) {
      var jr1 = JSON.parse(jstr);

      // remove 上次的結果
      markersLast.forEach(element => {
        element.remove()
      });
      markersLast = [];
      ptsAllForAutoZoom = [];

      // 正式開始處理
      var mymap = rfhlmap
      for (let i = 0; i < jr1.record.length; i++) {
        let a1 = jr1.record[i];
        if (a1.is_site == "1") {
          if (a1.otype == 0) {
            // sample - 地名
            let r1 = objpath2coordinate(a1.objpath);
            r1.forEach(element => {
              ptsAllForAutoZoom.push(element);
            });

            var marker = L.marker(r1[0])
            markersLast.push(marker);
            marker.addTo(mymap); // ex r1[0] = [23.12,41.5]
            marker.bindTooltip(a1.cname, {
              permanent: true,
              direction: 'top',
              opacity: 0.6,
            })
            mymap.setView(r1[0])
          } else if (a1.otype == 1) {
            // sample - 河流
            var r1 = objpath2coordinate(a1.objpath)
            r1.forEach(element => {
              ptsAllForAutoZoom.push(element);
            });

            var polyline = L.polyline(r1, {
              color: '#f02'
            }).addTo(mymap).bindTooltip(a1.cname, {
              permanent: true,
              direction: 'center',
              opacity: 0.6
            })
            markersLast.push(polyline);
          } else if (a1.otype == 2) {
            // sample - 區域
            var r1 = objpath2coordinate(a1.objpath)
            r1.forEach(element => {
              ptsAllForAutoZoom.push(element);
            });

            var polygon = L.polygon(r1, {
              color: '#f02',
              fillColor: '#5f3',
              fillOpacity: 0.5
            }).addTo(mymap).bindTooltip(a1.cname, {
              permanent: true,
              direction: 'center',
              opacity: 0.6
            })
            markersLast.push(polygon);
          }
        }
      }

      if (ptsAllForAutoZoom.length != 0)
        mymap.fitBounds(ptsAllForAutoZoom);
      // rfhlmap.set_data(jr1.record);
    }, function (er) {});
    fhlmap_engs_prev = ps.bookIndex
    fhlmap_chap_prev = ps.chap;
  }
}
