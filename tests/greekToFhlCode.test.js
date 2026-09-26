import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { gcode_2 } from '../index/gcode2.es2023.js'
import { greekToFhlCode } from '../index/greekToFhlCode.es2023.js'

// 希臘字一律用 \u 寫：編輯器常把 oxia 正規化成 tonos，肉眼看不出差別

describe('greekToFhlCode 基本', () => {
    it('null / 空字串', () => {
        expect(greekToFhlCode(null)).toBe('')
        expect(greekToFhlCode('')).toBe('')
    })

    it('帖前 5:19 (FHL 的 oxia)', () => {
        // τὸ πνεῦμα μὴ σβέννυτε
        expect(greekToFhlCode('\u03c4\u1f78 \u03c0\u03bd\u03b5\u1fe6\u03bc\u03b1 \u03bc\u1f74 \u03c3\u03b2\u1f73\u03bd\u03bd\u03c5\u03c4\u03b5'))
            .toBe("to; pneu'ma mh; sbevnnute")
    })

    it('鍵盤打的 tonos 與 oxia 結果相同', () => {
        // σβέννυτε：έ U+03AD (tonos) / U+1F73 (oxia)
        expect(greekToFhlCode('\u03c3\u03b2\u03ad\u03bd\u03bd\u03c5\u03c4\u03b5')).toBe('sbevnnute')
        expect(greekToFhlCode('\u03c3\u03b2\u1f73\u03bd\u03bd\u03c5\u03c4\u03b5')).toBe('sbevnnute')
        // ά έ ή ί ό ύ ώ ΐ ΰ 的 tonos 版
        expect(greekToFhlCode('\u03ac\u03ad\u03ae\u03af\u03cc\u03cd\u03ce\u0390\u03b0')).toBe('avevhviv' + 'ovuvwv' + 'i?u?')
    })

    it('NFD (字母 + 組合符號) 也可以', () => {
        const nfd = '\u1f08\u03b3\u03ac\u03c0\u03b7'.normalize('NFD') // Ἀγάπη
        expect(nfd.length).toBeGreaterThan(5)
        expect(greekToFhlCode(nfd)).toBe('Ajgavph')
    })

    it('\u03c3 與 \u03c2 都是 s (ssn.php 的 uword 就是字尾 \u03c3/\u03c2 查不到)', () => {
        expect(greekToFhlCode('\u03bb\u1f79\u03b3\u03bf\u03c2')).toBe('lovgos') // λόγος
        expect(greekToFhlCode('\u03bb\u1f79\u03b3\u03bf\u03c3')).toBe('lovgos') // λόγοσ
    })

    it('不認得的字元保留', () => {
        expect(greekToFhlCode('abc 123')).toBe('abc 123')
    })
})

describe('greekToFhlCode 大寫用與小寫相同的符號 (資料庫的寫法)', () => {
    it.each([
        ['\u1f38\u03b7\u03c3\u03bf\u1fe6\u03c2', "Ijhsou's"], // Ἰησοῦς
        ['\u1f19\u03b2\u03c1\u03b1\u1f77\u03bf\u03c5\u03c2', 'EJbraivous'], // Ἑβραίους
        ['\u1fec\u1f7d\u03bc\u1fc3', 'RJwvmh/'], // Ῥώμῃ
        ['\u1f0c\u03b2\u03b5\u03bb', 'A[bel'], // Ἄβελ
        ['\u1f4d\u03c4\u03b5', 'O&te'], // Ὅτε
        ['\u1f6f', 'W|'], // Ὧ
    ])('%s \u2192 %s', (src, exp) => {
        expect(greekToFhlCode(src)).toBe(exp)
    })

    it('大寫 iota 下標沒有小寫式寫法時維持 orga (\u1f88)', () => {
        expect(gcode_2(greekToFhlCode('\u1f88'))).toBe('\u1f88')
    })
})

describe('greekToFhlCode 與 gcode_2 來回', () => {
    // 已知限制：資料庫有 h~ w~ (應是 ᾐ ᾠ，例 ᾐτήσατο)，gcode_2 轉成 ἤ ὤ，反轉回 h[ w[。全新約 9 個字
    const known = /[hw]~/

    /** @type {{addr: string, ascii: string}[]} */
    const samples = JSON.parse(fs.readFileSync(new URL('./fixtures/fhlwh_gcode2_sample.json', import.meta.url), 'utf8'))
    const words = [...new Set(samples.flatMap(a1 => a1.ascii.replace(/͘/g, 'u').replace(/ṳ/g, 'ii')
        .split(/\s+/)
        .map(w => w.replace(/^[(\[+\-]+|[,.:;{}()\[\]+\-!?"#`]+$/g, '')) // 前後標點
        .filter(w => /^[A-Za-z]/.test(w) && !known.test(w))))]

    it('fixture 的字夠多', () => {
        expect(words.length).toBeGreaterThan(500)
    })

    it.each(words.map(w => [w]))('%s', w => {
        expect(greekToFhlCode(gcode_2(w))).toBe(w)
    })

    it('已知限制 h~', () => {
        expect(greekToFhlCode(gcode_2('h~thvsato'))).toBe('h[thvsato')
    })
})
