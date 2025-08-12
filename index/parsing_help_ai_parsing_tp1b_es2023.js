import { DialogHtml } from "./DialogHtml.es2023.js"

export function help_ai_parsing_tp1b(event) {
    let htmlContent = `<ul>
<li>此功能可作為「1:複製原文資料」的範例，用於快速取得經文原文與語法結構，並將其應用於引導式討論。</li> 
<li>核心設計理念是：若將經文中的每一個原文字眼，都視為作者經過深思熟慮的選擇，那麼透過「階層式引導對話」，能幫助讀者逐層發掘字詞之間的修飾與依附關係，不只是掃讀，而是細細體會經文的深度。</li>
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