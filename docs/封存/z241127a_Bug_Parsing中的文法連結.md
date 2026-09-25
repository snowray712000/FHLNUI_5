
## tracing

- 士師記 11v30
![alt text](z241127a/image.png)
- § 找這個字，會有 fhlInfoContent.js 與 index2.js，生效的是 fhlInfoContent.js
- 其實字串處理都沒錯，也就是 \[##\] 過程都是對的，應該是最後呼叫了 charHG 時，沒處理好。
- charHG 用途是將 注釋 中的原文，加上 class，才能控制大小。
- charHG 存在於 index2.js 與 index/charHG.js，要改第2個才會生效
- 主要是 charHG 判斷希伯來文時，還加入 ` ` 空白符號，不知道當時為何要加入。但我不修改 charHG

## 改

- 將 remark 處理流程，重構為 function do_remark()
- 將 port 若是 5500 , 也就是開發中，就會變成完整路徑
- 將 do_remark 與 charHG 呼叫順序修改，即可。
- 
<style>
    .markdown-body {
        font-size: 14pt ;
    }
    .markdown-body b {
        font-weight: 700;
    }
    img {
        max-height: 240px;
        border: 4px solid #ccc;
    }
    .ig {
        /* ig: image，圖示，因為要置中，所以用 div  */
        color: saddlebrown;
        /* border-left: 0px solid; */
        background-color: lightyellow;
        padding: 0.5em;
        line-height: 2em;
        margin-bottom: 1em;
        margin-top: 0em;
        text-align: center;
    }
    .qa {
        /* qa: question answer ， 引導式問題，有答案的問題 */
        color: darkgreen;
        border-left: 3px solid;
        background-color: lightgreen;
        padding: 0.5em;
        line-height: 4em;
    }
    blockquote {
        font-size: 14pt !important;
        color: darkorange !important;
    }
    .markdown-body code,
    code {
        color: #A0F !important;
        font-size: 1.50em !important;
        padding-top: 0em !important;
        padding-bottom: 0em !important;
    }
    .alert {
        padding: 15px;
        margin-bottom: 20px;
        text-align: left;
    }
    :root {
        --r-main-font-size: 14pt ;
    }
</style>