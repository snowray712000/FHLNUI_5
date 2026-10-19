import { describe, it, expect } from 'vitest'
import { cleanChdcHtml } from '../index/cvt_others.js'

// 上游 qsub.php?version=chdc 的真實寫法 (2026-10-20 實測)：縮排換行、巢狀 <p>、多餘的 </p>、<h1> 在 <p> 裡
describe('cleanChdcHtml：1933年次經全書的 HTML', () => {
    it('縮排換行與 <p> 拿掉，專有名詞 <u> 保留', () => {
        const raw = '<p>\n    這書是<u>多比</u>的自述。他是<u>多比爾</u>的兒子。\n  </p>'
        expect(cleanChdcHtml(raw)).toBe('這書是<u>多比</u>的自述。他是<u>多比爾</u>的兒子。')
    })
    it('小標 <h1> 在 <p> 裡、後面有多餘的 </p> (便西拉智訓 1:11)', () => {
        const raw = '<p><h1>論敬畏主是真智慧</h1></p>\n  </p>\n  <p>\n    敬畏主就是榮耀、歡躍、喜悅、與快樂的冠冕．\n  </p>'
        expect(cleanChdcHtml(raw)).toBe('<h1>論敬畏主是真智慧</h1>敬畏主就是榮耀、歡躍、喜悅、與快樂的冠冕．')
    })
    it('詩體：行中的 <br/> 保留，節尾多餘的 <br/> 拿掉 (猶滴傳 16:1)', () => {
        const raw = '<p>\n    \n    <u>猶滴</u>唱歌說：<p>你們當擊鼓稱謝我的上帝、<br/></p>\n  </p>\n  </p>\n  <p>用詩篇作讚美詩、<br/></p>'
        expect(cleanChdcHtml(raw)).toBe('<u>猶滴</u>唱歌說：你們當擊鼓稱謝我的上帝、<br/>用詩篇作讚美詩、')
    })
    it('節首的 <br/> 也拿掉；<br> 寫法都算', () => {
        expect(cleanChdcHtml('<br/><br>天地<br />初開<BR/>')).toBe('天地<br />初開')
    })
    it('<i> 月份名保留 (瑪喀比傳上卷 1:54)', () => {
        expect(cleanChdcHtml('<p>在<i>基斯留</i>月的十五日</p>')).toBe('在<i>基斯留</i>月的十五日')
    })
    it('沒有 HTML 的純文字不動 (和 c1933 一樣)；空字串、null', () => {
        expect(cleanChdcHtml('他經歷了多次的戰爭、得了許多的堅壘。')).toBe('他經歷了多次的戰爭、得了許多的堅壘。')
        expect(cleanChdcHtml('')).toBe('')
        expect(cleanChdcHtml(null)).toBe('')
    })
    it('句中沒有換行的空格不動', () => {
        expect(cleanChdcHtml('<p>Amen amen</p>')).toBe('Amen amen')
    })
})
