/// <reference path="../jsdoc/jquery.js" />
/// <reference path="../jsdoc/qunit.js" />
/// <reference path="../static/search_api/fhl_api.js" />
/// <reference path="../static/search_api/abvphp_api.js" />



/** 這是為了開發聖經版本選擇，用 黃錫木 建議的方式分類 */
QUnit.module('BibleVersion', function() {
  /** 首先，非同步 assert 怎麼用 */
  QUnit.test('dev01_async_test', function(assert) {
    var fndone = assert.async()
    setTimeout( () => {
      assert.equal(1,1)
      fndone()
    },100)
  })
  QUnit.test('dev02_uiabv', assert => {
    var done = assert.async()
      
    fhl.json_api_text("uiabv.php", re1 => {
      var r2 = JSON.parse(re1)
      assert.equal("success", r2.status)
      var r3 = r2.record.map(a1=>a1.cname).join('\r\n')
      console.log(r3)
      done()
    }, re2=>{
      assert.true(false, re2)
      done()
    }, null, true )
  });
})