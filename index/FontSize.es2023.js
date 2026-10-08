import { TPPageState } from "./TPPageState.es2023.js";

/**
 * 字型大小：以「介面」為基準。docs/z260930a
 * - 介面 (UI) 是最小、最基本的大小：UI = UI_BASE (12pt，坐在電腦前剛好) × 整體大小 (scale %)。介面只由整體大小決定，情境不動它
 * - 整體大小 (scale)：「坐得近還是遠」、眼力、裝置。設一次就不太動，側邊欄的 A− A+ 調這個，一次 ±10%
 * - 情境 (組合，profile)：經文、希伯來文、希臘文、SN 相對於介面的比例。存成「scale 100% 時的 pt」(= 比例 × UI_BASE，可有小數)；切換組合只換 profile，不動整體大小
 * - 實際大小 = round(profile × scale / 100)，夾在範圍內；夾住時 profile 不變，縮回來會恢復。profile 存小數，連按 A+ A- 不會越跑越偏
 * - 經文、原文、SN 的實際值仍寫回 ps (fontSize、fontSizeHebrew、fontSizeGreek、fontSizeStrongNumber)，css 變數照舊 (--fontsize…)
 * - 介面：css 用 --ui-k (= UI / 12 = scale / 100，下限 UI_MIN) 乘原本寫死的大小。index.html 的 inline script 也會先算 --ui-k，避免啟動時跳一下
 * - 觸控最小可按範圍 (44px) 與字大小無關，是 css 的下限 (fhl.css --touch-min，pointer: coarse)，不在這裡
 * - localStorage 'fhlFontSize'：{ v: 2, scale, profile, link, custom }。舊格式 (link / ratio / custom) 由 migrateFontSize 轉換；profile 裡舊的 ui 讀進來就丟掉
 */

export const FONT_MIN = 6
export const FONT_MAX = 60
/** 介面基準 12pt = 原本的大小 (--ui-k 1)，整體大小 100% 時 */
export const UI_BASE = 12
export const UI_MIN = 9
export const UI_MAX = 24
export const SCALE_MIN = 70
export const SCALE_MAX = 200
export const SCALE_STEP = 10

/** @typedef {{ main: number, hebrew: number, greek: number, sn: number }} DFontSizes */
/** @typedef {'main'|'hebrew'|'greek'|'sn'} DFontKey */
/** @type {DFontKey[]} 情境 (profile) 有的項目；介面不在裡面，由整體大小決定 */
export const FONT_KEYS = ['main', 'hebrew', 'greek', 'sn']

/** 內建組合 (情境)：100% 時的 pt。介面是基準 (12pt)，所以「預設」的經文 12 = 與介面一樣大 */
export const FONT_PRESETS = [
    { id: 'default', name: '預設', tip: '經文、希臘文、SN 與介面一樣大，希伯來文大一點', main: 12, hebrew: 16, greek: 12, sn: 12 },
    { id: 'share', name: '投影', tip: '內容全部 48pt，遠處也看得清楚；介面不變', main: 48, hebrew: 48, greek: 48, sn: 48 },
]

/** @returns {number|null} 6 ~ 60 的整數；不是數字傳回 null */
export function clampPt(v) {
    const n = Math.round(Number(v))
    if (v === '' || v == null || !Number.isFinite(n)) return null
    return Math.min(FONT_MAX, Math.max(FONT_MIN, n))
}
/** 介面實際大小 (pt，可有小數)：UI_BASE × 整體大小，夾在 UI_MIN ~ UI_MAX @param {number} scale (%) */
export function uiOf(scale) {
    return Math.min(UI_MAX, Math.max(UI_MIN, UI_BASE * scale / 100))
}
/** @returns {number|null} 70 ~ 200，10 的倍數 */
export function clampScale(v) {
    const n = Number(v)
    if (v === '' || v == null || !Number.isFinite(n)) return null
    return Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(n / SCALE_STEP) * SCALE_STEP))
}
/** 內容的實際大小 (整數 pt，不含介面) @param {DFontSizes} profile @param {number} scale @returns {DFontSizes} */
export function actualOf(profile, scale) {
    return Object.fromEntries(FONT_KEYS.map(k => [k, clampPt(profile[k] * scale / 100)]))
}
/** 比較兩個情境是否相同用 (profile 可有小數) @param {DFontSizes} p */
export function profileKey(p) {
    return FONT_KEYS.map(k => Math.round(p[k] * 100) / 100).join(',')
}
/**
 * 把某項的「實際大小」改為 v，傳回新的 profile
 * @param {DFontSizes} profile @param {number} scale
 * @param {DFontKey} key @param {number} v 實際大小 (pt)
 * @param {boolean} link 改經文時，原文、SN 等比例跟著
 * @returns {DFontSizes}
 */
