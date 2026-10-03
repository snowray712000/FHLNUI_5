/**
 * @typedef {import("./DText.js").DText} DText
 */

// ### 新約原文 fhlwh 的 韋式、聯式 異文
// - 資料形如 `τὸν + Ἀχάς<WG881> + Ἀχάζ<WG881> +` (太1:9)，3 個 + 一組，第1、2個 + 之間是韋式，第2、3個之間是聯式
// - 某一邊可能是空的，例 太3:2 `+ + (καὶ<WG2532>) +`、太6:8 `+ (ὁ θεὸς) + +`，空的那邊就不顯示 (同 parsing)
// - 呈現：整段一個標籤 (韋：τὰ παραπτώματα αὐτῶν) (聯：…)，並上色 .greek_w .greek_u (舊版是逐字 (韋：τὰ) (韋：παραπτώματα)…)
// - 資料本身的 ( ) 保留：那是 WH 印刷版的 [ ] (編者認為可疑；(( )) 是 [[ ]]，例 路22:43、約7:53)，不是抄本原有，
//   但是編者的意見，不是轉換 bug。例 太1:18 `+ (Ἰησοῦ) + Ἰησοῦ +`，拿掉就看不出韋式、聯式差在哪
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
 * - 組內的文字，以空白斷開，一個字一個 DText (attach_sn_text 綁 sn-text 要)；組內的空白也標 wu，第2步整段才連得起來
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
            if (wu2 != null) dt2.wu = wu2
            re.push(dt2)
        }
    }
    // 例 太1:9 `Ἀχάζ<WG881> +,` 移除 + 後，逗號前會多一個空白
    return re.filter((dt, i) => !(is_plain(dt) && dt.w.trim() == '' && re[i + 1] != null && is_plain(re[i + 1]) && /^[,.·;:]/.test(re[i + 1].w)))
}

/**
 * ### 第2步：在 attach_sn_text 之後呼叫
 * - 連續、同 wu 的 DText 視為一段 (一組 + + + 中的韋式或聯式)，前後加上 (韋： 與 )
 * - 段落頭尾的空白放在標籤外，也不上色
 * - 換行會斷開 (標籤各自成對)
 * @param {DText[]} dtexts
 * @returns {DText[]}
 */
export function add_wu_label(dtexts) {
    if (!dtexts.some(a1 => a1.wu != null)) return dtexts

    const isBreak = (/** @type {DText} */ dt) => dt.wu == null || dt.isBr == 1
    const isSpace = (/** @type {DText} */ dt) => is_plain(dt) && dt.w.trim() == ''
    /** @param {DText} dt */
    const unWu = dt => { const dt2 = structuredClone(dt); delete dt2.wu; return dt2 }

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

        // 頭尾的空白 DText 放在標籤外
        let a = i, b = j
        while (a <= b && isSpace(dtexts[a])) a++
        while (b >= a && isSpace(dtexts[b])) b--
        re.push(...dtexts.slice(i, a).map(unWu))
        if (a <= b) {
            const mid = dtexts.slice(a, b + 1).map(a1 => structuredClone(a1))
            // sn-text 頭尾可能帶空白，例 " Ἀχάς"，空白也放在標籤外
            const head = mid[0].w?.match(/^\s+/)?.[0]
            if (head != null) {
                re.push({ w: head })
                mid[0].w = mid[0].w.slice(head.length)
            }
            const last = mid[mid.length - 1]
            const tail = last.w?.match(/\s+$/)?.[0]
            if (tail != null) last.w = last.w.slice(0, -tail.length)

            re.push({ w: wu == 'w' ? '(韋：' : '(聯：', wu }, ...mid, { w: ')', wu })
            if (tail != null) re.push({ w: tail })
        }
        re.push(...dtexts.slice(b + 1, j + 1).map(unWu))
        i = j
    }
    return re
}
