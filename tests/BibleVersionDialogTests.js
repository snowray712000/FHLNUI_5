/// <reference path="../libs/jsdoc/jquery.js" />
/// <reference path="../libs/jsdoc/jquery-ui.js" />
/// <reference path="../libs/jsdoc/linq.d.ts" />
/// <reference path="../libs/ijnjs/ijnjs.d.ts" />

var ps = {
    sels: [],
    offs: [],
}

testThenDoAsync(() => window.Ijnjs != undefined && Ijnjs.BibieVersionDialog != undefined)
    .then(() => {
        Ijnjs.BibieVersionDialog.s.setCallbackClosed(jo => {
            ps.sels = jo.selects
            ps.offs = jo.offens
        })

    })

function show() {
    Ijnjs.BibieVersionDialog.s.open({ selects: ps.sels, offens: ps.offs })
}