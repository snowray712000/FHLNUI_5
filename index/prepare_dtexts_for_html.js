import { assert } from "./assert_es2023.js";
import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";

/**
 * @param {DTextsWithAddr[][]} dtexts_with_addr
 * @returns {DText[]} 
 */
export function prepare_dtexts_for_html(dtexts_with_addr, tp) {
    // tp1: 最簡單，不合併。原模式。這函數負責，將 addr 變成 "路 6:37" 並且具有 ref 格式。每個中間再加 br


    if (tp == 1) {
        return build_easily(dtexts_with_addr);
    } else if (tp == 2) {
        // dtexts_with_addr 的 [:][0,1,2] 是 address, 若是連讀的(跨章，就算連續，也視為不連)
        return build_continuous(dtexts_with_addr);
    }

    assert(false, `prepare_dtexts_for_html 尚未實作 tp=${tp}`);
}
/**
 * @param {DTextsWithAddr} dtexts_with_addr 
 * @returns {DText[]}
 */
function build_continuous(dtexts_with_addr) {
    /**
     * @type {DText[]}
     */
    const dtexts = []

    // 例如 [40,1,2],[40,1,3],[40,1,4],[40,2,1]
    // 就會變成 2 2的經文 3 3的經文 4 4的經 (太1:2-4) <br/> 1 1的經文 (太2:1)
    // 並且 2 3 4 會是 {isRef:1, refAddresses: [addrs]} 的格式，但這裡單節，則是產生整章的經文。(因為要看上下文)
    // 而，太1:2-4 會是 {isRef:1, refAddresses: [addr1,addr2,addr3]} 的格式
    

    if (dtexts_with_addr.length === 0) {
        return dtexts;
    }

    let startBook = dtexts_with_addr[0][0];
    let startChap = dtexts_with_addr[0][1];
    let startVerse = dtexts_with_addr[0][2];
    let endBook = startBook;
    let endChap = startChap;
    let endVerse = startVerse;

    const continuousAddrs = [];

    const dtext_space = { w: " " };
    for (let i = 0; i < dtexts_with_addr.length; i++) {
        const data = dtexts_with_addr[i];
        const book = data[0];
        const chap = data[1];
        const verse = data[2];
        const dtext_contents = data[3];

        // 加入經節號
        const book_na = BibleConstantHelper.getBookNameArrayChineseShort()[book - 1];
        const verse_str = `${verse}`;
        const verse_ref = { w: verse_str, refDescription: `${book_na}:${chap}`, isRef: 1, refAddresses: BibleConstantHelper.generateAddressesTpF(book,chap) };
        dtexts.push(verse_ref);
        dtexts.push(dtext_space);

        // 加入經文內容
        for (const dt of dtext_contents) {
            if (dt.tpContainer != null) {
                dtexts.push(structuredClone(dt));
                continue;
            }
            dtexts.push(dt);
        }

        // 累積地址
        endBook = book;
        endChap = chap;
        endVerse = verse;
        continuousAddrs.push({ book, chap, verse });

        // 檢查是否為最後一筆或下一筆不連續
        const isLast = i === dtexts_with_addr.length - 1;
        const nextDisconnected = !isLast &&
            (dtexts_with_addr[i + 1][0] !== endBook ||
                dtexts_with_addr[i + 1][1] !== endChap ||
                dtexts_with_addr[i + 1][2] !== endVerse + 1);

        if (isLast || nextDisconnected) {
            // 生成合併的地址範圍
            const bookName = BibleConstantHelper.getBookNameArrayChineseShort()[startBook - 1];
            let addr_str;

            if (startBook === endBook && startChap === endChap && startVerse === endVerse) {
                addr_str = `(${bookName}${startChap}:${startVerse})`;
            } else if (startBook === endBook && startChap === endChap) {
                addr_str = `(${bookName}${startChap}:${startVerse}-${endVerse})`;
            } else if (startBook === endBook) {
                addr_str = `(${bookName}${startChap}:${startVerse}-${endChap}:${endVerse})`;
            } else {
                addr_str = `(${bookName}${startChap}:${startVerse}-${BibleConstantHelper.getBookNameArrayChineseShort()[endBook - 1]}${endChap}:${endVerse})`;
            }

            const dtext_addr = { w: addr_str, refDescription: addr_str, isRef: 1, refAddresses: structuredClone( continuousAddrs) };
            dtexts.push(dtext_addr);

            dtexts.push({ isBr: 1 });

            // 重設下一個範圍
            if (!isLast) {
                startBook = dtexts_with_addr[i + 1][0];
                startChap = dtexts_with_addr[i + 1][1];
                startVerse = dtexts_with_addr[i + 1][2];
                continuousAddrs.length = 0;
            }
        }
    }

    // 移除最後一個 br
    if (dtexts.length > 0 && dtexts[dtexts.length - 1].isBr === 1) {
        dtexts.pop();
    }

    return dtexts;
}
/**
 * @param {DTextsWithAddr[][]} dtexts_with_addr 
 * @returns {DText[]}
 */
function build_easily(dtexts_with_addr) {
    /**
     * @type {DText[]}
     */
    const dtexts = []

    for (const data of dtexts_with_addr) {
        const book_na = BibleConstantHelper.getBookNameArrayChineseShort()[data[0] - 1]; // 書名
        const addr_str = `${book_na} ${data[1]}:${data[2]}`;
        const addrs = BibleConstantHelper.generateAddressesTpF(data[0], data[1]); // 產生整章，這樣點擊了，才能有上下文。

        const dtext_addr = { w: addr_str, refDescription: addr_str, isRef: 1, refAddresses: addrs };
        const dtext_space = { w: " " };
        dtexts.push(dtext_addr, dtext_space);

        for (const dt of data[3]) {
            if (dt.tpContainer != null) {
                dtexts.push(structuredClone(dt));
                continue;
            }
            dtexts.push(dt);
        }

        dtexts.push({ isBr: 1 });
        // 路 6:37 {<2532>}你們不要<3361>論斷
    }
    // 移除最後一個 br
    if (dtexts.length > 0 && dtexts[dtexts.length - 1].isBr == 1) {
        dtexts.pop();
    }
    return dtexts;
}

