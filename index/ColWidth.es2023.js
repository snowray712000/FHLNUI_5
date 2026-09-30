/**
 * 各譯本欄寬 (經文區、交互參照對話框、搜尋結果共用；docs/z260930d P2、P6 之後)
 * - 預設「自動」：量每個譯本文字實際排版的長度 (各 .lec 每行寬度加總)，欄寬跟它成正比 → 各欄差不多一樣高、空白最少。
 *   用量的不用數字數：中、英、希臘、希伯來字寬差很多；隱藏的 SN 量不到，自然不算。限制在平均的 0.6–1.8 倍
 * - 「自訂」：拖表頭譯本名之間的分隔線；依譯本組合記 (localStorage fhlLecColWidth，三處共用同一份)；雙擊分隔線回到自動
 * - 欄寬寫成 css 變數 (varName) 放在 host 上，host 裡的 grid 用 var() 取 → 表頭與經文 (搜尋結果的每一批) 一起變
 */
const STORE_KEY = 'fhlLecColWidth'
const MIN_RATIO = 0.6, MAX_RATIO = 1.8
const MIN_PX = 60

/**
 * @typedef {{
 *   host: HTMLElement,
 *   varName: string,
 *   versions: string[],
 *   labelTpl?: string,
 *   getHeadCells: () => HTMLElement[],
 *   measureRoot: ParentNode,
 * }} ColWidthOpt
 *   host：css 變數放這裡；versions：畫面上各欄的譯本 (順序)；labelTpl：經文欄前面的欄 (例 標籤欄 'max-content ')；
 *   getHeadCells：各譯本的表頭 (順序同 versions，分隔線放這)；measureRoot：自動時在這裡面量 .lec[ver]
 */
export class ColWidth {
    /** @type {ColWidthOpt} */ #o

    /** @param {ColWidthOpt} opt */
    constructor(opt) { this.#o = opt }

    /** 自訂 ?? 自動量；設 css 變數、放分隔線 */
    apply() {
        const { versions } = this.#o
        const custom = loadCustom(versions)
        this.#setTemplate(custom ?? measureWeights(this.#o.measureRoot, versions))
        const cells = this.#o.getHeadCells()
        cells.forEach(cell => cell.querySelectorAll(':scope > .lec-col-handle').forEach(a => a.remove()))
        cells.slice(0, -1).forEach((cell, i) => cell.append(this.#createHandle(i, custom != null)))
    }

    /** 拿掉 css 變數與分隔線 (例 改成單欄) */
    clear() {
        this.#o.host.style.removeProperty(this.#o.varName)
        this.#o.getHeadCells().forEach(cell => cell.querySelectorAll(':scope > .lec-col-handle').forEach(a => a.remove()))
    }

    /** @param {number[]} weights 各欄比例 (fr) */
    #setTemplate(weights) {
        const tpl = (this.#o.labelTpl ?? '') + weights.map(w => `minmax(0, ${w.toFixed(3)}fr)`).join(' ')
        this.#o.host.style.setProperty(this.#o.varName, tpl)
    }

    /** 分隔線：在第 i 欄右邊，拖曳改 i 與 i+1 欄的寬度 @param {number} i @param {boolean} isCustom */
    #createHandle(i, isCustom) {
        const h = document.createElement('span')
        h.className = 'lec-col-handle' + (isCustom ? ' custom' : '')
        h.title = isCustom ? '拖曳調整欄寬；雙擊恢復自動' : '拖曳調整欄寬 (目前自動)'
        h.addEventListener('click', e => e.stopPropagation()) // 不要觸發表頭的「選譯本」
        h.addEventListener('dblclick', e => {
            e.stopPropagation()
            saveCustom(this.#o.versions, null)
            this.apply()
        })
        h.addEventListener('pointerdown', e => this.#drag(e, i, h))
        return h
    }

    /** @param {PointerEvent} e @param {number} i @param {HTMLElement} h */
    #drag(e, i, h) {
        e.preventDefault()
        e.stopPropagation()
        const widths = this.#o.getHeadCells().map(a => a.getBoundingClientRect().width)
        if (widths.length != this.#o.versions.length || widths.some(w => w <= 0)) return
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
            saveCustom(this.#o.versions, cur.map(w => w / mean))
            this.apply()
        }
        h.addEventListener('pointermove', onMove)
        h.addEventListener('pointerup', onUp)
        h.addEventListener('pointercancel', onUp)
    }
}

// ── 依譯本組合記 (三處共用) ──
/** 組合的 key：譯本排序後 (順序換了也算同一組) @param {string[]} versions */
const comboKey = versions => [...versions].sort().join(',')
/** @returns {Record<string, Record<string, number>>} */
function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') ?? {} } catch { return {} }
}
/** @param {string[]} versions @returns {number[] | null} 依 versions 的順序 */
function loadCustom(versions) {
    const byVer = readStore()[comboKey(versions)]
    if (!byVer) return null
    const re = versions.map(v => byVer[v])
    return re.every(w => typeof w == 'number' && w > 0) ? re : null
}
/** @param {string[]} versions @param {number[] | null} weights null = 回到自動 */
function saveCustom(versions, weights) {
    const store = readStore()
    const key = comboKey(versions)
    if (weights) store[key] = Object.fromEntries(versions.map((v, k) => [v, +weights[k].toFixed(3)]))
    else delete store[key]
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)) } catch { /* 無痕等，不記也能用 */ }
}

/**
 * 自動：各譯本文字實際排版長度 (每個 .lec 的每一行寬度加總) → 比例，限制在平均的 MIN_RATIO–MAX_RATIO 倍
 * @param {ParentNode} root @param {string[]} versions
 * @returns {number[]}
 */
function measureWeights(root, versions) {
    const lens = versions.map(v => {
        let sum = 0
        for (const lec of root.querySelectorAll(`.lec[ver="${v}"]`)) {
            for (const r of lec.getClientRects()) sum += r.width
        }
        return sum
    })
    const mean = lens.reduce((s, a) => s + a, 0) / Math.max(lens.length, 1)
    if (mean <= 0) return versions.map(() => 1)
    return lens.map(a => Math.min(Math.max(a / mean, MIN_RATIO), MAX_RATIO))
}
