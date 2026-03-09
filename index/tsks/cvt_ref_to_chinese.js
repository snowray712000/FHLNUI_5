
import { BibleConstant } from "./../../index/BibleConstant.es2023.js";

/**
 * 將 ref 字串中的英文書卷縮寫轉為中文（繁/簡、簡稱/全名）
 * @param {string} ref
 * @param {boolean} [isgb=false] true=簡體
 * @param {boolean} [isfullname=false] true=全名，false=簡稱
 * @returns {string}
 * @example
 * cvt_ref_to_chinese("# Job 26:14; Ps 33:6; 104:30; Isa 40:12-14|")
 * // => "# 伯 26:14; 詩 33:6; 104:30; 賽 40:12-14|"
 */
export function cvt_ref_to_chinese(ref, isgb = false, isfullname = false) {
    if (typeof ref !== "string" || ref.trim() === "") return ref;

    const enBooks = BibleConstant.ENGLISH_BOOK_SHORT_ABBREVIATIONS;
    const zhBooks = isfullname
        ? (isgb ? BibleConstant.CHINESE_BOOK_NAMES_GB : BibleConstant.CHINESE_BOOK_NAMES)
        : (isgb ? BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB : BibleConstant.CHINESE_BOOK_ABBREVIATIONS);

    const normalize = (s) => String(s).replace(/\s+/g, "").replace(/\./g, "").toLowerCase();
    const map = new Map(enBooks.map((b, i) => [normalize(b), zhBooks[i]]));

    const convertClause = (clause) => {
        const c = String(clause).trim();
        if (!c) return c;

        // 找出「開頭到第一個數字之前」作為書卷候選
        // 例: "Isa 40:12-14" => "Isa "
        // 例: "1 Jo 1:1" => "1 Jo "
        const m = c.match(/^(.+?)(?=\d)/);
        if (!m) return c; // 開頭就是數字，通常是承接前一書卷，不處理

        const bookPart = m[1].trim();
        const key = normalize(bookPart);
        const zh = map.get(key);
        if (!zh) return c;

        const rest = c.slice(m[1].length).trimStart();
        return rest ? `${zh} ${rest}` : zh;
    };

    const convertInnerRef = (inner) =>
        String(inner)
            .split(/\s*;\s*/g)
            .map(convertClause)
            .join("; ")
            .trim();

    // 優先只處理 #...| 區段
    const hasRefToken = /#\s*[^|]*\|/.test(ref);
    if (hasRefToken) {
        return ref.replace(/#\s*([^|]*?)\s*\|/g, (_, inner) => {
            const converted = convertInnerRef(inner || "");
            return `# ${converted}|`;
        });
    }

    // 若傳入不是 #...| 格式，則嘗試直接轉換整段
    return convertInnerRef(ref);
}