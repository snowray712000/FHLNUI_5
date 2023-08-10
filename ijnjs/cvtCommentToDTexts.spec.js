/// <reference path="./DText.d.ts" />
/// <reference path="./../libs/jsdoc/linq.d.ts" />
/// <reference path="./../libs/jsdoc/qunit.d.ts" />

import Enumerable from "../libs/jsdoc/linq.js"
// import Enumerable from 'https://cdnjs.cloudflare.com/ajax/libs/linq.js/4.0.0/linq.min.js'

/** @interface */
function DCommentStep() {
    /** @type {number} 空白的個數 */
    this.space = 0
    /** @type {string} 若這串文字有「類似」list item 的字眼。取出來的字眼 */
    this.tp = ''
    /** @type {number} 若這串文字有「類似」list item 的字眼。目前分類是0-5, -1 表示沒有這個字眼*/
    this.tpIdx = -1
    /** @type {number} 在原本內容中，是第幾行(合併過程要用到這個值)*/
    this.idx = 0
    /** @type {string} 原本的字串，包含前面的空白*/
    this.w = ''
}
/** @interface */
function DDataSpace() {
    /** @type {string|null} */
    this.w = ''
    /** @type {number|null} */
    this.space = 0
    /** @type {number|null} */
    this.tpIdx = 0
    /** @type {1|null} */
    this.isBr = 1
}
/** @interface */
function DListAdd() {
    /** @type {number[]|null}*/
    this.list = []
    /** @type {DText} */
    this.data = {};
}

/**
 * @param {string} str 
 * @returns { space: number; tp: string; tpIdx: -1|0|1|2|3|4|5; }
 */
function commentExtractListItem(str) {
    // 源於 NUIRWD 專案，原本是 getSpaceAndItem

    // const tps = ['壹、', '一、', '（一）', '1.', '(1)', '●']; // 目前沒用到
    // tslint:disable-next-line: max-line-length
    const rr1 = /^(\s*)(?:([零壹貳參肆伍陸柒捌玖拾]+、)|([一二三四五六七八九十百]+、)|(（[零一二三四五六七八九十百]+）)|(\d+.)|(\(\d+\))|(「?[●◎⓪☆○※]|\/\*\*|\*\*\*))?/gi.exec(str);
    if (rr1 == null) {
        console.warn('impossible');
    }

    const rrr2 = Enumerable.range(2, 6).firstOrDefault(aa1 => rr1[aa1] !== undefined);
    if (rrr2 == null) {
        return { space: rr1[1].length, tp: '', tpIdx: -1 };
    }
    return { space: rr1[1].length, tp: rr1[rrr2], tpIdx: rrr2 - 2 };
}

/**
 * 開發 注釋 的 AddOrderAndList 時, 會用到 開發尋搜的功能,
 * 所以要將資料轉成 addListStartAndEnd() 能用的
 *
 * 沒有●, 沒層級, 當時是用 [] 作為 list
 * 第1層, 是用 [1], 不是 0based,
 * @param {DDataSpace[]} datas
 * @return {DListAdd[]}
 */
