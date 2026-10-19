import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import { BookRegistry } from '../index/BookRegistry.es2023.js'
import { setS2tTable } from '../index/s2t.es2023.js'
import { SESUB_URL, SESUB_PAGE, APO_VARIANTS, sesubUrl, apoQueries, normalizeSesub, searchApoAsync } from '../index/searchApo.es2023.js'
import { SEARCH_CORPORA, corpusOfVersion, isExternalVerse } from '../index/searchCorpora.es2023.js'
import { OPT_IN, scopeHasGroup, scopeBooks, readScope, checkedWithImplicit, scopeLabel } from '../index/SearchScope.es2023.js'

const read = f => JSON.parse(fs.readFileSync(new URL(f, import.meta.url), 'utf8'))

beforeAll(() => {
    BookRegistry.registerCorpus('af', read('../index/af_books.json').books)
    BookRegistry.registerCorpus('apo', read('../index/apo_books.json').books)
    setS2tTable(read('../index/s2t.json'))
})
afterEach(() => vi.unstubAllGlobals())

describe('sesubUrl', () => {
    it('預設一頁 500 筆、offset 0；沒有 gb、沒有 version (一律 gb=0 搜尋)', () => {
        const u = new URL(sesubUrl({ q: '智慧' }))
        expect(`${u.origin}${u.pathname}`).toBe(SESUB_URL)
        expect(u.searchParams.get('limit')).toBe('500')
        expect(u.searchParams.get('offset')).toBe('0')
        expect([...u.searchParams.keys()].sort()).toEqual(['limit', 'offset', 'q'])
    })
    it('用 /api/', () => expect(SESUB_URL).toBe('https://bible.fhl.net/api/sesub.php'))
    it('關鍵字前後空白去掉，空白分隔的詞保留 (上游當 AND)', () => {
        expect(new URL(sesubUrl({ q: '  智慧 人 ' })).searchParams.get('q')).toBe('智慧 人')
    })
    it('空關鍵字、limit 超過 500 或 0 (上游會失敗)、負的 offset → 丟錯', () => {
        expect(() => sesubUrl({ q: ' ' })).toThrow(/空/)
        for (const limit of [0, 501, 1.5, NaN]) expect(() => sesubUrl({ q: 'a', limit }), String(limit)).toThrow(/limit/)
        for (const offset of [-1, 1.5, NaN]) expect(() => sesubUrl({ q: 'a', offset }), String(offset)).toThrow(/offset/)
    })
})

describe('apoQueries：異體字', () => {
    it('c1933 用 爲 眞 衆 却 裏：現代寫法換過去，c1933 的寫法排前面，原寫法也查', () => {
        expect(apoQueries('為')).toEqual(['爲', '為'])
        expect(apoQueries('真實')).toEqual(['眞實', '真實'])
        expect(apoQueries('眾人')).toEqual(['衆人', '眾人'])
        expect(apoQueries('裡面')).toEqual(['裏面', '裡面'])
        expect(apoQueries('不卻')).toEqual(['不却', '不卻'])
    })
    it('沒有可換的字：只查一次', () => {
        expect(apoQueries('智慧')).toEqual(['智慧'])
        expect(apoQueries('  智慧 人 ')).toEqual(['智慧 人'])
    })
    it('簡體先轉繁體再換：众 → 眾 → 衆；为 → 為 → 爲', () => {
        expect(apoQueries('众人')).toEqual(['衆人', '眾人'])
        expect(apoQueries('为什么')).toEqual(['爲什麼', '為什麼'])
    })
    it('已經是 c1933 的寫法：只查一次', () => {
        expect(apoQueries('爲')).toEqual(['爲'])
        expect(apoQueries('衆人')).toEqual(['衆人'])
    })
    it('對照表只換 c1933 幾乎一律用的字', () => {
        expect(APO_VARIANTS).toEqual({ 為: '爲', 真: '眞', 眾: '衆', 卻: '却', 裡: '裏' })
    })
})

