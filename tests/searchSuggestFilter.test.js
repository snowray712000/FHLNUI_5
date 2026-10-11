import { describe, it, expect } from 'vitest'
import { Search_suggestFilter } from '../index/Search_suggestFilter_es2023.js'

const G = { '整卷聖經': [0, 1, 2, 3], '新約': [2, 3], '其它書信': [3] }

describe('Search_suggestFilter', () => {
    it('這卷夠多：選這卷，分類是最小的', () => expect(Search_suggestFilter({ 3: 12 }, G, 3)).toEqual({ group_name: '其它書信', ibook: 3 }))
    it('這卷不夠：由小到大選第一個夠多的分類', () => expect(Search_suggestFilter({ 3: 4, 2: 8 }, G, 3)).toEqual({ group_name: '新約', ibook: null }))
    it('都不夠：整卷聖經', () => expect(Search_suggestFilter({ 3: 4 }, G, 3)).toEqual({ group_name: '整卷聖經', ibook: null }))
    it('沒有分類包含這卷 (搜尋範圍限定)：這卷夠多就選這卷', () => {
        expect(Search_suggestFilter({ 0: 12, 2: 5 }, { '新約': [2, 3] }, 0)).toEqual({ group_name: '整卷聖經', ibook: 0 })
        expect(Search_suggestFilter({ 0: 3, 2: 5 }, { '新約': [2, 3] }, 0)).toEqual({ group_name: '整卷聖經', ibook: null })
    })
})
