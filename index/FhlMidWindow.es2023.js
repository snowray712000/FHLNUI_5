import { FhlMidBottomWindow } from "./FhlMidBottomWindow.es2023.js";
import { FhlLecture } from "./FhlLecture.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";

export class FhlMidWindow {
    static #s = null
    /** @returns {FhlMidWindow} */
    static get s() { if (!this.#s) this.#s = new FhlMidWindow(); return this.#s; }

    init(ps, dom) {
        if (ps == null) ps = TPPageState.s

        this.dom = dom;
        FhlLecture.s.init(ps, $('#fhlLecture'));
        FhlMidBottomWindow.s.init(ps, $('#fhlMidBottomWindow'));
        this.render(ps, dom);
    }

    render(ps = null, dom = null) {
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = this.dom

        var width = $(window).width() - $("#fhlLeftWindow").width() - $("#fhlInfo").width() - 12 * 4;
        $("#fhlMidWindow").css({
            'width': width + 'px'
        });
    }
}

// (function(root){
//     root.fhlMidWindow = {
//         init: function (ps, dom) {
//             this.dom = dom;
//             fhlLecture.init(pageState, $('#fhlLecture'));
//             fhlMidBottomWindow.init(pageState, $('#fhlMidBottomWindow'));
//             this.render(ps, dom);
//         },
//         render: function (ps, dom) {
//             var width = $(window).width() - $("#fhlLeftWindow").width() - $("#fhlInfo").width() - 12 * 4;
//             $("#fhlMidWindow").css({
//                 'width': width + 'px'
//             });
//         }
//     }
// })(this)