import { getAjaxUrl } from "./getAjaxUrl.es2023.js";
import { ScResult } from "./ScResult_es2023.js";
/**
 * 取得 資它資料 (串珠、注釋、有聲聖經等)
 * @returns {Promise<ScResult>}
 */
export async function sc_api_async() {
    const ajaxUrl = getAjaxUrl("sc", TPPageState.s);
    return new ScResult(await $.ajax({
        url: ajaxUrl
    }));
}
