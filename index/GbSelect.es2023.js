
import { FhlLecture } from './FhlLecture.es2023.js';
import { FhlInfoTitle } from './FhlInfoTitle.es2023.js';
import { FhlInfo } from './FhlInfo.es2023.js';
import { BookSelectName } from './BookSelectName.es2023.js';
import { triggerGoEventWhenPageStateAddressChange } from './triggerGoEventWhenPageStateAddressChange.es2023.js';
import { TPPageState } from "./TPPageState.es2023.js";
import { gbText } from './gbText.es2023.js';
import { TopBar } from './TopBar.es2023.js';


export class GbSelect {
    static #s = null
    /** @returns {GbSelect} */
    static get s() { if (this.#s == null) this.#s = new GbSelect(); return this.#s }
    
    dom = null
    init(ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
    }
    /** 繁中 / 簡中 兩個按鈕 (樣式同顯示切換 .sm-seg / .sm-btn)；ps.gb 0 = 繁、1 = 簡 */
    registerEvents(ps) {
        $('#gbSelect').off('click.gb').on('click.gb', '.sm-btn', function () {
            const ps = TPPageState.s
            const gb = this.dataset.v == 'gb' ? 1 : 0
            if (gb == ps.gb) return
            ps.gb = gb
            GbSelect.s.render(ps, $('#gbSelect'))
            FhlLecture.s.render(ps, FhlLecture.s.dom);
            FhlInfoTitle.s.render(ps, FhlInfoTitle.s.dom);
            FhlInfoTitle.s.registerEvents(ps);
            FhlInfo.s.render(ps);
            BookSelectName.s.init(ps, $('#bookSelectName'));
            BookSelectName.s.registerEvents(ps);
            TopBar.s.setTitle(gb)
            alert('重新載入後生效')
            triggerGoEventWhenPageStateAddressChange(ps);
            ps.saveToLocalStorage()
        });
    }
    render(ps = null, dom = null) {
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = this.dom

        const btn = (v, text, on) => `<button type="button" class="btn btn-sm btn-outline-secondary set-btn sm-btn${on ? ' active' : ''}" data-v="${v}" aria-pressed="${on}">${text}</button>`
        dom.html(`<div class="sm-ctl" role="group" title="${gbText('繁簡切換', ps.gb)}"><div class="btn-group sm-seg">${btn('big5', '繁中', ps.gb != 1)}${btn('gb', '簡中', ps.gb == 1)}</div></div>`)
    }
}