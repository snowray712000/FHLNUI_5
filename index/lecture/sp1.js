/*
前言:
資料可能是多個譯本，但顯示模式有各種，但資料準備應該是一致的。

方法:
- 想像最終是一個 table。每一個 cell 呈現的內容。
    - mode1: 每個 cell 就是一節資料
    - mode3: 每個 cell 就是多節資料(一段 paragraph)
- row 對齊
    - 多譯本的時候, 譯本的 row 數量可能不一致,  當對齊時, 每 cell 必須有「address」資訊, 以便對齊。
    - 承上 address 資訊，會有多節的情況, 但一定連續.
- copy 模式
    - 通常 滑鼠選擇，用以 copy 的時候，當面對的是 table 時，預設是 row0 row1 row2 被選擇, 但通常可能是要選「一個譯本的連續多節」而非「多個交錯」。
    - 承上，仍然有可能是原本的模式
- DOM 順序選取 (DOM order selection)
    - Row-based
    - Column-based
    - Visual Simulation（視覺模擬表格）

- 每個 cells，是 {r: 1, c: 1, content: [{}, {}, ...]} 的格式， content 是一個 array, 代表這個 cell 包含的內容，可能是一節或多節。
- 然後每個 content，有一個 render_dtexts(content) 的方法，回傳 jQuery<HTMLElement>。

*/

// 一個 3 row 2 col, 1-based, 但 col 1 有合併儲存格
// r: row, c: col, rs: rowspan, cs: colspan
// w: word, isRef: is reference, ref-desc: reference description
const joTable = {
    r: 3,
    c: 2,
    headers:[{ c: 1, content: [{w:"KJV"}] }, { c: 2, content: [{w:"和合本"}] }],
    cells: [
        { r: 1, c: 1, content: [{w:"1 ", isRef: 1, "ref-desc":"創1"},{w:"In the beginning God created the heavens and the earth."}]},
        { r: 2, c: 1, rs: 2, content: [{w:"2-3 ", isRef: 1, "ref-desc":"創1"},{w:"The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters. And God said, “Let there be light,” and there was light."}]},
        { r: 1, c: 2, content: [{w:"1 ", isRef: 1, "ref-desc":"創1"},{w:"起初神創造天地。"}]},
        { r: 2, c: 2, content: [{w:"2 ", isRef: 1, "ref-desc":"創1"},{w:"地是空虛混沌，淵面黑暗；　神的靈運行在水面上。"}]},
        { r: 3, c: 2, content: [{w:"3 ", isRef: 1, "ref-desc":"創1"},{w:"神說，要有光，就有了光。"}]}
    ]
}

// ---