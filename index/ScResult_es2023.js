import { updateInstanceFromDict } from "./updateInstanceFromDict_es2023.js";
import { assert } from "./assert_es2023.js";
import { BibleConstant } from "./BibleConstant.es2023.js";

/**
 * ### 配合 sc_api function 產生
 */
export class ScResult {
    /**
     * @param {Object.<string, any>} dict 
     * @returns 
     */
    constructor(dict) {
        /** @type {"success"|"failure"} */
        this.status = "success";
        /** @type {number} */
        this.record_count = 0;
        /** @type {ScAddress?} */
        this.prev = null;
        /** @type {ScAddress?} */
        this.next = null;
        /** @type {ScRecord[]} */
        this.record = [];

        if (dict != null) {
            updateInstanceFromDict(dict, () => this);
        }
    }
}

export class ScAddress {
    /**
     * @param {Object.<string, any>} dict 
     * @returns 
     */
    constructor(dict) {
        /** @type {string} 1 2 3 ... 真的是 string，這是資料代號，不是 書卷名稱 */
        this.book = "";
        /** @type {TPENGLISH_BOOK_ABBREVIATIONS} */
        this.engs = "";
        /** @type {number} 是有可能 0 章 0 節的，背景注解*/
        this.chap = -1;
        /** @type {number} */
        this.sec = -1;

        if (dict != null) {
            updateInstanceFromDict(dict, () => this);
        }
    }

    book66() {
        const idx = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS.indexOf(this.engs);
        assert(() => idx !== -1, "ScAddress.book66: engs should be a valid book abbreviation");
        return idx + 1; // 1-based
    }
    /**
     * @returns {"comment"|"preach"|"tsk"|"ob"|"audio"|"map"|"snBranch"|"parsing"|"other"}
     */
    bookInfo() {
        if (this.book == 3) {
            return "comment"
        }
    }
}
export class ScRecord {
    constructor(data) {
        this.title = data.title;
        this.book_name = data.book_name;
        this.com_text = data.com_text;
    }
}