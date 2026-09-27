import { BaseJson } from "./BaseJson.es2023.js";
/**
 * @description 嵌入 SN 的舊約原文 (bhs) 資料，形如 `בְּרֵאשִׁית<WH7225> בָּרָא<WH1254>`
 * - 由 tools/gen_bible_orig.mjs 產生 (npm run gen:orig)，只有顯示此譯本時才載入
 * - 行序已是正確的 (qsb.php 的 bhs 多行時行序顛倒，以前要 reverse)
 */
export class Bible_bhs_json extends BaseJson {
  /** @type {Bible_bhs_json} */
  static get s() { return BaseJson._getInstance(Bible_bhs_json); }
  get path_json() {
    return "./index/bible_bhs.json.gz";
  }
  /** @type {import("./Bible_fhlwh_json.es2023.js").DBible_fhlwh_json} 格式同新約原文 */
  get filecontent() {
    return super._filecontent;
  }
}
