import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import { BookRegistry } from '../index/BookRegistry.es2023.js'
import { setS2tTable, toTraditional, isS2tLoaded } from '../index/s2t.es2023.js'
import { SEAF_URL, SEAF_PAGE, INTRO_MAX, seafUrl, plainText, introSnippet, normalizeSeaf, sortAfHits, searchAfAsync } from '../index/searchAf.es2023.js'

const s2t = JSON.parse(fs.readFileSync(new URL('../index/s2t.json', import.meta.url), 'utf8'))

beforeAll(() => {
    BookRegistry.registerCorpus('af', JSON.parse(fs.readFileSync(new URL('../index/af_books.json', import.meta.url), 'utf8')).books)
    setS2tTable(s2t)
})
afterEach(() => vi.unstubAllGlobals())

describe('s2t 對照檔 (npm run gen:s2t)', () => {
    it('simp / trad 一一對應，簡體字不重複，沒有「換了跟沒換一樣」的', () => {
        const s = Array.from(s2t.simp), t = Array.from(s2t.trad)
        expect(s.length).toBe(t.length)
        expect(s.length).toBeGreaterThan(1000)
        expect(new Set(s).size).toBe(s.length)
        s.forEach((c, i) => expect(c, `${c}→${t[i]}`).not.toBe(t[i]))
    })
    it('常用字', () => {
        expect(toTraditional('教会 耶稣基督 书发会个们这来对国说经时爱')).toBe('教會 耶穌基督 書發會個們這來對國說經時愛')
        expect(toTraditional('伊格那丢致罗马人书')).toBe('伊格那丟致羅馬人書')
        expect(toTraditional('众长老')).toBe('眾長老') // 上游書名用異體字「衆」，但內文是「眾」(166 筆) 查得到
    })
    it('繁體也常用的簡體字 (后、里…) 不轉，所以繁體的「皇后」不會變「皇後」', () => {
        expect(toTraditional('皇后')).toBe('皇后')
        expect(toTraditional('里面')).toBe('里面')
    })
    it('繁體原樣、空字串、沒載入時', () => {
        expect(toTraditional('教會')).toBe('教會')
        expect(toTraditional('')).toBe('')
        expect(toTraditional('abc 123')).toBe('abc 123')
        expect(isS2tLoaded()).toBe(true)
    })
    it('長度不同的對照表 → 丟錯', () => {
        expect(() => setS2tTable({ simp: '书会', trad: '書' })).toThrow(/長度/)
        setS2tTable(s2t) // 丟錯後原本的表還在
        expect(toTraditional('书')).toBe('書')
    })
})

describe('seafUrl', () => {
    it('預設一頁 500 筆、offset 0', () => {
        const u = new URL(seafUrl({ q: '教會' }))
        expect(`${u.origin}${u.pathname}`).toBe(SEAF_URL)
        expect(u.pathname).toBe('/api/seaf.php') // /json/seaf.php 沒有 bid
        expect(Object.fromEntries(u.searchParams)).toEqual({ q: '教會', limit: '500', offset: '0' })
    })
    it('關鍵字前後空白去掉，空白分隔的詞保留 (上游當 AND)', () => {
        expect(new URL(seafUrl({ q: '  教會 主教 ' })).searchParams.get('q')).toBe('教會 主教')
    })
    it('空關鍵字、limit 超過 500 或 0 (上游會失敗)、負的 offset → 丟錯', () => {
        for (const q of ['', '   ', null, undefined]) expect(() => seafUrl({ q }), String(q)).toThrow(/空/)
        for (const limit of [0, 501, -1, 1.5]) expect(() => seafUrl({ q: 'a', limit }), String(limit)).toThrow(/limit/)
        for (const offset of [-1, 1.5]) expect(() => seafUrl({ q: 'a', offset }), String(offset)).toThrow(/offset/)
    })
})

describe('plainText', () => {
    it('標記去掉、<br/> 與標題變空白、&nbsp; 變空白、空白合併', () => {
        expect(plainText('<h2>書名</h2><br/>內文&nbsp;&nbsp;甲<i>乙</i>\n丙')).toBe('書名 內文 甲乙 丙')
        expect(plainText(null)).toBe('')
    })
})

describe('introSnippet', () => {
    const long = '甲'.repeat(300) + '教會' + '乙'.repeat(300)
    it('不超過就原樣', () => expect(introSnippet('很短的導論', '教會')).toBe('很短的導論'))
    it('超過時以關鍵字為中心截取，前後加 …，含關鍵字', () => {
        const r = introSnippet(long, '教會')
        expect(r.startsWith('…') && r.endsWith('…')).toBe(true)
        expect(r).toContain('教會')
        expect(Array.from(r).length).toBe(INTRO_MAX + 2)
    })
    it('關鍵字在最前面：只有結尾有 …；沒找到關鍵字：從頭', () => {
        const head = '教會' + '乙'.repeat(300)
        expect(introSnippet(head, '教會').startsWith('教會')).toBe(true)
        expect(introSnippet(head, '教會').startsWith('…')).toBe(false)
        expect(introSnippet('丙'.repeat(300), '找不到').startsWith('丙')).toBe(true)
    })
    it('多個詞：以最先出現的為準', () => {
        expect(introSnippet('甲'.repeat(300) + '主教' + '乙'.repeat(100) + '教會' + '丙'.repeat(300), '教會 主教')).toContain('主教')
    })
    it('結尾那一段也補滿長度', () => {
        const r = introSnippet('甲'.repeat(300) + '教會', '教會')
        expect(r).toContain('教會')
        expect(r.endsWith('…')).toBe(false)
        expect(Array.from(r).length).toBe(INTRO_MAX + 1)
    })
})

