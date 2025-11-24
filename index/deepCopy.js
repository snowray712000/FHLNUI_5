/**
 * 深度複製一個物件或陣列。
 * @param {T} obj 要複製的物件。
 * @returns {T} 一個新的深層複製物件。
 * @template T
 * 
 * @deprecated 使用內建的 structuredClone 取代
 */
export function deepCopy(obj) {
  return structuredClone(obj);
  // 處理 null 或非物件型別 (原始型別)
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 處理陣列
  if (Array.isArray(obj)) {
    return obj.map(item => deepCopy(item));
  }

  // 處理物件
  const newObj = {};
  for (const key in obj) {
    // 使用 Object.prototype.hasOwnProperty.call 確保安全地檢查屬性
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = deepCopy(obj[key]);
    }
  }

  return newObj;
}