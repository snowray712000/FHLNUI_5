// TODO: 還沒完整重構
import { isRDLocation } from './isRDLocation.es2023.js';
import { TPPageState } from './TPPageState.es2023.js';
import { BibleConstantHelper } from './BibleConstantHelper.es2023.js';

/**
 * @typedef {Object} DQsbParam
 * @property {string} qstr - 查詢字串（例如經文或關鍵字），必填
 * @property {'unv'|'kjv'} [ver='unv'] - 聖經版本代號，預設 'unv'
 * @property {0|1} [isGb=0] - 是否使用簡體（0 = 否, 1 = 是），依 PageState 的 gb
 * @property {0|1} [isSn=0] - 是否包含 Strong 編號（0 = 否, 1 = 是），預設 1，若譯本不是 unv kjv rcuv，則強制為 0
 * @property {string} [bookDefault='Ro'] - 預設書卷，採用英文縮寫。依 PageState 的 bookIndex
 */

/**
 * @typedef {Object} DQsbRecord
 * @property {string} chineses - 中文經文
 * @property {string} engs - 英文經文
 * @property {number} book - 聖經書卷編號 1-based (api 本來沒有，是用 engs 取得的)
 * @property {number} chap - 章
 * @property {number} sec - 節
 * @property {string} bible_text - 經文內容
 */

/**
 * @typedef {Object} DQsbResult
 * @property {"success"} [status] - 狀態，成功時為 "success"
 * @property {number} record_count - 返回的記錄數量
 * @property {0|1|2|3|4} [proc] - 需要特殊字型  0:不需要 1:希臘文 2:希伯來文 3:羅馬拼音 4:Open Han字形
 * @property {DQsbRecord[]} record - 返回的經文記錄陣列
 */

/**
 * qsb.php 取得交互參照經文
 *
 * qstr 是唯一必填參數
 * ver 預設 'unv'； isGb 預設，依設定； isSn 預設 1，若譯本不是 unv kjv rcuv，則強制為 0； bookDefault 預設，依 ps 的 bookIndex
 * 錯誤處理會往上丟
 * 取得的結果會加入 book 欄位，也就是會有 book, chap, sec, 不再需要用 engs 與 chineses
 * @param {DQsbParam} args
 * @returns {Promise<DQsbResult>}
 */
export async function qsbAsync(args) {

    const isUsingPost = 1
    const payload = gen_payload_qsb(args)
    const domain = isRDLocation() ? "http://127.0.0.1:15600" : ""
    const endpoint = '/json/qsb.php'

    if (isUsingPost) {
        const url = `${domain}${endpoint}`
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: payload,
        });
        const result = await response.json();
        if (result.status == 'success') {
            qsbRecordToStd(result);
        }
    }
    else {

    }


    const response = await fetch(url);

    /**
     * @type {DQsbResult}
     */
    const result = await response.json();
    if (result.status == 'success') {
        qsbRecordToStd(result);
    }
    return result


    function makeSureArgsValid() {
        if (args == null) { args = {}; }

        args.ver = args.ver != null ? args.ver : 'unv';
        args.isGb = args.isGb != null ? args.isGb : TPPageState.s.gb;
        args.isSn = args.isSn != null ? args.isSn : 1;
        args.bookDefault = args.bookDefault != null ? args.bookDefault : get_default_book_engs();

        if (['unv', 'kjv', 'rcuv'].indexOf(args.ver) < 0) {
            args.isSn = 0;
        }
    }


    function cvtArgsToUrl() {
        const gb = `gb=${(args.isGb == 0 ? '0' : '1')}`;
        const ver = `version=${args.ver}`;
        const strong = `strong=${args.isSn == 1 ? '1' : '0'}`;
        const engs = `engs=${args.bookDefault}`;
        const params = `?qstr=${args.qstr}&${engs}&${strong}&${gb}&${ver}`;

        // const domain = isRDLocation() ? "https://bible.fhl.net" : ""
        const domain = isRDLocation() ? "http://127.0.0.1:15600" : ""
        const endpoint = '/json/qsb.php'

        const url = domain + endpoint + params;
        const encodedUrl = encodeURI(url); // 保留 ;:,- 等, 中文與空白會被編碼

        //     const params = new URLSearchParams({
        //         qstr: encodeURI(qstr),
        //         engs,
        //         version,
        //         strong: isSn ? "1" : "0",
        //         gb: isGb ? "1" : "0",
        //     });

        return encodedUrl
    }
}

function get_default_book_engs() {
    const ps = TPPageState.s
    return BibleConstantHelper.getBookNameArrayEnglishNormal()[ps.bookIndex - 1]
}

/**
 * 將 record 中的 engs, chineses 轉成 book
 * in-place 修改 record
 * @param {DQsbResult} result
 */
function qsbRecordToStd(result) {
    // map record.engs and unique
    const uniqueEngs = [...new Set(result.record.map(r => r.engs))];

    // engs to book
    const engsToBook = {};
    for (const engs of uniqueEngs) {
        const book = BibleConstantHelper.getBookId(engs.toLowerCase())
        engsToBook[engs] = book;
    }

    // map to standard format
    for (const a1 of result.record) {
        a1.book = engsToBook[a1.engs];
    }
}
