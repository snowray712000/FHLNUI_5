/// <reference path="./libs/jsdoc/qunit.js" />
/// <reference path="./libs/jsdoc/linq.d.ts" />
/// <reference path="./ijnjs/BibleConstants.es6.js" />
/// <reference path="./ijnjs/matchGlobalWithCapture.es6.js" />
/// <reference path="./ijnjs/splitStringByRegex.es6.js" />
/// <reference path="./ijnjs/splitBtw.es6.js" />
/// <reference path="./ijnjs/splitReference.es6.js" />
/// <reference path="./ijnjs/DText.d.ts" />
import { matchGlobalWithCapture } from './ijnjs/matchGlobalWithCapture.es6.js'
import { splitStringByRegex } from './ijnjs/splitStringByRegex.es6.js'
import { BibleConstant } from './ijnjs/BibleConstants.es6.js'
import { splitBtw } from './ijnjs/splitBtw.es6.js'
import { splitReference } from './ijnjs/splitReference.es6.js'
import { cvtAddrsToRef } from './ijnjs/cvtAddrsToRef.es6.js'
import Enumerable from 'https://cdnjs.cloudflare.com/ajax/libs/linq.js/4.0.0/linq.min.js'

QUnit.test("test1", assert => {

    // abc123cba 基本，前面，後面包住
    // 5abc123cba 基本，但最前面有一般文字
    // 5abc123cba6 基本，但最後面有一般文字
    // 5abc12abc41cba124abc12cba123cba7 巢狀，內部是2層
    // ab124c124cb142 特例，完全沒有符合
    // 12ab234cba14 特例，沒有正確開頭
    // 1abc45cba901abc567cba 特例，只有一層，但有多個
    //  "0abcabc78cbacba", // 巢狀，但內層立刻接一個
    // 0abcaa45cba12cba, // 這個沒辦法處理好，假設內部有一個 aa cba 一組，但 abc cba 一組；但 cba 有同一樣, 例如 span.bibletext aaa span.exp bbb /span /span 有 2 個 span, 就會錯誤. (要用 or 用時一起用)

    let cases = new Object()
    cases["abc345cba"] = [
        {
            w: 'abc', tpContainer: 'abc', w2: 'cba', children: [
                { w: '345' }
            ]
        }
    ]
    cases["0abc456cba"] = [
        { w: '0' },
        {
            w: 'abc', tpContainer: 'abc', w2: 'cba', children: [
                { w: '456' }
            ]
        }
    ]
    cases["0abc456cba0"] = [
        { w: '0' },
        {
            w: 'abc', tpContainer: 'abc', w2: 'cba', children: [
                { w: '456' }
            ]
        },
        { w: '0' }
    ]
    cases["0abc45abc90cba456abc01cba567cba1"] = [
        { w: '0' },
        {
            w: 'abc', tpContainer: 'abc', w2: 'cba', children: [
                { w: '45' },
                {
                    w: 'abc', tpContainer: 'abc', w2: 'cba', children: [
                        { w: '90' }
                    ]
                },
                { w: '456' },
                {
                    w: 'abc', tpContainer: 'abc', w2: 'cba', children: [
                        { w: '01' }
                    ]
                },
                { w: '567' },
            ]
        },
        { w: '1' }
    ]
    cases["01234567890123"] = null
    cases["0123456cba01"] = null
    cases["0abc45cba901abc567cba"] = [
        { w: '0' },
        {
            w: 'abc', w2: 'cba', tpContainer: 'abc', children: [
                { w: '45' },
            ]
        },
        { w: '901' },
        {
            w: 'abc', w2: 'cba', tpContainer: 'abc', children: [
                { w: '567' },
            ]
        },
    ]
    cases["0abcabc78cbacba"] = [
        { w: '0' },
        {
            w: 'abc', w2: 'cba', tpContainer: 'abc', children: [
                {
                    w: 'abc', w2: 'cba', tpContainer: 'abc', children: [
                        { w: '78' }
                    ]
                }
            ]
        }
    ]

    let regs = {
        reg1: () => /abc/g,
        reg2: () => /cba/g,
    }

    for (const it of Object.keys(cases)) {
        let re = splitBtw(it, regs)
        assert.deepEqual(re, cases[it])
    }

    return


})

