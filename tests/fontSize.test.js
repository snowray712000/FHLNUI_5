import { describe, it, expect } from 'vitest'
import {
    clampPt, uiOf, clampScale, actualOf, setActual, stepActual, profileKey, migrateFontSize,
    FONT_PRESETS, FONT_KEYS,
} from '../index/FontSize.es2023.js'

const DEF = { main: 12, hebrew: 16, greek: 12, sn: 12 }

describe('clamp', () => {
    it('clampPt 6 ~ 60 的整數，非數字傳回 null', () => {
        expect(clampPt(3)).toBe(6)
        expect(clampPt(99)).toBe(60)
        expect(clampPt('13.6')).toBe(14)
        expect(clampPt('')).toBe(null)
        expect(clampPt('abc')).toBe(null)
    })
    it('clampScale 70 ~ 200，10 的倍數', () => {
        expect(clampScale(50)).toBe(70)
        expect(clampScale(300)).toBe(200)
        expect(clampScale('114')).toBe(110)
        expect(clampScale('')).toBe(null)
    })
})

describe('uiOf：介面 = 基準 12pt × 整體，夾在 9 ~ 24', () => {
    it('100% 是基準；與情境無關', () => {
        expect(uiOf(100)).toBe(12)
        expect(uiOf(150)).toBe(18)
        expect(uiOf(110)).toBeCloseTo(13.2)
    })
    it('夾住：70% 不低於 9pt，200% 不高於 24pt', () => {
        expect(uiOf(70)).toBe(9)
        expect(uiOf(200)).toBe(24)
    })
})

describe('actualOf：內容實際 = 情境 × 整體', () => {
    it('100% 時就是情境的值', () => {
        expect(actualOf(DEF, 100)).toEqual(DEF)
    })
    it('150% 內容全部 ×1.5', () => {
        expect(actualOf(DEF, 150)).toEqual({ main: 18, hebrew: 24, greek: 18, sn: 18 })
    })
    it('超出範圍時夾住，情境不變，縮回來恢復', () => {
        expect(actualOf(DEF, 200).hebrew).toBe(32)
        expect(actualOf({ ...DEF, hebrew: 40 }, 200).hebrew).toBe(60)
        expect(actualOf(DEF, 100)).toEqual(DEF)
    })
})

describe('setActual', () => {
    it('改經文時原文、SN 等比例 (link)', () => {
        const p = setActual(DEF, 100, 'main', 18, true)
        expect(actualOf(p, 100)).toEqual({ main: 18, hebrew: 24, greek: 18, sn: 18 })
    })
    it('不 link 時只改那一項', () => {
        expect(actualOf(setActual(DEF, 100, 'main', 18, false), 100)).toEqual({ ...DEF, main: 18 })
    })
    it('在 150% 下改的值，換回 100% 時是相對的', () => {
        const p = setActual(DEF, 150, 'sn', 21, false) // SN 21pt @150% → 情境 14pt
        expect(p.sn).toBe(14)
        expect(actualOf(p, 100).sn).toBe(14)
    })
    it('實際值沒變就不動情境 (110% 時 13.2 顯示 13，設 13 不改)', () => {
        expect(setActual(DEF, 110, 'main', 13, true)).toBe(DEF)
    })
})

describe('stepActual', () => {
    it('連按 A+ A- 來回回到原本的情境 (非 100% 也一樣)', () => {
        for (const scale of [100, 110, 130]) {
            let p = DEF
            for (let i = 0; i < 7; i++) p = stepActual(p, scale, 'main', 1, true)
            expect(actualOf(p, scale).main).toBe(actualOf(DEF, scale).main + 7)
            for (let i = 0; i < 7; i++) p = stepActual(p, scale, 'main', -1, true)
            expect(profileKey(p)).toBe(profileKey(DEF))
        }
    })
    it('夾住時不再改情境', () => {
        const p = { ...DEF, main: 60 }
        expect(stepActual(p, 100, 'main', 1, false)).toBe(p)
    })
})

describe('migrateFontSize', () => {
    const ps = { main: 18, hebrew: 30, greek: 28, sn: 12 }
    it('舊格式：整體 100%，情境 = 目前的值 (畫面不變)；舊的 ui 丟掉', () => {
        const m = migrateFontSize({ link: false, ratio: { hebrew: 2, greek: 2, sn: 1 }, ui: 15, custom: [{ name: 'a', main: 10, hebrew: 20, greek: 20, sn: 10 }] }, ps)
        expect(m.scale).toBe(100)
        expect(m.profile).toEqual(ps)
        expect(m.link).toBe(false)
        expect(m.custom).toEqual([{ name: 'a', main: 10, hebrew: 20, greek: 20, sn: 10 }])
    })
    it('沒有存過：預設', () => {
        const m = migrateFontSize(null, { main: 12, hebrew: 16, greek: 12, sn: 12 })
        expect(m).toEqual({ scale: 100, profile: DEF, link: true, custom: [] })
    })
    it('新格式照讀；壞掉的組合濾掉；profile 裡舊的 ui 丟掉', () => {
        const m = migrateFontSize({ v: 2, scale: 130, profile: { ...DEF, main: 13.5, ui: 14 }, link: true, custom: [{ name: 'x', ...DEF, ui: 14 }, { name: 'bad', main: 'a' }] }, ps)
        expect(m.scale).toBe(130)
        expect(m.profile).toEqual({ ...DEF, main: 13.5 })
        expect(m.custom[0]).toEqual({ name: 'x', ...DEF })
        expect(m.custom.map(a => a.name)).toEqual(['x'])
    })
})

describe('FONT_PRESETS', () => {
    it('每個組合的值都在範圍內，且彼此不同 (activeId 才分得出來)', () => {
        for (const p of FONT_PRESETS) expect(actualOf(p, 100)).toEqual(Object.fromEntries(FONT_KEYS.map(k => [k, p[k]])))
        expect(new Set(FONT_PRESETS.map(profileKey)).size).toBe(FONT_PRESETS.length)
    })
    it('預設 = 介面 12、經文 12、希臘文 12、希伯來文 16、SN 12；投影內容全部 48', () => {
        expect(FONT_PRESETS.map(a => a.id)).toEqual(['default', 'share'])
        expect(FONT_PRESETS[1]).toMatchObject({ main: 48, hebrew: 48, greek: 48, sn: 48 })
        expect(profileKey(FONT_PRESETS[0])).toBe(profileKey(DEF))
    })
})
