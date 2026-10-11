import { searchKeywordAsync, searchSnAsync, queryQsbAsync, addrsToQstr, isGreekKeyword } from './SearchApi_es2023.js'
import { isHebrewKeyword } from './hebCode.es2023.js'
import { parseSnQuery, combineSnResults, termsOf, positiveTermsOf, assertSnQuery } from './snQuery.es2023.js'

/**
 * ### 一次搜尋的資料與狀態 (不碰 DOM)
 * 1. runAsync：找出所有符合的節 (只有位置，沒有經文)，並統計每卷筆數
 * 2. setFilter：選擇範圍 (某分類、某卷)
 * 3. loadMoreAsync：依範圍，一批一批取經文 (捲動到底時)
 *
 * @typedef {import('./SearchApi_es2023.js').SearchAddr} SearchAddr
 * @typedef {import('./SearchApi_es2023.js').SearchText} SearchText
 *
 * @typedef {SearchAddr & {vers: string[]}} SearchVerse 一節，vers 是在此節找到關鍵字的譯本
 * @typedef {SearchAddr & {texts: SearchText[]}} SearchRow 顯示用，一節，各譯本經文
 *
 * @typedef {'keyword'|'sn'|'reference'} SearchKind
 */
export class SearchSession {
    /** 一次取幾節經文 */
    static BATCH = 30
    /** SN 搜尋一次最多幾個 SN (or / and 合計) */
    static MAX_SN_TERMS = 60

    /** @type {string} */ keyword
    /** @type {SearchKind} */ kind
    /** @type {string[]} */ versions
    /** @type {0|1} */ gb
    /** @type {0|1} 經文是否帶 SN */ strong
    /** @type {string} 目前閱讀的書卷，reference 省略書卷時用 */ engs
    /** @type {string} sn 搜尋時，純數字 (上色用)；多項時是第一項 */ sn = null
    /** @type {string[]} sn 搜尋的所有 SN，純數字 (上色用) */ sns = []
    /** @type {string[]} 使用者目前選的譯本 (原文關鍵字時 versions 會被換掉，譯本對照仍用這個) */ userVersions
    /** 譯本對照：每節都取 compareVersions 全部譯本的經文 (不只找到關鍵字的)；改了要重新 setFilter */ compare = false

    /** @type {Set<number> | null} 搜尋範圍 (0based ibook)，null 是整本聖經；見 SearchScope.es2023.js。改了呼叫 setScope */ scope = null
    /** @type {SearchVerse[]} 所有符合的節 (已排序，不受 scope 限制) */ allVerses = []
    /** @type {SearchVerse[]} 範圍內的節 (已排序) */ verses = []
    /** @type {Object.<number, number>} 0based ibook → 節數 */ cntOfBook = {}
    /** @type {{ver: string, reason: string}[]} 無法搜尋的譯本 */ failedVersions = []
    /** @type {string[]} 新約原文搜尋結果太多、沒有列入的書卷 (engs) */ tooManyBooks = []
    /** @type {SearchRow[]} reference 搜尋直接取得經文 */ #rowsOfReference = []

    /** @type {SearchVerse[]} 目前範圍內的節 */ filtered = []
    /** 目前範圍已經取過經文的節數 */ cursor = 0
    #filterSeq = 0
    #abort = new AbortController()

    /**
     * @param {{keyword: string, versions: string[], gb: 0|1, strong: 0|1, engs: string, scope?: Set<number> | null}} arg
     */
    constructor(arg) {
        this.keyword = arg.keyword.trim()
        this.versions = arg.versions
        this.userVersions = arg.versions
        this.gb = arg.gb
        this.strong = arg.strong
        this.engs = arg.engs
        this.scope = arg.scope ?? null
        this.kind = SearchSession.determineKind(this.keyword)
        // 希臘文：查新約原文 (fhlwh) 與七十士譯本 (lxx)，不論目前選的譯本
        if (this.kind == 'keyword' && isGreekKeyword(this.keyword)) this.versions = ['fhlwh', 'lxx']
        // 希伯來文：查舊約原文 (bhs)
        else if (this.kind == 'keyword' && isHebrewKeyword(this.keyword)) this.versions = ['bhs']
    }

