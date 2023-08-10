/// <reference path="../libs/jsdoc/jquery.js" />
/// <reference path="../libs/jsdoc/linq.d.ts" />
/// <reference path="../libs/jsdoc/jquery-ui.js" />
/// <reference path="../libs/ijnjs/ijnjs.d.js" />


var argsGlobal = {}
testThenDoAsync(() => window.Ijnjs != undefined && Ijnjs.BookChapDialog != undefined)
    .then(() => {
        Ijnjs.BookChapDialog.s.setCBShowed(() => {
            console.log('showed')
            var r1 = Ijnjs.Path.getDirectoryName(location.pathname)

        })
        Ijnjs.BookChapDialog.s.setCBHided(() => {
            console.log('hide')
            var args = Ijnjs.BookChapDialog.s.getArgs()
            var result = Ijnjs.BookChapDialog.s.getResult()
            console.log(result);
            console.log(args)
            argsGlobal = args
            argsGlobal.book = result.book
            argsGlobal.chap = result.chap
        })
    })