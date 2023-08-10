/// <reference path="../ijnjs-ui.js" />
(function (root) {
    var caches = Ijnjs.cachesUI
    var $ = Ijnjs.Libs.s.libs.$

    $('<style>', {
        text: caches.getStr("BibleVersionDialog/BibleVersionDialog.css")
    }).appendTo($('head'))

    // document ready
    $(() => {
        var html = caches.getStr("BibleVersionDialog/BibleVersionDialog.html")
        var Enumerable = Ijnjs.Libs.s.libs.Enumerable
        var r3 = Enumerable.from($(html)).firstOrDefault(a1 => $(a1).attr("id") == 'bible-version-dialog')
        $(r3.outerHTML).appendTo('body')

        function aaa() { eval(caches.getStr("BibleVersionDialog/BibleVersionDialog")) }
        var tmp = {}
        aaa.call(tmp)

        releaseCacheHere()

        // 它是 async 的 export, 所以要等待
        testThenDoAsync(() => Object.keys(tmp).length != 0)
            .then(() => {
                var k = Object.keys(tmp)
                root[k] = tmp[k]
            })
    })

    return
    function releaseCacheHere() {
        var Enumerable = Ijnjs.Libs.s.libs.Enumerable
        var caches = Ijnjs.cachesUI
        Enumerable.from(['index', 'BibleVersionDialog.css', 'BibleVersionDialog', 'BibleVersionDialog.html'])
            .select(a1 => 'BibleVersionDialog/' + a1)
            .forEach(a1 => caches.setStr(a1, undefined))
    }
})(this)