    /**
     * - reference：`#羅 1:3|`，或是書卷名開頭接數字 `羅1:3`、`約壹 2:1-3`
     * - sn：`G80`、`H2316`、`652a`；多項：`G3114 G3115` (and)、`G3114 or G3115` (or)，見 parseSnQuery
     * - keyword：其它
     * @param {string} keyword
     * @returns {SearchKind}
     */
    static determineKind(keyword) {
        if (keyword.startsWith('#') || keyword.endsWith('|')) return 'reference'
        if (parseSnQuery(keyword) != null) return 'sn'
        const names = [...fhl.g_book_all, ...fhl.g_book_allGb].flatMap(a1 => [a1[2], a1[3]])
        names.sort((a, b) => b.length - a.length) // 長的先比對，例 約壹 優先於 約
        if (names.some(na => keyword.startsWith(na) && /^\s*\d/.test(keyword.slice(na.length)))) return 'reference'
        return 'keyword'
    }

    get isAborted() { return this.#abort.signal.aborted }
    abort() { this.#abort.abort() }

    /** 找出所有符合的節 */
    async runAsync() {
        const signal = this.#abort.signal
        if (this.kind == 'reference') {
            await this.#runReferenceAsync(signal)
            return
        }

        /** @type {{ver: string, addrs: SearchAddr[]}[]} */
        let perVer
        if (this.kind == 'sn') {
            const groups = parseSnQuery(this.keyword)
            assertSnQuery(groups)
            // 沒寫 G 或 H 時，依目前閱讀的是舊約或新約
            const defaultOld = fhl.engs_2_iBook(this.engs) < 39
            const keyOf = t => `${t.isOld ?? defaultOld ? 'H' : 'G'}${t.sn}`
            const terms = new Map(termsOf(groups).map(t => [keyOf(t), { sn: t.sn, isOld: t.isOld ?? defaultOld }]))
            if (terms.size > SearchSession.MAX_SN_TERMS) throw new Error(`SN 一次最多 ${SearchSession.MAX_SN_TERMS} 個 (範圍也一個一個算)`)
            this.sns = [...new Set(positiveTermsOf(groups).map(t => t.sn))] // 標示用，不含 not 的
            this.sn = this.sns[0]
            this.strong = 1 // 搜尋 SN 時，結果顯示 SN (但主經文保持原設定)
            // se.php 沒有 or，各 SN 分別查，在本機做 and (交集)、or (聯集)、not (差集)；一次最多 3 個請求
            const results = new Map()
            const queue = [...terms.entries()]
            await Promise.all(Array.from({ length: Math.min(3, queue.length) }, async () => {
                for (let kv; (kv = queue.shift()) != null;) {
                    results.set(kv[0], await searchSnAsync(kv[1].sn, kv[1].isOld, signal))
                }
            }))
            const addrs = combineSnResults(groups, t => results.get(keyOf(t)))
            perVer = [{ ver: 'unv', addrs }]
        } else {
            perVer = await searchKeywordAsync(this.keyword, this.versions, this.gb, signal)
            this.failedVersions = perVer.failed
            this.tooManyBooks = perVer.tooManyBooks
        }
        this.#mergeVerses(perVer)
    }

    /** @param {{ver: string, addrs: SearchAddr[]}[]} perVer */
    #mergeVerses(perVer) {
        /** @type {Map<string, SearchVerse>} */
        const map = new Map()
        for (const { ver, addrs } of perVer) {
            for (const a1 of addrs) {
                if (a1.ibook < 0) continue
                const key = `${a1.ibook}:${a1.chap}:${a1.sec}`
                let v = map.get(key)
                if (v == null) {
                    v = { ibook: a1.ibook, chap: a1.chap, sec: a1.sec, vers: [] }
                    map.set(key, v)
                }
                if (!v.vers.includes(ver)) v.vers.push(ver)
            }
        }
        this.allVerses = [...map.values()].sort(compareAddr)
        this.#applyScope()
    }

    /** 依 scope 篩出 verses，重算每卷節數 */
    #applyScope() {
        this.verses = this.scope == null ? this.allVerses : this.allVerses.filter(v => this.scope.has(v.ibook))
        this.cntOfBook = {}
        for (const v of this.verses) {
            this.cntOfBook[v.ibook] = (this.cntOfBook[v.ibook] ?? 0) + 1
        }
    }

