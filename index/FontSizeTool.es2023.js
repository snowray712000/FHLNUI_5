import { FhlLecture } from "./FhlLecture.es2023.js";
import { FontSize } from "./FontSize.es2023.js";
import { FontSizeDialog } from "./FontSizeDialog.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from './gbText.es2023.js';
import { el, icon } from "./auDom.es2023.js";

/**
 * 側邊欄「設定」中的字型大小：A− 數字 A+ ⚙
 * - A− A+ 調「經文」(原文、SN 預設跟著等比例)；⚙ 開對話框，右鍵、長按快速切換組合
 * - 原文、SN 各自的大小改到對話框 (原本側邊欄有 4 列，見 FontSizeDialog)
 */
export class FontSizeTool {
    static #s = null
    /** @returns {FontSizeTool} */
    static get s() { if (this.#s == null) this.#s = new FontSizeTool(); return this.#s }

    /** @type {HTMLElement} */
    #val = null
    #isSubscribed = false

    /** @param {TPPageState} ps @param {JQuery<HTMLElement>} dom */
    init(ps, dom) {
        this.render(ps, dom)
        this.registerEvents(ps)
    }

    registerEvents(ps) {
        if (this.#isSubscribed) return
        this.#isSubscribed = true
        FontSize.s.onChange(isSettled => {
            if (this.#val != null) this.#val.textContent = FontSize.s.sizes.main
            if (isSettled) FhlLecture.s.reshape(TPPageState.s) // 併排時，重新對齊各節高度
        })
    }

    render(ps, dom) {
        const fs = FontSize.s
        const t = s => gbText(s, ps.gb)
        this.#val = el('span', { class: 'fs-val', text: fs.sizes.main, title: t('經文字型大小 (pt)') })
        const gear = el('span', {
            class: 'fs-gear', title: t('原文、SN 大小與組合 (右鍵、長按：切換組合)'),
            onclick: () => FontSizeDialog.s.open(),
            oncontextmenu: e => { e.preventDefault(); FontSizeDialog.s.openQuickMenu(gear) },
        }, icon('cog'))
        dom[0].replaceChildren(
            el('div', { text: t('字體大小') + ':' }),
            el('div', { class: 'fs-ctl' },
                el('button', { type: 'button', class: 'fs-btn', text: 'A−', title: t('小一點'), onclick: () => fs.step('main', -1) }),
                this.#val,
                el('button', { type: 'button', class: 'fs-btn fs-big', text: 'A+', title: t('大一點'), onclick: () => fs.step('main', 1) }),
                gear))
    }
}
