declare namespace FHL {
    export class BibleVersionDialog {
        static s: BibleVersionDialog
        setCallbackClosed(cb: (jo: { selects: string[]; offens: string[]; sets: string[][] }) => void): void
        setCallbackOpened(cb: () => void): void
        open(args?: { selects?: string[]; offens?: string[]; sets?: string[][] }): void
        setVersionsFromApi(vers: { na: string; cna: string }[]): void
    }
    /**
     * NUI RWD 共用 切換書卷
     */
    export class BookChapDialog {
        static s: BookChapDialog
        setCBShowed(cb: () => void)
        setCBHided(cb: () => void)
        show(args: BookChapDialogArgs): void
        getArgs(): BookChapDialogArgs
        getResult(): { book: number; chap: number }
    }
    export interface BookChapDialogArgs {
        book: number
        chap: number
        isFullname: boolean
        isHebrewOrder: boolean
        isGb: boolean
    }
    export interface BookChapDialogDataG {
        /** '創', '出', '利', '民', '申'... */

        CHINESE_BOOK_ABBREVIATIONS: string[]
        getCHINESE_BOOK_ABBREVIATIONS_GB: string[]
        CHINESE_BOOK_NAMES: string[]
        getCHINESE_BOOK_NAMES_GB: string[]
        BOOK_WHERE_1CHAP: number[]
        getCountChapOfBook(book1based: number): number
    }

    export interface DAddress {
        book: number;
        chap: number;
        verse: number;
    }
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
    export function getNextAddress(addr: DAddress): DAddress | undefined
    /**
     * 任何一個 undefined 都會視為不相同
     * @param addr1 
     * @param addr2 
     */
    export function isTheSameAddress(addr1?: DAddress, addr2?: DAddress): boolean

    // export class BibleConstant {
    //     static s: BibleConstant
    //     /** '創', '出', '利', '民', '申'... */
    //     CHINESE_BOOK_ABBREVIATIONS: string[]
    //     /** @const {string[]} '创', '出', '利',... */
    //     CHINESE_BOOK_ABBREVIATIONS_GB: string[]
    //     /** @const {string[]} '創世記', '出埃及記', '利未記', ,... */
    //     CHINESE_BOOK_NAMES: string[]
    //     /** @const {string[]} '创世记', '出埃及记', '利未记',... */
    //     CHINESE_BOOK_NAMES_GB: string[]
    //     /** @const {string[]} 'Gen', 'Ex', 'Lev', 'Num'... */
    //     ENGLISH_BOOK_ABBREVIATIONS: string[]
    //     /** @const {string[]} 'Genesis', 'Exodus', 'Leviticus', ... */
    //     ENGLISH_BOOK_NAMES: string[]
    //     /** @const {string[]} 'Ge', 'Ex', 'Le',... */
    //     ENGLISH_BOOK_SHORT_ABBREVIATIONS: string[]
    //     /** @const {number[]} 50, 40, 27, 36, 34,... */
    //     COUNT_OF_CHAP: number[]
    //     /** @const {number[][]} 建議用 getCountVerseOfChap(book,chap), 例 太2節數 return COUNT_OF_VERSE[39][1] */
    //     COUNT_OF_VERSE: number[][]
    //     /** @const {string[]} 零', '一', '二'... */
    //     CHINESE_NUMBERS: string[]
    //     /**
    //      * http://www.hebrew.idv.tw/otconten.pdf 希伯來排序 ， 舊約
    //      * 用在書卷選取時
    //      */
    //     ORDER_OF_HEBREW: number[]
    // }

    namespace BibleConstant {
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
    }
}



export = FHL
export as namespace FHL