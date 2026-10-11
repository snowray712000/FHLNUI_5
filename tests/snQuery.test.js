import { describe, it, expect } from 'vitest'
import { parseSnQuery, combineSnResults, termsOf, positiveTermsOf, MAX_RANGE } from '../index/snQuery.es2023.js'

const t = (sn, isOld = null) => ({ sn, isOld })
/** 一個條件 */
const it1 = (sn, isOld = null, not = false) => ({ terms: [t(sn, isOld)], not })

describe('parseSnQuery', () => {
    it('單一 SN (原行為)', () => {
        expect(parseSnQuery('G80')).toEqual([[it1('80', false)]])
        expect(parseSnQuery('h2316')).toEqual([[it1('2316', true)]])
        expect(parseSnQuery('652a')).toEqual([[it1('652a')]])
        expect(parseSnQuery('0080')).toEqual([[it1('80')]])
    })

    it('空白、and、& 是 and', () => {
        const want = [[it1('3114', false), it1('3115', false)]]
        for (const q of ['G3114 G3115', 'G3114  and  G3115', 'G3114 AND G3115', 'G3114&G3115', 'G3114 & G3115']) {
            expect(parseSnQuery(q), q).toEqual(want)
        }
    })

    it('or、OR、, ; | 與全形都是 or', () => {
        const want = [[it1('3114', false)], [it1('3115', false)]]
        for (const q of ['G3114 or G3115', 'G3114 OR G3115', 'G3114,G3115', 'G3114, G3115', 'G3114;G3115', 'G3114|G3115', 'G3114，G3115', 'G3114、G3115', 'G3114or G3115']) {
            expect(parseSnQuery(q), q).toEqual(want)
        }
    })

    it('3 個以上，and 比 or 先結合', () => {
        expect(parseSnQuery('G1 G2 or G3, G4')).toEqual([[it1('1', false), it1('2', false)], [it1('3', false)], [it1('4', false)]])
    })

    it('結尾多餘的分隔符號不影響', () => {
        expect(parseSnQuery('G1,')).toEqual([[it1('1', false)]])
    })

    it('not、!：排除', () => {
        const want = [[it1('3114', false), it1('3115', false, true)]]
        for (const q of ['G3114 not G3115', 'G3114 NOT G3115', 'G3114 and not G3115', 'G3114 !G3115', 'G3114！G3115', 'G3114 & ! G3115']) {
            expect(parseSnQuery(q), q).toEqual(want)
        }
        expect(parseSnQuery('G1 not G2 not G3 or G4')).toEqual([[it1('1', false), it1('2', false, true), it1('3', false, true)], [it1('4', false)]])
    })

    it('範圍：每個 SN 都是 or，G / H 寫一邊即可', () => {
        const want = [[{ terms: [t('3114', false), t('3115', false), t('3116', false)], not: false }]]
        for (const q of ['G3114-G3116', 'G3114-3116', 'G3114~G3116', 'g3114 – 3116', 'G3114 - G3116']) {
            expect(parseSnQuery(q), q).toEqual(want)
        }
        expect(parseSnQuery('3114-3115')[0][0].terms).toEqual([t('3114'), t('3115')])
        expect(parseSnQuery('H1-3 G5')).toEqual([[{ terms: [t('1', true), t('2', true), t('3', true)], not: false }, it1('5', false)]])
        expect(parseSnQuery('G1-G3 not G2')[0][1]).toEqual(it1('2', false, true))
    })

    it('範圍太大時截掉 (呼叫端檢查總數)', () => {
        expect(parseSnQuery('G1-G99999')[0][0].terms.length).toBe(MAX_RANGE + 1)
    })

    it('不是 SN 查詢', () => {
        for (const q of ['', ',', 'or', '摩西', 'G80 摩西', 'G80 or love', 'G0', 'G1 or H00', 'order', 'G80:1', 'G1 not', 'not', 'G9-G3', 'G1-H3', '0-5', 'note', 'G1 notG2', 'well-known']) {
            expect(parseSnQuery(q), q).toBeNull()
        }
    })

    it('termsOf、positiveTermsOf', () => {
        const g = parseSnQuery('G1-G2 G3 not G4 or G5')
        expect(termsOf(g).map(x => x.sn)).toEqual(['1', '2', '3', '4', '5'])
        expect(positiveTermsOf(g).map(x => x.sn)).toEqual(['1', '2', '3', '5'])
    })
})

describe('combineSnResults', () => {
    const a = (c, s = 1) => ({ ibook: 0, chap: c, sec: s })
    const data = { 1: [a(1), a(2), a(3)], 2: [a(2), a(3), a(4)], 3: [a(9)], 4: [a(3)] }
    const get = term => data[term.sn]
    const chaps = r => r.map(x => x.chap).sort((x, y) => x - y)
    const run = q => chaps(combineSnResults(parseSnQuery(q), get))

    it('and 取交集', () => expect(run('1 2')).toEqual([2, 3]))
    it('or 取聯集 (不重複)', () => expect(run('1 or 2')).toEqual([1, 2, 3, 4]))
    it('and 比 or 先結合', () => expect(run('1 2 or 3')).toEqual([2, 3, 9]))
    it('and 沒有交集', () => expect(run('1 3')).toEqual([]))
    it('not 取差集', () => expect(run('1 not 2')).toEqual([1]))
    it('多個 not', () => expect(run('1 not 2 not 4')).toEqual([1]))
    it('not 之後再 or', () => expect(run('1 not 2 or 3')).toEqual([1, 9]))
    it('範圍是 or', () => expect(run('3-4')).toEqual([3, 9]))
    it('範圍 and 另一個', () => expect(run('1-2 4')).toEqual([3]))
    it('只有 not 要報錯', () => {
        expect(() => combineSnResults(parseSnQuery('not 2'), get)).toThrow()
        expect(() => combineSnResults(parseSnQuery('1 or not 2'), get)).toThrow()
    })
})
