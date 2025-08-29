/// <reference path="FHL.linq.js" />

var FHL = FHL || {};

function BibleConstant() { }

FHL.BibleConstant = BibleConstant;
/** @const {string[]} 零', '一', '二'... */
BibleConstant.prototype.CHINESE_NUMBERS = [
    '零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', '三十',
    '三十一', '三十二', '三十三', '三十四', '三十五', '三十六', '三十七', '三十八', '三十九', '四十',
    '四十一', '四十二', '四十三', '四十四', '四十五', '四十六', '四十七', '四十八', '四十九', '五十',
    '五十一', '五十二', '五十三', '五十四', '五十五', '五十六', '五十七', '五十八', '五十九', '六十',
    '六十一', '六十二', '六十三', '六十四', '六十五', '六十六', '六十七', '六十八', '六十九', '七十',
    '七十一', '七十二', '七十三', '七十四', '七十五', '七十六', '七十七', '七十八', '七十九', '八十',
    '八十一', '八十二', '八十三', '八十四', '八十五', '八十六', '八十七', '八十八', '八十九', '九十',
    '九十一', '九十二', '九十三', '九十四', '九十五', '九十六', '九十七', '九十八', '九十九', '一百',
    '一百零一', '一百零二', '一百零三', '一百零四', '一百零五', '一百零六', '一百零七', '一百零八', '一百零九', '一百一十',
    '一百一十一', '一百一十二', '一百一十三', '一百一十四', '一百一十五', '一百一十六', '一百一十七', '一百一十八', '一百一十九', '一百二十',
    '一百二十一', '一百二十二', '一百二十三', '一百二十四', '一百二十五', '一百二十六', '一百二十七', '一百二十八', '一百二十九', '一百三十',
    '一百三十一', '一百三十二', '一百三十三', '一百三十四', '一百三十五', '一百三十六', '一百三十七', '一百三十八', '一百三十九', '一百四十',
    '一百四十一', '一百四十二', '一百四十三', '一百四十四', '一百四十五', '一百四十六', '一百四十七', '一百四十八', '一百四十九', '一百五十'
];

/**
 * @typedef {"創"|"出"|"利"|"民"|"申"|"書"|"士"|"得"|"撒上"|"撒下"|"王上"|"王下"|"代上"|"代下"|"拉"|"尼"|"斯"|"伯"|"詩"|"箴"|"傳"|"歌"|"賽"|"耶"|"哀"|"結"|"但"|"何"|"珥"|"摩"|"俄"|"拿"|"彌"|"鴻"|"哈"|"番"|"該"|"亞"|"瑪"|"太"|"可"|"路"|"約"|"徒"|"羅"|"林前"|"林後"|"加"|"弗"|"腓"|"西"|"帖前"|"帖後"|"提前"|"提後"|"多"|"門"|"來"|"雅"|"彼前"|"彼後"|"約一"|"約二"|"約三"|"猶"|"啟"} TPCHINESE_BOOK_ABBREVIATIONS
 */

/** @const {TPCHINESE_BOOK_ABBREVIATIONS[]} '創', '出', '利'... */
BibleConstant.prototype.CHINESE_BOOK_ABBREVIATIONS = [
    '創', '出', '利', '民', '申',
    '書', '士', '得', '撒上', '撒下', '王上', '王下', '代上', '代下', '拉', '尼', '斯',
    '伯', '詩', '箴', '傳', '歌',
    '賽', '耶', '哀', '結', '但',
    '何', '珥', '摩', '俄', '拿', '彌', '鴻', '哈', '番', '該', '亞', '瑪',
    '太', '可', '路', '約',
    '徒',
    '羅', '林前', '林後', '加', '弗', '腓', '西', '帖前', '帖後', '提前', '提後', '多', '門',
    '來', '雅', '彼前', '彼後', '約一', '約二', '約三', '猶',
    '啟'
];

