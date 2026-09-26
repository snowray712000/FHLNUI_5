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

/**
 * @typedef {import('./SearchSession_es2023.js').SearchRow} SearchRow
 */

/*
### 搜尋結果 dialog (取代原本下方的 #fhlMidBottomWindow)
- 非模態：點經文位置，主畫面跳過去，dialog 留著
- 同一時間只有一個；再搜尋時，沿用已開的 dialog

<div.search-dlg>
  <form.sd-bar> input 關鍵字、搜尋按鈕、狀態 </form>
  <div.sd-groups> 分類 (整卷聖經、舊約、新約、摩西五經 …)，只列有結果的 </div>
  <div.sd-books> 目前分類下，有結果的書卷 </div>
  <div#searchDlgResults.sd-results>
    <div.sd-verse>
      <a.sd-addr>雅 1:2</a>
      <div.sd-texts>
        <div.sd-text-row> <span.sd-ver>和合本</span> <span.sd-text>…</span> <span.sd-copy/> </div>
      </div>
    </div>
  </div>
</div>
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
            html: `<div class="search-dlg">
                <form class="sd-bar">
                    <input class="sd-input" type="search" placeholder="${gbText('關鍵字、G80、#羅 1:3|')}">
                    <button class="sd-go" type="submit"><i class="fa fa-search"></i></button>
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
        }).on('click', '.sd-addr', function () {
            that.#goto(parseInt($(this).attr('ibook')), parseInt($(this).attr('chap')), parseInt($(this).attr('sec')))
        }).on('click', '.sd-copy', function () {
            const row = $(this).closest('.sd-text-row')
            const addr = row.closest('.sd-verse').find('.sd-addr').text()
            const text = row.find('.sd-text').text()
            copy_text_to_clipboard(async () => `${addr} ${text}`)
        }).on('click', '.seSN', function (e) {
            queryDictionaryAndShowAtDialogAsync({ sn: $(this).attr('sn'), isOld: $(this).attr('tp') == 'H' })
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
        if (session.kind == 'reference' || session.verses.length == 0) return

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
        let rows
        try {
            rows = await session.loadMoreAsync()
        } catch (e) {
            if (!session.isAborted) console.error(e)
            rows = null
        } finally {
            spinner$.remove()
        }
        if (session !== this.session || token !== this.#loadingToken) return // 範圍已改變，由新的 applyFilter 負責
        this.#loadingToken = null
        if (rows == null) return

        const isMultiVersion = session.kind == 'sn' ? false : session.versions.length > 1
        const keys = session.kind == 'sn' ? { sn: session.sn } : { words: session.kind == 'keyword' ? session.keyword : '' }
        results$.append(rows.map(row => renderRow(row, isMultiVersion, keys, session.gb)))

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

/**
 * @param {SearchRow} row
 * @param {boolean} isMultiVersion
 * @param {{sn?: string, words?: string}} keys
 * @param {0|1} gb
 */
function renderRow(row, isMultiVersion, keys, gb) {
    const names = BibleConstantHelper.getBookNameArrayChineseShort()
    const verse$ = $('<div class="sd-verse">')
    $('<a class="sd-addr">')
        .attr({ ibook: row.ibook, chap: row.chap, sec: row.sec })
        .text(`${names[row.ibook]} ${row.chap}:${row.sec}`)
        .appendTo(verse$)

    const texts$ = $('<div class="sd-texts">').appendTo(verse$)
    for (const t of row.texts) {
        const row$ = $('<div class="sd-text-row">').appendTo(texts$)
        if (isMultiVersion) {
            $('<span class="sd-ver">').text(abvphp.get_cname_from_book(t.ver, gb == 1) || t.ver).appendTo(row$)
        }
        $('<span class="sd-text">').attr('dir', t.ver == 'bhs' ? 'rtl' : null).html(colorBibleText(t.bible_text, keys)).appendTo(row$)
        $('<span class="sd-copy" title="copy"><i class="fa fa-files-o"></i></span>').appendTo(row$)
    }
    return verse$
}

/**
 * 經文中的 SN 轉為可點的 span，關鍵字上色
 * 取代 qsbphp.create_color_span_from_bible_text
 * @param {string} bible_text qsb 回傳的，可能含 `<WG80>`、`<WTG5661>`、`{<WG3752>}`
 * @param {{sn?: string, words?: string}} keys sn 例 `80` `652a`；words 以空白分隔
 * @returns {string} html
 */
export function colorBibleText(bible_text, keys) {
    const reSn = /(\{)?<W(T?)([HG])(\d+)(a?)>(\})?/gi
    let html = bible_text.replace(reSn, (s0, braceL, sT, sHG, sNum, sA, braceR) => {
        if ((braceL != null) != (braceR != null)) {
            // 大括號不成對，當成一般文字處理
            braceL = braceR = undefined
        }
        const sn = `${parseInt(sNum)}${sA}`
        const str1 = sT.toUpperCase() == 'T' ? `(${sn})` : `<${sn}>`
        const str2 = braceL != null ? `{${str1}}` : str1
        const span = $('<span class="seSN sebutton sn">').text(str2).attr({ sn, tp: sHG.toUpperCase() })
        if (sT.toUpperCase() != 'T' && keys.sn != null && keys.sn == sn) span.addClass('seKey')
        return span[0].outerHTML
    })

    const words = (keys.words ?? '').split(/[\s\u05be]+/)
        .filter(w => w.length > 0 && !/^(and|or|not)$/i.test(w))
    if (words.length == 0) return html

    // 只換標籤以外的文字，避免改到 <span sn="..."> 之類的屬性
    const reWords = new RegExp(words.map(w => isHebrewKeyword(w) ? hebLooseRegexSource(w) : greekLooseRegexSource(w)).join('|'), 'gi')
    return html.split(/(<[^>]*>)/).map(part =>
        part.startsWith('<') ? part : part.replace(reWords, m => `<span class="seKey">${m}</span>`)
    ).join('')
}
