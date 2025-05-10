import { FhlLecture } from "./FhlLecture.es2023.js";

export class ShowMode {
    static #s = null
    /** @returns {ShowMode} */
    static get s() { if (this.#s == null) this.#s = new ShowMode(); return this.#s }

    dom = null
    init(ps, dom){
        this.dom = dom;
        this.render(ps, this.dom);
        if (ps.show_mode == null)
            ps.show_mode = 1;
    } 
    registerEvents(ps){
        $('#show_modeSwitch').off('change').on('change',
            function () {
                if ($(this).is(':checked')) {
                    // checked 是指開啟圓圈移到右邊. 那就應該是 出現「交錯」
                    ps.show_mode = 2;
                    pageState.show_mode = 2
                    //ps.chineses = bookGB[book.indexOf(ps.chineses)];
                    FhlLecture.s.render(ps, FhlLecture.s.dom);
                }
                else {
                    // 出現「並列」
                    ps.show_mode = 1;
                    pageState.show_mode = 1
                    //ps.chineses = book[bookGB.indexOf(ps.chineses)];
                    FhlLecture.s.render(ps, FhlLecture.s.dom);
                }
                triggerGoEventWhenPageStateAddressChange(ps);
                updateLocalStorage()
            });
    }
    render(ps, dom){
        var html = "<div>" + gbText("顯示切換", ps.gb) + ":</div>";
        html += '<div class="onOffSwitch">\
                              <input type="checkbox" name="show_modeSwitch" class="onOffSwitch-checkbox" id="show_modeSwitch">\
                              <label class="onOffSwitch-label" for="show_modeSwitch">\
                                  <span class="onOffSwitch-inner showmodeSwitch"></span>\
                                  <span class="onOffSwitch-switch"></span>\
                              </label>\
                          </div>';
        //html += '<span style="color: #770000;">施工中...</span>';
        dom.html(html);
        $('#show_modeSwitch').attr("checked", (ps.show_mode == 2) ? true : false);
    }
}        


// var show_mode = {
//     init: function (ps, dom) {
//         this.dom = dom;
//         this.render(ps, this.dom);
//         if (ps.show_mode == null)
//             ps.show_mode = 1;
//     },
//     registerEvents: function (ps) {
//         $('#show_modeSwitch').change(
//             function () {
//                 if ($(this).is(':checked')) {
//                     // checked 是指開啟圓圈移到右邊. 那就應該是 出現「交錯」
//                     ps.show_mode = 2;
//                     pageState.show_mode = 2
//                     //ps.chineses = bookGB[book.indexOf(ps.chineses)];
//                     fhlLecture.render(ps, fhlLecture.dom);
//                 }
//                 else {
//                     // 出現「並列」
//                     ps.show_mode = 1;
//                     pageState.show_mode = 1
//                     //ps.chineses = book[bookGB.indexOf(ps.chineses)];
//                     fhlLecture.render(ps, fhlLecture.dom);
//                 }
//                 triggerGoEventWhenPageStateAddressChange(ps);
//                 updateLocalStorage()
//             });
//     },
//     render: function (ps, dom) {
//         var html = "<div>" + gbText("顯示切換", ps.gb) + ":</div>";
//         html += '<div class="onOffSwitch">\
//                               <input type="checkbox" name="show_modeSwitch" class="onOffSwitch-checkbox" id="show_modeSwitch">\
//                               <label class="onOffSwitch-label" for="show_modeSwitch">\
//                                   <span class="onOffSwitch-inner showmodeSwitch"></span>\
//                                   <span class="onOffSwitch-switch"></span>\
//                               </label>\
//                           </div>';
//         //html += '<span style="color: #770000;">施工中...</span>';
//         dom.html(html);
//         $('#show_modeSwitch').attr("checked", (ps.show_mode == 2) ? true : false);
//     }
// };

// (function(root){
//     root.show_mode = show_mode
// })(this)