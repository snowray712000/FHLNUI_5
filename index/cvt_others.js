/**
 * @typedef {import("./DText.js").DText} DText
 */

import { BibleConstant } from "./BibleConstant.es2023.js";
import { splitStringByRegex } from "./splitStringByRegex.es2023.js";
import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { add_parenttheses_unv_ncv } from "./AddParenthesesUnvNcv.js";
import { add_reference_in_comment_text } from './AddReferenceInCommentText.js'
import { ReferenceNcv } from './ReferenceNcv.js'
import { ReferenceOther } from './ReferenceOther.js'
import { TPPageState } from './TPPageState.es2023.js';
import { runAddFoot } from "./cvt_others_addFoot.js";
import { attach_sn_text } from "./attach_sn_text.js";
import { text_like_foot } from "./cvt_other_text_like_foot.js";
import { split_wu_plus, add_wu_label } from "./cvt_others_wu_plus.js";
/**
 * @typedef {[number, number, number, string]} RecordWithAddr // [book, chap, sec, text]
 */
/**
 * @typedef {[number, number, number, DText[]]} DTextsWithAddr // [book, chap, sec, dtexts] 之所以要設計成 DText[] 而非 DText，是因為可能之後會被拆成多個 DText，在一節資料中。
 */

/**
 * 
 * @param {string} version 
 * @param {RecordWithAddr[]} bible_text_with_addr 
 * @returns {DTextsWithAddr[]}
 */
export function cvt_others(version, bible_text_with_addr) {
    return bible_text_with_addr.map(record_with_addr => {
        return cvt_one(record_with_addr, version)
    })
}


/**
 * @param {RecordWithAddr} record_with_addr 
 * @param {string} version
 * @returns {RecordWithAddr}
 */
function cvt_one(record_with_addr, version) {
    // - 轉成 dtexts。 這樣才會是 inplace 操作
    const dtexts_with_addr = cvt_dtexts_with_addr(record_with_addr);

    // - 將換行符號替換成 <br/>。 這樣後面的操作才一致 
    // - 一定要在 title 前處理
    replaceNewLineToBr(dtexts_with_addr)

    // - 將原文標記改成成對的標記，避免 DOMParser 失敗
    replaceOrigToPair(dtexts_with_addr)

    // - 和合本 2010，rcuv...它的內文就有像 foot 的內容了，像是 ( [ 2.8] 「世上粗淺的學說」或譯「宇宙的星宿」；20-21節同。)
    if (['rcuv'].includes(version)) {
        text_like_foot(dtexts_with_addr, version);
    }

    if (version === 'kjv') replaceKJVToPair(dtexts_with_addr);
    if (version === 'cnet_foot') replaceCnetFootReference(dtexts_with_addr);
    if (version === 'csb_foot') replaceCsbFootReference(dtexts_with_addr);
    doUsingDOMParsor(dtexts_with_addr);

    // - 新約原文 + 韋式 + 聯式 +，要在 add_sn_text 前後各作一步
    if (version === 'fhlwh') dtexts_with_addr[3] = split_wu_plus(dtexts_with_addr[3]);

    if (['unv', 'kjv', 'rcuv', 'fhlwh', 'bhs'].indexOf(version) != -1) {
        add_sn_text(dtexts_with_addr, version);
    }

    if (version === 'fhlwh') dtexts_with_addr[3] = add_wu_label(dtexts_with_addr[3]);

    addParentheses(dtexts_with_addr);
    addReference(dtexts_with_addr, version);
    if (!['rcuv','unv'].includes(version)){
        runAddFoot(dtexts_with_addr, version);
    }

    return dtexts_with_addr
}

function add_sn_text(dtexts_with_addr, version) {
    const dtexts = dtexts_with_addr[3];
    const dtexts2 = attach_sn_text(dtexts, version)
    dtexts_with_addr[3] = dtexts2;
}

/**
 * 
 * @param {DTextsWithAddr} dtexts_with_addr 
 * @param {string} ver
 */
function addReference(dtexts_with_addr, ver = 'ncv') {
    const dtexts = dtexts_with_addr[3];
    toStandard();

    const re1 = add_reference_in_comment_text(dtexts_with_addr[3], { book: dtexts_with_addr[0], chap: dtexts_with_addr[1], verse: dtexts_with_addr[2] });

    dtexts_with_addr[3] = re1;
    return
    // return { children: re1, addresses: it1.addresses, ver: it1.ver };

    /** 讓參考形如 路:1-2 */
    function toStandard() {

        const isGb = TPPageState.s.gb == 1 ? 1 : undefined;
        for (const it2 of dtexts) {
            // 新譯本特別處理
            let refTool =
                ver === 'ncv' ? new ReferenceNcv(it2.w, isGb) : new ReferenceOther(it2.w, isGb);

            if (refTool.isIncludeRef()) {
                it2.w = refTool.toStandard();
                // 這裡不用加 .isRef 之類的，這個工作交給 add_reference_in_comment_text 處理
                // 這裡主要是將 全型之類 的轉成準備的
                // 而這個全型是因為不同的譯本產生的。                
            }
        }
        return;
    }
}

