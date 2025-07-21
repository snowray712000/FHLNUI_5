/**
 * ### 漸漸取代 sephp 的功能，轉為 es2023 語言
 */
export class SearchFlow {
    static #s = null
    /** @returns {SearchFlow} */
    static get s() { if (this.#s == null) this.#s = new SearchFlow(); return this.#s; }

    
}