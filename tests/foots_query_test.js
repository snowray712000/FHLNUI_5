/**
 * @typedef {import('./TpQUnit.js').TpQUnit} TpQUnit
 * @typedef {import('./TpQUnit.js').TpAssert} TpAssert
 */
const QUnit = /** @type {TpQUnit} */ (window.QUnit);

/**
 * @typedef {import('../index/cvt_others.js').DTextsWithAddr} DTextsWithAddr
 * @typedef {import('../index/DText.js').DText} DText
 * @typedef {import('../index/DFoot.js').DFoot} DFoot
 * @typedef {import('../index/api/qsb.js').DQsbResult} DQsbResult
 * @typedef {import('../index/api/qsb.js').DQsbParam} DQsbParam
 * @typedef {import('../index/api/qsb.js').DQsbRecord} DQsbRecord
 */



QUnit.module('foots_query_test');
import { qsb } from './../index/api/qsb.js'
import { cvt_others } from '../index/cvt_others.js';
import { queryFootsAsync } from '../index/queryFootsAsync.js';

QUnit.test('基本流程', async assert => {
    const done = assert.async();

    /** @type {DQsbResult} */
    const re1 = await qsb({ qstr: '創2:1', ver: 'lcc' });

    const re1a = re1.record.map(a1 => {
        return [a1.book, a1.chap, a1.sec, a1.bible_text]
    })

    const re2 = cvt_others('lcc', re1a)

    await queryFootsAsync(re2, 'lcc')

    const footcontent = re2[0][3][1].foot.footContent;
    assert.ok(footcontent != null, 'footcontent should not be null');
    assert.equal(footcontent.length, 1, 'footcontent length should be 1');
    assert.equal(footcontent[0].w, '希伯來文作「萬軍」', 'footcontent text should start with 上帝');

    done();
});



QUnit.test('優化，同步', async assert => {
    const done = assert.async();

    // 7:24 兩個都是同樣用 [1]，不是每個都一定是下一個 id，有可能多處用同一個 id
    /** @type {DQsbResult} */
    const re1 = await qsb({ qstr: '創2:6-7;出7:24', ver: 'lcc' });

    const re1a = re1.record.map(a1 => {
        return [a1.book, a1.chap, a1.sec, a1.bible_text]
    })
    const re2 = cvt_others('lcc', re1a)

    await queryFootsAsync(re2, 'lcc')

    // [0] 2:6 [1] 2:7 [2] 7:24
    assert.equal(re2[0][3][1].foot.footContent[0].w, '或譯「霧氣」', '創2:6 或譯「霧氣」');

    re2[0][3][3].foot.footContent[0].w == '或譯「滋潤」'
    assert.equal(re2[0][3][3].foot.footContent[0].w, '或譯「滋潤」', '創2:7 或譯「滋潤」');

    assert.equal(re2[1][3][1].foot.footContent[0].w, '「人」字希伯來文讀音爲「亞當」，即「土地」一詞之陽性', '出7:24 「人」字希伯來文讀音爲「亞當」，即「土地」一詞之陽性');

    assert.equal(re2[2][3][1].foot.footContent[0].w, '希伯來文作「喝」字', '出7:24 希伯來文作「喝」字');
    assert.equal(re2[2][3][3].foot.footContent[0].w, '希伯來文作「喝」字', '出7:24 希伯來文作「喝」字');

    done()
})

function buildCsbFixture({ id, ver, book, chap, verse, footContent }) {
    return {
        w: `【${id}】`,
        foot: {
            id,
            version: ver,
            book,
            chap,
            verse,
            footContent: [{ w: footContent }],
        }
    }
}


QUnit.test('太1:23 csb 中文標準譯本 注腳', async assert => {
    // 23 「看哪，那童貞女要懷孕，她要生一個兒子，人們將稱他的名為以馬內利。」【3】——「以馬內利」翻譯出來就是「神與我們同在」。
    // 1:23 《以賽亞書》7:14。

    const dtext_3 = buildCsbFixture({ id: 3, ver: 'csb', book: 40, chap: 1, verse: 23, footContent: '1:23 《以賽亞書》7:14。' })

    const dtexts = [{ w: '「看哪，那童貞女要懷孕，她要生一個兒子，人們將稱他的名為以馬內利。」' }, dtext_3, { w: '——「以馬內利」翻譯出來就是「神與我們同在」。' }]

    const dtexts_with_addr = [40, 1, 23, dtexts];

    await queryFootsAsync([dtexts_with_addr], 'csb')

    /** @type {DText[]} */
    const answers = [{ w: '《以賽亞書》7:14' }, { w: '。' }]
    answers[0].refDescription = '賽7:14'
    answers[0].isRef = 1

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers, 'csb 注腳內容正確');
})

