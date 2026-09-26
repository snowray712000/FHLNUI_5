/**
 * ### 信望愛希伯來文內碼 (ASCII) → Unicode，舊約原文 (bhs)
 * - `umscode`：內碼 → Unicode，對應 PHP umscode() (VirtualApi/api_php/code.php)。qsb.php 取 bhs 經文用的就是它
 * - 內碼是「視覺順序」(由左到右，字型用)，所以 umscode 會把整個字串反轉 (連 \r\n 與行的順序也反轉)
 * - 母音有三組碼 (瘦、胖、右)，資料庫存的是 PHP mscode() 依子音選好的那組
 * - se.php?VERSION=bhs 回傳的 bible_text 就是內碼，搜尋也要用內碼 (Unicode 查 0 筆)
 * - 已用全舊約 23144 節與 qsb.php 比對
 * - 測試 tests/hebCode.test.js
 */

/** 母音全集：瘦 (配瘦子音)、胖 (配胖子音)、右 (配畸形子音 ד ר)，各 12 個，第 12 個 (45 -) 是 maqaf */
const M = [
    34, 60, 62, 63, 58, 69, 73, 79, 85, 92, 125, 45,
    39, 44, 46, 47, 59, 101, 105, 111, 117, 124, 93, 45,
    161, 162, 163, 164, 165, 166, 167, 123, 168, 169, 170, 45,
]
/** 子音全集 */
const S = [
    33, 65, 71, 78, 87, 89, 90, 103, 110, 119, 121, 122,
    68, 82, 100, 114, 35, 36, 37, 38, 64, 94, 66, 67,
    70, 72, 74, 75, 76, 77, 80, 81, 83, 84, 86, 88,
    91, 97, 98, 99, 102, 104, 106, 107, 108, 109, 112, 113,
    115, 116, 117, 118, 120, 126, 96,
]
/** 瘦子音 (配 M 的第一組) */
const TS = [33, 65, 71, 78, 87, 89, 90, 103, 110, 119, 121, 122]
/** 畸形子音 (配 M 的第三組) */
const SS = [68, 82, 100, 114]
/** S 對應的 Unicode (組合符號的順序照 PHP，例 שׂ 是 05E9 05C2 05BC，不是 NFC 的 05E9 05BC 05C2) */
const US = [
    '\u05df', '\u05d5\u05b9', '\u05d2\u05bc', '\u05e0\u05bc', '\u05d5\u05bc', '\u05d9\u05bc', '\u05d6\u05bc', '\u05d2',
    '\u05e0', '\u05d5', '\u05d9', '\u05d6', '\u05d3\u05bc', '\u05e8\u05bc', '\u05d3', '\u05e8',
    '\u05e5', '\u05da', '\u05da\u05b0', '\u05da\u05bc', '\u05e3', '\u05da\u05b8', '\u05d1\u05bc', '\u05e6\u05bc',
    '\u05e9\u05c2\u05bc', '\u05d4\u05bc', '\u05d8\u05bc', '\u05db\u05bc', '\u05dc\u05bc', '\u05de\u05bc', '\u05e4\u05bc', '\u05e7\u05bc',
    '\u05e1\u05bc', '\u05ea\u05bc', '\u05e9\u05c1\u05bc', '\u05e9', '\u05e2', '\u05d0', '\u05d1', '\u05e6',
    '\u05e9\u05c2', '\u05d4', '\u05d8', '\u05db', '\u05dc', '\u05de', '\u05e4', '\u05e7',
    '\u05e1', '\u05ea', '', '\u05e9\u05c1', '\u05d7', '\u05dd', '\u05c3',
]
/** 11 個母音 + maqaf */
const UA = ['\u05b8', '\u05b6', '\u05b0', '\u05b1', '\u05b7', '\u05b5', '\u05b4', '\u05b9', '\u05bb', '\u05b3', '\u05b2', '\u05be']

export const HEB_TABLES = Object.freeze({ M, S, TS, SS, US, UA })

/**
 * 內碼 → Unicode，對應 PHP umscode()
 * @param {string} input 例 `~yih{l/a` → אֱלֹהִים
 * @returns {string}
 */
export function umscode(input) {
    if (input == null) return ''
    let out = ''
    for (const ch of String(input)) {
        const cx = ch.charCodeAt(0)
        const mi = M.indexOf(cx)
        if (mi >= 0) { out = UA[mi % 12] + out; continue }
        const si = S.indexOf(cx)
        if (si >= 0) { out = US[si] + out; continue }
        out = ch + out
    }
    return out
}
