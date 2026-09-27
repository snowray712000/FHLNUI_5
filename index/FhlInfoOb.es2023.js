import { TPPageState } from './TPPageState.es2023.js'

const OB_YEAR_SELS = [
    { t: "全部", y: "0-9999" },
    { t: "19世紀早期", y: "1800-1833" },
    { t: "19世紀中期", y: "1834-1866" },
    { t: "19世紀晚期", y: "1867-1899" },
    { t: "20世紀上半", y: "1900-1950" },
    { t: "20世紀下半", y: "1951-2000" },
]
const OB_YEAR_SELS_GB = [
    { t: "全部", y: "0-9999" },
    { t: "19世纪早期", y: "1800-1833" },
    { t: "19世纪中期", y: "1834-1866" },
    { t: "19世纪晚期", y: "1867-1899" },
    { t: "20世纪上半", y: "1900-1950" },
    { t: "20世纪下半", y: "1951-2000" },
]
const OB_STYLE_SELS = [
    { t: "全部" }, { t: "白話（官話）" }, { t: "深文理" }, { t: "淺文理" },
    { t: "少數民族及各地方言" }, { t: "外文" }, { t: "雙語" },
]
const OB_STYLE_SELS_GB = [
    { t: "全部" }, { t: "白话（官话）" }, { t: "深文理" }, { t: "浅文理" },
    { t: "少数民族及各地方言" }, { t: "外文" }, { t: "双语" },
]
// 清單篩選/呈現;設計取自 FHLNUI_6/src/ob/demo/ui-pv-catalog-browse.ts
const OB_NO_DIV = "__none__" // ob.php 的 div 可能是空字串(未分類)
const OB_LANG_CHIP_MAX = 10 // 語言有數十種,只列本章最常見的幾個當 chip,其餘靠文字框
const OB_LIST_MODE_KEY = "fhlObListMode"
const OB_FILTERS_OPEN_KEY = "fhlObFiltersOpen"

// 局部縮放圖片檢視器的縮放範圍,以及顯示寬度超過小圖原始寬度多少倍才自動換上原圖。
// 取自 FHLNUI_6/src/ob/demo/ui-pv-image-zoom.ts 的雛型設計。
const OB_VIEWER_MIN_SCALE = 1
const OB_VIEWER_MAX_SCALE = 6
const OB_VIEWER_SWAP_THRESHOLD_FACTOR = 1.15

// re_record.vid==0 表示封面,chap/sec 屬性不值得參考,回傳空字串(比照原 obphp.js content.render 行為)
export function formatObPageRange(rec, isgb) {
    if (rec == null || rec.vid == 0) return ""
    let res = ""
    if (rec.bchap != 0) {
        res += rec.bchap.toString() + "章"
        if (rec.bsec != 0)
            res += rec.bsec.toString() + (isgb ? "节" : "節")
        res += "至"
    }
    if (rec.echap != 0) {
        res += rec.echap.toString() + "章"
        if (rec.esec != 0)
            res += rec.esec.toString() + (isgb ? "节" : "節")
    }
    return res
}

