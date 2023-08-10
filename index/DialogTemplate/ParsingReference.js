/// <reference path="../../FHL.tools.js" />

var FHL = window.FHL || {};
if (FHL === undefined) {
    FHL = {};
}
(function(root){
    
    testThenDoAsync(()=> window.FHL != undefined)
    .then(()=>{
        appendFunctionsToFHLNamespace()
        root.nouse = undefined
    })
    return

    function appendFunctionsToFHLNamespace(){
/**
 * 
 * @param {{book:number,chap:number,verse:number}[]} addresses 
 * @returns {string} 丟給 qsb.php 參數用的
 */
 FHL.ParsingAddressesToReferenceLink = function (addresses) {
    if (addresses === undefined || addresses.length === 0) {
        console.warn('ParsingAddressesToReferenceLink empty address.');
        return undefined;
    }
    var re = groupTheContinued();
    var re2 = groupByBook(re);
    return re2.map(generateString).join(';');

    /**
     * @param {{book,chap,verse}[][]} data
     * @returns {string}
     */
    function generateString(data) {
        // 2:2,3 不要變 2:2-3, 3個以上才變 2:2-3
        // 換章就用 ; 
        // 太2:2;2:5-7 應該要是 太2:2,5-7
        // 太2:2;2:5-3:1 應該要是 太2:2,5-3:7
        // 太2:2;3:5-10 應該是要 太2:2;5:5-10 或 太2:5,5:5-10 (採用這個)
        // 2:2,5,10 
        // 2:2,5,10,13-15,17
        var naBook = new BibleConstant().CHINESE_BOOK_ABBREVIATIONS[data[0][0].book - 1];

        var re = '';
        var chap = undefined;
        for (var it1 of data) {
            var r1 = getFirstLast();
            if (it1.length === 1) {
                if (chap !== r1[0].chap) {
                    re += ';' + addrStr(r1[0]);
                    chap = r1[0].chap;
                } else {
                    re += ',' + r1[0].verse;
                }
            } else if (isFirstLastTheSameChap()) {
                if (isFirstChapIsCurrentChap()) {
                    // 2:3,5-7    
                    if (isArray2Element()) {
                        re += ',' + it1.map(function (addr) { return addr.verse }).join(',');
                    } else {
                        re += ',' + r1[0].verse + '-' + r1[1].verse;
                    }
                } else {
                    if (isArray2Element()) {
                        re += ';' + r1[0].chap + ':' + it1.map(function (addr) { return addr.verse }).join(',');
                    } else {
                        // 2:3;3:5-7 或 2:3;3 (整章)
                        if (isEntireChap(r1[0], r1[1])) {
                            re += ';' + r1[0].chap;
                        } else {
                            re += ';' + addrStr(r1[0]) + '-' + r1[1].verse;
                        }
                    }
                    chap = r1[1].chap;
                }
            } else {
                if (isFirstChapIsCurrentChap()) {
                    if (isArray2Element()) {
                        re += ';' + addrStr(r1[0]) + ';' + addrStr(r1[1]);
                    } else {
                        // 2:3,2:5-3:7 => 2:3;2:5-3:7
                        re += ';' + addrStr(r1[0]) + '-' + addrStr(r1[1]);
                    }
                    chap = r1[1].chap;
                } else {
                    if (isArray2Element()) {
                        // 2:3,3:21-4:1 => 2:3;3:21;4:1
                        re += ';' + addrStr(r1[0]) + ';' + addrStr(r1[1]);
                    } else {
                        // 2:3,3:5-4:7 => 2:3,3:5-4:7
                        re += ';' + addrStr(r1[0]) + '-' + addrStr(r1[1]);
                    }
                    chap = r1[1].chap;
                }
            }

            // end for it1
            /**
             * 
             * @param {{chap,verse}} a1 
             * @param {{chap,verse}} a2 
             */
            function isEntireChap(a1, a2) {
                if (a1.book !== a2.book || a1.chap !== a2.chap || a1.verse !== 1) {
                    return false;
                }
                var cntVerse = FHL.getCountVerseOfChap(a1.book, a1.chap);
                if (cntVerse === a2.verse) {
                    console.log('is entire');

                    return true;
                }
                return false;
            }
            /**
             * '3:5' or '5'
             * @param {{chap,verse}} addr 
             * @param {boolean} isC
             */
            function addrStr(addr, isC = true) {
                if (isC) {
                    return addr.chap + ':' + addr.verse;
                }
                return addr.verse;
            }
            /** @returns {{book,chap,verse}[]}*/
            function getFirstLast() {
                var re2 = [];
                re2.push(FHL.linq_first(it1, undefined));
                re2.push(FHL.linq_last(it1, undefined));
                return re2;
            }

            function isFirstLastTheSameChap() {
                var r1 = FHL.linq_first(it1);
                var r2 = FHL.linq_last(it1);
                return r1.chap === r2.chap;
            }

            function isArray2Element() {
                return it1.length === 2;
            }

            function isFirstChapIsCurrentChap() {
                var r1 = FHL.linq_first(it1);
                return r1.chap === chap;
            }
        } // end for it1
        return naBook + re.substr(1, re.length - 1); // 太,2:3,5-7 第一個,不用
    }

    /**
     * 用書卷隔開。
     * 不該是 太2:3;太2:5-7 應該是 太2:3;2:5-7
     * @returns {{{book:number,chap:number,verse:number}[][][]}
     */
    function groupByBook(re) {
        var re2 = [];
        var re3 = [];
        var book = undefined;
        for (const it1 of re) {
            if (book === undefined) {
                re2.push(it1);
                book = it1[0].book;
            } else if (book === it1[0].book) {
                re2.push(it1);
            } else {
                re3.push(re2);
                re2 = [];
                re2.push(it1);
                book = it1[0].book;
            }
        }
        if (re2.length !== 0) {
            re3.push(re2);
        }
        return re3;
    }

    /**
     * 將連續的放在一起 []
     * @returns {{book:number,chap:number,verse:number}[][]}
     */
    function groupTheContinued() {
        var re = []
        var re1 = [];
        /** @types {book:number,chap:number,verse:number} */
        var last = undefined;
        for (let i = 0; i < addresses.length; i++) {
            const addr = addresses[i];
            if (last === undefined) {
                last = addr;
                re1.push(last);
            } else if (isContinue(last, addr)) {
                last = addr;
                re1.push(last);
            } else {
                re.push(re1);
                re1 = [];
                re1.push(addr);
                last = addr;
            }
        }
        if (re1.length !== 0) {
            re.push(re1);
        }
        return re;

        function isContinue(last, cur) {
            var addrNext = FHL.getNextAddress(last);
            var r1 = FHL.isTheSameAddress(addrNext, cur);
            return r1;
        }
    }
};


/**
 * 
 * @param {string} ref 
 * @param {number} book 預設書卷，通常是用在注釋。
 * @param {number} book 預設chap，通常是用在注釋。
 * @returns {{book:number,chap:number,verse:number}[]}
 */
FHL.ParsingReferenceToAddresses = function (ref, book = 40, chap = 1) {
    // 太1:2,4,6;2:1-3

    // 全型取代，句點取代 (因為分號不能作為網址)
    // 先分離，每卷書，
    // 假設分離完了每卷書，再分離分號
    // 若有 -end 或 -e 自動產生尾節
    
    ref = fixChars(ref);
    re1 = splitByBook(ref);
    var re2 = [];
    for (var it1 of re1) {
        var re3 = parsingOneBook(it1, book, chap);
        for (const it2 of re3) {
            re2.push(it2);
        }
    }
    return re2;

    /**
     * 全型、特殊字元取代。
     * @param {string} str 
     */
    function fixChars(str) {
        str = str.replace(/[.；]/g, ';');
        str = str.replace(/：/g, ':');
        return str;
    }
    /**
     * 以書卷分開，不是以分號分開。
     * @param {string} str 
     * @returns {{ref:string,book?:string}[]}
     */
    function splitByBook(str) {
        var reg = new RegExp(new BibleBookNames().arrayNamesOrderByLength.join('|'), 'gi');
        var r1 = FHL.SplitStringByRegex(str, reg);

        var re = [];
        var isBook = false;
        var r2 = {};
        for (let i = 0; i < r1.length; i++) {
            const it1 = r1[i];
            if (i === 0) {
                isBook = it1.exec !== undefined;
            }

            if (isBook) {
                r2.book = it1.w;
            } else {
                r2.ref = it1.w;
                re.push(r2);
                r2 = {}; // reset
            }

            isBook = !isBook;
        }
        return re;
    }
    /**
     * 單一書卷總流程。
     * @param {{ref:string,book?:string}} ref 
     * @param {number?} bookDef 
     * @param {number?} chapDef 
     * @returns {{book:number,chap:number,verse:number}[]}
     */
    function parsingOneBook(ref, bookDef, chapDef) {
        // 1:1,2,5
        // 1:1-3:2
        // 1:2,5-7,9-3:2
        // 2
        // 1:20-e
        // 1:20-end
        // 1:20-3:end
        var book = new BibleBookNames().getIdFromName(ref.book);
        if (book === undefined) {
            book = bookDef;
        }

        var r1 = splitBySemi(ref.ref);
        var r2 = r1.map(function (a1) { return parsing(a1); });
        const re = [];
        for (var it2 of r2) {
            for (const it3 of it2) {
                re.push(it3);
            }
        }
        return re;

        /**
         * 用;隔開
         * @param {string} ref 
         * @returns {string[]} 例 ['1:2-3','2:3-end','3','4:1']
         */
        function splitBySemi(ref) {
            var r1 = FHL.SplitStringByRegex(ref, /;/g);
            return r1.filter(a1 => a1.exec === undefined).map(a1 => a1.w);
        }

        /**
         * 前面已經分開每個;了。
         * 裡面只有 end , - 三種要處理
         * @param {string} ref 
         */
        function parsing(ref) {
            // 前面已經分開每個;了。
            // 裡面只有 end , - 三種要處理
            // 若有 ; 是 end 產出的
            ref = cvtEnd(ref);

            // reg 是 4 種，前後順序重要
            // 1:2-4:3 再來 1:2-5 再來 2-3:5 再來 2-5 再來 1: 再來 3,4,5,9
            const re = [];
            var r1 = FHL.SplitStringByRegex(ref, /(\d+):(\d+)-(\d+):(\d+)|(\d+):(\d+)-(\d+)|(\d+)-(\d+):(\d+)|(\d+)-(\d+)|(\d+):/g);
            var chap = undefined;

            function pushV(v) {
                re.push({ book: book, chap: chap, verse: v });
            }

            /** 不只push到re中, chap也會變 */
            function pushC(c) {
                var cnt = FHL.getCountVerseOfChap(book, c);
                chap = c;
                FHL.linq_range(1, cnt).forEach(pushV);
            }
            for (const it1 of r1) {
                if (it1.exec === undefined) {
                    // 3,4,5,78,34 ... 可能來自 3:3,4,5,78,32 也可能來自 ;3; 第3章
                    var r2 = FHL.matchGlobalWithCapture(/\d+/g, it1.w);
                    for (const it2 of r2) {
                        if (chap !== undefined) {
                            pushV(parseInt(it2[0]));
                        } else {
                            pushC(parseInt(it2[0]));
                        }
                    }
                } else {
                    if (it1.exec[13] !== undefined) {
                        // 3:
                        chap = parseInt(it1.exec[13]);
                    } else if (it1.exec[11] !== undefined) {
                        // 5-7
                        if (chap === undefined) {
                            // 5-7 章
                            var c1 = parseInt(it1.exec[11]);
                            var c2 = parseInt(it1.exec[12]);
                            FHL.linq_range(c1, c2 - c1 + 1).forEach(pushC);

                        } else {
                            var v1 = parseInt(it1.exec[11]);
                            var v2 = parseInt(it1.exec[12]);
                            FHL.linq_range(v1, v2 - v1 + 1).forEach(pushV);
                        }
                    } else if (it1.exec[8] !== undefined) {
                        // 3-3:5, (這可能是來自 1:1,3-3:5)
                        if (chap === undefined) {
                            console.error('此 case 不該還沒有章, 此case異常 ' + ref + ' 先設為1');
                            chap = 1;
                        }
                        var v1 = parseInt(it1.exec[8]);
                        var c2 = parseInt(it1.exec[9]);
                        var v2 = parseInt(it1.exec[10]);
                        if (chap === c2) {
                            // 不太可能是這種，但還是合規畫
                            FHL.linq_range(v1, v2 - v1 + 1).forEach(pushV);
                        } else {
                            var cnt = FHL.getCountVerseOfChap(book, chap);
                            FHL.linq_range(v1, cnt - v1 + 1).forEach(pushV);

                            if (chap + 1 !== c2) {
                                // 1:2-3:7 這種中間有整章的
                                FHL.linq_range(chap + 1, c2 - 1 - (chap + 1) + 1).forEach(pushC);
                            }

                            chap = c2;
                            FHL.linq_range(1, v2 - 1 + 1).forEach(pushV);
                        }
                    } else if (it1.exec[5] !== undefined) {
                        // 3:5-7
                        var c = parseInt(it1.exec[5]);
                        chap = c;
                        var v1 = parseInt(it1.exec[6]);
                        var v2 = parseInt(it1.exec[7]);
                        FHL.linq_range(v1, v2 - v1 + 1).forEach(pushV);
                    } else if (it1.exec[1] !== undefined) {
                        var c1 = parseInt(it1.exec[1]);
                        var v1 = parseInt(it1.exec[2]);
                        var c2 = parseInt(it1.exec[3]);
                        var v2 = parseInt(it1.exec[4]);
                        if (c2 < c1) {
                            // 交換
                            var cc = c1;
                            c1 = c2;
                            c2 = cc;
                            cc = v1;
                            v1 = v2;
                            v2 = cc;
                        }
                        if (c2 === c1) {
                            if (v1 > v2) {
                                var cc = v1;
                                v1 = v2;
                                v2 = cc;
                            }
                            chap = c1;
                            FHL.linq_range(v1, v2 - v1 + 1).forEach(pushV);
                        } else {
                            var cnt = FHL.getCountVerseOfChap(book, c1);
                            chap = c1;
                            FHL.linq_range(v1, cnt - v1 + 1).forEach(pushV);

                            if (c1 + 1 !== c2) {
                                FHL.linq_range(c1 + 1, c2 - 1 - (c1 + 1) + 1).forEach(pushC);
                            }

                            chap = c2;
                            FHL.linq_range(1, v2).forEach(pushV);
                        }
                    } else {
                        console.warn('不曾想到的Case ');
                        console.warn(it1);
                    }
                }
            }
            return re;

            /**
             * 若有 end 字樣，在此處理，將其換為節；若沒有，就回傳原值
             * -end -e :end :e 四個
             * @param {string} ref 
             */
            function cvtEnd(ref) {
                var r1 = FHL.matchGlobalWithCapture(/(\d+:\d+-(\d+):)(?:end|e)|((\d+):\d+-)(?:end|e)/gi, ref);
                if (r1.length === 0) {
                    return ref;
                } else {
                    return r1.map(replaceEachEndString).join(';');
                }

                /**
                 * 將 -end 的 end 字，換成這章的節數。有兩大類。
                 * 1:2-end 與 1:2-3:end  
                 * 取得全域變數 book               
                 * @param {RegExpExecArray} a1 
                 */
                function replaceEachEndString(a1) {
                    if (a1[3] !== undefined) {
                        // 3:3-end 這類
                        var chap = parseInt(a1[4]);
                        var verse = FHL.getCountVerseOfChap(book, chap);
                        return a1[3] + verse; // 3:3-21
                    } else if (a1[1] !== undefined) {
                        // 3:3-5:end 這類
                        var chap = parseInt(a1[2]);
                        var verse = FHL.getCountVerseOfChap(book, chap);
                        return a1[1] + verse;
                    } else {
                        console.error('cvt -end error, type ' + a1);
                        throw new Error(a1);
                    }
                }

            }
        }
    }
};    
    }


})(this)
