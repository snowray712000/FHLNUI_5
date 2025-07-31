import { assert } from "./assert_es2023.js";
import { Parsing_normalize_address } from "./Parsing_normalize_Address_es2023.js";
import { parsing_bind_word_and_wid_and_wu_es2023 } from "./parsing_bind_word_and_wid_and_wu_es2023.js";
export class ParsingCache {
    static #s = null
    /** @returns {ParsingCache} */
    static get s() { if (!this.#s) this.#s = new ParsingCache(); return this.#s }

    // - 情境: 原本 parsing 會使用 qp.php ， 但 ai 工具也會用到資料，若再作一次流程，浪費流量，並且沒有合適的重構。
    // - 不是只有 record, 而是整個回傳值, {prev, next, record}
    // - 不是 api 最原始的，而是將 address 正規成 book chap sec 後的
    // - 不是 api 最原始的，若是舊約，會將 \r 拿掉，並且將 word 換行交換，使其與 exp 一致。
    _joResult = null
    // - 衍生屬性，對 render top 很有幫助，也對 ai 產生「具有 字序 的原文」有幫助。
    /** @type {{w:string, wid?: number, wu?: 'w'|'u'}[]} */
    _jaWord = null


    update_cache_and_normalize(jsonObj){        
        this._joResult = jsonObj

        Parsing_normalize_address(this._joResult)

        if (this.get_HG == 'H'){
            this._prepareWordForOldTestament()
        }
        this._joResult.record[0].exp = this._joResult.record[0].exp.replaceAll(/\r/g, "")

        this._jaWord = parsing_bind_word_and_wid_and_wu_es2023(this._joResult.record[0].word)
        
    }
    _prepareWordForOldTestament(){
        assert( this.get_HG == 'H', "這個函式只適用於舊約" )

        let word = this._joResult.record[0].word
        
        word = word.replaceAll(/\r/g, "");
        word = word.split(/\n/g).reverse().join("\n")
        
        this._joResult.record[0].word = word
    }
    /**
     * @returns {'H'|'G'}
     */
    get get_HG() { return this._joResult.N == 1 ? 'H' : 'G' }
    /**
     * ### 產生 原文分析 table 時，w 與 u 會用不同的顏色 
     * - 可配合 re.includes(wid) 來判斷
     * - greek_Westcott_Hort 是韋式，greek_USB4 是聯式
     * @param {"w"|"u"} tp_wu w 表示 韋式，u 表示聯式
     * @returns {number[]}
     */
    get_wu_wids(tp_wu) { return this._jaWord.filter( a1 => a1.wid != null && a1.wu == tp_wu).map( a1 => a1.wid)}
    /**
     * ### 產生 原文分析 table 時，要 continue 不產生的 wid
     * @returns {number[]}
     */
    get_plus_wids() { return this._jaWord.filter( r => r.w  == '+' ).map( r => r.wid ) }
}