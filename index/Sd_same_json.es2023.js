import { BaseJson } from "./BaseJson.es2023.js";

/**
 * # 同源字資料
 * - sd: 因為 api, sd 是 sn dictionary 的縮寫，所以才這樣命名。
 */

export class Sd_same_json extends BaseJson {
  /** @type {Sd_same_json} */
  static get s() { return BaseJson._getInstance(Sd_same_json); }
  get path_json() {
    return "./index/sd_same.json.gz";
  }
  /**
   * @type {DSdsamejson}
   */
  get filecontent() { return super._filecontent; }

  /** @typedef {Object<string, string[]>} DOneSnDict */
  /**
   * @typedef {Object} DSdsamejson
   * @property {DOneSnDict} hebrew - 希伯來文 SN 同源字 (目前還沒有資料)
   * @property {DOneSnDict} greek - 希臘文 SN 同源字
   */
}
