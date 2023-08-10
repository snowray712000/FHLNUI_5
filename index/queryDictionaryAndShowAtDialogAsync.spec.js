/// <reference path='../libs/jsdoc/jquery.js' />
/// <reference path='../libs/jsdoc/jquery-ui.js' />

import {queryDictionaryAndShowAtDialogAsyncEs6Js} from './queryDictionaryAndShowAtDialogAsync.es6.js'

QUnit.test("a", assert => {
    assert.equal(1,1)
})
$(()=>{
    let queryDictionaryAndShowAtDialogAsync = queryDictionaryAndShowAtDialogAsyncEs6Js()
    $("<button>", {
        text: "按我測試",
        css: {
            "position":"absolute"
        }
    }).appendTo($("body"))
    .on('click', ev =>{
        queryDictionaryAndShowAtDialogAsync({sn:'168',isOld:false})
    })
})