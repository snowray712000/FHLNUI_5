import { assert } from "./assert_es2023.js";

export function triggerGoEventWhenPageStateAddressChange(ps) {
    assert(ps.bookIndex != null, "ps.bookIndex is null");
    
    const book = ps.bookIndex
    $(document).trigger('go', {
        book: book, // 1-based
        chap: ps.chap,
        sec: ps.sec
    });
    // 這個 go, 會使變數存起來, 下起開啟網頁還是會保留原本的 history
}
export function triggerInfoTitleChanged(ps){
    var idx = getBookFunc("index", ps.chineses); // 0-based    
    $(document).trigger('InfoTitleChanged', {
        titleId: ps.titleId,
        titleIdold: ps.titleIdold,
        addr: {book:idx,chap:ps.chap,sec:ps.sec}
    });
}