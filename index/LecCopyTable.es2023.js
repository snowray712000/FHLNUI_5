/**
 * 經文反白與複製 (docs/z260930d 第六節 2、3；P7 起搜尋結果、交互參照也用)
 * - 範圍 (Scope)：經文區 #lecMain、搜尋結果 .sd-results、交互參照 .ref-dlg；選取要在同一個範圍內
 * - 在範圍內原生反白後，選取範圍旁浮出「複製對照表」按鈕；按了才複製 (不長按、不覆蓋右鍵)
 * - 格 = 畫面上的一格 (.paragraph：mode 1 一節、mode 3 一段、交錯的一個譯本一段、搜尋結果一列的一個譯本)
 * - 起訖在同一格：只有 text/plain，照水滴 (反白) 的起訖，不是整格
 * - 跨格 (跨欄或跨列)：一律整格為單位；text/html <table> + text/plain (tab 分隔) 兩種都有
 * - 列 = 起訖之間的列；欄 = 選取碰到的譯本；格 = 反白碰到的格 (沒碰到的留空)。並排 (DOM 欄優先) 時就是矩形
 * - 選到就是看到的：隱藏的 (display:none，例 .sn-hidden) 不複製；注腳沒載入就是 【n】
 * - 並排 → mode 1 一節一列 (併入上節用 rowspan)、mode 3 如所見一段一列；單一譯本也是表格 (一欄)
 * - 交錯 (mode 2/4) 多譯本 → 如所見，一欄多列：每個 .paragraph (一個譯本的一節或一段) 一列
 * - 跨格：原生反白是照 DOM 順序畫的 (第一欄畫到底、中間整欄…)，也不是整格，與實際複製的不同，
 *   所以把原生反白變透明，改成整格 (.paragraph 整個 div) 上底色 .lct-cell (像當時的 lecture/01-05 demo 3，已刪)；Ctrl+C 也改成複製對照表
 * - 觸控 (iPad Safari 不理 ::selection，原生藍色蓋不掉)：拖水滴跨格時先畫整格矩形 (原生選取留著，水滴才拖得動)；
 *   放開後收掉原生選取，只留整格底色與按鈕 (sticky)。iOS 放開水滴不送 touchend / pointerup (拖水滴開始時有 touchstart)，
 *   所以用「選取 IDLE_MS 沒變」當作放開。之後在同一範圍長按某格 → 起點格到那格 (像 Shift+點)；輕點 (不是按鈕) → 取消
 *   sticky 時矩形左上、右下各有一個圓點 (.lct-knob) 可拖，以格為單位改範圍；下方小提示 (.lct-tip) 說明這些手勢
 *   觸控的按鈕放在畫面下方中央：放在選取旁會被 iOS 的「拷貝 / 查詢…」選單擋住
 *
 * - 搜尋結果、交互參照 (VerseGrid)：一律如所見一段一列 (.paragraph 的 data-row，各批 grid 各自編號)；
 *   左側的經文位置 (標籤欄) 也複製：並排多譯本 → 表格第一欄；單一譯本、交錯 → 每列開頭
 *
 * - 按鈕依情形：Case1 同一格「文字」；Case2 跨列不跨欄「文字|連續文字|連續含出處|表格|MD」；Case3 跨欄「表格|MD」
 *   (連續文字 = 各列接成空白、不換行；見 toPlainText)
 * - 「MD」鈕 (docs/z261002c)：Markdown 表格只放 text/plain，不保留顏色；起訖在同一格時不顯示
 *   並排 → 表頭譯本名 (有標籤欄時第一欄「經文」)；mode 1 併入上節 (rowspan) 被佔的格寫「（併入上節）」
 *   交錯 → 「譯本 | 經文」兩欄 (有經文位置時「經文 | 譯本 | 內容」)；交錯只有一個譯本 → 一欄，表頭譯本名
 *   格內 | → \|，換行 → 空白
 *
 * 並排是 CSS Grid (.lec-grid / .verse-grid > .vercol display: contents)，DOM 仍一欄一欄 (欄優先)
 */
import { el } from './auDom.es2023.js'
import { TPPageState } from './TPPageState.es2023.js'
import { cvtAddrsToRef } from './cvtAddrsToRef.es2023.js'
import { Theme } from './theme/Theme.es2023.js'

/**
 * @typedef {{ lecs: HTMLElement[], rs: number }} Cell 一格的節 (mode 3 一段可多節)；空陣列 = 空格 (沒反白到)
 * @typedef {{ el: HTMLElement, isSide: boolean, byParagraph: boolean }} Scope 可複製的範圍；isSide 並排；byParagraph 一段一列 (否則一節一列)
 * @typedef {{ scope: Scope, versions: string[], columns: Cell[][], labels: string[] | null, range: Range | null, hit: HTMLElement[], isOneCell: boolean, isCrossCol: boolean }} CopyTable
 *   hit = 反白碰到的 .lec (畫面順序；跨格時擴成那些格的全部節)；labels = 每列的經文位置 (有標籤欄時)
 *   isOneCell 起訖在同一格 (Case1)；isCrossCol 並排且跨譯本欄 (Case3)；其餘是跨列不跨欄 (Case2)；range 跨格時為 null (整格，不截斷)
 * @typedef {{ t: string, c?: string }} Run 一段字與顏色 (c 省略 = 預設色)；t == '\n' 是換行
 */

