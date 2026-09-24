import { loadAndDecompressJsonGzAsync } from "./loadAndDecompressJsonGzAsync.es2023.js";

/**
 * # 基底類別，提供載入 JSON 檔案的功能
 * - 繼承者，要過載 path_json 屬性，提供檔案路徑。
 * - 繼承者，以 BaseJson._getInstance(...) 實作 get s() 屬性，提供 singleton 的實例。
 * - 繼承者，以 _filecontent 實作 filecontent 屬性，主要是 typedef 它的回傳型別，方便使用者
 */

export class BaseJson {
  static #instances = new Map(); // 用來儲存所有的實例

  // 提供給子類別的 get s() 用的
  static _getInstance(className) {
    if (!this.#instances.has(className)) {
      this.#instances.set(className, new className());
    }
    return this.#instances.get(className);
  }

  #filecontent = null; // 檔案內容
  /** @type {Promise<void>|null} 載入中的 promise，讓同時多處呼叫 loadAsync 只下載一次 */
  #loading = null;

  constructor() {
    if (this.constructor === BaseJson) {
      throw new Error("BaseJson 不能被實例化");
    }
    this.#filecontent = null; // 檔案內容
  }

  /**
   * 子類別需覆寫此屬性，提供檔案路徑
   * @returns {string} 檔案路徑
   */
  get path_json() {
    throw new Error("子類別必須實作 path_json");
  }

  /**
   * 可重複呼叫：已載入就直接結束，載入中就等同一個 promise。
   * 失敗時（loadAndDecompressJsonGzAsync 回傳 undefined）清掉 promise，下次呼叫會重試。
   */
  loadAsync() {
    if (this.#filecontent !== null) return Promise.resolve();
    this.#loading ??= loadAndDecompressJsonGzAsync(this.path_json).then((content) => {
      this.#filecontent = content ?? null;
      if (this.#filecontent === null) this.#loading = null;
    });
    return this.#loading;
  }

  /**
   * 定義你的 get filecontent，並加注解
   */
  get _filecontent() {
    return this.#filecontent ?? null;
  }
}
