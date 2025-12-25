import { rtAsync } from '../index/rtAsync.js';
import { splitStringByRegex } from '../index/splitStringByRegex.es2023.js';
import { BibleConstantHelper } from './../index/BibleConstantHelper.es2023.js'
/**
 * 檢查，若有 dtexts 有 foot 且 footContent 為 null，則用 rtAsync 查詢注腳內容並填入。
 * 會同步取得所有，再用 Promise.all 等待完成。
 * @param {DTextsWithAddr[]} dtexts_with_addr 
 * @param {string} ver 
 */
export async function queryFootsAsync(dtexts_with_addr, ver) {

    const tasks = []

    for (const one_record of dtexts_with_addr) {
        for (const dtext of one_record[3]) {
            if (dtext.foot != null && dtext.foot.footContent == null) {
                const foot = dtext.foot

                const task = rtAsync({ book: foot.book, chap: foot.chap, id: foot.id, ver: foot.version }).then(re3 => {
                    dtext.foot.footContent = [{ w: re3.record[0].text }];
                })
                tasks.push(task)
            }
        }
    }

    await Promise.all(tasks)

    // csb 中文標準譯本 1:23 《以賽亞書》7:14。
    if (ver == 'csb') {
        cvt_foot_csb(dtexts_with_addr)
    } else if (ver == 'cnet') {
        cvt_foot_cnet(dtexts_with_addr)
    }

    return
}


/**
 * 用於 queryFootsAsync，將 csb 注腳內容轉成參考格式
 * @param {DTextsWithAddr[]} dtexts_with_addr 
 */
function cvt_foot_csb(dtexts_with_addr) {
    // 太 4:6 對他說：「你如果是神的兒子，就跳下去吧！因為經上記著：『他會為你吩咐他的天使；他們會用手托住你，免得你的腳撞在石頭上。』【2:4:6 《詩篇》91:11-12。】」
    // 太 4:16 那坐在黑暗中的民眾看到了大光；那坐在死亡之地和死亡陰影中的人們，曙光為他們升起。」【7:4:15-16 《以賽亞書》9:1-2。】
    // 太 15:4 神吩咐過『你要孝敬你的父母』【2:15:4 《出埃及記》20:12；《申命記》5:16。】，又說『咒罵父親或母親的人，必須處死。』【3:15:4 《出埃及記》21:17；《利未記》20:9。】
    // 太 19:4 耶穌回答說：「你們難道沒有讀過嗎？造物主從起初就把人造成男的和女的。【1:19:4 《創世記》1:27；5:2。】
    // 太 19:19 要孝敬父母、要愛鄰如己。」【10:19:18-19 《出埃及記》20:12-16；《利未記》19:18；《申命記》5:16-20。】
    // 太 26:30 他們唱了讚美詩【6:26:30 讚美詩——那時代的逾越節晚餐時、晚餐後，所唱的讚美詩是《詩篇》113-118篇。】，就出來，往橄欖山去了。
    // 羅 3:12 人人都遠離了正道，一同成了無用的；沒有仁慈的，連一個也沒有。【3:3:10-12 《詩篇》14:1-3；53:1-3；《傳道書》7:20。】
    // 羅 9:9 原來所應許的話是這樣的：「到明年【4:9:9 明年——輔助詞語。】這時候我要來，撒拉會生一個兒子。」【5:9:9 《創世記》18:10,14。】


    for (const one_record of dtexts_with_addr) {
        for (const dtext of one_record[3]) {
            if (dtext.foot != null && dtext.foot.footContent != null) {
                const foot = dtext.foot
                // 1:23 《以賽亞書》7:14。
                const w1 = foot.footContent[0].w

                // 如果 `1:23` 等於 chap:verse，則清空，沒必要加
                const chap = foot.chap
                const verse = foot.verse
                const addr_str = chap.toString() + ':' + verse.toString()
                if (w1.startsWith(addr_str)) {
                    // 移除開頭的 addr_str
                    foot.footContent[0].w = w1.substring(addr_str.length).trimStart()
                }

                // 《以賽亞書》7:14。 這種格式，就是要轉成 reference 格式
                const w2 = foot.footContent[0].w

                const regex1 = /《([^》]+)》([0-9\:：\-\;；,，、]+)/g;
                const parts = splitStringByRegex(w2, regex1)
                if (parts == null) {
                    // 無法切割，跳過
                    continue
                }

                const dtexts = []
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i]
                    if (part.exec == null) {
                        dtexts.push({ w: part.w })
                    }
                    else {
                        const na_full = part.exec[1]; // 《以賽亞書》7:14
                        const book = BibleConstantHelper.getBookId(na_full.toLowerCase())
                        const na_short = BibleConstantHelper.getBookNameArrayChineseShort()[book - 1]

                        let addr = part.exec[2]; // 7:14

                        // 處理 詩篇 113-118 這種範圍，太 26:30 csb
                        const reg2 = /^(\d+)-(\d+)$/;
                        if (reg2.test(addr)) {
                            const ma = reg2.exec(addr) // ma[1] is 113 ma[2] is 118
                            const sec_end = BibleConstantHelper.getCountVerseOfChap(book, parseInt(ma[2]))
                            const addr_new = ma[1] + ':1-' + ma[2] + ':' + sec_end.toString()
                            addr = addr_new
                        }

                        const refDescription = na_short + addr.replace(/：/g, ':').replace(/；/g, ';').replace(/，/g, ',').replace(/、/g, ',').replace(/ /g, '');

                        dtexts.push({
                            w: part.w,
                            refDescription: refDescription,
                            isRef: 1
                        })
                    }
                }


                // 若連續的 isRef，則合併，從後面開始往前合併較直覺
                for (let i = dtexts.length - 1; i > 0; i--) {
                    const curr = dtexts[i];
                    const prev = dtexts[i - 1];
                    if (curr.isRef === 1 && prev.isRef === 1) {
                        // 合併
                        prev.w += curr.w;
                        prev.refDescription += curr.refDescription;
                        // 移除 curr
                        dtexts.splice(i, 1);
                    }
                }

                foot.footContent = dtexts;
            }
        }
    }
}

