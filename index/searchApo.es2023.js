import { BookRegistry } from './BookRegistry.es2023.js'
import { toTraditional, loadS2tAsync } from './s2t.es2023.js'
import { sortAfHits } from './searchAf.es2023.js'

/**
 * # 次經搜尋：信望愛 sesub.php (規畫與上游行為見 docs/z261019b)
 *
 * - 網址是 /api/sesub.php；命中依書章節排好 (id 順序)，不需要 bid 篩選 (沒有這個參數)
 * - `limit=0`，或要回的筆數 > 500 會失敗 (`Fail: record count > 500`)；每頁 500 筆 + offset 分頁可以
 * - `record_count` 是本頁筆數，不是總命中數；`version` 參數無效 (永遠搜 c1933)
 * - 空白分隔的多個詞是 AND
 * - **一律用 gb=0 搜尋**：gb=1 時上游拿「已轉簡體的經文」比對關鍵字，但經文裡的異體字不會轉
 *   (爲、衆 轉簡體後仍是 爲、衆)，所以 `众`、`爲` 都找不到 (實測)。簡體關鍵字先轉繁體 (s2t)
 * - **c1933 內文用異體字**：爲 2042 / 為 4，眞 66 / 真 0，衆 351 / 眾 0，却 110 / 卻 2，裏 602 / 裡 1。
 *   使用者打「為」「真」「眾」就幾乎搜不到，所以關鍵字另外也查異體字的寫法 (最多兩次查詢，結果聯集)
 * - 命中只取位置，經文之後用 qsubAsync 取 (整章、有快取，簡繁由 gb 決定，和閱讀同一份快取)
 */

export const SESUB_URL = 'https://bible.fhl.net/api/sesub.php'
/** 一頁最多幾筆 (上游上限 500) */
export const SESUB_PAGE = 500

/** c1933 用的寫法 (左：現代常用，右：c1933)；只列 c1933 幾乎一律用右邊的 */
export const APO_VARIANTS = { 為: '爲', 真: '眞', 眾: '衆', 卻: '却', 裡: '裏' }

/**
 * @typedef {Object} ApoHit 一個命中 (只有位置)
 * @property {number} ibook 0 起算 (= 書卷 id - 1，次經是 100–114)；和新舊約的 ibook 同一套
 * @property {number} chap
 * @property {number} sec
 * @property {string} [text] 次經的經文不隨搜尋回來 (簡繁要跟 gb)，這裡一律沒有
 * @property {boolean} isIntro 恆為 false (次經沒有導論命中)
 */

/**
 * @param {{q: string, limit?: number, offset?: number}} args
 * @returns {string}
 */
export function sesubUrl({ q, limit = SESUB_PAGE, offset = 0 }) {
    if (!q?.trim()) throw new Error('sesub: 關鍵字是空的')
    if (!Number.isInteger(limit) || limit < 1 || limit > SESUB_PAGE) throw new Error(`sesub: limit 要在 1–${SESUB_PAGE}: ${limit}`)
    if (!Number.isInteger(offset) || offset < 0) throw new Error(`sesub: offset 要是 0 以上的整數: ${offset}`)
    return `${SESUB_URL}?${new URLSearchParams({ q: q.trim(), limit: String(limit), offset: String(offset) })}`
}

/**
 * 要送去搜尋的寫法：先轉繁體，再換成 c1933 的異體字寫法 (有換才多一個)；c1933 的寫法排前面
 * @param {string} keyword 使用者輸入
 * @returns {string[]} 一到兩個
 */
export function apoQueries(keyword) {
    const trad = toTraditional(keyword.trim())
    const folded = [...trad].map(c => APO_VARIANTS[c] ?? c).join('')
    return folded == trad ? [trad] : [folded, trad]
}

/**
 * 上游一頁的回應 → 命中 (只留位置)。status 不是 success 丟錯
 * @param {any} json
 * @returns {ApoHit[]}
 */
export function normalizeSesub(json) {
    if (json?.status !== 'success') throw new Error(`sesub: ${json?.status ?? '沒有 status'}`)
    return (json.record ?? [])
        .map(r => ({ ibook: +r.bid - 1, chap: +r.chap, sec: +r.sec, isIntro: false }))
        .filter(h => h.chap >= 1 && h.sec >= 1)
}

/** @param {string} q 一種寫法 @param {AbortSignal} [signal] @returns {Promise<ApoHit[]>} */
async function searchOneAsync(q, signal) {
    const { fetchJsonAsync } = await import('./fetchAsync.es2023.js')
    /** @type {ApoHit[]} */
    const hits = []
    for (let offset = 0; ; offset += SESUB_PAGE) {
        const json = await fetchJsonAsync(sesubUrl({ q, offset }), { signal, timeout: 30000 })
        const raw = Array.isArray(json?.record) ? json.record.length : 0
        hits.push(...normalizeSesub(json))
        if (raw < SESUB_PAGE) break
    }
    return hits
}

/**
 * 搜尋次經：一頁 500 筆取到取完；有異體字寫法時兩種各查一次，結果聯集、依書章節排序
 * @param {string} keyword 使用者輸入
 * @param {AbortSignal} [signal]
 * @returns {Promise<{keyword: string, hits: ApoHit[]}>} keyword 是實際送出的各種寫法 (空白連起來)，標示關鍵字用
 */
export async function searchApoAsync(keyword, signal) {
    if (!keyword?.trim()) throw new Error('sesub: 關鍵字是空的')
    await loadS2tAsync().catch(e => console.warn('簡繁對照表載入失敗，簡體關鍵字可能查不到', e))
    const queries = apoQueries(keyword)
    /** @type {Map<string, ApoHit>} */
    const map = new Map()
    for (const q of queries) {
        for (const h of await searchOneAsync(q, signal)) {
            if (BookRegistry.corpusOf(h.ibook + 1) === 'apo') map.set(`${h.ibook}:${h.chap}:${h.sec}`, h)
        }
    }
    const words = [...new Set(queries.join(' ').split(/\s+/).filter(Boolean))]
    return { keyword: words.join(' '), hits: sortAfHits([...map.values()]) }
}