QUnit.test("test2a", assert => {
    // https://bible.fhl.net/new/allreadme.html

    // default book:45, chap:2

    // 31:12
    // 31:12-14
    // 31:12-32:12
    // 31:12,15,17
    // 31:12-15,18,19-31
    // 12 (x) 羅12章？羅2:12節？ … 章
    // 約12 (v) 約12章
    // 4-12 4到12節
    // 31:12-end
    // 31:12-e
    // 31:12,15-17,20
    // #31:12|
    // 滅亡3 燬滅1 滅沒1 （5）… f 必須要有 book，例如約12
    // ＜神出＞2d   #伯26:6| ... f 必須要有 book

    let cases = {}
    let answers2 = {}
    cases["aa31:12bb"] = [{ w: 'aa' }, { w: '31:12', ref: '31:12' }, { w: 'bb' }]
    answers2["aa31:12bb"] = "創31:12"
    cases["aa31:12-14bb"] = [{ w: 'aa' }, { w: '31:12-14', ref: '31:12-14' }, { w: 'bb' }]
    cases["aa31:12-32:12bb"] = [{ w: 'aa' }, { w: '31:12-32:12', ref: '31:12-32:12' }, { w: 'bb' }]
    cases["aa31:12,15,17bb"] = [{ w: 'aa' }, { w: '31:12,15,17', ref: '31:12,15,17' }, { w: 'bb' }]
    cases["aa31:12-15,18,19-31bb"] = [{ w: 'aa' }, { w: '31:12-15,18,19-31', ref: '31:12-15,18,19-31' }, { w: 'bb' }]
    cases["aa12bb"] = [{ w: 'aa' }, { w: '12', ref: '12' }, { w: 'bb' }]
    cases["aa約12bb"] = [{ w: 'aa' }, { w: '約12', ref: '約12' }, { w: 'bb' }]
    cases["aa4-12bb"] = [{ w: 'aa' }, { w: '4-12', ref: '4-12' }, { w: 'bb' }]
    cases["aa31:12-endbb"] = [{ w: 'aa' }, { w: '31:12-end', ref: '31:12-end' }, { w: 'bb' }]
    cases["aa31:12-ebb"] = [{ w: 'aa' }, { w: '31:12-e', ref: '31:12-e' }, { w: 'bb' }]
    cases["aa31:12,15-17,20bb"] = [{ w: 'aa' }, { w: '31:12,15-17,20', ref: '31:12,15-17,20' }, { w: 'bb' }]
    cases["aa31:12;30:12-14bb"] = [{ w: 'aa' }, { w: '31:12;30:12-14', ref: '31:12;30:12-14' }, { w: 'bb' }]
    cases["aa#31:12|bb"] = [{ w: 'aa' }, { w: '#31:12|', ref: '#31:12|' }, { w: 'bb' }]
    cases["滅亡3 燬滅1 滅沒1 （5）"] = [{ w: "滅亡3 燬滅1 滅沒1 （5）" }]
    cases["＜神出＞2d   #伯26:6|"] = [{ w: '＜神出＞2d   ' }, { w: '#伯26:6|', ref: '#伯26:6|' }]
    cases["＜神出＞2#伯26:6|"] = [{ w: '＜神出＞2' }, { w: '#伯26:6|', ref: '#伯26:6|' }] // 2被判定,但要拿掉
    cases["＜神出＞2伯26:6"] = [{ w: '＜神出＞2' }, { w: '#伯26:6|', ref: '#伯26:6|' }] // 2被判定,但要拿掉
    cases["2伯26:6"] = [{ w: '2' }, { w: '#伯26:6|', ref: '#伯26:6|' }] // 2被判定,但要拿掉
    cases["30:12-32:12"] = [{ w: '31:12-32:12', ref: '31:12-32:12' }] // 產生addr, type a
    cases["31:30-32:4"] = [{ w: '31:30-32:4', ref: '創31:30-32:4' }]  // cvtAddrsToRef
    cases["31:30-32:4;32:7-8"] = [{ w: '31:30-32:4;32:7-8', ref: '創31:30-55;32:4,7-8' }] // cvtAddrsToRef


    cases["＜神出＞2d   #伯26:6|\\r\\n＜譯詞＞滅亡3 燬滅1 滅沒1 （5）\\r\\n＜解釋＞\\r\\n一、指陰間裡停放要滅亡的死人之處，是陰間有分隔間的概念發展之後產生的字。燬滅，#伯31:12|。平行字שְׁאוֹל陰間，#伯26:6;箴15:11|；וָמָוֶת死亡，#伯28:22|；קֶבֶר墳墓，#詩88:11|。二、舊約希伯來文讀音為亞巴頓，新約希臘文讀音是亞玻倫，意指惡魔，撒但與無底坑的使者，#啟9:11|。"] = []


    for (const k of Object.keys(cases)) {
        let r1 = splitReference(k)

        // refAddresses 手寫，太多。
        for (const it of r1) {
            if (it.refAddresses != undefined) {
                console.log(k);
                console.log(it.refAddresses);
                assert.equal(answers2[k], cvtAddrsToRef(it.refAddresses, '羅'))
            }
            delete it.refAddresses
        }
        assert.deepEqual(r1, cases[k], k)
    }
})

