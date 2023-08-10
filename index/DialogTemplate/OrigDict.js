
var FHL = window.FHL || {};

(function(root){
    root.OrigDict = (function(){
        /**
         * 使用 queryFromApi()
         */
         function OrigDict() { }
         OrigDict.prototype._queryFromCbolApi = function (sn = '113', isOld = 0, isGb = 0) {
             function cvt(r1) {
                 var re = [];
                 if (r1 !== undefined && r1.record !== undefined && r1.record.length !== 0) {
                     var r2 = r1.record[0];
                     re.push({ w: r2.dic_text, isOld: 0, sn: r2.sn, orig: r2.orig, ver: 'CBOL Parsing 系統' });
                     re.push({ w: r2.edic_text, isOld: 0, sn: r2.sn, orig: r2.orig, ver: 'CBOL Parsing System' });
                 }
                 return re;
             }
         
             gb = isGb ? 'gb=1' : '';
             n = isOld ? 'N=1' : 'N=0';
             var re = undefined;
             var er = undefined;
         
             $.ajax({
                 url: (this._isLocalHost() ? 'http://bible.fhl.net' : '') + '/json/sd.php?k=' + sn + '&' + gb + '&' + n,
                 async: false,
                 success: function (aa) {
                     re = JSON.parse(aa);
                 },
                 error: function (aa) {
                     er = aa;
                     console.error(er);
                 }
             });
         
             return cvt(re);
         };
         /** twcb 是浸宣的官網 */
         OrigDict.prototype._queryFromTwcbApi = function (sn = '113', isOld = 0, isGb = 0) {
             function cvt(r1) {
                 var re = [];
                 if (r1 !== undefined && r1.record !== undefined && r1.record.length !== 0) {
                     var r2 = r1.record[0];
                     re.push({ w: r2.dic_text, isOld: 0, sn: r2.sn, ver: '浸宣出版社' });
                 }
                 return re;
             }
         
             if (this._isLocalHost()) {
                 var re = [];
                 var r1 = isOld ? new OrigDictPresudo().presudo_Old113b() : new OrigDictPresudo().presudo_New113b();
                 return cvt(r1);
             } else {
                 var re = undefined;
                 var er = undefined;
         
                 // sbdag
                 var urlapi = isOld === 1 ? 'stwcbhdic.php' : 'sbdag.php';
                 $.ajax({
                     url: '/json/' + urlapi + '?k=' + sn + '&' + gb + '&' + n,
                     async: false,
                     success: function (aa) {
                         re = JSON.parse(aa);
                         console.log(JSON.stringify(re));
                     },
                     error: function (aa) {
                         er = aa;
                         console.log(aa);
                     }
                 });
         
                 return cvt(re);
             }
         }
         OrigDict.prototype._isLocalHost = function () {
             return document.location.hostname === '127.0.0.1' || document.location.hostname === 'localhost';
         }
         FHL.isLocalHost = function () {
             return new OrigDict()._isLocalHost();
         }
         /**
          * 
          * @param {string} sn 
          * @param {0|1} isOld 
          * @param {0|1} isGb 
          * @returns {{w:string,isOld:0|1,sn:string,orig:string,ver:'cbol中文'|'cbol英文'|'浸宣'}[]}
          */
         OrigDict.prototype.queryFromApi = function (sn = '113', isOld = 0, isGb = 0) {
             if (sn === undefined) {
                 return [];
             }
             var re1 = this._queryFromCbolApi(sn, isOld, isGb);
             var re2 = this._queryFromTwcbApi(sn, isOld, isGb);
             for (const it1 of re2) {
                 re1.push(it1);
             }
             return re1;
             // http://bible.fhl.net/json/sd.php?N=0&gb=0&k=113
             // http://bible.fhl.net/json/sd.php?N=1&gb=0&k=113
             // http://bible.fhl.net/json/stwcbhdic.php?gb=0&k=113
             // http://bkbible.fhl.net/NUI/sbdag.html
         }
    
         return OrigDict
        })()

    return
    function OrigDictPresudo() {
        this.presudo_New113b = function () {
            return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00011","dic_text":"Ἀβραάμ, ὁ 人名　無變格\\r\\n（אַבְרָהָם H85「<span class=\\"exp\\">多人之父</span>」）「<span class=\\"exp\\">亞伯拉罕</span>」。出現於耶穌的家譜中，#太1:1,2,17;路3:34|。是以色列民族的父，亦為基督徒這真以色列人的父，#太3:9;路1:73;3:8;約8:39,53,56;徒7:2;羅4:1;雅2:21|。因此，以色列百姓稱為亞伯拉罕的後裔，#約8:33,37;羅9:7;11:1;林後11:22;加3:29;來2:16|。是得蒙應許者，#徒3:25;7:17;羅4:13;加3:8,14,16,18;來6:13|。滿有信心，#羅4:3|（#創15:6|）#羅4:9,12,16;加3:6|（#創15:6|）,#加3:9;雅2:23|。此處並稱之為神的朋友（參#賽41:8;代下20:7;但3:35|;參#出33:11|）;在來世具有顯赫地位，#路16:22|以下（見 κόλπος G2859一），以撒、雅各和眾先知亦同，#路13:28|。神被描述為亞伯拉罕、以撒、雅各的神（#出3:6|）#太22:32;可12:26;路20:37;徒3:13;7:32|。他與以撒、雅各一同在神國中坐席，#太8:11|。"}]}');
        }
        this.presudo_Old113a = function () {
            return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00113","dic_text":"0113 \'adown {a:-do:n\'} 或 (縮寫型) \'adon {a:-do:n\'}\\r\\n\\r\\n字根已不使用 (意為\\"統治\\"); TWOT - 27b; 陽性名詞\\r\\n\\r\\n欽定本 - lord 197, master(s) 105, Lord 31, owner 1, sir 1; 335\\r\\n\\r\\n1) 堅定, 強壯, 主, 主人\\r\\n   1a) 主, 主人\\r\\n       1a1) 指稱人\\r\\n            1a1a) 家宰, 總管\\r\\n            1a1b) 主人\\r\\n            1a1c) 國王\\r\\n       1a2) 指稱神\\r\\n            1a2a) 主神\\r\\n            1a2b) 普天下的主\\r\\n   1b) 眾主, 諸王\\r\\n       1b1) 指稱人\\r\\n            1b1a) 撒瑪利亞山的原主 (#王上 16:24|)\\r\\n            1b1b) 主人\\r\\n            1b1c) 丈夫\\r\\n            1b1d) 先知\\r\\n            1b1e) 省長 \\r\\n            1b1f) 首領\\r\\n            1b1g) 國王\\r\\n       1b2) 指稱神\\r\\n            1b2a) 萬主之主\\r\\n   1c) 我主, 我的主人\\r\\n       1c1) 指稱人\\r\\n            1c1a) 主人\\r\\n            1c1b) 丈夫\\r\\n            1c1c) 先知\\r\\n            1c1d) 首領\\r\\n            1c1e) 國王\\r\\n            1c1f) 父親\\r\\n            1c1g) 摩西\\r\\n            1c1h) 祭司\\r\\n            1c1i) 顯現的天使\\r\\n            1c1j) 將領\\r\\n            1c1k) 承認對方優越的一般稱呼\\r\\n       1c2) 指稱神\\r\\n            1c2a) 我的主, 我的主我的神 (#詩 35:23|)\\r\\n            1c2b) Adonai \\"主\\" (等同神的名字\\"雅威\\"[Yahweh])","edic_text":"0113 \'adown {aw-done\'} or (shortened) \'adon {aw-done\'}\\n\\nfrom an unused root (meaning to rule); TWOT - 27b; n m\\n\\nAV - lord 197, master(s) 105, Lord 31, owner 1, sir 1; 335\\n\\n1) firm, strong, lord, master\\n   1a) lord, master\\n       1a1) reference to men\\n            1a1a) superintendent of household,of affairs\\n            1a1b) master\\n            1a1c) king\\n       1a2) reference to God\\n            1a2a) the Lord God\\n            1a2b) Lord of the whole earth\\n   1b) lords, kings\\n       1b1) reference to men\\n            1b1a) proprietor of hill of Samaria\\n            1b1b) master\\n            1b1c) husband\\n            1b1d) prophet\\n            1b1e) governor\\n            1b1f) prince\\n            1b1g) king\\n       1b2) reference to God\\n            1b2a) Lord of lords (probably = \\"thy husband, Yahweh\\")\\n   1c) my lord, my master\\n       1c1) reference to men\\n           1c1a) master\\n           1c1b) husband\\n           1c1c) prophet\\n           1c1d) prince\\n           1c1e) king\\n           1c1f) father\\n           1c1g) Moses\\n           1c1h) priest\\n           1c1i) theophanic angel\\n           1c1j) captain\\n           1c1k) general recognition of superiority\\n       1c2) reference to God\\n           1c2a) my Lord,my Lord and my God\\n           1c2b) Adonai (parallel with Yahweh)","dic_type":1,"orig":"אָדוֹן"}]}');
        }
        this.presudo_New113a = function () {
            return JSON.parse(
                '{"status":"success","record_count":1,"record":[{"sn":"00113","dic_text":"113 athesmos {ath\'-es-mos}\\r\\n\\r\\n源自 1 (為一否定質詞/語助詞) 與5087的衍生字 (取其\\"立起\\"的意思); TDNT - 1:167,25; 形容詞\\r\\n\\r\\n欽定本 - wicked 2; 2\\r\\n\\r\\n1)不合宜的,可恥的,目無法紀的(#彼後 2:7,3:17|)","edic_text":"113 athesmos {ath\'-es-mos}\\n\\nfrom 1 (as a negative particle) and a derivative of 5087 (in the\\n   sense of enacting); TDNT - 1:167,25; adj\\n\\nAV - wicked 2; 2\\n\\n1) one who breaks through the restraint of law and gratifies his lusts","dic_type":0,"orig":"ἄθεσμος"}]}');
        }
        this.presudo_Old113b = function () {
            return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00113","dic_text":"00113\\r\\n【0113】אָדוֹן\\r\\n＜音譯＞\'adown\\r\\n＜詞類＞名、陽\\r\\n＜字義＞耶和華、主人、主、最高統治者、擁有者\\r\\n＜字源＞來自不用的字根\\r\\n＜神出＞27b   #創18:12|\\r\\n＜譯詞＞（）323\\r\\n＜解釋＞\\r\\n<div class=\\"idt\\">單陽אָדוֹן#詩12:4|。單陽附屬形אֲרוֹן#書3:11|。複陽אֲדֹנִים#賽26:13|。複陽附屬形וַאֲדֹנֵי#申10:17|。單陽1單詞尾וַאדֹנִי#創18:12|。複陽3單陽詞尾אֲדֹנָיו#創24:10|。複陽3單陰詞尾אֲדֹנֶיהָ#出21:4|。複陽3複陽詞尾אֲדֹנֵיהֶם#創40:1|。複陽2單陽詞尾אֲדֹנֶיךָ#創44:8|。複陽2複陽詞尾אֲדֹנֵיכֶם#王上1:33|。複陽1單詞尾אֲדֹנָי#創18:3|。複陽1複詞尾אֲדֹנֵינוּ#撒上25:14|。</div>\\r\\n<div class=\\"idt\\">一、單數אָדוֹן<span class=\\"exp\\">主</span>、<span class=\\"exp\\">主人</span>。\\r\\n<div class=\\"idt\\">1. 指稱人：\\r\\nA. 家宰、總管。#創45:8,9|。\\r\\nB. 主人。#詩12:4|。\\r\\nC. 國王。#耶22:18;34:5|。</div>\\r\\n<div class=\\"idt\\">2. 指稱神：\\r\\nA. 主神。הָאָדֹן יְהוָה<span class=\\"bibtext\\"><span class=\\"exp\\">主</span>耶和華</span>，#出23:17;34:23|。\\r\\nB. 普天下的主。אֲדוֹן כָּל-הָאָרֶץ<span class=\\"bibtext\\">普天下<span class=\\"exp\\">主</span></span>，#書3:11;3:13;詩97:5;亞4:14：6:5;彌4:13|。</div></div>\\r\\n<div class=\\"idt\\">二、複數אֲדֹנִים<span class=\\"exp\\">眾主</span>、<span class=\\"exp\\">諸王</span>。#申10:17;詩136:3;賽26:13|。\\r\\n<div class=\\"idt\\">1. 指稱人：\\r\\nA. 撒瑪利亞山的原主。#王上16:24|。\\r\\nB. 主人。#創40:7;出21:4;21:4,6,8,32;申23:15;士19:11,12|。\\r\\nC. 丈夫。#士19:26,27;詩45:12|。\\r\\nD. 先知。#王下2:3,5,16|。\\r\\nE. 省長。#尼3:5|。\\r\\nF. 首領。#創42:10,30,33|。\\r\\nG. 國王。#創40:1;士3:25|。</div>\\r\\n<div class=\\"idt\\">2. 指稱神：#瑪1:6|。אֲדֹנֵי הָאֲדֹנִים<span class=\\"bibtext\\">萬<span class=\\"exp\\">主</span>之<span class=\\"exp\\">主</span></span>，#申10:17;詩136:3|。אֲדֹנֵינוּ<span class=\\"bibtext\\">我們的<span class=\\"exp\\">主</span></span>，#詩135:5;147:5;尼8:10|。複陽2單陰詞尾אֲדֹנַיִךְ יְהוָה<span class=\\"bibtext\\">你的<span class=\\"exp\\">主</span>耶和華</span>，#賽51:22|。</div></div>\\r\\n<div class=\\"idt\\">三、1單詞尾אֲדֹנִי<span class=\\"exp\\">我主</span>、<span class=\\"exp\\">我的主人</span>。\\r\\n<div class=\\"idt\\">1. 指稱人：\\r\\nA. 主人。#出21:5;撒上30:13,15;王下5:3,20,22;6:15|。\\r\\nB. 丈夫。#創18:12|。\\r\\nC. 先知。#王上18:7,13;王下2:19;4:16,28;6:5;8:5|。\\r\\nD. 首領。#創23:6,11,15;42:10;43:20;44:18;47:18;士4:18|。\\r\\nE. 國王。#撒上22:12|。\\r\\nF. 父親。#創31:35|。\\r\\nG. 摩西。#出32:22;民11:28;12:11;32:25,27;36:2,2|。\\r\\nH. 祭司。#撒上1:15,26|。\\r\\nI. 顯現的天使。#書5:14;士6:13|。\\r\\nJ. 將領。撒下11:11。\\r\\nK. 承認對方優越的一般稱呼。#創24:18;32:5;33:8;44:7;得2:13;撒上25:24|。</div>\\r\\n2. 指稱神：見HB.136。</div>"}]}');
        }
    }
})(this)
