import { BookRegistry } from './BookRegistry.es2023.js'
import { toTraditional, loadS2tAsync } from './s2t.es2023.js'

/**
 * # 使徒教父搜尋：信望愛 seaf.php (規畫與上游行為見 docs/z261019a)
 *
 * - 網址是 /api/seaf.php；/json/seaf.php 沒有 bid
 * - 回傳直接含經文 (不像 se.php 要再用 qsb.php 取)；結果順序是亂的，要自己排
 * - 簡體關鍵字查不到，gb=1 也無效：先轉繁體 (s2t.es2023.js)
 * - 空白分隔的多個詞是 AND (「教會 主教」)；不空白是整串字面比對
 * - `limit=0`，或要回的筆數 > 500 會失敗 (`Fail: record count > 500`)；每頁 500 筆 + offset 分頁可以
 * - `chap:0 sec:0` 的命中是整卷的導論 (可達數千字，內含 HTML)，這裡轉純文字、截成關鍵字附近的片段
 */

export const SEAF_URL = 'https://bible.fhl.net/api/seaf.php'
/** 一頁最多幾筆 (上游上限 500) */
export const SEAF_PAGE = 500
/** 導論片段最多幾字 */
export const INTRO_MAX = 160

/**
 * @typedef {Object} AfHit 一個命中
 * @property {number} ibook 0 起算 (= 書卷 id - 1，使徒教父是 200–216)；和新舊約的 ibook 同一套
 * @property {number} chap 0 = 導論
 * @property {number} sec 0 = 導論，或該章只有一個沒編號的段落
 * @property {string} text 經文 (HTML 原樣)；導論已轉純文字並截成片段
 * @property {boolean} isIntro
 */

/**
 * @param {{q: string, limit?: number, offset?: number}} args
 * @returns {string}
 */
export function seafUrl({ q, limit = SEAF_PAGE, offset = 0 }) {
    if (!q?.trim()) throw new Error('seaf: 關鍵字是空的')
    if (!Number.isInteger(limit) || limit < 1 || limit > SEAF_PAGE) throw new Error(`seaf: limit 要在 1–${SEAF_PAGE}: ${limit}`)
    if (!Number.isInteger(offset) || offset < 0) throw new Error(`seaf: offset 要是 0 以上的整數: ${offset}`)
    return `${SEAF_URL}?${new URLSearchParams({ q: q.trim(), limit: String(limit), offset: String(offset) })}`
}

/**
 * HTML → 純文字：<br/>、區塊標記變空白，去掉其它標記，&nbsp; 變空白，連續空白合成一個
 * @param {string} html
 */
export function plainText(html) {
    return String(html ?? '')
        .replace(/<\/?(br|h[1-6]|p|div|li)[^>]*>/gi, ' ')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * 導論片段：純文字，超過 max 字就以第一個關鍵字為中心截取，前後加 …
 * @param {string} text 已是純文字
 * @param {string} keyword 空白分隔的詞 (繁體)，找第一個出現的
 * @param {number} [max]
 */
export function introSnippet(text, keyword, max = INTRO_MAX) {
    const chars = Array.from(text)
    if (chars.length <= max) return text
    let at = -1
    for (const w of keyword.split(/\s+/).filter(Boolean)) {
        const i = text.indexOf(w)
        if (i >= 0 && (at < 0 || i < at)) at = i
    }
    const centre = at < 0 ? 0 : Array.from(text.slice(0, at)).length
    const start = Math.max(0, Math.min(centre - Math.floor(max / 3), chars.length - max))
    return (start > 0 ? '…' : '') + chars.slice(start, start + max).join('') + (start + max < chars.length ? '…' : '')
}

/**
 * 上游一頁的回應 → 命中。status 不是 success 丟錯
 * @param {any} json
 * @param {string} keyword 繁體，導論截取用
 * @returns {AfHit[]}
 */
export function normalizeSeaf(json, keyword) {
    if (json?.status !== 'success') throw new Error(`seaf: ${json?.status ?? '沒有 status'}`)
    return (json.record ?? []).map(r => {
        const chap = +r.chap, sec = +r.sec
        const isIntro = chap === 0 && sec === 0
        return {
            ibook: +r.bid - 1, chap, sec, isIntro,
            text: isIntro ? introSnippet(plainText(r.bible_text), keyword) : (r.bible_text ?? ''),
        }
    })
}

/** 依書、章、節排序 (上游的順序是亂的)；導論 (chap 0) 排在該書最前面。不改傳入的陣列 @param {AfHit[]} hits */
export function sortAfHits(hits) {
    return [...hits].sort((a, b) => a.ibook - b.ibook || a.chap - b.chap || a.sec - b.sec)
}

/**
 * 搜尋使徒教父。簡體先轉繁體；一頁 500 筆，一直取到取完
 * @param {string} keyword 使用者輸入
 * @param {AbortSignal} [signal]
 * @returns {Promise<{keyword: string, hits: AfHit[]}>} keyword 是實際送出的 (繁體)，標示關鍵字用
 */
export async function searchAfAsync(keyword, signal) {
    await loadS2tAsync().catch(e => console.warn('簡繁對照表載入失敗，簡體關鍵字可能查不到', e))
    const q = toTraditional(keyword.trim())
    const { fetchJsonAsync } = await import('./fetchAsync.es2023.js')
    /** @type {AfHit[]} */
    const hits = []
    for (let offset = 0; ; offset += SEAF_PAGE) {
        const json = await fetchJsonAsync(seafUrl({ q, offset }), { signal, timeout: 30000 })
        const page = normalizeSeaf(json, q)
        hits.push(...page)
        if (page.length < SEAF_PAGE) break
    }
    return { keyword: q, hits: sortAfHits(hits.filter(h => BookRegistry.corpusOf(h.ibook + 1) === 'af')) }
}
