/// <reference path="./DataOfDictOfFhl.d.ts" />
/// <reference path="./DText.js" />
/**
 * 將會有 Twcb 版的實作、Cbol 版的實作
 * SnDictOfTwcb SnDictOfCbol
 * @interface
 */
interface ISnDictionary {
    queryAsync(param:{sn:string,isOld:boolean}):Promise<DataOfDictOfFhl>
    cvtToDTexts(dataOfFhl: DataOfDictOfFhl): DText[]
}

