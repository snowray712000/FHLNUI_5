import { makeSure_ps_history_not_empty } from './addViewHistoryEvents_es2023.js';
import { testThenDoAsync } from './testThenDo.es2023.js';
import { TPPageState } from './TPPageState.es2023.js';

export class ViewHistoryData {
    static #s = null;
    /** @returns {ViewHistoryData} */
    static get s() { if (this.#s == null) { this.#s = new ViewHistoryData(); } return this.#s; }

    constructor() {
        /** @type {Array<{book:number;chap:number}>} */
        this.datas = [];
        this.idx = -1;
    }
    get current_address() { return this.datas[this.idx] || null; }
    /**
     * ### 初始化資料，從 pagestate 中取得
     * - 直覺，是從 document ready 時會觸發，但其實不一定。
     * - 第一次觸發 go 時，若是 -1 時才會觸發。
     * @returns
     */
    main_initial_async() {
        return testThenDoAsync({
            cbTest: () => TPPageState.s != null && TPPageState.s.history != null
        }).then(() => {
            makeSure_ps_history_not_empty();
            this.datas = TPPageState.s.history;
            this.idx = 0;
        });
    }
    /**
     * ### 當有新的 address 要加入到 記錄中時，處理資料
     * - 可能是 按下 next chap prev chap
     * - 可能是 選擇章節 對話方塊觸發
     * - 可能是 selected 節 變更觸發
     * - 總之，只要觸發 go 事件，就會被加入
     * @param {{book: number, chap: number, sec: number}} address
     */
    main_new_address(address) {
        const book = address.book || 1;
        const chap = address.chap || 1;
        const sec = address.sec || 1;

        // 清除所有同樣 book chap 的
        let datas2 = this.datas.filter(a1 => !(a1.book == book && a1.chap == chap));

        // 將 address 加入到 [0] 位置
        datas2.unshift({
            book: book,
            chap: chap,
            sec: sec
        });

        // 留保 24 個
        if (datas2.length > 24) {
            datas2 = datas2.slice(0, 24);
        }

        // 設定為第 0 個
        this.datas = datas2;
        this.idx = 0;
    }
    /**
     * ### 傳入的章節，有沒有在歷史記錄中，若有，則回傳那個章節 address，若沒有，則回傳 null
     * - 情境: 按下「下一章」或「上一章」按鈕時，若上一章在歷史記錄中，則不要從第1節開始，這樣會很不好用。
     * @param {{book: number, chap: number}} address
     */
    main_get_exist_book_chap(address) {
        // 找到第一個符合的 book chap
        const idx = this.datas.findIndex(a1 => a1.book == address.book && a1.chap == address.chap);
        if (idx >= 0) {
            // 找到的話，回傳那個 address
            return {
                book: this.datas[idx].book,
                chap: this.datas[idx].chap,
                sec: this.datas[idx].sec || 1 // 預設是 1
            };
        } else {
            // 沒有找到的話，回傳 null
            return null;
        }
    }
}

/**
 * ### 當使用者切換章節時，若是看過的章，則跳到「那節」，而不要「第一節」
 * - 從 ps 的 bookIndex, chap 來判定 sec 要不要被改變
 */
export function change_sec_of_ps_if_address_exist_in_view_history(){
    let ps = TPPageState.s;
    // 如果是看過的章，則跳到「那節」，而不要「第一節」
    const addressInViewHistory = ViewHistoryData.s.main_get_exist_book_chap({ book: ps.bookIndex, chap: ps.chap });
    if (addressInViewHistory != null) {
        ps.sec = addressInViewHistory.sec;
    }
}