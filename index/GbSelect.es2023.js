
import { FhlLecture } from './FhlLecture.es2023.js';
import { FhlInfoTitle } from './FhlInfoTitle.es2023.js';
import { FhlInfo } from './FhlInfo.es2023.js';
import { BookSelectName } from './BookSelectName.es2023.js';
import { triggerGoEventWhenPageStateAddressChange } from './triggerGoEventWhenPageStateAddressChange.es2023.js';
import { updateLocalStorage } from './updateLocalStorage.es2023.js';
import { TPPageState } from "./TPPageState.es2023.js";

export class GbSelect {
    static #s = null
    /** @returns {GbSelect} */
    static get s() { if (this.#s == null) this.#s = new GbSelect(); return this.#s }
    
    dom = null
    init(ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
    }
    registerEvents(ps) {
        $('#gbSelectSwitch').off('change').on('change',
            function () {
                const ps = TPPageState.s

                if ($(this).is(':checked')) {
                    ps.gb = 1;
                    //ps.chineses = bookGB[book.indexOf(ps.chineses)];
                    FhlLecture.s.render(ps, FhlLecture.s.dom);
                    FhlInfoTitle.s.render(ps, FhlInfoTitle.s.dom);
                    FhlInfoTitle.s.registerEvents(ps);
                    FhlInfo.s.render(ps);
                    BookSelectName.s.init(ps, $('#bookSelectName'));
                    BookSelectName.s.registerEvents(ps);

                    $('#title')[0].firstChild.nodeValue = "信望爱圣经工具 ";
                    alert('重新載入後生效')
                }
                else {
                    ps.gb = 0;
                    //ps.chineses = book[bookGB.indexOf(ps.chineses)];
                    FhlLecture.s.render(ps, FhlLecture.s.dom);
                    FhlInfoTitle.s.render(ps, FhlInfoTitle.s.dom);
                    FhlInfoTitle.s.registerEvents(ps);
                    FhlInfo.s.render(ps);
                    $('#title')[0].firstChild.nodeValue = "信望愛聖經工具 ";
                    BookSelectName.s.init(ps, $('#bookSelectName'));
                    BookSelectName.s.registerEvents(ps);
                    alert('重新載入後生效')
                }
                triggerGoEventWhenPageStateAddressChange(ps);
                updateLocalStorage()
            });
    }
    render(ps = null, dom = null) {
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = this.dom

        var html = "<div> " + gbText('繁簡切換', ps.gb) + ":</div>";
        html += '<div class="onOffSwitch">\
                              <input type="checkbox" name="gbSelectSwitch" class="onOffSwitch-checkbox" id="gbSelectSwitch">\
                              <label class="onOffSwitch-label" for="gbSelectSwitch">\
                                  <span class="onOffSwitch-inner traditional-simpleSwitch"></span>\
                                  <span class="onOffSwitch-switch"></span>\
                              </label>\
                          </div>';
        //html += '<span style="color: #770000;">施工中...</span>';
        dom.html(html);
        $('#gbSelectSwitch').attr("checked", (ps.gb == 1) ? true : false);
    }
}


// var gbSelect = {
//     init: function (ps, dom) {
//         this.dom = dom;
//         this.render(ps, this.dom);
//     },
//     registerEvents: function (ps) {
//         $('#gbSelectSwitch').change(
//             function () {
//                 if ($(this).is(':checked')) {
//                     ps.gb = 1;
//                     pageState.gb = 1
//                     //ps.chineses = bookGB[book.indexOf(ps.chineses)];
//                     fhlLecture.render(ps, fhlLecture.dom);
//                     fhlInfoTitle.render(ps, fhlInfoTitle.dom);
//                     fhlInfoTitle.registerEvents(ps);
//                     fhlInfo.render(ps);
//                     bookSelectName.init(ps, $('#bookSelectName'));
//                     bookSelectName.registerEvents(ps);

//                     $('#title')[0].firstChild.nodeValue = "信望爱圣经工具 ";
//                     alert('重新載入後生效')
//                 }
//                 else {
//                     ps.gb = 0;
//                     pageState.gb = 0
//                     //ps.chineses = book[bookGB.indexOf(ps.chineses)];
//                     fhlLecture.render(ps, fhlLecture.dom);
//                     fhlInfoTitle.render(ps, fhlInfoTitle.dom);
//                     fhlInfoTitle.registerEvents(ps);
//                     fhlInfo.render(ps);
//                     $('#title')[0].firstChild.nodeValue = "信望愛聖經工具 ";
//                     bookSelectName.init(ps, $('#bookSelectName'));
//                     bookSelectName.registerEvents(ps);
//                     alert('重新載入後生效')
//                 }
//                 triggerGoEventWhenPageStateAddressChange(ps);
//                 updateLocalStorage()
//             });
//     },
//     render: function (ps, dom) {
//         var html = "<div> " + gbText('繁簡切換', ps.gb) + ":</div>";
//         html += '<div class="onOffSwitch">\
//                               <input type="checkbox" name="gbSelectSwitch" class="onOffSwitch-checkbox" id="gbSelectSwitch">\
//                               <label class="onOffSwitch-label" for="gbSelectSwitch">\
//                                   <span class="onOffSwitch-inner traditional-simpleSwitch"></span>\
//                                   <span class="onOffSwitch-switch"></span>\
//                               </label>\
//                           </div>';
//         //html += '<span style="color: #770000;">施工中...</span>';
//         dom.html(html);
//         $('#gbSelectSwitch').attr("checked", (ps.gb == 1) ? true : false);
//     }
// };

// (function(root){
//     root.gbSelect = gbSelect
// })(this)