/**
 * @typedef {"创"|"出"|"利"|"民"|"申"|"书"|"士"|"得"|"撒上"|"撒下"|"王上"|"王下"|"代上"|"代下"|"拉"|"尼"|"斯"|"伯"|"诗"|"箴"|"传"|"歌"|"赛"|"耶"|"哀"|"结"|"但"|"何"|"珥"|"摩"|"俄"|"拿"|"弥"|"鸿"|"哈"|"番"|"该"|"亚"|"玛"|"太"|"可"|"路"|"约"|"徒"|"罗"|"林前"|"林后"|"加"|"弗"|"腓"|"西"|"帖前"|"帖后"|"提前"|"提后"|"多"|"门"|"来"|"雅"|"彼前"|"彼后"|"约一"|"约二"|"约三"|"犹"|"启"} TPCHINESE_BOOK_ABBREVIATIONS_GB
 */

/** @const {TPCHINESE_BOOK_ABBREVIATIONS_GB[]} '创', '出', '利',... */
BibleConstant.prototype.CHINESE_BOOK_ABBREVIATIONS_GB = [
    '创', '出', '利', '民', '申',
    '书', '士', '得', '撒上', '撒下', '王上', '王下', '代上', '代下', '拉', '尼', '斯',
    '伯', '诗', '箴', '传', '歌',
    '赛', '耶', '哀', '结', '但',
    '何', '珥', '摩', '俄', '拿', '弥', '鸿', '哈', '番', '该', '亚', '玛',
    '太', '可', '路', '约',
    '徒',
    '罗', '林前', '林后', '加', '弗', '腓', '西', '帖前', '帖后', '提前', '提后', '多', '门',
    '来', '雅', '彼前', '彼后', '约一', '约二', '约三', '犹',
    '启'
];

/**
 * @typedef {"創世記"|"出埃及記"|"利未記"|"民數記"|"申命記"|"約書亞記"|"士師記"|"路得記"|"撒母耳記上"|"撒母耳記下"|"列王紀上"|"列王紀下"|"歷代志上"|"歷代志下"|"以斯拉記"|"尼希米記"|"以斯帖記"|"約伯記"|"詩篇"|"箴言"|"傳道書"|"雅歌"|"以賽亞書"|"耶利米書"|"耶利米哀歌"|"以西結書"|"但以理書"|"何西阿書"|"約珥書"|"阿摩司書"|"俄巴底亞書"|"約拿書"|"彌迦書"|"那鴻書"|"哈巴谷書"|"西番雅書"|"哈該書"|"撒迦利亞書"|"瑪拉基書"|"馬太福音"|"馬可福音"|"路加福音"|"約翰福音"|"使徒行傳"|"羅馬書"|"哥林多前書"|"哥林多後書"|"加拉太書"|"以弗所書"|"腓立比書"|"歌羅西書"|"帖撒羅尼迦前書"|"帖撒羅尼迦後書"|"提摩太前書"|"提摩太後書"|"提多書"|"腓利門書"|"希伯來書"|"雅各書"|"彼得前書"|"彼得後書"|"約翰壹書"|"約翰貳書"|"約翰參書"|"猶大書"|"啟示錄"} TPCHINESE_BOOK_NAMES
*/

/** @const {TPCHINESE_BOOK_NAMES[]} '創世記', '出埃及記', '利未記', ,... */
BibleConstant.prototype.CHINESE_BOOK_NAMES = [
    '創世記', '出埃及記', '利未記', '民數記', '申命記',
    '約書亞記', '士師記', '路得記', '撒母耳記上', '撒母耳記下', '列王紀上', '列王紀下', '歷代志上', '歷代志下', '以斯拉記', '尼希米記', '以斯帖記',
    '約伯記', '詩篇', '箴言', '傳道書', '雅歌',
    '以賽亞書', '耶利米書', '耶利米哀歌', '以西結書', '但以理書',
    '何西阿書', '約珥書', '阿摩司書', '俄巴底亞書', '約拿書', '彌迦書', '那鴻書', '哈巴谷書', '西番雅書', '哈該書', '撒迦利亞書', '瑪拉基書',
    '馬太福音', '馬可福音', '路加福音', '約翰福音',
    '使徒行傳',
    '羅馬書', '哥林多前書', '哥林多後書', '加拉太書', '以弗所書', '腓立比書', '歌羅西書',
    '帖撒羅尼迦前書', '帖撒羅尼迦後書', '提摩太前書', '提摩太後書', '提多書', '腓利門書',
    '希伯來書', '雅各書', '彼得前書', '彼得後書', '約翰壹書', '約翰貳書', '約翰參書', '猶大書',
    '啟示錄'
];

