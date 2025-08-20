import { Bible_fhlwh_json } from "./Bible_fhlwh_json.es2023.js";
import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { getAjaxUrl } from "./getAjaxUrl.es2023.js";
import { isRDLocation } from "./isRDLocation.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";

// renderLectureHtml @ FhlLecture.js
/**
 * @returns {Promise<TpResultBibleText[]>}
 */
export async function lecture_get_data_async() {
    /** @type {TPPageState} */
    const ps = TPPageState.s
    const book = ps.bookIndex
    const chap = ps.chap
    const gb = ps.gb
    const versionPromises = ps.version.map(ver => {
        if (ver == "fhlwh") {
            return get_fhlwh(book, chap)
        } else {
            return get_from_qb_php(book, chap, gb, ver)
        }
    })

    // - 同步取得
    const joResults = await Promise.all(versionPromises)

    // - 將 engs 或 chineses 轉成 book
    joResults.map(a1 => add_book_property_to_bibletext_record(a1))

    // - 避免 bhs 順序
    const idx_bhs = ps.version.indexOf("bhs")
    if ( idx_bhs != -1){
        modify_bhs_bible_text(joResults[idx_bhs])
    }
    return joResults
}

function modify_bhs_bible_text(joResult) {
    for (let ja = 0; ja < joResult.record.length; ja++) {
        const a2 = joResult.record[ja];
        // - 以 split \r\n 切割多個，然後再 reverse，再用 \n 合併回來
        a2.bible_text = a2.bible_text.split(/\r?\n\r?/g).reverse().join("\n");
    }
}

/**
 * @param {TpOneRecordBibleText} result 
 * @param {boolean} is_remove_engs_and_chineses 
 */
function add_book_property_to_bibletext_record(result, is_remove_engs_and_chineses = false) {
    // 找出所有用到的 engs. 類似 np.unique
    let fnEngs2 = a1 => a1.engs != null ? a1.engs : a1.chineses
    let fnEngs3 = a1 => a1 != null ? fnEngs2(a1) : null

    let allengs = result.record.map(fnEngs2)

    // 將 next 與 prev 的也加入
    allengs.push(fnEngs3(result.next), fnEngs3(result.prev))

    // 型成 engs: book 的對應表，順便就有 Set 效果
    let dict_chap_cnt = {}
    for (let i = 0; i < allengs.length; i++) {
        const engs = allengs[i];

        if (engs != null && dict_chap_cnt[engs] == undefined) {
            dict_chap_cnt[engs] = BibleConstantHelper.getBookId(engs.toLowerCase())
        }
    }

    // 開始處理每個 record
    for (const a1 of result.record) {
        // 有資料，原本就有 book 就略過
        if (a1.book == undefined) {
            // a1 是一個 record
            // 取得 engs，然後從 dict_chap_cnt 中取得 book
            const keyEngs = fnEngs2(a1)
            let book = dict_chap_cnt[keyEngs]
            if (book == undefined) {
                // 若沒有找到，則預設為 0
                console.error(`找不到 book 對應的 engs: ${a1.engs || a1.chineses}`)
                book = 0
            }

            // 設定 book 屬性
            a1.book = book
        }

        if (is_remove_engs_and_chineses) {
            // 若要移除 engs 與 chineses
            delete a1.engs
            delete a1.chineses
        }
    }

    // 處理 next 與 prev
    if (result.next != undefined) {
        if (result.next.book == undefined) {
            // next 也要加上 book 屬性
            const keyEngs = fnEngs3(result.next)
            result.next.book = dict_chap_cnt[keyEngs]
            if (result.next.book == undefined) {
                console.error(`找不到 next book 對應的 engs: ${result.next}`)
                result.next.book = 0
            }
        }
        if (is_remove_engs_and_chineses) {
            delete result.next.engs
            delete result.next.chineses
        }
    }
    if (result.prev != undefined) {
        if (result.prev.book == undefined) {
            // prev 也要加上 book 屬性
            const keyEngs = fnEngs3(result.prev)
            result.prev.book = dict_chap_cnt[keyEngs]
            if (result.prev.book == undefined) {
                console.error(`找不到 prev book 對應的 engs: ${result.prev}`)
                result.prev.book = 0
            }
        }
        if (is_remove_engs_and_chineses) {
            delete result.prev.engs
            delete result.prev.chineses
        }
    }
}

async function get_fhlwh(book, chap) {
    await testThenDoAsync(() => Bible_fhlwh_json.s.filecontent != null);

    // where [0]=bk and [1]=ch
    const jaBible = Bible_fhlwh_json.s.filecontent["data"].filter(ja => ja[0] == book && ja[1] == chap)
    // console.log(jaBible);

    // chap, sec, bible_text
    const jaBible2 = jaBible.map(ja => ({
        chap: ja[1],
        sec: ja[2],
        bible_text: ja[3],
        book: ja[0]
    }))
    const joResult = {
        "status": "success",
        "version": "fhlwh",
        "record": jaBible2,
        "record_count": jaBible2.length,
        "v_name": "新約原文"
    }
    return joResult
}
async function get_from_qb_php(book, chap, gb, version) {
    // "https://bible.fhl.net/json/qb.php?chineses=%E5%89%B5&chap=1&version=bhs&strong=1&gb=0"
    // const domain = isRDLocation() ? "https://bible.fhl.net" : ""
    const domain = isRDLocation() ? "http://127.0.0.1:5600" : ""
    const endpoint = '/json/qb.php'
    const chineses = BibleConstantHelper.getBookNameArrayChineseShort()[book - 1]
    const params = `?chineses=${chineses}&chap=${chap}&version=${version}&strong=1&gb=${gb}`
    const url = `${domain}${endpoint}${params}`
    const response = await fetch(url)
    return await response.json()
}