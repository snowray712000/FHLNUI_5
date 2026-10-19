import { TPPageState } from './TPPageState.es2023.js'
import { triggerGoEventWhenPageStateAddressChange } from './triggerGoEventWhenPageStateAddressChange.es2023.js'
import { BookSelect } from './BookSelect.es2023.js'
import { FhlLecture } from './FhlLecture.es2023.js'
import { FhlInfo } from './FhlInfo.es2023.js'

/**
 * 主畫面跳到某節 (搜尋結果的「前往」、搜尋框打 遺訓1:2)，再更新網址 hash，可按上一頁回來
 * @param {number} book 書卷 id (1–66、201–217…)，不是 0 起算的 ibook
 * @param {number} chap
 * @param {number} sec
 */
export function gotoAddress(book, chap, sec) {
    const ps = TPPageState.s
    ps.bookIndex = book
    ps.chap = chap
    ps.sec = sec

    triggerGoEventWhenPageStateAddressChange(ps)
    BookSelect.s.render()
    FhlLecture.s.render()
    FhlLecture.s.selectLecture(ps.bookIndex, ps.chap, ps.sec)
    FhlInfo.s.render(ps)
    $(document).trigger('chapchanged') // 更新網址 hash (pushState)，可按上一頁回來
}
