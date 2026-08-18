import { BibleConstantHelper } from "./../../index/BibleConstantHelper.es2023.js"
import { isRDLocation } from "./../../index/isRDLocation.es2023.js"
import { parseTsk } from "./../../index/tsks/parseTsk.js"

import { cvt_ref_to_chinese } from "./../../index/tsks/cvt_ref_to_chinese.js";

const $ = (sel) => document.querySelector(sel);

$("#btnGet").addEventListener("click", async () => {
    const book = parseInt($("#inpBook").value, 10);
    const chap = parseInt($("#inpChap").value, 10);
    const sec = parseInt($("#inpSec").value, 10);
    await fetchAndRender({ book, chap, sec });
});

$("#btnPrev").addEventListener("click", async () => {
    const book = parseInt($("#btnPrev").getAttribute("book") || "1", 10);
    const chap = parseInt($("#btnPrev").getAttribute("chap") || "1", 10);
    const sec = parseInt($("#btnPrev").getAttribute("sec") || "1", 10);

    // 更新 #inpBook #inpChap #inpSec 的值，並且以 trigger click #btnGet 的方式進行
    if (book > 0) {
        const chinese = BibleConstantHelper.getBookNameArrayChineseShort()[book - 1];
        $("#inpBook").value = book;
        $("#inpChap").value = chap;
        $("#inpSec").value = sec;
        $("#btnGet").click();
    }
});

$("#btnNext").addEventListener("click", async () => {
    const book = parseInt($("#btnNext").getAttribute("book") || "1", 10);
    const chap = parseInt($("#btnNext").getAttribute("chap") || "1", 10);
    const sec = parseInt($("#btnNext").getAttribute("sec") || "1", 10);

    // 更新 #inpBook #inpChap #inpSec 的值，並且以 trigger click #btnGet 的方式進行
    if (book > 0) {
        const chinese = BibleConstantHelper.getBookNameArrayChineseShort()[book - 1];
        $("#inpBook").value = book;
        $("#inpChap").value = chap;
        $("#inpSec").value = sec;
        $("#btnGet").click();
    }

});

async function fetchAndRender(address) {
    const apiTextResult = await api_tsk(address);

    let joApiResult = null;
    try {
        joApiResult = JSON.parse(apiTextResult);

        $("#rawContent").textContent = JSON.stringify(joApiResult?.record?.[0]?.com_text ?? "");
    } catch (e) {
        joApiResult = null;
    }

    if (joApiResult) {
        updatePrevNextButtons(joApiResult);

        // 解析內容
        const tskContent = joApiResult?.record?.[0]?.com_text;
        if (tskContent == null) {
            $("#parsedContent").textContent = "(無內容)";
            return
        }

        const tskBlocks = parseTsk(tskContent, address);

        // 依 UI 選項處理書卷名稱
        const mode = $("#selBookNameMode")?.value || "none"; // none | abbr | full
        applyBookNameMode(tskBlocks, mode, false);

        // 解析後內容尚未處理，保留佔位
        // $("#parsedContent").textContent = "(尚未處理)";

        // 顯示 ... 但把每個 block 的 raw 先拿掉
        tskBlocks.forEach(block => {
            delete block.raw;
        });

        $("#parsedContent").textContent = JSON.stringify(tskBlocks, null, 2);
    }
}

/**
 * sc.php?book=4&engs=Mark&gb=0&chap=1&sec=1
 */
function gen_tsk_url(address, gb) {
    const engs = BibleConstantHelper.getBookNameArrayEnglishNormal()[address[0] - 1];
    const endpoint = `sc.php?book=4&engs=${engs}&chap=${address[1]}&sec=${address[2]}&gb=${gb}`;
    const domain = isRDLocation() ? "http://127.0.0.1:15600/json" : "/json";
    return `${domain}/${endpoint}`;
}

async function api_tsk({ book, chap, sec }) {
    const gb = 0;
    const url = gen_tsk_url([book, chap, sec], gb);
    const response = await fetch(url);
    return await response.text();
}

function updatePrevNextButtons(joApiResult) {
    // next
    const joNext = joApiResult.next;
    if (joNext) {
        const book = BibleConstantHelper.getBookId(joNext.engs.toLowerCase());
        const chap = joNext.chap;
        const sec = joNext.sec;
        $("#btnNext").setAttribute("book", book);
        $("#btnNext").setAttribute("chap", chap);
        $("#btnNext").setAttribute("sec", sec);
    }

    const joPrev = joApiResult.prev;
    if (joPrev) {
        const book = BibleConstantHelper.getBookId(joPrev.engs.toLowerCase());
        const chap = joPrev.chap;
        const sec = joPrev.sec;
        $("#btnPrev").setAttribute("book", book);
        $("#btnPrev").setAttribute("chap", chap);
        $("#btnPrev").setAttribute("sec", sec);
    }
}

/**
 * 將 parseTsk 的 ref item 依模式轉為中文書卷
 * @param {any[]} tskBlocks
 * @param {"none"|"abbr"|"full"} mode
 * @param {boolean} isgb
 */
function applyBookNameMode(tskBlocks, mode, isgb) {
    if (!Array.isArray(tskBlocks) || mode === "none") return;

    const isfullname = mode === "full";

    for (const block of tskBlocks) {
        if (!block || !Array.isArray(block.items)) continue;

        for (const it of block.items) {
            if (!it || it.type !== "ref") continue;

            if (typeof it.w === "string") {
                it.w = cvt_ref_to_chinese(it.w, isgb, isfullname);
            }
            if (typeof it.ref === "string") {
                it.ref = cvt_ref_to_chinese(it.ref, isgb, isfullname);
            }
        }
    }
}
