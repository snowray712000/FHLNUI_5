import { DialogHtml } from "./DialogHtml.es2023.js"

export function ai_translation_help_tp1a(event) {
    let htmlContent = `<h3> 此功能，可視為 1 的範例 </h3>
<ul>
    <li> 從此例中，你能了解比較譯本常見的專有名詞，例如「對齊(Alignment)」 </li>
    <li> 此例所用到的字眼。「對齊(Alignment)」、「比較(Comparison)」、「詞彙選擇(lexical choice)」、「語法結構(syntactic structure)」、「增刪改(addition/omission/modification)」 </li>
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