describe('normalizeSeaf', () => {
    const rec = (bid, chap, sec, t = '文') => ({ id: 1, chineses: 'x', bid, engs: 'x', chap, sec, bible_text: t })
    it('ibook = bid - 1；數字欄位可能是字串；一般經文 HTML 原樣', () => {
        const r = normalizeSeaf({ status: 'success', record: [rec('212', '1', '2', '甲<i>乙</i>')] }, '教會')
        expect(r).toEqual([{ ibook: 211, chap: 1, sec: 2, isIntro: false, text: '甲<i>乙</i>' }])
    })
    it('chap 0 sec 0 是導論：轉純文字、截成片段', () => {
        const [r] = normalizeSeaf({ status: 'success', record: [rec(216, 0, 0, '<h2>導論</h2><br/>' + '甲'.repeat(300) + '教會')] }, '教會')
        expect(r.isIntro).toBe(true)
        expect(r.text).not.toMatch(/</)
        expect(r.text).toContain('教會')
    })
    it('sec 0 但不是 chap 0 (只有一個沒編號的段落，210:14) 不是導論', () => {
        const [r] = normalizeSeaf({ status: 'success', record: [rec(210, 14, 0, '我是請革勒士')] }, 'x')
        expect(r.isIntro).toBe(false)
        expect(r.text).toBe('我是請革勒士')
    })
    it('status 不是 success → 丟錯；record 沒有 → 空', () => {
        expect(() => normalizeSeaf({ status: 'Fail: Empty Query' }, 'x')).toThrow(/Empty Query/)
        expect(() => normalizeSeaf({ status: 'Fail: record count > 500' }, 'x')).toThrow(/500/)
        expect(() => normalizeSeaf(null, 'x')).toThrow()
        expect(normalizeSeaf({ status: 'success' }, 'x')).toEqual([])
    })
})

describe('sortAfHits', () => {
    const h = (ibook, chap, sec) => ({ ibook, chap, sec, text: '', isIntro: chap == 0 && sec == 0 })
    it('依書、章、節；導論排在該書最前面；不改傳入的陣列', () => {
        const input = [h(215, 0, 0), h(200, 13, 1), h(200, 0, 0), h(200, 13, 1 + 1), h(200, 2, 5)]
        const copy = [...input]
        expect(sortAfHits(input).map(x => `${x.ibook}:${x.chap}:${x.sec}`)).toEqual(['200:0:0', '200:2:5', '200:13:1', '200:13:2', '215:0:0'])
        expect(input).toEqual(copy)
    })
})

describe('searchAfAsync', () => {
    const page = (n, bid = 212) => ({ status: 'success', record: Array.from({ length: n }, (_, i) => ({ bid, chap: 1, sec: i + 1, bible_text: '經文' })) })
    function stubFetch(pages) {
        const urls = []
        vi.stubGlobal('fetch', vi.fn(async url => {
            urls.push(url)
            const p = pages[urls.length - 1] ?? page(0)
            return { ok: true, status: 200, text: async () => JSON.stringify(p) }
        }))
        return urls
    }
    it('簡體關鍵字先轉繁體；回傳實際送出的詞 (標示關鍵字用)', async () => {
        const urls = stubFetch([page(2)])
        const r = await searchAfAsync('教会 众长老')
        expect(new URL(urls[0]).searchParams.get('q')).toBe('教會 眾長老')
        expect(r.keyword).toBe('教會 眾長老')
        expect(r.hits).toHaveLength(2)
    })
    it('一頁剛好 500 筆就再取下一頁 (offset 500)，少於 500 筆停；結果依書章節排序', async () => {
        const urls = stubFetch([page(SEAF_PAGE, 214), page(3, 201)])
        const r = await searchAfAsync('的')
        expect(urls).toHaveLength(2)
        expect(new URL(urls[1]).searchParams.get('offset')).toBe('500')
        expect(r.hits).toHaveLength(503)
        expect(r.hits[0].ibook).toBe(200) // 201 排在 214 前面
        expect(r.hits[3].ibook).toBe(213)
    })
    it('不是使徒教父的書 (bid 超出範圍) 丟掉', async () => {
        stubFetch([{ status: 'success', record: [{ bid: 5, chap: 1, sec: 1, bible_text: 'x' }, { bid: 212, chap: 1, sec: 1, bible_text: 'y' }] }])
        expect((await searchAfAsync('x')).hits.map(h => h.ibook)).toEqual([211])
    })
    it('上游失敗 → 丟錯 (呼叫端只記在「無法搜尋」，不影響新舊約)', async () => {
        stubFetch([{ status: 'Fail: record count > 500' }])
        await expect(searchAfAsync('的')).rejects.toThrow(/500/)
    })
    it('空關鍵字不打上游', async () => {
        const urls = stubFetch([page(1)])
        await expect(searchAfAsync('  ')).rejects.toThrow(/空/)
        expect(urls).toHaveLength(0)
    })
})
