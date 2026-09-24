// 取代 React 0.13 的 React.createElement，給 static/ 下的舊式元件使用。
// commonR.h(tag, props, ...children)
//   props.style   物件，key 可用 "font-size" 或 fontSize；數字值自動加 px（z-index 除外），輸出格式與 React 相同
//   props.className
//   props.onClick 等 onXxx 事件
//   其他 props 設為 attribute；null / undefined / false 略過
//   children 可為字串、數字、Node、null，或以上的陣列（會攤平）
// commonR.setStyle(el, style)  以同樣格式重設 el 的 style
// commonR.syncChildren(parent, nodes)
//   讓 parent 的子節點變成 nodes（略過 null）。已存在的節點原地保留，不會被移動
//   （例如播放中的 <audio>），相當於 React 重新 render 時保留同一個元件。
var commonR = commonR || {};
(function () {
  var UNITLESS = { "z-index": 1, "opacity": 1, "flex": 1, "font-weight": 1, "zoom": 1 };

  function hyphenate(k) {
    return k.replace(/([A-Z])/g, "-$1").toLowerCase();
  }

  function styleText(style) {
    var s = "";
    for (var k in style) {
      var v = style[k];
      if (v == null || v === "" || typeof v === "boolean") continue;
      var name = hyphenate(k);
      if (typeof v === "number" && v !== 0 && !isNaN(v) && UNITLESS[name] == null) v = v + "px";
      s += name + ":" + v + ";";
    }
    return s;
  }

  function appendChildren(el, children) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (c == null || typeof c === "boolean") continue;
      if (Array.isArray(c)) appendChildren(el, c);
      else if (c instanceof Node) el.appendChild(c);
      else el.appendChild(document.createTextNode(String(c)));
    }
  }

  commonR.h = function (tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    for (var k in props) {
      var v = props[k];
      if (v == null || v === false) continue;
      if (k === "style") {
        var t = styleText(v);
        if (t.length) el.setAttribute("style", t);
      } else if (k === "className") {
        el.className = v;
      } else if (/^on[A-Z]/.test(k)) {
        el.addEventListener(k.substr(2).toLowerCase(), v);
      } else {
        el.setAttribute(k, v === true ? "" : v);
      }
    }
    appendChildren(el, Array.prototype.slice.call(arguments, 2));
    return el;
  };

  /** 以 React 相同的格式重設 el 的 style（整個取代） */
  commonR.setStyle = function (el, style) {
    var t = styleText(style);
    if (t.length) el.setAttribute("style", t);
    else el.removeAttribute("style");
  };

  commonR.syncChildren = function (parent, nodes) {
    var list = [];
    (function flat(a) {
      for (var i = 0; i < a.length; i++) {
        if (a[i] == null) continue;
        if (Array.isArray(a[i])) flat(a[i]);
        else list.push(a[i]);
      }
    })(nodes);

    // 先移除不要的，再依序插入新的；這樣保留下來的節點彼此順序不變時，就不會被搬動
    var keep = new Set(list);
    Array.prototype.slice.call(parent.childNodes).forEach(function (c) {
      if (!keep.has(c)) parent.removeChild(c);
    });
    list.forEach(function (n, i) {
      var cur = parent.childNodes[i];
      if (cur !== n) parent.insertBefore(n, cur || null);
    });
  };
})();
