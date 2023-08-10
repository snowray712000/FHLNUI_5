/// <reference path='../../ijnjs/ijnjs.d.ts' />
/// <reference path='OrigDict.d.ts' />
/// <reference path='ParsingReference.js' />
/// <reference path='ParsingOrigDict.js' />

/**
 * 浸宣出版社的字典出來時，同時就新增了不同的顯示方式
 * DialogTemplate findPrsingTableSnClassAndLetItCanClick 會用到
 * 此檔相依 SnDictDialog.html ， 很技術的，它是動態載入，成為一個 id 下的樣本
 * 也相依 OrigDict class 
 */



(function (root) {
    var $ = Ijnjs.Libs.s.libs.$
    var Enumerable = Ijnjs.Libs.s.libs.Enumerable
    var caches = Ijnjs.cachesIndex

    var ps = Enumerable.from(['OrigDict', 'ParsingReference', 'ParsingOrigDict'])
        .select(a1 => 'DialogTemplate/' + a1)
        .select(a1 => {
            return new Promise(res => {
                function aaa() { eval(caches.getStr(a1)) }
                var tmp = {}
                aaa.call(tmp)
                testThenDoAsync(() => Object.keys(tmp) != 0)
                    .then(() => {
                        caches.setStr(a1, undefined)
                        res(tmp)
                    })
            })
        }).toArray()

    Promise.all(ps).then(tmps => {
        var { OrigDict } = tmps[0]
        var { addBreakLine, addOrigDict, addReference } = tmps[2].exports

        DialogTemplate.outerHTML = getDialogTemplateOuterHtml()
        root.DialogTemplate = DialogTemplate
        root.findPrsingTableSnClassAndLetItCanClick = findPrsingTableSnClassAndLetItCanClick

        return

        function getDialogTemplateOuterHtml() {

            var r1 = $(caches.getStr('DialogTemplate/SnDictDialog.html'))
            /** @type {HTMLElement} */
            var r2 = Enumerable.from(r1)
                .firstOrDefault(a1 => $(a1).attr("id") == 'SnDictDialog')
            if (r2 == undefined) {
                throw new Error('DialogTemplate SnDictDialog.html can\'t find #SnDictDialog')
            }
            return r2.outerHTML
        }
        function IEventShowDialog() {
            this.FnShowBsModal = function FnShowBsModal(event) {
                try {
                    var button = $(event.relatedTarget) // 哪個按鈕按的.

                    var levelNext = button.data('level') + 1;
                    setLevelAndPrepareNextLevelDialog(this, levelNext);

                    var r2 = button.data('data'); // 雖原本是字串，但會自動轉為 json
                    if ('sn' in r2) {
                        renderOrigDict(this, r2.sn, r2.isOld);
                    } else if ('ref' in r2) {
                        renderReference(this, r2.ref, r2.book, r2.chap);
                    }
                } catch (error) {
                    renderError(this, error);
                    console.error(error);
                }

                function setLevelAndPrepareNextLevelDialog(pthis, levelNext) {
                    var this$ = $(pthis);
                    // this$.css('z-index', parseInt(this$.css('z-index')) + levelNext); // css. modal 是 1050
                    this$.css('z-index', 1049 + levelNext); // css. modal 是 1050 

                    var idNew = 'SnDictDialog' + levelNext;
                    if ($('#dialogs').find('#' + idNew).length === 0) {
                        new DialogTemplate().cloneTemplateSnDictDialog(levelNext);
                        // cloneTemplateSnDictDialog(levelNext, 'dialogs-base-template');
                    } else { }
                }

                function renderOrigDict(pthis, sn, isOld) {
                    console.log('isOld ' + isOld);
                    var this$ = $(pthis);
                    var reDict = new OrigDict().queryFromApi(sn, isOld);
                    var reDict2 = reDict.map(cvt_each);
                    var reDict3 = merge(reDict2);
                    var html1 = reDict3.map(a1 => generateContent(a1)).join('');
                    var test1 = '<div id="dict-content" style="white-space: pre-wrap;">' + html1 + '</div>';

                    var modaltitle$ = this$.find('.modal-title');
                    modaltitle$.text(r2.sn)
                    // var test1 = '<div id="dict-content"><span class="parsingTableSn" n="0" k="02532">02532</span><span class="parsingTableSn" n="0" k="02531">02531</span><span class="parsingTableSn" n="1" k="113">113</span></div>';
                    var modalbody$ = this$.find('.modal-body');
                    modalbody$.html(test1);
                    findPrsingTableSnClassAndLetItCanClick(levelNext, modalbody$);
                    return;

                    function cvt_each(dict) {
                        if (dict.ver === 'CBOL Parsing 系統')
                            return cvt_cbol_chinese(dict);
                        else if (dict.ver === 'CBOL Parsing System')
                            return cvt_cbol_engs(dict);
                        return cvt_twcb(dict);

                        function cvt_cbol_chinese(dict) {
                            // CBOL Parsing 系統
                            var re1 = [{ w: dict.ver }, { w: '', br: 1 }, { w: dict.w }];
                            re1 = addBreakLine(re1);
                            var re2 = split3_at_pos5();
                            var re3a = re2[0];

                            var re3b = cvt_pos5(re2[1]);
                            var re3c = cvt_after5(re2[2]);
                            return re3a.concat(re3b).concat(re3c);
                            /** [5]才可能有 orig, 後半部再用 refenece */
                            function split3_at_pos5() {
                                var r1a = Enumerable.from(re1);
                                var r1 = r1a.take(5).toArray();
                                var r2 = [re1[5]];
                                var r3 = r1a.skip(6).toArray();
                                var r4 = [r1, r2, r3];
                                console.log(r4);
                                return r4;
                            }
                            /**
                             *
                             * @param {{w:string,sn?:string,isOld?:boolean}[]} data
                             * @returns {{w:string,sn?:string,isOld?:boolean}[]}
                             */
                            function cvt_after5(datas) {
                                return addReference(datas);
                            }
                            /**
                             * 對 [5]行作處理, 會產出多個, 到時候，再透過 concat 產出最終的.
                             * @param {{w:string,sn?:string,isOld?:boolean}[]} data
                             * @returns {{w:string,sn?:string,isOld?:boolean}[]}
                             */
                            function cvt_pos5(datas) {
                                var r1 = datas[0].w;
                                const r2 = FHL.SplitStringByRegex(r1, /;/g);
                                const r3a = getOrigAtLine5(r2[0].w);
                                const r3b = mergeText(r2);
                                return r3a.concat(r3b);
                                /**
                                 * 第1個;後，不可能有 orig，所以就直接轉合為原本的文，再型成標準格式輸出
                                 * @param {{w:string, exec?:RegExpExecArray}[]} data
                                 * @returns {{w:string}[]}
                                 */
                                function mergeText(data) {
                                    // 當沒有分號, 就沒有後面了
                                    if (data.length === 1) {
                                        return [];
                                    }
                                    const r3b1 = Enumerable.from(data).skip(1).select(a1 => a1.w).toArray().join('')
                                    return [{ w: r3b1 }];
                                }
                                /**
                                 * 行[5]的文字, 處理分號;前的字串 
                                 * @param {string} w 
                                 * @returns {{w:string,sn?:string,isOld?:boolean}[]}
                                 */
                                function getOrigAtLine5(w) {
                                    var rr1 = isOldOrig(w);
                                    var r3 = FHL.SplitStringByRegex(w, /(?:SN)?(H|G)?(\d+[a-z]?)/gi);
                                    var r4 = r3.map(function (a1) {
                                        if (a1.exec != null) {
                                            return doAsOrigIs(a1);
                                        } else {
                                            var r2 = FHL.clone(datas[0]);
                                            r2.w = a1.w;
                                            return r2;
                                        }
                                    });
                                    return r4;
                                    /**
                                     * @param {{w:string, exec?:RegExpExecArray}} a1
                                     */
                                    function doAsOrigIs(a1) {
                                        var HorG = rr1 ? 'H' : 'G';
                                        if (a1.exec[1] != null) {
                                            HorG = /H/i.test(a1.w) ? 'H' : 'G';
                                        }
                                        var r2 = FHL.clone(datas[0]);
                                        r2.w = HorG + a1.exec[2];
                                        r2.sn = a1.exec[2];
                                        r2.isOld = HorG === 'H';
                                        return r2;
                                    }
                                    function isOldOrig(w) {
                                        const r1 = /希伯來文|亞蘭文/i.test(w);
                                        if (r1)
                                            return true;
                                        return isOld;
                                    }
                                }
                            }
                            // re1 = addOrigDict(re1);
                            // re1 = addReference(re1);
                        }
                        function cvt_cbol_engs(dict) {
                            // CBOL Parsing System
                            var re1 = [{ w: dict.ver }, { w: '', br: 1 }, { w: dict.w }];
                            re1 = addBreakLine(re1);
                            // re1 = addOrigDict(re1);
                            // re1 = addReference(re1);
                            return re1;
                        }
                        function cvt_twcb(dict) {
                            var re1 = [{ w: dict.ver }, { w: '', br: 1 }, { w: dict.w }];
                            re1 = addBreakLine(re1);
                            re1 = addOrigDict(re1);
                            re1 = addReference(re1);
                            return re1;
                        }
                    }

                    function merge(dicts) {
                        var re1 = [];
                        for (let i1 = 0; i1 < dicts.length; i1++) {
                            const it1 = dicts[i1];
                            re1 = re1.concat(it1);
                            if (i1 !== dicts.length - 1) {
                                re1.push({ w: '', br: 1 });
                                re1.push({ w: '', hr: 1 });
                            }
                        }
                        return re1;
                    }
                }

                function renderError(pthis, error) {
                    var this$ = $(pthis);
                    var test1 = '<div>' + error.toString() + '</div>';

                    var modaltitle$ = this$.find('.modal-title');
                    modaltitle$.text('error');
                    var modalbody$ = this$.find('.modal-body');
                    modalbody$.html(test1);
                }
                /**
                 * @param {string} ref
                 */
                function renderReference(pthis, ref, book, chap) {
                    var this$ = $(pthis);


                    var html1 = generateReferenceHtml(ref, book);
                    var test1 = '<div id="ref-content">' + html1 + '</div>';

                    var modaltitle$ = this$.find('.modal-title');
                    modaltitle$.text('#' + r2.ref + '|');
                    var modalbody$ = this$.find('.modal-body');
                    modalbody$.html(test1);
                    findPrsingTableSnClassAndLetItCanClick(levelNext, modalbody$);
                }
                function generateContent(it1) {

                    if (it1.br === 1) {
                        return '<br/>';
                    } else if (it1.hr === 1) {
                        console.log('gc');
                        return '<hr/>';
                    } else if (it1.ref !== undefined) {
                        return '<span class="reference" ref="' + it1.ref + '" book="' + it1.book + '" chap="' + it1.chap + '">' + it1.w + '</span>';
                        // <span class="reference" ref="5:1;" book="40" chap="1">02532</span>
                        // 有時候ref沒有書卷，是因為在寫「某卷、某章」注釋，所以傳入book, chap是 default的概念。
                    } else if (it1.sn !== undefined) {
                        return '<span class="parsingTableSn" n="' + it1.idold + '" k="' + it1.sn + '">' + it1.w + '</span>';
                        // <span class="parsingTableSn" n="0" k="02532">02532</span>
                    } else {
                        return '<span>' + it1.w + '</span>';
                    }
                }
                /**
                 * 
                 * @param {string} ref 
                 * @param {number} book 
                 */
                function generateReferenceHtml(ref, book) {
                    var r1 = FHL.ParsingReferenceToAddresses(ref, book);
                    var r2 = FHL.ParsingAddressesToReferenceLink(r1);

                    console.log(r2);

                    var r3 = fromApi({ qstr: r2 });

                    var r4 = '<div>' + r3.record.map(generateEachRecord).join('') + '</div>';
                    return r4;
                    /**
                     * 
                     * @param {{bible_text:string,chap:number,sec:number,chineses:string}} a1 
                     */
                    function generateEachRecord(a1, i1) {
                        var r1 = $('<span class="one-verse"></span>');
                        if (i1 % 2 === 1) {
                            r1.addClass('odd')
                        }

                        var r2 = $('<span class="bible-text"></span>');
                        r2.text(a1.bible_text);
                        r1.append(r2);
                        r1.append('(');

                        // var r3 = $('<span class="bible-address"></span>');
                        var r3 = $('<span class="reference"></span>');
                        r3.attr('ref', a1.chineses + a1.chap); // 點擊看整章(上下文)
                        r3.attr('book', FHL.getIdFromName(a1.chineses));
                        r3.attr('chap', a1.chap);
                        r3.text(a1.chineses + a1.chap + ':' + a1.sec);
                        r1.append(r3);
                        r1.append(')');

                        var r1a = $('<span></span>');
                        r1a.append(r1)
                        return r1a.html();

                        // <span class="one-verse odd">
                        // <span class="bible-text">主人說：『不必，恐怕薅稗子，連麥子也拔出來。</span>
                        // <span class="bible-address">太 13:29</span>

                        // '<span class="reference" ref="' + it1.ref + '" book="' + it1.book + '" chap="' + it1.chap + '">' + it1.w + '</span>';
                    }

                    /**     
                     * @param {{ver:string,isGb:0|1,isSn:0|1},qstr:string} args 
                     * @returns {{record:{bible_text:string,chap:number,sec:number,chineses:string}[]}}
                     */
                    function fromApi(args) {
                        args.ver = args.ver !== undefined ? args.ver : 'unv';
                        args.isGb = args.isGb !== undefined ? args.ver : 0;
                        args.isSn = args.isSn !== undefined ? args.isSn : 0;
                        if (false === FHL.linq_contains(['unv', 'kjv'], args.ver)) {
                            args.isSn = 0;
                        }
                        var gb = `gb=${(args.isGb === 0 ? '0' : '1')}`;
                        var ver = `version=${args.ver}`;
                        var strong = `strong=${args.isSn === 1 ? '1' : '0'}`;
                        var url2 = `?qstr=${args.qstr}&${strong}&${gb}&${ver}`;


                        var re;
                        var er;
                        $.ajax({
                            url: (FHL.isLocalHost() ? 'http://bible.fhl.net' : '') + '/json/qsb.php' + url2,
                            async: false,
                            success: function (aa) {
                                re = JSON.parse(aa);
                            },
                            error: function (aa) {
                                er = aa;
                            }
                        });
                        if (er !== undefined) {
                            console.error(er + ' 當 qsb.php ' + qsb);
                            return undefined;
                        }
                        return re;
                    }

                    console.log(r2);
                    return '';

                }

            }

        }

        function DialogTemplate() {
            this.eventShowDialog = new IEventShowDialog();

            this.id = 'dialogs-base-template';
            this.pathHtmlAndId = pathSnDictDialogHtml + ' #SnDictDialog';
            this.idBase = 'SnDictDialog'; // 'SnDictDialog0' 'SnDictDialog-1' SnDictDialog1
            this.main = function () {
                this.makeSureDivExist(this.id);
                this.initial_dialogs_template(this.id);
            }

            /** 
            * 若沒有, 就 body append 一個 div
            * @param {string} id
            */
            this.makeSureDivExist = function makeSureDivExist(id) {
                // id = 'dialogs-base-template';
                if ($(id).length === 0) {
                    $('body').append($('<div id="' + id + '"></div>'));
                    // console.log($('#' + id).length);
                }
            }
            this.getId = function getId(level) {
                return this.idBase + level;
            }
            this.initial_dialogs_template = function initial_dialogs_template(id) {
                var r2 = $(DialogTemplate.outerHTML)
                r2.attr('id', this.getId(0))   // div#SnDictDialog 變 div#id
                if ($('#dialogs').length == 0) {
                    $('<div id=dialogs>', {}).appendTo($('body'))
                }
                r2.appendTo($('#dialogs'))

                r2.on('show.bs.modal', this.eventShowDialog.FnShowBsModal);
                this.cloneTemplateSnDictDialog(-1, this.id);

                // var pthis = this;
                // /** 載入 dialog 樣版, id為 SnDictDialog */
                // $('#' + id).load(this.pathHtmlAndId, function () {
                //     var r1 = $(this); // 回傳 div#dialogs，不是回傳載入那個
                //     var r2 = r1.children()[0]; // 回傳 div#SnDictDialog (就是這個)
                //     r2.id = pthis.getId(0);

                //     $(r2).on('show.bs.modal', pthis.eventShowDialog.FnShowBsModal);

                //     pthis.cloneTemplateSnDictDialog(-1, pthis.id);
                // });
            }
            /** copy一份,將id設為 SnDictDialogX, 從 SnDictDialog0 */
            this.cloneTemplateSnDictDialog = function cloneTemplateSnDictDialog(level, id) {
                id = id === undefined ? this.id : id;
                var r1 = $('#' + id);
                var r2 = r1.find(level === -1 ? '#SnDictDialog0' : '#SnDictDialog-1').clone(false)[0];
                r2.id = this.getId(level); // 'SnDictDialog' + level;
                r1.append(r2);
                $(r2).on('show.bs.modal', this.eventShowDialog.FnShowBsModal);
            }
        }

        function findPrsingTableSnClassAndLetItCanClick(level, container) {
            level = level === undefined ? 0 : level;

            /// <summary> 當 dict-table 建好時, 就可呼叫這個內容 </summary>
            var r1 = container.find('.parsingTableSn');
            for (var it1 of r1) {
                eachDom(it1);
            }

            var r1 = container.find('.reference');
            for (var it1 of r1) {
                eachDomReference(it1);
            }

            function eachDom(it1) {
                var r2 = $(it1);

                eachTheSame(r2);
                var jo = {
                    sn: r2.attr('k'),
                    isOld: parseInt(r2.attr('n')),
                }
                r2.attr('data-data', JSON.stringify(jo));
            }

            function eachDomReference(it1) {
                var r2 = $(it1);


                eachTheSame(r2);

                var jo = {
                    ref: r2.attr('ref'),
                    book: parseInt(r2.attr('book')),
                    chap: parseInt(r2.attr('chap')),
                }
                r2.attr('data-data', JSON.stringify(jo));
            }

            function eachTheSame(r2) {
                r2.attr('data-toggle', 'modal');
                r2.attr('data-target', '#SnDictDialog' + (level));
                r2.attr('data-level', level);
            }
        }
    })
    return


    var deps = [
        { path: 'OrigDict.js', isCache: undefined },
        { path: 'ParsingReference.js', isCache: undefined },
        { path: 'ParsingOrigDict.js', isCache: undefined }, // 沒有需要的 exports
    ]

    var srd = "index/DialogTemplate/" // 相對於 NUI 下的 /index.html
    var pathSnDictDialogHtml = srd + 'SnDictDialog.html'

    Promise.all(deps.map(a1 => Ijnjs.loadJsInIIFEModel(srd + a1.path, a1.isCache)))
        .then(re => {

            var { OrigDict } = re[0]
            var { addBreakLine, addOrigDict, addReference } = re[2]

            root.DialogTemplate = DialogTemplate
            root.findPrsingTableSnClassAndLetItCanClick = findPrsingTableSnClassAndLetItCanClick
            return
        })

})(this)