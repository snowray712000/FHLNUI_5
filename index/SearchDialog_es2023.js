import { DialogHtml } from './DialogHtml.es2023.js'
import { SearchSession } from './SearchSession_es2023.js'
import { Search_suggestFilter } from './Search_suggestFilter_es2023.js'
import { TPPageState } from './TPPageState.es2023.js'
import { BibleConstantHelper } from './BibleConstantHelper.es2023.js'
import { gbText } from './gbText.es2023.js'
import { triggerGoEventWhenPageStateAddressChange } from './triggerGoEventWhenPageStateAddressChange.es2023.js'
import { BookSelect } from './BookSelect.es2023.js'
import { FhlLecture } from './FhlLecture.es2023.js'
import { FhlInfo } from './FhlInfo.es2023.js'
import { queryDictionaryAndShowAtDialogAsync } from './queryDictionaryAndShowAtDialogAsync.es2023.js'
import { SN_Act_Color } from './SN_Act_Color.es2023.js'
import { copy_text_to_clipboard } from './copy_text_to_clipboard_es2023.js'
import { greekLooseRegexSource } from './greekToFhlCode.es2023.js'
import { hebLooseRegexSource, isHebrewKeyword } from './hebCode.es2023.js'
import { cvt_others } from './cvt_others.js'
import { renderVerseGrid, renderVerseGridHeader, effectiveLayout, labelTemplate, isMergedWithPrev, extendVerseLabel, mergedPlaceholderDTexts } from './VerseGrid.es2023.js'
import { ColWidth } from './ColWidth.es2023.js'
import { SnFilter } from './SnFilter.es2023.js'
import { queryFootsAsync } from './queryFootsAsync.js'
import { showFootPopupAsync } from './showFootPopupAsync.es2023.js'
import { queryReferenceAndShowAtDialogAsync } from './queryReferenceAndShowAtDialogAsync.es2023.js'

/**
 * @typedef {import('./SearchSession_es2023.js').SearchRow} SearchRow
 */

