import { Hash_DAddress } from "./Hash_DAddress_es2023.js";

/**
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").DAddress} DAddress
 * @typedef {import("./FhlLecture_render_mode_common_es2023.js").TpOneRecordBibleText} TpOneRecordBibleText
 */

/**
 * 原本用在 FhlLecture_render_mode3 裡面
 * @param {TpOneRecordBibleText[]} record 
 * @param {Array<number|string>} paragraphData [book, chap, sec, title]
 * @returns {Array} [[0,1,2], 0] 表示 record[0,1,2] 都屬於 paragraphData[0]。注意，段落若沒找到，則是用  -1
 */
export function grouping_by_paragraph(record, paragraphData) {
    if (record.length == 0) {
        return [];
    }
    if (paragraphData.length == 0) {
        // 都在 -1 組
        return [[record.map((a1, i) => i), -1]];
    }
    // 先假設，內容一定是同一章，同卷書
    // const paragraphData = [[1, 1, 1, "上帝的創造"], [1, 2, 4, "創造的另一記載"], [1, 3, 1, "人違背命令"], [1, 3, 14, "上帝的宣判"], [1, 3, 22, "亞當和夏娃被趕出伊甸園"]]

    // 1. 維持原本 record 的順序 (例如，以後可能用到搜尋結果，或交互參照，就不會把原本的引用順序打亂)


    const paragraph_hash = paragraphData.map(a1 => Hash_DAddress.toHash(a1))

    const record_hash = record.map(a1 => Hash_DAddress.toHash(a1))

    // 每一個 record 屬於哪個 段落 i -> j (i hash 第一次 >= hash of j，就屬於那個 j。若沒有找到，就放在 -1，概念上也不屬於最後一個段落，就是空段落)
    // TODO: 這個應該要用二分搜尋法，因為段落是有順序的
    // const belong_to_paragraph = record_hash.map( hash => {
    //     for (let i = 0; i < paragraph_hash.length; i++) {
    //         if (hash >= paragraph_hash[i]) {
    //             return i; // 找到就回傳 i
    //         }
    //     }
    //     return -1; // 若沒有找到，就放在 -1，概念上也不屬於最後一個段落，就是空段落
    // });

    // 使用二分搜尋法來找出每個 record 屬於哪個段落
    const belong_to_paragraph = record_hash.map(hash => {
        let left = 0;
        let right = paragraph_hash.length - 1;
        let result = -1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (hash >= paragraph_hash[mid]) {
                result = mid; // 暫存可能的結果，繼續向右搜尋
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return result; // 若找不到，預設為 -1
    });
    // console.log(belong_to_paragraph);

    // 2. 將 record 按照段落分組 [[0,1,2], [3,4], [5,6,7]]，每個子陣列代表一個段落的 record index
    const grouped_records = [];
    let current_paragraph_index = belong_to_paragraph[0];
    let current_group = [];
    for (let i = 0; i < belong_to_paragraph.length; i++) {
        if (belong_to_paragraph[i] === current_paragraph_index) {
            current_group.push(i);
        } else {
            grouped_records.push(current_group);
            current_paragraph_index = belong_to_paragraph[i];
            current_group = [i];
        }
    }
    if (current_group.length > 0) {
        grouped_records.push(current_group);
    }

    // 3. 轉換資料，例如 原本 [[0,1,2]] 變為 [[0,1,2], 0], [[3,4], 1], [[5,6,7], 2]，最後一個數字是段落的 index
    const result = grouped_records.map(a1 => {
        // [0,1,2] 就取 [0] 即 0, 然後從 belong_to_paragraph 取得對應的段落索引 
        const paragraph_index = belong_to_paragraph[a1[0]]; // 取得第一個 record 的段落索引
        return [a1, paragraph_index];
    })

    return result
}
