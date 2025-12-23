
/**
 * @typedef {import("./DText.js").DText} DText
 * @typedef {object} DFoot
 * @property {number} id 注腳的唯一識別碼. 不同譯本. 方式不同, 有的會換章就歸1，有的 id 不會重複
 * @property {number} book 聖經書卷編號
 * @property {number} chap 章
 * @property {number} verse 節
 * @property {string} version 版本代碼, csb 中文標準譯本 cnet NET聖經中譯本 lcc 呂振中譯本
 * @property {DText[]|null} footContent 注腳內容, 還沒抓, 就會是 null
 */

// https://bible.fhl.net/json/rt.php?engs=Rom&chap=3&version=cnet&id=57
/**
{
"status":"success",
"record_count":1,
"version":"cnet",
"engs":"Rom"
,"record":[{"id":57,
"text":"\t \u300c\u6709\u8a31\u591a\u597d\u8655\u300d\u6216\u4f5c\u300c\u5404\u65b9\u9762\u90fd\u6709\u597d\u8655\u300d\u3002"}]
}
 */