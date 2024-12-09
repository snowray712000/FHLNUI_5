/// <reference path='../libs/jsdoc/jquery.js' />
/// <reference path='../libs/jsdoc/linq.d.ts' />
/// <reference path='../libs/ijnjs/ijnjs.d.js' />
/// <reference path='sn-dictionary-dialog.js' />
/** 
 * @type {ISnDialogAddor}
 * interface 要用 SnRefDialog.iDlgReuse，這個將用 DlgReuse 完成
 * interface 還要用 iSnRefDialog
 */
function SnRefDialog() { }
/** 方便寫程式用，c，指的是 class，在寫 static 時尤其方便 */
SnRefDialog.prototype.c = SnRefDialog

/** 預設的 interface */
SnRefDialog.iSnRefDialog = {
    /**
     * 應該會用一個 dialog 供人選，所以會是 async 的
     * cbol 中文，cbol的e，指 eng，twcb就是浸宣了。dict 是全部
     * list 是彙編
     * @returns {Promise<"dict"|"cbol"|"cbole"|"twcb"|"ref">}
     */
    getSnDictOrListAsync: function () {
        return new Promise(res => {
            res("cbol")
            // res("dict")
            // res("list")
        })
    },
    /**
     * SnRefDialog 取得資料的 interface
     * 一定會使用到 .queryTp 作為 if else
     * @param {DText} dtext .sn .refDescription
     * @returns {Promise<DText[]>}
     */
    qAsync: function (dtext) {
        return new Promise(res => {
            /** @type {DText[]} */
            var dtexts = [
                { w: "出現經文(彙編)", sn: "2351", tp: "G", queryTp: "list" }, { isBr: 1 },
                { w: "5399 phobeo {fob-eh'-o}" }, { isBr: 1 },
                { isBr: 1 },
                { w: "源自" }, { w: "G5401", sn: "5401", tp: "G", queryTp: dtext.queryTp }, { w: "; TDNT - 9:189,1272; 動詞" }, { isBr: 1 },
                { w: "AV - fear 62, be afraid 23, be afraid of 5, reverence 1, misc 2; 93" }, { isBr: 1 },
                { isBr: 1 },
                {
                    tpContain: "ul", children: [
                        {
                            tpContain: "li", children: [
                                { w: "1) 驚恐, 懼怕某人或某事" }
                            ]
                        },
                        {
                            tpContain: "li", children: [
                                { w: "2) 尊敬, 有很深的敬意" }
                            ]
                        }
                    ]
                }, { isBr: 1 },
                { isBr: 1 },
                { w: "同義字見" }, { w: "G5841", sn: "5841", tp: "G", queryTp: dtext.queryTp }, { isBr: 1 },
            ]
            res(dtexts)
        })
    },
    /**
     * 此函式，會被呼加，然後加入到 dialog 的 body 中
     * 再請實作 
     * @param {DText} dtexts 
     * @returns {JQuery<HTMLElement>}
     */
    render: function (dtexts) {
        return $("<div>hello <span>Click Me</span></div>")
    },
    /**
     * @param {JQuery<HTMLElement>} dlgBody$ 
     */
    registeEvents: function (dlgBody$) {
        // dlgBody$.off("click").on({
        //     click: function () {
        //         new SnRefDialog().open({ dtext: { sn: "123", tp: "G", w: "G123" } })
        //     }
        // }, "span")
    },
    /**
     * @param {JQuery<HTMLElement>} dlg$ 
     */
    onClosed: function (dlg$) { },
    /**
     * @param {JQuery<HTMLElement>} dlg$ 
     */
    onOpened: function (dlg$) { },
    /**
     * @param {JQuery<HTMLElement>} dlg$ 
     */
    onResized: function (dlg$) { },

}

