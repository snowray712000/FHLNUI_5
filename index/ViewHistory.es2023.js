import { BookSelect } from './BookSelect.es2023.js'
import { FhlInfo } from './FhlInfo.es2023.js'
import { FhlLecture } from './FhlLecture.es2023.js'

import { LeftWindowTool } from './LeftWindowTool.es2023.js' // 還沒作
import { DocumentCustomListenerState } from './DocumentCustomListenerState_es2023.js'
import { BibleConstantHelper } from './BibleConstantHelper.es2023.js'
import { assert } from './assert_es2023.js'
import { testThenDoAsync } from './testThenDo.es2023.js'
import { TPPageState } from './TPPageState.es2023.js'

/**
 * - 歷史記錄 繪圖 核心在這裡
 * - 點擊 li 的 on click 事件，核心也在這裡。在 init 中的 vh.on
 */
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
            
            // book name 下面要用的
            const booknames = BibleConstantHelper.getBookNameArrayChineseShort()
            datas.map(function (a1) {                
                const sec = a1.sec || 1; // 預設是 1

                // 不再使用 chineses, 使用 book 來查詢 chineses ... 1based 所以要 -1 
                $("<li>").attr('book', a1.book).attr('chap', a1.chap).attr('sec', sec).text(booknames[a1.book-1] + a1.chap + ':' + sec).appendTo(ul);
            })            
        }
        const document_bind = {
            vh_init: function (e, p1) {   
                renderList(p1.datas);
            },
            vh_itemschanged: function (e, p1) {
                renderList(p1.datas);
            }
        };
        $(document).on(document_bind);
        DocumentCustomListenerState.s.vh_init.push(document_bind.vh_init);



        $vh.on({
            click: function (e) {

                // 傳出第幾個被點 ( 考慮 可5 可8 可5 ... 到底哪個可5被點 ) 0-based
                var ul = $vh.find('ul').first();
                var lis = ul.children();
                for (var i = 0; i < lis.length; i++) {
                    if (lis[i] == this)
                        break;
                }

                const book = parseInt($(this).attr('book'));
                const chap = parseInt($(this).attr('chap'));
                const sec = parseInt($(this).attr('sec') || "1")

                $(this).trigger('liclick', {
                    idx: i,
                    book: book,
                    chap: chap,
                    sec: sec,
                })

                let ps = TPPageState.s
                ps.bookIndex = book;
                ps.chap = parseInt($(this).attr('chap'));
                ps.sec = sec;
                //setPageState(ps); // 不要 trigger 出 'go'
                
                BookSelect.s.render();
                FhlInfo.s.render(ps);
                FhlLecture.s.render();
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
            const leftWindowTool = LeftWindowTool.s
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
    render(ps = null, dom = null){
        $("#viewHistory p").text(LeftWindowTool.s.getTitleOpenedSetting())
    }

    when_liclick(fn){
        /// <summary> ul 清單中的 li 被 click 的時候</summary>
        /// <param type="fn(e,p1)" name="fn" parameterArray="false">{idx},回傳的是ul指在清單中的idx,</param>
        testThenDoAsync({
            cbTest: () => this.dom != null
        }).then(()=>{
            $(this.dom).on({
                liclick: fn
            }, 'li');
        })
    }
    when_clearall(fn){
        /// <summary> 清除所有 被按下去的時候 </summary>
        /// <param type="fn(e)" name="fn" parameterArray="false"></param>
        testThenDoAsync({
            cbTest: () => this.dom != null
        }).then(()=>{
            $(this.dom).on({
                clearall: fn
            }, '.clearHistory');
        })
    }
}
