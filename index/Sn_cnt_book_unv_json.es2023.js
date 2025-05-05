import { BaseJson } from './BaseJson.es2023.js';
/**
 * # SN 在每卷書中出現的次數
 * 之所以，要叫 _unv，是因為 SN 出現次數，從 unv 譯本，從 kjv 譯本 分析的數量都不同
 */

export class Sn_cnt_book_unv_json extends BaseJson {
  /** @type {Sn_cnt_book_unv_json} */
  static get s() { return BaseJson._getInstance(Sn_cnt_book_unv_json) }
  get path_json () { return "./index/sn_cnt_book_unv_min.json.gz" }
  /** @type {DSnCntBookUnvJson} */
  get filecontent () { return super._filecontent ?? null }
  
  /** @typedef {Object<string, Object<string,number>} DOneSnDict ["1234"][12] 表示，這個 SN 在 book 12 出現的次數，book 是 1based 的。*/
  /**
   * @typedef {Object} DSnCntBookUnvJson
   * @property {DOneSnDict} H - 希伯來文 SN。
   * @property {DOneSnDict} G - 希臘文 SN 在每卷書中出現的次數
   */
}
