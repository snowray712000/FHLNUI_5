/**
 * b1c1v1w12
 * c1v1w12
 * v1w12
 * if w = -1 ， 就沒有 w。
 * @param {number[]} address [book,chap,sec]
 * @param {numer} wid -1
 * @param {0|1|2|3} tpAddress 
 */
export function ai_get_bcvw(address, wid = -1, tpAddress) {
    const widstr = wid == -1 ? '' : `w${wid}`

    if (tpAddress <= 0) {
        return widstr
    } else if (tpAddress == 1) {
        return `v${address[2]}${widstr}`
    } else if (tpAddress == 2) {
        return `c${address[1]}v${address[2]}${widstr}`
    }
 
    return `b${address[0]}c${address[1]}v${address[2]}${widstr}`
}