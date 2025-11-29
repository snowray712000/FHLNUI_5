import { BibleConstantHelper } from './BibleConstantHelper.es2023.js'
import { splitReference } from './splitReference.es2023.js'
import { TPPageState } from './TPPageState.es2023.js'
import { queryReferenceAndShowAtDialogAsync } from './queryReferenceAndShowAtDialogAsync.es2023.js'
import { cvtAddrsToRef } from './cvtAddrsToRef.es2023.js'
import { Hash_Changed } from './Hash_Changed.js'
import { ViewHistory } from './ViewHistory.es2023.js'
import { ViewHistoryData } from './ViewHistoryData_es2023.js'

export async function hash_change_on_initial() {
    // - 有 `#/bible/` 開頭才處理
    if (!location.hash.startsWith('#/bible/')) {
        return
    }
    
    // Bug
    if (location.hash.includes("undefined")) {
        console.warn("bug undefined location hash");
        
        const addr_default_old_style = ViewHistoryData.s.get_first_valid_address_or_Rom1()
        // 將 old 轉為 new style, 雖然會有節，但轉成新的時候，不要節，直接整章。
        const book_na = BibleConstantHelper.getBookNameArrayChineseShort()[addr_default_old_style.book - 1]
        const chap = addr_default_old_style.chap
        const sec = addr_default_old_style.sec
        const addr_str = `${book_na}${chap}:${sec}`
         
        location.hash = `#/bible/${addr_str}`
        return 
    }

    // - 取得 #/bible/ 後面的部分. e.g. Ge/3/5 或 Ge3:5
    let hash2 = location.hash.substring(8) // '#/bible/'.length

    // - 彼前1:21 會變成 %E5%BD%BC%E5%89%8D1:21
    hash2 = decode_hash(hash2) // "/bible/彼前1:21" 會變成 "/bible/%E5%BD%BC%E5%89%8D1:21"

    // hash2 = '1Pe1:2;2Pe2:1-3;啟2:1'
    // - 解析 hash (型成 addr array (後面再判斷是同書卷、同一章嗎？還是交互參照，多卷或多章))
    /** @type {number[][]}*/
    let addrs = []
    if (is_old_style_hash(hash2)) {
        console.warn("is old");

        // - 轉成新的格式
        const addr_new = cvt_to_new_style(hash2) // [book, chap, sec]
        // - 若是 太4:1
        // - 再從 HistroyData 中

        addrs.push(addr_new)

        // - 變更 hash 網址，成為新的格式
        let str_newhash = cvt_to_addrs_str_from_addrs(addrs)

        const newhash = `#/bible/${str_newhash}`
        Hash_Changed.s.set_hash_by_code(newhash)
    } else {
        addrs = cvt_to_addrs_from_reference_str(hash2)
    }

    // - 判斷，是不是只有一書卷，一章節。若不是，就要用 dialog 顯示
    if (is_same_book_chap(addrs)) {
        // - 設定 ps 目前 書卷、章 為 addrs[0] 的部分
        const ps = TPPageState.s
        const addr = addrs[0]

        // - 網址，確保正確
        const addr_correct = makesure_correct_address(addr)

        ps.bookIndex = addr_correct[0]
        ps.chap = addr_correct[1]
        ps.sec = addr_correct[2]
    } else {
        await show_in_dialog(addrs)
    }
}
function decode_hash(s) {
    let decoded;
    try {
        decoded = decodeURIComponent(s); // "/bible/彼前1:21"
    } catch (e) {
        // 若有不合法的編碼，當 fallback 處理
        decoded = s;
    }
    return decoded
}
/**
 * 
 * @param {number[]} addr [book, chap, verse]
 * @returns 
 */
function makesure_correct_address(addr) {
    // # 動機: 使用者輸入的位置，可能是錯誤的
    // - 若書卷 > 66，設為 66，若 < 1，設為 1
    // - 若章 > 最大章，設為最大章，若 < 1，設為 1
    // - 若節 > 最大節，設為最大節，若 < 1，設為 1

    const book = Math.min(Math.max(1, addr[0]), 66)

    const chapMax = BibleConstantHelper.getCountChapOfBook(book)
    const chap = Math.min(Math.max(1, addr[1]), chapMax)

    const verseMax = BibleConstantHelper.getCountVerseOfChap(book, chap)
    const verse = Math.min(Math.max(1, addr[2]), verseMax)

    return [book, chap, verse]
}
function cvt_to_addrs_str_from_addrs(addrs) {
    // console.warn("cvt_to_addrs_str_from_addrs");
    
    const tp = TPPageState.s.gb == 1 ? '罗' : '羅'
    const addrs2 = addrs.map((x) => { return { book: x[0], chap: x[1], verse: x[2] } })
    
    return cvtAddrsToRef(addrs2, tp)
}
async function show_in_dialog(addrs) {
    const addrs2 = addrs.map((x) => { return { book: x[0], chap: x[1], verse: x[2] } })
    const ps = TPPageState.s
    const version = ps.version[0] ?? "unv"

    await queryReferenceAndShowAtDialogAsync({ addrs: addrs2, version: version })
}
function is_same_book_chap(addrs) {
    if (addrs.length <= 1) {
        return true
    }
    const book0 = addrs[0][0]
    const chap0 = addrs[0][1]
    for (let i = 1; i < addrs.length; i++) {
        if (addrs[i][0] !== book0 || addrs[i][1] !== chap0) {
            return false
        }
    }
    return true
}
function cvt_to_addrs_from_reference_str(str) {
    const ps = TPPageState.s

    const r1 = splitReference(str, { book: ps.bookIndex, chap: ps.chap, sec: ps.sec })

    const r2 = r1[0] // 當 input 是 DText[] 時，才會有多個結果
    // const r3b = r2.w // 就是原本文字 (目前沒用到)
    const r3 = r2.refAddresses // 是一個 {book,chap,verse}[] 結果

    const addrs = r3.map((x) => [x.book, x.chap, x.verse])
    return addrs
}
function is_old_style_hash(hash) {
    // - 是 /Eng/chap/verse
    // - e.g. Ge/3/5 1Pe/5/1

    // - 用簡單的，包含 `/` 並且接下來是數字的方式判定，不限定 Engs 表示書卷
    if (hash.indexOf('/') < 0) {
        return false
    }
    // - Ge/3 Ge/3/5 創/3 創/3/5 都可以
    if (/\/\d+\/\d+$/.test(hash)) {
        return true
    }
    if (/\/\d+$/.test(hash)) {
        return true
    }
    return false
}

function cvt_to_new_style(hash_old) {
    // - 本來 Ge/3/5 就是 第3章，只是 activate 是第5節而已。
    // - 這裡轉換還是轉成節，而不是變成 Ge 3，至少是顯示一章，則是在後面再判定。
    const parts = hash_old.split('/')

    const bookName = parts[0]
    const book = BibleConstantHelper.getBookId(bookName.toLowerCase())
    const chap = parseInt(parts[1])
    const sec = parts.length < 3 ? 1 : parseInt(parts[2])

    // - 確保 book, chap, sec 都是有效的
    const book_chap_sec = makesure_correct_address([book, chap, sec])
    return book_chap_sec
}