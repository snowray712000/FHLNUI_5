import { fetchTextAsync } from './fetchAsync.es2023.js'

/**
 * ### 搜尋用到的 api：se.php (找出在哪幾節)、qsb.php (取經文)
 * 取代 static/search_api/sephp.pre_search_keyword.js、sephp.pre_search_sn.js、qsbphp.search_reference.js
 *
 * @typedef {Object} SearchAddr
 * @property {number} ibook 0based
 * @property {number} chap
 * @property {number} sec
 *
 * @typedef {SearchAddr & {ver: string, bible_text: string}} SearchText
 */

const PAGE_LIMIT = 500 // se.php 一次最多 500 筆

function urlJson() { return fhl.urlJSON ?? '/json/' }

/** se.php 回 engs、qsb.php 回 engs 與 chineses (雅各書 engs 是 James)，都轉成 0based ibook */
function toIbook(rec) {
    let ibook = fhl.engs_2_iBook(rec.engs)
    if (ibook == -1) {
        ibook = fhl.g_book_all.findIndex(a1 => a1[2] == rec.chineses)
    }
    if (ibook == -1) {
        ibook = fhl.g_book_allGb.findIndex(a1 => a1[2] == rec.chineses)
    }
    return ibook
}

/**
 * 回傳的不一定是 json，例如版本不存在時是 `<result><status>Fail:fhlwh not found!</status></result>`
 * @returns {Promise<any>}
 */
async function fetchSuccessJsonAsync(url, opt) {
    const text = await fetchTextAsync(url, opt)
    let jo = null
    try { jo = JSON.parse(text) } catch { }
    if (jo?.status != 'success') {
        const status = jo?.status ?? /<status>(.*?)<\/status>/.exec(text)?.[1] ?? text.slice(0, 100)
        throw new Error(status)
    }
    return jo
}

/**
 * se.php index_only，自動翻頁取得全部
 * @param {Record<string, string|number>} params
 * @param {AbortSignal} [signal]
 * @returns {Promise<SearchAddr[]>}
 */
async function searchIndexAsync(params, signal) {
    /** @type {SearchAddr[]} */
    const re = []
    for (let offset = 0; ; offset += PAGE_LIMIT) {
        const qs = new URLSearchParams({ ...params, index_only: 1, limit: PAGE_LIMIT, offset })
        const jo = await fetchSuccessJsonAsync(urlJson() + 'se.php?' + qs, { signal })
        for (const a1 of jo.record ?? []) {
            re.push({ ibook: toIbook(a1), chap: a1.chap, sec: a1.sec })
        }
        if (jo.record_count != PAGE_LIMIT) break
    }
    return re
}

/**
 * 關鍵字搜尋，各譯本同時查。某譯本失敗 (例如原文譯本不能用中文查) 不影響其它譯本。
 * @param {string} keyword
 * @param {string[]} versions
 * @param {0|1} gb
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ver: string, addrs: SearchAddr[]}[] & {failed: {ver: string, reason: string}[]}>}
 */
export async function searchKeywordAsync(keyword, versions, gb, signal) {
    const results = await Promise.allSettled(versions.map(ver =>
        searchIndexAsync({ orig: 0, VERSION: ver, q: keyword, gb }, signal)))

    const re = []
    re.failed = []
    results.forEach((r, i) => {
        if (r.status == 'fulfilled') {
            re.push({ ver: versions[i], addrs: r.value })
        } else {
            re.failed.push({ ver: versions[i], reason: r.reason?.message ?? String(r.reason) })
        }
    })
    if (re.length == 0 && signal?.aborted != true) {
        throw new Error(re.failed.map(a1 => `${a1.ver}: ${a1.reason}`).join('; '))
    }
    return re
}

/**
 * SN 搜尋 (只有和合本有 SN)
 * @param {string} sn 例 80、652a
 * @param {boolean} isOld H 是舊約，G 是新約
 * @param {AbortSignal} [signal]
 * @returns {Promise<SearchAddr[]>}
 */
export function searchSnAsync(sn, isOld, signal) {
    // orig 一定要加，不然 23 會找出一堆非 23 的
    const range = isOld ? 2 : 1
    return searchIndexAsync({ orig: range, RANGE: range, q: sn }, signal)
}

/**
 * 以 qsb.php 取經文
 * @param {string} qstr 例 `雅 1:2,9;來 3:2`，不含 # 與 |
 * @param {{version: string, engs?: string, strong: 0|1, gb: 0|1}} opt engs 是 qstr 沒寫書卷時的預設書卷
 * @param {AbortSignal} [signal]
 * @returns {Promise<SearchText[]>}
 */
export async function queryQsbAsync(qstr, opt, signal) {
    const body = new URLSearchParams({
        version: opt.version, engs: opt.engs ?? 'Gen', strong: opt.strong, gb: opt.gb, qstr,
    })
    let jo
    try {
        jo = await fetchSuccessJsonAsync(urlJson() + 'qsb.php', { method: 'POST', body, signal })
    } catch (e) {
        if (e.name == 'AbortError') throw e
        return [] // 例如 qstr 解析不出任何節
    }
    return (jo.record ?? []).map(a1 => ({
        ibook: toIbook(a1), chap: a1.chap, sec: a1.sec, ver: opt.version, bible_text: a1.bible_text,
    }))
}

/**
 * 將經節位置組成 qsb 的 qstr，例 `雅 1:2,9;來 3:2`
 * @param {SearchAddr[]} addrs
 * @param {0|1} gb
 */
export function addrsToQstr(addrs, gb) {
    const names = gb == 1 ? fhl.g_book_allGb : fhl.g_book_all
    const parts = []
    let last = null
    for (const a1 of addrs) {
        if (last != null && last.ibook == a1.ibook && last.chap == a1.chap) {
            parts[parts.length - 1] += ',' + a1.sec
        } else {
            parts.push(`${names[a1.ibook][2]} ${a1.chap}:${a1.sec}`)
        }
        last = a1
    }
    return parts.join(';')
}
