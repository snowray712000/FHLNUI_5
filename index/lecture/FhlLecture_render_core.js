/**
 * @typedef {import("../DText.js").DText} DText
 */
import { charHG } from "../charHG.es2023.js";
import { TPPageState } from "../TPPageState.es2023.js"

import { addHebrewOrGreekCharClass, generate_verse_number_jdom, isHebrewOrGeekVersion, parseBibleText, replace_newline_char } from "./FhlLecture_render_mode_common_es2023.js";
import { Hash_DAddress } from "../Hash_DAddress_es2023.js";
import { ParagraphData } from '../ParagraphData_es2023.js'
import { grouping_by_paragraph } from "../grouping_by_paragraph.js";
import { cvt_others } from "../cvt_others.js";
import { grouping_by_paragraph_for_dtexts_with_addr } from '../grouping_by_paragraph_for_dtexts_with_addr.js'
// 並排 (mode 1/3)：render_grid()，CSS Grid (docs/z260930d)
// <div#lecMain>
//     <div.lec-grid>
//         <div.vercol ver=unv> (display: contents) <div.paragraph data-row style="grid-column; grid-row"> <span.lec>… </div> … </div>
//         <div.vercol ver=kjv> … </div>
//     </div>
// </div>
// 交錯 (mode 2/4)：<div#lecMain> <div.vercol> <div.paragraph ver=unv> <div.paragraph ver=kjv> … </div> </div>
//   (.vercol 在交錯時只是容器，真正確定譯本的是 .paragraph[ver])

/**
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").TpResultBibleText} TpResultBibleText
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").TpOneRecordBibleText} TpOneRecordBibleText
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").DAddress} DAddress
 */

import { queryFootsAsync } from "../queryFootsAsync.js"
import { renderVerseLec, isMergedWithPrev, extendVerseLabel } from "../VerseGrid.es2023.js";
/**
 * 
 * @param {TpResultBibleText[]} rspApp 
 * @returns {JQuery<HTMLElement>} htmlContent
 */
export async function FhlLecture_render_core(rspApp, mode) {
    const ps = TPPageState.s

    const contentVm = await build_view_model(rspApp, mode)
    if (mode === 1 || mode === 3) return render_grid(contentVm, ps.fontSize)
    return render_interleaved(contentVm, ps.fontSize)
}

/**
 * 交錯 (mode 2/4)：一個 .vercol，同一段 (mode 2 是每節) 的各譯本輪流
 * @param {ContentVm} contentVm
 * @param {number} fontSizeOfPs ps.fontSize
 * @returns {JQuery<HTMLElement>} 外層是暫時的 div#lecMain (呼叫端取 .html())
 */
function render_interleaved(contentVm, fontSizeOfPs) {
    const $htmlContent = $("<div id='lecMain'></div>")
    const $vercol = $("<div class='vercol'></div>")
        .css({ width: '100%', display: 'inline-block', 'vertical-align': 'top', 'margin-top': `${fontSizeOfPs * 1.25 - 15}px` })
        .appendTo($htmlContent)
    const versions = contentVm.versions
    const maxP = Math.max(...versions.map(v => v.paragraphs.length), 0)
    for (let pi = 0; pi < maxP; pi++) {
        for (const v of versions) {
            const paragraph = v.paragraphs[pi]
            if (paragraph == null) continue
            if (paragraph.verses.length && paragraph.verses.every(a => a.hideVerseContent)) continue // 整段併入上節 (mode 2 一節一段)
            $vercol.append(render_paragraph_div({ version: v.version, isRtl: v.isRtl, paragraph }))
        }
    }
    return $htmlContent
}

/**
 * 並排的 CSS Grid 版：
 * - .lec-grid (grid) > .vercol (display: contents，一個譯本一個) > .paragraph (grid item)
 * - DOM 仍是一欄一欄 (欄優先)，原生反白沿欄往下；各欄第 i 段在同一列 → 列高由 grid 對齊，不用 reshape
 * - 整段都是「併入上節」的 placeholder → 不產生元素，上一段往下跨列 (grid-row: r / span n)
 * - .paragraph 帶 data-row (列，0 起)，LecCopyTable 一段一列時用
 * @param {ContentVm} contentVm
 * @param {number} fontSizeOfPs ps.fontSize
 * @returns {JQuery<HTMLElement>} 外層是暫時的 div#lecMain (呼叫端取 .html())
 */
