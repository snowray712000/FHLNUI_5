import { FhlLecture } from "./FhlLecture.es2023.js";



export class ImageTool {
    static #s = null
    /** @returns {ImageTool} */
    static get s() { if (this.#s == null) this.#s = new ImageTool(); return this.#s }
    dom = null

    init(ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
    }
    registerEvents(ps) {
        $('#imageToolOnOffSwitch').off('change').on('change',
            function () {
                const ps = window.pageState
                if ($(this).is(':checked')) {
                    // checked 是指開啟圓圈移到右邊. 那就應該是 出現「ON」
                    ps.ispho = true;
                    FhlLecture.s.render();
                }
                else {
                    // 出現「Off」
                    ps.ispho = false;
                    FhlLecture.s.render();
                }
                triggerGoEventWhenPageStateAddressChange(ps);
            });
    }
    render(ps, dom) {
        var html = "<div>" + gbText("圖片顯示", ps.gb) + ":</div>";
        html += '<div class="onOffSwitch">\
                              <input type="checkbox" name="imageToolOnOffSwitch" class="onOffSwitch-checkbox" id="imageToolOnOffSwitch">\
                              <label class="onOffSwitch-label" for="imageToolOnOffSwitch">\
                                  <span class="onOffSwitch-inner"></span>\
                                  <span class="onOffSwitch-switch"></span>\
                              </label>\
                          </div>';
        //html += '<span style="color: #770000;">施工中...</span>';
        dom.html(html);
        $('#imageToolOnOffSwitch').attr("checked", ps.ispho);
    }
};
