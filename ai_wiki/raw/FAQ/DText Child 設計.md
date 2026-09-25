❓ 問題
DText 的 children 與 childrenlist 有何差異

# ai 

我找到了實際的原始碼與測試案例（[DText.js:86-92](index/DText.js:86)、[cvtDTextsToHtml.es2023.js:16-39](index/cvtDTextsToHtml.es2023.js:16)、[dtexts_render_test.js:376-395](tests/dtext/dtexts_render_test.js:376)），可以用真實邏輯來舉例。

## 範例一：`children`（行內組合，inline）

情境：一段文字「請看 **創1:1** 的資料」，中間包含一個交互參照（superscript 樣式），本質上還是「一段文字」，只是被拆成多個 DText 節點。

```js
// DText[]
[
  {
    tpContainer: '<span class="exp">',
    children: [
      { w: "請看 " },
      { w: "創1:1", isRef: true, refAddresses: [{ book: 1, chap: 1, verse: 1 }] },
      { w: " 的資料" }
    ]
  }
]
```

依 [cvtDTextsToHtml.es2023.js:21-31](index/cvtDTextsToHtml.es2023.js:21)（`tpContainer` 決定外層標籤，`children` 遞迴渲染成內容）大致會產出：

```html
<span class="exp">請看 <a class="ref" data-address="1,1,1">創1:1</a> 的資料</span>
```

重點：`children` 只是把「同一段落文字」拆成子節點方便標記交互參照/樣式，最終仍是一個**行內、線性**的內容串。

## 範例二：`childrenlist`（清單，ol/ul/li）

情境：一個有標題「項目列表」的清單，底下兩個項目，其中第一項還有子清單。取自 [dtexts_render_test.js:442-465](tests/dtext/dtexts_render_test.js:442) 的實測案例：

```js
// DText[]
[
  {
    w: "列表",
    childrenlist: [
      {
        w: "項目1",
        childrenlist: [
          { w: "子項目1" },
          { w: "子項目2" }
        ]
      },
      { w: "項目2" }
    ]
  }
]
```

實際輸出 HTML（`render_childrenlist()`，見 [dtexts_render.js:288](index/dtext/dtexts_render.js:288)）：

```html
<ul>
  <span>列表</span>
  <li class="hanging-indent">
    <span>項目1</span>
    <ul>
      <li class="hanging-indent"><span>子項目1</span></li>
      <li class="hanging-indent"><span>子項目2</span></li>
    </ul>
  </li>
  <li class="hanging-indent"><span>項目2</span></li>
</ul>
```

重點：`childrenlist` 是**結構化的清單巢狀**（可以無限層 `<ul><li>` 巢狀下去），每個項目對應一個 `<li>`，跟 `children` 那種「同一段文字被拆開」的行內語意完全不同。

## 一句話總結差異

- `children`：**同一段落/同一行內文字**的拆解，配合 `tpContainer` 決定外層要包什麼標籤，渲染出來是**連續文字流**。
- `childrenlist`：**清單項目**的巢狀結構，渲染成 `<ul><li>...</li></ul>`，每個子節點是獨立的一個 list item。