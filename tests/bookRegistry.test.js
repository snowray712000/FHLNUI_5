import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import { BookRegistry, CORPUS_RANGES } from '../index/BookRegistry.es2023.js'
import { BibleConstant } from '../index/BibleConstant.es2023.js'
import { BibleConstantHelper } from '../index/BibleConstantHelper.es2023.js'

const afJson = JSON.parse(fs.readFileSync(new URL('../index/af_books.json', import.meta.url), 'utf8'))
const apoJson = JSON.parse(fs.readFileSync(new URL('../index/apo_books.json', import.meta.url), 'utf8'))
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

// 每個測試前都重新註冊 af、apo，免得測試註冊錯誤輸入時留下半套狀態 (名稱與別類衝突的話，這裡就會丟錯)
beforeEach(() => {
    BookRegistry.setNameStyle('fhl')
    BookRegistry.registerCorpus('af', afJson.books)
    BookRegistry.registerCorpus('apo', apoJson.books)
})

describe('corpusOf / isCanon', () => {
    it('依百位段分類', () => {
        expect(BookRegistry.corpusOf(1)).toBe('canon')
        expect(BookRegistry.corpusOf(66)).toBe('canon')
        expect(BookRegistry.corpusOf(101)).toBe('apo')
        expect(BookRegistry.corpusOf(199)).toBe('apo')
        expect(BookRegistry.corpusOf(201)).toBe('af')
        expect(BookRegistry.corpusOf(217)).toBe('af')
    })
    it('不在任何範圍 / 不是整數', () => {
        for (const id of [0, -1, 100, 200, 300, 1.5, NaN, null, undefined, '212']) expect(BookRegistry.corpusOf(id)).toBeNull()
    })
    it('範圍互不重疊', () => {
        const rs = Object.values(CORPUS_RANGES).sort((a, b) => a[0] - b[0])
        for (let i = 1; i < rs.length; i++) expect(rs[i][0]).toBeGreaterThan(rs[i - 1][1])
    })
    it('isCanon 只有 1–66', () => {
        expect(range(1, 66).every(id => BookRegistry.isCanon(id))).toBe(true)
        for (const id of [0, 67, 99, 101, 212, 1.5, null]) expect(BookRegistry.isCanon(id)).toBe(false)
    })
})

describe('新舊約 (由 BibleConstant 填入)', () => {
    it('66 卷', () => expect(BookRegistry.ids('canon')).toEqual(range(1, 66)))
    it('名稱', () => {
        expect(BookRegistry.nameFull(1)).toBe('創世記')
        expect(BookRegistry.nameFull(1, true)).toBe('创世记')
        expect(BookRegistry.nameShort(43)).toBe('約')
        expect(BookRegistry.nameShort(66, 1)).toBe('启')
        expect(BookRegistry.engs(19)).toBe('Ps')
    })
    it('章節數與 BibleConstantHelper 一致 (它之後會委派給註冊表，行為不能變)', () => {
        for (const id of range(1, 66)) {
            expect(BookRegistry.countChap(id)).toBe(BibleConstantHelper.getCountChapOfBook(id))
            for (let c = 1; c <= BookRegistry.countChap(id); c++) {
                expect(BookRegistry.countVerse(id, c)).toBe(BibleConstantHelper.getCountVerseOfChap(id, c))
            }
        }
        expect(BookRegistry.countChap(19)).toBe(150)
        expect(BookRegistry.countVerse(19, 119)).toBe(176)
    })
})

