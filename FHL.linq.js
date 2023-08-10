var FHL = FHL || {};
/**
 * 
 * @param {number} i 
 * @param {number} count 
 * @param {number} delta 
 */
FHL.linq_range = function(start = 0, count = 10, delta = 1) {
    var re = [];
    var r1 = 0;
    var r2 = start;
    while (r1 < count) {
        re.push(r2);
        if (r1 === count) {
            break;
        }
        r2 += delta;
        r1++;
    }
    return re;
};
/**
 * [0] or undefined
 * @param {T[]} data 
 * @param {(a1:T)=>boolean} predicate 
 */
FHL.linq_first = function(data, predicate = undefined) {
    if (predicate === undefined) {
        if (data === undefined || data.length === 0) {
            return undefined;
        }
        return data[0];
    }

    for (const it of data) {
        if (predicate(it)) {
            return it;
        }
    }
    return undefined;
};
/**
 * data[length-1] or undefined
 * @param {T[]} data 
 * @param {(a1:T)=>boolean} predicate 
 */
FHL.linq_last = function(data, predicate = undefined) {
    if (data === undefined || data.length === 0) {
        return undefined;
    }

    if (predicate === undefined) {
        return data[data.length - 1];
    } else {
        for (i = data.length - 1; i > -1; --i) {
            if (predicate(data[i])) {
                return data[i];
            }
        }
        return undefined;
    }
};
/**
 * @param {T[]} data
 */
FHL.linq_distinct = function(data) {
    const r1 = [];
    for (const it of data) {
        const r2 = FHL.linq_first(r1, a1 => a1 === it);
        if (r2 === undefined) {
            r1.push(it);
        }
    }
    return r1;
};
/**
 * 在data中，有沒有obj這個東西，用 [].includes() 函式實作。
 * @param {T[]} data
 * @param {(a1:T)=>boolean} predicate
 */
FHL.linq_contains = function(data, obj) {
    return data.includes(obj);
};
/**
 * data中所有條件都要符合。用 js的 [].every() 函式實作
 * @param {T[]} data
 * @param {(a1:T)=>boolean} predicate
 */
FHL.linq_all = function(data, predicate) {
    return data.every(predicate);
};
/**
 * 只要data其中一個符合即可。用js的 [].some() 函式實作。
 * @param {T[]} data
 * @param {(a1:T)=>boolean} predicate
 */
FHL.linq_any = function(data, predicate) {
    return data.some(predicate);
};