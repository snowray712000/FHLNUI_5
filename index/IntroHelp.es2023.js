import { DialogHtml } from "./DialogHtml.es2023.js";
import { ensureMarkdownItAsync, fixLinks } from "./Help.es2023.js";
import { fetchTextAsync } from "./fetchAsync.es2023.js";
import { gbText } from "./gbText.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";

/** 說明 md (docs/*.md)，build 時由 vite.config.js 的 LEGACY_COPY 複製到 dist/ */
const SAME_HELP_URL = 'docs/同源字說明.md'
const SN_HELP_URL = 'docs/SN說明.md'
const SEARCH_HELP_URL = 'docs/搜尋說明.md'
const LEIT_HELP_URL = 'docs/本章特色說明.md'
const AF_HELP_URL = 'docs/使徒教父說明.md'
const APO_HELP_URL = 'docs/次經說明.md'

/** @type {DialogHtml | null} */
let helpDlg = null
/** @type {Map<string, Promise<string>>} */
const texts = new Map()

/**
 * 「?」按鈕 (放在標題旁)，事件由 bindIntroHelp 綁
 * @param {string} what 例 同源字
 * @param {string} [kind] 這顆開哪一份說明 (bindIntroHelp 的 kind)；同一個容器裡有好幾種說明 (選書面板的次經、使徒教父) 時要寫，沒寫就用 bindIntroHelp 綁的那一種
 */
export const helpButtonHtml = (what, kind) => `<button type="button" class="intro-help"${kind ? ` data-help="${kind}"` : ''} title="${what}是什麼？">?</button>`

/** 同源字標題：「同源字 ?：」 */
export const SAME_TITLE_HTML = `<span class="item-title">同源字${helpButtonHtml('同源字')}：</span>`

/**
 * 在 root 內按 .intro-help 開說明 (同時只開一個)
 * @param {JQuery<HTMLElement>} root
 * @param {'same'|'sn'|'search'|'leit'|'af'|'apo'} [kind] 按鈕上有 data-help 的以按鈕為準 (一個容器裡有好幾種說明時)
 */
export function bindIntroHelp(root, kind = 'same') {
    root.off('click.introHelp').on('click.introHelp', '.intro-help', e => {
        e.stopPropagation()
        const [url, title, isWide] = HELPS[e.currentTarget.dataset.help ?? kind] ?? HELPS.same
        showIntroHelpAsync(e.currentTarget, url, title, isWide)
    })
}
/** @type {Record<string, [string, string, boolean?]>} 種類 → [說明檔, 視窗標題, 近滿版] */
const HELPS = {
    same: [SAME_HELP_URL, '同源字'], sn: [SN_HELP_URL, '原文SN'], search: [SEARCH_HELP_URL, '搜尋'],
    leit: [LEIT_HELP_URL, '本章特色', true], af: [AF_HELP_URL, '使徒教父', true], apo: [APO_HELP_URL, '次經', true],
}
export const bindSameHelp = dlg => bindIntroHelp(dlg, 'same')

/**
 * @param {HTMLElement} btn 說明視窗放在它旁邊 @param {string} url @param {string} title
 * @param {boolean} [isWide] 內容長、有表格、只會看一兩次的說明：視窗幾乎佔滿整個畫面 (四邊各留 12px)，文字欄限寬置中好讀
 */
async function showIntroHelpAsync(btn, url, title, isWide = false) {
    const t = s => gbText(s, TPPageState.s.gb)
    let body
    try {
        if (!texts.has(url)) texts.set(url, fetchTextAsync(url).catch(e => { texts.delete(url); throw e }))
        const [md, text] = await Promise.all([ensureMarkdownItAsync(), texts.get(url)])
        body = foldSections(fixLinks(md.render(text.replace(/^<!--[\s\S]*?-->/, '')), url))
    } catch (ex) {
        console.error(ex)
        body = `<div>${t('說明載入失敗，請稍後再試。')} (${ex.message})</div>`
    }
    helpDlg?.dlg?.dialog('close')
    const dlgHtml = helpDlg = new DialogHtml()
    dlgHtml.showDialog({
        html: `<div class="intro-help-body markdown-body${isWide ? ' intro-help-wide' : ''}"></div>`,
        width: isWide ? window.innerWidth - 24 : Math.min(window.innerWidth - 16, 480),
        height: isWide ? window.innerHeight - 24 : Math.min(520, window.innerHeight * 0.75),
        maxHeight: isWide ? window.innerHeight : undefined, // 預設只給 80% 高，內容區會被 max-height 截短，下面空一塊
        position: isWide ? { my: 'center', at: 'center', of: window, collision: 'fit' } : { my: 'left top', at: 'left bottom+8', of: btn, collision: 'fit' },
        getTitle: () => t(title),
        registerEventWhenShowed: dlg => {
            dlg.find('.intro-help-body')[0].innerHTML = body
            dlg.on('dialogclose', () => { if (helpDlg == dlgHtml) helpDlg = null })
        },
    })
}

/**
 * 標題尾巴有 {收合} 的區塊 (標題到下一個同級標題之前) 包成 <details>，平常收起來，標題是 summary。
 * markdown-it 不開 html (說明檔裡有 <G26> 之類的字)，所以用標記，不在 md 裡寫 <details>
 * @param {string} html
 */
export function foldSections(html) {
    if (!html.includes('{收合}')) return html
    const box = document.createElement('div')
    box.innerHTML = html
    for (const h of [...box.querySelectorAll('h1, h2, h3, h4')].filter(a => a.textContent.includes('{收合}'))) {
        const details = document.createElement('details')
        const summary = document.createElement('summary')
        summary.textContent = h.textContent.replace('{收合}', '').trim()
        details.append(summary)
        for (let n = h.nextElementSibling; n != null && !(/^H[1-6]$/.test(n.tagName) && n.tagName <= h.tagName); n = h.nextElementSibling) details.append(n)
        h.replaceWith(details)
    }
    return box.innerHTML
}
