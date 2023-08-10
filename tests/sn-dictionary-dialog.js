/// <reference path='../libs/jsdoc/jquery.js' />
/// <reference path='../libs/jsdoc/linq.d.ts' />
/// <reference path='../libs/ijnjs/ijnjs.d.js' />

/**
 * Interface，供 addIt 函式用的
 */
function ISnDialogAddor(){
    /**
     * 會是 async 開啟，因為取得資料會是 async
     * @param {{dtext:DText}} args 
     */
    this.open = function(args){}
    /**
     * @param {JQuery<HTMLElement>} dlg$ 
     */
    this.onClosed = function(dlg$){}
    /**
     * @param {JQuery<HTMLElement>} dlg$ 
     */
    this.onOpened = function(dlg$){}
}
/**
 * 加入一個，另一個可能不是長這樣
 * 第1關鍵，就是要能提供 open (dtext) 來呼叫
 * 其它的，不一定會用上，就是要傳參數過來
 * @param {JQuery<HTMLElement>} dom$ 
 */
function addIt(dom$, iSnDlgAddor) {
    if (iSnDlgAddor == null) iSnDlgAddor = getISnDialogAddor()

    dom$.off('click').on({
        click: function () {
            var r1 = $(this)
            var r2 = /0*([0-9]+[a-zA-Z]?)/.exec(r1.attr("k")) // 0* 可去掉前面的0
            var GorH = r1.attr('n') == '1' ? 'H' : 'G'

            /** @type {DText} */
            var dtext = {}
            dtext.tp = GorH
            dtext.sn = r2[1]
            iSnDlgAddor.open({ dtext: dtext })
        }
    }, ".parsingTableSn").on({
        click: function () {
            /** @type {DText} */
            var dtext = {}
            dtext.refDescription = $(this).attr('ref')

            iSnDlgAddor.open({ dtext: dtext })
        }
    }, ".reference")

    return
    /** 這是從 ui 來說。要給 ui 提供一個這個東西，就能夠產生。也就是說，SnDialog 要能成功實作這個 interface */
    function getISnDialogAddor() {
        return {
            /**
             * @param {{dtext:DText}} args 
             */
            open: function (args) {
                this.setOnOpening(null)
                console.log( JSON.stringify(args.dtext) )
                this.setOnOpened(null)
                this.setOnClosed(null)
            },
            onClosed: function (dlg) { },
            onOpened: function (dlg) { },
        }
    }
}
