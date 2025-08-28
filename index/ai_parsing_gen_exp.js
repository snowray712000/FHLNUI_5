/**
 * @param {str} exp cache.record[0].exp
 * @returns 
 */
export function ai_parsing_gen_exp(exp){
    return exp.replace(/\r?\n\r?/g, " ↩ ")
}