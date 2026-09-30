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
// vercol 本來是併排用的，但交錯時，它其實裡面的內容就不是同一譯本了。
// 新增「段落功能後」，.lec 原本是「單節」的設計，現在多一層 grouped 的概念，新增 .paragraph 的 div 好了。
// 也就是說 以後 模式4，交錯的話，應該是 <div.paragraph ver='ver1'> </div> <div.paragraph ver='ver2'> </div> 也就是說, 真正確定同個譯本的, 會是 .paragraph，也不是 .vercol。

// <div#lecMain>
//     <div.vercol>
//     <div.lec>...第1節內容...</div>
//     <div.lec>...第2節內容...</div>
//     <div.lec>...</div>
//     </div>
//     <div.vercol>
//     <div.lec>...</div>
//     <div.lec>...</div>
//     <div.lec>...</div>
//     </div>
//     <div#div_copyright.vercol>...</div>
// </div>

/**
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").TpResultBibleText} TpResultBibleText
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").TpOneRecordBibleText} TpOneRecordBibleText
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").DAddress} DAddress
 */

import { queryFootsAsync } from "../queryFootsAsync.js"
import { render_dtexts } from "../render_dtexts.js";
import { SnFilter } from "../SnFilter.es2023.js";
/**
 * @param {JQuery<HTMLElement>} text_jq 一節的內容 (還沒放進 .lec)
 * @param {{addr?: string, ver?: string}} [verseInfo] 動詞形態篩選要知道是哪一節、哪個譯本
 */
function add_sn_hidden_if_need(text_jq, verseInfo = {}) {
    // 因為現在所有資料都包含 sn，所以若 strong=0，則要隱藏；篩選時只顯示指定的 (docs/z260928e)
    SnFilter.s.apply(text_jq, verseInfo)
}
function is_merge_with_prev_verse(dtexts_with_addr2) {
    // 例如歌羅西書2:21節，會有一筆資料是 sec=21，bible_text="a"，這筆資料的內容是「併入上節」，它的 verse number 是 21，但實際上它應該是併入上一節的，所以在 render 的時候，要把它的 verse number 隱藏掉。
    const dtexts = dtexts_with_addr2[3]
    if (dtexts.length != 1) return false;

    if (dtexts[0].w == "a") return true;

    return false;
}


/**
 * 
 * @param {TpResultBibleText[]} rspApp 
 * @returns {JQuery<HTMLElement>} htmlContent
 */
export async function FhlLecture_render_core(rspApp, mode) {
    const ps = TPPageState.s

    const contentVm = await build_view_model(rspApp, mode)
    if ((mode === 1 || mode === 3) && isLecGridEnabled()) {
        return render_grid(contentVm, ps.fontSize)
    }
    const copyDir = (mode === 1 || mode === 3) ? "col" : "row"
    const layoutVm = build_layout_vm(contentVm, mode, copyDir)

    const htmlContent = generate_htmlContent_with_VersionColumns(rspApp, ps.fontSize, mode)

    for (const item of layoutVm.vercols) {
        const div_grouped = render_paragraph_div(item)

        // col 模式：每個譯本對應自己的欄；row 模式：全部放第 0 欄
        const col_index = (mode === 1 || mode === 3)
            ? rspApp.findIndex(r => r.version === item.version)
            : 0

        htmlContent.children().eq(col_index).append(div_grouped)
    }

    return htmlContent;
}

/**
 * 並排 (mode 1/3) 用 CSS Grid (docs/z260930d 第四節)；localStorage fhlLecLayout = 'div' 可切回舊版 (inline-block + reshape 量高度)
 * @returns {boolean}
 */
