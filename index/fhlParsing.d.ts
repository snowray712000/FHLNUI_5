/** PageState ps 會被用到這些 */
type IDAddress = {
    engs: string;
    chineses: string;
    chap: number;
    sec: number;
    gb: 0 | 1;
}

type IDParsingItem = {
    /** 在這一節，是第幾個，0，就是文字，0之外就是用在表格 */
    wid: number;
    /** Strong Number */
    sn: string;
    /** 文字，就是經文出現的樣子 */
    word: string;
    /** 詞性，只有新約會有 */
    pro: string;
    /** 字彙分析，就是 陰性 複數 那些分析 */
    wform: string;
    /** 原型，就是經文的原型 */
    orig: string;
    /** 原型簡義，就是經文的原型簡義 */
    exp: string;
    /** 備註 */
    remark: string;
}

type IDParsingResult = {
    prev: IDAddress;
    next: IDAddress;
    record: IDParsingItem[];
    /** 0是新約，1是舊約*/
    N: 0|1;
}

type DAddress_Realtime = {
    book: number;
    chap: number;
    sec: number;
}

/** .sn mouseenter 即時訊息用 */
type IDParsingResult_Realtime = IDParsingResult & {
    one: DAddress_Realtime & {
        sn: string,
        N: 0|1
    }
}