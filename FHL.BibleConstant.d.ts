export namespace FHL {
    export namespace BibleConstant {
        /** '創', '出', '利', '民', '申'... */
        export var CHINESE_BOOK_ABBREVIATIONS: string[]
        /** @const {string[]} '创', '出', '利',... */
        export var CHINESE_BOOK_ABBREVIATIONS_GB: string[]
        /** @const {string[]} '創世記', '出埃及記', '利未記', ,... */
        export var CHINESE_BOOK_NAMES: string[]
        /** @const {string[]} '创世记', '出埃及记', '利未记',... */
        export var CHINESE_BOOK_NAMES_GB: string[]
        /** @const {string[]} 'Gen', 'Ex', 'Lev', 'Num'... */
        export var ENGLISH_BOOK_ABBREVIATIONS: string[]
        /** @const {string[]} 'Genesis', 'Exodus', 'Leviticus', ... */
        export var ENGLISH_BOOK_NAMES: string[]
        /** @const {string[]} 'Ge', 'Ex', 'Le',... */
        export var ENGLISH_BOOK_SHORT_ABBREVIATIONS: string[]
        /** @const {number[]} 50, 40, 27, 36, 34,... */
        export var COUNT_OF_CHAP: number[]
        /** @const {number[][]} 建議用 getCountVerseOfChap(book,chap), 例 太2節數 return COUNT_OF_VERSE[39][1] */
        export var COUNT_OF_VERSE: number[][]
        /** @const {string[]} 零', '一', '二'... */
        export var CHINESE_NUMBERS: string[]

        /**
         * 取得章的數目
         * @param book1based 太，傳40。用1based非0based
         */
        export function getCountChapOfBook(book1based: number): number
        /**
         * 取得章的數目
         * @param book1based 太，傳40。用1based非0based
         * @param chap1based 
         */
        export function getCountVerseOfChap(book1based: number, chap1based: number): number
        /**
         * 不會跨書卷book，每書卷的最後一節，都會是回傳 undfined
         * 若是最後一節，回傳 undefined
         * @param addr         
         */
        export function getNextAddress(addr: { book: number, chap: number, verse: number }): { book: number, chap: number, verse: number }?
    }
}