QUnit.test('太4:6 csb', async assert => {
    // 太 4:6 對他說：「你如果是神的兒子，就跳下去吧！因為經上記著：『他會為你吩咐他的天使；他們會用手托住你，免得你的腳撞在石頭上。』【2:4:6 《詩篇》91:11-12。】」

    const dtext_2 = buildCsbFixture({ id: 2, ver: 'csb', book: 40, chap: 4, verse: 6, footContent: '4:6 《詩篇》91:11-12。' })

    const answers = [{ w: '《詩篇》91:11-12' }, { w: '。' }]
    answers[0].refDescription = '詩91:11-12'
    answers[0].isRef = 1

    const dtexts = [{ w: '對他說：「你如果是神的兒子，就跳下去吧！因為經上記著：『他會為你吩咐他的天使；他們會用手托住你，免得你的腳撞在石頭上。』' }, dtext_2, { w: '」' }]

    const dtexts_with_addr = [40, 4, 6, dtexts];
    await queryFootsAsync([dtexts_with_addr], 'csb')

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers, 'csb 太4:6 注腳內容正確');
});




QUnit.test('太4:16 csb', async assert => {
    // 太 4:16 那坐在黑暗中的民眾看到了大光；那坐在死亡之地和死亡陰影中的人們，曙光為他們升起。」【7:4:15-16 《以賽亞書》9:1-2。】

    const dtext_7 = buildCsbFixture({ id: 7, ver: 'csb', book: 40, chap: 4, verse: 16, footContent: '4:15-16 《以賽亞書》9:1-2。' })

    const answers = [{ w: '4:15-16 ' }, { w: '《以賽亞書》9:1-2' }, { w: '。' }]
    answers[1].refDescription = '賽9:1-2'
    answers[1].isRef = 1

    const dtexts = [{ w: '那坐在黑暗中的民眾看到了大光；那坐在死亡之地和死亡陰影中的人們，曙光為他們升起。」' }, dtext_7]

    const dtexts_with_addr = [40, 4, 16, dtexts];
    await queryFootsAsync([dtexts_with_addr], 'csb')

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers, 'csb 太4:16 注腳內容正確');
})




QUnit.test('太15:4 csb', async assert => {
    // 太 15:4 神吩咐過『你要孝敬你的父母』【2:15:4 《出埃及記》20:12；《申命記》5:16。】，又說『咒罵父親或母親的人，必須處死。』【3:15:4 《出埃及記》21:17；《利未記》20:9。】
    const dtext_2 = buildCsbFixture({ id: 2, ver: 'csb', book: 40, chap: 15, verse: 4, footContent: '15:4 《出埃及記》20:12；《申命記》5:16。' })
    const dtext_3 = buildCsbFixture({ id: 3, ver: 'csb', book: 40, chap: 15, verse: 4, footContent: '15:4 《出埃及記》21:17；《利未記》20:9。' })
    const answers_2 = [{ w: '《出埃及記》20:12；《申命記》5:16' }, { w: '。' }]
    answers_2[0].refDescription = '出20:12;申5:16'
    answers_2[0].isRef = 1
    const answers_3 = [{ w: '《出埃及記》21:17；《利未記》20:9' }, { w: '。' }]
    answers_3[0].refDescription = '出21:17;利20:9'
    answers_3[0].isRef = 1

    const dtexts = [{ w: '神吩咐過『你要孝敬你的父母』' }, dtext_2, { w: '，又說『咒罵父親或母親的人，必須處死。』' }, dtext_3]

    const dtexts_with_addr = [40, 15, 4, dtexts];
    await queryFootsAsync([dtexts_with_addr], 'csb')

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers_2, 'csb 太15:4 注腳內容正確 part 1');
    assert.deepEqual(dtexts_with_addr[3][3].foot.footContent, answers_3, 'csb 太15:4 注腳內容正確 part 2');
})


