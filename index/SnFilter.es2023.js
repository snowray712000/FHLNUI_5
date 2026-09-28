import { TPPageState } from "./TPPageState.es2023.js";
import { Sn_pos_json } from "./Sn_pos_json.es2023.js";
import { Sn_cnt_chap_unv_json } from "./Sn_cnt_chap_unv_json.es2023.js";

/**
 * SN 篩選顯示：SN 開啟時，只顯示指定的 SN。見 docs/z260928e
 *
 * 所有 SN 本來就在 DOM 中 (.sn)，這裡只決定每個 .sn 要不要加 .sn-hidden (或 .sn-dim)
 * - 模式: ps.strong == 0 → 關；isOn → 篩選；否則全部
 * - 顯示：排除清單優先；否則在 SN 清單、符合任一預設組合 (字典詞性，sn_pos.json.gz)、或是本章主導詞
 * - 時態碼 (5656) 跟著它前面的字
 *
 * @typedef {Object} DSnFilterOfTestament
 * @property {string[]} sns 指定的 SN
 * @property {string[]} exclude 排除的 SN (優先於其它規則)
 * @property {string[]} presets 預設組合 id，見 SN_PRESETS
 * @property {number} leitwort 本章主導詞：本章出現 ≥ 此次數的實詞；0 = 不用
 * @property {boolean} includeCurly 含未譯出的 {<…>}
 * @property {boolean} showTvm 顯示動詞時態碼
 */

/** 實詞 (本章主導詞只看這些) */
const CONTENT_POS = ['n', 'pn', 'v', 'a']

/**
 * 預設組合。pos 是 sn_pos 的詞性代碼 (符合任一)；sns 是另外列的 SN；only 只用於新約 G 或舊約 H
 * @type {{id: string, name: string, pos?: string[], sns?: {G?: string[], H?: string[]}, only?: 'G'|'H', tip?: string}[]}
 */
export const SN_PRESETS = [
    { id: 'content', name: '實詞', pos: CONTENT_POS, tip: '名詞、專有名詞、動詞、形容詞' },
    { id: 'v', name: '動詞', pos: ['v'] },
    { id: 'n', name: '名詞', pos: ['n'] },
    { id: 'pn', name: '專有名詞', pos: ['pn'], tip: '人名、地名' },
    { id: 'a', name: '形容詞', pos: ['a', 'num'] },
    { id: 'c', name: '連接詞', pos: ['c', 't'], tip: '連接詞與質詞，例 δέ γάρ οὖν ἀλλά ἵνα ὅτι；舊約的 ו 是字首，沒有自己的 SN' },
    { id: 'pron', name: '代名詞', pos: ['pron', 'rel'], tip: '含關係代名詞、指示詞、疑問詞' },
    { id: 'p', name: '介系詞', pos: ['p'] },
    { id: 'd', name: '副詞', pos: ['d'] },
    { id: 'neg', name: '否定', pos: ['neg'] },
    { id: 'art', name: '冠詞', pos: ['art'], only: 'G' },
    { id: 'obj', name: '受詞記號', pos: ['obj'], only: 'H', tip: 'אֵת (853)' },
    {
        id: 'god', name: '神的名字', tip: '新約：神 主 耶穌 基督 靈 父；舊約：耶和華 神 主 伊勒 雅 以羅阿 全能者',
        sns: { G: ['2316', '2962', '2424', '5547', '4151', '3962'], H: ['3068', '3069', '430', '136', '410', '3050', '433', '7706'] },
    },
]
const PRESET_MAP = new Map(SN_PRESETS.map(p => [p.id, p]))