describe('使徒教父 (index/af_books.json)', () => {
    it('201–217 連續 17 本，都屬於 af', () => {
        expect(BookRegistry.ids('af')).toEqual(range(201, 217))
        expect(afJson.books.map(b => b.id)).toEqual(range(201, 217))
        for (const id of range(201, 217)) expect(BookRegistry.corpusOf(id)).toBe('af')
    })
    it('每本都有名稱、簡稱、英文縮寫，verses 與 chapCount 一致', () => {
        for (const b of afJson.books) {
            for (const k of ['nameZh', 'nameZhGb', 'abbrZh', 'abbrZhGb', 'engs']) expect(b[k], `${b.id} ${k}`).toBeTruthy()
            expect(b.verses).toHaveLength(b.chapCount)
            expect(b.verses.every(n => Number.isInteger(n) && n >= 0)).toBe(true)
        }
    })
    it('章數 (2026-10-19 實測)', () => {
        const chaps = Object.fromEntries(afJson.books.map(b => [b.id, b.chapCount]))
        expect(chaps).toEqual({
            201: 65, 202: 20, 203: 21, 204: 15, 205: 13, 206: 10, 207: 11, 208: 13, 209: 8,
            210: 14, 211: 22, 212: 16, 213: 21, 214: 114, 215: 12, 216: 26, 217: 5,
        })
    })
    it('節數', () => {
        expect(BookRegistry.countVerse(212, 1)).toBe(6)   // 十二使徒遺訓 1 章 6 節
        expect(BookRegistry.countVerse(201, 16)).toBe(17)
        expect(BookRegistry.countVerse(216, 3)).toBe(17)
        expect(BookRegistry.countVerse(206, 10)).toBe(3)
    })
    it('只有沒編號段落的章 (sec=0)：節數 0，isUnnumbered，且 sec0 清單吻合', () => {
        expect(BookRegistry.isUnnumbered(210, 14)).toBe(true)
        expect(BookRegistry.isUnnumbered(211, 4)).toBe(true)
        expect(BookRegistry.isUnnumbered(211, 21)).toBe(true)
        expect(BookRegistry.isUnnumbered(212, 1)).toBe(false)
        expect(BookRegistry.countVerse(210, 14)).toBe(0)
        for (const b of afJson.books) {
            expect(b.verses.flatMap((n, i) => (n === 0 ? [i + 1] : []))).toEqual(b.sec0)
        }
    })
    it('章不存在：countVerse 0、hasChap false', () => {
        for (const [id, chap] of [[212, 0], [212, 17], [212, -1], [212, 1.5], [999, 1], [1, 0]]) {
            expect(BookRegistry.countVerse(id, chap)).toBe(0)
            expect(BookRegistry.hasChap(id, chap)).toBe(false)
        }
        expect(BookRegistry.hasChap(212, 16)).toBe(true)
        expect(BookRegistry.isUnnumbered(212, 99)).toBe(false)
    })
    it('名稱照上游 (衆 是異體字)；簡體名沒有殘留的繁體字', () => {
        expect(BookRegistry.nameFull(217)).toBe('衆長老的傳統')
        expect(BookRegistry.nameFull(217, true)).toBe('众长老的传统')
        expect(BookRegistry.nameFull(214, true)).toBe('黑马牧人书')
        expect(BookRegistry.nameFull(206, true)).toBe('伊格那丢致罗马人书')
        for (const b of afJson.books) expect(b.nameZhGb, b.nameZh).not.toMatch(/[書記馬內羅鐵丟遺殘傳統衆長]/)
        expect(BookRegistry.engs(212)).toBe('Did.')
    })
    it('檔案本身的標記', () => {
        expect(afJson.corpus).toBe('af')
        expect(afJson.idRange).toEqual(CORPUS_RANGES.af)
    })
})

