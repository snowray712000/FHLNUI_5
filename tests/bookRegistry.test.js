import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'node:fs'
import { BookRegistry, CORPUS_RANGES } from '../index/BookRegistry.es2023.js'
import { BibleConstant } from '../index/BibleConstant.es2023.js'
import { BibleConstantHelper } from '../index/BibleConstantHelper.es2023.js'

const afJson = JSON.parse(fs.readFileSync(new URL('../index/af_books.json', import.meta.url), 'utf8'))
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

// 每個測試前都重新註冊 af，免得測試註冊錯誤輸入時留下半套狀態
beforeEach(() => BookRegistry.registerCorpus('af', afJson.books))

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

describe('名稱不能重複 (跨類別也是)', () => {
    it('全部書卷的 全名 / 簡稱 / 英文縮寫 (繁簡、小寫後) 一個名字只指一卷', () => {
        const seen = new Map()
        for (const corpus of ['canon', 'af']) for (const id of BookRegistry.ids(corpus)) {
            const b = BookRegistry.get(id)
            for (const k of new Set([b.nameZh, b.nameZhGb, b.abbrZh, b.abbrZhGb, b.engs].map(s => s.toLowerCase()))) {
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

describe('沒註冊的書：安全的預設值，不丟錯', () => {
    it('apo (之後才有)', () => {
        expect(BookRegistry.has(101)).toBe(false)
        expect(BookRegistry.get(101)).toBeNull()
        expect(BookRegistry.ids('apo')).toEqual([])
        expect(BookRegistry.nameFull(101)).toBe('')
        expect(BookRegistry.nameShort(101)).toBe('')
        expect(BookRegistry.engs(101)).toBe('')
        expect(BookRegistry.countChap(101)).toBe(0)
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
