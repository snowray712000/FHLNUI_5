/**
 * @typedef {import('./TpQUnit.js').TpQUnit} TpQUnit
 */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

import {matchGlobalWithCapture} from './../index/matchGlobalWithCapture.es2023.js'

QUnit.module('matchGlobalWithCapture', function () {
  QUnit.test('basic', assert => {
    const re = matchGlobalWithCapture(/(a)(b)/g, 'abxxab');
    assert.equal(re.length, 2);
    console.log(re[0]) // ['ab', 'a', 'b', index: 0, input: 'abxxab', groups: undefined]
  })
})