import { DialogHtml } from "./DialogHtml.es2023.js"

export function help_ai_parsing_tp1b(event) {
    let htmlContent = `<h3>基於1a，產生對話式，協助思考</h3>
<ul>     
    <li>核心設計理念是：若將經文中的「每一個原文字眼」，都視為「作者經過深思熟慮的選擇」，那麼透過「階層式引導對話」，能幫助讀者逐層發掘字詞之間的修飾與依附關係，不只是掃讀，而是細細體會經文的深度。</li>
    <li>例如，「聖先知」，為何加入形容詞「聖」，沒加「聖」在些會有什麼差異。</li>
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