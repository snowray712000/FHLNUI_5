import { DialogHtml } from "./DialogHtml.es2023.js"

export function help_ai_parsing_tp1a(event) {
    let htmlContent = `<h3>藉著「結構分析」可更準確知道某些字眼是修飾什麼對象</h3>
<ul>
  <li>此功能可作為「1:複製原文資料」的範例，用於快速取得「經文原文」及「分析所需的結構化資訊」。</li> 
  <li>「主句」解析。此節經文的主要動詞，及對應的主詞，受詞先找出來，對理解挺有幫助。</li>
  <li>「上下文關聯」解析。在結構分析前，若了解上下文關係，會很有幫助，因為常常「主句」是在前一節，或是連接詞要描述與前一節關係。</li>
  <li>功能設計類似「理解英文長句」時的斷句練習，透過將長句拆分為結構單位，有助於理解經文語法與意思。</li>
  <li>特別強調「連接詞」的角色，因為連接詞在理解上下文邏輯上十分重要；例如和合本中有許多連接詞未被翻譯出來，會影響對經文原意的掌握。</li>
  <li>對每個原文表示法，定義了 w1 w2 w3，這樣方便接續與 AI 對話時，可以不輸入原文(原文不好輸入，直接輸入問題，類似『w1 為何是分詞』，就方便很多) </li>
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