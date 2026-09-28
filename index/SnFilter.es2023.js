import { TPPageState } from "./TPPageState.es2023.js";
import { Sn_pos_json } from "./Sn_pos_json.es2023.js";
import { Sn_cnt_chap_unv_json } from "./Sn_cnt_chap_unv_json.es2023.js";
import { Sn_morph_nt_json, Sn_morph_ot_json } from "./Sn_morph_json.es2023.js";
import { fetchJsonAsync } from "./fetchAsync.es2023.js";

/**
 * SN 篩選顯示：SN 開啟時，只顯示指定的 SN。見 docs/z260928e
 *
 * 所有 SN 本來就在 DOM 中 (.sn)，這裡只決定每個 .sn 要不要加 .sn-hidden (或 .sn-dim)
 * - 模式: ps.strong == 0 → 關；isOn → 篩選；否則全部
 * - 顯示：排除清單優先；否則在 SN 清單、符合任一預設組合 (字典詞性，sn_pos.json.gz)、本章主導詞、或動詞形態
 * - 動詞形態 (sn_morph_*.json.gz)：以「同一節、同一個 SN」對應；原文譯本用第幾次出現對第幾個；
 *   和合本 / KJV 另有逐字的時態碼 (5723)，用 tvm_table.json 換成形態代碼，與同節對應取交集
 *   節的位址：主經文 .lec[book][chap][sec]、其它 [data-vaddr="book.chap.sec"]，或 apply 的 opt.addr
 * - 時態碼 (5656) 跟著它前面的字
 *
 * @typedef {Object} DSnFilterOfTestament
 * @property {string[]} sns 指定的 SN
 * @property {string[]} exclude 排除的 SN (優先於其它規則)
 * @property {string[]} presets 預設組合 id，見 SN_PRESETS
 * @property {number} leitwort 本章主導詞：本章出現 ≥ 此次數的實詞；0 = 不用
 * @property {Object<string,string[]>} morph 動詞形態，組 id → 選項 id (見 MORPH_GROUPS)；同組任一、不同組都要符合
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

/**
 * 動詞形態的組與選項。codes 是 sn_morph 代碼中該位置的值
 * 新約代碼 3 碼：時態 語態 語氣；舊約代碼「詞幹:形式」
 * @type {{G: {id: string, name: string, at: number, opts: {id: string, name: string, codes: string[], tip?: string}[]}[], H: {id: string, name: string, at: number, opts: {id: string, name: string, codes: string[], tip?: string}[]}[]}}
 */
export const MORPH_GROUPS = {
    G: [
        {
            id: 'mood', name: '語氣', at: 2, opts: [
                { id: 'fin', name: '限定動詞', codes: ['i', 's', 'o', 'd'], tip: '直說、假設、祈願、命令 (不是分詞、不定詞)' },
                { id: 'i', name: '直說', codes: ['i'] }, { id: 's', name: '假設', codes: ['s'] }, { id: 'o', name: '祈願', codes: ['o'] },
                { id: 'd', name: '命令', codes: ['d'] }, { id: 'n', name: '不定詞', codes: ['n'] }, { id: 'p', name: '分詞', codes: ['p'] },
            ]
        },
        {
            id: 'tense', name: '時態', at: 0, opts: [
                { id: 'p', name: '現在', codes: ['p'] }, { id: 'i', name: '未完成', codes: ['i'] }, { id: 'f', name: '未來', codes: ['f'] },
                { id: 'a', name: '簡單過去', codes: ['a'] }, { id: 'x', name: '完成', codes: ['x'] }, { id: 'y', name: '過去完成', codes: ['y'] },
            ]
        },
        {
            id: 'voice', name: '語態', at: 1, opts: [
                { id: 'a', name: '主動', codes: ['a'] }, { id: 'm', name: '中間', codes: ['m'], tip: '含中間異態' },
                { id: 'p', name: '被動', codes: ['p'], tip: '含被動異態' },
            ]
        },
    ],
    H: [
        {
            id: 'form', name: '形式', at: 1, opts: [
                { id: 'wy', name: '敘述式', codes: ['wy'], tip: 'wayyiqtol，敘事的主線' },
                { id: 'pf', name: '完成式', codes: ['pf'] }, { id: 'impf', name: '未完成式', codes: ['impf'] },
                { id: 'wq', name: '連續式', codes: ['wq'], tip: 'weqatal，律法、預言、程序' },
                { id: 'vol', name: '意志式', codes: ['imv', 'jus', 'coh'], tip: '祈使式、祈願式、鼓勵式' },
                { id: 'imv', name: '祈使式', codes: ['imv'] }, { id: 'jus', name: '祈願式', codes: ['jus'] }, { id: 'coh', name: '鼓勵式', codes: ['coh'] },
                { id: 'infc', name: '不定詞附屬形', codes: ['infc'] }, { id: 'infa', name: '不定詞獨立形', codes: ['infa'], tip: '常用來加強語氣' },
                { id: 'ptc', name: '分詞', codes: ['ptc', 'ptcp'] },
            ]
        },
        {
            id: 'stem', name: '詞幹', at: 0, opts: [
                { id: 'q', name: 'Qal', codes: ['q'] }, { id: 'N', name: 'Nif‘al', codes: ['N'], tip: '被動、反身' },
                { id: 'p', name: 'Pi‘el', codes: ['p'], tip: '加強' }, { id: 'P', name: 'Pu‘al', codes: ['P'], tip: 'Pi‘el 的被動' },
                { id: 'h', name: 'Hif‘il', codes: ['h'], tip: '使役' }, { id: 'H', name: 'Hof‘al', codes: ['H'], tip: 'Hif‘il 的被動' },
                { id: 't', name: 'Hitpa‘el', codes: ['t'], tip: '反身、相互' }, { id: 'o', name: '其它', codes: ['o'], tip: 'Polel 等，及亞蘭文 Peal、Haphel 等' },
            ]
        },
    ],
}

