/// <reference path='../libs/jsdoc/jquery.js' />
/// <reference path='../libs/jsdoc/jquery-ui.js' />

import {BookChapDialogEs6Js} from './BookChapDialog.es6.js'

QUnit.test("a", assert => {
    assert.equal(1, 1)
})
$(() => {
    
    $("<button>", {
        text: "按我測試",
        css: {
            "position": "absolute"
        },
        id: "id1"
    }).appendTo($("body"))
        .on('click', ev => {
            const showFn = BookChapDialogEs6Js()
            showFn()
        })

    setTimeout(() => {
        $("#id1").trigger("click")
    }, 1000);
})