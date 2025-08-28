import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js"
import { ParagraphData } from "./ParagraphData_es2023.js"

/**
 * ### 看哪一段包含 addr，就回傳那一段
 * @param {number[]} addr 
 * @returns {number[][]}
 */
export function ai_get_address_paragraph(addr){
    // 先假設，內容一定是同一章，同卷書
    const paragraphData = ParagraphData.s.isReadyAndStartingIfNeed() ? ParagraphData.s.data : [[1, 1, 1, "上帝的創造"], [1, 2, 4, "創造的另一記載"], [1, 3, 1, "人違背命令"], [1, 3, 14, "上帝的宣判"], [1, 3, 22, "亞當和夏娃被趕出伊甸園"]]  

    const book = addr[0]
    const chap = addr[1]
    const sec = addr[2]

    // - e.g.
    //   - 1,1,1 回傳 0 ; 1,2,3 回傳 0 ; 1,2,4 回傳 1 ; 1,3,22 回傳 4
    // - 要 reverse 找
    const fnReverseIndex = () => {
        for (let i = paragraphData.length - 1; i >= 0; i--) {
            const a1 = paragraphData[i];
            if ( book > a1[0] ) return i
            if ( book < a1[0] ) continue

            if ( chap > a1[1] ) return i
            if ( chap < a1[1] ) continue
            
            if ( sec >= a1[2] ) return i
            if ( sec < a1[2] ) continue
        }
        return 0;
    }
    const idx = fnReverseIndex()
    
    // - 取回 i 到 i + 1 的 addresses
    const fnGetRanges = (start, end) => {
        const re1 = (start[1] == end[1])? BibleConstantHelper.generateAddressesTpE(start[0], start[1], start[2], end[2]) : BibleConstantHelper.generateAddressesTpA(start[0], start[1], start[2], end[1], end[2])
        const re2 = re1.map( a1=> [a1.book, a1.chap, a1.verse])
        // - 要拿掉最後一個，因為是 end not include
        re2.pop();

        return re2;
    }
    const addr_start = paragraphData[idx];
    const addr_end_not_include = (idx == paragraphData.length-1) ? [66,22,22] : paragraphData[idx+1];
    return fnGetRanges(addr_start, addr_end_not_include);
}