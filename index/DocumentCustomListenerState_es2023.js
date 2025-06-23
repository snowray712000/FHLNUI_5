/**
 * - 發生，還沒 on vh_init，就被 trigger，所以加上這個，再配合 testThenDoAsync 可以防止問題發生。
 */
export class DocumentCustomListenerState {
    static #s = null;
    /** @returns {DocumentCustomListenerState} */
    static get s() { if (this.#s == null) { this.#s = new DocumentCustomListenerState(); } return this.#s; }

    constructor() {
        /** @type {Array<Function>} */
        this.vh_init = []
    }

}