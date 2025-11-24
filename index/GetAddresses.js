/**
 * @typedef {Object} DAddress - 經文地址資料結構
 * @property {number} book - 書卷 ID
 * @property {number} chap - 章節號
 * @property {number} verse - 經節號
 */

import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { linq_range } from "./linq_es2023.js";

/**
 * @typedef {Object} IBookNameTryGetBookIdResult - 嘗試取得書卷 ID 的結果
 * @property {string} descript - 描述，通常是章節和經節的字串 (例如 "1:1-3,6-7,21,25,2:3-5")
 * @property {number} idBook - 書卷 ID
 */

/**
 * @typedef {Object} IGetAddressesType - 經文解析類型
 * @property {0|1|2|3|4} tp - 解析類型 (0: C:V-C:V, 1: C:V-V, 2: C 或 V, 3: V-V, 4: C:V)
 * @property {number} ch1 - 起始章節號
 * @property {number} vr1 - 起始經節號
 * @property {number} ch2 - 結束章節號
 * @property {number} vr2 - 結束經節號
 */


/**
 * @class
 * @description 負責將書卷的經文地址描述字串 (例如 "1:1-3,6-7,21,25,2:3-5")
 * 轉換為一系列具體的經文地址 (DAddress 陣列)。
 * @example
 * // 假設有 getChapCountEqual1BookIds, getVerseCount, linq_range 這些外部函式
 * // const addresses = new GetAddresses(1).main({ descript: '1:1-3,6-7,21,25,2:3-5' });
 */
export class GetAddresses {
    /**
     * @private
     * @type {RegExp}
     * @description 類型 0: 跨章節經文範圍 (例如: 1:32-2:31)。
     * @match ["11:32-2:31","11","32","2","31"]
     */
    static #regA1 = new RegExp('(\\d+):(\\d+)-(\\d+):(\\d+)');

    /**
     * @private
     * @type {RegExp}
     * @description 類型 1: 章內經文範圍 (例如: 1:32-50)。
     * @match ["11:32-50","11","32","50"]
     */
    static #regA2 = new RegExp('(\\d+):(\\d+)-(\\d+)');

    /**
     * @private
     * @type {RegExp}
     * @description 類型 3: 承接上一章節的經文範圍 (例如: 4-7)。
     * @match ["4-7","4","7"]
     */
    static #regA4 = new RegExp('(\\d+)-(\\d+)');

    /**
     * @private
     * @type {RegExp}
     * @description 類型 4: 特定章節經文 (例如: 1:23)。
     * @match ["1:23","1","23"]
     */
    static #regA5 = new RegExp('(\\d+):(\\d+)');

    /**
     * @private
     * @type {RegExp}
     * @description 類型 2: 單一章節號或單一經節號 (例如: 23)。
     * @match ["23","23"]
     */
    static #regA3 = new RegExp('^(\\d+)$'); // 使用 ^$ 確保完整匹配單一數字

    /**
     * @private
     * @type {number}
     * @description 正在處理的書卷 ID。
     */
    #idBook;

    /**
     * @private
     * @type {DAddress[]}
     * @description 儲存所有解析出的經文地址。
     */
    #addresses = [];

    /**
     * @constructor
     * @param {number} idBook - 要解析經文的書卷 ID。
     */
    constructor(idBook) {
        this.#idBook = idBook;
    }

