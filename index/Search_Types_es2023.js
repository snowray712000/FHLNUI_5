/**
 * @typedef {Object} OneSeRecord
 * @property {number} chap
 * @property {number} sec
 * @property {number} ibook 0based
 * @property {string} engs Num
 * @property {string} chineses 民
 * @property {string} ver lcc
 * @property {string} bible_text
 */

/**
 * @typedef {Object} OneVerResult
 * @property {string} key
 * @property {OneSeRecord[]} record
 * @property {number} record_count
 */

module.exports = {}

/**
 * @type {import('./Search_Types_es2023').OneSeRecord}
 */