describe('次經 (index/apo_books.json)', () => {
    it('101–115 連續 15 本，都屬於 apo', () => {
        expect(BookRegistry.ids('apo')).toEqual(range(101, 115))
        expect(apoJson.books.map(b => b.id)).toEqual(range(101, 115))
        for (const id of range(101, 115)) expect(BookRegistry.corpusOf(id)).toBe('apo')
        expect(apoJson.corpus).toBe('apo')
        expect(apoJson.idRange).toEqual(CORPUS_RANGES.apo)
    })
    it('每本都有兩套書名 + 簡體 + 英文縮寫，verses 與 chapCount 一致，沒有 sec=0', () => {
        for (const b of apoJson.books) {
            for (const k of ['nameZh', 'nameZhGb', 'abbrZh', 'abbrZhGb', 'nameAlt', 'nameAltGb', 'abbrAlt', 'abbrAltGb', 'engs']) expect(b[k], `${b.id} ${k}`).toBeTruthy()
            expect(b.verses).toHaveLength(b.chapCount)
            expect(b.verses.every(n => Number.isInteger(n) && n >= 1)).toBe(true) // 次經沒有 sec=0 的章
        }
    })
    it('章數 (2026-10-19 實測)', () => {
        expect(Object.fromEntries(apoJson.books.map(b => [b.id, b.chapCount]))).toEqual({
            101: 16, 102: 15, 103: 14, 104: 16, 105: 51, 106: 19, 107: 5, 108: 16, 109: 5,
            110: 1, 111: 1, 112: 1, 113: 1, 114: 1, 115: 6,
        })
    })
    it('節數取 c1933 與 chdc 的聯集最大值 (chdc 多出 101:1:64、108:9:47)', () => {
        expect(BookRegistry.countVerse(101, 1)).toBe(64)
        expect(BookRegistry.countVerse(108, 9)).toBe(47)
        expect(BookRegistry.countVerse(107, 1)).toBe(107)
        expect(BookRegistry.countVerse(107, 2)).toBe(1)
        expect(BookRegistry.countVerse(110, 1)).toBe(73)
        expect(BookRegistry.countVerse(105, 51)).toBe(30)
    })
    it('併入上節共 26 節；缺章只有 chdc 的 107:1–2 與 114:1', () => {
        expect(apoJson.books.flatMap(b => b.merged).length).toBe(26)
        expect(BookRegistry.get(101).merged).toContain('1:6')
        expect(BookRegistry.get(107).missing).toEqual({ c1933: [], chdc: [1, 2] })
        expect(BookRegistry.get(114).missing).toEqual({ c1933: [], chdc: [1] })
        for (const b of apoJson.books) expect(b.missing.c1933).toEqual([])
    })
    it('預設顯示信望愛站名，簡稱用上游 chineses', () => {
        expect(BookRegistry.nameFull(103)).toBe('多比傳')
        expect(BookRegistry.nameFull(103, true)).toBe('多比传')
        expect(BookRegistry.nameShort(101)).toBe('馬一')
        expect(BookRegistry.nameShort(111, true)).toBe('祷')
        expect(BookRegistry.engs(115)).toBe('Re')
    })
    it('setNameStyle("alt") 只換次經的顯示；新舊約、使徒教父不變', () => {
        BookRegistry.setNameStyle('alt')
        expect(BookRegistry.getNameStyle()).toBe('alt')
        expect(BookRegistry.nameFull(103)).toBe('多俾亞傳')
        expect(BookRegistry.nameFull(104, true)).toBe('友弟德传')
        expect(BookRegistry.nameShort(105)).toBe('德訓')
        expect(BookRegistry.nameFull(1)).toBe('創世記')
        expect(BookRegistry.nameFull(212)).toBe('十二使徒遺訓')
        expect(BookRegistry.nameShort(212)).toBe('遺訓')
        BookRegistry.setNameStyle('fhl')
        expect(BookRegistry.nameFull(103)).toBe('多比傳')
        expect(() => BookRegistry.setNameStyle('zzz')).toThrow(/未知/)
        expect(BookRegistry.getNameStyle()).toBe('fhl')
    })
    it('兩套名字 (繁 / 簡 / 簡稱 / 英文) 不論顯示哪一套都認得', () => {
        for (const style of ['fhl', 'alt']) {
            BookRegistry.setNameStyle(style)
            expect(BookRegistry.idOfName('猶滴傳')).toBe(104)
            expect(BookRegistry.idOfName('友弟德傳')).toBe(104)
            expect(BookRegistry.idOfName('友弟德传')).toBe(104)
            expect(BookRegistry.idOfName('滴')).toBe(104)
            expect(BookRegistry.idOfName('友弟')).toBe(104)
            expect(BookRegistry.idOfName('JTH')).toBe(104)
            expect(BookRegistry.idOfName('瑪加伯上')).toBe(101)
            expect(BookRegistry.idOfName('瑪喀比傳上卷')).toBe(101)
            expect(BookRegistry.idOfName('马一')).toBe(101)
            expect(BookRegistry.idOfName('德訓篇')).toBe(105)
            expect(BookRegistry.idOfName('便西拉智訓')).toBe(105)
        }
    })
    it('簡稱不搶新舊約：多 = 提多書、拉 = 以斯拉記、斯 = 以斯帖記', () => {
        expect(BookRegistry.idOfName('多')).toBe(56)
        expect(BookRegistry.idOfName('拉')).toBe(15)
        expect(BookRegistry.idOfName('斯')).toBe(17)
        expect(BookRegistry.idOfName('拉上')).toBe(107)
        expect(BookRegistry.idOfName('斯補')).toBe(115)
    })
    it('parseRef：兩套書名都能跳', () => {
        expect(BookRegistry.parseRef('猶滴傳1:2')).toEqual({ book: 104, chap: 1, sec: 2 })
        expect(BookRegistry.parseRef('友弟德傳3')).toEqual({ book: 104, chap: 3, sec: 1 })
        expect(BookRegistry.parseRef('馬一2:3')).toEqual({ book: 101, chap: 2, sec: 3 })
    })
    it('同類別內上一卷 / 下一卷、上一章 / 下一章；不跨進 canon、af', () => {
        expect(BookRegistry.nextBook(103)).toBe(104)
        expect(BookRegistry.prevBook(101)).toBeNull()
        expect(BookRegistry.nextBook(115)).toBeNull()
        expect(BookRegistry.nextChap(101, 16)).toEqual([102, 1])
        expect(BookRegistry.prevChap(102, 1)).toEqual([101, 16])
        expect(BookRegistry.prevChap(101, 1)).toBeNull()
        expect(BookRegistry.nextChap(115, 6)).toBeNull()
        expect(BookRegistry.nextChap(110, 1)).toEqual([111, 1]) // 單章書也銜接
    })
    it('clampAddr', () => {
        expect(BookRegistry.clampAddr(110, 9, 999)).toEqual({ book: 110, chap: 1, sec: 73 })
        expect(BookRegistry.clampAddr(105, 99, 99)).toEqual({ book: 105, chap: 51, sec: 30 })
    })
})

