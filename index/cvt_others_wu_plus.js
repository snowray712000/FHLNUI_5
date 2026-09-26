/**
 * @typedef {import("./DText.js").DText} DText
 */

// ### 新約原文 fhlwh 的 韋式、聯式 異文
// - 資料形如 `τὸν + Ἀχάς<WG881> + Ἀχάζ<WG881> +` (太1:9)，3 個 + 一組，第1、2個 + 之間是韋式，第2、3個之間是聯式
// - 某一邊可能是空的，例 太3:2 `+ + (καὶ<WG2532>) +`、太6:8 `+ (ὁ θεὸς) + +`，空的那邊就不顯示 (同 parsing)
// - 呈現與 parsing 一致 (parsing_render_top 的 do_about_plus_symbolic)：逐字 (韋：原文) (聯：原文)，並上色 .greek_w .greek_u
// - 分 2 步，因為中間要讓 attach_sn_text 綁 sn-text；若先加上 (韋： 標籤，會干擾它

/**
 * @param {DText} dt
 * @returns {boolean} 純文字 (非 sn 標記、非換行)
 */
function is_plain(dt) {
    return dt.w != null && dt.tp2 == null && dt.sn == null && dt.isBr != 1 && dt.children == null
}

/**
 * ### 第1步：在 attach_sn_text 之前呼叫
 * - 把 + 移除，組內的 DText 標上 wu: 'w' | 'u'
 * - 組內的文字，以空白斷開，一個字一個 DText，第2步才能逐字加標籤
 * - + 數量不是 3 的倍數時 (路24:3)，只移除 +，不標 wu
 * @param {DText[]} dtexts
 * @returns {DText[]}
 */
export function split_wu_plus(dtexts) {
    const cntPlus = dtexts.filter(is_plain).reduce((n, dt) => n + (dt.w.match(/\+/g)?.length ?? 0), 0)
    if (cntPlus == 0) return dtexts

    const isValid = cntPlus % 3 == 0
    if (!isValid) console.warn(`韋式聯式 + 數量不是 3 的倍數 (${cntPlus})，只移除 +`, dtexts.map(a1 => a1.w).join(''))

    let iPlus = 0
    /** @returns {'w'|'u'|undefined} */
    const cur_wu = () => isValid ? [undefined, 'w', 'u'][iPlus % 3] : undefined

    /** @type {DText[]} */
    const re = []
    for (const dt of dtexts) {
        const wu = cur_wu()
        if (!is_plain(dt)) {
            if (wu != null && dt.isBr != 1) dt.wu = wu
            re.push(dt)
            continue
        }
        if (!dt.w.includes('+') && wu == null) {
            re.push(dt)
            continue
        }

        const toks = dt.w.split(/(\+|\s+)/).filter(a1 => a1 !== '')
        for (const tok of toks) {
            if (tok == '+') {
                iPlus++
                continue
            }
            const isSpace = tok.trim() == ''
            // + 移除後，前後的空白會連在一起，只留一個
            const last = re[re.length - 1]
            if (isSpace && last != null && is_plain(last) && last.w.trim() == '') continue

            /** @type {DText} */
            const dt2 = structuredClone(dt)
            dt2.w = tok
            const wu2 = cur_wu()
            if (wu2 != null && !isSpace) dt2.wu = wu2
            re.push(dt2)
        }
    }
    // 例 太1:9 `Ἀχάζ<WG881> +,` 移除 + 後，逗號前會多一個空白
    return re.filter((dt, i) => !(is_plain(dt) && dt.w.trim() == '' && re[i + 1] != null && is_plain(re[i + 1]) && /^[,.·;:]/.test(re[i + 1].w)))
}

/**
 * ### 第2步：在 attach_sn_text 之後呼叫
 * - 連續、同 wu、中間沒有空白的 DText 視為一個字 (含其後的 sn 標記、括號)，前後加上 (韋： 與 )
 * - 同 parsing 斷字規則：空白、換行、逗號、句號 會斷開
 * @param {DText[]} dtexts
 * @returns {DText[]}
 */
export function add_wu_label(dtexts) {
    if (!dtexts.some(a1 => a1.wu != null)) return dtexts

    const isBreak = (/** @type {DText} */ dt) => dt.wu == null || (is_plain(dt) && /^[\s,.]*$/.test(dt.w))

    /** @type {DText[]} */
    const re = []
    for (let i = 0; i < dtexts.length; i++) {
        const dt = dtexts[i]
        if (isBreak(dt)) {
            re.push(dt)
            continue
        }

        const wu = dt.wu
        let j = i
        while (j + 1 < dtexts.length && !isBreak(dtexts[j + 1]) && dtexts[j + 1].wu == wu) j++

        // sn-text 前面可能帶空白，例 " Ἀχάς"，空白放在標籤外
        const first = structuredClone(dt)
        const space = first.w?.match(/^\s+/)?.[0]
        if (space != null) {
            re.push({ w: space })
            first.w = first.w.slice(space.length)
        }

        re.push({ w: wu == 'w' ? '(韋：' : '(聯：', wu })
        re.push(first, ...dtexts.slice(i + 1, j + 1))
        re.push({ w: ')', wu })
        i = j
    }
    return re
}
