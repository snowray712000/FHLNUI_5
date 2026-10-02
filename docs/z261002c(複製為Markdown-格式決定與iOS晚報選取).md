# 複製為 Markdown：格式決定與 iOS 晚報選取 (7.0.10)

2026-10-02。接續 `docs/z261002b` 第六節 (TODO C)。程式在 `index/LecCopyTable.es2023.js`，樣式在 `index/fhl.css` (`.lec-copy-table` / `.lct-btn` / `.lct-md`)。

## 一、為什麼另加按鈕，不改預設

- 預設「複製對照表」不變：`text/html` table + `text/plain` tab 分隔
- Excel / Word / Google Sheets 讀 `text/html`；Obsidian、Typora 貼 html 會自己轉成 md 表格
- 真正只吃 `text/plain` 的是 VS Code、記事本、聊天軟體 → 另一顆「MD」鈕，**只寫 text/plain**，不保留顏色

## 二、格式 (與使用者確認過)

| 情況 | Markdown |
|---|---|
| 並排 (mode 1 / 3) | 表頭 = 譯本名；有標籤欄 (搜尋結果、交互參照) 時第一欄「經文」 |
| mode 1 併入上節 (html 用 rowspan) | 上面那格照常 (節碼已是 `20-21`)，被佔的格寫「（併入上節）」，與 VerseGrid 的 placeholder 同字樣；留空像漏資料 |
| 交錯 (mode 2 / 4) 多譯本 | `\| 譯本 \| 經文 \|`；有經文位置時 `\| 經文 \| 譯本 \| 內容 \|`。不轉回並排 (違反「如所見」，mode 4 段落也對不齊) |
| 單一譯本 (並排或交錯) | 一欄，表頭譯本名；有標籤欄時 `\| 經文 \| 和合本 \|` |
| 起訖在同一格 | 不顯示 MD 鈕 (只有純文字，沒有表格) |

- 格內 `|` → `\|`；換行 → 空白 (不用 `<br>`：聊天軟體、記事本會直接看到 `<br>`)
- RTL (希伯來文) 不加標記，只放文字
- 繁簡：表頭「經文 / 譯本 / 內容 / （併入上節）」依 `ps.gb` 用簡體

範例 (西2:19–22，和合本 + 新譯本，mode 1)：

```markdown
| FHL和合本 | 新譯本 |
| --- | --- |
| 19 不持定元首… | 19 不與頭緊密相連… |
| 20-21 你們若是與基督同死… | 20 …你們若與基督一同死了… |
| （併入上節） | 21 拘守那「不可摸、不可嘗、不可觸」的規條呢？ |
| 22 這都是照人所吩咐… | 22 （這一切東西…） |
```

## 三、程式

- 按鈕改成一組：`#btn` 是外框 `div.lec-copy-table` (定位、`pointerdown` 記下選取都在外框上)，裡面 `#mainBtn`、`#mdBtn` 兩顆 `.lct-btn`；`#show` 依 `table.isOneCell` 藏 MD
- 觸控時整組在畫面下方中央 (原本 `#place` 不用改)；`@media (pointer: coarse)` 按鈕高 36px
- `sideGrid(versions, columns, labels)`：並排的表頭與「攤平 rowspan 的格」(null = 被佔)，`toClipboardData` 與 `toMarkdown` 共用
- `paragraphRuns` 改回傳 `{ runs, label, ver, rtl }` (經文位置不再先黏進 runs)，`interleavedData` 自己加前綴、`toMarkdown` 拆成獨立欄
- `toMarkdown(table)` → `writeClipboard(null, md)`

## 四、順手修：iOS 晚報選取 → 範圍縮成一格

iPad 拖水滴跨格放開後，偶爾整格底色消失、MD 不見、只剩提示 (sticky 但單格)。用頁面上的 `<pre>` 記錄事件 (z261001a 第四節的方法) 看到：

```
update sel=true sticky=false   ← 放開，#stick：收掉原生選取
update sel=true sticky=true    ← iOS 又報一次「舊的」選取
update sel=false sticky=true
```

第二次被 `#update` 當成「sticky 時長按另一格」，`cellOfNode(startContainer)` 就是起點格 → `cellsRange(anchor, anchor)` = 單格。修法：`#stick` 收掉前把原生選取存成 `#removedRange`，`#update` 在延伸分支遇到相同的 range (`isSameRange`) 就略過。不是每次都會發生，修完後沒有再重現。

## 五、驗證

- 瀏覽器 (stub `navigator.clipboard.write` 取內容)：經文區 mode 1–4、單一譯本、單格；搜尋結果單一譯本 / 譯本對照 / 交錯；交互參照；`|` 跳脫
- iOS 模擬器 iPad Pro 13-inch：長按 → 拖水滴跨格 → sticky 時兩顆按鈕在下方中央，連按 MD 兩次都 `ok=true`

## 六、還沒做 (相關)

- 段落標題 (例 新譯本 西2:20「在基督裡作新人」) 直接黏在經文前，對照表與 MD 都是；可考慮加空白或略過標題