describe('normalizeSesub', () => {
    it('ibook = bid - 1；數字可能是字串；只留位置', () => {
        const r = normalizeSesub({ status: 'success', record: [{ id: 1, bid: '102', chap: '2', sec: 9, engs: '2Mc', chineses: '馬二', bible_text: '書上又說' }] })
        expect(r).toEqual([{ ibook: 101, chap: 2, sec: 9, isIntro: false }])
        expect(r[0]).not.toHaveProperty('text')
    })
    it('章或節是 0 的 (次經沒有，防萬一) 丟掉', () => {
        expect(normalizeSesub({ status: 'success', record: [{ bid: 103, chap: 0, sec: 0 }, { bid: 103, chap: 1, sec: 0 }, { bid: 103, chap: 1, sec: 1 }] })).toHaveLength(1)
    })
    it('status 不是 success → 丟錯；record 沒有 → 空', () => {
        expect(() => normalizeSesub({ status: 'Fail: record count > 500' })).toThrow(/sesub: Fail/)
        expect(() => normalizeSesub(null)).toThrow(/sesub/)
        expect(normalizeSesub({ status: 'success' })).toEqual([])
    })
})

describe('searchApoAsync', () => {
    const rec = (bid, chap, sec) => ({ bid, chap, sec, bible_text: 'x' })
    const page = (n, bid = 103) => ({ status: 'success', record: Array.from({ length: n }, (_, i) => rec(bid, 1, i + 1)) })
    /** 依 q 回不同的頁 @param {Record<string, any[]>} byQuery 每個 q 依序的頁 */
    function stubFetch(byQuery) {
        const calls = []
        const used = {}
        vi.stubGlobal('fetch', vi.fn(async url => {
            const u = new URL(url)
            calls.push({ q: u.searchParams.get('q'), offset: +u.searchParams.get('offset') })
            const q = u.searchParams.get('q')
            const i = used[q] = (used[q] ?? -1) + 1
            const p = byQuery[q]?.[i] ?? { status: 'success', record: [] }
            return { ok: true, status: 200, text: async () => JSON.stringify(p) }
        }))
        return calls
    }
    it('沒有異體字：查一次，結果依書章節排序 (上游順序不保證)', async () => {
        const calls = stubFetch({ 智慧: [{ status: 'success', record: [rec(106, 1, 2), rec(102, 2, 9), rec(106, 1, 1)] }] })
        const r = await searchApoAsync('智慧')
        expect(calls).toEqual([{ q: '智慧', offset: 0 }])
        expect(r.hits.map(h => `${h.ibook}:${h.chap}:${h.sec}`)).toEqual(['101:2:9', '105:1:1', '105:1:2'])
        expect(r.keyword).toBe('智慧')
    })
    it('有異體字：兩種寫法各查一次，結果聯集 (同一節只一筆)；keyword 是所有寫法', async () => {
        const calls = stubFetch({
            爲: [{ status: 'success', record: [rec(103, 1, 1), rec(103, 1, 2)] }],
            為: [{ status: 'success', record: [rec(103, 1, 2), rec(103, 2, 5)] }],
        })
        const r = await searchApoAsync('為')
        expect(calls.map(c => c.q)).toEqual(['爲', '為'])
        expect(r.hits.map(h => `${h.chap}:${h.sec}`)).toEqual(['1:1', '1:2', '2:5'])
        expect(r.keyword).toBe('爲 為')
    })
    it('簡體關鍵字先轉繁體 (一律 gb=0)', async () => {
        const calls = stubFetch({ 教會: [page(1)] })
        await searchApoAsync('教会')
        expect(calls.map(c => c.q)).toEqual(['教會'])
    })
    it('多個詞：keyword 去掉重複的詞', async () => {
        stubFetch({})
        expect((await searchApoAsync('真實 人')).keyword).toBe('眞實 人 真實')
    })
    it('一頁剛好 500 筆就再取下一頁 (offset 500)，少於 500 筆停', async () => {
        const calls = stubFetch({ 的: [page(SESUB_PAGE, 105), page(3, 101)] })
        const r = await searchApoAsync('的')
        expect(calls).toEqual([{ q: '的', offset: 0 }, { q: '的', offset: 500 }])
        expect(r.hits).toHaveLength(503)
        expect(r.hits[0].ibook).toBe(100) // 101 排在 105 前面
    })
    it('不是次經的書 (bid 超出範圍) 丟掉', async () => {
        stubFetch({ x: [{ status: 'success', record: [rec(5, 1, 1), rec(212, 1, 1), rec(103, 1, 1)] }] })
        expect((await searchApoAsync('x')).hits.map(h => h.ibook)).toEqual([102])
    })
    it('上游失敗 → 丟錯 (呼叫端只記在「無法搜尋」，不影響新舊約)', async () => {
        stubFetch({ 的: [{ status: 'Fail: record count > 500' }] })
        await expect(searchApoAsync('的')).rejects.toThrow(/500/)
    })
    it('空關鍵字不打上游', async () => {
        const calls = stubFetch({})
        await expect(searchApoAsync('  ')).rejects.toThrow(/空/)
        expect(calls).toHaveLength(0)
    })
})