describe('名稱不能重複 (跨類別也是)', () => {
    it('全部書卷的 全名 / 簡稱 / 英文縮寫 (繁簡、小寫後) 一個名字只指一卷', () => {
        const seen = new Map()
        for (const corpus of ['canon', 'af', 'apo']) for (const id of BookRegistry.ids(corpus)) {
            const b = BookRegistry.get(id)
            const keys = [b.nameZh, b.nameZhGb, b.abbrZh, b.abbrZhGb, b.engs, b.nameAlt, b.nameAltGb, b.abbrAlt, b.abbrAltGb]
            for (const k of new Set(keys.filter(Boolean).map(s => s.toLowerCase()))) {
                expect(seen.has(k) ? `${k} → ${seen.get(k)} 與 ${id}` : null).toBeNull()
                seen.set(k, id)
            }
        }
    })
    it('idOfName', () => {
        expect(BookRegistry.idOfName('革一')).toBe(201)
        expect(BookRegistry.idOfName('DID.')).toBe(212)
        expect(BookRegistry.idOfName('遗训')).toBe(212)
        expect(BookRegistry.idOfName(' 黑馬牧人書 ')).toBe(214)
        expect(BookRegistry.idOfName('創世記')).toBe(1)
        expect(BookRegistry.idOfName('1 Sam')).toBe(9)
        expect(BookRegistry.idOfName('伊')).toBe(-1) // 7 封伊格那丟書信都可能，不猜
        expect(BookRegistry.idOfName('不存在')).toBe(-1)
    })
})

