/// <reference path="../libs/jquery-1.11.3.js" />
/// <reference path="../libs/jquery-ui.js" />
/// <reference path="../libs/react/react-0.13.1.min.js" />
/// <reference path="../libs/react/react-with-addons-0.13.1.min.js" />
/// <reference path="../libs/linq.js_ver2.2.0.2/linq.min.js" />
/// <reference path="../libs/linq.js_ver2.2.0.2/jquery.linq.min.js" />
/// <reference path="../libs/linq.js_ver2.2.0.2/linq-vsdoc.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?signed_in=true" />

var fhlmap = fhlmap || {};
fhlmap.R = fhlmap.R || {
  gmap: React.createClass({
    auto_zoom: function () {
      /// <summary> 設計由外部按鈕呼叫 </summary>
      var isempty = true;
      var bound = new google.maps.LatLngBounds();
      var pthis = this;
      Enumerable.from(this.state.datas).ForEach(function (a1, i1) {
        var jo = a1.Value;
        var marker = jo["marker"];
        if (marker != null) {
          isempty = false;
          bound.extend(marker.getPosition());
        }
      });
      if (isempty == false)
        this._map.fitBounds(bound);
    },
    set_ishold_data: function (ishold) {
      this._ishold = ishold;
    },
    _ishold: false,
    bind_on_btw_polyline_over: function (pfn) {
      /// <summary> 將函式指標丟進來, 依次呼叫. 會傳 .na1 .na2 .dist </summary>
      this._on_btw_polyline_over.push(pfn);
    },
    _on_btw_polyline_over: [],/// <summary> 使用 bind_on_btw_polyline_over </summary>
    _trigger_btw_polyline_over: function (param) {
      /// <summary> 可供外部使用, 例如用一行文字顯示它們的兩端是哪兩個 </summary>
      /// <param type="{}" name="id" parameterArray="false"> {btwkey:"34_512"} </param>
      var ids = param.btwkey.split('_');
      var data1 = this.state.datas[ids[0]];
      var data2 = this.state.datas[ids[1]];
      var btwdata = this.state.btwdatas[param.btwkey];

      var bb = btwdata.polyline.getPath();
      var aa = google.maps.geometry.spherical.computeLength(bb);
      var param2 = {
        "na1": data1.c1name,
        "na2": data2.c1name,
        "dist": aa
      };
      if (this._on_btw_polyline_over.length == 0) {
        console.log(param2);
      }
      else {
        for (var idx in this._on_btw_polyline_over)
          this._on_btw_polyline_over[idx](param2);
      }

    },
    set_active: function (id) {
      /// <summary> 這個通常是地圖內部 click marker 呼叫, 但也可以外部呼叫, 因為將來還要作, active 會與所有的算距離, 所以active 只允許同時間1個. </summary>
      /// <param type="Int" name="id" parameterArray="false"> 這個地圖物件的id </param>

      var pthis = this;
      var btwdatas = this.state.btwdatas;
      var datas = this.state.datas;
      var btw_active = []; //目 active 有關的 btwkey ["1_254", "1_521"]
      if (id != "-1") {
        var lqdatas = Enumerable.from(datas);
        lqdatas.ForEach(function (a1, i1) {
          var active_marker = datas[id.toString()]["marker"];
          if (a1.Key != id.toString()) {
            var btwkey = (id < parseInt(a1.Key)) ? id.toString() + "_" + a1.Key : a1.Key + "_" + id.toString();
            btw_active.push(btwkey);

            if (btwdatas[btwkey] == null) {
              var btwobj = {};
              btwdatas[btwkey] = btwobj;

              var path = [];
              path.push(active_marker.getPosition());
              path.push(datas[a1.Key]["marker"].getPosition());

              if (datas[a1.Key]["marker"].getPosition() == null) {
                console.debug("地圖資料庫可能有誤");
                console.log(datas[a1.Key]); //士師記 摩西被判定為地名. (不要在click mark才能知道, 在 列舉的時候就該知道. 它的objpath 的 array length = 0 
                return;
              }

              var polyline = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeOpacity: 0.4,
                strokeColor: "#007700",
                //editable: true,
                strokeWeight: 7
                //map: pthis._map
              });

              btwobj["polyline"] = polyline;

              var isdown = false;
              var tmr = null;//timer , 若mouse up啟動後, 在 down 的時候, 就再把它cancel掉
              polyline.addListener('mouseover', function (a1) {

                pthis._trigger_btw_polyline_over({ btwkey: btwkey });

                polyline.setOptions({ 'editable': true });
              });
              polyline.addListener('mouseout', function (a1) {
                if (isdown == false)
                  polyline.setOptions({ 'editable': false });
              });
              polyline.addListener('mousedown', function (a1) {
                isdown = true;
                if (tmr != null)
                  clearTimeout(tmr);
              });
              polyline.addListener('mouseup', function (a1) {
                tmr = setTimeout(function () {
                  isdown = false;
                  iscanceltimer = false;
                  pthis._trigger_btw_polyline_over({ btwkey: btwkey });
                  polyline.setOptions({ 'editable': false });
                }, 5000);
              });
              polyline.addListener('rightclick', function (a1) {
                if (a1.vertex == null)
                  return;//右鍵不是按在控制點上

                if (a1.vertex == 0)
                  return;// 不移除端點

                var path = polyline.getPath();
                if (path.getLength() - 1 == a1.vertex)
                  return;//不移除端點

                path.removeAt(a1.vertex);
              });
            }
          }
        });
      }

      if (this.state.id_active != id.toString())
        this.setState(
          {
            "id_active": id.toString(),
            "btwdatas": btwdatas,
            "btw_active": btw_active
          });
      else if (this.state.id_active == id.toString())
        this.setState(
          {
            "id_active": "-1",
            "btwdatas": btwdatas,
            "btw_active": btw_active
          });//若一樣(再點一次),則取消active
    },
    _clear: function () {
      /// <summary> 被 set_data 呼叫, 若不是 hold 住, 就清掉目前所有資料 </summary>
      for (var i in this.state.datas) {
        var pdata = this.state.datas[i];
        if (pdata.marker != null) {
          pdata.marker.setMap(null);
          pdata.marker = null;
        }
        if (pdata.polyline != null) {
          pdata.polyline.setMap(null);
          pdata.polyline = null;
        }
        if (pdata.polygon != null) {
          pdata.polygon.setMap(null);
          pdata.polygon = null;
        }
      }

      // btws 物件
      for (var i in this.state.btwdatas) {
        var pdata = this.state.btwdatas[i];
        if (pdata.marker != null) {
          pdata.marker.setMap(null);
          pdata.marker = null;
        }
        if (pdata.polyline != null) {
          pdata.polyline.setMap(null);
          pdata.polyline = null;
        }
        if (pdata.polygon != null) {
          pdata.polygon.setMap(null);
          pdata.polygon = null;
        }
      }
      this.setState({
        datas: {},
        btwdatas: {},
        id_active: "-1",
        btw_active: "-1_-1"
      });
    },
    set_data: function (datas) {
      /// <summary> 得到 sobj 查詢資料, 用這個來更新資料, 通常是外部呼叫 </summary>
      /// <param type="JSON" name="datas" parameterArray="false"> sobj 查詢的結果 </param>
      var pthis = this;

      // clear all
      if (this._ishold == false)
        this._clear();

      //var datas2={};
      var isChanged = false;
      var datas2 = this.state.datas;
      Enumerable.from(datas).where(a1=>a1.is_site==1).forEach(function (a1, i1) {
        if (datas2[a1.id.toString()] != null)
          return;// 已經存在
        isChanged = true;

        var jo = {};

        // objpaths
        {
          var objpath = [];
          jo["objpath"] = objpath;
          var tmp1s = Enumerable.from(a1.objpath.split(",")).select(function (aa1) { return parseFloat(aa1); }).ToArray();
          for (var i in tmp1s) {
            if (i % 2 == 1)
              objpath.push(new google.maps.LatLng(tmp1s[i - 1], tmp1s[i]));
          }

          if (objpath.length == 0) {
            console.debug("地圖資料庫可能有誤");
            console.log(a1); //士師記 摩西被判定為地名. (不要在click mark才能知道, 在 列舉的時候就該知道. 它的objpath 的 array length = 0 
            return;
          }
        }

        

        // mark
        {
          var paths = jo["objpath"];
          var position = paths[0];
          if (a1.otype == 1)//polyline, 在線中點(20就取第10點)
          {
            position = paths[Math.floor(paths.length / 2)];
          }
          else if (a1.otype == 2)//polygon , 在中間
          {
            var bound = new google.maps.LatLngBounds();
            for (var i in paths)
              bound.extend(paths[i]);
            position = bound.getCenter();
          }
          "".substr(0, "".length < 2 ? "".length : 2);

          var marker = new google.maps.Marker(
            {
              position: position,
              //map: pthis._map, //再用 set來打開
              label: a1.c1name.substr(0, a1.c1name.length < 2 ? a1.c1name.length : 2)
            });
          jo["marker"] = marker;

          // 成為 active 
          marker.addListener("click", pthis.set_active.bind(pthis, a1.id));

          // infowindow
          marker.addListener('click', function () {
            var txt = a1.c1name + ((a1.otype == 2) ? "地區" : "");
            var infowindow = new google.maps.InfoWindow({
              content: txt
            });
            infowindow.open(pthis._map, marker);

            setTimeout(function () {
              infowindow.close();
            }, 1200);
          });
        }

        // polyline (創世記第2章)
        if (a1.otype == 1) {
          jo["polyline"] = new google.maps.Polyline(
            {
              path: jo["objpath"],
              optimized: false,
              zIndex: 0, //0以下(包含), 才能夠使 polyline 的mousemove 有效, 也測試過疊合的部分不會因為就畫的醜掉 (marker設一樣的zindex就會醜掉)
              //map: pthis._map, //再用 set來打開
              geodesic: true
            });

          // 成為 active 
          jo["polyline"].addListener("click", pthis.set_active.bind(pthis, a1.id));

          // infowindow
          jo["polyline"].addListener('click', function () {
            var txt = a1.cname + ((a1.otype == 2) ? "地區" : "");
            var infowindow = new google.maps.InfoWindow({
              content: txt
            });
            infowindow.open(pthis._map, marker);

            setTimeout(function () {
              infowindow.close();
            }, 1200);
          });
        }
        // polygon
        if (a1.otype == 2) {
          var dis = google.maps.geometry.spherical.computeLength(jo["objpath"]);
          var zindex = Math.ceil(-dis); // 士師記5章, 當polygon重疊時, 拿弗他利面績較小, 應該被選到, 以色列地區面積大.
          jo["polygon"] = new google.maps.Polygon(
            {
              path: jo["objpath"],
              optimized: false,
              zIndex: zindex, //0以下(包含), 才能夠使 polyline 的mousemove 有效, 也測試過疊合的部分不會因為就畫的醜掉 (marker設一樣的zindex就會醜掉)
              //map: pthis._map, //再用 set來打開
              geodesic: true
            });

          // 成為 active 
          jo["polygon"].addListener("click", pthis.set_active.bind(pthis, a1.id));

          // infowindow
          jo["polygon"].addListener('click', function () {
            var txt = a1.cname + ((a1.otype == 2) ? "地區" : "");
            var infowindow = new google.maps.InfoWindow({
              content: txt
            });
            infowindow.open(pthis._map, marker);

            setTimeout(function () {
              infowindow.close();
            }, 1200);
          });
        }

        // infowindows 需要的 data
        if (a1.cname != null)
          jo.cname = a1.cname;
        if (a1.c1name != null)
          jo.c1name = a1.c1name;
        if (a1.ename != null)
          jo.ename = a1.ename;
        if (a1.mname != null)
          jo.mname = a1.mname;

        datas2[a1.id.toString()] = jo;
      });

      if (isChanged) //提高效率
        this.setState({ datas: datas2 });
    },
    getInitialState: function () {
      return {
        "datas": {},
        "id_active": "-1",
        "btwdatas": {},
        "btw_active": []
      };
    },
    componentDidMount: function () {
      var thisdom = this.getDOMNode();
      this._map = new google.maps.Map(thisdom, {
        center: { lat: 31.786235, lng: 35.202731 },// 耶路撒冷
        zoom: 7
      });
    },
    render: function () {
      var pthis = this;

      // markers
      Enumerable.from(this.state.datas).ForEach(function (a1) {
        var jo = a1.Value;
        if (jo.marker != null) {
          jo.marker.setMap(pthis._map);
          jo.marker.setOptions({ "optimized": false, "zIndex": parseInt(a1.Key) });
        }
        if (jo.polyline != null)
          jo.polyline.setMap(pthis._map);
        if (jo.polygon != null) {
          jo.polygon.setMap(pthis._map);
          jo.polygon.setOptions({
            strokeWeight: 0.5,
            strokeColor: "#000000"
          }); //先所有還原成黑色,下面再把active設為藍色
        }
      });

      // btws
      Enumerable.from(this.state.btwdatas).ForEach(function (a1) {
        var jo = a1.Value;
        if (jo.polyline != null) {
          jo.polyline.setMap(null);
        }
      });

      // id_active
      if (this.state.datas[this.state.id_active] != null) {
        // marker 變 zIndex
        var jo = this.state.datas[this.state.id_active];
        if (jo.marker != null) {
          jo.marker.setOptions({ "optimized": false, "zIndex": 99999 });
        }

        // polygon 變 色框
        if (jo.polygon != null) {
          jo.polygon.setOptions({
            strokeWeight: 2,
            strokeColor: "#0000FF"
          }); //先所有還原成黑色,下面再把active設為藍色
        }

        // 距離 polyline show
        var btwacts = this.state.btw_active;
        Enumerable.from(btwacts).ForEach(function (a1, i1) {
          var jbtw = pthis.state.btwdatas[a1];
          if (jbtw == null)
            return;
          jbtw["polyline"].setMap(pthis._map);
        });

      }

      return React.createElement("div", { "style": { "width": "100%", "height": "100%" } }, "gmap");
    }
  }),
  top: React.createClass({
    _click_help: function(){
      this.setState({ isShowHelp: !this.state.isShowHelp });
    },
    set_text: function (txt) {
      this.setState({ "info": txt,"isShowHelp":false });
    },
    getInitialState: function () {
      return { "info": "(距離資料)" };
    },
    render: function () {

      var rbr = React.createElement("br", {});

      var rhelp = null;
      if (this.state.isShowHelp)
      {
        rhelp = React.createElement("div", { "onClick": this._click_help, style: {cursor:"pointer"}},
        "help:", rbr,
        "若marker標記無字,按F5刷新頁面.", rbr,
        "可點擊marker", rbr,
        "滑鼠經過直線,可測試距離,並且可用控制點改變路徑,右鍵可移除控制點"
        );
      }
      else{
        rhelp = React.createElement("span", { "onClick": this._click_help, style: {"background-color":"black","color":"white", "border-radius":"30px","cursor": "pointer","border":"solid 2px #505050","height":"1.5em","width":"3em","font-size":"10" } },
        "help"
        );
      }
      
      return React.createElement("div", {}, this.state.info, rbr,rhelp);
    }
  }),
  tools: React.createClass({
    bind_on_ishold_changed: function (pfn) {
      /// <summary> pfn(bool), 傳來 true/false </summary>
      this._on_ishold_changed.push(pfn);
    },
    _on_ishold_changed: [],
    _trigger_ishold_changed: function () {
      this._ishold = !this._ishold;
      for (var i in this._on_ishold_changed) {
        this._on_ishold_changed[i](this._ishold);
      }
    },
    _ishold: false,
    render: function () {
      var pthis = this;

      var chk_ishold = React.createElement("input", { "type": "checkbox", "onChange": this._trigger_ishold_changed.bind(this, {}), ref: "chk_ishold" }, "切換章不刪除");
      var btn_auto_zoom = React.createElement("input", {
        "type": "button", "onClick": this.props.auto_zoom, "value": "AutoZoom"
      });
      return React.createElement("div", {}, chk_ishold, btn_auto_zoom);
    }
  }),
  frame: React.createClass({
    set_data: function (datas) {
      /// <summary> 得到 sobj 查詢資料, 用這個來更新資料, 通常是外部呼叫. 會呼叫 gmap </summary>
      /// <param type="JSON" name="datas" parameterArray="false"> sobj 查詢的結果 </param>
      this.refs.gmap.set_data(datas);
    },
    set_active: function (id) {
      /// <summary> 相當於在地圖上click marker, 提供經文中mark使用 (呼叫gmap.set_active) </summary>
      /// <param type="JSON" name="datas" parameterArray="false"> id參數, 每個地點都有編號 </param>
      this.refs.gmap.set_active(id);//add 2016.10
    },
    auto_zoom: function () {
      this.refs.gmap.auto_zoom();
    },
    getDefaultProps: function () { return {}; },
    getInitialState: function () { return {}; },
    componentWillMount: function () { },
    componentDidMount: function () {
      var pthis = this;
      this.refs.gmap.bind_on_btw_polyline_over(function (param) {
        var txt = param.na1 + " ~ " + param.na2 + " 距離 " + param.dist / 1000 + " km";
        pthis.refs.top.set_text(txt);
      });
      this.refs.tools.bind_on_ishold_changed(function (param) {
        pthis.refs.gmap.set_ishold_data(param);
      });
    },
    componentWillReceiveProps: function (nextProp) { },
    componentWillUpdate: function (nextProp, nextState) { },
    componentDidUpdate: function (preProp, preState) { }, // 可於此呼叫 this.componentWillUnmount(); this.componentDidMount();
    componentWillUnmount: function () { },//通常在DidMount建的 DOM 在這裡要移除. timer 也是
    render: function () {
      var rtop = React.createElement(fhlmap.R.top, { ref: "top" });
      var rtools = React.createElement(fhlmap.R.tools, { ref: "tools", "auto_zoom": this.auto_zoom });
      var rgmap = React.createElement(fhlmap.R.gmap, { ref: "gmap" });

      return React.createElement("div", { "style": { "width": "100%", "height": "90%" } }, rtop, rtools, rgmap);
    }
  })
};
