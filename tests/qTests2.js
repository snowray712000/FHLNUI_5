/**
 * @typedef {import('./TpQUnit').TpQUnit} TpQUnit
 */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);
function timeout_async(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}
QUnit.module('aaa', function (){
  // 一般測試
  QUnit.test('bbb', assert => {
    assert.equal('asd', 'asd')
  });

    /** 首先，非同步 assert 怎麼用 */
  QUnit.test('async', async function (assert) {
    const fndone = assert.async()
    await timeout_async(100)
    assert.equal(1, 1)
    fndone()
  })
})
