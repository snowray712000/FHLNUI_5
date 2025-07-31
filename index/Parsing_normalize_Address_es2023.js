import { BibleConstantHelper } from './BibleConstantHelper.es2023.js'

export function Parsing_normalize_address(jsonObj){
    // - 創1:1，的 prev 仍然會存在，但就是指向自己 (雖然如此，還是作個保護)
    // - .engs 與 .chineses 用 .engs 找 book 比較好，因為沒有繁體簡體的問題
    // - .engs 格式是 Gen 這種，也有大小寫的分別
    // - 使用 .getBookId() 其實支援各種書名，甚至繁體簡體，還有約一約壹這種，並且回傳 1based
    // - .record 裡面的每一個 item 也都有 .engs 與 .chineses   
    if ( Object.hasOwn(jsonObj, 'prev') ){
        let prev = jsonObj.prev;
        const book = BibleConstantHelper.getBookId(prev.engs.toLowerCase());
        delete prev.engs; // 刪除 engs，因為不需要了
        delete prev.chineses; // 刪除 chineses，因為不需要了
        prev.book = book
    }
    if ( Object.hasOwn(jsonObj, 'next') ){
        const next = jsonObj.next;
        const book = BibleConstantHelper.getBookId(next.engs.toLowerCase());
        next.book = book;
        delete next.engs; // 刪除 engs，因為不需要了
        delete next.chineses; // 刪除 chineses，因為不需要了
    }

    if ( Object.hasOwn(jsonObj, 'record') ){
        const record = jsonObj.record;
        for (let i = 0; i < record.length; i++) {
            let item = record[i];
            const book = BibleConstantHelper.getBookId(item.engs.toLowerCase());
            item.book = book;
            delete item.engs; // 刪除 engs，因為不需要了
            delete item.chineses; // 刪除 chineses，因為不需要了
        }
    }
}