/**
 * 讀經組合：一個組合 = 一個要問經文的問題，套用時整組取代新約、舊約的細項設定 (未列的用 newCfg 的預設)。
 * 說明在 docs/SN讀經組合說明.md 的「## 名稱 (id)」一節。only：只對新約 G 或舊約 H 有意義 (另一約不顯示 SN)
 * @typedef {{presets?: string[], morph?: Object<string,string[]>, leitwort?: number, showTvm?: boolean}} DLensPart
 * @type {{id: string, name: string, nt?: DLensPart, ot?: DLensPart, only?: 'G'|'H'}[]}
 */
export const SN_LENSES = [
    { id: 'conj', name: '連接詞', nt: { presets: ['c'] }, ot: { presets: ['c'] } },
    { id: 'main', name: '主要動詞', nt: { morph: { mood: ['fin'] } }, ot: { morph: { form: ['wy', 'pf', 'impf', 'wq', 'vol'] } } },
    { id: 'nonfin', name: '分詞、不定詞', nt: { morph: { mood: ['n', 'p'] } }, ot: { morph: { form: ['infc', 'infa', 'ptc'] } } },
    { id: 'will', name: '命令與意願', nt: { morph: { mood: ['d', 'o'] } }, ot: { morph: { form: ['vol'] } } },
    { id: 'narr', name: '敘事主線', ot: { morph: { form: ['wy'] } }, only: 'H' },
    { id: 'perf', name: '完成時態', nt: { morph: { tense: ['x', 'y'] } }, only: 'G' },
    { id: 'god', name: '神的名號', nt: { presets: ['god'] }, ot: { presets: ['god'] } },
    { id: 'leit', name: '本章主導詞', nt: { leitwort: 3 }, ot: { leitwort: 3 } },
    { id: 'content', name: '實詞', nt: { presets: ['content'] }, ot: { presets: ['content'] } },
]

/**
 * @typedef {{addr: string|null, ver: string|null, total: Map<string, number>, nth: Map<Element, number>, tvm: Map<Element, string>}} DVerseOfSn
 * 一節 (一個譯本) 中的 SN：位址、譯本、各 SN 共出現幾次、每個 .sn 是這節中第幾次出現 (0 起算)、字後面的時態碼
 */
/**
 * 依節分組：節的標記是 .lec[book][chap][sec] 或 [data-vaddr]；時態碼、標記不算
 * @param {Element[]} els 依文件順序
 * @param {{addr?: string, ver?: string}} opt 第一個標記之前的節
 * @returns {Map<Element, DVerseOfSn>}
 */
