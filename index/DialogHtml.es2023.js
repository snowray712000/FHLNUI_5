/**
 * 呈現 HTML 資料的對話框。
 * 用於原文字典點擊後，取得資料，轉為 HTML，呈現。
 * 也將用於交互參照點擊後，取得資料，轉為 HTML，呈現。
 * - 私有方法，使用 #開頭。
 */
/** 內容字型大小相對 12pt 的倍率 (≥1)，字大時對話框預設寬度跟著放大 */
export function contentFontK() {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fontsize'))
    return Number.isFinite(v) ? Math.max(1, v / 12) : 1
}

const SIZE_STORE = 'fhlDlgSize'
/** @param {string | undefined} key @returns {{w:number,h:number} | null} */
function readSize(key) {
    if (!key) return null
    try {
        const v = JSON.parse(localStorage.getItem(SIZE_STORE) ?? '{}')[key]
        return v && v.w > 100 && v.h > 100 ? v : null
    } catch { return null }
}
/** 使用者拖曳改完的大小，下次開同一種對話框沿用 @param {string | undefined} key */
function writeSize(key, w, h) {
    if (!key) return
    try {
        const all = JSON.parse(localStorage.getItem(SIZE_STORE) ?? '{}')
        all[key] = { w: Math.round(w), h: Math.round(h) }
        localStorage.setItem(SIZE_STORE, JSON.stringify(all))
    } catch { /* 無痕等，不記也能用 */ }
}

export class DialogHtml {
    /** @type {JQuery<HTMLElement>} 在 showDialog 之後才會有值，這個值存起來，方便 trigger close button 函數*/
    dlg = null;
    /**
     * 顯示對話框
     * @param {{ sizeKey?: string, html: string, maxWidth?: number, maxHeight?: number, width?: number, height?: number, position?: any, getTitle: () => string, registerEventWhenShowed: (dlg: JQuery<HTMLElement>) => void }} jo 
     */
    showDialog = (jo) => {
        const idDlg = this.#getIdOfDialog();
        const dlg = $(`#${idDlg}`).dialog({
            autoOpen: false,
        });

        // 清除事件，避免記憶體殘留
        dlg.on("dialogclose", () => {
            dlg.parent()[0].outerHTML = "";
            this.dlg = null; // 清除 dlg 的引用
        });

        // 顯示關閉按鈕的圖示
        const imgUrl = './images/ui-icons_cc0000b_256x240.png';
        dlg.on("dialogopen", function () {
            $(this).closest(".ui-dialog")
                .find(".ui-dialog-titlebar-close")
                .html(`<span class='ui-button-icon-primary ui-icon ui-icon-closethick' style='margin: -16px 0px 0px -2px;background-image: url("${imgUrl}");'></span>`);
        });

        dlg.html(jo.html);

        // 設定對話框屬性
        dlg.dialog("option", "maxWidth", jo.maxWidth ?? window.innerWidth - 16);
        dlg.dialog("option", "maxHeight", jo.maxHeight ?? window.innerHeight * 0.80);
        dlg.dialog("option", "width", Math.min(window.innerWidth - 16, jo.width ?? Math.max(window.innerWidth * 0.80, 560 * contentFontK())));
        // 高度不交給 jQuery UI (它把高度寫在內容區 px，拖曳 alsoResize 後內容區與對話框的寬高會不一致、捲軸離邊越來越遠)；
        // 改成對話框自己有高度，內容區用 flex 填滿 (.dlg-fluid, fhl.css)
        const saved = readSize(jo.sizeKey)
        if (saved) dlg.dialog("option", "width", Math.min(window.innerWidth - 16, saved.w));
        if (jo.position) {
            dlg.dialog("option", "position", jo.position);
        }

        dlg.dialog("option", "title", jo.getTitle());
        dlg.dialog("open");
        const $ui = dlg.parent().addClass('dlg-fluid');
        const h = saved?.h ?? jo.height
        if (h) {
            $ui.outerHeight(Math.min(window.innerHeight - 16, h));
            dlg.dialog('option', 'position', jo.position ?? dlg.dialog('option', 'position')); // 高度變了，重新定位
        }
        // 使用者一開始拖曳就不再受「預設 80% 高」限制 (沒有必要限制)；記住的大小也一樣
        const releaseMax = () => {
            dlg.css('max-height', 'none');
            try { $ui.resizable('option', 'maxHeight', window.innerHeight - 16) } catch { /* 不可調整的對話框 */ }
        };
        if (saved?.h) releaseMax();
        dlg.on('dialogresizestart', releaseMax);
        dlg.on('dialogresizestop', () => writeSize(jo.sizeKey, $ui.outerWidth(), $ui.outerHeight()));

        jo.registerEventWhenShowed(dlg);
        this.dlg = dlg; // 儲存 dlg 以便後續操作
    };
    closeDialogViaTriggerCloseButton = () => {
        if ( this.dlg ) {
            this.dlg.parent().find('.ui-dialog-titlebar-close').trigger('click');
        }
    }
    /**
     * 自動取得合適的對話框 ID，不重複使用已存在的 ID。
     * @returns {string}
     */
    #getIdOfDialog = () => {
        const prefix = "iddlg";

        let idx = 0;
        while ($(`#${prefix}${idx}`).length > 0) {
            idx++;
        }

        $("<div>", {
            id: `${prefix}${idx}`,
            text: "dialog",
        }).appendTo($("body"));

        return `${prefix}${idx}`;
    };
}