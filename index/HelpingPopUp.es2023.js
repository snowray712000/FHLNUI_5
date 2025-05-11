export class FhlHelpingPopUp {
    static #s = null
    /** @returns {FhlHelpingPopUp} */
    static get s() { if (!this.#s) this.#s = new FhlHelpingPopUp(); return this.#s; }

    dom = null
    init(ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
    }
    registerEvents(ps) {
        $('#helpCloseButton').on('click', function () {
            $('#helpingPopUp').css({
                'visibility': 'hidden',
                'opacity': '0'
            });
        });
    }
    render(ps, dom) {
        var html = "";
        html += '<div><div id="helpCloseButton"><i class="fa fa-times"></i></div><ul>\
                        <li>Alt + Shift + F: 搜尋</li>\
                        <li>Alt + Shift + S: 快速選章</li>\
                        <li>Alt + Shift + L: 全螢幕</li>\
                        <li>Alt + Shift + Z: 設定視窗開關</li>\
                        <li>Alt + Shift + X: 搜尋視窗開關</li>\
                        <li>Alt + Shift + C: 輔助視窗開關</li>\
                        <li>Alt + Shift + /: 幫助，跳出</li>\
                        </ul></div>';
        
        // 即時顯示功能
        const div_img = $('<div>').append(
            $("<a>").attr('href', './images/help_realtime_disappear.png').attr('target', '_blank').append(
            $('<img>').attr('src', './images/help_realtime_disappear.png').css('height', '480px')
        ));
        html += div_img.html();
        
        $('#helpingPopUpInside').html(html);
        this.registerEvents(ps);        
    }
}

// (function (root) {
//     root.helpingPopUp = {

//         render: function (ps, dom) {
//             var html = "";
//             html += '<div><div id="helpCloseButton"><i class="fa fa-times"></i></div><ul>\
//                           <li>Alt + Shift + F: 搜尋</li>\
//                           <li>Alt + Shift + S: 快速選章</li>\
//                           <li>Alt + Shift + L: 全螢幕</li>\
//                           <li>Alt + Shift + Z: 設定視窗開關</li>\
//                           <li>Alt + Shift + X: 搜尋視窗開關</li>\
//                           <li>Alt + Shift + C: 輔助視窗開關</li>\
//                           <li>Alt + Shift + /: 幫助，跳出</li>\
//                           </ul></div>';
            
//             // 即時顯示功能
//             const div_img = $('<div>').append(
//                 $("<a>").attr('href', './images/help_realtime_disappear.png').attr('target', '_blank').append(
//                 $('<img>').attr('src', './images/help_realtime_disappear.png').css('height', '480px')
//             ));
//             html += div_img.html();
            
//             $('#helpingPopUpInside').html(html);
//             this.registerEvents(ps);
//         }
//     }
// })(this)