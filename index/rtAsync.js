import { isRDLocation } from './isRDLocation.es2023.js';
import { TPPageState } from './TPPageState.es2023.js';
import { BibleConstantHelper } from './BibleConstantHelper.es2023.js';

/**
 * @param {DRtParam} args 
 * @returns {Promise<DRtResult>}
 */
export async function rtAsync(args) {
    makeSureArgsValid();

    const url = cvtArgsToUrl();
    const response = await fetch(url);
    const joResult = await response.json();
    
    return joResult;

    function makeSureArgsValid() {
        if (args == null) { args = {}; }
        args.book = args.book != null ? args.book : 2;
        args.chap = args.chap != null ? args.chap : 1;
        args.ver = args.ver != null ? args.ver : 'lcc';
        args.id = args.id != null ? args.id : 1;
        args.gb = args.gb != null ? args.gb : TPPageState.s.gb;
    }

    function cvtArgsToUrl() {
        const engs = `engs=${BibleConstantHelper.getBookNameArrayEnglishNormal()[args.book - 1]}`;
        const chap = `chap=${args.chap}`;
        const ver = `version=${args.ver}`;
        const id = `id=${args.id}`;
        const gb = `gb=${args.gb == 1 ? '1' : '0'}`;

        const params = `?${engs}&${chap}&${ver}&${id}&${gb}`;

        // const domain = isRDLocation() ? "https://bible.fhl.net" : ""
        const domain = isRDLocation() ? "http://127.0.0.1:5600" : ""
        const endpoint = '/json/rt.php'
        return domain + endpoint + params;
    }
}

/**
 * @typedef {Object} DRtParam
 * @property {number} [book=1] - 聖經書卷編號，預設為創世記（1）
 * @property {number} [chap=1] - 章，預設為第一章
 * @property {string} [version='unv'] - 聖經版本代號，預設 'unv'
 * @property {number} [id=1] - 注腳的唯一識別碼，預設為 1
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