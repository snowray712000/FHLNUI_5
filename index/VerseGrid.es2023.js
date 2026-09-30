/**
 * 經文「一組經文位置 × 一組譯本」的共用核心 (docs/z260930d 第五節)
 * - renderVerseLec：一節一譯本 → span.lec[ver][book][chap][sec] > .verseNumber + .verseContent (經文區、交互參照共用)
 * - renderVerseGrid：CSS Grid 版面，可選表頭 (譯本名)、左側標籤欄 (經文位置或譯本名)；並排 / 交錯
 *   DOM 仍是一欄一欄 (.vercol display: contents)，原生反白沿欄往下；列高由 grid 對齊
 * - 經文區的 grid (FhlLecture_render_core render_grid) 有併入上節跨列、data-row，排版自己做，只共用 renderVerseLec 與 css
 *
 * @typedef {import("./DText.js").DText} DText
 * @typedef {{ book: number, chap: number, sec: number, dtexts: DText[], verseLabel?: string, hideVerseNumber?: boolean }} VerseItem
 * @typedef {{ version: string, name: string, isRtl?: boolean }} VersionCol
 * @typedef {{ label?: string, labelAttrs?: Record<string, string>, cells: Record<string, VerseItem[]> }} VerseRow 一列 (連續的節)；cells 以譯本為 key
 */
import { render_dtexts } from './render_dtexts.js'
import { generate_verse_number_jdom } from './lecture/FhlLecture_render_mode_common_es2023.js'
import { SnFilter } from './SnFilter.es2023.js'

/**
 * 一節一譯本
 * @param {VerseItem} verse
 * @param {string} version
 * @param {{ numberDText?: DText, snOpt?: object }} [opt] numberDText：節碼改用這個 DText 畫 (例：交互參照的節碼是 .ref，點了看整章)；snOpt：給 SnFilter.apply (例 搜尋 SN 時 offShowsAll)
 * @returns {JQuery<HTMLElement>}
 */
export function renderVerseLec(verse, version, opt = {}) {
    const $lec = $('<span>').addClass('lec')
        .attr({ ver: version, chap: verse.chap, sec: verse.sec, book: verse.book })

    if (!verse.hideVerseNumber) {
        const $num = generate_verse_number_jdom(verse.sec, version)
        const label = verse.verseLabel ?? String(verse.sec)
        if (opt.numberDText) {
            $num.empty().append(render_dtexts([[verse.book, verse.chap, verse.sec, [{ ...opt.numberDText, w: label }]]], version).children(), ' ')
        } else if (label !== String(verse.sec)) {
            $num.text(label + ' ')
        }
        $lec.append($num)
    }

    const $content = render_dtexts([[verse.book, verse.chap, verse.sec, verse.dtexts]], version)
    // 所有資料都含 SN，strong=0 時隱藏；篩選時只顯示指定的 (docs/z260928e)
    SnFilter.s.apply($content, { ...opt.snOpt, addr: `${verse.book}.${verse.chap}.${verse.sec}`, ver: version })
    return $lec.append($('<span>').addClass('verseContent').append($content))
}

/**
 * 一格：一個譯本的一段 (多節接在一起)
 * @param {VerseItem[]} verses @param {VersionCol} v @param {GridOpt} opt
 */
function renderParagraph(verses, v, opt) {
    const $p = $('<div>').addClass('paragraph').attr('ver', v.version)
    if (v.isRtl) $p.css({ 'text-align': 'right', direction: 'rtl' })
    for (const verse of verses) $p.append(renderVerseLec(verse, v.version, { numberDText: opt.numberDTextOf?.(verse), snOpt: opt.snOpt }))
    if (verses.length && opt.cellExtra) $p.append(opt.cellExtra(verses, v))
    return $p
}

/** 欄的樣板：標籤欄 (固定寬或 max-content) + 經文欄 @param {GridOpt} opt @param {number} n 經文欄數 */
function columnsTemplate(opt, n) {
    const label = (opt.isLabel ?? true) ? `${opt.labelWidth ?? 'max-content'} ` : ''
    return `${label}repeat(${n}, minmax(0, 1fr))`
}

/**
 * 只有表頭 (譯本名) 的 grid：分批載入 (搜尋結果) 時放在捲動區最上面 (sticky)；各批 grid 用同一個欄樣板 (labelWidth 要固定) 才對得齊
 * @param {GridOpt} opt
 * @returns {JQuery<HTMLElement>} div.verse-grid.vg-head-row
 */
