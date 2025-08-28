import { ai_get_address_tp } from "./ai_get_address_tp.js";
import { ai_get_bcvw } from "./ai_get_bcvw.js";

/**
 * 
 * @param {{na:string,cna:string,text: string}} one_translation 
 */
function gen_one_translation(one_translation){
    const msg = `### 譯本: ${one_translation.cna}

> ${one_translation.text}
`;
    return msg
}
/**
 * @param {{addr: number[], addrs: string, texts:{na:string,cna:string,text: string}[]}} one_sec_data 
 */
function gen_one_sec(one_sec_data, tpAddress){
    const address_bcvw = ai_get_bcvw(one_sec_data.addr, -1, tpAddress)

    const msg = `## 節: ${one_sec_data.addrs} ${address_bcvw}

` + one_sec_data.texts.map(a1 => gen_one_translation(a1, tpAddress)).join('\n')
    return msg
}

/**
 * 
 * @param {{addr: number[], addrs: string, texts:{na:string,cna:string,text: string}[]}[]} data 
 */
export function ai_translations_gen_tp1(data){
    const tpAddress = ai_get_address_tp(data.map(a1=>a1.addr))

    // ### 生成文字，雖然一開始是用一節，但是直接寫多節相容
    const msg = 
`# 參考資料: 各種譯本

` + data.map(a1 => gen_one_sec(a1,tpAddress)).join('\n')
    return msg
}


/*
# 參考資料: 各種譯本

## 彼得後書 3:4

### 呂振中譯本

> xxxxx

### 現代中文譯本

> xxxxx

## 彼得後書 3:5

(略...)
*/