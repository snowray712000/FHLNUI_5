import { DialogHtml } from "./DialogHtml.es2023.js";
import { SnFilter, SN_PRESETS, MORPH_GROUPS, SN_LENSES, WORD_COLORS, parseSnList, splitHelpSections } from "./SnFilter.es2023.js";
import { ensureMarkdownItAsync, fixLinks } from "./Help.es2023.js";
import { fetchTextAsync } from "./fetchAsync.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from "./gbText.es2023.js";
import { el } from "./auDom.es2023.js";

/** 讀經組合的說明；build 時由 vite.config.js 的 LEGACY_COPY 複製到 dist/ */
const LENS_HELP_URL = 'docs/SN讀經組合說明.md'

/**
 * SN 篩選顯示的設定對話框。見 docs/z260928e、docs/z260928f
 * 改了立即套用 (SnFilter.applyAll) 並存 localStorage
 * 上方是讀經組合 (點一下套用，? 看說明) 與我的組合，細項收合在下面
 */
export class SnFilterDialog {
    static #s = null
    /** @returns {SnFilterDialog} */
    static get s() { if (this.#s == null) this.#s = new SnFilterDialog(); return this.#s }

    /** @type {DialogHtml} */
    #dlgHtml = null
    /** @type {HTMLElement} */
    #root = null
    /** 細項展開 (render 重畫時保留) */
    #isDetailOpen = false
    /** @type {DialogHtml} 組合說明 */
    #helpDlg = null
    /** @type {Promise<string>|null} 說明 md */
    #helpText = null

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
            maxHeight: window.innerHeight * 0.85, // 高度依內容 (細項預設收合)
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
            const morphChip = (g, o) => el('label', { class: 'snf-chip', title: o.tip ? t(o.tip) : null },
                el('input', {
                    type: 'checkbox', checked: (cfg.morph[g.id] ?? []).includes(o.id),
                    onchange: e => {
                        const a = (cfg.morph[g.id] ?? []).filter(id => id != o.id)
                        if (e.target.checked) a.push(o.id)
                        cfg.morph[g.id] = a
                        this.#changed()
                    },
                }), t(o.name))
            const morphRows = MORPH_GROUPS[tp].map(g => el('div', { class: 'snf-morph-row' },
                el('span', { class: 'snf-morph-lbl', text: t(g.name) }),
                el('div', { class: 'snf-chips' }, ...g.opts.map(o => morphChip(g, o)))))
            return el('fieldset', { class: 'snf-tm' },
                el('legend', { text: t(legend) }),
                el('div', { class: 'snf-sub', text: t('詞類') }),
                el('div', { class: 'snf-chips' }, ...SN_PRESETS.filter(p => p.only == null || p.only == tp).map(chip)),
                el('div', { class: 'snf-sub', text: t('動詞形態 (依每個字實際的形態；同一列任一、不同列都要符合，例：分詞 + 現在 = 現在分詞)') }),
                ...morphRows,
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

        const swatch = a => el('span', { class: 'snf-swatch snc-' + a.id, text: t(a.name) })
        const legend = f.colorBy == 'pos' ? [el('div', { class: 'snf-legend' }, ...WORD_COLORS.pos.map(swatch))]
            : f.colorBy == 'verb' ? [
                el('div', { class: 'snf-legend' }, el('span', { class: 'snf-note', text: t('新約') }), ...WORD_COLORS.verb.G.map(swatch)),
                el('div', { class: 'snf-legend' }, el('span', { class: 'snf-note', text: t('舊約') }), ...WORD_COLORS.verb.H.map(swatch),
                    swatch({ id: 'vx', name: '不確定' })),
            ] : []
        const colorRow = el('div', { class: 'snf-color' },
            el('div', { class: 'snf-row' },
                el('span', { class: 'snf-lbl', text: t('字上色') }),
                radio('color', 'off', '關', f.colorBy == 'off', () => this.#setColorBy('off')),
                radio('color', 'pos', '詞類', f.colorBy == 'pos', () => this.#setColorBy('pos')),
                radio('color', 'verb', '動詞形態', f.colorBy == 'verb', () => this.#setColorBy('verb')),
                el('span', { class: 'snf-note', text: t('SN 關閉時也可用；滑鼠停在字上看 SN、詞類、形態') })),
            ...legend)

        const isFilter = f.mode == 'filter'
        const activeId = isFilter ? f.activeLensId : null
        const help = id => el('span', {
            class: 'snf-q', text: '?', title: t('說明'),
            onclick: e => { e.stopPropagation(); this.#showHelpAsync(id) },
        })
        const lensRow = el('div', { class: 'snf-row snf-lenses' },
            el('span', { class: 'snf-lbl' }, t('讀經組合'), help('intro')),
            el('div', { class: 'snf-chips' }, ...SN_LENSES.map(a => el('span', {
                class: 'snf-lens' + (a.id == activeId ? ' active' : ''),
                title: a.only == null ? null : t(a.only == 'G' ? '只用於新約' : '只用於舊約'),
                onclick: () => this.#useLens(a.id),
            }, t(a.name), help(a.id)))))
        const customRow = el('div', { class: 'snf-row snf-lenses' },
            el('span', { class: 'snf-lbl', text: t('我的組合') }),
            el('div', { class: 'snf-chips' },
                ...f.custom.map((a, i) => el('span', {
                    class: 'snf-lens' + ('u' + i == activeId ? ' active' : ''),
                    onclick: () => this.#useLens('u' + i),
                }, a.name, el('span', {
                    class: 'snf-q', text: '×', title: t('刪除'),
                    onclick: e => {
                        e.stopPropagation()
                        if (!confirm(t('刪除「') + a.name + t('」？'))) return
                        f.removeCustom(i)
                        this.render()
                    },
                }))),
                el('span', {
                    class: 'snf-lens snf-add', text: '+ ' + t('把目前設定存成組合'),
                    onclick: () => this.#saveCustom(),
                })))
        const detail = el('details', {
            class: 'snf-detail', open: this.#isDetailOpen,
            ontoggle: e => {
                this.#isDetailOpen = e.target.open
                const dlg = this.#dlgHtml?.dlg
                dlg?.dialog('option', 'position', dlg.dialog('option', 'position')) // 高度變了，重新定位，才不會超出視窗下緣
            },
        },
            el('summary', { text: t('細項設定') }),
            el('div', { class: isFilter ? '' : 'snf-disabled' },
                testament('nt', '新約 (希臘文 G，含七十士譯本)', 'G1063 G1161 G3767'),
                testament('ot', '舊約 (希伯來文 H)', 'H3068 H430 H3588'),
                el('div', { class: 'snf-note', text: t('勾選的詞類、主導詞、另外加的 SN，符合任一就顯示；排除的一定不顯示。詞類以原文字典形判斷 (同一字可能兼兩種詞類)。SN 可貼上 G1063、<1063>，沒寫 G、H 的依所在的框。原文字典標題的「📌」可把該字加入或移出「另外加」。') }),
            ))
        this.#root.replaceChildren(
            modeRow,
            lensRow,
            customRow,
            el('div', { class: isFilter ? '' : 'snf-disabled' }, hideRow),
            colorRow,
            detail,
        )
    }

    /**
     * 快速切換選單 (不必開對話框)：讀經組合、我的組合、顯示全部、設定
     * @param {HTMLElement} anchor
     */
    openQuickMenu(anchor) {
        document.querySelector('.snf-menu')?.remove()
        const f = SnFilter.s
        const t = s => gbText(s, TPPageState.s.gb)
        const activeId = f.mode == 'filter' ? f.activeLensId : null
        const close = () => { menu.remove(); document.removeEventListener('pointerdown', onOutside, true) }
        const onOutside = e => { if (!menu.contains(e.target)) close() }
        const item = (text, isActive, onclick) => el('div', {
            class: 'snf-menu-item' + (isActive ? ' active' : ''), text,
            onclick: () => { close(); onclick() },
        })
        const menu = el('div', { class: 'snf-menu' },
            ...SN_LENSES.map(a => item(t(a.name), a.id == activeId, () => this.#useLens(a.id))),
            f.custom.length > 0 ? el('hr') : null,
            ...f.custom.map((a, i) => item(a.name, 'u' + i == activeId, () => this.#useLens('u' + i))),
            el('hr'),
            item(t('全部 SN'), f.mode == 'all', () => this.#setMode('all')),
            el('hr'),
            item(t('字上色：詞類'), f.colorBy == 'pos', () => this.#setColorBy(f.colorBy == 'pos' ? 'off' : 'pos')),
            item(t('字上色：動詞形態'), f.colorBy == 'verb', () => this.#setColorBy(f.colorBy == 'verb' ? 'off' : 'verb')),
            item(t('設定…'), false, () => this.open()),
        )
        document.body.append(menu)
        const r = anchor.getBoundingClientRect()
        menu.style.left = `${Math.max(4, Math.min(r.left, window.innerWidth - menu.offsetWidth - 4))}px`
        menu.style.top = `${Math.min(r.bottom + 4, window.innerHeight - menu.offsetHeight - 4)}px`
        setTimeout(() => document.addEventListener('pointerdown', onOutside, true))
    }

    /** @param {'off'|'pos'|'verb'} colorBy */
    #setColorBy(colorBy) {
        SnFilter.s.colorBy = colorBy
        this.#changed()
        this.render()
    }

    /** 套用組合，並開啟篩選 @param {string} id */
    #useLens(id) {
        SnFilter.s.useLens(id)
        this.#setMode('filter')
    }
    #saveCustom() {
        const f = SnFilter.s
        const t = s => gbText(s, TPPageState.s.gb)
        const cur = f.activeLensId
        const def = cur?.startsWith('u') ? f.custom[parseInt(cur.slice(1))].name : ''
        const name = prompt(t('組合名稱 (同名的會覆蓋)'), def)?.trim()
        if (name == null || name == '') return
        f.saveCustom(name)
        this.render()
    }

    /**
     * 組合的說明 (md 中「## 名稱 (id)」那一節)；經文位置的連結 (#/bible/…) 點了會跳過去並套用組合
     * @param {string} id SN_LENSES 的 id，或 'intro'
     */
    async #showHelpAsync(id) {
        const t = s => gbText(s, TPPageState.s.gb)
        let title = t('讀經組合'), body
        try {
            this.#helpText ??= fetchTextAsync(LENS_HELP_URL).catch(e => { this.#helpText = null; throw e })
            const [md, text] = await Promise.all([ensureMarkdownItAsync(), this.#helpText])
            const sec = splitHelpSections(text).find(a => a.id == id)
            if (sec == null) throw new Error(`沒有 ${id} 的說明`)
            title = t(sec.name)
            body = fixLinks(md.render(sec.body), LENS_HELP_URL)
        } catch (ex) {
            console.error(ex)
            body = `<div>${t('說明載入失敗，請稍後再試。')} (${ex.message})</div>`
        }
        this.#helpDlg?.dlg?.dialog('close')
        const isLens = SN_LENSES.some(a => a.id == id)
        const dlgHtml = this.#helpDlg = new DialogHtml()
        dlgHtml.showDialog({
            html: '<div class="snf-help markdown-body"></div>',
            width: Math.min(window.innerWidth - 16, 520),
            height: Math.min(560, window.innerHeight * 0.75),
            // 放在設定對話框右邊 (空間不夠時 jQuery UI 會往內移)
            position: this.#dlgHtml?.dlg == null ? undefined : { my: 'left top', at: 'right+8 top', of: this.#dlgHtml.dlg.parent(), collision: 'fit' },
            getTitle: () => title,
            registerEventWhenShowed: dlg => {
                const div = dlg.find('.snf-help')[0]
                div.innerHTML = body
                if (isLens) {
                    div.prepend(el('button', {
                        class: 'snf-apply', text: t('套用這個組合'),
                        onclick: () => this.#useLens(id),
                    }))
                    // 經文位置：套用組合，再由 hashchange 跳過去
                    $(div).on('click', 'a[href^="#/bible/"]', () => this.#useLens(id))
                }
                dlg.on('dialogclose', () => { if (this.#helpDlg == dlgHtml) this.#helpDlg = null })
            },
        })
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