export function setActual(profile, scale, key, v, link) {
    if (actualOf(profile, scale)[key] == v) return profile // 實際值沒變就不動情境 (例如 110% 時 12 × 1.1 = 13.2 顯示 13，不要把情境改成 13 / 1.1)
    return withValue(profile, key, v * 100 / scale, link)
}
/**
 * A+ A-：情境加減「一個實際 pt」(100 / scale)，而不是由取整後的實際值反推，來回才不會偏
 * @param {DFontSizes} profile @param {number} scale
 * @param {DFontKey} key @param {number} d +1 / -1
 * @param {boolean} link
 * @returns {DFontSizes}
 */
export function stepActual(profile, scale, key, d, link) {
    const p = withValue(profile, key, profile[key] + d * 100 / scale, link)
    return actualOf(p, scale)[key] == actualOf(profile, scale)[key] ? profile : p // 已夾住
}
/** @param {DFontSizes} profile @param {number} pv 情境值 @returns {DFontSizes} */
function withValue(profile, key, pv, link) {
    const r6 = n => Math.round(n * 1e6) / 1e6
    const p = { ...profile, [key]: r6(pv) }
    if (key == 'main' && link) {
        const f = pv / profile.main
        for (const k of ['hebrew', 'greek', 'sn']) p[k] = r6(profile[k] * f)
    }
    return p
}
/** @returns {DFontSizes|null} 各項都是正數才算；多的欄位 (舊的 ui) 丟掉 */
function toProfile(a) {
    if (a == null || !FONT_KEYS.every(k => Number.isFinite(a[k]) && a[k] > 0)) return null
    return Object.fromEntries(FONT_KEYS.map(k => [k, a[k]]))
}
/**
 * localStorage 'fhlFontSize' → 目前的格式。舊格式 (7.2.1 以前)：值在 ps，{ link, ratio, custom (pt) }
 * 轉換後整體 100%，profile = 目前的值，畫面完全不變
 * @param {any} jo
 * @param {{ main: number, hebrew: number, greek: number, sn: number }} psSizes ps 裡的值
 * @returns {{ scale: number, profile: DFontSizes, link: boolean, custom: ({ name: string } & DFontSizes)[] }}
 */
export function migrateFontSize(jo, psSizes) {
    const link = typeof jo?.link == 'boolean' ? jo.link : true
    const custom = (Array.isArray(jo?.custom) ? jo.custom : [])
        .filter(a => typeof a?.name == 'string')
        .map(a => ({ name: a.name, ...toProfile(a) }))
        .filter(a => a.main != null)
    if (jo?.v == 2) {
        const profile = toProfile(jo.profile) ?? { ...psSizes }
        return { scale: clampScale(jo.scale) ?? 100, profile, link, custom }
    }
    const main = clampPt(psSizes.main) ?? 12
    return {
        scale: 100,
        profile: { main, hebrew: clampPt(psSizes.hebrew) ?? 16, greek: clampPt(psSizes.greek) ?? 12, sn: clampPt(psSizes.sn) ?? 12 },
        link, custom,
    }
}

