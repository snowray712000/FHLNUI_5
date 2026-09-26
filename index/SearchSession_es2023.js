import { searchKeywordAsync, searchSnAsync, queryQsbAsync, addrsToQstr, isGreekKeyword } from './SearchApi_es2023.js'

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

    /** @type {string} */ keyword
    /** @type {SearchKind} */ kind
    /** @type {string[]} */ versions
    /** @type {0|1} */ gb
    /** @type {0|1} 經文是否帶 SN */ strong
    /** @type {string} 目前閱讀的書卷，reference 省略書卷時用 */ engs
    /** @type {string} sn 搜尋時，純數字 (上色用) */ sn = null

    /** @type {SearchVerse[]} 已排序 */ verses = []
    /** @type {Object.<number, number>} 0based ibook → 節數 */ cntOfBook = {}
    /** @type {{ver: string, reason: string}[]} 無法搜尋的譯本 */ failedVersions = []
    /** @type {string[]} 新約原文搜尋結果太多、沒有列入的書卷 (engs) */ tooManyBooks = []
    /** @type {SearchRow[]} reference 搜尋直接取得經文 */ #rowsOfReference = []

    /** @type {SearchVerse[]} 目前範圍內的節 */ filtered = []
    /** 目前範圍已經取過經文的節數 */ cursor = 0
    #filterSeq = 0
    #abort = new AbortController()

    /**
     * @param {{keyword: string, versions: string[], gb: 0|1, strong: 0|1, engs: string}} arg
     */
    constructor(arg) {
        this.keyword = arg.keyword.trim()
        this.versions = arg.versions
        this.gb = arg.gb
        this.strong = arg.strong
        this.engs = arg.engs
        this.kind = SearchSession.determineKind(this.keyword)
        // 希臘文：查新約原文 (fhlwh) 與七十士譯本 (lxx)，不論目前選的譯本
        if (this.kind == 'keyword' && isGreekKeyword(this.keyword)) this.versions = ['fhlwh', 'lxx']
    }

    /**
     * - reference：`#羅 1:3|`，或是書卷名開頭接數字 `羅1:3`、`約壹 2:1-3`
     * - sn：`G80`、`H2316`、`652a`
     * - keyword：其它
     * @param {string} keyword
     * @returns {SearchKind}
     */
    static determineKind(keyword) {
        if (keyword.startsWith('#') || keyword.endsWith('|')) return 'reference'
        if (/^[GH]?\d+[a-z]?$/i.test(keyword)) return 'sn'
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
            const m = /^([GH])?(\d+[a-z]?)$/i.exec(this.keyword)
            // 沒寫 G 或 H 時，依目前閱讀的是舊約或新約
            const isOld = m[1] != null ? m[1].toUpperCase() == 'H' : fhl.engs_2_iBook(this.engs) < 39
            this.sn = `${parseInt(m[2])}${m[2].replace(/^\d+/, '')}`
            this.strong = 1 // 搜尋 SN 時，結果顯示 SN (但主經文保持原設定)
            perVer = [{ ver: 'unv', addrs: await searchSnAsync(m[2], isOld, signal) }]
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
        this.verses = [...map.values()].sort(compareAddr)
        this.cntOfBook = {}
        for (const v of this.verses) {
            this.cntOfBook[v.ibook] = (this.cntOfBook[v.ibook] ?? 0) + 1
        }
    }

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

        // qsb 一次只能一個譯本；每個譯本只取「在這個譯本找到」的節
        const textsPerVer = await Promise.all(this.#versionsOfBatch(batch).map(ver => {
            const addrs = batch.filter(v => v.vers.includes(ver))
            return queryQsbAsync(addrsToQstr(addrs, this.gb), { version: ver, engs: this.engs, strong: this.strong, gb: this.gb }, signal)
        }))
        if (seq != this.#filterSeq || signal.aborted) return null

        /** @type {Map<string, SearchText>} */
        const map = new Map()
        for (const t of textsPerVer.flat()) map.set(`${t.ver}|${t.ibook}:${t.chap}:${t.sec}`, t)

        return batch.map(v => ({
            ibook: v.ibook, chap: v.chap, sec: v.sec,
            texts: v.vers.map(ver => map.get(`${ver}|${v.ibook}:${v.chap}:${v.sec}`)).filter(t => t != null),
        }))
    }

    /** 依使用者設定的譯本順序 */
    #versionsOfBatch(batch) {
        const set = new Set(batch.flatMap(v => v.vers))
        const order = this.kind == 'sn' ? ['unv'] : this.versions
        return order.filter(ver => set.has(ver))
    }
}

/** @param {SearchAddr} a @param {SearchAddr} b */
function compareAddr(a, b) {
    return a.ibook - b.ibook || a.chap - b.chap || a.sec - b.sec
}
