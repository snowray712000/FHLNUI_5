import { DialogHtml } from "./DialogHtml.es2023.js";
import { ensureMarkdownItAsync, fixLinks } from "./Help.es2023.js";
import { fetchTextAsync } from "./fetchAsync.es2023.js";
import { gbText } from "./gbText.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";

/** 即時 SN 視窗「同源字 ?」的說明，build 時由 vite.config.js 的 LEGACY_COPY 複製到 dist/ */
const SAME_HELP_URL = 'docs/同源字說明.md'

/** @type {DialogHtml | null} */
let helpDlg = null
/** @type {Promise<string> | null} */
let helpText = null

/** 同源字標題：「同源字 ?：」，? 的事件由 bindSameHelp 綁在對話框上 */
export const SAME_TITLE_HTML = '<span class="item-title">同源字<button type="button" class="same-help" title="同源字是什麼？">?</button>：</span>'

/**
 * 對話框內按「?」開說明 (同時只開一個)
 * @param {JQuery<HTMLElement>} dlg
 */
export function bindSameHelp(dlg) {
    dlg.on('click', '.same-help', e => { e.stopPropagation(); showSameHelpAsync(e.currentTarget) })
}

/** @param {HTMLElement} btn 說明視窗放在它旁邊 */
async function showSameHelpAsync(btn) {
    const t = s => gbText(s, TPPageState.s.gb)
    let body
    try {
        helpText ??= fetchTextAsync(SAME_HELP_URL).catch(e => { helpText = null; throw e })
        const [md, text] = await Promise.all([ensureMarkdownItAsync(), helpText])
        body = fixLinks(md.render(text.replace(/^<!--[\s\S]*?-->/, '')), SAME_HELP_URL)
    } catch (ex) {
        console.error(ex)
        body = `<div>${t('說明載入失敗，請稍後再試。')} (${ex.message})</div>`
    }
    helpDlg?.dlg?.dialog('close')
    const dlgHtml = helpDlg = new DialogHtml()
    dlgHtml.showDialog({
        html: '<div class="same-help-body markdown-body"></div>',
        width: Math.min(window.innerWidth - 16, 480),
        height: Math.min(520, window.innerHeight * 0.75),
        position: { my: 'left top', at: 'left bottom+8', of: btn, collision: 'fit' },
        getTitle: () => t('同源字'),
        registerEventWhenShowed: dlg => {
            dlg.find('.same-help-body')[0].innerHTML = body
            dlg.on('dialogclose', () => { if (helpDlg == dlgHtml) helpDlg = null })
        },
    })
}
