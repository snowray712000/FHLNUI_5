import { SnSelect } from "./SnSelect.es2023.js";
import { RealTimePopUpSelect } from "./RealTimePopUpSelect.es2023.js";
import { GbSelect } from "./GbSelect.es2023.js";
import { ShowMode } from "./Show_mode.es2023.js";
import { MapTool } from "./MapTool.es2023.js";
import { ImageTool } from "./ImageTool.es2023.js";
import { FontSizeTool } from "./FontSizeTool.es2023.js";
import { LeftWindowTool } from "./LeftWindowTool.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from "./gbText.es2023.js";

function register_reference_method(ps){
    $('#reference_method').off('change').on('change', function () {
        const ps = TPPageState.s;
        ps.reference_method = parseInt($(this).val() ?? 0);
        ps.saveToLocalStorage();
    });
}
function render_reference_method(ps, dom){
    const html = `<div>${gbText("交互參照方法", ps.gb)}:</div>
<select id="reference_method">
    <option value="0">每次詢問</option>
    <option value="1">直接方法1️⃣</option>
    <option value="2">直接方法2️⃣</option>
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
        const html = `<div>${gbText("切換經文方法", ps.gb)}:</div>
<select id="book_select_method">
    <option value="0">依視窗大小</option>
    <option value="1">簡易</option>
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
        const html = `<div>${gbText("註腳", ps.gb)}:</div>
<select id="foot_note_show_method">
    <option value="0">點擊顯示</option>
    <!-- <option value="1">滑鼠移過</option> -->
    <option value="2">直接載入</option>
</select>`

dom.html(html);
    $('#foot_note_show_method').val(ps.foot_note_show_method); // 初始化為當前狀態
}

/**
 * @param {TPPageState} ps 
 */
function render_tsk_show_mode(ps, dom){
    // 0: TSK 原始資料，英文
    // 1: 以中文顯示, 縮寫中文
    // 2: 以中文顯示, 全名中文
    const html = `<div>${gbText("TSK顯示模式", ps.gb)}:</div>
<select id="tsk_show_mode">
    <option value="0">英文</option>
    <option value="1">中文(縮寫)</option>
    <option value="2">中文(全名)</option>
</select>`
    dom.html(html);
    $('#tsk_show_mode').val(ps?.tsk_show_mode || 2); // 初始化為當前狀態  
}
function register_tsk_show_mode(ps){
    $('#tsk_show_mode').off('change').on('change', function () {
        const ps = TPPageState.s;
        console.log($(this));
        console.log($(this).val());
        
        ps.tsk_show_mode = parseInt($(this).val() ?? 0);
        ps.saveToLocalStorage();
    });
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

        // tsk show mode
        $('#settingsScrollDiv ul').append("<li><div id='tsk_show_mode_tool'></div></li>");
        render_tsk_show_mode(ps, $('#tsk_show_mode_tool'));
        register_tsk_show_mode(ps);

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