/**
 * @typedef {"创世记"|"出埃及记"|"利未记"|"民数记"|"申命记"|"约书亚记"|"士师记"|"路得记"|"撒母耳记上"|"撒母耳记下"|"列王纪上"|"列王纪下"|"历代志上"|"历代志下"|"以斯拉记"|"尼希米记"|"以斯帖记"|"约伯记"|"诗篇"|"箴言"|"传道书"|"雅歌"|"以赛亚书"|"耶利米书"|"耶利米哀歌"|"以西结书"|"但以理书"|"何西阿书"|"约珥书"|"阿摩司书"|"俄巴底亚书"|"约拿书"|"弥迦书"|"那鸿书"|"哈巴谷书"|"西番雅书"|"哈该书"|"撒迦利亚书"|"玛拉基书"|"马太福音"|"马可福音"|"路加福音"|"约翰福音"|"使徒行传"|"罗马书"|"哥林多前书"|"哥林多后书"|"加拉太书"|"以弗所书"|"腓立比书"|"歌罗西书"|"帖撒罗尼迦前书"|"帖撒罗尼迦后书"|"提摩太前书"|"提摩太后书"|"提多书"|"腓利门书"|"希伯来书"|"雅各书"|"彼得前书"|"彼得后书"|"约翰壹书"|"约翰贰书"|"约翰参书"|"犹大书"|"启示录"} TPCHINESE_BOOK_NAMES_GB
*/


/** @const {TPCHINESE_BOOK_NAMES_GB[]} '创世记', '出埃及记', '利未记',... */
BibleConstant.prototype.CHINESE_BOOK_NAMES_GB = [
    '创世记', '出埃及记', '利未记', '民数记', '申命记',
    '约书亚记', '士师记', '路得记', '撒母耳记上', '撒母耳记下', '列王纪上', '列王纪下', '历代志上', '历代志下', '以斯拉记', '尼希米记', '以斯帖记',
    '约伯记', '诗篇', '箴言', '传道书', '雅歌',
    '以赛亚书', '耶利米书', '耶利米哀歌', '以西结书', '但以理书',
    '何西阿书', '约珥书', '阿摩司书', '俄巴底亚书', '约拿书', '弥迦书', '那鸿书', '哈巴谷书', '西番雅书', '哈该书', '撒迦利亚书', '玛拉基书',
    '马太福音', '马可福音', '路加福音', '约翰福音',
    '使徒行传',
    '罗马书', '哥林多前书', '哥林多后书', '加拉太书', '以弗所书', '腓立比书', '歌罗西书',
    '帖撒罗尼迦前书', '帖撒罗尼迦后书', '提摩太前书', '提摩太后书', '提多书', '腓利门书',
    '希伯来书', '雅各书', '彼得前书', '彼得后书', '约翰壹书', '约翰贰书', '约翰参书', '犹大书',
    '启示录'
];

