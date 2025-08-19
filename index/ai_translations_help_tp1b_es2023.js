import { DialogHtml } from "./DialogHtml.es2023.js"

export function ai_translation_help_tp1b(event) {
    let htmlContent = `<h3> 譯本比較，有原文分析，應該會更準確(即，結合「原文相關」資料) </h3>
<ul>
    <li> 結合「原文相關」資料 </li>
    <li> 繼承 1b 範例，加入「評估分數」，還有「FAQ」 </li>
</ul>
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