/** 設定 interface */
testThenDoAsync(() => window.Ijnjs != undefined && Ijnjs.FHL != undefined).then(() => {
    /**
     * 
     * @param {DText[]} dtexts old versions
     * @param {OneVersion[]} versions 
     * @returns {JQuery<HTMLElement>}
     */
    SnRefDialog.iSnRefDialog.render = function (versions) {
        if (versions.length == 0) {
            console.log(104)
            return $('<div></div>')
        }
        var LQ = Enumerable.from

        if (versions[0].verses != undefined) {
            console.log(109);
            /** @type {{cols:{cx:string}[]}} */
            var r1 = {
                cols: [
                    { cx: "2.5rem" },
                    {},
                    {},
                ]
            }

            var versionsLQ = Enumerable.from(versions)
            var addrLQLQ = versionsLQ.select(a1 => Enumerable.from(a1.verses).select(a2 => a2.addr))

            /** @returns {{order: string[]; dict: Object.<string, {b:number,c:number,v:number}[]>}} */
            var fnDoAddr = () => ({
                order: ['羅1:1', '羅1:2'],
                dict: {
                    '羅1:1': [{ b: 45, c: 1, v: 1 }],
                    '羅1:2': [{ b: 45, c: 1, v: 2 }],
                }
            })
            /** @returns {DText[]} */
            var fnAddrs2DTexts = (order) => [
                { w: '羅1:1', refDescription: '羅1' },
                { w: '羅1:2', refDescription: '羅1' },
            ]

            var fnGenDTextDom = Ijnjs.FHL.generateDTextDom



            var addrRe = fnDoAddr()
            var addrDTexts = fnAddrs2DTexts(addrRe.order)
            var addrDoms = addrDTexts.map(a1 => $('<div>').append(fnGenDTextDom([a1])))
            var colAddr = $('<div>', { class: 'col' }).append(...addrDoms)

            var contextsDoms = LQ(versions).select(a1 => {
                let r1 = LQ(a1.verses).select(a2 => fnGenDTextDom(a2.children))
                let r2 = r1.select(a2 => $('<div>', { class: 'ver' }).append(...a2.toArray()))
                return $('<div>', { class: 'col' }).append(...r2.toArray())
            })

            var reDom = $('<div>')
            reDom.append(colAddr)
            reDom.append(...contextsDoms.toArray())

            return reDom
        } else if (LQ(versions).any(a1 => a1.w != undefined)) {
            console.log(145);
            var dtexts = versions // old versions
            return Ijnjs.FHL.generateDTextDom(dtexts)
        } else {
            console.log(149);
        }
    }

    SnRefDialog.iSnRefDialog.onOpened = function (dlg$) {
        var LQ = Enumerable.from

        var fnRem2Px = rem => 30
        var sets = ['2.5rem', undefined, undefined]
        var fnCalcLeftWidth = () => {
            var cntNull = LQ(sets).where(a1 => a1 == undefined).count()
            if (sets.length == 1) {
                return [{ left: 0, cx: dlg$.width() }]
            }
            if (sets.length == 2) {
                if (cntNull == 1) {
                    var px = fnRem2Px(sets[0])
                    return [{ left: 0, cx: px }, { left: px, cx: dlg$.width() - px }]
                }
            }

            /** @type {{left: number,cx: number}[]} */
            var re = []
            if (sets.length == cntNull + 1) {
                Ijnjs.assert(() => sets[0] != undefined)
                var px = fnRem2Px(sets[0])
                re.push({ left: 0, cx: px })
            }

            var r1 = LQ(dlg$.find('.col')).skip(re.length == 0 ? 0 : 1)
            var r2 = r1.select(a1 => $(a1).height())
            var sum = r2.sum()
            var r3 = r2.select(a1 => a1 / sum)

            var win = dlg$.width() - (re.length == 0 ? 0 : re[0].cx)
            r3.forEach(a1 => {
                if (re.length == 0) {
                    re.push({ left: 0, cx: a1 * win })
                } else {
                    var r4 = re[re.length - 1]
                    re.push({ left: r4.left + r4.cx, cx: a1 * win })
                }
            })

            return re
        }
        testThenDoAsync({ cbTest: () => true, ms: 100, cntMax: 4 }).then(() => {
            var xAndCxs = fnCalcLeftWidth()
            var r1 = dlg$.find('.col')
            LQ(xAndCxs).forEach((a1, i1) => {
                r1.eq(i1).css("left", a1.left + 'px').width(a1.cx)

            })
        })
    }
    SnRefDialog.iSnRefDialog.onResized = function (dlg$) {

    }
    /**
     * @param {JQuery<HTMLElement>} dlgBody$ 
     */
    SnRefDialog.iSnRefDialog.registeEvents = function (dlgBody$) {
        dlgBody$.off('click').on({
            click: function () {
                /** @type {DText} */
                var r1 = $(this).data('data')
                new SnRefDialog().open({ dtext: r1 })
            }
        }, ".sn").on({
            click: function () {
                /** @type {DText} */
                var r1 = $(this).data('data')
                new SnRefDialog().open({ dtext: r1 })
            }
        }, ".ref")
    }

    SnRefDialog.iSnRefDialog.qAsync = function (dtext) {
        return new Promise(res => {
            if (dtext.sn == "9999") {
                res(
                    [
                        { w: "這是 dev 用的資料，當遇到 G9999 就會顯示" }, { isBr: 1 },
                        { w: "<G3212>", sn: "3212", tp: "G", tp2: "WG" }, { isBr: 1 },
                        { w: "#羅2:1-3|", refDescription: "羅2:1-3" }, { isBr: 1 },
                    ])
                return
            }

            if (dtext.refDescription != null) {
                res(qTest1())
            } else if (dtext.sn != null) {
                res([])
            } else {
                res([])
            }
        })
    }
})
var iCvtBibleText2DText = {
    /**
     * @param {string|DText[]} dtexts 
     * @returns {DText[]}
     */
    main: function (str) {
        return [{ w: str }]
    }
}
/**
 * 
 * @returns {Promise<OneVersion[]>}
 */
