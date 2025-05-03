
/**
 * - interface, 將會給 SnDictOfTwcb 與 SnDictOfCbol 繼承
 */
export class ISnDictionary {
    /**
     * 取得資料
     * @param {{sn: string, isOld: boolean}} param
     * @returns {Promise<DataOfDictOfFhl>}
     * @throws {Error} 抽象方法，需由子類別實作
     */
    async queryAsync(param) {
        throw new Error("This is an abstract method and must be implemented by a subclass.");
    }

    /**
     * 將資料轉換為 DText[]
     * @param {DataOfDictOfFhl} dataOfFhl
     * @returns {DText[]}
     * @throws {Error} 抽象方法，需由子類別實作
     */
    cvtToDTexts(dataOfFhl) {
        throw new Error("This is an abstract method and must be implemented by a subclass.");
    }
}

