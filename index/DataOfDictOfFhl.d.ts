
type TPOneSame = {
    /** 529 */
    ccnt: number;
    /** 基督 */
    cexp: string;
    /** 05547 */
    csn: string; 
    /** Χριστός, οῦ, ὁ */
    word: string;
}

/**
 * src, isOld 不是原始資料，是後來我加上去的， 因為twcb與cbol的轉換為 dtexts 可能不同
 */
type DataOfDictOfFhl = {
    status: "success",
    record_count: number,
    record: {
        sn: string,
        dic_text: string,
        edic_text?:string,
        /** 2025 新增的，同源字 */
        same: TPOneSame[],
    }[],
    src: "cbol"|"twcb",
    isOld: 0|1
}

/**
 * 這是在 .sn mouseenter 即時跳出 sn 相關資料用的
 */
type DataOfDictOfFhl_Realtime = DataOfDictOfFhl & {
    one: {
        sn: string,
        N: 0|1,
        book: number,
        chap: number,
        sec: number,
    }
}