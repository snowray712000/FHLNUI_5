import { SnSelect } from "./SnSelect.es2023.js";
import { RealTimePopUpSelect } from "./RealTimePopUpSelect.es2023.js";
import { GbSelect } from "./GbSelect.es2023.js";
import { ShowMode } from "./Show_mode.es2023.js";
import { MapTool } from "./MapTool.es2023.js";
import { ImageTool } from "./ImageTool.es2023.js";
import { FontSizeTool } from "./FontSizeTool.es2023.js";
import { FontSizeToolBase } from "./FontSizeToolBase.es2023.js";
import { LeftWindowTool } from "./LeftWindowTool.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from "./gbText.es2023.js";

function register_reference_method(ps){
    $('#reference_method').off('change').on('change', function () {
        ps.reference_method = parseInt($(this).val());
        pageState.reference_method = ps.reference_method;
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
        FontSizeTool.s.registerEvents(ps);

        // add by snow. 2021.07
        // 字體大小，希伯來文獨立出來設定
        var fontSizeHebrewTool = new FontSizeToolBase("Hebrew")
        $('#settingsScrollDiv ul').append("<li><div id='" + fontSizeHebrewTool.getId() + "'></div></li>")
        fontSizeHebrewTool.init(ps, $('#' + fontSizeHebrewTool.getId()))

        // add by snow. 2021.07
        // 字體大小，希臘文獨立出來設定
        var fontSizeGreekTool = new FontSizeToolBase("Greek")
        $('#settingsScrollDiv ul').append("<li><div id='" + fontSizeGreekTool.getId() + "'></div></li>")
        fontSizeGreekTool.init(ps, $('#' + fontSizeGreekTool.getId()))

        // add by snow. 2021.07
        // 字體大小，StrongNumber文獨立出來設定
        var fontSizeStrongNumberTool = new FontSizeToolBase("Sn")
        $('#settingsScrollDiv ul').append("<li><div id='" + fontSizeStrongNumberTool.getId() + "'></div></li>")
        fontSizeStrongNumberTool.init(ps, $('#' + fontSizeStrongNumberTool.getId()))

        // reference method
        $('#settingsScrollDiv ul').append("<li><div id='reference_method_tool'></div></li>");
        render_reference_method(ps, $('#reference_method_tool'));
        register_reference_method(ps);

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
