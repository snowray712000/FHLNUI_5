
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

import { TPPageState } from '../TPPageState.es2023.js';
import { BibleConstantHelper } from '../BibleConstantHelper.es2023.js';
import { get_domain } from './get_domain.js';
/**
 * 
 * @param {DQsbParam} args 
 */
export async function qsb(args){
    const isUsingPost = 1

    const payload = gen_payload_qsb(args)

    const domain = get_domain()

    const endpoint = '/json/qsb.php'

    const joResult = isUsingPost ? await qsb_using_POST(args, domain) : await qsb_using_GET(args, domain)

    // 將 record 中的 engs 轉換成 book 
    if (joResult.status == 'success') {
        qsbRecordToStd(joResult);
    }

    return joResult
}

/**
 * 生成 QSB 查詢的 payload
 * @param {DQsbParam} args 
 */
function gen_payload_qsb(args) {
    // default value
    /** @type {TPPageState} */
    const ps = TPPageState.s

    const gb = args.isGb || ps.gb || 0
    const sn = args.isSn || 1
    const ver = args.ver || ps.version?.[0] || 'unv'
    const bookDefault = args.bookDefault || ps?.bookIndex || 1
    const qstr = args.qstr

    const engs = BibleConstantHelper.getBookNameArrayEnglishNormal()[bookDefault - 1]

    const params = new URLSearchParams({
        qstr: qstr,
        engs,
        version: ver,
        strong: sn ? "1" : "0",
        gb: gb ? "1" : "0",
    })

    return params.toString()
}
/**
 * @param {DQsbParam} args 
 * @param {string} [domain] - 可選的自訂域名，預設為 "https://bible.fhl.net"
 * @returns {Promise<DQsbResult>}
 */
async function qsb_using_GET(args, domain) {
    const payload = gen_payload_qsb(args)
    domain = domain || "https://bible.fhl.net"
    const endpoint = '/json/qsb.php'
    const url = `${domain}${endpoint}?${payload}`
    const response = await fetch(url)
    const result = await response.json();
    return result
}

/**
 * @param {DQsbParam} args 
 * @param {string} [domain] - 可選的自訂域名，預設為 "https://bible.fhl.net"
 * @returns {Promise<DQsbResult>}
 */
async function qsb_using_POST(args, domain) {
    const payload = gen_payload_qsb(args)
    domain = domain || "https://bible.fhl.net"
    const endpoint = '/json/qsb.php'
    const url = `${domain}${endpoint}`
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        body: payload,
    });
    const result = await response.json();
    return result
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