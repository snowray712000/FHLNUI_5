// import { getVerseCount } from 'src/app/const/count-of-verse';
// import { BibleBookNames } from 'src/app/const/book-name/BibleBookNames';
// import { BookNameLang } from 'src/app/const/book-name/BookNameLang';
// import { getChapCount } from 'src/app/const/count-of-chap';
// import { DAddress } from './DAddress';
import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
/**
 * @typedef {'羅'|'羅馬書'|'罗'|'罗马书'|'romans'|'rom'|'ro'} TpBookName
 */

export class VerseRangeToString {
    /**
     * 將 verses 轉成字串，例如 太1:1-3;創2:1
     * @param {DAddress[]} verses
     * @param {TpBookName} [lang='羅']
     * @returns {string}
     */
    main(verses, lang = '羅') {
        const re = this.splitBookId(verses);
        const re2 = re.map(a1 => this.splitContinueVerse(a1));
        const re3 = re2.map(a1 => this.splitTheSameChap(a1));
        const re4 = re3.map(a1 => this.getDescriptionEachBook(a1, lang)).join(';');
        return re4;
    }

    /**
     * 
     * @param {number} id 
     * @param {TpBookName} lang 
     */
    getBookName(id, lang) {
        return BibleConstantHelper.getBookNameArrayWhereTp(lang)[id - 1]
    }
    getVerseCount(book, chap) {
        return BibleConstantHelper.getCountVerseOfChap(book, chap);
    }
    getChapCount(book) {
        return BibleConstantHelper.getCountChap(book);
    }

    getDescriptionEachBook(arg, lang) {
        const id = arg[0][0][0].book;
        const na = this.getBookName(id, lang);

        const des = arg.map(a1 => {
            // 各種 case 的處理見原始註解
            if (a1.length > 1) {
                // a1: [[23],[25,26,27],[30],[32,33...41,42]]
                const chap = a1[0][0].chap;
                const r2 = a1.map(a2 => {
                    const vr1 = a2[0];
                    if (a2.length === 1) {
                        return `${vr1.verse}`;
                    } else {
                        const vr2 = a2[a2.length - 1];
                        return `${vr1.verse}-${vr2.verse}`;
                    }
                }).join(',');
                return `${chap}:${r2}`;
            } else {
                const a2 = a1[0];
                const vr1 = a2[0];
                const chap = vr1.chap;
                if (a2.length > 1) {
                    const vr2 = a2[a2.length - 1];
                    if (vr1.chap !== vr2.chap) {
                        return `${chap}:${vr1.verse}-${vr2.chap}:${vr2.verse}`;
                    } else {
                        if (vr1.verse === 1 && vr2.verse === this.getVerseCount(id, chap)) {
                            if (this.getChapCount(id) === 1) {
                                return '1';
                            }
                            return `${chap}`;
                        }
                        return `${chap}:${vr1.verse}-${vr2.verse}`;
                    }
                } else {
                    return `${chap}:${vr1.verse}`;
                }
            }
        }).join(';');

        return na + des;
    }

    splitTheSameChap(vrsOneBook) {
        const re3 = [];
        let sameChap = [];
        let chap = -1;
        const fnPushSameChapToResult = () => {
            if (sameChap.length > 0) {
                re3.push(sameChap);
            }
            sameChap = [];
        };

        for (let i = 0; i < vrsOneBook.length; i++) {
            const vrsOneContinue = vrsOneBook[i];
            const vr1 = vrsOneContinue[0];

            if (vrsOneContinue.length > 1) {
                const vr2 = vrsOneContinue[vrsOneContinue.length - 1];
                if (vr1.chap !== vr2.chap) {
                    fnPushSameChapToResult();
                    sameChap.push(vrsOneContinue);
                    fnPushSameChapToResult();
                    chap = -1;
                } else {
                    if (chap === vr1.chap) {
                        sameChap.push(vrsOneContinue);
                    } else {
                        fnPushSameChapToResult();
                        sameChap.push(vrsOneContinue);
                        chap = vr1.chap;
                    }
                }
            } else {
                if (vrsOneContinue[0].chap !== chap) {
                    fnPushSameChapToResult();
                    sameChap.push(vrsOneContinue);
                    chap = vr1.chap;
                } else {
                    sameChap.push(vrsOneContinue);
                }
            }
        }

        if (sameChap.length > 0) {
            re3.push(sameChap);
        }
        return re3;
    }

    splitContinueVerse(vrsOneBook) {
        const re2 = [];
        let re1 = [];
        for (let i = 0; i < vrsOneBook.length; i++) {
            if (i !== 0 && this.isContinueVerse(vrsOneBook[i - 1], vrsOneBook[i])) {
                re1.push(vrsOneBook[i]);
            } else {
                if (re1.length !== 0) {
                    re2.push(re1);
                }
                re1 = [];
                re1.push(vrsOneBook[i]);
            }
        }
        if (re1.length !== 0) {
            re2.push(re1);
        }
        return re2;
    }

    isContinueVerse(vr1, vr2) {
        if (vr1.chap === vr2.chap) {
            return vr1.verse + 1 === vr2.verse;
        } else {
            if (vr1.chap + 1 === vr2.chap && vr2.verse === 1) {
                if (this.getVerseCount(vr1.book, vr1.chap) === vr1.verse) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }

    splitBookId(verses) {
        const re = [];
        let id;
        let r1;
        for (const it1 of verses) {
            if (id === it1.book) {
                r1.push(it1);
            } else {
                if (r1 !== undefined && r1.length !== 0) {
                    re.push(r1);
                }
                r1 = [];
                id = it1.book;
                r1.push(it1);
            }
        }
        if (r1 && r1.length !== 0) {
            re.push(r1);
        }
        return re;
    }
}