    /** 改搜尋範圍 (不重新搜尋)；之後要再 setFilter @param {Set<number> | null} scope */
    setScope(scope) {
        this.scope = scope
        this.#applyScope()
    }

    /** 範圍外的節數 */
    get outOfScope() { return this.allVerses.length - this.verses.length }

    async #runReferenceAsync(signal) {
        const qstr = this.keyword.replace(/^#/, '').replace(/\|$/, '').trim()
        const results = await Promise.all(this.versions.map(version =>
            queryQsbAsync(qstr, { version, engs: this.engs, strong: this.strong, gb: this.gb }, signal)))

        // 依第一個譯本的順序 (即使用者寫的順序)，各譯本的同一節放在一起
        /** @type {Map<string, SearchRow>} */
        const map = new Map()
        for (const texts of results) {
            for (const t of texts) {
                const key = `${t.ibook}:${t.chap}:${t.sec}`
                if (!map.has(key)) map.set(key, { ibook: t.ibook, chap: t.chap, sec: t.sec, texts: [] })
                map.get(key).texts.push(t)
            }
        }
        this.#rowsOfReference = [...map.values()]
    }

    /**
     * 選擇範圍，之後呼叫 loadMoreAsync 從頭取經文
     * @param {number[] | null} books 0based；null 表示全部
     */
    setFilter(books) {
        this.#filterSeq++
        this.filtered = books == null ? this.verses : this.verses.filter(v => books.includes(v.ibook))
        this.cursor = 0
    }

    get total() { return this.kind == 'reference' ? this.#rowsOfReference.length : this.filtered.length }
    get hasMore() { return this.cursor < this.total }

    /**
     * 取下一批經文
     * @returns {Promise<SearchRow[] | null>} null 表示期間範圍被改了或被取消，這批結果作廢
     */
    async loadMoreAsync() {
        if (this.kind == 'reference') {
            const rows = this.#rowsOfReference.slice(this.cursor)
            this.cursor = this.#rowsOfReference.length
            return rows
        }

        const seq = this.#filterSeq
        const signal = this.#abort.signal
        const batch = this.filtered.slice(this.cursor, this.cursor + SearchSession.BATCH)
        this.cursor += batch.length

        // qsb 一次只能一個譯本；每個譯本只取「在這個譯本找到」的節 (譯本對照時全取；只是對照的譯本失敗不影響整批)
        const searched = new Set(this.#searchedVersions)
        const textsPerVer = await Promise.all(this.#versionsOfBatch(batch).map(ver => {
            const addrs = this.compare ? batch : batch.filter(v => v.vers.includes(ver))
            const p = queryQsbAsync(addrsToQstr(addrs, this.gb), { version: ver, engs: this.engs, strong: this.strong, gb: this.gb }, signal)
            return searched.has(ver) ? p : p.catch(e => { if (!signal.aborted) console.warn(ver, e); return [] })
        }))
        if (seq != this.#filterSeq || signal.aborted) return null

        /** @type {Map<string, SearchText>} */
        const map = new Map()
        for (const t of textsPerVer.flat()) map.set(`${t.ver}|${t.ibook}:${t.chap}:${t.sec}`, t)

        return batch.map(v => ({
            ibook: v.ibook, chap: v.chap, sec: v.sec,
            texts: (this.compare ? this.compareVersions : v.vers).map(ver => map.get(`${ver}|${v.ibook}:${v.chap}:${v.sec}`)).filter(t => t != null),
        }))
    }

    /** 搜尋用的譯本 (SN 搜尋只有和合本) */
    get #searchedVersions() { return this.kind == 'sn' ? ['unv'] : this.versions }
    /** 譯本對照時列的譯本：搜尋的譯本在前，再接使用者選的其它譯本 */
    get compareVersions() { return [...new Set([...this.#searchedVersions, ...this.userVersions])] }

    /** 依使用者設定的譯本順序 */
    #versionsOfBatch(batch) {
        if (this.compare) return this.compareVersions
        const set = new Set(batch.flatMap(v => v.vers))
        return this.#searchedVersions.filter(ver => set.has(ver))
    }
}

/** @param {SearchAddr} a @param {SearchAddr} b */
function compareAddr(a, b) {
    return a.ibook - b.ibook || a.chap - b.chap || a.sec - b.sec
}
