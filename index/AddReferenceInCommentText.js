import { splitStringByRegex } from './splitStringByRegex.es2023.js'
import { deepCopy } from './deepCopy.js'
import { TPPageState } from './TPPageState.es2023.js'
/** @typedef {import('./DText').DText} DText */
import { VerseRange } from './VerseRange.js'

/**
 * Scan each DText and split by reference tokens (#...|).
 * Returns a new array of DText fragments; fragments that match the ref-regex
 * will have isRef = 1.
 *
 * @param {DText[]} datas - array of DText-like objects { w?: string, ... }
 * @returns {DText[]} new array of DText fragments
 */
function testEachLine(datas) {
  const rre = [];
  for (const arg1 of datas) {
    // keep empty/undefined words as-is
    if (!arg1?.w || arg1.w.length === 0) {
      rre.push(arg1);
      continue;
    }
    // SplitStringByRegexVer2 returns parts with `w` and maybe `exec`
    const parts = splitStringByRegex(arg1.w, /#[^|]+\|/g);
    if (parts == null) {
      rre.push(arg1);
      continue;
    }

    // - 情境，剛好只有一個。不用變變
    if (parts.length == 1) {
      arg1.isRef = 1
      rre.push(arg1);
      continue;
    }

    for (const part of parts) {
      const copy = structuredClone(arg1);
      copy.w = part.w;
      // When part has `exec`, it's a matched token (the reference)
      if (part.exec != null) {
        copy.isRef = 1;
      }
      rre.push(copy);
    }
  }
  return rre;
};

/**
 * Merge sequences like [isRef, separator('、' or ' '), isRef] into one isRef
 * element by concatenating their text.
 *
 * Operates in-place on the provided array and returns it.
 *
 * @param {DText[]} arr - array of DText-like objects
 * @returns {DText[]} same array instance with merges applied
 */
export const connectComma = (arr) => {
  // We will scan from end to start and merge when pattern matches
  const idxRemove = [];
  for (let i = arr.length - 3; i >= 0; i -= 1) {
    const cur = arr[i];
    const nt = arr[i + 1];
    const ntnt = arr[i + 2];
    if (
      cur?.isRef == 1 &&
      ntnt?.isRef == 1 &&
      (nt?.w == '、' || nt?.w == ' ')
    ) {
      // merge into `cur`
      cur.w = (cur.w ?? '') + (nt.w ?? '') + (ntnt.w ?? '');
      // blank out the next two so we can remove them later
      nt.w = '';
      ntnt.w = '';
      idxRemove.push(i + 2, i + 1);
    }
  }
  // Remove by index in descending order to keep indexes valid
  idxRemove.sort((a, b) => b - a).forEach((index) => {
    arr.splice(index, 1);
  });

  // console.log(JSON.stringify(arr));

  return arr;
};

/**
 * For each fragment marked as isRef, compute a refDescription using VerseRange.fD.
 * If VerseRange.fD throws (invalid or unknown reference), remove isRef and refDescription.
 *
 * @param {DText[]} arr - array of DText-like objects
 * @param {Object} addr - address fallback { book: string, ... }
 * @returns {DText[]} same array with refDescription set when possible
 */
export const setRefScriptation = (arr, addr) => {
  for (const item of arr) {
    if (item?.isRef == 1) {
      try {
        // remove leading '#' and trailing '|' then split by '、' and join with ';'
        const cleaned = (item.w ?? '').replace(/#|\|/g, '');
        const parts = cleaned.split(/、/);
        const joined = parts.join(';');
        // VerseRange.fD is expected to return an object with toStringChineseShort / toStringChineseGBShort

        const vr = VerseRange.fD(joined, addr?.book);
        if (vr == null) {
          // 不合理的 參照，直接當成文字處理
          delete item.isRef;
          delete item.refDescription;
        } else {
          const ps = TPPageState.s
          item.refDescription = ps.gb == 1
            ? vr.toStringChineseGBShort()
            : vr.toStringChineseShort();
        }
      } catch (e) {
        // If parsing fails, remove ref markers to leave original text as-is
        delete item.isRef;
        delete item.refDescription;
      }
    }
  }
  return arr;
};

/**
 * 與一般的 AddReference 不一樣, 在於 注釋 中的 reference, 很多省略了 書卷名, 例如
 * 引言 ( #1:1-17| ), 所以會傳入 addrSet 作為「若沒有傳入的預設值」
 * 通常接在 Comment2DText 之後使用
 * @param { DText[] } datas 
 * @param {{book: number}} addrSet 
 * @returns { DText[] }
 */
export function add_reference_in_comment_text(datas, addrSet) {
  // - 將有 # ... | 的字串切開成多個 DText, 並且加上 isRef = 1
  // - refDescription 是 step3 加入
  let re = testEachLine(datas);

  // - 注釋中，當出現 #創1:1、出2:1|，就要將其合併成一整個 ref，而非 2個。
  // - 承上，內部就是把 、 改成 ;，下面的流程就能完成了
  re = connectComma(re);
  // console.error(JSON.stringify(re));

  // - 加入 refDescription，但字面還是會保留 #1:1| 而不會把預設字眼加入到 .w 中。
  re = setRefScriptation(re, addrSet);

  return re;
}
