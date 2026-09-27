
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

/**
 * 切離地圖分頁時呼叫。地圖建在 #fhlInfoContent 內的子 div，這裡把 map 與子 div 一起移除，
 * 否則 leaflet 的 wheel(preventDefault)、touch-action:none 會留著，其它分頁 (如註釋) 就無法捲動
 */
function fhlmap_dispose() {
  if (rfhlmap != null) {
    rfhlmap.remove();
    rfhlmap = null;
  }
  markersLast = [];
  var div = document.getElementById("fhlmapContainer");
  if (div != null) div.remove();
}

/**
 * 點地名 label 的選單：聖光聖經地理 (用和合本名 cname 最吻合，其查詢是「包含」比對，但不接受「•」)
 * @param {string} nameTrad 繁體和合本地名 (gb=1 時 cname 是簡體，聖光查不到，所以另取繁體)
 * @param {string} nameShow 顯示用地名
 */
function fhlmap_createLinksPopup(nameTrad, nameShow, ps) {
  var q = nameTrad.replace(/•/g, "");
  var bookShort = BibleConstantHelperEs6Js().getBookNameArrayChineseShort(false)[ps.bookIndex - 1]; // 聖光是繁體
  var hl = "https://biblegeography.holylight.org.tw/index/condensedbible_list?";
  var links = [
    ["聖光：查「" + q + "」", hl + new URLSearchParams({ name: q, range: "id" })],
    ["聖光：" + bookShort + " " + ps.chap + " 的所有地名", hl + new URLSearchParams({ select1: ps.bookIndex, select2: ps.chap, range: "id" })],
    ["Google：" + q + " " + bookShort + " " + ps.chap, "https://www.google.com/search?" + new URLSearchParams({ q: q + " " + bookShort + " " + ps.chap + " site:biblegeography.holylight.org.tw" })],
  ];
  var div = document.createElement("div");
  var title = document.createElement("b");
  title.textContent = nameShow;
  div.appendChild(title);
  links.forEach(function (a) {
    var el = document.createElement("a");
    el.textContent = a[0];
    el.href = a[1];
    el.target = "_blank";
    el.rel = "noopener";
    el.style.display = "block";
    div.appendChild(el);
  });
  return div;
}

/** 讓 permanent tooltip (label) 與圖形本身都可點，點了開 popup 選單 */
function fhlmap_bindLinks(layer, nameTrad, nameShow, ps) {
  layer.bindPopup(fhlmap_createLinksPopup(nameTrad, nameShow, ps));
  var tooltip = layer.getTooltip();
  var el = tooltip && tooltip.getElement();
  if (el == null) return;
  el.style.pointerEvents = "auto";
  el.style.cursor = "pointer";
  L.DomEvent.on(el, "click", function (e) {
    L.DomEvent.stop(e); // 不讓 map 收到 click (會把 popup 關掉)
    layer.openPopup(tooltip.getLatLng());
  });
}

function fhlmap_render(ps, dom) {
  /// <summary> 整合到 index 的 code 放在這裡, 可以集中上面的全域變數. 比較好理解 </summary>

  var dom2 = document.getElementById("fhlInfoContent");
  if (dom2 != null && rfhlmap == null || fhlmap_titleId_prev != "fhlInfoMap") {
    fhlmap_dispose(); // 切完功能回來, 若沒先 remove 掉原本的 map container 會出現錯誤
    // 不直接拿 #fhlInfoContent 當 map container (leaflet 會改它的 class 與事件)
    dom2.innerHTML = "<div id='fhlmapContainer' style='width:100%; height:100%;'></div>";
    rfhlmap = generateMap(document.getElementById("fhlmapContainer"));
    fhlmap_chap_prev = -1; // 為了trigger 下面的 set 函式, 當「rfhlmap_titleId_prev != "fhlInfoMap"」時必須用到, 因為它重新create了
  }

  if (fhlmap_chap_prev != ps.chap || fhlmap_engs_prev != ps.bookIndex) {
    const bibleConstantHelper = BibleConstantHelperEs6Js()
    const engss = bibleConstantHelper.getBookNameArrayEnglishNormal()
    const engs = engss[ps.bookIndex - 1] // 轉成 engs

    var chapNow = ps.chap, bookNow = ps.bookIndex;
    var api = function (gb) { return fhl.json_api_text_post("sobj.php?engs=" + engs + "&chap=" + ps.chap + "&gb=" + gb, null, function (t) { return t; }, null); };
    // 聖光只有繁體可查；簡體時另取一次繁體，以 id 對應繁體地名
    Promise.all([api(ps.gb), ps.gb == 1 ? api(0) : null]).then(function (rs) {
      if (chapNow != fhlmap_chap_prev || bookNow != fhlmap_engs_prev || rfhlmap == null) return; // 已切到別章或離開地圖
      var jr1 = JSON.parse(rs[0]);
      var tradNames = {};
      (rs[1] ? JSON.parse(rs[1]) : jr1).record.forEach(function (a) { tradNames[a.id] = a.cname; });

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
            fhlmap_bindLinks(marker, tradNames[a1.id] || a1.cname, a1.cname, ps)
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
            fhlmap_bindLinks(polyline, tradNames[a1.id] || a1.cname, a1.cname, ps)
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
            fhlmap_bindLinks(polygon, tradNames[a1.id] || a1.cname, a1.cname, ps)
            markersLast.push(polygon);
          }
        }
      }

      if (ptsAllForAutoZoom.length != 0)
        mymap.fitBounds(ptsAllForAutoZoom);
      // rfhlmap.set_data(jr1.record);
    }).catch(function (er) { console.error(er); });
    fhlmap_engs_prev = ps.bookIndex
    fhlmap_chap_prev = ps.chap;
  }
}
