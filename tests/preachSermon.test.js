import { describe, it, expect } from 'vitest'
import { parseSermon, formatPreachTitle } from '../index/PreachSermon.es2023.js'

describe('formatPreachTitle', () => {
    it('同一節、同章多節、跨章、書卷導論', () => {
        expect(formatPreachTitle('創世記 1章1節 到 1章1節')).toBe('創世記 1:1')
        expect(formatPreachTitle('馬太福音 5章1節 到 5章3節')).toBe('馬太福音 5:1-3')
        expect(formatPreachTitle('馬太福音 4章25節 到 5章2節')).toBe('馬太福音 4:25-5:2')
        expect(formatPreachTitle('創世記 0章0節 到 0章0節')).toBe('創世記 書卷導論')
        expect(formatPreachTitle('其它')).toBe('其它')
    })
})

describe('parseSermon', () => {
    it('沒資料', () => {
        expect(parseSermon({ status: 'success', record_count: 0 }, 8)).toBe(null)
        expect(parseSermon(null, 8)).toBe(null)
    })
    it('蔡茂堂：大綱 + 台語、華語兩個錄音', () => {
        const jo = {
            record_count: 1,
            prev: { book: '8', engs: 'Gen', chap: 0, sec: 0 },
            next: { book: '8', engs: 'Gen', chap: 1, sec: 2 },
            record: [{
                title: '創世記 1章1節 到 1章1節', book_name: '蔡茂堂牧師講道',
                com_text: '宇宙之開放性及依存性\r\n上帝之超然, 主權、能力、智慧 \r\n[media$N01_001_001_001_001_t.m3u]（台語）\r\n[media$N01_001_001_001_001_m.m3u](華語）\r\n\r\n',
            }],
        }
        const re = parseSermon(jo, 8)
        expect(re.speaker).toBe('蔡茂堂牧師')
        expect(re.title).toBe('創世記 1:1')
        expect(re.outline).toEqual(['宇宙之開放性及依存性', '上帝之超然, 主權、能力、智慧'])
        expect(re.tracks).toEqual([
            { label: '台語', url: 'https://media.fhl.net/cbolcom/8/N01_001_001_001_001_t.mp3' },
            { label: '華語', url: 'https://media.fhl.net/cbolcom/8/N01_001_001_001_001_m.mp3' },
        ])
        expect(re.next.chap).toBe(1)
    })
    it('康來昌：只有錄音，路徑含子資料夾', () => {
        const re = parseSermon({
            record_count: 1, record: [{ title: '馬太福音 5章1節 到 5章3節', book_name: '康來昌牧師講道', com_text: '[media$40/N40_5_1_5_3.m3u] ' }],
        }, 10)
        expect(re.outline).toEqual([])
        expect(re.tracks).toEqual([{ label: '', url: 'https://media.fhl.net/cbolcom/10/40/N40_5_1_5_3.mp3' }])
        expect(re.prev).toBe(null)
    })
    it('檔名有數字後綴 (_1t)', () => {
        const re = parseSermon({ record_count: 1, record: [{ title: '', book_name: '', com_text: '[media$N01_000_000_000_000_1t.m3u](台語）' }] }, 8)
        expect(re.tracks[0]).toEqual({ label: '台語', url: 'https://media.fhl.net/cbolcom/8/N01_000_000_000_000_1t.mp3' })
    })
})
