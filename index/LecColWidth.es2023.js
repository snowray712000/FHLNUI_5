/**
 * 經文區並排 (mode 1/3，CSS Grid 版) 的欄寬 (docs/z260930d P2)；自動 / 拖表頭自訂 / 雙擊回自動都在 ColWidth (與交互參照、搜尋結果共用)
 * - 經文區與表頭 (#lecMainTitle，在 #lecMain 外) 共用 #fhlLecture 上的 --lec-cols-tpl，所以一起變
 * - 呼叫：FhlLecture 每次 render 完 (setCSS 之後)，以及 reshape() (視窗、左右欄、字型、SN 顯示/篩選改變) 時 apply()：自動時重量，表頭重新對齊
 */
import { ColWidth } from './ColWidth.es2023.js'

export class LecColWidth {
    static #s = null
    /** @returns {LecColWidth} */
    static get s() { if (!this.#s) this.#s = new LecColWidth(); return this.#s }

    /** grid 版 (並排) 才生效，否則還原成原本的等寬表頭 */
    apply() {
        const lecture = document.getElementById('fhlLecture')
        const title = document.getElementById('lecMainTitle')
        const grid = /** @type {HTMLElement} */ (document.querySelector('#lecMain > .lec-grid'))
        if (!lecture || !title) return
        const headCells = () => [...title.children].filter(a => a.classList.contains('lecContent'))
        if (!grid) {
            headCells().forEach(cell => cell.querySelectorAll('.lec-col-handle').forEach(a => a.remove()))
            lecture.style.removeProperty('--lec-cols-tpl')
            title.classList.remove('lec-grid-title')
            title.style.paddingLeft = title.style.paddingRight = ''
            return
        }
        const versions = [...grid.children].filter(a => a.classList.contains('vercol')).map(a => a.getAttribute('ver'))

        title.classList.add('lec-grid-title')
        headCells().forEach(a => { a.style.width = '' }) // setCSS 設的等寬百分比，grid 下改由欄寬決定
        new ColWidth({ host: lecture, varName: '--lec-cols-tpl', versions, getHeadCells: headCells, measureRoot: grid }).apply()
        alignTitle(title, grid)
    }
}

/**
 * 表頭左右 padding 對齊經文 grid (#lecMain 的 padding 扣了捲軸寬，#lecMainTitle 是固定 50px，欄寬不等時差距會看得出來)
 * @param {HTMLElement} title @param {HTMLElement} grid
 */
function alignTitle(title, grid) {
    title.style.paddingLeft = title.style.paddingRight = ''
    const t = title.getBoundingClientRect(), g = grid.getBoundingClientRect()
    if (t.width <= 0 || g.width <= 0) return
    title.style.paddingLeft = `${Math.max(g.left - t.left, 0)}px`
    title.style.paddingRight = `${Math.max(t.right - g.right, 0)}px`
}