// 典藏（信望愛聖經掃描書影）面板分頁。取代原本 static/ob_api/obphp.js 的 React 0.13 實作。
export class FhlInfoOb {
    static #s = null
    /** @returns {FhlInfoOb} */
    static get s() { if (this.#s == null) this.#s = new FhlInfoOb(); return this.#s }

    /** @type {JQuery<HTMLElement>} #fhlInfoContent */
    dom = null
    // 等同原本的 react props,每次 render() 依 ps 重新計算
    props = { ibook: 39, ichap: 1, isec: 1, isgb: false, cy: 640 }
    // 等同原本的 react state;null 代表尚未 mount
    state = null

    // sob.php 系列查詢的請求序號,只增不減。放在 state 之外是因為本 singleton 會跨越
    // 「切到別的分頁再切回來」存活,若歸零可能與舊一輪的過期回應編號撞在一起。
    #reqSeq = 0
    // sob.php book=all(本章有哪些書目)的請求序號,與 #reqSeq 分開,兩種查詢會同時在飛
    #listSeq = 0
    #paintQueued = false

    // ob.php 回傳的是與目前經節無關的全域書目清單,只跟語系(isgb)有關,
    // 進站期間只要抓過一次就可以一直沿用,不必每次切回典藏分頁都重新打。
    #obListCache = new Map()

    // 局部縮放圖片檢視器的執行期狀態(縮放倍率/位移/是否已換原圖等)。不屬於 state/props,
    // 每次全量重繪都會重建 <img> 節點,靠比對 key(=rec.small)決定要沿用還是重置為「符合視窗」。
    #viewer = null
    // 目前檢視器可用的操作(縮小/放大/符合視窗/實際大小),供 registerEvents() 的工具列按鈕呼叫。
    #viewerActions = null
    // 綁在 window 上的 pointermove/up/cancel(見 #initViewer 的說明);每次重新初始化檢視器都要
    // 先移除上一輪的,否則每次全量重繪(換頁)都會在 window 上疊加新的一份,永遠不會釋放。
    #viewerWindowHandlers = null

    render(ps = null, dom = null) {
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = this.dom
        if (dom == null || dom.length === 0) return
        this.dom = dom

        const next = {
            ibook: ps.bookIndex - 1,
            ichap: ps.chap,
            isec: ps.sec,
            isgb: ps.gb ? true : false,
            cy: dom.height()
        }

        if (this.state == null) {
            // 真正的第一次進來(singleton 剛建立,從沒 render 過)才重置為初始狀態。
            this.state = this.#getInitialState()
            this.props = next
            this.#set_obdata_from_ajax()
            this.#paintNow(true)
            return
        }

        // 等同 componentWillReceiveProps;此時 this.props 仍是舊值,故意在查詢「之後」才換新值。
        // 注意:容器目前有沒有 data-ob-root 標記(切到別的分頁再切回來,容器內容會被蓋掉過)
        // 不代表使用者換了經節,不能拿來當作「要重置」的依據 —— 只要地址沒變,切回來就要原樣
        // 還原,包含 content_type、sobdata,以及 #viewer 記著的局部縮放檢視器縮放/位移
        // (#viewer 是獨立於 state 的欄位,本來就不會被這裡動到)。
        const changed = next.ibook !== this.props.ibook || next.ichap !== this.props.ichap
            || next.isec !== this.props.isec || next.isgb !== this.props.isgb
        // 清單是「本章有資料的書目」,換書/換章/換語系就要重查;只換節不影響清單。
        const listChanged = next.ibook !== this.props.ibook || next.ichap !== this.props.ichap
            || next.isgb !== this.props.isgb
        // 分類/語言篩選存的是 API 回傳的字串,繁簡不同(聖經珍藏/圣经珍藏),換語系要清掉
        if (next.isgb !== this.props.isgb)
            Object.assign(this.state, { div_set: "", lang_set: "" })
        if (changed) {
            this.#query_sob_from_ajax_book_chap_sec(next.ibook, next.ichap, next.isec)
        }
        this.props = next
        if (listChanged) this.#set_obdata_from_ajax()
        this.#paintNow(true)
    }

    registerEvents() {
        const d = this.dom
        if (d == null) return
        // 篩選全部在前端做(資料只跟書/章/語系有關),點選類的整頁重繪;
        // 打字類只重繪清單與 chip(#paintListPart),否則輸入框會被換掉、失去焦點。
        d.off('click', '.ob_div_chip').on('click', '.ob_div_chip', ev => {
            const key = $(ev.currentTarget).attr('data-key')
            this.#setState({ div_set: this.state.div_set === key ? "" : key })
        })
        d.off('click', '.ob_lang_chip').on('click', '.ob_lang_chip', ev => {
            const key = $(ev.currentTarget).attr('data-key')
            this.#setState({ lang_set: this.state.lang_set === key ? "" : key })
        })
        d.off('input', '.ob_lang_input').on('input', '.ob_lang_input', ev => {
            this.state.lang_set = ev.currentTarget.value.trim()
            this.#paintListPart()
        })
        d.off('input', '.ob_kw_input').on('input', '.ob_kw_input', ev => {
            this.state.keyword = ev.currentTarget.value.trim()
            this.#paintListPart()
        })
        d.off('change', '.ob_year_select').on('change', '.ob_year_select', ev =>
            this.#setState({ year_set: ev.currentTarget.value }))
        d.off('change', '.ob_style_select').on('change', '.ob_style_select', ev =>
            this.#setState({ style_idx: Number(ev.currentTarget.value) }))
        d.off('click', '.ob_clear_filters').on('click', '.ob_clear_filters', () =>
            this.#setState({ div_set: "", lang_set: "", keyword: "", year_set: "0-9999", style_idx: 0 }))
        d.off('click', '.ob_filters_toggle').on('click', '.ob_filters_toggle', () => {
            const open = !this.state.filters_open
            try { localStorage.setItem(OB_FILTERS_OPEN_KEY, open ? "1" : "0") } catch { }
            this.#setState({ filters_open: open })
        })
        d.off('click', '.ob_listmode button').on('click', '.ob_listmode button', ev => {
            const mode = $(ev.currentTarget).attr('data-mode')
            try { localStorage.setItem(OB_LIST_MODE_KEY, mode) } catch { }
            this.#setState({ list_mode: mode })
        })
        d.off('click', '.ob_more').on('click', '.ob_more', ev => {
            ev.stopPropagation()
            const id = $(ev.currentTarget).attr('data-id')
            this.#setState({ expanded_id: this.state.expanded_id === id ? null : id })
        })
        d.off('click', '[data-read-id]').on('click', '[data-read-id]', ev => {
            this.#set_book_id($(ev.currentTarget).attr('data-read-id'))
            this.#set_content_type("read")
        })
        d.off('click', '.read_button').on('click', '.read_button', ev => {
            const act = $(ev.currentTarget).attr('data-act')
            if (act === 'menu') { this.#set_content_type("list"); return }
            if (act === 'firstpage') { this.#set_read_page(1); return }
            if (act === 'origlink') return // 讓 <a target=_blank> 走預設行為(開新分頁看原圖)
            if (act === 'zoomin') { this.#viewerActions?.zoomIn(); return }
            if (act === 'zoomout') { this.#viewerActions?.zoomOut(); return }
            if (act === 'fit') { this.#viewerActions?.fit(); return }
            if (act === 'actualsize') { this.#viewerActions?.actualSize(); return }
            const r = this.state.sobdata?.[0]
            if (r == null) return
            this.#set_read_page(act === 'prev' ? r.prev : r.next)
        })
    }

    #getInitialState() {
        return {
            obdata: [], // 本章有資料的書目(未篩選);篩選在 #filtered() 即時算
            obListLoaded: false,
            err_msg: "",
            div_set: "", // "" 全部 | OB_NO_DIV 未分類 | 分類名
            lang_set: "", // 子字串比對,chip 與文字框共用
            keyword: "", // 書名/作者 子字串
            year_set: "0-9999",
            style_idx: 0, // OB_STYLE_SELS 的索引,0 = 全部;存索引才不受繁簡影響
            list_mode: this.#loadListMode(), // table | card
            filters_open: this.#loadFiltersOpen(), // 篩選區展開/收合
            expanded_id: null, // 卡片「看更多」展開的書目 id
            content_type: "list", // list | read
            idxbook: 257, // 香港聖經公會 新舊約全書 1959
            page: -1,
            sobdata: [],
            sobLoading: false, // sob.php 查詢進行中;避免查詢完成前誤判為「無對應內容」
        }
    }

    #hasRootMarker() {
        return this.dom != null && this.dom.length > 0 && this.dom.children('[data-ob-root]').length > 0
    }

    #setState(patch) {
        Object.assign(this.state, patch)
        this.#paintLater()
    }

    #paintLater() {
        if (this.#paintQueued) return
        this.#paintQueued = true
        queueMicrotask(() => {
            this.#paintQueued = false
            this.#paintNow(false)
        })
    }

    // force=false 時,若容器已被別的分頁的 render 蓋掉(data-ob-root 標記不在了),就不要再寫入,
    // 否則會洗掉使用者目前看到的別的分頁內容(React 版因為寫入的是已離開畫面的節點,天然無害)。
    #paintNow(force) {
        if (this.state == null || this.dom == null || this.dom.length === 0) return
        if (!force && !this.#hasRootMarker()) return
        this.dom.html(this.#html())
        this.registerEvents()

        const rec = this.state.content_type === "read" ? this.state.sobdata?.[0] : null
        if (rec != null) {
            this.#initViewer(rec)
        } else {
            this.#teardownViewer()
        }
    }

    // 離開閱讀畫面(回清單/重新 mount)時清掉檢視器狀態,包含綁在 window 上的 pointermove/up/cancel,
    // 否則使用者切走後這些 handler 仍會留著白跑(activePointers 是空的,不會有副作用,但終究是洩漏)。
    #teardownViewer() {
        this.#viewer = null
        this.#viewerActions = null
        if (this.#viewerWindowHandlers != null) {
            const { move, up, cancel } = this.#viewerWindowHandlers
            window.removeEventListener('pointermove', move)
            window.removeEventListener('pointerup', up)
            window.removeEventListener('pointercancel', cancel)
            this.#viewerWindowHandlers = null
        }
    }

    #esc(s) {
        if (s == null) return ""
        return String(s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
    }

    #html() {
        if (this.state.err_msg.length > 0)
            return `<div data-ob-root="1">${this.#esc(this.state.err_msg)}</div>`
        if (this.state.content_type === "list") return this.#html_list()
        if (this.state.content_type === "read") return this.#html_read()
        return `<div data-ob-root="1">not support content_type</div>`
    }

    #loadListMode() {
        try { return localStorage.getItem(OB_LIST_MODE_KEY) === "card" ? "card" : "table" } catch { return "table" }
    }

    // 預設展開,讓第一次用的人看得到有哪些篩選;之後記住使用者的選擇
    #loadFiltersOpen() {
        try { return localStorage.getItem(OB_FILTERS_OPEN_KEY) !== "0" } catch { return true }
    }

    // skip: 算某一組 chip 的計數時,不套用該組自己的篩選(faceted count),
    // 否則選了「英文」之後,其它語言 chip 都會變成 0。
    #passes(r, skip = "") {
        const st = this.state
        const [y1, y2] = st.year_set.split('-', 2)
        // age 是 API 回傳的字串,y1/y2 也是字串;維持字串比較,不要轉數字(見規劃文件說明)
        if (!(r.age >= y1 && r.age <= y2)) return false
        if (st.style_idx > 0) {
            const styleSels = this.props.isgb ? OB_STYLE_SELS_GB : OB_STYLE_SELS
            if (r.style !== styleSels[st.style_idx]?.t) return false
        }
        if (st.keyword.length > 0 && !`${r.title}`.includes(st.keyword) && !`${r.author}`.includes(st.keyword)) return false
        if (skip !== "lang" && st.lang_set.length > 0 && !`${r.lang}`.includes(st.lang_set)) return false
        if (skip !== "div" && st.div_set.length > 0) {
            const div = r.div.length > 0 ? r.div : OB_NO_DIV
            if (div !== st.div_set) return false
        }
        return true
    }

    #filtered() { return this.state.obdata.filter(r => this.#passes(r)) }

    #hasFilter() {
        const st = this.state
        return st.div_set !== "" || st.lang_set !== "" || st.keyword !== "" || st.year_set !== "0-9999" || st.style_idx !== 0
    }

    #chip(cls, key, label, count, active) {
        return `<button type="button" class="ob_chip ${cls}${active ? ' is-active' : ''}" data-key="${this.#esc(key)}"` +
            ` aria-pressed="${active}">${this.#esc(label)}（${count}）</button>`
    }

    #html_div_chips() {
        const isgb = this.props.isgb
        const counts = new Map()
        this.state.obdata.filter(r => this.#passes(r, "div")).forEach(r => {
            const k = r.div.length > 0 ? r.div : OB_NO_DIV
            counts.set(k, (counts.get(k) ?? 0) + 1)
        })
        const total = [...counts.values()].reduce((a, b) => a + b, 0)
        // 分類順序照 ob.php 全書目的出現順序(聖經珍藏、信仰著作…),不隨本章計數跳動
        const all = this.#obListCache.get(isgb) ?? this.state.obdata
        const keys = [...new Set(all.map(r => r.div.length > 0 ? r.div : OB_NO_DIV))]
        keys.sort((a, b) => (a === OB_NO_DIV) - (b === OB_NO_DIV))
        const cur = this.state.div_set
        return this.#chip("ob_div_chip", "", "全部", total, cur === "") +
            keys.filter(k => (counts.get(k) ?? 0) > 0 || k === cur)
                .map(k => this.#chip("ob_div_chip", k, k === OB_NO_DIV ? (isgb ? "未分类" : "未分類") : k, counts.get(k) ?? 0, cur === k))
                .join('')
    }

    // 語言 chip:本章(套用其它篩選後)出現最多的前幾名;目前選的若不在前幾名也補上
    #html_lang_chips() {
        const counts = new Map()
        this.state.obdata.filter(r => this.#passes(r, "lang")).forEach(r => {
            if (r.lang.length === 0) return
            counts.set(r.lang, (counts.get(r.lang) ?? 0) + 1)
        })
        const freq = [...counts.entries()].sort((a, b) => b[1] - a[1])
        const top = freq.slice(0, OB_LANG_CHIP_MAX)
        const cur = this.state.lang_set
        if (cur !== "" && counts.has(cur) && !top.some(([k]) => k === cur)) top.push([cur, counts.get(cur)])
        return top.map(([k, n]) => this.#chip("ob_lang_chip", k, k, n, cur === k)).join('')
    }

