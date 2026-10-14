import { FhlLecture } from "./FhlLecture.es2023.js";
import { triggerGoEventWhenPageStateAddressChange } from "./triggerGoEventWhenPageStateAddressChange.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from "./gbText.es2023.js";
import { toggleBtnHtml } from "./ToggleBtn.es2023.js";


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
                const ps = TPPageState.s
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
        const html = toggleBtnHtml("imageToolOnOffSwitch", gbText("照片", ps.gb), !!ps.ispho, gbText("圖片顯示", ps.gb), 'last')
        dom.html(html);
    }
};
