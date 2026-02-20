// @ts-check

/**
 * @typedef {Object} DocNode
 * @property {string} id - Unique identifier for the node
 * @property {string} w - The text content of the node
 * @property {'section' | 'item' | 'note' | 'lex' | 'text' | 'table'} type - The type of the node
 * @property {string} [marker] - Optional marker for ordered items or notes
 * @property {object} [meta] - Optional metadata for the node (e.g., raw table lines)
 * @property {DocNode[]} children - Array of child nodes
 */

/**
 * @typedef {import('./../DText.js').DText} DText
 * @typedef {import('./../DText.js').DAddress} DAddress
 * @typedef {import('./../DText.js').DTable} DTable
 * @typedef {import('./../DText.js').DTableCell} DTableCell
 */

export {}