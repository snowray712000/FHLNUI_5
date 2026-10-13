import { describe, it, expect } from 'vitest'
import { pushAddress, togglePin, clearKeepPinned, displayOrder } from '../index/viewHistoryPins.es2023.js'

const jas5 = { book: 59, chap: 5, sec: 1 }
const h = (book, chap, sec = 1, pin) => (pin ? { book, chap, sec, pin } : { book, chap, sec })

describe('viewHistoryPins', () => {
    it('釘的是章：同章換節仍是釘住，節更新，且移到最前面', () => {
        let d = [h(1, 1), h(59, 5, 1, 100), h(2, 2)]
        d = pushAddress(d, { book: 59, chap: 5, sec: 2 })
        expect(d[0]).toEqual({ book: 59, chap: 5, sec: 2, pin: 100 })
        expect(d.length).toBe(3)
    })
    it('超過上限只丟沒釘的最舊', () => {
        let d = [h(59, 5, 1, 1)]
        for (let i = 1; i <= 30; i++) d = pushAddress(d, { book: 1, chap: i, sec: 1 })
        expect(d.length).toBe(24)
        expect(d.some(a => a.book == 59 && a.pin)).toBe(true)
        expect(d[0].chap).toBe(30)
    })
    it('全部都釘住時不丟', () => {
        const d = [h(1, 1, 1, 1), h(1, 2, 1, 2)]
        expect(pushAddress(d, { book: 1, chap: 3, sec: 1 }, 2).length).toBe(3)
    })
    it('togglePin 釘 / 拔，順序不變', () => {
        const d = [h(1, 1), h(59, 5), h(2, 2)]
        const a = togglePin(d, jas5, 500)
        expect(a.map(x => x.pin)).toEqual([undefined, 500, undefined])
        expect(a.map(x => x.chap)).toEqual([1, 5, 2])
        const b = togglePin(a, jas5)
        expect('pin' in b[1]).toBe(false)
        expect(d[1].pin).toBeUndefined() // 不改原陣列
    })
    it('清除記錄留目前的與釘住的', () => {
        const d = [h(1, 1), h(2, 2), h(59, 5, 1, 9), h(3, 3)]
        expect(clearKeepPinned(d).map(x => x.book)).toEqual([1, 59])
        const d2 = [h(59, 5, 1, 9), h(2, 2)]
        expect(clearKeepPinned(d2)).toEqual([h(59, 5, 1, 9)])
    })
    it('顯示順序：釘住的在前，兩群各自照瀏覽順序，idx 指回 datas', () => {
        const d = [h(1, 1), h(2, 2, 1, 20), h(3, 3), h(4, 4, 1, 10)]
        expect(displayOrder(d).map(x => x.idx)).toEqual([1, 3, 0, 2])
    })
    it('釘住的之間：看過的章浮到釘住群最上面 (雅5、雅4、雅2 都釘，切到雅2 → 雅2、雅5、雅4)', () => {
        let d = [h(59, 5, 1, 3), h(59, 4, 1, 2), h(59, 2, 1, 1)]
        d = pushAddress(d, { book: 59, chap: 2, sec: 1 })
        expect(displayOrder(d).map(x => x.item.chap)).toEqual([2, 5, 4])
    })
})
