import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { gcode_2 } from '../index/gcode2.es2023.js'

/** 顯示碼位，失敗時才看得出 tonos / oxia 的差別 */
const hex = s => [...s].map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ')

describe('gcode_2 基本', () => {
    it('null / undefined / 空字串', () => {
        expect(gcode_2(null)).toBe('')
        expect(gcode_2(undefined)).toBe('')
        expect(gcode_2('')).toBe('')
    })

    it('小寫字母 (c=χ f=φ q=θ x=ξ y=ψ z=ζ)', () => {
        expect(gcode_2('abgdezhiklmncopqrstufxyw')).toBe('αβγδεζηικλμνχοπθρστυφξψω')
    })

    it('大寫字母', () => {
        expect(gcode_2('ABGDEZHIKLMNCOPQRSTUFXYW')).toBe('ΑΒΓΔΕΖΗΙΚΛΜΝΧΟΠΘΡΣΤΥΦΞΨΩ')
    })

    it('標點 { } #', () => {
        expect(gcode_2('{')).toBe('\u0387') // · 希臘文上點 (NFC 後會變 U+00B7)
        expect(gcode_2('}')).toBe('\u037e') // ; 希臘文問號 (NFC 後會變 ASCII ;)
        expect(gcode_2('#')).toBe('\u1fbd') // ᾽
    })

    it('不認得的字元保留', () => {
        expect(gcode_2('123-_=+')).toBe('123-_=+')
        expect(gcode_2('A1b2C3')).toBe('Α1β2Χ3')
    })
})

describe('gcode_2 字尾 s → ς', () => {
    it('字串結尾', () => {
        expect(gcode_2('s')).toBe('ς')
        expect(gcode_2('logos')).toBe('λογος')
    })

    it.each(['-', '\r', '\n', ',', '.', ':', ';', '}', '{', ')', ' '])('在 %j 之前', p => {
        const out = gcode_2(`logos${p}`)
        expect(out.startsWith('λογος')).toBe(true)
    })

    it('其它位置維持 σ', () => {
        expect(gcode_2('sa')).toBe('σα')
        expect(gcode_2('s!')).toBe('σ!') // ! 不在規則內
        expect(gcode_2('sos')).toBe('σος')
        expect(gcode_2('ss')).toBe('σς')
    })
})