export function renderVerseGridHeader(opt) {
    const $grid = $('<div>').addClass('verse-grid vg-side vg-head-row').css('grid-template-columns', columnsTemplate(opt, opt.versions.length))
    if (opt.isLabel ?? true) $grid.append($('<div>').addClass('vg-head'))
    for (const v of opt.versions) $grid.append($('<div>').addClass('vg-head').text(v.name))
    return $grid
}
/** 只有一個譯本時，交錯也用並排 (標籤欄放經文位置，不必每列再寫譯本名) @param {GridOpt} opt */
export function effectiveLayout(opt) {
    return opt.versions.length > 1 && opt.layout == 'interleaved' ? 'interleaved' : 'side'
}

/**
 * @typedef {{
 *   versions: VersionCol[],
 *   rows?: VerseRow[],
 *   layout: 'side' | 'interleaved',
 *   isHeader?: boolean,
 *   isLabel?: boolean,
 *   labelWidth?: string,
 *   numberDTextOf?: (verse: VerseItem) => DText,
 *   snOpt?: object,
 *   cellExtra?: (verses: VerseItem[], v: VersionCol) => (Node | JQuery<HTMLElement>),
 * }} GridOpt
 *   side：一個譯本一欄，一列 = rows 的一列；isHeader 時第一列是譯本名 (sticky)
 *   interleaved：一欄經文；每列前一條「經文位置」，再各譯本一列 (標籤欄放譯本名)；只有一個譯本時改用 side
 *   labelWidth：標籤欄寬 (css)，預設 max-content；分批的 grid 要固定寬才對齊
 *   cellExtra：每格最後加的東西 (例 搜尋結果的複製鈕)
 */
/**
 * @param {GridOpt} opt
 * @returns {JQuery<HTMLElement>} div.verse-grid
 */
export function renderVerseGrid(opt) {
    const { versions } = opt
    const rows = opt.rows ?? []
    const isLabel = opt.isLabel ?? true
    const layout = effectiveLayout(opt)
    const $grid = $('<div>').addClass('verse-grid ' + (layout == 'side' ? 'vg-side' : 'vg-interleaved'))
    const c0 = isLabel ? 2 : 1 // 第一個經文欄

    const $label = (text, row, col, attrs) => $('<div>').addClass('vg-label').text(text ?? '')
        .attr(attrs ?? {}).css({ 'grid-column': String(col), 'grid-row': String(row) })

    if (layout == 'side') {
        $grid.css('grid-template-columns', columnsTemplate(opt, versions.length))
        const r0 = opt.isHeader ? 2 : 1
        if (opt.isHeader) {
            if (isLabel) $grid.append($('<div>').addClass('vg-head').css({ 'grid-column': '1', 'grid-row': '1' }))
            versions.forEach((v, i) => $grid.append($('<div>').addClass('vg-head').text(v.name).css({ 'grid-column': String(c0 + i), 'grid-row': '1' })))
        }
        // 標籤欄放在經文前面 (不可選取，反白不會被它打斷)
        if (isLabel) rows.forEach((row, i) => $grid.append($label(row.label, r0 + i, 1, row.labelAttrs)))
        versions.forEach((v, iCol) => {
            const $vercol = $('<div>').addClass('vercol').attr('ver', v.version).appendTo($grid)
            rows.forEach((row, iRow) => {
                renderParagraph(row.cells[v.version] ?? [], v, opt)
                    .attr('data-row', iRow)
                    .css({ 'grid-column': String(c0 + iCol), 'grid-row': String(r0 + iRow) })
                    .appendTo($vercol)
            })
        })
        return $grid
    }

    // 交錯：| 譯本名 | 經文 |，每組前一條經文位置
    $grid.css('grid-template-columns', columnsTemplate(opt, 1))
    const $vercol = $('<div>').addClass('vercol').appendTo($grid)
    let r = 1
    rows.forEach((row, iRow) => {
        if (row.label) $vercol.append($('<div>').addClass('vg-group').text(row.label).attr(row.labelAttrs ?? {}).css({ 'grid-column': '1 / -1', 'grid-row': String(r++) }))
        for (const v of versions) {
            const verses = row.cells[v.version] ?? []
            if (verses.length == 0) continue
            if (isLabel) $vercol.append($label(v.name, r, 1))
            renderParagraph(verses, v, opt).attr('data-row', iRow).css({ 'grid-column': String(c0), 'grid-row': String(r++) }).appendTo($vercol)
        }
    })
    return $grid
}
