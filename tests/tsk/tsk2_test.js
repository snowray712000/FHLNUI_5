import { BibleConstantHelper } from "./../../index/BibleConstantHelper.es2023.js";
import { isRDLocation } from "./../../index/isRDLocation.es2023.js";
import { parseTsk } from "./../../index/tsks/parseTsk.js";
import { cvt_ref_to_chinese } from "./cvt_ref_to_chinese.js";

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

    const tskBlocks = parseTsk(tskContent, address);

    // 預設：中文簡稱
    applyBookNameMode(tskBlocks, "abbr", false);

    displayTskBlocks(tskBlocks);
}

function displayTskBlocks(tskBlocks) {
    const container = $("#parsedContent");
    container.innerHTML = "";

    if (!Array.isArray(tskBlocks) || tskBlocks.length === 0) {
        container.innerHTML = `<div class="text-muted">本節無資料</div>`;
        return;
    }

    tskBlocks.forEach((block, idx) => {
        const section = document.createElement("section");
        section.className = "section";

        if (block.type === "summary") {
            section.innerHTML = `
                <div class="section-title h3 mb-2">本章總覽</div>
                ${renderSummary(block.items)}
            `;
        } else if (block.type === "refOnly") {
            section.innerHTML = `
                <div class="section-title h3 mb-2">本節相關經文</div>
                <div>${renderItems(block.items)}</div>
            `;
        } else if (block.type === "keyword") {
            section.innerHTML = `
                <div class="section-title h3 mb-2">關鍵字: ${escapeHtml(block.keyword || "(未命名)")}</div>
                <div>${renderItems(block.items)}</div>
            `;
        } else if (block.type === "empty") {
            section.innerHTML = `<div class="text-muted">本節無資料</div>`;
        } else {
            section.innerHTML = `<div>${renderItems(block.items)}</div>`;
        }

        container.appendChild(section);

        if (idx < tskBlocks.length - 1) {
            const hr = document.createElement("hr");
            hr.className = "section-divider";
            container.appendChild(hr);
        }
    });
}


function renderSummary(items) {
    // 新格式：parseTsk 已輸出 summaryItem { type, text, ref, w }
    const summaryItems = (items || []).filter(it => it && it.type === "summaryItem");
    if (summaryItems.length > 0) {
        const lis = summaryItems.map(it => {
            const w = String(it.w || "");
            const ref = String(it.ref || "");
            const text = String(it.text || "");
            return `<li><a class="ref-link" href="#" data-ref="${escapeHtml(ref)}">${escapeHtml(w)}</a>; ${escapeHtml(text)}</li>`;
        });
        return `<ul class="summary-list">${lis.join("")}</ul>`;
    }

    // 舊格式 fallback（保留相容）
    const raw = (items || []).map(x => x?.w || x?.ref || "").join(" ");
    const list = [];
    const re = /(\d+)\s*;\s*([^;]+;?)/g;
    let m;

    while ((m = re.exec(raw))) {
        const no = m[1];
        const txt = (m[2] || "").trim();
        list.push(`<li><a class="ref-link" href="#">${escapeHtml(no)}</a>; ${escapeHtml(txt)}</li>`);
    }

    if (list.length === 0) return `<div>${renderItems(items)}</div>`;
    return `<ul class="summary-list">${list.join("")}</ul>`;
}

function renderItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return `<span class="text-muted">（無）</span>`;
    }

    const lines = [];
    let inlineBuf = [];

    const flushInline = () => {
        if (inlineBuf.length > 0) {
            lines.push(`<div>${inlineBuf.join(" ")}</div>`);
            inlineBuf = [];
        }
    };

    for (const it of items) {
        if (it?.type === "ref") {
            flushInline();

            const refText = it.ref || it.w || "";
            const refShow = it.w || it.ref || "";
            lines.push(
                `<div><a class="ref-link" href="#" data-ref="${escapeHtml(refText)}">${escapeHtml(refShow)}</a></div>`
            );
            continue;
        }

        // 新增：渲染 add-in-text
        if (it?.type === "add-in-text") {
            flushInline();
            lines.push(renderAddInText(it));
            continue;
        }

        if (it?.type === "text-fb") {
            const txt = String(it.w || "");
            inlineBuf.push(`<span><strong>${escapeHtml(txt)}</strong></span>`);
            continue;
        }

        const txt = String(it?.w || "");
        const cls = /^(Heb|Gr)\./i.test(txt.trim()) ? "note-text" : "";
        inlineBuf.push(`<span class="${cls}">${escapeHtml(txt)}</span>`);
    }

    flushInline();
    return lines.join("");
}

function renderAddInText(it) {
    const arr = Array.isArray(it?.item) ? it.item : [];
    if (arr.length === 0) return "";

    const segs = arr.map(x => {
        if (x?.type === "sn") {
            const tp = String(x.tp || "").toUpperCase(); // H / G
            const sn = String(x.sn || "");
            if (!tp || !sn) return "";
            return `<span class="sn" data-tp="${escapeHtml(tp)}" data-sn="${escapeHtml(sn)}">${escapeHtml(tp + sn)}</span>`;
        }

        if (x?.type === "ref") {
            const w = String(x.w || x.ref || "");
            const ref = String(x.ref || x.w || "");
            if (!w || !ref) return "";
            return `<a class="ref-link" href="#" data-ref="${escapeHtml(ref)}">${escapeHtml(w)}</a>`;
        }

        return "";
    }).filter(Boolean);

    if (segs.length === 0) return "";
    return `<div class="text-muted"><small>文中特殊字眼：${segs.join("、")}</small></div>`;
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

function escapeHtml(s) {
    return String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
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
