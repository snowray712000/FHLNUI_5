(function (root) {
    root.triggerGoEventWhenPageStateAddressChange = triggerGoEventWhenPageStateAddressChange
    root.triggerInfoTitleChanged = triggerInfoTitleChanged
})(this)
function triggerGoEventWhenPageStateAddressChange(ps) {
    var idx = getBookFunc("index", ps.chineses); // 0-based    
    $(document).trigger('go', {
        chineses: ps.chineses,
        book: idx+1, // 1-based
        chap: ps.chap,
        sec: ps.sec
    });
    // 這個 go, 會使變數存起來, 下起開啟網頁還是會保留原本的 history
}
function triggerInfoTitleChanged(ps){
    var idx = getBookFunc("index", ps.chineses); // 0-based    
    $(document).trigger('InfoTitleChanged', {
        titleId: ps.titleId,
        titleIdold: ps.titleIdold,
        addr: {book:idx,chap:ps.chap,sec:ps.sec}
    });
}