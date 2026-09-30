/**
 * 上方一列的工具列 (nav#fhlTopMenu > div#fhlToolBar)，骨架在 appSkeleton.es2023.js。
 *
 * 原本是兩列：上面標題列 (標題、版本、滑過才出現的「讀經、教學…」選單、問題回報)，
 * 下面工具列 (?、視窗按鈕、書卷章、搜尋)。現在合成一列：
 *
 * ≡ logo 信望愛聖經工具 v… ⟳ | 書卷章 ▼ | 搜尋 ▦ ? ⛶ ✉ ⋮ ▥
 *
 * - ≡ / ▥ 開關左、右側欄 (#fhlLeftWindowControl / #fhlInfoWindowControl，事件在 WindowControl)
 * - ▦ 信望愛資源 (原本滑過才出現的 7 組連結)，改成點了才開，不會擋到其它功能；連結與「?」說明在 Resources.es2023.js
 * - 窄的時候 (見 fhl.css 的 @media)，.tb-wide 的按鈕收進 ⋮，搜尋框收成 🔍 (按了才展開蓋住整列)
 * - 版面寬窄全交給 css，這裡只處理開關
 */
import { ensureResourceHelpAsync } from './Resources.es2023.js'

export class TopBar {
    static #s = null
    /** @returns {TopBar} */
    static get s() { if (!this.#s) this.#s = new TopBar(); return this.#s; }

    init() {
        const $bar = $('#fhlToolBar')
        $('#resourcesMenuBtn').on('click', () => this.togglePanel('#resourcesPanel', '#resourcesMenuBtn'))
        $('#moreMenuBtn').on('click', () => this.togglePanel('#moreMenu', '#moreMenuBtn'))
        $('#tbBackdrop').on('click', () => this.closePanels())
        $('#resourcesPanel').on('click', 'a', () => this.closePanels())
        $(document).on('keydown', e => {
            if (e.key != 'Escape') return
            this.closePanels()
            if ($bar.hasClass('search-open') && !$('#searchTool .st-input').val()) this.closeSearch()
        })

        $('#moreMenu').on('click', '[data-act]', e => {
            const act = e.currentTarget.dataset.act
            this.closePanels()
            switch (act) {
                case 'resources': this.togglePanel('#resourcesPanel', '#moreMenuBtn'); break
                case 'help': $('#help').trigger('click'); break
                case 'fullscreen': $('#fullscreenControl').trigger('click'); break
                case 'versions': $('#appVerNum').trigger('click'); break
                case 'reload': $('#force-reload button').trigger('click'); break
                case 'report': break // 是 <a href=mailto>，照常開
            }
        })

        // 窄的時候，搜尋框收成 🔍
        $('#searchToggle').on('click', () => this.openSearch())
        $('#searchTool').on('focusout', () => {
            // 焦點離開搜尋框 (例 搜尋結果 dialog 開了) 就收起來
            setTimeout(() => {
                if (!$('#searchTool')[0].contains(document.activeElement)) this.closeSearch()
            }, 0)
        })
    }
    /** @param {number} gb 1: 簡體 */
    setTitle(gb) {
        $('#title .t-full').text(gb === 1 ? '信望爱圣经工具' : '信望愛聖經工具')
        $('#title .t-short').text(gb === 1 ? '圣经工具' : '聖經工具')
    }
    /** @param {string} ver 例 6.11.11 */
    setVersion(ver) {
        $('#appVerNum').text('v' + ver)
        $('#moreMenu .mm-ver').text('v' + ver)
    }
    /** 問題回報的 mailto，⋮ 選單裡的也一起設 */
    setReportHref(href) {
        $('#problemsReport').attr('href', href)
        $('#moreMenu [data-act=report]').attr('href', href)
    }
    /**
     * 手動更新按鈕的文字 (已最新：手動更新；有新版：更新至 x.y.z)
     * @param {string} text
     * @param {boolean} hasNew 有新版時，寬的時候也要把文字顯示出來
     */
    setReloadText(text, hasNew) {
        $('#moreMenu .mm-reload').text(text)
        $('#fhlToolBar').toggleClass('has-new-ver', hasNew)
    }

    /**
     * @param {string} panel
     * @param {string} btn 面板對齊這個按鈕的右緣
     */
    togglePanel(panel, btn) {
        const $p = $(panel)
        const isOpen = !$p.prop('hidden')
        this.closePanels()
        if (isOpen) return

        $p.prop('hidden', false)
        $('#tbBackdrop').prop('hidden', false)
        $(btn).addClass('open')
        if (panel == '#resourcesPanel') ensureResourceHelpAsync($p[0]) // 連結旁的「?」，第一次開才讀說明
        // 面板右緣對齊按鈕右緣；太寬 (手機) 就由 css 的 max-width 限制，靠右
        const btnRight = $(btn)[0].getBoundingClientRect().right
        const right = Math.max(4, window.innerWidth - btnRight)
        $p.css('right', Math.min(right, window.innerWidth - $p.outerWidth() - 4) + 'px')
    }
    closePanels() {
        $('#fhlTopMenu .tb-panel').prop('hidden', true)
        $('#tbBackdrop').prop('hidden', true)
        $('#fhlToolBar .tb-btn.open').removeClass('open')
    }
    /** 窄的時候展開搜尋框並取得焦點 (寬的時候搜尋框本來就在) */
    openSearch() {
        $('#fhlToolBar').addClass('search-open')
        $('#searchTool .st-input').trigger('focus')
    }
    closeSearch() {
        $('#fhlToolBar').removeClass('search-open')
    }
}
