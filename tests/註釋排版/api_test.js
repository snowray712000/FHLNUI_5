// 一個函數，取得 #book #chap #sec 的值

import { BibleConstantHelper } from "./../../index/BibleConstantHelper.es2023.js"
import { parseComment } from "./../../index/comments/parseComment.js"
import { renderCommentTree } from "./../../index/comments/render_comments_in_docnode.js"

// document ready bind 「測試」button
$(function () {
    bindPrevNextButtons()

    bindPreset()

    $('#btnTest').on('click', async function () {
        const book_name = $('#book').val();
        const chap = parseInt($('#chap').val());
        const sec = parseInt($('#sec').val());
        const url = genUrl(book_name, chap, sec);

        const apiResult = await fetchData(url);

        if (null == apiResult) {
            $("#raw").text("API 請求失敗，請檢查後端服務是否啟動，或 URL 是否正確");
            return;
        }

        const joResult = JSON.parse(apiResult);
        const textComment = joResult.record[0].com_text

        // set next prev button attr
        updatePrevNextButtons(joResult);

        // 顯示在 #raw , 它是 pre
        $("#raw").text(textComment);

        // 
        const bookid = BibleConstantHelper.getBookId(book_name.toLowerCase());
        const address = [bookid, chap, sec]
        console.error(address);
        
        const jqueryHtml = processComment(apiResult, address);
        $("#processed").html(jqueryHtml);
    })
})

function bindPrevNextButtons() {
    $('#btnPrev').on('click', async function () {
        const book = $(this).attr('book');
        const chap = $(this).attr('chap');
        const sec = $(this).attr('sec');

        if (book > 0 ) {
            const chinese = BibleConstantHelper.getBookNameArrayChineseShort()[book - 1];
            $("#book").val(chinese)
            $("#chap").val(chap)
            $("#sec").val(sec)

            // trigger click on test button to load data
            $('#btnTest').trigger('click');
        }
    })

    $("#btnNext").on('click', async function () {
        const book = $(this).attr('book');
        const chap = $(this).attr('chap');
        const sec = $(this).attr('sec');

        if (book > 0 ) {
            const chinese = BibleConstantHelper.getBookNameArrayChineseShort()[book - 1];
            $("#book").val(chinese)
            $("#chap").val(chap)
            $("#sec").val(sec)

            // trigger click on test button to load data
            $('#btnTest').trigger('click');
        }
    })
}

function bindPreset() {
    $('#preset').on('change', function () {
        const val = $(this).val();
        if (!val) return;

        const [book, chap, sec] = val.split(',');

        $("#book").val(book);
        $("#chap").val(chap);
        $("#sec").val(sec);
    })
}

function updatePrevNextButtons(joApiResult) {
    //     {book: '3', engs: 'Gen', chap: 1, sec: 3}
    // {book: '3', engs: 'Gen', chap: 0, sec: 0}

    // next 
    const joNext = joApiResult.next;
    if (joNext) {
        const book = BibleConstantHelper.getBookId(joNext.engs.toLowerCase())
        const chap = joNext.chap
        const sec = joNext.sec

        $('#btnNext').attr('book', book).attr('chap', chap).attr('sec', sec);
    }

    const joPrev = joApiResult.prev;
    if (joPrev) {
        const book = BibleConstantHelper.getBookId(joPrev.engs.toLowerCase())
        const chap = joPrev.chap
        const sec = joPrev.sec
        $('#btnPrev').attr('book', book).attr('chap', chap).attr('sec', sec);
    }
}

function processComment(apiResultText, address) {
    const apiResult = JSON.parse(apiResultText);

    // console.log(apiResult);

    const comment = apiResult.record[0].com_text;

    const parsed = parseComment(comment, address);

    renderCommentTree(parsed, $('#render'));

}




// fetch async 函數
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();

        return data
    } catch (error) {
        console.error('Fetch error:', error);
    }
}


/**
 * 取得 註釋 資料的 url
 * @param {string} book_name 
 * @param {string} chap 
 * @param {string} sec 
 * @return {string} url
 */
function genUrl(book_name, chap, sec) {
    const book = BibleConstantHelper.getBookId(book_name.toLowerCase());
    const engs = BibleConstantHelper.getBookNameArrayEnglishNormal()[book - 1]; // book id 從 1 開始，但陣列從 0 開始，所以要 -1

    if (chap == 0 || sec == 0) {
        sec = 0
        chap = 0
    }

    // url (注意! book 不是 bookId，3 就是註釋資料)
    const url = `sc.php?engs=${engs}&chap=${chap}&sec=${sec}&book=3&gb=0`;

    const full_url = "http://127.0.0.1:5600/json/" + url;

    return full_url;
}