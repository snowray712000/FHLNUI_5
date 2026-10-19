import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'

const read = f => JSON.parse(fs.readFileSync(new URL(f, import.meta.url), 'utf8'))

/** 假的 localStorage；throwing 為真時模擬讀寫都會丟錯 (無痕等) */
function fakeStorage(init = {}, throwing = false) {
    const m = new Map(Object.entries(init))
    return {
        getItem: k => { if (throwing) throw new Error('blocked'); return m.has(k) ? m.get(k) : null },
        setItem: (k, v) => { if (throwing) throw new Error('blocked'); m.set(k, String(v)) },
        map: m,
    }
}
/** resetModules 之後每個模組都是新的一份，所以 BookRegistry 也要在重設後才 import (與 BookNameStyle 同一份) */
let BookRegistry
const apoBooks = read('../index/apo_books.json').books
beforeEach(async () => {
    vi.resetModules()
    ;({ BookRegistry } = await import('../index/BookRegistry.es2023.js'))
    BookRegistry.registerCorpus('apo', apoBooks)
})
afterEach(() => vi.unstubAllGlobals())

describe('BookNameStyle：次經書名用哪一套', () => {
    it('沒存過 → 信望愛站名；載入模組時就套用到 BookRegistry', async () => {
        vi.stubGlobal('localStorage', fakeStorage())
        const { readNameStyle } = await import('../index/BookNameStyle.es2023.js')
        expect(readNameStyle()).toBe('fhl')
        expect(BookRegistry.getNameStyle()).toBe('fhl')
        expect(BookRegistry.nameFull(103)).toBe('多比傳')
    })
    it('存的是 alt → 載入就是通行名 (一開頁書名就對，不會先閃一下站名)', async () => {
        vi.stubGlobal('localStorage', fakeStorage({ fhlApoNameStyle: 'alt' }))
        await import('../index/BookNameStyle.es2023.js')
        expect(BookRegistry.getNameStyle()).toBe('alt')
        expect(BookRegistry.nameFull(103)).toBe('多俾亞傳')
        expect(BookRegistry.nameShort(104)).toBe('友弟')
    })
    it('存的不認得 → 站名', async () => {
        vi.stubGlobal('localStorage', fakeStorage({ fhlApoNameStyle: 'zzz' }))
        const { readNameStyle } = await import('../index/BookNameStyle.es2023.js')
        expect(readNameStyle()).toBe('fhl')
    })
    it('writeNameStyle：套用並記住；不認得的丟錯、不存', async () => {
        const st = fakeStorage()
        vi.stubGlobal('localStorage', st)
        const { writeNameStyle, readNameStyle } = await import('../index/BookNameStyle.es2023.js')
        writeNameStyle('alt')
        expect(BookRegistry.nameFull(105)).toBe('德訓篇')
        expect(st.map.get('fhlApoNameStyle')).toBe('alt')
        expect(readNameStyle()).toBe('alt')
        expect(() => writeNameStyle(/** @type {any} */ ('zzz'))).toThrow(/未知/)
        expect(st.map.get('fhlApoNameStyle')).toBe('alt')
        writeNameStyle('fhl')
        expect(BookRegistry.nameFull(105)).toBe('便西拉智訓')
    })
    it('localStorage 讀寫都丟錯 (無痕)：仍可用，只是不記住', async () => {
        vi.stubGlobal('localStorage', fakeStorage({}, true))
        const { writeNameStyle, readNameStyle } = await import('../index/BookNameStyle.es2023.js')
        expect(readNameStyle()).toBe('fhl')
        expect(() => writeNameStyle('alt')).not.toThrow()
        expect(BookRegistry.nameFull(105)).toBe('德訓篇')
    })
    it('換了書名，另一套的名字照樣認得 (網址、搜尋框)', async () => {
        vi.stubGlobal('localStorage', fakeStorage({ fhlApoNameStyle: 'alt' }))
        await import('../index/BookNameStyle.es2023.js')
        expect(BookRegistry.parseRef('猶滴傳1:2')).toEqual({ book: 104, chap: 1, sec: 2 })
        expect(BookRegistry.parseRef('友弟德傳1:2')).toEqual({ book: 104, chap: 1, sec: 2 })
    })
    it('設定面板 (Settings) 與 index.js 有接上', () => {
        const src = f => fs.readFileSync(new URL(f, import.meta.url), 'utf8')
        expect(src('../index/index.js')).toContain("import './BookNameStyle.es2023.js'")
        expect(src('../index/Settings.es2023.js')).toMatch(/apo_name_style/)
        expect(src('../index/Settings.es2023.js')).toMatch(/writeNameStyle/)
    })
})
