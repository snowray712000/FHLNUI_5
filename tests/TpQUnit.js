/**
 * QUnit Assert 類型定義
 */
export class TpAssert {
    /**
     * 寬鬆相等斷言
     * @param {*} actual - 實際值
     * @param {*} expected - 期望值
     * @param {string} [message] - 斷言訊息
     */
    equal(actual, expected, message) {}

    /**
     * 嚴格相等斷言
     * @param {*} actual - 實際值
     * @param {*} expected - 期望值
     * @param {string} [message] - 斷言訊息
     */
    strictEqual(actual, expected, message) {}

    /**
     * 深度相等斷言
     * @param {*} actual - 實際值
     * @param {*} expected - 期望值
     * @param {string} [message] - 斷言訊息
     */
    deepEqual(actual, expected, message) {}

    /**
     * 基本斷言
     * @param {*} state - 要檢查的狀態
     * @param {string} [message] - 斷言訊息
     */
    ok(state, message) {}

    /**
     * 寬鬆不相等斷言
     * @param {*} actual - 實際值
     * @param {*} expected - 期望值
     * @param {string} [message] - 斷言訊息
     */
    notEqual(actual, expected, message) {}

    /**
     * 嚴格不相等斷言
     * @param {*} actual - 實際值
     * @param {*} expected - 期望值
     * @param {string} [message] - 斷言訊息
     */
    notStrictEqual(actual, expected, message) {}

    /**
     * 深度不相等斷言
     * @param {*} actual - 實際值
     * @param {*} expected - 期望值
     * @param {string} [message] - 斷言訊息
     */
    notDeepEqual(actual, expected, message) {}

    /**
     * 拋出例外斷言
     * @param {Function} block - 要執行的函數
     * @param {string|RegExp|Function} [expected] - 期望的錯誤
     * @param {string} [message] - 斷言訊息
     */
    throws(block, expected, message) {}

    /**
     * 設定預期的斷言數量
     * @param {number} amount - 預期斷言數量
     */
    expect(amount) {}

    /**
     * 非同步測試控制
     * @param {number} [acceptCallCount] - 接受的回調次數
     * @returns {Function} done 函數
     */
    async(acceptCallCount) {}

    /**
     * 記錄步驟
     * @param {string} message - 步驟訊息
     */
    step(message) {}

    /**
     * 驗證步驟
     * @param {string[]} steps - 預期的步驟
     * @param {string} [message] - 斷言訊息
     */
    verifySteps(steps, message) {}

    /**
     * 設定超時時間
     * @param {number} duration - 超時毫秒數
     */
    timeout(duration) {}

    /**
     * 推送斷言結果
     * @param {Object} result - 斷言結果物件
     */
    pushResult(result) {}
}

/**
 * QUnit 主要類型定義
 */
export class TpQUnit {
    /**
     * 定義測試模組
     * @param {string} name - 模組名稱
     * @param {Function} [nested] - 嵌套函數
     */
    module(name, nested) {}

    /**
     * 定義測試案例
     * @param {string} name - 測試名稱
     * @param {function(TpAssert):void} fn - 測試函數
     */
    test(name, fn) {}

    /**
     * 手動開始測試
     */
    start() {}

    /**
     * 停止測試
     */
    stop() {}

    /**
     * 設定預期的斷言數量
     * @param {number} amount - 預期斷言數量
     */
    expect(amount) {}

    /**
     * 基本斷言 (全域方法)
     * @param {*} state - 要檢查的狀態
     * @param {string} [message] - 斷言訊息
     */
    ok(state, message) {}

    /**
     * 寬鬆相等斷言 (全域方法)
     * @param {*} actual - 實際值
     * @param {*} expected - 期望值
     * @param {string} [message] - 斷言訊息
     */
    equal(actual, expected, message) {}

    /**
     * 深度相等斷言 (全域方法)
     * @param {*} actual - 實際值
     * @param {*} expected - 期望值
     * @param {string} [message] - 斷言訊息
     */
    deepEqual(actual, expected, message) {}

    /**
     * 非同步測試控制 (全域方法)
     * @param {number} [acceptCallCount] - 接受的回調次數
     * @returns {Function} done 函數
     */
    async(acceptCallCount) {}

    /**
     * 配置物件
     * @type {Object}
     */
    config = {};

    /**
     * 版本號
     * @type {string}
     */
    version = '';
}

/** @type {TpQUnit} */
const QUnit = window.QUnit;