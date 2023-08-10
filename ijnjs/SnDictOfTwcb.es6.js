
function SnDictOfCbolEs6Js() {
    function SnDictOfCbol() {
        /**
         * TODO:
         * @param {{sn:string,isOld:boolean}} param 
         * @returns {Promise<DataOfDictOfFhl>}
         */
        this.queryAsync = function (param) {
            const isRD = isRDLocationEs6Js()()
            if (isRD == false) {
                // /json/sd.php?N=1&k=0128&gb=1
                let val = "?N=" + (param.isOld ? "1" : "0")
                val += "&k=" + param.sn
                val += "&gb=0"
                let url = "/json/sd.php" + val

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
            } else {
                return gVirtualData()
            }

            /**
             * 
             * @returns {Promise<DataOfDictOfFhl>}
             */
            function gVirtualData() {
                // 下面是 virtual 資料
                /** @type {DataOfDictOfFhl} */
                let re = {}
                if (param.isOld) {
                    re = virtualOld()
                } else {
                    re = virtualNew()
                }
                return new Promise((res, rej) => res(re))
            }

            function virtualNew(sn) {
                return JSON.parse(`{
                      "status":"success",
                      "record_count":1,
                      "record":[{"sn":"00128","dic_text":"128 Aithiops {ahee-thee'-ops}\\r\\n\\r\\n\\u6e90\\u65bc aitho (\\u67af\\u840e) \\u548c ops (\\u9762\\u90e8, \\u6e90\\u65bc SNG03700); \\u967d\\u6027\\u540d\\u8a5e\\r\\n\\r\\nAV - Ethiopian 2; 2\\r\\n\\r\\n\\u57c3\\u63d0\\u963f\\u4f2f = \\"\\u9ed1\\"\\r\\n1)(\\u4eca\\u7a31)\\u8863\\u7d22\\u5339\\u4e9e\\u4eba(#\\u5f92 8:27|)","edic_text":"128 Aithiops {ahee-thee'-ops}\\n\\nfrom aitho (to scorch) and ops (the face, from 3700);; n m\\n\\nAV - Ethiopian 2; 2\\n\\nEthiopian = \\"black\\"\\n1) an Ethiopian","dic_type":0,"orig":"\\u0391\\u1f30\\u03b8\\u1f77\\u03bf\\u03c8"}]}
                      `)
            }
            function virtualOld(sn) {

                return JSON.parse(`{
                      "status":"success",
                      "record_count":1,
                      "record":[{"sn":"00128","dic_text":"0128 'Adamah {a-da:-ma:'}\\r\\n\\r\\n\\u8207 0127 \\u540c; \\u5c08\\u6709\\u540d\\u8a5e \\u5730\\u540d\\r\\n\\r\\n\\u6b3d\\u5b9a\\u672c - Adamah 1; 1\\r\\n\\r\\n\\u4e9e\\u5927\\u746a = \\"\\u5730\\u571f\\"\\r\\n1) \\u62ff\\u5f17\\u4ed6\\u5229\\u7684\\u57ce\\u93ae (#\\u66f8 19:36|)","edic_text":"0128 'Adamah {ad-aw-maw'}\\n\\nthe same as 0127;; n pr loc\\n\\nAV - Adamah 1; 1\\n\\nAdamah = \\"the earth\\"\\n1) city in Naphtali","dic_type":1,"orig":"\\u05d0\\u05b2\\u05d3\\u05b8\\u05de\\u05b8\\u05d4"}]}
                      `)
            }
        }
        /**
         * TODO:
         * @param {DataOfDictOfFhl} dataOfFhl 
         * @returns {DText[]}
         */
        this.cvtToDTexts = function (dataOfFhl) {
            let strCht = dataOfFhl.record[0].dic_text
            let strEn = dataOfFhl.record[0].edic_text
            let cbolflow = cbolflowEs6Js()

            let ch = cbolflow(strCht)
            let en = cbolflow(strEn)
            return Enumerable.from(ch).concat([{ isBr: 1 }]).concat(en).toArray()
            return [{ w: dataOfFhl.record[0].dic_text }]
            throw new Error("not implement yet. cvtToDTexts")
        }
    }
    SnDictOfCbol.prototype = new ISnDictionary()
    SnDictOfCbol.prototype.constructor = SnDictOfCbol
}
function SnDictOfTwcbEs6Js() {
    /**
     * @param {DataOfDictOfFhl} dataOfFhl 
     * @returns {DText[]}
     */
    ISnDictionary.prototype.cvtToDTexts = function (dataOfFhl) { }
    function SnDictOfTwcb() {
        /**
         * @param {{sn:string,isOld:boolean}} param 
         * @returns {Promise<DataOfDictOfFhl>}
         */
        this.queryAsync = function (param) {
            const isRD = isRDLocationEs6Js()()
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
            let twcbflow = twcbflowEs6Js()
            let re = twcbflow(dataOfFhl.record[0].dic_text)
            return re
        }
    }
    SnDictOfTwcb.prototype = new ISnDictionary()
    SnDictOfTwcb.prototype.constructor = SnDictOfTwcb
}

function ISnDictionaryEs6Js() {
    /**
     * 將會有 Twcb 版的實作、Cbol 版的實作
     * @interface
     */
    function ISnDictionary() { }
    /**
     * @param {{sn:string,isOld:boolean}} param 
     * @returns {Promise<DataOfDictOfFhl>}
     */
    ISnDictionary.prototype.queryAsync = function (param) { }
}
