import { BookSelect } from './BookSelect.es2023.js'
import { FhlInfo } from './FhlInfo.es2023.js'
import { FhlLecture } from './FhlLecture.es2023.js'

// import { } from './LeftWindowTool.es2023.js' // 還沒作
export class ViewHistory {
    static #s = null
    /** @returns {ViewHistory} */
    static get s() { if (this.#s == null) this.#s = new ViewHistory(); return this.#s }

    dom = null
    init(ps, dom){
        this.dom = dom;
        this.render(ps, this.dom);
        this.registerEvents(ps);
        var viewHistoryTop = $('#fhlLeftWindow').height() - 38 - 12;
        $('#viewHistory').css({ top: viewHistoryTop });


        var $vh = $('#viewHistory');
        /**
         * @param {{chineses: string,book: number, chap: number}[]} datas 
         */
        function renderList(datas) {
            /// <summary> 用於畫 li 清單, ul先被清空, 再一一加入 </summary>
            /// <param type="[{.chineses, .chap},{},{}]" name="datas" parameterArray="true">清單</param>
            var ul = $vh.find('ul').first();
            ul.empty();
            Enumerable.from(datas).forEach(function (a1) {
                $("<li>").attr('chineses', a1.chineses).attr('book', a1.book).attr('chap', a1.chap).text(a1.chineses + ':' + a1.chap).appendTo(ul);
            })
        }
        $(document).on({
            vh_init: function (e, p1) {
                renderList(p1.datas);
            },
            vh_itemschanged: function (e, p1) {
                renderList(p1.datas);
            }
        });

        $vh.on({
            click: function (e) {

                // 傳出第幾個被點 ( 考慮 可5 可8 可5 ... 到底哪個可5被點 ) 0-based
                var ul = $vh.find('ul').first();
                var lis = ul.children();
                for (var i = 0; i < lis.length; i++) {
                    if (lis[i] == this)
                        break;
                }

                $(this).trigger('liclick', {
                    idx: i,
                    chineses: $(this).attr('chineses'),
                    book: parseInt($(this).attr('book')),
                    chap: parseInt($(this).attr('chap'))
                });

                // 下面是原本的code 還沒完全被取代掉
                setBook(ps, $(this).attr('chineses'));
                ps.chap = parseInt($(this).attr('chap'));
                ps.sec = 1;
                //setPageState(ps); // 不要 trigger 出 'go'

                const bookSelect = BookSelect.s
                const fhlInfo = FhlInfo.s
                const fhlLecture = FhlLecture.s

                bookSelect.render(ps, bookSelect.dom);
                fhlInfo.render(ps, fhlInfo.dom);
                fhlLecture.render(ps, fhlLecture.dom);
                // that.render(ps, that.dom); // 已經處理了. vh_itemchanged 會處理
            }
        }, 'li').on({
            click: function (e) {
                $(this).trigger('clearall');
            }
        }, '.clearHistory');
    }
    registerEvents(ps){
        var that = this;
        $('#viewHistory p').on('click', function () {
            if (leftWindowTool.isOpenedHistory(this)) {
                leftWindowTool.openSettings() // open setting 就是 close history
            } else {
                leftWindowTool.closeSettings()
            }
        });
        $('#viewHistoryScrollDiv').on('scroll', function () {
            $(this).addClass('scrolling');
            clearTimeout($.data(this, "scrollCheck"));
            $.data(this, "scrollCheck", setTimeout(function () {
                $('#viewHistoryScrollDiv').removeClass('scrolling');
            }, 350));
        })
    }
    render(ps, dom){
        $("#viewHistory p").text(leftWindowTool.getTitleOpenedSetting())
    }

    when_liclick(fn){
        /// <summary> ul 清單中的 li 被 click 的時候</summary>
        /// <param type="fn(e,p1)" name="fn" parameterArray="false">{idx},回傳的是ul指在清單中的idx,</param>
        $(this.dom).on({
            liclick: fn
        }, 'li');
    }
    when_clearall(fn){
        /// <summary> 清除所有 被按下去的時候 </summary>
        /// <param type="fn(e)" name="fn" parameterArray="false"></param>
        $(this.dom).on({
            clearall: fn
        }, '.clearHistory');
    }
}

// var viewHistory = (function () {
//     function ViewHistory() { };
//     var fn = ViewHistory.prototype;

//     fn.when_liclick = function (fn) {
//         /// <summary> ul 清單中的 li 被 click 的時候</summary>
//         /// <param type="fn(e,p1)" name="fn" parameterArray="false">{idx},回傳的是ul指在清單中的idx,</param>
//         $(viewHistory.dom).on({
//             liclick: fn
//         }, 'li');
//     };
//     fn.when_clearall = function (fn) {
//         /// <summary> 清除所有 被按下去的時候 </summary>
//         /// <param type="fn(e)" name="fn" parameterArray="false"></param>
//         $(viewHistory.dom).on({
//             clearall: fn
//         }, '.clearHistory');
//     };
//     fn.init = function (ps, dom) {
//         this.dom = dom;
//         this.render(ps, this.dom);
//         this.registerEvents(ps);
//         var viewHistoryTop = $('#fhlLeftWindow').height() - 38 - 12;
//         $('#viewHistory').css({ top: viewHistoryTop });


//         var $vh = $('#viewHistory');
//         /**
//          * @param {{chineses: string,book: number, chap: number}[]} datas 
//          */
//         function renderList(datas) {
//             /// <summary> 用於畫 li 清單, ul先被清空, 再一一加入 </summary>
//             /// <param type="[{.chineses, .chap},{},{}]" name="datas" parameterArray="true">清單</param>
//             var ul = $vh.find('ul').first();
//             ul.empty();
//             Enumerable.from(datas).forEach(function (a1) {
//                 $("<li>").attr('chineses', a1.chineses).attr('book', a1.book).attr('chap', a1.chap).text(a1.chineses + ':' + a1.chap).appendTo(ul);
//             })
//         }
//         $(document).on({
//             vh_init: function (e, p1) {
//                 renderList(p1.datas);
//             },
//             vh_itemschanged: function (e, p1) {
//                 renderList(p1.datas);
//             }
//         });

//         $vh.on({
//             click: function (e) {

//                 // 傳出第幾個被點 ( 考慮 可5 可8 可5 ... 到底哪個可5被點 ) 0-based
//                 var ul = $vh.find('ul').first();
//                 var lis = ul.children();
//                 for (var i = 0; i < lis.length; i++) {
//                     if (lis[i] == this)
//                         break;
//                 }

//                 $(this).trigger('liclick', {
//                     idx: i,
//                     chineses: $(this).attr('chineses'),
//                     book: parseInt($(this).attr('book')),
//                     chap: parseInt($(this).attr('chap'))
//                 });

//                 // 下面是原本的code 還沒完全被取代掉
//                 setBook(ps, $(this).attr('chineses'));
//                 ps.chap = parseInt($(this).attr('chap'));
//                 ps.sec = 1;
//                 //setPageState(ps); // 不要 trigger 出 'go'
//                 bookSelect.render(ps, bookSelect.dom);
//                 fhlInfo.render(ps, fhlInfo.dom);
//                 fhlLecture.render(ps, fhlLecture.dom);
//                 // that.render(ps, that.dom); // 已經處理了. vh_itemchanged 會處理
//             }
//         }, 'li').on({
//             click: function (e) {
//                 $(this).trigger('clearall');
//             }
//         }, '.clearHistory');
//     }
//     fn.registerEvents = function (ps) {
//         var that = this;
//         $('#viewHistory p').on('click', function () {
//             if (leftWindowTool.isOpenedHistory(this)) {
//                 leftWindowTool.openSettings() // open setting 就是 close history
//             } else {
//                 leftWindowTool.closeSettings()
//             }
//         });

//         $('#viewHistoryScrollDiv').scroll(function () {
//             $(this).addClass('scrolling');
//             clearTimeout($.data(this, "scrollCheck"));
//             $.data(this, "scrollCheck", setTimeout(function () {
//                 $('#viewHistoryScrollDiv').removeClass('scrolling');
//             }, 350));
//         });
//     }
//     fn.render = function (ps, dom) {
//         $("#viewHistory p").text(leftWindowTool.getTitleOpenedSetting())
//     }
//     return new ViewHistory();
// })();


// (function(root){
//     root.viewHistory = viewHistory
// })(this)