    #html_count() {
        const isgb = this.props.isgb
        const n = this.#filtered().length
        const total = this.state.obdata.length
        const clear = this.#hasFilter()
            ? `<button type="button" class="ob_link ob_clear_filters">${isgb ? "清除筛选" : "清除篩選"}</button>` : ""
        return `${isgb ? "本章有资料" : "本章有資料"} ${total} ${isgb ? "笔" : "筆"}${n !== total ? `,符合 ${n}` : ""}${clear}`
    }

    #html_results() {
        const isgb = this.props.isgb
        if (!this.state.obListLoaded) return `<div class="ob_empty">${isgb ? "查询中…" : "查詢中…"}</div>`
        const records = this.#filtered()
        if (records.length === 0) {
            const msg = this.state.obdata.length === 0
                ? (isgb ? "本章没有典藏资料" : "本章沒有典藏資料")
                : (isgb ? "没有符合条件的典藏" : "沒有符合條件的典藏")
            return `<div class="ob_empty">${msg}</div>`
        }
        return this.state.list_mode === "card" ? this.#html_cards(records) : this.#html_table(records)
    }

    #ageText(r) { return `${r.age}${r.agec?.length > 0 ? `(${r.agec})` : ''}` }

    #html_table(records) {
        const isgb = this.props.isgb
        const titles = isgb ? ["年代", "书名", "作者/译者", "语言", ""] : ["年代", "書名", "作者/譯者", "語言", ""]
        const readLabel = isgb ? "阅读" : "閱讀"
        const head = `<thead><tr>${titles.map(t => `<th>${this.#esc(t)}</th>`).join('')}</tr></thead>`
        const rows = records.map(a1 =>
            `<tr class="ob_row" data-read-id="${this.#esc(a1.id)}"><td>${this.#esc(a1.age)}</td>` +
            `<td class="ob_row_title">${this.#esc(a1.title)}</td><td>${this.#esc(a1.author)}</td>` +
            `<td>${this.#esc(a1.lang)}</td><td class="list_item_read">${readLabel}</td></tr>`
        ).join('')
        return `<table class="ob_table">${head}<tbody>${rows}</tbody></table>`
    }

    #html_cards(records) {
        const isgb = this.props.isgb
        const cards = records.map(r => {
            const id = String(r.id)
            const expanded = this.state.expanded_id === id
            const meta = [r.author, r.lang, r.style].filter(s => s != null && s.length > 0).map(s => this.#esc(s)).join(' · ')
            const intro = r.intro?.length > 0 ? r.intro : (isgb ? "(无简介)" : "(無簡介)")
            const detail = expanded
                ? `<div class="ob_card_detail">${this.#esc(r.copyright)}` +
                `${r.provider?.length > 0 ? `<br>${isgb ? "提供单位" : "提供單位"}:${this.#esc(r.provider)}` : ""}` +
                `${r.remark?.length > 0 ? `<br>${this.#esc(r.remark)}` : ""}</div>`
                : ""
            return `<article class="ob_card">` +
                `<div class="ob_card_top"><span class="ob_badge">${this.#esc(r.div.length > 0 ? r.div : (isgb ? "未分类" : "未分類"))}</span>` +
                `<span>${this.#esc(this.#ageText(r))}</span></div>` +
                `<h4 class="ob_card_title" data-read-id="${this.#esc(id)}">${this.#esc(r.title)}</h4>` +
                `<div class="ob_card_meta">${meta}</div>` +
                `<p class="ob_card_intro${expanded ? ' is-expanded' : ''}">${this.#esc(intro)}</p>` +
                detail +
                `<div class="ob_card_actions">` +
                `<button type="button" class="ob_read_btn" data-read-id="${this.#esc(id)}">${isgb ? "阅读" : "閱讀"}</button>` +
                `<button type="button" class="ob_link ob_more" data-id="${this.#esc(id)}">${expanded ? "收合" : "看更多"}</button>` +
                `</div></article>`
        }).join('')
        return `<div class="ob_cards">${cards}</div>`
    }

    // 打字時只換掉 chip、筆數、清單,輸入框本身不動(保留焦點與輸入法組字)
    #paintListPart() {
        if (this.dom == null || !this.#hasRootMarker() || this.state.content_type !== "list") return
        this.dom.find('.ob_div_chips').html(this.#html_div_chips())
        this.dom.find('.ob_lang_chips').html(this.#html_lang_chips())
        this.dom.find('.ob_count').html(this.#html_count())
        this.dom.find('.ob_filters_summary').html(this.#html_filters_summary())
        this.dom.find('.ob_results').html(this.#html_results())
    }

    // 收合時標題列上顯示目前套用的條件,不用展開也知道清單被篩過
    #html_filters_summary() {
        const isgb = this.props.isgb
        const st = this.state
        const parts = []
        if (st.div_set !== "") parts.push(st.div_set === OB_NO_DIV ? (isgb ? "未分类" : "未分類") : st.div_set)
        if (st.lang_set !== "") parts.push(st.lang_set)
        if (st.keyword !== "") parts.push(`「${st.keyword}」`)
        if (st.year_set !== "0-9999") {
            const yearSels = isgb ? OB_YEAR_SELS_GB : OB_YEAR_SELS
            parts.push(yearSels.find(a1 => a1.y === st.year_set)?.t ?? st.year_set)
        }
        if (st.style_idx > 0) parts.push((isgb ? OB_STYLE_SELS_GB : OB_STYLE_SELS)[st.style_idx].t)
        if (parts.length === 0) return st.filters_open ? "" : `<span class="ob_filters_none">${isgb ? "未设定" : "未設定"}</span>`
        return parts.map(t => `<span class="ob_filters_tag">${this.#esc(t)}</span>`).join('')
    }

    #html_filters() {
        const isgb = this.props.isgb
        const st = this.state
        const yearSels = isgb ? OB_YEAR_SELS_GB : OB_YEAR_SELS
        const styleSels = isgb ? OB_STYLE_SELS_GB : OB_STYLE_SELS
        // 語言值若正好是 chip 之一,文字框就留空,避免 chip 與文字框看起來是兩個條件
        const langIsChip = st.obdata.some(r => r.lang === st.lang_set)
        const yearOpts = yearSels.map(a1 =>
            `<option value="${this.#esc(a1.y)}"${a1.y === st.year_set ? ' selected' : ''}>${this.#esc(a1.t)}</option>`).join('')
        const styleOpts = styleSels.map((a1, i) =>
            `<option value="${i}"${i === st.style_idx ? ' selected' : ''}>${this.#esc(a1.t)}</option>`).join('')
        const label = (t) => `<span class="ob_filter_label">${t}</span>`
        // 版面比照 demo:每組標題獨立一行在上,chip 在下;關鍵字/年代/文體各自有標題,
        // 否則兩個下拉都顯示「全部」分不出是哪個。
        const field = (t, control) => `<label class="ob_field">${label(t)}${control}</label>`

        const open = st.filters_open
        return `<div class="ob_filters${open ? ' is-open' : ''}">` +
            `<button type="button" class="ob_filters_toggle" aria-expanded="${open}">` +
            `<span class="ob_filters_title">${isgb ? "筛选" : "篩選"}</span>` +
            `<span class="ob_filters_summary">${this.#html_filters_summary()}</span>` +
            `<span class="ob_filters_chevron" aria-hidden="true">▾</span></button>` +
            `<div class="ob_filters_body"${open ? '' : ' hidden'}>` +
            `<div class="ob_filter_group">${label(isgb ? "分类" : "分類")}<div class="ob_chips ob_div_chips">${this.#html_div_chips()}</div></div>` +
            `<div class="ob_filter_group">${label(isgb ? "语言" : "語言")}<div class="ob_chips ob_lang_chips">${this.#html_lang_chips()}</div>` +
            `<input type="search" class="ob_lang_input" placeholder="${isgb ? "或直接输入语言,例如:客家话" : "或直接輸入語言,例如:客家話"}" value="${langIsChip ? "" : this.#esc(st.lang_set)}"></div>` +
            `<div class="ob_filter_row">` +
            field(isgb ? "关键字(书名/作者)" : "關鍵字(書名/作者)",
                `<input type="search" class="ob_kw_input" placeholder="${isgb ? "例如:马礼逊" : "例如:馬禮遜"}" value="${this.#esc(st.keyword)}">`) +
            field("年代", `<select class="ob_year_select">${yearOpts}</select>`) +
            field(isgb ? "文体" : "文體", `<select class="ob_style_select">${styleOpts}</select>`) +
            `</div></div></div>`
    }

    #html_list() {
        const isgb = this.props.isgb
        const mode = this.state.list_mode
        const seg = (m, t) => `<button type="button" data-mode="${m}" aria-pressed="${mode === m}">${t}</button>`
        return `<div data-ob-root="1" class="ob_list" style="height:${this.props.cy}px;overflow-y:auto">` +
            this.#html_filters() +
            `<div class="ob_list_bar"><span class="ob_count">${this.#html_count()}</span>` +
            `<span class="ob_listmode" role="group">${seg("table", "表格")}${seg("card", "卡片")}</span></div>` +
            `<div class="ob_results">${this.#html_results()}</div>` +
            `</div>`
    }

    #html_read() {
        const isgb = this.props.isgb
        const records = this.state.sobdata
        if (records == null || records.length === 0)
            return this.state.sobLoading ? `<div data-ob-root="1"></div>` : this.#html_read_empty()

        const rec = records[0]
        const menuLabel = isgb ? "回清单" : "回清單"
        const prevLabel = isgb ? "翻上一页" : "翻上一頁"
        const nextLabel = isgb ? "翻下一页" : "翻下一頁"
        const bookTitle = rec.vid != 0 ? fhl.g_book_allAuto(isgb)[rec.vid - 1][3] : "封面"
        const rangeText = formatObPageRange(rec, isgb)

        const top = `<span class="read_button" data-act="menu">${menuLabel}</span>` +
            `<span class="read_button" data-act="prev">${prevLabel}</span>` +
            `<span class="read_button" data-act="next">${nextLabel}</span>` +
            `<a class="read_button" data-act="origlink" href="${this.#esc(rec.orig)}" target="_blank" rel="noopener">${isgb ? "开新分页看原图" : "開新分頁看原圖"}</a>` +
            `<span class="read_span">${this.#esc(rec.name)}</span>` +
            `<span class="read_span">${this.#esc(bookTitle)}</span>` +
            `<span class="read_span">page:${this.#esc(rec.page)}</span>` +
            `<span class="read_span">${this.#esc(rangeText)}</span>`

        // 局部縮放圖片檢視器的工具列與畫布;實際的 src/縮放/位移由 #initViewer() 用 JS 接手,
        // 樣板這裡不放 src,避免和 #initViewer() 的還原/重置邏輯打架。
        const toolbar = `<div class="ob_viewer_toolbar">` +
            `<span class="read_button" data-act="zoomout">－</span>` +
            `<span class="ob_zoom_readout">100%</span>` +
            `<span class="read_button" data-act="zoomin">＋</span>` +
            `<span class="read_button" data-act="fit">${isgb ? "符合视窗" : "符合視窗"}</span>` +
            `<span class="read_button" data-act="actualsize">100%${isgb ? "实际大小" : "實際大小"}</span>` +
            `<span class="ob_res_badge">低解析度</span>` +
            `</div>`
        // 檢視器的樣式全部寫成 inline,不放 ob_api.css:那是個沒有版號的 <link>,加上本站自己的
        // 快取層,使用者端很容易還在吃舊版 CSS,而這裡有幾項是「沒有就整個壞掉」的:
        // 容器要 position:relative + overflow:hidden;<img> 要 position:absolute +
        // transform-origin:0 0(縮放才會錨在游標)+ pointer-events:none(否則按住左鍵會被瀏覽器
        // 原生的拖曳圖片接管,平移失效)。棋盤格背景在圖片載入前/邊界外可見,標示出畫布範圍。
        const viewerHeight = Math.max(240, this.props.cy - 90)
        const boxStyle = `position:relative;overflow:hidden;height:${viewerHeight}px;touch-action:none;cursor:grab;outline:none` +
            `;border:1px solid var(--ob-border, #d0d7de);border-radius:4px` +
            `;background:repeating-conic-gradient(var(--ob-bg-subtle, #f6f8fa) 0% 25%, var(--ob-bg, #ffffff) 0% 50%) 50% / 20px 20px`
        const imgStyle = `position:absolute;top:0;left:0;transform-origin:0 0;pointer-events:none;-webkit-user-drag:none;user-select:none`
        const img = `<div class="ob_divimg" style="${boxStyle}" tabindex="0">` +
            `<img class="ob_divimg__img" style="${imgStyle}" draggable="false" alt="${this.#esc(rec.name)}">` +
            `</div>`

        return `<div data-ob-root="1"><div>${top}</div>${toolbar}${img}</div>`
    }

    // 依目前 read 記錄初始化/還原局部縮放圖片檢視器(滾輪縮放/拖曳平移/雙指縮放/雙擊/方向鍵,
    // 放大到一定倍率自動換上原圖)。若還是同一張圖(比對 rec.small)就沿用先前的縮放/位移;
    // 若換了新頁面但還是同一本書(rec.vid 不變),沿用翻頁前的 scale/tx/ty;
    // 換書或第一次進入閱讀畫面才重置為「符合視窗」。移植自 FHLNUI_6/src/ob/demo/ui-pv-image-zoom.ts。
    #initViewer(rec) {
        const container = this.dom.find('.ob_divimg')
        if (container.length === 0) return

        if (this.#viewerWindowHandlers != null) {
            const { move, up, cancel } = this.#viewerWindowHandlers
            window.removeEventListener('pointermove', move)
            window.removeEventListener('pointerup', up)
            window.removeEventListener('pointercancel', cancel)
            this.#viewerWindowHandlers = null
        }

        const containerEl = container[0]
        const imgEl = container.find('.ob_divimg__img')[0]
        const toolbar = this.dom.find('.ob_viewer_toolbar')
        const readoutEl = toolbar.find('.ob_zoom_readout')[0]
        const badgeEl = toolbar.find('.ob_res_badge')[0]

        const key = rec.small
        const sameImage = this.#viewer != null && this.#viewer.key === key
        // 翻頁(同一本書,vid 不變)時使用者可能刻意放大到某個局部,翻下一頁/上一頁若直接重置
        // 為「符合視窗」,反而要重新縮放/平移一次,很煩;所以同一本書翻頁沿用前一頁的
        // scale/tx/ty,換書(vid 改變)或第一次進入閱讀畫面(#viewer 為 null)才重置。
        const prev = this.#viewer
        const carryTransform = !sameImage && prev != null && prev.vid === rec.vid
        const v = sameImage ? this.#viewer : {
            key, vid: rec.vid,
            scale: carryTransform ? prev.scale : 1,
            tx: carryTransform ? prev.tx : 0,
            ty: carryTransform ? prev.ty : 0,
            fitWidth: 0, fitHeight: 0,
            naturalOrig: null, resolution: "small", loadToken: 0,
        }
        this.#viewer = v

        const applyTransform = () => {
            imgEl.style.transform = `translate(${v.tx}px, ${v.ty}px) scale(${v.scale})`
            if (readoutEl != null) readoutEl.textContent = `${Math.round(v.scale * 100)}%`
        }
        // 只算新圖片的 fitWidth/fitHeight(符合視窗時的基準尺寸),不動 scale/tx/ty ——
        // 供翻頁沿用前一頁縮放/位移時使用。
        const computeFit = () => {
            const cw = containerEl.clientWidth
            const ch = containerEl.clientHeight
            const natW = imgEl.naturalWidth
            const natH = imgEl.naturalHeight
            if (natW === 0 || natH === 0) return
            const ratio = Math.min(cw / natW, ch / natH)
            v.fitWidth = natW * ratio
            v.fitHeight = natH * ratio
            imgEl.style.width = `${v.fitWidth}px`
            imgEl.style.height = `${v.fitHeight}px`
        }
        const computeFitAndCenter = () => {
            computeFit()
            if (v.fitWidth === 0 && v.fitHeight === 0) return
            v.scale = 1
            v.tx = (containerEl.clientWidth - v.fitWidth) / 2
            v.ty = (containerEl.clientHeight - v.fitHeight) / 2
            applyTransform()
        }
        const maybeSwapResolution = () => {
            if (v.resolution === "orig" || v.naturalOrig == null) return
            const displayedWidth = v.fitWidth * v.scale
            if (displayedWidth <= imgEl.naturalWidth * OB_VIEWER_SWAP_THRESHOLD_FACTOR) return
            v.resolution = "orig"
            if (badgeEl != null) badgeEl.textContent = "高解析度"

            // small/orig 長寬比不一定完全相同,換圖時以容器中心對應的圖片相對位置為錨點
            // 重新計算 fitHeight,避免拉伸變形或畫面跳動。
            const cw = containerEl.clientWidth
            const ch = containerEl.clientHeight
            const anchorX = cw / 2
            const anchorY = ch / 2
            const relX = (anchorX - v.tx) / (v.scale * v.fitWidth)
            const relY = (anchorY - v.ty) / (v.scale * v.fitHeight)

            v.fitHeight = v.fitWidth * (v.naturalOrig.h / v.naturalOrig.w)
            imgEl.style.height = `${v.fitHeight}px`
            // 換原圖前要清掉小圖那次留下的 onload(指向 computeFitAndCenter):否則原圖載完
            // 觸發 load 事件時,舊 handler 又會跑一次,把上面剛算好的錨點/縮放蓋掉,變成
            // 「高解析度下載完就整個 reset」,而不是模糊變清晰、位置與倍率不變。
            imgEl.onload = null
            imgEl.src = rec.orig

            v.tx = anchorX - relX * v.scale * v.fitWidth
            v.ty = anchorY - relY * v.scale * v.fitHeight
            applyTransform()
        }
        const zoomAt = (px, py, factor) => {
            const newScale = Math.min(OB_VIEWER_MAX_SCALE, Math.max(OB_VIEWER_MIN_SCALE, v.scale * factor))
            if (newScale === v.scale) return
            const imgX = (px - v.tx) / v.scale
            const imgY = (py - v.ty) / v.scale
            v.scale = newScale
            v.tx = px - imgX * v.scale
            v.ty = py - imgY * v.scale
            applyTransform()
            maybeSwapResolution()
        }

        if (sameImage) {
            imgEl.style.width = `${v.fitWidth}px`
            imgEl.style.height = `${v.fitHeight}px`
            imgEl.src = v.resolution === "orig" ? rec.orig : rec.small
            applyTransform()
            if (badgeEl != null) badgeEl.textContent = v.resolution === "orig" ? "高解析度" : "低解析度"
        } else {
            const token = ++v.loadToken
            imgEl.onload = () => {
                if (v.loadToken !== token) return
                if (carryTransform) {
                    // 沿用翻頁前的 scale/tx/ty,只重算 fitWidth/fitHeight 當基準,
                    // 不要重置成置中的「符合視窗」。
                    computeFit()
                    applyTransform()
                    maybeSwapResolution()
                } else {
                    computeFitAndCenter()
                }
            }
            imgEl.src = rec.small
            if (rec.orig && rec.orig !== rec.small) {
                const probe = new Image()
                probe.onload = () => {
                    if (v.loadToken !== token) return
                    v.naturalOrig = { w: probe.naturalWidth, h: probe.naturalHeight }
                    maybeSwapResolution()
                }
                probe.src = rec.orig
            }
        }

        // ---- 手勢事件;容器每次全量重繪都是新節點,不需要 off() ----
        containerEl.addEventListener('wheel', ev => {
            ev.preventDefault()
            const rect = containerEl.getBoundingClientRect()
            const factor = ev.deltaY < 0 ? 1.15 : 1 / 1.15
            zoomAt(ev.clientX - rect.left, ev.clientY - rect.top, factor)
        }, { passive: false })

        const activePointers = new Map()
        let dragLast = null
        let pinchLastDist = null
        const pointerDistance = () => {
            const pts = [...activePointers.values()]
            return pts.length < 2 ? null : Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        }
        const pointerMidpoint = () => {
            const pts = [...activePointers.values()]
            return pts.length < 2 ? null : { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
        }
        // pointermove/up 綁在 window 而非容器本身:滑鼠拖曳速度快時,游標中途離開容器範圍是常態,
        // 若只綁容器,一旦游標移出容器邊界就再也收不到 pointermove,拖曳會卡住;setPointerCapture
        // 只當作 best-effort(部分環境呼叫可能失敗),不依賴它才能保證拖曳能一路追蹤到 pointerup。
        containerEl.addEventListener('pointerdown', ev => {
            try { containerEl.setPointerCapture(ev.pointerId) } catch (e) { /* best-effort */ }
            activePointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY })
            if (activePointers.size === 1) dragLast = { x: ev.clientX, y: ev.clientY }
            else if (activePointers.size === 2) { dragLast = null; pinchLastDist = pointerDistance() }
        })
        const onWindowPointerMove = ev => {
            if (!activePointers.has(ev.pointerId)) return
            activePointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY })

            if (activePointers.size === 2) {
                const dist = pointerDistance()
                const mid = pointerMidpoint()
                const rect = containerEl.getBoundingClientRect()
                if (pinchLastDist != null && dist != null && mid != null)
                    zoomAt(mid.x - rect.left, mid.y - rect.top, dist / pinchLastDist)
                pinchLastDist = dist
                return
            }
            if (activePointers.size === 1 && dragLast != null) {
                v.tx += ev.clientX - dragLast.x
                v.ty += ev.clientY - dragLast.y
                dragLast = { x: ev.clientX, y: ev.clientY }
                applyTransform()
            }
        }
        const onWindowPointerEnd = ev => {
            if (!activePointers.has(ev.pointerId)) return
            activePointers.delete(ev.pointerId)
            if (activePointers.size < 2) pinchLastDist = null
            if (activePointers.size === 1) dragLast = [...activePointers.values()][0] ?? null
            else if (activePointers.size === 0) dragLast = null
        }
        window.addEventListener('pointermove', onWindowPointerMove)
        window.addEventListener('pointerup', onWindowPointerEnd)
        window.addEventListener('pointercancel', onWindowPointerEnd)
        this.#viewerWindowHandlers = { move: onWindowPointerMove, up: onWindowPointerEnd, cancel: onWindowPointerEnd }
        containerEl.addEventListener('dblclick', ev => {
            const rect = containerEl.getBoundingClientRect()
            const px = ev.clientX - rect.left
            const py = ev.clientY - rect.top
            if (v.scale < 1.5) zoomAt(px, py, 2.5 / v.scale)
            else computeFitAndCenter()
        })
        containerEl.addEventListener('keydown', ev => {
            const cw = containerEl.clientWidth
            const ch = containerEl.clientHeight
            const step = 40
            switch (ev.key) {
                case '+': case '=': zoomAt(cw / 2, ch / 2, 1.2); ev.preventDefault(); break
                case '-': zoomAt(cw / 2, ch / 2, 1 / 1.2); ev.preventDefault(); break
                case 'ArrowLeft': v.tx += step; applyTransform(); ev.preventDefault(); break
                case 'ArrowRight': v.tx -= step; applyTransform(); ev.preventDefault(); break
                case 'ArrowUp': v.ty += step; applyTransform(); ev.preventDefault(); break
                case 'ArrowDown': v.ty -= step; applyTransform(); ev.preventDefault(); break
            }
        })

        this.#viewerActions = {
            zoomIn: () => zoomAt(containerEl.clientWidth / 2, containerEl.clientHeight / 2, 1.3),
            zoomOut: () => zoomAt(containerEl.clientWidth / 2, containerEl.clientHeight / 2, 1 / 1.3),
            fit: () => computeFitAndCenter(),
            actualSize: () => {
                const targetNatural = v.naturalOrig ?? { w: imgEl.naturalWidth, h: imgEl.naturalHeight }
                const targetScale = targetNatural.w / v.fitWidth
                zoomAt(containerEl.clientWidth / 2, containerEl.clientHeight / 2, targetScale / v.scale)
            },
        }
    }

    // 目前的 activate address(this.props)在典藏沒有對應的掃描書影時的畫面。
    // 例如 sob.php?gb=0&book=26&engs=James&chap=5&sec=1 這種地址就查不到資料。
    #html_read_empty() {
        const isgb = this.props.isgb
        const menuLabel = isgb ? "回清单" : "回清單"
        const firstPageLabel = isgb ? "跳至第一页" : "跳至第一頁"
        const bookName = fhl.g_book_allAuto(isgb)[this.props.ibook][3]
        const addr = `${bookName}${this.props.ichap}章${this.props.isec}${isgb ? "节" : "節"}`
        const msg = (isgb ? "于 " : "於 ") + addr + (isgb ? " 无对应内容" : " 無對應內容")

        const top = `<span class="read_button" data-act="menu">${menuLabel}</span>` +
            `<span class="read_button" data-act="firstpage">${firstPageLabel}</span>` +
            `<span class="read_span">${this.#esc(msg)}</span>`
        return `<div data-ob-root="1"><div>${top}</div></div>`
    }

    #set_content_type(contentType) {
        if (contentType === "list" || contentType === "read")
            this.#setState({ content_type: contentType })
    }

    #set_read_page(page1) {
        this.#setState({ page: page1 })
        this.#query_sob_from_ajax_page(page1)
    }

    #set_book_id(idxbook1) {
        this.#setState({ idxbook: idxbook1 })
        this.#query_sob_from_ajax_idxbook(idxbook1)
    }

    #set_obdata_from_ajax() {
        const isgb = this.props.isgb
        const cached = this.#obListCache.get(isgb)
        if (cached != null) {
            this.#query_book_all_and_set_obdata(cached)
            return
        }

        const url = "ob.php" + (isgb ? "?gb=1" : "?gb=0")
        fhl.json_api_text(url, (jstr) => {
            let juc
            try {
                juc = JSON.parse(jstr)
            } catch (e) {
                this.#setState({ err_msg: "ob.php錯誤" })
                return
            }
            if (juc.status != "success") {
                this.#setState({ err_msg: "ob.php錯誤" })
                return
            }

            this.#obListCache.set(isgb, juc.record)
            this.#query_book_all_and_set_obdata(juc.record)
        }, (msg) => {
            this.#setState({ err_msg: msg })
        }, null)
    }

    // obRecords 是 ob.php 的全域書目清單(可能來自快取);再依目前經節查有哪些書卷有資料,
    // 交集後寫入 state.obdata(不篩選;年代/文體等篩選在 #filtered() 即時算)。
    #query_book_all_and_set_obdata(obRecords) {
        let url2 = "sob.php" + (this.props.isgb ? "?gb=1" : "?gb=0")
        url2 += "&book=all"
        url2 += "&engs=" + fhl.g_book_all[this.props.ibook][0]
        url2 += "&chap=" + this.props.ichap
        const mySeq = ++this.#listSeq
        fhl.json_api_text(url2, (jstr2) => {
            if (this.#listSeq !== mySeq) return // 快速換章時的過期回應,忽略
            let juc2
            try {
                juc2 = JSON.parse(jstr2)
            } catch (e) {
                this.#setState({ err_msg: "sob.php book=all 錯誤" })
                return
            }
            if (juc2.status != "success") {
                this.#setState({ err_msg: "sob.php book=all 錯誤" })
                return
            }

            const books2 = new Set(juc2.record.map(a1 => a1.book))
            const re = obRecords.filter(a1 => books2.has(a1.id))
            this.#setState({ obdata: re, obListLoaded: true, err_msg: "" })
        }, (msg) => {
            if (this.#listSeq !== mySeq) return
            this.#setState({ err_msg: msg })
        }, null, true)
    }

    #query_sob_from_ajax_book_chap_sec(book1, chap1, sec1) {
        let url = "sob.php" + (this.props.isgb ? "?gb=1" : "?gb=0")
        const idxbook = this.state.idxbook
        const engs = fhl.g_book_all[book1][0]
        url += "&book=" + idxbook + "&engs=" + engs + "&chap=" + chap1 + "&sec=" + sec1

        this.state.sobLoading = true
        const mySeq = ++this.#reqSeq
        fhl.json_api_text(url, (jstr) => {
            if (this.#reqSeq !== mySeq) return // 過期回應,忽略
            let juc
            try {
                juc = JSON.parse(jstr)
            } catch (e) {
                this.#setState({ err_msg: "sob.php 回應格式錯誤", sobLoading: false })
                return
            }
            if (juc.status == "success")
                this.#setState({ sobdata: juc.record, err_msg: "", sobLoading: false })
            else
                this.#setState({ sobLoading: false })
        }, (msg) => {
            if (this.#reqSeq !== mySeq) return
            this.#setState({ err_msg: "sob.php錯誤", sobLoading: false })
        }, null, true)
    }

    #query_sob_from_ajax_idxbook(idxbook1) {
        let url = "sob.php" + (this.props.isgb ? "?gb=1" : "?gb=0")
        const engs = fhl.g_book_all[this.props.ibook][0]
        const chap = this.props.ichap
        const sec = this.props.isec
        url += "&book=" + idxbook1 + "&engs=" + engs + "&chap=" + chap + "&sec=" + sec

        this.state.sobLoading = true
        const mySeq = ++this.#reqSeq
        fhl.json_api_text(url, (jstr) => {
            if (this.#reqSeq !== mySeq) return // 過期回應,忽略
            let juc
            try {
                juc = JSON.parse(jstr)
            } catch (e) {
                this.#setState({ err_msg: "sob.php 回應格式錯誤", sobLoading: false })
                return
            }
            if (juc.status == "success")
                this.#setState({ idxbook: idxbook1, sobdata: juc.record, err_msg: "", sobLoading: false })
            else
                this.#setState({ sobLoading: false })
        }, (msg) => {
            if (this.#reqSeq !== mySeq) return
            this.#setState({ err_msg: "sob.php錯誤", sobLoading: false })
        }, null, true)
    }

    #query_sob_from_ajax_page(page1) {
        let url = "sob.php" + (this.props.isgb ? "?gb=1" : "?gb=0")
        const idxbook = this.state.idxbook
        url += "&book=" + idxbook + "&page=" + page1

        this.state.sobLoading = true
        const mySeq = ++this.#reqSeq
        fhl.json_api_text(url, (jstr) => {
            if (this.#reqSeq !== mySeq) return // 過期回應,忽略
            let juc
            try {
                juc = JSON.parse(jstr)
            } catch (e) {
                this.#setState({ err_msg: "sob.php 回應格式錯誤", sobLoading: false })
                return
            }
            if (juc.status == "success")
                this.#setState({ sobdata: juc.record, err_msg: "", sobLoading: false })
            else
                this.#setState({ sobLoading: false })
        }, (msg) => {
            if (this.#reqSeq !== mySeq) return
            this.#setState({ err_msg: "sob.php錯誤", sobLoading: false })
        }, null, true)
    }
}
