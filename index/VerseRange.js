// import Enumerable from 'linq';
// import { getVerseCount } from 'src/app/const/count-of-verse';
// import { ObjTools } from 'src/app/tools/obj';
// import { VerseRangeToString } from 'src/app/bible-address/VerseRangeToString';
// import { BookNameLang } from '../const/book-name/BookNameLang';
// import { ParsingReferenceDescription } from './ParsingReferenceDescription';
// import { DAddress, DAddressComparor, DAddressComparor2 } from './DAddress';

import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { ParsingReferenceDescription } from "./ParsingReferenceDescription.js";
import { VerseRangeToString } from "./VerseRangeToString.js"
/** 
 * @typedef {{book: number, chap: number, verse: number}} DAddress
*/

/**
 * 供 linq distinct() 用, 也可用在 orderBy, 當初要開發 merge多個版本之間的經文用.
 * book * 10000 + chap * 1000 + verse
 * @param {DAddress} addr 
 * @returns 
 */
export function DAddressComparor(addr) { return addr.book * 10000 + addr.chap * 1000 + addr.verse; }
/**
 * 供 linq distinct() 用, 也可用在 orderBy, 當初要開發 merge多個版本之間的經文用.
 * @param {DAddress} addr
 * @param {DAddress} addr2
 * @return {number}
 */
export function DAddressComparor2(addr, addr2) {
  const r1 = DAddressComparor(addr)
  const r2 = DAddressComparor(addr2)
  if ( r1 == r2 ) return 0
  return r1 < r2 ? -1 : 1
}

/**
 * VerseRange
 *
 * JavaScript conversion from the original TypeScript. Type annotations removed.
 * Keeps the original logic and structure, using modern ES module syntax.
 */
export class VerseRange {
  /** @type {{DAddress[]}} */
  verses = [];

  /**
   * 內容換了 由 ParsingReferenceDescription 完成
   */
  static fromReferenceDescription(describe, book1BasedDefault) {
    try {
      // - 將 `創71:1` 轉成 `{book,chap,verse}[]` 
      const re = ParsingReferenceDescription.s.main(describe, { book: book1BasedDefault });
      if ( re.length == 0 ){
        return null;
      }
      
      const re2 = new VerseRange();
      re2.verses = re;
      return re2;
    } catch (error) {
      console.error('fromReferenceDescription');
      throw error;
    }
  }

  /** 
   * fromReferenceDescription 縮寫 
   * @param {string} describe
   * @param {number} book1BasedDefault
   * @returns {VerseRange | null}
  */
  static fD(describe, book1BasedDefault = 40) {
    return VerseRange.fromReferenceDescription(describe, book1BasedDefault);
  }

  /** 任一個 undefined, false。 順序也要一樣。 */
  static isTheSame(a1, a2) {
    if (a1 === undefined || a2 === undefined || a1.verses === undefined || a2.verses === undefined) { return false; }

    const aa1a = a1.verses;
    const aa2a = a2.verses;
    if (aa1a.length !== aa2a.length) { return false; }

    return Enumerable.range(0, aa1a.length).all(i => {
      const r1 = aa1a[i];
      const r2 = aa2a[i];
      return r1.book === r2.book && r1.chap === r2.chap && r1.verse === r2.verse;
    });
  }

  constructor() {
    // 保留空建構子（原始 TypeScript 的 constructor 同樣不帶參數）
  }

  /** 判斷是否在此範圍內, 開發 註釋 時需要 */
  isIn(d) {
    if (this.verses.length === 0 || d === undefined) {
      return false;
    }
    const r1 = Enumerable.from(this.verses).firstOrDefault(a1 => a1.book === d.book && a1.chap === d.chap && a1.verse === d.verse);
    return r1 !== undefined;
  }

  add(v) { this.verses.push(v); }
  addRange(v) { v.forEach(a1 => this.verses.push(a1)); }

  /** 產生 太 4:1-6, 使用 VerseRangeToString class 取代這個 */
  toStringChineseShort() {
    return new VerseRangeToString().main(this.verses, "羅");
  }

