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
 * - 按鈕依情形：Case1 同一格「文字|含出處」(含出處：沒選到的頭尾以 ... 表示，例 `9 ... 免得受審判。 ...(雅5:9_和合本)`)；Case2 跨列不跨欄「文字|連續|含出處|繼續選|表格|MD|ASCII」；Case3 跨欄「含出處|繼續選|表格|MD|ASCII」
 *   (連續 = 各列接成空白、不換行；見 toPlainText)
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
 * @typedef {{ scope: Scope, versions: string[], columns: Cell[][], labels: string[] | null, range: Range | LecParts | null, hit: HTMLElement[], isOneCell: boolean, isCrossCol: boolean, shade?: Element[] }} CopyTable
 *   hit = 反白碰到的 .lec (畫面順序；跨格時擴成那些格的全部節)；labels = 每列的經文位置 (有標籤欄時)
 *   isOneCell 起訖在同一格 (Case1)；isCrossCol 並排且跨譯本欄 (Case3)；其餘是跨列不跨欄 (Case2)；range 跨格時為 null (整格，不截斷)；
 *   多段選取 (繼續選) 跨格時 range 是 LecParts (每節各自的範圍，沒選到的字以 ... 表示)，shade = 要上底色的整格
 * @typedef {{ t: string, c?: string }} Run 一段字與顏色 (c 省略 = 預設色)；t == '\n' 是換行
 * @typedef {{ scope: Scope, range: Range, whole?: HTMLElement[] }} Seg 一段反白 (多段選取的一段)；whole = 這一段是單次選取跨格，已展開成整格 (那些格的全部節)，沒有就是照 range 的字
 * @typedef {Map<HTMLElement, Range[] | null>} LecParts 多段選取時每一節被選到的範圍；null = 整節 (整格)
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
    /** @type {Record<'text' | 'flat' | 'cite' | 'table' | 'md' | 'ascii' | 'cont', HTMLButtonElement>} 文字 / 連續 / 含出處 / 表格 / Markdown / ASCII / 繼續選 */
    #btns = null
    /** @type {HTMLButtonElement} ⚙ 表格複製選項 */
    #gear = null
    /** @type {HTMLElement} 選項面板 */
    #opts = null
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
    /** @type {Seg[]} Ctrl / ⌘ + 拖曳時，先前選好的片段 (瀏覽器只留一段原生選取，所以自己記)；依 DOM 順序、互不重疊 */
    #extra = []
    /** @type {Seg[] | null} 多段 (不連續) 選取時，要複製的全部片段 (含現在拖曳中的)；單段為 null */
    #multi = null
    /** @type {Seg[] | null} 按下按鈕當下的多段選取 (同 #pressRange) */
    #pressMulti = null
    /** 「繼續選」中：等著選下一段 (按了「繼續選」或 Ctrl / ⌘ + 按下)；整排按鈕先藏起來免得擋住要選的字，新片段選好才再跳出 */
    #continuing = false
    /** Ctrl / ⌘ 正按著 (電腦)；按著時視為「繼續選」：按鈕不跳出，放開 Ctrl 才出來 */
    #ctrlDown = false
    /** 剛按下 Ctrl / ⌘、還沒按滑鼠：按鈕先藏起來 (放開 Ctrl 或按下滑鼠就解除) */
    #ctrlFresh = false
    /** 滑鼠 (觸控筆) 按著中；「繼續選」拖曳時按鈕不出來，放開才出來 */
    #pointerDown = false
    #contTimer = 0
    /** 多段選取的片段都在同一格內 (按鈕是 文字 | 含出處 | 繼續選) */
    #multiOneCell = false
    /** @type {{ t: number, x: number, y: number } | null} 觸控按下的時間與位置 (判斷輕點空白 → 清掉記下的片段) */
    #tapTouch = null

    init() {
        if (this.#btn) return
        const mk = (/** @type {'text'|'flat'|'cite'|'table'|'md'|'ascii'} */ kind, label, title) => {
            const b = el('button', { type: 'button', class: 'lct-btn', title, onclick: () => this.#copyByButton(kind) }, label)
            b.dataset.label = label
            return b
        }
        this.#btns = {
            text: mk('text', '文字', '複製為純文字 (跨列時每列一行)'),
            flat: mk('flat', '連續', '複製為純文字，各列接成連續一段 (不換行)'),
            cite: mk('cite', '含出處', '複製為純文字 (跨列時各列接成連續一段)，結尾加出處，例：(詩107:1-3_和合本)'),
            table: mk('table', '表格', '把反白的經文複製成對照表 (含節碼)，貼上時是表格；⚙ 可選字色、框線等'),
            md: mk('md', 'MD', '複製為 Markdown 表格 (純文字，不含顏色)'),
            ascii: mk('ascii', 'ASCII', '複製為純文字畫框的表格 (格內過長自動換行，全形字算 2 欄寬，用等寬字型看才對齊)'),
            cont: el('button', {
                type: 'button', class: 'lct-btn', title: '再選另一段 (不連續的幾段一起複製)；電腦也可按著 Ctrl / ⌘ 再拖曳',
                onclick: () => this.#continueSelecting(),
            }, '繼續選'),
        }
        this.#btn = el('div', {
            class: 'lec-copy-table', hidden: true,
            onpointerdown: e => { e.preventDefault(); this.#pressing = true; this.#pressRange = this.#range; this.#pressScope = this.#scope; this.#pressMulti = this.#multi }, // 電腦：不讓選取消失
            onpointercancel: () => { this.#pressing = false },
            onpointerleave: () => { this.#pressing = false },
        }, ...Object.values(this.#btns), this.#gear = el('button', {
            type: 'button', class: 'lct-btn', title: '表格複製選項 (字色、框線、背景、字型…)', onclick: () => this.#toggleOpts(),
        }, '⚙'))
        this.#opts = buildOptsPanel(() => this.#placeOpts())
        this.#knobs = [0, 1].map(i => el('div', {
            class: 'lct-knob', hidden: true,
            onpointerdown: e => this.#knobDown(e, i),
            onpointermove: e => this.#knobMove(e),
            onpointerup: () => this.#knobEnd(),
            onpointercancel: () => this.#knobEnd(),
        }))
        this.#tip = el('div', { class: 'lct-tip', hidden: true }, '拖圓點改範圍 · 長按另一格也可 · 點空白取消')
        document.body.append(this.#btn, this.#opts, ...this.#knobs, this.#tip)

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
            const isOurs = e.target instanceof Element && e.target.closest('.lec-copy-table, .lct-opts, .lct-knob')
            this.#tap = this.#isSticky && !isOurs ? { t: e.timeStamp, x: e.clientX, y: e.clientY } : null
            if (isOurs || !(e.target instanceof Element)) return
            clearTimeout(this.#contTimer)
            this.#ctrlFresh = false
            if (e.pointerType == 'touch') { this.#tapTouch = { t: e.timeStamp, x: e.clientX, y: e.clientY }; return }
            this.#tapTouch = null
            if (e.button != 0) return
            this.#pointerDown = true
            this.#ctrlDown = e.ctrlKey || e.metaKey // 以事件為準 (放開 Ctrl 的 keyup 若被吃掉，這裡校正)
            // 電腦：Ctrl / ⌘ + 按下 → 把現有選取記起來 (接著瀏覽器會開新選取)，進入「繼續選」；
            // 一般按下 → 放掉先前記的片段 (「繼續選」中的一般按下就是要選下一段，不放掉)
            if (e.ctrlKey || e.metaKey) { if (e.target.closest(SCOPE_SEL)) this.#stashLive() }
            else if (this.#extra.length && !this.#continuing) this.#setExtra([])
        }, true)
        document.addEventListener('keydown', e => {
            if (e.key == 'Escape' && (this.#extra.length || this.#continuing)) { this.#continuing = false; this.#setExtra([]); this.#update(); return }
            if ((e.key == 'Control' || e.key == 'Meta') && !e.repeat) {
                // 按鈕正顯示、可以繼續選時：Ctrl 一按就先藏起來 (通常不會放開，要選下一段)
                this.#ctrlFresh = !this.#btn.hidden && !this.#btns.cont.hidden
                this.#ctrlDown = true
                if (this.#ctrlFresh) this.#update()
            }
        })
        const ctrlUp = () => { if (!this.#ctrlDown && !this.#ctrlFresh) return; this.#ctrlDown = this.#ctrlFresh = false; this.#update() }
        document.addEventListener('keyup', e => { if (e.key == 'Control' || e.key == 'Meta') ctrlUp() })
        window.addEventListener('blur', () => { this.#pointerDown = false; ctrlUp() })
        const onPointerEnd = (/** @type {PointerEvent} */ e) => {
            const tap = this.#tap
            this.#tap = null
            if (tap && this.#isSticky && e.timeStamp - tap.t < 450 && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 10) this.#hide()
            const touch = this.#tapTouch
            this.#tapTouch = null
            this.#pointerDown = false
            if (!this.#extra.length && !this.#continuing) return
            const isTap = touch != null && e.timeStamp - touch.t < 450 && Math.hypot(e.clientX - touch.x, e.clientY - touch.y) < 10
            const isOurs = e.target instanceof Element && e.target.closest('.lec-copy-table, .lct-opts, .lct-knob')
            // 放開後選取才定案：選到新片段 → 按鈕再跳出 (「繼續選」結束)
            setTimeout(() => {
                this.#update()
                if (isOurs || liveSegments().length) return
                // 沒選到字：觸控輕點空白 (不在「繼續選」中) → 全部取消；「繼續選」中點了空白 → 稍後放棄繼續、按鈕回來 (間隔內再按 = 雙擊選字，不算)
                if (isTap && !this.#continuing) { this.#setExtra([]); this.#update() }
                else if (this.#continuing) {
                    this.#contTimer = setTimeout(() => { if (this.#continuing && !this.#pointerDown && !liveSegments().length) { this.#continuing = false; this.#update() } }, 400)
                }
            }, isTap ? 60 : 0)
        }
        document.addEventListener('pointerup', onPointerEnd, true)
        document.addEventListener('pointercancel', e => { this.#pointerDown = false; if (e.pointerType != 'touch') onPointerEnd(e) }, true)
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
        // 記下過先前的片段 (繼續選)、或 Firefox 原生就有多段：走多段選取
        const group = this.#group()
        if (group) return this.#updateMulti(group)
        this.#continuing = false
        this.#multi = null
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
    /**
     * 多段 (不連續) 選取：片段 = 先前記下的 + 現在的原生選取 (已依 DOM 順序、重疊 / 相接的併成一段)。
     * 只剩一段時當作一般單段 (按鈕不變)
     * @param {{ segs: Seg[], hasLive: boolean, liveWhole: boolean }} group
     */
    #updateMulti({ segs, hasLive, liveWhole }) {
        // 「繼續選」中：新片段選好 (電腦：滑鼠放開；觸控：長按出現選取) 才結束；之前整排按鈕都藏起來
        if (this.#continuing && hasLive && (matchMedia('(pointer: coarse)').matches || !this.#pointerDown)) this.#continuing = false
        if (this.#continuing) return this.#hideBar()
        const items = segs.filter(s => s.whole ? s.whole.some(l => l.isConnected) : buildTable(s.scope, s.range))
        if (items.length == 0) return this.#hide()
        const last = items[items.length - 1] // 最低的那段：按鈕跟著它
        this.#isSticky = false
        this.#multi = items.length > 1 ? items : null
        this.#multiOneCell = items.length > 1 && sameCellSegs(items)
        const table = this.#multi && !this.#multiOneCell ? tableOfSegs(items) : buildTable(last.scope, last.range)
        if (table == null) return this.#hide()
        // 多段時原生選取只有現在拖的那段；它跨格 (整格底色) 才把原生反白藏起來
        this.#show(last.scope, last.range.cloneRange(), table, { hideNative: !this.#multi || liveWhole })
    }
    /**
     * 先前記下的片段 + 現在的原生選取 (同一個範圍)；null = 不是多段 (沒記過、原生也只有一段)。
     * 現在的選取跑到別的範圍 (經文區 / 搜尋結果 / 交互參照)：先前記下的作廢，當作新選取。
     * 單次選取跨格的片段展開成整格 (whole)；「繼續選」加選的片段不展開，各自保留選到的字
     * @returns {{ segs: Seg[], hasLive: boolean, liveWhole: boolean } | null}
     */
    #group() {
        const alive = this.#extra.filter(s => s.range.startContainer.isConnected && !s.range.collapsed)
        if (alive.length != this.#extra.length) this.#setExtra(alive)
        const live = liveSegments()
        if (this.#extra.length == 0 && live.length <= 1) return null
        const el = (this.#extra[0] ?? live[0])?.scope.el
        const liveOk = live.filter(s => s.scope.el == el)
        if (this.#extra.length && live.length && liveOk.length == 0) { this.#setExtra([]); this.#continuing = false; return null }
        const liveSegs = liveOk.map(snapSeg).filter(a => a != null)
        if (this.#extra.length == 0 && liveSegs.length <= 1) return null
        return { segs: mergeSegs([...this.#extra, ...liveSegs]), hasLive: liveSegs.length > 0, liveWhole: liveSegs.some(a => a.whole) }
    }
    /** Ctrl / ⌘ + 按下當下：把現有的原生選取併進先前記下的片段，進入「繼續選」 */
    #stashLive() {
        const live = liveSegments().map(snapSeg).filter(a => a != null)
        const old = live.length && this.#extra.length && this.#extra[0].scope.el != live[0].scope.el ? [] : this.#extra
        if (live.length) this.#setExtra(mergeSegs([...old, ...live]))
        this.#continuing = this.#extra.length > 0
    }
    /** 按下「繼續選」：現在的選取記起來 (仍畫著底色)，收掉原生選取 (觸控的水滴也消失)，等著選下一段 */
    #continueSelecting() {
        const one = this.#pressRange && this.#pressScope ? snapSeg({ scope: this.#pressScope, range: this.#pressRange }) : null
        const base = this.#pressMulti ?? (one ? [one] : null)
        this.#pressing = false
        this.#pressRange = this.#pressScope = this.#pressMulti = null
        if (!base?.length) return
        this.#setExtra(mergeSegs([...(this.#extra[0]?.scope.el == base[0].scope.el ? this.#extra : []), ...base]))
        this.#continuing = true
        this.#isSticky = false
        getSelection()?.removeAllRanges()
        this.#update()
    }
    /** @param {Seg[]} segs */
    #setExtra(segs) {
        this.#extra = segs
        paintExtra(segs.filter(a => !a.whole).map(a => a.range)) // 展開成整格的用整格底色 (.lct-cell)
    }
    /** @param {Scope} scope @param {Range} range @param {CopyTable} table @param {{ hideNative?: boolean }} [opt] hideNative 跨格時把原生反白藏起來 (預設藏) */
    #show(scope, range, table, { hideNative = true } = {}) {
        this.#range = range
        this.#scope = scope
        // 多段 (繼續選) 的片段都在同一格內：按鈕同 Case1；跨格的多段與一般跨格一樣依 table 的 isCrossCol 分 Case2 / Case3
        const oneCell = table.isOneCell || (this.#multi != null && this.#multiOneCell)
        this.#setCrossed(oneCell ? null : table, hideNative)
        // Case1 同一格：文字 | 含出處 | 繼續選；Case2 跨列不跨欄：文字 | 連續 | 含出處 | 表格 | MD | ASCII | 繼續選；Case3 跨欄：含出處 | 繼續選 | 表格 | MD | ASCII
        const { text, flat, cite, table: tbl, md, ascii, cont } = this.#btns
        text.hidden = !oneCell && table.isCrossCol
        flat.hidden = oneCell || table.isCrossCol
        cite.hidden = false // 跨欄時每個譯本一行、各自帶出處
        // 含出處：同一格時沒選到的字以 ... 表示；跨列時各節接成連續一段
        cite.dataset.label = '含出處'
        if (cite.dataset.mark == null) cite.textContent = cite.dataset.label // 顯示 ✓ / ✗ 時不要蓋掉
        tbl.hidden = md.hidden = ascii.hidden = this.#gear.hidden = oneCell
        // 電腦按著 Ctrl / ⌘ 時已經在繼續選，不必顯示
        cont.hidden = this.#ctrlDown
        cite.after(cont) // 繼續選緊接在含出處後面
        this.#layoutBtns()
        // Ctrl / ⌘ 按著 (剛按下，或一直按著在選字)：視為「繼續選」，整排先藏起來，免得擋住接下來要選的字；放開 Ctrl 才跳出
        if (this.#ctrlFresh || this.#ctrlDown) return this.#hideBar()
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
    /** 只藏起按鈕、圓點與提示，選取狀態 (含先前記下的片段) 留著 */
    #hideBar() {
        this.#opts.hidden = true
        this.#btn.hidden = true
        for (const k of this.#knobs) k.hidden = true
        this.#tip.hidden = true
    }
    #hide() {
        clearTimeout(this.#idleTimer)
        this.#isSticky = false
        this.#hideBar()
        this.#knobEnd()
        this.#continuing = false
        this.#range = null
        this.#scope = null
        this.#multi = null
        if (this.#extra.length) this.#setExtra([])
        this.#setCrossed(null)
    }
    /** @param {CopyTable | null} table @param {boolean} [hideNative] 跨格時原生反白透明 (不然會與整格底色並存) */
    #setCrossed(table, hideNative = true) {
        this.#crossed = table
        const old = this.#crossedEl
        if (old) {
            old.classList.remove('lct-crossed')
            old.querySelectorAll('.lct-cell').forEach(a => a.classList.remove('lct-cell'))
        }
        this.#crossedEl = table?.scope.el ?? null
        if (hideNative) this.#crossedEl?.classList.add('lct-crossed')
        // 整格 (.paragraph 整個 div) 上底色；多段 (繼續選) 只有展開成整格的那些 (shade)
        if (table) for (const cell of new Set(table.shade ?? table.hit.map(a => a.closest('.paragraph') ?? a))) cell.classList.add('lct-cell')
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

    /** 文字類 (文字 / 連續 / 含出處) 與表格類 (表格 / MD / ASCII / ⚙) 都有、且超過 4 顆時排成兩列，各佔一整列 (12 欄格) */
    #layoutBtns() {
        const { text, flat, cite, cont } = this.#btns
        // 文字類 (繼續選緊接在含出處後面，跟著一列)
        const g1 = [text, flat, cite, cont].filter(b => !b.hidden)
        const vis = [...this.#btn.children].filter(b => !b.hidden)
        const g2 = vis.filter(b => !g1.includes(b))
        const two = g1.length > 0 && g2.length > 0 && vis.length > 4
        this.#btn.classList.toggle('lct-2rows', two)
        for (const b of vis) b.style.gridColumn = ''
        if (!two) return
        for (const b of g1) b.style.gridColumn = `span ${12 / g1.length}`
        for (const b of g2) b.style.gridColumn = `span ${12 / g2.length}`
    }
    #toggleOpts() {
        this.#opts.hidden = !this.#opts.hidden
        this.#placeOpts()
    }
    /** 面板放在按鈕列上方 (上面放不下就放下方) */
    #placeOpts() {
        if (this.#opts.hidden) return
        const b = this.#btn.getBoundingClientRect(), h = this.#opts.offsetHeight
        const top = b.top - h - 6 >= 0 ? b.top - h - 6 : b.bottom + 6
        this.#opts.style.top = `${top}px`
        this.#opts.style.left = `${Math.max(4, Math.min(b.left, innerWidth - this.#opts.offsetWidth - 4))}px`
    }
    /** @param {'text' | 'flat' | 'cite' | 'table' | 'md' | 'ascii'} kind */
    #copyByButton(kind) {
        this.#pressing = false
        const range = this.#pressRange ?? this.#range
        const scope = this.#pressScope ?? this.#scope
        const multi = this.#pressMulti ?? this.#multi
        this.#pressRange = this.#pressScope = this.#pressMulti = null
        if (!scope || !range) return
        // 多段 (繼續選) 都在同一格內：文字 / 含出處用 multiCellText；跨格的多段合成一個表格，其餘同一般跨格
        const table = multi && !sameCellSegs(multi) ? tableOfSegs(multi) : buildTable(scope, range)
        if (table == null) return
        const { html, plain } = multi && sameCellSegs(multi) && (kind == 'text' || kind == 'cite') ? { html: null, plain: multiCellText(multi, kind == 'cite') }
            : kind == 'md' ? { html: null, plain: toMarkdown(table) }
            : kind == 'ascii' ? { html: null, plain: toAscii(table) }
            : kind == 'table' ? inCopyPalette(() => toClipboardData(table))
                : { html: null, plain: kind == 'cite' ? toCitedText(table) : toPlainText(table, kind == 'flat') }
        const btn = this.#btns[kind]
        writeClipboard(html, plain).then(ok => {
            btn.textContent = btn.dataset.mark = ok ? '✓' : '✗'
            setTimeout(() => { delete btn.dataset.mark; btn.textContent = btn.dataset.label }, 1200) // 標籤取當下的 (按鈕可能已換成別的情形)
        })
    }

    /** Ctrl+C / 選單的複製：同一格 → 反白的純文字；跨格 → 對照表 @param {ClipboardEvent} e */
    #onCopy(e) {
        // 多段 (不連續) 選取：同一格內 → 同「文字」鈕；跨格 → 複製對照表 (同一般跨格的 Ctrl+C)；只剩一段就用那一段
        const group = this.#group()
        if (group && group.segs.length > 1 && e.clipboardData) {
            const data = sameCellSegs(group.segs) ? { plain: multiCellText(group.segs, false), html: null } : (t => t ? inCopyPalette(() => toClipboardData(t)) : null)(tableOfSegs(group.segs))
            if (data?.plain) {
                showCopyDebug(data.html, data.plain)
                if (data.html) e.clipboardData.setData('text/html', asHtmlDoc(data.html))
                e.clipboardData.setData('text/plain', data.plain)
                e.preventDefault()
                return
            }
        }
        const sel = selectionInScope() ?? (group?.segs.length == 1 ? group.segs[0] : null) ?? (this.#isSticky ? { scope: this.#scope, range: this.#range } : null)
        if (!sel || !e.clipboardData) return
        const table = buildTable(sel.scope, sel.range)
        const data = table ? inCopyPalette(() => toClipboardData(table)) : { plain: runsText(trimRuns(rangeRuns(sel.range))), html: null }
        showCopyDebug(data.html, data.plain)
        if (data.html) e.clipboardData.setData('text/html', asHtmlDoc(data.html))
        e.clipboardData.setData('text/plain', data.plain)
        e.preventDefault()
    }
}

// ── 除錯：看複製了什麼 (Pages 貼成純文字、Keynote 貼成表格，想比對兩種格式的內容) ──────────
// 開：console 執行 fhlCopyDebug(true) (存 localStorage，重新整理仍有效)；關：fhlCopyDebug(false)
const DEBUG_KEY = 'fhlCopyDebug'
if (typeof window != 'undefined') window.fhlCopyDebug = on => {
    try { on ? localStorage.setItem(DEBUG_KEY, '1') : localStorage.removeItem(DEBUG_KEY) } catch { }
    return on ? '複製除錯已開' : '複製除錯已關'
}

/** 開著除錯時，複製後在畫面上列出 text/html 與 text/plain 的內容 @param {string | null} html @param {string} plain */
function showCopyDebug(html, plain) {
    let on = false
    try { on = localStorage.getItem(DEBUG_KEY) == '1' } catch { }
    if (!on) return
    console.log('[copy debug] text/html:\n', html, '\n[copy debug] text/plain:\n', plain)
    document.getElementById('lctDebug')?.remove()
    const box = document.createElement('div')
    box.id = 'lctDebug'
    box.style.cssText = 'position:fixed;inset:5vh 5vw;z-index:99999;display:flex;flex-direction:column;gap:6px;padding:10px;'
        + 'background:var(--surface-bg);color:var(--fg);border:1px solid var(--line);overflow:auto;'
    const mk = (title, text) => {
        const h = document.createElement('div')
        h.textContent = `${title} (${text == null ? '無' : text.length + ' 字'})`
        const ta = document.createElement('textarea')
        ta.readOnly = true
        ta.value = text ?? ''
        ta.style.cssText = 'flex:1;min-height:120px;font:12px monospace;white-space:pre;'
        return [h, ta]
    }
    const close = document.createElement('button')
    close.textContent = '關閉'
    close.onclick = () => box.remove()
    // 實際在剪貼簿裡的內容：複製後在這格按 Cmd+V，列出每種格式 (瀏覽器原生複製多寫的 html / rtf 看這裡)
    const [ph, pasted] = mk('貼上檢視 (複製後，點這格按 Cmd+V)', '')
    pasted.readOnly = false
    pasted.placeholder = '在此貼上'
    pasted.addEventListener('paste', e => {
        e.preventDefault()
        const dt = e.clipboardData
        pasted.value = [...dt.types].map(t => `===== ${t} (${dt.getData(t).length} 字) =====\n${dt.getData(t)}`).join('\n\n')
    })
    box.append(close, ...mk('text/html', html), ...mk('text/plain', plain), ph, pasted)
    document.body.append(box)
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

/** 原生選取裡的每一段 (Firefox 的 Ctrl + 拖曳會有多段；其他瀏覽器最多一段)，非空且在範圍內才算 @returns {Seg[]} */
function liveSegments() {
    const sel = getSelection()
    /** @type {Seg[]} */
    const re = []
    for (let i = 0; sel && i < sel.rangeCount; i++) {
        const range = sel.getRangeAt(i)
        const scope = range.collapsed ? null : scopeOf(range.commonAncestorContainer)
        if (scope) re.push({ scope, range: range.cloneRange() })
    }
    return re
}
/**
 * 依 DOM 順序排好，互相重疊 / 相接的併成一段 (同一個範圍才併；呼叫端保證同一個範圍)；
 * 展開成整格的 (whole) 不併，各自留著
 * @param {Seg[]} segs @returns {Seg[]}
 */
function mergeSegs(segs) {
    const sorted = [...segs].sort((a, b) => a.range.compareBoundaryPoints(Range.START_TO_START, b.range))
    /** @type {Seg[]} */
    const re = []
    for (const s of sorted) {
        const cur = re[re.length - 1]
        // s 的起點落在 cur 內 (含邊界) → 併起來
        if (cur && !cur.whole && !s.whole && cur.range.comparePoint(s.range.startContainer, s.range.startOffset) <= 0) {
            if (cur.range.comparePoint(s.range.endContainer, s.range.endOffset) > 0) cur.range.setEnd(s.range.endContainer, s.range.endOffset)
        } else re.push({ ...s, range: s.range.cloneRange() })
    }
    return re
}
/**
 * 單次選取跨格 → 展開成整格 (whole)；在一格內就照選到的字。看不到字的 (只選到隱藏的、節碼) 回 null
 * @param {Seg} s @returns {Seg | null}
 */
function snapSeg(s) {
    const t = buildTable(s.scope, s.range)
    if (t == null) return null
    return t.isOneCell ? s : { ...s, whole: t.hit }
}
/** 多段的片段都在同一格內 (沒有展開成整格的) @param {Seg[]} segs */
function sameCellSegs(segs) {
    const cell = cellOfSeg(segs[0])
    return cell != null && segs.every(s => !s.whole && cellOfSeg(s) == cell)
}
/**
 * 多段 (繼續選) 跨格：每一節記下被選到的範圍 (整格的是 null)，合成一個 CopyTable；
 * 表格 / 文字的規則同一般跨格，只是沒選到的字以 ... 表示、沒碰到的節 / 列不放
 * @param {Seg[]} segs 依 DOM 順序，同一個範圍 @returns {CopyTable | null}
 */
function tableOfSegs(segs) {
    const scope = segs[0].scope
    /** @type {LecParts} */
    const parts = new Map()
    for (const s of segs) {
        if (s.whole) { for (const lec of s.whole) if (lec.isConnected) parts.set(lec, null); continue }
        for (const lec of selectedLecs(scope.el, s.range)) {
            const cur = parts.get(lec)
            if (cur === null) continue // 整格的優先
            if (cur) cur.push(s.range); else parts.set(lec, [s.range])
        }
    }
    const all = /** @type {HTMLElement[]} */ ([...scope.el.querySelectorAll('.lec[ver]')])
    const hit = all.filter(a => parts.has(a))
    if (hit.length == 0) return null
    const hitVers = new Set(hit.map(a => a.getAttribute('ver')))
    const versions = [...new Set(all.map(a => a.getAttribute('ver')))].filter(v => hitVers.has(v))
    const isCrossCol = scope.isSide && versions.length > 1
    const shade = [...parts].filter(([, v]) => v === null).map(([lec]) => lec.closest('.paragraph') ?? lec)
    const rowOf = rowKeyFn(scope.el)
    if (scope.byParagraph) {
        const { columns, labels } = columnsByParagraph(versions, hit, rowOf)
        return { scope, versions, columns, labels, range: parts, hit, isOneCell: false, isCrossCol, shade }
    }
    const addrs = hit.map(addrOf)
    const columns = columnsByVerse(versions, all, new Set(hit), Math.min(...addrs), Math.max(...addrs), new Set(addrs))
    return { scope, versions, columns, labels: null, range: parts, hit, isOneCell: false, isCrossCol, shade }
}
/** 畫出先前記下的片段 (CSS Custom Highlight)；不支援的瀏覽器就沒有顏色，仍可複製 @param {Range[]} ranges */
function paintExtra(ranges) {
    if (typeof CSS == 'undefined' || !CSS.highlights || typeof Highlight == 'undefined') return
    if (ranges.length) CSS.highlights.set('lct-multi', new Highlight(...ranges))
    else CSS.highlights.delete('lct-multi')
}
/** 一段反白所在的格；起訖不在同一格 (跨格) 回 null @param {Seg} s */
function cellOfSeg(s) {
    const a = cellOfNode(s.range.startContainer), b = cellOfNode(s.range.endContainer)
    return a != null && a == b ? a : null
}
/**
 * 同一格內不連續的幾段：每節列出節碼，沒選到的頭尾、段與段之間以 ... 表示；withCite 時結尾加出處
 * 例 `3 ... 長了銹； ... 4 ... 收割莊稼， ...(雅5:3-4_和合本)`；節不連續時出處是 `雅5:1,3-4`
 * @param {Seg[]} segs 依 DOM 順序、互不重疊，都在同一格 @param {boolean} withCite
 */
function multiCellText(segs, withCite) {
    if (segs.length == 0) return ''
    const scope = segs[0].scope, base = baseColor(scope.el)
    const ranges = segs.map(s => s.range)
    const lecs = /** @type {HTMLElement[]} */ ([...scope.el.querySelectorAll('.lec[ver]')])
        .filter(lec => ranges.some(r => r.intersectsNode(lec) && hasVisibleText(contentRange(lec, r))))
    const text = lecs.map(lec => partsOfLec(lec, ranges, base)).filter(a => a != '').join(' ').replace(/\s*\n\s*/g, ' ')
    if (!withCite || lecs.length == 0) return text
    const addr = cvtAddrsToRef(lecs.map(l => ({ book: +l.getAttribute('book'), chap: +l.getAttribute('chap'), verse: +l.getAttribute('sec') })), isGbNow() ? '罗' : '羅')
    return `${text}(${addr}_${citeVerName(lecs[0].getAttribute('ver'))})`
}
/** @param {Range} r */
const hasVisibleText = r => runsText(rangeRuns(r)).trim() != ''
/** 從 (n1, o1) 到 (n2, o2) 之間有沒有看得到的字 @param {Node} n1 @param {number} o1 @param {Node} n2 @param {number} o2 */
function hasTextBetween(n1, o1, n2, o2) {
    const g = document.createRange()
    g.setStart(n1, o1)
    g.setEnd(n2, o2)
    return hasVisibleText(g)
}
/**
 * 一節裡被選到的幾段：節碼 + 各段文字；沒選到的頭尾、段與段之間有字就放 ...
 * @param {HTMLElement} lec @param {Range[]} ranges 反白 (依 DOM 順序、互不重疊，不一定都碰到這一節) @param {string} base
 */
function partsOfLec(lec, ranges, base) {
    const full = contentRange(lec, null)
    const parts = ranges.filter(r => r.intersectsNode(lec)).map(r => contentRange(lec, r)).filter(hasVisibleText)
    if (parts.length == 0) return ''
    const num = lec.querySelector('.verseNumber')
    const out = [num ? runsText(trimRuns(rangeRuns(rangeOfNode(num), base))) : '']
    const gap = hasTextBetween
    let [node, off] = [full.startContainer, full.startOffset]
    for (const p of parts) {
        if (gap(node, off, p.startContainer, p.startOffset)) out.push('...')
        out.push(runsText(trimRuns(rangeRuns(p, base))))
        node = p.endContainer
        off = p.endOffset
    }
    if (gap(node, off, full.endContainer, full.endOffset)) out.push('...')
    return out.filter(a => a != '').join(' ')
}

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
 * @param {Set<number>} [rowsOnly] 只放這些節 (多段不連續時，中間沒選到的節不放)
 * @returns {Cell[][]}
 */
function columnsByVerse(versions, all, hitSet, lo, hi, rowsOnly) {
    const rows = [...new Set(all.filter(a => versions.includes(a.getAttribute('ver')) && addrOf(a) >= lo && addrOf(a) <= hi && (rowsOnly == null || rowsOnly.has(addrOf(a)))).map(addrOf))]
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
// ── 表格複製選項 (⚙) ───────────────────────────────────────────────────
// 各軟體吃的樣式不同 (Keynote 的 th 太高、Pages 想用自己的底色…)，所以可勾選要不要寫進 html；存 localStorage
const OPTS_KEY = 'fhlCopyTableOpts'
/** @type {Record<string, [label: string, def: boolean, tip: string]>} */
const OPT_DEFS = {
    color: ['字色', true, '寫入文字顏色 (節碼、註的顏色另外一定會有)'],
    border: ['框線', true, '表格加框線 (border="1"、border-collapse，每格也寫 border，PowerPoint 只認每格的)'],
    background: ['背景色', false, '寫入底色；不勾就不寫，貼上後用對方的底色'],
    fontFamily: ['字型', false, '寫入經文區目前的字型；不勾就用對方軟體的預設'],
    fontSize: ['字級', false, '寫入經文區目前的字級 (內容字級，不是介面字級)；不勾就用對方軟體的預設'],
    theme: ['依目前主題', false, '不勾：一律用淺色主題的顏色 (貼到白底文件才看得見)；勾：深色主題就複製深色的顏色'],
    th: ['表頭用 th', true, '表頭用 <th>；不勾改成粗體的一般格 (Keynote 的標題列可能比較矮)'],
}
/** @returns {Record<string, boolean>} */
function loadOpts() {
    let saved = {}
    try { saved = JSON.parse(localStorage.getItem(OPTS_KEY) ?? '{}') } catch { }
    return Object.fromEntries(Object.entries(OPT_DEFS).map(([k, [, def]]) => [k, typeof saved[k] == 'boolean' ? saved[k] : def]))
}
/** 依「依目前主題」選項決定要不要切成淺色再產生 @template T @param {() => T} fn @returns {T} */
const inCopyPalette = fn => loadOpts().theme ? fn() : Theme.s.withLightPalette(fn)

/** @param {() => void} onChange 勾選後 (保險重新定位) @returns {HTMLElement} */
function buildOptsPanel(onChange) {
    const opts = loadOpts()
    return el('div', {
        class: 'lct-opts', hidden: true,
        onpointerdown: e => { if (!(e.target instanceof HTMLInputElement)) e.preventDefault() }, // 不讓選取消失
    }, el('div', { class: 'lct-opts-title' }, '表格複製選項'),
        ...Object.entries(OPT_DEFS).map(([k, [label, , tip]]) => el('label', { title: tip },
            el('input', {
                type: 'checkbox', checked: opts[k],
                onchange: e => {
                    opts[k] = e.target.checked
                    try { localStorage.setItem(OPTS_KEY, JSON.stringify(opts)) } catch { }
                    onChange()
                },
            }), ' ' + label)))
}

/** 往上找第一個不透明的背景色 @param {Element | null} e */
function solidBg(e) {
    for (; e; e = e.parentElement) {
        const c = getComputedStyle(e).backgroundColor
        if (c && c != 'transparent' && !/,\s*0\)$/.test(c)) return c
    }
    return ''
}
/** 表格開頭標籤：依選項寫 border / color / background / 字型 / 字級 (沒勾的就不寫) @param {Element | undefined} elScope */
function tableOpen(elScope) {
    const o = loadOpts()
    const cs = elScope ? getComputedStyle(elScope) : null
    const st = []
    if (o.border) st.push('border-collapse:collapse')
    if (cs && o.color) st.push(`color:${cs.color}`)
    if (cs && o.background) { const bg = solidBg(elScope ?? null); if (bg) st.push(`background-color:${bg}`) }
    if (cs && o.fontFamily) st.push(`font-family:${cs.fontFamily}`)
    if (cs && o.fontSize) st.push(`font-size:${cs.fontSize}`)
    return `<table border="${o.border ? 1 : 0}"${st.length ? ` style="${st.join(';')}"` : ''}>`
}
/**
 * 整張表：開頭標籤 + 列；勾「框線」時每個 td / th 也寫 border
 * (PowerPoint 不認 table 的 border="1"，貼成無框線的表格；Excel / Word 複製出來的 html 也是每格寫 border)
 * 框線顏色用字色 (淺色主題下近黑，同 PowerPoint 手動「所有框線」的樣子)
 * @param {Element | undefined} elScope @param {string} rows `<tr>…</tr>…`
 */
function tableHtml(elScope, rows) {
    if (!loadOpts().border) return `${tableOpen(elScope)}${rows}</table>`
    const c = elScope ? getComputedStyle(elScope).color : ''
    const bd = `border:1pt solid${c ? ' ' + c : ''}`
    // 格內的字都經 esc，不會有 <td / <th 字樣
    const body = rows.replace(/<(td|th)\b([^>]*)>/g, (_, tag, attrs) => / style="/.test(attrs)
        ? `<${tag}${attrs.replace(' style="', ` style="${bd};`)}>`
        : `<${tag}${attrs} style="${bd}">`)
    return `${tableOpen(elScope)}${body}</table>`
}
/** 表頭格 (譯本名稱)：水平、垂直置中；style 之外也寫 align / valign 給 Word、PowerPoint @param {string} name */
const HEAD_ATTRS = ' align="center" valign="middle" style="text-align:center;vertical-align:middle"'
const headCell = name => loadOpts().th ? `<th${HEAD_ATTRS}>${esc(name)}</th>` : `<td${HEAD_ATTRS}><b>${esc(name)}</b></td>`
const baseColor = el => el ? getComputedStyle(el).color : undefined

/**
 * 一節的字：節碼 + 內容
 * @param {HTMLElement} lec @param {Range | LecParts | null} range Range 截在範圍內；null 整節；LecParts (多段) 取這一節各段，沒選到的頭尾 / 段與段之間以 ... 表示
 * @param {string} base
 */
function lecRuns(lec, range, base) {
    const num = lec.querySelector('.verseNumber')
    const numRuns = num ? trimRuns(rangeRuns(rangeOfNode(num), base)) : []
    const parts = range instanceof Map ? range.get(lec) ?? null : null
    const content = parts ? partRuns(lec, parts, base) : trimRuns(rangeRuns(contentRange(lec, range instanceof Map ? null : range), base))
    return numRuns.length ? [...numRuns, { t: ' ' }, ...content] : content
}
/** 一節裡被選到的幾段 (有顏色)，頭尾沒選到的、段與段之間有字就放 ... (同 partsOfLec) @param {HTMLElement} lec @param {Range[]} ranges @param {string} base @returns {Run[]} */
function partRuns(lec, ranges, base) {
    const full = contentRange(lec, null)
    const parts = ranges.filter(r => r.intersectsNode(lec)).map(r => contentRange(lec, r)).filter(hasVisibleText)
    /** @type {Run[]} */
    const out = []
    const add = (/** @type {Run[]} */ runs) => { if (out.length) out.push({ t: ' ' }); out.push(...runs) }
    let node = full.startContainer, off = full.startOffset
    for (const p of parts) {
        if (hasTextBetween(node, off, p.startContainer, p.startOffset)) add([{ t: '...' }])
        add(trimRuns(rangeRuns(p, base)))
        node = p.endContainer
        off = p.endOffset
    }
    if (parts.length && hasTextBetween(node, off, full.endContainer, full.endOffset)) add([{ t: '...' }])
    return out
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
    if (versions.length > 1 && !scope.isSide) return interleavedData(hit, range, base, scope.el)
    /** 一格：各節接在一起 @param {Cell} c @returns {Run[]} */
    const runsOf = c => c.lecs.flatMap((lec, i) => i ? [{ t: ' ' }, ...lecRuns(lec, range, base)] : lecRuns(lec, range, base))
    const isRtl = (/** @type {Cell} */ c) => c.lecs.length > 0 && getComputedStyle(c.lecs[0]).direction == 'rtl'

    if (!scope.isSide) return interleavedData(hit, range, base, scope.el) // 交錯只有一個譯本：一欄多列

    const { names, grid, nRow } = sideGrid(versions, columns, labels)
    const plainRows = [names.join('\t')]
    let htmlRows = `<tr>${names.map(headCell).join('')}</tr>`
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
        html: tableHtml(scope.el, htmlRows),
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
 * 純文字 (「文字」「連續」鈕)：同一格 → 照反白；跨列 → 每個 .paragraph 一列 (有經文位置時開頭加位置)，
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
 * 含出處 (跨列)：每個譯本一段，各節 (含節碼) 接成連續文字，結尾 (書 章:節-節_譯本)
 * @param {CopyTable} table
 */
function toCitedText({ scope, range, hit }) {
    const base = baseColor(scope.el)
    /** 一節：節碼 + 內容；單格反白時，頭尾沒選到的字以 ... 表示 @param {HTMLElement} lec */
    const citedLec = lec => {
        const rs = range instanceof Map ? range.get(lec) ?? null : range == null ? null : [range]
        return rs == null ? runsText(lecRuns(lec, null, base)) : partsOfLec(lec, rs, base)
    }
    const vers = [...new Set(hit.map(a => a.getAttribute('ver')))]
    return vers.map(ver => {
        const lecs = hit.filter(a => a.getAttribute('ver') == ver).sort((a, b) => addrOf(a) - addrOf(b))
        const text = lecs.map(citedLec).join(' ').replace(/\s*\n\s*/g, ' ')
        // 出處同交互參照的寫法 (不連續：詩33:5;35:6-7,11;創1:2-3)
        const addr = cvtAddrsToRef(lecs.map(l => ({ book: +l.getAttribute('book'), chap: +l.getAttribute('chap'), verse: +l.getAttribute('sec') })), isGbNow() ? '罗' : '羅')
        return `${text}(${addr}_${citeVerName(ver)})`
    }).join('\n')
}

/**
 * 依 .paragraph 分組 (畫面上的一節或一段)，組內各節接在一起
 * @param {HTMLElement[]} hit @param {Range} range @param {string} base @param {Element} [elScope] 寫字色 / 背景 / 字型的來源
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
function interleavedData(hit, range, base, elScope) {
    const list = paragraphRuns(hit, range, base)
        .map(a => ({ ...a, runs: a.label ? [{ t: a.label + ' ' }, ...a.runs] : a.runs }))
    return {
        plain: list.map(a => runsText(a.runs)).join('\n'),
        html: tableHtml(elScope, list.map(a =>
            `<tr><td${a.rtl ? ' dir="rtl"' : ''} style="vertical-align:top">${runsHtml(a.runs)}</td></tr>`).join('')),
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
function toMarkdown({ scope, versions, columns, labels, range, hit, isOneCell }, fmt = mdTable) {
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
        return fmt(head, list.map(a => [...(hasLabel ? [a.label] : []), ...(isMulti ? [verName(a.ver)] : []), runsText(a.runs)]))
    }
    /** @param {Cell} c */
    const runsOf = c => c.lecs.flatMap((lec, i) => i ? [{ t: ' ' }, ...lecRuns(lec, range, base)] : lecRuns(lec, range, base))
    const { names, grid, nRow } = sideGrid(versions, columns, labels)
    const merged = isGb ? '（并入上节）' : '（併入上節）'
    const rows = []
    for (let r = 0; r < nRow; r++)
        rows.push(grid.map(col => col[r] === null ? merged : runsText(cellRuns(col[r], runsOf))))
    return fmt(names, rows)
}

// ── ASCII 表格 (純文字畫框，格內過長自動換行；全形字算 2 欄寬) ───────────────
const ASCII_MAX_W = 80
/** 顯示欄寬：CJK / 全形標點 2，其餘 1 @param {string} s */
const dispW = s => [...s].reduce((w, ch) => w + (/[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe6f\uff00-\uff60\uffe0-\uffe6]/.test(ch) ? 2 : 1), 0)
/** 依欄寬折行 (英文盡量在空白斷，CJK 隨處可斷) @param {string} s @param {number} w @returns {string[]} */
function wrapW(s, w) {
    const lines = []
    let cur = '', cw = 0
    for (const word of s.replace(/\s*\n\s*/g, ' ').trim().split(/(?<=[\u2e80-\uffff])|(?<= )/u)) {
        const ww = dispW(word)
        if (cw + dispW(word.trimEnd()) > w && cur) { lines.push(cur.trimEnd()); cur = ''; cw = 0 }
        for (const ch of ww > w ? [...word] : [word]) { // 單一詞比欄寬長：逐字切
            const c = dispW(ch)
            if (cw + c > w && cur) { lines.push(cur.trimEnd()); cur = ''; cw = 0 }
            cur += ch; cw += c
        }
    }
    lines.push(cur.trimEnd())
    return lines
}
/** @param {string[]} head @param {string[][]} rows */
function asciiTable(head, rows) {
    const n = head.length
    const flat = s => s.replace(/\s*\n\s*/g, ' ').trim()
    const natural = head.map((h, i) => Math.max(dispW(flat(h)), ...rows.map(r => dispW(flat(r[i] ?? '')))))
    // 欄寬：自然寬度超過上限就按比例縮，每欄至少 8 (表頭夠寬時以表頭為準)
    const avail = Math.max(ASCII_MAX_W - (3 * n + 1), 8 * n)
    const total = natural.reduce((a, b) => a + b, 0)
    const widths = total <= avail ? natural : natural.map((w, i) => Math.max(8, Math.min(w, Math.floor(w * avail / total))))
    const sep = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+'
    // 補空格：含中文 (全形字) 的行用全形空白補 (2 欄寬一個，奇數再補一個半形)，非等寬字型也比較齊；純英文行用半形
    const pad = (/** @type {string} */ t, /** @type {number} */ w) => {
        const gap = Math.max(0, w - dispW(t))
        return t + (dispW(t) > t.length ? '\u3000'.repeat(gap >> 1) + ' '.repeat(gap & 1) : ' '.repeat(gap))
    }
    const rowText = (/** @type {string[]} */ r) => {
        const cells = widths.map((w, i) => wrapW(r[i] ?? '', w))
        const h = Math.max(...cells.map(c => c.length))
        return Array.from({ length: h }, (_, k) => '| ' + cells.map((c, i) => pad(c[k] ?? '', widths[i])).join(' | ') + ' |').join('\n')
    }
    return [sep, rowText(head), sep, ...rows.flatMap(r => [rowText(r), sep])].join('\n')
}
/** @param {CopyTable} table */
const toAscii = table => toMarkdown(table, asciiTable)

/** 包成完整 html 文件。Pages / Keynote 要有 DOCTYPE + meta charset 才把 text/html 當表格 (只給 <table> 片段會貼成純文字) @param {string} html */
const asHtmlDoc = html => `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${html}</body></html>`

/**
 * 同時寫 text/html 與 text/plain (html null → 只有純文字)；要在點擊當下呼叫 (中間不能 await，Safari)
 * @param {string | null} html @param {string} plain
 * @returns {Promise<boolean>}
 */
async function writeClipboard(html, plain) {
    showCopyDebug(html, plain)
    // Pages / Keynote 要完整文件 (DOCTYPE + meta charset + body) 才認得表格 (Chrome 原生複製也是這樣寫)，所以包起來
    const doc = html == null ? null : asHtmlDoc(html)
    // 先攔 copy 事件用 setData (不經 clipboard.write 的 html 消毒，meta / DOCTYPE 才留得住)
    // (capture + stopPropagation，不讓 #onCopy 再蓋掉)
    let ok = false
    const onCopy = e => {
        if (doc != null) e.clipboardData.setData('text/html', doc)
        e.clipboardData.setData('text/plain', plain)
        e.preventDefault()
        e.stopPropagation()
        ok = true
    }
    document.addEventListener('copy', onCopy, true)
    try { document.execCommand('copy') } finally { document.removeEventListener('copy', onCopy, true) }
    if (ok) return true
    if (navigator.clipboard?.write && window.ClipboardItem && window.isSecureContext) {
        try {
            const items = { 'text/plain': new Blob([plain], { type: 'text/plain' }) }
            if (doc != null) items['text/html'] = new Blob([doc], { type: 'text/html' })
            await navigator.clipboard.write([new ClipboardItem(items)])
            return true
        } catch (err) {
            console.warn('clipboard.write 失敗：', err)
        }
    }
    return false
}
