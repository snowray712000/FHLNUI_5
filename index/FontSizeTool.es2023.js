import { FhlLecture } from "./FhlLecture.es2023.js";
import { FontSize } from "./FontSize.es2023.js";
import { FontSizeDialog } from "./FontSizeDialog.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from './gbText.es2023.js';
import { el, icon } from "./auDom.es2023.js";

/**
 * 側邊欄「設定」中的字型大小：⚙ A− A+ 100% (沒有標題，看到 A− A+ 就知道)
 * - A− A+ 調「整體大小」(介面為基準，經文、原文、SN 相對於它)，一次 ±10%；⚙ 開對話框 (情境組合、各項微調)，右鍵、長按快速切換組合
 * - 這一列的字固定大小 (fhl.css #fontSizeTool)，不跟介面倍率，否則按 A+ 時按鈕會跑走
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
            if (this.#val != null) this.#val.textContent = FontSize.s.scale + '%'
            if (isSettled) FhlLecture.s.reshape(TPPageState.s) // 併排時，自動欄寬重量、表頭重新對齊
        })
    }

    render(ps, dom) {
        const fs = FontSize.s
        const t = s => gbText(s, ps.gb)
        this.#val = el('span', { class: 'fs-val', text: fs.scale + '%', title: t('整體大小：介面、經文、原文、SN 一起放大縮小') })
        const gear = el('button', {
            type: 'button', class: 'fs-gear btn btn-sm btn-outline-secondary set-btn grp-first', title: t('情境組合 (研讀、投影…) 與各項大小 (右鍵、長按：切換組合)'),
            onclick: () => FontSizeDialog.s.open(),
            oncontextmenu: e => { e.preventDefault(); FontSizeDialog.s.openQuickMenu(gear) },
        }, icon('cog'))
        dom[0].replaceChildren(
            el('div', { class: 'fs-ctl', title: t('字型大小') },
                gear,
                el('button', { type: 'button', class: 'fs-step btn btn-sm btn-outline-secondary set-btn grp-mid', text: 'A−', title: t('小一點'), onclick: () => fs.stepScale(-1) }),
                el('button', { type: 'button', class: 'fs-step fs-big btn btn-sm btn-outline-secondary set-btn grp-last', text: 'A+', title: t('大一點'), onclick: () => fs.stepScale(1) }),
                this.#val))
    }
}
