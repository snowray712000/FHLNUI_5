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
            // 430KB。彈出視窗以 visibility:hidden 隱藏（仍佔版面），loading="lazy" 在視窗較窄時仍會下載，
            // 所以先放 data-src，等視窗變成可見才設定 src（見 loadImagesWhenShown）
            $('<img>').attr('data-src', './images/help_realtime_disappear.png').css('height', '480px')
        ));
        html += div_img.html();

        $('#helpingPopUpInside').html(html);
        this.registerEvents(ps);
        this.loadImagesWhenShown();
    }
    /** 目前沒有程式會顯示此視窗（顯示的程式都已註解），若日後恢復，以 .css({visibility}) 顯示時圖片會自動載入 */
    loadImagesWhenShown() {
        const popup = document.getElementById('helpingPopUp')
        if (popup == null) return
        const load = () => {
            // 看 inline style：預設的隱藏來自 fhl.css，而 fhl.css 在啟動最後才插入，此時算出的樣式還不可靠；
            // 顯示的程式（已註解）是以 .css({ visibility: 'visible' }) 設在 inline
            const v = popup.style.visibility
            if (v === '' || v === 'hidden') return false
            popup.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src
                img.removeAttribute('data-src')
            })
            return true
        }
        if (load()) return
        const ob = new MutationObserver(() => { if (load()) ob.disconnect() })
        ob.observe(popup, { attributes: true, attributeFilter: ['style', 'class'] })
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