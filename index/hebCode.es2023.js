/**
 * ### 信望愛希伯來文內碼 (ASCII) → Unicode，與搜尋用的 regex，舊約原文 (bhs)
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

// ===== 搜尋用：Unicode → 在內碼上比對的 regex =====
// 不反推成單一內碼：母音碼有三組、資料庫的選法又有例外 (例 ד ר 大多配瘦母音，holam 卻用 o)。
// se.php 的 LIKE 分大小寫，而 dagesh 變體多是大小寫 (y יּ Y)，伺服器粗篩不了，
// 所以全舊約內碼打包成 index/bible_bhs_code.json.gz，在本機用 regex 比對。

const DAGESH = 'ּ', SHIN_DOT = 'ׁ', SIN_DOT = 'ׂ'
const CONS_MARKS = DAGESH + SHIN_DOT + SIN_DOT
/** 字尾形 → 一般形 (搜尋時視為相同) */
const SOFIT = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
const plainLetter = c => SOFIT[c] ?? c
const isLetter = c => c >= 'א' && c <= 'ת'
/** 其它寫法的母音視為同一個 (qamats qatan → qamats、holam haser for vav → holam) */
const VOWEL_ALIAS = { 'ׇ': 'ָ', 'ֺ': 'ֹ' }

const reEsc = s => s.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&')

/** @type {{entries: {base: string, cons: string, vowels: number[], code: string}[], vowelClass: string[], anyVowel: string}} */
let _search = null
function getSearch() {
    if (_search) return _search
    const entries = []
    US.forEach((u, i) => {
        const [base, ...marks] = [...u]
        if (base == null || !isLetter(base)) return
        entries.push({
            base: plainLetter(base),
            cons: marks.filter(m => CONS_MARKS.includes(m)).sort().join(''),
            vowels: marks.map(m => UA.indexOf(m)).filter(vi => vi >= 0 && vi < 11),
            code: String.fromCharCode(S[i]),
        })
    })
    // 每個母音的三組碼
    const vowelClass = UA.slice(0, 11).map((_, vi) => '[' + reEsc([M[vi], M[12 + vi], M[24 + vi]].map(c => String.fromCharCode(c)).join('')) + ']')
    const anyVowel = '[' + reEsc(M.filter(c => c != 45).map(c => String.fromCharCode(c)).join('')) + ']'
    return (_search = { entries, vowelClass, anyVowel })
}

/** 含希伯來字母 */
export function isHebrewKeyword(keyword) {
    return /[א-ת]/.test(keyword)
}

/**
 * 一個字 → 在內碼上比對的 regex
 * - 子音：dagesh、shin/sin 點有打才要求；字尾形視為相同
 * - 母音：沒打就不限；有打就要剛好是那些 (三組碼皆可、順序不限)
 * - 重音符號、meteg 忽略
 * @param {string} word Unicode 希伯來文，例 אלהים 或 אֱלֹהִים
 * @returns {RegExp}
 */
export function hebSearchRegex(word) {
    const { entries, vowelClass, anyVowel } = getSearch()
    /** @type {{letter: string, cons: string, vowels: number[]}[]} 邏輯順序 */
    const clusters = []
    for (let c of String(word).normalize('NFC')) {
        c = VOWEL_ALIAS[c] ?? c
        if (isLetter(c)) { clusters.push({ letter: plainLetter(c), cons: '', vowels: [] }); continue }
        const last = clusters[clusters.length - 1]
        if (last == null) continue
        if (CONS_MARKS.includes(c)) last.cons = [...last.cons, c].sort().join('')
        else {
            const vi = UA.indexOf(c)
            if (vi >= 0 && vi < 11 && !last.vowels.includes(vi)) last.vowels.push(vi)
        }
        // 其它 (重音符號、meteg…) 忽略
    }

    const reParts = clusters.map(k => {
        let cands = entries.filter(e => e.base == k.letter && [...k.cons].every(m => e.cons.includes(m)))
        if (cands.length == 0) cands = entries.filter(e => e.base == k.letter) // 例 打了資料庫沒有的 dagesh
        const strict = k.vowels.length > 0
        const alts = []
        for (const e of cands) {
            if (!strict) { alts.push(anyVowel + '*' + reEsc(e.code)); continue }
            if (!e.vowels.every(vi => k.vowels.includes(vi))) continue
            const rest = k.vowels.filter(vi => !e.vowels.includes(vi))
            for (const perm of permutations(rest)) alts.push(perm.map(vi => vowelClass[vi]).join('') + reEsc(e.code))
        }
        return alts.length ? '(?:' + [...new Set(alts)].join('|') + ')' : '(?!)'
    })
    // 內碼是視覺順序：整個反轉
    return new RegExp(reParts.reverse().join(''))
}

/** 所有排列 (母音最多 2~3 個) */
function permutations(arr) {
    if (arr.length <= 1) return [arr]
    return arr.flatMap((a, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [a, ...p]))
}

/**
 * 搜尋結果上色用 (Unicode 經文)：只比對字母，字母之間可以有任何母音、符號；字尾形視為相同
 * @param {string} word
 */
export function hebLooseRegexSource(word) {
    const letters = [...word.normalize('NFC')].filter(isLetter)
    const cls = c => {
        const p = plainLetter(c)
        const sofit = Object.keys(SOFIT).find(k => SOFIT[k] == p)
        return sofit ? `[${p}${sofit}]` : p
    }
    return letters.map(cls).join('[\\u0591-\\u05c7]*')
}
