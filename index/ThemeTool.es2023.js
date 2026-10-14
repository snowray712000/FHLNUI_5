import { Theme } from './theme/Theme.es2023.js'
import { gbText } from './gbText.es2023.js'
import { el } from './auDom.es2023.js'

/**
 * 側邊欄「設定」中的主題，兩列分段按鈕 (沒有標題，樣式同顯示切換 .sm-seg / .sm-btn)：
 *   [淺色｜深色]
 *   [自動｜高對比]
 * - 自動 = 跟隨系統 (系統的深色、增強對比都跟著)，此時「高對比」不能按
 * - 淺色 / 深色 + 高對比 = hc-light / hc-dark；高對比是開關，不是與自動 / 淺色 / 深色並列的選項
 * (docs/z261003b)
 */
export class ThemeTool {
    static #s = null
    /** @returns {ThemeTool} */
    static get s() { if (this.#s == null) this.#s = new ThemeTool(); return this.#s }

    /** @type {HTMLElement} */
    #dom = null
    #isSubscribed = false

    /** @param {import('./TPPageState.es2023.js').TPPageState} ps @param {JQuery<HTMLElement>} dom */
    init(ps, dom) {
        this.#dom = dom[0]
        this.render(ps)
        if (this.#isSubscribed) return
        this.#isSubscribed = true
        Theme.s.onChange(() => this.render(ps)) // 其他分頁切換 (storage 事件) 也要更新按鈕
    }

    render(ps) {
        const t = s => gbText(s, ps.gb)
        const mode = Theme.s.mode
        const scheme = mode == 'auto' ? 'auto' : mode.endsWith('dark') ? 'dark' : 'light'
        const isHc = mode.startsWith('hc-')
        /** @param {'auto'|'light'|'dark'} s @param {boolean} hc */
        const set = (s, hc) => { Theme.s.mode = s == 'auto' ? 'auto' : /** @type {any} */ ((hc ? 'hc-' : '') + s) }
        const btn = (s, text, title) => el('button', {
            type: 'button', class: 'btn btn-sm btn-outline-secondary set-btn sm-btn' + (scheme == s ? ' active' : ''), text: t(text), title: t(title),
            'aria-pressed': scheme == s ? 'true' : 'false',
            onclick: () => set(s, isHc),
        })
        const hcBtn = el('button', {
            type: 'button', class: 'btn btn-sm btn-outline-secondary set-btn sm-btn' + (isHc ? ' active' : '') + (scheme == 'auto' ? ' disabled' : ''), text: t('高對比'),
            title: t(scheme == 'auto' ? '自動時跟隨系統的「增強對比」' : '文字、線條對比較高'),
            'aria-pressed': isHc ? 'true' : 'false',
            onclick: () => { if (scheme != 'auto') set(scheme, !isHc) },
        })
        this.#dom.replaceChildren(
            el('div', { class: 'sm-ctl sm-rows', role: 'group', title: t('主題') },
                el('div', { class: 'btn-group sm-seg' }, btn('light', '淺色', '淺色'), btn('dark', '深色', '深色')),
                el('div', { class: 'btn-group sm-seg' }, btn('auto', '自動', '跟隨系統的淺色 / 深色、增強對比'), hcBtn)))
    }
}
