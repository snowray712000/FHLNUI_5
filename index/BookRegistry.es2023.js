import { BibleConstant } from "./BibleConstant.es2023.js";

/**
 * # 書卷註冊表：以書卷 id 查名稱、章數、節數
 *
 * 書卷 id 用上游的真實編號，每一類佔一個百位段，id 不再是陣列索引 (不能再寫 `NAMES[book - 1]`)：
 * - 1–66     新舊約 (canon)，由 BibleConstant 填入
 * - 101–199  次經 (apo)，之後
 * - 201–299  使徒教父 (af)，index/af_books.json (npm run gen:af)
 * - 日後新增的資源，同類用下一個百位段
 *
 * 純資料、不依賴頁面狀態 (gb 由呼叫端傳入)，所以可以單元測試。規畫見 docs/z261019a。
 *
 * @typedef {'canon'|'apo'|'af'} CorpusId
 * @typedef {Object} BookEntry
 * @property {number} id 書卷 id (上游 bid)
 * @property {CorpusId} corpus
 * @property {string} nameZh 中文全名 (繁)
 * @property {string} nameZhGb 中文全名 (簡)
 * @property {string} abbrZh 中文簡稱 (繁)
 * @property {string} abbrZhGb 中文簡稱 (簡)
 * @property {string} engs 英文縮寫
 * @property {number} chapCount 章數
 * @property {number[]} verses verses[chap - 1] = 該章最大節號；0 = 只有一個沒編號的段落 (sec=0)
 */

/** 每一類的 id 範圍 (含頭尾)。新類別在這裡加一列 */
export const CORPUS_RANGES = /** @type {const} */ ({
    canon: [1, 99],
    apo: [101, 199],
    af: [201, 299],
})

/** @type {Map<number, BookEntry>} */
const books = new Map()
/** @type {Map<string, number>} 名稱 (小寫) → id */
const nameToId = new Map()

export class BookRegistry {
    /**
     * 這個 id 屬於哪一類 (只看範圍，不管有沒有註冊)；不在任何範圍回 null
     * @param {number} id
     * @returns {CorpusId|null}
     */
    static corpusOf(id) {
        if (!Number.isInteger(id)) return null
        for (const [corpus, [lo, hi]] of Object.entries(CORPUS_RANGES)) {
            if (id >= lo && id <= hi) return /** @type {CorpusId} */ (corpus)
        }
        return null
    }

    /** 是不是新舊約 66 卷之一 (取代各處的 `book >= 1 && book <= 66`) */
    static isCanon(id) { return Number.isInteger(id) && id >= 1 && id <= 66 }

    /** 這個 id 有沒有註冊 (該類別資料已載入、且有這一卷) */
    static has(id) { return books.has(id) }

    /** @param {number} id @returns {BookEntry|null} */
    static get(id) { return books.get(id) ?? null }

    /** 某一類已註冊的全部書卷 id，由小到大 @param {CorpusId} corpus */
    static ids(corpus) {
        return [...books.values()].filter(b => b.corpus === corpus).map(b => b.id).sort((a, b) => a - b)
    }

    /** 中文全名。沒有這一卷回 '' @param {number} id @param {boolean|0|1} [gb] */
    static nameFull(id, gb = false) {
        const b = books.get(id)
        return b ? (gb ? b.nameZhGb : b.nameZh) : ''
    }
    /** 中文簡稱 */
    static nameShort(id, gb = false) {
        const b = books.get(id)
        return b ? (gb ? b.abbrZhGb : b.abbrZh) : ''
    }
    /** 英文縮寫 */
    static engs(id) { return books.get(id)?.engs ?? '' }

    /** 章數。沒有這一卷回 0 */
    static countChap(id) { return books.get(id)?.chapCount ?? 0 }
    /**
     * 該章最大節號。章不存在回 0，所以 0 有兩種意思：章不存在、或該章只有沒編號的段落。
     * 要分辨用 hasChap / isUnnumbered
     */
    static countVerse(id, chap) {
        const b = books.get(id)
        if (!b || !Number.isInteger(chap) || chap < 1 || chap > b.chapCount) return 0
        return b.verses[chap - 1]
    }
    static hasChap(id, chap) {
        const b = books.get(id)
        return !!b && Number.isInteger(chap) && chap >= 1 && chap <= b.chapCount
    }
    /** 該章只有一個沒編號的段落 (上游 sec=0)，例如使徒教父 210:14 */
    static isUnnumbered(id, chap) { return BookRegistry.hasChap(id, chap) && books.get(id).verses[chap - 1] === 0 }