/**
 * 
 * @param {DTextsWithAddr[]} dtexts_with_addr 
 */
function cvt_foot_cnet(dtexts_with_addr) {
    // 太1:6 耶西生大衛王。大衛（從烏利亞的妻子【1】）生所羅門；
    // 1:「烏利亞的妻子」。即拔示巴（Bathsheba）（參撒下11:3）。
    // 其中的：撒下11:3

    // 太1:11 百姓被遷到巴比倫的時候，約西亞【2】生耶哥尼雅和他的弟兄。
    // 2:「約西亞生耶哥尼雅」。有古卷在耶哥尼雅之前包括約雅敬（Jehoiakim），以符合歷代志上3:15-16的記載。但加上後影響了第17節「十四代」的算法，可見為神學上的理由作者記載的家譜是選擇性的。
    // 其中的：歷代志上3:15-16


    // 太1:16 雅各生約瑟，就是馬利亞的丈夫；那稱為基督【3】的耶穌，是從馬利亞生的。
    // 3:「基督」（Christ）或作「彌賽亞」（Messiah）。希臘文的「基督」與希伯來文和亞蘭文的「彌賽亞」都是「被膏的人」（one who has been anointed）的意思。希臘文的「基督」（χριστός, christos）本是形容詞，是受膏的意思（anointed）。後經《七十士譯本》（LXX）延用作「受膏的人」，至兩約之間時期（intertestamental period），這名稱演進為「期盼的受膏者」，是特殊的一位。新約時代加以演進，福音書引用至耶穌的身上。保羅最後將基督鑄為耶穌的頭函和名號。
    // 其中的：

    // 太1:23 「必有童貞女【8】懷孕生子，人要稱他的名為以馬內利。【9】」就是「　神與我們同在【10】」的意思。
    // 8:引用以賽亞書7:14。不清楚作者引用MT古卷或是七十士(LXX)版。本詞παρθένος (parthenos，「處女」)的使用可能出自七十士版，但也有可能是作者從希伯來文ה” almah，少女）的翻譯。引用的第二句片語已從原文中稍加修改; 無論是MT或七十士版都是用第二身單數動詞，但本處用的是第三身複數動詞。這裡「以馬內利」的拼寫用希臘文的(Emmanuel )，而舊約希伯來文是用(Immanuel )。以賽亞書的背景指出在亞哈斯王朝, 以一個孩子的誕生來證明敘利亞和以色列聯軍對抗猶大的失敗。以賽亞以後的預言最終被應用到未來的大衛一脉的君王有一天會統治這個國家。
    // 9:引用以賽亞書7:14; 8:8, 10. 希伯來字的以馬內利就是「上帝(單式)和我們同在」。這句話在舊約鄰近章節中出現三次，以後續的用法可能與之前的相關。因此本書作者很可能在第23節下定義時考慮每個出處。
    // 10:隱喻以賽亞書8:8, 10。
    // 其中的：以賽亞書7:14、以賽亞書7:14; 8:8, 10、以賽亞書8:8, 10

    // 太1:24 約瑟醒了，起來，就遵着主天使【11】的吩咐，把妻子娶過來；
    // 11:「天使」或作「那天使」。指1:20的天使。
    // 其中的：

    for (const one_record of dtexts_with_addr) {
        for (const dtext of one_record[3]) {
            if (dtext.foot != null && dtext.foot.footContent != null) {
                const foot = dtext.foot
                const w1 = foot.footContent[0].w

                const na2id = BibleConstantHelper.getMapName2Id();
                // 將 key 拿出來，是所有格式的書卷名，然後，再依字母長度排序，長的在前面，避免「撒下」被「撒」先取到。然後再組成 regex
                const book_names = Object.keys(na2id);
                book_names.sort((a, b) => b.length - a.length);
                // /《([^》]+)》([0-9\:：\-\;；,，、]+)/g
                // 比起 csb, 有空白，書卷名兩種都可以。但，「空白」不能是第一個，所以會有「第一個字元,當然，一定是數字」
                const regex1 = new RegExp(`\\s*(${book_names.join('|')})\\s*([0-9][0-9\\:：\\-\\;；,，、 ]*)`, 'gi');

                const parts = splitStringByRegex(w1, regex1)
                if (parts == null) {
                    // 無法切割，跳過
                    continue
                }

                const dtexts = []
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i]
                    if (part.exec == null) {
                        dtexts.push({ w: part.w })
                    }
                    else {
                        const na_full = part.exec[1].trim(); // 《以賽亞書》7:14
                        const book = BibleConstantHelper.getBookId(na_full.toLowerCase())
                        const na_short = BibleConstantHelper.getBookNameArrayChineseShort()[book - 1]
                        let addr = part.exec[2].trim(); // 7:14
                        const refDescription = na_short + addr.replace(/：/g, ':').replace(/；/g, ';').replace(/，/g, ',').replace(/、/g, ',').replace(/ /g, '')
                        dtexts.push({
                            w: part.w,
                            refDescription: refDescription,
                            isRef: 1
                        })
                    }
                }

                // 如果有相連的，isRef，則合併。從背後開始合併較直覺
                for (let i = dtexts.length - 1; i > 0; i--) {
                    const curr = dtexts[i];
                    const prev = dtexts[i - 1];
                    if (curr.isRef === 1 && prev.isRef === 1) {
                        // 合併
                        prev.w += curr.w;
                        prev.refDescription += curr.refDescription;
                        // 移除 curr
                        dtexts.splice(i, 1);
                    }
                }

                foot.footContent = dtexts;
            }
        }
    }
}
