/// <reference path="./DataOfDictOfFhl.d.ts" />
/// <reference path="./../ijnjs/DText.d.ts" />

let ISnDictionary = ISnDictionaryEs6Js()
export {ISnDictionary, ISnDictionaryEs6Js}

function ISnDictionaryEs6Js() {
    /**
     * 取得資料
     * @param {{sn:string,isOld:boolean}} param 
     * @returns {Promise<DataOfDictOfFhl>}
     */
    ISnDictionary.prototype.queryAsync = function (param) { throw new Error("this is a abstract function.") }
    /**
     * 將資料轉換為 DText[]
     * @param {DataOfDictOfFhl} dataOfFhl 
     * @returns {DText[]}
     */
    ISnDictionary.prototype.cvtToDTexts = function (dataOfFhl) { throw new Error("this is a abstract function.") }
    return ISnDictionary
    /**
     * 將會有 Twcb 版的實作、Cbol 版的實作
     * SnDictOfTwcb SnDictOfCbol
     * @interface
     */
    function ISnDictionary() { }
}