function render_grid(contentVm, fontSizeOfPs) {
    const versions = contentVm.versions
    const $htmlContent = $("<div id='lecMain'></div>")
    const $grid = $("<div class='lec-grid'></div>")
        .css({ '--lec-cols': String(Math.max(versions.length, 1)), 'padding-top': `${Math.max(fontSizeOfPs * 1.25 - 15, 0)}px` })
        .appendTo($htmlContent)

    versions.forEach((v, iCol) => {
        const $vercol = $("<div class='vercol'></div>").attr('ver', v.version).appendTo($grid)
        /** @type {{$p: JQuery<HTMLElement>, row: number, span: number} | null} */
        let last = null
        v.paragraphs.forEach((paragraph, iRow) => {
            if (paragraph.verses.length && paragraph.verses.every(a => a.hideVerseContent)) {
                if (last) {
                    last.span++
                    last.$p.css('grid-row', `${last.row + 1} / span ${last.span}`)
                }
                return
            }
            const $p = render_paragraph_div({ version: v.version, isRtl: v.isRtl, paragraph })
                .css({ margin: '', padding: '', height: '', 'grid-column': String(iCol + 1), 'grid-row': String(iRow + 1) }) // 字串：避免 jQuery 補 px
                .attr('data-row', iRow)
                .appendTo($vercol)
            last = { $p, row: iRow, span: 1 }
        })
    })
    return $htmlContent
}

/**
 * 將一個 VercolItem（版本 + 段落 vm）render 成 div.paragraph
 * @param {VercolItem} item
 * @returns {JQuery<HTMLElement>}
 */
function render_paragraph_div(item) {
    const { version, isRtl, paragraph } = item

    const div_grouped = $("<div>").css({
        margin: '0px 0.25rem 0px 0.25rem',
        padding: '7px 0px',
        height: '100%',
    }).addClass('paragraph').attr('ver', version)

    if (isRtl) {
        div_grouped.css({ 'text-align': 'right', 'direction': 'rtl' })
    }

    for (const verse of paragraph.verses) {
        if (verse.hideVerseContent) continue
        div_grouped.append(renderVerseLec(verse, version)) // 與交互參照共用 (index/VerseGrid.es2023.js)
    }

    return div_grouped
}
/**
 * @typedef {{
 *   book:number,
 *   chap:number,
 *   sec:number,
 *   dtexts:import("../DText.js").DText[],
 *   verseLabel:string,
 *   mergedSecs:number[],
 *   isMergePlaceholder:boolean, // 這節是 "a" 併入上節
 *   hideVerseNumber:boolean,    // 對應 UI 上 verseNumber 要不要顯示
 *   hideVerseContent:boolean    // 對應 UI 上 verseContent 要不要顯示
 * }} VmVerse
 *
 * @typedef {{
 *   paragraphIndex:number,
 *   title:string,
 *   recordIndices:number[],
 *   verses:VmVerse[]
 * }} VmParagraph
 *
 * @typedef {{
 *   version:string,
 *   isRtl:boolean,
 *   paragraphs:VmParagraph[]
 * }} VmVersion
 */

/**
 * @typedef {{
 *   paragraphDataUsed:any[],
 *   versions:VmVersion[]
 * }} ContentVm
 */

/**
 * 只做資料整理，不做畫面 render。
 * 規則：
 * - "a" 併入上節時，上一節 verseLabel 變成 20-21
 * - 同時保留本節 placeholder（hideVerseContent：交錯時略過；並排 grid 時整段都是 placeholder → 上一段 span）
 * @param {TpResultBibleText[]} rspArr
 * @param {number} mode
 * @returns {Promise<ContentVm>}
 */