function cvt_dtexts_with_addr(record_with_addr) {
    const dtext = { w: record_with_addr[3] };
    const dtexts = [dtext];
    return [record_with_addr[0], record_with_addr[1], record_with_addr[2], dtexts];
}

/**
 * @param {DTextsWithAddr} it1 
 */
function replaceNewLineToBr(dtexts_with_addr) {
    for (const it2 of dtexts_with_addr[3]) {
        if (it2.w != null) {
            it2.w = it2.w.replace(/\r?\n\r?/g, '<br/>');
        }
    }
}
/** 在DOMParsor 之前, 原文 <WTH592> 會導致錯誤，因此，要先變為一對 </WTH592> */
function replaceOrigToPair(dtexts_with_addr) {
    for (const it2 of dtexts_with_addr[3]) {
        if (it2.w != undefined)
            it2.w = letOrigCanDOMParsed(it2.w);
    }
    return

    /** 原文 <WTH0834> 會使 DOMParser 錯誤。 */
    function letOrigCanDOMParsed(str) {
        //let r3 = '<h2>真福<br/></h2>{<WH0834>}不從<WH01980><WTH8804>'
        // 曾經 Bug
        const r3 = str
            .replace(/{<(WA?T?(?:H|G)\d+[a-z]?)>}|<(WA?T?(?:H|G)\d+[a-z]?I?)>/gi,
                (a1, a2, a3) => {
                    if (a2 != null) {
                        return `<${a2}I></${a2}I>`; // 尾部加個 I 好了, ignore 的 i. 
                        // 花括號, 不行變 <{WH834}> 因為,若是recursive 時 innerHTML 會錯.
                        // return `<{${a2}}></{${a2}}>`; 
                    } else if (a3 != null) {
                        return `<${a3}></${a3}>`;
                    }
                    return a1;
                });
        return r3;
    }
}

/** KJV 以 FI 為例，它是 FI Fi 而非 FI /FI 成對 */
function replaceKJVToPair(dtexts_with_addr) {
    for (const it2 of dtexts_with_addr[3]) {
        if (it2.w != null && isIncludeRef(it2.w)) {
            // KJV 不是寫 <FI> </FI> 而是 <FI><Fi> 透過大小寫, RF
            // CM 不是成對的
            it2.w = it2.w.replace(/(<Fi>)|(<Rf>)|(<CM>)|<Fo>/g, (a1, a2, a3, a4, a5) => {
                if (a3 != null) return '</RF>';
                if (a2 != null) return '</FI>';
                if (a4 != null) return '<CM></CM>'; // 不是成對的
                if (a5 != null) return '</FO>';
                return a1
            });
        }
    }
    return;
    function isIncludeRef(str) {
        return /<Fi>|<Rf>|<CM>|<Fo>/.test(str); // #路1|        
    }
}

/** 
 * cnet 版本注釋。在 foot dialog 要用到的
 * 羅1:1 【2】（詩89:3；撒下7:5, 8）
 * 羅1:4 本處和馬太福音28:18同義：
 * 創3:1 例：參啟12:9）  舊約偽經《禧年書》(Jubilees) 3:28如此說：「 （假定是希伯來話，見12:26） 在《猶太古史》(Jewish Antiquities)1.1.4 (1.41)
*/
function replaceCnetFootReference(dtexts_with_addr) {
    const reg = gRegExp();       // doText() 中用

    for (const it2 of dtexts_with_addr[3]) {
        doText(it2);
    }
    // console.log(JSON.stringify( dtexts_with_addr));

    return dtexts_with_addr;
    function doText(it2) {
        if (it2.w == null) return

        let r3 = splitStringByRegex(it2.w, reg)
        if (r3 == null) return

        /**
         * @type {DText[]}
         */
        const re = [];
        for (let i3 = r3.length - 1; i3 > -1; i3--) { // 反向處理
            const it3 = r3[i3];
            const r4 = structuredClone(it2);
            r4.w = it3.w;
            if (it3.exec == null) { re.push(r4); continue; }

            // assert ( it3.exec != null )
            if (i3 !== 0 && r3[i3 - 1].exec != null) {
                // 前一個也是 參考。那串在一起吧。(因此，這個 r4，並沒有被丟到 re 中)
                r3[i3 - 1].w += it3.w;
            } else {
                // 全型空白、空白，去掉
                // 全型分號，變成 半型分號
                it3.w = it3.w
                    .replace(/( +|　+)/g, '')   // 去掉半形/全形空白
                    .replace(/；/g, ';');       // 全形分號轉半形                
                it3.w = '#' + it3.w + '|';

                re.push(it3);
            }
        }

        let re2 = re.map(a1 => a1.w)
        re2.reverse()
        it2.w = re2.join('')
    }
    function gRegExp() {
        const na1 = BibleConstantHelper.getBookNameArrayChineseShort()
        const na2 = BibleConstantHelper.getBookNameArrayChineseFull()

        // concat and order by length desc
        // don't change original arrays
        const bookNames = [...na1, ...na2];
        bookNames.sort((a, b) => b.length - a.length);

        const str1 = bookNames.join('|');
        const reg1 = new RegExp('(?:' + str1 + ')\\d+[\\d　 :；;,\\-]*', 'g');
        return reg1;
    }
}

