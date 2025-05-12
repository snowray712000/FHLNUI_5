import { FhlInfo } from "./FhlInfo.es2023.js";
import { FhlLecture } from "./FhlLecture.es2023.js";
import { FhlInfoContent } from "./FhlInfoContent.es2023.js";
import { triggerGoEventWhenPageStateAddressChange } from "./triggerGoEventWhenPageStateAddressChange.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";

export class RealTimePopUpSelect {
    static #s = null
    /** @returns {RealTimePopUpSelect} */
    static get s() { if (this.#s == null) this.#s = new RealTimePopUpSelect(); return this.#s }
    
    dom = null
    init(ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
    }
    registerEvents(ps) {
        $('#realTimeOnOffSwitch').off('change').on('change',
            function () {
                const ps = TPPageState.s

                if ($(this).is(':checked')) {
                    ps.realTimePopUp = 1;
                    FhlLecture.s.render(ps, FhlLecture.s.dom);
                    FhlInfo.s.render(ps, FhlInfoContent.s.dom);
                }
                else {
                    ps.realTimePopUp = 0;
                    FhlLecture.s.render(ps, FhlLecture.s.dom);
                    FhlInfo.s.render(ps, FhlInfoContent.s.dom);
                }
                triggerGoEventWhenPageStateAddressChange(ps);
            });
    }
    render(ps, dom) {
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = this.dom

        var html = "<div>" + gbText("即時顯示", ps.gb) + ":</div>";
        html += '<div class="onOffSwitch">\
                              <input type="checkbox" name="realTimeOnOffSwitch" class="onOffSwitch-checkbox" id="realTimeOnOffSwitch">\
                              <label class="onOffSwitch-label" for="realTimeOnOffSwitch">\
                                  <span class="onOffSwitch-inner"></span>\
                                  <span class="onOffSwitch-switch"></span>\
                              </label>\
                          </div>';
        dom.html(html);
        $('#realTimeOnOffSwitch').attr("checked", (ps.realTimePopUp == 1) ? true : false);
    }
}


// var realTimePopUpSelect = {
//     init: function (ps, dom) {
//         this.dom = dom;
//         this.render(ps, this.dom);
//     },
//     registerEvents: function (ps) {
//         $('#realTimeOnOffSwitch').change(
//             function () {
//                 if ($(this).is(':checked')) {
//                     ps.realTimePopUp = 1;
//                     fhlLecture.render(ps, fhlLecture.dom);
//                     fhlInfo.render(ps, fhlInfoContent.dom);
//                 }
//                 else {
//                     ps.realTimePopUp = 0;
//                     fhlLecture.render(ps, fhlLecture.dom);
//                     fhlInfo.render(ps, fhlInfoContent.dom);
//                 }
//                 triggerGoEventWhenPageStateAddressChange(ps);
//             });
//     },
//     render: function (ps, dom) {
//         var html = "<div>" + gbText("即時顯示", ps.gb) + ":</div>";
//         html += '<div class="onOffSwitch">\
//                               <input type="checkbox" name="realTimeOnOffSwitch" class="onOffSwitch-checkbox" id="realTimeOnOffSwitch">\
//                               <label class="onOffSwitch-label" for="realTimeOnOffSwitch">\
//                                   <span class="onOffSwitch-inner"></span>\
//                                   <span class="onOffSwitch-switch"></span>\
//                               </label>\
//                           </div>';
//         dom.html(html);
//         $('#realTimeOnOffSwitch').attr("checked", (ps.realTimePopUp == 1) ? true : false);
//     }
// };


// (function(root){
//     root.realTimePopUpSelect = realTimePopUpSelect
// })(this)