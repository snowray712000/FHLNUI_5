import { describe, it, expect } from 'vitest'
import { normalizeSn, parseSnList } from '../index/SnFilter.es2023.js'

describe('normalizeSn', () => {
    it('去 0、去 G H、a 小寫', () => {
        expect(normalizeSn('G01063')).toBe('1063')
        expect(normalizeSn('<1063>')).toBe('1063')
        expect(normalizeSn('08521A')).toBe('8521a')
        expect(normalizeSn('abc')).toBe('')
    })
})

describe('parseSnList', () => {
    it('沒寫 G H 的歸 defaultTp，寫了的依前綴', () => {
        expect(parseSnList('1063 G1161, H3068 <3588>', 'G')).toEqual([
            { tp: 'G', sn: '1063' },
            { tp: 'G', sn: '1161' },
            { tp: 'H', sn: '3068' },
            { tp: 'G', sn: '3588' },
        ])
        expect(parseSnList('h430 8521a', 'H')).toEqual([
            { tp: 'H', sn: '430' },
            { tp: 'H', sn: '8521a' },
        ])
    })
})
