import { assert } from "./assert_es2023.js";

export function triggerGoEventWhenPageStateAddressChange(ps) {
    assert(ps.bookIndex != null, "ps.bookIndex is null");
    
    // chap book sec 有可能因為是從 attr 中取得，所以變成 "字串"，所以要轉成數字，但若原本是數字，就不轉換。
    const book = parseInt(ps.bookIndex, 10) || 0; // 預設為 0
    ps.chap = parseInt(ps.chap, 10) || 0; // 預設為 0
    ps.sec = parseInt(ps.sec, 10) || 0; // 預設為 0

    $(document).trigger('go', {
        book: book, // 1-based
        chap: ps.chap,
        sec: ps.sec
    });
    // 這個 go, 會使變數存起來, 下起開啟網頁還是會保留原本的 history
}
export function triggerInfoTitleChanged(ps){
    assert(ps.bookIndex != null, "ps.bookIndex is null");
    const book = ps.bookIndex
    
    $(document).trigger('InfoTitleChanged', {
        titleId: ps.titleId,
        titleIdold: ps.titleIdold,
        addr: {book:book,chap:ps.chap,sec:ps.sec}
    });
}