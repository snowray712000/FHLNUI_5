import { DialogHtml } from "./DialogHtml.es2023.js";
import { SnFilter, SN_PRESETS, MORPH_GROUPS, SN_LENSES, WORD_COLORS, parseSnList, splitHelpSections, normalizeSn, topOfRanking } from "./SnFilter.es2023.js";
import { ensureMarkdownItAsync, fixLinks } from "./Help.es2023.js";
import { fetchTextAsync } from "./fetchAsync.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from "./gbText.es2023.js";
import { el } from "./auDom.es2023.js";
import { helpButtonHtml, bindIntroHelp } from "./IntroHelp.es2023.js";
import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { SN_Act_Color } from "./SN_Act_Color.es2023.js";

const TAB_KEY = 'snfTab'
/** 上次停的分頁 @returns {'combo'|'rank'|'detail'} */
function readTab() {
    try { const v = localStorage.getItem(TAB_KEY); if (v == 'rank' || v == 'detail') return v } catch { }
    return 'combo'
}

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
    /** 目前的分頁 (存 localStorage，下次開啟回到這裡) @type {'combo'|'rank'|'detail'} */
    #tab = readTab()
    /** 細項分頁正在編輯新約 G 或舊約 H；null = 跟著正在讀的書卷 (使用者切過就固定，到對話框關閉) @type {'G'|'H'|null} */
    #detailTp = null
    /** 排行榜顯示幾列 */
    #rankN = 20
    /** @type {HTMLElement|null} 排行榜的容器，經文換章時只重畫它 */
    #rankBox = null
    /** @type {MutationObserver|null} 經文區換內容 (換章) 時重畫排行榜 */
    #lecObserver = null
    /** @type {number} */
    #rankTimer = 0
    /** 點排行榜的列，依序跳到第幾個出現的位置 @type {Map<string, number>} */
    #rankIdx = new Map()
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
            maxHeight: window.innerHeight * 0.85, // 高度依目前分頁的內容
            getTitle: () => gbText('SN 篩選顯示', TPPageState.s.gb),
            registerEventWhenShowed: dlg => {
                this.#root = dlg.find('.snf-dlg')[0]
                // 「原文SN 是什麼」的 ? 放在標題列 (設定面板那一行只留開關和 ⚙)
                const bar = dlg.dialog('widget').find('.ui-dialog-titlebar')
                bar.find('.ui-dialog-title').append(helpButtonHtml('原文SN'))
                bindIntroHelp(bar, 'sn')
                dlg.on('dialogclose', () => {
                    this.#dlgHtml = null; this.#root = null; this.#rankBox = null; this.#detailTp = null
                    this.#lecObserver?.disconnect(); this.#lecObserver = null
                    clearTimeout(this.#rankTimer)
                })
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

        const boxes = { sns: null, exclude: null }
        const testament = (key, legend, example) => {
            const cfg = f[key]
            const tp = key == 'ot' ? 'H' : 'G'
            const snBox = (prop, placeholder) => {
                const ta = boxes[prop] = el('textarea', {
                    class: 'snf-sns', rows: 1, spellcheck: 'false', placeholder,
                    oninput: () => this.#onSnsInput(boxes, tp, prop, false),
                    onchange: () => this.#onSnsInput(boxes, tp, prop, true),
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
        // 細項分頁：新約或舊約二選一 (預設是正在讀的書卷所屬的約)，各自的詞類、動詞形態、另外加、排除
        const curTp = TPPageState.s.bookIndex >= 40 ? 'G' : 'H'
        const detailTp = this.#detailTp ?? curTp
        const tpBtn = (tp, text) => el('button', {
            type: 'button', class: 'snf-seg' + (tp == detailTp ? ' active' : ''), text: t(text),
            onclick: () => { this.#detailTp = tp; this.render() },
        })
        const detailPanel = el('div', {},
            el('div', { class: 'snf-row' },
                el('div', { class: 'snf-segs' }, tpBtn('G', '新約'), tpBtn('H', '舊約')),
                el('span', { class: 'snf-note', text: t(detailTp == curTp ? '目前讀的是這一約' : '目前讀的是另一約，這裡改的是' + (detailTp == 'G' ? '新約' : '舊約') + '的設定') })),
            el('div', { class: isFilter ? '' : 'snf-disabled' },
                detailTp == 'G'
                    ? testament('nt', '新約 (希臘文 G，含七十士譯本)', 'G1063 G1161 G3767')
                    : testament('ot', '舊約 (希伯來文 H)', 'H3068 H430 H3588'),
                el('div', { class: 'snf-note', text: t('勾選的詞類、主導詞、另外加的 SN，符合任一就顯示；排除的一定不顯示。詞類以原文字典形判斷 (同一字可能兼兩種詞類)。主導詞在「本章排行」分頁設定。SN 可貼上 G1063、<1063>，沒寫 G、H 的會自動放到對的框。') })))
        const comboPanel = el('div', {},
            modeRow,
            lensRow,
            customRow,
            el('div', { class: isFilter ? '' : 'snf-disabled' }, hideRow),
            colorRow)
        this.#rankBox = this.#tab == 'rank' ? el('div', { class: 'snf-rank' }) : null
        const panels = { combo: comboPanel, rank: this.#rankBox, detail: detailPanel }
        const tabBtn = (id, text) => el('button', {
            type: 'button', class: 'snf-tab' + (id == this.#tab ? ' active' : ''), role: 'tab', 'aria-selected': id == this.#tab, text: t(text),
            onclick: () => this.#setTab(id),
        })
        this.#root.replaceChildren(
            el('div', { class: 'snf-tabs', role: 'tablist' }, tabBtn('combo', '組合'), tabBtn('rank', '本章排行'), tabBtn('detail', '細項')),
            panels[this.#tab])
        this.#renderRank()
        this.#watchLecture()
    }

    /** @param {'combo'|'rank'|'detail'} id */
    #setTab(id) {
        if (id == this.#tab) return
        this.#tab = id
        try { localStorage.setItem(TAB_KEY, id) } catch { }
        this.render()
        const dlg = this.#dlgHtml?.dlg
        dlg?.dialog('option', 'position', dlg.dialog('option', 'position')) // 高度變了，重新定位，才不會超出視窗下緣
    }

    /** 經文區換了內容 (換章、換譯本) 就重畫排行榜；字是從畫面上抓的 */
    #watchLecture() {
        const lec = document.getElementById('fhlLecture')
        if (this.#lecObserver != null || lec == null) return
        this.#lecObserver = new MutationObserver(() => {
            clearTimeout(this.#rankTimer)
            this.#rankTimer = setTimeout(() => this.#renderRank(), 400)
        })
        this.#lecObserver.observe(lec, { childList: true, subtree: true })
    }

    /** 本章排行 (依 SnFilter.leitBy)：名次、SN、字、次數；點一列在經文中標出，＋ 加入「另外加」 */
    #renderRank() {
        const box = this.#rankBox
        if (box == null || !box.isConnected) return
        const f = SnFilter.s
        const ps = TPPageState.s
        const t = s => gbText(s, ps.gb)
        const r = f.chapterRanking()
        const unit = ps.bookIndex >= 40 ? '新約' : '舊約'
        const bookName = BibleConstantHelper.getBookNameArrayChineseShort()[ps.bookIndex - 1] ?? ''
        const details = el('div', { class: 'snf-rank-body' },
            el('div', { class: 'snf-rank-title', text: `${t('本章排行')} ${bookName}${ps.chap}` }))
        // 主導詞規則：這一章所屬的約 (新約 G / 舊約 H) 的設定；列的顏色就是它的結果
        const cfg = f.cfgOf(ps.bookIndex >= 40 ? 'G' : 'H')
        const leitVal = cfg.leitTop > 0 ? 't' + cfg.leitTop : cfg.leitwort > 0 ? 'c' + cfg.leitwort : '0'
        const leitOpt = (v, text) => el('option', { value: v, selected: leitVal == v, text })
        const leitSel = el('select', {
            onchange: e => {
                const v = e.target.value
                cfg.leitTop = v[0] == 't' ? parseInt(v.slice(1)) : 0
                cfg.leitwort = v[0] == 'c' ? parseInt(v.slice(1)) : 0
                this.#changed()
                this.#renderRank()
            },
        },
            leitOpt('0', t('不用')),
            ...[3, 5, 8, 10, 15].map(n => leitOpt('t' + n, `${t('前')} ${n} ${t('名')}`)),
            ...[2, 3, 4, 5, 8].map(n => leitOpt('c' + n, `≥ ${n} ${t('次')}`)))
        details.append(el('div', { class: 'snf-row' },
            el('span', { class: 'snf-lbl', text: t('本章主導詞') }), leitSel,
            el('span', { class: 'snf-note', text: t('依下面的名次顯示前幾名，或出現 ≥ N 次的名詞、動詞、形容詞；SN 要設成「只顯示指定的」才會套用到經文') })))
        if (r != null && cfg.leitTop > 0) {
            // 並列的一起算進來，實際個數可能多於設定 (例：第 3 名有 3 個字同分，設前 3 名會顯示 5 個)
            const n = topOfRanking(r.list, cfg.leitTop, f.leitBy).length
            if (n > cfg.leitTop) details.append(el('div', { class: 'snf-note', text: `${t('前')} ${cfg.leitTop} ${t('名中有並列，實際顯示')} ${n} ${t('個')}` }))
        }
        const setBy = by => { f.leitBy = by; f.save(); f.applyAll(); this.#renderRank() }
        const byRow = el('div', { class: 'snf-row' },
            el('label', { class: 'snf-opt' }, el('input', { type: 'radio', name: 'snfrank', checked: f.leitBy == 'feature', onchange: () => setBy('feature') }), t('本章特色')),
            el('label', { class: 'snf-opt' }, el('input', { type: 'radio', name: 'snfrank', checked: f.leitBy == 'count', onchange: () => setBy('count') }), t('次數')),
            el('span', { class: 'snf-note', text: t('實詞，和合本的次數；特色 = 比它在全' + unit + '的頻率該有的次數多出多少 (常用字如「是」「說」不會排前面)') }))
        details.append(byRow)
        if (r == null) {
            details.append(el('div', { class: 'snf-note', text: t('載入中…') }))
            f.loadRankingDataAsync().then(() => this.#renderRank()).catch(e => console.error(e))
        } else if (r.list.length == 0) {
            details.append(el('div', { class: 'snf-note', text: t('這一章沒有重複出現的實詞') }))
        } else {
            const words = this.#wordsOnScreen()
            const key = a => f.leitBy == 'count' ? a.c : a.score
            const max = key(r.list[0]) || 1
            const rows = r.list.slice(0, this.#rankN).map((a, i) => {
                // 目前設定下這個字顯示嗎：規則 (藍)、另外加 (紅)、排除 (灰、刪除線)、不顯示 (灰)
                const src = f.snSource(r.tp, a.sn)
                const isShown = src == 'rule' || src == 'sns'
                return el('div', {
                    class: `snf-rk snf-rk-${src}`, title: t('點一下在經文中標出 (再點跳到下一個)'),
                    onclick: () => this.#showInText(r.tp, a.sn),
                },
                    el('span', { class: 'snf-rk-n', text: i + 1 }),
                    el('span', { class: 'snf-rk-sn', text: r.tp + a.sn }),
                    el('span', { class: 'snf-rk-w', text: (words.get(r.tp + a.sn) ?? []).join('、') }),
                    el('span', { class: 'snf-rk-bar' }, el('i', { style: `width:${Math.max(4, Math.round(key(a) / max * 100))}%` })),
                    el('span', { class: 'snf-rk-c', text: a.c, title: `${t('本章')} ${a.c} ${t('次')}；${t('全' + unit)} ${a.total} ${t('次')}` }),
                    el('span', {
                        class: 'snf-rk-add', text: isShown ? '−' : '＋',
                        title: t(isShown ? '不要顯示這個字 (排除)' : src == 'exclude' ? '取消排除' : '另外加進來顯示'),
                        onclick: ev => { ev.stopPropagation(); f.setSnShown(r.tp, a.sn, !isShown); this.render() },
                    }))
            })
            details.append(el('div', { class: 'snf-note snf-rk-legend' },
                el('span', { class: 'snf-rk-sn snf-rk-lg-rule', text: t('藍') }), t('依規則顯示'), ' ',
                el('span', { class: 'snf-rk-sn snf-rk-lg-sns', text: t('紅') }), t('另外加'), ' ',
                el('span', { class: 'snf-rk-sn', text: t('灰') }), t('不顯示 (刪除線 = 排除)；按 ＋ / − 加入或排除')))
            if (f.mode != 'filter') {
                details.append(el('div', { class: 'snf-note' }, t('目前「顯示 SN」不是「只顯示指定的」，經文不會受影響。'),
                    el('a', { href: '#', text: t('改成只顯示指定的'), onclick: ev => { ev.preventDefault(); this.#setMode('filter') } })))
            }
            details.append(el('div', { class: 'snf-rk-list' }, ...rows))
            if (r.list.length > this.#rankN) {
                details.append(el('div', {
                    class: 'snf-note snf-rk-more', text: `${t('再多看')} ${Math.min(20, r.list.length - this.#rankN)} ${t('個')}`,
                    onclick: () => { this.#rankN += 20; this.#renderRank() },
                }))
            }
        }
        box.replaceChildren(details)
    }

    /**
     * 畫面上經文區各 SN 的字：最常見的兩種寫法 (和合本會夾著前後的字，例「我曾說」，次數少的不要)；SN 關閉時畫面沒有 SN，就是空的
     * @returns {Map<string, string[]>} 'G3056' → ['道']
     */
    #wordsOnScreen() {
        /** @type {Map<string, Map<string, number>>} */
        const cnt = new Map()
        for (const e of document.querySelectorAll('#lecMain .sn-text:not(.sn)[sn]')) {
            const w = e.textContent.trim()
            if (w == '') continue
            const k = (e.getAttribute('tp') == 'H' ? 'H' : 'G') + normalizeSn(e.getAttribute('sn'))
            const m = cnt.get(k) ?? new Map()
            m.set(w, (m.get(w) ?? 0) + 1)
            cnt.set(k, m)
        }
        return new Map([...cnt].map(([k, m]) => [k, [...m].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length).slice(0, 2).map(a => a[0])]))
    }

    /** 在經文中標出這個 SN (同滑鼠移過去的紅色)，並跳到第 n 個出現的位置；再點一次跳下一個 */
    #showInText(tp, sn) {
        SN_Act_Color.s.act_remove()
        SN_Act_Color.s.act_add(sn, tp)
        const list = [...document.querySelectorAll('#lecMain .sn-text[sn]')]
            .filter(e => (e.getAttribute('tp') == 'H' ? 'H' : 'G') == tp && normalizeSn(e.getAttribute('sn')) == sn && e.offsetParent != null)
        if (list.length == 0) return
        const k = tp + sn
        const i = (this.#rankIdx.get(k) ?? -1) + 1
        this.#rankIdx.set(k, i % list.length)
        list[i % list.length].scrollIntoView({ block: 'center', behavior: 'smooth' })
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
     * 細項分頁的「另外加」「排除」框 (一次只有一約)：寫了另一約代碼 (G / H) 的歸另一約
     * @param {{sns: HTMLTextAreaElement|null, exclude: HTMLTextAreaElement|null}} boxes
     * @param {'G'|'H'} tp 畫面上這個框是哪一約
     * @param {'sns'|'exclude'} prop
     * @param {boolean} isRewrite 離開框時，改寫成整理過的內容
     */
    #onSnsInput(boxes, tp, prop, isRewrite) {
        const f = SnFilter.s
        const box = boxes[prop]
        const all = parseSnList(box.value, tp)
        const mine = [...new Set(all.filter(a => a.tp == tp).map(a => a.sn))]
        const other = tp == 'G' ? 'H' : 'G'
        // 寫了另一約代碼的 (例在新約框貼 H3068)，加進另一約的清單；另一約的框現在不在畫面上
        const otherCfg = f.cfgOf(other)
        for (const a of all.filter(a => a.tp == other)) if (!otherCfg[prop].includes(a.sn)) otherCfg[prop].push(a.sn)
        f.cfgOf(tp)[prop] = mine
        this.#changed()
        if (isRewrite) box.value = mine.map(sn => tp + sn).join(' ')
    }

    #changed() {
        SnFilter.s.save()
        SnFilter.s.applyAll()
    }
}