QUnit.test("test2", assert => {
    /**
     * @interface DText
     */
    function DText() {
        /** @type {string} */
        this.w
        /**
         * 若是夾擊資料，則有尾部與頭部，例如 <div> 尾部可能是 </div> 
         * @type {string} */
        this.w2
        /** @type {string} */
        this.tpContainer
        /** @type {DText[]} */
        this.children
        /** @type {0|1?} */
        this.isBr
    }

    let str = virtualOld('11').record[0].dic_text
    console.log(str);

    let regs = {
        reg1: () => /<div class=\"idt\">/g,
        reg2: () => /<\/div>/g
    }
    let regs2 = {
        reg1: () => /<span class=\"bibtext\">|<span class=\"exp\">/g,
        reg2: () => /<\/span>/g
    }

    twcbflow()


    return
    function twcbflow() {
        let r1 = splitBtw(str, regs)

        let re = splitSpansOne(r1)
        //console.log(re);

        let r3 = splitBrOne(re)
        console.log(r3);



        return
        /**
         * @param {DText[]} data 
         */
        function splitBrOne(data) {
            let re = []
            for (const it of data) {
                if (it.tpContainer == null) {
                    let r2 = splitStringByRegex(it.w, /\r?\n/g)
                    if (r2 == null || r2.length <= 1) { // 沒有任何符合
                        re.push(it)
                    } else {
                        for (const it2 of r2) {
                            if (it2.exec == null) {
                                re.push({ w: it2.w })
                            } else {
                                re.push({ isBr: 1 })
                            }
                        }
                    }
                } else {
                    let r3 = splitBrOne(it.children)
                    it.children = r3
                    re.push(it)
                }
            }
            return re
        }
        /**
         * @param {DText[]} data 
         */
        function splitSpansOne(data) {
            let re = []
            for (const it of data) {
                if (it.tpContainer == null) {
                    let r2 = splitBtw(it.w, regs2)
                    if (r2 == null) {
                        re.push(it)
                    } else {
                        for (const it2 of r2) {
                            re.push(it2)
                        }
                    }
                } else {
                    let r3 = splitSpansOne(it.children)
                    it.children = r3
                    re.push(it)
                }
            }
            return re
        }
    }
    function virtualOld(sn) {
        return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00011","dic_text":"00011\\r\\n【0011】אֲבַדּוֹן\\r\\n＜音譯＞’abaddown\\r\\n＜詞類＞名、陰\\r\\n＜字義＞毀滅之地、滅亡、亞巴頓\\r\\n＜字源＞來自HB6的加強語氣\\r\\n＜LXX＞G3  G623\\r\\n＜神出＞2d   #伯26:6|\\r\\n＜譯詞＞滅亡3 燬滅1 滅沒1 （5）\\r\\n＜解釋＞\\r\\n<div class=\\"idt\\">一、指陰間裡停放要滅亡的死人之處，是陰間有分隔間的概念發展之後產生的字。<span class=\\"bibtext\\"><span class=\\"exp\\">燬滅</span></span>，#伯31:12|。平行字שְׁאוֹל陰間，#伯26:6;箴15:11|；וָמָוֶת死亡，#伯28:22|；קֶבֶר墳墓，#詩88:11|。</div>\\r\\n<div class=\\"idt\\">二、舊約希伯來文讀音為亞巴頓，新約希臘文讀音是亞玻倫，意指惡魔，撒但與無底坑的使者，#啟9:11|。</div>"}]}')
    }
})

