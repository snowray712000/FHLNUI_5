// 複製對照表：主題的 color-mix() 讓 getComputedStyle 回傳 color(srgb …)，寫進剪貼簿前轉成 rgb() (docs/z261003b)
import { describe, expect, test, vi } from 'vitest'

vi.mock('../index/auDom.es2023.js', () => ({ el: () => null }))
vi.mock('../index/TPPageState.es2023.js', () => ({ TPPageState: { s: {} } }))
vi.mock('../index/theme/Theme.es2023.js', () => ({ Theme: { s: {} } }))
const { toRgb } = await import('../index/LecCopyTable.es2023.js')

describe('toRgb', () => {
    test('color(srgb …) → rgb()', () => {
        expect(toRgb('color(srgb 0 0.382745 0.8)')).toBe('rgb(0, 98, 204)')
    })
    test('有透明度 → rgba()', () => {
        expect(toRgb('color(srgb 1 0 0 / 0.5)')).toBe('rgba(255, 0, 0, 0.5)')
    })
    test('超出 0~1 夾住', () => {
        expect(toRgb('color(srgb 1.2 -0.1 0.5)')).toBe('rgb(255, 0, 128)')
    })
    test('已經是 rgb() 就原樣', () => {
        expect(toRgb('rgb(195, 39, 43)')).toBe('rgb(195, 39, 43)')
    })
})
