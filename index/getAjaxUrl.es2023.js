import { BibleConstant } from "./BibleConstant.es2023.js";
import { isRDLocation } from "./isRDLocation.es2023.js"



export function getAjaxUrl(func, ps, idx) {
    var paramArr = ["engs", "chineses", "chap", "sec", "version",
        "strong", "gb", "book", "N", "k"];
        var urlParams = {
        sc: [0, 2, 3, 6, 7], // sc
        qb: [1, 2, 4, 5, 6], // qb: query bible
        qp: [0, 2, 3, 6], // qp: query parsing
        sd: [6, 8, 9], // cbol 字典 
        sbdag: [6, 8, 9], // 字典，浸宣，新約
        stwcbhdic: [6, 8, 9], // 字典，浸宣，舊約
    };

    if (isRDLocation() && func in ['sbdag','stwcbhdic']) {
        // api 限制，本地端測試時，回傳假資料
        func = "sd"
    }

    if (func == 'qb') {
        // add by snow. 2021.07
        var r1 = Enumerable.from(BibleConstant.ENGLISH_BOOK_ABBREVIATIONS).indexOf(ps.engs);
        var r2 = ps.gb == 1 ? BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB : BibleConstant.CHINESE_BOOK_ABBREVIATIONS;
        ps.chineses = r2[r1];
    }

    var getFullAjaxUrl = function (func, ps, idx) {
        var ret = fhl.urlJSON + func + ".php?";
        if (fhl.urlJSON === undefined) {
            ret = '/json/' + func + '.php?';
        }
        for (var i = 0; i < urlParams[func].length; i++) {
            var paramKey = paramArr[urlParams[func][i]];
            if (paramKey == "version") {
                ret += paramKey;
                ret += "=";
                ret += encodeURIComponent(ps[paramKey][idx]);
                ret += "&";
            } else {
                ret += paramKey;
                ret += "=";
                ret += encodeURIComponent(ps[paramKey]);
                ret += "&";
            }
        };

        ret = ret.substring(0, ret.length - 1);

        if (func == 'qb') {
            // 一定加上 strong=1 2025/2/11
            ret = ret.replace('strong=0', 'strong=1');
        }

        // console.log(ret); //https://bkbible.fhl.net/json/qp.php?engs=Rom&chap=16&sec=27&gb=0
        return ret;
    };

    return getFullAjaxUrl(func, ps, idx);
}

// (root => {
//     root.getAjaxUrl = getAjaxUrl
//     root.dev_stwcbhdic = dev_stwcbhdic
//     root.dev_sbdag = dev_sbdag
//     root.isLocalHost = isLocalHost
// })(this)

// function isLocalHost(){
//     return document.location.hostname === '127.0.0.1' || document.location.hostname === 'localhost';
// }
