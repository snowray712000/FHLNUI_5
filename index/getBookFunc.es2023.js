import { BibleConstant } from "./BibleConstant.es2023.js";
import { TPPageState } from "./TPPageState.es2023.js";


export function getBookFunc(func, bookName) {
    var i;
    // 2016.11, 簡體中文, 會取出 null, 修正完畢
    for (i = 0; i < BibleConstant.CHINESE_BOOK_ABBREVIATIONS.length; i++) {
        if (BibleConstant.CHINESE_BOOK_ABBREVIATIONS[i] == bookName)
            break;
        if (BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB[i] == bookName)
            break;
    }

    let ret;
    switch (func) {
        case "index":
            ret = i;
            break;
        case "indexByEngs":
            for (i = 0; i < BibleConstant.ENGLISH_BOOK_ABBREVIATIONS.length; i++)
                if (BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[i] == bookName)
                    break;
            ret = i;
            break;
        case "bookFullName":
            ret = (TPPageState.s.gb == 1) ? BibleConstant.CHINESE_BOOK_NAMES_GB[i] : BibleConstant.CHINESE_BOOK_NAMES[i];
            break;
        case "bookChapters":
            assert(() => false, "bookChapters is not used");
            // ret = bookChapters[i];
            break;
        case "bookEng":
            ret = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[i];
            break;
        default:
            ret = "failed";
            break;
    }
    return ret;
}


// (function (root) {
//     root.getBookFunc = getBookFunc
//     return
// })(this)

// function getBookFunc(func, bookName) {
//     var i;
//     // 2016.11, 簡體中文, 會取出 null, 修正完畢
//     for (i = 0; i < book.length; i++) {
//         if (FHL.CONSTANT.Bible.CHINESE_BOOK_ABBREVIATIONS[i] == bookName)
//             break;
//         if (FHL.CONSTANT.Bible.CHINESE_BOOK_ABBREVIATIONS_GB[i] == bookName)
//             break;
//     }

//     var ret;
//     switch (func) {
//         case "index":
//             ret = i;
//             break;
//         case "indexByEngs":
//             for (i = 0; i < bookEng.length; i++)
//                 if (bookEng[i] == bookName)
//                     break;
//             ret = i;
//             break;
//         case "bookFullName":
//             ret = (pageState.gb == 1) ? bookFullName2[i] : bookFullName[i];
//             break;
//         case "bookChapters":
//             ret = bookChapters[i];
//             break;
//         case "bookEng":
//             ret = bookEng[i];
//             break;
//         default:
//             ret = "failed";
//             break;
//     }
//     return ret;
// }
