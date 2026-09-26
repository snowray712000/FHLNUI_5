import { BaseJson } from "./BaseJson.es2023.js";
/**
 * @description 全舊約希伯來文原文 (bhs) 的信望愛內碼，舊約原文搜尋用 (約 950KB，第一次搜尋希伯來文時才載入)
 * - 產生：npm run gen:bhs (tools/gen_bible_bhs_code.mjs)
 * - 內碼轉 Unicode：hebCode.es2023.js 的 umscode；搜尋：hebSearchRegex
 */
export class Bible_bhs_code_json extends BaseJson {
  /** @type {Bible_bhs_code_json} */
  static get s() { return BaseJson._getInstance(Bible_bhs_code_json); }
  get path_json() {
    return "./index/bible_bhs_code.json.gz";
  }
  /** @type {DBible_bhs_code_json} */
  get filecontent() {
    return super._filecontent;
  }
  /**
   * @typedef {Object} DBible_bhs_code_json
   * @property {string[]} col ["book","chap","sec","code"]
   * @property {[number, number, number, string][]} data book 是 1based
   */
}