/** 
 * csb(中文標準譯本－新約only) 版本注釋。在 foot dialog 要用到的
 * 太1:23 1:23 《以賽亞書》7:14。
*/
function replaceCsbFootReference(dtexts_with_addr) {
    const reg = gRegExp();       // doText() 中用

    for (const it2 of dtexts_with_addr[3]) {
        doText(it2);
    }

    return dtexts_with_addr;

    /**
     * 
     * @param {DText} it2 
     * @returns 
     */
    function doText(it2) {
        if (it2.w === undefined) return;

        let r3 = splitStringByRegex(it2.w, reg);
        if (r3 == null) return;

        /**
         * @type {DText[]}
         */
        const re = [];
        for (let i3 = r3.length - 1; i3 > -1; i3--) {
            const it3 = r3[i3];
            const r4 = structuredClone(it2);
            r4.w = it3.w;
            if (it3.exec == null) { re.push(r4); continue; }

            // assert ( it3.exec != null )
            if (i3 !== 0 && r3[i3 - 1].exec != null) {
                // [0]: 《以賽亞書》7:14
                // [1]: 以賽亞書
                // [2]: 7:14
                r3[i3 - 1].w += it3.w;
            } else {
                it3.w = it3.w.replace(/[(《)|(》)|(；)]/g, (a1, a2, a3, a4) => {
                    if (a2 != null) return '';
                    if (a3 != null) return '';
                    if (a4 != null) return ';';
                    return a1
                });
                it3.w = '#' + it3.w + '|';
                re.push(it3);
            }
        }

        let r1 = re.map(a1 => a1.w)
        r1.reverse();
        it2.w = r1.join('');
    }
    function gRegExp() {
        const na1 = BibleConstantHelper.getBookNameArrayChineseShort()
        const na2 = BibleConstantHelper.getBookNameArrayChineseFull()

        // concat and order by length desc
        // don't change original arrays
        const bookNames = [...na1, ...na2];
        bookNames.sort((a, b) => b.length - a.length);
        const str1 = bookNames.join('|');
        const reg1 = new RegExp('《(' + str1 + ')》(\\d+[\\d　 :；;,\\-]*)', 'g');
        return reg1;
    }
}

/** 包含了 h2 h3 u b SN 
 * @param {DTextsWithAddr} it1
*/
function doUsingDOMParsor(it1) {

    /**
     * @type {DText[]}
     */
    const re2 = [];
    for (const it2 of it1[3]) {
        if (it2.w !== undefined) {
            let re3 = getAllDTextsFromAllChildrenNode(it2.w, it2);
            for (const it3 of re3)
                re2.push(it3);
        } else
            re2.push(it2);
    }

    it1[3] = re2;
    // return { children: re2, ver: it1.ver, addresses: it1.addresses };
}

/**
 * 要 recursive 呼叫
 * parentDText 是當被 h2 包住的東西，傳入供 child copy
 * @param {string} strInnerHTML
 * @param {DText | undefined} [parentDText]
 * @returns {DText[]}
 * */
