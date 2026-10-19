import { BookRegistry } from './BookRegistry.es2023.js'

/**
 * # 次經的書名用哪一套：信望愛站名 ('fhl'，預設) 或天主教通行名 ('alt')
 *
 * 次經的書名有兩套 (BookRegistry 兩套都認得，所以網址、搜尋框打哪一套都能跳)，這裡管「畫面上顯示哪一套」。
 * 存在 localStorage，載入這個模組時就套用 (要在畫面第一次畫書名之前，所以 index.js 要 import)。
 * 設定面板的選項見 Settings.es2023.js；規畫見 docs/z261019b
 */

export const NAME_STYLE_KEY = 'fhlApoNameStyle'

/** @returns {import('./BookRegistry.es2023.js').NameStyle} 沒存過、存的不認得、讀不到 (無痕等) 都是 'fhl' */
export function readNameStyle() {
    try { return localStorage.getItem(NAME_STYLE_KEY) === 'alt' ? 'alt' : 'fhl' } catch { return 'fhl' }
}

/** 設定並記住 @param {import('./BookRegistry.es2023.js').NameStyle} style */
export function writeNameStyle(style) {
    BookRegistry.setNameStyle(style) // 不認得的 style 會丟錯，先於存檔
    try { localStorage.setItem(NAME_STYLE_KEY, style) } catch { /* 不記也能用 */ }
}

BookRegistry.setNameStyle(readNameStyle())