describe('同類別內的上一卷 / 下一卷', () => {
    it('af', () => {
        expect(BookRegistry.nextBook(212)).toBe(213)
        expect(BookRegistry.prevBook(212)).toBe(211)
        expect(BookRegistry.prevBook(201)).toBeNull()
        expect(BookRegistry.nextBook(217)).toBeNull()
    })
    it('canon 到頭不會跨進 af', () => {
        expect(BookRegistry.nextBook(66)).toBeNull()
        expect(BookRegistry.prevBook(1)).toBeNull()
        expect(BookRegistry.nextBook(39)).toBe(40)
    })
    it('沒註冊的書', () => {
        expect(BookRegistry.nextBook(150)).toBeNull()
        expect(BookRegistry.prevBook(999)).toBeNull()
    })
})

describe('上一章 / 下一章', () => {
    it('章中間', () => {
        expect(BookRegistry.nextChap(212, 3)).toEqual([212, 4])
        expect(BookRegistry.prevChap(212, 3)).toEqual([212, 2])
        expect(BookRegistry.nextChap(19, 150)).toEqual([20, 1])
    })
    it('跨書：af 內銜接，頭尾回 null', () => {
        expect(BookRegistry.nextChap(201, 65)).toEqual([202, 1])
        expect(BookRegistry.prevChap(202, 1)).toEqual([201, 65])
        expect(BookRegistry.prevChap(201, 1)).toBeNull()
        expect(BookRegistry.nextChap(217, 5)).toBeNull()
    })
    it('canon 與以前的行為一樣：創 1 沒有上一章、啟 22 沒有下一章，太 1 上一章是瑪 4', () => {
        expect(BookRegistry.prevChap(1, 1)).toBeNull()
        expect(BookRegistry.nextChap(66, 22)).toBeNull()
        expect(BookRegistry.prevChap(40, 1)).toEqual([39, 4])
        expect(BookRegistry.nextChap(39, 4)).toEqual([40, 1])
    })
    it('不存在的章 / 書回 null', () => {
        expect(BookRegistry.nextChap(212, 17)).toBeNull()
        expect(BookRegistry.prevChap(212, 0)).toBeNull()
        expect(BookRegistry.nextChap(999, 1)).toBeNull()
    })
})

describe('clampAddr (hash、搜尋框跳轉共用)', () => {
    it('夾在有效範圍', () => {
        expect(BookRegistry.clampAddr(212, 99, 99)).toEqual({ book: 212, chap: 16, sec: 8 })
        expect(BookRegistry.clampAddr(212, 0, 0)).toEqual({ book: 212, chap: 1, sec: 1 })
        expect(BookRegistry.clampAddr(45, 1, 1)).toEqual({ book: 45, chap: 1, sec: 1 })
        expect(BookRegistry.clampAddr(19, 119, 999)).toEqual({ book: 19, chap: 119, sec: 176 })
    })
    it('沒註冊的書夾在 1–66；只有沒編號段落的章節是 0', () => {
        expect(BookRegistry.clampAddr(999, 1, 1).book).toBe(66)
        expect(BookRegistry.clampAddr(0, 1, 1).book).toBe(1)
        expect(BookRegistry.clampAddr(210, 14, 5)).toEqual({ book: 210, chap: 14, sec: 0 })
    })
})

