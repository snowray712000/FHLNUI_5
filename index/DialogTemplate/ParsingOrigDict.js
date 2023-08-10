/// <reference path="../../ijnjs/ijnjs.d.ts" />
/// <reference path="../../FHL.BibleConstant.js" />
/// <reference path="../../FHL.tools.js" />
var FHL = window.FHL || {};
(function(root){
    root.exports = {
        addBreakLine,
        addOrigDict,
        addReference
    }
    return
/**
 * 將換行符號加入，繪圖時就是用br加入。通常是第一步驟。
 * @param {{w:string,sn?:string,isOld?:0|1,br?:1}[]} data 
 * @returns {{w:string,sn?:string,isOld?:0|1,br?:1,ref?:string,book?:number,chap?:number}[]}
 */
 function addBreakLine(data) {

    var re2 = [];
    for (const it1 of data) {
        var r2 = new Ijnjs.SplitStringByRegex().main(it1.w, /\r?\n/g)
        // var r2 = FHL.SplitStringByRegex(it1.w, /\r?\n/g);
        for (const it2 of r2) {
            var r3 = FHL.clone(it1);
            if (it2.exec === undefined) {
                r3.w = it2.w;
                re2.push(r3);
            } else {
                r3.w = '';
                r3.br = 1;
                re2.push(r3); // br: break line
            }
        }
    }
    return re2;
}
/**
 * 將 G142 或 H142 或 G142a 轉出
 * @param {{w:string,sn?:string,isOld?:0|1,br?:1}[]} data 
 * @returns {{w:string,sn?:string,isOld?:0|1,br?:1,ref?:string,book?:number,chap?:number}[]}
 */
function addOrigDict(data) {
    var re2 = [];
    for (const it1 of data) {
        var r2 = new Ijnjs.SplitStringByRegex().main(it1.w, /(G|H)(\d+[a-z]?)/gi)
        // var r2 = FHL.SplitStringByRegex(it1.w, /(G|H)(\d+[a-z]?)/gi);
        for (const it2 of r2) {
            if (it2.exec === undefined) {
                var r2 = FHL.clone(it1);
                r2.w = it2.w;
                re2.push(r2);
            } else {
                var r2 = FHL.clone(it1);
                r2.w = it2.exec[0];
                r2.sn = it2.exec[2];
                r2.isOld = /H/i.test(it2.exec[1]);
                re2.push(r2);
            }
        }
    }
    return re2;
}



/**
 * 將 #太1:2,5,7;2:1-3:2;5;6:1-4;7:21| 或 太1:2,5,7; 或 1:2,5,7;
 * @param {{w:string,sn?:string,isOld?:0|1}[]} data 
 * @returns {{w:string,sn?:string,isOld?:0|1,br?:1,ref?:string,book?:number,chap?:number}[]}
 */
function addReference(data, book = 40, chap = 1) {
    var re2 = [];
    for (const it1 of data) {
        var reg = getRegExpForReference2();
        var r2 = new Ijnjs.SplitStringByRegex().main(it1.w, reg)
        // var r2 = FHL.SplitStringByRegex(it1.w, reg);
        for (const it2 of r2) {
            if (it2.exec === undefined) {
                var r2 = FHL.clone(it1);
                r2.w = it2.w;
                re2.push(r2);
            } else {
                var last = FHL.linq_last(re2);
                if (last !== undefined && last.ref !== undefined) {
                    last.w += it2.exec[0];
                    last.ref += it2.exec[1] + it2.exec[2];
                } else {
                    var r2 = FHL.clone(it1);
                    r2.w = it2.exec[0];
                    r2.ref = it2.exec[1] + it2.exec[2];
                    r2.book = book;
                    r2.chap = chap;
                    re2.push(r2); // ref: reference
                }
            }
        }
    }

    return re2;

    /**
     * 只回傳中文型態, 因為要給 原文字典用的 AddReference 
     * @returns {string[]}
     */
    function getAllBookNamesAndOrderByLengthDesc() {
        var r1 = new BibleConstant();
        var na = r1.CHINESE_BOOK_ABBREVIATIONS;
        na = na.concat(r1.CHINESE_BOOK_ABBREVIATIONS_GB);
        na = na.concat(r1.CHINESE_BOOK_NAMES);
        na = na.concat(r1.CHINESE_BOOK_NAMES_GB);
        // na = na.concat(r1.ENGLISH_BOOK_NAMES); // Genesis
        // na = na.concat(r1.ENGLISH_BOOK_ABBREVIATIONS); //Gen
        // na = na.concat(r1.ENGLISH_BOOK_SHORT_ABBREVIATIONS);  // Ge
        return na.sort(function (a1, a2) {
            if (a1.length > a2.length)
                return -1;
            else if (a1.length < a2.length)
                return 1;
            return 0;
        });
    }
    function getRegExpForReference2() {
        // #太1 一定是                
        // 太1 略#號
        // #2: or #2; 可能是(略卷名) ... #2:1-3:1 #2:1 #2;
        // // 3: 可能是 ... 3:1  (暫不使用)
        var books = getAllBookNamesAndOrderByLengthDesc();

        var r1a = '#?(?:' + books.join('|') + ')[ 　]*\\d+';
        var r2a = '#\\d+[:; 　]';
        var ra = '(' + r1a + '|' + r2a + ')' // '(?:r1a|r2a)'

        var r3b = '([\\-,;:\\d ；：　]+)\\|?';
        var re = new RegExp(ra + r3b, 'gi');
        return re;
    }
}
})(this)