QUnit.test("test3-bundle-split reference", assert => {
    let re = splitReferenceEs6Js()("這可以參考 #創1:3-4 的內容")
    assert.equal(re, '')
})
function BibleConstantEs6Js() {
    /**
     * @namespace BibleConstant
     */
    function BibleConstant() { }
    /** @const {string[]} 零', '一', '二'... */
    BibleConstant.CHINESE_NUMBERS = [
        '零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', '三十',
        '三十一', '三十二', '三十三', '三十四', '三十五', '三十六', '三十七', '三十八', '三十九', '四十',
        '四十一', '四十二', '四十三', '四十四', '四十五', '四十六', '四十七', '四十八', '四十九', '五十',
        '五十一', '五十二', '五十三', '五十四', '五十五', '五十六', '五十七', '五十八', '五十九', '六十',
        '六十一', '六十二', '六十三', '六十四', '六十五', '六十六', '六十七', '六十八', '六十九', '七十',
        '七十一', '七十二', '七十三', '七十四', '七十五', '七十六', '七十七', '七十八', '七十九', '八十',
        '八十一', '八十二', '八十三', '八十四', '八十五', '八十六', '八十七', '八十八', '八十九', '九十',
        '九十一', '九十二', '九十三', '九十四', '九十五', '九十六', '九十七', '九十八', '九十九', '一百',
        '一百零一', '一百零二', '一百零三', '一百零四', '一百零五', '一百零六', '一百零七', '一百零八', '一百零九', '一百一十',
        '一百一十一', '一百一十二', '一百一十三', '一百一十四', '一百一十五', '一百一十六', '一百一十七', '一百一十八', '一百一十九', '一百二十',
        '一百二十一', '一百二十二', '一百二十三', '一百二十四', '一百二十五', '一百二十六', '一百二十七', '一百二十八', '一百二十九', '一百三十',
        '一百三十一', '一百三十二', '一百三十三', '一百三十四', '一百三十五', '一百三十六', '一百三十七', '一百三十八', '一百三十九', '一百四十',
        '一百四十一', '一百四十二', '一百四十三', '一百四十四', '一百四十五', '一百四十六', '一百四十七', '一百四十八', '一百四十九', '一百五十'
    ];
    /** @const {string[]} '創', '出', '利'... */
    BibleConstant.CHINESE_BOOK_ABBREVIATIONS = [
        '創', '出', '利', '民', '申',
        '書', '士', '得', '撒上', '撒下', '王上', '王下', '代上', '代下', '拉', '尼', '斯',
        '伯', '詩', '箴', '傳', '歌',
        '賽', '耶', '哀', '結', '但',
        '何', '珥', '摩', '俄', '拿', '彌', '鴻', '哈', '番', '該', '亞', '瑪',
        '太', '可', '路', '約',
        '徒',
        '羅', '林前', '林後', '加', '弗', '腓', '西', '帖前', '帖後', '提前', '提後', '多', '門',
        '來', '雅', '彼前', '彼後', '約一', '約二', '約三', '猶',
        '啟'
    ];
    /** @const {string[]} '创', '出', '利',... */
    BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB = [
        '创', '出', '利', '民', '申',
        '书', '士', '得', '撒上', '撒下', '王上', '王下', '代上', '代下', '拉', '尼', '斯',
        '伯', '诗', '箴', '传', '歌',
        '赛', '耶', '哀', '结', '但',
        '何', '珥', '摩', '俄', '拿', '弥', '鸿', '哈', '番', '该', '亚', '玛',
        '太', '可', '路', '约',
        '徒',
        '罗', '林前', '林后', '加', '弗', '腓', '西', '帖前', '帖后', '提后', '提后', '多', '门',
        '来', '雅', '彼前', '彼后', '约一', '约二', '约三', '犹',
        '启'
    ];
    /** @const {string[]} '創世記', '出埃及記', '利未記', ,... */
    BibleConstant.CHINESE_BOOK_NAMES = [
        '創世記', '出埃及記', '利未記', '民數記', '申命記',
        '約書亞記', '士師記', '路得記', '撒母耳記上', '撒母耳記下', '列王紀上', '列王紀下', '歷代志上', '歷代志下', '以斯拉記', '尼希米記', '以斯帖記',
        '約伯記', '詩篇', '箴言', '傳道書', '雅歌',
        '以賽亞書', '耶利米書', '耶利米哀歌', '以西結書', '但以理書',
        '何西阿書', '約珥書', '阿摩司書', '俄巴底亞書', '約拿書', '彌迦書', '那鴻書', '哈巴谷書', '西番雅書', '哈該書', '撒迦利亞書', '瑪拉基書',
        '馬太福音', '馬可福音', '路加福音', '約翰福音',
        '使徒行傳',
        '羅馬書', '哥林多前書', '哥林多後書', '加拉太書', '以弗所書', '腓立比書', '歌羅西書',
        '帖撒羅尼迦前書', '帖撒羅尼迦後書', '提摩太前書', '提摩太後書', '提多書', '腓利門書',
        '希伯來書', '雅各書', '彼得前書', '彼得後書', '約翰壹書', '約翰貳書', '約翰參書', '猶大書',
        '啟示錄'
    ];

    /** @const {string[]} '创世记', '出埃及记', '利未记',... */
    BibleConstant.CHINESE_BOOK_NAMES_GB = [
        '创世记', '出埃及记', '利未记', '民数记', '申命记',
        '约书亚记', '士师记', '路得记', '撒母耳记上', '撒母耳记下', '列王纪上', '列王纪下', '历代志上', '历代志下', '以斯拉记', '尼希米记', '以斯帖记',
        '约伯记', '诗篇', '箴言', '传道书', '雅歌',
        '以赛亚书', '耶利米书', '耶利米哀歌', '以西结书', '但以理书',
        '何西阿书', '约珥书', '阿摩司书', '俄巴底亚书', '约拿书', '弥迦书', '那鸿书', '哈巴谷书', '西番雅书', '哈该书', '撒迦利亚书', '玛拉基书',
        '马太福音', '马可福音', '路加福音', '约翰福音',
        '使徒行传',
        '罗马书', '哥林多前书', '哥林多后书', '加拉太书', '以弗所书', '腓立比书', '歌罗西书',
        '帖撒罗尼迦前书', '帖撒罗尼迦后书', '提摩太前书', '提摩太后书', '提多书', '腓利门书',
        '希伯来书', '雅各书', '彼得前书', '彼得后书', '约翰壹书', '约翰贰书', '约翰参书', '犹大书',
        '启示录'
    ];


    /** @const {string[]} 'Gen', 'Ex', 'Lev', 'Num'... */
    BibleConstant.ENGLISH_BOOK_ABBREVIATIONS = [
        'Gen', 'Ex', 'Lev', 'Num', 'Deut',
        'Josh', 'Judg', 'Ruth', '1 Sam', '2 Sam',
        '1 Kin', '2 Kin', '1 Chr', '2 Chr', 'Ezra', 'Neh', 'Esth',
        'Job', 'Ps', 'Prov', 'Eccl', 'Song',
        'Is', 'Jer', 'Lam', 'Ezek', 'Dan',
        'Hos', 'Joel', 'Amos', 'Obad', 'Jon', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal',
        'Matt', 'Mark', 'Luke', 'John',
        'Acts',
        'Rom', '1 Cor', '2 Cor', 'Gal', 'Eph', 'Phil', 'Col',
        '1 Thess', '2 Thess', '1 Tim', '2 Tim', 'Titus', 'Philem',
        'Heb', 'James', '1 Pet', '2 Pet', '1 John', '2 John', '3 John', 'Jude',
        'Rev'
    ];
    /** @const {string[]} 'Genesis', 'Exodus', 'Leviticus', ... */
    BibleConstant.ENGLISH_BOOK_NAMES = [
        'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
        'Joshua', 'Judges', 'Ruth', 'First Samuel', 'Second Samuel',
        'First Kings', 'Second Kings', 'First Chronicles', 'Second Chronicles', 'Ezra', 'Nehemiah', 'Esther',
        'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
        'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
        'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
        'Matthew', 'Mark', 'Luke', 'John',
        'Acts',
        'Romans', 'First Corinthians', 'Second Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
        'First Thessalonians', 'Second Thessalonians', 'First Timothy', 'Second Timothy', 'Titus', 'Philemon',
        'Hebrews', 'James', 'First Peter', 'Second Peter', 'First John', 'second John', 'Third John', 'Jude',
        'Revelation'
    ];
    /** @const {string[]} 'Ge', 'Ex', 'Le',... */
    BibleConstant.ENGLISH_BOOK_SHORT_ABBREVIATIONS = [
        'Ge', 'Ex', 'Le', 'Nu', 'De',
        'Jos', 'Jud', 'Ru', '1Sa', '2Sa',
        '1Ki', '2Ki', '1Ch', '2Ch', 'Ezr', 'Ne', 'Es',
        'Job', 'Ps', 'Pr', 'Ec', 'So', 'Isa', 'Jer', 'La', 'Eze', 'Da',
        'Ho', 'Joe', 'Am', 'Ob', 'Jon', 'Mic', 'Na', 'Hab', 'Zep', 'Hag', 'Zec', 'Mal',
        'Mt', 'Mr', 'Lu', 'Joh',
        'Ac',
        'Ro', '1Co', '2Co', 'Ga', 'Eph', 'Php', 'Col',
        '1Th', '2Th', '1Ti', '2Ti', 'Tit', 'Phm',
        'Heb', 'Jas', '1Pe', '2Pe', '1Jo', '2Jo', '3Jo', 'Jude',
        'Re'
    ];
    /** @const {number[]} 50, 40, 27, 36, 34,... */
    BibleConstant.COUNT_OF_CHAP = [
        50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25,
        29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52,
        5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4,
        28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4,
        5, 3, 6, 4, 3, 1, 13, 5,
        5, 3, 5, 1, 1, 1, 22
    ];
    BibleConstant.BOOK_WHERE_1CHAP = [31, 57, 63, 64, 65]
    /** @const {number[][]} 建議用 getCountVerseOfChap(book,chap), 例 太2節數 return COUNT_OF_VERSE[39][1] */
    BibleConstant.COUNT_OF_VERSE = [
        [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
        [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
        [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
        [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13],
        [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12],
        [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33],
        [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25],
        [22, 23, 18, 22],
        [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13],
        [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25],
        [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53],
        [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
        [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
        [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
        [11, 70, 13, 24, 17, 22, 28, 36, 15, 44],
        [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31],
        [22, 23, 15, 17, 14, 14, 10, 17, 32, 3],
        [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17],
        [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6],
        [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31],
        [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14],
        [17, 17, 11, 16, 16, 13, 13, 14],
        [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24],
        [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
        [22, 22, 66, 22, 22],
        [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
        [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13],
        [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9],
        [20, 32, 21],
        [15, 16, 15, 13, 27, 14, 17, 14, 15],
        [21],
        [17, 10, 10, 11],
        [16, 13, 12, 13, 15, 16, 20],
        [15, 13, 19],
        [17, 20, 19],
        [18, 15, 20],
        [15, 23],
        [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
        [14, 17, 18, 6],
        [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
        [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20],
        [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53],
        [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
        [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31],
        [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27],
        [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24],
        [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14],
        [24, 21, 29, 31, 26, 18],
        [23, 22, 21, 32, 33, 24],
        [30, 30, 21, 23],
        [29, 23, 25, 18],
        [10, 20, 13, 18, 28],
        [12, 17, 18],
        [20, 15, 16, 16, 25, 21],
        [18, 26, 17, 22],
        [16, 15, 15],
        [25],
        [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25],
        [27, 26, 18, 17, 20],
        [25, 25, 22, 19, 14],
        [21, 22, 18],
        [10, 29, 24, 21, 21],
        [13],
        [14],
        [25],
        [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21]
    ];

    return BibleConstant
}
function BibleConstantHelperEs6Js() {
    let BibleConstant = BibleConstantEs6Js()

    /**
     * 提供許多 static function
     */
    function BibleConstantHelper() { }

    /** @type {Object.<string, number>} */
    BibleConstantHelper._mapName2Id
    BibleConstantHelper.getMapName2Id = () => {
        if (BibleConstantHelper._mapName2Id == undefined) {
            BibleConstantHelper._mapName2Id = generate()
        }
        return BibleConstantHelper._mapName2Id

        function generate() {
            let r1 = BibleConstant
            var r2 = [r1.CHINESE_BOOK_NAMES, r1.CHINESE_BOOK_NAMES_GB, r1.CHINESE_BOOK_ABBREVIATIONS, r1.CHINESE_BOOK_ABBREVIATIONS_GB, r1.ENGLISH_BOOK_ABBREVIATIONS, r1.ENGLISH_BOOK_NAMES, r1.ENGLISH_BOOK_SHORT_ABBREVIATIONS];

            /** @type {Object.<string, number>} */
            let r3 = {}
            Enumerable.from(r2).forEach(a2 => {
                Enumerable.from(a2).forEach((a1, i1) => {
                    r3[a1.toLowerCase()] = i1 + 1
                })
            })

            // 特殊中文字 / 別名
            var sp1 = [
                { id: 62, na: ['約壹', '约壹', '約翰壹書', '约翰壹书', '約翰一書', '约翰一书', '約一', '约一'] },
                { id: 63, na: ['約貳', '约贰', '約翰貳書', '约翰贰书', '約翰二書', '约翰二书', '約二', '约二'] },
                { id: 64, na: ['約參', '约参', '約翰參書', '约翰参书', '約翰三書', '约翰三书', '约三', '約三'] },
            ];
            Enumerable.from(sp1).forEach(a1 => {
                Enumerable.from(a1.na).forEach(a2 => {
                    r3[a2] = a1.id
                })
            })
            return r3
        }
    }

    /**
     * @param {string} name 若是英文，要小寫
     * @returns 若不存在，回傳-1
     */
    BibleConstantHelper.getBookId = (name) => {

        let r1 = BibleConstantHelper.getMapName2Id()
        let r2 = r1[name]
        return r2 ?? -1
    }


    /**
     * 緣由: 開發 splitReference 時要用到的
     * 4-7 
     * @param {number} book 
     * @param {number} chap 
     * @param {number} verse1 
     * @param {number} verse2 
     * @returns {DAddress[]}
     */
    BibleConstantHelper.generateAddressesTpE = (book, chap, verse1, verse2) => {
        if (verse2 > verse1) {
            return Enumerable.range(verse1, verse2 - verse1 + 1).select(v => ({ book: book, chap: chap, verse: v })).toArray()
        }
        return Enumerable.range(verse2, verse1 - verse2 + 1).select(v => ({ book: book, chap: chap, verse: v })).toArray()
    }
    /**
     * 緣由: 開發 splitReference 時要用到的
     * 2:3-end or 2:3-e
     * @param {number} book 
     * @param {number} chap 
     * @param {number} verse 
     * @returns {DAddress[]}
     */
    BibleConstantHelper.generateAddressesTpB = (book, chap, verse) => {
        const cnt = BibleConstant.COUNT_OF_VERSE[book - 1][chap - 1]
        return Enumerable.range(verse, cnt - verse + 1).select(i => ({ book: book, chap: chap, verse: i })).toArray()
    }

    /**
     * 緣由: 開發 splitReference 時要用到的
     * 約12，整章
     * @param {number}} book 
     * @param {number} chap 
     * @returns {DAddress[]}
     */
    BibleConstantHelper.generateAddressesTpF = (book, chap) => {
        const cnt = BibleConstant.COUNT_OF_VERSE[book - 1][chap - 1]
        return Enumerable.range(1, cnt).select(i => ({ book: book, chap: chap, verse: i })).toArray()
    }

    /**
     * 緣由: 開發 splitReference 時要用到的
     * 2:1-4:4
     * @param {number} book 
     * @param {number} chap1 
     * @param {number} verse1 
     * @param {number} chap2 
     * @param {number} verse2 
     */
    BibleConstantHelper.generateAddressesTpA = (book, chap1, verse1, chap2, verse2) => {
        let re1 = BibleConstantHelper.generateAddressesTpB(book, chap1, verse1)

        let re2 = []
        if (chap2 - chap1 > 1) {
            Enumerable.range(chap1 + 1, chap2 - chap1 - 1).forEach(ch => {
                re2.push.apply(re2, BibleConstantHelper.generateAddressesTpF(book, ch))
            })
        }

        let re3 = BibleConstantHelper.generateAddressesTpE(book, chap2, 1, verse2)
        return re1.concat(re2, re3)
    }

    /**
     * 緣由: 開發 cvtAddrsToRef 時作的。
     * @param {'羅'|'羅馬書'|'罗'|'罗马书'|'romans'|'rom'|'ro'} tp 
     * @returns {string[]}
     */
    BibleConstantHelper.getBookNameArrayWhereTp = (tp) => {
        if (tp == '羅') { return BibleConstant.CHINESE_BOOK_ABBREVIATIONS }
        else if (tp == '罗') { return BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB }
        else if (tp == '羅馬書') { return BibleConstant.CHINESE_BOOK_NAMES }
        else if (tp == '罗马书') { return BibleConstant.CHINESE_BOOK_NAMES_GB }
        else if (tp == 'romans') { return BibleConstant.ENGLISH_BOOK_NAMES }
        else if (tp == 'rom') { return BibleConstant.ENGLISH_BOOK_ABBREVIATIONS }
        else if (tp == 'ro') { return BibleConstant.ENGLISH_BOOK_SHORT_ABBREVIATIONS }
        return BibleConstant.CHINESE_BOOK_ABBREVIATIONS
    }

    /**
     * 取得 verses, 裡面沒有作任何保護, 因為覺得這是外面介面要作的.
     * @param {number} book 1-based, book id
     * @param {number} chap 1-based, chap
     * @returns {number}
     */
    BibleConstantHelper.getCountVerseOfChap = (book, chap) => {
        let r1 = BibleConstant.COUNT_OF_VERSE
        return r1[book - 1][chap - 1]
    }
    return BibleConstantHelper
}
// bundle es6 js
function splitReferenceEs6Js() {
    let BibleConstantHelper = BibleConstantHelperEs6Js()
    /**
     * 
     * @param {string} str 
     * @param {DAddress} addrDefault
     * @returns {DText[]}
     */
    function splitReference(str, addrDefault) {
        let re = findRefernece(str)
        let re2 = merge(re)
        removeTpf(re2)
        connectPureStringCauseOfTypeFRemove(re2)

        // 將 refs 轉為經節
        addrDefault = makeSureAddrExist(addrDefault)
        let re3 = cvtToDTexts(re2, addrDefault)
        return re3
    }
    return splitReference
    /**
     * 
     * @param {(DRefs|DText)[]} data 
     * @param {DAddress} addrDefault 
     * @returns 
     */
    function cvtToDTexts(data, addrDefault) {
        /** @type {DText[]} */
        let re = []
        for (let i = 0; i < data.length; i++) {
            const it1 = data[i];
            if (it1.refs == undefined) {
                re.push(it1)
                continue
            }

            let r1 = gDTextRef(it1.refs, addrDefault)
            re.push(r1)
        }
        return re

        /**
         * 
         * @param {DRef[]} refs 
         * @param {DAddress} addrDefault
         * @returns {DText}
         */
        function gDTextRef(refs, addrDefault) {
            let book = addrDefault.book
            let chap = addrDefault.chap

            /** @type {DAddress[]} */
            let reAddr = []
            let appendAddrs = (addrs) => {
                reAddr.push.apply(reAddr, addrs) // fast append
            }
            let w = ""

            /**
             * 
             * @param {string} str
             * @param {RegExp} reg 
             * @param {number} cnt exec[1] exec[2] 就是傳入 2個
             * @returns {number[]|null}
             */
            let fnExecToIntOrNull = (str, reg, cnt) => {
                let exec = reg.exec(str)
                if (exec == null) { return null }
                return Enumerable.range(1, cnt).select(i => parseInt(exec[i])).toArray() // ps: params
            }

            for (let i = 0; i < refs.length; i++) {
                const it = refs[i];
                w += it.w

                if (it.book != undefined) book = it.book

                if (it.tp == 'a') {
                    let ps = fnExecToIntOrNull(it.descExcludeBook, /(\d+):(\d+)-(\d+):(\d+)/, 4)
                    let re = BibleConstantHelper.generateAddressesTpA(book, ps[0], ps[1], ps[2], ps[3])
                    appendAddrs(re)
                    chap = ps[3]
                } else if (it.tp == 'b') {
                    let ps = fnExecToIntOrNull(it.descExcludeBook, /(\d+):(\d+)/, 2)
                    let re = BibleConstantHelper.generateAddressesTpB(book, ps[0], ps[1])
                    appendAddrs(re)
                    chap = ps[0]
                } else if (it.tp == 'c' || it.tp == 'd') {
                    // d 的作法剛好可以與 c 相同
                    let r1 = /(\d+):([\d\-,]+)/.exec(it.descExcludeBook)
                    chap = parseInt(r1[1])

                    let r2 = splitStringByRegex(r1[2], /,/g)
                    if (r2 == null) { r2 = [{ w: r1[2] }] }

                    let r3 = [] // verses 12-15 18 19-31
                    Enumerable.from(r2).where(a1 => a1.exec == undefined).forEach(a1 => {
                        let r4 = fnExecToIntOrNull(a1.w, /(\d+)-(\d+)/, 2)
                        if (r4 == null) {
                            r3.push({ book: book, chap: chap, verse: parseInt(a1.w) })
                        } else {
                            r3.push.apply(r3, BibleConstantHelper.generateAddressesTpE(book, chap, r4[0], r4[1]))
                        }
                    })
                    appendAddrs(r3)
                } else if (it.tp == 'e') {
                    let ps = fnExecToIntOrNull(it.descExcludeBook, /(\d+)-(\d+)/, 2)
                    let addrs = BibleConstantHelper.generateAddressesTpE(book, chap, ps[0], ps[1])
                    appendAddrs(addrs)
                } else if (it.tp == 'f') {
                    let addrs = BibleConstantHelper.generateAddressesTpF(book, parseInt(it.descExcludeBook))
                    appendAddrs(addrs)
                }
            }

            return { w: w, refAddresses: reAddr }
        }
    }

    /**
     * 
     * @param {DAddress} addrDefault 
     * @returns {DAddress}
     */
    function makeSureAddrExist(addrDefault) {
        if (addrDefault == undefined) {
            addrDefault = { book: 1, chap: 1, verse: 1 }
        } else {
            if (addrDefault.book == undefined) { addrDefault.book = 1 }
            if (addrDefault.chap == undefined) { addrDefault.chap = 1 }
        }
        return addrDefault
    }
    /**
     * '殘忍 2 #約12:21|' 的 2 會被誤判為 reference，因為曾考慮 約2，表示第2章。有了這個，會把純數字誤判轉為純文字。
     * @param {(DText|DRefs)[]} data 
     */
    function removeTpf(data) {
        // 去除 type f 而把純數字誤判為 ref 的東西。例如 殘忍 2 #約12:21| ，其實2不是 reference，凡「純數字」並沒有「約一」這些book字眼，則要轉換為 {w} 純文字的 DText

        for (let i = 0; i < data.length; i++) {
            const it = data[i];
            if (it.refs == undefined) { continue }

            let isInsertNew = false // while true 過程，可能會插入資料在 i 之前
            // assert it refs [ ] exist
            while (true) {
                if (it.refs.length == 0) {
                    break;
                }

                // 如果第1個是，則與「上一個 w」結合。上一個可能是refs exist嗎？可能，上一個若有 | 作為結尾。
                /** @type {DRef} */
                const it2 = it.refs[0]
                if (it2.tp != 'f' || it2.book != undefined) {
                    break // break while true
                }

                // 下面共用的函式
                let insertNewDTextWAndDeleteTypeF = () => {
                    data.splice(i, 0, { w: it2.descExcludeBook })
                    it.refs.splice(0, 1)
                    isInsertNew = true
                }


                if (i == 0) { // 2出現在句子第1組
                    insertNewDTextWAndDeleteTypeF()
                } else {
                    // assert i != 0
                    if (data[i - 1].refs != undefined) { // 前一組不是 {w:} ，所以無法合併。但又是 refs. (可能是 | 結尾)。因此要新增一個 {w}
                        insertNewDTextWAndDeleteTypeF()
                    } else if (data[i - 1].w != undefined) {
                        data[i - 1].w = data[i - 1].w + it2.descExcludeBook
                        it.refs.splice(0, 1)
                    } else {
                        // 其它狀況，其實也是新增一個 {w}
                        insertNewDTextWAndDeleteTypeF()
                    }
                }
            }

            if (it.refs.length == 0) {
                // 因為移動，最後變成這個不再有資料時
                if (isInsertNew) {
                    data.splice(i + 1, 1)
                } else {
                    data.splice(i, 1)
                }
                i--
            } else {
                if (isInsertNew) {
                    i--
                }
            }
        }
    }
    /**
     * '殘忍 2 失望 #約12:21|' 若沒這個，會變為 '殘忍 2' '失望' '#約12:21|' 三組。有了這個，就會變為 '殘忍 2失望' '#約12:21|' 兩組。
     * @param {(DText|DRefs)[]} data 
     */
    function connectPureStringCauseOfTypeFRemove(data) {
        // merge pure w ... 因為上一步，去除 f type 而造成的，例如， 殘忍 2 失望 #約12:21|。若沒有這個，會變為 殘忍 2、失望、#約12:21| 3個部分，但是，經過這段處理，會變為 殘忍 2 失望、#約12:21| 2個部分。
        for (let i = 0; i < data.length; i++) {
            if (i == 0) { continue }
            if (data[i].w == undefined) { continue }
            if (data[i - 1].w == undefined) { continue }
            data[i - 1].w = data[i - 1].w + data[i].w
            data.splice(i, 1)
            i--
        }
    }
    /**
     * @param {DRef[]} data 
     * @returns 
     */
    function merge(data) {
        /** @type {(DText|DRefs)[]} */
        let re = []
        let getReLast = () => re[re.length - 1]
        for (let i = 0; i < data.length; i++) {
            const it = data[i];
            if (it.descExcludeBook == undefined) {
                re.push(it)
            } else {
                // assert( it.desc != null )
                let pushNewRefs = () => {
                    let r1 = new DRefs()
                    r1.refs.push(it)
                    re.push(r1)
                }

                if (i == 0 || data[i - 1].descExcludeBook == undefined) {
                    pushNewRefs()
                } else if (it.isS) {
                    // assert i != 0
                    pushNewRefs()
                } else if (data[i - 1].isE) {
                    // assert i != 0
                    pushNewRefs()
                } else {
                    // assert i != 0
                    // assert it before is ref
                    // assert it is ref
                    getReLast().refs.push(it)
                }
            }
        }
        return re
    }
    /**
     * 最核心，找每個部分，但還沒有merge。
     * @param {string}} str 
     * @returns {DRef[]}
     */
    function findRefernece(str) {
        // https://bible.fhl.net/new/allreadme.html

        // default book:45, chap:2

        // 下面的 abcde 是 regex 中，的 or 順序
        //d 31:12
        //c 31:12-14
        //a 31:12-32:12
        //d 31:12,15,17
        //c 31:12-15,18,19-31
        //f 12 (x) 羅12章？羅2:12節？ … 章
        //f 約12 (v) 約12章
        //e 4-12 4到12節
        //b 31:12-end
        //b 31:12-e
        //d 31:12,15-17,20

        let r2 = Enumerable.from(BibleConstant.CHINESE_BOOK_ABBREVIATIONS).concat(BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB).distinct().orderByDescending(a1 => a1.length).toArray()
        let r3 = '(' + r2.join('|') + ')'

        let reg = new RegExp("(#)?" + r3 + "?((\\d+:\\d+-\\d+:\\d+)|(\\d+:\\d+-e(?:nd)?)|(\\d+:\\d+-\\d+[\\d,\\-]*)|(\\d+:\\d+[\\d,-]*)|(\\d+-\\d+)|(\\d+))(;)?(\\|)?", "g")

        //let reg = /#?(?:約|羅)?(\d+:\d+-\d+:\d+|\d+:\d+-e(?:nd)?|\d+:\d+-\d+[\d,\-]*|\d+:\d+[\d,-]*|\d+-\d+|\d+);?\|?/g
        // console.log(reg); // Hint 從上一行，轉為 RegExp ，先 log 後，再copy 裡面的 source。就會把 \d 變為 \\d，這樣才會對。

        let r1 = splitStringByRegex(str, reg)
        if (r1 == null) {
            return null
        } else {
            /** @type {DRef[]} */
            let re = []
            for (const it of r1) {
                if (it.exec == null) {
                    re.push({ w: it.w })
                } else {
                    re.push(toDRef(it))
                }
            }
            return re
        }

        /**
         * 
         * @param {{w?:string, exec?:RegExpExecArray}} it 
         * @returns {DRef}
         */
        function toDRef(it) {
            /** @type {DRef} */
            let re = {}
            re.w = it.exec[0]

            if (it.exec[1] != undefined) {
                re.isS = true
            }
            if (it.exec[11] != undefined) {
                re.isE = true
            }
            if (it.exec[10] != undefined) {
                re.isC = true
            }

            if (it.exec[2] != undefined) {
                let bk = BibleConstantHelper.getBookId(it.exec[2])
                if (bk != -1) {
                    re.book = bk
                }
            }

            re.descExcludeBook = it.exec[3]

            /** @type {Object.<() => boolean, string>} */
            // let tpDetermine = {}
            // tpDetermine[()=>it.exec[4] != undefined] = 'a'
            // tpDetermine[()=>it.exec[5] != undefined] = 'b'
            // tpDetermine[()=>it.exec[6] != undefined] = 'c'
            // tpDetermine[()=>it.exec[7] != undefined] = 'd'
            // tpDetermine[()=>it.exec[8] != undefined] = 'e'
            // tpDetermine[()=>it.exec[9] != undefined] = 'f'
            let idx = Enumerable.range(0, 6).firstOrDefault(i => it.exec[i + 4] != undefined)
            if (idx != undefined) { re.tp = String.fromCharCode('a'.charCodeAt(0) + idx) }

            return re
        }
    }
    function DRef() {
        /** @type {number} */
        this.book
        /** @type {'a'|'b'|'c'|string} */
        this.tp
        /** @type {boolean} 表示，有#符號在頭，s: start */
        this.isS
        /** @type {boolean} 表示，有|符號在尾，e: end */
        this.isE
        /** @type {boolean} 表示，有;符號，c: continue */
        this.isC
        /** @type {string} 不包含book名稱的描述 */
        this.descExcludeBook
        /** @type {string} 原始資料 */
        this.w
    }

    function DRefs() {
        /** @type {DRef[]} */
        this.refs = []
    }
}

