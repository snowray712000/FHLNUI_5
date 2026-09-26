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
        expect(greekToFhlCode('τὸ πνεῦμα μὴ σβέννυτε'))
            .toBe("to; pneu'ma mh; sbevnnute")
    })

    it('鍵盤打的 tonos 與 oxia 結果相同', () => {
        // σβέννυτε：έ U+03AD (tonos) / U+1F73 (oxia)
        expect(greekToFhlCode('σβέννυτε')).toBe('sbevnnute')
        expect(greekToFhlCode('σβέννυτε')).toBe('sbevnnute')
        // ά έ ή ί ό ύ ώ ΐ ΰ 的 tonos 版
        expect(greekToFhlCode('άέήίόύώΐΰ')).toBe('avevhviv' + 'ovuvwv' + 'i?u?')
    })

    it('NFD (字母 + 組合符號) 也可以', () => {
        const nfd = 'Ἀγάπη'.normalize('NFD') // Ἀγάπη
        expect(nfd.length).toBeGreaterThan(5)
        expect(greekToFhlCode(nfd)).toBe('Ajgavph')
    })

    it('σ 與 ς 都是 s (ssn.php 的 uword 就是字尾 σ/ς 查不到)', () => {
        expect(greekToFhlCode('λόγος')).toBe('lovgos') // λόγος
        expect(greekToFhlCode('λόγοσ')).toBe('lovgos') // λόγοσ
    })

    it('不認得的字元保留', () => {
        expect(greekToFhlCode('abc 123')).toBe('abc 123')
    })
})

describe('greekToFhlCode 大寫用與小寫相同的符號 (資料庫的寫法)', () => {
    it.each([
        ['Ἰησοῦς', "Ijhsou's"], // Ἰησοῦς
        ['Ἑβραίους', 'EJbraivous'], // Ἑβραίους
        ['Ῥώμῃ', 'RJwvmh/'], // Ῥώμῃ
        ['Ἄβελ', 'A[bel'], // Ἄβελ
        ['Ὅτε', 'O&te'], // Ὅτε
        ['Ὧ', 'W|'], // Ὧ
    ])('%s → %s', (src, exp) => {
        expect(greekToFhlCode(src)).toBe(exp)
    })

    it('大寫 iota 下標沒有小寫式寫法時維持 orga (ᾈ)', () => {
        expect(gcode_2(greekToFhlCode('ᾈ'))).toBe('ᾈ')
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
