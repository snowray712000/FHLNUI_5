import { DialogHtml } from "./DialogHtml.es2023.js"

export function help_ai_parsing_tp1a(event) {
    let htmlContent = `<ul>
<li>此功能可作為「1:複製原文資料」的範例，用於快速取得經文原文及分析所需的結構化資訊。</li> 
<li>功能設計類似「理解英文長句」時的斷句練習，透過將長句拆分為結構單位，有助於理解經文語法與意思。</li>
<li>特別強調連接詞的角色，因其在理解上下文邏輯上十分重要；例如和合本中有許多連接詞未被翻譯出來，會影響對經文原意的掌握。</li>
    </ul>`

    let dlg = new DialogHtml()
    dlg.showDialog({
        html: `<div>${htmlContent}</div>`,
        getTitle: () => "幫助",
        width: window.innerWidth * 0.9,
        registerEventWhenShowed: dlg => {
        }
    })
}