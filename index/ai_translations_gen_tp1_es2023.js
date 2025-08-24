/**
 * 
 * @param {{na:string,cna:string,text: string}} one_translation 
 */
function gen_one_translation(one_translation){
    const msg = `### ${one_translation.cna}

> ${one_translation.text}
`;
    return msg
}
/**
 * @param {{addr: number[], addrs: string, texts:{na:string,cna:string,text: string}[]}} one_sec_data 
 */
function gen_one_sec(one_sec_data){
    const msg = `## ${one_sec_data.addrs}

` + one_sec_data.texts.map(gen_one_translation).join('\n')
    return msg
}

/**
 * 
 * @param {{addr: number[], addrs: string, texts:{na:string,cna:string,text: string}[]}[]} data 
 */
export function ai_translations_gen_tp1(data){
    // ### 生成文字，雖然一開始是用一節，但是直接寫多節相容
    const msg = `
# 譯本資料

` + data.map(gen_one_sec).join('\n')
    return msg
}


/*
# 譯本資料

## 彼得後書 3:4

### 呂振中譯本

> xxxxx

### 現代中文譯本

> xxxxx

## 彼得後書 3:5

(略...)
*/