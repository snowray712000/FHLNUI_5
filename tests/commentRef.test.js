// 註釋中的交互參照偵測 (index/comments/convertDocToDText.js 的 REGEX_COMMENT_REF)
// 案例取自信望愛註釋資料 (bible_comm.zip)：大部分是 #…|，少數用全形 ＃ 或漏了 #
import { describe, it, expect } from 'vitest'
import { REGEX_COMMENT_REF, convertDocToDText } from '../index/comments/convertDocToDText.js'

/** @returns {string[]} 偵測到的參照文字 */
const refs = text => [...text.matchAll(REGEX_COMMENT_REF)].map(m => (m[1] ?? m[2]).trim())

describe('正常的 #…|', () => {
    it('書卷 章:節', () => expect(refs('參 #太 7:14-20| 與 #士 1:28|')).toEqual(['太 7:14-20', '士 1:28']))
    it('多個 ; 分隔', () => expect(refs('「收割節」#出 23:16;34:22;民 28:26|')).toEqual(['出 23:16;34:22;民 28:26']))
    it('只有節 (詩篇的篇)', () => expect(refs('#6|#32|#38|')).toEqual(['6', '32', '38']))
    it('同章', () => expect(refs('#20:13-16|')).toEqual(['20:13-16']))
})

describe('全形 ＃', () => {
    it('路24:50', () => expect(refs('＃徒 10:2;來 9:6;13:15|')).toEqual(['徒 10:2;來 9:6;13:15']))
    it('太6:5', () => expect(refs('和前面＃6:7-8|的')).toEqual(['6:7-8']))
    it('全形 ｜ 結尾 (創19:1)', () => expect(refs('在 #撒上 15:23｜則是')).toEqual(['撒上 15:23']))
})

describe('# 後漏了 |', () => {
    it('不吞掉後面真正的參照 (創7:6)', () => expect(refs('●#7:21都「死了」。●「除滅」#7:4,23|：SNH04229')).toEqual(['7:4,23']))
})

describe('漏了 #', () => {
    it('徒20:7', () => expect(refs('●「講論」徒 20:7|、「講了」#徒 20:9|：SNG01256')).toEqual(['徒 20:7', '徒 20:9']))
    it('帖前2:5：前一個有 #，後一個漏了', () => expect(refs('#徒 17:5|;徒 18:3;20:34|')).toEqual(['徒 17:5', '徒 18:3;20:34']))
    it('林前13:4：不吃到前面的「於」', () => expect(refs('聖經僅出現於徒 17:16;林前 13:5|')).toEqual(['徒 17:16;林前 13:5']))
    it('來11:8：同書', () => expect(refs('預作安排。11:20-22|')).toEqual(['11:20-22']))
    it('創2:8：同 2:5', () => expect(refs('SNH06779，同 2:5|')).toEqual(['2:5']))
    it('創10:21', () => expect(refs('結 27:10;30:5|')).toEqual(['結 27:10;30:5']))
})

describe('不是參照', () => {
    it('沒有 章:節 的數字加 |', () => expect(refs('第 6| 項')).toEqual([]))
    it('沒有 |', () => expect(refs('參 徒 20:7 與 20:9')).toEqual([]))
})

describe('convertDocToDText', () => {
    it('漏 # 的也變成 isRef，並補上同書的位置', () => {
        const dtexts = convertDocToDText([{ w: '預作安排。11:20-22|' }], { book: 58, chap: 11, verse: 8 })
        const flat = JSON.stringify(dtexts)
        expect(flat).toContain('"isRef":1')
        expect(flat).toContain('"refDescription":"11:20-22"')
        expect(flat).not.toContain('|')
    })
})
