import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { normalizeSn, parseSnList, splitHelpSections, cfgKey, SN_LENSES, SN_PRESETS, MORPH_GROUPS, WORD_COLORS, morphName } from '../index/SnFilter.es2023.js'

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
