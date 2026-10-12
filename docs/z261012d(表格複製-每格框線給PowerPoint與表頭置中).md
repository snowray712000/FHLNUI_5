# 表格複製：每格框線給 PowerPoint、表頭置中 (7.5.12.9)

接 docs/z261009a (Pages 要完整 html 文件、⚙ 選項)。

## 起因

「表格」貼到 PowerPoint 是表格 (黑、實線、1pt 的格線樣式)，但**沒有框線**，要手動再按一次「所有框線」。Word、Keynote 原本就有框線。

## 原因與改法

- 以前框線只寫在 `<table border="1" style="border-collapse:collapse">`，格子本身沒有 CSS border。PowerPoint 只認每一格的 border (Excel / Word 複製出來的 html 也是每格寫 `border:.5pt solid windowtext`)。
- `tableHtml(elScope, rows)`：勾「框線」時，把 rows 裡每個 `<td` / `<th` 補上 `border:1pt solid <字色>` (已有 `style` 就接在前面)；table 上的 `border="1"` / `border-collapse` 照留。並排 (`toClipboardData`) 與交錯 (`interleavedData`) 都經它。
- 顏色用 `getComputedStyle(scope).color`，呼叫端在 `inCopyPalette` 裡，預設是淺色主題的字色 (近黑)；勾「依目前主題」在深色時是淺色線。不能寫 `windowtext` / `black`：`tests/theme-colors.test.js` 不准寫死顏色名稱。
- 格內文字都經 `esc`，所以 regex `/<(td|th)\b([^>]*)>/g` 不會誤中內容。
- 實測：Word、PowerPoint、Keynote 都有框線。1px → 1pt 在 Word / Pages 線略粗，可接受。

## 表頭 (譯本名稱) 置中

`headCell` 加 `HEAD_ATTRS`：`align="center" valign="middle" style="text-align:center;vertical-align:middle"`，舊屬性與 CSS 都寫，Word / PowerPoint 哪個認都行。`th` 選項勾不勾都一樣。交錯沒有表頭列，不受影響。

## 網路上查到的 (2026-10-12)

沒有 Microsoft / Apple 官方說明剪貼簿 html 表格怎麼解讀，多是使用者討論，要靠實測。

- 網頁只能寫 `text/html`、`text/plain`，寫不了 RTF (Safari 原生複製另有 webarchive + RTF，Chrome 原生複製只有 `public.html`)。
- 樣式要 inline：讀取時 Chrome 會拿掉 `<style>` / `<meta>` 並內嵌 CSS；WebKit 跨網域會消毒 (script、事件)。
- Windows Word 看 CF_HTML 的 `<!--StartFragment-->` / `<!--EndFragment-->`；Chromium `setData` 會自己加表頭與標記。我們給完整文件也許整份被當片段，目前沒看到問題，有怪再在 body 裡自己包標記。
- Word 欄寬：只寫 `<colgroup>` 不會固定，要每格 `style="width:…pt"`；比例寬 (`2*`) 不支援。
- PowerPoint：網路上很多人說網頁表格貼進去變文字方塊或圖片，繞法是先貼 Word / Excel；我們的 html 實測是表格。
- Keynote / Pages 彼此用 iWork 私有格式 (`com.apple.iWork.TSPNativeData`)，網頁寫不出來。
- Pages 列高：貼上後若字被切掉，選取各列 → 列編號右側箭頭 →「符合內容的高度」；手動拖過列高就固定了，要再選一次；「符合」變灰時，有人說是字剛好頂到格子右緣，刪幾個字就好 (使用者回報)。html 這邊沒找到能影響的寫法，決定不追。
- 可能的下一步 (未做)：`text/plain` 已是 tab 分隔，Keynote / Numbers 可能據此猜成表格。