describe('沒註冊的書：安全的預設值，不丟錯', () => {
    it('apo 範圍內但沒有這一卷 (116)；apo 整類還沒載入時也一樣', () => {
        for (const reg of [() => {}, () => BookRegistry.registerCorpus('apo', [])]) {
            reg()
            expect(BookRegistry.has(116)).toBe(false)
            expect(BookRegistry.get(116)).toBeNull()
            expect(BookRegistry.nameFull(116)).toBe('')
            expect(BookRegistry.nameShort(116)).toBe('')
            expect(BookRegistry.engs(116)).toBe('')
            expect(BookRegistry.countChap(116)).toBe(0)
            expect(BookRegistry.corpusOf(116)).toBe('apo') // 只看範圍
        }
        expect(BookRegistry.ids('apo')).toEqual([])
        expect(BookRegistry.nameFull(101)).toBe('')
        expect(BookRegistry.idOfName('猶滴傳')).toBe(-1)
    })
})

describe('registerCorpus', () => {
    const one = over => ({ id: 212, nameZh: '甲', nameZhGb: '甲', abbrZh: '甲簡', abbrZhGb: '甲简', engs: 'X.', chapCount: 1, verses: [3], ...over })

    it('id 不在該類範圍 → 丟錯，原本的資料不動', () => {
        expect(() => BookRegistry.registerCorpus('af', [one({ id: 300 })])).toThrow(/201–299/)
        expect(() => BookRegistry.registerCorpus('af', [one({ id: 66 })])).toThrow()
        expect(BookRegistry.ids('af')).toEqual(range(201, 217))
    })
    it('verses 長度與 chapCount 不符 → 丟錯', () => {
        expect(() => BookRegistry.registerCorpus('af', [one({ chapCount: 2 })])).toThrow(/chapCount/)
    })
    it('未知類別 → 丟錯', () => {
        expect(() => BookRegistry.registerCorpus('zzz', [])).toThrow(/未知/)
    })
    it('名稱與別類衝突 → 丟錯 (例如 af 的書取名叫「創世記」)', () => {
        expect(() => BookRegistry.registerCorpus('af', [one({ nameZh: '創世記' })])).toThrow(/同時是/)
    })
    it('同一類再註冊 = 整類取代，舊名稱不留', () => {
        BookRegistry.registerCorpus('af', [one()])
        expect(BookRegistry.ids('af')).toEqual([212])
        expect(BookRegistry.idOfName('甲簡')).toBe(212)
        expect(BookRegistry.idOfName('革一')).toBe(-1)
        expect(BookRegistry.idOfName('創世記')).toBe(1) // canon 不受影響
        expect(BookRegistry.nameFull(201)).toBe('')
    })
    it('canon 沒被弄亂', () => {
        BookRegistry.registerCorpus('af', [])
        expect(BookRegistry.ids('canon')).toEqual(range(1, 66))
        expect(BibleConstant.CHINESE_BOOK_NAMES).toHaveLength(66)
    })
})

describe('loadCorpusAsync', () => {
    afterEach(() => vi.unstubAllGlobals())
    const okFetch = data => vi.fn(async () => ({ ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) }))

    it('載入後註冊；同一類只載入一次；失敗不留快取、下次可再試', async () => {
        BookRegistry.registerCorpus('apo', []) // 先清空
        const bad = vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}), text: async () => '' }))
        vi.stubGlobal('fetch', bad)
        await expect(BookRegistry.loadApoAsync('./x/apo_books.json')).rejects.toThrow()
        expect(BookRegistry.ids('apo')).toEqual([])

        const good = okFetch(apoJson)
        vi.stubGlobal('fetch', good)
        await BookRegistry.loadApoAsync('./x/apo_books.json')
        expect(BookRegistry.ids('apo')).toEqual(range(101, 115))
        await BookRegistry.loadApoAsync('./x/apo_books.json')
        expect(good).toHaveBeenCalledTimes(1)
    })
    it('沒有書卷表檔案的類別 → 丟錯', () => {
        expect(() => BookRegistry.loadCorpusAsync('canon')).toThrow(/沒有書卷表/)
    })
})
