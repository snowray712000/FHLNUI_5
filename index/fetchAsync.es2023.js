// 取代 $.ajax 的 fetch 包裝。
// - 與 $.ajax 相同，HTTP 非 2xx 也當失敗（fetch 本身只有網路錯誤才 reject）。
// - timeout（毫秒）對應 $.ajax 的 timeout。
// - 一律先取文字再 JSON.parse：$.ajax 依回應的 Content-Type 決定要不要自動 parse，
//   這裡不看 Content-Type，呼叫端要物件就用 fetchJsonAsync。

/**
 * @param {string} url
 * @param {RequestInit & {timeout?: number}} [opt]
 * @returns {Promise<Response>}
 */
export async function fetchOkAsync(url, opt = {}) {
    const { timeout, ...init } = opt
    if (timeout != null) {
        init.signal = AbortSignal.timeout(timeout)
    }
    const response = await fetch(url, init)
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} ${url}`)
    }
    return response
}

/**
 * @param {string} url
 * @param {RequestInit & {timeout?: number}} [opt]
 * @returns {Promise<string>}
 */
export async function fetchTextAsync(url, opt) {
    return (await fetchOkAsync(url, opt)).text()
}

/**
 * @param {string} url
 * @param {RequestInit & {timeout?: number}} [opt]
 * @returns {Promise<any>}
 */
export async function fetchJsonAsync(url, opt) {
    return JSON.parse(await fetchTextAsync(url, opt))
}
