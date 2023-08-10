
export { AbvAsyncEs6Js }

import Enumerable from './../libs/jsdoc/linq.js';

function AbvAsyncEs6Js() {
    AbvAsync.s = new AbvAsync()
    return AbvAsync

    /**
     * 常常要用到 聖經版本資訊 但是不斷的 abv.php 是沒必要的. 查一次就好. 然後存到全域變數
     * "和合本": {A}, "原文直譯(參考用)":{A}, "KJV": {A} .....
     * A.book: "unv", A.ntonly: "0", A.otonly: "0", strong: "0"
     */
    function AbvAsync() {

        /** @type {Object.<string, {book:string;ntonly:0|1;otonly:0|1;strong:0|1}>} 和合本:{book:unv} */
        this.g_bibleversions = {}
        /** @type {Object.<string, {book:string;ntonly:0|1;otonly:0|1;strong:0|1}>} 和合本:{book:unv} */
        this.g_bibleversionsGb = {}

        init_g_bibleversions();

        /**
         * index.js 裡會用, 因為它要確定抓過了嗎
         * @returns {boolean}
         */
        this.isReadyGlobalBibleVersions = function () {
            return Object.keys(abvphp.g_bibleversions).length != 0 &&
                Object.keys(abvphp.g_bibleversionsGb).length != 0
        }

        return
        function init_g_bibleversions() {
            const r1 = Enumerable.from(['?gb=0','?gb=1'])
            .select(a1=> (isRDLocation() ? 'https://bible.fhl.net' : '') + '/json/abv.php' + a1)
            .select(url=>{
                console.log(url);
                return new Promise((resolve, reject) =>{
                    $.ajax({
                        url,
                        success: function(resp){
                            console.log(JSON.parse(resp));
                            res();
                        }
                    })
                })
            }).toArray()

            return Promise.all(r1)

            
        }
        var isAlreadySendCommand = false
        this.init_g_bibleversions = function init_g_bibleversions() {
            if (isAlreadySendCommand) { return }
            isAlreadySendCommand = true

            var isAsync = true
            fhl.json_api_text("uiabv.php?gb=0", fn2, null, null, isAsync)
            fhl.json_api_text("uiabv.php?gb=1", fn3, null, null, isAsync)

            /// dict 可能是 abvphp.g_bibleversions 或 abvphp.g_bibleversionsGb
            function fnCore(r1, dict) {
                var r2 = JSON.parse(r1)
                var r3 = r2["record"]
                r3.forEach(function (it) {
                    var obj = {
                        book: it["book"],
                        ntonly: it["ntonly"],
                        otonly: it["otonly"],
                        strong: it["strong"]
                    }
                    dict[it["cname"]] = obj
                })
            }
            function fn2(r1) {
                abvphp.g_bibleversions = {};
                fnCore(r1, abvphp.g_bibleversions)
                console.log('完成 abvphp.')
            }
            function fn3(r1) {
                abvphp.g_bibleversionsGb = {};
                fnCore(r1, abvphp.g_bibleversionsGb)
                console.log('完成 abvphpGb.')
            }

        };//init g_bibleversions
    }
}