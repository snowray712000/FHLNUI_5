import { DialogHtml } from "./DialogHtml.es2023.js";
import { SnFilter, SN_PRESETS, parseSnList } from "./SnFilter.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from "./gbText.es2023.js";
import { el } from "./auDom.es2023.js";

/**
 * SN 篩選顯示的設定對話框。見 docs/z260928e
 * 改了立即套用 (SnFilter.applyAll) 並存 localStorage
 */
export class SnFilterDialog {
    static #s = null
    /** @returns {SnFilterDialog} */
    static get s() { if (this.#s == null) this.#s = new SnFilterDialog(); return this.#s }

    /** @type {DialogHtml} */
    #dlgHtml = null
    /** @type {HTMLElement} */
    #root = null

    open() {
        if (this.#dlgHtml?.dlg != null) {
            this.#dlgHtml.dlg.dialog('moveToTop')
            this.render()
            return
        }
        const isNarrow = window.innerWidth < 768
        const dlgHtml = this.#dlgHtml = new DialogHtml()
        dlgHtml.showDialog({
            html: '<div class="snf-dlg"></div>',
            width: isNarrow ? window.innerWidth - 16 : 560,
            height: Math.min(720, window.innerHeight * 0.85),
            getTitle: () => gbText('SN 篩選顯示', TPPageState.s.gb),
            registerEventWhenShowed: dlg => {
                this.#root = dlg.find('.snf-dlg')[0]
                dlg.on('dialogclose', () => { this.#dlgHtml = null; this.#root = null })
                this.render()
            },
        })
    }

    /** 重畫內容 (SN 開關、字典 📌 改變時，外部也會呼叫) */
    render() {
        if (this.#root == null) return
        const f = SnFilter.s
        const gb = TPPageState.s.gb
        const t = s => gbText(s, gb)
        const name = `snf${Date.now()}` // radio name，避免與其它對話框衝突

        const radio = (group, value, text, checked, onChange) => el('label', { class: 'snf-opt' },
            el('input', { type: 'radio', name: name + group, value, checked, onchange: onChange }), t(text))

        const modeRow = el('div', { class: 'snf-row' },
            el('span', { class: 'snf-lbl', text: t('顯示 SN') }),
            radio('mode', 'off', '關', f.mode == 'off', () => this.#setMode('off')),
            radio('mode', 'all', '全部', f.mode == 'all', () => this.#setMode('all')),
            radio('mode', 'filter', '只顯示指定的', f.mode == 'filter', () => this.#setMode('filter')),
        )

        const boxes = { sns: {}, exclude: {} }
        const testament = (key, legend, example) => {
            const cfg = f[key]
            const tp = key == 'ot' ? 'H' : 'G'
            const snBox = (prop, placeholder) => {
                const ta = boxes[prop][key] = el('textarea', {
                    class: 'snf-sns', rows: 1, spellcheck: 'false', placeholder,
                    oninput: () => this.#onSnsInput(boxes[prop], prop, false),
                    onchange: () => this.#onSnsInput(boxes[prop], prop, true),
                })
                ta.value = cfg[prop].map(sn => tp + sn).join(' ')
                return ta
            }
            const check = (prop, text) => el('label', { class: 'snf-opt' },
                el('input', {
                    type: 'checkbox', checked: cfg[prop],
                    onchange: e => { cfg[prop] = e.target.checked; this.#changed() },
                }), t(text))
            const chip = p => el('label', { class: 'snf-chip', title: p.tip ? t(p.tip) : null },
                el('input', {
                    type: 'checkbox', checked: cfg.presets.includes(p.id),
                    onchange: e => {
                        cfg.presets = cfg.presets.filter(id => id != p.id)
                        if (e.target.checked) cfg.presets.push(p.id)
                        this.#changed()
                    },
                }), t(p.name))
            const leitwort = el('select', {
                onchange: e => { cfg.leitwort = parseInt(e.target.value); this.#changed() },
            }, ...[0, 2, 3, 4, 5, 8].map(n => el('option', { value: n, selected: cfg.leitwort == n, text: n == 0 ? t('不用') : `≥ ${n} ${t('次')}` })))
            return el('fieldset', { class: 'snf-tm' },
                el('legend', { text: t(legend) }),
                el('div', { class: 'snf-chips' }, ...SN_PRESETS.filter(p => p.only == null || p.only == tp).map(chip)),
                el('div', { class: 'snf-row' },
                    el('span', { text: t('本章主導詞') }), leitwort,
                    el('span', { class: 'snf-note', text: t('本章 (和合本) 出現多次的名詞、動詞、形容詞') })),
                el('div', { class: 'snf-field' }, el('span', { text: t('另外加') }), snBox('sns', t('例') + ': ' + example)),
                el('div', { class: 'snf-field' }, el('span', { text: t('排除') }), snBox('exclude', t('例') + ': ' + (tp == 'H' ? 'H853' : 'G846 G3588'))),
                el('div', { class: 'snf-row' },
                    check('includeCurly', '含未譯出的 {<…>}'),
                    check('showTvm', '顯示動詞時態碼 (…)')),
            )
        }

        const hideRow = el('div', { class: 'snf-row' },
            el('span', { class: 'snf-lbl', text: t('其它的 SN') }),
            radio('hide', 'hide', '隱藏', f.hideMethod == 'hide', () => { f.hideMethod = 'hide'; this.#changed() }),
            radio('hide', 'dim', '變淡', f.hideMethod == 'dim', () => { f.hideMethod = 'dim'; this.#changed() }),
        )

        const isFilter = f.mode == 'filter'
        this.#root.replaceChildren(
            modeRow,
            el('div', { class: 'snf-body' + (isFilter ? '' : ' snf-disabled') },
                testament('nt', '新約 (希臘文 G，含七十士譯本)', 'G1063 G1161 G3767'),
                testament('ot', '舊約 (希伯來文 H)', 'H3068 H430 H3588'),
                hideRow,
                el('div', { class: 'snf-note', text: t('勾選的詞類、主導詞、另外加的 SN，符合任一就顯示；排除的一定不顯示。詞類以原文字典形判斷 (同一字可能兼兩種詞類)。SN 可貼上 G1063、<1063>，沒寫 G、H 的依所在的框。原文字典標題的「📌」可把該字加入或移出「另外加」。') }),
            ),
        )
    }

    /** @param {'off'|'all'|'filter'} mode */
    #setMode(mode) {
        const f = SnFilter.s
        if (mode != 'off') {
            f.isOn = mode == 'filter'
            f.save()
        }
        const strong = mode == 'off' ? 0 : 1
        if (TPPageState.s.strong != strong) {
            // 交給 SN 開關原本的流程 (重畫經文、存 ps)
            $('#snOnOffSwitch').prop('checked', strong == 1).trigger('change')
        } else {
            f.applyAll()
        }
        this.render()
    }

    /**
     * 新約、舊約兩個框一起解析：框中寫了 H 的歸舊約，寫 G 的歸新約
     * @param {Record<'nt'|'ot', HTMLTextAreaElement>} boxes
     * @param {'sns'|'exclude'} prop
     * @param {boolean} isRewrite 離開框時，改寫成整理過的內容
     */
    #onSnsInput(boxes, prop, isRewrite) {
        const f = SnFilter.s
        const all = [...parseSnList(boxes.nt.value, 'G'), ...parseSnList(boxes.ot.value, 'H')]
        f.nt[prop] = [...new Set(all.filter(a => a.tp == 'G').map(a => a.sn))]
        f.ot[prop] = [...new Set(all.filter(a => a.tp == 'H').map(a => a.sn))]
        this.#changed()
        if (isRewrite) {
            boxes.nt.value = f.nt[prop].map(sn => 'G' + sn).join(' ')
            boxes.ot.value = f.ot[prop].map(sn => 'H' + sn).join(' ')
        }
    }

    #changed() {
        SnFilter.s.save()
        SnFilter.s.applyAll()
    }
}
