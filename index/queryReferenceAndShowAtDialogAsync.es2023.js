// TODO: 還沒完全重構

import { splitReference } from "./splitReference.es2023.js" // 經文章節，成為ref
import { qsb } from "./api/qsb.js" // 為了引入 DQsbParam, DQsbResult
import { DialogHtml, contentFontK } from "./DialogHtml.es2023.js"
import { ColWidth } from "./ColWidth.es2023.js"
import { showRefChooseBar, showFloatBar } from "./RefChooseBar.es2023.js"
import { SnFilter } from "./SnFilter.es2023.js"
import { renderVerseGrid, readLabelW, addLabelHandle, isMergedWithPrev, extendVerseLabel, mergedPlaceholderDTexts } from "./VerseGrid.es2023.js"
import { cvtAddrsToRef } from "./cvtAddrsToRef.es2023.js"
import { BibleConstant } from "./BibleConstant.es2023.js"
import { assert } from "./assert_es2023.js"
import { FhlLecture } from "./FhlLecture.es2023.js"
import { FhlInfo } from "./FhlInfo.es2023.js"
import { ViewHistory } from "./ViewHistory.es2023.js"
import { TPPageState } from "./TPPageState.es2023.js"
import { BookSelect } from "./BookSelect.es2023.js"
import { triggerGoEventWhenPageStateAddressChange } from "./triggerGoEventWhenPageStateAddressChange.es2023.js"

import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js"
import { cvt_others } from "./cvt_others.js"
import { queryFootsAsync } from "./queryFootsAsync.js"
import { showFootPopupAsync } from "./showFootPopupAsync.es2023.js"

/**
 * @typedef {Object} DQueryReferenceParam
 * @prop {DAddress[]} [addrs] - 經文位置陣列，優先使用
 * @prop {string} [addrsDescription] - 經文位置描述，若沒有 addrs，則使用這個字串去 qsb 查詢
 * @prop {string[]} [versions] - 經文版本，預設目前顯示的譯本 (ps.version)
 * @prop {string} [version] - (舊) 只在 ps.version 為空時用
 * @prop {number} [bookDefault] - 預設書卷，1-based，預設 45 (羅馬書)，用於 addrsDescription 的查詢
 * @prop {MouseEvent} [event] - 點擊事件，若有，則會根據 TPPageState.s.reference_method 的設定來決定顯示方式
 * @prop {{book: number, chap: number, sec: number, secEnd?: number}} [focusAddr] - 開 dialog 後，捲到並標示這幾節 (例：「上下文」開整章，標示被點的那節)
 * @prop {number} [method] - 顯示方式，0: 每次詢問, 1: 一律預覽 (小視窗), 2: 一律前往 (主畫面跳過去)
 */

/**
 * 開發給 原字Parsing時，點擊原文字，要跳出字典內容
 * 像串珠功能，就是直接有 addrsDescription, 而非 addrs[]
 * @param {DQueryReferenceParam} jo 
 * @returns {Promise<void>}
 */
