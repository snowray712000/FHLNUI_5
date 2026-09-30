import { ParsingPopUp } from './ParsingPopUp.es2023.js'
import { TPPageState } from './TPPageState.es2023.js'
import { rtAsync } from './rtAsync.js'

/**
 * 點注腳 .ft (設定「點擊顯示」時)：在它下方的小框顯示注腳內容。經文區、搜尋結果、交互參照共用
 * - 在對話框裡時，小框要蓋在對話框上面 (#parsingPopUp 平常 z-index 1)
 * - 可用 呂振中譯本、中文標準譯本 測試
 * @param {JQuery.TriggeredEvent | Event} e currentTarget 是 .ft，例 <span class=ft ft=42 ver=tcv book=1 chap=2>【42】</span>
 */
export async function showFootPopupAsync(e) {
    const ps = TPPageState.s
    const $this = $(e.currentTarget)

    const offset = $this.offset()
    offset.top += $this.height() + 10
    ParsingPopUp.s.render(ps, ParsingPopUp.s.dom, offset, "ft")
    const $dlg = $this.closest('.ui-dialog')
    ParsingPopUp.s.dom.css('z-index', $dlg.length ? (parseInt($dlg.css('z-index')) || 100) + 1 : '')

    const id = $this.attr('ft')
    const book = parseInt($this.attr('book'))
    const chap = $this.attr('chap')
    const ver = $this.attr('ver')
    const $inside = $('#parsingPopUpInside')
    try {
        const json = await rtAsync({ book, chap, ver, id, gb: ps.gb })
        if (json.status == "success" && json.record.length > 0) {
            $inside.text(json.record[0].text)
            $inside.css({ width: '100%', 'max-width': '323px', 'white-space': 'normal' }) // cy:200px乘黃金比例1.618
        } else {
            $inside.text(`錯誤:可回報下訊息- ${ver} ${book}:${chap} 注腳 ${id}`)
        }
    } catch (error) {
        $inside.text(`錯誤:取得注腳時發生 (${ver} ${book}:${chap} 注腳 ${id}) ${error?.message ?? ''}`)
    }
}
