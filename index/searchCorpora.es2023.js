import { AF_VERSION } from './qafAsync.es2023.js'
import { APO_VERSION, APO_VERSION_NAME, APO_VERSION_NAME_GB } from './qsubAsync.es2023.js'
import { searchAfAsync } from './searchAf.es2023.js'
import { searchApoAsync } from './searchApo.es2023.js'

/**
 * 搜尋時，新舊約之外的文獻 (各有自己的 API，要分開查)：使徒教父 (seaf.php)、次經 (sesub.php)
 * 都是「選擇加入」的搜尋分類 (SearchScope.OPT_IN)，不是使用者選的譯本，只有一種文本。
 * 它們的節在搜尋結果裡的 `vers` 只有 `version` 這一個代碼 (→ 多一欄)。
 *
 * @typedef {Object} SearchCorpus
 * @property {'af'|'apo'} corpus BookRegistry 的書卷類別
 * @property {string} group 搜尋分類名 (searchBookGroups 的 key、SearchScope.OPT_IN)
 * @property {string} version 文本代碼 (afhuang、c1933)
 * @property {(isGb: boolean) => string} name 結果表頭的欄名
 * @property {(keyword: string, signal?: AbortSignal) => Promise<{keyword: string, hits: import('./searchAf.es2023.js').AfHit[]}>} search
 * @property {boolean} textInHits 命中就帶經文 (使徒教父)；否則命中只有位置，經文之後取 (次經，簡繁要跟 gb)
 */

/** @type {SearchCorpus[]} 順序同畫面 (searchBookGroups) */
export const SEARCH_CORPORA = [
    { corpus: 'apo', group: '次經', version: APO_VERSION, name: isGb => (isGb ? APO_VERSION_NAME_GB : APO_VERSION_NAME), search: searchApoAsync, textInHits: false },
    { corpus: 'af', group: '使徒教父', version: AF_VERSION, name: () => '使徒教父', search: searchAfAsync, textInHits: true },
]

/** @param {string} ver @returns {SearchCorpus | null} */
export function corpusOfVersion(ver) {
    return SEARCH_CORPORA.find(c => c.version === ver) ?? null
}

/** 這一節只在新舊約之外的文獻找到 (vers 只有它的文本代碼) @param {{vers: string[]}} v */
export function isExternalVerse(v) {
    return v.vers.length == 1 && corpusOfVersion(v.vers[0]) != null
}