/**
 * @typedef {"Gen"|"Ex"|"Lev"|"Num"|"Deut"|"Josh"|"Judg"|"Ruth"|"1 Sam"|"2 Sam"|"1 Kin"|"2 Kin"|"1 Chr"|"2 Chr"|"Ezra"|"Neh"|"Esth"|"Job"|"Ps"|"Prov"|"Eccl"|"Song"|"Is"|"Jer"|"Lam"|"Ezek"|"Dan"|"Hos"|"Joel"|"Amos"|"Obad"|"Jon"|"Mic"|"Nah"|"Hab"|"Zeph"|"Hag"|"Zech"|"Mal"|"Matt"|"Mark"|"Luke"|"John"|"Acts"|"Rom"|"1 Cor"|"2 Cor"|"Gal"|"Eph"|"Phil"|"Col"|"1 Thess"|"2 Thess"|"1 Tim"|"2 Tim"|"Titus"|"Philem"|"Heb"|"James"|"1 Pet"|"2 Pet"|"1 John"|"2 John"|"3 John"|"Jude"|"Rev"} TPENGLISH_BOOK_ABBREVIATIONS
 */

/** @const {TPENGLISH_BOOK_ABBREVIATIONS[]} 'Gen', 'Ex', 'Lev', 'Num'... */
BibleConstant.prototype.ENGLISH_BOOK_ABBREVIATIONS = [
    'Gen', 'Ex', 'Lev', 'Num', 'Deut',
    'Josh', 'Judg', 'Ruth', '1 Sam', '2 Sam',
    '1 Kin', '2 Kin', '1 Chr', '2 Chr', 'Ezra', 'Neh', 'Esth',
    'Job', 'Ps', 'Prov', 'Eccl', 'Song',
    'Is', 'Jer', 'Lam', 'Ezek', 'Dan',
    'Hos', 'Joel', 'Amos', 'Obad', 'Jon', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal',
    'Matt', 'Mark', 'Luke', 'John',
    'Acts',
    'Rom', '1 Cor', '2 Cor', 'Gal', 'Eph', 'Phil', 'Col',
    '1 Thess', '2 Thess', '1 Tim', '2 Tim', 'Titus', 'Philem',
    'Heb', 'James', '1 Pet', '2 Pet', '1 John', '2 John', '3 John', 'Jude',
    'Rev'
];

/**
 * @typedef {"Genesis"|"Exodus"|"Leviticus"|"Numbers"|"Deuteronomy"|"Joshua"|"Judges"|"Ruth"|"1 Samuel"|"2 Samuel"|"1 Kings"|"2 Kings"|"1 Chronicles"|"2 Chronicles"|"Ezra"|"Nehemiah"|"Esther"|"Job"|"Psalms"|"Proverbs"|"Ecclesiastes"|"Song of Solomon"|"Isaiah"|"Jeremiah"|"Lamentations"|"Ezekiel"|"Daniel"|"Hosea"|"Joel"|"Amos"|"Obadiah"|"Jonah"|"Micah"|"Nahum"|"Habakkuk"|"Zephaniah"|"Haggai"|"Zechariah"|"Malachi"|"Matthew"|"Mark"|"Luke"|"John"|"Acts"|"Romans"|"1 Corinthians"|"2 Corinthians"|"Galatians"|"Ephesians"|"Philippians"|"Colossians"|"1 Thessalonians"|"2 Thessalonians"|"1 Timothy"|"2 Timothy"|"Titus"|"Philemon"|"Hebrews"|"James"|"1 Peter"|"2 Peter"|"1 John"|"2 John"|"3 John"|"Jude"|"Revelation"} TPENGLISH_BOOK_NAMES
 */

/** @const {TPENGLISH_BOOK_NAMES[]} 'Genesis', 'Exodus', 'Leviticus', ... */
BibleConstant.prototype.ENGLISH_BOOK_NAMES = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', 'First Samuel', 'Second Samuel',
    'First Kings', 'Second Kings', 'First Chronicles', 'Second Chronicles', 'Ezra', 'Nehemiah', 'Esther',
    'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
    'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    'Matthew', 'Mark', 'Luke', 'John',
    'Acts',
    'Romans', 'First Corinthians', 'Second Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
    'First Thessalonians', 'Second Thessalonians', 'First Timothy', 'Second Timothy', 'Titus', 'Philemon',
    'Hebrews', 'James', 'First Peter', 'Second Peter', 'First John', 'second John', 'Third John', 'Jude',
    'Revelation'
];

