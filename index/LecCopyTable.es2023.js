/**
 * 經文反白與複製 (docs/z260930d 第六節 2、3；P7 起搜尋結果、交互參照也用)
 * - 範圍 (Scope)：經文區 #lecMain、搜尋結果 .sd-results、交互參照 .ref-dlg；選取要在同一個範圍內
 * - 在範圍內原生反白後，選取範圍旁浮出「複製對照表」按鈕；按了才複製 (不長按、不覆蓋右鍵)
 * - 列 = 起訖節之間的節；欄 = 選取碰到的譯本；格 = 真的反白到的節 (沒反白到的留空)。
 *   並排 (DOM 欄優先) 時就是矩形；只在一欄內選 → 只有該譯本，約等於原生 Ctrl+C
 * - 起訖那兩節照反白的位置截斷 (不一定整節)，但一律帶節碼
 * - 選到就是看到的：隱藏的 (display:none，例 .sn-hidden) 不複製；注腳沒載入就是 【n】
 * - 並排多譯本 → text/html <table>：mode 1 一節一列 (併入上節用 rowspan)、mode 3 如所見一段一列 + text/plain (tab 分隔)；單一譯本 → 如所見 (同段的節接在一起，換段才換行)
 * - 交錯 (mode 2/4) 多譯本 → 如所見，一欄多列：每個 .paragraph (一個譯本的一節或一段) 一列
 * - 跨欄 (並排、選到 2 個以上譯本)：原生反白是照 DOM 順序畫的 (第一欄畫到底、中間整欄…)，與實際複製的不同，
 *   所以把原生反白變透明，改用 CSS Custom Highlight 只畫要複製的那塊；Ctrl+C 也改成複製對照表
 * - Ctrl+C (沒跨欄)：仍是反白的內容，但 html 只留顏色 (瀏覽器原生會帶一堆計算後的樣式，貼到 pptx 不換行)
 *
 * - 搜尋結果、交互參照 (VerseGrid)：一律如所見一段一列 (.paragraph 的 data-row，各批 grid 各自編號)；
 *   左側的經文位置 (標籤欄) 也複製：並排多譯本 → 表格第一欄；單一譯本、交錯 → 每列開頭
 *
 * 並排是 CSS Grid (.lec-grid / .verse-grid > .vercol display: contents)，DOM 仍一欄一欄 (欄優先)
 */
import { el } from './auDom.es2023.js'
import { TPPageState } from './TPPageState.es2023.js'

/**
 * @typedef {{ lecs: HTMLElement[], rs: number }} Cell 一格的節 (mode 3 一段可多節)；空陣列 = 空格 (沒反白到)
 * @typedef {{ el: HTMLElement, isSide: boolean, byParagraph: boolean }} Scope 可複製的範圍；isSide 並排；byParagraph 一段一列 (否則一節一列)
 * @typedef {{ scope: Scope, versions: string[], columns: Cell[][], labels: string[] | null, range: Range, hit: HTMLElement[] }} CopyTable
 *   hit = 真的反白到的 .lec (畫面順序)；labels = 每列的經文位置 (有標籤欄時)
 * @typedef {{ t: string, c?: string }} Run 一段字與顏色 (c 省略 = 預設色)；t == '\n' 是換行
 */

const HIGHLIGHT_NAME = 'lec-copy'
const SCOPE_SEL = '#lecMain, .sd-results, .ref-dlg'

