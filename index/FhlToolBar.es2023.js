import { Help } from './Help.es2023.js';
import { WindowControl } from './WindowControl.es2023.js';
import { BookSelect } from './BookSelect.es2023.js';
import { SearchTool } from './SearchTool.es2023.js';
import { TPPageState } from './TPPageState.es2023.js';
export class FhlToolBar {
    static #s = null
    /** @returns {FhlToolBar} */
    static get s() { if (!this.#s) this.#s = new FhlToolBar(); return this.#s; }

    init(ps = null){
        if (ps == null) ps = TPPageState.s
        
        Help.s.init(ps, $('#help'));
        WindowControl.s.init(ps, $('#windowControl'));
        // windowControl.registerEvents(ps); // mark by snow. 2021.07 init 裡就有呼叫了
        BookSelect.s.init(ps, $('#bookSelect'));
        SearchTool.s.init(ps, $('#searchTool'));
        SearchTool.s.registerEvents(ps);
    }
}

// (function (root) {
//     var fhlToolBar = {
//         init: function (ps) {
//             //this.registerEvents();
//             help.init(ps, $('#help'));
//             windowControl.init(ps, $('#windowControl'));
//             // windowControl.registerEvents(ps); // mark by snow. 2021.07 init 裡就有呼叫了                        
//             bookSelect.init(ps, $('#bookSelect'));
//             searchTool.init(ps, $('#searchTool'));
//             searchTool.registerEvents(ps);
//         }
//     };
    
//     root.fhlToolBar = fhlToolBar
// })(this)