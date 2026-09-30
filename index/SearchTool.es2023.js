import { SearchDialog } from "./SearchDialog_es2023.js";
import { gbText } from "./gbText.es2023.js";

/*
### 工具列右上的搜尋框
- 只有「按放大鏡」或「Enter」才搜尋 (點輸入框不會)
- 有文字時才出現 ×，按下清空
- Esc 清空

<form#searchTool .st-box>
  <button.st-go> 放大鏡 </button>
  <input.st-input.searchBox>
  <button.st-clear> × </button>
</form>
*/
export class SearchTool {
    static #s = null
    /** @returns {SearchTool} */
    static get s() { if (!this.#s) this.#s = new SearchTool(); return this.#s; }

    /** @type {JQuery<HTMLElement>} */
    dom = null;
    init(ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
    }
    /** @returns {JQuery<HTMLInputElement>} */
    get #input() { return this.dom.find('.st-input') }

    /**
     * 其它地方要搜尋時呼叫 (例 原文字典的「出現經文」)，會把關鍵字填入搜尋框
     * @param {string} keyword
     */
    search(keyword) {
        if (keyword != null) this.#input.val(keyword)
        SearchDialog.s.searchAsync(this.#input.val())
    }
    /** 快速鍵 Alt+Shift+F */
    focus() {
        $('#fhlToolBar').addClass('search-open') // 窄的時候搜尋框收成 🔍，先展開 (見 TopBar)
        this.#input.trigger('focus').trigger('select')
    }
    registerEvents(ps) {
        this.dom.on('submit', '.st-box', e => {
            e.preventDefault() // Enter 或按放大鏡
            this.search()
        }).on('click', '.st-clear', () => {
            this.#input.val('').trigger('focus')
        }).on('keydown', '.st-input', e => {
            if (e.key == 'Escape') this.#input.val('')
        })
    }
    render(ps, dom) {
        const placeholder = gbText('關鍵字、G80、羅1:3')
        dom.html(`<form class="st-box" role="search">
            <button type="submit" class="st-go" title="${gbText('搜尋')}"><i class="fa fa-search"></i></button>
            <input type="text" class="st-input searchBox" placeholder="${placeholder}" autocomplete="off">
            <button type="button" class="st-clear" title="${gbText('清除')}"><i class="fa fa-times-circle"></i></button>
        </form>`);
    }
}