  toStringChineseGBShort() {
    return new VerseRangeToString().main(this.verses, "罗");
  }

  /** 產生 Mt 4:1-6 (英文) */
  toStringEnglishShort() {
    return new VerseRangeToString().main(this.verses, "ro");
  }

  toString() {
    return this.toStringChineseShort();
  }
}

/**
 * 處理第1章時，已確定第2章要合併，可能合併到第3、第4章?
 */
export class MergedChapFind {
  data;
  ch;
  bk;
  constructor(data, chapAlreadyIncludeMerged, book) {
    this.data = data;
    this.ch = chapAlreadyIncludeMerged;
    this.bk = book;
  }

  main() {
    try {
      while (true) {
        if (ObjTools.isExistKeys(this.data, this.ch + 1) === false) {
          return this.ch;
        }
        if (this.isFirstToBe1(this.ch + 1) === false) {
          return this.ch;
        }
        if (this.isOverOne(this.ch)) {
          return this.ch;
        }
        if (this.isLastVerse(this.ch) === false) {
          return this.ch;
        }
        this.ch++;
      }
    } catch (e) {
      console.error('ex: MergedChapFind');
      throw e;
    }
  }

  isOverOne(ch) {
    return this.data[ch.toString()].length > 1;
  }

  isFirstToBe1(ch) {
    return this.data[ch.toString()][0][0] === 1;
  }

  isLastVerse(ch) {
    const r1 = getVerseCount(this.bk, ch);
    return this.data[ch.toString()][0][1] === r1;
  }
}

/**
 * 處理第1章時，也確定會合併到第n章，把資料中相關的合併一下。(改第1章尾，消被合併的)
 * c1 = 1, c2 = n
 */
export class MergedCauseDataChanged {
  data;
  c1;
  c2;
  constructor(dataInOut, chapThis, chapMerged) {
    this.data = dataInOut;
    this.c1 = chapThis;
    this.c2 = chapMerged;
  }

  main() {
    try {
      this.changeLastElementOfFirstChap();
      this.removeAlreadyMergeData();
    } catch (e) {
      console.error('ex: MergedCauseDataChanged.main');
      throw e;
    }
  }

  changeLastElementOfFirstChap() {
    const r1 = this.data[this.c1.toString()];
    const n = r1.length;
    r1[n - 1][1] = this.getMergedString();
  }

  getMergedString() {
    const r1 = this.data[this.c2.toString()];
    return `${this.c2}:${r1[0][1]}`; // e.g. "3:2"
  }

  removeAlreadyMergeData() {
    for (let idx = this.c1 + 1; idx <= this.c2; idx++) {
      const r1 = this.data[idx.toString()];
      r1.splice(0, 1);
      if (r1.length === 0) {
        delete this.data[idx.toString()];
      }
    }
  }
}

/**
 * 此卷書資料預備好了(排序、合併相聯範圍)，產生字串吧
 * 資料 {1:[1,3],[6,7],[23,23],[25,'3:3'],3:[7,8]}
 * 預期結果 1:1-3,6-7,23,25-3:3,3:7-8
 */
export class ToStringAfterMerged {
  data;
  constructor(data) {
    this.data = data;
  }

  main() {
    try {
      const chaps = Object.keys(this.data).map(a1 => parseInt(a1, 10));
      return chaps.map(ch => this.calcOneChapResult(ch)).join(',');
    } catch (error) {
      console.error('ex: ToStringAfterMerged');
      throw error;
    }
  }

  calcOneChapResult(ch) {
    const r1 = this.data[ch.toString()];
    const r2 = r1.map(a1 => this.calcOneElementResult(a1));
    r2[0] = `${ch}:${r2[0]}`;
    return r2.join(',');
  }

  // 注意：原始程式假定每個 element 是 [start,end] 形式
  calcOneElementResult(el) {
    if (el[0] === el[1]) {
      return `${el[0]}`;
    }
    return `${el[0]}-${el[1]}`;
  }
}

