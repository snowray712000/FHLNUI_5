/// <reference path="../jsdoc/jquery.js" />
/// <reference path="../jsdoc/jquery-ui.js" />
/// <reference path="../jsdoc/linq.d.ts" />
/// <reference path="../ijnjs/ijnjs.d.js" />

(function (root, undefined) {
    function testThenDo(a1, a2, a3) { var a3 = a3 == undefined ? 333 : a3; var r1 = a2 != undefined ? a2 : () => true; var r2 = f1; f1(); return; function f1() { if (r1()) { a1(); } else { console.log('wait'); setTimeout(() => { r2(); }, a3); } } }
    exportAsync(main)
    return

    function exportAsync(cbMain) {
        return new Promise(res => {
            var isAMD = typeof define === 'function' && define.amd
            if (isAMD) {
                define('ijnjs-fhl', ['jquery', 'linq', 'ijnjs', 'jquery-ui', 'jquery-ui/ui/widgets/dialog'], function ($, Enumerable, Ijnjs, ui, dialog, css1) {
                    $.dialog = dialog
                    var re = cbMain($, Enumerable, Ijnjs)
                    res()
                    return re
                })
            } else {
                testThenDo(() => {
                    var re = cbMain($, Enumerable, Ijnjs)
                    res()
                    root.FHL = re
                }, () => window.$ != undefined && window.Enumerable != undefined && window.Ijnjs != undefined)
            }
        })
    }

    function main($, Enumerable, Ijnjs) {
        var FHL = function () { }
        copyWindowFHLToFHL()

        FHL.getSrdIjnjsFhl = () => {
            // return 'https://raw.githubusercontent.com/snowray712000/ijnjs-fhl/main/'
            return 'http://127.0.0.1:5502/NUI_dev/ijnjs-fhl/'
            var na = Ijnjs.Path.getFileName(location.pathname) // 注意，dev/ 會回傳 '' 而非 index.html        
            if (na == '' || na == 'index.html') {
                return 'ijnjs-fhl/'
            }
            return '../ijnjs-fhl/' // tests/xxxx.htmls 
        }

        loadDependents([
            'BibleConstant.js',
            'BibleConstantFunctions.js',
            'BookChapDialog.js',
            'BibleVersionDialog.js'
        ])

        return FHL
        // 如果沒這個，會被直接取代掉，別的 js 也有定義 FHL 的函式
        function copyWindowFHLToFHL() {
            var FHLAlready = window.FHL
            for (const key in FHLAlready) {
                if (Object.hasOwnProperty.call(FHLAlready, key)) {
                    const element = FHLAlready[key];
                    FHL[key] = element
                }
            }
        }

        /**
         * @param {string[]} deps 
         */
        function loadDependents(deps) {
            var srd = FHL.getSrdIjnjsFhl()
            for (const a1 of deps) {
                var path = srd + a1
                $.ajax({ url: path, async: false, success: cb, dataType: 'text' })
            }
            function cb(str) {
                function fn() { eval(str) }
                fn.call(FHL)
            }
        }
    }
})(this)