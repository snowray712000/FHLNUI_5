/**
 * 歷史記錄的 📌 釘選 (純函式，不碰 DOM，好測試)
 * - 釘的單位是「章」(book + chap)；sec 只是那章最後看到的節，所以釘了雅5:1，看到雅5:2，仍是同一個釘，節會跟著更新
 * - 釘住的不被「超過上限」擠掉、不被「清除記錄」清掉
 * - 資料存在歷史的每一筆 `pin: number` (釘的時間，顯示時釘住的依它排序，不隨瀏覽順序跳動)
 * @typedef {{book:number; chap:number; sec:number; pin?:number}} HistoryItem
 */

export const HISTORY_MAX = 24

/** @param {HistoryItem} a @param {{book:number; chap:number}} b */
const sameChap = (a, b) => a.book == b.book && a.chap == b.chap

/**
 * 新到一個位置：同章舊的拿掉 (釘住的狀態帶過來，節更新)，放到最前面，
 * 超過上限時從最舊的「沒釘」開始丟
 * @param {HistoryItem[]} datas
 * @param {{book:number; chap:number; sec:number}} addr
 * @param {number} [max]
 * @returns {HistoryItem[]}
 */
export function pushAddress(datas, addr, max = HISTORY_MAX) {
    const old = datas.find(a => sameChap(a, addr))
    /** @type {HistoryItem} */
    const item = { book: addr.book, chap: addr.chap, sec: addr.sec }
    if (old?.pin) item.pin = old.pin
    const r = [item, ...datas.filter(a => !sameChap(a, addr))]
    for (let i = r.length - 1; i >= 1 && r.length > max; i--) {
        if (!r[i].pin) r.splice(i, 1)
    }
    return r
}

/**
 * 釘 / 拔掉 某章
 * @param {HistoryItem[]} datas
 * @param {{book:number; chap:number}} addr
 * @param {number} [now] 釘的時間 (測試用)
 * @returns {HistoryItem[]} 新陣列 (順序不變，所以 idx 不變)
 */
export function togglePin(datas, addr, now = Date.now()) {
    const used = new Set(datas.map(a => a.pin))
    return datas.map(a => {
        if (!sameChap(a, addr)) return a
        const { pin, ...rest } = a
        if (pin) return rest
        let t = now
        while (used.has(t)) t++ // 同一毫秒不會有，保險
        return { ...rest, pin: t }
    })
}

/**
 * 清除記錄：只留目前這個 ([0]) 與釘住的，順序不變 (目前的仍是 [0])
 * @param {HistoryItem[]} datas
 */
export function clearKeepPinned(datas) {
    return datas.filter((a, i) => i == 0 || a.pin)
}

/**
 * 顯示順序：釘住的在前 (依釘的先後)，其餘照原順序。idx 是在 datas 中的位置 (點擊時要用，因為顯示順序不等於 datas 順序)
 * @param {HistoryItem[]} datas
 * @returns {{item: HistoryItem; idx: number}[]}
 */
export function displayOrder(datas) {
    const all = datas.map((item, idx) => ({ item, idx }))
    const pinned = all.filter(a => a.item.pin).sort((a, b) => a.item.pin - b.item.pin)
    return [...pinned, ...all.filter(a => !a.item.pin)]
}
