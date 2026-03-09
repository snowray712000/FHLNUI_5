/**
 * @typedef {import('./../TpQUnit.js').TpQUnit} TpQUnit
 * @typedef {import('./../TpQUnit.js').TpAssert} TpAssert
 * @typedef {import('./../../index/tsks/TpTsks.js').DText} DText
 * @typedef {import('./../../index/tsks/TpTsks.js').DAddress} DAddress
 * @typedef {import('./../../index/tsks/TpTsks.js').TskBlock} TskBlock
 */
import { BibleConstantHelper } from "./../../index/BibleConstantHelper.es2023.js"
import { qsb } from "./../../index/api/qsb.js"

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

QUnit.module("qsb")

QUnit.test("qsb1", async assert =>{
    // 了解語法用，不要重構此
    const done = assert.async()

    /** @type {DQsbParam} */
    const args = {}
    args.qstr = "1:1"
    args.isGb = 0
    args.isSn = 1
    args.ver = "unv"
    args.bookDefault = 1

    const payload = gen_payload_qsb(args)    
    const domain = "https://bible.fhl.net"
    const endpoint = '/json/qsb.php'
    const url = `${domain}${endpoint}?${payload}`

    const response = await fetch(url)
    const result = await response.json();

    const txt1 = result.record[0].bible_text
    
    const txt_except = "起初<WAH09002><WH07225>，　神<WH0430>創造<WH01254><WTH8804>{<WH0853>}天<WH08064>{<WH0853>}地<WH0776>。"

    assert.equal(txt1, txt_except)

    done()
})

QUnit.test("qsb1_post", async assert =>{
    // 不要重構此，了解語法用
    const done = assert.async()

    /** @type {DQsbParam} */
    const args = {}
    args.qstr = "1:1"
    args.isGb = 0
    args.isSn = 1
    args.ver = "unv"
    args.bookDefault = 1

    const payload = gen_payload_qsb(args)    
    const domain = "https://bible.fhl.net"
    const endpoint = '/json/qsb.php'
    const url = `${domain}${endpoint}`

    // use post not get
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        body: payload,
    });
    const result = await response.json();

    const txt1 = result.record[0].bible_text
    
    const txt_except = "起初<WAH09002><WH07225>，　神<WH0430>創造<WH01254><WTH8804>{<WH0853>}天<WH08064>{<WH0853>}地<WH0776>。"

    assert.equal(txt1, txt_except)

    done()
})

QUnit.test("qsb1_post_127001", async assert =>{
    const done = assert.async()

    /** @type {DQsbParam} */
    const args = {}
    args.qstr = "1:1"
    args.isGb = 0
    args.isSn = 1
    args.ver = "unv"
    args.bookDefault = 1

    const result = await qsb_using_POST(args, "http://127.0.0.1:5600")
    const txt1 = result.record[0].bible_text
    
    const txt_except = "起初<WAH09002><WH07225>，　神<WH0430>創造<WH01254><WTH8804>{<WH0853>}天<WH08064>{<WH0853>}地<WH0776>。"
    
    assert.equal(txt1, txt_except)

    done()
})

QUnit.test("qsb2", async assert =>{
    const done = assert.async()

    /** @type {DQsbParam} */
    const args = {}
    args.qstr = "創 1:1"
    args.isGb = 0
    args.isSn = 1
    args.ver = "unv"
    args.bookDefault = 1

    const joResult = await qsb(args)

    const txt1 = joResult?.record?.[0]?.bible_text
    
    const txt_except = "起初<WAH09002><WH07225>，　神<WH0430>創造<WH01254><WTH8804>{<WH0853>}天<WH08064>{<WH0853>}地<WH0776>。" 
    assert.equal(txt1, txt_except)

    done()
})

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
 * 生成 QSB 查詢的 payload
 * @param {DQsbParam} args 
 */
function gen_payload_qsb(args){
    const gb = args.isGb || 0
    const sn = args.isSn || 1
    const ver = args.ver || 'unv'
    const bookDefault = args.bookDefault || 1
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