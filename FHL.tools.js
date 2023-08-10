/// <reference path="ijnjs/SplitStringByRegex.js" />
/// <reference path="./FHL.BibleConstant.js" /> 
/// <reference path="FHL.linq.js" />
// BibleConstant 一定要先, 這裡會用到

var FHL =  FHL || {};

// if (FHL === undefined) {
//     FHL = {};
//     if (BibleConstant !== undefined) {
//         FHL.BibleConstant = BibleConstant;
//     }

/**
 * deep clone
 * @param {T} obj 
 * @returns {T}
 */
FHL.clone = function clone(obj) {
        if (obj === undefined) {
            return undefined;
        }

        if (Array.isArray(obj)) {
            var re = [];
            for (const it1 of obj) {
                re.push(clone(it1));
            }
            return re;
        } else if (typeof obj === 'object') {
            var re = {};
            for (const k1 in obj) {
                if (obj.hasOwnProperty(k1)) {
                    const it1 = obj[k1];
                    re[k1] = clone(it1);
                }
            }
            return re;
        } else {
            return obj;
        }
    }
    /**
     * 
     * reg 必需global 回傳 exec() 結果的 []
     * @param {RegExp} reg Reg若不是 global 會被自動設定為 global, 否則會無窮迴圈
     * @param {string} str 
     */
FHL.matchGlobalWithCapture = function matchGlobalWithCapture(reg, str) {
    if (reg.global === false) {
        reg.global = true;
    }

    var re = []; // const re: RegExpExecArray[] = [];
    var r1 = undefined; // let r1: RegExpExecArray;
    // tslint:disable-next-line: no-conditional-assignment
    while ((r1 = reg.exec(str)) !== null) {
        re.push(r1);
    }
    reg.lastIndex = -1; // 用完, 還原最初狀態
    return re;
};
/**
 * 
 * @param {string} str 
 * @param {RegExp} reg 若不是 global 會自動被設為 global, 否則會無窮迴圈
 * @returns {{w:string, exec?: RegExpExecArray}[]}
 */
FHL.SplitStringByRegex = function SplitStringByRegex(str, reg) {
    var r1 = this.matchGlobalWithCapture(reg, str);
    
    var data = []; //const data: { w: string; exec?: RegExpExecArray }[] = [];

    if (r1.length === 0) {
        data.push({
            w: str
        });
    } else {
        if (r1[0].index > 0) {
            var w = str.substr(0, r1[0].index);
            data.push({
                w
            });
        }

        for (let i = 0; i < r1.length; i++) {
            var it = r1[i];
            var len = it[0].length;
            data.push({
                w: it[0],
                exec: it
            });

            // tslint:disable-next-line: max-line-length
            var w = (i !== r1.length - 1) ? str.substr(it.index + len, r1[i + 1].index - it.index - len) : str.substr(it.index + len, str.length - it.index - len);
            if (w.length !== 0) {
                data.push({
                    w
                });
            }
        }
    }
    return data;
};

