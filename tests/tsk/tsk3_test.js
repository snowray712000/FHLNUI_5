/// <reference path='./../../libs/jsdoc/jquery.js' />

import { dtexts_render } from "../../index/dtext/dtexts_render.js";
import { cvt_tsk_blocks_to_dtexts } from "../../index/tsks/cvt_tsk_blocks_to_dtexts.js";
import { BibleConstantHelper } from "./../../index/BibleConstantHelper.es2023.js";
import { isRDLocation } from "./../../index/isRDLocation.es2023.js";
import { parseTsk } from "./../../index/tsks/parseTsk.js";
import { cvt_ref_to_chinese } from "./../../index/tsks/cvt_ref_to_chinese.js";

const $ = (sel) => document.querySelector(sel);

$("#btnGet")?.addEventListener("click", async () => {
    const book = parseInt($("#inpBook")?.value || "1", 10);
    const chap = parseInt($("#inpChap")?.value || "1", 10);
    const sec = parseInt($("#inpSec")?.value || "1", 10);
    await fetchAndRender({ book, chap, sec });
});

$("#btnPrev")?.addEventListener("click", async () => {
    const book = parseInt($("#btnPrev")?.getAttribute("book") || "1", 10);
    const chap = parseInt($("#btnPrev")?.getAttribute("chap") || "1", 10);
    const sec = parseInt($("#btnPrev")?.getAttribute("sec") || "1", 10);

    $("#inpBook").value = String(book);
    $("#inpChap").value = String(chap);
    $("#inpSec").value = String(sec);

    await fetchAndRender({ book, chap, sec });
});

$("#btnNext")?.addEventListener("click", async () => {
    const book = parseInt($("#btnNext")?.getAttribute("book") || "1", 10);
    const chap = parseInt($("#btnNext")?.getAttribute("chap") || "1", 10);
    const sec = parseInt($("#btnNext")?.getAttribute("sec") || "1", 10);

    $("#inpBook").value = String(book);
    $("#inpChap").value = String(chap);
    $("#inpSec").value = String(sec);

    await fetchAndRender({ book, chap, sec });
});

$("#btnCreate")?.addEventListener("click", async () => {
    $("#inpBook").value = "1";
    $("#inpChap").value = "1";
    $("#inpSec").value = "1";
    await fetchAndRender({ book: 1, chap: 1, sec: 1 });
});

async function fetchAndRender(address) {
    const apiTextResult = await api_tsk(address);
    let joApiResult = null;

    try {
        joApiResult = JSON.parse(apiTextResult);
    } catch {
        joApiResult = null;
    }

    if (!joApiResult) {
        $("#parsedContent").innerHTML = `<div class="alert alert-danger">API 回傳格式錯誤</div>`;
        return;
    }

    updatePrevNextButtons(joApiResult);

    const chinese = BibleConstantHelper.getBookNameArrayChineseShort()[address.book - 1] || "";
    if ($("#btnCreate")) $("#btnCreate").textContent = `${chinese}${address.chap}:${address.sec}`;

    const tskContent = joApiResult?.record?.[0]?.com_text;
    if (tskContent == null) {
        $("#parsedContent").innerHTML = `<div class="text-muted">本節無資料</div>`;
        return;
    }

    console.log(JSON.stringify(tskContent));

    const tskBlocks = parseTsk(tskContent, address);
    console.log(JSON.stringify(tskBlocks));

    console.log(tskBlocks);


    // 預設：中文簡稱
    applyBookNameMode(tskBlocks, "abbr", false);

    const dtextsForDisplay = cvt_tsk_blocks_to_dtexts(tskBlocks, address);
    console.log(dtextsForDisplay);

    const $html1 = dtexts_render(dtextsForDisplay)

    $("#parsedContent").innerHTML = "";
    for (const h1 of $html1) {
        $("#parsedContent").append(h1);
    }
}



/*
若是 SN 類，就是 <span class="sn" data-tp="H" data-sn="2050">H2050</span>
若是 SN 類，就是 <span class="sn" data-tp="G" data-sn="2050">G2050</span>
若是 ref 類，就是 <a class="ref-link" href="#" data-ref="創1:1">創1:1</a>
然後再都用「、」分開。
*/

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
            if (!it) continue;

            // 一般 ref item
            if (it.type === "ref") {
                if (typeof it.w === "string") {
                    it.w = cvt_ref_to_chinese(it.w, isgb, isfullname);
                }
                if (typeof it.ref === "string") {
                    it.ref = cvt_ref_to_chinese(it.ref, isgb, isfullname);
                }
                continue;
            }

            // summaryItem: 只需要轉 ref
            if (it.type === "summaryItem" && typeof it.ref === "string") {
                it.ref = cvt_ref_to_chinese(it.ref, isgb, isfullname);
            }
        }
    }
}


/**
 * sc.php?book=4&engs=Mark&gb=0&chap=1&sec=1
 */
function gen_tsk_url([book, chap, sec], gb) {
    const engs = BibleConstantHelper.getBookNameArrayEnglishNormal()[book - 1];
    const endpoint = `sc.php?book=4&engs=${engs}&chap=${chap}&sec=${sec}&gb=${gb}`;
    const domain = isRDLocation() ? "http://127.0.0.1:15600/json" : "/json";
    return `${domain}/${endpoint}`;
}

async function api_tsk({ book, chap, sec }) {
    const url = gen_tsk_url([book, chap, sec], 0);
    const response = await fetch(url);
    return await response.text();
}

function updatePrevNextButtons(joApiResult) {
    const joNext = joApiResult?.next;
    if (joNext) {
        const book = BibleConstantHelper.getBookId(String(joNext.engs).toLowerCase());
        $("#btnNext")?.setAttribute("book", String(book));
        $("#btnNext")?.setAttribute("chap", String(joNext.chap));
        $("#btnNext")?.setAttribute("sec", String(joNext.sec));
    }

    const joPrev = joApiResult?.prev;
    if (joPrev) {
        const book = BibleConstantHelper.getBookId(String(joPrev.engs).toLowerCase());
        $("#btnPrev")?.setAttribute("book", String(book));
        $("#btnPrev")?.setAttribute("chap", String(joPrev.chap));
        $("#btnPrev")?.setAttribute("sec", String(joPrev.sec));
    }
}

// 初始載入：創 1:1
fetchAndRender({ book: 1, chap: 1, sec: 1 });