export function queryReferenceAndShowAtDialogAsync(jo) {
    if (jo.addrs == null && jo.addrsDescription == null) {
        throw new Error("assert .addrs != null || .addrDescription != null")
    }
    get_first_addr(jo)

    if (jo.event == null) {
        show_in_dialog() // 原本程式碼
        return
    } else {
        const reference_method = jo.method ?? TPPageState.s.reference_method
        if (reference_method == 0) {
            show_dialog_choose_method()
        } else if (reference_method == 1) {
            show_in_dialog()
        } else if (reference_method == 2) {
            show_in_embed()
        }
    }

    return
    function show_dialog_choose_method() {
        // 點擊處旁邊浮出 [預覽] [前往] [?]，不開對話框 (RefChooseBar)
        const anchor = jo.event.target.closest?.('.ref') ?? jo.event.target
        showRefChooseBar(anchor, {
            onPreview: show_in_dialog,
            onGoto: () => show_in_embed(),
            onHelp: () => show_help_dialog(anchor),
        })
    }
    function show_help_dialog(anchor) {
        let ps = TPPageState.s

        let htmlContent = `<ul>
        <li><b>預覽</b>：跳出小視窗顯示這段經文，原本讀的地方不動。</li>
        <li><b>前往</b>：主畫面直接跳到這段範圍的第一節。</li>
        </ul><hr/>
        目前設定值：<select id="reference_method">
            <option value="0">每次詢問</option>
            <option value="1">一律預覽</option>
            <option value="2">一律前往</option>
        </select>`
        let position = { my: "right top", at: "right top", of: $(anchor) }

        let dlg = new DialogHtml()
        dlg.showDialog({
            html: `<div>${htmlContent}</div>`,
            getTitle: () => "幫助",
            position: position,
            width: window.innerWidth * 0.3,
            registerEventWhenShowed: dlg => {
                // 設定面板也有同 id 的下拉，這裡只動對話框裡的
                dlg.find('#reference_method').val(TPPageState.s.reference_method); // 初始化為當前狀態

                // 更新設定值時
                dlg.on('change', '#reference_method', function () {
                    let ps = TPPageState.s
                    ps.reference_method = parseInt($(this).val());
                    ps.saveToLocalStorage();
                    $('#settingsScrollDiv #reference_method').val(ps.reference_method); // 設定面板同步
                });

            }
        })
    }
    /** @param {{book: number, chap: number, verse: number}} [addr] 預設是查詢的第一節 */
    function show_in_embed(addr = get_first_addr(jo)) {

        let ps = TPPageState.s
        ps.bookIndex = addr.book
        ps.chap = addr.chap
        ps.sec = addr.verse // 早期「節」沒有統一用 .sec 或 .verse

        triggerGoEventWhenPageStateAddressChange(ps);

        BookSelect.s.render();
        FhlLecture.s.render();
        FhlInfo.s.render(ps);
        FhlLecture.s.selectLecture(null, null, ps.sec);
        ViewHistory.s.render();
        $(document).trigger('chapchanged') // 更新網址 hash (pushState)，alt+←/→ 才回得去
    }
    /** jo.focusAddr：標示並捲到那幾節 (版面寬度由 dialog 決定，晚一個 frame 才量得準) @param {HTMLElement} host */
    function focus_addr(host) {
        const f = jo.focusAddr
        if (f == null) return
        const end = f.secEnd ?? f.sec
        const hits = [...host.querySelectorAll('.lec')].filter(a => +a.getAttribute('book') == f.book && +a.getAttribute('chap') == f.chap
            && +a.getAttribute('sec') >= f.sec && +a.getAttribute('sec') <= end)
        hits.forEach(a => a.classList.add('selected'))
        requestAnimationFrame(() => hits[0]?.scrollIntoView({ block: 'center' }))
    }
    function show_in_dialog() {
        const ps = TPPageState.s
        const addrsDescription = jo.addrsDescription != null ? jo.addrsDescription : cvtAddrsToRef(jo.addrs, '羅')
        // 目前顯示的譯本 (以前寫死 unv，docs/z260930d P5)
        const versions = jo.versions ?? (ps.version?.length ? ps.version : [jo.version ?? 'unv'])
        const bookDefault = jo.bookDefault ?? 45 // 1-based，預設羅馬書；qstr 沒寫書卷時用

        Promise.all(versions.map(ver => qsb({ qstr: addrsDescription, ver, bookDefault })
            .then(r => ({ ver, r }), () => ({ ver, r: null }))))
            .then(results => when_all_versions(results))

        /** @param {{ver: string, r: DQsbResult}[]} results */
        async function when_all_versions(results) {
            const ok = results.filter(a => a.r?.status == 'success' && a.r.record?.length)
            if (ok.length == 0) {
                new DialogHtml().showDialog({ html: '<div>查無經文</div>', getTitle: () => addrsDescription, registerEventWhenShowed: () => { } })
                return
            }

            /** @type {Map<string, Map<string, DText[]>>} 譯本 → "book.chap.sec" → DText[] */
            const byVer = new Map()
            /** 經文位置，照查詢的順序 (第一個有結果的譯本為準，其它譯本多出來的接在後面) */
            const order = []
            const seen = new Set()
            for (const { ver, r } of ok) {
                /** @type {[number, number, number, string][]} */
                const records = r.record.map(a => [a.book ?? BibleConstantHelper.getBookId(a.chineses), a.chap, a.sec, a.bible_text])
                const dtexts_with_addr = cvt_others(ver, records)
                // foot 注腳 csb 中文標準譯本 cnet NET聖經中譯本 lcc 呂振中譯本
                if (ps.foot_note_show_method == 2) await queryFootsAsync(dtexts_with_addr, ver)
                const m = new Map()
                for (const [book, chap, sec, dtexts] of dtexts_with_addr) {
                    const key = `${book}.${chap}.${sec}`
                    m.set(key, dtexts)
                    if (!seen.has(key)) { seen.add(key); order.push([book, chap, sec]) }
                }
                byVer.set(ver, m)
            }

            const all = ok.map(a => a.ver)
            // 「只顯示第一個譯本」(記在 localStorage)；多譯本時才有這個選項
            const isFirstOnly = () => all.length > 1 && readFirstOnly()
            const htmlOf = () => render_reference_grid(order, byVer, isFirstOnly() ? all.slice(0, 1) : all, ps)
            const bar = all.length > 1
                ? `<label class="ref-dlg-bar"><input type="checkbox" class="ref-first-only"${isFirstOnly() ? ' checked' : ''}> 只顯示第一個譯本</label>`
                : ''
            const html = `<div>${bar}${htmlOf()}</div>`
            const cntVer = isFirstOnly() ? 1 : all.length
            const isSide = !(ps.show_mode == 2 || ps.show_mode == 4)

            let dlg = new DialogHtml()
            dlg.showDialog({
                html: html,
                sizeKey: 'ref',
                getTitle: () => addrsDescription,
                // 並排：譯本多就寬一點 (標籤欄 + 每個譯本約 320px)
                width: Math.min(window.innerWidth - 16, (isSide && cntVer > 1 ? 120 + 320 * cntVer : 560) * contentFontK()),
                registerEventWhenShowed: dlg => {
                    applyColWidth(dlg[0])
                    dlg.on('change', '.ref-first-only', ev => {
                        writeFirstOnly(/** @type {HTMLInputElement} */ (ev.currentTarget).checked)
                        dlg.find('.ref-dlg').replaceWith(htmlOf())
                        applyColWidth(dlg[0])
                    })
                    // 注腳「點擊顯示」：與經文區相同
                    dlg.on('click', '.ft', ev => showFootPopupAsync(ev))
                    // 節碼：看整章；也接受只有 addr-desc 的 .ref (注腳裡的交互參照)
                    dlg.on('click', '.ref', ev => {
                        const $t = $(ev.currentTarget)
                        const data = $t.attr('addr-data')
                        if (data) queryReferenceAndShowAtDialogAsync({ addrs: JSON.parse(data), event: ev })
                        else if ($t.attr('addr-desc')) queryReferenceAndShowAtDialogAsync({ addrsDescription: $t.attr('addr-desc'), event: ev })
                    })
                    // 經文位置：浮出 上下文｜前往 (上下文 = 另開那一章的 dialog，捲到這幾節；前往 = 經文區跳到那裡)
                    dlg.on('click', '[data-goto]', ev => {
                        const [book, chap, verse, secEnd] = JSON.parse($(ev.currentTarget).attr('data-goto'))
                        showFloatBar(ev.currentTarget, [
                            {
                                label: '上下文', title: '另開一個視窗，顯示這一章，讀經位置不動',
                                onPick: () => queryReferenceAndShowAtDialogAsync({
                                    addrs: BibleConstantHelper.generateAddressesTpF(book, chap),
                                    focusAddr: { book, chap, sec: verse, secEnd },
                                }),
                            },
                            { label: '前往', title: '經文區直接跳到這裡', onPick: () => show_in_embed({ book, chap, verse }) },
                        ])
                    })
                    focus_addr(dlg[0])
                }
            })
        }
    }

}