export class FontSize {
    static #s = null
    /** @returns {FontSize} */
    static get s() { if (this.#s == null) this.#s = new FontSize(); return this.#s }
    static #KEY = 'fhlFontSize'

    /** 整體大小 % */
    scale = 100
    /** @type {DFontSizes} 情境：各項在 100% 時的 pt */
    profile = null
    /** 改經文時，原文、SN 是否等比例跟著 */
    link = true
    /** @type {({ name: string } & DFontSizes)[]} 我的組合 (profile) */
    custom = []
    /** @type {Set<(isSettled: boolean) => void>} 值改變時通知 (側邊欄、對話框同步畫面)；isSettled: 停下來了 (已存、該重排版) */
    #listeners = new Set()
    #timer = 0

    constructor() {
        let jo = null
        try { jo = JSON.parse(localStorage.getItem(FontSize.#KEY) ?? 'null') } catch { }
        const ps = TPPageState.s
        const m = migrateFontSize(jo, { main: ps.fontSize, hebrew: ps.fontSizeHebrew, greek: ps.fontSizeGreek, sn: ps.fontSizeStrongNumber })
        this.scale = m.scale
        this.profile = m.profile
        this.link = m.link
        this.custom = m.custom
    }

    /** 實際大小 (pt)：內容 (整數) 與介面 (可有小數) @returns {DFontSizes & { ui: number }} */
    get sizes() {
        return { ...actualOf(this.profile, this.scale), ui: uiOf(this.scale) }
    }

    /** 目前的情境符合哪個組合：內建的 id，我的組合 'u0' 'u1'…，都不是 null */
    get activeId() {
        const cur = profileKey(this.profile)
        const p = FONT_PRESETS.find(a => profileKey(a) == cur)
        if (p != null) return p.id
        const i = this.custom.findIndex(a => profileKey(a) == cur)
        return i < 0 ? null : 'u' + i
    }

    /**
     * 改某項的實際大小
     * @param {DFontKey} key
     * @param {number|string} v
     * @param {boolean} isSettled false: 拖曳滑桿中，先只改 css
     */
    set(key, v, isSettled = true) {
        const sz = clampOf(key, v)
        if (sz == null) return
        this.profile = setActual(this.profile, this.scale, key, sz, this.link)
        this.#write(isSettled)
    }
    /** A+ A- @param {DFontKey} key @param {number} d */
    step(key, d) {
        this.profile = stepActual(this.profile, this.scale, key, d, this.link)
        this.#write(true)
    }
    /** 整體大小 @param {number|string} v (%) @param {boolean} isSettled */
    setScale(v, isSettled = true) {
        const sc = clampScale(v)
        if (sc == null) return
        this.scale = sc
        this.#write(isSettled)
    }
    /** 側邊欄 A− A+：±10% @param {number} d +1 / -1 */
    stepScale(d) {
        this.setScale(this.scale + d * SCALE_STEP)
    }
    /** 套用組合 (不動整體大小) @param {string} id 內建的 id 或 'u0' 'u1'… */
    use(id) {
        const a = id.startsWith('u') ? this.custom[parseInt(id.slice(1))] : FONT_PRESETS.find(p => p.id == id)
        if (a == null) return
        this.profile = toProfile(a)
        this.#write(true)
    }
    /** @param {boolean} link */
    setLink(link) {
        this.link = link
        this.#save()
        this.#emit(true)
    }
    /** 同名的會覆蓋 @param {string} name */
    saveCustom(name) {
        const a = { name, ...this.profile }
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

    /** 實際大小寫回 ps、設定 css 變數 (啟動時也呼叫) */
    applyCss() {
        const s = this.sizes
        const ps = TPPageState.s
        ps.fontSize = s.main
        ps.fontSizeHebrew = s.hebrew
        ps.fontSizeGreek = s.greek
        ps.fontSizeStrongNumber = s.sn
        const style = document.body.style
        style.setProperty("--fontsize", s.main + "pt")
        style.setProperty("--fontsize-hebrew", s.hebrew + "pt")
        style.setProperty("--fontsize-greek", s.greek + "pt")
        style.setProperty("--fontsize-sn", s.sn + "pt")
        style.setProperty("--ui-k", String(s.ui / UI_BASE))  // 介面 = UI_BASE × 整體大小
    }

    /** @param {boolean} isSettled */
    #write(isSettled) {
        this.applyCss()
        this.#emit(false)
        // 拖曳滑桿時，停下來 200ms 才存、才重排版 (併排時要重新對齊各節高度，較費時)
        clearTimeout(this.#timer)
        this.#timer = setTimeout(() => {
            TPPageState.s.saveToLocalStorage()
            this.#save()
            this.#emit(true)
        }, isSettled ? 0 : 200)
    }
    #save() {
        const jo = { v: 2, scale: this.scale, profile: this.profile, link: this.link, custom: this.custom }
        try { localStorage.setItem(FontSize.#KEY, JSON.stringify(jo)) } catch { }
    }
    /** @param {boolean} isSettled */
    #emit(isSettled) {
        for (const fn of this.#listeners) {
            try { fn(isSettled) } catch (ex) { console.error(ex) }
        }
    }
}
