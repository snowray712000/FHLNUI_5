import { BaseJson } from "./BaseJson.es2023.js";
/**
 * @description 嵌入 SN 的原文資料
 * @property {string} fhlwh_sn - 聖經資料
 */
export class Bible_fhlwh_json extends BaseJson {
  /** @type {Bible_fhlwh_json} */
  static get s() { return BaseJson._getInstance(Bible_fhlwh_json); }
  get path_json() {
    return "./index/bible_fhlwh.json.gz"; // 聖經資料
  }
  /** @type {DBible_fhlwh_json} */
  get filecontent() {
    return super._filecontent; // 原始資料
  }
  /** @typedef {number,number,number,string} DOneRow book,chap,sec,內容*/
  /** 
   * @typedef {Object<string, string>} DBible_fhlwh_json 
   * @property {string[]} col 描述欄位，應該就是 ["book","chap","sec","content"]，不太會用到這個值
   * @property {DOneRow[]} data 聖經資料，這個是最重要的欄位，裡面有 SN 的資料。
  */
}
