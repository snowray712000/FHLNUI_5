/**
 * 呈現 HTML 資料的對話框。
 * 用於原文字典點擊後，取得資料，轉為 HTML，呈現。
 * 也將用於交互參照點擊後，取得資料，轉為 HTML，呈現。
 * - 私有方法，使用 #開頭。
 */
export class DialogHtml {
    /** @type {JQuery<HTMLElement>} 在 showDialog 之後才會有值，這個值存起來，方便 trigger close button 函數*/
    dlg = null;
    /**
     * 顯示對話框
     * @param {{ html: string, maxWidth?: number, maxHeight?: number, width?: number, position?: any, getTitle: () => string, registerEventWhenShowed: (dlg: JQuery<HTMLElement>) => void }} jo 
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
        dlg.dialog("option", "maxWidth", jo.maxWidth ?? window.innerWidth * 0.80);
        dlg.dialog("option", "maxHeight", jo.maxHeight ?? window.innerHeight * 0.80);
        dlg.dialog("option", "width", jo.width ?? window.innerWidth * 0.80);
        if (jo.position) {
            dlg.dialog("option", "position", jo.position);
        }

        dlg.dialog("option", "title", jo.getTitle());
        dlg.dialog("open");

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