/** BookNameTryGetBookId 的結果 (在 TypeScript 裡是 interface，這裡以 JSDoc 表示) */
/**
 * @typedef {{ idbook: number, descript: string }} IBookNameTryGetBookIdResult
 */

export class BookNameTryGetBookId {
  static reg;

  main(description) {
    if (BookNameTryGetBookId.reg === undefined) {
      BookNameTryGetBookId.reg = this.generateRegAndMaps();
    }

    const r1 = description.match(BookNameTryGetBookId.reg);

    if (r1 === null) {
      throw new Error('BookNameTryGetBookId ex input:' + description);
    }
    return {
      idbook: this.getIdFromMatchResult(r1[1]),
      descript: r1[3]
    };
  }

  getIdFromMatchResult(re) {
    if (re === undefined) {
      return undefined;
    }
    const r1 = re.toLowerCase();
    const re_id = BibleConstantHelper.getBookId(r1);
    if ( re_id == -1){
      return undefined;
    }
    return re_id;
  }

  generateRegAndMaps() {
    const name2ids = BibleConstantHelper.getMapName2Id()    
    const names = Object.keys(name2ids)
    names.sort( (a,b) => b.length - a.length ); // 長度由大到小排序，避免 e.g. "太" 在 "太初" 前面被比對到

    return new RegExp(`(${names.join('|')}){0,1}(\\s*)([0-9:\\-,]*)`, 'i');
    // unreachable in original, kept for parity with source
    // throw new Error('not implement');
  }
}

/**
 * IGetAddressesType was an interface in TS. The usage in original file is internal.
 */

/**
 * VerseRangeComparor
 *
 * 提供 linq 的 distinct 與 orderBy 用的
 * Enumerable.from([]).orderBy(a1=>a1,VerseRangeComparor.s.compare)
 * Enumerable.from([]).distinct(a1=>a1,VerseRangeComparor.s.hashNumer)
 */
export class VerseRangeComparor {
  static s = new VerseRangeComparor();

  // undefined == undefined
  // undefined > not undefined
  compare(a1, a2) {
    if (isAnyUndefinedOrEmtpy()) {
      return compareWhenAnyUndfinedOrEmptyCase();
    }

    const addrs1 = a1.verses;
    const addrs2 = a2.verses;

    if (addrs1.length == addrs2.length) {
      return compareWhenTheSameAddressLength();
    }

    return compareWhenNotTheSameAddressLength();

    function isUndefinedOrEmpty(aa1) {
      return aa1 == undefined || aa1.verses == undefined || aa1.verses.length == 0;
    }
    function isAnyUndefinedOrEmtpy() {
      return Enumerable.from([a1, a2]).any(aa1 => isUndefinedOrEmpty(aa1));
    }
    function compareWhenAnyUndfinedOrEmptyCase() {
      if (isUndefinedOrEmpty(a1)) {
        if (isUndefinedOrEmpty(a2)) return 0;
        return 1; // a1 greater
      }
      // assert a1 not undefined
      return -1; // a2 greater
    }
    function compareWhenNotTheSameAddressLength() {
      const cntMin = addrs1.length < addrs2.length ? addrs1.length : addrs2.length;
      for (let i = 0; i < cntMin; ++i) {
        const rr1 = DAddressComparor2(addrs1[i], addrs2[i]);
        if (rr1 != 0) return rr1;
      }
      return addrs1.length < addrs2.length ? -1 : 1;
    }
    function compareWhenTheSameAddressLength() {
      for (let i = 0; i < addrs2.length; ++i) {
        const rr1 = DAddressComparor2(addrs1[i], addrs2[i]);
        if (rr1 == 0) continue;
        return rr1; // 1 or -1
      }
      return 0;
    }
  }

  hashNumer(a1) {
    if (a1 == undefined || a1.verses == undefined || a1.verses.length == undefined) return -1;
    return Enumerable.from(a1.verses).sum(a1 => DAddressComparor(a1));
  }
}