export class LecCopyTable {
    static #s = null
    /** @returns {LecCopyTable} */
    static get s() { if (!this.#s) this.#s = new LecCopyTable(); return this.#s }

    /** @type {HTMLButtonElement} */
    #btn = null
    /** @type {Range} 最近一次有效的選取 */
    #range = null
    /** @type {Scope} #range 所在的範圍 */
    #scope = null
    /** @type {HTMLElement} 加了 .lct-crossed 的範圍 */
    #crossedEl = null
    /** @type {CopyTable} 跨欄時的對照表；沒跨欄為 null */
    #crossed = null
    #pressing = false
    /** @type {Range} 按下按鈕當下的選取；平板點按鈕可能先清掉選取、#range 被 #hide 清空 */
    #pressRange = null
    /** @type {Scope} */
    #pressScope = null
    #selTimer = 0
    #rafScroll = 0

    init() {
        if (this.#btn) return
        this.#btn = el('button', {
            type: 'button', class: 'lec-copy-table', hidden: true, title: '把反白的經文複製成對照表 (含節碼)',
            onpointerdown: e => { e.preventDefault(); this.#pressing = true; this.#pressRange = this.#range; this.#pressScope = this.#scope }, // 電腦：不讓選取消失
            onpointercancel: () => { this.#pressing = false },
            onpointerleave: () => { this.#pressing = false },
            onclick: () => this.#copyByButton(),
        }, '複製對照表')
        document.body.append(this.#btn)

        document.addEventListener('selectionchange', () => {
            if (this.#pressing) return
            // 節流 (不是 debounce)：拖曳中也要即時換掉誤導的原生反白；fire 時讀的是當下的選取
            if (this.#selTimer) return
            this.#selTimer = setTimeout(() => { this.#selTimer = 0; this.#update() }, 40)
        })
        // 經文區、對話框捲動時跟著選取範圍移動
        document.addEventListener('scroll', () => {
            if (this.#btn.hidden) return
            cancelAnimationFrame(this.#rafScroll)
            this.#rafScroll = requestAnimationFrame(() => this.#place())
        }, true)
        document.addEventListener('copy', e => this.#onCopy(e))
    }

    #update() {
        const sel = selectionInScope()
        const table = sel ? buildTable(sel.scope, sel.range) : null
        if (table == null) return this.#hide()
        this.#range = sel.range.cloneRange()
        this.#scope = sel.scope
        this.#setCrossed(table.scope.isSide && table.versions.length > 1 ? table : null)
        this.#btn.hidden = false
        this.#place()
    }
    #hide() {
        this.#btn.hidden = true
        this.#range = null
        this.#scope = null
        this.#setCrossed(null)
    }
    /** @param {CopyTable} table */
    #setCrossed(table) {
        this.#crossed = table
        const old = this.#crossedEl
        if (old) {
            old.classList.remove('lct-crossed')
            old.querySelectorAll('.lct-cell').forEach(a => a.classList.remove('lct-cell'))
        }
        this.#crossedEl = table?.scope.el ?? null
        this.#crossedEl?.classList.add('lct-crossed')
        if (window.CSS?.highlights) {
            if (table) CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(...tableRanges(table)))
            else CSS.highlights.delete(HIGHLIGHT_NAME)
        } else if (table) {
            // 不支援 Custom Highlight (舊瀏覽器)：整節上底色
            for (const col of table.columns) for (const c of col) c.lecs.forEach(a => a.classList.add('lct-cell'))
        }
    }
    /** 放在選取範圍最後一行的右下；觸控時再往下，避開水滴 */
    #place() {
        const rects = this.#range?.getClientRects()
        if (!rects || rects.length == 0) return this.#hide()
        const last = rects[rects.length - 1]
        const box = this.#scope?.el.getBoundingClientRect()
        if (box && (last.bottom < box.top || last.top > box.bottom)) {
            this.#btn.style.visibility = 'hidden' // 捲出範圍外
            return
        }
        this.#btn.style.visibility = ''
        const isCoarse = matchMedia('(pointer: coarse)').matches
        const w = this.#btn.offsetWidth, h = this.#btn.offsetHeight
        const x = Math.min(Math.max(4, last.right - w / 2), innerWidth - w - 4)
        let y = last.bottom + (isCoarse ? 28 : 6)
        if (y + h > innerHeight - 4) y = Math.max(4, rects[0].top - h - (isCoarse ? 28 : 6))
        this.#btn.style.left = `${x}px`
        this.#btn.style.top = `${y}px`
    }

    #copyByButton() {
        this.#pressing = false
        const range = this.#pressRange ?? this.#range
        const scope = this.#pressScope ?? this.#scope
        this.#pressRange = this.#pressScope = null
        if (!scope || !range) return
        const table = buildTable(scope, range)
        if (table == null) return
        const { html, plain } = toClipboardData(table)
        writeClipboard(html, plain).then(ok => {
            this.#btn.textContent = ok ? '✓ 已複製' : '複製失敗'
            setTimeout(() => { this.#btn.textContent = '複製對照表' }, 1200)
        })
    }

    /** Ctrl+C / 選單的複製：跨欄 → 對照表；否則反白的內容，html 只留顏色 @param {ClipboardEvent} e */
    #onCopy(e) {
        const sel = selectionInScope()
        if (!sel || !e.clipboardData) return
        let data
        if (this.#crossed) {
            const table = buildTable(sel.scope, sel.range)
            if (table) data = toClipboardData(table)
        }
        if (!data) {
            const runs = trimRuns(rangeRuns(sel.range, baseColor(sel.scope.el)))
            data = { plain: runsText(runs), html: `<div>${runsHtml(runs)}</div>` }
        }
        e.clipboardData.setData('text/html', data.html)
        e.clipboardData.setData('text/plain', data.plain)
        e.preventDefault()
    }
}

// ── 選取 → 對照表 ─────────────────────────────────────────────────────

/** 選取非空、且整個在一個範圍內才回傳 @returns {{ range: Range, scope: Scope } | null} */
function selectionInScope() {
    const sel = getSelection()
    if (!sel || sel.rangeCount == 0 || sel.isCollapsed) return null
    const range = sel.getRangeAt(0)
    const scope = scopeOf(range.commonAncestorContainer)
    return scope ? { range, scope } : null
}
/** @param {Node} node @returns {Scope | null} */
function scopeOf(node) {
    const e = node.nodeType == Node.ELEMENT_NODE ? /** @type {Element} */ (node) : node.parentElement
    const el = /** @type {HTMLElement} */ (e?.closest(SCOPE_SEL))
    if (!el) return null
    if (el.id == 'lecMain') {
        // 經文區：mode 1、3 並排 (3 一段一列)；2、4 交錯
        const mode = TPPageState.s.show_mode
        return { el, isSide: mode == 1 || mode == 3, byParagraph: mode == 3 }
    }
    // 搜尋結果、交互參照 (VerseGrid)：看 grid 是並排還是交錯
    return { el, isSide: el.querySelector('.verse-grid.vg-interleaved') == null, byParagraph: true }
}

/** @param {HTMLElement} lec */
function addrOf(lec) {
    return +lec.getAttribute('book') * 1e6 + +lec.getAttribute('chap') * 1e3 + +lec.getAttribute('sec')
}
/** @param {Node} node */
function lecOf(node) {
    const e = node.nodeType == Node.ELEMENT_NODE ? /** @type {Element} */ (node) : node.parentElement
    return /** @type {HTMLElement} */ (e?.closest('.lec[ver]'))
}

/**
 * lec 的經文內容，截在 range 內 (只有起訖所在的那節會被截)
 * @param {HTMLElement} lec
 * @param {Range} range
 */
function contentRange(lec, range) {
    const r = document.createRange()
    r.selectNodeContents(lec.querySelector('.verseContent') ?? lec)
    if (lec.contains(range.startContainer) && range.compareBoundaryPoints(Range.START_TO_START, r) > 0) r.setStart(range.startContainer, range.startOffset)
    if (lec.contains(range.endContainer) && range.compareBoundaryPoints(Range.END_TO_END, r) < 0) r.setEnd(range.endContainer, range.endOffset)
    return r
}
/** @param {Node} node */
function rangeOfNode(node) {
    const r = document.createRange()
    r.selectNodeContents(node)
    return r
}

/** 真的選到字的 .lec (只碰到邊界、只選到節碼的不算) */
function selectedLecs(root, range) {
    return [...root.querySelectorAll('.lec[ver]')].filter(lec => {
        if (!range.intersectsNode(lec)) return false
        // 整節都在選取內的，不必逐字算
        if (!lec.contains(range.startContainer) && !lec.contains(range.endContainer)) return (lec.textContent ?? '').trim().length > 0
        return runsText(rangeRuns(contentRange(lec, range))).trim().length > 0
    })
}

/**
 * @param {Scope} scope
 * @param {Range} range
 * @returns {CopyTable | null}
 */
function buildTable(scope, range) {
    const hit = selectedLecs(scope.el, range)
    if (hit.length == 0) return null
    const startLec = lecOf(range.startContainer) ?? hit[0]
    const endLec = lecOf(range.endContainer) ?? hit[hit.length - 1]
    // 起訖之間：經文區依節的位址 (一段多節時可截在段中)；搜尋結果、交互參照依畫面上的列 (交互參照照查詢順序，位址不一定遞增)
    const rowOf = rowKeyFn(scope.el)
    const posOf = scope.el.id == 'lecMain' ? addrOf : rowOf
    const lo = Math.min(posOf(startLec), posOf(endLec))
    const hi = Math.max(posOf(startLec), posOf(endLec))
    const inRange = (/** @type {HTMLElement} */ a) => posOf(a) >= lo && posOf(a) <= hi

    // 譯本：依畫面順序，只取在起訖節之間真的選到的
    const all = /** @type {HTMLElement[]} */ ([...scope.el.querySelectorAll('.lec[ver]')])
    const hitVers = new Set(hit.filter(inRange).map(a => a.getAttribute('ver')))
    const versions = [...new Set(all.map(a => a.getAttribute('ver')))].filter(v => hitVers.has(v))
    if (versions.length == 0) return null

    // 只放真的選到的節，沒選到的留空格：並排時選到的剛好就是矩形；交錯 (mode 2/4) 時不會多帶沒反白的
    const hitSet = new Set(hit)
    if (scope.byParagraph) {
        const { columns, labels } = columnsByParagraph(versions, hit.filter(inRange), rowOf)
        return { scope, versions, columns, labels, range, hit }
    }
    return { scope, versions, columns: columnsByVerse(versions, all, hitSet, lo, hi), labels: null, range, hit }
}

/**
 * 一節一列 (mode 1 及交錯)；此譯本併入上節 ("a") 的節 → 上一格 rowspan
 * @param {string[]} versions @param {HTMLElement[]} all @param {Set<HTMLElement>} hitSet @param {number} lo @param {number} hi
 * @returns {Cell[][]}
 */
function columnsByVerse(versions, all, hitSet, lo, hi) {
    const rows = [...new Set(all.filter(a => versions.includes(a.getAttribute('ver')) && addrOf(a) >= lo && addrOf(a) <= hi).map(addrOf))]
        .sort((a, b) => a - b)
    /** @param {HTMLElement} lec @returns {Cell} */
    const cellOf = lec => ({ lecs: lec && hitSet.has(lec) ? [lec] : [], rs: 1 })
    return versions.map(ver => {
        const lecs = all.filter(a => a.getAttribute('ver') == ver)
        /** @type {Cell[]} */
        const cells = []
        for (const addr of rows) {
            const lec = lecs.find(a => addrOf(a) == addr)
            if (lec) { cells.push(cellOf(lec)); continue }
            // 此譯本這節併入上節 ("a")：上一格延伸；若是第一列，往前找涵蓋它的那節
            if (cells.length) { cells[cells.length - 1].rs++; continue }
            cells.push(cellOf(lecs.filter(a => addrOf(a) < addr).pop()))
        }
        return cells
    })
}
/**
 * .lec 在畫面上是第幾列：.paragraph 的 data-row 是 grid 的列 (不能用 index：併入上節的段不產生元素)；搜尋結果每批一個 grid，各自編號
 * @param {HTMLElement} root 範圍
 * @returns {(lec: HTMLElement) => number}
 */
function rowKeyFn(root) {
    const grids = [...root.querySelectorAll('.lec-grid, .verse-grid')]
    return lec => {
        const p = /** @type {HTMLElement} */ (lec.closest('.paragraph'))
        if (p?.dataset.row == null) return -1
        return grids.indexOf(p.closest('.lec-grid, .verse-grid')) * 1e5 + +p.dataset.row
    }
}
/**
 * 如所見一段一列 (mode 3 並排、搜尋結果、交互參照)
 * @param {string[]} versions @param {HTMLElement[]} hit 起訖之間真的選到的 @param {(lec: HTMLElement) => number} rowOf
 * @returns {{ columns: Cell[][], labels: string[] | null }} labels：每列的經文位置 (沒有標籤欄時 null)
 */
function columnsByParagraph(versions, hit, rowOf) {
    const rowIds = [...new Set(hit.map(rowOf))].sort((a, b) => a - b)
    const columns = versions.map(ver => rowIds.map(row => ({ lecs: hit.filter(a => a.getAttribute('ver') == ver && rowOf(a) == row), rs: 1 })))
    // 經文位置：同列第一個選到的節所在 .paragraph 的標籤
    const labels = rowIds.map(row => labelOf(hit.find(a => rowOf(a) == row)?.closest('.paragraph')))
    return { columns, labels: labels.some(a => a) ? labels : null }
}
/**
 * .paragraph 那一列左側的經文位置 (VerseGrid 的標籤欄 .vg-label / 交錯的 .vg-group，有 data-row 的才是位置，交錯的譯本名沒有)
 * @param {Element | null | undefined} p
 */
function labelOf(p) {
    const row = /** @type {HTMLElement} */ (p)?.dataset?.row
    const grid = p?.closest('.verse-grid')
    if (row == null || !grid) return ''
    return grid.querySelector(`:is(.vg-label, .vg-group)[data-row="${row}"]`)?.textContent?.trim() ?? ''
}

/** 對照表每格要畫底色的範圍：節碼 + (截斷後的) 內容 @param {CopyTable} table */
function tableRanges({ columns, range }) {
    const re = []
    for (const col of columns) for (const c of col) {
        for (const lec of c.lecs) {
            const num = lec.querySelector('.verseNumber')
            if (num) re.push(rangeOfNode(num))
            re.push(contentRange(lec, range))
        }
    }
    return re
}

// ── 看得到的字與顏色 ───────────────────────────────────────────────────

/**
 * range 內看得到的字 (display:none 整棵略過)，依顏色分段；<br>、區塊 (例 mode 1 每節一個 div) → 換行
 * @param {Range} range
 * @param {string} [base] 預設色，與它相同的不記顏色
 * @returns {Run[]}
 */
function rangeRuns(range, base) {
    /** @type {Run[]} */
    const re = []
    const push = (t, c) => {
        if (t == '') return
        const last = re[re.length - 1]
        if (t != '\n' && last && last.t != '\n' && last.c == c) last.t += t
        else re.push(c ? { t, c } : { t })
    }
    const color = (/** @type {Element} */ e) => {
        const c = getComputedStyle(e).color
        return c == base ? undefined : c
    }

    const root = range.commonAncestorContainer
    if (root.nodeType == Node.TEXT_NODE) {
        push(/** @type {Text} */ (root).data.slice(range.startOffset, range.endOffset), color(root.parentElement))
        return re
    }
    let isBreakPending = false
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode: n => n.nodeType == Node.ELEMENT_NODE && getComputedStyle(/** @type {Element} */ (n)).display == 'none'
            ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    })
    for (let n = walker.nextNode(); n != null; n = walker.nextNode()) {
        if (!range.intersectsNode(n)) continue
        if (n.nodeType == Node.TEXT_NODE) {
            const t = /** @type {Text} */ (n).data
            const a = n == range.startContainer ? range.startOffset : 0
            const b = n == range.endContainer ? range.endOffset : t.length
            const s = t.slice(a, b)
            if (s == '') continue
            if (isBreakPending && re.length) push('\n')
            isBreakPending = false
            push(s, color(n.parentElement))
        } else if (/** @type {Element} */ (n).tagName == 'BR') {
            push('\n')
        } else if (/^(block|list-item|flex|grid|table|table-row)$/.test(getComputedStyle(/** @type {Element} */ (n)).display)) {
            isBreakPending = true
        }
    }
    return re
}
/** 頭尾的空白、換行去掉 @param {Run[]} runs */
function trimRuns(runs) {
    const re = runs.map(a => ({ ...a }))
    while (re.length && re[0].t.trimStart() == '') re.shift()
    while (re.length && re[re.length - 1].t.trimEnd() == '') re.pop()
    if (re.length) {
        re[0].t = re[0].t.trimStart()
        re[re.length - 1].t = re[re.length - 1].t.trimEnd()
    }
    return re
}
/** @param {Run[]} runs */
const runsText = runs => runs.map(a => a.t).join('')
/** @param {Run[]} runs */
const runsHtml = runs => runs.map(a => a.t == '\n' ? '<br>' : a.c ? `<span style="color:${a.c}">${esc(a.t)}</span>` : esc(a.t)).join('')

/** @param {HTMLElement} el 範圍 */
const baseColor = el => el ? getComputedStyle(el).color : undefined

/** 一節的字：節碼 + 內容 @param {HTMLElement} lec @param {Range} range @param {string} base */
function lecRuns(lec, range, base) {
    const num = lec.querySelector('.verseNumber')
    const numRuns = num ? trimRuns(rangeRuns(rangeOfNode(num), base)) : []
    const content = trimRuns(rangeRuns(contentRange(lec, range), base))
    return numRuns.length ? [...numRuns, { t: ' ' }, ...content] : content
}

// ── 輸出 ──────────────────────────────────────────────────────────────

/** @param {string} s */
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** @param {CopyTable} table */
function toClipboardData({ scope, versions, columns, labels, range, hit }) {
    const base = baseColor(scope.el)
    if (versions.length > 1 && !scope.isSide) return interleavedData(hit, range, base)
    /** 一格：各節接在一起 @param {Cell} c @returns {Run[]} */
    const runsOf = c => c.lecs.flatMap((lec, i) => i ? [{ t: ' ' }, ...lecRuns(lec, range, base)] : lecRuns(lec, range, base))
    const isRtl = (/** @type {Cell} */ c) => c.lecs.length > 0 && getComputedStyle(c.lecs[0]).direction == 'rtl'

    if (versions.length == 1) {
        // 如所見：同一個 .paragraph (mode 3/4 一段多節) 的節接在一起，換段才換行
        const list = paragraphRuns(hit, range, base)
        const dir = list[0]?.rtl ? ' dir="rtl"' : ''
        return {
            plain: list.map(a => runsText(a.runs)).join('\n'),
            html: `<div${dir}>${list.map(a => runsHtml(a.runs)).join('<br>')}</div>`,
        }
    }

    const isGb = TPPageState.s.gb == 1
    const names = versions.map(v => window.abvphp?.get_cname_from_book?.(v, isGb) || v)
    if (labels) names.unshift(isGb ? '经文' : '經文') // 經文位置當第一欄
    const nRow = Math.max(...columns.map(col => col.reduce((n, c) => n + c.rs, 0)))

    // 每欄把 rowspan 攤回每一列：cell 或 null (被上面佔用)
    /** @type {(Cell | null | undefined)[][]} */
    const grid = columns.map(col => {
        const re = []
        for (const c of col) { re.push(c); for (let i = 1; i < c.rs; i++) re.push(null) }
        return re
    })
    /** 經文位置欄：當成一格 (lecs 空，字另外給) */
    const labelCell = (/** @type {number} */ r) => ({ lecs: [], rs: 1, label: labels[r] })
    if (labels) grid.unshift(labels.map((a, r) => labelCell(r)))

    const plainRows = [names.join('\t')]
    let htmlRows = `<tr>${names.map(n => `<th>${esc(n)}</th>`).join('')}</tr>`
    for (let r = 0; r < nRow; r++) {
        const cells = grid.map(col => col[r])
        const runs = cells.map(c => c ? ('label' in c ? [{ t: String(c.label ?? '') }] : runsOf(c)) : [])
        plainRows.push(runs.map(a => runsText(a).replace(/\s*\n\s*/g, ' ')).join('\t'))
        htmlRows += '<tr>' + cells.map((c, i) => {
            if (c === null) return '' // rowspan 佔用
            if (c === undefined) return '<td></td>'
            return `<td${c.rs > 1 ? ` rowspan="${c.rs}"` : ''}${isRtl(c) ? ' dir="rtl"' : ''} style="vertical-align:top">${runsHtml(runs[i])}</td>`
        }).join('') + '</tr>'
    }
    return {
        plain: plainRows.join('\n'),
        html: `<table border="1" style="border-collapse:collapse">${htmlRows}</table>`,
    }
}

/**
 * 依 .paragraph 分組 (畫面上的一節或一段)，組內各節接在一起
 * @param {HTMLElement[]} hit @param {Range} range @param {string} base
 */
function paragraphRuns(hit, range, base) {
    /** @type {Map<Element, Run[]>} */
    const rows = new Map()
    for (const lec of hit) {
        const p = lec.closest('.paragraph') ?? lec
        const runs = rows.get(p)
        const one = lecRuns(lec, range, base)
        if (runs) { rows.set(p, [...runs, { t: ' ' }, ...one]); continue }
        const label = labelOf(p) // 搜尋結果、交互參照：開頭加經文位置
        rows.set(p, label ? [{ t: label + ' ' }, ...one] : one)
    }
    return [...rows].map(([p, runs]) => ({ runs, rtl: getComputedStyle(p).direction == 'rtl' }))
}
/**
 * 交錯：如所見，一欄多列；每個 .paragraph 一列
 * @param {HTMLElement[]} hit @param {Range} range @param {string} base
 */
function interleavedData(hit, range, base) {
    const list = paragraphRuns(hit, range, base)
    return {
        plain: list.map(a => runsText(a.runs)).join('\n'),
        html: `<table border="1" style="border-collapse:collapse">${list.map(a =>
            `<tr><td${a.rtl ? ' dir="rtl"' : ''} style="vertical-align:top">${runsHtml(a.runs)}</td></tr>`).join('')}</table>`,
    }
}

/**
 * 同時寫 text/html 與 text/plain；要在點擊當下呼叫 (中間不能 await，Safari)
 * @returns {Promise<boolean>}
 */
async function writeClipboard(html, plain) {
    if (navigator.clipboard?.write && window.ClipboardItem && window.isSecureContext) {
        try {
            await navigator.clipboard.write([new ClipboardItem({
                'text/html': new Blob([html], { type: 'text/html' }),
                'text/plain': new Blob([plain], { type: 'text/plain' }),
            })])
            return true
        } catch (err) {
            console.warn('clipboard.write 失敗，改用 execCommand：', err)
        }
    }
    // 退回：攔 copy 事件塞兩種格式 (capture + stopPropagation，不讓上面的 #onCopy 再蓋掉)
    let ok = false
    const onCopy = e => {
        e.clipboardData.setData('text/html', html)
        e.clipboardData.setData('text/plain', plain)
        e.preventDefault()
        e.stopPropagation()
        ok = true
    }
    document.addEventListener('copy', onCopy, true)
    try { document.execCommand('copy') } finally { document.removeEventListener('copy', onCopy, true) }
    return ok
}
