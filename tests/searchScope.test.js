import { describe, it, expect } from 'vitest'
import { scopeTree, effectiveChecked, scopeBooks, scopeLabel, scopeGroups, readScope, checkedWithImplicit, scopeHasOptIn } from '../index/SearchScope.es2023.js'

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
// 同 static/search_api/fhl_api.js 的 fhl.g_book_group
const G = {
    '整卷聖經': range(0, 65), '舊約': range(0, 38), '新約': range(39, 65),
    '摩西五經': range(0, 4), '歷史書': range(5, 16), '詩歌智慧書': range(17, 21), '大先知書': range(22, 26), '小先知書': range(27, 38),
    '福音書': range(39, 43), '保羅書信': range(44, 56), '其它書信': range(57, 65),
    '路加著作': [41, 43], '約翰著作': [42, 61, 62, 63, 65],
}

describe('scopeTree', () => {
    it('樹狀：大分類在前，小分類縮排；不含整卷聖經', () => {
        expect(scopeTree(G).map(n => `${n.depth}${n.name}`)).toEqual([
            '0舊約', '1摩西五經', '1歷史書', '1詩歌智慧書', '1大先知書', '1小先知書',
            '0新約', '1福音書', '2路加著作', '1保羅書信', '1其它書信', '1約翰著作',
        ])
    })
})

describe('effectiveChecked', () => {
    it('沒勾', () => expect(effectiveChecked(G, []).size).toBe(0))
    it('勾新約，保羅書信沒勾也算勾 (含於 新約)', () => {
        const e = effectiveChecked(G, ['新約'])
        expect(e.get('新約')).toBeNull()
        expect(e.get('保羅書信')).toBe('新約')
        expect(e.get('路加著作')).toBe('新約')
        expect(e.get('約翰著作')).toBe('新約') // 含啟示錄，不在福音書裡，但在新約裡
        expect(e.has('舊約')).toBe(false)
    })
    it('小分類自己勾', () => {
        const e = effectiveChecked(G, ['福音書', '約翰著作'])
        expect(e.get('福音書')).toBeNull()
        expect(e.get('路加著作')).toBe('福音書')
        expect(e.get('約翰著作')).toBeNull()
        expect(e.has('保羅書信')).toBe(false)
    })
    it('自己勾了、也被大分類包含：算被包含 (不能取消)', () => {
        expect(effectiveChecked(G, ['新約', '保羅書信']).get('保羅書信')).toBe('新約')
    })
})

describe('scopeBooks', () => {
    it('什麼都沒勾：只有目前這卷', () => expect([...scopeBooks(G, [], 58)]).toEqual([58]))
    it('勾保羅書信：目前這卷 + 保羅書信', () => {
        const s = scopeBooks(G, ['保羅書信'], 58)
        expect(s.has(58)).toBe(true)
        expect(s.has(44) && s.has(56) && !s.has(57)).toBe(true)
    })
    it('勾新約，目前讀舊約：舊約只有目前那卷', () => {
        const s = scopeBooks(G, ['新約'], 0)
        expect(s.size).toBe(28)
        expect(s.has(0) && !s.has(1)).toBe(true)
    })
    it('舊約 + 新約：整本聖經 (null)', () => expect(scopeBooks(G, ['舊約', '新約'], 0)).toBeNull())
    it('目前這卷已在勾的分類裡不重複', () => expect(scopeBooks(G, ['保羅書信'], 44).size).toBe(13))
})

describe('scopeLabel', () => {
    it('什麼都沒勾：只有目前這卷', () => expect(scopeLabel(G, [], 58, '雅')).toBe('雅'))
    it('勾了別的分類：目前這卷 ＋ 分類', () => expect(scopeLabel(G, ['保羅書信', '福音書'], 58, '雅')).toBe('雅＋福音書＋保羅書信'))
    it('目前這卷已在勾的分類裡：不重複列', () => expect(scopeLabel(G, ['其它書信'], 58, '雅')).toBe('其它書信'))
    it('大分類包含小分類：只列大的', () => expect(scopeLabel(G, ['新約', '保羅書信'], 0, '創')).toBe('創＋新約'))
    it('全部：整卷聖經', () => expect(scopeLabel(G, ['舊約', '新約'], 0, '創')).toBe('整卷聖經'))
})

