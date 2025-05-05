import { BaseJson } from './BaseJson.es2023.js';

export class Sn_cnt_chap_unv_json extends BaseJson {
  /** @type {Sn_cnt_chap_unv_json} */
  static get s() { return BaseJson._getInstance(Sn_cnt_chap_unv_json); }
  get path_json() { return "./index/sn_cnt_chap_unv_min.json.gz"; }
  /** @type {DSnCntBookChapUnvJson} */
  get filecontent() { return super._filecontent; }

  /** @typedef {Object<string, Object<number,Object<number,number>>>} DOneSnDict ["1234"][12][1] 表示，這個 SN 在 book 12，chap 1 出現的次數，book 是 1based 的。*/
  /**
   * @typedef {Object} DSnCntBookChapUnvJson
   * @property {DOneSnDict} H - 希伯來文 SN。
   * @property {DOneSnDict} G - 希臘文 SN 在每卷書中出現的次數
   */
}
