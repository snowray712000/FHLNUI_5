/// <reference path="../ijnjs/ijnjs.d.js" />
(function (root) {
    if (window.testThenDoAsync == undefined) {
        throw new Error('必須先引用 ijnjs.js，注意順序')
    }

    var fileDescription = [
        {
            dir: 'FHL', children: ['index', 'BibleConstant', 'BibleConstantFunctions','generateDTextDom']
        }
    ]

    testThenDoAsync(() => window.Ijnjs != undefined)
        .then(() => {
            Ijnjs.getCacheAsync(fileDescription, true, 'ijnjs-fhl').then(caches => {
                Ijnjs.cachesFHL = caches
                for (var a1 of ['FHL/index']) {
                    var tmp = {}
                    function aaa() { eval(caches.getStr(a1)) }
                    aaa.call(tmp)
                    new MergeImports().main(Ijnjs, tmp)
                }
                caches.clear()
                delete Ijnjs.cachesFHL
            })
        })

    return


})(this)