export function prepareDataForAddOrderAndListAtComment(datas) {
    const isDebug = false;
    // 演算法，可看 unit test 了解
    const datasClone = [...datas]; // 不要破壞原本的內容, clone一份
    if (isDebug) {
        console.log('prepareDataForAddOrderAndListAtComment()');
        console.log([...datas]);
    }
    const reHeadAndTail = splitHeadAndBodyAndTail(datasClone);
    // console.log(reHeadAndTail);
    if (reHeadAndTail[0].length === 0 && reHeadAndTail[2].length === 0) {
        return core();
    } else {
        const r4b = prepareDataForAddOrderAndListAtComment(reHeadAndTail[1]);
        const r4a = LQ.from(reHeadAndTail[0]).select(a1 => cvtHeadOrBody(a1));
        const r4c = LQ.from(reHeadAndTail[2]).select(a1 => cvtHeadOrBody(a1));
        const r4 = r4a.concat(r4b).concat(r4c).toArray();
        return r4;
    }
    return [];
    function core() {
        // tslint:disable-next-line: no-string-literal
        LQ.from(datasClone).forEach((a1, i1) => a1['idx'] = i1);
        setBrSpace();
        const idxInit = LQ.range(0, datasClone.length).toArray();
        const idxListData = getFitMinSpaceAndRecursiveChildren(datasClone, idxInit);
        if (isDebug) {
            console.log(JSON.stringify(idxListData));
        }

        // console.log(idxListOther);
        const r4b = cvtToDListAdd(idxListData, datasClone);
        if (isDebug) {
            console.log(r4b);
        }
        return r4b;
        function setBrSpace() {
            LQ.from(datasClone).forEach((a1, i1) => {
                if (a1.isBr === 1) {
                    a1.space = datasClone[i1 - 1].space;
                }
            });
        }
    }
}
/**
 * 
 * @param {DCommentStep[]|{idx:number;isBr:1}} data 
 */
function commentMergeLines(data) {
    const min = getMinSpaceItem();
    const rr1 = newLineNewLineSplit(data);
    const rr2 = rr1.map(a1 => doEachGroup(a1, min));
    // console.log(rr2)
    /** @type {{ w?: string; space?: number; tpIdx?: number; }[]} */
    const rr3 = newLineNewLineMerge(rr2)
    return rr3;

    /**
     * 
     * @param {DText[]} arg2 
     * @param {number} minSpace 
     * @returns {DText[]}
     */
    // const rr2 = rr1.map(doEachGroup);
    // return newLineNewLineMerge(rr2);
    function doEachGroup(arg2, minSpace) {
        const arg3 = arg2;
        const re = mergeTextAtCommentText(arg3, minSpace);
        return re;
    }

    /**
     * 例如創1:3 其實是接著1:1-2 的注解，但原始資料是同一份(只是被切開)，所以空白數量，還是繼承之前的
     * 所以空白數最小可能是 6 (舉例)
     * @returns 
     */
    function getMinSpaceItem() {
        const rrr1 = Enumerable.from(data).where(a1 => a1.tpIdx !== undefined).select(a1 => a1.space);
        if (rrr1.isEmpty()) {
            return 0;
        }
        return rrr1.min();
    }
}
/**
 * 為了 commentMergeLines 存在
 * 源自 rwd 專案
 * @param {DText[]} dataRef 
 * @returns {DText[][]}
 */
function newLineNewLineSplit(dataRef) {
    const LQ = Enumerable
    /** @type {DText[][]} */
    const re = [];
    const dataClone = [...dataRef];
    // console.log(JSON.stringify(dataClone))

    // console.log("while loop 開始.")
    while (true) {
        const r1 = LQ.from(dataClone).takeWhile(a1 => a1.isBr == 1).toArray();
        // console.log("要刪除換行 isBr")
        // console.log(JSON.stringify(r1))

        // console.log("刪除後 isBr")
        if (r1.length !== 0) { dataClone.splice(0, r1.length); }
        // console.log(JSON.stringify(dataClone))

        // console.log("要取出 資料，直到不是Br")
        const r2 = LQ.from(dataClone).takeWhile((a1, i1) => {
            // this and next next is br
            const rr2 = dataClone[i1 + 1];

            if (a1 === undefined || rr2 === undefined) {
                return true;
            }
            if (a1.isBr != 1 || rr2.isBr != 1) { // 連續的換行
                return true;
            }
            return false;
        }).toArray();
        // console.log(JSON.stringify(r2))

        if (r2.length !== 0) {
            dataClone.splice(0, r2.length);
            re.push(r2);
            // 在群組內.
            // console.log(JSON.stringify(re))
        } else {
            break;
        }
    }
    return re;
}
/**
 * 為了 commentMergeLines 存在
 * 源自 rwd 專案
 * @param {DText[][]} datas 
 * @returns {DText[]}
 */
