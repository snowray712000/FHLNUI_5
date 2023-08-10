/// <reference path="./../libs/jsdoc/qunit.js" />
/// <reference path="./../libs/jsdoc/linq.d.ts" />
/// <reference path="./../libs/jsdoc/jquery.js" />
/// <reference path="./DText.d.ts" />

import {AbvAsyncEs6Js} from './abvAsync.es6.js'

QUnit.test("AbvAsync", assert => {
    const AbvAsync = AbvAsyncEs6Js()
    // 測試資料

    // 執行
    console.log(AbvAsync.s);

    // 驗證
    assert.equal(3,3)
    return
})
