import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { parseSsnHtml, isGreekKeyword } from '../index/SearchApi_es2023.js'
import { greekLooseRegexSource } from '../index/greekToFhlCode.es2023.js'

const fixture = name => fs.readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')

describe('parseSsnHtml', () => {
    it('1 筆：帖前 5:19 (engs 有空白，href 裡是 1+Thess)', () => {
        expect(parseSsnHtml(fixture('ssn_sbevnnute.html'))).toEqual({
            addrs: [{ engs: '1 Thess', chap: 5, sec: 19 }], tooMany: null,
        })
    })

    it('多筆：orig=ajgaphtov 共 61 筆', () => {
        const r = parseSsnHtml(fixture('ssn_orig_ajgaphtov.html'))
        expect(r.tooMany).toBeNull()
        expect(r.addrs.length).toBe(61)
        expect(r.addrs[0]).toEqual({ engs: 'Matt', chap: 3, sec: 17 })
    })

    it('查不到', () => {
        expect(parseSsnHtml(fixture('ssn_notfound.html'))).toEqual({ addrs: [], tooMany: null })
    })

    it('資料太多 (上限約 500 筆)', () => {
        const html = '<br />資料太多，共有8670 筆，請 <a href="javascript:history.back()">修改查詢條件</a> 再查'
        expect(parseSsnHtml(html)).toEqual({ addrs: [], tooMany: 8670 })
    })
})

describe('isGreekKeyword', () => {
    it.each([
        ['λόγος', true], // λόγος tonos
        ['Ἰησοῦς', true], // Ἰησοῦς
        ['摩西', false], ['G80', false], ['love', false],
    ])('%s → %s', (s, exp) => {
        expect(isGreekKeyword(s)).toBe(exp)
    })
})

describe('greekLooseRegexSource (搜尋結果標示關鍵字)', () => {
    const re = w => new RegExp(greekLooseRegexSource(w), 'gi')

    it('鍵盤打的 tonos 能標出經文的 oxia', () => {
        // 經文 (FHL, oxia)：τὸ πνεῦμα μὴ σβέννυτε
        const text = 'τὸ πνεῦμα μὴ σβέννυτε'
        expect(text.match(re('σβέννυτε'))).toHaveLength(1) // σβέννυτε tonos
        expect(text.match(re('σβέννυτε'))).toHaveLength(1) // oxia
    })

    it('σ ς 視為相同 (打 λογοσ 也行)', () => {
        const text = 'λόγος' // λόγος
        expect(text.match(re('λόγοσ'))).toHaveLength(1)
    })

    it('一般字元照常 escape', () => {
        expect(greekLooseRegexSource('a.b(c)')).toBe('a\\.b\\(c\\)')
        expect('摩西 摩西'.match(re('摩西'))).toHaveLength(2)
    })
})
