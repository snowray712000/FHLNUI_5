/// <reference path="../ijnjs-fhl.js" />

(function (root) {
    function FHL() { }

    for (var a1 of ['BibleConstant', 'BibleConstantFunctions','generateDTextDom']) {
        var na = 'FHL/' + a1
        function aaa() { eval(Ijnjs.cachesFHL.getStr(na)) }
        var tmp = {}
        aaa.call(tmp)

        new MergeImports().main(FHL, tmp)
    }
    root.FHL = FHL
})(this)

