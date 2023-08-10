/// <reference path="./DText.d.ts" />
/// <reference path="./DAddress.d.ts" />
/// <reference path="./../libs/jsdoc/linq.d.ts" />

//import Enumerable from "../libs/jsdoc/linq.js"
import Enumerable from 'https://cdnjs.cloudflare.com/ajax/libs/linq.js/4.0.0/linq.min.js'
import { BibleConstantHelperEs6Js } from "./BibleConstantHelper.es6.js"

const cvtAddrsToRef = cvtAddrsToRefEs6Js()
export { cvtAddrsToRef, cvtAddrsToRefEs6Js }
function cvtAddrsToRefEs6Js() {
    const BibleConstantHelper = BibleConstantHelperEs6Js()
    return cvtAddrsToRef

    /**
     * 緣由:
     * splitReference 的結果，會得到 Address 的集合，但要從這集合轉到 Reference 描述的需求。(去請求qsb.php時，就要用到)。
     * @param {DAddress[]} addrs 
     * @param {'羅'|'羅馬書'|'罗'|'罗马书'|'romans'|'rom'|'ro'} tp
     * @returns {string}
     */
    function cvtAddrsToRef(addrs, tp) {
        let r1 = Enumerable.from(addrs).groupBy(a1 => a1.book).select(a1 => getName(a1.key(), tp) + oneBookExcludeName(a1.toArray(), a1.key())).toArray()
        return r1.join(";")

        function getName(book) {
            return BibleConstantHelper.getBookNameArrayWhereTp(tp)[book - 1]
        }
    }
    /**
     * @param {DAddress[]} addrs 
     * @param {number} book 卷書id. 後來發現需要, 於 step3, 因為要知道哪卷書,才能知道「目前章，的節數目」，才能判斷是不是連續
     * @returns {string}
     */
    function oneBookExcludeName(addrs, book) {
        // addrs 目前是同 book 
        // 直覺，是分章，再分連續的節
        // 但，若章連續，又要合起來
        // 簡易版，只要不是全章，就不連續章
        // 31:23-32:12，就會變成31:23-55;32-1-12 這樣又很爛 ... 改為，不是全章，但各章，只能有一組時，就可能連
        // 所以 31:23-32:12;33:23-12 就會維持原樣
        // 31:23-32:4;32:6-8 就會變成 31:23-55;32:4,6-8

        // 預計，中繼會變成這樣
        // 31:[23-55] 32:[1-12]
        // 31:[23-55] 32:[4, 6-8]

        // step: 變成 [{chap:31, verses:[23,24,25,26,27,28,...55]},{chap:32, verses:[...]}]
        let r1 = Enumerable.from(addrs).groupBy(a1 => a1.chap).select(a1 => ({
            chap: a1.key(),
            verses: a1.select(a2 => a2.verse).distinct().orderBy(a2 => a2).toArray()
        })
        ).toArray()
        // console.log(r1);

        // step: 變成 [{"chap":31,"verses":[{"s":30,"e":55}]},{"chap":32,"verses":[{"s":1,"e":32}]},{"chap":33,"verses":[{"s":1,"e":4},{"s":7,"e":8}]}]
        let r2 = Enumerable.from(r1).select(a1 => step2(a1)).toArray()
        // console.log(JSON.stringify(r2));

        // step: 哪些chap要合, (31),(32,33) or (31,33) or (31,32) (33)
        let r3 = step3(r2, book)
        // console.log(JSON.stringify(r3));

        // step: [31,32] 就要合成為 31:30-32:32 [33] 就要變為 33:1-4,7-8
        let r4 = step4(r3, r2)
        // console.log(r4);

        return r4
        /**
         * 
         * @param {number[][]} reStep3 
         * @param {DOneChap[]} reStep2 
         */
        function step4(reStep3, reStep2) {
            // 非必要，只是為提高效率。 因為，一直用到  Enumerable.from(reStep2).first(a1=>a1.chap == chaps[0])
            let map = Enumerable.from(reStep2).toDictionary(a1 => a1.chap)

            return Enumerable.from(reStep3).select(chaps => {
                let r1 = map.get(chaps[0])
                if (chaps.length >= 2) {
                    let r2 = map.get(chaps[chaps.length - 1])
                    return r1.chap + ":" + r1.verses[0].s + "-" + r2.chap + ":" + r2.verses[0].e
                } else {
                    let r3 = Enumerable.from(r1.verses).select(a2 => {
                        if (a2.e == undefined || a2.e == a2.s) {
                            return a2.s
                        } else {
                            return a2.s + "-" + a2.e
                        }
                    }).toArray().join(",")
                    return r1.chap + ":" + r3
                }
            }).toArray().join(";")
        }
        /**
         * 
         * @param {DOneChap[]} oneChaps
         * @returns {number[][]} 
         */
        function step3(oneChaps, book) {
            /** @type {number[][]} */
            let re = []

            // 我，已經在別章？此章有多章嗎？下一章，是多章嗎？下一章，是下一章嗎？節，有連續嗎？
            let alreadys = new Set()
            let fnAlreadyAndAutoAdd = ch => {
                let r1 = alreadys.has(ch)
                if (r1 == false) {
                    alreadys.add(ch)
                }
                return r1
            }
            let fnIsThisChapOnlyOneAndNextOnlyOneAndContinueChap = i => {
                if (oneChaps[i].verses.length != 1) { return false; }
                if (i == oneChaps.length - 1) { return false; } // 最後一個，就沒有
                // console.log(oneChaps[i].verses.length + " " + oneChaps[i+1].verses.length);
                if (oneChaps[i + 1].verses.length != 1) { return false; }
                if (oneChaps[i + 1].chap != oneChaps[i].chap + 1) { return false; }
                return true;
            }
            let fnIsContinueVerses = i => {
                // assert true == fnIsThisChapOnlyOneAndNextOnlyOneAndContinueChap
                // 因上式, assert r1.verse.length == 1
                if (oneChaps[i + 1].verses[0].s != 1) { return false; }

                let r1 = oneChaps[i]
                let r2 = BibleConstantHelper.getCountVerseOfChap(book, r1.chap)
                if (r1.verses[0].e != r2) { return false; }
                return true
            }

            // 是。例31是，(假設34章不是)，那麼回傳 [31,32,33]
            let fnGetChapsCoutinued = i => {
                // true == fnIsThisChapOnlyOneAndNextOnlyOneAndContinueChap(i2) && fnIsContinueVerses(i2)
                let re = [oneChaps[i].chap, oneChaps[i + 1].chap]

                for (let i2 = i + 1; i2 < oneChaps.length; i2++) {
                    if (fnIsThisChapOnlyOneAndNextOnlyOneAndContinueChap(i2) && fnIsContinueVerses(i2)) {
                        re.push(oneChaps[i2 + 1].chap)
                    } else {
                        break
                    }
                }
                return re
            }



            // [] -> [31] -> [31,32] -> [31,32,33]
            for (let i = 0; i < oneChaps.length; i++) {
                if (fnAlreadyAndAutoAdd(oneChaps[i].chap)) {
                    continue
                }
                // console.log(JSON.stringify(re));
                if (fnIsThisChapOnlyOneAndNextOnlyOneAndContinueChap(i) && fnIsContinueVerses(i)) {
                    let chaps = fnGetChapsCoutinued(i)
                    for (const ch of chaps) { alreadys.add(ch) } // 上面 already 就會略過
                    re.push(chaps)
                } else {
                    re.push([oneChaps[i].chap])
                }
            }

            return re
        }
        /**
         * 
         * @param {{chap:number, verses:number[]}} aa1 
         * @returns {DOneChap[]}}
         */
        function step2(aa1) {
            if (aa1.verses.length == 1) {
                let r2 = aa1.verses[0]
                return { chap: aa1.chap, verses: [{ s: r2, e: r2 }] }
            }

            // 123679
            // 123 67 9 <== 預期結果

            let r1 = aa1.verses
            let r2 = r1[0] // cur // assert aa1.length > 0
            let r3 = r2 // header
            let re = []
            for (let i = 1; i < r1.length; i++) {
                const it = r1[i]; // verse
                if (it == r2 + 1) {
                    r2++
                } else {
                    re.push({ s: r3, e: r2 })
                    r3 = it
                    r2 = it
                }
            }

            // 只有一組，上面的 loop 不會 push 任何一組，所以要加這個
            re.push({ s: r3, e: r2 })

            return { chap: aa1.chap, verses: re }
        }
        function DOneChap() {
            /** @type {number} */
            this.chap = 31
            /**
             * @type {{s:number,e:number}[]}
             */
            this.verses = []
        }
    }
}