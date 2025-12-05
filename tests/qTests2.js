/**
 * @typedef {import('./TpQUnit').TpQUnit} TpQUnit
 */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);
function timeout_async(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}
QUnit.module('qTests2');

QUnit.test('basic test', assert => {
  assert.equal(1 + 1, 2, '1 + 1 should equal 2');
});
QUnit.test('string test', assert => {
  assert.equal('hello'.toUpperCase(), 'HELLO', '"hello" to upper case should be "HELLO"');
});
QUnit.test('array test', assert => {
  const arr = [1, 2, 3];
  assert.equal(arr.length, 3, 'Array length should be 3');
  assert.equal(arr[0], 1, 'First element should be 1');
});
QUnit.test('async test', async function (assert) {
  const done = assert.async();
  await timeout_async(50);
  assert.ok(true, 'Async test completed after timeout');
  done();
});

