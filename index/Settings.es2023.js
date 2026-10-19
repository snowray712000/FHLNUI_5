import { SnSelect } from "./SnSelect.es2023.js";
import { RealTimePopUpSelect } from "./RealTimePopUpSelect.es2023.js";
import { GbSelect } from "./GbSelect.es2023.js";
import { ShowMode } from "./Show_mode.es2023.js";
import { MapTool } from "./MapTool.es2023.js";
import { ImageTool } from "./ImageTool.es2023.js";
import { FontSizeTool } from "./FontSizeTool.es2023.js";
import { ThemeTool } from "./ThemeTool.es2023.js";
import { LeftWindowTool } from "./LeftWindowTool.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from "./gbText.es2023.js";
import { BookRegistry } from "./BookRegistry.es2023.js";
import { readNameStyle, writeNameStyle } from "./BookNameStyle.es2023.js";
import { BookSelect } from "./BookSelect.es2023.js";
import { BookSelectName } from "./BookSelectName.es2023.js";

function register_reference_method(ps){
    $('#reference_method').off('change').on('change', function () {
        const ps = TPPageState.s;
        ps.reference_method = parseInt($(this).val() ?? 0);
        ps.saveToLocalStorage();
    });
}
function render_reference_method(ps, dom){
    const t = s => gbText(s, ps.gb)
    const html = `<select id="reference_method" class="set-select" title="${t("交互參照方法：點經文位置時")}">
    <option value="0">${t("交互參照：每次詢問")}</option>
    <option value="1">${t("交互參照：一律預覽")}</option>
    <option value="2">${t("交互參照：一律前往")}</option>
</select>`

    dom.html(html);
    $('#reference_method').val(ps.reference_method); // 初始化為當前狀態
}
function register_book_select_method(ps){
    $('#book_select_method').off('change').on('change', function () {
        const ps = TPPageState.s;
        ps.book_select_method = parseInt($(this).val() ?? 0);
        ps.saveToLocalStorage();
    });
}
function render_book_select_method(ps, dom){
        const t = s => gbText(s, ps.gb)
        const html = `<select id="book_select_method" class="set-select" title="${t("切換經文方法：選書卷章的視窗樣式；手機上不好點時可改「簡易」")}">
    <option value="0">${t("選章：依視窗大小")}</option>
    <option value="1">${t("選章：簡易")}</option>
</select>`

    dom.html(html);
    $('#book_select_method').val(ps.book_select_method); // 初始化為當前狀態
}

function register_foot_note_show_method(ps){
    $('#foot_note_show_method').off('change').on('change', function () {
        const ps = TPPageState.s;
        ps.foot_note_show_method = parseInt($(this).val() ?? 0);
        ps.saveToLocalStorage();
    });
}
function render_foot_note_show_method(ps, dom){
        const t = s => gbText(s, ps.gb)
        const html = `<select id="foot_note_show_method" class="set-select" title="${t("註腳顯示方法")}">
    <option value="0">${t("註腳：點擊顯示")}</option>
    <!-- <option value="1">滑鼠移過</option> -->
    <option value="2">${t("註腳：直接載入")}</option>
</select>`

dom.html(html);
    $('#foot_note_show_method').val(ps.foot_note_show_method); // 初始化為當前狀態
}

