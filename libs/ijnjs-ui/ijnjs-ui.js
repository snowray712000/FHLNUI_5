// / <reference path="../jsdoc/linq.d.ts" />
// / <reference path="../jsdoc/jquery.js" />
// / <reference path="../jsdoc/jquery-ui.js" />
// / <reference path="../jsdoc/jquery.ui.touch-punch.js" />
// / <reference path="../jsdoc/lodash.d.js" />
// / <reference path="../jsdoc/require.js" />
/// <reference path="../ijnjs/ijnjs.d.js" />
(function (root) {
    if (window.testThenDoAsync == undefined) {
        throw new Error('必須先引用 ijnjs.js，注意順序')
    }
    var fileDescription = [
        {
            dir: 'BookChapDialog', children: ['index', 'BookChapDialog', 'BookChapDialog.html']
        },
        {
            dir: 'BibleVersionDialog', children: ['index', 'BibleVersionDialog', 'BibleVersionDialog.html', 'BibleVersionDialog.css']
        },
    ]

    testThenDoAsync(() => window.Ijnjs != undefined).then(() => {
        Ijnjs.getCacheAsync(fileDescription, false, 'ijnjs-ui').then(caches => {
            Ijnjs.cachesUI = caches // 供 index.js 用

            var Enumerable = Ijnjs.Libs.s.libs.Enumerable
            var prs = Enumerable.from(['BibleVersionDialog/index', 'BookChapDialog/index'])
                .select(a1 => {
                    return new Promise((res, rej) => {
                        function aaa() { eval(caches.getStr(a1)) }
                        var tmp = {}
                        aaa.call(tmp)

                        testThenDoAsync(() => Object.keys(tmp) != 0)
                            .then(a1 => {
                                console.log(tmp)
                                new MergeImports().main(Ijnjs,tmp)
                                res()
                            })
                    })
                }).toArray()

            Promise.all(prs).then(a1 => {
                testThenDoAsync(() => Object.keys(caches.caches) == 0).then(() => {
                    delete Ijnjs.cachesUI
                })
            })
            // testThenDoAsync(() => $('#bible-version-dialog').length != 0 && $('#book-chap-dialog').length != 0).then(() => {
            //     delete Ijnjs.cachesUI
            // })
        })
    })

})(this)