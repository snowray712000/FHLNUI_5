import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { RESOURCES, RESOURCES_HTML, splitResourceHelp, renderIntroHtml } from '../index/Resources.es2023.js'

const titles = RESOURCES.flatMap(([, links]) => links.map(([, t]) => t))
const help = splitResourceHelp(fs.readFileSync(new URL('../docs/信望愛資源說明.md', import.meta.url), 'utf8'))

describe('信望愛資源', () => {
    it('標題不重複 (說明以標題對應)', () => {
        expect(new Set(titles).size).toBe(titles.length)
    })
    it('說明 md 的每個「## 標題」都對得到連結 (打錯字「?」就不會出現)', () => {
        expect([...help.keys()].filter(t => !titles.includes(t))).toEqual([])
    })
    it('每個連結都有說明 (新增連結時，也要在 docs/信望愛資源說明.md 寫一節)', () => {
        expect(titles.filter(t => !help.has(t))).toEqual([])
    })
    it('說明 100–200 字左右 (不含標記)', () => {
        for (const [t, md] of help) {
            const n = md.replace(/\*\*|\s/g, '').length
            expect([t, n >= 60 && n <= 260]).toEqual([t, true])
        }
    })
    it('網址的 & 轉成 &amp;', () => {
        expect(RESOURCES_HTML).toContain('user=service&amp;bid=0')
    })
    it('renderIntroHtml：段落、粗體、跳脫', () => {
        expect(renderIntroHtml('a <b>\n\n**什麼時候用**：x')).toBe('<p>a &lt;b&gt;</p><p><b>什麼時候用</b>：x</p>')
    })
})