QUnit.test('太 19:4 csb', async assert => {
    // 太 19:4 耶穌回答說：「你們難道沒有讀過嗎？造物主從起初就把人造成男的和女的。【1:19:4 《創世記》1:27；5:2。】
    const dtext_1 = buildCsbFixture({ id: 1, ver: 'csb', book: 40, chap: 19, verse: 4, footContent: '19:4 《創世記》1:27；5:2。' })

    const answers_1 = [{ w: '《創世記》1:27；5:2' }, { w: '。' }]
    answers_1[0].refDescription = '創1:27;5:2'
    answers_1[0].isRef = 1

    const dtexts = [{ w: '耶穌回答說：「你們難道沒有讀過嗎？造物主從起初就把人造成男的和女的。' }, dtext_1]

    const dtexts_with_addr = [40, 19, 4, dtexts];
    await queryFootsAsync([dtexts_with_addr], 'csb')

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers_1, 'csb 太19:4 注腳內容正確');
})

QUnit.test('太 19:19 csb', async assert => {
    // 太 19:19 要孝敬父母、要愛鄰如己。」【10:19:18-19 《出埃及記》20:12-16；《利未記》19:18；《申命記》5:16-20。】
    const dtext_10 = buildCsbFixture({ id: 10, ver: 'csb', book: 40, chap: 19, verse: 19, footContent: '19:18-19 《出埃及記》20:12-16；《利未記》19:18；《申命記》5:16-20。' })
    const answers_10 = [{ w: '19:18-19 ' }, { w: '《出埃及記》20:12-16；《利未記》19:18；《申命記》5:16-20' }, { w: '。' }]
    answers_10[1].refDescription = '出20:12-16;利19:18;申5:16-20'
    answers_10[1].isRef = 1

    const dtexts = [{ w: '要孝敬父母、要愛鄰如己。」' }, dtext_10]

    const dtexts_with_addr = [40, 19, 19, dtexts];
    await queryFootsAsync([dtexts_with_addr], 'csb')

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers_10, 'csb 太19:19 注腳內容正確');
})

QUnit.test('太 26:30 csb', async assert => {
    // 太 26:30 他們唱了讚美詩【6:26:30 讚美詩——那時代的逾越節晚餐時、晚餐後，所唱的讚美詩是《詩篇》113-118篇。】，就出來，往橄欖山去了。
    // 因為 api 目前沒有支援
    const dtext_6 = buildCsbFixture({ id: 6, ver: 'csb', book: 40, chap: 26, verse: 30, footContent: '26:30 讚美詩——那時代的逾越節晚餐時、晚餐後，所唱的讚美詩是《詩篇》113-118篇。' })

    const answers_6 = [{ w: '讚美詩——那時代的逾越節晚餐時、晚餐後，所唱的讚美詩是' }, { w: '《詩篇》113-118' }, { w: '篇。' }]
    answers_6[1].refDescription = '詩113:1-118:29'
    answers_6[1].isRef = 1

    const dtexts = [{ w: '他們唱了讚美詩' }, dtext_6, { w: '，就出來，往橄欖山去了。' }]
    const dtexts_with_addr = [40, 26, 30, dtexts];
    await queryFootsAsync([dtexts_with_addr], 'csb')

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers_6, 'csb 太26:30 注腳內容正確');
})


QUnit.test('羅 3:12 csb', async assert => {
    // 羅 3:12 人人都遠離了正道，一同成了無用的；沒有仁慈的，連一個也沒有。【3:3:10-12 《詩篇》14:1-3；53:1-3；《傳道書》7:20。】
    const dtext_3 = buildCsbFixture({ id: 3, ver: 'csb', book: 45, chap: 3, verse: 12, footContent: '3:10-12 《詩篇》14:1-3；53:1-3；《傳道書》7:20。' })

    const answers_3 = [{ w: '3:10-12 ' }, { w: '《詩篇》14:1-3；53:1-3；《傳道書》7:20' }, { w: '。' }]
    answers_3[1].refDescription = '詩14:1-3;53:1-3;傳7:20'
    answers_3[1].isRef = 1

    const dtexts = [{ w: '人人都遠離了正道，一同成了無用的；沒有仁慈的，連一個也沒有。' }, dtext_3]
    const dtexts_with_addr = [45, 3, 12, dtexts];
    await queryFootsAsync([dtexts_with_addr], 'csb')

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers_3, 'csb 羅3:12 注腳內容正確');
})

