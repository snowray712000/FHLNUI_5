import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { umscode, HEB_TABLES } from '../index/hebCode.es2023.js'

// 希伯來字一律用 \u 寫：編輯器可能重排組合符號 (NFC)，肉眼看不出差別
const hex = s => [...s].map(c => c.codePointAt(0).toString(16).padStart(4, '0')).join(' ')

describe('umscode 基本', () => {
    it('null / 空字串', () => {
        expect(umscode(null)).toBe('')
        expect(umscode('')).toBe('')
    })

    it('\u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd：內碼是視覺順序，整個反轉', () => {
        // א ֱ ל ֹ ה ִ י ם
        expect(hex(umscode('~yih{l/a'))).toBe(hex('\u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd'))
    })

    it('\u05d1\u05b8\u05bc\u05e8\u05b8\u05d0', () => {
        expect(hex(umscode('a"r\'B'))).toBe(hex('\u05d1\u05bc\u05b8\u05e8\u05b8\u05d0'))
    })

    it('三組母音碼 (瘦、胖、右) 都轉成同一個母音', () => {
        const { M, UA } = HEB_TABLES
        for (let i = 0; i < 12; i++) {
            expect(umscode(String.fromCharCode(M[i]))).toBe(UA[i])
            expect(umscode(String.fromCharCode(M[12 + i]))).toBe(UA[i])
            expect(umscode(String.fromCharCode(M[24 + i]))).toBe(UA[i])
        }
    })

    it('\u05e9\u05c2 的組合符號順序照 PHP (點在 dagesh 前，不是 NFC)', () => {
        // S 的 70 'F' 是 שּׂ
        expect(hex(umscode('F'))).toBe(hex('\u05e9\u05c2\u05bc'))
        expect(umscode('F')).not.toBe(umscode('F').normalize('NFC'))
    })

    it('` 是 sof pasuq \u05c3，- 是 maqaf', () => {
        expect(umscode('`')).toBe('\u05c3')
        expect(umscode('-')).toBe('\u05be')
    })

    it('\\r\\n 也一起反轉 (多行的經文，行的順序會倒過來)', () => {
        expect(umscode('a\r\nb')).toBe('\u05d1\n\r\u05d0')
    })

    it('不認得的字元保留 (位置也反轉)', () => {
        expect(umscode('0 1')).toBe('1 0')
    })
})

describe('umscode 真實經文 (與 qsb.php version=bhs 比對)', () => {
    // se.php?VERSION=bhs 取得的內碼與 qsb.php 的 Unicode，由全舊約 23144 節挑出涵蓋所有字元的節 (全舊約已比對一致)
    /** @type {{addr: string, code: string, unicode: string}[]} */
    const samples = JSON.parse(fs.readFileSync(new URL('./fixtures/bhs_umscode_sample.json', import.meta.url), 'utf8'))

    it.each(samples.map(a1 => [a1.addr, a1]))('%s', (_addr, a1) => {
        expect(umscode(a1.code)).toBe(a1.unicode)
    })
})
