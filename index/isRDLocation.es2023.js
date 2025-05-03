/**
 * 因為有 ajax 有 cross-domain 問題，所以需要虛擬資料
 * 
 * @returns {boolean}
 */
export function isRDLocation() {
    return location.origin === 'file://' || location.hostname === '127.0.0.1' || location.hostname === 'localhost';
}


// function isRDLocationEs6Js() {
//     return isRDLocation
//     /**
//      * 因為有 ajax 有 cross-domain 問題，所以需要虛擬資料
//      *
//      * @returns {boolean}
//      */
//     function isRDLocation() {
//         return location.origin === 'file://' || location.hostname === '127.0.0.1' || location.hostname === 'localhost' ;
//     }
// }