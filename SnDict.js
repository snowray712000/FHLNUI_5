/// <reference path="./libs/jsdoc/jquery.js" />

$(()=>{
    let r1 = $('<div/>',{id:'test1',text:'click test'}).appendTo($('body'))
    r1.on('click', ()=>{
        let r2 = {sn:'3615',isOld:true}

        queryDictAsync(r2)
    })
})

// function ISnDictGenerator(){}
// ISnDictGenerator.prototype.idGet = () => "sndict1"
// ISnDictGenerator.prototype.domGetAsync = (args) => new Promise((rs,rj)=>rs('<div>這是測試資料，顯示的結果</div>'))
// ISnDictGenerator.prototype.registeEvents = (domDlgBody) => {
//     $(domDlgBody).find('.ref').on('click', a1 => {
//         console.log(a1.target);
//     })
// }

function ISnDictGenerator() {
    // jqueryui 需要 id, 在之前, 要先確認這是第幾層 (dialog 中, 再點擊 dialog), sndict1 sndict2 ...
    // TODO:
    this.idGet = () => "sndict1"
    /**
     * 
     * @param {{sn:string,isOld:bool}} args 
     * @returns 
     */
    this.domGetAsync = (args) => new Promise((rs,rj)=>rs('<div>這是測試資料，顯示的結果</div>'))
    this.registeEvents = (domDlgBody) => {
        $(domDlgBody).find('.ref').on('click', a1 => {
            console.log(a1.target);
        })
    }
}

function SnDictGTest1(){
    /**     
     * @param {{sn:string,isOld:bool}} args 
     * @returns 
     */
    this.domGetAsync = (args) => {
        return new Promise((rs,rj)=>{
            let re1 = querySbdagAsync(args)
        re1.catch(er=>{ rj(er) })
        re1.then(re=>{ 
            let r1 = cvtToDomSbdag(re)
            rs(r1) 
        
        })

            // rs('<div>這是測試資料2</div>')
        }) 
        return
        function cvtToDomSbdag(jo){
            console.log(jo.record[0]);
            let r1 = jo.record[0].dic_text
            let r2 = r1.replaceAll('\r\n','<br/>')
            //let r2 = r1.replace(,'<br/>')
            return '<div>'+r2+'</div>';
        }

        /**         
         * @param {{sn:string,isOld:bool}} args 
         * @returns 
         */
        function querySbdagAsync(args){
            return new Promise((rs,rj)=>{
                let sn = args.sn
                let isOld = args.isOld 
                let gb = 0;
                
                let is127001 = location.hostname == "127.0.0.1"
                if (is127001){
                    rs( isOld ? virtualOld(sn): virtualNew(sn))
                    return 
                }

                // sbdag (只能上傳後才能實驗)
                var urlapi = isOld ? 'stwcbhdic.php' : 'sbdag.php';
                let url = '/json/' + urlapi + '?k=' + sn + '&gb=' + gb
                $.ajax({
                    url: url,
                    success: function (aa) {
                        re = JSON.parse(aa);
                        rs(re)
                    },
                    error: function (re) {
                        rj(re)
                    }
                });
                return 

                
                function virtualNew(sn){
                    return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00011","dic_text":"Ἀβραάμ, ὁ 人名　無變格\\r\\n（אַבְרָהָם H85「<span class=\\"exp\\">多人之父</span>」）「<span class=\\"exp\\">亞伯拉罕</span>」。出現於耶穌的家譜中，#太1:1,2,17;路3:34|。是以色列民族的父，亦為基督徒這真以色列人的父，#太3:9;路1:73;3:8;約8:39,53,56;徒7:2;羅4:1;雅2:21|。因此，以色列百姓稱為亞伯拉罕的後裔，#約8:33,37;羅9:7;11:1;林後11:22;加3:29;來2:16|。是得蒙應許者，#徒3:25;7:17;羅4:13;加3:8,14,16,18;來6:13|。滿有信心，#羅4:3|（#創15:6|）#羅4:9,12,16;加3:6|（#創15:6|）,#加3:9;雅2:23|。此處並稱之為神的朋友（參#賽41:8;代下20:7;但3:35|;參#出33:11|）;在來世具有顯赫地位，#路16:22|以下（見 κόλπος G2859一），以撒、雅各和眾先知亦同，#路13:28|。神被描述為亞伯拉罕、以撒、雅各的神（#出3:6|）#太22:32;可12:26;路20:37;徒3:13;7:32|。他與以撒、雅各一同在神國中坐席，#太8:11|。"}]}')
                }
                function virtualOld(sn){
                    return JSON.parse('{"status":"success","record_count":1,"record":[{"sn":"00011","dic_text":"00011\\r\\n【0011】אֲבַדּוֹן\\r\\n＜音譯＞’abaddown\\r\\n＜詞類＞名、陰\\r\\n＜字義＞毀滅之地、滅亡、亞巴頓\\r\\n＜字源＞來自HB6的加強語氣\\r\\n＜LXX＞G3  G623\\r\\n＜神出＞2d   #伯26:6|\\r\\n＜譯詞＞滅亡3 燬滅1 滅沒1 （5）\\r\\n＜解釋＞\\r\\n<div class=\\"idt\\">一、指陰間裡停放要滅亡的死人之處，是陰間有分隔間的概念發展之後產生的字。<span class=\\"bibtext\\"><span class=\\"exp\\">燬滅</span></span>，#伯31:12|。平行字שְׁאוֹל陰間，#伯26:6;箴15:11|；וָמָוֶת死亡，#伯28:22|；קֶבֶר墳墓，#詩88:11|。</div>\\r\\n<div class=\\"idt\\">二、舊約希伯來文讀音為亞巴頓，新約希臘文讀音是亞玻倫，意指惡魔，撒但與無底坑的使者，#啟9:11|。</div>"}]}')
                }
            })
        }
                    
    }
}
SnDictGTest1.prototype = new ISnDictGenerator()

/**
 * 
 * @param {{sn:string,isOld:bool}} args 
 */
function queryDictAsync(args){
    /** @type {ISnDictGenerator} */
    let iG = new SnDictGTest1()

    let jqDlg = makeSureJQueryObjectOfIdExist()
    jqDlg.dialog()
    
    // 清除原本的內容
    resetContent()
    $('<div>取得資料中</div>').appendTo(jqDlg)

    let dom = iG.domGetAsync(args)
    dom.then( reDom => {    
        resetContent()

        let r2 = $(reDom).appendTo(jqDlg);        
        iG.registeEvents(r2[0])
    })

    return 
    function makeSureJQueryObjectOfIdExist(){
        let idDlg = iG.idGet(); // 'sndict1'        
        if ( $('#'+idDlg).length == 0 ){
            $('<div/>',{id: idDlg}).appendTo('body')
        }
        return $('#'+idDlg)
    }
    function resetContent(){
        jqDlg.html('') // 清掉之前的 dom, 並它的 event, 因為最常見的是 event 的記憶體殘留
    }
}