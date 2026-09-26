/**
 * ### Unicode 希臘文 → 信望愛希臘文內碼 (ASCII)，gcode_2 的反向
 * 例 `πνεῦμα` → `pneu'ma`、`σβέννυτε` → `sbevnnute`
 *
 * 為什麼需要：ssn.php 的 uword / uorig (Unicode) 參數，字尾是 σ/ς 的字都查不到 (λόγος 0 筆)，
 * 用內碼 word / orig 才可靠 (lovgos 68 筆)。ssn.php 是前綴比對 (lovgo 277 筆：λόγος λόγου …)。
 *
 * - 對照表由 gcode2.es2023.js 的表反推，不另外手寫
 * - 鍵盤、NFC 打出的 tonos (ά U+03AC) 與 FHL 的 oxia (ά U+1F71) 都接受
 * - 不認得的字元保留 (例如空白、英數)
 * - 測試 tests/greekToFhlCode.test.js
 */
import { GCODE2_TABLES, gcode_2 } from './gcode2.es2023.js'

/** @type {Map<string, string>} Unicode 字元 → 內碼 */
let _map = null
function getMap() {
    if (_map) return _map
    const { orga, uorg, AD, UAD } = GCODE2_TABLES
    const m = new Map()
    // gcode_2 先套 orga，所以 orga 是正規寫法；同一個 Unicode 有多種寫法時取第一個
    for (let i = 0; i < orga.length; i++) {
        if (!m.has(uorg[i])) m.set(uorg[i], orga[i])
    }
    for (let i = 0; i < AD.length; i++) {
        const u = UAD[i]
        if (u == 'ς') continue // 字尾 s 另外處理
        if (!/[A-Za-z]/.test(AD[i])) continue // " # { } ` 是標點，搜尋用不到
        if (!m.has(u)) m.set(u, AD[i])
    }
    m.set('ς', 's')
    m.set('σ', 's')
    // 大寫：資料庫用與小寫相同的符號 (Ἁ AJ 如 ἁ aJ、Ἄ A[ 如 ἄ a[)，orga 的大寫寫法 (A% A~) 沒在用。
    // 由全新約統計得知 (34 個字元都是這樣)；轉得回同一字才採用 (例如 ᾈ 就不行，維持 orga)
    for (const [u, code] of [...m]) {
        const lower = u.toLowerCase()
        if (lower == u || !m.has(lower)) continue
        const lowerCode = m.get(lower)
        const cand = lowerCode[0].toUpperCase() + lowerCode.slice(1)
        if (cand != code && gcode_2(cand) == u) m.set(u, cand)
    }
    // tonos (NFC 的結果) 視同 oxia
    for (const [uu] of [...m]) {
        const nfc = uu.normalize('NFC')
        if (nfc != uu && !m.has(nfc)) m.set(nfc, m.get(uu))
    }
    return (_map = m)
}

/**
 * @param {string} input Unicode 希臘文，NFC / NFD 皆可
 * @returns {string}
 */
export function greekToFhlCode(input) {
    if (input == null) return ''
    const map = getMap()
    // 先 NFC：NFD 輸入 (字母 + 組合符號) 組回單一字元；oxia 會變 tonos，上面已對應
    const s = String(input).normalize('NFC')
    let out = ''
    for (const c of s) out += map.get(c) ?? c
    return out
}