/** 次經書名：信望愛站名 / 天主教通行名。兩套名字不論選哪一套，網址、搜尋框都認得；這裡只管畫面上顯示哪一套 */
function render_apo_name_style(ps, dom) {
    const t = s => gbText(s, ps.gb)
    dom.html(`<select id="apo_name_style" class="set-select" title="${t("次經的書名用哪一套 (網址、搜尋框兩套都認得)")}">
    <option value="fhl">${t("次經書名：信望愛站名")}</option>
    <option value="alt">${t("次經書名：天主教通行名")}</option>
</select>`)
    $('#apo_name_style').val(readNameStyle())
}
function register_apo_name_style(ps) {
    $('#apo_name_style').off('change').on('change', function () {
        const ps = TPPageState.s
        writeNameStyle($(this).val() == 'alt' ? 'alt' : 'fhl')
        // 書名出現的地方：工具列的書名、左邊的歷史記錄、選書面板、網址 (讀的是次經時)
        BookSelect.s.render()
        // 歷史記錄清單是記錄改變時才畫 (vh_itemschanged)，這裡直接改次經那幾列的書名 (📌 在後面，只改第一個文字節點)
        $('#viewHistory li[book]').each(function () {
            const book = Number(this.getAttribute('book'))
            if (BookRegistry.corpusOf(book) !== 'apo' || this.firstChild?.nodeType !== 3) return
            this.firstChild.nodeValue = `${BookRegistry.nameShort(book, ps.gb == 1)}${this.getAttribute('chap')}:${this.getAttribute('sec')}`
        })
        BookSelectName.s.init(ps, $('#bookSelectName'))
        BookSelectName.s.registerEvents(ps)
        if (BookRegistry.corpusOf(ps.bookIndex) === 'apo') {
            history.replaceState(null, null, `#/bible/${BookRegistry.nameShort(ps.bookIndex, ps.gb == 1)}${ps.chap}:${ps.sec}`)
        }
    })
}

export class Settings {
    static #s = null
    /** @returns {Settings} */
    static get s() { if (this.#s == null) this.#s = new Settings(); return this.#s; }

    dom = null
    init(ps = null, dom = null) {
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = document.getElementById('settings')

        this.dom = dom;
        this.render(ps, this.dom);
        SnSelect.s.init(ps, $('#snSelect'));
        SnSelect.s.registerEvents(ps);
        RealTimePopUpSelect.s.init(ps, $('#realTimePopUpSelect'));
        RealTimePopUpSelect.s.registerEvents(ps);
        GbSelect.s.init(ps, $('#gbSelect'));
        GbSelect.s.registerEvents(ps);
        ShowMode.s.init(ps, $('#show_mode'));
        ShowMode.s.registerEvents(ps);
        MapTool.s.init(ps, $('#mapTool'));
        MapTool.s.registerEvents(ps);
        ImageTool.s.init(ps, $('#imageTool'));
        ImageTool.s.registerEvents(ps);
        FontSizeTool.s.init(ps, $('#fontSizeTool'));
        ThemeTool.s.init(ps, $('#themeTool'));

        // reference method
        $('#settingsScrollDiv ul').append("<li><div id='reference_method_tool'></div></li>");
        render_reference_method(ps, $('#reference_method_tool'));
        register_reference_method(ps);

        // book select method
        $('#settingsScrollDiv ul').append("<li><div id='book_select_method_tool'></div></li>");
        render_book_select_method(ps, $('#book_select_method_tool'));
        register_book_select_method(ps);

        // foot note show method
        $('#settingsScrollDiv ul').append("<li><div id='foot_note_show_method_tool'></div></li>");
        render_foot_note_show_method(ps, $('#foot_note_show_method_tool'));
        register_foot_note_show_method(ps);

        // 次經書名 (信望愛站名 / 天主教通行名)
        $('#settingsScrollDiv ul').append("<li><div id='apo_name_style_tool'></div></li>");
        render_apo_name_style(ps, $('#apo_name_style_tool'));
        register_apo_name_style(ps);

        // TSK 顯示模式已移到串珠分頁工具列的 ⚙ (index/tsks/renderTsk.js)

    }
    registerEvents(ps) {
        $('#settings p')
            .on('click', function () {
                if (false == LeftWindowTool.s.isOpenedSettings(this)) {
                    LeftWindowTool.s.openSettings()
                }
                else {
                    LeftWindowTool.s.closeSettings()
                }
            });

        // mark by snow. 2021.07 不再允許調整 (沒有人會開著設定，通常是開著 history)

        $('#settingsScrollDiv').off('scroll').on('scroll', function () {
            $(this).addClass('scrolling');
            clearTimeout($.data(this, "scrollCheck"));
            $.data(this, "scrollCheck", setTimeout(function () {
                $('#settingsScrollDiv').removeClass('scrolling');
            }, 350));
        });
    }
    render(ps, dom) {
        //dom.html("設定");
    }
}
