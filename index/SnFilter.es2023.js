import { TPPageState } from "./TPPageState.es2023.js";

/**
 * SN 篩選顯示：SN 開啟時，只顯示指定的 SN。見 docs/z260928e
 *
 * 所有 SN 本來就在 DOM 中 (.sn)，這裡只決定每個 .sn 要不要加 .sn-hidden (或 .sn-dim)
 * - 模式: ps.strong == 0 → 關；isOn → 篩選；否則全部
 * - 時態碼 (5656) 跟著它前面的字
 *
 * @typedef {{sns: string[], includeCurly: boolean, showTvm: boolean}} DSnFilterOfTestament
 */
export class SnFilter {
    static #s = null
    /** @returns {SnFilter} */
    static get s() { if (this.#s == null) this.#s = new SnFilter(); return this.#s }

    /** 篩選開啟 (ps.strong == 1 時才有作用) */
    isOn = false
    /** @type {'hide'|'dim'} 不符合的 SN 隱藏或變淡 */
    hideMethod = 'hide'
    /** @type {DSnFilterOfTestament} 新約 (希臘文 G，含七十士譯本) */
    nt = { sns: [], includeCurly: true, showTvm: true }
    /** @type {DSnFilterOfTestament} 舊約 (希伯來文 H) */
    ot = { sns: [], includeCurly: true, showTvm: true }

    /** 會有經文 SN 的地方；註釋中的 SN 是作者寫的內容，不篩 */
    static SCOPES = ['#fhlLecture', '.search-dlg', '.sn-filter-scope']
    static #KEY = 'snFilter'

    constructor() { this.#load() }

    /** @returns {'off'|'all'|'filter'} */
    get mode() {
        if (TPPageState.s.strong != 1) return 'off'
        return this.isOn ? 'filter' : 'all'
    }

    /**
     * @param {'G'|'H'|string} tp
     * @returns {DSnFilterOfTestament}
     */
    cfgOf(tp) { return String(tp).toUpperCase() == 'H' ? this.ot : this.nt }

    /** @param {'G'|'H'|string} tp @param {string} sn */
    hasSn(tp, sn) { return this.cfgOf(tp).sns.includes(normalizeSn(sn)) }

    /** 字典的 📌：加入或移出清單 @returns {boolean} 之後是否在清單中 */
    toggleSn(tp, sn) {
        const cfg = this.cfgOf(tp)
        const s = normalizeSn(sn)
        const idx = cfg.sns.indexOf(s)
        if (idx == -1) cfg.sns.push(s); else cfg.sns.splice(idx, 1)
        this.save()
        this.applyAll()
        return idx == -1
    }

    /**
     * @param {JQuery<HTMLElement>|Element|Document} root
     * @param {{offShowsAll?: boolean}} [opt] offShowsAll: 搜尋結果，SN 關閉時仍顯示 (搜 SN 時會強制帶 SN)
     */
    apply(root, opt = {}) {
        const mode = this.mode == 'off' && opt.offShowsAll ? 'all' : this.mode
        const spans = $(root).find('.sn')
        let isLastWordShow = false
        for (const e of spans) {
            e.classList.remove('sn-hidden', 'sn-dim')
            if (mode == 'all') continue

            let isShow = false
            if (mode == 'filter' && isMarker(e)) {
                e.classList.add('sn-hidden') // 標記不是字，變淡模式也不顯示
                continue
            }
            if (mode == 'filter') {
                if (isTvm(e)) {
                    isShow = isLastWordShow && this.cfgOf(e.getAttribute('tp')).showTvm
                } else {
                    isShow = this.#isShow(e)
                    isLastWordShow = isShow
                }
                if (e.classList.contains('seKey')) isShow = isLastWordShow = true
            }
            if (!isShow) e.classList.add(mode == 'filter' && this.hideMethod == 'dim' ? 'sn-dim' : 'sn-hidden')
        }
    }
    /** 設定改變時，重新套用在畫面上所有經文 */
    applyAll() {
        $('#snFilterBtn').toggleClass('active', this.mode == 'filter')
        for (const sel of SnFilter.SCOPES) {
            $(sel).each((i, e) => this.apply(e, { offShowsAll: sel == '.search-dlg' }))
        }
    }

    /** @param {Element} e 不是時態碼的 .sn */
    #isShow(e) {
        const sn = e.getAttribute('sn') ?? ''
        const cfg = this.cfgOf(e.getAttribute('tp'))
        if (!cfg.includeCurly && isCurly(e)) return false
        return cfg.sns.includes(normalizeSn(sn))
    }

    save() {
        const jo = { isOn: this.isOn, hideMethod: this.hideMethod, nt: this.nt, ot: this.ot }
        try { localStorage.setItem(SnFilter.#KEY, JSON.stringify(jo)) } catch { }
    }
    #load() {
        let jo = null
        try { jo = JSON.parse(localStorage.getItem(SnFilter.#KEY) ?? 'null') } catch { }
        if (jo == null) return
        this.isOn = jo.isOn == true
        this.hideMethod = jo.hideMethod == 'dim' ? 'dim' : 'hide'
        for (const k of ['nt', 'ot']) {
            const a = jo[k] ?? {}
            this[k] = {
                sns: Array.isArray(a.sns) ? a.sns.map(normalizeSn).filter(s => s != '') : [],
                includeCurly: a.includeCurly != false,
                showTvm: a.showTvm != false,
            }
        }
    }
}

/**
 * `G01063` `<1063>` `8521A` → `1063` `8521a`
 * @param {string} sn
 */
export function normalizeSn(sn) {
    const m = /(\d+)([aA]?)/.exec(String(sn))
    if (m == null) return ''
    return `${parseInt(m[1])}${m[2].toLowerCase()}`
}

/**
 * 使用者輸入的 SN 清單，例 `1063 G1161, H3068 <3588>`
 * 沒寫 G H 的，歸 defaultTp
 * @param {string} str
 * @param {'G'|'H'} defaultTp
 * @returns {{tp: 'G'|'H', sn: string}[]}
 */
export function parseSnList(str, defaultTp) {
    const re = []
    for (const m of String(str).matchAll(/([GH]?)0*(\d+)([aA]?)/gi)) {
        const tp = m[1] == '' ? defaultTp : /** @type {'G'|'H'} */ (m[1].toUpperCase())
        re.push({ tp, sn: normalizeSn(m[2] + m[3]) })
    }
    return re
}

/** 時態碼 (WTG WTH)，顯示為 (5656) @param {Element} e */
function isTvm(e) {
    const tp2 = e.getAttribute('tp2')
    if (tp2 != null) return /T/i.test(tp2)
    return /^\{?\(/.test(e.textContent ?? '') // 沒有 tp2 屬性的舊路徑，看顯示文字
}
/** WAH09002 之類的標記，不是字 @param {Element} e */
function isMarker(e) {
    return /^WA/i.test(e.getAttribute('tp2') ?? '') || parseInt(e.getAttribute('sn') ?? '') >= 9000
}
/** 未譯出 { } @param {Element} e */
function isCurly(e) {
    return e.classList.contains('isCurly') || (e.textContent ?? '').startsWith('{')
}
