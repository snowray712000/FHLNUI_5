export class Hash_Changed {
    static #s = null
    /** @returns {Hash_Changed} */
    static get s() { if (this.#s == null) this.#s = new Hash_Changed(); return this.#s }

    _is_setting_by_code = false
    /**
     * 在 index.js 裡面，監聽 hashchange 事件中，要用到的。
     * @returns {boolean}
     */
    is_setting_by_code(){ return this._is_setting_by_code }
    /**
     * 通常也是在 index.js 裡面用到
     */
    reset_is_setting_by_code(){ this._is_setting_by_code = false }
    /**
     * 在某處，要變更 location.hash 時，使用這個，才不會觸發 hashchange 事件。
     * @param {string} newhash 
     */
    set_hash_by_code(newhash){
        this._is_setting_by_code = true
        location.hash = newhash
    }
}

