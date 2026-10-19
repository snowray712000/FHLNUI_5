import { describe, it, expect } from 'vitest'
import fs from 'node:fs'

const read = p => fs.readFileSync(new URL(p, import.meta.url), 'utf8')
const doc = read('../docs/次經說明.md')
const apo = JSON.parse(read('../index/apo_books.json'))

describe('docs/次經說明.md (讀次經時的 ?)', () => {
    it('開頭的註解之後依序是：這是什麼、什麼時候用、怎麼用、注意 (給初信者的固定架構)', () => {
        expect(doc.startsWith('<!--')).toBe(true)
        const body = doc.replace(/^<!--[\s\S]*?-->/, '')
        const at = ['**這是什麼**', '**什麼時候用**', '**怎麼用**', '**注意**'].map(k => body.indexOf(k))
        expect(at.every(i => i >= 0)).toBe(true)
        expect(at).toEqual([...at].sort((a, b) => a - b))
    })
    it('說明各教會看法不同、新教的聖經不收 (初信者最需要先知道的一件事)', () => {
        expect(doc).toMatch(/各教會對次經的看法不同/)
        expect(doc).toMatch(/基督新教的聖經\*\*不收\*\*次經/)
    })
    it('十五本各是什麼：收合區塊，標題尾巴有 {收合} (IntroHelp.foldSections)，而且在最後', () => {
        const i = doc.indexOf('### 十五本各是什麼 {收合}')
        expect(i).toBeGreaterThan(0)
        expect(doc.slice(i).match(/^#{1,6} /gm)).toHaveLength(1) // 後面沒有別的標題，收合區塊才包到檔尾
    })
    it('簡稱清單與 apo_books.json 一致 (網址、搜尋結果用的簡稱)', () => {
        const line = doc.split('\n').find(l => l.includes('網址、搜尋結果、歷史記錄裡用簡稱'))
        expect(line).toBeTruthy()
        const listed = line.replace(/^.*簡稱：/, '').split(/[、，。\s]+/).filter(Boolean)
        expect(listed).toEqual(apo.books.map(b => b.abbrZh))
    })
    it('十五本都提到：信望愛站名與天主教通行名各一次 (括號裡)，順序同書卷表', () => {
        const fold = doc.slice(doc.indexOf('### 十五本各是什麼'))
        let from = 0
        for (const b of apo.books) {
            const i = fold.indexOf(`**${b.nameZh}**`, from)
            expect(i, b.nameZh).toBeGreaterThanOrEqual(0)
            expect(fold.indexOf(`(${b.nameAlt})`, i), `${b.nameZh} 的通行名 ${b.nameAlt}`).toBeGreaterThan(i)
            from = i
        }
    })
    it('兩個文本、兩套書名、設定、搜尋範圍都有交代', () => {
        for (const k of ['1933年聖公會出版', '1933年次經全書', '信望愛站上的名稱', '天主教通行的名稱', '設定', '⚙', '搜尋']) expect(doc, k).toContain(k)
    })
    it('範例位置的書名都解析得到 (點了才跳得過去)', () => {
        const names = new Set(apo.books.flatMap(b => [b.nameZh, b.abbrZh, b.nameAlt, b.abbrAlt]))
        for (const m of doc.matchAll(/`((?:多比傳|馬一)\d+(?::\d+)?)`|#\/bible\/((?:多比傳|馬一)\d+(?::\d+)?)/g)) {
            expect(names.has((m[1] ?? m[2]).match(/^[^\d]+/)[0]), m[0]).toBe(true)
        }
    })
})

describe('接線', () => {
    it('IntroHelp 有 apo 這一種，指向這份說明，近滿版 (內容多)', () => {
        const src = read('../index/IntroHelp.es2023.js')
        expect(src).toContain('docs/次經說明.md')
        expect(src).toMatch(/apo: \[APO_HELP_URL, '次經', true\]/)
    })
    it('同一個容器有好幾種說明：按鈕上的 data-help 決定開哪一份', () => {
        const src = read('../index/IntroHelp.es2023.js')
        expect(src).toMatch(/e\.currentTarget\.dataset\.help \?\? kind/)
        expect(src).toMatch(/data-help="\$\{kind\}"/)
    })
    it('build 時會複製到 dist (vite.config.js 的 LEGACY_COPY)，否則上線後 ? 讀不到', () => {
        expect(read('../vite.config.js')).toContain("'docs/次經說明.md'")
    })
    it('兩個入口：寬螢幕選書面板「次經」欄標題旁、窄螢幕選書視窗「次經」頁籤按鈕裡面', () => {
        expect(read('../index/BookSelectName.es2023.js')).toMatch(/helpButtonHtml\('次經', 'apo'\)/)
        const html = read('../libs/ijnjs-ui/BookChapDialog/BookChapDialog.html')
        expect(html).toMatch(/<button[^>]*opt="apo"[^>]*>次經<span class="intro-help" data-help="apo"[^>]*>\?<\/span><\/button>/)
        expect(read('../libs/ijnjs-ui/BookChapDialog/BookChapDialog.js')).toMatch(/closest\('\.intro-help'\)/) // 點 ? 不切頁
    })
    it('不放在經文區的書名上', () => {
        expect(read('../index/FhlLecture.es2023.js')).not.toMatch(/bindIntroHelp|helpButtonHtml/)
    })
})
