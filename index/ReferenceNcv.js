/**
 * ES module, modernized ReferenceNcv (ES2023)
 * 原始來源: https://github.com/snowray712000/NUIRWD/blob/a56ecce1a333c409a51d1f2089b6aaa86a5d88f0/src/ijn-fhl-sharefun-ts/bible-text/ReferenceNcv.js
 *
 * 注意：
 * - 依賴匯入路徑可能要根據你的執行環境或打包輸出調整 (加/移除 .js 副檔名或相對路徑)。
 * - 我改用原生陣列方法取代 linq，行為與原實作等價（regResult 結構未改）。
 */

// import { BookNameConstants } from '../bible-const/BookNameConstants.js';
// import { SplitStringByRegExp } from '../str/SplitStringByRegExp.js';

import { BibleConstant } from "../index/BibleConstant.es2023.js";
import { splitStringByRegex } from "../index/splitStringByRegex.es2023.js";

export class ReferenceNcv {
    // cached regexp for normal (non-GB) and GB
    static reg;
    static regGb;

    /**
     * @param {string} str
     * @param {1|undefined} isGb
     */
    constructor(str, isGb) {
        this.str = str;
        this.isGb = isGb;
        /** @type {{w: string, exec?: RegExpExecArray}[] | null}  */
        this.regResult = null;
        this.isDone = 0
    }

    /**
     * 判斷字串是否包含 NCV 風格的參照（例如： （太26:26~28；可14:22~24；路22:17~20））
     * side-effect: 會把 split 的結果存至 this.regResult
     * @returns {boolean}
     */
    isIncludeRef() {
        if ( this.isDone === 1) {
            return this.regResult != null;
        }

        const reg1 = this.generateRegExp();

        const r2 = splitStringByRegex(this.str, reg1);
        // const r2 = new SplitStringByRegExp().main(this.str, reg1);
        this.regResult = r2;
        this.isDone = 1
        return r2 != null
    }

    /**
     * 根據 isGb 決定 RegExp（只產生一次並快取）
     * @returns {RegExp}
     */
    generateRegExp() {
        if (this.isGb !== 1) {
            if (!ReferenceNcv.reg) ReferenceNcv.reg = g();
            return ReferenceNcv.reg;
        } else {
            if (!ReferenceNcv.regGb) ReferenceNcv.regGb = g(1);
            return ReferenceNcv.regGb;
        }

        function g(isGb) {
            // 以 BookNameConstants 的縮寫陣列拼接成一個字串
            // (repo 原始實作採 concat/join 結果也是一個字串)
            const books = isGb != 1
                ? BibleConstant.CHINESE_BOOK_ABBREVIATIONS
                : BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB;

            const r1 = Array.isArray(books) ? books.join('') : String(books);

            // 使用全形括號 (\uFF08..\uFF09) 與其他全形標點做為檢測範圍
            // 原始 regexp: new RegExp("\uFF08[" + r1 + "\uFF0C:~\uFF1B\u30010-9]+\uFF09", 'g');
            // 保持等價行為
            return new RegExp(`\uFF08[${r1}\uFF0C:~\uFF1B\u30010-9]+\uFF09`, 'g');
        }
    }

    /**
     * 將 NCV 風格的參照轉成標準化形式（範例如: （太26:26~28；可14:22~24） -> （#太26:26-28;可14:22-24|））
     * @returns {string}
     */
    toStandard() {
        // - 若還沒處理過一次
        if (this.isDone == 0) {
            this.isIncludeRef();
        }

        // - 若結果，並沒有任何符合  => 回傳原字串
        if ( this.regResult == null) {
            return this.str;
        }
        
        const r2 = this.regResult;

        // 轉換：對每個片段，若為匹配片段則用 cvt 轉換，否則維持原樣
        const r3 = r2.map(a => (a.exec == null ? a.w : cvt(a.w))).join('');
        
        return r3

        // helper: 轉換括號內的分隔符
        function cvt(str) {
            const r1 = str.replace(/；|，|~|、/g, a => {
                if (a === '；' || a === '，') return ';';
                if (a === '~') return '-';
                if (a === '、') return ',';
                return a;
            });
            const r2splited = r1.split(/（|）/);
            // r2splited[1] 為括號內的內容（假設格式正確）
            return `（#${r2splited[1]}|）`;
        }
    }
}