describe('gcode_2 重音、氣號、iota 下標', () => {
    // 全新約 (bible_fhlwh.sqlite) 實際用到的 131 個 orga 組合 (orgb 表一個都沒用到)。
    // 預期值由 gcode_2 產生，但全新約與 qsb.php 已整句比對一致，所以可當回歸測試。
    // 用 \u 寫，因為編輯器常把 oxia 正規化 (NFC) 成 tonos，肉眼看不出差別。
    it.each([
        ["hj/", '\u1f90'],  // ᾐ
        ["wj/", '\u1fa0'],  // ᾠ
        ["hJ/", '\u1f91'],  // ᾑ
        ["a[/", '\u1f84'],  // ᾄ
        ["h[/", '\u1f94'],  // ᾔ
        ["a&/", '\u1f85'],  // ᾅ
        ["h\\/", '\u1f96'],  // ᾖ
        ["h|/", '\u1f97'],  // ᾗ
        ["w|/", '\u1fa7'],  // ᾧ
        ["h;/", '\u1fc2'],  // ῂ
        ["a/", '\u1fb3'],  // ᾳ
        ["h/", '\u1fc3'],  // ῃ
        ["w/", '\u1ff3'],  // ῳ
        ["av/", '\u1fb4'],  // ᾴ
        ["hv/", '\u1fc4'],  // ῄ
        ["wv/", '\u1ff4'],  // ῴ
        ["a'/", '\u1fb7'],  // ᾷ
        ["h'/", '\u1fc7'],  // ῇ
        ["w'/", '\u1ff7'],  // ῷ
        ["a&", '\u1f05'],  // ἅ
        ["e&", '\u1f15'],  // ἕ
        ["h&", '\u1f25'],  // ἥ
        ["i&", '\u1f35'],  // ἵ
        ["o&", '\u1f45'],  // ὅ
        ["u&", '\u1f55'],  // ὕ
        ["w&", '\u1f65'],  // ὥ
        ["a'", '\u1fb6'],  // ᾶ
        ["h'", '\u1fc6'],  // ῆ
        ["i'", '\u1fd6'],  // ῖ
        ["u'", '\u1fe6'],  // ῦ
        ["w'", '\u1ff6'],  // ῶ
        ["a;", '\u1f70'],  // ὰ
        ["e;", '\u1f72'],  // ὲ
        ["h;", '\u1f74'],  // ὴ
        ["i;", '\u1f76'],  // ὶ
        ["o;", '\u1f78'],  // ὸ
        ["u;", '\u1f7a'],  // ὺ
        ["w;", '\u1f7c'],  // ὼ
        ["i>", '\u03ca'],  // ϊ
        ["u>", '\u03cb'],  // ϋ
        ["i?", '\u1fd3'],  // ΐ
        ["u?", '\u1fe3'],  // ΰ
        ["aJ", '\u1f01'],  // ἁ
        ["eJ", '\u1f11'],  // ἑ
        ["hJ", '\u1f21'],  // ἡ
        ["iJ", '\u1f31'],  // ἱ
        ["oJ", '\u1f41'],  // ὁ
        ["uJ", '\u1f51'],  // ὑ
        ["wJ", '\u1f61'],  // ὡ
        ["rJ", '\u1fe5'],  // ῥ
        ["a[", '\u1f04'],  // ἄ
        ["e[", '\u1f14'],  // ἔ
        ["h[", '\u1f24'],  // ἤ
        ["i[", '\u1f34'],  // ἴ
        ["o[", '\u1f44'],  // ὄ
        ["u[", '\u1f54'],  // ὔ
        ["w[", '\u1f64'],  // ὤ
        ["a\\", '\u1f06'],  // ἆ
        ["h\\", '\u1f26'],  // ἦ
        ["i\\", '\u1f36'],  // ἶ
        ["u\\", '\u1f56'],  // ὖ
        ["w\\", '\u1f66'],  // ὦ
        ["a]", '\u1f02'],  // ἂ
        ["h]", '\u1f22'],  // ἢ
        ["o]", '\u1f42'],  // ὂ
        ["u]", '\u1f52'],  // ὒ
        ["w]", '\u1f62'],  // ὢ
        ["a^", '\u1f03'],  // ἃ
        ["e^", '\u1f13'],  // ἓ
        ["h^", '\u1f23'],  // ἣ
        ["i^", '\u1f33'],  // ἳ
        ["o^", '\u1f43'],  // ὃ
        ["u^", '\u1f53'],  // ὓ
        ["aj", '\u1f00'],  // ἀ
        ["ej", '\u1f10'],  // ἐ
        ["hj", '\u1f20'],  // ἠ
        ["ij", '\u1f30'],  // ἰ
        ["oj", '\u1f40'],  // ὀ
        ["uj", '\u1f50'],  // ὐ
        ["wj", '\u1f60'],  // ὠ
        ["Aj", '\u1f08'],  // Ἀ
        ["Ej", '\u1f18'],  // Ἐ
        ["Hj", '\u1f28'],  // Ἠ
        ["Ij", '\u1f38'],  // Ἰ
        ["Oj", '\u1f48'],  // Ὀ
        ["A;", '\u1fba'],  // Ὰ
        ["W;", '\u1ffa'],  // Ὼ
        ["av", '\u1f71'],  // ά
        ["ev", '\u1f73'],  // έ
        ["hv", '\u1f75'],  // ή
        ["iv", '\u1f77'],  // ί
        ["ov", '\u1f79'],  // ό
        ["uv", '\u1f7b'],  // ύ
        ["wv", '\u1f7d'],  // ώ
        ["h|", '\u1f27'],  // ἧ
        ["i|", '\u1f37'],  // ἷ
        ["u|", '\u1f57'],  // ὗ
        ["w|", '\u1f67'],  // ὧ
        ["i:", '\u1fd2'],  // ῒ
        ["u:", '\u1fe2'],  // ῢ
        ["A&", '\u1f0d'],  // Ἅ
        ["E&", '\u1f1d'],  // Ἕ
        ["H&", '\u1f2d'],  // Ἥ
        ["I&", '\u1f3d'],  // Ἵ
        ["O&", '\u1f4d'],  // Ὅ
        ["U&", '\u1f5d'],  // Ὕ
        ["W&", '\u1f6d'],  // Ὥ
        ["AJ", '\u1f09'],  // Ἁ
        ["EJ", '\u1f19'],  // Ἑ
        ["HJ", '\u1f29'],  // Ἡ
        ["IJ", '\u1f39'],  // Ἱ
        ["OJ", '\u1f49'],  // Ὁ
        ["UJ", '\u1f59'],  // Ὑ
        ["WJ", '\u1f69'],  // Ὡ
        ["RJ", '\u1fec'],  // Ῥ
        ["A[", '\u1f0c'],  // Ἄ
        ["E[", '\u1f1c'],  // Ἔ
        ["H[", '\u1f2c'],  // Ἤ
        ["I[", '\u1f3c'],  // Ἴ
        ["O[", '\u1f4c'],  // Ὄ
        ["W[", '\u1f6c'],  // Ὤ
        ["h~", '\u1f24'],  // ἤ
        ["w~", '\u1f64'],  // ὤ
        ["A\\", '\u1f0e'],  // Ἆ
        ["H\\", '\u1f2e'],  // Ἦ
        ["W\\", '\u1f6e'],  // Ὦ
        ["H]", '\u1f2a'],  // Ἢ
        ["A^", '\u1f0b'],  // Ἃ
        ["E^", '\u1f1b'],  // Ἓ
        ["O^", '\u1f4b'],  // Ὃ
        ["W|", '\u1f6f'],  // Ὧ
    ])('%s', (src, exp) => {
        const out = gcode_2(src)
        expect(out, `${hex(out)} vs ${hex(exp)}`).toBe(exp)
    })

    it("orga 先處理，所以 orgb 的 a'/ 不會變成 ᾴ", () => {
        expect(gcode_2("a'/")).toBe('\u1fb7') // ᾷ
        expect(gcode_2('av/')).toBe('\u1fb4') // ᾴ
    })

    it('銳音輸出 oxia (U+1F71…)，不是 tonos (U+03AC…)', () => {
        // ssn.php 用 Unicode 查詢時，送 tonos 會查不到
        expect(hex(gcode_2('av ev hv iv ov uv wv'))).toBe(hex('\u1f71 \u1f73 \u1f75 \u1f77 \u1f79 \u1f7b \u1f7d'))
        expect(gcode_2('ev')).not.toBe('\u03ad')
        expect(gcode_2('ev').normalize('NFC')).toBe('\u03ad') // NFC 後才等於 tonos
    })
})