const SCOPE_SEL = '#lecMain, .sd-results, .ref-dlg'

export class LecCopyTable {
    static #s = null
    /** @returns {LecCopyTable} */
    static get s() { if (!this.#s) this.#s = new LecCopyTable(); return this.#s }
    /** 觸控拖水滴跨格後，選取多久沒變就收掉原生選取 (ms)；太短 → 拖到一半停一下就被收掉 */
    static IDLE_MS = 1000
    /** 拖圓點時，手指離捲動容器上下緣多近 (px) 開始自動捲動 */
    static AUTO_EDGE = 48
    /** 自動捲動最快每格幾 px (手指在邊緣或超出邊緣) */
    static AUTO_MAX = 20

    /** @type {HTMLElement} 按鈕組 (複製對照表 + MD)，整組一起定位 */
    #btn = null
    /** @type {Record<'text' | 'flat' | 'cite' | 'table' | 'md', HTMLButtonElement>} 文字 / 連續文字 / 表格 / Markdown */
    #btns = null
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
    /** 觸控：跨格後已收掉原生選取，#range/#crossed 留著 (輕點才清、長按延伸) */
    #isSticky = false
    /** @type {Element} 觸控：起點格 (同一格選取時記下；跨格、延伸時不變) */
    #anchorCell = null
    /** @type {{ t: number, x: number, y: number } | null} sticky 時按下的時間與位置 (判斷輕點) */
    #tap = null
    /** 觸控：手指按著 (含拖水滴；iOS 拖水滴也會送 touchstart)。按著時不收原生選取，放開才收 */
    #touching = false
    /** iOS 放開水滴不送 touchend / pointerup：跨格後選取一段時間沒變，就當作放開了 */
    #idleTimer = 0
    /** @type {HTMLElement[]} sticky 時矩形左上、右下的圓點 */
    #knobs = []
    /** @type {HTMLElement} sticky 時的手勢提示 */
    #tip = null
    /** @type {{ fixed: Element, scope: Scope, cell: Element | null, knob: HTMLElement, scroller: HTMLElement } | null} 拖圓點中；fixed = 對角那格；scroller = 範圍的捲動容器 */
    #knobDrag = null
    /** @type {{ x: number, y: number } | null} 拖圓點中手指最後的位置 (自動捲動後用它重算格) */
    #knobPt = null
    #rafAuto = 0
    /** @type {Range | null} sticky 時收掉的原生選取；iOS 收掉後還會再報一次舊選取，不能當成「長按另一格」 */
    #removedRange = null

    init() {
        if (this.#btn) return
        const mk = (/** @type {'text'|'flat'|'cite'|'table'|'md'} */ kind, label, title) => {
            const b = el('button', { type: 'button', class: 'lct-btn', title, onclick: () => this.#copyByButton(kind) }, label)
            b.dataset.label = label
            return b
        }
        this.#btns = {
            text: mk('text', '文字', '複製為純文字 (跨列時每列一行)'),
            flat: mk('flat', '連續文字', '複製為純文字，各列接成連續一段 (不換行)'),
            cite: mk('cite', '連續含出處', '複製為連續純文字，結尾加出處，例：(詩107:1-3_和合本)'),
            table: mk('table', '表格', '把反白的經文複製成對照表 (含節碼)，貼上時是表格'),
            md: mk('md', 'MD', '複製為 Markdown 表格 (純文字，不含顏色)'),
        }
        this.#btn = el('div', {
            class: 'lec-copy-table', hidden: true,
            onpointerdown: e => { e.preventDefault(); this.#pressing = true; this.#pressRange = this.#range; this.#pressScope = this.#scope }, // 電腦：不讓選取消失
            onpointercancel: () => { this.#pressing = false },
            onpointerleave: () => { this.#pressing = false },
        }, ...Object.values(this.#btns))
        this.#knobs = [0, 1].map(i => el('div', {
            class: 'lct-knob', hidden: true,
            onpointerdown: e => this.#knobDown(e, i),
            onpointermove: e => this.#knobMove(e),
            onpointerup: () => this.#knobEnd(),
            onpointercancel: () => this.#knobEnd(),
        }))
        this.#tip = el('div', { class: 'lct-tip', hidden: true }, '拖圓點改範圍 · 長按另一格也可 · 點空白取消')
        document.body.append(this.#btn, ...this.#knobs, this.#tip)

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
        // sticky 時：輕點 (不是按鈕) → 取消；長按會產生新選取，在 #update 延伸
        document.addEventListener('pointerdown', e => {
            const isOurs = e.target instanceof Element && e.target.closest('.lec-copy-table, .lct-knob')
            this.#tap = this.#isSticky && !isOurs ? { t: e.timeStamp, x: e.clientX, y: e.clientY } : null
        }, true)
        document.addEventListener('pointerup', e => {
            const tap = this.#tap
            this.#tap = null
            if (tap && this.#isSticky && e.timeStamp - tap.t < 450 && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 10) this.#hide()
        }, true)
        // 手指按著 / 放開：放開時若已跨格，才收掉原生選取 (按著時收掉，水滴會跟著不見、拖不下去)
        document.addEventListener('touchstart', () => { this.#touching = true }, { capture: true, passive: true })
        const onTouchEnd = (/** @type {TouchEvent} */ e) => {
            if (e.touches.length) return
            this.#touching = false
            clearTimeout(this.#selTimer); this.#selTimer = 0
            this.#update()
        }
        document.addEventListener('touchend', onTouchEnd, { capture: true, passive: true })
        document.addEventListener('touchcancel', onTouchEnd, { capture: true, passive: true })
    }

    #update() {
        const sel = selectionInScope()
        if (sel == null && this.#isSticky) return // 是自己收掉的原生選取
        const isTouch = matchMedia('(pointer: coarse)').matches
        // sticky 時在同一範圍長按某格：從起點格延伸到那格
        if (sel && this.#isSticky && sel.scope.el == this.#scope?.el && isTouch) {
            if (isSameRange(sel.range, this.#removedRange)) return // 剛收掉的那個選取 (iOS 晚報)，不是長按
            const cell = cellOfNode(sel.range.startContainer)
            if (cell && this.#anchorCell?.isConnected) return this.#stick(sel.scope, cellsRange(this.#anchorCell, cell))
        }
        const table = sel ? buildTable(sel.scope, sel.range) : null
        if (table == null) return this.#hide()
        if (isTouch) {
            const startCell = cellOfNode(sel.range.startContainer), endCell = cellOfNode(sel.range.endContainer)
            if (table.isOneCell) this.#anchorCell = startCell
            else if (startCell && endCell) {
                // 觸控跨格：放開手指後收掉原生選取 (藍色蓋不掉)，改成整格；起點格 = 剛才同一格選取的那格 (被拖的可能是前面的水滴)
                const anchor = this.#anchorCell == endCell ? endCell : startCell
                const r = cellsRange(anchor, anchor == startCell ? endCell : startCell)
                if (!this.#touching) return this.#stick(sel.scope, r)
                // 拖曳中：原生選取留著 (水滴才拖得動)，先畫整格矩形
                const t = buildTable(sel.scope, r.range)
                if (t) { this.#isSticky = false; this.#show(sel.scope, sel.range.cloneRange(), t) }
                clearTimeout(this.#idleTimer)
                this.#idleTimer = setTimeout(() => { this.#touching = false; this.#update() }, LecCopyTable.IDLE_MS)
                return
            }
        }
        this.#isSticky = false
        this.#show(sel.scope, sel.range.cloneRange(), table)
    }
    /** @param {Scope} scope @param {Range} range @param {CopyTable} table */
    #show(scope, range, table) {
        this.#range = range
        this.#scope = scope
        this.#setCrossed(table.isOneCell ? null : table)
        // Case1 同一格：文字；Case2 跨列不跨欄：文字 | 連續文字 | 表格 | MD；Case3 跨欄：表格 | MD
        const { text, flat, cite, table: tbl, md } = this.#btns
        text.hidden = table.isCrossCol
        flat.hidden = cite.hidden = table.isOneCell || table.isCrossCol
        tbl.hidden = md.hidden = table.isOneCell
        this.#btn.hidden = false
        this.#place()
    }
    /** 觸控：收掉原生選取，只留整格底色與按鈕 @param {Scope} scope @param {{ range: Range, anchor: Element }} r */
    #stick(scope, { range, anchor }) {
        const table = buildTable(scope, range)
        if (table == null) return this.#hide()
        clearTimeout(this.#idleTimer)
        this.#anchorCell = anchor
        this.#isSticky = true
        const sel = getSelection()
        this.#removedRange = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : this.#removedRange
        sel.removeAllRanges()
        this.#show(scope, range, table)
    }
    #hide() {
        clearTimeout(this.#idleTimer)
        this.#isSticky = false
        this.#btn.hidden = true
        this.#knobEnd()
        for (const k of this.#knobs) k.hidden = true
        this.#tip.hidden = true
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
        // 整格 (.paragraph 整個 div) 上底色
        if (table) for (const cell of new Set(table.hit.map(a => a.closest('.paragraph') ?? a))) cell.classList.add('lct-cell')
    }
    /** 電腦：放在選取範圍最後一行的右下；觸控：畫面下方中央 (選取旁會被 iOS 的拷貝選單擋住) */
    #place() {
        const rects = this.#range?.getClientRects()
        if (!rects || rects.length == 0) return this.#hide()
        const box = this.#scope?.el.getBoundingClientRect()
        this.#placeKnobs(box)
        if (matchMedia('(pointer: coarse)').matches) {
            this.#btn.style.visibility = ''
            const w = this.#btn.offsetWidth, h = this.#btn.offsetHeight
            const y = innerHeight - h - 24
            this.#btn.style.left = `${Math.max(4, (innerWidth - w) / 2)}px`
            this.#btn.style.top = `${y}px`
            this.#tip.hidden = !this.#isSticky
            if (this.#isSticky) {
                this.#tip.style.left = `${Math.max(4, (innerWidth - this.#tip.offsetWidth) / 2)}px`
                this.#tip.style.top = `${y - this.#tip.offsetHeight - 6}px`
            }
            return
        }
        const last = rects[rects.length - 1]
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

    /** sticky 時：圓點放在第一格左上、最後一格右下 (DOM 順序 = 矩形的對角)；捲出範圍外就藏起來 @param {DOMRect} [box] */
    #placeKnobs(box) {
        const cells = this.#isSticky ? this.#crossedEl?.querySelectorAll('.lct-cell') : null
        if (!cells?.length) { for (const k of this.#knobs) k.hidden = true; return }
        const a = cells[0].getBoundingClientRect(), b = cells[cells.length - 1].getBoundingClientRect()
        const pts = [[a.left, a.top], [b.right, b.bottom]]
        // 拖曳中拖過對角 (矩形翻轉)：另一顆留在對角那格的角上
        const d = this.#knobDrag
        if (d && this.#knobPt) {
            const other = this.#knobs.findIndex(k => k != d.knob)
            pts[other] = d.fixed == cells[0] ? pts[0] : pts[1]
        }
        this.#knobs.forEach((k, i) => {
            // 拖曳中被拖的圓點跟著手指、不藏 (藏了 = display:none，pointer capture 會斷)
            const isDragged = this.#knobDrag?.knob == k && this.#knobPt
            const [x, y] = isDragged ? [this.#knobPt.x, this.#knobPt.y] : pts[i]
            k.hidden = !isDragged && box != null && (y < box.top - 2 || y > box.bottom + 2)
            k.style.left = `${x}px`
            k.style.top = `${y}px`
        })
    }
    /** @param {PointerEvent} e @param {number} i 0 左上、1 右下 */
    #knobDown(e, i) {
        e.preventDefault()
        e.stopPropagation()
        const cells = this.#crossedEl?.querySelectorAll('.lct-cell')
        if (!cells?.length || !this.#scope) return
        const knob = /** @type {HTMLElement} */ (e.currentTarget)
        this.#knobDrag = { fixed: i == 0 ? cells[cells.length - 1] : cells[0], scope: this.#scope, cell: null, knob, scroller: scrollerOf(this.#scope.el) }
        this.#knobPt = null
        knob.setPointerCapture(e.pointerId)
    }
    /** 拖圓點：手指下的那格與對角那格圍成新矩形；靠近捲動容器上下緣時自動捲動 @param {PointerEvent} e */
    #knobMove(e) {
        if (!this.#knobDrag) return
        e.preventDefault()
        this.#knobPt = { x: e.clientX, y: e.clientY }
        this.#knobPick()
        this.#autoScroll()
    }
    #knobEnd() {
        this.#knobDrag = null
        this.#knobPt = null
        cancelAnimationFrame(this.#rafAuto)
        this.#rafAuto = 0
    }
    /** 手指 (夾回範圍內側，手指在範圍外也找得到格) 下的那格與對角那格圍成新矩形 */
    #knobPick() {
        const d = this.#knobDrag, p = this.#knobPt
        if (!d || !p) return
        const box = visibleBox(d.scroller)
        const x = Math.min(Math.max(p.x, box.left + 4), box.right - 4)
        const y = Math.min(Math.max(p.y, box.top + 4), box.bottom - 4)
        const under = document.elementsFromPoint(x, y).find(a => !a.closest('.lct-knob, .lec-copy-table, .lct-tip'))
        const cell = under?.closest('.paragraph')
        if (!cell || cell == d.cell || cell == d.fixed || !d.scope.el.contains(cell)) return this.#placeKnobs(d.scope.el.getBoundingClientRect()) // 拖回對角那格 = 單格，不收
        d.cell = cell
        this.#stick(d.scope, cellsRange(d.fixed, cell))
    }
    /** 手指在捲動容器上下緣 AUTO_EDGE 內 (或外面) → 每格 2~AUTO_MAX px 捲動，越靠邊越快；捲完重算格 */
    #autoScroll() {
        if (this.#rafAuto) return
        const step = () => {
            this.#rafAuto = 0
            const d = this.#knobDrag, p = this.#knobPt
            if (!d || !p) return
            const box = visibleBox(d.scroller)
            const E = LecCopyTable.AUTO_EDGE, M = LecCopyTable.AUTO_MAX
            const depth = p.y < box.top + E ? p.y - (box.top + E) : p.y > box.bottom - E ? p.y - (box.bottom - E) : 0
            if (depth == 0) return
            const v = Math.sign(depth) * Math.min(M, 2 + (M - 2) * Math.abs(depth) / E)
            const before = d.scroller.scrollTop
            d.scroller.scrollTop += v
            if (d.scroller.scrollTop == before) return // 到頂 / 到底
            this.#knobPick()
            this.#rafAuto = requestAnimationFrame(step)
        }
        this.#rafAuto = requestAnimationFrame(step)
    }

    /** @param {'text' | 'flat' | 'cite' | 'table' | 'md'} kind */
    #copyByButton(kind) {
        this.#pressing = false
        const range = this.#pressRange ?? this.#range
        const scope = this.#pressScope ?? this.#scope
        this.#pressRange = this.#pressScope = null
        if (!scope || !range) return
        const table = buildTable(scope, range)
        if (table == null) return
        const { html, plain } = kind == 'md' ? { html: null, plain: toMarkdown(table) }
            : kind == 'table' ? Theme.s.withLightPalette(() => toClipboardData(table))
                : { html: null, plain: kind == 'cite' ? toCitedText(table) : toPlainText(table, kind == 'flat') }
        const btn = this.#btns[kind]
        const text = btn.dataset.label
        writeClipboard(html, plain).then(ok => {
            btn.textContent = ok ? '✓' : '✗'
            setTimeout(() => { btn.textContent = text }, 1200)
        })
    }

    /** Ctrl+C / 選單的複製：同一格 → 反白的純文字；跨格 → 對照表 @param {ClipboardEvent} e */
    #onCopy(e) {
        const sel = selectionInScope() ?? (this.#isSticky ? { scope: this.#scope, range: this.#range } : null)
        if (!sel || !e.clipboardData) return
        const table = buildTable(sel.scope, sel.range)
        const data = table ? Theme.s.withLightPalette(() => toClipboardData(table)) : { plain: runsText(trimRuns(rangeRuns(sel.range))), html: null }
        if (data.html) e.clipboardData.setData('text/html', data.html)
        e.clipboardData.setData('text/plain', data.plain)
        e.preventDefault()
    }
}

// ── 選取 → 對照表 ─────────────────────────────────────────────────────

/** 範圍的捲動容器：自己或往上第一個 overflow-y auto/scroll 且捲得動的 (#lecMain、.sd-results 是自己；.ref-dlg 是 dialog content)
 * @param {HTMLElement} el @returns {HTMLElement} */
function scrollerOf(el) {
    for (let a = el; a && a != document.body; a = a.parentElement) {
        const oy = getComputedStyle(a).overflowY
        if ((oy == 'auto' || oy == 'scroll') && a.scrollHeight > a.clientHeight) return a
    }
    return /** @type {HTMLElement} */ (document.scrollingElement)
}
/** 捲動容器在畫面上看得到的範圍 (夾在視窗內) @param {HTMLElement} el */
function visibleBox(el) {
    const r = el == document.scrollingElement ? new DOMRect(0, 0, innerWidth, innerHeight) : el.getBoundingClientRect()
    return { left: Math.max(0, r.left), right: Math.min(innerWidth, r.right), top: Math.max(0, r.top), bottom: Math.min(innerHeight, r.bottom) }
}

/** @param {Range} a @param {Range | null} b */
const isSameRange = (a, b) => b != null && a.startContainer == b.startContainer && a.startOffset == b.startOffset
    && a.endContainer == b.endContainer && a.endOffset == b.endOffset

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

/** node 所在的格 (.paragraph) @param {Node} node */
function cellOfNode(node) {
    const e = node.nodeType == Node.ELEMENT_NODE ? /** @type {Element} */ (node) : node.parentElement
    return e?.closest('.paragraph') ?? null
}
/** 涵蓋 a、b 兩格 (整格) 的 range，依 DOM 先後 @param {Element} anchor @param {Element} other */
function cellsRange(anchor, other) {
    const [a, b] = anchor.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_PRECEDING ? [other, anchor] : [anchor, other]
    const range = document.createRange()
    range.setStart(a, 0)
    range.setEnd(b, b.childNodes.length)
    return { range, anchor }
}

/**
 * lec 的經文內容，截在 range 內 (只有起訖所在的那節會被截)；range null → 整節
 * @param {HTMLElement} lec
 * @param {Range | null} range
 */
function contentRange(lec, range) {
    const r = document.createRange()
    r.selectNodeContents(lec.querySelector('.verseContent') ?? lec)
    if (range == null) return r // 整格
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
    let hit = selectedLecs(scope.el, range)
    if (hit.length == 0) return null
    const startLec = lecOf(range.startContainer) ?? hit[0]
    const endLec = lecOf(range.endContainer) ?? hit[hit.length - 1]
    const cellOf = (/** @type {HTMLElement} */ a) => a.closest('.paragraph') ?? a
    const isOneCell = cellOf(startLec) == cellOf(endLec)
    // 起訖之間：經文區依節的位址 (一段多節時可截在段中)；搜尋結果、交互參照依畫面上的列 (交互參照照查詢順序，位址不一定遞增)
    const rowOf = rowKeyFn(scope.el)
    const posOf = scope.el.id == 'lecMain' ? addrOf : rowOf
    const lo = Math.min(posOf(startLec), posOf(endLec))
    const hi = Math.max(posOf(startLec), posOf(endLec))
    const inRange = (/** @type {HTMLElement} */ a) => posOf(a) >= lo && posOf(a) <= hi

    // 譯本：依畫面順序，只取在起訖節之間真的選到的
    const all = /** @type {HTMLElement[]} */ ([...scope.el.querySelectorAll('.lec[ver]')])
    const allVers = [...new Set(all.map(a => a.getAttribute('ver')))]
    const hitVers = new Set(hit.filter(inRange).map(a => a.getAttribute('ver')))
    let versions = allVers.filter(v => hitVers.has(v))
    if (versions.length == 0) return null

    if (!isOneCell) {
        if (scope.isSide) {
            // 跨格 (並排)：起訖兩格為對角的矩形 (像 demo 3)；原生選取照 DOM 順序，不一定涵蓋矩形的每一格
            const [i1, i2] = [allVers.indexOf(startLec.getAttribute('ver')), allVers.indexOf(endLec.getAttribute('ver'))].sort((x, y) => x - y)
            versions = allVers.slice(i1, i2 + 1)
            hit = all.filter(a => versions.includes(a.getAttribute('ver')) && inRange(a))
        }
        // 碰到的格整格 (格內所有節，不截斷)
        const cells = new Set(hit.filter(inRange).map(cellOf))
        hit = all.filter(a => cells.has(cellOf(a)))
    }
    const r = isOneCell ? range : null
    const isCrossCol = scope.isSide && versions.length > 1
    // 只放選到的節，沒選到的留空格：並排時選到的剛好就是矩形；交錯 (mode 2/4) 時不會多帶沒反白的
    const hitSet = new Set(hit)
    if (scope.byParagraph) {
        const { columns, labels } = columnsByParagraph(versions, isOneCell ? hit.filter(inRange) : hit, rowOf)
        return { scope, versions, columns, labels, range: r, hit, isOneCell, isCrossCol }
    }
    const [lo2, hi2] = isOneCell ? [lo, hi] : [Math.min(...hit.map(addrOf)), Math.max(...hit.map(addrOf))]
    return { scope, versions, columns: columnsByVerse(versions, all, hitSet, lo2, hi2), labels: null, range: r, hit, isOneCell, isCrossCol }
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
        if (root.parentElement?.checkVisibility?.() === false) return re // 例 .sn-hidden 裡的字
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
const runsHtml = runs => runs.map(a => a.t == '\n' ? '<br>' : a.c ? `<span style="color:${toRgb(a.c)}">${esc(a.t)}</span>` : esc(a.t)).join('')
/**
 * 主題的顏色多是 color-mix()，getComputedStyle 回傳 color(srgb 0 0.38 0.8) 這種寫法，Word 等貼上的程式不一定認得，
 * 轉成 rgb()；其他寫法原樣傳回 @param {string} c
 */
export function toRgb(c) {
    const m = c.match(/^color\(srgb ([-\d.e]+) ([-\d.e]+) ([-\d.e]+)(?: \/ ([\d.]+%?))?\)$/)
    if (m == null) return c
    const [r, g, b] = [m[1], m[2], m[3]].map(v => Math.round(Math.min(1, Math.max(0, +v)) * 255))
    const a = m[4] == null ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : +m[4]
    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${+a.toFixed(3)})` : `rgb(${r}, ${g}, ${b})`
}

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
/** 字的顏色讀 getComputedStyle；呼叫端包在 Theme.s.withLightPalette 裡，深色主題貼到 Word 也是淺色版的顏色 */
function toClipboardData({ scope, versions, columns, labels, range, hit, isOneCell }) {
    const base = baseColor(scope.el)
    // 同一格：只有純文字，照反白的起訖
    if (isOneCell) return { plain: runsText(trimRuns(rangeRuns(range))), html: null }
    if (versions.length > 1 && !scope.isSide) return interleavedData(hit, range, base)
    /** 一格：各節接在一起 @param {Cell} c @returns {Run[]} */
    const runsOf = c => c.lecs.flatMap((lec, i) => i ? [{ t: ' ' }, ...lecRuns(lec, range, base)] : lecRuns(lec, range, base))
    const isRtl = (/** @type {Cell} */ c) => c.lecs.length > 0 && getComputedStyle(c.lecs[0]).direction == 'rtl'

    if (!scope.isSide) return interleavedData(hit, range, base) // 交錯只有一個譯本：一欄多列

    const { names, grid, nRow } = sideGrid(versions, columns, labels)
    const plainRows = [names.join('\t')]
    let htmlRows = `<tr>${names.map(n => `<th>${esc(n)}</th>`).join('')}</tr>`
    for (let r = 0; r < nRow; r++) {
        const cells = grid.map(col => col[r])
        const runs = cells.map(c => cellRuns(c, runsOf))
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

/** 一格的字 (經文位置欄、被 rowspan 佔用 (null)、空格 (undefined) 都可) @param {Cell | null | undefined} c @param {(c: Cell) => Run[]} runsOf @returns {Run[]} */
const cellRuns = (c, runsOf) => c ? ('label' in c ? [{ t: String(c.label ?? '') }] : runsOf(c)) : []

const isGbNow = () => TPPageState.s.gb == 1
/** @param {string} v 譯本代碼 */
const verName = v => window.abvphp?.get_cname_from_book?.(v, isGbNow()) || v

/**
 * 並排的表頭與格：每欄把 rowspan 攤回每一列 (cell 或 null = 被上面佔用)；有標籤欄時第一欄是經文位置
 * @param {string[]} versions @param {Cell[][]} columns @param {string[] | null} labels
 * @returns {{ names: string[], grid: (Cell & { label?: string } | null | undefined)[][], nRow: number }}
 */
function sideGrid(versions, columns, labels) {
    const names = versions.map(verName)
    if (labels) names.unshift(isGbNow() ? '经文' : '經文') // 經文位置當第一欄
    const nRow = Math.max(...columns.map(col => col.reduce((n, c) => n + c.rs, 0)))
    /** @type {(Cell & { label?: string } | null | undefined)[][]} */
    const grid = columns.map(col => {
        const re = []
        for (const c of col) { re.push(c); for (let i = 1; i < c.rs; i++) re.push(null) }
        return re
    })
    /** 經文位置欄：當成一格 (lecs 空，字另外給) */
    if (labels) grid.unshift(labels.map(label => ({ lecs: [], rs: 1, label })))
    return { names, grid, nRow }
}

/**
 * 純文字 (「文字」「連續文字」鈕)：同一格 → 照反白；跨列 → 每個 .paragraph 一列 (有經文位置時開頭加位置)，
 * flat 時列與列、格內換行都接成空白，不換行
 * @param {CopyTable} table @param {boolean} flat
 */
function toPlainText({ scope, range, hit, isOneCell }, flat) {
    const base = baseColor(scope.el)
    if (isOneCell) return runsText(trimRuns(rangeRuns(range)))
    const rows = paragraphRuns(hit, range, base).map(a => runsText(a.label ? [{ t: a.label + ' ' }, ...a.runs] : a.runs))
    return flat ? rows.map(a => a.replace(/\s*\n\s*/g, ' ')).join(' ') : rows.join('\n')
}

/** 出處用的譯本名：和合本 (unv) 是例外，正式名稱 FHL和合本，但以和合本呈現；其餘用 cname @param {string} v */
const citeVerName = v => v == 'unv' ? '和合本' : verName(v)

/**
 * 連續含出處：每個譯本一段，各節 (含節碼) 接成連續文字，結尾 (書 章:節-節_譯本)
 * @param {CopyTable} table
 */
function toCitedText({ scope, range, hit }) {
    const base = baseColor(scope.el)
    const vers = [...new Set(hit.map(a => a.getAttribute('ver')))]
    return vers.map(ver => {
        const lecs = hit.filter(a => a.getAttribute('ver') == ver).sort((a, b) => addrOf(a) - addrOf(b))
        const text = lecs.map(lec => runsText(lecRuns(lec, range, base))).join(' ').replace(/\s*\n\s*/g, ' ')
        // 出處同交互參照的寫法 (不連續：詩33:5;35:6-7,11;創1:2-3)
        const addr = cvtAddrsToRef(lecs.map(l => ({ book: +l.getAttribute('book'), chap: +l.getAttribute('chap'), verse: +l.getAttribute('sec') })), isGbNow() ? '罗' : '羅')
        return `${text}(${addr}_${citeVerName(ver)})`
    }).join('\n')
}

/**
 * 依 .paragraph 分組 (畫面上的一節或一段)，組內各節接在一起
 * @param {HTMLElement[]} hit @param {Range} range @param {string} base
 * @returns {{ runs: Run[], label: string, ver: string, rtl: boolean }[]} label：搜尋結果、交互參照的經文位置 (沒有則 '')
 */
function paragraphRuns(hit, range, base) {
    /** @type {Map<Element, { runs: Run[], ver: string }>} */
    const rows = new Map()
    for (const lec of hit) {
        const p = lec.closest('.paragraph') ?? lec
        const row = rows.get(p)
        const one = lecRuns(lec, range, base)
        if (row) row.runs = [...row.runs, { t: ' ' }, ...one]
        else rows.set(p, { runs: one, ver: lec.getAttribute('ver') ?? '' })
    }
    return [...rows].map(([p, a]) => ({ ...a, label: labelOf(p), rtl: getComputedStyle(p).direction == 'rtl' }))
}
/**
 * 交錯：如所見，一欄多列；每個 .paragraph 一列 (搜尋結果、交互參照：開頭加經文位置)
 * @param {HTMLElement[]} hit @param {Range} range @param {string} base
 */
function interleavedData(hit, range, base) {
    const list = paragraphRuns(hit, range, base)
        .map(a => ({ ...a, runs: a.label ? [{ t: a.label + ' ' }, ...a.runs] : a.runs }))
    return {
        plain: list.map(a => runsText(a.runs)).join('\n'),
        html: `<table border="1" style="border-collapse:collapse">${list.map(a =>
            `<tr><td${a.rtl ? ' dir="rtl"' : ''} style="vertical-align:top">${runsHtml(a.runs)}</td></tr>`).join('')}</table>`,
    }
}

// ── Markdown ─────────────────────────────────────────────────────────

/** 格內：換行 → 空白、| → \| @param {string} s */
const mdCell = s => s.replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|').trim()
/** @param {string[]} head @param {string[][]} rows */
const mdTable = (head, rows) => [head, head.map(() => '---'), ...rows].map(r => `| ${r.map(mdCell).join(' | ')} |`).join('\n')

/**
 * Markdown 表格 (不保留顏色)；規則同 toClipboardData 的表格，見檔頭「MD」鈕
 * @param {CopyTable} table
 */
function toMarkdown({ scope, versions, columns, labels, range, hit, isOneCell }) {
    const base = baseColor(scope.el)
    if (isOneCell) return runsText(trimRuns(rangeRuns(range))) // 按鈕不會出現；保險
    const isGb = isGbNow()
    if (!scope.isSide) {
        // 交錯：如所見一列一段；多譯本加「譯本」欄
        const list = paragraphRuns(hit, range, base)
        const hasLabel = list.some(a => a.label)
        const isMulti = versions.length > 1
        const head = isMulti ? [isGb ? '译本' : '譯本', hasLabel ? (isGb ? '内容' : '內容') : (isGb ? '经文' : '經文')] : [verName(versions[0])]
        if (hasLabel) head.unshift(isGb ? '经文' : '經文')
        return mdTable(head, list.map(a => [...(hasLabel ? [a.label] : []), ...(isMulti ? [verName(a.ver)] : []), runsText(a.runs)]))
    }
    /** @param {Cell} c */
    const runsOf = c => c.lecs.flatMap((lec, i) => i ? [{ t: ' ' }, ...lecRuns(lec, range, base)] : lecRuns(lec, range, base))
    const { names, grid, nRow } = sideGrid(versions, columns, labels)
    const merged = isGb ? '（并入上节）' : '（併入上節）'
    const rows = []
    for (let r = 0; r < nRow; r++)
        rows.push(grid.map(col => col[r] === null ? merged : runsText(cellRuns(col[r], runsOf))))
    return mdTable(names, rows)
}

/**
 * 同時寫 text/html 與 text/plain (html null → 只有純文字)；要在點擊當下呼叫 (中間不能 await，Safari)
 * @param {string | null} html @param {string} plain
 * @returns {Promise<boolean>}
 */
async function writeClipboard(html, plain) {
    if (navigator.clipboard?.write && window.ClipboardItem && window.isSecureContext) {
        try {
            const items = { 'text/plain': new Blob([plain], { type: 'text/plain' }) }
            if (html != null) items['text/html'] = new Blob([html], { type: 'text/html' })
            await navigator.clipboard.write([new ClipboardItem(items)])
            return true
        } catch (err) {
            console.warn('clipboard.write 失敗，改用 execCommand：', err)
        }
    }
    // 退回：攔 copy 事件塞兩種格式 (capture + stopPropagation，不讓上面的 #onCopy 再蓋掉)
    let ok = false
    const onCopy = e => {
        if (html != null) e.clipboardData.setData('text/html', html)
        e.clipboardData.setData('text/plain', plain)
        e.preventDefault()
        e.stopPropagation()
        ok = true
    }
    document.addEventListener('copy', onCopy, true)
    try { document.execCommand('copy') } finally { document.removeEventListener('copy', onCopy, true) }
    return ok
}