QUnit.test('羅 9:9 csb', async assert => {
    // 羅 9:9 原來所應許的話是這樣的：「到明年【4:9:9 明年——輔助詞語。】這時候我要來，撒拉會生一個兒子。」【5:9:9 《創世記》18:10,14。】

    const dtext_4 = buildCsbFixture({ id: 4, ver: 'csb', book: 45, chap: 9, verse: 9, footContent: '9:9 明年——輔助詞語。' })
    const dtext_5 = buildCsbFixture({ id: 5, ver: 'csb', book: 45, chap: 9, verse: 9, footContent: '9:9 《創世記》18:10,14。' })

    const answers_4 = [{ w: '明年——輔助詞語。' }]

    const answers_5 = [{ w: '《創世記》18:10,14' }, { w: '。' }]
    answers_5[0].refDescription = '創18:10,14'
    answers_5[0].isRef = 1

    const dtexts = [{ w: '原來所應許的話是這樣的：「到明年' }, dtext_4, { w: '這時候我要來，撒拉會生一個兒子。」' }, dtext_5]

    const dtexts_with_addr = [45, 9, 9, dtexts];
    await queryFootsAsync([dtexts_with_addr], 'csb')

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers_4, 'csb 羅9:9 注腳內容正確 part 1');
    assert.deepEqual(dtexts_with_addr[3][3].foot.footContent, answers_5, 'csb 羅9:9 注腳內容正確 part 2');
})


QUnit.test('太1:6 cnet', async assert => {
    // 太1:6 耶西生大衛王。大衛（從烏利亞的妻子【1】）生所羅門；
    // 1:「烏利亞的妻子」。即拔示巴（Bathsheba）（參撒下11:3）。

    const dtext_1 = buildCsbFixture({ id: 1, ver: 'cnet', book: 40, chap: 1, verse: 6, footContent: '「烏利亞的妻子」。即拔示巴（Bathsheba）（參撒下11:3）。' })

    const answers_1 = [{ w: '「烏利亞的妻子」。即拔示巴（Bathsheba）（參' }, { w: '撒下11:3', refDescription: '撒下11:3', isRef: 1 }, { w: '）。' }]

    const dtexts = [{ w: '耶西生大衛王。大衛（從烏利亞的妻子' }, dtext_1, { w: '生所羅門；' }]

    const dtexts_with_addr = [40, 1, 6, dtexts];
    await queryFootsAsync([dtexts_with_addr], 'cnet')

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers_1, 'cnet 太1:6 注腳內容正確');
})

QUnit.test('太1:11 cnet', async assert => {
    // 太1:11 百姓被遷到巴比倫的時候，約西亞【2】生耶哥尼雅和他的弟兄。
    // 2:「約西亞生耶哥尼雅」。有古卷在耶哥尼雅之前包括約雅敬（Jehoiakim），以符合歷代志上3:15-16的記載。但加上後影響了第17節「十四代」的算法，可見為神學上的理由作者記載的家譜是選擇性的。

    const dtext_2 = buildCsbFixture({ id: 2, ver: 'cnet', book: 40, chap: 1, verse: 11, footContent: '「約西亞生耶哥尼雅」。有古卷在耶哥尼雅之前包括約雅敬（Jehoiakim），以符合歷代志上3:15-16的記載。但加上後影響了第17節「十四代」的算法，可見為神學上的理由作者記載的家譜是選擇性的。' })

    const answers_2 = [{ w: '「約西亞生耶哥尼雅」。有古卷在耶哥尼雅之前包括約雅敬（Jehoiakim），以符合' }, { w: '歷代志上3:15-16', refDescription: '代上3:15-16', isRef: 1 }, { w: '的記載。但加上後影響了第17節「十四代」的算法，可見為神學上的理由作者記載的家譜是選擇性的。' }]

    const dtexts = [{ w: '百姓被遷到巴比倫的時候，約西亞' }, dtext_2, { w: '生耶哥尼雅和他的弟兄。' }]

    const dtexts_with_addr = [40, 1, 11, dtexts];
    await queryFootsAsync([dtexts_with_addr], 'cnet')

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers_2, 'cnet 太1:11 注腳內容正確');
})

