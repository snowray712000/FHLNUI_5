import { BookSelectName } from "./BookSelectName.es2023.js"

export class BookSelectPopUp {
    static #s = null
    /** @returns {BookSelectPopUp} */
    static get s() { if (this.#s == null) this.#s = new BookSelectPopUp(); return this.#s; }

    dom = null
    init(ps, dom) {
        const bookSelectName = BookSelectName.s

        this.dom = dom
        bookSelectName.init(ps, $('#bookSelectName'))
        bookSelectName.registerEvents(ps)
        this.dom.hide()
    }
    registerEvents(ps) {
        var that = this;
        this.dom.click(function (e) { // 加上unbind() 讓創世記第二節之後的dropdown不會自動消失
            e.stopPropagation();
        });
    }
}

// (function (root) {
//     root.bookSelectPopUp = {
//         init: function (ps, dom) {
//             this.dom = dom;
//             bookSelectName.init(ps, $('#bookSelectName'));
//             bookSelectName.registerEvents(ps);
//             this.dom.hide();
//         },
//         registerEvents: function (ps) {
//             var that = this;
//             this.dom.click(function (e) {
//                 e.stopPropagation();
//             });
//         }
//     };
// })(this)