
import { FhlLecture } from "./FhlLecture.es2023.js";
import { updateLocalStorage } from './updateLocalStorage.es2023.js';
import { gbText } from './gbText.es2023.js';

export class FontSizeTool {
    static #s = null
    /** @returns {FontSizeTool} */
    static get s() { if (this.#s == null) this.#s = new FontSizeTool(); return this.#s }

    dom = null

    init(ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
        this.registerEvents(ps);
    }

    registerEvents(ps) {
        const makeSureSizeBetween6and60 = () => {
            const fontSizeInput = $('#fhlLectureFontSize');
            if (fontSizeInput.val() > 60) {
                fontSizeInput.val(60);
            } else if (fontSizeInput.val() < 6) {
                fontSizeInput.val(6);
            }
        };

        const onFontSizeToolSizeChanged = (sz, ps) => {
            $('#fhlLectureFontSizeSliderBar').val(sz);

            $('#fhlLecture .lec').css({
                'margin': sz * 1.25 - 15 + 'px 0px'
            });
            $('#commentScrollDiv').css({
                'margin': sz * 1.25 - 15 + 'px 0px'
            });

            $('#fhlLecture .lecContent.bhs.hebrew').css({
                'margin': sz * 1.25 - 15 + 'px 0px'
            });

            ps.fontSize = sz;
            updateLocalStorage();

            document.body.style.setProperty("--fontsize", ps.fontSize + "pt");

            renderTsk(ps);
        };

        $('#fhlLectureFontSizeSliderBar').off('change').on('change', function () {
            $("#fhlLectureFontSize").val($('#fhlLectureFontSizeSliderBar').val());
            makeSureSizeBetween6and60();
            onFontSizeToolSizeChanged(parseInt($('#fhlLectureFontSize').val()), ps);
            FhlLecture.s.reshape(ps);
        });

        $('#fhlLectureFontSize').off('change').on('change', function () {
            makeSureSizeBetween6and60();
            onFontSizeToolSizeChanged(parseInt($('#fhlLectureFontSize').val()), ps);
            FhlLecture.s.reshape(ps);
        });

        $('#fhlLectureFontSizeSmaller').off('click').on('click', function () {
            $('#fhlLectureFontSize').val(parseInt($('#fhlLectureFontSize').val()) - 2);
            makeSureSizeBetween6and60();
            onFontSizeToolSizeChanged(parseInt($('#fhlLectureFontSize').val()), ps);
            FhlLecture.s.reshape(ps);
        });

        $('#fhlLectureFontSizeLarger').off('click').on('click', function () {
            $('#fhlLectureFontSize').val(parseInt($('#fhlLectureFontSize').val()) + 2);
            makeSureSizeBetween6and60();
            onFontSizeToolSizeChanged(parseInt($('#fhlLectureFontSize').val()), ps);
            FhlLecture.s.reshape(ps);
        });
    }

    render(ps, dom) {
        const html = `
            <div>${gbText("字體大小", ps.gb)}:</div>
            <div id="fhlLectureFontSizeSmaller">A<span>-</span></div>
            <div id="fhlLectureFontSizeLarger">A<span>+</span></div>
            <div style="display: block; margin-top: 5px; height: 30px;">
                <input id="fhlLectureFontSizeSliderBar" type="range" min="6" max="60" value="${ps.fontSize}" step="1" style="width: 95px;"/>
                <input id="fhlLectureFontSize" type="text" value="${ps.fontSize}" style="width:2em;"/>
            </div>
        `;
        dom.html(html);
    }
}


// var fontSizeTool = {
//     init: function (ps, dom) {
//         this.dom = dom;
//         this.render(ps, this.dom);
//     },
//     registerEvents: function (ps) {
//         $('#fhlLectureFontSizeSliderBar').change(function () {
//             $("#fhlLectureFontSize").val($('#fhlLectureFontSizeSliderBar').val());
//             makeSureSizeBetween6and60();
//             onFontSizeToolSizeChanged(parseInt($('#fhlLectureFontSize').val()), ps);
//             fhlLecture.reshape(ps);//show add, 經文排整齊
//         });
//         $('#fhlLectureFontSize').change(function () {
//             makeSureSizeBetween6and60();
//             onFontSizeToolSizeChanged(parseInt($('#fhlLectureFontSize').val()), ps);
//             fhlLecture.reshape(ps);//show add, 經文排整齊
//         });
//         $('#fhlLectureFontSizeSmaller').click(function () {
//             $('#fhlLectureFontSize').val(parseInt($('#fhlLectureFontSize').val()) - 2);
//             makeSureSizeBetween6and60();
//             onFontSizeToolSizeChanged(parseInt($('#fhlLectureFontSize').val()), ps);
//             fhlLecture.reshape(ps);//show add, 經文排整齊
//         });
//         $('#fhlLectureFontSizeLarger').click(function () {
//             $('#fhlLectureFontSize').val(parseInt($('#fhlLectureFontSize').val()) + 2);
//             makeSureSizeBetween6and60();
//             onFontSizeToolSizeChanged(parseInt($('#fhlLectureFontSize').val()), ps);
//             fhlLecture.reshape(ps);//show add, 經文排整齊
//         });
//         return
//         function makeSureSizeBetween6and60() {
//             if ($('#fhlLectureFontSize').val() > 60)
//                 $('#fhlLectureFontSize').val(60);
//             else if ($('#fhlLectureFontSize').val() < 6)
//                 $('#fhlLectureFontSize').val(6);
//         }

//         function onFontSizeToolSizeChanged(sz, ps) {
//             // sz: parseInt($('#fhlLectureFontSize').val())
//             $('#fhlLectureFontSizeSliderBar').val(sz);

//             $('#fhlLecture .lec').css({
//                 'margin': sz * 1.25 - 15 + 'px 0px'
//             });
//             $('#commentScrollDiv').css({
//                 'margin': sz * 1.25 - 15 + 'px 0px'
//             });
            
//             // 這是哪裡的字體大小？
//             $('#fhlLecture .lecContent.bhs.hebrew').css({
//                 'margin': sz * 1.25 - 15 + 'px 0px'
//             });
            
//             ps.fontSize = sz;
//             updateLocalStorage()
            
//             // 更新 body --fontsize
//             // 字型大小，統一改用 --fontsize css 變數, line-height: 1.1em 
//             document.body.style.setProperty("--fontsize", ps.fontSize + "pt")
            
//             renderTsk(ps);
//             return

//         }

//     },
//     render: function (ps, dom) {
//         var html = "<div>" + gbText("字體大小", ps.gb) + ":</div>";
//         html += ' <div id="fhlLectureFontSizeSmaller">A<span>-</span></div>\
//                           <div id="fhlLectureFontSizeLarger">A<span>+</span></div>\
//                           <div style="display: block; margin-top: 5px; height: 30px;">\
//                               <input id="fhlLectureFontSizeSliderBar" type="range" min="6" max="60" value="'+ ps.fontSize + '" step="1" style="width: 95px;"/>\
//                               <input id="fhlLectureFontSize" type="text" value="'+ ps.fontSize + '" style="width:2em;"/>\
//                           </div>\
//                           ';
//         dom.html(html);
//     }
// };


// (function(root){
//     root.fontSizeTool = fontSizeTool
// })(this)