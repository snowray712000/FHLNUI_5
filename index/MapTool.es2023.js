// import { gbText } from './gbText.es2023.js'
import { FhlLecture } from './FhlLecture.es2023.js';
import { triggerGoEventWhenPageStateAddressChange } from './triggerGoEventWhenPageStateAddressChange.es2023.js';
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from './gbText.es2023.js';
export class MapTool {
    static #s = null
    /** @returns {MapTool} */
    static get s() { if (this.#s == null) this.#s = new MapTool(); return this.#s }

    dom = null
    init(ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
    }
    registerEvents(ps) {
        $('#mapToolOnOffSwitch').off('change').on('change',
            function () {
                const ps = TPPageState.s
                if ($(this).is(':checked')) {
                    // checked 是指開啟圓圈移到右邊. 那就應該是 出現「ON」
                    ps.ispos = true;
                    FhlLecture.s.render(ps, FhlLecture.s.dom);
                }
                else {
                    // 出現「Off」
                    ps.ispos = false;
                    FhlLecture.s.render(ps, FhlLecture.s.dom);
                }
                triggerGoEventWhenPageStateAddressChange(ps);
            });
    }
    render(ps, dom) {
        var html = "<div>" + gbText("地圖顯示", ps.gb) + ":</div>";
        html += '<div class="onOffSwitch">\
                              <input type="checkbox" name="mapToolOnOffSwitch" class="onOffSwitch-checkbox" id="mapToolOnOffSwitch">\
                              <label class="onOffSwitch-label" for="mapToolOnOffSwitch">\
                                  <span class="onOffSwitch-inner"></span>\
                                  <span class="onOffSwitch-switch"></span>\
                              </label>\
                          </div>';
        //html += '<span style="color: #770000;">施工中...</span>';
        dom.html(html);
        $('#mapToolOnOffSwitch').attr("checked", ps.ispos);
    }
}
// (function(root){
//     root.mapTool = mapTool
// })(this)

// var mapTool = {
//     init: function (ps, dom) {
//         this.dom = dom;
//         this.render(ps, this.dom);
//     },
//     registerEvents: function (ps) {
//         $('#mapToolOnOffSwitch').change(
//             function () {
//                 if ($(this).is(':checked')) {
//                     // checked 是指開啟圓圈移到右邊. 那就應該是 出現「ON」
//                     ps.ispos = true;
//                     fhlLecture.render(ps, fhlLecture.dom);
//                 }
//                 else {
//                     // 出現「Off」
//                     ps.ispos = false;
//                     fhlLecture.render(ps, fhlLecture.dom);
//                 }
//                 triggerGoEventWhenPageStateAddressChange(ps);
//             });
//     },
//     render: function (ps, dom) {
//         var html = "<div>" + gbText("地圖顯示", ps.gb) + ":</div>";
//         html += '<div class="onOffSwitch">\
//                               <input type="checkbox" name="mapToolOnOffSwitch" class="onOffSwitch-checkbox" id="mapToolOnOffSwitch">\
//                               <label class="onOffSwitch-label" for="mapToolOnOffSwitch">\
//                                   <span class="onOffSwitch-inner"></span>\
//                                   <span class="onOffSwitch-switch"></span>\
//                               </label>\
//                           </div>';
//         //html += '<span style="color: #770000;">施工中...</span>';
//         dom.html(html);
//         $('#mapToolOnOffSwitch').attr("checked", ps.ispos);
//     }
// };


// (function(root){
//     root.mapTool = mapTool
// })(this)