function newLineNewLineMerge(datas) {
    const ree = [];
    for (const it1 of datas) {
        for (const it2 of it1) {
            ree.push(it2);
        }
        ree.push({ isBr: 1 });
        ree.push({ isBr: 1 });
    }
    return ree;
}
/**
 * 為了 commentMergeLines 存在 ，源自 rwd 專案
 * 開發 注釋, 其中的 Add Order And List過程, 要合併文字時用
 * @param {DTextWithSpaceAndItemInfo[]} datas
 * @param {number} minSpace
 */
function mergeTextAtCommentText(datas, minSpace) {
    if (minSpace == undefined) { minSpace = 0 }
    const LQ = Enumerable

    makeSureIdxExist();
    // 反向, 找到需要合併的 w, 找到要合併到哪列 rrr2, 合併且移除掉合併與被合併中間的東西(應該是換行 isBr)

    // 原作法危險, 在 forEach 過程去 remove 這個 list, 會錯亂. 所以「記下idx」, 完成後再 remove 掉就好.
    /**@type {number[]} */
    const idxRemove = [];

    LQ.from(datas).where(a1 => a1.w !== undefined && a1.tpIdx === undefined
        && a1.space >= minSpace && a1.space !== 0)
        .reverse().forEach(a1 => {
            // tslint:disable-next-line: max-line-length
            const rrr2 = getBeMergedLine(a1);
            if (rrr2 !== undefined) {
                rrr2.w += a1.w.trim();
                idxRemove.push(...LQ.range(rrr2.idx + 1, a1.idx - rrr2.idx).toArray());
            }
        });

    const rr1 = LQ.from(idxRemove);
    datas = LQ.from(datas).where(a1 => rr1.contains(a1.idx) === false).toArray();

    // tslint:disable-next-line: no-string-literal
    LQ.from(datas).forEach(a1 => delete a1['idx']);
    return datas;
    /**
     * 
     * @param {DTextWithSpaceAndItemInfo} aaa1 
     * @returns 
     */
    function getBeMergedLine(aaa1) {
        return LQ.from(datas).lastOrDefault(aa1 => aa1.w !== undefined && aa1.idx < aaa1.idx
            && aa1.tp !== '***' && aa1.tp !== '/**');
    }

    function makeSureIdxExist() {
        // tslint:disable-next-line: no-string-literal
        if (LQ.from(datas).any(a1 => a1['idx'] === undefined)) {
            // tslint:disable-next-line: no-string-literal
            LQ.from(datas).forEach((a1, i1) => a1['idx'] = i1);
        }
    }
}
QUnit.test("commentExtractListItemTests", assert => {
    assert.deepEqual({ space: 0, tp: '壹、', tpIdx: 0 }, commentExtractListItem(`壹、人類的來源 #1:1-11:32|`));
    assert.deepEqual({ space: 2, tp: '壹、', tpIdx: 0 }, commentExtractListItem(`  壹、人類的來源 #1:1-11:32|`));
    assert.deepEqual({ space: 0, tp: '一、', tpIdx: 1 }, commentExtractListItem(`一、人類被造 #創 1:1-2:25|`));
    assert.deepEqual({ space: 2, tp: '一、', tpIdx: 1 }, commentExtractListItem(`  一、人類被造 #創 1:1-2:25|`));
    assert.deepEqual({ space: 0, tp: '（一）', tpIdx: 2 }, commentExtractListItem(`（一）上帝創造宇宙 #1:1-2:3|`));
    assert.deepEqual({ space: 0, tp: '12.', tpIdx: 3 }, commentExtractListItem(`12.序言 #1:1-2|`));
    assert.deepEqual({ space: 0, tp: '(1)', tpIdx: 4 }, commentExtractListItem(`(1).序言 #1:1-2|`));
    assert.deepEqual({ space: 0, tp: '●', tpIdx: 5 }, commentExtractListItem(`●#1:1|僅有七個字，Strong number分別是：`));
    assert.deepEqual({ space: 0, tp: '', tpIdx: -1 }, commentExtractListItem(`人類的來源 #1:1-11:32|`));
    assert.deepEqual({ space: 7, tp: '', tpIdx: -1 }, commentExtractListItem(`       人類的來源 #1:1-11:32|`));
});

