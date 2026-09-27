import { FhlHelpingPopUp } from './HelpingPopUp.es2023.js';
import { DialogHtml } from './DialogHtml.es2023.js';
import { fetchTextAsync } from './fetchAsync.es2023.js';

/** 使用說明，與 repo 裡給人看的是同一份；build 時由 vite.config.js 的 LEGACY_COPY 複製到 dist/ */
const GUIDE_URL = 'docs/使用說明.md'
const MARKDOWN_IT_URL = 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm'

let markdownItLoading
/** markdown-it 只有說明用得到，第一次按「?」才載入 */
function ensureMarkdownItAsync() {
    if (markdownItLoading) return markdownItLoading
    markdownItLoading = import(/* @vite-ignore */ MARKDOWN_IT_URL)
        .then(m => m.default({ html: false, linkify: true }))
        .catch(err => {
            markdownItLoading = undefined // 下次再試
            throw err
        })
    return markdownItLoading
}

/**
 * md 裡的相對路徑 (例 ../images/xxx.png) 是相對於 md 檔，放進頁面後要改成相對於頁面。
 * 外部連結另開分頁，才不會離開聖經工具。
 * @param {string} html
 * @returns {string}
 */
function fixLinks(html) {
    const base = new URL(GUIDE_URL, location.href)
    const div = document.createElement('div')
    div.innerHTML = html
    for (const img of div.querySelectorAll('img[src]')) {
        img.src = new URL(img.getAttribute('src'), base).href
        img.style.maxWidth = '100%'
    }
    for (const a of div.querySelectorAll('a[href]')) {
        const href = a.getAttribute('href')
        if (href.startsWith('#')) continue
        a.href = new URL(href, base).href
        a.target = '_blank'
        a.rel = 'noopener'
    }
    return div.innerHTML
}

async function renderGuideAsync() {
    const [md, text] = await Promise.all([ensureMarkdownItAsync(), fetchTextAsync(GUIDE_URL)])
    return fixLinks(md.render(text))
}

export class Help {
    static #s = null
    /** @returns {Help} */
    static get s() { if (!this.#s) this.#s = new Help(); return this.#s; }

    /** @type {HTMLElement} div#help */
    dom = null
    init(ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
        FhlHelpingPopUp.s.init(ps, $('#helpingPopUp'));
    }
    render(ps, dom) {
        dom.html('?');
        this.registerEvents(ps);
    }
    registerEvents(ps) {
        // Alt + Shift + / 也會觸發這裡 (registerEvents_doc.es2023.js)
        this.dom.on('click', async () => {
            let html
            try {
                html = `<div class="markdown-body">${await renderGuideAsync()}</div>`
            } catch (ex) {
                console.error(ex)
                html = `<div>說明載入失敗，請稍後再試。(${ex.message})</div>`
            }
            new DialogHtml().showDialog({
                html,
                getTitle: () => "使用說明",
                width: Math.min(window.innerWidth * 0.95, 900),
                maxWidth: window.innerWidth * 0.95,
                height: window.innerHeight * 0.85,
                maxHeight: window.innerHeight * 0.9,
                registerEventWhenShowed: () => { },
            })
        });
    }
}
