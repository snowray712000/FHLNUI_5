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
    #paintQueued = false

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

        if (!this.#isMounted()) {
            // 等同 React 重新 mount(容器內容已被別的分頁蓋掉,或第一次進來)
            this.state = this.#getInitialState()
            this.props = next
            this.#set_obdata_from_ajax()
            this.#paintNow(true)
            return
        }

        // 等同 componentWillReceiveProps;此時 this.props 仍是舊值,故意在查詢「之後」才換新值
        const changed = next.ibook !== this.props.ibook || next.ichap !== this.props.ichap
            || next.isec !== this.props.isec || next.isgb !== this.props.isgb
        if (changed) {
            this.#query_sob_from_ajax_book_chap_sec(next.ibook, next.ichap, next.isec)
        }
        this.props = next
        this.#paintNow(true)
    }

    registerEvents() {
        const d = this.dom
        if (d == null) return
        d.off('click', '.yearitem').on('click', '.yearitem', ev =>
            this.#set_year_range($(ev.currentTarget).attr('data-yy')))
        d.off('click', '.styleitem').on('click', '.styleitem', ev => {
            const tt = $(ev.currentTarget).attr('data-tt')
            this.#set_style(tt === "全部" ? "" : tt)
        })
        d.off('click', 'td.list_item_read').on('click', 'td.list_item_read', ev => {
            this.#set_book_id($(ev.currentTarget).attr('data-id'))
            this.#set_content_type("read")
        })
        d.off('click', '.read_button').on('click', '.read_button', ev => {
            const act = $(ev.currentTarget).attr('data-act')
            if (act === 'menu') { this.#set_content_type("list"); return }
            const r = this.state.sobdata?.[0]
            if (r == null) return
            this.#set_read_page(act === 'prev' ? r.prev : r.next)
        })
    }

    #getInitialState() {
        return {
            obdata: [],
            err_msg: "",
            year_set: "0-9999",
            style_set: "",
            content_type: "list", // list | read
            idxbook: 257, // 香港聖經公會 新舊約全書 1959
            page: -1,
            sobdata: [],
        }
    }

    #isMounted() {
        return this.state != null && this.#hasRootMarker()
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

    #html_top() {
        const isgb = this.props.isgb
        const yearSels = isgb ? OB_YEAR_SELS_GB : OB_YEAR_SELS
        const styleSels = isgb ? OB_STYLE_SELS_GB : OB_STYLE_SELS
        const styleSetForCompare = this.state.style_set === "" ? "全部" : this.state.style_set

        const yearSpans = yearSels.map(a1 => {
            const active = a1.y === this.state.year_set
            return `<span class="yearitem${active ? ' selected' : ''}" data-yy="${this.#esc(a1.y)}">${this.#esc(a1.t)}</span>`
        }).join('')
        const styleSpans = styleSels.map(a1 => {
            const active = a1.t === styleSetForCompare
            return `<span class="styleitem${active ? ' selected' : ''}" data-tt="${this.#esc(a1.t)}">${this.#esc(a1.t)}</span>`
        }).join('')

        return `<div>${yearSpans}</div><div>${styleSpans}</div>`
    }

    #html_list() {
        const isgb = this.props.isgb
        const titles = isgb ? ["年代", "作者/译者", "书名", "语言", "阅读"] : ["年代", "作者/譯者", "書名", "語言", "閱讀"]
        const readLabel = isgb ? "阅读" : "閱讀"
        const records = this.state.obdata

        let bodyRows = ""
        if (records != null) {
            const headerRow = `<tr>${titles.map(t => `<td>${this.#esc(t)}</td>`).join('')}</tr>`
            const dataRows = records.map(a1 =>
                `<tr><td>${this.#esc(a1.age)}</td><td>${this.#esc(a1.author)}</td><td>${this.#esc(a1.title)}</td>` +
                `<td>${this.#esc(a1.lang)}</td><td class="list_item_read" data-id="${this.#esc(a1.id)}">${readLabel}</td></tr>`
            ).join('')
            bodyRows = headerRow + dataRows
        }

        return `<div data-ob-root="1" style="height:${this.props.cy}px;overflow-y:auto">` +
            `<div>${this.#html_top()}</div>` +
            `<div><table class="obtable"><tbody>${bodyRows}</tbody></table></div>` +
            `</div>`
    }

    #html_read() {
        const isgb = this.props.isgb
        const records = this.state.sobdata
        if (records == null || records.length === 0)
            return `<div data-ob-root="1"></div>`

        const rec = records[0]
        const menuLabel = isgb ? "回清单" : "回清單"
        const prevLabel = isgb ? "翻上一页" : "翻上一頁"
        const nextLabel = isgb ? "翻下一页" : "翻下一頁"
        const bookTitle = rec.vid != 0 ? fhl.g_book_allAuto(isgb)[rec.vid - 1][3] : "封面"
        const rangeText = formatObPageRange(rec, isgb)

        const top = `<span class="read_button" data-act="menu">${menuLabel}</span>` +
            `<span class="read_button" data-act="prev">${prevLabel}</span>` +
            `<span class="read_button" data-act="next">${nextLabel}</span>` +
            `<span class="read_span">${this.#esc(rec.name)}</span>` +
            `<span class="read_span">${this.#esc(bookTitle)}</span>` +
            `<span class="read_span">page:${this.#esc(rec.page)}</span>` +
            `<span class="read_span">${this.#esc(rangeText)}</span>`
        const img = `<div class="ob_divimg"><a href="${this.#esc(rec.orig)}" target="_blank"><img src="${this.#esc(rec.small)}"></a></div>`

        return `<div data-ob-root="1"><div>${top}</div>${img}</div>`
    }

    #set_year_range(years) {
        this.#setState({ year_set: years })
        this.#set_obdata_from_ajax()
    }

    #set_style(styleTitle) {
        this.#setState({ style_set: styleTitle })
        this.#set_obdata_from_ajax()
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
        const url = "ob.php" + (this.props.isgb ? "?gb=1" : "?gb=0")

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

            // 加入目前經節才有的書卷
            let url2 = "sob.php" + (this.props.isgb ? "?gb=1" : "?gb=0")
            url2 += "&book=all"
            url2 += "&engs=" + fhl.g_book_all[this.props.ibook][0]
            url2 += "&chap=" + this.props.ichap
            fhl.json_api_text(url2, (jstr2) => {
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

                const books2 = juc2.record.map(a1 => a1.book)
                const years = this.state.year_set.split('-', 2)
                const y1 = years[0]
                const y2 = years[1]
                const styles = this.state.style_set

                // age 是 API 回傳的字串,y1/y2 也是字串;維持字串比較,不要轉數字(見規劃文件說明)
                const re = juc.record
                    .filter(a1 => a1.age >= y1 && a1.age <= y2 && (styles.length == 0 || styles == a1.style))
                    .filter(a1 => books2.includes(a1.id))

                this.#setState({ obdata: re, err_msg: "" })
            }, (msg) => {
                this.#setState({ err_msg: msg })
            }, null, true)
        }, (msg) => {
            this.#setState({ err_msg: msg })
        }, null)
    }

    #query_sob_from_ajax_book_chap_sec(book1, chap1, sec1) {
        let url = "sob.php" + (this.props.isgb ? "?gb=1" : "?gb=0")
        const idxbook = this.state.idxbook
        const engs = fhl.g_book_all[book1][0]
        url += "&book=" + idxbook + "&engs=" + engs + "&chap=" + chap1 + "&sec=" + sec1

        const mySeq = ++this.#reqSeq
        fhl.json_api_text(url, (jstr) => {
            if (this.#reqSeq !== mySeq) return // 過期回應,忽略
            let juc
            try {
                juc = JSON.parse(jstr)
            } catch (e) {
                this.#setState({ err_msg: "sob.php 回應格式錯誤" })
                return
            }
            if (juc.status == "success")
                this.#setState({ sobdata: juc.record, err_msg: "" })
        }, (msg) => {
            if (this.#reqSeq !== mySeq) return
            this.#setState({ err_msg: "sob.php錯誤" })
        }, null, true)
    }

    #query_sob_from_ajax_idxbook(idxbook1) {
        let url = "sob.php" + (this.props.isgb ? "?gb=1" : "?gb=0")
        const engs = fhl.g_book_all[this.props.ibook][0]
        const chap = this.props.ichap
        const sec = this.props.isec
        url += "&book=" + idxbook1 + "&engs=" + engs + "&chap=" + chap + "&sec=" + sec

        const mySeq = ++this.#reqSeq
        fhl.json_api_text(url, (jstr) => {
            if (this.#reqSeq !== mySeq) return // 過期回應,忽略
            let juc
            try {
                juc = JSON.parse(jstr)
            } catch (e) {
                this.#setState({ err_msg: "sob.php 回應格式錯誤" })
                return
            }
            if (juc.status == "success")
                this.#setState({ idxbook: idxbook1, sobdata: juc.record, err_msg: "" })
        }, (msg) => {
            if (this.#reqSeq !== mySeq) return
            this.#setState({ err_msg: "sob.php錯誤" })
        }, null, true)
    }

    #query_sob_from_ajax_page(page1) {
        let url = "sob.php" + (this.props.isgb ? "?gb=1" : "?gb=0")
        const idxbook = this.state.idxbook
        url += "&book=" + idxbook + "&page=" + page1

        const mySeq = ++this.#reqSeq
        fhl.json_api_text(url, (jstr) => {
            if (this.#reqSeq !== mySeq) return // 過期回應,忽略
            let juc
            try {
                juc = JSON.parse(jstr)
            } catch (e) {
                this.#setState({ err_msg: "sob.php 回應格式錯誤" })
                return
            }
            if (juc.status == "success")
                this.#setState({ sobdata: juc.record, err_msg: "" })
        }, (msg) => {
            if (this.#reqSeq !== mySeq) return
            this.#setState({ err_msg: "sob.php錯誤" })
        }, null, true)
    }
}
