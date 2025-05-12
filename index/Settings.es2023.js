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

// var settings = {
//     init: function (ps, dom) {
//         this.dom = dom;
//         this.render(ps, this.dom);
//         snSelect.init(ps, $('#snSelect'));
//         snSelect.registerEvents(ps);
//         realTimePopUpSelect.init(ps, $('#realTimePopUpSelect'));
//         realTimePopUpSelect.registerEvents(ps);
//         gbSelect.init(ps, $('#gbSelect'));
//         gbSelect.registerEvents(ps);
//         show_mode.init(ps, $('#show_mode'));
//         show_mode.registerEvents(ps);
//         mapTool.init(ps, $('#mapTool'));
//         mapTool.registerEvents(ps);
//         imageTool.init(ps, $('#imageTool'));
//         imageTool.registerEvents(ps);
//         fontSizeTool.init(ps, $('#fontSizeTool'));

//         fontSizeTool.registerEvents(ps);
//         // add by snow. 2021.07
//         // 字體大小，希伯來文獨立出來設定
//         var fontSizeHebrewTool = new FontSizeToolBase("Hebrew")
//         $('#settingsScrollDiv ul').append("<li><div id='" + fontSizeHebrewTool.getId() + "'></div></li>")
//         fontSizeHebrewTool.init(ps, $('#' + fontSizeHebrewTool.getId()))

//         // add by snow. 2021.07
//         // 字體大小，希臘文獨立出來設定
//         var fontSizeGreekTool = new FontSizeToolBase("Greek")
//         $('#settingsScrollDiv ul').append("<li><div id='" + fontSizeGreekTool.getId() + "'></div></li>")
//         fontSizeGreekTool.init(ps, $('#' + fontSizeGreekTool.getId()))

//         // add by snow. 2021.07
//         // 字體大小，StrongNumber文獨立出來設定
//         var fontSizeStrongNumberTool = new FontSizeToolBase("Sn")
//         $('#settingsScrollDiv ul').append("<li><div id='" + fontSizeStrongNumberTool.getId() + "'></div></li>")
//         fontSizeStrongNumberTool.init(ps, $('#' + fontSizeStrongNumberTool.getId()))
//     },
//     registerEvents: function (ps) {
//         $('#settings p')
//             .on('click', function () {
//                 if (false == leftWindowTool.isOpenedSettings(this)) {
//                     leftWindowTool.openSettings()
//                 }
//                 else {
//                     leftWindowTool.closeSettings()
//                 }
//             });

//         // mark by snow. 2021.07 不再允許 (沒有人會開著設定，通常是開著 history)
//         // $('#settings').resizable({
//         //   handles: 's',
//         //   maxHeight: 280,
//         //   minHeight: 38,
//         //   resize: function (event, ui) {

//         //     var maxHeight = $('#fhlLeftWindow').height() - 38 - $('#viewHistory').height() - 36;
//         //     if (ui.size.height > maxHeight) {//不可以超過其他的bar
//         //       ui.size.height = maxHeight;
//         //       $("#versionSelect p").html("&#9654;&nbsp;"+gbText("聖經版本選擇",ps.gb));
//         //     }
//         //     var height = $('#fhlLeftWindow').height() - $('#viewHistory').height() - ui.size.height;
//         //     $("#versionSelect").css({
//         //       'top': ui.size.height + 12 + 'px',
//         //       'height': height - 36 + 'px'
//         //     });
//         //     $(this).css({
//         //       width: 'auto',
//         //       right: '0px'
//         //     });
//         //     var html = $(this).css('height') == '38px' ? "&#9654;&nbsp;"+gbText("設定",ps.gb) : "&#9660;&nbsp;設定"+gbText("設定",ps.gb);
//         //     $('#settings p').html(html);
//         //     var html = $('#versionSelect').css('height') == '38px' ? "&#9654;&nbsp;"+gbText("聖經版本選擇",ps.gb) : "&#9660;&nbsp;"+gbText("聖經版本選擇",ps.gb);
//         //     $('#versionSelect p').html(html);
//         //   }
//         // });
//         // $('.ui-resizable-handle.ui-resizable-s').html('<span>☰</span>');
//         $('#settingsScrollDiv').scroll(function () {
//             $(this).addClass('scrolling');
//             clearTimeout($.data(this, "scrollCheck"));
//             $.data(this, "scrollCheck", setTimeout(function () {
//                 $('#settingsScrollDiv').removeClass('scrolling');
//             }, 350));
//         });
//     },
//     render: function (ps, dom) {
//         //dom.html("設定");
//     }
// };


// (function(root){
//     root.settings = settings
// })(this)