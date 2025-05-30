import { loadAndDecompressJsonGzAsync } from './loadAndDecompressJsonGzAsync.es2023.js';


// [[1, 1, 1, "上帝的創造"], [1, 2, 4, "創造的另一記載"], [1, 3, 1, "人違背命令"], [1, 3, 14, "上帝的宣判"], [1, 3, 22, "亞當和夏娃被趕出伊甸園"]]
/**
 * 建議在 index.js 中，就先使用 ParagraphData.s.isReadyAndStartingIfNeed() 來確保資料已經準備好。
 */
export class ParagraphData {
    static _s = null
    /**
     * @returns {ParagraphData}
     */
    static get s() {
        if (this._s == null) {
            this._s = new ParagraphData();
        }
        return this._s;
    }
    isReadyAndStartingIfNeed() { 
        if (this._data == null) {
            this._getDataAsync();
            return false; // 尚未準備好
        }
        return true;
    }

    async _getDataAsync() {
        if (this._data == null) {
            // 這裡的路徑是相對於 index.html 的路徑
            // ncv 新譯本, csb 中文標準譯本, rcuv 和合本2010
            this._data = await loadAndDecompressJsonGzAsync("./index/paragraphs_ncv.json.gz");
        }
    }
    /**
     * @returns {Array<number|string>>} [[1, 1, 1, "上帝的創造"], [1, 2, 4, "創造的另一記載"], [1, 3, 1, "人違背命令"], [1, 3, 14, "上帝的宣判"], [1, 3, 22, "亞當和夏娃被趕出伊甸園"]]
     */
    get data() {
        if (this._data == null) {
            throw new Error("ParagraphData 尚未準備好，請先呼叫 isReadyAndStartingIfNeed() 或 getDataAsync()");
        }
        return this._data.paragraphs;
    }
}