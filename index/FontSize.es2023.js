import { TPPageState } from "./TPPageState.es2023.js";

/**
 * 字型大小：主字型、希伯來文、希臘文、SN 四個值 (pt)
 * - 值仍存在 ps (fontSize、fontSizeHebrew、fontSizeGreek、fontSizeStrongNumber)，css 變數也照舊 (--fontsize…)
 * - 另外存在 localStorage 'fhlFontSize' 的：是否「跟著主字型等比例」、比例、我的組合
 * - 比例存起來，而不是每次由目前的值推算，連按 A+ A- 才不會因四捨五入越跑越偏
 */

export const FONT_MIN = 6
export const FONT_MAX = 60
/** @typedef {{ main: number, hebrew: number, greek: number, sn: number }} DFontSizes */
/** @type {('main'|'hebrew'|'greek'|'sn')[]} */
export const FONT_KEYS = ['main', 'hebrew', 'greek', 'sn']

/** 內建組合 (pt) */
export const FONT_PRESETS = [
    { id: 'default', name: '預設', tip: '原本的大小', main: 12, hebrew: 26, greek: 26, sn: 14 },
    { id: 'study', name: '研讀', tip: '原文放大，SN 小一點不搶眼', main: 14, hebrew: 32, greek: 28, sn: 11 },
    { id: 'share', name: '分享、投影', tip: '整體大字，遠處也看得清楚', main: 22, hebrew: 40, greek: 36, sn: 12 },
    { id: 'compact', name: '精簡', tip: '字小，一次多看幾節', main: 10, hebrew: 20, greek: 18, sn: 10 },
]

/** @returns {number|null} 6 ~ 60 的整數；不是數字傳回 null */
export function clampPt(v) {
    const n = Math.round(Number(v))
    if (v === '' || v == null || !Number.isFinite(n)) return null
    return Math.min(FONT_MAX, Math.max(FONT_MIN, n))
}
/** 比較兩組大小是否相同用 @param {DFontSizes} s */
export function sizesKey(s) {
    return FONT_KEYS.map(k => s[k]).join(',')
}
/** @param {DFontSizes} s @returns {{ hebrew: number, greek: number, sn: number }} */
export function ratioOf(s) {
    return { hebrew: s.hebrew / s.main, greek: s.greek / s.main, sn: s.sn / s.main }
}
/**
 * 主字型改為 main，原文、SN 依比例
 * @param {{ hebrew: number, greek: number, sn: number }} ratio
 * @param {number} main
 * @returns {DFontSizes}
 */
export function scaleByMain(ratio, main) {
    return { main, hebrew: clampPt(main * ratio.hebrew), greek: clampPt(main * ratio.greek), sn: clampPt(main * ratio.sn) }
}

