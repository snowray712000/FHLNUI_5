import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'node:fs'
import { BookRegistry } from '../index/BookRegistry.es2023.js'
import { qsubUrl, normalizeQsub, QSUB_URL, APO_VERSION, APO_VERSION_NAME, apoVersionName, isApoVersion, APO_VERSIONS } from '../index/qsubAsync.es2023.js'
import { qafUrl } from '../index/qafAsync.es2023.js'
import { lectureVersions, canonVersions, apoVersionsOf } from '../index/lectureVersions.es2023.js'
import { checkSec, checkChap } from '../index/corpusApi.es2023.js'

const read = f => JSON.parse(fs.readFileSync(new URL(f, import.meta.url), 'utf8')).books
beforeAll(() => {
    BookRegistry.registerCorpus('af', read('../index/af_books.json'))
    BookRegistry.registerCorpus('apo', read('../index/apo_books.json'))
})

describe('qsubUrl', () => {
    it('整章：不送 sec，預設文本 c1933 不送 version，不簡體不送 gb', () => {
        expect(qsubUrl({ bid: 103, chap: 1 })).toBe(`${QSUB_URL}?bid=103&chap=1&strong=0`)
        expect(qsubUrl({ bid: 103, chap: 1, sec: null, gb: 0 })).toBe(`${QSUB_URL}?bid=103&chap=1&strong=0`)
        expect(qsubUrl({ bid: 103, chap: 1, sec: '  ' })).toBe(`${QSUB_URL}?bid=103&chap=1&strong=0`)
    })
    it('用 /api/，不是 /json/', () => {
        expect(QSUB_URL).toBe('https://bible.fhl.net/api/qsub.php')
    })
    it('節：單節、範圍、多段、數字、前後空白', () => {
        for (const sec of ['1', '1-5', '1,3,5', '1-2,5,8-10', 3, ' 2-4 ']) {
            expect(qsubUrl({ bid: 101, chap: 2, sec })).toContain(`sec=${encodeURIComponent(String(sec).trim())}`)
        }
    })
    it('簡體：gb=1 (上游直接回簡體)；文本 chdc 才送 version', () => {
        expect(qsubUrl({ bid: 103, chap: 1, gb: 1 })).toBe(`${QSUB_URL}?bid=103&chap=1&strong=0&gb=1`)
        expect(qsubUrl({ bid: 103, chap: 1, version: 'chdc', gb: true })).toBe(`${QSUB_URL}?bid=103&chap=1&strong=0&version=chdc&gb=1`)
    })
    it('節的格式不對 → 丟錯 (上游會把 SQL 片段放進 status)', () => {
        for (const sec of ['a', '1-', '-1', '1,,2', "1'; drop", '1 2', '1-2-3']) {
            expect(() => qsubUrl({ bid: 103, chap: 1, sec }), sec).toThrow(/節/)
        }
    })
    it('bid 不是次經的書 → 丟錯 (上游對 116 等不報錯，靜默回第 101 卷)', () => {
        for (const bid of [1, 45, 66, 100, 116, 199, 200, 212, 300, NaN, '103', undefined]) {
            expect(() => qsubUrl({ bid, chap: 1 }), String(bid)).toThrow(/次經/)
        }
    })
    it('範圍內但沒註冊的 (次經書卷表沒載入) → 丟錯', () => {
        BookRegistry.registerCorpus('apo', [])
        try { expect(() => qsubUrl({ bid: 103, chap: 1 })).toThrow(/次經/) }
        finally { BookRegistry.registerCorpus('apo', read('../index/apo_books.json')) }
    })
    it('章要是 1 以上的整數 (chap=0 上游會當成 1)', () => {
        for (const chap of [0, -1, 1.5, NaN, '1', undefined]) expect(() => qsubUrl({ bid: 103, chap }), String(chap)).toThrow(/章/)
    })
    it('不認得的文本 → 丟錯', () => {
        expect(() => qsubUrl({ bid: 103, chap: 1, version: 'unv' })).toThrow(/文本/)
    })
    it('qaf 與 qsub 各管各的書', () => {
        expect(() => qafUrl({ bid: 103, chap: 1 })).toThrow()
        expect(() => qsubUrl({ bid: 212, chap: 1 })).toThrow()
    })
})

