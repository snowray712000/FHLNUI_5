import { DialogHtml } from "./DialogHtml.es2023.js";
import { ensureMarkdownItAsync, fixLinks } from "./Help.es2023.js";
import { fetchTextAsync } from "./fetchAsync.es2023.js";
import { gbText } from "./gbText.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";

/** 說明 md (docs/*.md)，build 時由 vite.config.js 的 LEGACY_COPY 複製到 dist/ */
const SAME_HELP_URL = 'docs/同源字說明.md'
const SN_HELP_URL = 'docs/SN說明.md'
const SEARCH_HELP_URL = 'docs/搜尋說明.md'

/** @type {DialogHtml | null} */
let helpDlg = null
/** @type {Map<string, Promise<string>>} */
const texts = new Map()

/** 「?」按鈕 (放在標題旁)，事件由 bindIntroHelp 綁 @param {string} what 例 同源字 */
export const helpButtonHtml = what => `<button type="button" class="intro-help" title="${what}是什麼？">?</button>`

/** 同源字標題：「同源字 ?：」 */
export const SAME_TITLE_HTML = `<span class="item-title">同源字${helpButtonHtml('同源字')}：</span>`

/**
 * 在 root 內按 .intro-help 開說明 (同時只開一個)
 * @param {JQuery<HTMLElement>} root
 * @param {'same'|'sn'|'search'} [kind]
 */
export function bindIntroHelp(root, kind = 'same') {
    const [url, title] = { sn: [SN_HELP_URL, '原文SN'], search: [SEARCH_HELP_URL, '搜尋'] }[kind] ?? [SAME_HELP_URL, '同源字']
    root.off('click.introHelp').on('click.introHelp', '.intro-help', e => { e.stopPropagation(); showIntroHelpAsync(e.currentTarget, url, title) })
}
export const bindSameHelp = dlg => bindIntroHelp(dlg, 'same')

/** @param {HTMLElement} btn 說明視窗放在它旁邊 @param {string} url @param {string} title */
async function showIntroHelpAsync(btn, url, title) {
    const t = s => gbText(s, TPPageState.s.gb)
    let body
    try {
        if (!texts.has(url)) texts.set(url, fetchTextAsync(url).catch(e => { texts.delete(url); throw e }))
        const [md, text] = await Promise.all([ensureMarkdownItAsync(), texts.get(url)])
        body = fixLinks(md.render(text.replace(/^<!--[\s\S]*?-->/, '')), url)
    } catch (ex) {
        console.error(ex)
        body = `<div>${t('說明載入失敗，請稍後再試。')} (${ex.message})</div>`
    }
    helpDlg?.dlg?.dialog('close')
    const dlgHtml = helpDlg = new DialogHtml()
    dlgHtml.showDialog({
        html: '<div class="intro-help-body markdown-body"></div>',
        width: Math.min(window.innerWidth - 16, 480),
        height: Math.min(520, window.innerHeight * 0.75),
        position: { my: 'left top', at: 'left bottom+8', of: btn, collision: 'fit' },
        getTitle: () => t(title),
        registerEventWhenShowed: dlg => {
            dlg.find('.intro-help-body')[0].innerHTML = body
            dlg.on('dialogclose', () => { if (helpDlg == dlgHtml) helpDlg = null })
        },
    })
}