describe('gcode_2 落單的 v ; j J 照原樣 (與 PHP 相同)', () => {
    // 例 James 2:5 toi'; → τοῖ; (;前面是已轉好的 ῖ)
    it.each([
        ["toi';", '\u03c4\u03bf\u1fd6;'],
        ['tv', '\u03c4v'],
        ['h/jt', '\u1fc3j\u03c4'],
    ])('%s → %s', (src, exp) => {
        expect(gcode_2(src)).toBe(exp)
    })
})

describe('gcode_2 bible_fhlwh.sqlite 的錯字元', () => {
    it('U+0358 (o͘) 是 u', () => {
        expect(gcode_2("To\u0358'to")).toBe('\u03a4\u03bf\u1fe6\u03c4\u03bf')
        expect(gcode_2('o\u0358|tos')).toBe('\u03bf\u1f57\u03c4\u03bf\u03c2')
        expect(gcode_2('o\u0358\\n')).toBe('\u03bf\u1f56\u03bd')
    })

    it('U+1E73 (ṳ) 是 ii', () => {
        expect(gcode_2('per\u1e73?staso')).toBe('\u03c0\u03b5\u03c1\u03b9\u1fd3\u03c3\u03c4\u03b1\u03c3\u03bf') // περιΐστασο
    })
})

describe('gcode_2 真實經文 (與 qsb.php version=fhlwh 比對)', () => {
    it('帖前 5:19', () => {
        // τὸ πνεῦμα μὴ σβέννυτε,
        expect(gcode_2("to; pneu'ma mh; sbevnnute,")).toBe('\u03c4\u1f78 \u03c0\u03bd\u03b5\u1fe6\u03bc\u03b1 \u03bc\u1f74 \u03c3\u03b2\u1f73\u03bd\u03bd\u03c5\u03c4\u03b5,')
    })

    // 由全新約 7958 節挑出，涵蓋所有出現過的輸出字元與特殊情況；qsb.php 的 \r\n 已轉為 \n
    /** @type {{addr: string, ascii: string, unicode: string}[]} */
    const samples = JSON.parse(fs.readFileSync(new URL('./fixtures/fhlwh_gcode2_sample.json', import.meta.url), 'utf8'))

    it.each(samples.map(a1 => [a1.addr, a1]))('%s', (_addr, a1) => {
        expect(gcode_2(a1.ascii)).toBe(a1.unicode)
    })
})
