/// <reference path="./../../libs/jsdoc/jquery.js" />

/**
 * @typedef {import('./TpTsks.js').DText} DText
 * @typedef {import('./TpTsks.js').DAddress} DAddress
 * @typedef {import('./api/sc.js').DScResultNormalized } DScResultNormalized
 */


import { TPPageState } from "./../TPPageState.es2023.js";
import { BibleConstantHelper } from "../BibleConstantHelper.es2023.js";
import { isRDLocation } from "../isRDLocation.es2023.js";
import { gbText } from "../gbText.es2023.js";

import { parseTsk } from "./parseTsk.js"
import { cvt_tsk_blocks_to_dtexts } from "./cvt_tsk_blocks_to_dtexts.js"
import { dtexts_render } from "./../dtext/dtexts_render.js"
import { testThenDoAsync } from "../testThenDo.es2023.js";
import { cvt_ref_to_chinese } from "./cvt_ref_to_chinese.js";
import { normalize_sc_result } from "./../api/sc.js"


/**
 * @param {JQuery} jqtoolbar
 * @param {DScResultNormalized} joResultNorm
 */
function update_next_prev_address_in_toolbar(jqtoolbar, joResultNorm) {
    if (joResultNorm?.prev) {
        jqtoolbar.find('.btnPrev').attr('book', joResultNorm.prev.book)
            .attr('chap', joResultNorm.prev.chap)
            .attr('sec', joResultNorm.prev.sec)
    }
    if (joResultNorm?.next) {
        jqtoolbar.find('.btnNext').attr('book', joResultNorm.next.book)
            .attr('chap', joResultNorm.next.chap)
            .attr('sec', joResultNorm.next.sec)
    }
}
function update_title_in_toolbar(jqtoolbar, joResultNorm) {
    let title = joResultNorm?.record?.[0]?.title ?? ''
    // split 空白 的 [1]
    const titleParts = title.split(' ')
    if (titleParts.length > 1) {
        title = titleParts[1]
    }
    jqtoolbar.find('.btnTitle').text(title)
}
/**
 * sc.php?book=4&engs=Mark&gb=0&chap=1&sec=1
 * @param {DAddress} address
 */
function gen_tsk_url(address, gb) {
    if (Array.isArray(address) == false) {
        address = [address?.book ?? 1, address?.chap ?? 1, address?.verse ?? address?.sec ?? 1]
    }

    const engs = BibleConstantHelper.getBookNameArrayEnglishNormal()[address[0] - 1]

    const endpoint = `sc.php?book=4&engs=${engs}&chap=${address[1]}&sec=${address[2]}&gb=${gb}`;

    const domain = isRDLocation() ? 'http://127.0.0.1:15600/json' : '/json';

    return `${domain}/${endpoint}`
}

async function api_tsk() {
    // 串珠，是一節一個值
    // api 一樣使用 sc.php 只是 book=4 就是串珠了 (3 是註釋)

    const ps = TPPageState.s

    const book = ps.bookIndex
    const chap = ps.chap
    const sec = ps.sec
    const gb = TPPageState.s?.gb ?? 0

    const url = gen_tsk_url([book, chap, sec], gb)

    // fetch
    const response = await fetch(url)
    const data = await response.text()

    return data
}

/** @param {boolean} [withGear] 上面那一列才有 ⚙ (TSK 顯示模式) */
function gen_toolbar_jqhtml(withGear = false) {
    const $topToolbar = $('<div>').addClass('toolbar tsk').html(`
        <button class="btnPrev btn btn-sm btn-outline-secondary">前</button>
        <button class="btnNext btn btn-sm btn-outline-secondary">後</button>
        <button class="btnTitle btn btn-sm btn-outline-secondary">創1:1</button>
        ${withGear ? `<button class="btnTskGear btn btn-sm btn-outline-secondary" title="${gbText('TSK顯示模式', TPPageState.s.gb)}"><i class="fa fa-cog" aria-hidden="true"></i></button>` : ''}
    `)
    // // 頂部 toolbar
    // const $topToolbar = $('<div>').addClass('toolbar').html(`
    //     <button class="btnPrev btn btn-sm btn-outline-secondary">前</button>
    //     <button class="btnNext btn btn-sm btn-outline-secondary">後</button>
    //     <button class="btnTitle btn btn-sm btn-outline-secondary">創1:1</button>
    //     <button class="btnExplain btn btn-sm btn-outline-secondary">說明</button>
    //     <button class="btnSettings btn btn-sm btn-outline-secondary">設定</button>
    // `)
    return $topToolbar
}


/**
 * @param {DText} dtext
 */
