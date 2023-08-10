/// <reference path='../libs/jsdoc/jquery.js' />
/// <reference path='../libs/jsdoc/linq.d.ts' />
/// <reference path='../libs/ijnjs/ijnjs.d.js' />
/// <reference path='sn-dictionary-dialog.js' />


/**
 * 實作 iDlgReuse 以供 SnRefDialog 使用
 * 主要就是處理 重複 id 的使用
 * 測試過, modal less 也可以使用
 * 要提供 interface DlgReuse.iDlgReuseCreator, 不然是用預設的
 */
function DlgReuse() { }
/** 
 * DlgReuse 建立時，必須提供此 interface 
 * 
 * 你要用我(DlgReuse)嗎？那麼，若要用我，請提供 addEventDialogClosed 函式
 * 也就是當你把 dlg$ 的 closed 事件，透過 dlg$.off("dialogclose").on("dialogclose") 改變時
 * 記得 trigger 這個函式，來呼叫 fn (這個由我DlgReuse裡實作)
 * @type {{setEventDialogClosed: (fn:(thisDlg:HTMLElement,dlg$:JQuery<HTMLElement>)=>void)=>void}}
*/
DlgReuse.iDlgReuseCreator = {
    /**
     * dlg$.off("dialogclose").on("dialogclose"
     * @param {(thisDlg:HTMLElement,dlg$:JQuery<HTMLElement>)=>void} fn 
     */
    setEventDialogClosed: function (fn) { DlgReuse.iDlgReuseCreator.fn = fn },
}

/** @type {{id:string,dlg$:JQuery<HTMLElement>}[]} */
DlgReuse.inuse = []
/** @type {{id:string,dlg$:JQuery<HTMLElement>}[]} */
DlgReuse.reuse = []
/** 此部分可以 override */
DlgReuse.getIdPrefix = () => "dlg-reuse-"
DlgReuse.getOneCanUseAsync = function () {
    var that = DlgReuse
    /** @type {{id:string,dlg$:JQuery<HTMLElement>}[]} */
    var inuse = DlgReuse.inuse
    /** @type {{id:string,dlg$:JQuery<HTMLElement>}[]} */
    var reuse = DlgReuse.reuse

    return new Promise(res => {
        if (reuse.length != 0) { // 用舊的
            var dlg$ = getFromReuseAndPushToInuseAndRemoveFromInuse()
            res(dlg$)
            return // end 1
        } else { // 產生1個新的
            var id = that.getIdPrefix() + getId()
            console.log("產生一個新的 " + id)
            var re = $("<div>", { class: "dlg-reuse-body" }).attr("id", id)
            re.appendTo("body")

            testThenDoAsync(() => $("#" + id).length != 0).then(() => {
                var dlg$ = $("#" + id)
                dlg$.dialog({ modal: false, autoOpen: false })
                that.iDlgReuseCreator.setEventDialogClosed(whenCloseDlgRemoveInuseAndAddToReuse)
                if (that.iDlgReuseCreator.fn != undefined) { // default 
                    dlg$.off("dialogclose").on("dialogclose", function () {
                        that.iDlgReuseCreator.fn(this, dlg$)
                    })
                }

                inuse.push({ id: id, dlg$: dlg$ })
                res(dlg$)
                return  //end 2
            })
        }
    })
    ///
    function getId() { return inuse.length + reuse.length + 1 }
    /** @returns {JQuery<HTMLElement>} */
    function getFromReuseAndPushToInuseAndRemoveFromInuse() {
        var len = reuse.length
        var r1 = reuse[len - 1]
        reuse.splice(len - 1, 1) // 從 reuse 移除
        inuse.push(r1) // 加到 inuse
        return r1.dlg$
    }
    function whenCloseDlgRemoveInuseAndAddToReuse(thisDlg, dlg$) {
        var id = $(thisDlg).attr("id")
        var idx = Enumerable.from(inuse).indexOf(a1 => a1.id == id)
        if (idx != -1) {
            inuse.splice(idx, 1) // 從 inuse 移除
        } else {
            console.error("不太可能")
        }
        reuse.push({ id: id, dlg$: dlg$ }) // 從 reuse 新增，讓別人用
    }
}


DlgReuse.prototype.getIdPrefix = DlgReuse.getIdPrefix
DlgReuse.prototype.getOneCanUseAsync = DlgReuse.getOneCanUseAsync