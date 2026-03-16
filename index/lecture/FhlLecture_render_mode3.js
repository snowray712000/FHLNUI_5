// <div#lecMain>
//     <div.vercol>
//     <div.lec>...第1節內容...</div>
//     <div.lec>...第2節內容...</div>
//     <div.lec>...</div>
//     </div>
//     <div.vercol>
//     <div.lec>...</div>
//     <div.lec>...</div>
//     <div.lec>...</div>
//     </div>
//     <div#div_copyright.vercol>...</div>
// </div>

/**
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").TpResultBibleText} TpResultBibleText
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").TpOneRecordBibleText} TpOneRecordBibleText
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").DAddress} DAddress
 */

import { FhlLecture_render_mode1_and_mode3 } from "./FhlLecture_render_mode3_1.js"

/**
 * @param {TpResultBibleText[]} rspApp 
 * @returns {JQuery<HTMLElement>} htmlContent
 */
export async function FhlLecture_render_mode3(rspApp) {
    return await FhlLecture_render_mode1_and_mode3(rspApp, 3)
}
