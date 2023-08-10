/// <reference path="./matchGlobalWithCapture.es6.js" />
/// <reference path="../libs/jsdoc/linq.d.ts" />

import { matchGlobalWithCaptureEs6Js } from "./matchGlobalWithCapture.es6.js"
import Enumerable from "https://cdnjs.cloudflare.com/ajax/libs/linq.js/4.0.0/linq.min.js"


let splitBtw = splitBtwEs6Js()
export { splitBtw, splitBtwEs6Js }

function splitBtwEs6Js() {
    let matchGlobalWithCapture = matchGlobalWithCaptureEs6Js()

    return splitBtw
    /**
     * @param {string} str 
     * @param {{reg1:()=>RegExp,reg2:()=>RegExp}} regs 
     * @returns {DText[]|null}
     */
    function splitBtw(str, regs) {

        // 0,3,s ... 6.3.e "abc345cba"
        // 1,3,s ... 7,3,e "0abc456cba",
        // 1,3,s ... 7,3,e
        // 1,3,s ... 6,3,s ... 11,3,e ... 17,3,s ... 22,3,e ... 28,3,e "0abc45abc90cba456abc01cba567cba1"
        // 
        // 7,3,e
        // 1,3,s ... 6,3,e ... 12,3,s ... 18,3,e "0abc45cba901abc567cba"
        // 1,3,s ... 4,3,s ... 9,3,e ... 13,3,e "0abcabc78cbacba"
        let pos = findDPos()
        if (pos == null || pos.length == 0) { return null }
        // console.log(pos);

        let pairs = findPair(pos)
        // console.log(pairs);
        if (pairs == null || pairs.length == 0) { return null }

        return generateDText(pairs)

        /** @returns {DPos[]} */
        function findDPos() {
            let reg1 = regs.reg1()
            let reg2 = regs.reg2()

            let r1 = matchGlobalWithCapture(reg1, str).map(a1 => {
                return {
                    i: a1.index,
                    cnt: a1[0].length,
                    tp: 0
                }
            })

            if (r1.length == 0) { return null }
            let r2 = matchGlobalWithCapture(reg2, str).map(a1 => {
                return {
                    i: a1.index,
                    cnt: a1[0].length,
                    tp: 1
                }
            })

            return Enumerable.from(r1).concat(r2).orderBy(a1 => a1.i).toArray()
        }

        /** 
         * @param {DPos[]} pos
         * @param {DPair?} parent
         * @returns {DPair[]} */
        function findPair(pos, parent) {
            let is = -1
            let ie = -1
            let cnt = 0 // 為避免 tp=1時，就以為找到一對了，但其實是下一層的結尾，所以需要這個變數
            /** @type {DPair[]} */
            let re = []

            for (let i = 0; i < pos.length; i++) {
                const it = pos[i];
                if (it.tp == 0) { cnt = cnt + 1 }
                if (it.tp == 1 && cnt > 0) { cnt = cnt - 1 }

                if (is == -1) {
                    if (it.tp == 0) {
                        is = i
                    }
                } else if (ie == -1 && cnt == 0) {
                    ie = i
                    /** @type {DPair} */
                    let one = { s: pos[is], e: pos[ie] }
                    if (parent != undefined) { one.p = parent }

                    if (ie != is + 1) { // 有 children

                        let pos2 = Enumerable.range(is + 1, ie - is - 1).select(i2 => pos[i2]).toArray()
                        let children = findPair(pos2, one)
                        if (children != null) one.children = children
                    }
                    re.push(one)

                    is = -1 // reset 下一組
                    ie = -1
                }
            }

            if (re.length == 0) { return null }
            return re
        }

        /** 
         * @param {DPair[]} pairs
         * @returns {DText[]} */
        function generateDText(pairs) {
            /** @type {DText[]} */
            let re = []
            // 0,3,s ... 6.3.e "abc345cba"
            // 1,3,s ... 6,3,s ... 11,3,e ... 17,3,s ... 22,3,e ... 28,3,e "0abc45abc90cba456abc01cba567cba1"
            // 1,3,s ... 6,3,e ... 12,3,s ... 18,3,e "0abc45cba901abc567cba"
            // 1,3,s ... 4,3,s ... 9,3,e ... 13,3,e "0abcabc78cbacba"
            for (let i = 0; i < pairs.length; i++) {
                const it = pairs[i];
                if (i == 0) {
                    if (it.p == undefined) {
                        let w = str.substring(0, it.s.i)
                        if (w.length > 0)
                            re.push({ w: w })
                    } else {
                        let w = str.substring(it.p.s.i + it.p.s.cnt, it.s.i)
                        if (w.length > 0)
                            re.push({ w: w })
                    }
                }


                {
                    let one = {}

                    let w = str.substring(it.s.i, it.s.i + it.s.cnt)
                    let w2 = str.substring(it.e.i, it.e.i + it.e.cnt)
                    one.w = w
                    one.w2 = w2
                    one.tpContainer = w

                    if (it.children == undefined) {
                        let w = str.substring(it.s.i + it.s.cnt, it.e.i)
                        one.children = [{ w: w }]
                    } else {
                        let re2 = generateDText(it.children)
                        one.children = re2
                    }

                    re.push(one)
                }

                // 與上一個 end
                if (i != pairs.length - 1) {
                    // // 1,3,s ... 6,3,e ... 12,3,s ... 18,3,e "0abc45cba901abc567cba"
                    // 就是中間 6,3,e ~ 12,3,s
                    let itn = pairs[i + 1] // n: next
                    let w = str.substring(it.e.i + it.e.cnt, itn.s.i)
                    if (w.length != 0) {
                        re.push({ w: w })
                    }
                }

                if (i == pairs.length - 1) {
                    // 0,3,s ... 6.3.e "abc345cba"
                    // 1,3,s ... 6,3,s ... 11,3,e ... 17,3,s ... 22,3,e ... 28,3,e "0abc45abc90cba456abc01cba567cba1"
                    // 1,3,s ... 6,3,e ... 12,3,s ... 18,3,e "0abc45cba901abc567cba"
                    // 1,3,s ... 4,3,s ... 9,3,e ... 13,3,e "0abcabc78cbacba"
                    if (it.p == undefined) {
                        let w = str.substring(it.e.i + it.e.cnt)
                        if (w.length != 0) {
                            re.push({ w: w })
                        }
                    } else {
                        let w = str.substring(it.e.i + it.e.cnt, it.p.e.i)
                        if (w.length != 0)
                            re.push({ w: w })
                    }
                }
            }

            return re
        }
    }
    /**
     * @interface DPos
     */
    function DPos() {
        /** @type {number} */
        this.i
        /** @type {number} */
        this.cnt
        /** @type {0|1} */
        this.tp
    }
    function DPair() {
        /** @type {DPos} */
        this.s
        /** @type {DPos} */
        this.e
        /** @type {DPair[]} */
        this.children
        /** @type {DPair} */
        this.p
    }
}