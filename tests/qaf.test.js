import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'node:fs'
import { BookRegistry } from '../index/BookRegistry.es2023.js'
import { qafUrl, normalizeQaf, QAF_URL, AF_VERSION, AF_VERSION_NAME } from '../index/qafAsync.es2023.js'
import { lectureVersions } from '../index/lectureVersions.es2023.js'

beforeAll(() => {
    BookRegistry.registerCorpus('af', JSON.parse(fs.readFileSync(new URL('../index/af_books.json', import.meta.url), 'utf8')).books)
})

describe('qafUrl', () => {
    it('整章：不送 sec', () => {
        expect(qafUrl({ bid: 212, chap: 1 })).toBe(`${QAF_URL}?bid=212&chap=1&strong=0`)
        expect(qafUrl({ bid: 212, chap: 1, sec: null })).toBe(`${QAF_URL}?bid=212&chap=1&strong=0`)
        expect(qafUrl({ bid: 212, chap: 1, sec: '  ' })).toBe(`${QAF_URL}?bid=212&chap=1&strong=0`)
    })
    it('用 /api/，不是 /json/ (/json/qaf.php 不認 bid，永遠回革利免一書)', () => {
        expect(QAF_URL).toBe('https://bible.fhl.net/api/qaf.php')
    })
    it('節：單節、範圍、多段、數字、前後空白', () => {
        for (const sec of ['1', '1-5', '1,3,5', '1-2,5,8-10', 3, ' 2-4 ']) {
            expect(qafUrl({ bid: 201, chap: 2, sec })).toContain(`sec=${encodeURIComponent(String(sec).trim())}`)
        }
    })
    it('節的格式不對 → 丟錯 (上游會把 SQL 片段放進 status)', () => {
        for (const sec of ['a', '1-', '-1', '1,,2', "1'; drop", '1 2', '1-2-3']) {
            expect(() => qafUrl({ bid: 212, chap: 1, sec }), sec).toThrow(/節/)
        }
    })
    it('不是使徒教父的書 / 沒註冊的書 → 丟錯', () => {
        for (const bid of [1, 45, 66, 101, 200, 218, 300, NaN, '212']) expect(() => qafUrl({ bid, chap: 1 }), String(bid)).toThrow()
    })
    it('章要是 1 以上的整數 (chap=0 上游會當成 1，不能拿來取導論)', () => {
        for (const chap of [0, -1, 1.5, NaN, '1', undefined]) expect(() => qafUrl({ bid: 212, chap }), String(chap)).toThrow(/章/)
    })
})

