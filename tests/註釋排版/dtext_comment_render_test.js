/**
 * @typedef {import('./../../index/comments/TpComments.js').DText} DText
 * @typedef {import('./../../index/comments/TpComments.js').DAddress} DAddress
 * @typedef {import('./../../index/comments/TpComments.js').DocNode} DocNode
 */

import { convertDocToDText } from './../../index/comments/convertDocToDText.js';
import { parseComment } from './../../index/comments/parseComment.js';
import { BibleConstantHelper } from './../../index/BibleConstantHelper.es2023.js'
import { queryDictionaryAndShowAtDialogAsync } from './../../index/queryDictionaryAndShowAtDialogAsync.es2023.js'
import { queryReferenceAndShowAtDialogAsync } from './../../index/queryReferenceAndShowAtDialogAsync.es2023.js'
import { TPPageState } from './../../index/TPPageState.es2023.js'
import { splitReference } from './../../index/splitReference.es2023.js'
import { renderCommentDTexts } from './../../index/comments/render_comments_in_dtexts.js' // renderCommentDTexts
import { fix_addr_description } from './../../index/comment_register_events_es2023.js' // fix_addr_description
/**
 * @param {string} comment_text
 * @param {DAddress} address
 * @param {JQuery<HTMLElement>} $container
 */
function main_process(comment_text, address, $container) {
    const docNode = parseComment(comment_text, address);
    const dtexts = convertDocToDText(docNode, address);
    renderCommentDTexts(dtexts, $container);
}

// Case A (eg2)
/** @type {DText[]} */
const caseA = [
    { w: "上帝要亞哈斯求一個記號，亞哈斯拒絕。上帝說祂自己要以「童女生子」為記號，小孩尚未懂得棄惡擇善之前，亞蘭和以色列要滅亡。 " },
    { w: " 7:10-16 ", isRef: 1, refDescription: "賽7:10-16" }
];

// Case B (eg3)
/** @type {DText[]} */
const caseB = [
    {
        marker: "3. ",
        children: [
            { w: "上帝要亞哈斯求一個記號，亞哈斯拒絕。上帝說祂自己要以「童女生子」為記號，小孩尚未懂得棄惡擇善之前，亞蘭和以色列要滅亡。 " },
            { w: " 7:10-16 ", isRef: 1, refDescription: "賽7:10-16" }
        ],
        childrenlist: [
            { marker: "●", children: [{ w: "「深處」：原文是「陰間的深淵」。" }] },
            { marker: "●", children: [{ w: "「高處」：原文是「上面的至高之處」。" }] }
        ]
    }
];

// Case C (eg5 with joTable)
/** @type {DText[]} */
const caseC = [
    {
        marker: "3. ",
        children: [
            { w: "上帝要亞哈斯求一個記號，亞哈斯拒絕。上帝說祂自己要以「童女生子」為記號，小孩尚未懂得棄惡擇善之前，亞蘭和以色列要滅亡。 " },
            { w: " 7:10-16 ", isRef: 1, refDescription: "賽7:10-16" }
        ],
        childrenlist: [
            { marker: "●", children: [{ w: "「深處」：原文是「陰間的深淵」。" }] },
            { marker: "●", children: [{ w: "「高處」：原文是「上面的至高之處」。" }] },
            {
                joTable: {
                    rows: 4, cols: 4, cells: [
                        { r: 0, c: 0, content: [{ w: '中文翻譯' }] },
                        { r: 0, c: 1, content: [{ w: '原文編號' }] },
                        { r: 0, c: 2, content: [{ w: '原文簡義' }] },
                        { r: 0, c: 3, content: [{ w: '出現經文' }] },
                        { r: 1, c: 0, content: [{ w: '觀兆' }] },
                        { r: 1, c: 1, content: [{ w: ' H6049 ', tp: 'H', sn: '6049' }] },
                        { r: 1, c: 2, content: [{ w: '觀兆、卜卦' }] },
                        { r: 1, c: 3, content: [{ w: ' 利 19:26;王下 21:6;代下 33:6 ', isRef: 1, refDescription: "利19:26;王下21:6;代下33:6" }] },
                        { r: 2, c: 0, content: [{ w: '觀兆的' }], rowSpan: 2 },
                        { r: 2, c: 1, content: [{ w: ' H6049 ', tp: 'H', sn: '6049' }] },
                        { r: 2, c: 2, content: [{ w: '觀兆者' }] },
                        { r: 2, c: 3, content: [{ w: ' 申 18:10;申 18:14;賽 2:6;耶 27:9 ', isRef: 1, refDescription: "申18:10;申18:14;賽2:6;耶27:9" }] },
                        { r: 3, c: 1, content: [{ w: ' H1505 ', tp: 'H', sn: '1505' }] },
                        { r: 3, c: 2, content: [{ w: '觀兆者' }] },
                        { r: 3, c: 3, content: [{ w: ' 但 2:27;但 4:7;但 5:7;但 5:11 ', isRef: 1, refDescription: "但2:27;但4:7;但5:7;但5:11" }] },
                    ]
                }
            }
        ]
    }
];

const PRESETS = { A: caseA, B: caseB, C: caseC };

