
/**
 * src, isOld 不是原始資料，是後來我加上去的， 因為twcb與cbol的轉換為 dtexts 可能不同
 */
type DataOfDictOfFhl = {
    status: "success",
    record_count: number,
    record: {
        sn: string,
        dic_text: string,
        edic_text?:string
    }[],
    src: "cbol"|"twcb",
    isOld: 0|1
}