QUnit.test('太1:16 cnet', async assert => {
    // 太1:16 雅各生約瑟，就是馬利亞的丈夫；那稱為基督【3】的耶穌，是從馬利亞生的。
    // 3:「基督」（Christ）或作「彌賽亞」（Messiah）。希臘文的「基督」與希伯來文和亞蘭文的「彌賽亞」都是「被膏的人」（one who has been anointed）的意思。希臘文的「基督」（χριστός, christos）本是形容詞，是受膏的意思（anointed）。後經《七十士譯本》（LXX）延用作「受膏的人」，至兩約之間時期（intertestamental period），這名稱演進為「期盼的受膏者」，是特殊的一位。新約時代加以演進，福音書引用至耶穌的身上。保羅最後將基督鑄為耶穌的頭函和名號。

    const dtext_3 = buildCsbFixture({ id: 3, ver: 'cnet', book: 40, chap: 1, verse: 16, footContent: '「基督」（Christ）或作「彌賽亞」（Messiah）。希臘文的「基督」與希伯來文和亞蘭文的「彌賽亞」都是「被膏的人」（one who has been anointed）的意思。希臘文的「基督」（χριστός, christos）本是形容詞，是受膏的意思（anointed）。後經《七十士譯本》（LXX）延用作「受膏的人」，至兩約之間時期（intertestamental period），這名稱演進為「期盼的受膏者」，是特殊的一位。新約時代加以演進，福音書引用至耶穌的身上。保羅最後將基督鑄為耶穌的頭函和名號。' })

    const answers_3 = [{ w: '「基督」（Christ）或作「彌賽亞」（Messiah）。希臘文的「基督」與希伯來文和亞蘭文的「彌賽亞」都是「被膏的人」（one who has been anointed）的意思。希臘文的「基督」（χριστός, christos）本是形容詞，是受膏的意思（anointed）。後經《七十士譯本》（LXX）延用作「受膏的人」，至兩約之間時期（intertestamental period），這名稱演進為「期盼的受膏者」，是特殊的一位。新約時代加以演進，福音書引用至耶穌的身上。保羅最後將基督鑄為耶穌的頭函和名號。' }]

    const dtexts = [{ w: '雅各生約瑟，就是馬利亞的丈夫；那稱為基督' }, dtext_3, { w: '的耶穌，是從馬利亞生的。' }]

    const dtexts_with_addr = [40, 1, 16, dtexts];
    await queryFootsAsync([dtexts_with_addr], 'cnet')

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers_3, 'cnet 太1:16 注腳內容正確');
})



