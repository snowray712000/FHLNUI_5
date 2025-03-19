(function (root) {

    function setBook(ps, bookName) {
        var idx = null;
        if (book.indexOf(bookName) != -1) {
            idx = book.indexOf(bookName);
        }
        else if (bookGB.indexOf(bookName) != -1) {
            idx = bookGB.indexOf(bookName);
        }
        else if (bookEng.indexOf(bookName) != -1) {
            idx = book.indexOf(bookName);
        } else {
            idx = null;
        }

        if (idx != null) {
            ps.bookIndex = idx+1 // 從 0-based 變成 1-based
            ps.chineses = book[idx];
            ps.engs = bookEng[idx];
        } else {
            console.log('setBook error:idx is null');
        }
    }


    // 因為 document 的事件愈來愈多自訂的, 就不知道有哪些了,
    // 所以新增一個物件來管理 document 的事件
    var docEvent = (function () {
        var $doc = $(document);
        function DocEvent() { };
        var fn = DocEvent.prototype;

        fn.when_vh_init = function (fn) {
            /// <summary> view history init </summary>
            /// <param type="fn(e,p1)" name="fn" parameterArray="false">初始化完成時執行</param>
            $doc.on({
                vh_init: fn
            });
        };
        fn.when_vh_idxchanged = function (fn) {
            /// <summary> view history idx changed </summary>
            /// <param type="fn(e,p1)" name="fn" parameterArray="false">_idx 改變時執行 </param>
            $doc.on({
                vh_idxchanged: fn
            });
        };
        fn.when_vh_itemschanged = function (fn) {
            /// <summary> view history idx changed </summary>
            /// <param type="fn(e,p1)" name="fn" parameterArray="false"> 內容改變時執行 </param>
            $doc.on({
                vh_itemschanged: fn
            });
        };

        fn.when_go = function (fn) {
            /// <summary> setPageState() 被呼叫時, 將會觸發 go </summary>
            /// <param type="fn(e,p1)" name="fn" parameterArray="false">p1:{chineses,chap,sec}</param>
            $doc.on({
                go: fn
            });
        };

        return new DocEvent();
    })();

    root.docEvent = docEvent
    root.setBook = setBook
})(this)