function cvt_ref_to_chinese_in_dtext(dtext, isgb, show_mode) {
    // children or childrenlist
    for (const child of dtext.children || []) {
        cvt_ref_to_chinese_in_dtext(child, isgb, show_mode)
    }
    for (const child of dtext.childrenlist || []) {
        cvt_ref_to_chinese_in_dtext(child, isgb, show_mode)
    }

    if (dtext.isRef != 1) return dtext;

    const refdesc = dtext?.refDescription
    if (refdesc != null) {
        // ref 一定轉為 中文縮寫 因為英文會有 Bug
        dtext.refDescription = cvt_ref_to_chinese(refdesc, isgb, false)

        if (dtext?.w != null) {
            if (show_mode == 0) {
                // do nothing
            } else {
                const isFullname = show_mode == 2 ? true : false
                dtext.w = cvt_ref_to_chinese(dtext.w, isgb, isFullname)
            }
        }
    }
}


/**
 * TSK 顯示模式 (交互參照的書卷名)：英文 / 中文(縮寫) / 中文(全名)，只有串珠會用到，所以放在串珠工具列的 ⚙，不放設定面板
 * 0: TSK 原始資料，英文；1: 中文縮寫 (預設)；2: 中文全名
 * @param {HTMLElement} anchor
 */
function openTskModeMenu(anchor) {
    document.querySelector('.snf-menu')?.remove()
    const ps = TPPageState.s
    const cur = ps.tsk_show_mode ?? 1
    const close = () => { menu.remove(); document.removeEventListener('pointerdown', onOutside, true) }
    const onOutside = e => { if (!menu.contains(e.target)) close() }
    const item = (mode, text) => {
        const d = document.createElement('div')
        d.className = 'snf-menu-item' + (mode == cur ? ' active' : '')
        d.textContent = gbText(text, ps.gb)
        d.onclick = () => {
            close()
            if (mode == cur) return
            ps.tsk_show_mode = mode
            ps.saveToLocalStorage()
            renderTsk()
        }
        return d
    }
    const menu = document.createElement('div')
    menu.className = 'snf-menu'
    const title = document.createElement('div')
    title.className = 'snf-menu-title'
    title.textContent = gbText('TSK顯示模式', ps.gb)
    menu.append(title, item(0, '英文'), item(1, '中文(縮寫)'), item(2, '中文(全名)'))
    document.body.append(menu)
    const r = anchor.getBoundingClientRect()
    menu.style.left = `${Math.max(4, Math.min(r.left, window.innerWidth - menu.offsetWidth - 4))}px`
    menu.style.top = `${Math.min(r.bottom + 4, window.innerHeight - menu.offsetHeight - 4)}px`
    setTimeout(() => document.addEventListener('pointerdown', onOutside, true))
}

// 事件: .ref click 在 fhlInfoContent 一起用, 所以不在 .tsk 中
$(() => {
    testThenDoAsync({
        cbTest: () => $("#fhlInfoContent").length > 0,
    }).then(() => {
        // .tsk > .btnPrev .btnNext 的 event, 透過 attr 改變 book,chap,sec
        $('#fhlInfoContent').on('click', '.toolbar.tsk .btnPrev, .toolbar.tsk .btnNext', function () {
            const book = $(this).attr('book')
            const chap = $(this).attr('chap')
            const sec = $(this).attr('sec')

            const ps = TPPageState.s
            ps.bookIndex = parseInt(book)
            ps.chap = parseInt(chap)
            ps.sec = parseInt(sec)

            // trigger renderTsk
            renderTsk()
        })
        $('#fhlInfoContent').on('click', '.toolbar.tsk .btnTskGear', e => openTskModeMenu(e.currentTarget))
    })
})

export async function renderTsk() {
    const apiTextResult = await api_tsk()

    const joResult = JSON.parse(apiTextResult)
    const joResultNorm = normalize_sc_result(joResult)

    const tskContent = joResult?.record?.[0]?.com_text ?? ''

    const ps = TPPageState.s
    const addr = [ps.bookIndex, ps.chap, ps.sec]
    const blocks = parseTsk(tskContent, addr)
    const dtexts = cvt_tsk_blocks_to_dtexts(blocks, addr)

    const show_mode = ps?.tsk_show_mode ?? 2

    // 每一個 dtext ，若有 ref 的, 將其中的書卷轉為中文
    for (const dt of dtexts) {
        cvt_ref_to_chinese_in_dtext(dt, ps.gb == 1, show_mode)
    }

    const $htmls = dtexts_render(dtexts)

    // 清空, 但事件留著
    $('#fhlInfoContent').empty()

    // TODO: toolbar
    const $toolbar = gen_toolbar_jqhtml(true)
    $('#fhlInfoContent').append($toolbar)

    const $tskContent = $('<div>').addClass('tsk_content')

    // 加入新的內容
    for (let $html of $htmls) {
        $tskContent.append($html)
    }
    $('#fhlInfoContent').append($tskContent)

    const $toolbarBottom = gen_toolbar_jqhtml()
    $('#fhlInfoContent').append($toolbarBottom)

    // update toolbar 中的 event, 透過 attr 改變 book,chap,sec
    update_next_prev_address_in_toolbar($('#fhlInfoContent'), joResultNorm)
    update_title_in_toolbar($('#fhlInfoContent'), joResultNorm)
}
