import { FhlLecture } from "./FhlLecture.es2023.js";
import { triggerGoEventWhenPageStateAddressChange } from "./triggerGoEventWhenPageStateAddressChange.es2023.js";
import { updateLocalStorage } from "./updateLocalStorage.es2023.js";
import { gbText } from "./gbText.es2023.js";

export class ShowMode {
    static _s = null
    /** @returns {ShowMode} */
    static get s() {
        if (this._s == null)
            this._s = new ShowMode();
        return this._s;
    }

    dom = null

    init(ps, dom) {
        this.dom = dom;
        if (ps.show_mode == null) ps.show_mode = 1;
        this.render(ps, dom);
    }

    registerEvents(ps) {
        $('#show_mode_select').off('change').on('change', function () {
            ps.show_mode = parseInt($(this).val());
            pageState.show_mode = ps.show_mode;

            FhlLecture.s.render(ps, FhlLecture.s.dom);
            triggerGoEventWhenPageStateAddressChange(ps);
            updateLocalStorage();
        });
    }

    render(ps, dom) {
        const html = `
            <div>${gbText("顯示切換", ps.gb)}:</div>
            <select id="show_mode_select">
                <option value="1">${gbText("併排（單節）", ps.gb)}</option>
                <option value="2">${gbText("交錯（單節）", ps.gb)}</option>
                <option value="3">${gbText("併排（段落）", ps.gb)}</option>
                <option value="4">${gbText("交錯（段落）... 還沒寫好", ps.gb)}</option>
            </select>
        `;
        dom.html(html);
        $('#show_mode_select').val(ps.show_mode); // 初始化為當前狀態
    }
}

// export class ShowMode {
//     static #s = null
//     /** @returns {ShowMode} */
//     static get s() { if (this.#s == null) this.#s = new ShowMode(); return this.#s }

//     dom = null
//     init(ps, dom){
//         this.dom = dom;
//         this.render(ps, this.dom);
//         if (ps.show_mode == null)
//             ps.show_mode = 1;
//     } 
//     registerEvents(ps){
//         $('#show_modeSwitch').off('change').on('change',
//             function () {
//                 if ($(this).is(':checked')) {
//                     // checked 是指開啟圓圈移到右邊. 那就應該是 出現「交錯」
//                     ps.show_mode = 2;
//                     pageState.show_mode = 2
//                     //ps.chineses = bookGB[book.indexOf(ps.chineses)];
//                     FhlLecture.s.render(ps, FhlLecture.s.dom);
//                 }
//                 else {
//                     // 出現「並列」
//                     ps.show_mode = 1;
//                     pageState.show_mode = 1
//                     //ps.chineses = book[bookGB.indexOf(ps.chineses)];
//                     FhlLecture.s.render(ps, FhlLecture.s.dom);
//                 }
//                 triggerGoEventWhenPageStateAddressChange(ps);
//                 updateLocalStorage()
//             });
//     }
//     render(ps, dom){
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
// }        