describe('normalizeQaf', () => {
    const up = {
        status: 'success', record_count: '2', v_name: '黃錫木主編《使徒教父著作》', version: 'afhuang', proc: 0,
        record: [
            { engs: 'Did.', bid: 212, chineses: '十二使徒遺訓', chap: 1, sec: 1, bible_text: '甲' },
            { engs: 'Did.', bid: '212', chineses: '十二使徒遺訓', chap: '1', sec: '2', bible_text: '乙' }, // 上游數字有時是字串
        ],
        prev: { chineses: '十二使徒遺訓', bid: 212, engs: 'Did.', chap: 0, sec: 0 },
        next: { chineses: '十二使徒遺訓', bid: 212, engs: 'Did.', chap: 2, sec: 1 },
    }
    it('record 加 book、數字欄位統一成數字', () => {
        const r = normalizeQaf(up)
        expect(r.record).toEqual([
            { book: 212, chap: 1, sec: 1, bible_text: '甲' },
            { book: 212, chap: 1, sec: 2, bible_text: '乙' },
        ])
        expect(r.record_count).toBe(2)
        expect(r.version).toBe('afhuang')
        expect(r.v_name).toBe('黃錫木主編《使徒教父著作》')
    })
    it('prev / next 轉成 {book, chap, sec}；沒有就是 null (210 沒有 prev 欄位)', () => {
        expect(normalizeQaf(up).next).toEqual({ book: 212, chap: 2, sec: 1 })
        expect(normalizeQaf(up).prev).toEqual({ book: 212, chap: 0, sec: 0 })
        const r = normalizeQaf({ status: 'success', record: [] })
        expect(r.prev).toBeNull()
        expect(r.next).toBeNull()
    })
    it('章不存在：success、0 筆，不是錯誤', () => {
        const r = normalizeQaf({ status: 'success', record_count: 0, record: [] })
        expect(r.record).toEqual([])
        expect(r.record_count).toBe(0)
    })
    it('沒給 version / v_name 時補預設值', () => {
        const r = normalizeQaf({ status: 'success', record: [] })
        expect(r.version).toBe(AF_VERSION)
        expect(r.v_name).toBe(AF_VERSION_NAME)
    })
    it('status 不是 success → 丟錯 (含上游洩漏的訊息也不原樣吐出以外的內容)', () => {
        expect(() => normalizeQaf({ status: 'Fail: Empty Query' })).toThrow(/Fail: Empty Query/)
        expect(() => normalizeQaf(null)).toThrow(/qaf/)
        expect(() => normalizeQaf({})).toThrow(/沒有 status/)
    })
    it('sec=0 (只有一個沒編號的段落) 保留 0', () => {
        const r = normalizeQaf({ status: 'success', record: [{ bid: 210, chap: 14, sec: 0, bible_text: '我是請革勒士…' }] })
        expect(r.record[0]).toMatchObject({ book: 210, chap: 14, sec: 0 })
    })
    it('不改傳入的物件', () => {
        const copy = structuredClone(up)
        normalizeQaf(up)
        expect(up).toEqual(copy)
    })
})

describe('lectureVersions：使徒教父不是譯本', () => {
    const ps = book => ({ bookIndex: book, version: ['unv', 'kjv'] })
    it('新舊約用使用者選的譯本', () => {
        expect(lectureVersions(ps(1))).toEqual(['unv', 'kjv'])
        expect(lectureVersions(ps(66))).toEqual(['unv', 'kjv'])
    })
    it('使徒教父只有 afhuang，不管選了什麼', () => {
        expect(lectureVersions(ps(212))).toEqual([AF_VERSION])
        expect(lectureVersions(ps(201))).toEqual(['afhuang'])
    })
})

describe('BookRegistry.parseRef (hash 用)', () => {
    it('書名 章:節', () => {
        expect(BookRegistry.parseRef('遺訓1:2')).toEqual({ book: 212, chap: 1, sec: 2 })
        expect(BookRegistry.parseRef('黑馬牧人書 54:1')).toEqual({ book: 214, chap: 54, sec: 1 })
        expect(BookRegistry.parseRef('遗训3：4')).toEqual({ book: 212, chap: 3, sec: 4 }) // 簡體書名、全形冒號
        expect(BookRegistry.parseRef('Did.1:1')).toEqual({ book: 212, chap: 1, sec: 1 })
    })
    it('沒寫節 = 1；節 0 (沒編號的段落) 保留', () => {
        expect(BookRegistry.parseRef('帕皮4')).toEqual({ book: 216, chap: 4, sec: 1 })
        expect(BookRegistry.parseRef('坡腓14:0')).toEqual({ book: 210, chap: 14, sec: 0 })
    })
    it('新舊約交給 splitReference，這裡不認', () => {
        expect(BookRegistry.parseRef('羅1:1')).toBeNull()
        expect(BookRegistry.parseRef('創世記1:1')).toBeNull()
    })
    it('範圍、多筆、沒章、亂寫 → null', () => {
        for (const s of ['遺訓1:2-3', '遺訓1:2;黑馬3', '遺訓', '1:2', '', '不存在1:1', '伊1:1', '遺訓1,2']) expect(BookRegistry.parseRef(s), s).toBeNull()
    })
})