$(function () {
    // 預設先顯示 Case A
    renderCommentDTexts(PRESETS.A, $('#casePreset'));

    $('#btnPreset').on('click', function () {
        const key = $('#presetCase').val();
        const dtexts = PRESETS[key] || PRESETS.A;
        renderCommentDTexts(dtexts, $('#casePreset'));
    });

    $('#btnFetch').on('click', async function () {
        const book_name = String($('#book').val() || '').trim();
        const chap = parseInt($('#chap').val(), 10);
        const sec = parseInt($('#sec').val(), 10);

        if (!book_name || !Number.isFinite(chap) || !Number.isFinite(sec)) {
            alert('請輸入 book / chap / sec');
            return;
        }

        try {
            const url = genUrl(book_name, chap, sec);
            const apiText = await fetchData(url);
            if (!apiText) return;

            const apiResult = JSON.parse(apiText);
            const comment = apiResult?.record?.[0]?.com_text ?? '';

            const boolid = BibleConstantHelper.getBookId(book_name.toLowerCase());
            const address = { book: boolid, chap, verse: sec };
            main_process(comment, address, $('#renderApi'));

            // 新增：更新前後按鈕
            updatePrevNextButtons(apiResult);
        } catch (err) {
            console.error(err);
            alert('API 取得失敗，請查看 Console');
        }
    });

    // 新增：前後按鈕點擊
    $('#btnPrev, #btnNext').on('click', function () {
        const $btn = $(this);
        const book = $btn.attr('book');
        const chap = $btn.attr('chap');
        const sec = $btn.attr('sec');

        if (!book || !chap || !sec) return;

        const engs = BibleConstantHelper.getBookNameArrayEnglishNormal()[Number(book) - 1];
        $('#book').val(engs);
        $('#chap').val(chap);
        $('#sec').val(sec);

        $('#btnFetch').trigger('click');
    });
});

$(function () {
    $('#renderApi').off('click', '.sn').on('click', '.sn', ev => {
        let that = $(ev.target)
        let sn = that.attr('sn');
        let N = that.attr('tp') == 'H' ? 1 : 0 // 0 是新約 1 是舊約
        queryDictionaryAndShowAtDialogAsync({ sn, isOld: N == 1 })
    })
})

$(function () {
    $('#renderApi').off('click', '.commentJump').on('click', '.commentJump', ev => {
        const ps = TPPageState?.s
        let book= ps?.bookIndex
        let chap = ps?.chap
        let sec = ps?.sec

        const current_target = ev.currentTarget

        // try attr book/chap from current_target
        if ($(current_target)?.attr("book")){
            book = $(current_target).attr("book")
        }
        if ($(current_target)?.attr("chap")){
            chap = $(current_target).attr("chap")
        }
        if ($(current_target)?.attr("sec")){
            sec = $(current_target).attr("sec")
        }

        const defaultAddress = { book, chap, verse: sec };

        let dtexts = splitReference($(current_target).text(), defaultAddress)

        // - 詩篇 30，與 一般的 31:4 之類的不一樣
        const bookAttr = $(ev.currentTarget)?.attr("book");
        if (bookAttr != null && dtexts[0]?.refAddresses == null) {
            const bookChap = $(ev.currentTarget)?.attr("chap") ?? 1;

            const refstr = BibleConstantHelper.getBookNameArrayChineseShort()[ps.bookIndex - 1] + bookChap

            dtexts = splitReference(refstr, defaultAddress)
        }

        console.log(dtexts);


        const fixedDescription = fix_addr_description(dtexts[0].w, defaultAddress)

        const paramsForDialog = {
            // addrsDescription: dtexts[0].w, // 會在詩篇 143 篇產生 Bug。
            addrsDescription: fixedDescription,
            addrs: dtexts[0].refAddresses,
            event: ev
        }

        queryReferenceAndShowAtDialogAsync(paramsForDialog)
    })
})

function updatePrevNextButtons(joApiResult) {
    const $btnNext = $('#btnNext');
    const $btnPrev = $('#btnPrev');

    $btnNext.prop('disabled', true).removeAttr('book chap sec');
    $btnPrev.prop('disabled', true).removeAttr('book chap sec');

    // next
    const joNext = joApiResult.next;
    if (joNext) {
        const book = BibleConstantHelper.getBookId(joNext.engs.toLowerCase());
        const chap = joNext.chap;
        const sec = joNext.sec;

        $btnNext.attr('book', book).attr('chap', chap).attr('sec', sec);
        $btnNext.prop('disabled', false);
    }

    // prev
    const joPrev = joApiResult.prev;
    if (joPrev) {
        const book = BibleConstantHelper.getBookId(joPrev.engs.toLowerCase());
        const chap = joPrev.chap;
        const sec = joPrev.sec;

        $btnPrev.attr('book', book).attr('chap', chap).attr('sec', sec);
        $btnPrev.prop('disabled', false);
    }
}

// fetch async 函數
async function fetchData(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.text();
}

/**
 * 取得 註釋 資料的 url
 * @param {string} book_name
 * @param {number} chap
 * @param {number} sec
 * @return {string} url
 */
function genUrl(book_name, chap, sec) {
    if (typeof BibleConstantHelper === 'undefined') {
        throw new Error('BibleConstantHelper 未載入，無法由 book 名稱推算 engs。');
    }
    const book = BibleConstantHelper.getBookId(book_name.toLowerCase());
    const engs = BibleConstantHelper.getBookNameArrayEnglishNormal()[book - 1];

    if (chap < 0 || sec < 0) {
        throw new Error('chap/sec 需大於 0');
    }

    // 全域 ps
    TPPageState.s.bookIndex = book
    TPPageState.s.chap = chap
    TPPageState.s.sec = sec

    const url = `sc.php?engs=${engs}&chap=${chap}&sec=${sec}&book=3&gb=0`;
    return "http://127.0.0.1:15600/json/" + url;
}
