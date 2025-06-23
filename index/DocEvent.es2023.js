import { BibleConstant } from "./BibleConstant.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";


/**
 * @typedef {function(Event, {chineses,chap,sec}): void} FnDocEvent
 */

/**
 * 因為 document 的事件愈來愈多自訂的, 就不知道有哪些了,
 * 所以新增一個物件來管理 document 的事件
 */
export class DocEvent {
    static #s = null;
    /** @returns {DocEvent} */
    static get s() { if (this.#s == null) { this.#s = new DocEvent(); } return this.#s; }

    /**
     * view history init
     * @param {FnDocEvent} fn 初始化完成時執行 
     */
    when_vh_init(fn){
        $(document).on({
            vh_init: fn
        });
    }
    /**
     * view history idx changed
     * @param {FnDocEvent} fn idx 改變時執行
     */
    when_vh_idxchanged(fn) {
        $(document).on({
            vh_idxchanged: fn
        });
    }
    /**
     * view history items changed
     * @param {FnDocEvent} fn 內容改變時執行
     */
    when_vh_itemschanged(fn) {
        $(document).on({
            vh_itemschanged: fn
        });
    }
    /**
     * setPageState() 被呼叫時, 將會觸發 go
     * @param {FnDocEvent} fn p1:{chineses,chap,sec}
     */
    when_go(fn) {
        $(document).on({
            go: fn
        });
    }
}
