import { getAjaxUrl } from "./getAjaxUrl.es2023.js";
import { ScResult } from "./ScResult_es2023.js";
/**
 * 取得 資它資料 (串珠、注釋、有聲聖經等)
 * @returns {Promise<ScResult>}
 */
export async function sc_api_async() {
    const ajaxUrl = getAjaxUrl("sc", TPPageState.s);
    // 啟動時註釋會連續 render 兩次，同一網址還在查詢中就共用同一個請求（各自拿一份複本，互不影響）
    let pending = scPending.get(ajaxUrl);
    if (pending == null) {
        pending = Promise.resolve($.ajax({ url: ajaxUrl })).finally(() => scPending.delete(ajaxUrl));
        scPending.set(ajaxUrl, pending);
    }
    return new ScResult(structuredClone(await pending));
}
/** @type {Map<string, Promise<any>>} */
const scPending = new Map();
