import { DialogHtml } from "./DialogHtml.es2023.js";
import { FontSize, FONT_PRESETS, FONT_MIN, FONT_MAX } from "./FontSize.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from "./gbText.es2023.js";
import { el } from "./auDom.es2023.js";

/**
 * 字型設定對話框：組合 (點一下套用)、我的組合、主字型、原文與 SN (可跟著主字型等比例)、預覽
 * - 組合的樣式沿用 SN 篩選對話框 (.snf-dlg .snf-lens、.snf-menu)
 * - 值改變時只同步各個 input，不重畫 (重畫會中斷正在拖曳的滑桿)
 */
export class FontSizeDialog {
    static #s = null
    /** @returns {FontSizeDialog} */
    static get s() { if (this.#s == null) this.#s = new FontSizeDialog(); return this.#s }

    /** @type {DialogHtml} */
    #dlgHtml = null
    /** @type {HTMLElement} */
    #root = null
    /** @type {() => void} 同步畫面上的值與組合 (render 時建立) */
    #sync = null

    constructor() {
        FontSize.s.onChange(() => this.#sync?.())
    }

    open() {
        if (this.#dlgHtml?.dlg != null) {
            this.#dlgHtml.dlg.dialog('moveToTop')
            return
        }
        const isNarrow = window.innerWidth < 768
        const dlgHtml = this.#dlgHtml = new DialogHtml()
        dlgHtml.showDialog({
            html: '<div class="snf-dlg fs-dlg"></div>',
            width: isNarrow ? window.innerWidth - 16 : 520,
            maxHeight: window.innerHeight * 0.85,
            getTitle: () => gbText('字型大小', TPPageState.s.gb),
            registerEventWhenShowed: dlg => {
                this.#root = dlg.find('.fs-dlg')[0]
                dlg.on('dialogclose', () => { this.#dlgHtml = null; this.#root = null; this.#sync = null })
                this.render()
            },
        })
    }

    render() {
        if (this.#root == null) return
        const fs = FontSize.s
        const t = s => gbText(s, TPPageState.s.gb)

        const presetRow = el('div', { class: 'snf-row snf-lenses' },
            el('span', { class: 'snf-lbl', text: t('組合') }),
            el('div', { class: 'snf-chips' }, ...FONT_PRESETS.map(a => el('span', {
                class: 'snf-lens', 'data-id': a.id, title: `${t(a.tip)} (${a.main} / ${a.hebrew} / ${a.greek} / ${a.sn})`,
                onclick: () => fs.use(a.id),
            }, t(a.name)))))
        const customRow = el('div', { class: 'snf-row snf-lenses' },
            el('span', { class: 'snf-lbl', text: t('我的組合') }),
            el('div', { class: 'snf-chips' },
                ...fs.custom.map((a, i) => el('span', {
                    class: 'snf-lens', 'data-id': 'u' + i, title: `${a.main} / ${a.hebrew} / ${a.greek} / ${a.sn}`,
                    onclick: () => fs.use('u' + i),
                }, a.name, el('span', {
                    class: 'snf-q', text: '×', title: t('刪除'),
                    onclick: e => {
                        e.stopPropagation()
                        if (!confirm(t('刪除「') + a.name + t('」？'))) return
                        fs.removeCustom(i)
                        this.render()
                    },
                }))),
                el('span', {
                    class: 'snf-lens snf-add', text: '+ ' + t('把目前設定存成組合'),
                    onclick: () => this.#saveCustom(),
                })))

        /** @type {Record<string, { range: HTMLInputElement, num: HTMLInputElement }>} */
        const inputs = {}
        /** @param {'main'|'hebrew'|'greek'|'sn'} key */
        const sizeRow = (key, label) => {
            const range = el('input', {
                type: 'range', min: FONT_MIN, max: FONT_MAX, step: 1, class: 'fs-range', 'aria-label': t(label),
                oninput: e => fs.set(key, e.target.value, false),
                onchange: e => fs.set(key, e.target.value, true),
            })
            const num = el('input', {
                type: 'number', min: FONT_MIN, max: FONT_MAX, step: 1, class: 'fs-num', 'aria-label': t(label),
                onchange: e => { fs.set(key, e.target.value); this.#sync() }, // 空白、非數字時還原
            })
            inputs[key] = { range, num }
            return el('div', { class: 'fs-row' + (key == 'main' ? ' fs-main' : '') },
                el('span', { class: 'fs-lbl', text: t(label) }),
                el('button', { type: 'button', class: 'fs-btn', text: 'A−', title: t('小一點'), onclick: () => fs.step(key, -1) }),
                range,
                el('button', { type: 'button', class: 'fs-btn fs-big', text: 'A+', title: t('大一點'), onclick: () => fs.step(key, 1) }),
                num, el('span', { class: 'snf-note', text: 'pt' }))
        }

        const link = el('input', { type: 'checkbox', onchange: e => fs.setLink(e.target.checked) })
        const sub = el('div', { class: 'fs-sub' },
            sizeRow('hebrew', '希伯來文'),
            sizeRow('greek', '希臘文'),
            sizeRow('sn', '原文編號'))

        const preview = el('div', { class: 'fs-preview', title: t('預覽') },
            el('div', { class: 'fs-pv-main' }, t('太初有道，道與神同在'), el('span', { class: 'fs-sn', text: '<G3056>' })),
            el('div', { class: 'greek-char', text: 'Ἐν ἀρχῇ ἦν ὁ λόγος' }),
            el('div', { class: 'hebrew-char', dir: 'rtl', text: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים' }))

        this.#root.replaceChildren(
            presetRow,
            customRow,
            el('hr'),
            sizeRow('main', '經文'),
            el('label', { class: 'snf-opt fs-link' }, link, t('原文、SN 跟著經文等比例放大縮小')),
            sub,
            preview,
            el('div', { class: 'snf-note', text: t('停在組合上可看各項大小。側邊欄的 A− A+ 調的是「經文」；右鍵 (手機長按) ⚙ 可快速切換組合。') }),
        )

        this.#sync = () => {
            const s = fs.sizes
            for (const [k, a] of Object.entries(inputs)) {
                if (document.activeElement != a.range) a.range.value = s[k]
                if (document.activeElement != a.num) a.num.value = s[k]
            }
            link.checked = fs.link
            sub.classList.toggle('fs-linked', fs.link)
            const id = fs.activeId
            for (const e of this.#root.querySelectorAll('.snf-lens[data-id]')) e.classList.toggle('active', e.dataset.id == id)
        }
        this.#sync()
    }

    /**
     * 快速切換選單 (不必開對話框)
     * @param {HTMLElement} anchor
     */
    openQuickMenu(anchor) {
        document.querySelector('.snf-menu')?.remove()
        const fs = FontSize.s
        const t = s => gbText(s, TPPageState.s.gb)
        const activeId = fs.activeId
        const close = () => { menu.remove(); document.removeEventListener('pointerdown', onOutside, true) }
        const onOutside = e => { if (!menu.contains(e.target)) close() }
        const item = (text, isActive, onclick) => el('div', {
            class: 'snf-menu-item' + (isActive ? ' active' : ''), text,
            onclick: () => { close(); onclick() },
        })
        const menu = el('div', { class: 'snf-menu' },
            ...FONT_PRESETS.map(a => item(t(a.name), a.id == activeId, () => fs.use(a.id))),
            fs.custom.length > 0 ? el('hr') : null,
            ...fs.custom.map((a, i) => item(a.name, 'u' + i == activeId, () => fs.use('u' + i))),
            el('hr'),
            item(t('設定…'), false, () => this.open()),
        )
        document.body.append(menu)
        const r = anchor.getBoundingClientRect()
        menu.style.left = `${Math.max(4, Math.min(r.left, window.innerWidth - menu.offsetWidth - 4))}px`
        menu.style.top = `${Math.min(r.bottom + 4, window.innerHeight - menu.offsetHeight - 4)}px`
        setTimeout(() => document.addEventListener('pointerdown', onOutside, true))
    }

    #saveCustom() {
        const fs = FontSize.s
        const t = s => gbText(s, TPPageState.s.gb)
        const cur = fs.activeId
        const def = cur?.startsWith('u') ? fs.custom[parseInt(cur.slice(1))].name : ''
        const name = prompt(t('組合名稱 (同名的會覆蓋)'), def)?.trim()
        if (name == null || name == '') return
        fs.saveCustom(name)
        this.render()
    }
}
