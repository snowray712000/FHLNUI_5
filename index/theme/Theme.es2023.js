/**
 * 主題：跟隨系統 / 淺色 / 深色 / 高對比淺色 / 高對比深色 (docs/z261003b)
 * - 顏色是 @fhlnet/color-apple 的 Apple 色票 (index/theme/apple-color-ios.css，npm run gen:theme 複製來的)
 *   加上語意變數 (index/theme/theme-vars.css)；這裡只負責 <html data-theme> 與記住選擇
 * - 存在 localStorage 'fhlTheme'。index.html <head> 最前面的 inline script 先讀一次並設好 data-theme，
 *   第一次繪製就是對的主題 (不閃白)；這支 module 載入得晚，只管之後的切換
 * - 套件的 setTheme 只有幾行，自己寫 (原生 module 不能 import 套件：它的 index.js 會 import css)
 */
/** @typedef {import('@fhlnet/color-apple').AppleColorTheme} AppleColorTheme */
/** @typedef {'auto' | AppleColorTheme} ThemeMode */

/** @type {ThemeMode[]} */
export const THEME_MODES = ['auto', 'light', 'dark', 'hc-light', 'hc-dark']

/**
 * 回傳 `var(--name)`，JS 設定顏色時用 (同套件的 cssVar)。name 可以是 Apple 色名或 theme-vars.css 的語意變數
 * @param {import('@fhlnet/color-apple').CssVarName | string} name
 */
export const cssVar = name => `var(--${name})`

export class Theme {
    static #s = null
    /** @returns {Theme} */
    static get s() { if (this.#s == null) this.#s = new Theme(); return this.#s }

    static #KEY = 'fhlTheme'
    /** @type {Set<(mode: ThemeMode) => void>} */
    #listeners = new Set()

    constructor() {
        // 其他分頁切了主題，這頁也跟著
        window.addEventListener('storage', e => {
            if (e.key == Theme.#KEY) this.#apply(this.mode)
        })
        // 跟隨系統時，系統切深色 / 高對比也要通知 (例 theme-color)
        for (const q of ['(prefers-color-scheme: dark)', '(prefers-contrast: more)'])
            matchMedia(q).addEventListener('change', () => { if (this.mode == 'auto') this.#apply('auto') })
        this.#updateMetaThemeColor()
    }

    /** 目前的選擇；沒選過 = 'auto' 跟隨系統 @returns {ThemeMode} */
    get mode() {
        let v = null
        try { v = localStorage.getItem(Theme.#KEY) } catch { }
        return THEME_MODES.includes(/** @type {any} */ (v)) ? /** @type {ThemeMode} */ (v) : 'auto'
    }
    /** @param {ThemeMode} mode */
    set mode(mode) {
        if (!THEME_MODES.includes(mode)) mode = 'auto'
        try {
            if (mode == 'auto') localStorage.removeItem(Theme.#KEY)
            else localStorage.setItem(Theme.#KEY, mode)
        } catch { }
        this.#apply(mode)
    }
    /** 實際的明暗 (跟隨系統時看系統) */
    get isDark() { return getComputedStyle(document.documentElement).colorScheme == 'dark' }

    /** @param {(mode: ThemeMode) => void} fn @returns {() => void} 取消訂閱 */
    onChange(fn) {
        this.#listeners.add(fn)
        return () => this.#listeners.delete(fn)
    }

    /**
     * 暫時用淺色主題算顏色 (同步，中間不會重繪)。例：複製對照表時讀 getComputedStyle 的顏色，
     * 深色主題下貼到 Word 也是淺色版的顏色
     * @template T @param {() => T} fn @returns {T}
     */
    withLightPalette(fn) {
        const root = document.documentElement
        const old = root.getAttribute('data-theme')
        if (old == 'light') return fn()
        root.classList.add('theme-no-transition') // 有 transition 的元素，getComputedStyle 會讀到動畫起點 (舊主題) 的顏色
        root.setAttribute('data-theme', 'light')
        try { return fn() } finally {
            if (old == null) root.removeAttribute('data-theme')
            else root.setAttribute('data-theme', old)
            getComputedStyle(root).color // 先套用回原主題，再拿掉 class，切回來時也不跑動畫
            root.classList.remove('theme-no-transition')
        }
    }

    /** @param {ThemeMode} mode */
    #apply(mode) {
        const root = document.documentElement
        root.classList.add('theme-no-transition') // 切主題時各處的 transition 不要跟著慢慢變色
        if (mode == 'auto') root.removeAttribute('data-theme')
        else root.setAttribute('data-theme', mode)
        getComputedStyle(root).color
        requestAnimationFrame(() => root.classList.remove('theme-no-transition'))
        this.#updateMetaThemeColor()
        for (const fn of this.#listeners) fn(mode)
    }

    /** 手機瀏覽器網址列的顏色跟工具列一樣 */
    #updateMetaThemeColor() {
        let meta = document.querySelector('meta[name="theme-color"]')
        if (meta == null) meta = document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'theme-color' }))
        meta.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--chrome-bg').trim())
    }
}
