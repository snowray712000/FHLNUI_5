import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { cvtAddrsToRef } from "./cvtAddrsToRef.es2023.js"
import { isRDLocation } from "./isRDLocation.es2023.js";
import { linq_group_by, linq_order_by, linq_order_by_descending } from "./linq_es2023.js";
import { TPPageState } from "./TPPageState.es2023.js"

function cvt_addresses_to_qstr(addresses) {
    // ### 準備給 qsb.php 用
    // - e.g. addresses = [[45, 1, 1], [45, 1, 2]]
    const ps = TPPageState.s;
    const tpChineses = ps.gb == 1 ? '罗' : '羅'

    const addresses2 = addresses.map(a1 => { return { book: a1[0], chap: a1[1], verse: a1[2] } })
    const qstr = cvtAddrsToRef(addresses2, tpChineses)
    return qstr
    // console.log(qstr);
}
function get_dict_na_cname() {
    // ### 早期的 g_bibleversions 是 {中文:{book, otonly, ntonly}} 但這裡是有 book(e.g. unv)
    const na_cname = ps.gb == 1 ? abvphp.g_bibleversionsGb : abvphp.g_bibleversions
    let dict = {}
    for (const key in na_cname) {
        const book = na_cname[key].book
        dict[book] = key
    }
    return dict
}

async function get_data_async(translation_name, qstr) {
    const ps = TPPageState.s;
    const gb = `gb=${(ps.gb === 0 ? '0' : '1')}`;
    const ver = `version=${translation_name}`;
    const strong = `strong=0` 
    
    const book = ps.bookDefault || 45
    const books = BibleConstantHelper.getBookNameArrayChineseShort()
    const ch = books[book-1] // 0-based
    const engs = `engs=${ch}` // 雖然稱作engs，但可以是 太

    const url_param = `?qstr=${qstr}&${engs}&${strong}&${gb}&${ver}`;
    // const url_domain = isRDLocation() ? 'https://bible.fhl.net' : ''
    const url_domain = isRDLocation() ? 'http://127.0.0.1:5600' : ''
    const api_url = url_domain + '/json/qsb.php' + url_param;

    const result_url = await fetch(api_url);
    const result = await result_url.json();
    // console.log(result);

    // - normalize address
    const record = result["record"]
    for (let i = 0; i < record.length; i++) {
        const item = record[i];
        // - 將 engs 與 chineses 轉為 book
        const bookId = BibleConstantHelper.getBookId(item.engs.toLowerCase());
        item["addr"] = [bookId, item.chap, item.sec];

        delete item.chap; // 刪除 chap，因為不需要了
        delete item.sec; // 刪除 sec，因為不需要了
        delete item.engs; // 刪除 engs，因為不需要了
        delete item.chineses; // 刪除 chineses，因為不需要了

        item["bible_text"] = item["bible_text"].replaceAll(/\r?\n/g, " ↩ ");
    }

    // - 每個要標記上譯本資訊
    const dict_na_cname = get_dict_na_cname();
    const cname = dict_na_cname[translation_name];
    for (let i = 0; i < record.length; i++) {
        const item = record[i];
        item["translation_name"] = translation_name;
        item["cname"] = cname;
    }
    
    return result;
}
function get_addrs(addr){
    const na = BibleConstantHelper.getBookNameArrayChineseFull()[addr[0]-1] // 0-based
    return `${na} ${addr[1]}:${addr[2]}` // e.g. 太 2:1
}
/**
 * 
 * @param {Array<{record: Array<{addr, bible_text, translation_name, cname}>}>} response_all 
 * @param {Array<string>} translations 
 * @returns {{addr: number[], addrs: string, texts:{na:string,cna:string,text: string}[]}[]}
 */
