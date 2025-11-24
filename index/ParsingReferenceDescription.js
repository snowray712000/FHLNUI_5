import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { SmartDescriptEndParsing } from "./SmartDescriptEndParsing.js";
import { splitStringByRegex } from "./splitStringByRegex.es2023.js";
import { GetAddresses } from "./GetAddresses.js";
import { assert } from "./assert_es2023.js";

/**
 * @typedef {{book: number, chap: number, verse: number}} DAddress
 */

export class ParsingReferenceDescription {
    static #s = null
    /** @returns {ParsingReferenceDescription} */
    static get s() { if (this.#s == null) this.#s = new ParsingReferenceDescription(); return this.#s }

    /** @type {RegExp} */
    _regBookNames = null;
    /** @returns {RegExp} */
    get regBookNames() {
        if (this._regBookNames == null) {
            this.makeSureStaticExist()
        }
        return this._regBookNames;
    }

    constructor() {
        this.makeSureStaticExist();
    }

    /**
     * main
     * @param {string} strDescription
     * @param {{ book?: number, chap?: number }} [defaultAddress]
     * @returns {DAddress[]}
     */
    main(strDescription, defaultAddress) {

        // accept '.' as ';'        
        strDescription = (strDescription || '').replace(/\./g, ';');

        const defAddress = this.getDefaultAddress(defaultAddress);
        let re2 = []
        try {
            const re2b = this.splitBook2(strDescription, defAddress);
            re2 = re2b;
            // const re2 = this.splitBook(strDescription, defAddress);
            // console.warn("splitbook ver1 ver2");
            // console.log(JSON.stringify(re2));
            // console.log(JSON.stringify(re2b));            
        } catch (error) {
            console.warn(error.message);
            return [];
        }

        // 不能 return VerseRange, 這樣會 circular dependency.
        const reVerse = [];
        for (const it of re2) {
            // SmartDescriptEndParsing 可以修改描述尾部（例如處理 'e' 之類）
            const re3 = new SmartDescriptEndParsing().main(it.id, it.des);

            if (re3 != null) {
                it.des = re3;
            }

            const re4 = this.getAddressesOneBook(it);
            for (const a1 of re4) {
                reVerse.push(a1);
            }
        }

        // - 檢查所有地址是否合法，任何一個不合法，就全部不回傳
        if ( reVerse.some( addr => {
            if (addr.book < 1 || addr.book > 66) {
                console.warn("錯誤書卷 " + addr.book);
                return true; // 錯誤書卷
            }
            const maxChap = BibleConstantHelper.getCountChapOfBook(addr.book);
            if (addr.chap < 1 || addr.chap > maxChap) {
                console.warn(BibleConstantHelper.getBookNameArrayChineseFull()[addr.book-1] + " 沒有第 " + addr.chap + " 章");
                return true; // 錯誤章節
            }
            const maxVerse = BibleConstantHelper.getCountVerseOfChap(addr.book, addr.chap);
            if (addr.verse < 1 || addr.verse > maxVerse) {
                console.warn(BibleConstantHelper.getBookNameArrayChineseFull()[addr.book-1] + " " + addr.chap + " 沒有第 " + addr.verse + " 節");
                return true; // 錯誤節
            }
            return false;
        })){
            return [];
        }

        return reVerse;
    }

    /**
     * 把單一書卷的描述（可能包含分號 ;）轉成多個 DAddress
     * @param {{ id: number; des: string }} it
     * @returns {DAddress[]}
     */
    getAddressesOneBook(it) {
        const r1 = it.des.replace(/\s/g, '');
        const r2 = r1.split(';').filter(a1 => a1.length !== 0);

        if (r2.length !== 0) {
            const vrs = [];
            for (const it2 of r2) {
                const arg = { idbook: it.id, descript: it2 };
                for (const it3 of new GetAddresses(it.id).main(arg)) {
                    vrs.push(it3);
                }
            }
            return vrs;
        } else {
            const arg = { idbook: it.id, descript: '' };
            return new GetAddresses(it.id).main(arg);
        }
    }
    /**
     * 
     * @param {string} strDescription 
     * @param {{book:number, chap:number}} defAddress 
     * @returns {{ id: number; des: string }[]}
     */
    splitBook2(strDescription, defAddress) {
        const re2 = [];

        // - 不再使用 書卷名 切割 (splitBook)，例如「錯誤書名4:1-3」，會被切成「錯誤」「書」、「名4:1-3」
        // - 嘗試使用 4:1-3,5; 這些符號來切割
        let re = splitStringByRegex(strDescription, /[\d\-,:;]+/g);
        if (re == null) {
            re = [{ w: strDescription }];
        }

        // - 任何一個，不是 書卷名稱，也不是 範圍描述 的，就將這段描述視為錯誤，所有都不處理
        if ( re.some(it => {
            if (it.exec != null){
                return false
            }

            // - 開頭至結尾，都是書卷名稱
            // - 應該只會回傳 1 個，並且是書卷名
            // - 要 trim. 不然空白，會在下面 .length 誤判
            const bookname = splitStringByRegex((it.w || '').trim(), ParsingReferenceDescription.s.regBookNames)
            if ( bookname == null ){
                return true // 有非書卷名稱, 不正確
            }
            
            if ( bookname.length != 1 ){
                return true // 一個字串，竟然被切成多個書卷，不合理。例如「這是錯誤書卷」，就會被切為「這是錯誤」「書」「卷」
            }
            return false;
        })){
            throw new Error("這個字串不太正確 「" + strDescription + "」");
        }

        // - 處理 curDes
        let cur = defAddress.book;
        let curDes = '';
        
        for (const it of re) {
            if (it.exec != undefined) {
                // 文字片段：描述內容
                curDes += it.w;
            } else {
                // 見到下一個書名，先 push 前一個累積的描述（若有）
                if (curDes.length != 0) {
                    re2.push({ id: cur, des: curDes });
                }
                cur = BibleConstantHelper.getBookId(it.w.trim().toLowerCase());
                assert(cur != -1, `無法辨識的書卷名稱：「${it.w}」`);
                curDes = it.w;
            }
        }
        if (curDes.length !== 0) {
            re2.push({ id: cur, des: curDes });
        }
        
        return re2;        
    }

    /**
     * 將輸入字串依書卷名稱切分成多段 {id, des}
     * @param {string} strDescription
     * @param {{ book: number; chap: number }} defAddress
     * @returns {{ id: number; des: string }[]}
     */
    splitBook(strDescription, defAddress) {
        const re2 = [];

        // 把書卷與描述切出來。SplitStringByRegexVer2 會把書卷名稱當作 exec 項產出
        let re = splitStringByRegex(strDescription, ParsingReferenceDescription.s.regBookNames);
        if (re == null) {
            re = [{ w: strDescription }];
        }
        console.log(re);


        let cur = defAddress.book;
        let curDes = '';

        for (const it of re) {
            if (it.exec === undefined) {
                // 文字片段：描述內容
                curDes += it.w;
            } else {
                // 見到下一個書名，先 push 前一個累積的描述（若有）
                if (curDes.length !== 0) {
                    re2.push({ id: cur, des: curDes });
                }

                const id2 = BibleConstantHelper.getBookId(it.exec[0]?.toLowerCase())
                cur = id2 === -1 ? defAddress.book : id2;

                curDes = '';
            }
        }

        if (curDes.length !== 0) {
            re2.push({ id: cur, des: curDes });
        }

        return re2;
    }

    getDefaultAddress(defaultAddress) {
        const defAddress = { book: 40, chap: 1 };
        if (defaultAddress !== undefined) {
            if (defaultAddress.book !== undefined) {
                defAddress.book = defaultAddress.book;
            }
            if (defaultAddress.chap !== undefined) {
                defAddress.chap = defaultAddress.chap;
            }
        }
        return defAddress;
    }

    makeSureStaticExist() {
        if (this._regBookNames == null) {

            const names2id = BibleConstantHelper.getMapName2Id();
            const names = Object.keys(names2id);
            names.sort((a, b) => b.length - a.length);
            this._regBookNames = new RegExp(names.join('|'), 'gi');
        }
    }
}