import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { splitStringByRegex } from "./splitStringByRegex.es2023.js";

export class SmartDescriptEndParsing {
    /** 不需要變更, 會回傳 null, 否則, 回傳 1:2-e 回傳 1:2-34
     * @param {number} book
     * @param {string} des
     * @returns {string | null}
    */
    main(book, des) {
        // 1:end or 1:e
        // 1:2-2:end or 1:2-2:e
        // 1:3-end or 1:3-e
        const r1 = splitStringByRegex(des, /(?:((\d+):)e|end)|(?:((\d+):(?:\d+)-)e|end)/gi);
        if ( r1 == null ){
            return null
        }

        if (r1.length === 1 && r1[0].exec === null) {
            return null;
        }
        let re3 = '';
        for (const it2 of r1) {
            if (it2.exec === undefined) {
                re3 = re3 + it2.w;
            }
            else {
                if (it2.exec[1] === undefined) {
                    // [3] '1:4-' [4] '1'
                    const vr = getVerseCount(book, parseInt(it2.exec[4], 10));
                    re3 = re3 + it2.exec[3] + vr.toString();
                }
                else {
                    // [1] '1:' [2] '1'
                    const vr = getVerseCount(book, parseInt(it2.exec[2], 10));
                    re3 = re3 + it2.exec[1] + vr.toString();
                }
            }
        }
        // console.log(re3);
        return re3;
    }
    getVerseCount(book, chap) {
        return BibleConstantHelper.getCountVerseOfChap(book, chap);
    }
}