    getChapCountEqual1BookIds(){
        return BibleConstantHelper.getChapCountEqual1BookIds()
    }
    getVerseCount(bookId, chap) {
        return BibleConstantHelper.getCountVerseOfChap(bookId, chap);
    }
    /**
     * 執行經文地址解析的主要函式。
     * @param {IBookNameTryGetBookIdResult} oneBookResult - 包含經文地址描述的結果物件。
     * @returns {DAddress[]} 解析後的經文地址列表。
     * @throws {Error} 如果解析過程中出現錯誤。
     */
    main(oneBookResult) {
        try {
            // 約二 case：描述字串為空，且書卷為「一章書」時，預設整章 (第 1 章)
            if (oneBookResult.descript.length === 0) {
                if (this.getChapCountEqual1BookIds().includes(this.#idBook)) {
                    return this.#generateOneChap(1);
                }

                console.log(oneBookResult.descript);
                console.warn('GetAddresses 不加章節只允許「一章」的書卷 (例如約二、約三)。');
                return [];
            }

            const descriptions = oneBookResult.descript.split(',');
            const classifiedTypes = descriptions.map(desc => this.#classifyType(desc));

            classifiedTypes.forEach(addressType => {
                if (addressType === null) return; // 忽略無法解析的類型

                let generatedAddresses = [];
                switch (addressType.tp) {
                    case 0: // C:V-C:V
                        generatedAddresses = this.#generateFromType0(addressType);
                        break;
                    case 1: // C:V-V
                        generatedAddresses = this.#generateFromType1(addressType);
                        break;
                    case 2: // C or V (根據上下文決定是章或節)
                        generatedAddresses = this.#generateFromType2(addressType);
                        break;
                    case 3: // V-V (承接上一章節的經文範圍)
                        generatedAddresses = this.#generateFromType3(addressType);
                        break;
                    case 4: // C:V
                        generatedAddresses = this.#generateFromType4(addressType);
                        break;
                    default:
                        break;
                }
                this.#addresses.push(...generatedAddresses);
            });

            return this.#addresses;
        } catch (error) {
            console.error('GetAddresses 執行錯誤:', error);
            throw error;
        }
    }

    /**
     * @private
     * @description 根據描述字串分類經文地址類型。
     * @param {string} des - 單個經文地址描述字串 (例如 "1:32-2:31", "1:32-50", "4-7", "1:23", "23")。
     * @returns {IGetAddressesType | null} 解析類型物件，如果無法解析則返回 null。
     */
    #classifyType(des) {
        const r1 = des.match(GetAddresses.#regA1);
        if (r1 !== null) {
            return {
                tp: 0,
                ch1: parseInt(r1[1], 10),
                vr1: parseInt(r1[2], 10),
                ch2: parseInt(r1[3], 10),
                vr2: parseInt(r1[4], 10),
            };
        }

        const r2 = des.match(GetAddresses.#regA2);
        if (r2 !== null) {
            const ch1 = parseInt(r2[1], 10);
            return {
                tp: 1,
                ch1,
                vr1: parseInt(r2[2], 10),
                ch2: ch1, // 章節相同
                vr2: parseInt(r2[3], 10),
            };
        }

        const r4 = des.match(GetAddresses.#regA4);
        if (r4 !== null) {
            return {
                tp: 3,
                ch1: -1,
                vr1: parseInt(r4[1], 10),
                ch2: -1,
                vr2: parseInt(r4[2], 10),
            };
        }

        const r5 = des.match(GetAddresses.#regA5); // 1:23
        if (r5 !== null) {
            return {
                tp: 4,
                ch1: parseInt(r5[1], 10),
                vr1: parseInt(r5[2], 10),
                ch2: -1,
                vr2: -1,
            };
        }

        const r3 = des.match(GetAddresses.#regA3);
        if (r3 !== null) {
            const ch1 = parseInt(r3[1], 10);
            return {
                tp: 2,
                ch1, // 暫定為 ch1，但可能代表 vr1
                vr1: ch1, // 暫定為 vr1
                ch2: -1,
                vr2: -1,
            };
        }

        return null; // 無法識別的格式
    }

    /**
     * @private
     * @description 處理跨章節經文範圍 (例如: 1:2-3:24)。
     * @param {IGetAddressesType} add - 解析類型物件。
     * @returns {DAddress[]} 經文地址列表。
     */
    #generateFromType0(add) {
        // 章節相同，退化為類型 1 (章內範圍)
        if (add.ch1 === add.ch2) {
            return this.#generateFromType1(add);
        }

        /** @type {DAddress[]} */
        const re = [];

        // 1. 第一章節 (例如: 1:2 - 1:結束)
        const verse1End = this.getVerseCount(this.#idBook, add.ch1);
        
        const firstChapAddresses = linq_range(add.vr1, verse1End - add.vr1 + 1)
            .map(verse => this.#new_DAddress(this.#idBook, add.ch1, verse));
        re.push(...firstChapAddresses);

        // 2. 中間章節 (例如: 1:2-3:24, 第 2 章)
        if (add.ch1 + 1 < add.ch2) {
            const middleChaps = linq_range(add.ch1 + 1, add.ch2 - add.ch1 - 1);
            middleChaps.forEach(chap => {
                re.push(...this.#generateOneChap(chap));
            });
        }

        // 3. 最後章節 (例如: -3:24)
        const lastChapAddresses = linq_range(1, add.vr2)
            .map(verse => this.#new_DAddress(this.#idBook, add.ch2, verse));
        re.push(...lastChapAddresses);

        return re;
    }

    /**
     * @private
     * @description 處理章內經文範圍 (例如: 1:12-43)。
     * @param {IGetAddressesType} add - 解析類型物件。
     * @returns {DAddress[]} 經文地址列表。
     */
    #generateFromType1(add) {
        // 假設 ch1 === ch2
        return linq_range(add.vr1, add.vr2 - add.vr1 + 1)
            .map(verse => this.#new_DAddress(this.#idBook, add.ch1, verse));
    }

    /**
     * @private
     * @description 產生單個章節的所有經文地址 (例如: 2:1-End)。
     * @param {number} chap - 章節號。
     * @returns {DAddress[]} 該章節的所有經文地址列表。
     */
    #generateOneChap(chap) {
        const verseEnd = this.getVerseCount(this.#idBook, chap);
        return linq_range(1, verseEnd)
            .map(verse => this.#new_DAddress(this.#idBook, chap, verse));
    }

    /**
     * @private
     * @description 輔助函式，用於創建 DAddress 物件。
     * @param {number} book - 書卷 ID。
     * @param {number} chap - 章節號。
     * @param {number} verse - 經節號。
     * @returns {DAddress} DAddress 物件。
     */
    #new_DAddress(book, chap, verse) {
        return { book, chap, verse };
    }

    /**
     * @private
     * @description 取得目前已解析地址列表中的最後一個地址。
     * @returns {DAddress | undefined} 最後一個地址，如果列表為空則為 undefined。
     */
    #getLastVerseAddress() {
        if (this.#addresses.length === 0) {
            return undefined;
        }
        return this.#addresses.at(-1); // 使用 ES2022 的 Array.prototype.at()
    }

    /**
     * @private
     * @description 處理單個章節號或單個經節號 (例如: 23)。
     * - 如果目前沒有地址，則 23 表示第 23 章 (整章)。
     * - 如果目前已有地址，則 23 表示當前章節的第 23 節。
     * @param {IGetAddressesType} add - 解析類型物件 (ch1 和 vr1 皆為該數字)。
     * @returns {DAddress[]} 經文地址列表。
     */
    #generateFromType2(add) {
        const last = this.#getLastVerseAddress();

        // 判斷是「章」還是「節」
        if (last === undefined) {
            // 目前沒有地址，數字代表「整章」 (例如: "創 23" -> 創世記 23 章)
            return this.#generateOneChap(add.ch1);
        }

        // 目前有地址，數字代表「當前章節的單節」 (例如: "創 1:1,23" -> 創世記 1 章 23 節)
        return [this.#new_DAddress(this.#idBook, last.chap, add.vr1)];
    }

    /**
     * @private
     * @description 處理承接上一章節的經文範圍 (例如: 7-9)。
     * @param {IGetAddressesType} add - 解析類型物件。
     * @returns {DAddress[]} 經文地址列表。
     */
    #generateFromType3(add) {
        // 取得當前章節號，如果還沒有地址，則預設為第 1 章
        const last = this.#getLastVerseAddress();
        const chap = last?.chap ?? 1; // 使用 ES2020 的 Optional Chaining 和 Nullish Coalescing

        return linq_range(add.vr1, add.vr2 - add.vr1 + 1)
            .map(verse => this.#new_DAddress(this.#idBook, chap, verse));
    }

    /**
     * @private
     * @description 處理特定章節經文 (例如: 1:23)。
     * @param {IGetAddressesType} add - 解析類型物件。
     * @returns {DAddress[]} 經文地址列表。
     */
    #generateFromType4(add) {
        return [this.#new_DAddress(this.#idBook, add.ch1, add.vr1)];
    }
}