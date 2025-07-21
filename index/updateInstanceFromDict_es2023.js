import { assert } from "./assert_es2023.js";
/**
 * 從字典物件更新實例的屬性值
 * - 重構出來，是覺得 json 轉成 class，應該是個常用的核心
 * @template T
 * @param {Object.<string, any>} dict - 包含要更新屬性的字典物件
 * @param {() => T} fnInstanceGetter - 返回目標實例的函數
 * @returns {T} 更新後的實例，類型與 fnInstanceGetter 返回的實例相同
 */
export function updateInstanceFromDict(dict, fnInstanceGetter) {
    assert(() => dict != null, "updateInstanceFromDict: dict should not be null");

    let obj = fnInstanceGetter();

    for (const [key, value] of Object.entries(dict)) {
        if (key in obj) {
            obj[key] = value;
        } else {
            console.warn(`warn: Key "${key}" does not exist in ${obj.constructor.name}.`);
            obj[key] = value; // 動態新增屬性
        }
    }
    return obj
}
