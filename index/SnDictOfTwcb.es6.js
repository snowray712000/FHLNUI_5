
import { ISnDictionaryEs6Js } from './ISnDictionary.es6.js'
import { twcbflowEs6Js} from './../ijnjs/twcbflow.es6.js'
import { isRDLocationEs6Js } from './../ijnjs/isRDLocation.es6.js'

export {SnDictOfTwcbEs6Js}

function SnDictOfTwcbEs6Js() {
    let ISnDictionary = ISnDictionaryEs6Js()
    let twcbflow = twcbflowEs6Js()
    let isRDLocation = isRDLocationEs6Js()

    SnDictOfTwcb.prototype = new ISnDictionary()
    SnDictOfTwcb.prototype.constructor = SnDictOfTwcb

    return SnDictOfTwcb

    function SnDictOfTwcb() {
        /**
         * @param {{sn:string,isOld:boolean}} param 
         * @returns {Promise<DataOfDictOfFhl>}
         */
        this.queryAsync = function (param) {
            const isRD = isRDLocation()
            if (isRD == false) { // 真實上線 (才不會有 cross-domain 問題)
                let url = param.isOld ? "/json/stwcbhdic.php" : "/json/sbdag.php"
                let val = "?k=" + param.sn
                val += "&gb=0"
                url += val
                return new Promise((res, rej) => {
                    $.ajax({
                        url: url,
                        error: er => {
                            console.error(er);
                            rej(er)
                        },
                        success: reStr => {
                            res(JSON.parse(reStr))
                        },
                    })
                })

            } else { // 虛擬資料(開發用)
                /** @type {DataOfDictOfFhl} */
                let re = {}
                if (param.isOld) {
                    re = virtualOld()
                } else {
                    re = virtualNew()
                }
                return new Promise((res, rej) => res(re))

                function virtualNew(sn) {
                    return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00011","dic_text":"Ἀβραάμ, ὁ 人名　無變格\\r\\n（אַבְרָהָם H85「<span class=\\"exp\\">多人之父</span>」）「<span class=\\"exp\\">亞伯拉罕</span>」。出現於耶穌的家譜中，#太1:1,2,17;路3:34|。是以色列民族的父，亦為基督徒這真以色列人的父，#太3:9;路1:73;3:8;約8:39,53,56;徒7:2;羅4:1;雅2:21|。因此，以色列百姓稱為亞伯拉罕的後裔，#約8:33,37;羅9:7;11:1;林後11:22;加3:29;來2:16|。是得蒙應許者，#徒3:25;7:17;羅4:13;加3:8,14,16,18;來6:13|。滿有信心，#羅4:3|（#創15:6|）#羅4:9,12,16;加3:6|（#創15:6|）,#加3:9;雅2:23|。此處並稱之為神的朋友（參#賽41:8;代下20:7;但3:35|;參#出33:11|）;在來世具有顯赫地位，#路16:22|以下（見 κόλπος G2859一），以撒、雅各和眾先知亦同，#路13:28|。神被描述為亞伯拉罕、以撒、雅各的神（#出3:6|）#太22:32;可12:26;路20:37;徒3:13;7:32|。他與以撒、雅各一同在神國中坐席，#太8:11|。"}]}')
                }
                function virtualOld(sn) {
                    return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00011","dic_text":"00011\\r\\n【0011】אֲבַדּוֹן\\r\\n＜音譯＞’abaddown\\r\\n＜詞類＞名、陰\\r\\n＜字義＞毀滅之地、滅亡、亞巴頓\\r\\n＜字源＞來自HB6的加強語氣\\r\\n＜LXX＞G3  G623\\r\\n＜神出＞2d   #伯26:6|\\r\\n＜譯詞＞滅亡3 燬滅1 滅沒1 （5）\\r\\n＜解釋＞\\r\\n<div class=\\"idt\\">一、指陰間裡停放要滅亡的死人之處，是陰間有分隔間的概念發展之後產生的字。<span class=\\"bibtext\\"><span class=\\"exp\\">燬滅</span></span>，#伯31:12|。平行字שְׁאוֹל陰間，#伯26:6;箴15:11|；וָמָוֶת死亡，#伯28:22|；קֶבֶר墳墓，#詩88:11|。</div>\\r\\n<div class=\\"idt\\">二、舊約希伯來文讀音為亞巴頓，新約希臘文讀音是亞玻倫，意指惡魔，撒但與無底坑的使者，#啟9:11|。</div>"}]}')
                }
            }
        }
        /**
         * @param {DataOfDictOfFhl} dataOfFhl 
         * @returns {DText[]}
         */
        this.cvtToDTexts = function (dataOfFhl) {
            let re = twcbflow(dataOfFhl.record[0].dic_text)
            return re
        }
    }
}

