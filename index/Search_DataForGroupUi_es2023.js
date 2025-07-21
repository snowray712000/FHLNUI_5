

/**
 * @typedef {Object} OneSeRecord
 * @property {number} chap
 * @property {number} sec
 * @property {number} ibook 3
 * @property {string} engs Num
 * @property {string} chineses 民
 * @property {string} ver lcc
 * @property {string} bible_text
 * @typedef {Object} OneVerResult
 * @property {string} key
 * @property {OneSeRecord[]} record
 * @property {number} record_count
 */

export class Search_DataForGroupUi {
  static #s = null
  /** @returns {Search_DataForGroupUi} */
  static get s() { if (!this.#s) this.#s = new Search_DataForGroupUi(); return this.#s; }
  
  /**
   * @type {OneSeRecord[]} 所有的紀錄，已經按照 ibook, chap, sec 排序
   */
  _record_ordered = []
  /**
   * @type {Object.<number, number>} 例如 {0: 32, 1: 25} 表示創世記有32筆，出埃及記有25筆
   */
  _cnt_of_book = {}
  /**
   * @type {Object.<string, number[]>} 例如 {"摩西五經": [0, 1, 2, 3, 4], "歷史書": [5, 6, 7, 8]}
   */
  _cnt_of_group = {}
  constructor(jrets) {
    if (jrets != null){
      this.update(jrets)
    }
  }
  /** ### 因為改變為 singleton 模式，所以提供一個 update 函數，取代使用 constructor */
  update(jrets){
    this._record_ordered = this._order(this._merge(jrets));
    this._cnt_of_book = this._calc_cnt_of_book(this._record_ordered);
    this._cnt_of_group = this._calc_cnt_of_book_group(this._cnt_of_book);    
  }
  /**
   * 會使用 this._cnt_of_book 與 fhl.g_book_group 來計算
   * @return {Object.<string, number[]>} 例如 {"摩西五經": [0, 1, 2, 3, 4], "歷史書": [5, 6, 7, 8]}
   */
  calc_cnt_of_group(){ return this._cnt_of_group }  
  /**
   * 合併多個譯本 jrets 的紀錄
   * @param {(OneVerResult | null)[]} jrets 
   * @returns {OneSeRecord[]}
   */
  _merge(jrets) {
    let result = []
    for (let jret of jrets) {
      if (jret != null && jret.record != null) {
        result = result.concat(jret.record);
      }
    }
    return result;
  }
  /**
   * @param {OneSeRecord[]} records 
   * @returns {OneSeRecord[]}
   */
  _order(records) {
    return records.sort((a, b) => {
      if (a.ibook !== b.ibook) {
        return a.ibook - b.ibook;
      }
      if (a.chap !== b.chap) {
        return a.chap - b.chap;
      }
      return a.sec - b.sec;
    });
  }

  _calc_cnt_of_book(records){
    /**
     * @type {Object.<number, number>}
     */
    let cnt_of_book = {}
    for (const record of records) {
      const bookId = record.ibook;
      if (!cnt_of_book[bookId]) {
        cnt_of_book[bookId] = 0;
      }
      cnt_of_book[bookId]++;
    }
    return cnt_of_book;
  }

  _calc_cnt_of_book_group(cnt_of_book) {
    /**
     * @type {Object.<string, number[]>}
     */
    let cnt_of_group = {};

    for (const [groupName, bookIds] of Object.entries(fhl.g_book_group)) {
      let cnt = 0
      for (const ibook of bookIds) {
        if (cnt_of_book[ibook] != null) {
          cnt += cnt_of_book[ibook];
        }
      }

      cnt_of_group[groupName] = cnt;
    }
    return cnt_of_group;
  }
}