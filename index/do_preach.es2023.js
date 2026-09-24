import { TPPageState } from "./TPPageState.es2023.js";
import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";

export function do_preach(ps, dom) {
    var dom2 = document.getElementById("fhlInfoContent");
    if (dom2 != null) {
        const book = ps.bookIndex;
        const engs = BibleConstantHelper.getBookNameArrayEnglishNormal()[book - 1];

        const frame = new preach_api.Frame(dom2, {
            "book": book,
            "engs": engs,
            "chap": ps.chap,
            "sec": ps.sec,
            "onset": function (engs, chap, sec) {
                frame.setProps({ "engs": engs, "chap": chap, "sec": sec });
            },
            "isgb": ps.gb
        });
    }
}
