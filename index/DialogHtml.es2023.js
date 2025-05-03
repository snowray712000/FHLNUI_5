/**
 * 呈現 HTML 資料的對話框。
 * 用於原文字典點擊後，取得資料，轉為 HTML，呈現。
 * 也將用於交互參照點擊後，取得資料，轉為 HTML，呈現。
 * - 私有方法，使用 #開頭。
 */
export class DialogHtml {
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
    };

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


// function DialogHtmlEs6Js() {
//     return DialogHtml
//     /**
//      * 呈現 html 資料的 dialog。
//      * 用在 原文字典 點擊後，取得資料，轉為 html，呈現。
//      * 也將會用到 交互參照 點擊後，取得資料，轉為 html，呈現。
//      * @class
//      */
//     function DialogHtml() {
//         /**
//          * @param {{DDialogHtml}} jo 
//          * @returns 
//          */
//         this.showDialog = function (jo) {
//             let idDlg = getIdOfDialog();
//             let dlg = $('#' + idDlg).dialog({
//                 autoOpen: false,
//             });

//             // 真正有效 清除事件, 避免記憶體殘留
//             dlg.on("dialogclose", function (event, ui) {
//                 dlg.parent()[0].outerHTML = ""
//             });
//             // 將 close button 的 x 顯示 (因為與 bootstrap 衝突，會不見)
//             const imgUrl = './images/ui-icons_cc0000b_256x240.png'
//             dlg.on("dialogopen", function (event, ui) {
//                 // https://stackoverflow.com/questions/17367736/jquery-ui-dialog-missing-close-icon
//                 $(this).closest(".ui-dialog")
//                     .find(".ui-dialog-titlebar-close")
//                     // .removeClass("ui-dialog-titlebar-close")
//                     .html("<span class='ui-button-icon-primary ui-icon ui-icon-closethick' style='margin: -16px 0px 0px -2px;background-image: url(\"" + imgUrl + "\");'></span>");
//             });
//             dlg.html(jo.html)

//             // maxWidth。如果 jo 有，就用 jo 的
//             if (jo.maxWidth) 
//                 dlg.dialog("option", "maxWidth", jo.maxWidth)
//             else
//                 dlg.dialog("option", "maxWidth", window.innerWidth * 0.80)

//             // maxHeight。如果 jo 有，就用 jo 的
//             if (jo.maxHeight)
//                 dlg.dialog("option", "maxHeight", jo.maxHeight)
//             else
//                 dlg.dialog("option", "maxHeight", window.innerHeight * 0.80) // 若沒設，會自動很 高，就也不會出現卷軸
            
//             // width。如果 jo 有，就用 jo 的
//             if (jo.width)
//                 dlg.dialog("option", "width", jo.width)
//             else
//                 dlg.dialog("option", "width", window.innerWidth * 0.80)

//             // position。如果 jo 有，就設
//             if (jo.position){
//                 dlg.dialog("option", "position", jo.position)
//             }
            
//             // dlg.dialog("option", "height", window.innerHeight * 0.80) // 若沒設，會自動很 高，就也不會出現卷軸
//             // dlg.dialog("option", "title", "原文字典" + jo.sn)

//             dlg.dialog("option", "title", jo.getTitle())
//             dlg.dialog("open")

//             jo.registerEventWhenShowed(dlg)
//             // registerEvents(dlg)
//             return
//             /**
//              * 自動取得合適的 id，不合適的 id 就是「正在使用的」。
//              * @returns {string}
//              */
//             function getIdOfDialog() {
//                 const prefix = "iddlg"
//                 const prefix2 = "#" + prefix // jquery '#idxxxx', 所以有#字號

//                 let idx = tryGetId(0)
//                 return prefix + idx

//                 function tryGetId(id) {
//                     let dom = $(prefix2 + id)
//                     if (dom.length == 0) {
//                         $("<div>", {
//                             id: prefix + id,
//                             text: "dialog"
//                         }).appendTo($("body"))
//                         return id // 沒被用過
//                     }
//                     return tryGetId(id + 1)
//                 }
//             }
//         }
//     }
// }