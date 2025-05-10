import { BibleConstant } from "./BibleConstant.es2023.js";
export function getBookFunc(func, bookName) {
    var i;
    // 2016.11, 簡體中文, 會取出 null, 修正完畢
    for (i = 0; i < book.length; i++) {
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
            for (i = 0; i < bookEng.length; i++)
                if (bookEng[i] == bookName)
                    break;
            ret = i;
            break;
        case "bookFullName":
            ret = (pageState.gb == 1) ? bookFullName2[i] : bookFullName[i];
            break;
        case "bookChapters":
            ret = bookChapters[i];
            break;
        case "bookEng":
            ret = bookEng[i];
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
