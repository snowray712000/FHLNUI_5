var FHL = {}
    /** 依.html相對ijn-fhl.js的位置回傳，還不完美 @returns {'ijnjs-fhl/'|'../ijnjs-fhl/'} */
FHL.getSrdIjnjsFhl = () => '0'
FHL.BibieVersionDialog = (function() {
    var BibieVersionDialog = function() {}
    BibieVersionDialog.prototype.setCallbackClosed = (cb: (jo: { selects: string[];offens: string[];sets: string[][] }) => void) => {}
    BibieVersionDialog.prototype.setCallbackOpened = (cb: () => void) => {}
    BibieVersionDialog.prototype.open = (args: { selects: string[];offens: string[];sets: string[][] }) => {}
    BibieVersionDialog.prototype.setVersionsFromApi = (vers: { na: string;cna: string }[]) => {}
    BibieVersionDialog.s = new BibieVersionDialog()
    return BibieVersionDialog
})()

var abvphp = {}
    /** index.js 裡會用, 因為它要確定抓過了嗎 */
abvphp.isReadyGlobalBibleVersions = () => Boolean
    /** @type {string:{book:string;ntonly:Boolean}} */
abvphp.g_bibleversions = { '和合本': { book: 'unv' } }