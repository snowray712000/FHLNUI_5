/** PageState ps 會被用到這些 */
function IDAddress(){
    /** @type {string} */
    this.engs
    /** @type {string} */
    this.chineses
    /** @type {number} */
    this.chap
    /** @type {number} */
    this.sec
    /** @type {0|1} */
    this.gb
}
function IDParsingItem(){
    /** @type {number} 在這一節，是第幾個，0，就是文字，0之外就是用在表格 */
    this.wid = 0
    /** @type {string} Strong Number */
    this.sn = ""
    /** @type {string} 文字，就是經文出現的樣子 */
    this.word = ""
    /** @type {string} 詞性，只有新約會有 */
    this.pro = ""
    /** @type {string} 字彙分析，就是 陰性 複數 那些分析 */
    this.wform = ""
    /** @type {string} 原型，就是經文的原型 */
    this.orig = ""
    /** @type {string} 原型簡義，就是經文的原型簡義 */
    this.exp = ""
    /** @type {string} 備註 */
    this.remark = ""
}
function IDParsingResult(){
    /** @type {IDAddress} */
    this.prev
    /** @type {IDAddress} */
    this.next
    /** @type {IDParsingItem[]} */
    this.record
    /** @type {number} 0是新約，1是舊約*/
    this.N
}