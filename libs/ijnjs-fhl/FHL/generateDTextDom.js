/// <reference path="../../jsdoc/jquery.js" />
/// <reference path="../../jsdoc/linq.d.ts" />

(function (root) {
    /** @type {JQuery} */
    var $ = window.$
    /** @type {Enumerable} */
    var Enumerable = window.Enumerable
    testThenDoAsync().then(()=>{
        $ = Ijnjs.Libs.s.libs.$
        Enumerable = Ijnjs.Libs.s.libs.Enumerable
    })

    root.generateDTextDom = generateDTextDom
    /**
     * generateDTextDom(data).appendTo(xxxx)
     * @param {DText[]} data
     * @returns {JQuery<HTMLElement>}
     */
    function generateDTextDom(data) {
        FixListStyleToChildrenStyle();

        var re = $();
        Enumerable.from(data).select(a1 => {
            if (a1.isBr == 1) {
                return $('<br/>');
            }
            if (a1.isHr == 1) {
                return $('<hr/>');
            }
            if (a1.children) {
                var re2 = generateDTextDom(a1.children);
                if (a1.tpContain == "ul" || a1.isOrderStart == 1){
                    return $('<ul>').append(re2);
                }
                if (a1.tpContain == "li"  || a1.isListStart == 1) {
                    return $('<li>').append(re2);
                }
            }

            var r1 = $("<span>", {
                text: a1.w,
            });

            if (a1.sn || a1.refDescription){
                r1.data('data', a1);
            }
            if (a1.sn) {
                r1.addClass('sn');
            }
            if (a1.refDescription) {
                r1.addClass('ref');
            }
            return r1;
        }).forEach(a1 => re = re.add(a1));
        return re;
        /**
         * 處理 data，裡 list 是用 start end 方式，而非用 children 方式
         * 則變為 children 方式
         * 會直接改變 data 資料
         */
        function FixListStyleToChildrenStyle() {
            while (true) {
                var idx1 = Enumerable.from(data)
                    .indexOf(a1 => a1.isOrderStart && a1.children == undefined);
                if (idx1 != -1) {
                    var idx2 = findOrderPair(idx1);
                    toChildrenAndRemove(idx1, idx2);
                } else {
                    idx1 = Enumerable.from(data)
                        .indexOf(a1 => a1.isListStart && a1.children == undefined);
                    if (idx1 != -1) {
                        var idx2 = findListPair(idx1);
                        toChildrenAndRemove(idx1, idx2);
                    } else {
                        break; // 唯一一處 break
                    }
                }

            }
            return; // end fix list style
            function findOrderPair(idx1) {
                var cnt = 0;
                var r2 = Enumerable.from(data).skip(idx1)
                    .indexOf(a1 => {
                        if (a1.isOrderStart && a1.children == undefined) {
                            cnt++;                            
                        } else if (a1.isOrderEnd) {
                            cnt--;                            
                        }
                        return cnt == 0;
                    });
                return r2 == -1 ? r2 : r2 - 1; // -1 就會剛好等於 cnt
            }
            function findListPair(idx1) {
                var cnt = 0;
                var r2 = Enumerable.from(data).skip(idx1)
                    .indexOf(a1 => {
                        if (a1.isListStart && a1.children == undefined) {
                            cnt++;
                        } else if (a1.isListEnd) {
                            cnt--;
                        }
                        return cnt == 0;
                    });
                return r2;
            }
            function toChildrenAndRemove(idx1, idx2) {
                if (idx2 == -1) {
                    // 當不完整的時候，有 start 沒 end , 就把餘下的全當作這個 children
                    data[idx1].children = Enumerable.from(data).skip(idx1 + 1).toArray();
                    // console.log(JSON.stringify(data[idx1].children));
                    data.splice(idx1 + 1);
                } else {
                    // +1 是 ul 那個不用 -2 是尾巴那個也不用
                    data[idx1].children = Enumerable.from(data).skip(idx1 + 1).take(idx2 - 2).toArray();
                    // console.log(JSON.stringify(data[idx1].children));
                    data.splice(idx1 + 1, idx2);
                }
            }
        }
    }

})(this)
