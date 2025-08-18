export function linq_distinct(data) {
    return Array.from(new Set(data));
}
export function linq_range(start = 0, count = 10, delta = 1) {
    var re = [];
    for (var i = 0; i < count; i++) {
        re.push(start + i * delta);
    }
    return re;
}

/**
 * @param {Array<any>} data 
 * @param {function} keySelector 
 * @returns {Map}
 */
export function linq_group_by(data, keySelector) {
    // - 用 Map 才能以 number 為 key，若用 { } 會被轉為文字。
    return data.reduce((acc, item) => {
        const key = keySelector(item);

        if (!acc.has(key)) {
            acc.set(key, []);
        }
        acc.get(key).push(item);
        
        return acc;
    }, new Map());
}
export function linq_order_by(data, keySelector) {
    // - 如果 data 是 Map 要另外處理
    if (data instanceof Map) {
        throw new Error("Map 不支援排序");
    }

    return data.sort((a, b) => {
        const keyA = keySelector(a);
        const keyB = keySelector(b);
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });
}
/**
 * @param {Array<any>} data 
 * @param {function} keySelector 
 * @returns {Array<any>}
 */
export function linq_order_by_descending(data, keySelector) {
    return data.sort((a, b) => {
        const keyA = keySelector(a);
        const keyB = keySelector(b);
        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;
        return 0;
    });
}