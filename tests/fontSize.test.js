import { describe, it, expect } from 'vitest'
import { clampPt, sizesKey, ratioOf, scaleByMain, FONT_PRESETS, FONT_KEYS } from '../index/FontSize.es2023.js'

describe('clampPt', () => {
    it('6 ~ 60 的整數，非數字傳回 null', () => {
        expect(clampPt(3)).toBe(6)
        expect(clampPt(99)).toBe(60)
        expect(clampPt('13.6')).toBe(14)
        expect(clampPt('')).toBe(null)
        expect(clampPt('abc')).toBe(null)
    })
})

describe('scaleByMain', () => {
    it('比例存著，來回 A+ A- 不會因四捨五入偏掉', () => {
        const ratio = ratioOf({ main: 12, hebrew: 26, greek: 26, sn: 14 })
        let s = { main: 12 }
        for (let i = 0; i < 7; i++) s = scaleByMain(ratio, s.main + 1)
        for (let i = 0; i < 7; i++) s = scaleByMain(ratio, s.main - 1)
        expect(s).toEqual({ main: 12, hebrew: 26, greek: 26, sn: 14 })
    })
    it('超出範圍時夾住', () => {
        const ratio = ratioOf({ main: 12, hebrew: 26, greek: 26, sn: 14 })
        expect(scaleByMain(ratio, 40).hebrew).toBe(60)
    })
})

describe('FONT_PRESETS', () => {
    it('每個組合的值都在範圍內，且彼此不同 (activeId 才分得出來)', () => {
        for (const p of FONT_PRESETS) for (const k of FONT_KEYS) expect(clampPt(p[k])).toBe(p[k])
        expect(new Set(FONT_PRESETS.map(sizesKey)).size).toBe(FONT_PRESETS.length)
    })
})
