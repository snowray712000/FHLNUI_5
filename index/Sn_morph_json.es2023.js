import { BaseJson } from './BaseJson.es2023.js';

/**
 * 每節動詞的形態，SN 篩選的「動詞形態」用。由 npm run gen:snmorph 產生，見 docs/z260928e
 *
 * @typedef {Object} DSnMorphJson
 * @property {string} ver bible_parsing.db 的 version.dt
 * @property {Object<string,string>} data ["43.1.12"] = "2983:aai 1325:aai 1096:amn 4100:pap" (book.chap.sec，只有動詞，依原文順序)
 *   新約代碼 = 時態 p i f a x y + 語態 a m p + 語氣 i s o d n p
 *   舊約代碼 = 詞幹 q N p P h H t o + ':' + 形式 wy wq pf impf imv jus coh infa infc ptc ptcp
 */

/** 新約 */
export class Sn_morph_nt_json extends BaseJson {
  /** @type {Sn_morph_nt_json} */
  static get s() { return BaseJson._getInstance(Sn_morph_nt_json); }
  get path_json() { return "./index/sn_morph_nt.json.gz"; }
  /** @type {DSnMorphJson} */
  get filecontent() { return super._filecontent; }
}

/** 舊約 */
export class Sn_morph_ot_json extends BaseJson {
  /** @type {Sn_morph_ot_json} */
  static get s() { return BaseJson._getInstance(Sn_morph_ot_json); }
  get path_json() { return "./index/sn_morph_ot.json.gz"; }
  /** @type {DSnMorphJson} */
  get filecontent() { return super._filecontent; }
}
