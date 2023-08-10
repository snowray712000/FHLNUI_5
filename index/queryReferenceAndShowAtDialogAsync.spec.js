/// <reference path='../libs/jsdoc/jquery.js' />
/// <reference path='../libs/jsdoc/jquery-ui.js' />


import { splitReferenceEs6Js } from "../ijnjs/splitReference.es6.js"
import { queryReferenceAndShowAtDialogAsyncEs6Js } from "./queryReferenceAndShowAtDialogAsync.es6.js"


QUnit.test("a", assert => {
    assert.equal(1, 1)
})
$(() => {
    const splitReference = splitReferenceEs6Js()
    const queryReferenceAndShowAtDialogAsync = queryReferenceAndShowAtDialogAsyncEs6Js()
    $("<button>", {
        text: "按我測試",
        css: {
            "position": "absolute"
        },
        id: "id1"
    }).appendTo($("body"))
        .on('click', ev => {
            let addrs1 = [
                { book: 1, chap: 1, verse: 1 },
                { book: 3, chap: 1, verse: 2 },
                { book: 2, chap: 1, verse: 3 },
            ]
            // let addrs2 = splitReference("創1;出1")[0].refAddresses

            queryReferenceAndShowAtDialogAsync({
                addrs: addrs1
            })
        })

    setTimeout(() => {
        $("#id1").trigger("click")
    }, 1000);
})