export function isLecGridEnabled() {
    try { return localStorage.getItem('fhlLecLayout') != 'div' } catch { return true }
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

        const span_lec = $("<span>")
            .addClass('lec')
            .attr('ver', version)
            .attr('chap', verse.chap)
            .attr('sec', verse.sec)
            .attr('book', verse.book)

        if (!verse.hideVerseNumber) {
            const numSpan = generate_verse_number_jdom(verse.sec, version)
            if (verse.verseLabel !== String(verse.sec)) {
                numSpan.text(verse.verseLabel + ' ')
            }
            span_lec.append(numSpan)
        }

        const span_verseContent = $("<span>").addClass('verseContent')
        // render_dtexts 需要原始 dtexts_with_addr 格式 [book, chap, sec, dtexts[]]
        const dtexts_with_addr2 = [verse.book, verse.chap, verse.sec, verse.dtexts]
        const htmlContentOfVerse = render_dtexts([dtexts_with_addr2], version)
        add_sn_hidden_if_need(htmlContentOfVerse, { addr: `${verse.book}.${verse.chap}.${verse.sec}`, ver: version })

        span_verseContent.append(htmlContentOfVerse)
        span_lec.append(span_verseContent)
        div_grouped.append(span_lec)
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
 * - 同時保留本節 placeholder（便於 mode1/2/row 對齊）
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

                if (is_merge_with_prev_verse(dtexts_with_addr2)) {
                    // 先更新上一節 label
                    const last = verses[verses.length - 1];
                    if (last != null) {
                        const start = String(last.verseLabel).split("-")[0];
                        last.verseLabel = `${start}-${sec}`;
                        last.mergedSecs.push(sec);
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

                verses.push({
                    book,
                    chap,
                    sec,
                    dtexts,
                    verseLabel: String(sec),
                    mergedSecs: [],
                    isMergePlaceholder: false,
                    hideVerseNumber: false,
                    hideVerseContent: false
                });
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
 * @typedef {{ mode:number, copyDir:"col"|"row", vercols:VercolItem[] }} LayoutVm
 */

/**
 * 所有 mode 都產生 .vercol 陣列
 * @param {ContentVm} contentVm
 * @param {number} mode
 * @param {"col"|"row"} copyDir
 * @returns {LayoutVm}
 */
function build_layout_vm(contentVm, mode, copyDir) {
    const versions = contentVm.versions;

    /** @type {VercolItem[]} */
    const vercols = [];

    // mode1: fake paragraph（每段通常一節）
    if (mode === 1) {
        if (copyDir === "col") {
            for (const v of versions) {
                for (const p of v.paragraphs) {
                    // 每個譯本同一個 .vercol 承載多 paragraph，render 時可按 version 聚合
                    // 若你偏好先 layout 就聚合，可改成另一種結構
                    vercols.push({ version: v.version, isRtl: v.isRtl, paragraph: p });
                }
            }
        } else {
            // row: 以 paragraph index 交錯，仍然每格是 .vercol
            const maxP = Math.max(...versions.map(v => v.paragraphs.length), 0);
            for (let pi = 0; pi < maxP; pi++) {
                for (const v of versions) {
                    const p = v.paragraphs[pi];
                    if (p) vercols.push({ version: v.version, isRtl: v.isRtl, paragraph: p });
                }
            }
        }
        return { mode, copyDir, vercols };
    }

    // mode2: 單欄交錯（每節一段），但容器仍是 .vercol
    if (mode === 2) {
        const maxP = Math.max(...versions.map(v => v.paragraphs.length), 0);
        for (let pi = 0; pi < maxP; pi++) {
            for (const v of versions) {
                const p = v.paragraphs[pi];
                if (p) vercols.push({ version: v.version, isRtl: v.isRtl, paragraph: p });
            }
        }
        return { mode, copyDir: "col", vercols };
    }

    // mode3: 真段落
    if (mode === 3) {
        if (copyDir === "col") {
            for (const v of versions) {
                for (const p of v.paragraphs) {
                    vercols.push({ version: v.version, isRtl: v.isRtl, paragraph: p });
                }
            }
        } else {
            const maxP = Math.max(...versions.map(v => v.paragraphs.length), 0);
            for (let pi = 0; pi < maxP; pi++) {
                for (const v of versions) {
                    const p = v.paragraphs[pi];
                    if (p) vercols.push({ version: v.version, isRtl: v.isRtl, paragraph: p });
                }
            }
        }
        return { mode, copyDir, vercols };
    }

    // mode4: 單欄交錯（每段）
    if (mode === 4) {
        const maxP = Math.max(...versions.map(v => v.paragraphs.length), 0);
        for (let pi = 0; pi < maxP; pi++) {
            for (const v of versions) {
                const p = v.paragraphs[pi];
                if (p) vercols.push({ version: v.version, isRtl: v.isRtl, paragraph: p });
            }
        }
        return { mode, copyDir: "col", vercols };
    }

    return { mode, copyDir, vercols };
}
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


/**
 * 
 * @param {TpResultBibleText} rspArr 
 * @param {number} fontSizeOfPs ps.fontSize
 * @returns 
 */
function generate_htmlContent_with_VersionColumns(rspArr, fontSizeOfPs, mode = 1) {
    // case1: 不同版本，併排顯示；case2，不同版本，交錯顯示
    // 注意, 這個變數, 只是暫存的, 它輽出的結果是 html 文字, 不包含自己, 所以lecMain屬性是在另種設定, 不是在這
    // 不要再從這裡改 <div style=padding:10px 50px></div>, 不會有效果的.
    let $htmlContent = $("<div id='lecMain'></div>");

    const cnt_version = (mode == 1 || mode == 3) ? rspArr.length : 1;
    let cx1 = 100 / cnt_version;
    for (let j = 0; j < cnt_version; j++) {
        // 分3欄
        let onever = $("<div class='vercol' style='width:" + cx1 + "%;display:inline-block;vertical-align:top; margin-top: " + (fontSizeOfPs * 1.25 - 15) + "px'></div>");

        $htmlContent.append(onever);
    }

    return $htmlContent;
}