export class SnFilter {
    static #s = null
    /** @returns {SnFilter} */
    static get s() { if (this.#s == null) this.#s = new SnFilter(); return this.#s }

    /** 篩選開啟 (ps.strong == 1 時才有作用) */
    isOn = false
    /** @type {'hide'|'dim'} 不符合的 SN 隱藏或變淡 */
    hideMethod = 'hide'
    /** @type {DSnFilterOfTestament} 新約 (希臘文 G，含七十士譯本) */
    nt = newCfg()
    /** @type {DSnFilterOfTestament} 舊約 (希伯來文 H) */
    ot = newCfg()

    /** 會有經文 SN 的地方；註釋中的 SN 是作者寫的內容，不篩 */
    static SCOPES = ['#fhlLecture', '.search-dlg', '.sn-filter-scope']
    static #KEY = 'snFilter'
    /** @type {Promise<void>|null} 詞性表、章數統計載入中 */
    #loading = null

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
     * 字典形的詞性；詞性表還沒載入時是 []
     * @param {'G'|'H'|string} tp @param {string} sn
     * @returns {string[]}
     */
    posOf(tp, sn) {
        const s = Sn_pos_json.s.filecontent?.pos?.[String(tp).toUpperCase() == 'H' ? 'H' : 'G']?.[normalizeSn(sn)]
        return s == null || s == '' ? [] : s.split('|')
    }

    /**
     * @param {JQuery<HTMLElement>|Element|Document} root
     * @param {{offShowsAll?: boolean}} [opt] offShowsAll: 搜尋結果，SN 關閉時仍顯示 (搜 SN 時會強制帶 SN)
     */
    apply(root, opt = {}) {
        const mode = this.mode == 'off' && opt.offShowsAll ? 'all' : this.mode
        if (mode == 'filter') this.#ensureDataThenApplyAll()
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
        const tp = e.getAttribute('tp') == 'H' ? 'H' : 'G'
        const sn = normalizeSn(e.getAttribute('sn') ?? '')
        const cfg = this.cfgOf(tp)
        if (cfg.exclude.includes(sn)) return false
        if (!cfg.includeCurly && isCurly(e)) return false
        if (cfg.sns.includes(sn)) return true

        const pos = this.posOf(tp, sn)
        for (const id of cfg.presets) {
            const p = PRESET_MAP.get(id)
            if (p == null || (p.only != null && p.only != tp)) continue
            if (p.pos?.some(a => pos.includes(a))) return true
            if (p.sns?.[tp]?.includes(sn)) return true
        }
        if (cfg.leitwort > 0 && CONTENT_POS.some(a => pos.includes(a)) && this.#cntInChap(tp, sn) >= cfg.leitwort) return true
        return false
    }
    /** 此 SN 在正在讀的這一章 (和合本) 出現的次數 */
    #cntInChap(tp, sn) {
        const ps = TPPageState.s
        return Sn_cnt_chap_unv_json.s.filecontent?.[tp]?.[sn]?.[ps.bookIndex]?.[ps.chap] ?? 0
    }
    /** 用到預設組合或主導詞時，載入詞性表與章數統計，載好再套用一次 */
    #ensureDataThenApplyAll() {
        const isNeed = [this.nt, this.ot].some(c => c.presets.length > 0 || c.leitwort > 0)
        if (!isNeed || this.#loading != null) return
        const isNeedCnt = [this.nt, this.ot].some(c => c.leitwort > 0)
        const isLoaded = Sn_pos_json.s.filecontent != null && (!isNeedCnt || Sn_cnt_chap_unv_json.s.filecontent != null)
        if (isLoaded) return
        this.#loading = Promise.all([Sn_pos_json.s.loadAsync(), isNeedCnt ? Sn_cnt_chap_unv_json.s.loadAsync() : null])
            .then(() => this.applyAll())
            .finally(() => { this.#loading = null })
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
        const cleanSns = a => Array.isArray(a) ? a.map(normalizeSn).filter(s => s != '') : []
        for (const k of ['nt', 'ot']) {
            const a = jo[k] ?? {}
            this[k] = {
                sns: cleanSns(a.sns),
                exclude: cleanSns(a.exclude),
                presets: Array.isArray(a.presets) ? a.presets.filter(id => PRESET_MAP.has(id)) : [],
                leitwort: Number.isInteger(a.leitwort) && a.leitwort > 0 ? a.leitwort : 0,
                includeCurly: a.includeCurly != false,
                showTvm: a.showTvm != false,
            }
        }
    }
}

/** @returns {DSnFilterOfTestament} */
function newCfg() {
    return { sns: [], exclude: [], presets: [], leitwort: 0, includeCurly: true, showTvm: true }
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
