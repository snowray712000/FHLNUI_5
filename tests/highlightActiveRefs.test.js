import { describe, it, expect } from 'vitest'
import { matchLevel, normalizeActiveAddr } from '../index/highlightActiveRefs.es2023.js'

const jas = (chap, verse) => ({ book: 59, chap, verse })

describe('matchLevel', () => {
    const act = jas(4, 5)
    it('同一節 → 2', () => {
        expect(matchLevel([jas(4, 5)], act)).toBe(2)
    })
    it('多處引用中有一處同節 → 2 (如 #羅1:29;雅4:5|)', () => {
        expect(matchLevel([{ book: 45, chap: 1, verse: 29 }, jas(4, 5)], act)).toBe(2)
    })
    it('範圍已展開，包含該節 → 2', () => {
        expect(matchLevel([jas(4, 4), jas(4, 5), jas(4, 6)], act)).toBe(2)
    })
    it('整章引用 (#雅4|，雅4 共 17 節) → 1', () => {
        const wholeChap = Array.from({ length: 17 }, (_, i) => jas(4, i + 1))
        expect(matchLevel(wholeChap, act)).toBe(1)
    })
    it('跨章範圍跨過整章 (雅3:1-5:3) → 1', () => {
        const r = [...Array.from({ length: 18 }, (_, i) => jas(3, i + 1)), ...Array.from({ length: 17 }, (_, i) => jas(4, i + 1)), jas(5, 1), jas(5, 2), jas(5, 3)]
        expect(matchLevel(r, act)).toBe(1)
    })
    it('同章不同節 → 1', () => {
        expect(matchLevel([jas(4, 2)], act)).toBe(1)
    })
    it('同書不同章、不同書 → 0', () => {
        expect(matchLevel([jas(3, 5)], act)).toBe(0)
        expect(matchLevel([{ book: 58, chap: 4, verse: 5 }], act)).toBe(0)
    })
    it('act 沒有節 (verse 0) → 最多 1', () => {
        expect(matchLevel([jas(4, 5)], jas(4, 0))).toBe(1)
    })
    it('不合法輸入 → 0', () => {
        expect(matchLevel(null, act)).toBe(0)
        expect(matchLevel([jas(4, 5)], null)).toBe(0)
    })
})

describe('normalizeActiveAddr', () => {
    it('hover attr 是字串，sec 也可以', () => {
        expect(normalizeActiveAddr({ book: '59', chap: '4', sec: '2' })).toEqual(jas(4, 2))
    })
    it('不合法 → null', () => {
        expect(normalizeActiveAddr(null)).toBeNull()
        expect(normalizeActiveAddr({ book: undefined, chap: 4, verse: 1 })).toBeNull()
        expect(normalizeActiveAddr({ book: 67, chap: 4, verse: 1 })).toBeNull()
    })
})