describe('scopeGroups', () => {
    it('什麼都沒勾：沒有分類', () => expect(Object.keys(scopeGroups(G, []))).toEqual([]))
    it('勾新約：新約與它包含的', () => {
        expect(Object.keys(scopeGroups(G, ['新約'])).sort()).toEqual(['保羅書信', '其它書信', '福音書', '約翰著作', '路加著作', '新約'].sort())
    })
    it('勾其它書信：只有它', () => expect(Object.keys(scopeGroups(G, ['其它書信']))).toEqual(['其它書信']))
})

// ---- 選擇加入的分類：使徒教父 (z261019a) ----
const AF = range(200, 216)
const GA = { ...G, 使徒教父: AF }

describe('使徒教父：選擇加入', () => {
    it('樹狀：使徒教父是頂層分類，排在最後', () => {
        const t = scopeTree(GA).map(n => `${n.depth}${n.name}`)
        expect(t.at(-1)).toBe('0使徒教父')
        expect(t.slice(0, -1)).toEqual(scopeTree(G).map(n => `${n.depth}${n.name}`))
    })
    it('預設 (沒存過) 不勾使徒教父，其它全勾；舊的存檔不受影響', () => {
        const all = readScope(GA)
        expect(all).not.toContain('使徒教父')
        expect(all).toContain('舊約')
        expect(all).toContain('約翰著作')
    })
    it('預設範圍仍是 null (整本聖經)，與加入使徒教父之前一樣', () => {
        expect(scopeBooks(GA, readScope(GA), 44)).toBeNull()
    })
    it('勾了使徒教父：不再是整本聖經，含使徒教父全部', () => {
        const s = scopeBooks(GA, [...readScope(GA), '使徒教父'], 44)
        expect(s).not.toBeNull()
        expect(s.size).toBe(66 + 17)
        expect(scopeHasOptIn(s, GA)).toBe(true)
    })
    it('讀使徒教父的書時自動含整個使徒教父，不用勾', () => {
        const s = scopeBooks(GA, readScope(GA), 211)
        expect(AF.every(b => s.has(b))).toBe(true)
        expect(s.has(0)).toBe(true) // 新舊約預設全勾
        expect(checkedWithImplicit(GA, [], 211)).toEqual(['使徒教父'])
        expect(checkedWithImplicit(GA, [], 44)).toEqual([])
    })
    it('讀新舊約、沒勾使徒教父：範圍裡沒有它', () => {
        expect(scopeHasOptIn(scopeBooks(GA, ['新約'], 0), GA)).toBe(false)
        expect(scopeHasOptIn(null, GA)).toBe(false)
    })
    it('只勾使徒教父、讀新舊約：目前這卷 + 使徒教父', () => {
        const s = scopeBooks(GA, ['使徒教父'], 44)
        expect([...s].sort((a, b) => a - b)).toEqual([44, ...AF])
    })
    it('範圍文字', () => {
        expect(scopeLabel(GA, readScope(GA), 44, '羅馬書')).toBe('整卷聖經')
        expect(scopeLabel(GA, ['使徒教父'], 44, '羅馬書')).toBe('羅馬書＋使徒教父')
        expect(scopeLabel(GA, [], 211, '遺訓')).toBe('使徒教父') // 目前這卷已在自動含的分類裡，不另列
    })
    it('scopeGroups：含自動含的分類 (搜尋結果的篩選按鈕要列)', () => {
        const checked = checkedWithImplicit(GA, [], 211)
        expect(Object.keys(scopeGroups(GA, checked))).toEqual(['使徒教父'])
    })
})