function getAllDTextsFromAllChildrenNode(
    strInnerHTML, parentDText) {

    let rr3 = parsingToDOMs(strInnerHTML);

    /**
     * @type {DText[]}
     */
    const re = [];
    for (let i3 = 0; i3 < rr3.length; i3++) {

        /**
         * @type {DText}
         */
        let rrr1 = parentDText === undefined ? {} : structuredClone(parentDText);

        /**
         * @type {HTMLElement}
         */
        const it3 = rr3[i3]// as HTMLElement;


        if (it3.nodeType === 1 && /^H\d$/.test(it3.tagName)) {
            rrr1.isTitle1 = 1; // h2 h3
            let rrr2 = getAllDTextsFromAllChildrenNode(it3.innerHTML, rrr1);
            for (const it4 of rrr2)
                re.push(it4);
        } else if (it3.nodeType === 1 && /^B$/.test(it3.tagName)) {
            rrr1.isBold = 1; // b
            let rrr2 = getAllDTextsFromAllChildrenNode(it3.innerHTML, rrr1);
            for (const it4 of rrr2)
                re.push(it4);
        } else if (it3.nodeType === 1 && /^FO$/.test(it3.tagName)) {
            rrr1.isTitle1 = 1; // b
            let rrr2 = getAllDTextsFromAllChildrenNode(it3.innerHTML, rrr1);
            for (const it4 of rrr2)
                re.push(it4);
        } else if (it3.nodeType === 1 && it3.tagName === 'SPAN' && it3.style !== undefined && it3.style.color !== '') {
            rrr1.w = it3.textContent; rrr1.cssColor = it3.style.color; // 路 7:33 紅字中有私名號 
            let rrr2 = getAllDTextsFromAllChildrenNode(it3.innerHTML, rrr1);
            for (const it4 of rrr2)
                re.push(it4);
        }
        else {
            if (it3.nodeType === 3) { rrr1.w = it3.textContent; } // text          
            else if (it3.nodeType === 1 && it3.tagName === 'BR') {
                delete rrr1.w; rrr1.isBr = 1;
            } else if (it3.nodeType === 1 && it3.tagName === 'U') {
                rrr1.isName = 1; rrr1.w = it3.textContent;
            } else if (it3.nodeType === 1 && it3.tagName === 'FI') {
                rrr1.isBold = 1; rrr1.w = it3.textContent; // KJV 未知
            } else if (it3.nodeType === 1 && it3.tagName === 'RF') {
                rrr1.isBold = 1; rrr1.w = it3.textContent; // KJV 未知
            } else if (it3.nodeType === 1 && it3.tagName === 'CM') {
                rrr1.isBold = 1; rrr1.w = it3.textContent; // KJV 未知
            } else if (it3.nodeType === 1 && it3.tagName === 'SUBHEADING') {
                rrr1.isBold = 1; rrr1.w = it3.textContent; // ESV 詩篇101 未知
            } else if (/WA?(T?)(H|G)(\d+[aA]?)(I?)/.test(it3.tagName)) {
                // /{<(WA?T?(?:H|G)\d+[a-z]?)>}|<(WA?T?(?:H|G)\d+[a-z]?)>/gi
                //let rr1 = /WA?(T?)(H|G)(\d+[aA]?)(I?)/.exec(it3.tagName);
                let rr1 = /(WA?(T?)(H|G))(\d+[aA]?)(I?)/.exec(it3.tagName);
                const isT = rr1[2].length !== 0;
                rrr1.tp = rr1[3] // as 'G' | 'H';
                let sn = rr1[4];
                sn = (sn.replace(/^0+/, '') || "0").toLocaleLowerCase(); // 讓 08521a 變為 8521a ... tagName 會自動變全大寫，所以造成 8521A 就會抓錯資料 ; "00" 這類全 0 要變成 "0" 而非空字串
                rrr1.sn = sn
                if (rr1[5].length != 0) {
                    rrr1.isCurly = 1;
                } // I

                if (false) { // TODO: 註釋 原文匯編 都要強迫畫
                    rrr1.w = `${rrr1.tp}${rrr1.sn}`; // 需要 G2312，例如註釋
                } else if (true) {
                    rrr1.w = `${rrr1.sn}`; // 不需要 'G' 2312
                }

                // < > or ( )
                if (isT) {
                    rrr1.w = '(' + rrr1.w + ')';
                }
                else {
                    rrr1.w = '<' + rrr1.w + '>';
                }

                // { } or not
                if (rrr1.isCurly == 1) {
                    rrr1.w = '{' + rrr1.w + '}';
                }

                // tp2 WTG, WAG, WTH, WH
                rrr1.tp2 = rr1[1]
            }
            else {
                rrr1.w = it3.outerHTML;
                // console.log(it3.nodeType, it3.tagName, it3.textContent)            
            }
            re.push(rrr1);
        }
    }

    return re;
}

function parsingToDOMs(str) {
    let r1 = new DOMParser().parseFromString(str, 'text/html') // as Document;
    return r1.querySelector('body').childNodes;
}

/** 小括號
 * 雖然直覺，小括號是要在 title 裡面。
 * 但目前程式，(在 rendor 部分, 它們是平行的, 繪圖都是 isTitle1 與 isParentheses)
 * @param {DTextsWithAddr} dtexts_with_addr
 */
function addParentheses(dtexts_with_addr) {
    add_parenttheses_unv_ncv(dtexts_with_addr);
}

