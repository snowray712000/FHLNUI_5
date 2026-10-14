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

    /** show_mode 1 單節併排、2 單節交錯、3 段落併排、4 段落交錯 → 兩個選擇：單節 / 段落、併排 / 交錯 */
    registerEvents(ps) {
        $('#show_mode').off('click.showMode').on('click.showMode', '.sm-btn', function () {
            const m = ps.show_mode ?? 1
            const isPara = this.dataset.k == 'layout' ? this.dataset.v == 'para' : m >= 3
            const isSide = this.dataset.k == 'arrange' ? this.dataset.v == 'side' : m % 2 == 1
            const next = (isPara ? 3 : 1) + (isSide ? 0 : 1)
            if (next == m) return
            ps.show_mode = next

            ShowMode.s.render(ps, $('#show_mode'))
            FhlLecture.s.render(ps, FhlLecture.s.dom);
            triggerGoEventWhenPageStateAddressChange(ps);
            ps.saveToLocalStorage();
        });
    }

    render(ps, dom) {
        const t = s => gbText(s, ps.gb)
        const m = ps.show_mode ?? 1
        const btn = (k, v, text, title, on) =>
            `<button type="button" class="btn btn-sm btn-outline-secondary set-btn sm-btn${on ? ' active' : ''}" data-k="${k}" data-v="${v}" title="${t(title)}" aria-pressed="${on}">${t(text)}</button>`
        const html = `<div class="sm-ctl" role="group" title="${t('顯示切換：多譯本對照方式')}">
            <div class="btn-group sm-seg">${btn('layout', 'verse', '單節', '一節一段', m < 3)}${btn('layout', 'para', '段落', '依段落分組', m >= 3)}</div>
            <div class="btn-group sm-seg">${btn('arrange', 'side', '併排', '譯本左右並排', m % 2 == 1)}${btn('arrange', 'inter', '交錯', '譯本上下輪流', m % 2 == 0)}</div>
        </div>`;
        dom.html(html);
    }
}