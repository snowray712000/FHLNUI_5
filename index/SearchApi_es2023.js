import { fetchTextAsync } from './fetchAsync.es2023.js'
import { greekToFhlCode } from './greekToFhlCode.es2023.js'
import { hebSearchRegex, isHebrewKeyword } from './hebCode.es2023.js'
import { Bible_bhs_code_json } from './Bible_bhs_code_json.es2023.js'

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
 * fhlwh (新約原文) 用希臘文查時走 ssn.php (se.php 不支援 fhlwh)；bhs (舊約原文) 用希伯來文查時在本機比對
 * @param {string} keyword
 * @param {string[]} versions
 * @param {0|1} gb
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ver: string, addrs: SearchAddr[]}[] & {failed: {ver: string, reason: string}[], tooManyBooks: string[]}>} tooManyBooks 見 searchFhlwhAsync
 */
export async function searchKeywordAsync(keyword, versions, gb, signal) {
    const isGreek = isGreekKeyword(keyword)
    const isHebrew = isHebrewKeyword(keyword)
    let tooManyBooks = []
    const results = await Promise.allSettled(versions.map(async ver => {
        if (ver == 'fhlwh' && isGreek) {
            const r = await searchFhlwhAsync(keyword, signal)
            tooManyBooks = r.tooManyBooks
            return r.addrs
        }
        if (ver == 'bhs' && isHebrew) return searchBhsAsync(keyword)
        return searchIndexAsync({ orig: 0, VERSION: ver, q: keyword, gb }, signal)
    }))

    const re = []
    re.failed = []
    re.tooManyBooks = tooManyBooks
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

/** 含希臘字母 (含 polytonic) */
export function isGreekKeyword(keyword) {
    return /[Ͱ-Ͽἀ-῿]/.test(keyword)
}

/** ssn.php 的 engs 參數 (新約) */
const NT_ENGS = ['Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom', '1 Cor', '2 Cor', 'Gal', 'Eph', 'Phil', 'Col',
    '1 Thess', '2 Thess', '1 Tim', '2 Tim', 'Titus', 'Philem', 'Heb', 'James', '1 Pet', '2 Pet',
    '1 John', '2 John', '3 John', 'Jude', 'Rev']

/**
 * 解析 ssn.php 的 HTML。每筆是一個字，同一節可能出現多次
 * @param {string} html
 * @returns {{addrs: {engs: string, chap: number, sec: number}[], tooMany: number | null}} tooMany：超過上限 (約 500) 時的總筆數，此時 addrs 是空的
 */
export function parseSsnHtml(html) {
    const m = /資料太多，共有\s*(\d+)\s*筆/.exec(html)
    if (m) return { addrs: [], tooMany: parseInt(m[1]) }

    const addrs = []
    for (const a1 of html.matchAll(/href="fhlwhparsing\.php\?([^"]*)"/g)) {
        const q = new URLSearchParams(a1[1].replace(/&amp;/g, '&'))
        addrs.push({ engs: q.get('engs'), chap: parseInt(q.get('chap')), sec: parseInt(q.get('sec')) })
    }
    return { addrs, tooMany: null }
}

/** ssn.php 沒有 CORS；開發時經 VirtualApi proxy，上線時同源 */
function urlSsn() { return fhl.isRDLocation ? 'http://127.0.0.1:15600/new/ssn.php' : '/new/ssn.php' }

/**
 * @param {Record<string, string>} params
 * @param {AbortSignal} [signal]
 */
async function fetchSsnAsync(params, signal) {
    const qs = new URLSearchParams({ ...params, graph: 2 })
    return parseSsnHtml(await fetchTextAsync(urlSsn() + '?' + qs, { signal }))
}

/**
 * ssn.php 一個條件 (例 word=lovgos)。超過上限時改成逐卷查，逐卷仍太多的書卷放 tooManyBooks
 * @returns {Promise<{addrs: SearchAddr[], tooManyBooks: string[]}>}
 */
