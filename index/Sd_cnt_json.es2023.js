import { BaseJson } from "./BaseJson.es2023.js";

/**
 * # 某個 SN 在聖經中出現的次數
 */
export class Sd_cnt_json extends BaseJson {
  /** @type {Sd_cnt_json} */
  static get s() { return BaseJson._getInstance(Sd_cnt_json); }
  get path_json() {
    return "./index/sd_cnt.json.gz";
  }
  /** @type {DSdCntJson} */
  get filecontent() { return super._filecontent; }

  /** @typedef {Object<string, number>} DOneSnDict */
  /**
   * @typedef {Object} DSdCntJson
   * @property {DOneSnDict} hebrew - 希伯來文 SN 出現次數 (目前還沒有資料)
   * @property {DOneSnDict} greek - 希臘文 SN 出現次數
   */
}
