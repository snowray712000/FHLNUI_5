import { loadAndDecompressJsonGzAsync } from "./loadAndDecompressJsonGzAsync.es2023.js";

export async function load_json_gz_Async() {
    try {
      // 定義所有檔案的路徑與對應的全域變數
      const files = [
        { path: "./index/bible_fhlwh.json.gz", key: "fhlwh_sn" }, // 聖經資料
        { path: "./index/sd_same.json.gz", key: "sd_same" }, // 同源字
        { path: "./index/sd_cnt.json.gz", key: "sd_cnt" }, // 聖經出現次數
        { path: "./index/sn_cnt_book_unv_min.json.gz", key: "sn_cnt_book_unv" }, // 卷書出現次數
        { path: "./index/sn_cnt_chap_unv_min.json.gz", key: "sn_cnt_chap_unv" } // 每章分佈次數
      ];
  
      // 平行啟動所有讀檔與解壓縮的 Promise
      const promises = files.map(async (file) => {
        if (window[file.key] === undefined) {
          const data = await loadAndDecompressJsonGzAsync(file.path);
          window[file.key] = data;
        }
      });
  
      // 等待所有 Promise 完成
      await Promise.all(promises);
  
      console.log("所有檔案已成功載入並解壓縮");
    } catch (error) {
      console.error("載入 JSON.gz 檔案時發生錯誤:", error);
    }
  }