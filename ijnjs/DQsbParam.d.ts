
interface DQsbParam {
    isGb?: 0|1;
    isSn?: 0|1;
    ver?: 'unv'|'kjv'|string;
    qstr?: string;
    /** 可以是 羅 也可以是 Ro Rom */
    bookDefault?: string;
}

type DQsbResult = {
    status?: "success";
    record_count: number;
    /** 需要特殊字型  0:不需要 1:希臘文 2:希伯來文 3:羅馬拼音 4:Open Han字形 */
    proc?: 0|1|2|3|4;
    record: {
        chineses: string;
        engs: string;
        chap: number;
        sec: number;
        bible_text: string;
    }[]
}