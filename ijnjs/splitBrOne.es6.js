/// <reference path="./DText.d.ts" />

import { splitStringByRegexEs6Js } from "./splitStringByRegex.es6.js"

let splitBrOne = splitBrOneEs6Js()
export { splitBrOne, splitBrOneEs6Js }

function splitBrOneEs6Js() {
    let splitStringByRegex = splitStringByRegexEs6Js()

    return splitBrOne

    /**
     * @param {DText[]|string} data 
     * @returns {DText[]}
     */
    function splitBrOne(data) {
        if ( Array.isArray(data) == false ){
            // assert data is string
            return splitBrOne([{w:data}])
        }

        let re = []
        for (const it of data) {
            if (it.tpContainer == null) {
                let r2 = splitStringByRegex(it.w, /\r?\n/g)
                if (r2 == null) { // 沒有任何符合
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
}