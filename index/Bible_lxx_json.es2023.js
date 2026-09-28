import { BaseJson } from "./BaseJson.es2023.js";
/**
 * @description 嵌入 SN 的七十士譯本 (lxx) 資料，形如 `Ἐν<WG1722> ἀρχῇ<WG746>`
 * - 由 tools/gen_bible_lxx.mjs 產生 (npm run gen:lxx)，只有顯示此譯本時才載入
 * - SN 是用新約同字形推得的，新約沒有的字 (許多人名地名) 沒有 SN
 */
export class Bible_lxx_json extends BaseJson {
  /** @type {Bible_lxx_json} */
  static get s() { return BaseJson._getInstance(Bible_lxx_json); }
  get path_json() {
    return "./index/bible_lxx.json.gz";
  }
  /** @type {import("./Bible_fhlwh_json.es2023.js").DBible_fhlwh_json} 格式同新約原文 */
  get filecontent() {
    return super._filecontent;
  }
}
