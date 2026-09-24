import { Sd_same_json } from "./Sd_same_json.es2023.js";
import { Sd_cnt_json } from "./Sd_cnt_json.es2023.js";
import { Sn_cnt_book_unv_json } from "./Sn_cnt_book_unv_json.es2023.js";
import { Sn_cnt_chap_unv_json } from "./Sn_cnt_chap_unv_json.es2023.js";

// 使用者，還沒像 index.js 可以用 import，所以先將 class 暴露在 window 上。
// 要在載入完成前就設定，否則 SN_Act_Color 等處取 window.Sd_same_json.s 會是 undefined。
window.Sd_same_json = Sd_same_json

/**
 * SN 相關資料（同源字、SN 在聖經/書卷/各章出現次數，共約 560KB）。
 * 只有滑鼠移到 SN 上才用得到，所以不在啟動時載入，第一次需要時才呼叫。可重複呼叫。
 * 希臘文原文 bible_fhlwh.json.gz 則在顯示該譯本時才載入（見 lecture_get_data_async get_fhlwh）。
 * @returns {Promise<void>}
 */
export function ensureSnDataAsync() {
  return Promise.all([
    Sd_same_json.s.loadAsync(), // 同源字資料
    Sd_cnt_json.s.loadAsync(), // SN 出現次數資料
    Sn_cnt_book_unv_json.s.loadAsync(), // SN 在每卷書中出現的次數資料
    Sn_cnt_chap_unv_json.s.loadAsync(), // SN 在每章分佈次數資料
  ]).then(() => undefined)
}