/**
 * @typedef {"Ge"|"Ex"|"Le"|"Nu"|"De"|"Jos"|"Jud"|"Ru"|"1Sa"|"2Sa"|"1Ki"|"2Ki"|"1Ch"|"2Ch"|"Ezr"|"Ne"|"Es"|"Job"|"Ps"|"Pr"|"Ec"|"So"|"Isa"|"Jer"|"La"|"Eze"|"Da"|"Ho"|"Joe"|"Am"|"Ob"|"Jon"|"Mic"|"Na"|"Hab"|"Zep"|"Hag"|"Zec"|"Mal"|"Mt"|"Mr"|"Lu"|"Joh"|"Ac"|"Ro"|"1Co"|"2Co"|"Ga"|"Eph"|"Php"|"Col"|"1Th"|"2Th"|"1Ti"|"2Ti"|"Tit"|"Phm"|"Heb"|"Jas"|"1Pe"|"2Pe"|"1Jo"|"2Jo"|"3Jo"|"Jude"|"Re"} TPENGLISH_BOOK_SHORT_ABBREVIATIONS
 */

/** @const {TPENGLISH_BOOK_SHORT_ABBREVIATIONS[]} 'Ge', 'Ex', 'Le',... */
BibleConstant.prototype.ENGLISH_BOOK_SHORT_ABBREVIATIONS = [
    'Ge', 'Ex', 'Le', 'Nu', 'De',
    'Jos', 'Jud', 'Ru', '1Sa', '2Sa',
    '1Ki', '2Ki', '1Ch', '2Ch', 'Ezr', 'Ne', 'Es',
    'Job', 'Ps', 'Pr', 'Ec', 'So', 'Isa', 'Jer', 'La', 'Eze', 'Da',
    'Ho', 'Joe', 'Am', 'Ob', 'Jon', 'Mic', 'Na', 'Hab', 'Zep', 'Hag', 'Zec', 'Mal',
    'Mt', 'Mr', 'Lu', 'Joh',
    'Ac',
    'Ro', '1Co', '2Co', 'Ga', 'Eph', 'Php', 'Col',
    '1Th', '2Th', '1Ti', '2Ti', 'Tit', 'Phm',
    'Heb', 'Jas', '1Pe', '2Pe', '1Jo', '2Jo', '3Jo', 'Jude',
    'Re'
];


