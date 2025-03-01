/// <reference path="./DialogHtml.es6.js"/>

(function (root) {
    root.help = {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
            helpingPopUp.init(ps, $('#helpingPopUp'));
        },

        registerEvents: function (ps) {
            
            this.dom.on('click', function () {                
                const DialogHtml = DialogHtmlEs6Js()
                const dlg = new DialogHtml()

                // 快速鍵清單
                // Alt + Shift + z: 設定視窗開關 (左邊)
                // Alt + Shift + x: 搜尋視窗開關 (下方)
                // Alt + Shift + c: 輔助視窗開關 (右邊)
                // Alt + Shift + /: 幫助，跳出 (這個視窗)
                // Alt + Shift + L: 全螢幕 (目前有Bug, 全營幕後，即時功能失效)
                // Alt + Shift + F: 搜尋 (失效)
                // Alt + Shift + S: 快速選章 (失效)
                const div_shortcut = $('<div>').append(
                    $("<h3>").text('快速鍵清單'),
                    $('<ul>').append(
                        $('<li>').text('Alt + Shift + z: 設定視窗開關 (左邊)'),
                        $('<li>').text('Alt + Shift + x: 搜尋視窗開關 (下方)'),
                        $('<li>').text('Alt + Shift + c: 輔助視窗開關 (右邊)'),
                        $('<li>').text('Alt + Shift + /: 幫助，跳出 (這個視窗)'),
                        $('<li>').text('Alt + Shift + L: 全螢幕 (目前有Bug, 全螢幕後，即時功能失效)'),
                        $('<li>').text('Alt + Shift + F: 搜尋 (失效)'),
                        $('<li>').text('Alt + Shift + S: 快速選章 (失效)')
                    )
                );

                // 即時顯示功能，說明
                const div_realtime_help = $('<div>').append(
                    $("<h3>").text('即時顯示功能: 設定->即時顯示'),
                    $('<img>').attr('src', './images/help_realtime_disappear.png').css('width', '100%'),
                    $("<a>").attr('href', './images/help_realtime_disappear.png').attr('target', '_blank').text('放大圖片')
                );

                // 最終
                const div_final = $('<div>').append(
                    div_shortcut,
                    "<hr/>",
                    div_realtime_help
                );

                dlg.showDialog({
                    html: div_final.html(),
                    getTitle: () => "幫助",
                    registerEventWhenShowed: dlg => {
                        // helpingPopUp.registerEvents(ps);
                    }
                })

                // if ($('#helpingPopUp').css('opacity') == 1) {
                //     $('#helpingPopUp').css({
                //         'visibility': 'hidden',
                //         'opacity': '0'
                //     });
                // } else {
                //     $('#helpingPopUp').css({
                //         'visibility': 'visible',
                //         'opacity': '1'
                //     });
                // }
            });
        },
        render: function (ps, dom) {
            var html = "";
            html += '?';
            dom.html(html);
            this.registerEvents(ps);
        }
    };
})(this)