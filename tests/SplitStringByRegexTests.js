/// <reference path="../jsdoc/qunit.js" />
/// <reference path="../ijnjs/SplitStringByRegex.js" />
/// <reference path="../ijnjs/ijnjs.js" />

QUnit.module('SplitStringByRegex', function() {
    QUnit.test('dev01', function(assert) {
        var async = assert.async()
        Ijnjs.testThenDo(()=>{
            var r1 = new Ijnjs.SplitStringByRegex()
            var r2 = r1.main("取出eng的word",/\w+/ig)
            
            assert.equal("取出", r2[0].w)
            assert.equal(undefined, r2[0].exec)
            assert.equal("eng", r2[1].w)
            assert.equal("eng", r2[1].exec[0])
            assert.equal("的", r2[2].w)
            assert.equal(undefined, r2[2].exec)
            assert.equal("word", r2[3].w)
            assert.equal("word", r2[3].exec[0])

            async()
        })
    })
    QUnit.test('app01_希伯來文分離_01', function(assert){
        
        // https://bible.fhl.net/json/qp.php?engs=1%20Kin&chap=3&sec=5&gb=0
        var a1 = '{"wform":"\u05dc\u05b0\u05da\u05b8 \u7684\u505c\u9813\u578b\uff0c\u4ecb\u7cfb\u8a5e \u05dc\u05b0 + 2 \u55ae\u967d\u8a5e\u5c3e"}'
        
        // console.log('\u05dc')
        // console.log('\u05b0')
        // console.log('\u05da')
        // console.log('\u05b8')
        // console.log(' \u7684\u505c\u9813\u578b\uff0c\u4ecb\u7cfb\u8a5e ') // ' 的停頓型，介系詞 '
        // console.log('\u05dc')
        // console.log('\u05b0') 
        // console.log(' + 2 ') // ' + 2 '
        // console.log('\u55ae\u967d\u8a5e\u5c3e') // 單陽詞尾
        
        var reg = /[\u0590-\u05fe]+/ig
        var a2 = JSON.parse(a1)
        var re = new Ijnjs.SplitStringByRegex().main(a2["wform"],reg)
        var msg = JSON.stringify(a2)
        assert.equal("\u05dc\u05b0\u05da\u05b8", re[0].w , msg)
        assert.equal(" \u7684\u505c\u9813\u578b\uff0c\u4ecb\u7cfb\u8a5e ", re[1].w , msg)
        assert.equal("\u05dc\u05b0", re[2].w , msg)
        assert.equal(" + 2 \u55ae\u967d\u8a5e\u5c3e", re[3].w , msg)
        
    })

    QUnit.test('希臘文',function(assert){
        assert.equal(1,1,'\u51a0\u8a5e')
        assert.equal(2,2,'\u1f41 \u1f21 \u03c4\u1f79')
    })
    QUnit.test('ijnjs', assert=>{
        var r1 = new Ijnjs.SplitStringByRegex()
        var r2 = r1.main ("取出eng的word",/\w+/ig)
        
        assert.equal("取出", r2[0].w)
        assert.equal(undefined, r2[0].exec)
        assert.equal("eng", r2[1].w)
        assert.equal("eng", r2[1].exec[0])
        assert.equal("的", r2[2].w)
        assert.equal(undefined, r2[2].exec)
        assert.equal("word", r2[3].w)
        assert.equal("word", r2[3].exec[0])
    })
});