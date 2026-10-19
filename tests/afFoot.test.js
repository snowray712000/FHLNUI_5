import { describe, it, expect, beforeAll } from 'vitest'
import { BookRegistry } from '../index/BookRegistry.es2023.js'
import { afFootUrl, parseAfFoot, AF_FOOT_PATH } from '../index/afFootAsync.es2023.js'
import fs from 'node:fs'

beforeAll(() => {
    BookRegistry.registerCorpus('af', JSON.parse(fs.readFileSync(new URL('../index/af_books.json', import.meta.url), 'utf8')).books)
})

describe('使徒教父注腳網址 (AF/rt.php)', () => {
    it('編號與英文縮寫，空白要編碼', () => {
        expect(afFootUrl({ book: 201, id: 3 })).toBe(`${AF_FOOT_PATH}?k=3&VERSION=afhuang&book=1+Clem.`)
        expect(afFootUrl({ book: 214, id: '150' })).toContain('book=Herm.')
    })
    it('新舊約、不存在的書、壞編號都丟錯', () => {
        expect(() => afFootUrl({ book: 1, id: 1 })).toThrow()
        expect(() => afFootUrl({ book: 299, id: 1 })).toThrow()
        expect(() => afFootUrl({ book: 201, id: 0 })).toThrow()
        expect(() => afFootUrl({ book: 201, id: 'x' })).toThrow()
    })
})

describe('parseAfFoot', () => {
    const wrap = td => `<html><body><FONT COLOR="#000000"><center><table border=1>\n<tr><td>${td}</td></tr>\n</table></body></html>`
    it('拿掉開頭的圓圈數字', () => {
        expect(parseAfFoot(wrap('③ 不尋常：直譯“異類”。'))).toBe('不尋常：直譯“異類”。')
        expect(parseAfFoot(wrap('⑳ 二十'))).toBe('二十')
        expect(parseAfFoot(wrap('㉑ 二十一'))).toBe('二十一')
        expect(parseAfFoot(wrap('㊿ 五十'))).toBe('五十')
    })
    it('超過圓圈範圍的 (12) 【12】 12. 也拿掉；內文開頭是章節不誤拿', () => {
        expect(parseAfFoot(wrap('51 有抄本沒有「及雀躍」'))).toBe('有抄本沒有「及雀躍」') // 上游 51 起就是一般數字 (50 以內才有圓圈)
        expect(parseAfFoot(wrap('100 上主：或譯“主”'))).toBe('上主：或譯“主”')
        expect(parseAfFoot(wrap('(12) 內文'))).toBe('內文')
        expect(parseAfFoot(wrap('【120】內文'))).toBe('內文')
        expect(parseAfFoot(wrap('① 參：太 22:37,39; 路 10:27。 '))).toBe('參：太 22:37,39; 路 10:27。')
    })
    it('標記、&nbsp;、連續空白整理成純文字', () => {
        expect(parseAfFoot(wrap('① 甲<br/>乙&nbsp;&nbsp;丙 <i>丁</i>'))).toBe('甲 乙 丙 丁')
    })
    it('查不到的回應 (沒有 td) 與空內容回 null', () => {
        expect(parseAfFoot('<html><body>查不到任何資料，請修改查詢條件再查！')).toBeNull()
        expect(parseAfFoot(wrap('①'))).toBeNull()
        expect(parseAfFoot(undefined)).toBeNull()
    })
})