function qTest1() {
    return Promise.all([q1(), q2()])

    /** @returns {Promise<OneVersion>} */
    function q1(ver) {
        return new Promise(res => {
            /** @type {OneVerse} */
            let v1 = {
                addr: "羅1:1",
                children: iCvtBibleText2DText.main("耶穌<WG2424>基督的<WG5547>僕人<WG1401>保羅<WG3972>，奉召<WG2822>為使徒<WG652>，特派傳<WG873><WTG5772>　{<WG1519>}神的<WG2316>福音<WG2098>。")
            }
            /** @type {OneVerse} */
            let v2 = {
                addr: "羅1:2",
                children: iCvtBibleText2DText.main("這<WG3739>福音是　神從前藉<WG1223>{<WG846>}眾先知<WG4396>在<WG1722>聖經<WG40><WG1124>上所應許<WG4279><WTG5668>的，")
            }

            /** @type {OneVersion} */
            let re = {
                ver: "FHL和合本",
                verses: [v1, v2]
            }
            // {addr:"羅1:3",children:[{children:[{w:'123'},{w:'456'}]}]}
            res(re)
        })
    }
    function q2(ver) {
        return new Promise(res => {
            /** @type {OneVerse} */
            let v1 = {
                addr: "羅1:1",
                children: iCvtBibleText2DText.main("我是基督耶穌的僕人<u>保羅</u>；上帝選召我作使徒，特派我傳他的福音。")
            }
            /** @type {OneVerse} */
            let v2 = {
                addr: "羅1:2",
                children: iCvtBibleText2DText.main("這福音是上帝在很久以前藉著他的眾先知在聖經上所應許的，內容有關他的兒子—我們的主耶穌基督。從身世來說，他是<u>大衛</u>的後代；從聖潔的神性說，因上帝使他從死裡復活，以大能顯示他是上帝的兒子。")
            }

            /** @type {OneVersion} */
            let re = {
                ver: "現代中文譯本2019",
                verses: [v1, v2]
            }
            res(re)
        })
    }
}


SnRefDialog.iDlgReuse = {
    /**
     * 因為不太確定實作方法，所以先定為 async 較有單性
     * 取得的, 是一個已經被 dialog() 過的 jQuery 物件
     * 真正實作，大概是要管理 id 之類的吧。
     * 也要能夠掌握，它是被"不再使用"，所以可以"重複使用"的
     * 想起來，就挺複雜的(若要是要作的好的話，也有隨便作的方法，每次就新增一個，不重複使用過去已經沒用到的)
     * @returns {Promise<JQuery<HTMLElement>>}
     */
    getOneCanUseAsync: function () {
        if (this.idx == undefined) {
            this.idx = 0
        }
        this.idx += 1
        var dlg$ = $('<div>', { class: "dlg-reuse-body" }).attr("id", "dlg-reuse-" + this.idx).appendTo($('body'))
        dlg$.dialog()
        return new Promise(res => res(dlg$))
    },
}
/** 
 * 實作 iDlgReuseCreator 要用的。 在 close 時，要呼叫 
 * @param {HTMLElement} thisDlg
 * @param {JQuery<HTMLElement>} dlg$
*/
SnRefDialog.cbCloseMustTrigger = function (thisDlg, dlg$) { }
testThenDoAsync(() => window.DlgReuse != undefined).then(() => {
    SnRefDialog.iDlgReuse = DlgReuse // static 的，所以不用 new 

    /** 實作 DlgReuse.iDlgReuseCreator 的 setEventDialogClosed */
    DlgReuse.iDlgReuseCreator.setEventDialogClosed = function (fn) {
        SnRefDialog.cbCloseMustTrigger = fn
    }
})

/**
 * @param {{dtext:DText}} args 
 */
SnRefDialog.prototype.open = function (args) {
    var that = this
    var c = SnRefDialog
    var dtext = args.dtext

    // 取得資料
    /** @type {Promise<DText[]>} */
    var dtexts$$
    if (dtext.sn != undefined) {
        dtexts$$ = c.iSnRefDialog.getSnDictOrListAsync().then(tp => {
            dtext.queryTp = tp
            return c.iSnRefDialog.qAsync(dtext)
        })
    } else if (dtext.refDescription != undefined) {
        dtext.queryTp = "ref"
        dtexts$$ = c.iSnRefDialog.qAsync(dtext)
    }

    // 取得資料了, 開始 render 並 register events 
    dtexts$$.then(dtexts => {
        c.iDlgReuse.getOneCanUseAsync().then(dlg$ => {
            dlg$.off("dialogclose").on("dialogclose", function (event, ui) {
                c.cbCloseMustTrigger(this, dlg$)
                c.iSnRefDialog.onClosed(dlg$)
            }).off("dialogopen").on("dialogopen", function (event, ui) {
                c.iSnRefDialog.onOpened(dlg$)
            }).off('dialogresize').on("dialogresize", function () {
                c.iSnRefDialog.onResized(dlg$)
            })

            dlg$.dialog("open")
            dlg$.html("") // 先清空之前的
            dlg$.append(c.iSnRefDialog.render(dtexts))
            c.iSnRefDialog.registeEvents(dlg$)
        })
    })
}
SnRefDialog.domSnPreDialog =
    '<div id="sn-pre-dialog"><div> 彙編 </div><div> 字典(全) </div><div> CBOL 字典(中文) </div><div> CBOL Dictionary </div><div> 浸宣字典 </div></div>'

