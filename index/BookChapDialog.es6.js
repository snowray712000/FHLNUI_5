/// <reference path='./DDialogHtml.d.ts' />

export { BookChapDialogEs6Js }
import Enumerable from '../libs/jsdoc/linq.js'
import { DialogHtmlEs6Js } from './DialogHtml.es6.js'

function BookChapDialogEs6Js() {
    const DialogHtml = DialogHtmlEs6Js()

    return showBookChapDialog

    function showBookChapDialog() {
        let dlg = new DialogHtml()
        dlg.showDialog({
            html: gHtml(),
            getTitle: () => '',
            registerEventWhenShowed: dlg => {
                // dlg.on('click', '.ref', a1 => {
                //     let addrs = JSON.parse($(a1.target).attr('data-addrs'))
                //     queryReferenceAndShowAtDialogAsync({addrs:addrs})
                // })
            }
        })

        return
        function gHtml() {
            let r1 = $('<div id="book-chap-dialog" style="display: block;">')

            let r2a = $('<div class="toolbar">').appendTo(r1)

            // <button type="button" class="btn btn-light" opt="old"> 舊約</button >
            // <button type="button" class="btn btn-light" opt="new">新約</button>
            // <button type="button" class="btn btn-light" opt="chap">章</button>
            // <button type="button" class="btn btn-light" opt="hebrew">希伯來排序</button>
            // <button type="button" class="btn btn-outline-info" opt="full">完整名稱</button>
            Enumerable.from([["old", "舊約"], ["new", "新約"], ["chap", "章"], ["hebrew", "希伯來排序"]]).forEach(a1 => {
                $('<button type="button" class="btn btn-light" opt="' + a1[0] + '">' + a1[1] + '</button>').appendTo(r2a)
            })
            $('<button type="button" class="btn btn-outline-info" opt="full">完整名稱</button>').appendTo(r2a)
            
            // <!-- 下面內容動態產生 -->
            let r2b = $('<div class="contents">').appendTo(r1)

            // <!-- 樣本，(在程式中，會清除，再重繪選項)，54，可以表示 chap 或 book -->
            $('<button type="button" class="btn btn-outline-dark" data-val="54">項目</button>').appendTo(r2b)


            return r1[0].outerHTML
        }
    }
}