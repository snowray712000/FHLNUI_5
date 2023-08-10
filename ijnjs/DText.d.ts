/// <reference path="./DAddress.d.ts" />
class DText {
    w?: string
    isBr?: 0|1
    /**
     * 若是夾擊資料，則有尾部與頭部，例如 <div> 尾部可能是 </div> 
     * 當開發 split btw 時，首先出現
     */
    w2?: string 
    tpContainer?: string
    children?: DText[]
    /** 交互參數文字 */
    ref?: string
    refAddresses?: DAddress[]
}

