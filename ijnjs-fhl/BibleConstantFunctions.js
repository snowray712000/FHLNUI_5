/// <reference path="../jsdoc/jquery.js" />
/// <reference path="../jsdoc/jquery-ui.js" />
/// <reference path="../jsdoc/linq.d.ts" />
/// <reference path="../ijnjs/ijnjs.d.ts" />
/// <reference path="ijnjs-fhl.d.ts" />

(function (root) {
    // root 會是 FHL namespace
    Ijnjs.assert(root.name == 'FHL')
    FHL.getCountChapOfBook = getCountChapOfBook
    FHL.getCountVerseOfChap = getCountVerseOfChap
    FHL.getNextAddress = getNextAddress
    FHL.isTheSameAddress = isTheSameAddress

    return
    /**
     * 取得章的數目
     * @param {*} book1based 太，傳40。用1based非0based
     */
    function getCountChapOfBook(book1based) {
        if (book1based >= 1 && book1based <= 66) {
            return FHL.BibleConstant.s.COUNT_OF_CHAP[book1based - 1];
        } else {
            console.error('Error Book id, must 1~66, you are ' + book1based);
            throw new Error('Error Book id, must 1~66');
        }
    };
    /**
     * 取得章的數目
     * @param {*} book1based 太，傳40。用1based非0based
     * @param {*} chap1based 
     */
    function getCountVerseOfChap(book1based, chap1based) {
        var chaplimit = getCountChapOfBook(book1based);
        if (chap1based < 0 || chap1based > chaplimit) {
            console.error('book ' + book1based + ' chap ' + chap1based + ' only have ' + chaplimit + ' chap. you are ' + chap1based);
            throw new Error('book ' + book1based + ' chap ' + chap1based + ' only have ' + chaplimit + ' chap.');
        }
        return FHL.BibleConstant.s.COUNT_OF_VERSE[book1based - 1][chap1based - 1];
    };

    /**
     * 不會跨書卷，每書卷的最後一節，都會是回傳 undfined
     * 若是最後一節，回傳 undefined
     * @param {FHL.DAdress} addr
     * @returns {FHL.DAdress?}
     */
    function getNextAddress(addr) {
        if (addr === undefined) {
            console.error('get next address, you are ' + addr);
            return undefined;
        }

        function cv(c, v) {
            return { book: addr.book, chap: c, verse: v };
        }

        if (addr.book === 66 && addr.chap === 22 && addr.verse === 21) {
            return undefined;
        }

        var cntChap = getCountChapOfBook(addr.book);
        if (addr.chap === cntChap) {
            var cntVerse = getCountVerseOfChap(addr.book, cntChap);
            if (addr.verse === cntVerse) {
                return undefined;
            }
            return cv(addr.chap, addr.verse + 1);
        }

        var cntVerse = getCountVerseOfChap(addr.book, addr.chap);
        if (addr.verse === cntVerse) {
            return cv(addr.chap + 1, 1);
        }
        return cv(addr.chap, addr.verse + 1);
    };

    /**
     * 任何一個 undefined 都會視為不相同
     * @param {FHL.DAdress} addr1
     * @param {FHL.DAdress} addr2
     * @returns {boolean}
     */
    function isTheSameAddress(addr1, addr2) {
        if (addr1 === undefined || addr2 === undefined) {
            return false;
        }
        if (addr1.book !== addr2.book || addr1.chap !== addr2.chap || addr1.verse !== addr2.verse) {
            return false;
        }
        return true;
    };
})(this)