import { FhlLecture } from "./FhlLecture.es2023.js";
import { triggerGoEventWhenPageStateAddressChange } from "./triggerGoEventWhenPageStateAddressChange.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from "./gbText.es2023.js";
import { toggleBtnHtml } from "./ToggleBtn.es2023.js";
import { SnFilter } from "./SnFilter.es2023.js";
import { SnFilterDialog } from "./SnFilterDialog.es2023.js";

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
                ps.saveToLocalStorage();
                SnFilter.s.applyAll(); // 搜尋結果、交互參照對話框
                SnFilterDialog.s.render();
            });
        $('#snFilterBtn').off('click').on('click', () => SnFilterDialog.s.open())
            .off('contextmenu').on('contextmenu', ev => { // 右鍵、手機長按：快速切換讀經組合
                ev.preventDefault();
                SnFilterDialog.s.openQuickMenu(ev.currentTarget);
            });
    }
    render(ps = null, dom = null) {
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = this.dom
        
        const html = '<div class="tgl-row">' + toggleBtnHtml("snOnOffSwitch", gbText("原文SN", ps.gb), ps.strong == 1)
            + '<span id="snFilterBtn" class="sn-filter-btn" role="button" title="' + gbText("SN 設定與篩選 (右鍵、長按：切換讀經組合)", ps.gb) + '"><i class="fa fa-cog"></i></span></div>';
        dom.html(html);
        $('#snFilterBtn').toggleClass('active', SnFilter.s.mode == 'filter');
    }
}