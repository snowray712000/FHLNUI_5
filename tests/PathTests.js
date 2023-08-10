/// <reference path="../jsdoc/qunit.js" />
/// <reference path="../ijnjs/ijnjs.d.ts" />

(function(root){
})(this)
    /**
     * @class
     * https://docs.microsoft.com/zh-tw/dotnet/api/system.io.path.getdirectoryname
     * https://docs.microsoft.com/zh-tw/dotnet/api/system.io.path.getfilename
     * https://docs.microsoft.com/zh-tw/dotnet/api/system.io.path.getfilenamewithoutextension
     * 
     */
    function Path(){}

    var reg1 = /\/|\\/g
    /**
     * '/sdasd/asdgsdg' => '/sdasd
     * '/sdasd' => ''
     * '' => ''
     * '\sdasd\asdgsdg' => '\sdasd'
     * @param {string} path 
     * @returns {string}
     */
    Path.getDirectoryName = function (path){
        var i = path.length - 1
        while ( i > -1 ){
            if ( path[i] == '/' || path[i] == '\\' ){
                return path.substring(0,i)
            }
            i--
        }
        return ''
    }
    /**
     * 'c:/sdasd/asdgsdg.txt' => asdgsdg.txt
     * c:/sdasd/asdgsdg => asdgsdg
     * c:/sdasd/ => ''
     * asdgsdg.txt => asdgsdg.txt
     * @param {string} path 
     * @returns {string}
     */
    Path.getFileName = function(path) {
        var i = path.length - 1
        while ( i > -1 ){
            if ( path[i] == '/' || path[i] == '\\' ){
                return path.substring(i+1)
            }
            i--
        }
        return path
    }
    /**
     * @param {string} path 
     * @returns {string}
     * @see Path.getFileName
     */
    Path.getFileNameWithoutExtension = function (path){
        var i = path.length - 1
        var dot = -1
        while ( i > -1 ){
            if ( path[i] == '.' && dot == -1 ){
                dot = i
            } else if ( path[i] == '/' || path[i] == '\\' ){
                if ( dot == -1 )
                    return path.substring(i+1)
                else 
                    return path.substring(i+1,dot)
            }
            i--
        }
        if (dot != -1 )
            return path.substring(0,dot)
        return path
    }
    /**
     * c:/asdf.txt => .txt
     * c:/asdf.com.txt => .txt
     * c:/asdf/asdf.txt => .txt
     * c:/asdf.com/asdf => ''
     * @param {string} path 
     * @returns {string}
     */
    Path.getExtension = function (path) {
        var i = path.length - 1
        while ( i > -1 ){
            if ( path[i] == '.'){
                return path.substring(i)
            } else if ( path[i] == '/' || path[i] == '\\' ){
                return ''
            }
            i--
        }
        return path
    }
    /**
     * asdf.txt => asdf.mov
     * asdf/asdf.txt => asdf/asdf.mov
     * asdf.com.txt => asdf.com.mov
     * asdf.com/asdf => asdf.com/asdf.mov
     * asdf.com/ => asdf.com/.mov
     * asdf => asdf.mov
     * asdf/ => asdf/.mov
     * @param {string} path 
     * @param {string?} ext .mov 包含. , 若 undefined, 則移除 (同等於 getFileNameWithoutExtension)
     * @returns 
     */
    Path.changeExtension = function (path,ext) {
        var i = path.length - 1
        while ( i > -1 ){
            if ( path[i] == '.' ){
                return path.substring(0,i) + ext
            } else if ( path[i] == '/' || path[i] == '\\' ){
                return path + ext
            }
            i--
        }
        return path
    }



