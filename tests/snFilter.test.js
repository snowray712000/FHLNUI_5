import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { normalizeSn, parseSnList, splitHelpSections, cfgKey, rankLeitwort, topOfRanking, chapterCounts, SN_LENSES, SN_PRESETS, MORPH_GROUPS, WORD_COLORS, morphName } from '../index/SnFilter.es2023.js'

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

describe('讀經組合', () => {
    it('每個組合都有說明 (docs/SN讀經組合說明.md)，另有 intro', () => {
        const secs = splitHelpSections(fs.readFileSync(new URL('../docs/SN讀經組合說明.md', import.meta.url), 'utf8'))
        const ids = secs.map(a => a.id)
        for (const id of ['intro', ...SN_LENSES.map(a => a.id)]) expect(ids).toContain(id)
        expect(secs.find(a => a.id == 'conj').name).toBe('連接詞')
        expect(secs.find(a => a.id == 'conj').body).not.toMatch(/^## /m)
    })
    it('組合用到的預設組合、動詞形態都存在', () => {
        for (const lens of SN_LENSES) {
            for (const [tp, part] of [['G', lens.nt], ['H', lens.ot]]) {
                for (const id of part?.presets ?? []) expect(SN_PRESETS.map(a => a.id)).toContain(id)
                for (const [g, opts] of Object.entries(part?.morph ?? {})) {
                    const group = MORPH_GROUPS[tp].find(a => a.id == g)
                    expect(group, `${lens.id} ${tp} ${g}`).toBeDefined()
                    for (const o of opts) expect(group.opts.map(a => a.id)).toContain(o)
                }
            }
        }
    })
    it('cfgKey 不計清單順序、空的形態組', () => {
        const a = { sns: ['1', '2'], exclude: [], presets: ['v', 'n'], leitwort: 0, morph: { mood: ['p', 'n'], tense: [] }, includeCurly: true, showTvm: true }
        const b = { sns: ['2', '1'], exclude: [], presets: ['n', 'v'], leitwort: 0, morph: { tense: [], mood: ['n', 'p'], voice: [] }, includeCurly: true, showTvm: true }
        expect(cfgKey(a)).toBe(cfgKey(b))
        expect(cfgKey(a)).not.toBe(cfgKey({ ...b, leitwort: 3 }))
    })
})

describe('字上色', () => {
    it('morphName 形態代碼轉文字', () => {
        expect(morphName('G', 'pap')).toBe('現在 主動 分詞')
        expect(morphName('G', 'amn')).toBe('簡單過去 中間 不定詞')
        expect(morphName('H', 'q:wy')).toBe('Qal 敘述式')
        expect(morphName('H', 'p:ptc')).toBe('Pi‘el 分詞')
        expect(morphName('H', 'q:ptcp')).toBe('Qal 被動分詞')
    })
    it('動詞形態的每個代碼都有顏色，且只屬於一類', () => {
        for (const [tp, at] of [['G', 2], ['H', 1]]) {
            const codes = MORPH_GROUPS[tp].find(g => g.at == at).opts.flatMap(o => o.codes)
            for (const c of new Set(codes)) expect(WORD_COLORS.verb[tp].filter(a => a.codes.includes(c)).length, `${tp} ${c}`).toBe(1)
        }
    })
    it('每種顏色都有 css', () => {
        const css = fs.readFileSync(new URL('../index/fhl.css', import.meta.url), 'utf8')
        const ids = [...WORD_COLORS.pos, ...WORD_COLORS.verb.G, ...WORD_COLORS.verb.H].map(a => a.id).concat('vx')
        for (const id of new Set(ids)) expect(css, id).toMatch(new RegExp(`\\.snc-${id}\\b`))
    })
})

describe('本章主導詞排名', () => {
    // 這章 100 字；「是」到處都是 (全約 2000/10000)，「光」少見 (全約 20/10000)
    const base = { len: 100, all: 10000 }
    const items = [
        { sn: 'be', c: 22, total: 2000 }, // 期望 20，只多一點
        { sn: 'light', c: 5, total: 20 }, // 期望 0.2，多很多
        { sn: 'once', c: 1, total: 3 },   // 只出現一次，不算
        { sn: 'few', c: 2, total: 5 },
    ]
    it('本章特色：少見但在這章反覆出現的排前面，到處都是的字沉下去', () => {
        const r = rankLeitwort(items, base, 'feature')
        expect(r.map(a => a.sn)).toEqual(['light', 'few', 'be'])
        expect(r.every(a => a.score > 0)).toBe(true)
    })
    it('次數：由多到少，只出現一次的不算', () => {
        expect(rankLeitwort(items, base, 'count').map(a => a.sn)).toEqual(['be', 'light', 'few'])
    })
    it('次數沒高過期望的 (特色分數 0) 不排進本章特色', () => {
        const r = rankLeitwort([{ sn: 'x', c: 2, total: 5000 }], base, 'feature')
        expect(r).toEqual([])
    })
    it('前 k 名：並列的一起算進來', () => {
        const ranked = rankLeitwort([
            { sn: 'a', c: 6, total: 10 }, { sn: 'b', c: 4, total: 10 }, { sn: 'c', c: 4, total: 10 }, { sn: 'd', c: 2, total: 10 },
        ], base, 'count')
        expect(topOfRanking(ranked, 2, 'count').map(a => a.sn)).toEqual(['a', 'b', 'c'])
        expect(topOfRanking(ranked, 10, 'count')).toHaveLength(4)
        expect(topOfRanking(ranked, 0, 'count')).toEqual([])
    })
    it('chapterCounts：本章次數、本章字數、全約次數', () => {
        const dict = { '1': { 1: { 1: 3, 2: 1 }, 2: { 1: 2 } }, '2': { 1: { 1: 4 } } }
        const r = chapterCounts(dict, 1, 1)
        expect([...r.counts]).toEqual([['1', 3], ['2', 4]])
        expect(r.len).toBe(7)
        expect(r.all).toBe(10)
        expect(r.total.get('1')).toBe(6)
    })
    it('cfgKey：前幾名不同就是不同的設定', () => {
        const a = { sns: [], exclude: [], presets: [], leitwort: 0, leitTop: 0, morph: {}, includeCurly: true, showTvm: true }
        expect(cfgKey(a)).not.toBe(cfgKey({ ...a, leitTop: 5 }))
    })
})
