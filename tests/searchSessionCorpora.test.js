import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import { BookRegistry } from '../index/BookRegistry.es2023.js'
import { setS2tTable } from '../index/s2t.es2023.js'

const read = f => JSON.parse(fs.readFileSync(new URL(f, import.meta.url), 'utf8'))
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

// SearchSession 與 searchBookGroups 用舊式全域 fhl (static/search_api/fhl_api.js)；這裡只給用得到的
globalThis.fhl = {
    g_book_group: { 整卷聖經: range(0, 65), 舊約: range(0, 38), 新約: range(39, 65) },
    g_book_all: [], g_book_allGb: [],
    engs_2_iBook: () => 44,
}

/** @type {typeof import('../index/SearchSession_es2023.js').SearchSession} */
let SearchSession
beforeAll(async () => {
    BookRegistry.registerCorpus('af', read('../index/af_books.json').books)
    BookRegistry.registerCorpus('apo', read('../index/apo_books.json').books)
    setS2tTable(read('../index/s2t.json'))
    ;({ SearchSession } = await import('../index/SearchSession_es2023.js'))
})
afterEach(() => vi.unstubAllGlobals())

const rec = (bid, chap, sec, text = '甲') => ({ bid, chap, sec, bible_text: text })
/** sesub / seaf / qsub 的假回應；回傳呼叫過的網址 */
function stubFetch({ sesub = [], seaf = [], qsub = {} } = {}) {
    const urls = []
    vi.stubGlobal('fetch', vi.fn(async url => {
        urls.push(String(url))
        const u = new URL(url)
        let body = { status: 'success', record: [] }
        if (u.pathname.endsWith('sesub.php')) body = { status: 'success', record: sesub }
        else if (u.pathname.endsWith('seaf.php')) body = { status: 'success', record: seaf }
        else if (u.pathname.endsWith('qsub.php')) body = { status: 'success', record: qsub[`${u.searchParams.get('bid')}:${u.searchParams.get('chap')}`] ?? [] }
        return { ok: true, status: 200, text: async () => JSON.stringify(body) }
    }))
    return urls
}
const groups = () => ({ ...fhl.g_book_group, 次經: BookRegistry.ids('apo').map(id => id - 1), 使徒教父: BookRegistry.ids('af').map(id => id - 1) })
const mk = (scope, extra = {}) => new SearchSession({ keyword: '智慧', versions: ['unv'], gb: 0, strong: 0, engs: 'Rom', ibookCur: 44, scope, ...extra })
const scopeOf = (...names) => new Set([44, ...names.flatMap(n => groups()[n])])