/*
### 搜尋結果 dialog (取代原本下方的 #fhlMidBottomWindow)
- 非模態：點經文位置，主畫面跳過去，dialog 留著
- 同一時間只有一個；再搜尋時，沿用已開的 dialog

<div.search-dlg>
  <form.sd-bar> input 關鍵字、搜尋按鈕、譯本對照、狀態 </form>
  <div.sd-groups> 分類 (整卷聖經、舊約、新約、摩西五經 …)，只列有結果的 </div>
  <div.sd-books> 目前分類下，有結果的書卷 </div>
  <div#searchDlgResults.sd-results>
    <div.verse-grid.vg-head-row> 譯本名 (並排、多譯本時；sticky) </div>
    <div.verse-grid> 一批 (SearchSession.BATCH 節) 一個 grid，與經文區、交互參照共用 VerseGrid (docs/z260930d P6)
      <div.vg-label data-goto>雅 1:2</div>  (標籤欄固定寬，各批才對齊)
      <div.vercol ver> <div.paragraph> <span.lec> … </span> <span.sd-copy/> </div> </div>
    </div>
  </div>
</div>
每列只放「找到關鍵字的譯本」，沒找到的格子留空；勾「譯本對照」時每節列出目前所有譯本 (會記住，localStorage fhlSearchCompare)
*/
export class SearchDialog {
    static #s = null
    /** @returns {SearchDialog} */
    static get s() { if (!this.#s) this.#s = new SearchDialog(); return this.#s }

    /** 至少幾節，才縮小範圍 (同卷 → 同分類 → 同約) */
    static MIN_COUNT_TO_NARROW = 10

    /** @type {DialogHtml | null} */ #dlgHtml = null
    /** @type {SearchSession | null} */ session = null
    /** 目前範圍 @type {{group_name: string, ibook: number | null}} */ filter = { group_name: '整卷聖經', ibook: null }
    /** 取經文中 (每次取都是新的 token，範圍改變時清掉，舊的回來就不會影響新的) @type {object | null} */
    #loadingToken = null
    /** 欄寬：這個範圍還沒量過時才有，第一批載入後 apply 一次 @type {ColWidth | null} */
    #colWidth = null

    /** @returns {JQuery<HTMLElement>} */
    get #dlg() { return this.#dlgHtml?.dlg ?? $() }

    /**
     * 搜尋並顯示
     * @param {string} keyword 例 `摩西`、`G80`、`#羅 1:3|`、`羅1:3`
     */
    async searchAsync(keyword) {
        keyword = keyword?.trim() ?? ''
        if (keyword.length == 0) return
        if (/^[GH]?0+$/i.test(keyword)) return // 00000 會造成卡死 2015.08.01

        const ps = TPPageState.s
        this.session?.abort()
        const session = this.session = new SearchSession({
            keyword,
            versions: ps.version,
            gb: ps.gb == 1 ? 1 : 0,
            strong: ps.strong == 1 ? 1 : 0,
            engs: BibleConstantHelper.getBookNameArrayEnglishNormal()[ps.bookIndex - 1],
        })
        session.compare = readCompare()

        this.#open()
        this.#dlg.dialog('option', 'title', `${gbText('搜尋')}：${keyword}`)
        this.#dlg.find('.sd-input').val(keyword)
        this.#dlg.find('.sd-groups, .sd-books').empty()
        this.#setResultsHtml('<div class="sd-hint"><i class="fa fa-spinner fa-pulse"></i></div>')
        this.#setStatus('')

        try {
            await session.runAsync()
        } catch (e) {
            if (session.isAborted) return
            console.error(e)
            this.#setResultsHtml($('<div class="sd-hint">').text(`${gbText('搜尋失敗')}：${e.message}`))
            return
        }
        if (session !== this.session) return // 期間又搜尋了別的

        if (session.kind == 'reference') {
            this.#renderGroups()
            this.#applyFilterAsync()
            return
        }

        this.filter = Search_suggestFilter(session.cntOfBook, fhl.g_book_group, ps.bookIndex - 1, SearchDialog.MIN_COUNT_TO_NARROW)
        this.#renderGroups()
        this.#applyFilterAsync()
    }

    #open() {
        if (this.#dlgHtml?.dlg != null) {
            this.#dlg.dialog('moveToTop')
            return
        }

        const isNarrow = window.innerWidth < 768
        const dlgHtml = this.#dlgHtml = new DialogHtml()
        dlgHtml.showDialog({
            html: `<div class="search-dlg${readFold() ? ' sd-folded' : ''}">
                <form class="sd-bar">
                    <input class="sd-input" type="search" placeholder="${gbText('關鍵字、G80、#羅 1:3|')}">
                    <button class="sd-go" type="submit"><i class="fa fa-search"></i></button>
                    <label class="sd-compare" title="${gbText('每節都列出目前所有譯本，不只找到關鍵字的')}"><input type="checkbox"${readCompare() ? ' checked' : ''}> ${gbText('譯本對照')}</label>
                    <button class="sd-fold" type="button" hidden></button>
                    <span class="sd-status"></span>
                </form>
                <div class="sd-groups"></div>
                <div class="sd-books"></div>
                <div id="searchDlgResults" class="sd-results"></div>
            </div>`,
            width: isNarrow ? window.innerWidth - 16 : Math.min(window.innerWidth * 0.8, 1100),
            height: window.innerHeight * (isNarrow ? 0.9 : 0.85),
            maxHeight: window.innerHeight,
            getTitle: () => gbText('搜尋'),
            registerEventWhenShowed: dlg => this.#registerEvents(dlg),
        })
        dlgHtml.dlg.on('dialogclose', () => {
            if (this.#dlgHtml === dlgHtml) this.#dlgHtml = null
        })
    }

    /** @param {JQuery<HTMLElement>} dlg */
    #registerEvents(dlg) {
        const that = this
        dlg.on('submit', '.sd-bar', e => {
            e.preventDefault()
            that.searchAsync(dlg.find('.sd-input').val())
        }).on('change', '.sd-compare input', function () {
            writeCompare(this.checked)
            const session = that.session
            if (session == null || session.kind == 'reference') return // 經文查詢本來就列所有譯本
            session.compare = this.checked
            that.#applyFilterAsync()
        }).on('click', '.sd-fold', function () {
            const folded = !dlg.find('.search-dlg').addBack('.search-dlg').first().hasClass('sd-folded')
            dlg.find('.search-dlg').addBack('.search-dlg').toggleClass('sd-folded', folded)
            writeFold(folded)
            that.#renderGroups()
        }).on('click', '.sd-group', function () {
            const group_name = $(this).attr('group_name')
            // 點目前分類：若選了單卷，回到整個分類
            if (group_name == that.filter.group_name && that.filter.ibook == null) return
            that.filter = { group_name, ibook: null }
            that.#renderGroups()
            that.#applyFilterAsync()
        }).on('click', '.sd-book', function () {
            const ibook = parseInt($(this).attr('ibook'))
            if (ibook == that.filter.ibook) return
            that.filter = { group_name: that.filter.group_name, ibook }
            that.#renderGroups()
            that.#applyFilterAsync()
        }).on('click', '[data-goto]', function () {
            const [book, chap, sec] = JSON.parse($(this).attr('data-goto'))
            that.#goto(book - 1, chap, sec)
        }).on('click', '.sd-copy', function () {
            const p = $(this).closest('.paragraph')
            const lec = p.find('.lec')
            const names = BibleConstantHelper.getBookNameArrayChineseShort()
            const addr = `${names[lec.attr('book') - 1]} ${lec.attr('chap')}:${lec.attr('sec')}`
            const text = p.find('.verseContent').get().map(e => e.innerText.trim()).join(' ') // innerText：隱藏的 SN 不算
            copy_text_to_clipboard(async () => `${addr} ${text}`)
        }).on('click', '.ft', e => {
            showFootPopupAsync(e) // 注腳「點擊顯示」：與經文區相同
        }).on('click', '.ref', function (e) {
            // 注腳裡的經文 (中文標準譯本等，「直接載入」時)：與經文區相同，開交互參照
            const desc = $(this).attr('addr-desc')
            const data = $(this).attr('addr-data')
            if (desc?.trim()) queryReferenceAndShowAtDialogAsync({ addrsDescription: desc, event: e })
            else if (data) queryReferenceAndShowAtDialogAsync({ addrs: JSON.parse(data), event: e })
        }).on('click', '.seSN', function (e) {
            // 字典中要高亮的是「這筆搜尋結果」的經文，而不是 ps 目前閱讀位置
            const lec = $(this).closest('.lec')
            const activeAddr = lec.length ? { book: parseInt(lec.attr('book')), chap: lec.attr('chap'), verse: lec.attr('sec') } : undefined
            queryDictionaryAndShowAtDialogAsync({ sn: $(this).attr('sn'), isOld: $(this).attr('tp') == 'H', activeAddr })
            e.stopPropagation()
        }).on('mouseenter', '.sn', function () {
            const ps = TPPageState.s
            ps.snAct = $(this).attr('sn')
            ps.snActTp = $(this).attr('tp') // 'G' or 'H'
            SN_Act_Color.s.act_add(ps.snAct, ps.snActTp)
        }).on('mouseleave', '.sn', function () {
            const ps = TPPageState.s
            SN_Act_Color.s.act_remove()
            ps.snAct = ''
            ps.snActTp = ''
        })

        dlg.find('.sd-results').on('scroll', function () {
            if (this.scrollTop + this.clientHeight + 200 >= this.scrollHeight) {
                that.#loadMoreAsync()
            }
        })
    }

    #setStatus(text) { this.#dlg.find('.sd-status').text(text) }
    /** @param {string | JQuery<HTMLElement>} html */
    #setResultsHtml(html) { this.#dlg.find('.sd-results').empty().append(html).scrollTop(0) }

    /** 分類、書卷 按鈕 */
    #renderGroups() {
        const session = this.session
        const groups$ = this.#dlg.find('.sd-groups').empty()
        const books$ = this.#dlg.find('.sd-books').empty()
        const fold$ = this.#dlg.find('.sd-fold').prop('hidden', true)
        if (session.kind == 'reference' || session.verses.length == 0) return
        const folded = this.#dlg.find('.search-dlg').addBack('.search-dlg').first().hasClass('sd-folded')
        const names0 = BibleConstantHelper.getBookNameArrayChineseShort()
        const cur = this.filter.ibook != null ? names0[this.filter.ibook] : gbText(this.filter.group_name)
        fold$.prop('hidden', false).text(`${gbText('篩選')} ${folded ? '▸' : '▾'}` + (folded ? `：${cur}` : ''))

        const cnt = books => books.reduce((sum, b) => sum + (session.cntOfBook[b] ?? 0), 0)
        for (const [group_name, books] of Object.entries(fhl.g_book_group)) {
            const n = cnt(books)
            if (n == 0) continue
            $('<button type="button" class="sd-chip sd-group">')
                .attr('group_name', group_name)
                .toggleClass('selected', group_name == this.filter.group_name)
                .append($('<span>').text(gbText(group_name)), $('<small>').text(n))
                .appendTo(groups$)
        }

        const names = BibleConstantHelper.getBookNameArrayChineseShort()
        const ibookCur = TPPageState.s.bookIndex - 1
        for (const ibook of fhl.g_book_group[this.filter.group_name] ?? []) {
            const n = session.cntOfBook[ibook] ?? 0
            if (n == 0) continue
            $('<button type="button" class="sd-chip sd-book">')
                .attr('ibook', ibook)
                .attr('title', ibook == ibookCur ? gbText('目前閱讀的書卷') : null)
                .toggleClass('selected', ibook == this.filter.ibook)
                .toggleClass('sd-cur', ibook == ibookCur)
                .append($('<span>').text(names[ibook]), $('<small>').text(n))
                .appendTo(books$)
        }
    }

