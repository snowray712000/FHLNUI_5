// TODO: 這個檔案可以進一步重構，但先確認原本功能正常再說
import { splitStringByRegex } from './splitStringByRegex.es2023.js'
import { BibleConstant } from './BibleConstant.es2023.js'
import { BibleConstantHelper } from './BibleConstantHelper.es2023.js'

// 使用 IIFE 模式，讓這個檔案可以獨立運行
const { splitReference } = (()=>{
    /**
     * input 是 string 時，可能會回傳 null，也是原本的核心功能
     * input 是 DText[] 時，一定回傳 DText[]，因為本質應該也是 splitReference 管理，所以重構放在這裡
     * @param {string|DText[]} str 
     * @param {DAddress} addrDefault
     * @returns {?DText[]}
     */
    function splitReference(str, addrDefault) {
        if (Array.isArray(str)) {
            return splitWhenDTextsInput(str, addrDefault)
        } else {
            return splitWhenStringInput(str, addrDefault)
        }
    }
    
    /**
     * 核心，即原本的 split reference 
     * @param {string} str 
     * @param {DAddress} addrDefault 
     * @returns {?DText[]}
     */
    function splitWhenStringInput(str, addrDefault) {
    
        let re = findRefernece(str)
    
        if (re == null) {
            return null
        }
    
        let re2 = merge(re)
        removeTpf(re2)
        connectPureStringCauseOfTypeFRemove(re2)
    
        // 將 refs 轉為經節
        addrDefault = makeSureAddrExist(addrDefault)
        let re3 = cvtToDTexts(re2, addrDefault)
        return re3
    }
    /**
     * 原本在 twcbflow 中的，但 cbolflow 也會用，所以抽出來
     * @param {DText[]} dtexts 
     * @param {DAddress} addrDefault 
     * @returns {DText[]}
     */
    function splitWhenDTextsInput(dtexts, addrDefault) {
        // if (dtexts == null ){throw Error("assert data not null.")}
    
        let re = []
        for (const it of dtexts) {
            if (it.tpContainer != null) {
                let r3 = splitWhenDTextsInput(it.children)
                it.children = r3
                re.push(it)
                continue
            }
    
            // assert ( it.tpContainer == null )
    
            if (it.w == null || it.w.length == 0) {
                re.push(it)
                continue
            }
    
            let r2 = splitWhenStringInput(it.w, addrDefault)
            if (r2 == null) { // 沒有任何符合
                re.push(it)
            } else {
                for (const it2 of r2) {
                    re.push(it2)
                }
            }
        }
        return re
    }
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
        if (data == null) { throw Error('assert data is not null.') }
    
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
    
        // 這個變數，會有2處共用，1個是分割書卷，1個是原字串
        let r2 = Enumerable.from(BibleConstant.CHINESE_BOOK_ABBREVIATIONS)
            .concat(BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB)
            .concat(BibleConstant.CHINESE_BOOK_NAMES)
            .concat(BibleConstant.CHINESE_BOOK_NAMES_GB)
            .concat(BibleConstant.ENGLISH_BOOK_SHORT_ABBREVIATIONS)
            .concat(BibleConstant.ENGLISH_BOOK_ABBREVIATIONS)
            .concat(BibleConstant.ENGLISH_BOOK_NAMES)
            .distinct().orderByDescending(a1 => a1.length).toArray()
        let r3 = '(' + r2.join('|') + ')' // 書卷名
    
        // 這是原本的流程
        // 書卷名允許後面1個空白 r3?「 ?」，另外，空白也可能是&nbsp;
        let reg = new RegExp("(#)?" + r3 + "?(?: |&nbsp;)?((\\d+:\\d+-\\d+:\\d+)|(\\d+:\\d+-e(?:nd)?)|(\\d+:\\d+-\\d+[\\d,\\-]*)|(\\d+:\\d+[\\d,-]*)|(\\d+-\\d+)|(\\d+))(;)?(\\|)?", "g")
    
        //let reg = /#?(?:約|羅)?(\d+:\d+-\d+:\d+|\d+:\d+-e(?:nd)?|\d+:\d+-\d+[\d,\-]*|\d+:\d+[\d,-]*|\d+-\d+|\d+);?\|?/g
        // console.log(reg); // Hint 從上一行，轉為 RegExp ，先 log 後，再copy 裡面的 source。就會把 \d 變為 \\d，這樣才會對。
    
        // 新增的步驟
        let str2 = splitByBook(str)
    
        // 使用 doOneBook, 對每一個 字串 處理
        return doEachAndPushToContain()
    
    
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
                let bk = BibleConstantHelper.getBookId(it.exec[2].toLocaleLowerCase())
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
    
        /**
         * 先以書卷名切開，因為面對了，1Ti的1會被前一個用到。
         * @param {string} str 
         * @returns {string[]}
         */
        function splitByBook(str) {
            //let reg2 = new RegExp("#?" + r3 + "\\s*(?:\\d+:\\d+-\\d+-\\d+|\\d+:\\d+-\\d+|\\d+:\\d+|\\d+-\\d+|\\d+)", 'g')
            let reg2 = new RegExp("(#)?" + r3, 'g')
            let rr1 = splitStringByRegex(str, reg2)
    
            let re2 = []
            if (rr1 == null) {
                re2.push(str) // 原本的值
            } else {
                let w = rr1[0].w
                for (let i = 1; i < rr1.length; i++) {
                    const aa1 = rr1[i];
                    if (aa1.exec == null) {
                        w += aa1.w
                    } else {
                        re2.push(w)
                        w = aa1.w
                    }
                }
                if (w.length != 0) {
                    re2.push(w)
                }
            }
            return re2
        }
        /**
         * 原本的流程，但因為多了 splitByBook，現在要各別字串去處理
         * @param {string} str 
         * @returns {DText[]|null}
         */
        function doOneBook(str) {
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
        }
        /**
         * 
         * @returns {DText[]}
         */
        function doEachAndPushToContain() {
            let isAnyFit = false
            let dtexts = []
            const reg3 = /^\s+$/g // 全都是空白字元, 略過
            for (const a1 of str2) {
                let reDtexts = doOneBook(a1)
                if (reDtexts != null) {
                    for (const a2 of reDtexts) {
                        if (a2.w != null && false == reg3.test(a2.w)) {
                            dtexts.push(a2)
                            isAnyFit = true
                        }
                    }
                } else {
                    dtexts.push({ w: a1 })
                }
            }
    
            return isAnyFit ? dtexts : null
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

    return { splitReference }
})(); 

export { splitReference }  