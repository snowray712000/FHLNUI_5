import { FhlLecture } from "./FhlLecture.es2023.js";
import { triggerGoEventWhenPageStateAddressChange } from "./triggerGoEventWhenPageStateAddressChange.es2023.js";
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
            ps.saveToLocalStorage();
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