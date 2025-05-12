import { ParsingPopUp } from "./ParsingPopUp.es2023.js";
import { FhlInfoTitle } from "./FhlInfoTitle.es2023.js";
import { FhlInfoContent } from "./FhlInfoContent.es2023.js";
import { FhlLecture } from "./FhlLecture.es2023.js";
import { updateLocalStorage } from './updateLocalStorage.es2023.js';

export class FhlInfo {
    static #s = null
    /** @returns {FhlInfo} */
    static get s() { if (!this.#s ) { this.#s = new FhlInfo(); } return this.#s; }

    dom = null
    init(ps) {
        const rfhlmap = window.rfhlmap

        FhlInfoTitle.s.init(ps, $('#fhlInfoTitle'));
        FhlInfoTitle.s.registerEvents(ps);
        FhlInfoContent.s.init(ps, $('#fhlInfoContent'));
        FhlInfoContent.s.registerEvents(ps);
        ParsingPopUp.s.init(ps, $('#parsingPopUp'));
        this.registerEvents();
        this.render(ps);
        var fhlInfoWidth = 500; //這邊改了，css裡面也要改
        $('#fhlInfo').css({ 'left': $(window).width() - fhlInfoWidth - 12 + 'px' }); // 12 是外面border

        // snow add, 2016.10 經文中的地點mark被click,
        $(document).on({
            'sobj_pos': function (e, p1) {
                if (ps.titleId == "fhlInfoMap") {
                    rfhlmap.set_active(p1.sid);
                }
            }
        });        
    }
    registerEvents(){
        var cx = $(window).width()
        $('#fhlInfo').resizable({
            handles: 'w',
            maxWidth: cx * 0.9,
            // minWidth: 300,
            resize: function (event, ui) {
                const ps = window.pageState

                const currentWidth = ui.size.width;

                // add by snow. 2021.07
                ps.cxInfoWindow = currentWidth
                updateLocalStorage()

                let width = 0;
                if ($("#fhlLeftWindow").css('left') == '12px')
                    width = $(window).width() - $("#fhlLeftWindow").width() - currentWidth;
                else
                    width = $(window).width() - currentWidth + 12;
                $("#fhlMidWindow").css({
                    'width': width - 48 + 'px',
                    'right': currentWidth + 'px'
                });

                FhlLecture.s.reshape(ps); // snow add 2016-07
            }
        });
        $('.ui-resizable-handle.ui-resizable-w').html('<span>&#9776;</span>');
    }
    render(ps) {
        FhlInfoContent.s.render(ps, FhlInfoContent.s.dom);
    }
}

// var fhlInfo = {
//     init: function (ps) {
//         bibleAudio.init(ps, $('#bibleAudio'));
//         bibleAudio.registerEvents(ps);
//         fhlInfoTitle.init(ps, $('#fhlInfoTitle'));
//         fhlInfoTitle.registerEvents(ps);
//         fhlInfoContent.init(ps, $('#fhlInfoContent'));
//         fhlInfoContent.registerEvents(ps);
//         parsingPopUp.init(ps, $('#parsingPopUp'));
//         this.registerEvents();
//         this.render(ps);
//         var fhlInfoWidth = 500; //這邊改了，css裡面也要改
//         $('#fhlInfo').css({ 'left': $(window).width() - fhlInfoWidth - 12 + 'px' }); // 12 是外面border

//         // snow add, 2016.10 經文中的地點mark被click,
//         $(document).on({
//             'sobj_pos': function (e, p1) {
//                 if (ps.titleId == "fhlInfoMap") {
//                     rfhlmap.set_active(p1.sid);
//                 }
//             }
//         });
//     },
//     registerEvents: function () {
//         var cx = $(window).width()
//         $('#fhlInfo').resizable({
//             handles: 'w',
//             maxWidth: cx * 0.9,
//             // minWidth: 300,
//             resize: function (event, ui) {
//                 var currentWidth = ui.size.width;

//                 // add by snow. 2021.07
//                 pageState.cxInfoWindow = currentWidth
//                 updateLocalStorage()

//                 var width = 0;
//                 if ($("#fhlLeftWindow").css('left') == '12px')
//                     width = $(window).width() - $("#fhlLeftWindow").width() - currentWidth;
//                 else
//                     width = $(window).width() - currentWidth + 12;
//                 $("#fhlMidWindow").css({
//                     'width': width - 48 + 'px',
//                     'right': currentWidth + 'px'
//                 });

//                 fhlLecture.reshape(pageState); // snow add 2016-07
//             }
//         });
//         $('.ui-resizable-handle.ui-resizable-w').html('<span>&#9776;</span>');
//     },
//     render: function (ps) {
//         fhlInfoContent.render(ps, fhlInfoContent.dom);
//     }
// };