QUnit.module('Path', function() {
    function doIjnjs(assert,cb){
        var async = assert.async()
        Ijnjs.testThenDo(()=>{
            cb()
            async()
        })
    }
    QUnit.test('dev01_getDirectoryName', function(assert) {
        var str = '/sdasd/asdgsdg'
        assert.equal('/sdasd', Path.getDirectoryName(str))
        assert.equal('', Path.getDirectoryName(Path.getDirectoryName(str)))

        str = '\\sdasd\\asdgsdg'
        assert.equal('\\sdasd', Path.getDirectoryName(str))
        assert.equal('', Path.getDirectoryName(Path.getDirectoryName(str)))
    })
    QUnit.test('dev01_getFileName', function(assert) {
        assert.equal('asdgsdg.txt', Path.getFileName('c:/sdasd/asdgsdg.txt'))
        assert.equal('asdgsdg.txt', Path.getFileName('c:\\sdasd\\asdgsdg.txt'))
        
        assert.equal('asdgsdg', Path.getFileName('c:/sdasd/asdgsdg'))

        assert.equal('', Path.getFileName('c:/sdasd/'))

        assert.equal('asdgsdg.txt', Path.getFileName('asdgsdg.txt'))
    })
    QUnit.test('getFileNameWithoutExtension', function(assert) {
        assert.equal('asdgsdg', Path.getFileNameWithoutExtension('c:/sdasd/asdgsdg.txt'))
        assert.equal('asdgsdg', Path.getFileNameWithoutExtension('c:\\sdasd\\asdgsdg.txt'))
        
        assert.equal('asdgsdg', Path.getFileNameWithoutExtension('c:/sdasd/asdgsdg'))

        assert.equal('', Path.getFileNameWithoutExtension('c:/sdasd/'))

        assert.equal('asdgsdg', Path.getFileNameWithoutExtension('asdgsdg.txt'))
    })
    QUnit.test('getExtension', function(assert) {
        var r1 = [
            ['.txt','c:/sdasd/asdgsdg.txt'],
            ['.txt','c:/sdasd/asdgsdg.com.txt'],
            ['.txt','c:\\sdasd\\asdgsdg.txt'],
            ['.txt','asdgsdg.txt'],
            ['','c:/asdf/asdf'],
            ['','c:/asdf.com/asdf'],
            ['','c:/asdf.com/'],
        ]

        for (var a1 of r1 ){
            assert.equal(Path.getExtension(a1[1]),a1[0],a1[1])
        }
    })
    QUnit.test('changeExtension', function(assert) {
        var r1 = [
            ['c:/sdasd/asdgsdg.mov','c:/sdasd/asdgsdg.txt'],
            ['c:/sdasd/asdgsdg.com.mov','c:/sdasd/asdgsdg.com.txt'],
            ['c:\\sdasd\\asdgsdg.mov','c:\\sdasd\\asdgsdg.txt'],
            ['asdgsdg.mov','asdgsdg.txt'],
            ['c:/asdf/asdf.mov','c:/asdf/asdf'],
            ['c:/asdf.com/asdf.mov','c:/asdf.com/asdf'],
            ['c:/asdf.com/.mov','c:/asdf.com/'],
            ['/img/210722a_a.mov','/img/210722a_a.gif'],
            ['https://bible.fhl.net/NUI/img/210722a_a.mov','https://bible.fhl.net/NUI/img/210722a_a.gif'],
        ]

        for (var a1 of r1 ){
            assert.equal(Path.changeExtension(a1[1],'.mov'),a1[0],a1[1])
        }
    })
    QUnit.test('ijnjs_changeExtension', function(assert) {
        doIjnjs(assert,()=>{
            var r1 = [
                ['c:/sdasd/asdgsdg.mov','c:/sdasd/asdgsdg.txt'],
                ['c:/sdasd/asdgsdg.com.mov','c:/sdasd/asdgsdg.com.txt'],
                ['c:\\sdasd\\asdgsdg.mov','c:\\sdasd\\asdgsdg.txt'],
                ['asdgsdg.mov','asdgsdg.txt'],
                ['c:/asdf/asdf.mov','c:/asdf/asdf'],
                ['c:/asdf.com/asdf.mov','c:/asdf.com/asdf'],
                ['c:/asdf.com/.mov','c:/asdf.com/'],
                ['/img/210722a_a.mov','/img/210722a_a.gif'],
                ['https://bible.fhl.net/NUI/img/210722a_a.mov','https://bible.fhl.net/NUI/img/210722a_a.gif'],
            ]
    
            for (var a1 of r1 ){
                assert.equal(Ijnjs.Path.changeExtension(a1[1],'.mov'),a1[0],a1[1])
            }
        })

    })
});

