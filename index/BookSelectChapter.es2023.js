import { BookSelectPopUp } from "./BookSelectPopUp.es2023.js";
import { FhlLecture } from "./FhlLecture.es2023.js";
import { FhlInfo } from "./FhlInfo.es2023.js";
import { BookSelect } from "./BookSelect.es2023.js";
import { BibleConstant } from "./BibleConstant.es2023.js";
import { triggerGoEventWhenPageStateAddressChange } from "./triggerGoEventWhenPageStateAddressChange.es2023.js";
import { ViewHistory } from "./ViewHistory.es2023.js";
import { change_sec_of_ps_if_address_exist_in_view_history } from "./ViewHistoryData_es2023.js";
/**
 * - 它的 init 會被多次呼叫。只要是切換選項了，就會被呼叫一次 init。
 * - 它 init 參數 position 是 BookSelectName 事件中，計算出來的 (就是將所有選項，分成 6 大欄，是決定 Left，而 top 就是那個選項的位置 top 值)
 */
export class BookSelectChapter {
    static #s = null
    /** @returns {BookSelectChapter} */
    static get s() { if (this.#s == null) this.#s = new BookSelectChapter(); return this.#s; }

    /** @type {HTMLElement} */
    dom = null
    /** @type {number} book 的 index */
    idx = null
    init(ps, dom, idx, position) {
        // console.error(dom); // <div id="bookSelectChapter">
        
        this.dom = dom;
        this.idx = idx;
        this.dom.css({
            'position': 'fixed',
            'left': position.left,
            'top': position.top,
            'box-shadow': 'inset 0px 0px 5px 1px rgba(0,0,0,0.75)',
        });
        this.render(ps, this.dom, this.idx);
    }
    registerEvents(ps){
        var that = this;

        const doms = $(this.dom).find('li');
        doms.off('click').on('click', function (e) {
            // ps.chineses = BibleConstant.CHINESE_BOOK_ABBREVIATIONS[that.idx];
            // ps.engs = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[that.idx];
            ps.bookIndex = that.idx + 1; // 0-based轉1-based (book已經被注釋用掉了)
            ps.chap = parseInt($(this).attr('chap'));
            ps.sec = 1;

            // 如果是看過的章，則跳到「那節」，而不要「第一節」
            change_sec_of_ps_if_address_exist_in_view_history();

            triggerGoEventWhenPageStateAddressChange(ps);

            BookSelect.s.render();
            FhlLecture.s.render();
            ViewHistory.s.render();
            FhlInfo.s.render(ps);
            BookSelectPopUp.s.dom.hide();
            //bookselectchapter.dom.hide();
            BookSelect.s.dom.css({ 'color': '#FFFFFF' });

            $(that).trigger('chapchanged');
        })
    }
    render(ps, dom, idx) {
        const bookChapters = BibleConstant.COUNT_OF_CHAP
        var numOfChapters = bookChapters[idx];
        var html = "<div><ul>";
        for (var i = 1; i <= numOfChapters; i++) {
            html += "<li>" + i + "</li>";
        }
        html += "</ul></div>";
        dom.html(html);
        for (var i = 0; i < numOfChapters; i++) {
            dom.find('li:eq(' + i + ')').attr('chap', i + 1);
        }
    }
}