function groupByVerse(els, opt) {
    const re = new Map()
    /** @type {DVerseOfSn} */
    let verse = { addr: opt.addr ?? null, ver: opt.ver ?? null, total: new Map(), nth: new Map(), tvm: new Map() }
    let lastWord = null
    for (const e of els) {
        if (!e.classList.contains('sn')) {
            const addr = e.hasAttribute('data-vaddr') ? e.getAttribute('data-vaddr') : `${e.getAttribute('book')}.${e.getAttribute('chap')}.${e.getAttribute('sec')}`
            verse = { addr, ver: e.getAttribute('ver') ?? e.getAttribute('data-ver') ?? verse.ver, total: new Map(), nth: new Map(), tvm: new Map() }
            lastWord = null
            continue
        }
        re.set(e, verse)
        if (isTvm(e)) {
            if (lastWord != null) verse.tvm.set(lastWord, normalizeSn(e.getAttribute('sn') ?? ''))
            lastWord = null
            continue
        }
        lastWord = null
        if (isMarker(e)) continue
        lastWord = e
        const k = (e.getAttribute('tp') == 'H' ? 'H' : 'G') + normalizeSn(e.getAttribute('sn') ?? '')
        const n = verse.total.get(k) ?? 0
        verse.nth.set(e, n)
        verse.total.set(k, n + 1)
    }
    return re
}

