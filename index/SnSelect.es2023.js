import { FhlLecture } from "./FhlLecture.es2023.js";
import { triggerGoEventWhenPageStateAddressChange } from "./triggerGoEventWhenPageStateAddressChange.es2023.js";
import { updateLocalStorage } from "./updateLocalStorage.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";

export class SnSelect {
    static #s = null
    /** @returns {SnSelect} */
    static get s() { if (this.#s == null) this.#s = new SnSelect(); return this.#s }

    dom = null
    init(ps, dom) {        
        if ( ps == null ) ps = TPPageState.s

        this.dom = dom;
        this.render(ps, this.dom);
        this.registerEvents(ps);
    }
    registerEvents(ps) {
        if (ps == null) ps = TPPageState.s

        $('#snOnOffSwitch').off('change').on('change',
            function () {
                const ps = TPPageState.s

                if ($(this).is(':checked')) {
                    ps.strong = 1;
                    FhlLecture.s.render(ps, FhlLecture.s.dom);
                }
                else {
                    ps.strong = 0;
                    FhlLecture.s.render(ps, FhlLecture.s.dom);
                }
                triggerGoEventWhenPageStateAddressChange(ps);
                updateLocalStorage()
            });
    }
    render(ps = null, dom = null) {
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = this.dom
        
        var html = "<div>" + gbText("原文編號", ps.gb) + ":</div>";
        html += '<div class="onOffSwitch">\
                              <input type="checkbox" name="snOnOffSwitch" class="onOffSwitch-checkbox" id="snOnOffSwitch">\
                              <label class="onOffSwitch-label" for="snOnOffSwitch">\
                                  <span class="onOffSwitch-inner"></span>\
                                  <span class="onOffSwitch-switch"></span>\
                              </label>\
                          </div>';
        dom.html(html);
        $('#snOnOffSwitch').attr("checked", (ps.strong == 1) ? true : false);
    }
}


// var snSelect = {
//     init: function (ps, dom) {
//         this.dom = dom;
//         this.render(ps, this.dom);
//     },
//     registerEvents: function (ps) {
//         $('#snOnOffSwitch').change(
//             function () {
//                 if ($(this).is(':checked')) {
//                     ps.strong = 1;
//                     pageState.strong = 1
//                     fhlLecture.render(ps, fhlLecture.dom);
//                 }
//                 else {
//                     ps.strong = 0;
//                     pageState.strong = 0
//                     fhlLecture.render(ps, fhlLecture.dom);
//                 }
//                 triggerGoEventWhenPageStateAddressChange(ps);
//                 updateLocalStorage()
//             });
//     },
//     render: function (ps, dom) {
//         var html = "<div>" + gbText("原文編號", ps.gb) + ":</div>";
//         html += '<div class="onOffSwitch">\
//                               <input type="checkbox" name="snOnOffSwitch" class="onOffSwitch-checkbox" id="snOnOffSwitch">\
//                               <label class="onOffSwitch-label" for="snOnOffSwitch">\
//                                   <span class="onOffSwitch-inner"></span>\
//                                   <span class="onOffSwitch-switch"></span>\
//                               </label>\
//                           </div>';
//         dom.html(html);
//         $('#snOnOffSwitch').attr("checked", (ps.strong == 1) ? true : false);
//     }
// };

// (function(root){
//     root.snSelect = snSelect
// })(this)