export class FontSize {
    static #s = null
    /** @returns {FontSize} */
    static get s() { if (this.#s == null) this.#s = new FontSize(); return this.#s }
    static #KEY = 'fhlFontSize'

    /** 原文、SN 是否跟著主字型等比例縮放 */
    link = true
    /** @type {{ hebrew: number, greek: number, sn: number }} */
    ratio = null
    /** @type {({ name: string } & DFontSizes)[]} 我的組合 */
    custom = []
    /** @type {Set<(isSettled: boolean) => void>} 值改變時通知 (側邊欄、對話框同步畫面)；isSettled: 停下來了 (已存、該重排版) */
    #listeners = new Set()
    #timer = 0

    constructor() {
        let jo = null
        try { jo = JSON.parse(localStorage.getItem(FontSize.#KEY) ?? 'null') } catch { }
        if (typeof jo?.link == 'boolean') this.link = jo.link
        const r = jo?.ratio
        if (r != null && ['hebrew', 'greek', 'sn'].every(k => Number.isFinite(r[k]) && r[k] > 0)) this.ratio = r
        if (Array.isArray(jo?.custom)) {
            this.custom = jo.custom.filter(a => typeof a?.name == 'string' && FONT_KEYS.every(k => clampPt(a[k]) != null))
                .map(a => ({ name: a.name, ...Object.fromEntries(FONT_KEYS.map(k => [k, clampPt(a[k])])) }))
        }
        this.ratio ??= ratioOf(this.sizes)
    }

    /** @returns {DFontSizes} */
    get sizes() {
        const ps = TPPageState.s
        return { main: ps.fontSize, hebrew: ps.fontSizeHebrew, greek: ps.fontSizeGreek, sn: ps.fontSizeStrongNumber }
    }

    /** 目前的大小符合哪個組合：內建的 id，我的組合 'u0' 'u1'…，都不是 null */
    get activeId() {
        const cur = sizesKey(this.sizes)
        const p = FONT_PRESETS.find(a => sizesKey(a) == cur)
        if (p != null) return p.id
        const i = this.custom.findIndex(a => sizesKey(a) == cur)
        return i < 0 ? null : 'u' + i
    }

    /**
     * @param {'main'|'hebrew'|'greek'|'sn'} key
     * @param {number|string} v
     * @param {boolean} isSettled false: 拖曳滑桿中，先只改 css
     */
    set(key, v, isSettled = true) {
        const sz = clampPt(v)
        if (sz == null) return
        const s = this.sizes
        if (key == 'main') {
            this.#write(this.link ? scaleByMain(this.ratio, sz) : { ...s, main: sz }, isSettled)
        } else {
            s[key] = sz
            this.ratio = { ...this.ratio, [key]: sz / s.main }
            this.#write(s, isSettled)
        }
    }
    /** A+ A- @param {'main'|'hebrew'|'greek'|'sn'} key @param {number} d */
    step(key, d) {
        this.set(key, this.sizes[key] + d)
    }
    /** @param {string} id 內建的 id 或 'u0' 'u1'… */
    use(id) {
        const a = id.startsWith('u') ? this.custom[parseInt(id.slice(1))] : FONT_PRESETS.find(p => p.id == id)
        if (a == null) return
        this.ratio = ratioOf(a)
        this.#write({ main: a.main, hebrew: a.hebrew, greek: a.greek, sn: a.sn }, true)
    }
    /** @param {boolean} link */
    setLink(link) {
        this.link = link
        this.ratio = ratioOf(this.sizes) // 打開時，以目前的比例為準
        this.#save()
        this.#emit(true)
    }
    /** 同名的會覆蓋 @param {string} name */
    saveCustom(name) {
        const a = { name, ...this.sizes }
        const i = this.custom.findIndex(b => b.name == name)
        if (i < 0) this.custom.push(a)
        else this.custom[i] = a
        this.#save()
        this.#emit(true)
    }
    /** @param {number} i */
    removeCustom(i) {
        this.custom.splice(i, 1)
        this.#save()
        this.#emit(true)
    }

    /** @param {(isSettled: boolean) => void} fn @returns {() => void} 取消訂閱 */
    onChange(fn) {
        this.#listeners.add(fn)
        return () => this.#listeners.delete(fn)
    }

    /** 設定 css 變數 (啟動時也呼叫) */
    applyCss() {
        const s = this.sizes
        const style = document.body.style
        style.setProperty("--fontsize", s.main + "pt")
        style.setProperty("--fontsize-hebrew", s.hebrew + "pt")
        style.setProperty("--fontsize-greek", s.greek + "pt")
        style.setProperty("--fontsize-sn", s.sn + "pt")
    }

    /** @param {DFontSizes} s @param {boolean} isSettled */
    #write(s, isSettled) {
        const ps = TPPageState.s
        ps.fontSize = s.main
        ps.fontSizeHebrew = s.hebrew
        ps.fontSizeGreek = s.greek
        ps.fontSizeStrongNumber = s.sn
        this.applyCss()
        this.#emit(false)
        // 拖曳滑桿時，停下來 200ms 才存、才重排版 (併排時要重新對齊各節高度，較費時)
        clearTimeout(this.#timer)
        this.#timer = setTimeout(() => {
            ps.saveToLocalStorage()
            this.#save()
            this.#emit(true)
        }, isSettled ? 0 : 200)
    }
    #save() {
        const jo = { link: this.link, ratio: this.ratio, custom: this.custom }
        try { localStorage.setItem(FontSize.#KEY, JSON.stringify(jo)) } catch { }
    }
    /** @param {boolean} isSettled */
    #emit(isSettled) {
        for (const fn of this.#listeners) {
            try { fn(isSettled) } catch (ex) { console.error(ex) }
        }
    }
}