    /** 依 this.filter 從頭顯示 */
    async #applyFilterAsync() {
        const session = this.session
        if (session.kind != 'reference') {
            const books = this.filter.ibook != null ? [this.filter.ibook] : fhl.g_book_group[this.filter.group_name]
            session.setFilter(books)
        }

        const failed = session.failedVersions.map(a1 => abvphp.get_cname_from_book(a1.ver, session.gb == 1) || a1.ver)
        const names = BibleConstantHelper.getBookNameArrayChineseShort()
        const tooMany = session.tooManyBooks.map(engs => names[fhl.engs_2_iBook(engs)] ?? engs)
        const hint = (failed.length ? `（${failed.join('、')} ${gbText('無法搜尋')}）` : '')
            + (tooMany.length ? `（${tooMany.join('、')} ${gbText('原文結果太多，未列入')}）` : '')
        if (session.total == 0) {
            this.#setResultsHtml($('<div class="sd-hint">').text(gbText('查無資料') + hint))
            this.#setStatus('')
            return
        }
        this.#setStatus(`${session.kind == 'reference' ? '' : `${session.verses.length} ${gbText('節')}`}${hint}`)
        this.#setResultsHtml('')
        // 並排、多譯本：譯本名放在捲動區最上面 (sticky)，各批 grid 用同一個欄樣板 (--vg-tpl)
        const opt = gridOpt(session)
        const results = this.#dlg.find('.sd-results')[0]
        results.style.removeProperty('--vg-tpl')
        this.#colWidth = null
        if (effectiveLayout(opt) == 'side' && opt.versions.length > 1) {
            $(results).append(renderVerseGridHeader(opt))
            // 欄寬：第一批載入後量一次 (之後各批沿用，不會一直跳)；自訂紀錄與經文區、交互參照共用
            this.#colWidth = new ColWidth({
                host: results, varName: '--vg-tpl', versions: opt.versions.map(v => v.version), labelTpl: labelTemplate(opt),
                getHeadCells: () => [...results.querySelectorAll('.vg-head-row .vg-head[data-ver]')], measureRoot: results,
            })
        }
        this.#loadingToken = null
        await this.#loadMoreAsync()
    }

    /** 捲到底時，再取一批 */
    async #loadMoreAsync() {
        const session = this.session
        if (this.#loadingToken != null || session == null || !session.hasMore) return

        const results$ = this.#dlg.find('.sd-results')
        const spinner$ = $('<div class="sd-hint sd-more"><i class="fa fa-spinner fa-pulse"></i></div>').appendTo(results$)
        const token = this.#loadingToken = {}
        let rows, verseRows
        try {
            rows = await session.loadMoreAsync()
            if (rows != null) verseRows = await toVerseRowsAsync(rows)
        } catch (e) {
            if (!session.isAborted) console.error(e)
            rows = null
        } finally {
            spinner$.remove()
        }
        if (session !== this.session || token !== this.#loadingToken) return // 範圍已改變，由新的 applyFilter 負責
        this.#loadingToken = null
        if (rows == null) return

        const keys = session.kind == 'sn' ? { sn: session.sn } : { words: session.kind == 'keyword' ? session.keyword : '' }
        const $grid = renderVerseGrid({ ...gridOpt(session), rows: verseRows })
        $grid.find('.sn').addClass('seSN sebutton') // 搜尋結果的 SN 樣式 (灰、小)、點了開字典
        markSearchKeys($grid, keys)
        // 搜尋的 SN：SN 篩選開著、它又不在篩選內時也要顯示 (例 篩選「連接詞」搜 G80 → 連接詞 + G80)；SnFilter 對 .seKey 一律顯示
        if (keys.sn != null) SnFilter.s.apply($grid, { offShowsAll: true })
        results$.append($grid)
        if (this.#colWidth) { // 這個範圍的第一批：量欄寬
            this.#colWidth.apply()
            this.#colWidth = null
        }

        // 還沒有捲軸 (內容太少)，繼續取
        const el = results$[0]
        if (el != null && el.scrollHeight <= el.clientHeight + 200) {
            this.#loadMoreAsync()
        }
    }

    /** 主畫面跳到該節，dialog 保留 */
    #goto(ibook, chap, sec) {
        const ps = TPPageState.s
        ps.bookIndex = ibook + 1
        ps.chap = chap
        ps.sec = sec

        triggerGoEventWhenPageStateAddressChange(ps)
        BookSelect.s.render()
        FhlLecture.s.render()
        FhlLecture.s.selectLecture(ps.bookIndex, ps.chap, ps.sec)
        FhlInfo.s.render(ps)
        $(document).trigger('chapchanged') // 更新網址 hash (pushState)，可按上一頁回來
    }
}

