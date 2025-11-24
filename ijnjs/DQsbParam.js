/**
 * @typedef {object} DQsbParam
 * @property {0|1} [isGb]
 * @property {0|1} [isSn]
 * @property {'unv'|'kjv'|string} [ver]
 * @property {string} [qstr]
 * @property {string} [bookDefault] 可以是 羅 也可以是 Ro Rom
 */

/**
 * @typedef {object} DQsbResult
 * @property {string} [status]
 * @property {number} record_count
 * @property {0|1|2|3|4} [proc] 需要特殊字型  0:不需要 1:希臘文 2:希伯來文 3:羅馬拼音 4:Open Han字形
 * @property {object[]} record
 * @property {string} record[].chineses
 * @property {string} record[].engs
 * @property {number} record[].chap
 * @property {number} record[].sec
 * @property {string} record[].bible_text
 */