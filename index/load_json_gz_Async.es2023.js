import { Bible_fhlwh_json } from "./Bible_fhlwh_json.es2023.js";
import { Sd_same_json } from "./Sd_same_json.es2023.js";
import { Sd_cnt_json } from "./Sd_cnt_json.es2023.js";
import { Sn_cnt_book_unv_json } from "./Sn_cnt_book_unv_json.es2023.js";
import { Sn_cnt_chap_unv_json } from "./Sn_cnt_chap_unv_json.es2023.js";

export async function load_json_gz_Async() {
  try {
    // 平行啟動所有讀檔與解壓縮的 Promise
    /** @type {Promise<void>} */
    const promises = [];
    promises.push(Bible_fhlwh_json.s.loadAsync()) // 希臘文原文，嵌SN
    promises.push(Sd_same_json.s.loadAsync()) // 同源字資料
    promises.push(Sd_cnt_json.s.loadAsync()) // SN 出現次數資料
    promises.push(Sn_cnt_book_unv_json.s.loadAsync()) // SN 在每卷書中出現的次數資料
    promises.push(Sn_cnt_chap_unv_json.s.loadAsync()) // SN 在每章分佈次數資料

    // 等待所有 Promise 完成
    await Promise.all(promises);
    
    window.Sd_same_json = Sd_same_json // 使用者，還沒像 index.js 可以用 import，所以先將 class 暴露在 window 上。


    console.log("所有檔案已成功載入並解壓縮");
  } catch (error) {
    console.error("載入 JSON.gz 檔案時發生錯誤:", error);
  }
}