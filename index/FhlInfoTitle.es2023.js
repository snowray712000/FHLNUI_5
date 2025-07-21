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
                if (addr.book == 45) {
                    $('#fhlSnBranch').css('visibility', '');
                } else {
                    $('#fhlSnBranch').css('visibility', 'hidden');
                }
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
        dom.html(html);
        for (var i = 0; i < this.title.length; i++) {
            dom.find('li:eq(' + i + ')').attr('id', this.title[i].id);
        }
        $('#' + ps.titleId).addClass('selected');
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
            ];
        }
    }
}
