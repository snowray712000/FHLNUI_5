import { isRDLocation } from './isRDLocation.es2023.js';
import { TPPageState } from './TPPageState.es2023.js';
import { BibleConstantHelper } from './BibleConstantHelper.es2023.js';

/**
 * 注腳。後端 rt-nui.php：帶 id → 該筆；不帶 id → 整章 (lcc / csb) 或整本 (其他版本)，
 * 回應多 scope: 'chapter' | 'book'，沒有 scope 表示後端不認得整章查詢 (舊後端)。
 * 失敗 (含 503 回 html) 會 throw。
 * @param {DRtParam} args
 * @returns {Promise<DRtResult & {scope?: 'chapter'|'book', chap?: number}>}
 */
export async function rtAsync(args) {
    makeSureArgsValid();

    const url = cvtArgsToUrl();
    const response = await fetch(url);
    const joResult = await response.json();

    return joResult;

    function makeSureArgsValid() {
        if (args == null) { args = {}; }
        args.book = args.book != null ? args.book : 1;
        args.chap = args.chap != null ? args.chap : 2;
        args.ver = args.ver != null ? args.ver : 'lcc'; // 呂振中譯本，才有注腳，且是 創2
        args.gb = args.gb != null ? args.gb : TPPageState.s.gb;
    }

    function cvtArgsToUrl() {
        const engs = `engs=${encodeURIComponent(BibleConstantHelper.getBookNameArrayEnglishNormal()[args.book - 1])}`; // '1 Sam' 有空白
        const chap = `chap=${args.chap}`;
        const ver = `version=${args.ver}`;
        const id = args.id != null ? `&id=${args.id}` : ''; // 不帶 id = 整章
        const gb = `gb=${args.gb == 1 ? '1' : '0'}`;

        const params = `?${engs}&${chap}&${ver}${id}&${gb}`;

        // const domain = isRDLocation() ? "https://bible.fhl.net" : ""
        const domain = isRDLocation() ? "http://127.0.0.1:15600" : ""
        const endpoint = '/json/rt-nui.php'
        return domain + endpoint + params;
    }
}

/**
 * @typedef {Object} DRtParam
 * @property {number} [book=1] - 聖經書卷編號，預設為創世記（1）
 * @property {number} [chap=1] - 章，預設為第一章
 * @property {string} [version='unv'] - 聖經版本代號，預設 'unv'
 * @property {number} [id] - 注腳的唯一識別碼；不給 = 整章 / 整本
 * @property {number} [gb=0] - 繁簡體標誌，1 表示繁體，0 表示簡體，預設為 0
 */

/**
 * @typedef {Object} DRtResult
 * @property {string} status - 請求狀態，如 "success" 或 "error"
 * @property {number} record_count - 返回的記錄數量
 * @property {string} version - 聖經版本代號 cnet
 * @property {string} engs - 聖經書卷英文名稱 Rom
 * @property {Array.<{id: number, text: string}>} record - 注腳記錄陣列，每個記錄包含唯一識別碼和注腳文本
 */
