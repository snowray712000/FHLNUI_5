/**
 * 並排 (mode 1/3，CSS Grid 版) 各譯本的欄寬 (docs/z260930d P2)
 * - 預設「自動」：量每個譯本整章文字實際排版的長度 (各節每行寬度加總)，欄寬跟它成正比 → 各欄差不多一樣高、空白最少。
 *   用量的不用數字數：中、英、希臘、希伯來字寬差很多；隱藏的 SN 量不到，自然不算。限制在平均的 0.6–1.8 倍
 * - 「自訂」：拖表頭譯本名之間的分隔線；依譯本組合分開記 (localStorage fhlLecColWidth)；雙擊分隔線回到自動
 * - 經文區與表頭 (#lecMainTitle，在 #lecMain 外) 共用 #fhlLecture 上的 --lec-cols-tpl，所以一起變
 * - 呼叫：FhlLecture 每次 render 完 (setCSS 之後) apply()
 */
const STORE_KEY = 'fhlLecColWidth'
const MIN_RATIO = 0.6, MAX_RATIO = 1.8
const MIN_PX = 60

export class LecColWidth {
    static #s = null
    /** @returns {LecColWidth} */
    static get s() { if (!this.#s) this.#s = new LecColWidth(); return this.#s }

    /** @type {string[]} 目前各欄的譯本 (畫面順序) */
    #versions = []

    /** render 完呼叫：grid 版才生效，否則還原成原本的等寬表頭 */
    apply() {
        const lecture = document.getElementById('fhlLecture')
        const title = document.getElementById('lecMainTitle')
        const grid = document.querySelector('#lecMain > .lec-grid')
        if (!lecture || !title) return
        title.querySelectorAll('.lec-col-handle').forEach(a => a.remove())
        if (!grid) {
            lecture.style.removeProperty('--lec-cols-tpl')
            title.classList.remove('lec-grid-title')
            title.style.paddingLeft = title.style.paddingRight = ''
            return
        }
        this.#versions = [...grid.children].filter(a => a.classList.contains('vercol')).map(a => a.getAttribute('ver'))
        const custom = this.#loadCustom()
        const weights = custom ?? measureWeights(grid, this.#versions)
        this.#setTemplate(weights)

        title.classList.add('lec-grid-title')
        alignTitle(title, grid)
        const cells = [...title.children].filter(a => a.classList.contains('lecContent'))
        cells.forEach(a => { a.style.width = '' }) // setCSS 設的等寬百分比，grid 下改由欄寬決定
        cells.slice(0, -1).forEach((cell, i) => cell.append(this.#createHandle(i, custom != null)))
    }

    /** 視窗、左右欄、字型大小改變時 (FhlLecture.reshape)：表頭 padding 重新對齊經文 grid */
    realign() {
        const title = document.getElementById('lecMainTitle')
        const grid = document.querySelector('#lecMain > .lec-grid')
        if (title && grid && title.classList.contains('lec-grid-title')) alignTitle(title, grid)
    }

    /** @param {number[]} weights 各欄比例 (fr) */
    #setTemplate(weights) {
        const tpl = weights.map(w => `minmax(0, ${w.toFixed(3)}fr)`).join(' ')
        document.getElementById('fhlLecture')?.style.setProperty('--lec-cols-tpl', tpl)
    }

    /** 分隔線：在第 i 欄右邊，拖曳改 i 與 i+1 欄的寬度 @param {number} i @param {boolean} isCustom */
    #createHandle(i, isCustom) {
        const h = document.createElement('span')
        h.className = 'lec-col-handle' + (isCustom ? ' custom' : '')
        h.title = isCustom ? '拖曳調整欄寬；雙擊恢復自動' : '拖曳調整欄寬 (目前自動)'
        h.addEventListener('click', e => e.stopPropagation()) // 不要觸發表頭的「選譯本」
        h.addEventListener('dblclick', e => {
            e.stopPropagation()
            this.#saveCustom(null)
            this.apply()
        })
        h.addEventListener('pointerdown', e => this.#drag(e, i, h))
        return h
    }

    /** @param {PointerEvent} e @param {number} i @param {HTMLElement} h */
    #drag(e, i, h) {
        e.preventDefault()
        e.stopPropagation()
        const cells = [...document.querySelectorAll('#lecMainTitle > .lecContent')]
        const widths = cells.map(a => a.getBoundingClientRect().width)
        if (widths.length != this.#versions.length || widths.some(w => w <= 0)) return
        const x0 = e.clientX
        const pair = widths[i] + widths[i + 1]
        h.setPointerCapture(e.pointerId)
        document.body.classList.add('lec-col-resizing')
        let cur = widths
        const onMove = (/** @type {PointerEvent} */ ev) => {
            const a = Math.min(Math.max(widths[i] + ev.clientX - x0, MIN_PX), pair - MIN_PX)
            cur = widths.map((w, k) => k == i ? a : k == i + 1 ? pair - a : w)
            this.#setTemplate(cur)
        }
        const onUp = () => {
            h.removeEventListener('pointermove', onMove)
            h.removeEventListener('pointerup', onUp)
            h.removeEventListener('pointercancel', onUp)
            document.body.classList.remove('lec-col-resizing')
            if (cur == widths) return
            const mean = cur.reduce((s, w) => s + w, 0) / cur.length
            this.#saveCustom(cur.map(w => w / mean))
            this.apply()
        }
        h.addEventListener('pointermove', onMove)
        h.addEventListener('pointerup', onUp)
        h.addEventListener('pointercancel', onUp)
    }

    // ── 依譯本組合分開記 ──
    /** 組合的 key：譯本排序後 (順序換了也算同一組) */
    #comboKey() { return [...this.#versions].sort().join(',') }
    /** @returns {number[] | null} 依目前欄的順序 */
    #loadCustom() {
        const byVer = readStore()[this.#comboKey()]
        if (!byVer) return null
        const re = this.#versions.map(v => byVer[v])
        return re.every(w => typeof w == 'number' && w > 0) ? re : null
    }
    /** @param {number[] | null} weights null = 回到自動 */
    #saveCustom(weights) {
        const store = readStore()
        const key = this.#comboKey()
        if (weights) store[key] = Object.fromEntries(this.#versions.map((v, k) => [v, +weights[k].toFixed(3)]))
        else delete store[key]
        try { localStorage.setItem(STORE_KEY, JSON.stringify(store)) } catch { /* 無痕等，不記也能用 */ }
    }
}

/**
 * 表頭左右 padding 對齊經文 grid (#lecMain 的 padding 扣了捲軸寬，#lecMainTitle 是固定 50px，欄寬不等時差距會看得出來)
 * @param {HTMLElement} title @param {HTMLElement} grid
 */
function alignTitle(title, grid) {
    title.style.paddingLeft = title.style.paddingRight = ''
    const t = title.getBoundingClientRect(), g = grid.getBoundingClientRect()
    if (t.width <= 0 || g.width <= 0) return
    title.style.paddingLeft = `${Math.max(g.left - t.left, 0)}px`
    title.style.paddingRight = `${Math.max(t.right - g.right, 0)}px`
}

/** @returns {Record<string, Record<string, number>>} */
function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') ?? {} } catch { return {} }
}

/**
 * 自動：各譯本文字實際排版長度 (每節 .lec 的每一行寬度加總) → 比例，限制在平均的 MIN_RATIO–MAX_RATIO 倍
 * @param {HTMLElement} grid @param {string[]} versions
 * @returns {number[]}
 */
function measureWeights(grid, versions) {
    const lens = versions.map(v => {
        let sum = 0
        for (const lec of grid.querySelectorAll(`.vercol[ver="${v}"] .lec`)) {
            for (const r of lec.getClientRects()) sum += r.width
        }
        return sum
    })
    const mean = lens.reduce((s, a) => s + a, 0) / Math.max(lens.length, 1)
    if (mean <= 0) return versions.map(() => 1)
    return lens.map(a => Math.min(Math.max(a / mean, MIN_RATIO), MAX_RATIO))
}
