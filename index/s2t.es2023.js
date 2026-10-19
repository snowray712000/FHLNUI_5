/**
 * # 簡體 → 繁體 (逐字)
 * 給 seaf.php (使徒教父搜尋) 用：上游經文是繁體，不處理簡體關鍵字，gb=1 也無效。
 * 對照表 index/s2t.json 由 npm run gen:s2t 產生 (和合本、新譯本的繁簡逐字對齊)，
 * 簡體字本身也是常用繁體字的 (后、里、干…) 不收，所以不會把繁體的「皇后」變成「皇後」。
 */

/** @type {Map<string, string> | null} */
let table = null

/**
 * 設定對照表 (載入後、或測試時)
 * @param {{simp: string, trad: string}} data simp[i] → trad[i]
 */
export function setS2tTable(data) {
    const s = Array.from(data.simp), t = Array.from(data.trad)
    if (s.length != t.length) throw new Error(`s2t 對照表長度不同: ${s.length} ≠ ${t.length}`)
    table = new Map(s.map((c, i) => [c, t[i]]))
}

/** 對照表有沒有載入 */
export function isS2tLoaded() { return table != null }

/** @type {Promise<void> | null} */
let loading = null

/**
 * 載入對照表 (只載入一次；失敗下次可再試)。路徑相對於頁面 (dist/ 也是)
 * @param {string} [url]
 */
export function loadS2tAsync(url = './index/s2t.json') {
    if (table != null) return Promise.resolve()
    loading ??= (async () => {
        const { fetchJsonAsync } = await import('./fetchAsync.es2023.js')
        setS2tTable(await fetchJsonAsync(url))
    })()
    loading.catch(() => { loading = null })
    return loading
}

/**
 * 簡體字轉繁體；沒載入對照表、或沒有對應的字，原樣保留
 * @param {string} str
 * @returns {string}
 */
export function toTraditional(str) {
    if (table == null || !str) return str
    let changed = false
    const out = Array.from(str, c => {
        const t = table.get(c)
        if (t == null) return c
        changed = true
        return t
    })
    return changed ? out.join('') : str
}