const LABEL_TPL = 'var(--vg-label-w, max-content)' // 出處欄寬：表頭可拖 (記錄與搜尋結果共用)

/**
 * 並排多譯本時的欄寬 (自動 / 拖表頭自訂 / 雙擊回自動，與經文區、搜尋結果共用紀錄)；單欄時清掉
 * @param {HTMLElement} host 對話框內容 (--vg-tpl 放這裡)
 */
function applyColWidth(host) {
    const grid = host.querySelector('.verse-grid.vg-side')
    const getHeadCells = () => [...host.querySelectorAll('.vg-head[data-ver]')]
    const heads = getHeadCells()
    // 出處欄寬 (與搜尋結果共用紀錄)：表頭最左空格右邊的分隔線可拖；交錯排列沒有表頭 / 出處欄
    const savedW = readLabelW()
    if (savedW) host.style.setProperty('--vg-label-w', savedW + 'px'); else host.style.removeProperty('--vg-label-w')
    if (grid) addLabelHandle(grid.querySelector('.vg-head:not([data-ver])'), host)
    if (!grid || heads.length < 2) {
        host.style.removeProperty('--vg-tpl')
        return
    }
    new ColWidth({ host, varName: '--vg-tpl', versions: heads.map(h => h.dataset.ver), labelTpl: LABEL_TPL + ' ', getHeadCells, measureRoot: grid }).apply()
}

