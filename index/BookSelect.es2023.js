/// <reference path='../libs/jsdoc/jquery.js' />
/// <reference path='../libs/jsdoc/linq.d.ts' />
/// <reference path='../libs/ijnjs/ijnjs.d.ts' />
/// <reference path='bookSelect.d.js' />
/// <reference path='DPageState.d.js' />

import { getBookFunc } from './getBookFunc.es2023.js'
import { BookSelectPopUp } from './BookSelectPopUp.es2023.js';
import { FhlLecture } from './FhlLecture.es2023.js';
import { FhlInfo } from './FhlInfo.es2023.js';
import { triggerGoEventWhenPageStateAddressChange } from './triggerGoEventWhenPageStateAddressChange.es2023.js';
import { TPPageState } from './TPPageState.es2023.js';
import { ViewHistory } from './ViewHistory.es2023.js';
import { BibleConstant } from './BibleConstant.es2023.js';
import { change_sec_of_ps_if_address_exist_in_view_history } from './ViewHistoryData_es2023.js';
import { assert } from './assert_es2023.js';
import { BibleConstantHelper } from './BibleConstantHelper.es2023.js';
export class BookSelect {
    static #s = null
    /** @returns {BookSelect} */
    static get s() { if (this.#s == null) this.#s = new BookSelect(); return this.#s; }

    dom = null
    init(ps, dom) {
        const bookSelectPopUp = BookSelectPopUp.s

        this.dom = dom
        this.render(ps, this.dom)
        bookSelectPopUp.init(ps, $('#bookSelectPopUp'))
        bookSelectPopUp.registerEvents(ps)
    }
    /**
     * @param {TPPageState} ps 
     */
    registerEvents(ps = null) {
        if (ps == null) ps = TPPageState.s

        var that = this;
        $('#bookSelect').off().on('click', function(e) { 
            // 加上unbind() 讓創世記第二節之後的dropdown不會自動消失
            var cx = $(window).width()
            if (cx < 1280) { // 那個視窗大概需1100，取個 1280 吧
                /**
                 * @type {Ijnjs.BookChapDialog}
                 */
                var dlg = Ijnjs.BookChapDialog.s // 不想打字那麼長而已，非必要        
                dlg.setCBHided(() => {
                    let ps = TPPageState.s

                    var re = dlg.getResult()
                    ps.bookIndex = re.book
                    ps.chap = re.chap
                    ps.sec = 1

                    // 當使用者切換章節時，若是看過的章，則跳到「那節」，而不要「第一節」
                    change_sec_of_ps_if_address_exist_in_view_history()

                    triggerGoEventWhenPageStateAddressChange(ps);
                    BookSelect.s.render();
                    FhlLecture.s.render();
                    ViewHistory.s.render();
                    FhlInfo.s.render(ps);
                    BookSelectPopUp.s.dom.hide();
                    //bookselectchapter.dom.hide();
                    BookSelect.s.dom.css({
                        'color': '#FFFFFF'
                    });

                    $(that).trigger('chapchanged');
                })
                
                Ijnjs.BookChapDialog.s.show({ book: ps.bookIndex, chap: ps.chap, isGb: ps.gb == 1 })
            } else {
                if (BookSelectPopUp.s.dom.is(":visible")) {
                    BookSelectPopUp.s.dom.fadeOut('0.2');
                    setTimeout(function() {
                        BookSelect.s.dom.css({ 'color': '#D0D0D0' });
                    }, 200);
                } else {
                    BookSelectPopUp.s.dom.fadeIn('0.2');
                    BookSelect.s.dom.css({ 'color': '#00A0FF' });
                }
            }

            e.stopPropagation();
        });
        $('#bookSelectPopUp').click(function() {
            BookSelectPopUp.s.dom.fadeOut('0.2');
            setTimeout(function() { BookSelect.s.dom.css({ 'color': '#D0D0D0' }); }, 200);
        });
        $(document).click(function() {
            BookSelectPopUp.s.dom.fadeOut('0.2');
            setTimeout(function() { BookSelect.s.dom.css({ 'color': '#D0D0D0' }); }, 200);
        });
        $('#bookSelectName').click(function(e) {
            e.stopPropagation();
        });
        $('#bookSelect').mouseenter(function() {
            if (!BookSelectPopUp.s.dom.is(":visible")) {
                BookSelect.s.dom.css({ 'color': '#00A0FF' });
            }
        });
        $('#bookSelect').mouseleave(function() {
            if (!BookSelectPopUp.s.dom.is(":visible")) {
                BookSelect.s.dom.css({ 'color': '#D0D0D0' });
            }
        });
    }
    render (ps = null , dom = null) {
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = this.dom

        assert( ps.bookIndex != null, "ps.bookIndex should not be null" );

        const bookName = BibleConstantHelper.getBookNameArrayChineseFull()[ps.bookIndex - 1] // ps.bookIndex 是從 1 開始的

        let html = "";
        if ( ps.bookIndex == 19 ) {
            html = bookName + "： 第" + BibleConstant.CHINESE_NUMBERS[ps.chap] + "篇";
        } else {
            html = bookName + "： 第" + BibleConstant.CHINESE_NUMBERS[ps.chap] + "章";
        }

        html += '&nbsp;&#9660;';
        dom.html(html);
        this.registerEvents(ps);
    }
} 
