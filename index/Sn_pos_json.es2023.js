import { BaseJson } from './BaseJson.es2023.js';

/**
 * SN → 詞性 (字典形層級)，SN 篩選的預設組合用。由 npm run gen:snpos 產生，見 docs/z260928e
 */
export class Sn_pos_json extends BaseJson {
  /** @type {Sn_pos_json} */
  static get s() { return BaseJson._getInstance(Sn_pos_json); }
  get path_json() { return "./index/sn_pos.json.gz"; }
  /** @type {DSnPosJson} */
  get filecontent() { return super._filecontent; }

  /**
   * @typedef {Object} DSnPosJson
   * @property {string} ver bible_parsing.db 的 version.dt
   * @property {{G: Object<string,string>, H: Object<string,string>}} pos
   *   ["1063"] = "c"；多個詞性以 | 分隔，依次數排序，例 "3588": "art"、"3756": "d|neg"
   *   代碼：n 名詞 pn 專有名詞 v 動詞 a 形容詞 num 數詞 d 副詞 neg 否定詞 c 連接詞 p 介系詞
   *   art 冠詞 pron 代名詞 rel 關係代名詞 t 質詞 i 感嘆詞 obj 受詞記號
   */
}
