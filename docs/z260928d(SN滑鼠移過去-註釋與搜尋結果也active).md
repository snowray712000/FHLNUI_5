# SN 滑鼠移過去：註釋與搜尋結果也 active（6.10.11）

## 背景

滑鼠移到 SN 上，本章同一個原文字標紅 (`.snAct`)、同源字標暗紅 (`.snAct2`)，稱為 active SN。
由 `index/SN_Act_Color.es2023.js` 負責加 / 移除 class，範圍是：

```
#lecMain, #searchDlgResults, #parsingTable, #commentScrollDiv
```

也就是 經文、搜尋結果、原文分頁、註釋 四處。`ps.snAct` / `ps.snActTp` 記目前 active 的 SN。

有兩處「看起來沒作用」：

1. 註釋中 hover SN，完全沒反應（測試：讀 創1，註釋 1:1 有 `H7225 H1254 H430 …`）
2. TODOs「搜尋結果，滑鼠移過去，也要能夠顯示active」：主經文會變色，但搜尋結果自己不會

## 1. 註釋：handler 把 event 當成元素

`index/comment_register_events_es2023.js` 的 mouseenter：

```js
.on('mouseenter', '.sn', function (target) {
    var r2 = $(target)          // target 其實是 jQuery event，不是 .sn
    var sn = r2.attr('sn')      // undefined
```

`act_add(undefined, undefined)` 找不到任何元素，所以什麼都不標。mouseleave 不需要讀屬性，所以一直正常，看不出來。

修改：改用 `$(this)`（委派事件中 `this` 就是 `.sn`）。

這個 handler 掛在 `#fhlInfoContent`，右側分頁的 `.sn` 都會受惠，不只註釋。

## 2. 搜尋結果：css 權重

搜尋結果的 SN 是 `<span class="seSN sebutton sn" sn=".." tp="..">`，`SearchDialog_es2023.js` 的 mouseenter 本來就有呼叫 `SN_Act_Color.s.act_add`，class 也確實加上了，但顏色被蓋掉：

| 規則 | 權重 | 顏色 |
|---|---|---|
| `.snAct` (fhl.css) | 0,1,0 | red |
| `.search-dlg .seSN` (Search.css) | 0,2,0 | #808080 灰 ← 贏 |
| `.search-dlg .seKey` (Search.css) | `!important` | red（搜尋的那個 SN） |

另外，搜尋的 SN (`.seKey`) 本來就是紅色，就算 active 能顯示，也分不出「搜的」和「滑鼠所在的」。

修改（`index/Search.css`）：

```css
.search-dlg .seSN.seKey { font-size: 1em; color: #8e24aa !important; } /* 查詢的 SN 紫色 */
.search-dlg .seSN.snAct  { color: red !important; }
.search-dlg .seSN.snAct2 { color: darkred !important; }
```

- 搜尋的 SN 改紫色 `#8e24aa`
- `.seSN.snAct` 與 `.seSN.seKey` 權重相同、都 `!important`，寫在後面的贏，所以滑鼠移到「搜尋的那個 SN」上也會變紅
- 關鍵字搜尋 (中文字) 的 `.seKey` 仍是紅色：它不是 SN，不會 hover active，沒有衝突

## 驗證

- 創1 註釋 hover `H430`：註釋 2 個、經文 61 個 `.snAct`；移開後 0 個、`ps.snAct == ""`
- 搜尋 `H430`：`<430>` computed 為 `rgb(142, 36, 170)`；hover `<7225>` 為 `rgb(255, 0, 0)`，主經文同時標出

## 相關

- `docs/z260927c`：字典 dialog 高亮正在讀的經文 (`--ref-act-*`)，是另一種「active」，別搞混
- 若要加新的區域也能 active SN，把容器 id 加到 `SN_Act_Color.ids()`，並注意該區 `.sn` 的顏色規則權重不要蓋過 `.snAct`
