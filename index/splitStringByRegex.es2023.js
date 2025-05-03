import { matchGlobalWithCapture } from './matchGlobalWithCapture.es2023.js';
/**
 * 若沒有符合，回傳 null
 * @param {string} str 
 * @param {RegExp} reg 若不是 global 會自動被設為 global, 否則會無窮迴圈
 * @returns {{w:string, exec?: RegExpExecArray}[]}
 */
export function splitStringByRegex(str, reg) {
    const r1 = matchGlobalWithCapture(reg, str);
    if (r1 == null || r1.length == 0) { return null }

    const data = []; //const data: { w: string; exec?: RegExpExecArray }[] = [];

    if (r1.length === 0) {
        data.push({
            w: str
        });
    } else {
        if (r1[0].index > 0) {
            var w = str.substr(0, r1[0].index);
            data.push({
                w
            });
        }

        for (let i = 0; i < r1.length; i++) {
            var it = r1[i];
            var len = it[0].length;
            data.push({
                w: it[0],
                exec: it
            });

            // tslint:disable-next-line: max-line-length
            var w = (i !== r1.length - 1) ? str.substr(it.index + len, r1[i + 1].index - it.index - len) : str.substr(it.index + len, str.length - it.index - len);
            if (w.length !== 0) {
                data.push({
                    w
                });
            }
        }
    }
    return data;
}

// function splitStringByRegexEs6Js() {
//     // let matchGlobalWithCapture = matchGlobalWithCaptureEs6Js()
//     return splitStringByRegex
//     /**
//      * 若沒有符合，回傳 null
//      * @param {string} str 
//      * @param {RegExp} reg 若不是 global 會自動被設為 global, 否則會無窮迴圈
//      * @returns {{w:string, exec?: RegExpExecArray}[]}
//      */
//     function splitStringByRegex(str, reg) {
//         var r1 = matchGlobalWithCapture(reg, str);
//         if (r1 == null || r1.length == 0) { return null }

//         var data = []; //const data: { w: string; exec?: RegExpExecArray }[] = [];

//         if (r1.length === 0) {
//             data.push({
//                 w: str
//             });
//         } else {
//             if (r1[0].index > 0) {
//                 var w = str.substr(0, r1[0].index);
//                 data.push({
//                     w
//                 });
//             }

//             for (let i = 0; i < r1.length; i++) {
//                 var it = r1[i];
//                 var len = it[0].length;
//                 data.push({
//                     w: it[0],
//                     exec: it
//                 });

//                 // tslint:disable-next-line: max-line-length
//                 var w = (i !== r1.length - 1) ? str.substr(it.index + len, r1[i + 1].index - it.index - len) : str.substr(it.index + len, str.length - it.index - len);
//                 if (w.length !== 0) {
//                     data.push({
//                         w
//                     });
//                 }
//             }
//         }
//         return data;
//     }
// }