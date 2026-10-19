import { describe, it, expect } from 'vitest'
import fs from 'node:fs'

const read = p => fs.readFileSync(new URL(p, import.meta.url), 'utf8')
const doc = read('../docs/使徒教父說明.md')
const af = JSON.parse(read('../index/af_books.json'))

describe('docs/使徒教父說明.md (讀使徒教父時的 ?)', () => {
    it('開頭的註解之後依序是：這是什麼、什麼時候用、怎麼用、注意 (給初信者的固定架構)', () => {
        expect(doc.startsWith('<!--')).toBe(true)
        const body = doc.replace(/^<!--[\s\S]*?-->/, '')
        const at = ['**這是什麼**', '**什麼時候用**', '**怎麼用**', '**注意**'].map(k => body.indexOf(k))
        expect(at.every(i => i >= 0)).toBe(true)
        expect(at).toEqual([...at].sort((a, b) => a - b))
    })
    it('說明「不在聖經裡」(初信者最需要先知道的一件事)', () => {
        expect(doc).toMatch(/不在聖經裡/)
    })
    it('十七本各是什麼：收合區塊，標題尾巴有 {收合} (IntroHelp.foldSections)，而且在最後', () => {
        const i = doc.indexOf('### 十七本各是什麼 {收合}')
        expect(i).toBeGreaterThan(0)
        expect(doc.slice(i).match(/^#{1,6} /gm)).toHaveLength(1) // 後面沒有別的標題，收合區塊才包到檔尾
    })
    it('簡稱清單與 af_books.json 一致 (網址、搜尋結果用的簡稱)', () => {
        const line = doc.split('\n').find(l => l.includes('網址、搜尋結果、歷史記錄裡用簡稱'))
        expect(line).toBeTruthy()
        const listed = line.replace(/^.*簡稱：/, '').replace(/\(.*?\)/g, '').split(/[、，。\s]+/).filter(Boolean)
        expect(listed).toEqual(af.books.map(b => b.abbrZh))
    })
    it('十七本都提到：非伊格那丟的書用全名，伊格那丟的七封信提到收信對象', () => {
        for (const b of af.books.filter(b => !b.nameZh.startsWith('伊格那丟'))) expect(doc, b.nameZh).toContain(b.nameZh)
        for (const to of ['以弗所人', '馬內夏人', '他拉勒人', '羅馬人', '非拉鐵非人', '士每拿人', '坡旅甲']) expect(doc, to).toContain(to)
    })
    it('範例位置的書名都解析得到 (點了才跳得過去)', () => {
        const names = new Set(af.books.flatMap(b => [b.nameZh, b.abbrZh]))
        for (const m of doc.matchAll(/`((?:遺訓|黑馬)\d+(?::\d+)?)`|#\/bible\/((?:遺訓|黑馬)\d+(?::\d+)?)/g)) {
            expect(names.has((m[1] ?? m[2]).match(/^[^\d]+/)[0]), m[0]).toBe(true)
        }
    })
})

describe('接線', () => {
    it('IntroHelp 有 af 這一種，指向這份說明', () => {
        const src = read('../index/IntroHelp.es2023.js')
        expect(src).toContain("docs/使徒教父說明.md")
        expect(src).toMatch(/af: \[AF_HELP_URL, '使徒教父'/)
    })
    it('build 時會複製到 dist (vite.config.js 的 LEGACY_COPY)，否則上線後 ? 讀不到', () => {
        expect(read('../vite.config.js')).toContain("'docs/使徒教父說明.md'")
    })
    it('兩個入口都在切換書卷的「使徒教父」旁：寬螢幕選書面板的欄標題、窄螢幕選書視窗「使徒教父」頁籤按鈕裡面', () => {
        expect(read('../index/BookSelectName.es2023.js')).toMatch(/helpButtonHtml\('使徒教父'\)/)
        const html = read('../libs/ijnjs-ui/BookChapDialog/BookChapDialog.html')
        // ? 在「使徒教父」頁籤這個按鈕裡面 (不是旁邊另一顆)
        expect(html).toMatch(/<button[^>]*opt="af"[^>]*>使徒教父<span class="intro-help"[^>]*>\?<\/span><\/button>/)
        expect(read('../libs/ijnjs-ui/BookChapDialog/BookChapDialog.js')).toMatch(/closest\('\.intro-help'\)/) // 點 ? 不切頁
        expect(read('../index/BookSelect.es2023.js')).toMatch(/bindIntroHelp\(\$\('#book-chap-dialog'\), 'af'\)/)
    })
    it('不放在經文區的書名上 (說明只放在切換書卷的地方)', () => {
        expect(read('../index/FhlLecture.es2023.js')).not.toMatch(/bindIntroHelp|helpButtonHtml/)
    })
    it('說明視窗預設近滿版 (內容多)：af 是 isWide', () => {
        expect(read('../index/IntroHelp.es2023.js')).toMatch(/af: \[AF_HELP_URL, '使徒教父', true\]/)
    })
})