/** 此約有沒有勾動詞形態 @param {DSnFilterOfTestament} cfg */
function isMorphOn(cfg) { return Object.values(cfg.morph).some(a => a.length > 0) }
/** 代碼拆成各組的值 @param {'G'|'H'} tp @param {string} code */
function splitMorph(tp, code) { return tp == 'H' ? code.split(':') : [...code] }

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
    /** @type {{name: string, nt: DSnFilterOfTestament, ot: DSnFilterOfTestament}[]} 使用者存的組合 */
    custom = []

    /** 會有經文 SN 的地方；註釋中的 SN 是作者寫的內容，不篩 */
    static SCOPES = ['#fhlLecture', '.search-dlg', '.sn-filter-scope']
    static #KEY = 'snFilter'
    /** @type {Promise<void>|null} 詞性表、章數統計載入中 */
    #loading = null
    /** @type {{G: Object<string,string>, H: Object<string,string>}|null} 時態碼 → 形態代碼 (以空白分隔)，npm run gen:tvm */
    #tvmTable = null

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
     * @param {{offShowsAll?: boolean, addr?: string, ver?: string}} [opt]
     *   offShowsAll: 搜尋結果，SN 關閉時仍顯示 (搜 SN 時會強制帶 SN)
     *   addr "book.chap.sec"、ver 譯本：root 還沒放進 .lec 時 (主經文逐節產生時) 由呼叫端給
     */
    apply(root, opt = {}) {
        const mode = this.mode == 'off' && opt.offShowsAll ? 'all' : this.mode
        if (mode == 'filter') this.#ensureDataThenApplyAll()
        const els = $(root).find('.sn, .lec[book], [data-vaddr]').toArray()
        const verseOf = mode == 'filter' ? groupByVerse(els, opt) : null
        let isLastWordShow = false
        for (const e of els) {
            if (!e.classList.contains('sn')) continue
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
                    isShow = this.#isShow(e, verseOf.get(e))
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

    /**
     * @param {Element} e 不是時態碼的 .sn
     * @param {DVerseOfSn} verse 所在的節
     */
    #isShow(e, verse) {
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
        if (isMorphOn(cfg) && this.#isMorphMatch(e, tp, sn, verse, verse.nth.get(e) ?? 0, cfg)) return true
        return false
    }
    /**
     * 這個字的動詞形態是否符合：每個有勾的組都要符合
     * 原文譯本 (fhlwh bhs) 是逐字對應，第 nth 次出現的 SN 對第 nth 個；
     * 其它 (和合本)：此節這個 SN 出現次數與原文相同時，也依順序對應 (翻譯大致保留語序，例 創1:5 兩個「稱」，一個敘述式一個完成式)，不同時任一個符合就算
     * @param {DVerseOfSn} verse
     */
    #isMorphMatch(e, tp, sn, verse, nth, cfg) {
        if (verse.addr == null) return false
        const data = (tp == 'H' ? Sn_morph_ot_json : Sn_morph_nt_json).s.filecontent?.data
        const all = (data?.[verse.addr] ?? '').split(' ').filter(a => a.startsWith(sn + ':')).map(a => a.slice(sn.length + 1))
        if (all.length == 0) return false
        const isOrig = ['fhlwh', 'bhs'].includes(verse.ver ?? '')
        const isSameCnt = verse.total.get(tp + sn) == all.length
        let codes = (isOrig || isSameCnt) && nth < all.length ? [all[nth]] : all
        // 和合本的時態碼是逐字的：新約幾乎一對一；舊約不分敘述式/未完成式、連續式/完成式，所以取交集
        const tvm = verse.tvm.get(e)
        const byTvm = tvm == null ? null : this.#tvmTable?.[tp]?.[tvm]?.split(' ')
        if (byTvm != null) {
            const both = codes.filter(c => byTvm.includes(c))
            codes = both.length > 0 ? both : byTvm
        }
        const groups = MORPH_GROUPS[tp].filter(g => (cfg.morph[g.id] ?? []).length > 0)
        return codes.some(code => {
            const parts = splitMorph(tp, code)
            return groups.every(g => cfg.morph[g.id].some(id => g.opts.find(o => o.id == id)?.codes.includes(parts[g.at])))
        })
    }
    /** 此 SN 在正在讀的這一章 (和合本) 出現的次數 */
    #cntInChap(tp, sn) {
        const ps = TPPageState.s
        return Sn_cnt_chap_unv_json.s.filecontent?.[tp]?.[sn]?.[ps.bookIndex]?.[ps.chap] ?? 0
    }
    /** 用到預設組合、主導詞、動詞形態時，載入需要的資料，載好再套用一次 */
    #ensureDataThenApplyAll() {
        if (this.#loading != null) return
        /** @type {import('./BaseJson.es2023.js').BaseJson[]} */
        const need = []
        if ([this.nt, this.ot].some(c => c.presets.length > 0 || c.leitwort > 0)) need.push(Sn_pos_json.s)
        if ([this.nt, this.ot].some(c => c.leitwort > 0)) need.push(Sn_cnt_chap_unv_json.s)
        if (isMorphOn(this.nt)) need.push(Sn_morph_nt_json.s)
        if (isMorphOn(this.ot)) need.push(Sn_morph_ot_json.s)
        const toLoad = need.filter(a => a._filecontent == null)
        const isNeedTvm = (isMorphOn(this.nt) || isMorphOn(this.ot)) && this.#tvmTable == null
        if (toLoad.length == 0 && !isNeedTvm) return
        const loadTvm = async () => {
            try { this.#tvmTable = (await fetchJsonAsync('./index/tvm_table.json')).table } catch (e) { console.error(e) }
        }
        this.#loading = Promise.all([...toLoad.map(a => a.loadAsync()), isNeedTvm ? loadTvm() : null])
            .then(() => this.applyAll())
            .finally(() => { this.#loading = null })
    }

    /**
     * 讀經組合或使用者組合，換成完整的新約、舊約設定
     * @param {string} id SN_LENSES 的 id，或 'u' + custom 的 index
     * @returns {{nt: DSnFilterOfTestament, ot: DSnFilterOfTestament}|null}
     */
    lensCfgs(id) {
        if (id.startsWith('u')) {
            const c = this.custom[parseInt(id.slice(1))]
            return c == null ? null : { nt: structuredClone(c.nt), ot: structuredClone(c.ot) }
        }
        const lens = SN_LENSES.find(a => a.id == id)
        if (lens == null) return null
        /** @param {'G'|'H'} tp @param {DLensPart} part */
        const full = (tp, part) => ({ ...newCfg(), ...structuredClone(part ?? {}), morph: cleanMorph(tp, part?.morph) })
        return { nt: full('G', lens.nt), ot: full('H', lens.ot) }
    }
    /** 套用組合 (篩選開啟；ps.strong 由呼叫端處理) @param {string} id */
    useLens(id) {
        const cfgs = this.lensCfgs(id)
        if (cfgs == null) return
        this.nt = cfgs.nt
        this.ot = cfgs.ot
        this.isOn = true
        this.save()
    }
    /** 目前的設定與哪個組合相同 @returns {string|null} id (同 lensCfgs) */
    get activeLensId() {
        const cur = cfgKey(this.nt) + cfgKey(this.ot)
        const ids = [...this.custom.map((a, i) => 'u' + i), ...SN_LENSES.map(a => a.id)] // 與內建相同時，亮我的組合
        return ids.find(id => { const c = this.lensCfgs(id); return cfgKey(c.nt) + cfgKey(c.ot) == cur }) ?? null
    }
    /** 把目前的設定存成組合；同名的覆蓋 @param {string} name */
    saveCustom(name) {
        const c = { name, nt: structuredClone(this.nt), ot: structuredClone(this.ot) }
        const i = this.custom.findIndex(a => a.name == name)
        if (i == -1) this.custom.push(c); else this.custom[i] = c
        this.save()
    }
    /** @param {number} idx */
    removeCustom(idx) {
        this.custom.splice(idx, 1)
        this.save()
    }

    save() {
        const jo = { isOn: this.isOn, hideMethod: this.hideMethod, nt: this.nt, ot: this.ot, custom: this.custom }
        try { localStorage.setItem(SnFilter.#KEY, JSON.stringify(jo)) } catch { }
    }
    #load() {
        let jo = null
        try { jo = JSON.parse(localStorage.getItem(SnFilter.#KEY) ?? 'null') } catch { }
        if (jo == null) return
        this.isOn = jo.isOn == true
        this.hideMethod = jo.hideMethod == 'dim' ? 'dim' : 'hide'
        this.nt = cleanCfg('G', jo.nt)
        this.ot = cleanCfg('H', jo.ot)
        this.custom = (Array.isArray(jo.custom) ? jo.custom : [])
            .filter(a => typeof a?.name == 'string' && a.name != '')
            .map(a => ({ name: a.name, nt: cleanCfg('G', a.nt), ot: cleanCfg('H', a.ot) }))
    }
}

/** @returns {DSnFilterOfTestament} */
function newCfg() {
    return { sns: [], exclude: [], presets: [], leitwort: 0, morph: {}, includeCurly: true, showTvm: true }
}
/** localStorage 讀回的一約設定 @param {'G'|'H'} tp @returns {DSnFilterOfTestament} */
function cleanCfg(tp, a) {
    a = a ?? {}
    const cleanSns = x => Array.isArray(x) ? x.map(normalizeSn).filter(s => s != '') : []
    return {
        sns: cleanSns(a.sns),
        exclude: cleanSns(a.exclude),
        presets: Array.isArray(a.presets) ? a.presets.filter(id => PRESET_MAP.has(id)) : [],
        leitwort: Number.isInteger(a.leitwort) && a.leitwort > 0 ? a.leitwort : 0,
        morph: cleanMorph(tp, a.morph),
        includeCurly: a.includeCurly != false,
        showTvm: a.showTvm != false,
    }
}
/** 比較兩個設定是否相同用 (清單不計順序) @param {DSnFilterOfTestament} c */
export function cfgKey(c) {
    const sorted = a => [...a].sort()
    const morph = Object.keys(c.morph).sort().filter(k => c.morph[k].length > 0).map(k => `${k}=${sorted(c.morph[k])}`)
    return JSON.stringify([sorted(c.sns), sorted(c.exclude), sorted(c.presets), c.leitwort, morph, c.includeCurly, c.showTvm])
}
/** localStorage 讀回的 morph，只留認得的組與選項 @param {'G'|'H'} tp */
function cleanMorph(tp, morph) {
    const re = {}
    for (const g of MORPH_GROUPS[tp]) {
        const a = morph?.[g.id]
        re[g.id] = Array.isArray(a) ? a.filter(id => g.opts.some(o => o.id == id)) : []
    }
    return re
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

/**
 * 讀經組合說明 md (docs/SN讀經組合說明.md) 依「## 名稱 (id)」分節
 * @param {string} text
 * @returns {{id: string, name: string, body: string}[]}
 */
export function splitHelpSections(text) {
    const re = []
    for (const part of text.split(/^(?=## )/m)) {
        const m = /^## (.+?)\s*\((\w+)\)\s*$/m.exec(part.split('\n')[0])
        if (m == null) continue
        re.push({ id: m[2], name: m[1], body: part.slice(part.indexOf('\n') + 1) })
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