describe('SearchSession：次經、使徒教父 (選擇加入的搜尋分類)', () => {
    it('範圍裡沒有它 (含整本聖經 null)：不列要搜尋的', () => {
        expect(mk(null).wantedCorpora).toEqual([])
        expect(mk(new Set([44])).wantedCorpora).toEqual([])
    })
    it('範圍有次經：只搜次經；有使徒教父：只搜使徒教父；都有：兩個', () => {
        expect(mk(scopeOf('次經')).wantedCorpora.map(c => c.group)).toEqual(['次經'])
        expect(mk(scopeOf('使徒教父')).wantedCorpora.map(c => c.group)).toEqual(['使徒教父'])
        expect(mk(scopeOf('次經', '使徒教父')).wantedCorpora.map(c => c.group)).toEqual(['次經', '使徒教父'])
    })
    it('SN、經文位置、希臘文、希伯來文不查它們', () => {
        for (const keyword of ['G80', '#羅 1:3|', 'πνεῦμα', 'אלהים']) { // 「羅1:3」要靠 fhl.g_book_all 的書名判斷，這裡沒有舊式全域，用 #…| 的寫法
            expect(mk(scopeOf('次經', '使徒教父'), { keyword }).wantedCorpora, keyword).toEqual([])
        }
    })
    it('ensureExternalAsync：搜過的不再搜；次經命中只有位置 (extText 空)，使徒教父帶經文', async () => {
        const urls = stubFetch({ sesub: [rec(103, 1, 2), rec(103, 1, 1)], seaf: [rec(212, 1, 1, '教會')] })
        const s = mk(scopeOf('次經', '使徒教父'))
        await s.ensureExternalAsync()
        expect(urls.filter(u => u.includes('sesub'))).toHaveLength(1)
        expect(urls.filter(u => u.includes('seaf'))).toHaveLength(1)
        expect(s.wantedCorpora).toEqual([])
        await s.ensureExternalAsync()
        expect(urls).toHaveLength(2)
        s.setScope(scopeOf('次經', '使徒教父'))
        expect(s.allVerses.map(v => `${v.ibook}:${v.chap}:${v.sec}:${v.vers}:${v.extText ?? ''}`)).toEqual([
            '102:1:1:c1933:', '102:1:2:c1933:', '211:1:1:afhuang:教會',
        ])
    })
    it('範圍改成不含它：先前搜到的不列、也不算範圍外；再勾回來，不重搜', async () => {
        const urls = stubFetch({ sesub: [rec(103, 1, 1)] })
        const s = mk(scopeOf('次經'))
        await s.ensureExternalAsync()
        expect(s.verses).toHaveLength(1)
        s.setScope(null)
        expect(s.verses).toHaveLength(0)
        expect(s.outOfScope).toBe(0)
        s.setScope(scopeOf('次經'))
        expect(s.verses).toHaveLength(1)
        await s.ensureExternalAsync()
        expect(urls).toHaveLength(1)
    })
    it('一類失敗不影響另一類，只記在 failedVersions', async () => {
        vi.stubGlobal('fetch', vi.fn(async url => {
            const body = String(url).includes('sesub') ? { status: 'Fail: record count > 500' } : { status: 'success', record: [rec(212, 1, 1, '教會')] }
            return { ok: true, status: 200, text: async () => JSON.stringify(body) }
        }))
        const s = mk(scopeOf('次經', '使徒教父'))
        await s.ensureExternalAsync()
        expect(s.failedVersions.map(f => f.ver)).toEqual(['c1933'])
        expect(s.failedVersions[0].reason).toMatch(/500/)
        s.setScope(scopeOf('次經', '使徒教父'))
        expect(s.verses.map(v => v.vers[0])).toEqual(['afhuang'])
        expect(s.wantedCorpora).toEqual([]) // 失敗的也不重試 (一次搜尋只試一次)
    })
    it('extKeyword：各類實際送出的寫法 (簡體轉繁體、次經的舊式字)，詞不重複', async () => {
        stubFetch({})
        const s = mk(scopeOf('次經', '使徒教父'), { keyword: '众人' })
        await s.ensureExternalAsync()
        expect(s.extKeyword.split(' ').sort()).toEqual(['眾人', '衆人'])
    })
    it('loadMoreAsync：次經用 qsub.php 取整章 (簡繁跟 gb)，同一章只打一次；使徒教父的字隨搜尋帶回來', async () => {
        const urls = stubFetch({
            sesub: [rec(103, 1, 1), rec(103, 1, 2), rec(103, 2, 1)],
            seaf: [rec(212, 1, 1, '遺訓的字')],
            qsub: {
                '103:1': [rec(103, 1, 1, '一'), rec(103, 1, 2, '二'), rec(103, 1, 3, '三')],
                '103:2': [rec(103, 2, 1, '甲')],
            },
        })
        const s = mk(scopeOf('次經', '使徒教父'), { gb: 1 })
        await s.ensureExternalAsync()
        s.setScope(scopeOf('次經', '使徒教父'))
        s.setFilter(null)
        const rows = await s.loadMoreAsync()
        expect(rows.map(r => `${r.ibook}:${r.chap}:${r.sec}=${r.texts.map(t => `${t.ver}/${t.bible_text}`)}`)).toEqual([
            '102:1:1=c1933/一', '102:1:2=c1933/二', '102:2:1=c1933/甲', '211:1:1=afhuang/遺訓的字',
        ])
        const qsub = urls.filter(u => u.includes('qsub.php'))
        expect(qsub).toHaveLength(2) // 103 第 1、2 章各一次
        expect(qsub.every(u => new URL(u).searchParams.get('gb') == '1')).toBe(true)
        expect(urls.some(u => u.includes('qsb.php'))).toBe(false)
    })
    it('次經某章取不到：那幾節是空字，不影響其它節', async () => {
        vi.stubGlobal('fetch', vi.fn(async url => {
            const u = String(url)
            if (u.includes('sesub')) return { ok: true, status: 200, text: async () => JSON.stringify({ status: 'success', record: [rec(103, 1, 1), rec(104, 1, 1)] }) }
            if (new URL(u).searchParams.get('bid') == '103') return { ok: true, status: 200, text: async () => JSON.stringify({ status: 'Fail: x' }) }
            return { ok: true, status: 200, text: async () => JSON.stringify({ status: 'success', record: [rec(104, 1, 1, '猶滴')] }) }
        }))
        vi.spyOn(console, 'warn').mockImplementation(() => { })
        const s = mk(scopeOf('次經'))
        await s.ensureExternalAsync()
        s.setScope(scopeOf('次經'))
        s.setFilter(null)
        const rows = await s.loadMoreAsync()
        expect(rows.map(r => r.texts[0].bible_text)).toEqual(['', '猶滴'])
    })
})