QUnit.test("commentMergeLinesTests", assert => {
    assert.deepEqual(
        commentMergeLines([
            { idx: 0, w: `●「起初」：主要的意思是指一連串事物的「首先」、「第一」。傳`, space: 0, tp: '●', tpIdx: 5 },
            { idx: 1, isBr: 1 },
            { idx: 2, w: `        統上這個字被譯為「起初」或「太初」，但也有一些人`, space: 8, tp: '', tpIdx: -1 },
        ]), [
        { idx: 0, w: `●「起初」：主要的意思是指一連串事物的「首先」、「第一」。傳統上這個字被譯為「起初」或「太初」，但也有一些人`, space: 0, tp: '●', tpIdx: 5 },
    ])

    assert.deepEqual(
        commentMergeLines([
            { idx: 0, w: `●「起初」：主要的意思是指一連串事物的「首先」、「第一」。傳`, space: 0, tp: '●', tpIdx: 5 },
            { idx: 1, isBr: 1 },
            { idx: 2, w: `        統上這個字被譯為「起初」或「太初」，但也有一些人`, space: 8, tp: '', tpIdx: -1 },
            { idx: 3, isBr: 1 },
            { idx: 4, w: `●「起初」：主要的意思是指一連串事物的「首先」、「第一」。傳`, space: 0, tp: '●', tpIdx: 5 },
            { idx: 5, isBr: 1 },
            { idx: 6, w: `        統上這個字被譯為「起初」或「太初」，但也有一些人`, space: 8, tp: '', tpIdx: -1 },
        ]), [
        { idx: 0, w: `●「起初」：主要的意思是指一連串事物的「首先」、「第一」。傳統上這個字被譯為「起初」或「太初」，但也有一些人`, space: 0, tp: '●', tpIdx: 5 },
        { idx: 3, isBr: 1 },
        { idx: 4, w: `●「起初」：主要的意思是指一連串事物的「首先」、「第一」。傳統上這個字被譯為「起初」或「太初」，但也有一些人`, space: 0, tp: '●', tpIdx: 5 },
    ])

    // console.log(gSample1().com_text)
})

QUnit.test("cvtCommentToDTexts", assert => {

    console.log(gSample1().com_text)
    return

})