    /**
     * 同一類別內的下一卷 / 上一卷 id；到頭回 null。是否跨類別銜接由呼叫端決定
     * @param {number} id
     */
    static nextBook(id) {
        const list = BookRegistry.#siblings(id)
        const i = list.indexOf(id)
        return i >= 0 && i < list.length - 1 ? list[i + 1] : null
    }
    static prevBook(id) {
        const list = BookRegistry.#siblings(id)
        const i = list.indexOf(id)
        return i > 0 ? list[i - 1] : null
    }
    static #siblings(id) {
        const c = books.get(id)?.corpus
        return c ? BookRegistry.ids(c) : []
    }

    /**
     * 上一章 [book, chap]：同一類別內，章頭接上一卷的最後一章；整類第一章回 null
     * @param {number} id
     * @param {number} chap
     * @returns {[number, number]|null}
     */
    static prevChap(id, chap) {
        if (!BookRegistry.hasChap(id, chap)) return null
        if (chap > 1) return [id, chap - 1]
        const pb = BookRegistry.prevBook(id)
        return pb == null ? null : [pb, BookRegistry.countChap(pb)]
    }
    /** 下一章 [book, chap]：章尾接下一卷第 1 章；整類最後一章回 null */
    static nextChap(id, chap) {
        if (!BookRegistry.hasChap(id, chap)) return null
        if (chap < BookRegistry.countChap(id)) return [id, chap + 1]
        const nb = BookRegistry.nextBook(id)
        return nb == null ? null : [nb, 1]
    }

    /**
     * 名稱 (中文全名 / 簡稱、繁 / 簡、英文縮寫，英文不分大小寫) → id；找不到回 -1
     * 只收註冊過的書，新舊約的特殊別名 (約壹…) 仍由 BibleConstantHelper.getBookId 處理
     * @param {string} name
     */
    static idOfName(name) { return nameToId.get(String(name).trim().toLowerCase()) ?? -1 }

    /**
     * 註冊一類書卷。同一類再註冊一次會整類取代 (重新載入)；id 不在該類範圍，或與其他類名稱衝突會丟錯
     * @param {CorpusId} corpus
     * @param {Omit<BookEntry, 'corpus'>[]} list
     */
    static registerCorpus(corpus, list) {
        const range = CORPUS_RANGES[corpus]
        if (!range) throw new Error(`未知的書卷類別: ${corpus}`)
        for (const b of list) {
            if (!Number.isInteger(b.id) || b.id < range[0] || b.id > range[1]) throw new Error(`${corpus} 的書卷 id 要在 ${range[0]}–${range[1]}: ${b.id}`)
            if (b.verses.length !== b.chapCount) throw new Error(`${b.id} ${b.nameZh}: verses 長度 ${b.verses.length} ≠ chapCount ${b.chapCount}`)
        }
        // 先清掉這一類舊的
        for (const [id, b] of books) if (b.corpus === corpus) books.delete(id)
        for (const [name, id] of nameToId) if (!books.has(id)) nameToId.delete(name)

        for (const b of list) {
            books.set(b.id, { ...b, corpus })
            for (const key of [b.nameZh, b.nameZhGb, b.abbrZh, b.abbrZhGb, b.engs]) {
                const k = key.toLowerCase()
                const old = nameToId.get(k)
                if (old != null && old !== b.id) throw new Error(`名稱 "${key}" 同時是 ${old} 與 ${b.id}`)
                nameToId.set(k, b.id)
            }
        }
    }

    /**
     * 載入使徒教父的書卷表 (index/af_books.json)，註冊成 af 類別。路徑相對於頁面 (dist/ 也是)
     * P1 要在 index.js 啟動時 await 它，並把 af_books.json 加進 dist 的複製清單
     * @param {string} [url]
     */
    static loadAfAsync(url = './index/af_books.json') {
        afLoading ??= (async () => {
            const { fetchJsonAsync } = await import('./fetchAsync.es2023.js')
            const data = await fetchJsonAsync(url)
            BookRegistry.registerCorpus('af', data.books)
        })()
        afLoading.catch(() => { afLoading = null }) // 失敗 (離線) 下次可以再試
        return afLoading
    }

    /**
     * 解析「書名 章[:節]」，只認新舊約以外已註冊的書，例如 `遺訓1:2`、`黑馬牧人書3`。
     * 新舊約由 splitReference 處理；這裡不接受範圍、多筆、英文縮寫 (有空白或數字)
     * @param {string} str
     * @returns {{book:number, chap:number, sec:number}|null} 沒寫節時 sec = 1
     */
    static parseRef(str) {
        const m = /^\s*([^\d\s;,/:：-]+?)\s*(\d+)(?:[:：](\d+))?\s*$/.exec(String(str))
        if (m == null) return null
        const book = BookRegistry.idOfName(m[1])
        if (book < 0 || BookRegistry.isCanon(book)) return null
        return { book, chap: +m[2], sec: m[3] != null ? +m[3] : 1 }
    }
}

/** @type {Promise<void>|null} */
let afLoading = null

// 新舊約：由 BibleConstant 的陣列填入 (陣列是 0 起算，id 是 1 起算)
BookRegistry.registerCorpus('canon', BibleConstant.CHINESE_BOOK_NAMES.map((nameZh, i) => ({
    id: i + 1,
    nameZh,
    nameZhGb: BibleConstant.CHINESE_BOOK_NAMES_GB[i],
    abbrZh: BibleConstant.CHINESE_BOOK_ABBREVIATIONS[i],
    abbrZhGb: BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB[i],
    engs: BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[i],
    chapCount: BibleConstant.COUNT_OF_CHAP[i],
    verses: BibleConstant.COUNT_OF_VERSE[i],
})))
