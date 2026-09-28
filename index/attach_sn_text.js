// 將 sn 前面的文字 DText 套上 sn-text 規則（以 DText[] 為輸入）
// 規則對齊 add_sn_text.js，但以 DText 結構操作：
/**
 * @typedef {import('./DText.js').DText} DText
 */
import { assert } from "./assert_es2023.js";
import { splitStringByRegex } from './splitStringByRegex.es2023.js'
/**
 * @param {DText[]} dtexts 
 */
function split_punctuation(dtexts) {
  for (let i = 0; i < dtexts.length; i++) {
    const dt = dtexts[i];
    if (dt.children != null) {
      split_punctuation(dt.children);
      continue;
    }

    if (dt.w != null && dt.tp == null) {
      let r1 = splitStringByRegex(dt.w, /([：「！，。；（）？、』『.:;,])/g);
      if (r1 == null) continue
      if ( r1.length == 1) {
        dt.ispun = 1
        continue
      }

      // 例如有 3 個。就要用這 3 個，取代原本的 i 位置的，這樣 dtexts 會變長，並且 i 也要往後移動(沒必要再作 i, i+1, i+2 ... 下一步從 i+3 開始)
      const inserted_dtexts = r1.map(a1 => {
        /** @type {DText} */
        const dt2 = structuredClone(dt)
        if ( a1.exec == null ){
          dt2.w = a1.w
        } else {
          dt2.w = a1.w
          dt2.ispun = 1
        }
        return dt2
      })
      dtexts.splice(i, 1, ...inserted_dtexts);
      i += inserted_dtexts.length - 1; // 下一輪從下一個新的位置開始
    }
  }
}
/**
 * 
 * @param {number} idx 
 * @param {DText[]} dtexts 
 */
function try_set_sn_text(idx, dtexts){
  const dt = dtexts[idx];
  if ( dt.w == null || dt.ispun == 1 || dt.tp2 != null || dt.sn != null ) return; // 不是純文字，跳過

  // 從 i+1 到結束，嘗試找找看
  for (let j = idx + 1; j < dtexts.length; j++) {
    const dt2 = dtexts[j];

    if ( dt2.sn == null ) return ; // 此 text 後沒有 sn 元素，跳過
    assert( dt2.ispun != 1, 'sn 元素不該是標點符號' );
    if ( dt2.isCurly == 1) continue; // brace 跳過 { } 的，可能是下一個
    
    if ( dt2.children != null ) return; // 有 children 的跳過
    if ( dt2.tp == 'G' && dt2.sn == "3588" ) {
      // 冠詞 3588 特例：繼續找下一個 sn 元素
      continue;
    }
    if ( parseInt( dt2.sn ) >= 9000 ) {
      // sn > 9000 特例：繼續找下一個 sn 元素
      continue;
    }
    
    if ( dt2.tp2 != null && dt2.tp2.includes("T")){
      // tp2 有 T 的，跳過
      continue;
    }

    // 找到可用的 sn 元素，套用
    dt.sn = dt2.sn
    dt.tp = dt2.tp
    return
  }
}

/**
 * @param {DText[]} dtexts
 * @param {string} bibleVersion // 'unv' | 'kjv' | 'bhs' | 'lxx' | 'fhlwh' ...
 * @returns {DText[]} 新陣列，避免就地改壞來源
 */
export function attach_sn_text(dtexts, bibleVersion) {
  const dtextsClone = structuredClone(dtexts);
  if (!Array.isArray(dtexts) || dtexts.length === 0) return dtextsClone ?? [];

  // 只有這幾個譯本，才會可能有 sn ["unv", "kjv", "rcuv", "fhlwh", "bhs", "lxx"]
  assert(['unv', 'kjv', 'rcuv', 'fhlwh', 'bhs', 'lxx'].includes(bibleVersion));

  // 暫時不將「所有譯本」的標點符號都分離，只分離要作這件事的。
  split_punctuation(dtextsClone);

  for (let i = 0; i < dtextsClone.length; i++) {
    const dt = dtextsClone[i];
    if (dt.children != null) {
      dt.children = attach_sn_text(dt.children, bibleVersion);
    } else {
      try_set_sn_text(i, dtextsClone)
    }
  }
  return dtextsClone;
}