const FOLD_KEY = 'fhlSearchFold'
/** 篩選區收合 (會記住) */
function readFold() {
    try { return localStorage.getItem(FOLD_KEY) == '1' } catch { return false }
}
/** @param {boolean} on */
function writeFold(on) {
    try { localStorage.setItem(FOLD_KEY, on ? '1' : '0') } catch { /* 不記也能用 */ }
}

const COMPARE_KEY = 'fhlSearchCompare'
/** 譯本對照 (會記住) */
function readCompare() {
    try { return localStorage.getItem(COMPARE_KEY) == '1' } catch { return false }
}
/** @param {boolean} on */
function writeCompare(on) {
    try { localStorage.setItem(COMPARE_KEY, on ? '1' : '0') } catch { /* 無痕等，不記也能用 */ }
}

/**
 * 搜尋結果的 grid 設定：譯本 (SN 搜尋只有和合本)、並排 / 交錯照目前的顯示模式、標籤欄固定寬 (各批才對齊)
 * @param {SearchSession} session
 * @returns {import('./VerseGrid.es2023.js').GridOpt}
 */
function gridOpt(session) {
    const ps = TPPageState.s
    const failed = new Set(session.failedVersions.map(a => a.ver))
    // 整次搜尋都沒找到的譯本不列欄 (例 中文關鍵字時的 KJV)；經文查詢 (reference) 沒有 verses，全列
    // 譯本對照：列出所有譯本 (無法搜尋的譯本也可能取得到經文)
    const found = session.kind == 'reference' ? null : new Set(session.verses.flatMap(v => v.vers))
    const vers = session.compare && session.kind != 'reference' ? session.compareVersions
        : (session.kind == 'sn' ? ['unv'] : session.versions).filter(v => !failed.has(v) && (found == null || found.has(v)))
    return {
        versions: vers.map(ver => ({ version: ver, name: abvphp.get_cname_from_book(ver, session.gb == 1) || ver, isRtl: ver == 'bhs' })),
        layout: ps.show_mode == 2 || ps.show_mode == 4 ? 'interleaved' : 'side',
        isLabel: true,
        labelWidth: '6.5em',
        snOpt: { offShowsAll: true }, // 搜 SN 時會強制帶 SN，SN 關閉也要顯示
        cellExtra: () => $('<span class="sd-copy" title="copy"><i class="fa fa-files-o"></i></span>'),
    }
}

