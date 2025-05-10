
export class FhlInfo {
    static #s = null
    /** @returns {FhlInfo} */
    static get s() { if (!this.#s ) { this.#s = new FhlInfo(); } return this.#s; }

    dom = null
    init(ps) {
        const fhlInfoTitle = window.fhlInfoTitle
        const fhlInfoContent = window.fhlInfoContent
        const parsingPopUp = window.parsingPopUp
        const rfhlmap = window.rfhlmap

        fhlInfoTitle.init(ps, $('#fhlInfoTitle'));
        fhlInfoTitle.registerEvents(ps);
        fhlInfoContent.init(ps, $('#fhlInfoContent'));
        fhlInfoContent.registerEvents(ps);
        parsingPopUp.init(ps, $('#parsingPopUp'));
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
                const fhlLecture = window.fhlLecture

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

                fhlLecture.reshape(ps); // snow add 2016-07
            }
        });
        $('.ui-resizable-handle.ui-resizable-w').html('<span>&#9776;</span>');
    }
    render(ps) {
        const fhlInfoContent = window.fhlInfoContent
        fhlInfoContent.render(ps, fhlInfoContent.dom);
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