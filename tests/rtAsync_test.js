import { rtAsync } from './../index/rtAsync.js';

/**
 * @typedef {import('../tests/TpQUnit').TpQUnit} TpQUnit
 */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

QUnit.module('rtAsync');

QUnit.test('rtAsync 測試預設值', async function (assert) {
  const done = assert.async();
  try {
    const result = await rtAsync({});
    assert.ok(result, 'Result should not be null');
    assert.ok(result.status, 'Result should have a status');
    assert.ok(Array.isArray(result.record), 'Result record should be an array');
  } catch (error) {
    assert.ok(false, 'Fetch failed: ' + error.message);
  }
  done();
});

QUnit.test('rtAsync specific book test (Matthew)', async function (assert) {
  const done = assert.async();
  try {
    // Book 40 is Matthew
    const result = await rtAsync({ book: 40, chap: 1, id: 1 });
    assert.equal(result.engs, 'Matt', 'English name should be Matt');
    assert.equal(result.status, 'success', 'Status should be success');
  } catch (error) {
    assert.ok(false, 'Fetch failed: ' + error.message);
  }
  done();
});

QUnit.test('rtAsync version parameter test', async function (assert) {
  const done = assert.async();
  try {
    const result = await rtAsync({ book: 1, chap: 1, ver: 'cnet' });
    assert.equal(result.version, 'cnet', 'Version should match requested version');
  } catch (error) {
    assert.ok(false, 'Fetch failed: ' + error.message);
  }
  done();
});


QUnit.test('rtAsync basic fetch test (default params)', async function (assert) {
  const done = assert.async();
  try {
    const result = await rtAsync({});
    assert.ok(result, 'Result should not be null');
    assert.ok(result.status, 'Result should have a status');
    assert.ok(Array.isArray(result.record), 'Result record should be an array');
  } catch (error) {
    assert.ok(false, 'Fetch failed: ' + error.message);
  }
  done();
});

QUnit.test('rtAsync specific book test (Matthew)', async function (assert) {
  const done = assert.async();
  try {
    // Book 40 is Matthew
    const result = await rtAsync({ book: 40, chap: 1, id: 1 });
    assert.equal(result.engs, 'Matt', 'English name should be Matt');
    assert.equal(result.status, 'success', 'Status should be success');
  } catch (error) {
    assert.ok(false, 'Fetch failed: ' + error.message);
  }
  done();
});

QUnit.test('rtAsync version parameter test', async function (assert) {
  const done = assert.async();
  try {
    const result = await rtAsync({ book: 1, chap: 1, ver: 'cnet' });
    assert.equal(result.version, 'cnet', 'Version should match requested version');
  } catch (error) {
    assert.ok(false, 'Fetch failed: ' + error.message);
  }
  done();
});