async function searchSsnAsync(params, signal) {
    const toAddrs = r => r.addrs.map(a1 => ({ ibook: fhl.engs_2_iBook(a1.engs), chap: a1.chap, sec: a1.sec }))
    const all = await fetchSsnAsync(params, signal)
    if (all.tooMany == null) return { addrs: toAddrs(all), tooManyBooks: [] }

    const perBook = await Promise.all(NT_ENGS.map(engs => fetchSsnAsync({ ...params, engs }, signal)))
    return {
        addrs: perBook.flatMap(toAddrs),
        tooManyBooks: NT_ENGS.filter((_, i) => perBook[i].tooMany != null),
    }
}

/**
 * 新約原文搜尋 (fhlwh)，以 ssn.php 用信望愛內碼查 (Unicode 參數 uword/uorig 字尾 σ/ς 會查不到)
 * - 每個詞：原文字 (word) 或原型 (orig) 符合，前綴比對，例 λόγο → λόγος λόγου…；πνεῦμα 的原型也找到 πνεύματος
 * - 多個詞 (空白分隔)：同一節都要有
 * @param {string} keyword Unicode 希臘文，tonos / oxia 皆可
 * @param {AbortSignal} [signal]
 * @returns {Promise<{addrs: SearchAddr[], tooManyBooks: string[]}>} tooManyBooks：結果太多、沒有列入的書卷 (engs)
 */
export async function searchFhlwhAsync(keyword, signal) {
    const words = keyword.split(/\s+/).filter(w => w.length > 0).map(greekToFhlCode)
    const tooMany = new Set()
    /** @type {Map<string, SearchAddr>[]} 每個詞找到的節 */
    const perWord = await Promise.all(words.map(async code => {
        const results = await Promise.all([searchSsnAsync({ word: code }, signal), searchSsnAsync({ orig: code }, signal)])
        const map = new Map()
        for (const r of results) {
            r.tooManyBooks.forEach(a1 => tooMany.add(a1))
            for (const a1 of r.addrs) map.set(`${a1.ibook}:${a1.chap}:${a1.sec}`, a1)
        }
        return map
    }))
    const [first, ...rest] = perWord
    const addrs = [...(first?.entries() ?? [])].filter(([key]) => rest.every(m => m.has(key))).map(([, v]) => v)
    return { addrs, tooManyBooks: NT_ENGS.filter(a1 => tooMany.has(a1)) }
}

/**
 * 舊約原文搜尋 (bhs)。se.php 的 bhs 存的是內碼，用 Unicode 查 0 筆；
 * 而 LIKE 分大小寫、dagesh 變體多是大小寫 (y י / Y יּ)，伺服器無法粗篩，所以載入全舊約內碼在本機比對
 * - 每個詞見 hebSearchRegex (可不打母音)；多個詞 (空白或 maqaf 分隔) 同一節都要有
 * @param {string} keyword Unicode 希伯來文
 * @returns {Promise<SearchAddr[]>}
 */
export async function searchBhsAsync(keyword) {
    const words = keyword.split(/[\s\u05be]+/).filter(w => isHebrewKeyword(w))
    if (words.length == 0) return []
    await Bible_bhs_code_json.s.loadAsync()
    const data = Bible_bhs_code_json.s.filecontent?.data
    if (data == null) throw new Error('bible_bhs_code.json.gz 載入失敗')
    const res = words.map(hebSearchRegex)
    return data.filter(a1 => res.every(re => re.test(a1[3]))).map(a1 => ({ ibook: a1[0] - 1, chap: a1[1], sec: a1[2] }))
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
        ibook: toIbook(a1), chap: a1.chap, sec: a1.sec, ver: opt.version,
        // bhs：qsb.php (umscode) 把整節反轉，多行時行的順序也倒了；同 lecture_get_data_async 的 modify_bhs_bible_text
        bible_text: opt.version == 'bhs' ? a1.bible_text.split(/\r?\n\r?/g).reverse().join('\n') : a1.bible_text,
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
