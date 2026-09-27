import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { AudioBibleIndex, parseChapRanges, formatTime } from '../index/AudioBibleVersions.es2023.js'

const jo = JSON.parse(fs.readFileSync(new URL('../index/audio_bible_index.json', import.meta.url), 'utf8'))
const idx = new AudioBibleIndex(jo)

describe('parseChapRanges', () => {
    it('範圍與單章', () => {
        expect([...parseChapRanges('1-3,5,7-8')]).toEqual([1, 2, 3, 5, 7, 8])
        expect(parseChapRanges('').size).toBe(0)
        expect(parseChapRanges(undefined).size).toBe(0)
    })
})

describe('formatTime', () => {
    it('分秒、時分秒', () => {
        expect(formatTime(0)).toBe('0:00')
        expect(formatTime(65.9)).toBe('1:05')
        expect(formatTime(3723)).toBe('1:02:03')
        expect(formatTime(NaN)).toBe('0:00')
    })
})

describe('AudioBibleIndex', () => {
    it('和合本新舊約全', () => {
        expect(idx.get(0).coverage).toBe('all')
        expect(idx.has(0, 1, 1)).toBe(true)
        expect(idx.has(0, 66, 22)).toBe(true)
    })
    it('希臘文只有新約、希伯來文只有舊約', () => {
        expect(idx.get(9).coverage).toBe('nt')
        expect(idx.has(9, 1, 1)).toBe(false)
        expect(idx.has(7, 40, 1)).toBe(false)
        expect(idx.hasBook(7, 1)).toBe(true)
    })
    it('網址', () => {
        expect(idx.url(0, 40, 5, '', 'mp3')).toBe('https://media.fhl.net/unv1/40/40_005.mp3')
        expect(idx.url(17, 1, 1, 'B', 'mp4')).toBe('https://media.fhl.net/tte/1B/1_001.mp4')
    })
    it('朗讀版本與 mp4', () => {
        expect(idx.variants(17, 1, 1)).toEqual(['', 'A', 'B'])
        expect(idx.hasMp4(17, 40, 1)).toBe(true)
        expect(idx.hasMp4(0, 40, 1)).toBe(false)
        expect(idx.get(17).hasMp4).toBe(true)
    })
    it('下一章跨書卷、跳過沒有的章', () => {
        expect(idx.step(0, 39, 4, 1)).toEqual({ bid: 40, chap: 1 })
        expect(idx.step(0, 40, 1, -1)).toEqual({ bid: 39, chap: 4 })
        expect(idx.step(0, 66, 22, 1)).toBe(null)
        // 希臘文：瑪拉基書 → 馬太福音
        expect(idx.step(9, 1, 1, 1)).toEqual({ bid: 40, chap: 1 })
        // spring 和合本從約書亞記 (10?) 開始，往前沒有
        const first = idx.step(11, 1, 0, 1)
        expect(first && idx.has(11, first.bid, first.chap)).toBe(true)
    })
    it('分組依 meta 順序，每個版本都有 dir', () => {
        const groups = idx.groups().map(g => g[0])
        expect(groups.slice(0, 3)).toEqual(['華語', '台語', '客語'])
        expect(idx.versions.every(a1 => a1.dir)).toBe(true)
        expect(idx.versions.length).toBe(jo.versions.length)
    })
})