QUnit.test('太1:23 cnet', async assert => {
    // 太1:23 「必有童貞女【8】懷孕生子，人要稱他的名為以馬內利。【9】」就是「　神與我們同在【10】」的意思。
    // 8:引用以賽亞書7:14。不清楚作者引用MT古卷或是七十士(LXX)版。本詞παρθένος (parthenos，「處女」)的使用可能出自七十士版，但也有可能是作者從希伯來文ה” almah，少女）的翻譯。引用的第二句片語已從原文中稍加修改; 無論是MT或七十士版都是用第二身單數動詞，但本處用的是第三身複數動詞。這裡「以馬內利」的拼寫用希臘文的(Emmanuel )，而舊約希伯來文是用(Immanuel )。以賽亞書的背景指出在亞哈斯王朝, 以一個孩子的誕生來證明敘利亞和以色列聯軍對抗猶大的失敗。以賽亞以後的預言最終被應用到未來的大衛一脉的君王有一天會統治這個國家。
    // 9:引用以賽亞書7:14; 8:8, 10. 希伯來字的以馬內利就是「上帝(單式)和我們同在」。這句話在舊約鄰近章節中出現三次，以後續的用法可能與之前的相關。因此本書作者很可能在第23節下定義時考慮每個出處。
    // 10:隱喻以賽亞書8:8, 10。
    // 其中的：以賽亞書7:14、以賽亞書7:14; 8:8, 10、以賽亞書8:8, 10

    const dtext_8 = buildCsbFixture({ id: 8, ver: 'cnet', book: 40, chap: 1, verse: 23, footContent: '引用以賽亞書7:14。不清楚作者引用MT古卷或是七十士(LXX)版。本詞παρθένος (parthenos，「處女」)的使用可能出自七十士版，但也有可能是作者從希伯來文ה” almah，少女）的翻譯。引用的第二句片語已從原文中稍加修改; 無論是MT或七十士版都是用第二身單數動詞，但本處用的是第三身複數動詞。這裡「以馬內利」的拼寫用希臘文的(Emmanuel )，而舊約希伯來文是用(Immanuel )。以賽亞書的背景指出在亞哈斯王朝, 以一個孩子的誕生來證明敘利亞和以色列聯軍對抗猶大的失敗。以賽亞以後的預言最終被應用到未來的大衛一脉的君王有一天會統治這個國家。' })

    const dtext_9 = buildCsbFixture({ id: 9, ver: 'cnet', book: 40, chap: 1, verse: 23, footContent: '引用以賽亞書7:14; 8:8, 10. 希伯來字的以馬內利就是「上帝(單式)和我們同在」。這句話在舊約鄰近章節中出現三次，以後續的用法可能與之前的相關。因此本書作者很可能在第23節下定義時考慮每個出處。' })

    const dtext_10 = buildCsbFixture({ id: 10, ver: 'cnet', book: 40, chap: 1, verse: 23, footContent: '隱喻以賽亞書8:8, 10。' })

    const answers_8 = [{ w: '引用' }, { w: '以賽亞書7:14', refDescription: '賽7:14', isRef: 1 }, { w: '。不清楚作者引用MT古卷或是七十士(LXX)版。本詞παρθένος (parthenos，「處女」)的使用可能出自七十士版，但也有可能是作者從希伯來文ה” almah，少女）的翻譯。引用的第二句片語已從原文中稍加修改; 無論是MT或七十士版都是用第二身單數動詞，但本處用的是第三身複數動詞。這裡「以馬內利」的拼寫用希臘文的(Emmanuel )，而舊約希伯來文是用(Immanuel )。以賽亞書的背景指出在亞哈斯王朝, 以一個孩子的誕生來證明敘利亞和以色列聯軍對抗猶大的失敗。以賽亞以後的預言最終被應用到未來的大衛一脉的君王有一天會統治這個國家。' }]

    const answers_9 = [{ w: '引用' }, { w: '以賽亞書7:14; 8:8, 10', refDescription: '賽7:14;8:8,10', isRef: 1 }, { w: '. 希伯來字的以馬內利就是「上帝(單式)和我們同在」。這句話在舊約鄰近章節中出現三次，以後續的用法可能與之前的相關。因此本書作者很可能在第23節下定義時考慮每個出處。' }]

    const answers_10 = [{ w: '隱喻' }, { w: '以賽亞書8:8, 10', refDescription: '賽8:8,10', isRef: 1 }, { w: '。' }]

    const dtexts = [{ w: '「必有童貞女' }, dtext_8, { w: '懷孕生子，人要稱他的名為以馬內利.' }, dtext_9, { w: '」就是「　神與我們同在.' }, dtext_10]

    const dtexts_with_addr = [40, 1, 23, dtexts];
    await queryFootsAsync([dtexts_with_addr], 'cnet')

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers_8, 'cnet 太1:23 注腳內容正確 part 1');
    assert.deepEqual(dtexts_with_addr[3][3].foot.footContent, answers_9, 'cnet 太1:23 注腳內容正確 part 2');
    assert.deepEqual(dtexts_with_addr[3][5].foot.footContent, answers_10, 'cnet 太1:23 注腳內容正確 part 3');
})


QUnit.test('太1:24 cnet', async assert => {
    // 太1:24 約瑟醒了，起來，就遵着主天使【11】的吩咐，把妻子娶過來；
    // 11:「天使」或作「那天使」。指1:20的天使。
    // 其中的：

    const dtext_11 = buildCsbFixture({ id: 11, ver: 'cnet', book: 40, chap: 1, verse: 24, footContent: '「天使」或作「那天使」。指1:20的天使。' })

    const answers_11 = [{ w: '「天使」或作「那天使」。指1:20的天使。' }]

    const dtexts = [{ w: '約瑟醒了，起來，就遵着主天使' }, dtext_11, { w: '的吩咐，把妻子娶過來；' }]

    const dtexts_with_addr = [40, 1, 24, dtexts];
    await queryFootsAsync([dtexts_with_addr], 'cnet')

    assert.deepEqual(dtexts_with_addr[3][1].foot.footContent, answers_11, 'cnet 太1:24 注腳內容正確');
})