function gSample1() {
    return { "com_text": `\u58f9\u3001\u4eba\u985e\u7684\u4f86\u6e90 #1:1-11:32|\r\n  \u4e00\u3001\u4eba\u985e\u88ab\u9020 #\u5275 1:1-2:25|\r\n    \uff08\u4e00\uff09\u4e0a\u5e1d\u5275\u9020\u5b87\u5b99 #1:1-2:3|\r\n          1.\u5e8f\u8a00 #1:1-2|\r\n            (1)\u5728\u6642\u9593\u7684\u4e00\u958b\u59cb\uff0c\u4e0a\u5e1d\u5275\u9020\u5929\u5730 #1:1|\r\n              \u25cf#1:1|\u50c5\u6709\u4e03\u500b\u5b57\uff0cStrong number\u5206\u5225\u662f\uff1a\r\n                SNH07225\u3000SNH01254\u3000SNH00430\u3000SNH00853\u3000SNH08064\u3000SNH00853\u3000SNH00776\r\n              \u25cf\u300c\u8d77\u521d\u300d\uff1a\u4e3b\u8981\u7684\u610f\u601d\u662f\u6307\u4e00\u9023\u4e32\u4e8b\u7269\u7684\u300c\u9996\u5148\u300d\u3001\u300c\u7b2c\u4e00\u300d\u3002\u50b3\r\n                          \u7d71\u4e0a\u9019\u500b\u5b57\u88ab\u8b6f\u70ba\u300c\u8d77\u521d\u300d\u6216\u300c\u592a\u521d\u300d\uff0c\u4f46\u4e5f\u6709\u4e00\u4e9b\u4eba\r\n                          \u8a8d\u70ba\u61c9\u8a72\u8b6f\u70ba\u300c\u7576\u300d\uff08\u4ea6\u5373\u7576\u4e0a\u5e1d\u5275\u9020\u5929\u5730\u7684\u6642\u5019\uff0c\u5730\r\n                          \u5c31\u5df2\u7d93\u5b58\u5728\u65bc\u90a3\u88e1\u4e86\uff09\u3002\r\n                          \u8b6f\u70ba\u300c\u7576\u300d\u8207\u300c\u592a\u521d\u300d\u5728\u6587\u6cd5\u4e0a\u90fd\u8aaa\u5f97\u901a\uff0c\u4f46\u7531\u8056\u7d93\u7684\r\n                          \u5176\u4ed6\u7d93\u6587\u8207\u6240\u6709\u53e4\u8b6f\u672c\uff08\u4f8b\u5982\u4e03\u5341\u58eb\u8b6f\u672c\uff09\u90fd\u53ef\u4ee5\u770b\u51fa\r\n                          \u9019\u500b\u5b57\u8b6f\u70ba\u300c\u592a\u521d\u300d\u6bd4\u8f03\u59a5\u7576\u3002\r\n                          \u8a8d\u70ba\u61c9\u8a72\u8b6f\u70ba\u300c\u7576\u300d\u7684\u5b78\u8005\u9084\u6709\u4e00\u4e9b\u56e0\u7d20\u662f\u56e0\u70ba\u5df4\u6bd4\u502b\r\n                          \u7684\u5275\u4e16\u795e\u8a71\u5c31\u662f\u7528\u300c\u7576\u300d\u4f86\u958b\u982d\u7684\uff0c\u4f46\u9019\u4e26\u4e0d\u8868\u793a\u5e0c\u4f2f\r\n                          \u4f86\u6587\u7684\u8a18\u8f09\u4e5f\u5fc5\u9808\u7167\u5df4\u6bd4\u502b\u7684\u795e\u8a71\u6587\u6cd5\u4f86\u89e3\u4e0d\u53ef\u3002\r\n                          \u76ee\u524d\u5927\u591a\u6578\u7684\u5b78\u8005\u63a1\u7528\u300c\u8d77\u521d\u300d\u9019\u500b\u7ffb\u8b6f\u3002\r\n                          \u300c\u8d77\u521d\u300d\u4e26\u4e0d\u4e00\u5b9a\u662f\u6307\u4e00\u500b\u6975\u70ba\u77ed\u66ab\u7684\u6642\u9593\u9ede\uff0c\u5728\u8056\u7d93\r\n                          \u4e2d\u5e38\u5e38\u662f\u6307\u8457\u4e00\u6bb5\u5ef6\u5c55\u4f46\u4e0d\u78ba\u5b9a\u7684\u6642\u9593\u3002\r\n              \u25cf\u300c\u4e0a\u5e1d\u300d\uff1a\u539f\u6587\u662f\u300c\u8907\u6578\u300d\u4f46\u52d5\u8a5e\u662f\u55ae\u6578\u3002\u6709\u4eba\u8a8d\u70ba\u9019\u662f\u4e00\u7a2e\u300c\u986f\r\n                          \u8d6b\u7684\u8907\u6578\u300d\uff0c\u5c31\u50cf\u82f1\u570b\u5973\u738b\u81ea\u7a31\u70ba\u300cwe\u300d\uff08\u7ffb\u8b6f\u70ba\u300c\u6715\r\n                          \u300d\uff09\u3002\u5230\u5e95\u9019\u500b\u300c\u8907\u6578\u300d\u6709\u6c92\u6709\u300c\u986f\u8d6b\u300d\u6216\u300c\u5c0a\u8cb4\u300d\u7684\r\n                          \u542b\u610f\u662f\u96e3\u4ee5\u78ba\u5b9a\u7684\uff0c\u4e5f\u5f88\u53ef\u80fd\u7684\u9019\u500b\u5b57\u5c31\u662f\u9019\u6a23\uff0c\u6709\u8907\r\n                          \u6578\u7684\u5f62\u5f0f\u8207\u55ae\u6578\u7684\u610f\u7fa9\u3002\u9019\u500b\u5b57\u5728\u5169\u6cb3\u6d41\u57df\u662f\u4e00\u822c\u7684\u795e\r\n                          \u540d\uff0c\u4f46\u8056\u7d93\u4e2d\uff0c\u4ee5\u8272\u5217\u7684\u5217\u7956\u537b\u4ee5\u6b64\u5b57\u8868\u793a\u90a3\u7368\u4e00\u7684\u9020\r\n                          \u7269\u8005\u3002\r\n              \u25cf\u300c\u5275\u9020\u300d\uff1a\u9019\u500b\u5b57\u5728\u820a\u7d04\u51fa\u73fe54\u6b21\uff0c\u6bcf\u6b21\u7684\u4e3b\u8a5e\u90fd\u662f\u300c\u4e0a\u5e1d\u300d\u3002\u9019\r\n                          \u500b\u5b57\u539f\u672c\u6c92\u6709\u660e\u78ba\u7684\u300c\u5f9e\u7121\u8b8a\u6709\u300d\u7684\u610f\u601d\uff0c\u4e0d\u904e\u6b64\u5b57\u5728\r\n                          \u8056\u7d93\u4e2d\u5f9e\u4f86\u6c92\u6709\u7528\u4f86\u8868\u660e\u300c\u4e0a\u5e1d\u4ee5\u67d0\u7269\u9020\u51fa\u53e6\u4e00\u7269\u300d\uff0c\r\n                          \u4e14\u6b64\u8655\u7684\u4e0a\u4e0b\u6587\u7684\u78ba\u8868\u793a\u51fa\u9019\u662f\u4e00\u500b\u300c\u5f9e\u7121\u5230\u6709\u300d\u7684\u5275\r\n                          \u9020\u3002\r\n              \u25cf\u300c\u5929\u300d\uff1a\u539f\u6587\u578b\u614b\u70ba\u300c\u8907\u6578\u300d\uff08\u6b64\u5b57\u96d6\u7136\u6709\u300c\u96d9\u6578\u5b57\u5c3e\u300d\uff0c\u4f46\u578b\r\n                        \u614b\u8ddf\u96d9\u6578\u7121\u95dc\uff09\u3002\u5f8c\u671f\u7684\u4ee5\u8272\u5217\u4eba\u8a8d\u70ba\u6709\u4e03\u5c64\u5929\uff0c\u5305\u62ec\u300c\r\n                        \u4eba\u547c\u5438\u7684\u5929\u300d\u3001\u300c\u9ce5\u98db\u7684\u5929\u300d\u3001\u300c\u96f2\u884c\u7684\u5929\u300d\u3001\u300c\u85cf\u96e8\u7684\r\n                        \u5929\u300d\u3001\u300c\u65e5\u6708\u6240\u5728\u7684\u5929\u300d\u3001\u300c\u661f\u8fb0\u6240\u5728\u7684\u5929\u300d\u3001\u300c\u4e0a\u5e1d\u5bf6\r\n                        \u5ea7\u6240\u5728\u7684\u5929\u300d\u3002\u5176\u4e2d\u300c\u9ce5\u98db\u7684\u5929\u300d\u662f\u90aa\u9748\u8207\u58ae\u843d\u7684\u5929\u4f7f\u7b49\r\n                        \u5019\u5be9\u5224\u7684\u5730\u65b9\uff0c\u300c\u96f2\u884c\u7684\u5929\u300d\u662f\u6a02\u5712\u7684\u6240\u5728\u3002\r\n              \u25cf\u300c\u5730\u300d\uff1a\u300c\u5929\u300d\u8207\u300c\u5730\u300d\u524d\u90fd\u6709\u51a0\u8a5e\u3002\u56e0\u6b64\u9019\u500b\u300c\u5730\u300d\u6307\u7684\u5c31\u662f\u300c\r\n                        \u5927\u5730\u300d\u3002\r\n              \u25cf\u300c\u5929\u5730\u300d\uff1a\u6307\u7684\u5c31\u662f\u300c\u5b87\u5b99\u300d\u3002\u5728\u5e0c\u4f2f\u4f86\u6587\u4e2d\u6c92\u6709\u4e00\u500b\u5b57\u53ef\u4ee5\u8868\u9054\r\n                          \u300c\u5b87\u5b99\u300d\u7684\u89c0\u5ff5\uff0c\u5f97\u8981\u85c9\u52a9\u300c\u5169\u6975\u5316\u300d\u7684\u4fee\u8fad\u5b78\u65b9\u5f0f\u4f86\r\n                          \u8868\u9054\uff0c\u300c\u5929\u3001\u5730\u300d\u6b63\u662f\u8868\u9054\u51fa\u300c\u5b87\u5b99\u300d\u7684\u89c0\u5ff5\u3002\r\n\r\n            (2)\u5730\u7684\u72c0\u6cc1\u662f\u7a7a\u865b\u6df7\u6c8c\uff0c\u6df5\u9762\u9ed1\u6697\uff0c\u800c\u795e\u7684\u9748\u5728\u6c34\u9762\u4e0a\u904b\u884c\u3002#1:2|\r\n              \u25cf\u300c\u7a7a\u865b\u300d\uff1a\u57fa\u672c\u610f\u7fa9\u662f\u300c\u7a7a\u76ea\u300d\u3001\u300c\u865b\u7121\u300d\u3001\u300c\u8352\u6dbc\u300d\u3002\r\n              \u25cf\u300c\u6df7\u6c8c\u300d\uff1a\u5728\u8056\u7d93\u4e2d\u53ea\u51fa\u73fe\u4e09\u6b21#\u5275 1:2;\u8036 4:23;\u8cfd 34:11|\uff0c\u6bcf\u6b21\r\n                          \u90fd\u8ddf\u300c\u7a7a\u865b\u300d\u9023\u5728\u4e00\u8d77\u3002\u57fa\u672c\u610f\u7fa9\u662f\u300c\u7a7a\u7121\u4e00\u7269\u300d\u6216\u300c\r\n                          \u8352\u5ee2\u7121\u4eba\u5c45\u4f4f\u7684\u5730\u65b9\u300d\u3002\r\n              \u25cf\u300c\u7a7a\u865b\u6df7\u6c8c\u300d\uff1a\u662f\u300c\u8352\u856a\uff0c\u4ec0\u9ebc\u90fd\u6c92\u6709\u300d\u3001\u300c\u4e0d\u6bdb\u4e4b\u5730\u300d\u7684\u610f\u601d\uff0c\r\n                              \u800c\u975e\u300c\u6c92\u6709\u578b\u614b\u300d\u3001\u300c\u7a7a\u6d1e\u300d\u3001\u300c\u7121\u5f62\u8cea\u300d\u7684\u610f\u601d\r\n                              \u3002\r\n              \u25cf\u300c\u6df5\u300d\uff1a\u300c\u5927\u6c34\u300d\u3001\u300c\u539f\u59cb\u7684\u6d77\u6d0b\u300d\u3002\r\n              \u25cf\u300c\u6df5\u9762\u9ed1\u6697\u300d\uff1a\u76f4\u8b6f\u662f\u300c\u9ed1\u6697\u8986\u84cb\u5728\u6df1\u6df5\u4e4b\u4e0a\u300d\u3002\r\n              \u25cf\u300c\u9748\u300d\uff1a\u539f\u6587\u53ef\u4ee5\u6307\u300c\u98a8\u300d\u6216\u300c\u9748\u300d\uff0c\u4e0d\u904e\u9019\u88e1\u61c9\u8a72\u662f\u7528\u4f86\u6307\u4e0a\u5e1d\r\n                        \u7684\u300c\u9748\u300d\u6bd4\u8f03\u9069\u7576\uff0c\u5426\u5247\u5c31\u8ddf\u5f8c\u9762\u7684\u300c\u76e4\u65cb\u300d\u3001\u300c\u7ffc\u8986\u300d\r\n                        \u96e3\u4ee5\u5354\u8abf\u4e86\u3002\u4e5f\u6709\u89e3\u7d93\u5bb6\u8a8d\u70ba\u61c9\u8a72\u89e3\u91cb\u6210\u300c\u4e0a\u5e1d\u7684\u98a8\u300d\uff0c\r\n                        \u9019\u61c9\u8a72\u4e5f\u9084\u7b97\u53ef\u4ee5\u63a5\u53d7\uff0c\u4f46\u89e3\u91cb\u6210\u300c\u5de8\u5927\u7684\u98a8\u300d\u7684\u9019\u7a2e\u8aaa\r\n                        \u6cd5\u5c31\u88ab\u5927\u591a\u6578\u89e3\u7d93\u5bb6\u6240\u63da\u68c4\uff08\u628a\u300c\u4e0a\u5e1d\u300d\u89e3\u91cb\u6210\u300c\u5de8\u5927\u300d\r\n                        \u8aaa\u4e0d\u592a\u901a\uff09\u3002\r\n              \u25cf\u300c\u904b\u884c\u300d\uff1a\u6709\u300c\u76e4\u65cb\u300d\u3001\u300c\u7ffc\u8986\u300d\u3001\u300c\u611b\u80b2\u300d\u7b49\u610f\u7fa9\uff0c#\u7533 32:11| \r\n                          \u7528\u9019\u500b\u5b57\u6307\u9df9\u5728\u5b50\u5973\u7684\u5de2\u4e0a\u6427\u5c55\u7fc5\u8180\u3002\r\n              \u25ce\u6709\u4e00\u7a2e\u8aaa\u6cd5\u53eb\u300c\u6642\u6e9d\u8ad6\u300d\uff0c\u8a8d\u70ba#1:1|\u8207#1:2|\u4e4b\u9593\u6709\u4e00\u6bb5\u8056\u7d93\u6c92\u6709\r\n                \u8a18\u8f09\u7684\u6642\u9593\u3002#1:1|\u4e0a\u5e1d\u5275\u9020\u5929\u5730\uff0c\u800c\u6492\u4f46\u58ae\u843d\u9020\u6210#1:2|\u7684\u7a7a\u865b\u6df7\r\n                \u6c8c\u3002\u9019\u7a2e\u8aaa\u6cd5\u76ee\u524d\u88ab\u5927\u90e8\u5206\u7684\u89e3\u7d93\u5bb6\u6452\u68c4\uff0c\u4e3b\u8981\u7684\u539f\u56e0\u662f#1:2|\u524d\r\n                \u7684\u300cwaw\u300d\uff0c\u662f\u53cd\u610f\u9023\u63a5\u8a5e\uff0c\u8868\u660e\u4f5c\u8005\u662f\u5e0c\u671b\u8b80\u8005\u7684\u89c0\u9ede\u7531\u5b87\u5b99\u8f49\r\n                \u5230\u300c\u5927\u5730\u300d\u4e0a\u3002\r\n              \u25ce#1:2|\u610f\u7fa9\u662f\u300c\u539f\u59cb\u7684\u5927\u5730\u662f\u4e00\u7247\u4e0d\u6bdb\u4e4b\u5730\uff0c\u5927\u6c34\u4e0a\u9762\u8986\u84cb\u8457\u9ed1\u6697\uff0c\r\n                \u795e\u7684\u9748\u5728\u6c34\u9762\u4e0a\u76e4\u65cb\u7ffc\u8986\u8457\u9019\u539f\u59cb\u7684\u5927\u5730\u300d\u3002\r\n\r\n\r\n\r\n` }
}