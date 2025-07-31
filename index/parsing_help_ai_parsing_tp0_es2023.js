import { DialogHtml } from "./DialogHtml.es2023.js"

export function help_ai_parsing_tp0(event) {
    let htmlContent = `<ul>
        <li> 目前只適用新約</li>
        <li> 產生的資料，適用 AI 閱讀，而非 人類 閱讀</li>
        <li> 我只用最基本的 ChatGpt 4o</li>
        <li> 目前產生資料，以聯式為主，韋式會先略過，以後再開放設定</li>
        </ul>
        <hr/>
        例子(太1:1):<br/>
        
        <code>
依**參考資料**，分析**句法結構**，找出 獨立句/關係子句/介系詞短語/分詞短語/...，並說明每句之**功能**，結果以**字序**呈現，並產生**句法結構語法樹（Syntax Tree）**。
        </code>
        <br/><br/>
        (貼上資料...)
        <hr/>

        例子(彼後2:13):<br/>

        <code>
依**參考資料**，說明 1 這動詞的分析中，「關身」是什麼意思？如果不是關身，在語義上，會有什麼差別？
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