/**
 * qsb 的經文 → VerseGrid 的列 (一節一列)；每個譯本一次 cvt_others
 * 注腳設定「直接載入」時，先取注腳內容 (與經文區、交互參照相同，例 中文標準譯本)
 * @param {SearchRow[]} rows
 * @returns {Promise<import('./VerseGrid.es2023.js').VerseRow[]>}
 */
async function toVerseRowsAsync(rows) {
    const names = BibleConstantHelper.getBookNameArrayChineseShort()
    /** @type {Map<string, [number, number, number, string][]>} */
    const recordsOfVer = new Map()
    for (const row of rows) {
        for (const t of row.texts) {
            if (!recordsOfVer.has(t.ver)) recordsOfVer.set(t.ver, [])
            recordsOfVer.get(t.ver).push([row.ibook + 1, row.chap, row.sec, t.bible_text])
        }
    }
    /** @type {Map<string, import('./DText.js').DText[]>} "ver|book.chap.sec" → DText[] */
    const dtextsOf = new Map()
    const isFootLoad = TPPageState.s.foot_note_show_method == 2
    await Promise.all([...recordsOfVer].map(async ([ver, records]) => {
        const dtexts_with_addr = cvt_others(ver, records)
        if (isFootLoad) await queryFootsAsync(dtexts_with_addr, ver).catch(e => console.warn('注腳載入失敗', ver, e)) // 失敗仍顯示經文 (注腳維持【n】)
        for (const [book, chap, sec, dtexts] of dtexts_with_addr) dtextsOf.set(`${ver}|${book}.${chap}.${sec}`, dtexts)
    }))

    const dtextsAt = (ver, book, chap, sec) => dtextsOf.get(`${ver}|${book}.${chap}.${sec}`)
    return rows.map(row => {
        const book = row.ibook + 1
        const cells = {}
        for (const t of row.texts) {
            const dtexts = dtextsAt(t.ver, book, row.chap, row.sec) ?? []
            // 格內也有節碼 (與經文區、交互參照一致，複製對照表時才有)
            // 併入上節 ("a")：這格只寫「（併入上節）」；下一節 (同一批有取到的) 併入這節 → 節碼 20-21
            if (isMergedWithPrev(dtexts)) {
                cells[t.ver] = [{ book, chap: row.chap, sec: row.sec, dtexts: mergedPlaceholderDTexts(), hideVerseNumber: true }]
                continue
            }
            let verseLabel = String(row.sec)
            for (let sec = row.sec + 1; isMergedWithPrev(dtextsAt(t.ver, book, row.chap, sec)); sec++) verseLabel = extendVerseLabel(verseLabel, sec)
            cells[t.ver] = [{ book, chap: row.chap, sec: row.sec, dtexts, verseLabel }]
        }
        return {
            label: `${names[row.ibook]} ${row.chap}:${row.sec}`,
            labelAttrs: { 'data-goto': JSON.stringify([book, row.chap, row.sec]), title: gbText('經文區跳到這裡') },
            cells,
        }
    })
}

