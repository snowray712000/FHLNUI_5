/// <reference path="./../libs/jsdoc/linq.d.ts" />

//import Enumerable from "../libs/jsdoc/linq";
import Enumerable from 'https://cdnjs.cloudflare.com/ajax/libs/linq.js/4.0.0/linq.min.js'
import { BibleConstantEs6Js } from './BibleConstants.es6.js'

let BibleConstantHelper = BibleConstantHelperEs6Js()
export { BibleConstantHelper,BibleConstantHelperEs6Js }

function BibleConstantHelperEs6Js() {
    let BibleConstant = BibleConstantEs6Js()
    /**
     * 提供許多 static function
     */
    function BibleConstantHelper() { }

    /** @type {Object.<string, number>} */
    BibleConstantHelper._mapName2Id
    BibleConstantHelper.getMapName2Id = () => {
        if (BibleConstantHelper._mapName2Id == undefined) {
            BibleConstantHelper._mapName2Id = generate()
        }
        return BibleConstantHelper._mapName2Id

        function generate() {
            let r1 = BibleConstant
            var r2 = [r1.CHINESE_BOOK_NAMES, 
                r1.CHINESE_BOOK_NAMES_GB, 
                r1.CHINESE_BOOK_ABBREVIATIONS, 
                r1.CHINESE_BOOK_ABBREVIATIONS_GB, 
                r1.ENGLISH_BOOK_ABBREVIATIONS, 
                r1.ENGLISH_BOOK_NAMES, 
                r1.ENGLISH_BOOK_SHORT_ABBREVIATIONS];

            /** @type {Object.<string, number>} */
            let r3 = {}
            Enumerable.from(r2).forEach(a2 => {
                Enumerable.from(a2).forEach((a1, i1) => {
                    r3[a1.toLowerCase()] = i1 + 1
                })
            })

            // 特殊中文字 / 別名
            var sp1 = [
                { id: 62, na: ['約壹', '约壹', '約翰壹書', '约翰壹书', '約翰一書', '约翰一书', '約一', '约一'] },
                { id: 63, na: ['約貳', '约贰', '約翰貳書', '约翰贰书', '約翰二書', '约翰二书', '約二', '约二'] },
                { id: 64, na: ['約參', '约参', '約翰參書', '约翰参书', '約翰三書', '约翰三书', '约三', '約三'] },
            ];
            Enumerable.from(sp1).forEach(a1 => {
                Enumerable.from(a1.na).forEach(a2 => {
                    r3[a2] = a1.id
                })
            })
            return r3
        }
    }

    /**
     * 取得 1-based 的 book id.
     * @param {string} name 若是英文，要小寫
     * @returns 若不存在，回傳-1
     */
    BibleConstantHelper.getBookId = (name) => {

        let r1 = BibleConstantHelper.getMapName2Id()
        let r2 = r1[name]
        return r2 ?? -1
    }


    /**
     * 緣由: 開發 splitReference 時要用到的
     * 4-7 
     * @param {number} book 
     * @param {number} chap 
     * @param {number} verse1 
     * @param {number} verse2 
     * @returns {DAddress[]}
     */
    BibleConstantHelper.generateAddressesTpE = (book, chap, verse1, verse2) => {
        if (verse2 > verse1) {
            return Enumerable.range(verse1, verse2 - verse1 + 1).select(v => ({ book: book, chap: chap, verse: v })).toArray()
        }
        return Enumerable.range(verse2, verse1 - verse2 + 1).select(v => ({ book: book, chap: chap, verse: v })).toArray()
    }
    /**
     * 緣由: 開發 splitReference 時要用到的
     * 2:3-end or 2:3-e
     * @param {number} book 
     * @param {number} chap 
     * @param {number} verse 
     * @returns {DAddress[]}
     */
    BibleConstantHelper.generateAddressesTpB = (book, chap, verse) => {
        const cnt = BibleConstant.COUNT_OF_VERSE[book - 1][chap - 1]
        return Enumerable.range(verse, cnt - verse + 1).select(i => ({ book: book, chap: chap, verse: i })).toArray()
    }

    /**
     * 緣由: 開發 splitReference 時要用到的
     * 約12，整章
     * @param {number}} book 
     * @param {number} chap 
     * @returns {DAddress[]}
     */
    BibleConstantHelper.generateAddressesTpF = (book, chap) => {
        const cnt = BibleConstant.COUNT_OF_VERSE[book - 1][chap - 1]
        return Enumerable.range(1, cnt).select(i => ({ book: book, chap: chap, verse: i })).toArray()
    }

    /**
     * 緣由: 開發 splitReference 時要用到的
     * 2:1-4:4
     * @param {number} book 
     * @param {number} chap1 
     * @param {number} verse1 
     * @param {number} chap2 
     * @param {number} verse2 
     */
    BibleConstantHelper.generateAddressesTpA = (book, chap1, verse1, chap2, verse2) => {
        let re1 = BibleConstantHelper.generateAddressesTpB(book, chap1, verse1)

        let re2 = []
        if (chap2 - chap1 > 1) {
            Enumerable.range(chap1 + 1, chap2 - chap1 - 1).forEach(ch => {
                re2.push.apply(re2, BibleConstantHelper.generateAddressesTpF(book, ch))
            })
        }

        let re3 = BibleConstantHelper.generateAddressesTpE(book, chap2, 1, verse2)
        return re1.concat(re2, re3)
    }

    /**
     * 緣由: 開發 cvtAddrsToRef 時作的。
     * @param {'羅'|'羅馬書'|'罗'|'罗马书'|'romans'|'rom'|'ro'} tp 
     * @returns {string[]}
     */
    BibleConstantHelper.getBookNameArrayWhereTp = (tp) => {
        if (tp == '羅') { return BibleConstant.CHINESE_BOOK_ABBREVIATIONS }
        else if (tp == '罗') { return BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB }
        else if (tp == '羅馬書') { return BibleConstant.CHINESE_BOOK_NAMES }
        else if (tp == '罗马书') { return BibleConstant.CHINESE_BOOK_NAMES_GB }
        else if (tp == 'romans') { return BibleConstant.ENGLISH_BOOK_NAMES }
        else if (tp == 'rom') { return BibleConstant.ENGLISH_BOOK_ABBREVIATIONS }
        else if (tp == 'ro') { return BibleConstant.ENGLISH_BOOK_SHORT_ABBREVIATIONS }
        return BibleConstant.CHINESE_BOOK_ABBREVIATIONS
    }

    /**
     * 取得 verses, 裡面沒有作任何保護, 因為覺得這是外面介面要作的.
     * @param {number} book 1-based, book id
     * @param {number} chap 1-based, chap
     * @returns {number}
     */
    BibleConstantHelper.getCountVerseOfChap = (book, chap) => {
        let r1 = BibleConstant.COUNT_OF_VERSE
        return r1[book - 1][chap - 1]
    }

    return BibleConstantHelper
}