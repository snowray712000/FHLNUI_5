/// <reference path="../FHL.js" />
FHL.CONSTANT.Bible = (function () {
  if (FHL === undefined)
    throw "need FHL library.js."

  var CHINESE_NUMBERS = [
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
  ]

  var CHINESE_BOOK_ABBREVIATIONS = [
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
  ]

  var CHINESE_BOOK_ABBREVIATIONS_GB = [
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
  ]

  var CHINESE_BOOK_NAMES = [
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
  ]

  var CHINESE_BOOK_NAMES_GB = [
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
  ]

  var BOOK_CHAPTERS = [
    50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25,
    29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52,
    5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4,
    28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4,
    5, 3, 6, 4, 3, 1, 13, 5,
    5, 3, 5, 1, 1, 1, 22
  ]

  var ENGLISH_BOOK_ABBREVIATIONS = [
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
  ]

  var ENGLISH_BOOK_NAMES = [
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
  ]

  var ENGLISH_BOOK_SHORT_ABBREVIATIONS = [
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
  ]

  // 回傳
  var obj = {
    // 50, 40, 27, 36 ... 每卷書「章數」
    BOOK_CHAPTERS: BOOK_CHAPTERS,
    // '零', '一', '二', '三' 到 '一百五十'
    CHINESE_NUMBERS: CHINESE_NUMBERS,
    // '創', '出', '利' ...
    CHINESE_BOOK_ABBREVIATIONS: CHINESE_BOOK_ABBREVIATIONS,
    // '创', '出', '利' ...
    CHINESE_BOOK_ABBREVIATIONS_GB: CHINESE_BOOK_ABBREVIATIONS_GB,
    // '創世記', '出埃及記', ...
    CHINESE_BOOK_NAMES: CHINESE_BOOK_NAMES,
    // '创世记', '出埃及记'
    CHINESE_BOOK_NAMES_GB: CHINESE_BOOK_NAMES_GB,
    // 'Gen', 'Ex', 'Lev' ... 
    ENGLISH_BOOK_ABBREVIATIONS: ENGLISH_BOOK_ABBREVIATIONS,
    // 'Genesis', 'Exodus', 'Leviticus' ...
    ENGLISH_BOOK_NAMES: ENGLISH_BOOK_NAMES,
    // 'Ge', 'Ex', 'Le', 'Nu' ...
    ENGLISH_BOOK_SHORT_ABBREVIATIONS: ENGLISH_BOOK_SHORT_ABBREVIATIONS
  }
  return obj
})()