const FIRST_ONLY_KEY = 'fhlRefDlgFirstOnly'
/** 交互參照對話框「只顯示第一個譯本」 */
function readFirstOnly() {
    try { return localStorage.getItem(FIRST_ONLY_KEY) == '1' } catch { return false }
}
/** @param {boolean} isOn */
function writeFirstOnly(isOn) {
    try { localStorage.setItem(FIRST_ONLY_KEY, isOn ? '1' : '0') } catch { /* 無痕等，不記也能用 */ }
}

/**
 * 交互參照的內容：連續的節合成一列 (像 mode 3 一段一列)，左側標籤欄是經文位置 (點了經文區跳過去)；
 * 並排 / 交錯照目前的顯示模式；節碼是 .ref (點了看整章)
 * @param {[number, number, number][]} order 經文位置 (查詢的順序)
 * @param {Map<string, Map<string, DText[]>>} byVer
 * @param {string[]} versions
 * @param {TPPageState} ps
 * @returns {string} html
 */
function render_reference_grid(order, byVer, versions, ps) {
    const names = BibleConstantHelper.getBookNameArrayChineseShort()
    // 連續：同書同章、節 +1
    /** @type {[number, number, number][][]} */
    const groups = []
    for (const addr of order) {
        const last = groups[groups.length - 1]?.at(-1)
        if (last && last[0] == addr[0] && last[1] == addr[1] && last[2] + 1 == addr[2]) groups[groups.length - 1].push(addr)
        else groups.push([addr])
    }
    const labelOf = g => {
        const [b, c, v] = g[0], e = g[g.length - 1][2]
        return `${names[b - 1]}${c}:${v}${e != v ? '-' + e : ''}`
    }

    const rows = groups.map(g => {
        /** @type {Record<string, import('./VerseGrid.es2023.js').VerseItem[]>} */
        const cells = {}
        for (const ver of versions) {
            const m = byVer.get(ver)
            const verses = []
            for (const [book, chap, sec] of g) {
                const dtexts = m.get(`${book}.${chap}.${sec}`)
                if (dtexts == null) continue
                // 併入上節 ("a")：上一節節碼變成 20-21，本節不顯示；這組從這節開始 (例 #西2:21|) → 顯示「（併入上節）」
                if (isMergedWithPrev(dtexts)) {
                    const prev = verses[verses.length - 1]
                    if (prev) prev.verseLabel = extendVerseLabel(prev.verseLabel, sec)
                    else verses.push({ book, chap, sec, dtexts: mergedPlaceholderDTexts(), hideVerseNumber: true })
                    continue
                }
                verses.push({ book, chap, sec, dtexts, verseLabel: String(sec) })
            }
            cells[ver] = verses
        }
        return { label: labelOf(g), labelAttrs: { 'data-goto': JSON.stringify([...g[0], g[g.length - 1][2]]), title: '看上下文，或經文區跳到這裡' }, cells }
    })

    const isGb = ps.gb == 1
    const $grid = renderVerseGrid({
        versions: versions.map(ver => ({ version: ver, name: abvphp.get_cname_from_book(ver, isGb) || ver, isRtl: ver == 'bhs' })),
        rows,
        layout: ps.show_mode == 2 || ps.show_mode == 4 ? 'interleaved' : 'side',
        isHeader: versions.length > 1 || !(ps.show_mode == 2 || ps.show_mode == 4), // 並排單譯本也要表頭，出處欄寬才有地方拖
        isLabel: true,
        labelWidth: LABEL_TPL,
        numberDTextOf: v => ({ isRef: 1, refDescription: `${names[v.book - 1]}${v.chap}`, refAddresses: BibleConstantHelper.generateAddressesTpF(v.book, v.chap) }),
    })
    // .sn-filter-scope：SN 篩選設定改變時 SnFilter.applyAll 會重新套用
    const $container = $('<div class="sn-filter-scope ref-dlg">').append($grid)
    SnFilter.s.apply($container)
    return $container[0].outerHTML
}

/**
 * @param {DQueryReferenceParam} jo 
 */
function get_first_addr(jo) {
    if (jo.addrs == null && jo.addrsDescription == null) {
        throw new Error("assert .addrs != null || .addrDescription != null")
    }

    // 先 jo.addrs
    if (jo.addrs != null && jo.addrs.length > 0) {
        return jo.addrs[0]
    }

    // 若沒有 jo.addrs, 用 jo.addrsDescription 
    const desc = jo.addrsDescription
    const splitResult = splitReference(desc)
    
    // console.log(JSON.stringify(splitResult));    
    return splitResult?.[0]?.refAddresses?.[0]
}