function merge_data(response_all, translations){
    // - translations ， 提供使用者的順序
    //   - 每個 resp 的 record 每個，
    const records = response_all.map(a1=>a1.record).flat();
    // console.error(all_record);

    // - 所有 address 集合, 並且 unique, 並且排序
    //   - 排序以 addr[2] + addr[1] * 1000 + addr[0] * 1000000
    //   - 將 each record 的 addr 加一個 addr_hash
    records.map(a1=>a1.addr_hash = a1.addr[2] + a1.addr[1] * 1000 + a1.addr[0] * 1000000)
    // console.log(all_record);
    
    const records_by_addr = linq_group_by(records, a1 => a1.addr_hash)
    // console.log(Array.from(records_by_addr.entries()));

    const records_by_addr_ordered = linq_order_by(Array.from(records_by_addr.entries()), a1=>a1[0])
    // console.log(records_by_addr_ordered);

    // - 將每個裡面的 record 按譯本 排序，依使用者傳入的順序
    let result = []
    for(const [addr_hash, records] of records_by_addr_ordered) {
        // - 按 translations 排序
        // - ["unv","csv",...]
        // - [1, 0, 999...]
        
        /** @type {string[]} */
        const names = records.map(a1=>a1.translation_name)
        const idxs = names.map( a1 => translations.indexOf(a1) ).map( a1 => a1 == -1 ? 999 : a1)
        
        // - 將 records 與 idxs 綁在一起, 像 zip 一樣
        // - 如此，可以用 [0] 排序
        // - 再取出 [1]，就是排序後的 records
        const records_zip = records.map( (a1,i1) => [idxs[i1],a1] )
        const records_zip_order = linq_order_by(records_zip, a1=>a1[0] )
        const records_ordered = records_zip_order.map(a1=>a1[1])

        // - 轉換為最終的結構 [{addr,addrs,texts:{na,cna,text}}]
        // - addr addrs 這些 records
        const addr = records[0].addr
        const addrs = get_addrs(addr)
        const texts = records_ordered.map( a1 =>{
            return {
                na: a1.translation_name,
                cna: a1.cname,
                text: a1.bible_text
            }
        })

        result.push({addr, addrs, texts})
    }
    return result

}
export async function ai_translations_get_data_async(addresses, translations) {
    // - api 取得資料
    const qstr = cvt_addresses_to_qstr(addresses);
    const promises = translations.map(t => get_data_async(t, qstr));
    const response_all = await Promise.all(promises);

    // - 資料轉換，合併多個執行緒結果
    const data = merge_data(response_all, translations)
    return data;

    // - api 取得資料，要給產生 prompt 文字使用，規畫如下
    //   - 型成一個 dict 供產生文字使用，不同譯本，不同內容 {na,cna,text}
    //   - 承上, 以後可能會多節, 所以要 address。e.g. {addr:[47,1,1],addrs: "彼得後書 3:4", texts:{}} {addr: "彼得後書 3:4"}
    //   - 最後就是 [ ] of {addr,adds,texts:{na,cna,text}}
    // - api 一次可取多節經文，但一次只能取一個譯本，所以要多次呼叫 api
    //   - 過程會用到 多執行緒，取得同一節，卻不同譯本資料
    //   - 雖然 qb.php 簡單用，但以後可能仍然會有交互參照的可能，還是用 qsb 吧
    //   - qsb.php 就要 [addresses] 轉換為 qstr 字串了
    //   - cvtAddrsToRef 就是 [] to qstr，原本是配合 splitReference 使用
    // - 注解
    //   - 有的譯本會有注解，但注解要另外 api 取得。
    // - translations 多個可能，所以用 [ ]

    // - api 取得資料，要給產生 prompt 文字使用，規畫如下
    //   - 型成一個 dict 供產生文字使用，不同譯本，不同內容 {na,cna,text}
    //   - 承上, 以後可能會多節, 所以要 address。e.g. {addr:[47,1,1],addrs: "彼得後書 3:4", texts:{}} {addr: "彼得後書 3:4"}
    //   - 最後就是 [ ] of {addr,adds,texts:{na,cna,text}}
    // - api 一次可取多節經文，但一次只能取一個譯本，所以要多次呼叫 api
    //   - 過程會用到 多執行緒，取得同一節，卻不同譯本資料
    //   - 雖然 qb.php 簡單用，但以後可能仍然會有交互參照的可能，還是用 qsb 吧
    //   - qsb.php 就要 [addresses] 轉換為 qstr 字串了
    //   - cvtAddrsToRef 就是 [] to qstr，原本是配合 splitReference 使用
    // - 注解
    //   - 有的譯本會有注解，但注解要另外 api 取得。
    // - translations 多個可能，所以用 [ ]
}