describe('normalizeQsub', () => {
    const up = {
        status: 'success', record_count: 3, v_name: '1933年聖公會出版', version: 'c1933', proc: 0,
        record: [
            { engs: 'Tb', bid: 103, chineses: '比', chap: 1, sec: 1, bible_text: '甲' },
            { engs: 'Tb', bid: '103', chineses: '比', chap: '1', sec: '2', bible_text: '乙' }, // 數字有時是字串
            { engs: 'Tb', bid: 103, chineses: '比', chap: 1, sec: 3, bible_text: 'a' },       // 併入上節
        ],
        prev: { chineses: '馬二', bid: 102, engs: '2Mc', chap: 15, sec: 39 },
        next: { chineses: '比', bid: 103, engs: 'Tb', chap: 1, sec: 4 },
    }
    it('record 加 book、數字統一成數字，文字原樣 (含 a)', () => {
        const r = normalizeQsub(up)
        expect(r.record).toEqual([
            { book: 103, chap: 1, sec: 1, bible_text: '甲' },
            { book: 103, chap: 1, sec: 2, bible_text: '乙' },
            { book: 103, chap: 1, sec: 3, bible_text: 'a' },
        ])
        expect(r.version).toBe('c1933')
        expect(r.v_name).toBe('1933年聖公會出版')
    })
    it('prev / next 跨書；101 第 1 章沒有 prev', () => {
        expect(normalizeQsub(up).prev).toEqual({ book: 102, chap: 15, sec: 39 })
        const first = normalizeQsub({ status: 'success', record: [], next: { bid: 101, chap: 1, sec: 2 } })
        expect(first.prev).toBeNull()
        expect(first.next).toEqual({ book: 101, chap: 1, sec: 2 })
    })
    it('章不存在：success、0 筆，不是錯誤', () => {
        const r = normalizeQsub({ status: 'success', record_count: 0, record: [] })
        expect(r.record).toEqual([])
        expect(r.record_count).toBe(0)
    })
    it('沒給 version / v_name 時補預設值 (c1933 / 1933年聖公會出版)', () => {
        const r = normalizeQsub({ status: 'success', record: [] })
        expect(r.version).toBe(APO_VERSION)
        expect(r.v_name).toBe(APO_VERSION_NAME)
    })
    it('status 不是 success → 丟錯', () => {
        expect(() => normalizeQsub({ status: 'Fail: record count > 500' })).toThrow(/qsub: Fail/)
        expect(() => normalizeQsub(null)).toThrow(/qsub/)
        expect(() => normalizeQsub({})).toThrow(/沒有 status/)
    })
    it('不改傳入的物件', () => {
        const copy = structuredClone(up)
        normalizeQsub(up)
        expect(up).toEqual(copy)
    })
    it('chdc：沒給 version / v_name 時補 chdc 的名稱 (沒有資料的章上游不一定帶)', () => {
        const r = normalizeQsub({ status: 'success', record: [] }, 'chdc')
        expect(r.version).toBe('chdc')
        expect(r.v_name).toBe('1933年次經全書')
    })
})

describe('次經的文本', () => {
    it('c1933 / chdc 的名稱 (繁、簡)，不認得的原樣回', () => {
        expect(apoVersionName('c1933')).toBe('1933年聖公會出版')
        expect(apoVersionName('c1933', true)).toBe('1933年圣公会出版')
        expect(apoVersionName('chdc')).toBe('1933年次經全書')
        expect(apoVersionName('chdc', true)).toBe('1933年次经全书')
        expect(apoVersionName('unv')).toBe('unv')
    })
    it('isApoVersion', () => {
        expect(APO_VERSIONS.every(isApoVersion)).toBe(true)
        for (const v of ['unv', 'afhuang', '', undefined]) expect(isApoVersion(v), String(v)).toBe(false)
    })
})

describe('lectureVersions：次經可選 c1933 / chdc，新舊約不並排次經的文本', () => {
    const ps = (book, version) => ({ bookIndex: book, version })
    it('次經：使用者選的次經文本 (依 ps.version 的順序)，新舊約的譯本不並排', () => {
        expect(lectureVersions(ps(103, ['unv', 'kjv']))).toEqual(['c1933']) // 沒選次經文本 → 預設 c1933
        expect(lectureVersions(ps(103, ['unv', 'chdc']))).toEqual(['chdc'])
        expect(lectureVersions(ps(103, ['chdc', 'unv', 'c1933']))).toEqual(['chdc', 'c1933'])
        expect(lectureVersions(ps(101, ['c1933', 'chdc']))).toEqual(['c1933', 'chdc'])
        expect(lectureVersions(ps(101, ['c1933', 'c1933']))).toEqual(['c1933']) // 不重複
    })
    it('新舊約：拿掉次經的文本；沒剩下就用和合本', () => {
        expect(lectureVersions(ps(1, ['unv', 'c1933', 'kjv', 'chdc']))).toEqual(['unv', 'kjv'])
        expect(lectureVersions(ps(66, ['chdc']))).toEqual(['unv'])
        expect(lectureVersions(ps(66, []))).toEqual(['unv'])
        expect(lectureVersions(ps(1, ['esv']))).toEqual(['esv'])
    })
    it('使徒教父不受影響', () => {
        expect(lectureVersions(ps(212, ['unv', 'chdc']))).toEqual(['afhuang'])
    })
    it('canonVersions / apoVersionsOf 不改傳入的陣列', () => {
        const v = ['unv', 'c1933']
        expect(canonVersions(v)).toEqual(['unv'])
        expect(apoVersionsOf(v)).toEqual(['c1933'])
        expect(v).toEqual(['unv', 'c1933'])
        expect(canonVersions(undefined)).toEqual(['unv'])
    })
})

describe('corpusApi 共用檢查', () => {
    it('checkSec / checkChap 的錯誤訊息帶前綴', () => {
        expect(checkSec(null, 'x')).toBeNull()
        expect(checkSec(' 1-3 ', 'x')).toBe('1-3')
        expect(() => checkSec('a', 'xyz')).toThrow(/^xyz: 節/)
        expect(() => checkChap(0, 'xyz')).toThrow(/^xyz: 章/)
    })
})

describe('BookRegistry.parseRef (hash 用)：次經', () => {
    it('信望愛站名、通行名、簡稱', () => {
        expect(BookRegistry.parseRef('多比傳1:2')).toEqual({ book: 103, chap: 1, sec: 2 })
        expect(BookRegistry.parseRef('多俾亞傳 3')).toEqual({ book: 103, chap: 3, sec: 1 })
        expect(BookRegistry.parseRef('馬一2:3')).toEqual({ book: 101, chap: 2, sec: 3 })
        expect(BookRegistry.parseRef('犹滴传1:1')).toEqual({ book: 104, chap: 1, sec: 1 })
    })
})
