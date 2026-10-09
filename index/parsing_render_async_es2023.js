import { FhlInfoContent } from "./FhlInfoContent.es2023.js";
import { getAjaxUrl } from "./getAjaxUrl.es2023.js";
import { parsing_api_async } from "./parsing_api_async_es2023.js";
import { parsing_render_bottom_table } from "./parsing_render_bottom_table.es2023.js";
import { parsing_render_top } from "./parsing_render_top.es2023.js";
import { ParsingCache } from "./ParsingCache_es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";


export async function parsing_render_async() {
    // - 取得 api 
    const ps = TPPageState.s;
    const book = ps.bookIndex;
    const chap = ps.chap;
    const sec = ps.sec;
    /** @type {IDParsingResult} */
    const jsonObj = await parsing_api_async({ book, chap, sec })
    
    // - 處理 api 結果，使其 address 能一致 用 book，不用 engs chineses
    // - 同時，也將 wid 與 原文綁成一對，這樣在 render top 就很簡單用
    ParsingCache.s.update_cache_and_normalize(jsonObj)

    const top = parsing_render_top(jsonObj, ps)
    // 上到下：原文 (捲動內容最前面有「前 後 標題」)、(中間灰框)、解析表格 (捲動內容最後面有同一列)；
    // 工具列隨內容捲動，不佔固定的列 (與串珠一致)。flex 直排，表格吃剩下的高度，見 fhl.css #parsingBody
    const table = parsing_render_bottom_table(jsonObj, jsonObj.N == 1 ? 'H' : 'G').replace(/<\/div>\s*$/, top.barBottom + '</div>')
    const html = "<div id='parsingBody'>" + top.top
        + "<div id='parsingSplit' title='拖曳調整上下高度；雙擊恢復預設'></div>"
        + table + "</div>";

    FhlInfoContent.s.dom.html(html);
    setupSplit(FhlInfoContent.s.dom[0])

    FhlInfoContent.s.registerEvents(TPPageState.s)

}

const SPLIT_KEY = 'fhlParsingTopH'
const SPLIT_MIN = 60

/** 上 (經文) 下 (表格) 之間的灰框可拖曳：高度放 css 變數 --parsing-top-h (在 #fhlInfoContent)，記 localStorage @param {HTMLElement} host */
function setupSplit(host) {
    const bar = host.querySelector('#parsingSplit')
    if (!bar) return
    let saved = 0
    try { saved = +(localStorage.getItem(SPLIT_KEY) ?? 0) } catch { /* 不記也能用 */ }
    if (saved >= SPLIT_MIN) host.style.setProperty('--parsing-top-h', saved + 'px'); else host.style.removeProperty('--parsing-top-h')
    const save = (/** @type {number | null} */ h) => { try { h ? localStorage.setItem(SPLIT_KEY, String(Math.round(h))) : localStorage.removeItem(SPLIT_KEY) } catch { /* ignore */ } }
    bar.addEventListener('dblclick', () => { host.style.removeProperty('--parsing-top-h'); save(null) })
    bar.addEventListener('pointerdown', e => {
        e.preventDefault()
        const topEl = /** @type {HTMLElement} */ (host.querySelector('#parsingTop'))
        const h0 = topEl.offsetHeight, y0 = e.clientY
        const max = Math.max(SPLIT_MIN, host.clientHeight - 12 - SPLIT_MIN)
        let cur = h0
        bar.setPointerCapture(e.pointerId)
        document.body.classList.add('parsing-split-resizing')
        const move = (/** @type {PointerEvent} */ ev) => { cur = Math.min(Math.max(h0 + ev.clientY - y0, SPLIT_MIN), max); host.style.setProperty('--parsing-top-h', cur + 'px') }
        const up = () => {
            bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up)
            document.body.classList.remove('parsing-split-resizing')
            save(cur)
        }
        bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up)
    })
}