async function build_view_model(rspArr, mode) {
    const ps = TPPageState.s;
    const paragraphDataUsed = get_paragraphs(mode, rspArr);

    /** @type {VmVersion[]} */
    const versions = [];

    for (let iver = 0; iver < rspArr.length; iver++) {
        const version = rspArr[iver].version;
        const one_result = rspArr[iver];

        let dtexts_with_addrs = cvt_others(
            version,
            one_result.record.map(a1 => [a1.book, a1.chap, a1.sec, a1.bible_text])
        );

        if (ps.foot_note_show_method == 2) {
            await queryFootsAsync(dtexts_with_addrs, version);
        }

        const grouped = grouping_by_paragraph_for_dtexts_with_addr(dtexts_with_addrs, paragraphDataUsed);

        /** @type {VmParagraph[]} */
        const paragraphs = [];
        /** @type {VmVerse | null} 上一個真的節 (跨段：mode 1 一節一段，併入上節的那節自成一段) */
        let lastReal = null;

        for (let iGrouped = 0; iGrouped < grouped.length; iGrouped++) {
            const one_group = grouped[iGrouped];
            const recordIndices = one_group[0];
            const paragraphIndex = one_group[1];
            const title = paragraphIndex != -1 ? paragraphDataUsed[paragraphIndex][3] : "";

            /** @type {VmVerse[]} */
            const verses = [];

            for (const idx of recordIndices) {
                const dtexts_with_addr2 = dtexts_with_addrs[idx];
                const book = dtexts_with_addr2[0];
                const chap = dtexts_with_addr2[1];
                const sec = dtexts_with_addr2[2];
                const dtexts = dtexts_with_addr2[3];

                // 例如歌羅西書2:21 (和合本) 的資料是 "a" (併入上節)：上一節節碼變成 20-21，本節不顯示
                if (isMergedWithPrev(dtexts)) {
                    // 先更新上一節 label
                    if (lastReal != null) {
                        lastReal.verseLabel = extendVerseLabel(lastReal.verseLabel, sec);
                        lastReal.mergedSecs.push(sec);
                    }

                    // 再保留本節 placeholder（你剛決定要保留）
                    verses.push({
                        book,
                        chap,
                        sec,
                        dtexts,
                        verseLabel: "",
                        mergedSecs: [],
                        isMergePlaceholder: true,
                        hideVerseNumber: true,
                        hideVerseContent: true
                    });
                    continue;
                }

                lastReal = {
                    book,
                    chap,
                    sec,
                    dtexts,
                    verseLabel: String(sec),
                    mergedSecs: [],
                    isMergePlaceholder: false,
                    hideVerseNumber: false,
                    hideVerseContent: false
                };
                verses.push(lastReal);
            }

            paragraphs.push({
                paragraphIndex,
                title,
                recordIndices,
                verses
            });
        }

        versions.push({
            version,
            isRtl: version === "bhs",
            paragraphs
        });
    }

    return { paragraphDataUsed, versions };
}
/**
 * @typedef {{ version:string, isRtl:boolean, paragraph:VmParagraph }} VercolItem
 */
function get_paragraphs(mode, rspApp) {
    // 先假設，內容一定是同一章，同卷書
    if (mode == 3 || mode == 4) {
        
        const paragraphData = ParagraphData.s.isReadyAndStartingIfNeed() ? ParagraphData.s.data : [[1, 1, 1, "上帝的創造"], [1, 2, 4, "創造的另一記載"], [1, 3, 1, "人違背命令"], [1, 3, 14, "上帝的宣判"], [1, 3, 22, "亞當和夏娃被趕出伊甸園"]]
        return paragraphData

    } else {
        // 我先作好 mode 3，然後意識到 mode1 其實就是 mode 3 的每一節為一段的特例, 就作這個假的分段, 就可以用同一個程式碼了
        const paragraphDataFake = (mode == 1 || mode == 2) ? gen_fake_groups_for_mode1(get_all_address_need(rspApp)) : null
        return paragraphDataFake
    }
    return null

    function gen_fake_groups_for_mode1(dtexts_with_addrs) {
        // 原本是 [book, chap, sec, dtexts[]]
        // 現在 map 產生 [book, chap, sec, ""] 即可
        return dtexts_with_addrs.map(a1 => {
            return [a1[0], a1[1], a1[2], ""]
        })
    }
    function get_all_address_need(rspApp) {
        // 每一個 rspApp 的 record 的每一個 record 的 book, chap, sec 可以 toHash
        let allhashs = rspApp.map(a1 => a1.record.map(a2 => Hash_DAddress.toHash(a2)))
        allhashs = allhashs.flat()

        // unique
        allhashs = [...new Set(allhashs)]

        // order
        allhashs.sort((a, b) => a - b)

        // return
        const addrs = allhashs.map(a1 => Hash_DAddress.toAddress(a1))
        return addrs
    }
}



