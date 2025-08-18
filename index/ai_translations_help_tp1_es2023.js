import { DialogHtml } from "./DialogHtml.es2023.js"

export function ai_translation_help_tp1(event) {
    let htmlContent = `<h3> 此功能發想，是基於 歸納法研經 過程，有「譯本比較」的方法 </h3>
<ul>
    <li> 產生的資料，適用 AI 閱讀為主，而非 人類 為主 </li>
    <li> TODO: 🆕 更多節經文。目前只有提供單節 </li>
    <li> TODO: 🆕 設定譯本。目前產生的譯本，是「目前選擇的」。 </li>
    <li> TODO: 📈 將譯本中有注腳的，先將注腳資料加入。 </li>
</ul>

<hr/>
<code> 紅字，就是你手動輸入的 </code>
<br/>

例子(彼得後書 3:1):
<br/>   <code>
依**譯本資料**回答以下問題: 1. 「誠實的」心，我感覺怪怪的，別的譯本是怎麼譯的。 
        </code>
<br/><br/>
        (貼上資料...)
        <hr/>

        例子(彼得後書 3:1):
<br/>
        <code>
依**譯本資料**，列出語意明顯有差異的部分。
        </code>
        <br/><br/>
        (貼上資料...)
`
    let dlg = new DialogHtml()
    dlg.showDialog({
        html: `<div>${htmlContent}</div>`,
        getTitle: () => "幫助",
        width: window.innerWidth * 0.9,
        registerEventWhenShowed: dlg => {
        }
    })
}