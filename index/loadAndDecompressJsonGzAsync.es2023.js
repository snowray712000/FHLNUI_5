/**
 * 載入 gzipped JSON .json.gz 檔案並解壓縮
 * 若失敗，這內部會有 error log
 * @param {string} url 檔案路徑
 * @returns {Promise<Object>} 解壓縮後的 JSON 物件
 */
export async function loadAndDecompressJsonGzAsync(url) {
    try {
      // 使用 fetch 取代 $.ajax
      const response = await fetch(url, { method: 'GET' });
  
      // 確認回應是否成功
      if (!response.ok) {
        throw new Error(`取得 ${url} 發生錯誤: ${response.statusText}`);
      }
  
      // 將回應轉為 ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();
  
      // 使用 pako 解壓縮
      const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
  
      // 將解壓縮後的字串轉為 JSON
      const jsonData = JSON.parse(decompressed);
  
      return jsonData;
    } catch (error) {
      // 捕捉錯誤並記錄
      console.error(`取得 ${url} 發生錯誤: ${error.message}`);
    }
  }