/** @const {number[]} 50, 40, 27, 36, 34,... */
BibleConstant.prototype.COUNT_OF_CHAP = [
    50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25,
    29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52,
    5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4,
    28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4,
    5, 3, 6, 4, 3, 1, 13, 5,
    5, 3, 5, 1, 1, 1, 22
];
BibleConstant.prototype.BOOK_WHERE_1CHAP = [31,57,63,64,65]
/** @const {number[][]} 建議用 getCountVerseOfChap(book,chap), 例 太2節數 return COUNT_OF_VERSE[39][1] */
BibleConstant.prototype.COUNT_OF_VERSE = [
    [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
    [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
    [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
    [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13],
    [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12],
    [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33],
    [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25],
    [22, 23, 18, 22],
    [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13],
    [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25],
    [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53],
    [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
    [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
    [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
    [11, 70, 13, 24, 17, 22, 28, 36, 15, 44],
    [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31],
    [22, 23, 15, 17, 14, 14, 10, 17, 32, 3],
    [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17],
    [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6],
    [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31],
    [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14],
    [17, 17, 11, 16, 16, 13, 13, 14],
    [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24],
    [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
    [22, 22, 66, 22, 22],
    [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
    [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13],
    [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9],
    [20, 32, 21],
    [15, 16, 15, 13, 27, 14, 17, 14, 15],
    [21],
    [17, 10, 10, 11],
    [16, 13, 12, 13, 15, 16, 20],
    [15, 13, 19],
    [17, 20, 19],
    [18, 15, 20],
    [15, 23],
    [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
    [14, 17, 18, 6],
    [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
    [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20],
    [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53],
    [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
    [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31],
    [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27],
    [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24],
    [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14],
    [24, 21, 29, 31, 26, 18],
    [23, 22, 21, 32, 33, 24],
    [30, 30, 21, 23],
    [29, 23, 25, 18],
    [10, 20, 13, 18, 28],
    [12, 17, 18],
    [20, 15, 16, 16, 25, 21],
    [18, 26, 17, 22],
    [16, 15, 15],
    [25],
    [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25],
    [27, 26, 18, 17, 20],
    [25, 25, 22, 19, 14],
    [21, 22, 18],
    [10, 29, 24, 21, 21],
    [13],
    [14],
    [25],
    [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21]
];
/**
 * 取得章的數目
 * @param {*} book1based 太，傳40。用1based非0based
 */
BibleConstant.prototype.getCountChapOfBook = function (book1based) {
    if (book1based >= 1 && book1based <= 66) {
        return this.COUNT_OF_CHAP[book1based - 1];
    } else {
        console.error('Error Book id, must 1~66, you are ' + book1based);
        throw new Error('Error Book id, must 1~66');
    }
};
/**
 * 取得章的數目
 * @param {*} book1based 太，傳40。用1based非0based
 * @param {*} chap1based 
 */
BibleConstant.prototype.getCountVerseOfChap = function (book1based, chap1based) {
    var chaplimit = this.getCountChapOfBook(book1based);
    if (chap1based < 0 || chap1based > chaplimit) {
        console.error('book ' + book1based + ' chap ' + chap1based + ' only have ' + chaplimit + ' chap. you are ' + chap1based);
        throw new Error('book ' + book1based + ' chap ' + chap1based + ' only have ' + chaplimit + ' chap.');
    }
    return this.COUNT_OF_VERSE[book1based - 1][chap1based - 1];
};

/**
 * 不會跨書卷，每書卷的最後一節，都會是回傳 undfined
 * 若是最後一節，回傳 undefined
 * @param {{book:number,chap:number,verse:number}} addr
 * @returns {{book:number,chap:number,verse:number}}
 */
BibleConstant.prototype.getNextAddress = function (addr) {
    if (addr === undefined) {
        console.error('get next address, you are ' + addr);
        return undefined;
    }

    function cv(c, v) {
        return { book: addr.book, chap: c, verse: v };
    }

    if (addr.book === 66 && addr.chap === 22 && addr.verse === 21) {
        return undefined;
    }

    var cntChap = this.getCountChapOfBook(addr.book);
    if (addr.chap === cntChap) {
        var cntVerse = this.getCountVerseOfChap(addr.book, cntChap);
        if (addr.verse === cntVerse) {
            return undefined;
        }
        return cv(addr.chap, addr.verse + 1);
    }

    var cntVerse = this.getCountVerseOfChap(addr.book, addr.chap);
    if (addr.verse === cntVerse) {
        return cv(addr.chap + 1, 1);
    }
    return cv(addr.chap, addr.verse + 1);
};
/**
 * 取得章的數目
 * @param {*} book1based 太，傳40。用1based非0based
 * @param {*} chap1based 
 */
FHL.getCountVerseOfChap = function (book1based, chap1based) {
    return new BibleConstant().getCountVerseOfChap(book1based, chap1based);
};
/**
 * 取得章的數目
 * @param {*} book1based 太，傳40。用1based非0based
 */
FHL.getCountChapOfBook = function (book1based) {
    return new BibleConstant().getCountChapOfBook(book1based);
};
/**
 * 不會跨書卷，每書卷的最後一節，都會是回傳 undfined
 * 若是最後一節，回傳 undefined
 * @param {{book:number,chap:number,verse:number}} addr
 * @returns {{book:number,chap:number,verse:number}}
 */
FHL.getNextAddress = function (addr) {
    return new BibleConstant().getNextAddress(addr);
};
/**
 * 任何一個 undefined 都會視為不相同
 * @param {{book:number,chap:number,verse:number}} addr1
 * @param {{book:number,chap:number,verse:number}} addr2
 * @returns {boolean}
 */
FHL.isTheSameAddress = function (addr1, addr2) {
    if (addr1 === undefined || addr2 === undefined) {
        return false;
    }
    if (addr1.book !== addr2.book || addr1.chap !== addr2.chap || addr1.verse !== addr2.verse) {
        return false;
    }
    return true;
};



function BibleBookNames() {
    if (BibleBookNames.prototype.mapNa2Id === undefined) {
        initialMapAndNameArray();

        function initialMapAndNameArray() {
            var r1 = new BibleConstant();
            var r2 = [r1.CHINESE_BOOK_NAMES, r1.CHINESE_BOOK_NAMES_GB, r1.CHINESE_BOOK_ABBREVIATIONS, r1.CHINESE_BOOK_ABBREVIATIONS_GB, r1.ENGLISH_BOOK_ABBREVIATIONS, r1.ENGLISH_BOOK_NAMES, r1.ENGLISH_BOOK_SHORT_ABBREVIATIONS];

            /** @type {string[][]} re */
            var re = [];
            FHL.linq_range(1, 66).forEach(function (a1, i) {
                re.push([]);
            });

            r2.forEach(function (a1, i1) {
                a1.forEach(function (a2, i2) {
                    // 約一，簡體繁體長一樣，就不用丟2個。
                    var a2lower = a2.toLowerCase();
                    if (!FHL.linq_contains(re[i2], a2lower)) {
                        re[i2].push(a2lower);
                    }
                })
            });

            // 特殊中文字 / 別名
            var sp1 = [
                { id: 62, na: ['約壹', '约壹', '約翰壹書', '约翰壹书', '約翰一書', '约翰一书', '約一', '约一'] },
                { id: 63, na: ['約貳', '约贰', '約翰貳書', '约翰贰书', '約翰二書', '约翰二书', '約二', '约二'] },
                { id: 64, na: ['約參', '约参', '約翰參書', '约翰参书', '約翰三書', '约翰三书', '约三', '約三'] },
            ];
            sp1.forEach(function (a1) {
                var r1 = re[a1.id - 1];
                for (const it2 of a1.na) {
                    var it2lower = it2.toLowerCase();
                    if (!FHL.linq_contains(re[a1.id - 1], it2lower)) {
                        re[a1.id - 1].push(it2lower);
                    }
                }
            })


            var mapNa2Id = new Map();
            var arrayNamesOrderByLength = [];
            re.forEach(function (a1, i1) {
                a1.forEach(function (a2) {
                    mapNa2Id.set(a2, i1 + 1);
                    arrayNamesOrderByLength.push(a2);
                });
            });
            arrayNamesOrderByLength = arrayNamesOrderByLength.sort(function (a1, a2) { return a2.length - a1.length; });

            BibleBookNames.prototype.mapNa2Id = mapNa2Id;
            BibleBookNames.prototype.arrayNamesOrderByLength = arrayNamesOrderByLength;
        }
    }
}
/** @types {Map<string,number>} 英文一定是 lower case，has('創') and get('創') */
BibleBookNames.prototype.mapNa2Id = undefined;
/** @types {string[]} 英文是 lower case, 從字母長到短。這個資料通常是用來產生 RegExp 用的。 */
BibleBookNames.prototype.arrayNamesOrderByLength = undefined;
/**
 * @param {string} na 書卷名稱，若是英文，大小寫不限。約一、約壹都可。
 */
BibleBookNames.prototype.getIdFromName = function (na) {
    if (na === undefined) {
        return undefined;
    }

    var lower = na.toLowerCase();
    if (!this.mapNa2Id.has(lower)) {
        return undefined;
    }
    return this.mapNa2Id.get(lower);


}
/**
 * @param {string} na 書卷名稱，若是英文，大小寫不限。約一、約壹都可。
 */
FHL.getIdFromName = function (na) {
    return new BibleBookNames().getIdFromName(na);
}