/**
 * 查詢的 SN、關鍵字加 .seKey (渲染後在 DOM 上標，SN 的數字不動)
 * @param {JQuery<HTMLElement>} $root
 * @param {{sn?: string, words?: string}} keys sn 例 `80` `652a`；words 以空白分隔
 */
export function markSearchKeys($root, keys) {
    if (keys.sn != null) {
        $root.find('.sn').each((i, e) => {
            if (e.getAttribute('sn') == keys.sn && !/^WT/.test(e.getAttribute('tp2') ?? '')) e.classList.add('seKey')
        })
    }

    const words = (keys.words ?? '').split(/[\s־]+/)
        .filter(w => w.length > 0 && !/^(and|or|not)$/i.test(w))
    if (words.length == 0) return
    const re = new RegExp(words.map(w => isHebrewKeyword(w) ? hebLooseRegexSource(w) : greekLooseRegexSource(w)).join('|'), 'gi')

    for (const content of $root.find('.verseContent').get()) {
        const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT)
        const nodes = []
        for (let n = walker.nextNode(); n != null; n = walker.nextNode()) nodes.push(n)
        for (const n of nodes) {
            if (n.parentElement?.closest('.sn')) continue
            const matches = [...n.data.matchAll(re)].filter(m => m[0].length > 0)
            if (matches.length == 0) continue
            const frag = document.createDocumentFragment()
            let last = 0
            for (const m of matches) {
                frag.append(n.data.slice(last, m.index), $('<span class="seKey">').text(m[0])[0])
                last = m.index + m[0].length
            }
            frag.append(n.data.slice(last))
            n.replaceWith(frag)
        }
    }
}
