import { DialogHtml } from "./DialogHtml.es2023.js";
import { SnFilter, parseSnList } from "./SnFilter.es2023.js";
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
            width: isNarrow ? window.innerWidth - 16 : 520,
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

        const boxes = {}
        const testament = (key, legend, example) => {
            const cfg = f[key]
            const tp = key == 'ot' ? 'H' : 'G'
            const ta = boxes[key] = el('textarea', {
                class: 'snf-sns', rows: 2, spellcheck: 'false',
                placeholder: t('例') + ': ' + example,
                oninput: () => this.#onSnsInput(boxes, false),
                onchange: () => this.#onSnsInput(boxes, true),
            })
            ta.value = cfg.sns.map(sn => tp + sn).join(' ')
            const check = (prop, text) => el('label', { class: 'snf-opt' },
                el('input', {
                    type: 'checkbox', checked: cfg[prop],
                    onchange: e => { cfg[prop] = e.target.checked; this.#changed() },
                }), t(text))
            return el('fieldset', { class: 'snf-tm' },
                el('legend', { text: t(legend) }),
                ta,
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
                el('div', { class: 'snf-note', text: t('可貼上 G1063、<1063>；沒寫 G、H 的，依所在的框。原文字典標題的「📌」可把該字加入或移出清單。') }),
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
     * 兩個框一起解析：框中寫了 H 的歸舊約，寫 G 的歸新約
     * @param {Record<'nt'|'ot', HTMLTextAreaElement>} boxes
     * @param {boolean} isRewrite 離開框時，改寫成整理過的內容
     */
    #onSnsInput(boxes, isRewrite) {
        const f = SnFilter.s
        const all = [...parseSnList(boxes.nt.value, 'G'), ...parseSnList(boxes.ot.value, 'H')]
        f.nt.sns = [...new Set(all.filter(a => a.tp == 'G').map(a => a.sn))]
        f.ot.sns = [...new Set(all.filter(a => a.tp == 'H').map(a => a.sn))]
        this.#changed()
        if (isRewrite) {
            boxes.nt.value = f.nt.sns.map(sn => 'G' + sn).join(' ')
            boxes.ot.value = f.ot.sns.map(sn => 'H' + sn).join(' ')
        }
    }

    #changed() {
        SnFilter.s.save()
        SnFilter.s.applyAll()
    }
}
