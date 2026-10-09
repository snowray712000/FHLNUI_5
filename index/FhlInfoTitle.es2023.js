import { triggerGoEventWhenPageStateAddressChange, triggerInfoTitleChanged } from './triggerGoEventWhenPageStateAddressChange.es2023.js'
import { TPPageState } from './TPPageState.es2023.js';
export class FhlInfoTitle {
    static #s = null
    /** @returns {FhlInfoTitle} */
    static get s() { if (!this.#s) { this.#s = new FhlInfoTitle(); } return this.#s; }

    /** @type {HTMLElement} #fhlInfoTitle */
    dom = null
    /** @type {string} 於 setTitleViaGb 初始化一次 */
    title = null

    init(ps, dom) {
        if (ps == null) ps = TPPageState.s

        this.dom = dom;
        this.setTitleViaGb(ps);
        this.render(ps, this.dom);
        this.#watchLayout(dom[0]);
    }

    /**
     * 分頁標籤太多放不下時，放不下的收進最右邊的「⋯」選單 (只在放不下時才出現)。
     * 寬度、字型大小、選中分頁 (選中的字較大) 改變時都要重排
     * @param {HTMLElement} el #fhlInfoTitle
     */
    #watchLayout(el) {
        let queued = false
        const queue = () => {
            if (queued) return
            queued = true
            requestAnimationFrame(() => { queued = false; this.layoutOverflow() })
        }
        this.requestLayout = queue
        new ResizeObserver(queue).observe(el)
        new MutationObserver(queue).observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] })
        el.addEventListener('click', e => { // 點「⋯」或選單項目，其餘 (點分頁) 之後重排
            const t = /** @type {HTMLElement} */ (e.target)
            if (t.closest('.tab-more')) { e.stopPropagation(); this.#toggleMenu() }
            else queue()
        })
        document.addEventListener('pointerdown', e => {
            if (!(/** @type {HTMLElement} */ (e.target)).closest('.tab-more, .tab-more-menu')) this.#closeMenu()
        })
        document.fonts?.ready.then(queue)
        queue()
    }

    layoutOverflow() {
        const el = this.dom?.[0]
        const ul = el?.querySelector('ul')
        if (!el || !ul) return
        const lis = /** @type {HTMLElement[]} */ ([...ul.querySelectorAll('li')]).filter(a => a.style.display != 'none')
        lis.forEach(a => a.classList.remove('tab-over'))
        const btn = /** @type {HTMLElement} */ (el.querySelector('.tab-more'))
        btn.hidden = true
        const widthOf = a => a.offsetWidth + 6 // margin 3 + 3
        const all = lis.reduce((n, a) => n + widthOf(a), 0)
        const avail = el.clientWidth
        if (all > avail) {
            btn.hidden = false
            let left = avail - btn.offsetWidth
            for (const a of lis) {
                left -= widthOf(a)
                if (left < 0) a.classList.add('tab-over')
            }
        }
        const over = lis.filter(a => a.classList.contains('tab-over'))
        btn.classList.toggle('has-selected', over.some(a => a.classList.contains('selected'))) // 選中的被收起來了
        if (!btn.hidden && over.length == 0) btn.hidden = true
        el.classList.toggle('tabs-over', !btn.hidden) // 有 ⋯ 時靠左排，不然置中的標籤會被 ⋯ 蓋到
        if (btn.hidden) this.#closeMenu()
        else if (document.querySelector('.tab-more-menu')) this.#openMenu() // 開著時，內容跟著更新
    }

    #closeMenu() {
        document.querySelector('.tab-more-menu')?.remove()
        this.dom?.[0]?.querySelector('.tab-more')?.setAttribute('aria-expanded', 'false')
    }
    #toggleMenu() {
        if (document.querySelector('.tab-more-menu')) this.#closeMenu(); else this.#openMenu()
    }
    #openMenu() {
        const el = this.dom[0]
        document.querySelector('.tab-more-menu')?.remove()
        const menu = document.createElement('div')
        menu.className = 'tab-more-menu'
        menu.setAttribute('role', 'menu')
        for (const li of /** @type {HTMLElement[]} */ ([...el.querySelectorAll('li.tab-over')])) {
            const b = document.createElement('button')
            b.type = 'button'
            b.setAttribute('role', 'menuitem')
            b.textContent = li.textContent
            if (li.classList.contains('selected')) b.classList.add('selected')
            b.addEventListener('click', () => { this.#closeMenu(); $(li).trigger('click'); this.requestLayout() })
            menu.append(b)
        }
        document.getElementById('fhlInfo').append(menu)
        el.querySelector('.tab-more')?.setAttribute('aria-expanded', 'true')
    }
    registerEvents(ps) {
        if (ps == null) ps = TPPageState.s

        // 型成 jquery 用字串.
        // #fhlInfoParsing,#fhlInfoComment,#fhlInfoPreach,#fhlInfoTsk,#fhlInfoOb,#fhlInfoAudio,#fhlInfoMap,#fhlSnBranch
        var selectAll = this.title.map(a1 => `#${a1.id}`).join(',')

        $(selectAll).on('click', function (_) {
            const ps = TPPageState.s

            var idTitle = $(this).attr('id');
            if (idTitle == ps.titleId) {
                // 目前是注釋，又點了一次注釋 (防呆)
            } else {
                $(selectAll).removeClass('selected');
                $(this).addClass('selected'); // this 是指被 click 那個

                ps.titleIdold = ps.titleId; // add 2015.12.10(四) 為了有聲聖經,切換問題
                ps.titleId = idTitle;
                triggerGoEventWhenPageStateAddressChange(ps);
                triggerInfoTitleChanged(ps)

                fhlInfoContent.render(ps, fhlInfoContent.dom);
            }
        })

        // 樹狀圖，只有在羅馬書才會出現title        
        $(document).on('go', function (event, addr) {
            const ps = TPPageState.s
            
            // assert ps.titleIdold != ps.titleId
            if (ps.titleId == "fhlSnBranch") {
                if (addr.book != 45) { // 若目前是 樹狀圖，但變成不是時，會隱藏，但要自動切換掉
                    $('#' + ps.titleIdold).trigger('click')
                }
            } else {
                $('#fhlSnBranch').css('display', addr.book == 45 ? '' : 'none');                
            }
        });
    }

    render(ps, dom) {
        if (ps == null) ps = TPPageState.s
        if (dom == null) dom = this.dom

        this.setTitleViaGb(ps);
        var html = "<ul>";
        for (var i = 0; i < this.title.length; i++) {
            html += "<li>" + this.title[i].name + "</li>";
        }
        html += "</ul>";
        html += '<button type="button" class="tab-more" hidden aria-haspopup="menu" aria-expanded="false" title="更多分頁">⋯</button>';
        dom.html(html);
        for (var i = 0; i < this.title.length; i++) {
            dom.find('li:eq(' + i + ')').attr('id', this.title[i].id);
        }
        $('#' + ps.titleId).addClass('selected');
        this.requestLayout?.()
    }
    setTitleViaGb(ps) {
        if (this.title != null) return; // 只初始化一次

        if (ps.gb === 1) {
            this.title = [
                { "name": "原文", "id": "fhlInfoParsing" },
                { "name": "注释", "id": "fhlInfoComment" },
                { "name": "讲道", "id": "fhlInfoPreach" },
                { "name": "串珠", "id": "fhlInfoTsk" },
                { "name": "典藏", "id": "fhlInfoOb" },
                { "name": "有声", "id": "fhlInfoAudio" },
                { "name": "地図", "id": "fhlInfoMap" },
                { "name": "树状图", "id": "fhlSnBranch" },
                { "name": "AI", "id": "fhlAi" },
            ];
        } else {
            this.title = [
                { "name": "原文", "id": "fhlInfoParsing" },
                { "name": "註釋", "id": "fhlInfoComment" },
                { "name": "講道", "id": "fhlInfoPreach" },
                { "name": "串珠", "id": "fhlInfoTsk" },
                { "name": "典藏", "id": "fhlInfoOb" },
                { "name": "有聲", "id": "fhlInfoAudio" },
                { "name": "地圖", "id": "fhlInfoMap" },
                { "name": "樹狀圖", "id": "fhlSnBranch" },
                { "name": "AI", "id": "fhlAi" },
            ];
        }
    }
}