describe('searchCorpora', () => {
    it('次經在使徒教父前面 (同畫面順序)；文本代碼不重複', () => {
        expect(SEARCH_CORPORA.map(c => c.corpus)).toEqual(['apo', 'af'])
        expect(new Set(SEARCH_CORPORA.map(c => c.version)).size).toBe(SEARCH_CORPORA.length)
        expect(corpusOfVersion('c1933').group).toBe('次經')
        expect(corpusOfVersion('afhuang').group).toBe('使徒教父')
        expect(corpusOfVersion('unv')).toBeNull()
    })
    it('欄名：次經跟簡繁；使徒教父固定', () => {
        expect(corpusOfVersion('c1933').name(false)).toBe('1933年聖公會出版')
        expect(corpusOfVersion('c1933').name(true)).toBe('1933年圣公会出版')
        expect(corpusOfVersion('afhuang').name(true)).toBe('使徒教父')
    })
    it('只有使徒教父帶經文；次經只有位置', () => {
        expect(corpusOfVersion('afhuang').textInHits).toBe(true)
        expect(corpusOfVersion('c1933').textInHits).toBe(false)
    })
    it('isExternalVerse：vers 只有它的文本代碼才算 (和新舊約譯本一起找到的不算)', () => {
        expect(isExternalVerse({ vers: ['c1933'] })).toBe(true)
        expect(isExternalVerse({ vers: ['afhuang'] })).toBe(true)
        expect(isExternalVerse({ vers: ['unv'] })).toBe(false)
        expect(isExternalVerse({ vers: ['unv', 'c1933'] })).toBe(false)
    })
})

describe('搜尋範圍：次經是選擇加入的分類', () => {
    // 新舊約 0–65 (舊約 0–38)、次經 100–114、使徒教父 200–216
    const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
    const GA = { 整卷聖經: range(0, 65), 舊約: range(0, 38), 新約: range(39, 65), 次經: range(100, 114), 使徒教父: range(200, 216) }
    it('OPT_IN 有次經與使徒教父', () => expect(OPT_IN).toEqual(['次經', '使徒教父']))
    it('預設 (沒存過) 兩個都不勾；預設範圍仍是整本聖經', () => {
        const all = readScope(GA)
        expect(all).not.toContain('次經')
        expect(all).not.toContain('使徒教父')
        expect(scopeBooks(GA, all, 44)).toBeNull()
    })
    it('勾次經：不再是整本聖經；只含次經、不含使徒教父', () => {
        const s = scopeBooks(GA, [...readScope(GA), '次經'], 44)
        expect(s.size).toBe(66 + 15)
        expect(scopeHasGroup(s, GA, '次經')).toBe(true)
        expect(scopeHasGroup(s, GA, '使徒教父')).toBe(false)
    })
    it('讀次經的書 (多比傳 ibook 102) 時自動含整個次經，不用勾', () => {
        expect(checkedWithImplicit(GA, [], 102)).toEqual(['次經'])
        const s = scopeBooks(GA, readScope(GA), 102)
        expect(range(100, 114).every(b => s.has(b))).toBe(true)
        expect(scopeHasGroup(s, GA, '使徒教父')).toBe(false)
        expect(scopeLabel(GA, [], 102, '多比傳')).toBe('次經')
    })
    it('scopeHasGroup：整本聖經 (null) 沒有；沒這個分類沒有', () => {
        expect(scopeHasGroup(null, GA, '次經')).toBe(false)
        expect(scopeHasGroup(new Set([1, 2]), GA, '次經')).toBe(false)
        expect(scopeHasGroup(new Set([1, 100]), GA, '次經')).toBe(true)
        expect(scopeHasGroup(new Set([100]), GA, '不存在')).toBe(false)
    })
})
